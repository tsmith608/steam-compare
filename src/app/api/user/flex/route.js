// Bot (/flex): achievement progress for one or two players on one game.
import { NextResponse } from "next/server";
import { botAuthError, isSteamId64, jsonError, limitOrNull, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

async function fetchStats(steamid, appid) {
  const url = new URL("https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/");
  url.searchParams.set("key", process.env.STEAM_API_KEY || "");
  url.searchParams.set("steamid", steamid);
  url.searchParams.set("appid", String(appid));
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    const list = j?.playerstats?.achievements;
    if (!Array.isArray(list)) return null;
    return { total: list.length, unlocked: list.filter((a) => a.achieved === 1).length };
  } catch {
    return null;
  }
}

export async function POST(req) {
  const denied = botAuthError(req);
  if (denied) return denied;
  const limited = limitOrNull(req, "flex", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const { user1, user2, appid, gameName } = await readJson(req);
  const app = Number(appid);
  if (!isSteamId64(String(user1 || "")) || !Number.isInteger(app) || app <= 0) return jsonError("Missing parameters");
  const second = isSteamId64(String(user2 || "")) ? String(user2) : null;

  const [stats1, stats2] = await Promise.all([fetchStats(String(user1), app), second ? fetchStats(second, app) : null]);
  return NextResponse.json({ stats1, stats2, gameName: typeof gameName === "string" ? gameName.slice(0, 120) : null });
}
