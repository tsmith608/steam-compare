// GET /api/library?steamid=<id|vanity|url> — one player's public library,
// in the same shape the profile dashboard already understands.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { SteamError, getOwnedGames, getPlayerSummaries, resolveSteamId } from "@/lib/steam";
import { effectiveTier } from "@/lib/plans";
import { isBotRequest, jsonError, limitOrNull } from "@/lib/http";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function GET(req) {
  // The Discord bot calls from one IP for many servers, so it is exempt (as in /api/compare).
  if (!isBotRequest(req)) {
    const limited = limitOrNull(req, "library", { limit: 30, windowMs: 60_000 });
    if (limited) return limited;
  }
  const input = new URL(req.url).searchParams.get("steamid");
  if (!input) return jsonError("Missing steamid");

  try {
    const steamid = await resolveSteamId(input);
    const [summaries, owned, tierRow] = await Promise.all([
      getPlayerSummaries([steamid]),
      getOwnedGames(steamid),
      query("SELECT tier, expires_at FROM users WHERE steam_id = $1", [steamid]).then((r) => r.rows[0]).catch(() => null),
    ]);
    const s = summaries.get(steamid);
    const profile = {
      steamid,
      username: s?.personaname || steamid,
      personaname: s?.personaname || steamid,
      avatar: s?.avatar || null,
      avatarfull: s?.avatar || null,
      profileurl: s?.profileurl || null,
      tier: effectiveTier(tierRow),
      isPrivate: owned.isPrivate,
    };
    const shared = owned.games.map((g) => ({ appid: g.appid, name: g.name, playtimes: { [steamid]: g.playtime_forever || 0 } }));
    return NextResponse.json({ shared, profiles: [profile], isPrivate: owned.isPrivate });
  } catch (err) {
    if (err instanceof SteamError && (err.code === "not_found" || err.code === "invalid_input")) return jsonError(err.message, 404);
    await logServerError("api/library", err);
    return jsonError("Couldn't load that library from Steam right now.", 502);
  }
}
