export interface AIEnrichmentInput {
  title: string;
  url: string;
  content?: string;
}

export interface AIEnrichmentOutput {
  summary: string;
  tags: string[];
  impactScore: number; // 0–10
}

export interface AIProvider {
  enrich(items: AIEnrichmentInput[]): Promise<AIEnrichmentOutput[]>;
}
