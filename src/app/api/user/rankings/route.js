// Bot (/leaderboard): library size and recent playtime per player.
import { NextResponse } from "next/server";
import { getOwnedGames, getRecentGames } from "@/lib/steam";
import { botAuthError, isSteamId64, jsonError, limitOrNull, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const denied = botAuthError(req);
  if (denied) return denied;
  const limited = limitOrNull(req, "rankings", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const { steamIds } = await readJson(req);
  if (!Array.isArray(steamIds)) return jsonError("Missing steamIds array");
  const ids = steamIds.map(String).filter(isSteamId64).slice(0, 20);

  const stats = await Promise.all(
    ids.map(async (steamid) => {
      try {
        const [owned, recent] = await Promise.all([getOwnedGames(steamid), getRecentGames(steamid)]);
        return {
          steamid,
          librarySize: owned.games.length,
          recentMinutes: recent.reduce((acc, g) => acc + (g.playtime_2weeks || 0), 0),
        };
      } catch {
        return { steamid, librarySize: 0, recentMinutes: 0 };
      }
    })
  );
  return NextResponse.json({ stats });
}
