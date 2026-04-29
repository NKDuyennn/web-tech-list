"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { getArticles, type ArticleWithSource } from "@/app/actions/articles";
import { ArticleCard } from "./ArticleCard";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border/50 bg-card/40 p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-28 rounded-full bg-muted/50" />
        <div className="h-4 w-16 rounded-full bg-muted/50" />
      </div>
      <div className="h-4 w-full rounded bg-muted/50" />
      <div className="h-4 w-4/5 rounded bg-muted/50" />
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-muted/30" />
        <div className="h-3 w-11/12 rounded bg-muted/30" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-14 rounded-full bg-muted/40" />
        ))}
      </div>
    </div>
  );
}

interface ArticleFeedProps {
  initialArticles: ArticleWithSource[];
  initialHasMore: boolean;
}

export function ArticleFeed({ initialArticles, initialHasMore }: ArticleFeedProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  function loadMore() {
    if (!hasMore || isPending) return;
    startTransition(async () => {
      const nextPage = page + 1;
      const { articles: newArticles, hasMore: more } = await getArticles(nextPage);
      setArticles((prev) => [...prev, ...newArticles]);
      setHasMore(more);
      setPage(nextPage);
    });
  }

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isPending, page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {articles.length} articles
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {articles.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
        {isPending && [1, 2].map((i) => <SkeletonCard key={`skel-${i}`} />)}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="flex justify-center py-4">
        {isPending && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        {!hasMore && articles.length > 0 && (
          <p className="text-xs text-muted-foreground">All caught up ✓</p>
        )}
      </div>
    </div>
  );
}
