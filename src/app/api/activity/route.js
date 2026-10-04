// Bot (/hype): what a set of players has been playing in the last two weeks.
import { NextResponse } from "next/server";
import { getRecentGames } from "@/lib/steam";
import { botAuthError, isSteamId64, jsonError, limitOrNull, readJson } from "@/lib/http";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const denied = botAuthError(req);
  if (denied) return denied;
  const limited = limitOrNull(req, "activity", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const { users } = await readJson(req);
  const ids = (Array.isArray(users) ? users : []).map(String).filter(isSteamId64).slice(0, 25);
  if (ids.length < 2) return jsonError("Need at least 2 users");

  try {
    const recent = await Promise.all(ids.map((id) => getRecentGames(id)));
    const map = new Map();
    recent.forEach((games, i) => {
      for (const g of games) {
        if (!map.has(g.appid)) map.set(g.appid, { appid: g.appid, name: g.name, totalRecentMinutes: 0, players: [], icon: g.img_icon_url });
        const e = map.get(g.appid);
        e.totalRecentMinutes += g.playtime_2weeks || 0;
        e.players.push({ steamid: ids[i], minutes: g.playtime_2weeks || 0 });
      }
    });
    const hot = [...map.values()]
      .sort((a, b) => b.players.length - a.players.length || b.totalRecentMinutes - a.totalRecentMinutes)
      .slice(0, 5);
    return NextResponse.json({ hot });
  } catch (err) {
    await logServerError("api/activity", err);
    return jsonError("Couldn't load recent activity.", 502);
  }
}
