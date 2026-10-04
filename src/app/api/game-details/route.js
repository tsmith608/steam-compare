// POST { appids: number[] } -> { meta: { [appid]: {...} }, pending: number[] }
// Store metadata (genres, categories, price) for filters. Cached in app_meta;
// uncached apps are fetched a few at a time and reported back as `pending`.
import { NextResponse } from "next/server";
import { getAppMeta } from "@/lib/steam";
import { jsonError, limitOrNull, readJson } from "@/lib/http";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function POST(req) {
  const limited = limitOrNull(req, "game-details", { limit: 40, windowMs: 60_000 });
  if (limited) return limited;
  const { appids } = await readJson(req);
  if (!Array.isArray(appids)) return jsonError("Invalid appids");
  try {
    const result = await getAppMeta(appids.slice(0, 400), { fetchBudget: 24 });
    return NextResponse.json(result);
  } catch (err) {
    await logServerError("api/game-details", err);
    return jsonError("Couldn't load game details right now.", 502);
  }
}
