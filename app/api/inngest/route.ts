import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { scrapeSource, scrapeAll } from "@/lib/inngest/functions/scrape.functions";
import { enrichArticlesJob } from "@/lib/inngest/functions/enrich.functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scrapeSource, scrapeAll, enrichArticlesJob],
});
