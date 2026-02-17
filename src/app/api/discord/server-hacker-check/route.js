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
            return NextResponse.json({ hasHacker: false });
        }

        // Check if any of these discord IDs have a Hacker tier and haven't expired
        const res = await query(
            `SELECT COUNT(*) as count
             FROM users 
             WHERE discord_id = ANY($1) 
             AND tier = 'Hacker' 
             AND (expires_at IS NULL OR expires_at > NOW())`,
            [discordIds]
        );

        const hasHacker = parseInt(res.rows[0].count) > 0;

        return NextResponse.json({ hasHacker });
    } catch (error) {
        console.error("Error checking server hacker status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
