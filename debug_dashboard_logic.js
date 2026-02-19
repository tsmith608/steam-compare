
const FETCH_OPTS = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ users: ["76561198274289867", "76561198274289867"] })
};

async function run() {
    try {
        console.log("Fetching API data...");
        const res = await fetch("http://localhost:3000/api/compare", FETCH_OPTS);
        const data = await res.json();
        const library = data.shared || [];
        const p = data.profiles[0];

        // Simulate Dashboard Logic
        // In DashboardView: const resolvedNumericId = p?.steamid || activeSteamId;
        // Here activeSteamId IS the friend ID.
        const activeSteamId = "76561198274289867";
        const resolvedNumericId = p?.steamid || activeSteamId;

        console.log("Resolved ID:", resolvedNumericId);

        if (library.length > 0) {
            const key = String(resolvedNumericId);
            const sampleGame = library[0];
            console.log("Sample Game Name:", sampleGame.name);
            console.log("Playtimes Object:", JSON.stringify(sampleGame.playtimes));
            console.log("Playtime for Key:", sampleGame.playtimes[key]);

            let totalMinutes = 0;
            library.forEach(g => {
                const pt = g.playtimes ? g.playtimes[key] : g.playtime_forever;
                totalMinutes += pt || 0;
            });

            console.log("Total Minutes Calculated:", totalMinutes);
            console.log("Total Hours:", Math.round(totalMinutes / 60));
        } else {
            console.log("Library is empty!");
        }

    } catch (e) {
        console.error(e);
    }
}

run();
