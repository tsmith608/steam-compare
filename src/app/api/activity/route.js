import { NextResponse } from 'next/server';

const API_KEY = process.env.STEAM_API_KEY;

const JUNK_APP_IDS = new Set([
    431960, // Wallpaper Engine
    622590, // Tom Clancy's Rainbow Six Siege - Test Server
    1040460, // Tom Clancy's Rainbow Six Siege - Technical Test Server
]);

async function fetchRecentGames(steamid) {
    if (!steamid) return [];
    // IPlayerService/GetRecentlyPlayedGames/v0001
    const url = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_KEY}&steamid=${steamid}&count=10&format=json`;
    try {
        const r = await fetch(url);
        if (!r.ok) return [];
        const j = await r.json();

        // Filter junk
        return (j.response.games || []).filter(g => {
            if (JUNK_APP_IDS.has(g.appid)) return false;
            if (g.name && g.name.includes("Rainbow Six Siege") && (g.name.includes("Test") || g.name.includes("TTS"))) return false;
            return true;
        });
    } catch (e) {
        return [];
    }
}

export async function POST(req) {
    try {
        const { users } = await req.json();
        if (!users || users.length < 2) {
            return NextResponse.json({ error: "Need at least 2 users" }, { status: 400 });
        }

        // Fetch recent games for all users
        const recentData = await Promise.all(users.map(u => fetchRecentGames(u)));

        // Aggregate by AppID
        // We want to know:
        // 1. Which games are being played by MULTIPLE people recently
        // 2. Who is playing what

        const activityMap = new Map(); // appid -> { name, totalRecentMinutes, players: [steamid, ...] }

        recentData.forEach((games, userIndex) => {
            const steamid = users[userIndex];
            games.forEach(g => {
                if (!activityMap.has(g.appid)) {
                    activityMap.set(g.appid, {
                        appid: g.appid,
                        name: g.name,
                        totalRecentMinutes: 0,
                        players: [],
                        icon: g.img_icon_url
                    });
                }
                const entry = activityMap.get(g.appid);
                entry.totalRecentMinutes += g.playtime_2weeks;
                entry.players.push({ steamid, minutes: g.playtime_2weeks });
            });
        });

        // Convert to array and sort
        // Priority 1: Played by multiple people (Squad Hype)
        // Priority 2: Total recent time
        const sortedActivity = Array.from(activityMap.values())
            .filter(a => a.players.length > 0) // Sanity check
            .sort((a, b) => {
                const countDiff = b.players.length - a.players.length;
                if (countDiff !== 0) return countDiff;
                return b.totalRecentMinutes - a.totalRecentMinutes;
            });

        // Return top 5 "Squad Hot" games
        return NextResponse.json({
            hot: sortedActivity.slice(0, 5),
            // maybe also return individual breakdowns?
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
