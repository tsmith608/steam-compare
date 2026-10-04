# Analytics, funnel and owner reporting

**Goal from the brief:** the business can answer *"Where are users dropping out?"* without opening five tools.
**Answer:** first-party events in our own Postgres → an owner page at **`/admin`** → the same numbers in **Discord every Monday**. Google Analytics stays for traffic overviews only.

## 1. How it works

```
browser ── track(name, props) ──► POST /api/events ─┐
                                                    ├──► events table (Postgres) ──► /admin  (live, owner-only)
server ── recordEvent(name, props, ctx) ────────────┘                           └──► /api/cron/weekly → Discord (Mon)
                                                                                └──► /api/cron/daily → alert only if broken
```

| Piece | File |
|---|---|
| Event list (anything else is dropped), server-only events, prop sanitising | `src/lib/analytics.js` |
| Browser helper: `track()`, anonymous id, first-touch attribution, context for server-recorded events | `src/lib/track.js` |
| Page views (`/` and `/upgrade`), click tracking via `data-track`, uncaught errors | `src/components/AnalyticsBoot.jsx` |
| Ingest endpoint (rate-limited, 8 KB, max 20 events per call, rejects server-only names) | `src/app/api/events/route.js` |
| Aggregate queries (funnel, sources, features, failures, errors, billing, MRR from Stripe) | `src/lib/metrics.js` |
| Weekly report text | `src/lib/report.js` |
| Owner page (gated by `ADMIN_STEAM_IDS`) | `src/app/admin/page.jsx` |
| Table + indexes | `db/migrations/002_retrofit.sql` (`events`) |

### What is stored (and what never is)

`events(id, ts, name, anon_id, path, ref_domain, utm_source, utm_medium, utm_campaign, props jsonb)`

- **`anon_id`** is a random UUID kept in the visitor's `localStorage` (`wbp.anon`). No cookie, and it isn't linked to a Steam account.
- **`path`** never has a query string, and any run of 8+ digits becomes `:id`, so Steam IDs never reach the table.
- **`ref_domain`** holds the referrer's hostname only.
- **UTM values** are the first touch of the tab session.
- **`props`** holds at most 12 keys of lowercase letters. Values are numbers, booleans or strings of up to 80 characters; strings containing 8+ digits are dropped.
- **Never stored:** IP addresses, Steam IDs, display names, emails or user agents.
- **Retention:** the daily cron deletes events older than 400 days, matching "13 months" in `/privacy`.
- **Server-only events** can't be faked from a browser: `comparison_succeeded`, `account_signed_in`, `checkout_started`, `checkout_succeeded`, `subscription_canceled`, `payment_failed`, `discord_linked` and `server_error`.

## 2. Event taxonomy

