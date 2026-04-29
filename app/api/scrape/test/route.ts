import { NextRequest, NextResponse } from "next/server";
import { getScraper } from "@/lib/scrapers";
import { saveScrapedItems, updateArticleEnrichment, SourceType } from "@/lib/db/article.service";
import { enrichArticles } from "@/lib/ai/pipeline";

const SOURCE_META = {
  "github-trending": { url: "https://github.com/trending", type: SourceType.GITHUB },
  "anthropic-blog": { url: "https://www.anthropic.com/news", type: SourceType.BLOG },
};

// GET /api/scrape/test?scraper=github-trending&enrich=true
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const scraperName = req.nextUrl.searchParams.get("scraper") ?? "github-trending";
  const shouldEnrich = req.nextUrl.searchParams.get("enrich") === "true";

  const scraper = getScraper(scraperName);
  if (!scraper) {
    return NextResponse.json({ error: `Unknown scraper: ${scraperName}` }, { status: 400 });
  }

  const meta = SOURCE_META[scraperName as keyof typeof SOURCE_META];
  const items = await scraper.fetch();
  const saved = await saveScrapedItems(items, { name: scraper.sourceName, ...meta });

  if (!shouldEnrich || saved.length === 0) {
    return NextResponse.json({
      scraper: scraperName,
      fetched: items.length,
      saved: saved.length,
      preview: items.slice(0, 3).map((i) => ({ title: i.title, url: i.url })),
    });
  }

  // Enrich the newly saved articles
  const inputs = saved.map((a) => ({ title: a.title, url: a.url, content: a.content ?? undefined }));
  const enriched = await enrichArticles(inputs);

  // Write enrichment back to DB
  for (let i = 0; i < saved.length; i++) {
    const result = enriched[i];
    if (!result || (!result.summary && result.tags.length === 0)) continue;
    await updateArticleEnrichment(saved[i].id, result);
  }

  return NextResponse.json({
    scraper: scraperName,
    fetched: items.length,
    saved: saved.length,
    enriched: enriched.filter((e) => e.summary).length,
    enrichedPreview: enriched.slice(0, 2).map((e, i) => ({
      title: saved[i]?.title,
      summary: e.summary,
      tags: e.tags,
      impactScore: e.impactScore,
    })),
  });
}
