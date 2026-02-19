import { NextResponse } from 'next/server';

const API_KEY = process.env.STEAM_API_KEY;

async function fetchLibrary(steamid) {
    if (!steamid) return [];
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=${steamid}&include_appinfo=1&include_played_free_games=1&format=json`;
    try {
        const r = await fetch(url);
        if (!r.ok) return [];
        const j = await r.json();
        return j.response.games || [];
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

        // Fetch libraries for all users (ignoring vanity resolution for now, assuming IDs are passed or handled by frontend - wait, frontend passes resolved IDs usually? Let's assume resolved or we need resolve logic here too.
        // Actually the frontend `handleCompare` resolves them. But this is a separate endpoint?
        // Let's assume frontend passes resolved SteamIDs.

        const libraries = await Promise.all(users.map(u => fetchLibrary(u)));

        // Find intersection of AppIDs
        if (libraries.some(l => l.length === 0)) {
            return NextResponse.json({ backlog: [] }); // If any profile is private, no intersection possible safely? Or just intersection of public ones? 
            // Logic: "Backlog Slayer" implies everyone owns it. So if one is private, we can't know.
            // So return empty is safe.
        }

        // Map appid -> game for the first user to get metadata
        const metadata = new Map();
        libraries[0].forEach(g => metadata.set(g.appid, g));

        // Intersection
        let commonAppIds = libraries[0].map(g => g.appid);
        for (let i = 1; i < libraries.length; i++) {
            const currentAppIds = new Set(libraries[i].map(g => g.appid));
            commonAppIds = commonAppIds.filter(id => currentAppIds.has(id));
        }

        const JUNK_APP_IDS = new Set([
            431960, // Wallpaper Engine
            622590, // Tom Clancy's Rainbow Six Siege - Test Server
            1040460, // Tom Clancy's Rainbow Six Siege - Technical Test Server
            654310, // For Honor - Public Test
        ]);

        // ... inside POST ...

        // Filter for 0 playtime across ALL users
        const backlog = [];
        for (const appid of commonAppIds) {
            // Common junk filter
            if (JUNK_APP_IDS.has(appid)) continue;

            // Metadata check for name-based junk
            const meta = metadata.get(appid);
            if (meta && meta.name && meta.name.includes("Rainbow Six Siege") && (meta.name.includes("Test") || meta.name.includes("TTS"))) continue;
            if (meta && meta.name && meta.name.includes("Public Test")) continue;

            let qualifies = true;
            for (const lib of libraries) {
                const game = lib.find(g => g.appid === appid);
                const playtime = game ? (game.playtime_forever || 0) : 0;
                // If any user has played more than 2 hours (120 minutes), it's not a "backlog" game
                if (playtime > 120) {
                    qualifies = false;
                    break;
                }
            }

            if (qualifies) {
                backlog.push(metadata.get(appid));
            }
        }

        // Sort by name? Random?
        // Let's return top 12 random ones or just all?
        return NextResponse.json({ backlog: backlog.slice(0, 50) });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
