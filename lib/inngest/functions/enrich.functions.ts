import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/db/prisma";
import { enrichArticles } from "@/lib/ai/pipeline";
import { updateArticleEnrichment } from "@/lib/db/article.service";

export const enrichArticlesJob = inngest.createFunction(
  {
    id: "enrich-articles",
    retries: 2,
    triggers: [{ event: "article/enrich" }],
  },
  async ({ event, step }) => {
    if (!process.env.GROQ_API_KEY) {
      return { skipped: true, reason: "No GROQ_API_KEY" };
    }

    const { articleIds } = event.data as { articleIds: string[] };
    if (!articleIds?.length) return { skipped: true, reason: "No article IDs" };

    const articles = await step.run("fetch-articles", () =>
      prisma.article.findMany({
        where: { id: { in: articleIds }, summary: null },
      })
    );

    if (!articles.length) return { skipped: true, reason: "All already enriched" };

    const inputs = articles.map((a) => ({
      title: a.title,
      url: a.url,
      content: a.content ?? undefined,
    }));

    const enriched = await step.run("ai-enrich", () => enrichArticles(inputs));

    await step.run("save-enrichment", async () => {
      for (let i = 0; i < articles.length; i++) {
        const result = enriched[i];
        if (!result || (!result.summary && result.tags.length === 0)) continue;
        await updateArticleEnrichment(articles[i].id, result);
      }
    });

    return { enriched: articles.length };
  }
);
