import * as cheerio from "cheerio";
import { BaseScraper, type ScrapedItem } from "./base.scraper";

const BASE_URL = "https://www.anthropic.com";

export class AnthropicScraper extends BaseScraper {
  readonly sourceName = "Anthropic Blog";
  readonly sourceUrl = `${BASE_URL}/news`;

  async fetch(): Promise<ScrapedItem[]> {
    const res = await fetch(this.sourceUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AITechPulse/1.0; +https://github.com/NKDuyennn/web-tech-list)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error(`Anthropic fetch failed: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];

    // Anthropic news page — try multiple selectors for resilience
    const selectors = [
      'a[href^="/news/"]',
      'a[href*="/news/"]',
    ];

    const seen = new Set<string>();

    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const href = $(el).attr("href");
        if (!href || href === "/news" || href === "/news/") return;

        const url = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        if (seen.has(url)) return;
        seen.add(url);

        // Try to find title text — prefer heading inside the link, fallback to link text
        const title =
          $(el).find("h1, h2, h3, h4").first().text().trim() ||
          $(el).text().trim();

        if (!title || title.length < 5) return;

        items.push({ title, url });
      });

      if (items.length >= 5) break; // found enough with this selector
    }

    return items.slice(0, 20);
  }
}
