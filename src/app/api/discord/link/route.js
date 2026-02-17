import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET used by Discord Bot to check link status and tier
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const discordId = searchParams.get("discord_id");

        if (!discordId) {
            return NextResponse.json({ error: "Missing discord_id" }, { status: 400 });
        }

        const res = await query(
            `SELECT steam_id, tier, expires_at 
             FROM users 
             WHERE discord_id = $1`,
            [discordId]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ found: false }, { status: 404 });
        }

        const user = res.rows[0];
        const tier = user.tier || 'Noob';
        const isPremium = (tier === 'Hacker' || tier === 'Pro') && (user.expires_at === null || new Date(user.expires_at) > new Date());

        return NextResponse.json({
            found: true,
            steamId: user.steam_id,
            tier,
            isPremium
        });
    } catch (error) {
        console.error("Error fetching discord link:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST used by Website to link Steam ID to Discord ID
export async function POST(req) {
    try {
        const { discordId, steamId } = await req.json();

        if (!discordId || !steamId) {
            return NextResponse.json({ error: "Missing discordId or steamId" }, { status: 400 });
        }

        // 1. Clear any existing link for this discord ID (preventing 1-to-many from discord side)
        await query("UPDATE users SET discord_id = NULL WHERE discord_id = $1", [discordId]);

        // 2. Link the discord ID to the steam account
        // We use an upsert-like logic: if the steam user exists, update them. 
        // If not, we don't want to create a ghost user without Steam auth validation.
        // But since this is called AFTER steam login, the user should exist or we can create them.
        await query(
            `INSERT INTO users (steam_id, discord_id, updated_at) 
             VALUES ($1, $2, NOW())
             ON CONFLICT (steam_id) DO UPDATE SET 
                discord_id = EXCLUDED.discord_id,
                updated_at = NOW()`,
            [steamId, discordId]
        );

        return NextResponse.json({
            success: true,
            steamId,
            discordId
        });
    } catch (error) {
        console.error("Error linking discord:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
