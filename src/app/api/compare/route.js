import { NextResponse } from "next/server";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

// Helper: resolve either Steam64 or custom vanity URL
async function resolveSteamID(input) {
  // If input is already a Steam64 ID
  if (/^\d{17}$/.test(input)) return input;

  // Extract vanity name from Steam URL if given
  const match = input.match(/steamcommunity\.com\/id\/([^/]+)/);
  const vanity = match ? match[1] : input;

  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${STEAM_API_KEY}&vanityurl=${vanity}`
  );
  const data = await res.json();

  if (data.response.success === 1) {
    console.log(`[Resolved Vanity] ${vanity} → ${data.response.steamid}`);
    return data.response.steamid;
  } else {
    throw new Error(`Could not resolve Steam vanity name: ${input}`);
  }
}

// Helper: fetch user's owned games
async function getUserGames(steamid) {
  const res = await fetch(
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`
  );
  const data = await res.json();
  return data.response.games || [];
}

export async function POST(req) {
  try {
    const { user1, user2 } = await req.json();
    console.log("[Compare Triggered]", { user1, user2 });

    // Resolve both Steam IDs
    const [id1, id2] = await Promise.all([
      resolveSteamID(user1),
      resolveSteamID(user2),
    ]);

    console.log("[Resolved IDs]", { id1, id2 });

    // Fetch game libraries
    const [user1Games, user2Games] = await Promise.all([
      getUserGames(id1),
      getUserGames(id2),
    ]);

    console.log(`[Fetched Games] ${id1}: ${user1Games.length}, ${id2}: ${user2Games.length}`);

    // Compare libraries
    const shared = user1Games.filter((g1) =>
      user2Games.some((g2) => g2.appid === g1.appid)
    );

    const onlyYou = user1Games.filter(
      (g1) => !user2Games.some((g2) => g2.appid === g1.appid)
    );

    const onlyFriend = user2Games.filter(
      (g2) => !user1Games.some((g1) => g1.appid === g2.appid)
    );

    // Add playtime data for shared games
    const sharedDetailed = shared.map((g1) => {
      const g2 = user2Games.find((x) => x.appid === g1.appid);
      return {
        appid: g1.appid,
        name: g1.name,
        user1_playtime: g1.playtime_forever || 0,
        user2_playtime: g2?.playtime_forever || 0,
      };
    });

    // Return results
    const result = {
      shared: sharedDetailed,
      onlyYou: onlyYou.map((g) => ({
        appid: g.appid,
        name: g.name,
        playtime: g.playtime_forever || 0,
      })),
      onlyFriend: onlyFriend.map((g) => ({
        appid: g.appid,
        name: g.name,
        playtime: g.playtime_forever || 0,
      })),
    };

    console.log(
      `[Shared: ${result.shared.length}] [Only You: ${result.onlyYou.length}] [Only Friend: ${result.onlyFriend.length}]`
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("[API Error]", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
