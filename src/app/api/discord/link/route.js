import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
    try {
        const { discordId, steamId } = await req.json();

        if (!discordId || !steamId) {
            return NextResponse.json({ error: "Missing discordId or steamId" }, { status: 400 });
        }

        // Upsert: Insert or Update if exists
        await query(
            `INSERT INTO discord_users (discord_id, steam_id)
       VALUES ($1, $2)
       ON CONFLICT (discord_id) 
       DO UPDATE SET steam_id = $2, created_at = CURRENT_TIMESTAMP`,
            [discordId, steamId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error linking user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const discordId = searchParams.get("discord_id");

    if (!discordId) {
        return NextResponse.json({ error: "Missing discord_id" }, { status: 400 });
    }

    try {
        const res = await query("SELECT steam_id FROM discord_users WHERE discord_id = $1", [discordId]);
        if (res.rows.length === 0) {
            return NextResponse.json({ found: false }, { status: 404 });
        }

        return NextResponse.json({ found: true, steamId: res.rows[0].steam_id });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
