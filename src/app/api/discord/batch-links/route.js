import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
    try {
        const { discordIds } = await req.json();

        if (!discordIds || !Array.isArray(discordIds)) {
            return NextResponse.json({ error: "Missing or invalid discordIds array" }, { status: 400 });
        }

        if (discordIds.length === 0) {
            return NextResponse.json({ links: [] });
        }

        // Fetch all linked users in the list
        const res = await query(
            `SELECT discord_id, steam_id 
             FROM users 
             WHERE discord_id = ANY($1)`,
            [discordIds]
        );

        const links = res.rows.map(row => ({
            discordId: row.discord_id,
            steamId: row.steam_id
        }));

        return NextResponse.json({ links });
    } catch (error) {
        console.error("Error batch resolving links:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
