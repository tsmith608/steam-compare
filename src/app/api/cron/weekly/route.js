// Weekly owner report → Discord webhook. GET ?dry=1 to preview without sending.
import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cron";
import { notifyOwner } from "@/lib/ops";
import { buildWeeklyReport } from "@/lib/report";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const report = await buildWeeklyReport();
  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const sent = dry ? false : await notifyOwner(report.text);
  return NextResponse.json({ sent, ...report });
}
