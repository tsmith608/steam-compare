
const STEAM_API_KEY = process.env.STEAM_API_KEY || "1BEC63838802753A381911E69A2ADE47";
const VANITY = "Farted";

async function run() {
    try {
        console.log(`Resolving vanity '${VANITY}'...`);
        const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${VANITY}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("Result:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
