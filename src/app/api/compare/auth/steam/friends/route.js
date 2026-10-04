// The signed-in user's Steam friends (for the friend picker).
import { NextResponse } from "next/server";
import { getSessionSteamId } from "@/lib/session";
import { limitOrNull, unauthorized } from "@/lib/http";
import { getFriendIds, getPlayerSummaries } from "@/lib/steam";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const steamid = await getSessionSteamId();
  if (!steamid) return unauthorized("Sign in with Steam to load your friends list.");
  const limited = limitOrNull(req, "friends", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const ids = await getFriendIds(steamid);
    if (ids === null) return NextResponse.json({ friends: [], private: true });
    const summaries = await getPlayerSummaries(ids.slice(0, 500));
    const friends = [...summaries.values()]
      .map((p) => ({ steamid: p.steamid, personaname: p.personaname, avatar: p.avatar, isPublic: p.visibility === 3 }))
      .sort((a, b) => a.personaname.localeCompare(b.personaname));
    return NextResponse.json({ friends, private: false }, { headers: { "Cache-Control": "private, max-age=120" } });
  } catch (err) {
    await logServerError("api/friends", err);
    return NextResponse.json({ error: "Couldn't load your friends list from Steam right now." }, { status: 502 });
  }
}
