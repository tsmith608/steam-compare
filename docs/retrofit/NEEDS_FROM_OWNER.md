# What only you can do

Everything else in the retrofit is done in code. These are the items that need your accounts, your money or your legal judgment, in the order to do them. Total ≈ **1.5–2 hours** for the required ones.

Legend: 🔴 do before (or the moment) this ships · 🟠 within the first week · 🟢 optional / when you're ready

---

## 🔴 1. Rotate the two leaked secrets (15 min) — do this first, today

**How it happened:** one-off debugging and migration scripts had the credentials pasted straight into the code, and they were committed and pushed to this **public** repository.
- **The production database connection string, with its password:** first in `setup_db.js` (Feb 15, 2026), then copied into 15 more scripts by Feb 22. Examples: `check_db_users.js`, `migrate_stripe.js`, `scripts/migrate_users.js`, `scripts/add_dashboard_layout.js`.
- **The Steam Web API key:** written as a fallback (`process.env.STEAM_API_KEY || "…"`) in `audit_library.js`, `debug_friend.js` and `resolve_vanity.js` (Feb 19).

Bots scan public GitHub for exactly this, usually within minutes of a push, so treat both as known to others. There's no way to tell from here whether anyone used them; your Supabase logs are the place to look.

These files are deleted on this branch, but **deleting files doesn't remove them from git history**, and `main` still contains them until you merge. **Rotation is the real fix.** A new `npm run check:secrets` step in CI now fails any commit that contains a connection string, API key or token.

1. **Supabase**: go to *Project Settings → Database → Reset database password*. Then update `DATABASE_URL` (and `POSTGRES_URL*` if present) in *Vercel → Settings → Environment Variables*, then redeploy.
   - While there, review *Database → Roles* and the logs for anything you don't recognise.
2. **Steam**: on <https://steamcommunity.com/dev/apikey>, click *Revoke my Steam Web API Key*, then register a new key. Put it in Vercel as `STEAM_API_KEY` and redeploy.
3. **GitHub** (2 min): *Settings → Code security* → turn on **Secret scanning** and **Push protection**. Both are free on public repos. GitHub then blocks pushes that contain known key formats.
4. *(Optional)* Make the repository private (*Settings → General → Danger zone*). That stops further exposure, but it doesn't undo what was already public, so rotate either way.
5. *(Optional)* Rewriting git history isn't required once the secrets are rotated, because rotation makes the old values useless. If you want them gone anyway, use GitHub's guide on removing sensitive data. It force-pushes and breaks existing clones, so it's your call.

## 🔴 2. Set the new environment variables in Vercel (15 min)

*Vercel → Project → Settings → Environment Variables (Production)*. The full list with comments is in [`.env.example`](../../.env.example).

| Variable | What to put | Why |
|---|---|---|
| `SESSION_SECRET` | `openssl rand -hex 32` | Signs login cookies (without it the app falls back to a secret stored in the DB) |
| `CRON_SECRET` | `openssl rand -hex 24` | Lets Vercel Cron call the daily check / weekly report |
| `ADMIN_STEAM_IDS` | your SteamID64 | Unlocks `/admin` |
| `OWNER_ALERT_WEBHOOK_URL` | a Discord webhook (*Server Settings → Integrations → Webhooks → New*) in a private channel | Alerts + Monday report |
| `BOT_API_KEY` | `openssl rand -hex 24` (same value in `bot/.env`) | Bot-only endpoints stop being public |
| `DISCORD_LINK_SECRET` | `openssl rand -hex 24` (same value in `bot/.env`) | Signs "link your Discord" links |
| `KOFI_WEBHOOK_VERIFICATION_TOKEN` | from Ko-fi → *Settings → API → Webhooks*, **or** delete the webhook URL in Ko-fi if you no longer use Ko-fi | The Ko-fi webhook now refuses everything without it |

Then redeploy, and open `https://webothplay.com/api/health`. It should return `"ok": true`, with `sessionSecretConfigured: true`.

## 🔴 3. Apply the database migration (10 min)

The migration is **additive only**: 8 new tables, 3 new nullable columns and plain indexes. Nothing is changed or deleted, and the old code keeps working against it. It was tested locally with migrate → rollback → re-migrate.

```bash
# from your project folder, with the NEW (rotated) connection string in .env.local
pg_dump "postgresql://…your connection string…" > backup-before-retrofit.sql   # or confirm Supabase → Database → Backups has a recent one
npm run db:migrate        # uses DATABASE_URL from .env.local and prints which database it's changing
```

`pg_dump` comes with the PostgreSQL client tools. Each migration runs in a transaction, so a failure leaves the database as it was. If `npm run db:migrate` can't connect, it says why: usually the password (URL-encode special characters) or, on Supabase, the direct connection (host starting with `db.`), which needs IPv6. Use the **Session pooler** string from *Supabase → Connect* instead.

**Just reset the database password and the pooler still says it's wrong?** Supabase's pooler caches passwords and can keep rejecting a new one for a few minutes after a reset; resetting again restarts that wait. When the pooler rejects the password, `npm run db:migrate` tries the same password on the direct connection, which skips the pooler. If that works, it migrates over it. If the direct connection rejects the password too, the password itself is wrong. If it can't reach the direct connection (no IPv6), it says so. Supabase also blocks an IP after repeated wrong passwords: up to 2 minutes on the pooler ("Circuit breaker open"), or 30 minutes on the direct connection ("Connection refused"), which you can lift early with *Database Settings → Unban IP*.

**Can't connect from your machine at all?** Run `npm run db:sql`, open the `db-migrate.sql` it writes, copy everything into *Supabase → SQL Editor → New query* and click **Run**. Same migrations, one transaction, and it records what ran so `npm run db:migrate` skips them later. (Vercel still needs a working `DATABASE_URL` for the site itself.)

