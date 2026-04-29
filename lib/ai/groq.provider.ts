import Groq from "groq-sdk";
import type { AIProvider, AIEnrichmentInput, AIEnrichmentOutput } from "./provider.interface";

const SYSTEM_PROMPT = `You are an AI tech analyst. For each article provided, return a JSON array where each element has:
- "summary": 2-3 bullet points as a single string (use "• " as separator)
- "tags": array of relevant tags from: LLM, GenAI, Hardware, Robotics, Vision, Audio, Agents, Safety, Research, OpenSource, Startup, Infrastructure
- "impactScore": integer 1-10 based on significance to the AI field

Return ONLY valid JSON array, no markdown.`;

export class GroqProvider implements AIProvider {
  private client: Groq;

  constructor() {
    this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async enrich(items: AIEnrichmentInput[]): Promise<AIEnrichmentOutput[]> {
    const userContent = items
      .map((item, i) => `[${i}] Title: ${item.title}\nURL: ${item.url}\n${item.content ? `Content: ${item.content.slice(0, 500)}` : ""}`)
      .join("\n\n---\n\n");

    const completion = await this.client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";

    try {
      return JSON.parse(raw) as AIEnrichmentOutput[];
    } catch {
      // Fallback: return empty enrichment per item if parse fails
      return items.map(() => ({ summary: "", tags: [], impactScore: 0 }));
    }
  }
}
