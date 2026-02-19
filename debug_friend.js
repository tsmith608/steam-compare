
const STEAM_API_KEY = process.env.STEAM_API_KEY || "1BEC63838802753A381911E69A2ADE47";
const FRIEND_ID = "76561198274289867";
const BASE_URL = "http://localhost:3000";

async function run() {
    try {
        console.log("Fetching fresh data from Steam...");
        const steamRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${FRIEND_ID}`);
        const steamData = await steamRes.json();
        const player = steamData?.response?.players?.[0];

        if (!player) {
            console.error("User not found on Steam!");
            return;
        }

        console.log("Found Player:", player.personaname);

        // Extract Vanity
        let vanity = "";
        if (player.profileurl && player.profileurl.includes("/id/")) {
            const m = player.profileurl.match(/\/id\/([^\/?#]+)/);
            if (m) vanity = m[1];
        }
        console.log("Vanity:", vanity || "None (Numeric)");

        // Force Update via API
        console.log("Pushing update to local DB...");
        const res = await fetch(`${BASE_URL}/api/user/profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                steamId: player.steamid,
                personaName: player.personaname,
                avatar: player.avatarfull, // Post expects 'avatar' maybe? checking schema...
                vanityId: vanity,
                // We don't want to clear their bio/theme if they have one, but "reset" implies fixing links.
                // The POST handler uses COALESCE for nulls, preventing overwrite if we don't send fields.
                // BUT, if we want to RESET, maybe we should not send themes? 
                // User said "reset him manually", implying they want it FIXED. 
                // Determining if their link is broken means ensuring vanity is correct.
            })
        });

        const result = await res.json();
        console.log("Update Result:", result);

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
