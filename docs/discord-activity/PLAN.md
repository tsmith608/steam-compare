# WeBothPlay as a Discord Activity: research and plan

*Researched 5 October 2026.* `docs.discord.com` is blocked from the build machine, so the facts come from:
- Discord's docs source (`github.com/discord/discord-api-docs`, commit `c43598d`, 2 Oct 2026);
- the SDK package itself (`@discord/embedded-app-sdk` 2.5.0, May 2026), discord.js 14.27.0 and discord-api-types 0.38.56, read directly;
- search results, cited inline.

Anything inferred rather than read is marked *(unverified)*.

## In short

- **What it is.** An Activity is our web app running inside Discord, launched from a voice call, a channel or a DM. Everyone who joins sees the same instance, and the app knows who's there. That lines up with what WeBothPlay does: no pasting profile links, everyone in the call is the group, and the spin and the vote happen live for everyone at once.
- **Build it inside the current Next.js app** as an `/activity` route, on the same Discord application as the bot. That shares the comparison engine, the results UI, the voting tables and the Discord↔Steam links the bot already stores.
  - **Estimate:** about **2½–3½ weeks** of focused work to a shippable multiplayer version (phases 0–3 below).
  - **Fallback:** if Next.js misbehaves on iOS (a known open issue), the fallback is a small separate page calling the same APIs.
- **Our code has three blockers, all fixable:**
  1. The site refuses to be embedded (`X-Frame-Options: DENY`).
  2. Sign-in is a cookie that doesn't work inside Discord's frame.
  3. Rate limits are per IP, and all Activity traffic may arrive from Discord's proxy.