| Event | Recorded by | When | Props |
|---|---|---|---|
| `landing_viewed` | browser | Homepage view | — |
| `compare_cta_clicked` | browser | Compare form submitted (before validation) | `location`: hero \| compact |
| `profile_entered` | browser | A profile field is filled | `position` |
| `comparison_started` | browser | Form submit (`entry: form`), or results opened from a link, the bot, a saved/recent group (`entry: link`) or the demo (`entry: demo`). The form→results hand-off is counted once. | `players`, `entry`, `signed_in` |
| `comparison_succeeded` | **server** | `/api/compare` returned results | `players`, `shared`, `union_games`, `private_count`, `demo`, `signed_in`, `via`: web \| discord_bot |
| `comparison_failed` | server | `/api/compare` refused or failed | `code` (`need_two`, `bad_profiles`, `duplicates`, `plan_limit`, `private_profiles`, `steam_unavailable`, `steam_rate_limited`, `config`), `players`, `via` |
| `demo_viewed` | browser | Example comparison opened | `location`: form \| results |
| `filter_used` · `sort_used` · `search_used` | browser | Results toolbar | `filter` / `sort` |
| `game_opened` | browser | Store page or `steam://run` launch | `via`: store \| launch \| roulette |
| `roulette_spun` | browser | Spin | `from`: header \| toolbar \| again \| poll |
| `shortlist_created` | browser | First game starred | — |
| `poll_created` | browser | Vote link created | `options` |
| `poll_voted` | server | Vote saved | `yes_count`, `vetoed` |
| `result_shared` | browser | Link copied, native share, Discord copy, vote link sent | `channel`: link \| native \| discord_copy \| poll_link \| poll_discord \| roulette_copy |
| `share_viewed` | browser | Someone opened `/s/…` or `/poll/…` | — |
| `group_saved` | server | Saved group created | `players`, `tier` |
| `account_signed_in` | server | Steam sign-in completed | — |
| `premium_viewed` | browser | `/upgrade` view | — |
| `checkout_started` | **server** | Stripe Checkout session created (not just a click) | `tier`, `interval` |
| `checkout_succeeded` · `subscription_canceled` · `payment_failed` | server | Stripe webhook | `tier` / — / `attempt` |
| `discord_cta_clicked` | browser | "Add the bot" / "Join our Discord" links (`data-track`) | `location` |
| `discord_linked` | server | Discord account linked | — |
| `deal_clicked` | browser | Store link in "one copy away" | `store`, `sponsored` |
| `client_error` · `server_error` | browser · server | Uncaught error (max 3 per page view) · `logServerError()` | `message`, `page` · `source` |

**Adding an event:** add the name to `EVENT_NAMES` (and to `SERVER_ONLY_EVENTS` if only the server should send it), then call `track("name", { small: "enum" })` in a component, `recordEvent()` on the server, or put `data-track="name" data-track-location="where"` on any link — including links in server components.

## 3. The funnel

| Step | Event | Counting |
|---|---|---|
| 1. Visited the homepage | `landing_viewed` | unique browsers |
| 2. Started a comparison | `comparison_started` | events (all entries) |
| 3. Got results | `comparison_succeeded` with `via = web` | events |
| 4. Shared or sent a vote | `result_shared` | events |
| 5. Started checkout | `checkout_started` | events |
| 6. Became Premium | `checkout_succeeded` | events |

Comparisons are labelled `via = discord_bot` when the request carries the bot's `BOT_API_KEY` or its `WeBothPlayBot` User-Agent (`bot/utils/api.js`); everything else is `web`.

`/admin` and the weekly report show these as **volumes per step**. People who arrive from a shared link or the bot skip step 1, so step 2 can be larger than step 1 — that is normal. For a strict "of the people who landed, how many…" view, use query **B** below. Discord bot comparisons are reported on their own line.

**What "healthy" looks like (starting targets, to be replaced with real baselines after 4 weeks):** started → results ≥ 85% (lower means Steam/privacy failures; see query C); results → shared ≥ 10%; daily cron silent.

## 4. Query cookbook

Run these in the Supabase SQL editor (read-only use; none of them write).

**A. Funnel volumes, last 7 days**
```sql
SELECT name, COUNT(*) AS events, COUNT(DISTINCT anon_id) AS browsers
FROM events
WHERE ts >= NOW() - INTERVAL '7 days'
  AND name IN ('landing_viewed','comparison_started','comparison_succeeded','result_shared','checkout_started','checkout_succeeded')
  AND COALESCE(props->>'via','web') = 'web'
GROUP BY name ORDER BY events DESC;
```

**B. Strict per-browser funnel — "of browsers that landed this week, how many got results / shared?"**
```sql
WITH landed AS (
  SELECT anon_id, MIN(ts) AS t0 FROM events
  WHERE name = 'landing_viewed' AND ts >= NOW() - INTERVAL '7 days' AND anon_id IS NOT NULL
  GROUP BY anon_id
), reached AS (
  SELECT l.anon_id,
         BOOL_OR(e.name = 'comparison_started')   AS started,
         BOOL_OR(e.name = 'comparison_succeeded') AS got_results,
         BOOL_OR(e.name = 'result_shared')        AS shared
  FROM landed l LEFT JOIN events e ON e.anon_id = l.anon_id AND e.ts >= l.t0
  GROUP BY l.anon_id
)
SELECT COUNT(*) AS landed,
       COUNT(*) FILTER (WHERE started)     AS started,
       COUNT(*) FILTER (WHERE got_results) AS got_results,
       COUNT(*) FILTER (WHERE shared)      AS shared
FROM reached;
```

