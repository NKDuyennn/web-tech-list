import { Suspense } from "react";
import { getArticles } from "@/app/actions/articles";
import { Header } from "@/components/layout/Header";
import { ArticleFeed } from "@/components/feed/ArticleFeed";
import { TrendingSidebar } from "@/components/sidebar/TrendingSidebar";

export const revalidate = 0;

export default async function HomePage() {
  const { articles, hasMore } = await getArticles(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Discovery Feed</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest AI research, tools, and announcements — enriched &amp; ranked by impact.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16 text-center">
                <p className="text-sm font-medium text-muted-foreground">No articles yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click &quot;Refresh&quot; to fetch the latest AI news.
                </p>
              </div>
            ) : (
              <ArticleFeed initialArticles={articles} initialHasMore={hasMore} />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Suspense fallback={<SidebarSkeleton />}>
                <TrendingSidebar />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3 rounded-xl border border-border/50 bg-card/50 p-4">
        <div className="h-4 w-32 rounded bg-muted/50" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-full rounded bg-muted/40" />
            <div className="h-1 w-full rounded bg-muted/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
