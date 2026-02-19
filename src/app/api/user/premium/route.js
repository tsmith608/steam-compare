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
        let res = await query("SELECT created_at as added_at, tier, expires_at, steam_id FROM users WHERE steam_id = $1", [steamId]);

        // If not found, try vanity_id or persona_name match
        if (res.rows.length === 0) {
            res = await query(
                "SELECT created_at as added_at, tier, expires_at, steam_id FROM users WHERE LOWER(vanity_id) = LOWER($1) OR LOWER(persona_name) = LOWER($1) LIMIT 1",
                [steamId]
            );
        }

        if (res.rows.length === 0) {
            return NextResponse.json({ isPremium: false });
        }

        const user = res.rows[0];
        const isPremium = (user.tier === 'Hacker' || user.tier === 'Pro') && (user.expires_at === null || new Date(user.expires_at) > new Date());

        return NextResponse.json({
            isPremium,
            addedAt: user.added_at,
            source: user.source,
            tier: user.tier || 'Noob',
            expiresAt: user.expires_at
        });
    } catch (error) {
        console.error("Error checking premium status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