- If you ever need to undo the schema (you shouldn't), use `db/rollback/002_retrofit.down.sql`. Read its header first.
- To undo the **app**, use *Vercel → Deployments → previous → Promote*. The database can stay as it is.

## 🔴 4. Stripe (15 min)

The code is ready; only you can change the Stripe settings.

1. *Developers → Webhooks* → your endpoint `https://webothplay.com/api/webhooks/stripe`:
   - Set the **API version to `2026-01-28.clover`**.
   - Subscribe to: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`, `invoice.paid`, `invoice.payment_succeeded` and `invoice.payment_failed`.
   - If the signing secret changes, update `STRIPE_WEBHOOK_SECRET`.
2. *Settings → Billing → Customer portal*:
   - Allow cancellation at period end.
   - Allow switching between your Pro and Hacker prices.
   - Allow payment-method updates and invoice history.
3. *Settings → Billing → Subscriptions and emails*:
   - Smart Retries on, then cancel after the last retry.
   - Turn on emails for failed payments and expiring cards.
4. Send a **test webhook** from the dashboard. The endpoint should answer 200, and a failure alert should *not* arrive in Discord.

Step-by-step context is in [MONETIZATION_AUDIT.md §4](MONETIZATION_AUDIT.md).

## 🔴 5. Update the Discord bot on its server (10 min)

`bot/node_modules` used to be committed. It's now ignored, so **pulling this branch deletes those files on the bot's server**. Reinstall right after pulling:

```bash
cd bot && git pull && npm ci
cp .env.example .env   # first time only; fill DISCORD_TOKEN, DISCORD_CLIENT_ID, BOT_API_KEY, DISCORD_LINK_SECRET
node deploy-commands.js
pm2 restart all        # or however the bot is run
```

## 🔴 6. Merge and deploy

Merge `claude/new-session-dudnen` into `main` (or open the Vercel preview of the branch first and click around). Then, after deploy:

- Open `/`, run the example comparison, then compare two real profiles.
- Sign in through Steam and open `/admin`.
- Check that `/api/health` returns ok.

*Vercel → Settings → Cron Jobs* should list two jobs.

---

## 🟠 Within the first week

| # | Item | Time | Notes |
|---|---|---|---|
| 7 | **Uptime monitor** on `https://webothplay.com/api/health` (UptimeRobot, Better Stack — free tiers) alerting to your phone/Discord | 5 min | The health check returns 503 when the DB or Steam key is missing |
| 8 | **Permanent Discord invite**: in your community server, create an invite set to *Never expire*. Put it in `NEXT_PUBLIC_DISCORD_INVITE_URL` | 2 min | The current fallback `discord.gg/uBUYgE75` looks like a temporary invite |
| 9 | **Support email**: create an alias (e.g. `support@webothplay.com` via your domain host or Cloudflare Email Routing) → `NEXT_PUBLIC_SUPPORT_EMAIL` | 10 min | Otherwise your personal address (already on the old contact page) stays public |
| 10 | **Google Search Console**: verify the domain and submit `https://webothplay.com/sitemap.xml` | 10 min | Needed to see search queries; log weekly numbers per the ops guide |
| 11 | **Legal read-through** of `/terms` and `/privacy` | 30 min | Rewritten to match what the app now does (Stripe, analytics, cookies, US storage, 13-month retention). I'm not a lawyer; if you sell to the EU/UK, get them checked |
| 12 | **Tax decision**: Stripe Tax (register where required, then `STRIPE_AUTOMATIC_TAX=1`) **or** Stripe Managed Payments (Stripe acts as merchant of record) | 30 min | Depends on where your customers are; see the monetization research §Stripe |
| 13 | **TikTok account**: claim `@webothplay` (or similar) and set the bio link to `https://webothplay.com/?utm_source=tiktok&utm_medium=social&utm_campaign=bio` | 15 min | Posts are published by you, under your identity. The assets and calendar are ready in `marketing/` |
| 14 | Before any **event post** in the calendar (Next Fest, sales, Game Awards), check the date at <https://partner.steamgames.com/doc/marketing/upcoming_events> and update the row's status | 2 min each | Event dates couldn't be verified during research |

## 🟢 Optional, when you're ready

| # | Item | Notes |
|---|---|---|
| 15 | **Annual plans**: create yearly Prices in Stripe ($29.99 Pro / $79.99 Hacker, or your own numbers; then edit `PRICING` in `src/lib/plans.js`) → `STRIPE_PRICE_ID_PRO_ANNUAL`, `STRIPE_PRICE_ID_HACKER_ANNUAL` | The toggle appears on `/upgrade` automatically |
| 16 | **Affiliate stores**: apply to Humble (Impact), Green Man Gaming and Fanatical. Once approved, paste deep-link templates containing `{url}` into `NEXT_PUBLIC_AFFILIATE_*` | Links appear with `rel="sponsored"` and a disclosure. There is no Steam affiliate program |
| 17 | **Official Steam sign-in button**: swap the text button for Valve's "Sign in through Steam" image if you prefer (check Valve's current branding terms) | Current wording already follows Steam's |
| 18 | **Per-server Discord plan** (pricing decision) | See MONETIZATION_AUDIT §5. Grandfather current Hackers if you change the server perk |
| 19 | **Discord user-install**: enable *User Install* in the Developer Portal (*Installation*) if you want `/compare` usable outside servers | Code changes for command contexts are a next-sprint item |

---

### What was deliberately *not* done without you

- No billing settings changed in Stripe, no prices created and no customers touched.
- No production database writes. The migration is ready for you to run.
- No DNS, domain or hosting changes. No TikTok, Discord or Reddit posts under your name.
- No git history rewrite. Rotation (step 1) is the real fix.
