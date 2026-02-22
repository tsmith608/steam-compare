import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

// Helper to resolve vanity to numeric ID
async function resolveSteamID(input) {
    if (!input) return null;
    const cleaned = input.trim();
    if (/^\d{17}$/.test(cleaned)) return cleaned; // Already numeric

    // 1. Try DB lookup for vanity_id
    try {
        const dbRes = await query(
            "SELECT steam_id FROM users WHERE LOWER(vanity_id) = LOWER($1) OR LOWER(persona_name) = LOWER($1) LIMIT 1",
            [cleaned]
        );
        if (dbRes.rows.length > 0) return dbRes.rows[0].steam_id;
    } catch (e) {
        console.error("DB vanity lookup failed:", e);
    }

    // 2. Try Steam API
    if (STEAM_API_KEY) {
        try {
            const res = await fetch(
                `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(cleaned)}`
            );
            const data = await res.json();
            if (data?.response?.success === 1 && data.response.steamid) {
                return data.response.steamid;
            }
        } catch (e) {
            console.error("Steam API vanity resolution failed:", e);
        }
    }

    return null; // Could not resolve
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const inputId = searchParams.get("steamid");

    if (!inputId) {
        return NextResponse.json({ error: "Missing steamid" }, { status: 400 });
    }

    try {
        // Resolve the ID first!
        // This prevents "twojuice" from matching a bad record where steam_id='twojuice'
        const resolvedId = await resolveSteamID(inputId);

        // If we couldn't resolve it, we might still try to query DB with raw input just in case, 
        // but strictly speaking, we want numeric IDs.
        // However, if the user really HAS a record with steam_id='twojuice' (the bug), using resolvedId (which acts against Steam API) 
        // might fix the view but leaves the bad record. 
        // The resolvedId for 'twojuice' SHOULD be '7656...'

        const targetId = resolvedId || inputId;

        // Query by the TARGET ID (which should now be numeric '7656...')
        let res = await query("SELECT * FROM users WHERE steam_id = $1", [targetId]);

        let userRecord = res.rows[0];

        // CHECK STALENESS / MISSING DATA
        const STALE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours
        const now = Date.now();

        let needsRefresh = false;

        const isNumericId = /^\d{17}$/.test(targetId);

        if (!userRecord && isNumericId) {
            needsRefresh = true;
        } else if (userRecord) {
            if (!userRecord.avatar_url || !userRecord.persona_name) needsRefresh = true;
            else {
                const lastUpdate = new Date(userRecord.updated_at).getTime();
                if (isNaN(lastUpdate) || (now - lastUpdate > STALE_THRESHOLD)) needsRefresh = true;
            }
        }

        if (needsRefresh && isNumericId && STEAM_API_KEY) {
            try {
                // Fetch from Steam
                console.log(`[Profile] Refreshing stale/missing data for ${targetId}`);
                const steamRes = await fetch(
                    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${targetId}`
                );
                const steamData = await steamRes.json();
                const player = steamData?.response?.players?.[0];

                if (player) {
                    const upsertRes = await query(
                        `INSERT INTO users (steam_id, persona_name, avatar_url, updated_at)
                         VALUES ($1, $2, $3, NOW())
                         ON CONFLICT (steam_id)
                         DO UPDATE SET
                            persona_name = EXCLUDED.persona_name,
                            avatar_url = EXCLUDED.avatar_url,
                            updated_at = NOW()
                         RETURNING *`,
                        [player.steamid, player.personaname, player.avatarfull]
                    );

                    if (upsertRes.rows.length > 0) {
                        userRecord = upsertRes.rows[0];
                    }
                }
            } catch (err) {
                console.error("[Profile] Failed to refresh from Steam:", err);
            }
        }

        if (!userRecord) {
            return NextResponse.json({
                found: false,
                profile: {
                    steam_id: targetId.match(/^\d{17}$/) ? targetId : "",
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
                    custom_banner_pos: 50,
                    dashboard_layout: null
                }
            });
        }

        return NextResponse.json({ found: true, profile: userRecord });
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
            pinnedGameIds,
            personaName,
            vanityId,
            customBanner,
            customLinks,
            gamerTitle,
            featuredCollectionId,
            profileThemePreset,
            customPageBg,
            customBannerPos,
            dashboardLayout
        } = body;

        if (!steamId) {
            return NextResponse.json({ error: "Missing steamId" }, { status: 400 });
        }

        // Upsert profile
        await query(
            `INSERT INTO users (
                steam_id, discord_link, twitter_link, twitch_link, youtube_link, bio, pinned_game_ids, 
                persona_name, vanity_id, custom_banner, custom_links, gamer_title, featured_collection_id, profile_theme_preset, custom_page_bg, custom_banner_pos, dashboard_layout, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
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
                dashboard_layout = COALESCE($17, users.dashboard_layout),
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
                customBannerPos !== undefined ? customBannerPos : null,
                dashboardLayout !== undefined ? JSON.stringify(dashboardLayout) : null
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
