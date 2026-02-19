import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const steamId = searchParams.get("steamid");

    if (!steamId) {
        return NextResponse.json({ error: "Missing steamid" }, { status: 400 });
    }

    try {
        // Try exact Steam ID match first
        let res = await query(
            "SELECT * FROM user_collections WHERE owner_steam_id = $1 ORDER BY created_at DESC",
            [steamId]
        );

        // If no collections found, maybe steamId is a vanity name or username
        if (res.rows.length === 0 && !steamId.match(/^\d{17}$/)) {
            const userRes = await query(
                "SELECT steam_id FROM users WHERE LOWER(vanity_id) = LOWER($1) OR LOWER(persona_name) = LOWER($1) LIMIT 1",
                [steamId]
            );

            if (userRes.rows.length > 0) {
                const resolvedId = userRes.rows[0].steam_id;
                res = await query(
                    "SELECT * FROM user_collections WHERE owner_steam_id = $1 ORDER BY created_at DESC",
                    [resolvedId]
                );
            }
        }

        return NextResponse.json({ collections: res.rows });
    } catch (error) {
        console.error("Error fetching collections:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { id, steamId, title, description, gameIds, isPublic } = body;

        if (!steamId || !title) {
            return NextResponse.json({ error: "Missing steamId or title" }, { status: 400 });
        }

        // Validate/Normalize gameIds to ensure they are stored consistently
        // We expect an array of objects: { appid, rating, comment }
        // If we receive simple IDs (legacy), convert them to objects with defaults.
        const normalizedGames = (gameIds || []).map(g => {
            if (typeof g === 'object' && g !== null) {
                return {
                    appid: g.appid,
                    rating: typeof g.rating === 'number' ? g.rating : 0,
                    comment: typeof g.comment === 'string' ? g.comment : ""
                };
            }
            // Fallback for legacy ID strings/numbers
            return { appid: g, rating: 0, comment: "" };
        });

        if (id) {
            // Update existing
            await query(
                `UPDATE user_collections 
                 SET title = $1, description = $2, game_ids = $3, is_public = $4
                 WHERE id = $5 AND owner_steam_id = $6`,
                [title, description || "", JSON.stringify(normalizedGames), isPublic ?? true, id, steamId]
            );
            return NextResponse.json({ success: true, id });
        } else {
            // Create new
            const res = await query(
                `INSERT INTO user_collections (owner_steam_id, title, description, game_ids, is_public)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [steamId, title, description || "", JSON.stringify(normalizedGames), isPublic ?? true]
            );
            return NextResponse.json({ success: true, id: res.rows[0].id });
        }
    } catch (error) {
        console.error("Error managing collection:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const steamId = searchParams.get("steamid");

    if (!id || !steamId) {
        return NextResponse.json({ error: "Missing id or steamid" }, { status: 400 });
    }

    try {
        await query(
            "DELETE FROM user_collections WHERE id = $1 AND owner_steam_id = $2",
            [id, steamId]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting collection:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
