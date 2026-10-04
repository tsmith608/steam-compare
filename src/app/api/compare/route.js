// POST /api/compare  { users: ["<steamid|url|vanity>", ...] }
// Used by the website and the Discord bot; the response keeps the original
// fields (shared, unique, sharedWishlist, wishlistMatches, profiles,
// isPremium) and adds stats, nearMisses, backlog, hot, blocked and limits.
import { NextResponse } from "next/server";
import { runComparison } from "@/lib/comparison-service";
import { getSessionSteamId } from "@/lib/session";
import { isBotRequest, limitOrNull, readJson } from "@/lib/http";
import { recordEvent } from "@/lib/analytics";
import { alertOwner, logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req) {
  // The Discord bot calls from one IP for many servers, so it is exempt.
  const fromBot = isBotRequest(req);
  if (!fromBot) {
    const limited = limitOrNull(req, "compare", { limit: 20, windowMs: 60_000 });
    if (limited) return limited;
  }

  const body = await readJson(req);
  const inputs = Array.isArray(body.users) ? body.users : [body.user1, body.user2, body.user3, body.user4];
  // Analytics context from the website (anonymous browser id + first-touch source); recordEvent validates it.
  // The bot's User-Agent only labels analytics; the rate-limit exemption above needs BOT_API_KEY.
  const via = fromBot || /WeBothPlayBot/i.test(req.headers.get("user-agent") || "") ? "discord_bot" : "web";
  const ctx = via === "web" && body.ctx && typeof body.ctx === "object" ? body.ctx : {};

  try {
    const viewerSteamId = await getSessionSteamId();
    const result = await runComparison(inputs, { viewerSteamId });

    if (!result.ok) {
      await recordEvent("comparison_failed", { code: result.code, players: inputs.filter(Boolean).length, via }, ctx);
      // Problems only the owner can fix (missing key, quota) page them; throttled per kind.
      if (result.code === "config") await alertOwner("steam-config", "Comparisons failing: Steam API key missing or rejected", "Check STEAM_API_KEY in Vercel.");
      if (result.code === "steam_rate_limited") await alertOwner("steam-rate-limit", "Steam is rate-limiting comparisons", "The daily Steam Web API quota (100,000 calls) may be exhausted, or Steam is throttling. Usually clears on its own.");
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
      via,
    }, ctx);
    return NextResponse.json(d, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    await logServerError("api/compare", err);
    return NextResponse.json({ error: "Something went wrong comparing those libraries.", code: "internal" }, { status: 500 });
  }
}
