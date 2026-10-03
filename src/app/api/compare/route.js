// POST /api/compare  { users: ["<steamid|url|vanity>", ...] }
// Used by the website and the Discord bot; the response keeps the original
// fields (shared, unique, sharedWishlist, wishlistMatches, profiles,
// isPremium) and adds stats, nearMisses, backlog, hot, blocked and limits.
import { NextResponse } from "next/server";
import { runComparison } from "@/lib/comparison-service";
import { getSessionSteamId } from "@/lib/session";
import { isBotRequest, limitOrNull, readJson } from "@/lib/http";
import { recordEvent } from "@/lib/analytics";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req) {
  // The Discord bot calls from one IP for many servers, so it is exempt.
  if (!isBotRequest(req)) {
    const limited = limitOrNull(req, "compare", { limit: 20, windowMs: 60_000 });
    if (limited) return limited;
  }

  const body = await readJson(req);
  const inputs = Array.isArray(body.users) ? body.users : [body.user1, body.user2, body.user3, body.user4];

  try {
    const viewerSteamId = await getSessionSteamId();
    const result = await runComparison(inputs, { viewerSteamId });

    if (!result.ok) {
      await recordEvent("comparison_failed", { code: result.code, players: inputs.filter(Boolean).length });
      const { ok, status, ...payload } = result;
      return NextResponse.json(payload, { status });
    }

    const d = result.data;
    await recordEvent("comparison_succeeded", {
      players: d.profiles.length,
      shared: d.stats.sharedCount,
      union_games: d.stats.unionCount,
      private_count: d.blocked.length,
      demo: d.demo,
      signed_in: !!viewerSteamId,
    });
    return NextResponse.json(d, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    await logServerError("api/compare", err);
    return NextResponse.json({ error: "Something went wrong comparing those libraries.", code: "internal" }, { status: 500 });
  }
}
