import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import type { ScrapedItem } from "@/lib/scrapers/base.scraper";
import { SourceType } from "@/app/generated/prisma/client";

export { SourceType };

interface SourceMeta {
  name: string;
  url: string;
  type: SourceType;
}

function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex");
}

export async function saveScrapedItems(items: ScrapedItem[], sourceMeta: SourceMeta) {
  const source = await prisma.source.upsert({
    where: { name: sourceMeta.name },
    create: { name: sourceMeta.name, url: sourceMeta.url, type: sourceMeta.type },
    update: {},
  });

  const newArticles = [];

  for (const item of items) {
    const urlHash = hashUrl(item.url);

    try {
      const article = await prisma.article.upsert({
        where: { urlHash },
        create: {
          sourceId: source.id,
          title: item.title,
          url: item.url,
          urlHash,
          content: item.content ?? null,
          publishedAt: item.publishedAt ?? null,
          metadata: (item.metadata as object) ?? {},
        },
        update: {},
      });

      const isNew = article.createdAt.getTime() === article.updatedAt.getTime();
      if (isNew) newArticles.push(article);
    } catch {
      // Skip individual failures (duplicate race condition, etc.)
    }
  }

  return newArticles;
}

export async function updateArticleEnrichment(
  articleId: string,
  data: { summary: string; tags: string[]; impactScore: number }
): Promise<void> {
  await prisma.article.update({
    where: { id: articleId },
    data: {
      summary: data.summary,
      tags: data.tags,
      impactScore: data.impactScore,
    },
  });
}
