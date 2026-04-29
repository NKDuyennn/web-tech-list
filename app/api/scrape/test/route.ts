import { NextRequest, NextResponse } from "next/server";
import { getScraper } from "@/lib/scrapers";
import { saveScrapedItems, SourceType } from "@/lib/db/article.service";

const SOURCE_META = {
  "github-trending": { url: "https://github.com/trending", type: SourceType.GITHUB },
  "anthropic-blog": { url: "https://www.anthropic.com/news", type: SourceType.BLOG },
};

// GET /api/scrape/test?scraper=github-trending
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const scraperName = req.nextUrl.searchParams.get("scraper") ?? "github-trending";
  const scraper = getScraper(scraperName);
  if (!scraper) {
    return NextResponse.json({ error: `Unknown scraper: ${scraperName}` }, { status: 400 });
  }

  const meta = SOURCE_META[scraperName as keyof typeof SOURCE_META];
  const items = await scraper.fetch();
  const saved = await saveScrapedItems(items, { name: scraper.sourceName, ...meta });

  return NextResponse.json({
    scraper: scraperName,
    fetched: items.length,
    saved: saved.length,
    preview: items.slice(0, 3).map((i) => ({ title: i.title, url: i.url })),
  });
}
