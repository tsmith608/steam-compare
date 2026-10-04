-- WeBothPlay database schema (baseline).
-- Reconstructed from the SQL used throughout the codebase on 2026-10-03; the
-- production database predates this file, so verify with `\d+ users` before
-- relying on column types. Every statement is idempotent and safe to re-run.

CREATE TABLE IF NOT EXISTS users (
    steam_id               TEXT PRIMARY KEY,
    persona_name           TEXT,
    vanity_id              TEXT,
    avatar_url             TEXT,
    tier                   TEXT,
    expires_at             TIMESTAMPTZ,
    transaction_id         TEXT,
    purchased_at           TIMESTAMPTZ,
    source                 TEXT,
    stripe_customer_id     TEXT,
    subscription_id        TEXT,
    discord_id             TEXT,
    discord_link           TEXT,
    twitter_link           TEXT,
    twitch_link            TEXT,
    youtube_link           TEXT,
    bio                    TEXT,
    pinned_game_ids        JSONB,
    custom_banner          TEXT,
    custom_page_bg         TEXT,
    custom_banner_pos      INTEGER DEFAULT 50,
    custom_links           JSONB DEFAULT '[]'::jsonb,
    gamer_title            TEXT,
    featured_collection_id TEXT,
    profile_theme_preset   TEXT,
    dashboard_layout       JSONB,
    created_at             TIMESTAMPTZ DEFAULT NOW(),
    updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_collections (
    id             SERIAL PRIMARY KEY,
    owner_steam_id TEXT NOT NULL,
    title          TEXT NOT NULL,
    description    TEXT DEFAULT '',
    game_ids       JSONB DEFAULT '[]'::jsonb,
    is_public      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kofi_transactions (
    transaction_id  TEXT PRIMARY KEY,
    amount          NUMERIC,
    currency        TEXT,
    tier_name       TEXT,
    message         TEXT,
    supporter_name  TEXT,
    supporter_email TEXT,
    steam_id        TEXT,
    processed_at    TIMESTAMPTZ DEFAULT NOW(),
    claimed_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS stripe_transactions (
    id          TEXT PRIMARY KEY,
    customer_id TEXT,
    steam_id    TEXT,
    amount      NUMERIC,
    currency    TEXT,
    status      TEXT,
    type        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pending_upgrades (
    short_code TEXT PRIMARY KEY,
    steam_id   TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
