import { inngest } from "@/lib/inngest/client";
import { getScraper, getAllScrapers } from "@/lib/scrapers";
import { saveScrapedItems, SourceType } from "@/lib/db/article.service";

const SOURCE_META: Record<string, { url: string; type: SourceType }> = {
  "anthropic-blog": { url: "https://www.anthropic.com/news", type: SourceType.BLOG },
  "github-trending": { url: "https://github.com/trending", type: SourceType.GITHUB },
};

// Scrape một nguồn cụ thể
export const scrapeSource = inngest.createFunction(
  {
    id: "scrape-source",
    retries: 2,
    triggers: [{ event: "scraper/run" }],
  },
  async ({ event, step }) => {
    const { scraperName } = event.data as { scraperName: string };
    const scraper = getScraper(scraperName);
    if (!scraper) throw new Error(`Unknown scraper: ${scraperName}`);

    const meta = SOURCE_META[scraperName];
    if (!meta) throw new Error(`No source meta for: ${scraperName}`);

    const items = await step.run("fetch-items", () => scraper.fetch());

    // Inngest serializes step outputs as JSON — rehydrate Date strings
    const hydratedItems = items.map((item) => ({
      ...item,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
    }));

    const newArticles = await step.run("save-to-db", () =>
      saveScrapedItems(hydratedItems, {
        name: scraper.sourceName,
        url: meta.url,
        type: meta.type,
      })
    );

    if (newArticles.length > 0) {
      await step.sendEvent("trigger-enrichment", {
        name: "article/enrich" as const,
        data: { articleIds: newArticles.map((a) => a.id) },
      });
    }

    return {
      scraperName,
      fetched: items.length,
      saved: newArticles.length,
    };
  }
);

// Trigger tất cả scrapers cùng lúc
export const scrapeAll = inngest.createFunction(
  {
    id: "scrape-all",
    retries: 1,
    triggers: [{ event: "scraper/run-all" }],
  },
  async ({ step }) => {
    const scraperKeys = Object.keys(SOURCE_META);

    await step.sendEvent(
      "trigger-all-scrapers",
      scraperKeys.map((key) => ({
        name: "scraper/run" as const,
        data: { scraperName: key },
      }))
    );

    return { triggered: scraperKeys.length };
  }
);
