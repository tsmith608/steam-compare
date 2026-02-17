import { NextResponse } from "next/server";

const API_KEY = process.env.STEAM_API_KEY;

async function getStats(steamid) {
    try {
        // Fetch library size
        const libUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=${steamid}&include_appinfo=false&include_played_free_games=true&format=json`;
        const recentUrl = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_KEY}&steamid=${steamid}&count=10&format=json`;

        const [libRes, recentRes] = await Promise.all([
            fetch(libUrl),
            fetch(recentUrl)
        ]);

        const libData = await libRes.json();
        const recentData = await recentRes.json();

        const librarySize = libData?.response?.game_count || 0;
        const recentMinutes = (recentData?.response?.games || []).reduce((acc, g) => acc + g.playtime_2weeks, 0);

        return {
            steamid,
            librarySize,
            recentMinutes
        };
    } catch (e) {
        return { steamid, librarySize: 0, recentMinutes: 0 };
    }
}

export async function POST(req) {
    try {
        const { steamIds } = await req.json();

        if (!steamIds || !Array.isArray(steamIds)) {
            return NextResponse.json({ error: "Missing steamIds array" }, { status: 400 });
        }

        // Limit to 20 for performance in a single request for now
        const sliced = steamIds.slice(0, 20);
        const stats = await Promise.all(sliced.map(id => getStats(id)));

        return NextResponse.json({ stats });
    } catch (error) {
        console.error("Error fetching rankings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