- **The bot will break unless we fix it first.** Enabling Activities adds a "Launch" command that `bot/deploy-commands.js` would overwrite. Fix the script before switching Activities on.
- **The business decision: Discord's price-parity rule.** Once the app is verified, and if you're in the US, UK or EU, Pro and Hacker must also be buyable through Discord at the same price or lower. This already applies to the bot. The recommendation: keep Stripe, add Discord subscriptions, and use one tier check. Details in [Monetization](#monetization-and-discords-rules).
- **Who can use it before verification:** only your team and up to 50 testers can launch it, in servers with fewer than 25 members. That's fine for building. Launching publicly needs verification.

## How Discord Activities work

- **Hosting.** The app runs in an iframe at `https://<client_id>.discordsays.com`, with `instance_id`, `frame_id`, `platform`, `guild_id` and `channel_id` in the query string.
  - Discord's proxy forwards requests to our site according to **URL mappings** set in the Developer Portal, e.g. `/` → `webothplay.com`.
  - Since mid-2025 the old `/.proxy/` path prefix is optional, so normal relative paths (`/api/...`, `/_next/...`) work.
  - Source: SDK; Discord changelog.
- **Lockdown.** Discord's Content Security Policy blocks every other origin: images, scripts, fonts, fetch, WebSockets.
  - To reach another host (Steam's image CDN, say), add a mapping such as `/steam-img` → `cdn.cloudflare.steamstatic.com`.
  - The SDK's `patchUrlMappings()` then rewrites `fetch`, `XMLHttpRequest`, `WebSocket` and, optionally, `src` attributes. It doesn't rewrite `srcset` or CSS `url()`.
  - Our response headers pass through the proxy. A community project's `X-Frame-Options: DENY` gave a blank white Activity.
  - Source: SDK; docs "networking" guide; github.com/genius0412/dsim/pull/82.
- **Identity.**
  1. The client calls `commands.authorize({ scope: ['identify'] })` and gets a code.
  2. Our server exchanges it at `https://discord.com/api/oauth2/token` with the app's client secret.
  3. The client calls `commands.authenticate({ access_token })`.
  
  The server should work out the Discord user itself (`GET /users/@me` with that token) rather than trust the client. Source: SDK README; Discord's starter repo.
- **The shared instance.** Everyone who joins one launch gets the same `instanceId`.
  - `commands.getInstanceConnectedParticipants()` and the `ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE` event say who's in.
  - The server can check membership with `GET /applications/{app_id}/activity-instances/{instance_id}` using the bot token. The bot already has one.
  - Source: SDK; docs "multiplayer experience" guide.
- **Real-time sync is bring-your-own.** Discord's examples run a WebSocket server, such as Colyseus, behind a URL mapping. Vercel functions can't hold WebSockets *(unverified)*, so either poll or run sockets next to the bot on Railway.
- **Launching.** Users can start it:
  - from the App Launcher in server text and voice channels, DMs and group DMs, on desktop and mobile;
  - from the rocket button in a call;
  - from the "Launch" Entry Point command that enabling Activities creates (command type `PrimaryEntryPoint = 4`).
  
  A bot command or button can open it directly with the `LAUNCH_ACTIVITY` interaction response (type 12, `interaction.launchActivity()` in discord.js). It has to be the first response, so no `deferReply` before it. With User Install enabled, people can launch it in DMs without adding the app to a server.
- **Platforms.** Web and desktop are on by default. iOS and Android have to be ticked in the Portal. There are orientation locks (portrait, landscape or unlocked; also settable at runtime with `setOrientationLockState`), a picture-in-picture layout, and safe-area CSS variables (`--discord-safe-area-inset-*`).
- **Other useful SDK commands:**
  - `setActivity`: rich presence such as "Picking a game · 39 shared". Needs the `rpc.activities.write` scope.
  - `openExternalLink`: Steam store pages and the Steam linking page. Discord asks the user to confirm.
  - `shareLink` and `openInviteDialog`: invite friends into the instance.
  - `getSkus`, `getEntitlements`, `startPurchase`: Discord payments. Desktop and web only.

## Why it fits WeBothPlay

- **The call is the group.** Nobody pastes profile links. Linked members simply appear.
- **Deciding happens together.** Today a vote means sharing a link and refreshing. In the Activity there's one shared roulette spin and a vote where everyone's veto shows up for everyone.
- **No Steam sign-in inside Discord** for anyone who already ran `/link`. The bot already maps Discord IDs to Steam IDs (`users.discord_id`).
- **Distribution.** The App Launcher, "Playing WeBothPlay" in friends' activity status, and the App Directory.

## What we reuse and what's new

| Piece | Today | In the Activity |
|---|---|---|
| Comparison engine (`runComparison`, `POST /api/compare`) | Website and bot | Reuse as-is. The "viewer" (whose plan applies) is the Discord user's linked Steam account |
| Results UI (`ResultsView`, `Roulette`, `GameCard`, `Sections`) | Website | Reuse. `ResultsView` already takes the comparison as a prop |
| Group vote (`polls`, `poll_votes`, `PollVote`) | Anonymous voter ID, refreshes every 6 s | Reuse, with the Discord user ID as the voter ID and a faster refresh |
| Discord↔Steam links (`users.discord_id`, `/auth/discord`, `/api/discord/link`) | Bot | Identifies linked users. Unlinked users open the existing link page in their browser |
| Plans (`effectiveTier`, Hacker server perk) | Website and bot | Reuse. The perk applies when a Hacker is in the instance |
| Analytics (`recordEvent`, `via`) | `web`, `discord_bot` | Add `activity` |
| **New** | | `/activity` page and SDK start-up; Discord token exchange; per-instance shared state (a table and an endpoint); Discord subscriptions later |

## Changes our code needs

Found while mapping the codebase against the research:

1. **Framing.**
   - Today: `next.config.mjs` sends `X-Frame-Options: DENY` and `frame-ancestors 'none'` on every path, which gives a blank Activity.
   - Fix: leave `/activity` out of that rule and send it `frame-ancestors https://discord.com https://*.discord.com https://*.discordsays.com https://discordapp.com` instead. Everywhere else stays locked.
2. **Sign-in.**
   - Today: the session is a `SameSite=Lax` cookie, which doesn't reach our server from inside the frame. Cookies can be made to work, but only partitioned, `SameSite=None` cookies on the `discordsays.com` domain.
   - Simpler fix:
     1. After the Discord token exchange, the server looks up the Discord user and their linked Steam ID.
     2. It returns our existing signed session token.
     3. The Activity sends that token as `Authorization: Bearer …`.
     4. `getSessionSteamId()` accepts the header when there's no cookie.
   - Every existing signed-in API keeps working.
3. **Rate limits.** `limitOrNull()` keys on the client IP. If Discord's proxy is what our server sees *(to measure in the spike)*, every Activity user shares one bucket of 20 comparisons a minute. Fix: key on the signed-in user for Activity requests.
4. **Outside resources.**
   - Steam images go through a `/steam-img` mapping. The cover art already falls back to text tiles if an image fails, so nothing breaks while this is being set up.
   - The analytics and ad scripts aren't loaded on `/activity`.
   - Store and launch links use `openExternalLink`.
5. **The bot's command registration (must come first).**
   - The problem: `bot/deploy-commands.js` replaces the whole global command list. It sends `[]` in its single-server path and the command list otherwise. Once Activities are enabled, a replacement that leaves out the Entry Point command fails with error 50240 (reported in a public Q&A and a GitHub PR; not confirmed in Discord's docs).
   - Fix: fetch the existing Entry Point command and include it, and drop the "clear global commands" step.
6. **New variable.** `DISCORD_CLIENT_SECRET` in Vercel, for the token exchange.

## Architecture

```
Discord (desktop, web, iOS, Android)
└─ iframe  https://1472792413499293779.discordsays.com/activity?instance_id=…&frame_id=…
   └─ Discord proxy, URL mapping "/" → webothplay.com
      ├─ /activity               Next.js page; the SDK starts on the client only, once
      ├─ /api/activity/token     code → Discord token → /users/@me → linked Steam ID → our session token
      ├─ /api/activity/state     shared state for an instance: GET to follow, POST for actions (spin, start vote)
      ├─ /api/compare, /api/polls/*   existing endpoints, called with the bearer token
      └─ /steam-img/*            second mapping → cdn.cloudflare.steamstatic.com
```

**Flow:**
1. Discord opens the page and the client waits for `ready()`.
2. It authorizes with `identify`, exchanges the token, then authenticates.
3. It reads the participants.
4. The server turns their Discord IDs into linked Steam IDs, using the existing batch-links lookup, and checks the instance with the bot token.
5. The comparison runs and the results render.
6. Actions write to the instance state, and every client follows that state.

**Sync:** start with polling every ~2 seconds against Vercel. It reuses the database and suits serverless. At four people in a call that's about two requests a second per instance. Move to WebSockets on Railway, next to the bot, only if polling feels slow.

## What people see

1. Someone in a voice call opens WeBothPlay. They can use the App Launcher, the "Launch" command, or the new **Open as Activity** button on the bot's `/compare` reply.
2. **Lobby.** Everyone in the Activity, with their Steam status. Anyone not linked gets **Link Steam**, which opens the existing link page in their browser. The lobby updates when they're done.
3. **Results.** With two or more linked players they appear on their own: every shared game, with the same filters as the website.
4. **Spin.** Everyone watches the same reel land on the same game.
5. **Vote.** Shortlist a few games. Everyone votes in place, each with one veto, and the tally updates live. The winner gets a **View on Steam** button.
6. **Activity status** shows friends "Picking a game · 39 shared".

## Monetization and Discord's rules

- **Discord's rule** (Developer Policy, Monetization Requirements, in force since 7 Oct 2024): in regions where Discord supports Premium Apps (the developer's location: US, UK, EU), paid features must also be buyable through Discord, at a price no higher than elsewhere.
  - Outside payment like Stripe stays allowed.
  - **Existing customers don't have to move.**
  - **Annual plans are exempt** for now.
  - Giving website buyers extra perks counts as a violation, and so do permanent or frequent website-only discounts.
  - **This covers the bot already**, because it sells Premium with an "Upgrade Now" link, once the app is verified.
  - Sources: support-dev.discord.com/hc/articles/8563934450327; FAQ 23810643331735.
- **Discord payments.**
  - What you can sell: user *or* guild subscriptions (not both), plus one-time purchases.
  - **Checkout inside an Activity works on desktop and web only.** `startPurchase` isn't available on iOS or Android, and Premium Apps say mobile transactions aren't available.
  - Discord keeps a 6% processing fee plus 15% until $1M in sales (30% after), so we'd net roughly 80% against roughly 90% through Stripe.
  - Discord handles sales tax, VAT and refunds.
- **To sell through Discord** you need:
  - a verified app owned by a team;
  - an owner aged 18+ in the US, UK or EU;
  - Stripe payouts set up;
  - linked Terms and Privacy pages, which we already have.
- **On iPhones,** outside the US, a "buy on our website" link inside the Activity runs into Apple's rules, which Discord makes apps follow. So show **no** purchase buttons or prices on mobile. Existing Pro and Hacker members simply get their features.

**Recommendation:**
1. Keep Stripe. Annual plans stay Stripe-only.
2. Add two Discord monthly user subscriptions, Pro and Hacker, at the website prices if Discord's price list allows.
3. One check everywhere: **tier = the better of Stripe and Discord**, keyed on the linked Discord ID.
4. Hacker's server perk stays our own logic.
5. In the Activity, show Discord's checkout on desktop and web, and nothing on mobile.
6. In the bot, add Discord's premium button next to the website link.
7. Before going live, review `allow_promotion_codes` on the website checkout against the parity rule.

**Worth asking Discord Developer Support:**
- which price points are available;
- whether honouring website subscriptions in the iOS Activity is fine;
- whether small unverified apps are exempt.

## Plan

| Phase | What | Time |
|---|---|---|
| **0. Spike** | Create a separate **WeBothPlay Dev** application and enable Activities on it, with a mapping to a tunnel or preview URL. Build an `/activity` page that starts the SDK, signs in and lists participants. Add the framing exception. Check that Next.js works on desktop, web, **iOS** and Android. On iOS there's an open, unexplained Next.js crash report (embedded-app-sdk issue #280); if we hit it, fall back to a small single-page app calling the same APIs. Measure which IP our server sees, for the rate limits. | 1–2 days |
| **1. Solo MVP** | Token exchange and bearer sessions. Lobby with link status. Automatic comparison and the results UI. Steam images through the mapping. Per-user rate limits for the Activity. `via: activity` analytics. **Fix `deploy-commands.js`** before Activities go on in the real app. | 4–6 days |
| **2. Together** | Instance state table and endpoint. Synced spin. Live vote on the existing poll tables, using Discord IDs. The server checks who's in the instance with the bot token. Rich presence. | 4–5 days |
| **3. Ship** | **Open as Activity** button on `/compare` (`LAUNCH_ACTIVITY`), and the Entry Point command named and described. Mobile polish: orientation, safe areas, picture-in-picture. Tests using the SDK's `DiscordSDKMock`, run in CI. Verification and the App Directory listing. | 2–3 days |
| **4. Discord subscriptions** *(after verification; your call)* | Create the SKUs. Track entitlements with the webhook, which suits Vercel. One tier check. Store in the Activity on desktop and web. Premium buttons in the bot. | 3–4 days |

## What only you can do

- **Decide:** whether to sell through Discord, and at what prices. Using a separate dev application is recommended.
- **Developer Portal:**
  1. Enable Activities, on the dev app first.
  2. Set up URL mappings (`/` → `webothplay.com`, `/steam-img` → `cdn.cloudflare.steamstatic.com`).
  3. Add an OAuth2 redirect (`https://127.0.0.1` works).
  4. Copy the client secret into Vercel as `DISCORD_CLIENT_SECRET`.
  5. Tick iOS and Android.
  6. Add App Testers.
  7. Enable User Install.
- **When ready to launch:** app verification (identity through Stripe). For Discord subscriptions: team ownership and payouts.

## Risks and open questions

- **Next.js on iOS.** The spike settles this first, and the fallback is ready.
- **The SDK starts once per page.** A second instance, from React StrictMode or hot reload in development, hangs on `ready()`. A hard reload that drops the query string throws. Start it in one client-only module.
- **The proxy.** Its limits (size, timeouts, WebSocket idle time) and which headers reach our server aren't documented. We'll measure them in the spike.
- **Privileged intents.** Discord now reviews them at 10,000 users. The bot reads member lists for `/hype`, `/leaderboard` and the Hacker perk.
- **Steam store art in a paid app.** The Monetization Policy bars selling other rights holders' IP. Showing Steam's own store images is common practice, and the text tiles are a fallback if Discord ever objects *(unverified risk)*.
- **No age gate needed.** The app is suitable for everyone.
