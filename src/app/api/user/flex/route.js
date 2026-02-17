import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { user1, user2, appid, gameName } = await req.json();
        const STEAM_API_KEY = process.env.STEAM_API_KEY;

        if (!user1 || !appid) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const fetchStats = async (steamid) => {
            const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${STEAM_API_KEY}&steamid=${steamid}&appid=${appid}`;
            const r = await fetch(url);
            if (!r.ok) return null;
            const j = await r.json();
            if (!j.playerstats || !j.playerstats.achievements) return null;

            const total = j.playerstats.achievements.length;
            const unlocked = j.playerstats.achievements.filter(a => a.achieved === 1).length;
            return { total, unlocked };
        };

        const stats1 = await fetchStats(user1);
        const stats2 = user2 ? await fetchStats(user2) : null;

        return NextResponse.json({
            stats1,
            stats2,
            gameName
        });

    } catch (error) {
        console.error("Flex API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
