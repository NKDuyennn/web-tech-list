import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { enrichArticles } from "@/lib/ai/pipeline";
import { updateArticleEnrichment } from "@/lib/db/article.service";

// GET /api/enrich/test?limit=5
// Enrich articles que ainda não têm summary
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 400 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "5");

  const articles = await prisma.article.findMany({
    where: { summary: null },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  if (!articles.length) {
    return NextResponse.json({ message: "All articles already enriched" });
  }

  const inputs = articles.map((a) => ({
    title: a.title,
    url: a.url,
    content: a.content ?? undefined,
  }));

  const enriched = await enrichArticles(inputs);

  for (let i = 0; i < articles.length; i++) {
    const result = enriched[i];
    if (!result || (!result.summary && result.tags.length === 0)) continue;
    await updateArticleEnrichment(articles[i].id, result);
  }

  return NextResponse.json({
    processed: articles.length,
    preview: enriched.slice(0, 3).map((e, i) => ({
      title: articles[i]?.title,
      summary: e.summary,
      tags: e.tags,
      impactScore: e.impactScore,
    })),
  });
}
