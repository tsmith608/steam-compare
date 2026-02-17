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
        const res = await query("SELECT created_at as added_at, tier, expires_at FROM users WHERE steam_id = $1", [steamId]);

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
