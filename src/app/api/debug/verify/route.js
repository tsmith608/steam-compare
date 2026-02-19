
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const logs = [];
    const log = (msg) => logs.push(msg);

    const ownerId = "VERIFICATION_TEST_USER";
    let collectionId = null;

    try {
        // 1. Create Collection
        log("1. Testing Create Collection...");
        const gameIds = [
            { appid: 10, rating: 5, comment: "Masterpiece" },
            { appid: 20, rating: 3, comment: "It's okay" }
        ];

        const createRes = await query(
            `INSERT INTO user_collections (owner_steam_id, title, description, game_ids, is_public)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [ownerId, "Test Collection", "Description", JSON.stringify(gameIds), true]
        );
        collectionId = createRes.rows[0].id;
        log(`✅ Created Collection ID: ${collectionId}`);

        // 2. Verify Storage
        log("2. Verifying Storage...");
        const fetchRes = await query("SELECT * FROM user_collections WHERE id = $1", [collectionId]);
        const storedGames = fetchRes.rows[0].game_ids;
        if (storedGames.length === 2 && storedGames[0].rating === 5) {
            log("✅ Storage verified: JSONB structure correct.");
        } else {
            log(`❌ Storage mismatch: ${JSON.stringify(storedGames)}`);
        }

        // 3. Test Public Fetch
        log("3. Testing Public Fetch Query...");
        const publicRes = await query("SELECT * FROM user_collections WHERE id = $1 AND is_public = true", [collectionId]);
        if (publicRes.rows.length > 0) {
            log("✅ Public fetch successful.");
        } else {
            log("❌ Public fetch failed.");
        }

        // 4. Clean up
        log("4. Cleaning up...");
        await query("DELETE FROM user_collections WHERE id = $1", [collectionId]);
        log("✅ Deleted test collection.");

        return NextResponse.json({ success: true, logs });

    } catch (e) {
        return NextResponse.json({ success: false, logs, error: e.message, stack: e.stack });
    }
}
