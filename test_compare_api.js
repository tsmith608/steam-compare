
const FETCH_OPTS = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ users: ["76561198274289867", "76561198274289867"] }) // Dashboard simulates compare with self?
};

async function run() {
    try {
        console.log("Testing /api/compare with Farted's ID...");
        const res = await fetch("http://localhost:3000/api/compare", FETCH_OPTS);
        const data = await res.json();

        console.log("Status:", res.status);
        if (data.shared) {
            console.log("Shared Games Count:", data.shared.length);
            if (data.shared.length > 0) {
                console.log("Sample Game:", JSON.stringify(data.shared[0], null, 2));
            }
        }
        if (data.profiles) {
            console.log("Profiles:", JSON.stringify(data.profiles, null, 2));
        }
        console.log("Full Response Keys:", Object.keys(data));
    } catch (e) {
        console.error(e);
    }
}

run();
