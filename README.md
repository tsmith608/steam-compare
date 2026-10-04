# WeBothPlay

**What are we playing tonight?** Paste your friends' Steam profiles and see every game your whole group already owns. Then decide: filter by co-op or couch play, spin the roulette, or send a vote link where everyone gets one veto.

Live at [webothplay.com](https://webothplay.com). Free for groups of up to 8; Premium adds bigger groups, saved groups and Discord bot extras.

## Features

- Compare 2–16 Steam libraries from profile links, SteamID64s or custom URL names (several pasted at once), or pick friends after signing in through Steam.
- Results at a shareable URL: everyone owns · one copy away · nobody's played · only one owns · shared wishlists.
- Search, "best for tonight" sort, and filters built on Steam's own tags (co-op, online co-op, couch / Remote Play, PvP, controller, free).
- Roulette, a shortlist that becomes a group vote (one veto each), share pages with rendered preview cards, and `steam://run` launch.
- Private-profile handling: everyone else's results still show, with a fix message to send.
- Discord bot (`bot/`): `/compare`, `/link` and Premium commands.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 3 · PostgreSQL (`pg`) · Stripe · Steam Web API + OpenID · Vercel (hosting + cron) · Vitest · Playwright + axe-core · Satori/resvg (OG images and the social renderer).

## Run it locally

```bash
npm ci
cp .env.example .env.local          # fill DATABASE_URL at minimum
npm run db:migrate                  # creates/updates the schema (reads .env.local; additive, idempotent)
npm run dev:mock                    # fixture libraries, no Steam key needed
# or: npm run dev                   # real Steam data (needs STEAM_API_KEY)
```

Open <http://localhost:3000> and try **See an example first**. In mock mode, the demo players `76561190000000001`–`…004` (and `…005`, a private profile) work as inputs.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `dev:mock` | Development server (mock mode uses fixture libraries) |
| `npm run build` / `start` | Production build / server |
| `npm run lint` | ESLint (Next.js core-web-vitals config) |
| `npm test` | Unit tests; DB integration tests also run when `TEST_DATABASE_URL` is set |
| `npm run test:e2e` | Playwright end-to-end + accessibility tests (after `npm run build`; needs Postgres, see `playwright.config.mjs`) |
| `npm run db:migrate` | Apply `db/migrations/*.sql` to the database in `.env.local` (rollback script in `db/rollback/`) |
| `npm run social:calendar` | Rebuild the 90-day TikTok calendar and renderer data |
| `npm run social:render` | Render TikTok posts locally. Normally GitHub Actions does it and commits them to `marketing/renders/posts/` |
| `npm run check:secrets` | Fail if any tracked file contains a credential (also runs in CI) |

CI (`.github/workflows/ci.yml`) runs a secret scan, lint, migrations, unit + DB tests, build and E2E on every pull request. `.github/workflows/social-render.yml` re-renders the TikTok posts whenever the calendar or templates change.

## Configuration

Every environment variable is listed with comments in [`.env.example`](.env.example) (and [`bot/.env.example`](bot/.env.example) for the bot). Secrets stay server-side; only `NEXT_PUBLIC_*` values reach the browser.

## Docs

| | |
|---|---|
| Running the business (≈30 min/week + TikTok) | [docs/retrofit/OWNER_OPERATIONS_GUIDE.md](docs/retrofit/OWNER_OPERATIONS_GUIDE.md) |
| What needs the owner (keys, settings) | [docs/retrofit/NEEDS_FROM_OWNER.md](docs/retrofit/NEEDS_FROM_OWNER.md) |
| What changed in the 2026 retrofit, and why | [docs/retrofit/FINAL_REPORT.md](docs/retrofit/FINAL_REPORT.md) |
| Analytics, funnel and SQL | [docs/retrofit/ANALYTICS.md](docs/retrofit/ANALYTICS.md) |
| Design system | [docs/retrofit/DESIGN_SYSTEM.md](docs/retrofit/DESIGN_SYSTEM.md) |
| TikTok system | [marketing/tiktok/](marketing/tiktok/) · [marketing/renderer/](marketing/renderer/) |

## Notes

- Powered by Steam. WeBothPlay is not affiliated with or endorsed by Valve Corporation. Steam is a trademark of Valve Corporation.
- Fonts (Archivo, Inter, JetBrains Mono) are SIL Open Font License 1.1. Social emoji are Twemoji (CC-BY 4.0).
