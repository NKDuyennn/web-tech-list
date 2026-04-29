import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? "";
  if (secret !== (process.env.CRON_SECRET ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { scraperName?: string };

  if (body.scraperName) {
    await inngest.send({ name: "scraper/run", data: { scraperName: body.scraperName } });
    return NextResponse.json({ triggered: body.scraperName });
  }

  await inngest.send({ name: "scraper/run-all", data: {} });
  return NextResponse.json({ triggered: "all" });
}
