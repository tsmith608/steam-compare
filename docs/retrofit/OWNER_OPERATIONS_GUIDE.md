# Owner operations guide

How to run WeBothPlay: **about 30 minutes a week for the site**, plus **about 4 hours a week for TikTok** at the baseline cadence (4 posts). Drop to the 3-post floor for about 3 hours. Everything else is automatic. One-time setup is in [NEEDS_FROM_OWNER.md](NEEDS_FROM_OWNER.md); metrics definitions are in [ANALYTICS.md](ANALYTICS.md).

## 1. The weekly routine

| When | Do | Time |
|---|---|---|
| Monday morning | Read the **weekly report** in your Discord alert channel. If "Needs a look" says *nothing*, you're done with the product side | 5 min |
| | Open **`/admin`** only if a number looks off: the funnel shows *where* people drop, "Why comparisons failed" shows *why* | 5 min |
| | Log the week in the tracker below (TikTok and Search Console aren't connected automatically) | 10 min |
| | **TikTok review**: follow [WEEKLY_OPTIMIZATION_PLAYBOOK.md](../../marketing/tiktok/WEEKLY_OPTIMIZATION_PLAYBOOK.md) (double down / iterate / retire), confirm any event dates | 30 min |
| One batch session | Render, record and assemble the week's posts, then schedule them ([CONTENT_STRATEGY.md](../../marketing/tiktok/CONTENT_STRATEGY.md) §7.2; 5-minute review per video) | ~2 h |
| Daily | Reply to comments by hand (never automated) | 10–15 min |
| | Skim the Stripe dashboard for disputes (Stripe emails you about those anyway) | 2 min |

Everything else is **push-based**: you only hear from the site when something needs you.

### Weekly tracker (copy into a sheet)

| Week | Visitors (report) | Results | Visit→results % | Shared | New Premium | MRR | TikTok views (7d) | Profile visits | Bio-link clicks (`utm_source=tiktok` browsers) | Search clicks (GSC) | Notes / what changed |
|---|---|---|---|---|---|---|---|---|---|---|---|

## 2. What watches the site for you

| Watcher | Fires when | Where it goes |
|---|---|---|
| **Daily check** (13:07 UTC, Vercel Cron → `/api/cron/daily`) | DB unreachable · Steam key failing · comparisons < 40% of the 7-day average · Steam/server failures > 25% of successes · ≥ 25 server errors/day | Discord (`OWNER_ALERT_WEBHOOK_URL`) — silent when fine |
| **Instant alerts** | Stripe webhook errors · missing Stripe/Ko-fi secrets · Steam key missing/rejected · Steam rate-limiting (at most one per kind every 30 min per server instance) | Discord |
| **Weekly report** (Mon 14:17 UTC → `/api/cron/weekly`) | Always | Discord (`OWNER_REPORT_WEBHOOK_URL`, else the alert webhook) |
| **Uptime monitor** (you set it up) | `/api/health` returns 503 or times out | Your phone |
| **Retention** | Daily: deletes analytics events > 400 days, processed Stripe event ids > 90 days, stale pending upgrades > 60 days | — |

Preview the report any time:
```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" "https://webothplay.com/api/cron/weekly?dry=1" | jq -r .text
```

## 3. Environment variables (reference)

Set in *Vercel → Settings → Environment Variables*; changes need a redeploy. The commented template is [`.env.example`](../../.env.example).

| Group | Variables |
|---|---|
| Required | `DATABASE_URL`, `STEAM_API_KEY`, `SESSION_SECRET`, `CRON_SECRET` |
| Owner tools | `ADMIN_STEAM_IDS`, `OWNER_ALERT_WEBHOOK_URL`, `OWNER_REPORT_WEBHOOK_URL` |
| Payments | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_HACKER`, `STRIPE_PRICE_ID_PRO_ANNUAL`, `STRIPE_PRICE_ID_HACKER_ANNUAL`, `STRIPE_AUTOMATIC_TAX`, `KOFI_WEBHOOK_VERIFICATION_TOKEN` |
| Bot ↔ site | `BOT_API_KEY`, `DISCORD_LINK_SECRET` (same values in `bot/.env`) |
| Public | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_DISCORD_INVITE_URL`, `NEXT_PUBLIC_DISCORD_BOT_INSTALL_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_AFFILIATE_HUMBLE` / `_GMG` / `_FANATICAL` |
| Dev only | `STEAM_MOCK=1` |

**Rule:** anything starting with `NEXT_PUBLIC_` is visible to every visitor. Never put a key there.

## 4. Deploying a change

1. Work on a branch → push → Vercel builds a **preview URL** automatically.
2. Locally or in CI: `npm ci && npm run lint && npm test && npm run build` (and `npm run test:e2e` for UI changes — see §8).
3. Check the preview: homepage → example comparison → a real comparison → `/upgrade`.
4. Merge to `main` → production deploy.
5. If the change has a migration: `DATABASE_URL=… npm run db:migrate` **before** merging (migrations must stay additive so the old deploy keeps working against the new schema).

**Rollback:** *Vercel → Deployments → pick the last good one → Promote to Production* (takes seconds). Don't roll back the database unless a migration itself is broken; `db/rollback/` has the manual down-script for 002.

## 5. Incident runbook

| Symptom | Likely cause | Fix |
|---|---|---|
| Alert: *Steam API key missing or rejected* / daily check: probe failed | Key revoked, typo, or Steam outage | Check <https://steamstat.us>. If Steam is up, re-check `STEAM_API_KEY` in Vercel, redeploy |
| Alert: *Steam is rate-limiting* | 100,000 calls/day quota or a burst | Usually clears by itself. If it repeats daily, a bot or scraper may be hammering `/api/compare` — check Vercel logs for one IP; the per-IP limit is 20/min |
| Comparisons dropped sharply | Deploy bug, Steam outage, DB issue | Open `/admin` → "Why comparisons failed". If errors started with a deploy, roll back (§4) |
| `/api/health` 503 | DB down or env missing | Supabase status page; check `DATABASE_URL`; health JSON shows which check failed |
| Alert: *Stripe webhook failed* | Code error or DB down while processing | Stripe retries for 3 days automatically. Fix the cause, then *Stripe → Webhooks → event → Resend* if needed. Processing is idempotent — resending is safe |
| Customer says "I paid but I'm not Premium" | Webhook not delivered / wrong Steam account | Stripe → customer → subscription metadata `steam_id`. Check *Webhooks → recent deliveries*. Resend `customer.subscription.updated`. The user must be signed in with the same Steam account they bought with |
| Customer wants a refund | — | Stripe dashboard → payment → Refund; cancel the subscription there. The webhook downgrades them at period end (or immediately if you cancel immediately) |
| Bot offline | Server/pm2 crash, token reset | `pm2 logs`, `pm2 restart all`. If the token was reset, update `DISCORD_TOKEN` in `bot/.env` |
| Bot commands error "unauthorized" | `BOT_API_KEY` differs between bot and site | Make them identical, restart bot / redeploy site |
| Someone reports a security issue | — | Rotate the affected secret first, then fix. Contact address: `/contact` |

## 6. Backups & data

- **Database:** Supabase's backups depend on your plan — check *Database → Backups*. Independently, keep a monthly dump: `pg_dump "$DATABASE_URL" > wbp-$(date +%F).sql` (store it somewhere private, e.g. an encrypted drive).
- **What's in the DB:** user accounts (SteamID, plan, Stripe/Discord ids, profile customisation), saved groups, share links and polls (the group's SteamID64s plus a summary: display names, avatars, counts, a few game titles; votes with the voter's chosen name), cached public store data for games, anonymous analytics events, Ko-fi transactions. **Not stored:** friends' libraries from comparisons (fetched live), IPs, passwords.
- **User deletion request:** cancel any Stripe subscription first, then remove their account, saved groups and any share links/polls that include them; reply within 30 days.
  ```sql
  DELETE FROM saved_groups WHERE owner_steam_id = '<steamid>';
  DELETE FROM shares WHERE '<steamid>' = ANY(steam_ids);
  DELETE FROM polls  WHERE '<steamid>' = ANY(steam_ids);   -- votes go with them (ON DELETE CASCADE)
  DELETE FROM users  WHERE steam_id = '<steamid>';
  ```

## 7. Discord bot operations

- Runs from `bot/` on your own server with pm2 (`bot/.env` from `bot/.env.example`).
- After pulling changes: `cd bot && npm ci && node deploy-commands.js && pm2 restart all`.
- Bot links to the site carry `utm_source=discord&utm_medium=bot`, so bot traffic shows up separately in the report.
- **Verification threshold:** Discord reviews privileged intents once an app reaches 10,000 users (changed 2026-06-10, per the SEO research). The bot uses the GuildMembers intent for the Hacker server perk; the planned replacement is a `/perk activate` command (PRODUCT_OPPORTUNITIES #16).

## 8. Quality checks (what CI should run)

```bash
npm ci
npm run lint          # ESLint (Next.js core-web-vitals rules)
npm test              # unit tests; DB tests run when TEST_DATABASE_URL is set
npm run build
npm run test:e2e      # Playwright: needs a build + STEAM_MOCK=1 (see playwright.config.mjs)
```

## 9. Social workflow (TikTok)

1. **Plan:** `marketing/tiktok/90_DAY_CALENDAR.csv` (open in Sheets). Base posts Mon/Wed/Fri/Sun; reserve and trend slots fill gaps; event rows stay *Blocked* until the date is verified.
2. **Get the files:** they're already rendered in `marketing/renders/posts/`. `INDEX.md` there lists each date's file, caption and hashtags.
3. **Change something?** Edit the bank in `marketing/tiktok/build-calendar.mjs` (or a template) and push. GitHub Actions re-renders every post and commits the new files within about 25 minutes (*Actions → Render TikTok posts*; you can also start it by hand there). Rendering locally (`npm run social:render`) is optional.
4. **Assemble:** in CapCut/TikTok, add the overlay PNGs on your own screen recordings of the site; add music from TikTok's **Commercial Music Library** (business accounts can't use the general library); keep the "Demo data" label on fictional groups.
5. **Post** yourself (or via TikTok's own scheduler). Captions, hashtags (≤ 5) and CTAs are in the CSV.
6. **Log** in the tracker (§1) and adjust per the playbook.

**Never:** buy followers/likes, use engagement bots or unofficial automation, post real people's Steam data without permission, or present demo numbers as a real group.

## 10. Costs to keep an eye on

| Service | Expected | Watch for |
|---|---|---|
| Vercel | Hobby/Pro plan; crons fit Hobby limits | Function execution time if traffic spikes |
| Supabase | Free/Pro | DB size (events table grows ~1 row per user action; retention keeps it bounded) |
| Stripe | ~2.9% + 30¢ per charge (US cards; check your dashboard) | Disputes |
| Steam Web API | Free, 100k calls/day | Quota alerts |
| Bot server | Your VPS/pm2 host | Uptime |
