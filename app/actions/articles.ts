"use server";

import prisma from "@/lib/db/prisma";

const LIMIT = 12;

export type ArticleWithSource = Awaited<
  ReturnType<typeof getArticles>
>["articles"][number];

export async function getArticles(page: number) {
  const raw = await prisma.article.findMany({
    skip: (page - 1) * LIMIT,
    take: LIMIT + 1,
    orderBy: [{ impactScore: "desc" }, { createdAt: "desc" }],
    include: {
      source: { select: { name: true, type: true } },
    },
  });

  const hasMore = raw.length > LIMIT;
  return { articles: raw.slice(0, LIMIT), hasMore };
}

export async function getTrendingTags(limit = 15) {
  const rows = await prisma.article.findMany({
    select: { tags: true },
    where: { tags: { isEmpty: false } },
  });

  const counts: Record<string, number> = {};
  for (const { tags } of rows) {
    for (const tag of tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export async function getActiveSources() {
  return prisma.source.findMany({
    where: { isActive: true },
    select: { name: true, type: true },
    orderBy: { name: "asc" },
  });
}
