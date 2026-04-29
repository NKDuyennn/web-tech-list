"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetch("/api/scrape/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": "",
        },
        body: JSON.stringify({}),
      });
    } finally {
      setTimeout(() => setRefreshing(false), 2000);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-blue-500">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              AI Tech Pulse
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:block">
            Tracking AI trends in real-time
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-1.5 text-xs"
          >
            <Zap className={`h-3 w-3 ${refreshing ? "animate-pulse text-yellow-400" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>
    </header>
  );
}