**C. Why comparisons fail (website only)**
```sql
SELECT props->>'code' AS reason, COUNT(*) FROM events
WHERE name = 'comparison_failed' AND ts >= NOW() - INTERVAL '7 days' AND COALESCE(props->>'via','web') = 'web'
GROUP BY 1 ORDER BY 2 DESC;
```

**D. How often a private profile hides someone (results still shown)**
```sql
SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE (props->>'private_count')::int > 0) / NULLIF(COUNT(*),0), 1) AS pct_with_hidden_player
FROM events WHERE name = 'comparison_succeeded' AND ts >= NOW() - INTERVAL '30 days';
```

**E. Which sources bring people who actually compare** (first touch per browser)
```sql
WITH firsts AS (
  SELECT DISTINCT ON (anon_id) anon_id, COALESCE(utm_source, ref_domain, 'direct') AS source
  FROM events WHERE ts >= NOW() - INTERVAL '30 days' AND anon_id IS NOT NULL
  ORDER BY anon_id, ts
)
SELECT f.source, COUNT(DISTINCT f.anon_id) AS browsers,
       COUNT(DISTINCT e.anon_id) AS got_results,
       ROUND(100.0 * COUNT(DISTINCT e.anon_id) / COUNT(DISTINCT f.anon_id), 1) AS pct
FROM firsts f
LEFT JOIN events e ON e.anon_id = f.anon_id AND e.name = 'comparison_succeeded'
GROUP BY 1 ORDER BY browsers DESC LIMIT 15;
```

**F. Entry points — form vs shared links vs demo**
```sql
SELECT props->>'entry' AS entry, COUNT(*) FROM events
WHERE name = 'comparison_started' AND ts >= NOW() - INTERVAL '7 days' GROUP BY 1 ORDER BY 2 DESC;
```

**G. Decision tools per 100 results** (is the "decide" half being used?)
```sql
WITH r AS (SELECT COUNT(*)::numeric n FROM events WHERE name='comparison_succeeded' AND ts >= NOW() - INTERVAL '7 days' AND COALESCE(props->>'via','web')='web')
SELECT e.name, ROUND(100 * COUNT(*) / NULLIF((SELECT n FROM r),0), 1) AS per_100_results
FROM events e
WHERE e.ts >= NOW() - INTERVAL '7 days' AND e.name IN ('roulette_spun','shortlist_created','poll_created','poll_voted','result_shared','filter_used','game_opened')
GROUP BY e.name ORDER BY 2 DESC;
```

**H. Share loop** — how many shared pages are opened per share, and how many link-entry comparisons follow
```sql
SELECT
  COUNT(*) FILTER (WHERE name = 'result_shared') AS shares,
  COUNT(*) FILTER (WHERE name = 'share_viewed')  AS share_views,
  COUNT(*) FILTER (WHERE name = 'comparison_started' AND props->>'entry' = 'link') AS link_comparisons
FROM events WHERE ts >= NOW() - INTERVAL '7 days';
```

**I. TikTok / campaign attribution** (links carry `utm_source=tiktok`; see §6)
```sql
SELECT utm_campaign, COUNT(DISTINCT anon_id) AS browsers,
       COUNT(*) FILTER (WHERE name = 'comparison_succeeded') AS results
FROM events WHERE utm_source = 'tiktok' AND ts >= NOW() - INTERVAL '30 days'
GROUP BY 1 ORDER BY browsers DESC;
```
`comparison_succeeded` carries the same `utm_*` as the browser that ran it because the results page sends its context with the request.

