-- 002: tables added by the 2026 retrofit. Additive only; safe to re-run.

-- Fallback store for the session signing secret (used only when the
-- SESSION_SECRET env var is missing).
CREATE TABLE IF NOT EXISTS app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Stripe webhook idempotency: each event id is processed once.
CREATE TABLE IF NOT EXISTS stripe_events (
    id          TEXT PRIMARY KEY,
    type        TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- First-party product analytics. No IP addresses, no Steam IDs, no emails:
-- anon_id is a random per-browser id, props hold counts and enums only.
CREATE TABLE IF NOT EXISTS events (
    id           BIGSERIAL PRIMARY KEY,
    name         TEXT NOT NULL,
    ts           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    anon_id      TEXT,
    path         TEXT,
    ref_domain   TEXT,
    utm_source   TEXT,
    utm_medium   TEXT,
    utm_campaign TEXT,
    props        JSONB
);
CREATE INDEX IF NOT EXISTS events_ts_idx ON events (ts);
CREATE INDEX IF NOT EXISTS events_name_ts_idx ON events (name, ts);

-- Cached Steam store metadata (genres, categories, price) per app.
CREATE TABLE IF NOT EXISTS app_meta (
    appid      INTEGER PRIMARY KEY,
    data       JSONB NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shareable comparison links. Only public Steam IDs and a computed summary
-- are stored; the full comparison is recomputed live when opened.
CREATE TABLE IF NOT EXISTS shares (
    id         TEXT PRIMARY KEY,
    steam_ids  TEXT[] NOT NULL,
    summary    JSONB NOT NULL,
    kind       TEXT NOT NULL DEFAULT 'comparison',
    created_by TEXT,
    views      INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shortlist polls: a group votes on a few shared games via a link.
CREATE TABLE IF NOT EXISTS polls (
    id         TEXT PRIMARY KEY,
    steam_ids  TEXT[] NOT NULL,
    options    JSONB NOT NULL,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS poll_votes (
    poll_id    TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    voter      TEXT NOT NULL,
    appid      INTEGER NOT NULL,
    voter_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (poll_id, voter)
);

-- Saved friend groups for signed-in users.
CREATE TABLE IF NOT EXISTS saved_groups (
    id             BIGSERIAL PRIMARY KEY,
    owner_steam_id TEXT NOT NULL,
    name           TEXT NOT NULL,
    steam_ids      TEXT[] NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS saved_groups_owner_idx ON saved_groups (owner_steam_id);

-- Lookups the app performs constantly.
CREATE INDEX IF NOT EXISTS users_discord_id_idx ON users (discord_id);
CREATE INDEX IF NOT EXISTS users_stripe_customer_idx ON users (stripe_customer_id);
CREATE INDEX IF NOT EXISTS users_vanity_lower_idx ON users (LOWER(vanity_id));

-- Ko-fi claims must be single-use.
ALTER TABLE kofi_transactions ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Billing state the app needs to show "payment failed / renews on" honestly.
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_status TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;
