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
        let res = await query("SELECT * FROM users WHERE steam_id = $1", [steamId]);

        // If not found, try vanity_id or persona_name match
        if (res.rows.length === 0) {
            res = await query(
                "SELECT * FROM users WHERE LOWER(vanity_id) = LOWER($1) OR LOWER(persona_name) = LOWER($1) LIMIT 1",
                [steamId]
            );
        }

        if (res.rows.length === 0) {
            // If it looks like a steamID, return empty profile.
            // If it's a vanity name and not in DB, it will be resolved by the compare API in the frontend.
            return NextResponse.json({
                found: false,
                profile: {
                    steam_id: steamId.match(/^\d{17}$/) ? steamId : "",
                    discord_link: "",
                    twitter_link: "",
                    twitch_link: "",
                    youtube_link: "",
                    bio: "",
                    pinned_game_ids: [],
                    custom_banner: "",
                    custom_links: [],
                    gamer_title: "",
                    featured_collection_id: "",
                    profile_theme_preset: "default",
                    custom_page_bg: "",
                    custom_banner_pos: 50
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
        console.log("POST /api/user/profile - Received body size:", JSON.stringify(body).length);
        const {
            steamId,
            discordLink,
            twitterLink,
            twitchLink,
            youtubeLink,
            bio,
            pinnedGameIds,
            personaName,
            vanityId,
            customBanner,
            customLinks,
            gamerTitle,
            featuredCollectionId,
            profileThemePreset,
            customPageBg,
            customBannerPos
        } = body;

        if (!steamId) {
            return NextResponse.json({ error: "Missing steamId" }, { status: 400 });
        }

        // Upsert profile
        await query(
            `INSERT INTO users (
                steam_id, discord_link, twitter_link, twitch_link, youtube_link, bio, pinned_game_ids, 
                persona_name, vanity_id, custom_banner, custom_links, gamer_title, featured_collection_id, profile_theme_preset, custom_page_bg, custom_banner_pos, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
            ON CONFLICT (steam_id) 
            DO UPDATE SET 
                discord_link = COALESCE($2, users.discord_link), 
                twitter_link = COALESCE($3, users.twitter_link), 
                twitch_link = COALESCE($4, users.twitch_link), 
                youtube_link = COALESCE($5, users.youtube_link), 
                bio = COALESCE($6, users.bio), 
                pinned_game_ids = COALESCE($7, users.pinned_game_ids),
                persona_name = COALESCE($8, users.persona_name),
                vanity_id = COALESCE($9, users.vanity_id),
                custom_banner = COALESCE($10, users.custom_banner),
                custom_links = COALESCE($11, users.custom_links),
                gamer_title = COALESCE($12, users.gamer_title),
                featured_collection_id = COALESCE($13, users.featured_collection_id),
                profile_theme_preset = COALESCE($14, users.profile_theme_preset),
                custom_page_bg = COALESCE($15, users.custom_page_bg),
                custom_banner_pos = COALESCE($16, users.custom_banner_pos),
                updated_at = NOW()`,
            [
                steamId,
                discordLink !== undefined ? discordLink : null,
                twitterLink !== undefined ? twitterLink : null,
                twitchLink !== undefined ? twitchLink : null,
                youtubeLink !== undefined ? youtubeLink : null,
                bio !== undefined ? bio : null,
                pinnedGameIds !== undefined ? JSON.stringify(pinnedGameIds) : null,
                personaName !== undefined ? personaName : null,
                vanityId !== undefined ? vanityId : null,
                customBanner !== undefined ? customBanner : null,
                customLinks !== undefined ? JSON.stringify(customLinks) : null,
                gamerTitle !== undefined ? gamerTitle : null,
                featuredCollectionId !== undefined ? featuredCollectionId : null,
                profileThemePreset !== undefined ? profileThemePreset : null,
                customPageBg !== undefined ? customPageBg : null,
                customBannerPos !== undefined ? customBannerPos : null
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
