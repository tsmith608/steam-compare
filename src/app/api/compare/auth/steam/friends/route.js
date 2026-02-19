import { NextResponse } from "next/server";
import { query } from "@/lib/db";

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
    console.log(`[API] /friends fetching for steamid: ${steamid}, key_exists: ${!!STEAM_API_KEY}`);
    const listData = await fetch(
      `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${STEAM_API_KEY}&steamid=${steamid}&relationship=friend`,
      { cache: "no-store" }
    ).then(async r => {
      const txt = await r.text();
      // console.log(`[API] /friends raw response: status=${r.status} body=${txt.substring(0, 200)}`); 
      try { return JSON.parse(txt); } catch { return null; }
    }).catch(err => {
      console.error("[API] /friends fetch error:", err);
      return null;
    });

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

      // Cache friends to DB (fire and forget to not block response too much, or await for consistency)
      // We await to ensure data is there if we immediately need it, but bulk promise is faster.
      await Promise.all(players.map(p =>
        query(
          `INSERT INTO users (steam_id, persona_name, avatar_url, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (steam_id) 
           DO UPDATE SET 
             persona_name = EXCLUDED.persona_name,
             avatar_url = EXCLUDED.avatar_url,
             updated_at = NOW()`,
          [p.steamid, p.personaname, p.avatarfull]
        ).catch(e => console.error(`Failed to cache friend ${p.steamid}:`, e))
      ));
    }

    // 4) Optional: include self (for header)
    let me = null;
    if (includeSelf) {
      const selfSum = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamid}`,
        { cache: "no-store" }
      ).then(r => r.json());
      me = selfSum?.response?.players?.[0] || null;

      if (me) {
        // Cache self too
        await query(
          `INSERT INTO users (steam_id, persona_name, avatar_url, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (steam_id) 
           DO UPDATE SET 
             persona_name = EXCLUDED.persona_name,
             avatar_url = EXCLUDED.avatar_url,
             updated_at = NOW()`,
          [me.steamid, me.personaname, me.avatarfull]
        ).catch(e => console.error(`Failed to cache self ${me.steamid}:`, e));
      }
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
    console.error("[API] /friends error:", err);
    return NextResponse.json({ error: "steam_api_error", detail: String(err) }, { status: 500 });
  }
}
