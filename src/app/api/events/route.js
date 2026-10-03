// Receives client analytics events (sent with navigator.sendBeacon).
import { NextResponse } from "next/server";
import { recordEvent, SERVER_ONLY_EVENTS } from "@/lib/analytics";
import { limitOrNull, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const limited = limitOrNull(req, "events", { limit: 120, windowMs: 60_000 });
  if (limited) return new NextResponse(null, { status: 204 });

  const body = await readJson(req, 8 * 1024);
  const list = Array.isArray(body.events) ? body.events.slice(0, 20) : [body];
  for (const e of list) {
    if (!e || typeof e.name !== "string" || SERVER_ONLY_EVENTS.has(e.name)) continue;
    await recordEvent(e.name, e.props, {
      anonId: e.anonId,
      path: e.path,
      referrer: e.referrer,
      utm: e.utm,
    });
  }
  return new NextResponse(null, { status: 204 });
}