**J. Checkout conversion**
```sql
SELECT props->>'tier' AS tier,
  COUNT(*) FILTER (WHERE name='checkout_started')   AS started,
  COUNT(*) FILTER (WHERE name='checkout_succeeded') AS paid
FROM events WHERE ts >= NOW() - INTERVAL '30 days' AND name IN ('checkout_started','checkout_succeeded')
GROUP BY 1;
```

**K. Errors this week**
```sql
SELECT name, COALESCE(props->>'source', props->>'page') AS where_, props->>'message' AS message, COUNT(*)
FROM events WHERE name IN ('server_error','client_error') AND ts >= NOW() - INTERVAL '7 days'
GROUP BY 1,2,3 ORDER BY 4 DESC LIMIT 20;
```

## 5. Owner surfaces

| Surface | What | Setup |
|---|---|---|
| **`/admin`** | MRR, active/past-due subscriptions, website and bot comparisons, visit → results, funnel chart (with table view), top sources, feature usage, failure reasons, errors — last 7 days vs the week before | Set `ADMIN_STEAM_IDS` to your SteamID64 (comma-separated for several) and sign in through Steam |
| **Weekly report** (Mondays 14:17 UTC) | Same numbers + "Needs a look" (≥40% week-over-week swings on steps with ≥20 events, started → results under 60%, failed payments) | `OWNER_REPORT_WEBHOOK_URL` (or `OWNER_ALERT_WEBHOOK_URL`) = a Discord channel webhook; `CRON_SECRET`. Preview: `curl -H "Authorization: Bearer $CRON_SECRET" "https://webothplay.com/api/cron/weekly?dry=1"` |
| **Daily check** (13:07 UTC) | Silent unless: DB unreachable, Steam key failing, comparisons < 40% of the 7-day average, Steam/server failures > 25% of successes, ≥ 25 server errors | `OWNER_ALERT_WEBHOOK_URL`, `CRON_SECRET` |
| **Instant alerts** | Stripe webhook failures, Ko-fi webhook misconfiguration, Steam key/config errors (throttled to one per 30 min per kind) | `OWNER_ALERT_WEBHOOK_URL` |
| **`/api/health`** | `{ ok, checks }` — DB, Steam key set, payments set, session secret set, daily cron ran in last 36 h. 503 when not ok | Point a free uptime monitor at it (NEEDS_FROM_OWNER) |
| **Google Analytics** | Traffic overview, countries, devices | `NEXT_PUBLIC_GA_ID` (defaults to the existing property). Events are mirrored to GA when it's loaded |

Both crons run once a day at most, which fits Vercel's Hobby-plan cron limit (check the Vercel dashboard after deploy: *Settings → Cron Jobs*).

## 6. Link conventions (so sources are readable)

| Where | Link |
|---|---|
| TikTok bio (default) | `https://webothplay.com/?utm_source=tiktok&utm_medium=social&utm_campaign=bio` |
| TikTok series, post or event weeks | same, with `utm_campaign=` a series slug, a post id (`w07-fri`) or an event slug — full table in `marketing/tiktok/CTA_LIBRARY.md` §7 |
| YouTube Shorts / Instagram Reels | `?utm_source=youtube` or `instagram` `&utm_medium=social&utm_campaign=bio` |
| Discord bot result links | added automatically: `utm_source=discord&utm_medium=bot` (`bot/utils/api.js`) |
| Discord server posts / community | `?utm_source=discord&utm_medium=community` |
| Reddit / forum replies (only where self-links are allowed) | `?utm_source=reddit&utm_medium=comment&utm_campaign=<subreddit>` |

Keep values lowercase with no spaces; anything else is stripped on ingest.

## 7. What isn't measured (on purpose or not yet)

- TikTok and Search Console numbers aren't pulled automatically (no API keys; TikTok's analytics API needs app review). Log them weekly in the tracker in [OWNER_OPERATIONS_GUIDE.md](OWNER_OPERATIONS_GUIDE.md).
- No session replay, heatmaps or fingerprinting.
- Ad blockers that block `/api/events` will hide some browsers; server-side events (results, checkout, payments) are unaffected.
