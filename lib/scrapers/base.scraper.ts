export interface ScrapedItem {
  title: string;
  url: string;
  content?: string;
  publishedAt?: Date;
  metadata?: Record<string, unknown>;
}

export abstract class BaseScraper {
  abstract readonly sourceName: string;
  abstract readonly sourceUrl: string;

  abstract fetch(): Promise<ScrapedItem[]>;
}
