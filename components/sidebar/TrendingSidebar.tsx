import { getTrendingTags, getActiveSources } from "@/app/actions/articles";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Database } from "lucide-react";

export async function TrendingSidebar() {
  const [tags, sources] = await Promise.all([getTrendingTags(), getActiveSources()]);
  const maxCount = tags[0]?.count ?? 1;

  const sourceColors: Record<string, string> = {
    BLOG: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    GITHUB: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    PAPER: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    FORUM: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };

  return (
    <aside className="space-y-6">
      {/* Trending Tags */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-foreground">Trending Topics</h2>
        </div>

        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No tags yet — run enrichment to populate.
          </p>
        ) : (
          <ul className="space-y-2">
            {tags.map(({ tag, count }) => (
              <li key={tag} className="group">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground/80">#{tag}</span>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Active Sources */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-foreground">Data Sources</h2>
        </div>

        <ul className="space-y-2">
          {sources.map((source) => (
            <li key={source.name} className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                  sourceColors[source.type] ?? "bg-muted text-muted-foreground"
                }`}
              >
                {source.name}
              </span>
            </li>
          ))}
          {sources.length === 0 && (
            <li className="text-xs text-muted-foreground">No sources yet</li>
          )}
        </ul>
      </div>
    </aside>
  );
}
