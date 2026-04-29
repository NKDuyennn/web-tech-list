"use client";

import { motion } from "framer-motion";
import { ExternalLink, Star, GitFork, Flame, Zap, Bookmark } from "lucide-react";
import type { ArticleWithSource } from "@/app/actions/articles";

function formatStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ImpactBadge({ score }: { score: number | null }) {
  if (!score) return null;
  if (score >= 8)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
        <Flame className="h-2.5 w-2.5" /> {score}/10
      </span>
    );
  if (score >= 5)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-400 border border-yellow-500/20">
        <Zap className="h-2.5 w-2.5" /> {score}/10
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
      <Bookmark className="h-2.5 w-2.5" /> {score}/10
    </span>
  );
}

function SourceBadge({ name, type }: { name: string; type: string }) {
  const styles: Record<string, string> = {
    BLOG: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    GITHUB: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    PAPER: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    FORUM: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[type] ?? "bg-muted text-muted-foreground"}`}>
      {name}
    </span>
  );
}

const TAG_COLORS: Record<string, string> = {
  LLM: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  GenAI: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  Hardware: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  Robotics: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  Vision: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  Audio: "bg-green-500/10 text-green-300 border-green-500/20",
  Agents: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  Safety: "bg-red-500/10 text-red-300 border-red-500/20",
  Research: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  OpenSource: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Startup: "bg-teal-500/10 text-teal-300 border-teal-500/20",
  Infrastructure: "bg-slate-500/10 text-slate-300 border-slate-500/20",
};

export function ArticleCard({ article, index }: { article: ArticleWithSource; index: number }) {
  const meta = article.metadata as Record<string, unknown>;
  const isGitHub = article.source.type === "GITHUB";
  const stars = isGitHub && typeof meta?.stars === "number" ? meta.stars : null;
  const forks = isGitHub && typeof meta?.forks === "number" ? meta.forks : null;
  const language = isGitHub && typeof meta?.language === "string" ? meta.language : null;

  const summaryLines = article.summary
    ? article.summary.split("• ").filter(Boolean)
    : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      className="group relative rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm transition-colors hover:border-border hover:bg-card"
    >
      {/* Top row: source + impact */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <SourceBadge name={article.source.name} type={article.source.type} />
        <ImpactBadge score={article.impactScore} />
      </div>

      {/* Title */}
      <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
        {article.title}
      </h3>

      {/* Summary */}
      {summaryLines.length > 0 && (
        <ul className="mb-3 space-y-1">
          {summaryLines.map((line, i) => (
            <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
              <span className="mt-0.5 shrink-0 text-violet-400">•</span>
              <span>{line.trim()}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {article.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TAG_COLORS[tag] ?? "bg-muted/50 text-muted-foreground border-border/50"}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {stars !== null && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400" />
              {formatStars(stars)}
            </span>
          )}
          {forks !== null && (
            <span className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              {formatStars(forks)}
            </span>
          )}
          {language && (
            <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs">{language}</span>
          )}
          {article.publishedAt && !isGitHub && (
            <span>{formatDate(article.publishedAt)}</span>
          )}
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          Read
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </motion.article>
  );
}
