import type { AIProvider, AIEnrichmentInput } from "./provider.interface";
import { GroqProvider } from "./groq.provider";

// Swap provider here when Claude API key is available
function getProvider(): AIProvider {
  return new GroqProvider();
}

const BATCH_SIZE = 10;

export async function enrichArticles(items: AIEnrichmentInput[]) {
  const provider = getProvider();
  const results = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const enriched = await provider.enrich(batch);
    results.push(...enriched);
  }

  return results;
}
