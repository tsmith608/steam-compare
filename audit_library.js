
const STEAM_API_KEY = process.env.STEAM_API_KEY || "1BEC63838802753A381911E69A2ADE47";
const FRIEND_ID = "76561198274289867";

async function checkLibrary() {
    console.log(`Checking Library Access for ${FRIEND_ID}...`);
    try {
        const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${FRIEND_ID}&format=json&include_appinfo=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.response && data.response.games) {
            console.log(`SUCCESS: Found ${data.response.game_count} games.`);
            console.log("First 3 games:", data.response.games.slice(0, 3).map(g => `${g.name} (${g.playtime_forever}m)`));
        } else {
            console.log("FAILURE: No games found. Response:", JSON.stringify(data, null, 2));
            console.log("Likely Cause: Profile is PRIVATE or Friends-Only.");
        }
    } catch (e) {
        console.error("Error fetching library:", e);
    }
}

checkLibrary();
