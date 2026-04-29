import { BaseScraper } from "./base.scraper";

// Registry: thêm scraper mới vào đây khi implement
const scraperRegistry: Record<string, new () => BaseScraper> = {};

export function getScraper(sourceName: string): BaseScraper | null {
  const ScraperClass = scraperRegistry[sourceName];
  return ScraperClass ? new ScraperClass() : null;
}

export function getAllScrapers(): BaseScraper[] {
  return Object.values(scraperRegistry).map((ScraperClass) => new ScraperClass());
}

export { BaseScraper };
