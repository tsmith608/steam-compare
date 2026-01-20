import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const STEAM_API_KEY = process.env.STEAM_API_KEY;

// GET /api/steam/friends?steamid=... [&self=1]
export async function GET(req) {
  const url = new URL(req.url);
  const steamid = url.searchParams.get("steamid");
  const includeSelf = url.searchParams.get("self") === "1";

  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "Missing STEAM_API_KEY" }, { status: 500 });
  }
  if (!steamid) {
    return NextResponse.json({ error: "Missing steamid" }, { status: 400 });
  }

  try {
    // 1) Get friend IDs
    const listData = await fetch(
      `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${STEAM_API_KEY}&steamid=${steamid}&relationship=friend`,
      { cache: "no-store" }
    ).then(r => r.json()).catch(() => null);

    const ids = (listData?.friendslist?.friends || []).map(f => f.steamid);

    // 2) If empty, return empty (privacy often the reason)
    if (!ids.length) {
      return NextResponse.json({ friends: [], me: null }, { status: 200 });
    }

    // 3) Batch summaries (100 at a time)
    const chunk = (arr, n) => arr.reduce((a, _, i) => (i % n ? a : [...a, arr.slice(i, i + n)]), []);
    const chunks = chunk(ids, 100);
    const summaries = [];
    for (const group of chunks) {
      const sum = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${group.join(",")}`,
        { cache: "no-store" }
      ).then(r => r.json());
      const players = sum?.response?.players || [];
      summaries.push(...players);
    }

    // 4) Optional: include self (for header)
    let me = null;
    if (includeSelf) {
      const selfSum = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamid}`,
        { cache: "no-store" }
      ).then(r => r.json());
      me = selfSum?.response?.players?.[0] || null;
    }

    // 5) Normalize
    const friends = summaries.map(p => ({
      steamid: p.steamid,
      personaname: p.personaname,
      avatarmedium: p.avatarmedium,
      avatarfull: p.avatarfull,
      profileurl: p.profileurl,
    }));

    return NextResponse.json({ friends, me }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "steam_api_error", detail: String(err) }, { status: 500 });
  }
}
