
const { query } = require('../lib/db');

async function testCollections() {
    console.log("Starting Collections API Verification...");

    const ownerId = "76561198000000000"; // Test SteamID
    let collectionId = null;

    // 1. Create Collection
    console.log("\n1. Testing Create Collection...");
    try {
        const gameIds = [
            { appid: 10, rating: 5, comment: "Masterpiece" },
            { appid: 20, rating: 3, comment: "It's okay" }
        ];

        const res = await query(
            `INSERT INTO user_collections (owner_steam_id, title, description, game_ids, is_public)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [ownerId, "Test Collection", "Description", JSON.stringify(gameIds), true]
        );
        collectionId = res.rows[0].id;
        console.log("✅ Created Collection ID:", collectionId);
    } catch (e) {
        console.error("❌ Failed to create:", e);
        return;
    }

    // 2. Verify Storage
    console.log("\n2. Verifying Storage...");
    try {
        const res = await query("SELECT * FROM user_collections WHERE id = $1", [collectionId]);
        const storedGames = res.rows[0].game_ids;
        if (storedGames.length === 2 && storedGames[0].rating === 5) {
            console.log("✅ Storage verified: JSONB structure correct.");
        } else {
            console.error("❌ Storage mismatch:", storedGames);
        }
    } catch (e) {
        console.error("❌ Failed to verify:", e);
    }

    // 3. Test Public Fetch
    console.log("\n3. Testing Public Fetch Query...");
    try {
        const res = await query("SELECT * FROM user_collections WHERE id = $1 AND is_public = true", [collectionId]);
        if (res.rows.length > 0) {
            console.log("✅ Public fetch successful.");
        } else {
            console.error("❌ Public fetch failed.");
        }
    } catch (e) {
        console.error("❌ Failed public fetch:", e);
    }

    // 4. Clean up
    console.log("\n4. Cleaning up...");
    try {
        await query("DELETE FROM user_collections WHERE id = $1", [collectionId]);
        console.log("✅ Deleted test collection.");
    } catch (e) {
        console.error("❌ Failed delete:", e);
    }
}

// Mock environment for the script to run standalone with local DB if needed,
// but since we are in Next.js env, we might need to load env vars.
// For simplicity, we'll try to run this via a temporary route or just rely on the fact
// that I can't easily run a standalone node script with next.js env vars without setup.
// BETTER APPROACH: Create a temporary API route to run this test logic.
