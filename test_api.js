// Native fetch is available in Node 22

const API_BASE = 'https://webothplay.com';

async function test() {
    const discordIds = ['967527181077757952']; // Trent's ID or similar
    console.log(`Testing /api/discord/batch-links with ${discordIds}...`);
    try {
        const res = await fetch(`${API_BASE}/api/discord/batch-links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discordIds })
        });
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log(`Data:`, JSON.stringify(data, null, 2));

        if (data.links && data.links.length > 0) {
            const steamIds = data.links.map(l => l.steamId);
            console.log(`Testing /api/user/rankings with ${steamIds}...`);
            const res2 = await fetch(`${API_BASE}/api/user/rankings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ steamIds })
            });
            console.log(`Status: ${res2.status}`);
            const data2 = await res2.json();
            console.log(`Data:`, JSON.stringify(data2, null, 2));
        }
    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
