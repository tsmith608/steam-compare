// Public profile pages (GET) and profile editing for the signed-in owner (POST).
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionSteamId } from "@/lib/session";
import { jsonError, limitOrNull, readJson, unauthorized } from "@/lib/http";
import { getPlayerSummaries, resolveSteamId } from "@/lib/steam";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

// Only these columns are ever returned to the public. Billing identifiers,
// Ko-fi transaction ids and Discord ids stay server-side.
const PUBLIC_COLUMNS = [
  "steam_id",
  "persona_name",
  "avatar_url",
  "vanity_id",
  "tier",
  "expires_at",
  "discord_link",
  "twitter_link",
  "twitch_link",
  "youtube_link",
  "bio",
  "pinned_game_ids",
  "custom_banner",
  "custom_page_bg",
  "custom_banner_pos",
  "custom_links",
  "gamer_title",
  "featured_collection_id",
  "profile_theme_preset",
  "dashboard_layout",
  "updated_at",
];

const EMPTY_PROFILE = {
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
  dashboard_layout: null,
};

export async function GET(req) {
  const limited = limitOrNull(req, "profile-get", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const input = new URL(req.url).searchParams.get("steamid");
  if (!input) return jsonError("Missing steamid");

  let steamid;
  try {
    steamid = await resolveSteamId(input);
  } catch {
    return NextResponse.json({ found: false, profile: { steam_id: "", ...EMPTY_PROFILE } });
  }

  try {
    const res = await query(`SELECT ${PUBLIC_COLUMNS.join(", ")} FROM users WHERE steam_id = $1`, [steamid]);
    let profile = res.rows[0];

    // Fill in a display name/avatar from Steam for people who haven't signed in.
    if (!profile?.persona_name || !profile?.avatar_url) {
      const s = (await getPlayerSummaries([steamid]).catch(() => new Map())).get(steamid);
      if (s) profile = { ...(profile || {}), steam_id: steamid, persona_name: s.personaname, avatar_url: s.avatar };
    }

    if (!profile) return NextResponse.json({ found: false, profile: { steam_id: steamid, ...EMPTY_PROFILE } });
    return NextResponse.json({ found: true, profile: { ...EMPTY_PROFILE, ...profile } });
  } catch (err) {
    await logServerError("api/user/profile GET", err);
    return jsonError("Internal Server Error", 500);
  }
}

/* ------------------------------- validation ------------------------------- */

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

function httpsUrl(v, max = 500) {
  if (v === "" || v === null) return "";
  if (typeof v !== "string") return undefined;
  const s = v.trim().slice(0, max);
  if (!s) return "";
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

function linkList(v) {
  if (!Array.isArray(v)) return undefined;
  return v
    .slice(0, 12)
    .map((l) => ({ label: str(l?.label, 40) || "", url: httpsUrl(l?.url) || "" }))
    .filter((l) => l.url);
}

function idList(v) {
  if (!Array.isArray(v)) return undefined;
  return v.slice(0, 24).map((x) => Number(x)).filter((x) => Number.isInteger(x) && x > 0);
}

export async function POST(req) {
  const steamid = await getSessionSteamId();
  if (!steamid) return unauthorized("Sign in with Steam to edit your profile.");
  const limited = limitOrNull(req, "profile-post", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const b = await readJson(req, 128 * 1024);
  const layout = b.dashboardLayout === undefined ? undefined : JSON.stringify(b.dashboardLayout ?? null);
  if (layout && layout.length > 60_000) return jsonError("Layout is too large.");

  const fields = {
    discord_link: httpsUrl(b.discordLink),
    twitter_link: httpsUrl(b.twitterLink),
    twitch_link: httpsUrl(b.twitchLink),
    youtube_link: httpsUrl(b.youtubeLink),
    bio: str(b.bio, 600),
    pinned_game_ids: idList(b.pinnedGameIds),
    custom_banner: httpsUrl(b.customBanner, 1000),
    custom_links: linkList(b.customLinks),
    gamer_title: str(b.gamerTitle, 60),
    featured_collection_id: b.featuredCollectionId === undefined ? undefined : String(b.featuredCollectionId ?? "").slice(0, 40),
    profile_theme_preset: str(b.profileThemePreset, 40),
    custom_page_bg: httpsUrl(b.customPageBg, 1000),
    custom_banner_pos: Number.isFinite(Number(b.customBannerPos)) ? Math.max(0, Math.min(100, Math.round(Number(b.customBannerPos)))) : undefined,
    dashboard_layout: layout,
  };

  const jsonColumns = new Set(["pinned_game_ids", "custom_links"]);
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  if (!entries.length) return NextResponse.json({ success: true });

  const values = entries.map(([k, v]) => (jsonColumns.has(k) ? JSON.stringify(v) : v));
  const cols = entries.map(([k]) => k);
  try {
    await query(
      `INSERT INTO users (steam_id, ${cols.join(", ")}, updated_at)
       VALUES ($1, ${cols.map((_, i) => `$${i + 2}`).join(", ")}, NOW())
       ON CONFLICT (steam_id) DO UPDATE SET ${cols.map((c) => `${c} = EXCLUDED.${c}`).join(", ")}, updated_at = NOW()`,
      [steamid, ...values]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    await logServerError("api/user/profile POST", err);
    return jsonError("Internal Server Error", 500);
  }
}
