import { BaseScraper } from "./base.scraper";
import { AnthropicScraper } from "./anthropic.scraper";
import { GitHubTrendingScraper } from "./github.scraper";

const scraperRegistry: Record<string, new () => BaseScraper> = {
  "anthropic-blog": AnthropicScraper,
  "github-trending": GitHubTrendingScraper,
};

export function getScraper(sourceName: string): BaseScraper | null {
  const ScraperClass = scraperRegistry[sourceName];
  return ScraperClass ? new ScraperClass() : null;
}

export function getAllScrapers(): BaseScraper[] {
  return Object.values(scraperRegistry).map((ScraperClass) => new ScraperClass());
}

export { BaseScraper };
export type { ScraperKey };
type ScraperKey = keyof typeof scraperRegistry;
