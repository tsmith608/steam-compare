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
        const res = await query("SELECT * FROM users WHERE steam_id = $1", [steamId]);

        if (res.rows.length === 0) {
            return NextResponse.json({
                found: false,
                profile: {
                    steam_id: steamId,
                    discord_link: "",
                    twitter_link: "",
                    twitch_link: "",
                    youtube_link: "",
                    bio: "",
                    pinned_game_ids: []
                }
            });
        }

        return NextResponse.json({ found: true, profile: res.rows[0] });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const {
            steamId,
            discordLink,
            twitterLink,
            twitchLink,
            youtubeLink,
            bio,
            pinnedGameIds
        } = body;

        if (!steamId) {
            return NextResponse.json({ error: "Missing steamId" }, { status: 400 });
        }

        // Upsert profile
        await query(
            `INSERT INTO users (
                steam_id, discord_link, twitter_link, twitch_link, youtube_link, bio, pinned_game_ids, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (steam_id) 
            DO UPDATE SET 
                discord_link = $2, 
                twitter_link = $3, 
                twitch_link = $4, 
                youtube_link = $5, 
                bio = $6, 
                pinned_game_ids = $7,
                updated_at = NOW()`,
            [
                steamId,
                discordLink || "",
                twitterLink || "",
                twitchLink || "",
                youtubeLink || "",
                bio || "",
                JSON.stringify(pinnedGameIds || [])
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
