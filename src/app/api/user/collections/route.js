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
        const res = await query(
            "SELECT * FROM user_collections WHERE owner_steam_id = $1 ORDER BY created_at DESC",
            [steamId]
        );
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

        if (id) {
            // Update existing
            await query(
                `UPDATE user_collections 
                 SET title = $1, description = $2, game_ids = $3, is_public = $4
                 WHERE id = $5 AND owner_steam_id = $6`,
                [title, description || "", JSON.stringify(gameIds || []), isPublic ?? true, id, steamId]
            );
            return NextResponse.json({ success: true, id });
        } else {
            // Create new
            const res = await query(
                `INSERT INTO user_collections (owner_steam_id, title, description, game_ids, is_public)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [steamId, title, description || "", JSON.stringify(gameIds || []), isPublic ?? true]
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
