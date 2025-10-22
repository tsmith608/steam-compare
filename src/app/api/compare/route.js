import { NextResponse } from "next/server";

const API_KEY = process.env.STEAM_API_KEY;

// Resolve vanity names, profile URLs, or 17-digit IDs
async function resolveSteamID(input) {
  const cleaned = input.trim();

  // 1️⃣ Direct 17-digit SteamID64
  if (/^\d{17}$/.test(cleaned)) return cleaned;

  // 2️⃣ Extract from profile URLs
  const profileMatch = cleaned.match(/steamcommunity\.com\/profiles\/(\d{17})/);
  if (profileMatch) return profileMatch[1];

  // 3️⃣ Extract from custom vanity URLs
  const vanityMatch = cleaned.match(/steamcommunity\.com\/id\/([^\/?#]+)/);
  const vanity = vanityMatch ? vanityMatch[1] : cleaned.replace(/^https?:\/\/|www\.|steamcommunity\.com\/|id\/|profiles\//g, "").split(/[/?#]/)[0];

  // 4️⃣ Resolve vanity name to SteamID64
  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${API_KEY}&vanityurl=${vanity}`
  );
  const data = await res.json();

  if (data?.response?.success === 1 && data.response.steamid) {
    console.log(`[Resolved Vanity] ${vanity} → ${data.response.steamid}`);
    return data.response.steamid;
  }

  throw new Error(`Could not resolve Steam vanity name: ${input}`);
}

export async function POST(req) {
  try {
    const { user1, user2 } = await req.json();
    console.log("[Compare Triggered]", { user1, user2 });

    const id1 = await resolveSteamID(user1);
    const id2 = await resolveSteamID(user2);
    console.log("[Resolved IDs]", { id1, id2 });

    // Fetch both libraries
    const [res1, res2] = await Promise.all([
      fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=${id1}&include_appinfo=true&format=json`
      ),
      fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=${id2}&include_appinfo=true&format=json`
      ),
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();

    const games1 = data1?.response?.games || [];
    const games2 = data2?.response?.games || [];

    // Merge shared games with both playtimes
    const shared = games1
      .map(g1 => {
        const match = games2.find(g2 => g2.appid === g1.appid);
        if (match) {
          return {
            appid: g1.appid,
            name: g1.name,
            user1_playtime: g1.playtime_forever || 0,
            user2_playtime: match.playtime_forever || 0,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Games only you own
    const onlyYou = games1
      .filter(g1 => !games2.some(g2 => g2.appid === g1.appid))
      .map(g => ({
        appid: g.appid,
        name: g.name,
        playtime: g.playtime_forever || 0,
      }));

    // Games only your friend owns
    const onlyFriend = games2
      .filter(g2 => !games1.some(g1 => g1.appid === g2.appid))
      .map(g => ({
        appid: g.appid,
        name: g.name,
        playtime: g.playtime_forever || 0,
      }));

    console.log(
      `[Shared: ${shared.length}] [Only You: ${onlyYou.length}] [Only Friend: ${onlyFriend.length}]`
    );

    return NextResponse.json({ shared, onlyYou, onlyFriend });
  } catch (err) {
    console.error("[API Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
