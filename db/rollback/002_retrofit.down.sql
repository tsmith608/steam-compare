-- Rollback for 002_retrofit.sql — run by hand ONLY if you must remove the retrofit schema.
--
-- You almost never need this: 002 is purely additive (new tables, new nullable
-- columns, plain indexes), and the pre-retrofit code ignores all of it. To roll
-- back the app, redeploy the previous Vercel deployment and leave the database alone.
--
-- Running this DELETES analytics events, share links, polls/votes, saved groups,
-- the Stripe idempotency log and the stored session secret (everyone is signed out).
-- Take a backup first:  pg_dump "$DATABASE_URL" > before-rollback.sql
BEGIN;
DROP TABLE IF EXISTS poll_votes;
DROP TABLE IF EXISTS polls;
DROP TABLE IF EXISTS shares;
DROP TABLE IF EXISTS saved_groups;
DROP TABLE IF EXISTS app_meta;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS stripe_events;
DROP TABLE IF EXISTS app_settings;
DROP INDEX IF EXISTS users_discord_id_idx;
DROP INDEX IF EXISTS users_stripe_customer_idx;
DROP INDEX IF EXISTS users_vanity_lower_idx;
ALTER TABLE kofi_transactions DROP COLUMN IF EXISTS claimed_at;
ALTER TABLE users DROP COLUMN IF EXISTS billing_status;
ALTER TABLE users DROP COLUMN IF EXISTS cancel_at_period_end;
DELETE FROM schema_migrations WHERE name = '002_retrofit.sql';
COMMIT;
