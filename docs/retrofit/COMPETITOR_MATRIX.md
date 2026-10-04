# WeBothPlay: Competitor & Substitute Matrix

Research date: **2026-10-03** (every source below was accessed on that date unless noted).
Scope: Steam library comparison, group game selection and roulette, Discord game bots, Steam's own (Valve) features, and nearby substitutes (deals, backlog, co-op discovery, random pickers, AI assistants).
Companion doc: `docs/retrofit/research/JTBD_RESEARCH.md`, which covers user frustrations, Steam API facts and the ranked opportunities.

---

## 0. How to read this (and what could not be verified)

**Claim labels**
- **[Fact]**: stated directly in a source I could inspect, or in a product's own copy as returned by the search index.
- **[Observation]**: a pattern seen across several sources, or something seen but only partly verified.
- **[Interpretation]**: my inference or recommendation.

**Evidence codes**
| Code | Meaning |
|---|---|
| **SI** | Search-index excerpt (WebSearch). I could **not** open the page itself from the research environment. Wording is the search engine's rendering of the page text: treat it as close to verbatim but not guaranteed. The date the page was indexed is unknown. |
| **GH** | Read directly on github.com or raw.githubusercontent.com. |
| **REG** | Read directly on a package registry (pkg.go.dev, pypi.org). |
| **SNOW** | Discord application creation date, decoded from the public application ID (Discord snowflake: `(id >> 22) + 1420070400000` ms). This is when the app was created, not proof that it is active. |
| **CODE** | Inspected in this repository at committed `HEAD 8eb616d`. The working tree is being refactored in parallel and differs in places (noted where relevant). |

**Limitations (read before acting on this)**
1. **Pages could not be fetched.** The egress proxy blocked direct fetches of nearly every product site (steamr.io, co-op.now, readyupbot.com, steamlibrarycompare.com, steamtogether.com, top.gg, discordbotlist.com), plus Reddit, Steam Community, Hacker News, Tildes, Wikipedia, Valve's partner docs and steamapi.xpaw.me. The search tool also refused reddit.com ("not accessible to our user agent"). Product facts therefore come from search-index excerpts (SI) and from GitHub, which was reachable.
2. **Search ran out partway.** The session's WebSearch budget (200 calls, shared with parallel agents) ran out during the research. Backlog, deal and analytics products (Backloggd, Infinite Backlog, GG, GG.deals, SteamDB, Steam Replay) are therefore mostly marked **"not verified (2026-10-03)"**.
3. **No visual design or mobile observations.** I could not render any competitor page, so those fields say **"Not observed"**. §8 gives a 20-minute manual checklist.
4. **No traffic or review numbers.** I found no public traffic estimates or review counts I could reach. None are quoted, and none were invented.

---

## 1. Landscape at a glance

- **[Observation] Comparing who owns what is now a commodity.** At least 10 web tools, 7+ Discord bots and 5+ hobby GitHub repos updated in 2025–2026 all do the same core intersection (sources in Matrices A and B). Steam's own client has done it for groups of up to 8 since the 2022 beta (Matrix C). Showing what everyone owns is not a moat.
- **[Observation] The 2026 entrants compete on the decision step, not the overlap step.** Steamr offers private picks plus one veto each. SteamWGP has swipe-until-unanimous. Co-Op Now has voting, swipe-to-pick and a game-night planner. ReadyUp has timed votes, LFG cards and recurring schedules. PartyUp votes on group purchases.
- **[Fact] The strongest new direct threats are free:**
  - ReadyUp (Discord): "Free forever, for every server. No feature will ever move behind a paywall." (SI)
  - Co-Op Now (web): "100% free during beta… optional supporter tiers" (SI)
  - Steamr (web): "free, no account, and nothing to install" (SI)
- **[Fact] Player-count and device filters have become table stakes for new entrants.** ReadyUp filters "by player count, controller support, or Steam Deck compatibility" (SI). Co-Op Now promises co-op games "with the right player count and setup" (SI).
- **[Interpretation] What no source showed anyone owning:** a single "playable together tonight" answer that combines ownership, near-misses, host-only Remote Play Together, free-to-play, headcount fit and device fit, delivered as a shareable link that works the same on web, phone and Discord. That is WeBothPlay's best opening (§7).

**Threat tiers** [Interpretation]
| Tier | Competitor | Why |
|---|---|---|
| 1 | Steam client "Find Games to Play Together" (Valve) | Free and built in. Handles groups of up to 8 in the desktop client. It is the default substitute. |
| 1 | ReadyUp (Discord) | Free forever. Cross-platform libraries, player-count, controller and Deck filters, votes, scheduling. Overlaps WeBothPlay's bot almost one-to-one. |
| 1 | Co-Op Now (web) | Free (beta). Library sync, voting, AI recommendations, planner, LFG, deals, plus an SEO content hub. |
| 2 | Steamr, Steam Library Compare, SteamWGP | Each copies one slice well: no-account voting, scoring, or swipe consensus. |
| 3 | Steam Navigator, SteamTogether, Lorenzo Stanco filters, legacy bots | Older, or capped at 4 players, or one-dimensional. |
| Substitute | AI assistants via MCP; Discord LFG and scheduling bots; deal trackers | They take parts of the job (decide, schedule, buy) without doing the comparison. |

---

## 2. Matrix A: Web tools that compare Steam libraries

| # | Product | Core promise | Group size | Filters & decision tools | Account / setup | Monetization | Virality / sharing | Freshness evidence | Sources (acc. 2026-10-03) |
|---|---|---|---|---|---|---|---|---|---|
| A1 | **Steamr** | "a tool for democracy for game night": finds games your crew owns in common, then you vote [Fact, SI] | "your whole group"; no cap stated [Fact, SI] | Shows multiplayer games everyone owns. Shareable invite link; "everyone picks in private, each person vetoes one game" [Fact, SI] | "free, no account, and nothing to install". Steam sign-in optional, or paste Steam ID or URL [Fact, SI] | Free; no paid tier seen [Observation, unverified] | Invite link pulls every participant into the flow [Interpretation] | FAQ page indexed; launch date unknown | https://steamr.io/games-in-common · https://steamr.io/faq · https://steamr.io/ |
| A2 | **Co-Op Now** | "free platform that helps gaming groups find co-op games to play together, syncs Steam libraries, lets your squad vote on games, provides AI-powered recommendations, and helps you plan game nights" [Fact, SI] | Group pages, "Once 2+ members sync…"; no cap stated [Fact, SI] | Removes single-player titles. Shows "who owns what, who's missing a copy, and total group playtime per game". Game Voting & Swipe to Pick, Game Night Planner, Find Co-Op Players, PC compatibility check, deal tracking [Fact, SI] | Paste Steam ID; reads "publicly visible game library"; group membership [Fact, SI] | "100% free during beta… optional supporter tiers". Pricing page title: "Support Co-Op Now — Donate & Get Badges" [Fact, SI] | Group pages, player matching, SEO hub ("Best Online Co-Op Games 2026", per-game co-op pages, guides, methodology) [Fact, SI] | Pages dated 2026 [Fact, SI] | https://co-op.now/ · https://co-op.now/features · https://co-op.now/features/steam-library-sync · https://co-op.now/pricing · https://co-op.now/methodology · https://co-op.now/co-op-games/online-co-op |
| A3 | **Steam Library Compare** | Compare libraries "to find shared games you can play together" [Fact, SI] | "no hard limit… 2, 5, or even more" [Fact, SI] | Multiplayer filter, co-op detection, **0–100 compatibility score** built from "ownership rate, multiplayer/co-op support, combined playtime, recent activity, and whether the game is free or on sale" [Fact, SI] | Not verified | Not verified | Not verified | Not verified | https://steamlibrarycompare.com/ |
| A4 | **Steam Navigator** (compare tool) | Compare libraries "to make picking the next game much easier" [Fact, SI] | **Max 4**; shows top 50 games [Fact, SI] | Sorts by combined hours. Also shows games you don't all share. Requires public profile **and** public game details [Fact, SI] | Paste URL, ID or custom ID [Fact, SI] | Not verified | Shareable parameterized URL (`compare_games?ids=…`) appears in the index [Observation, SI] | Blog guides indexed (library comparison, Remote Play Together); Steam group exists [Fact, SI] | https://steamnavigator.com/compare_games · https://steamnavigator.com/blog/compare-steam-libraries-guide · https://www.steamnavigator.com/blog/steam-remote-play-together-guide · https://steamcommunity.com/groups/SteamNavigator |
| A5 | **SteamTogether** | "finding games you can play with all of your Steam friends" [Fact, SI] | Multi-friend; cap not stated | Lists games everyone owns first, then games "2 or less players are missing". "Games that are on sale will be listed first". Tag include/exclude, e.g. exclude MMORPGs [Fact, SI] | Steam sign-in or custom Steam ID [Fact, SI] | Not verified | Not verified | Unknown; Steam group exists [Fact, SI] | https://steamcommunity.com/groups/steamtogether · steamtogether.com (not fetchable) |
| A6 | **Steam Friends Filters** (Lorenzo Stanco) | Filter a library by tags and features; compare with friends [Fact, SI] | Multiple [Fact, SI] | Tag and feature filters; sort by playtime, metascore, reviews; color-coded ownership strips [Fact, SI] | Not verified | Not verified | Not verified | Tool dates back to 2014 [Fact, SI] | https://www.lorenzostanco.com/lab/steam/friends/ |
| A7 | **SteamWGP** ("What are we Going to Play?") | Rooms ("Steamders") where players swipe through games until everyone agrees [Fact, GH] | Room-based; cap not stated | "The first game liked by everyone is chosen". EN/FR/ES/DE/JA. "Game libraries shared only with user consent" [Fact, GH] | Room join; details not verified | Open source (GPL-3.0); no monetization seen [Fact, GH] | Room invite [Interpretation] | Last commit **2026-04-07** (dependency bump), previous 2025-02-18; 76★ [Fact, GH] | https://github.com/dilaouid/steam-wgp · https://steamwgp.fr/ |
| A8 | **Steam Game Finder** (Nebukam) | Browser extension "allowing a group of Steam users to find out which games they have in common" [Fact, GH] | "any number" [Fact, SI] | Toggle users on and off, fetch friend lists, copy and paste user lists to share [Fact, SI] | No login [Fact, SI] | Free, open source [Fact, GH] | Copy and paste the group list [Fact, SI] | **Repo archived; last updated 2023-10-27** [Fact, GH], so likely dormant [Interpretation] | https://github.com/Nebukam/steam-game-finder · https://steamcommunity.com/discussions/forum/7/3004430047192084242/ |
| A9 | Legacy or unknown status: SteamParty, Steam Companion, steamparty.info, gotthatgame.com, steamoverlap.com | Older sites recommended in Steam forum answers [Fact, SI] | — | — | — | — | — | **Live status not verified.** steamoverlap's repo targets PHP 5.6 [Fact, GH] | https://steamparty.azurewebsites.net/ · https://steamcompanion.com/compare · https://github.com/yene/steam-overlap |
| A10 | Hobby clones (2025–2026): Same-Lobby, GH-Samir/games-in-common, what_should_we_play, game-vote ("When you and your friends can't decide what to play…"), what-2-play | Same core intersection [Fact, GH] | — | — | — | — | — | Updated Jan 2025 to Jul 2026, with 0–1★ each [Fact, GH]. GitHub leaves out the year for current-year dates, so "Jul 22" and "Jul 29" are read as 2026. The core is easy to clone [Interpretation] | https://github.com/search?q=steam+games+in+common+friends&type=repositories · https://github.com/search?q=steam+friends+%22what+to+play%22&type=repositories |

## 3. Matrix B: Discord bots

| # | Bot | Core promise | Scope | Features | Setup | Monetization | Virality | Freshness | Sources (acc. 2026-10-03) |
|---|---|---|---|---|---|---|---|---|---|
| B1 | **ReadyUp** | "The Discord bot that plans game night" (page title) [Fact, SI] | `/common` "shows the games your whole server, or just one role, actually owns" [Fact, SI] | Links **Steam, Xbox, PlayStation, Battle.net**. Filters "by player count, controller support, or Steam Deck compatibility". Timed vote from `/common` results with live tallies. `/lfg create` session cards with RSVPs. Recurring schedules that handle timezones and DST and DM reminders. Wishlist sale alerts. Per-user privacy toggles. Background sync: Steam and Xbox daily, PlayStation weekly [Fact, SI] | Each member runs `/myreadyup` and links a SteamID, gamertag or online ID; "No passwords" [Fact, SI] | **"Free forever, for every server. No feature will ever move behind a paywall."** [Fact, SI] | One install exposes every member of a server [Interpretation] | App created **≈2026-07-04** [Fact, SNOW] | https://readyupbot.com/ · https://discord.com/discovery/applications/1523022401997373551 · https://top.gg/bot/1523022401997373551 |
| B2 | **PartyUp** | "free Steam Discord bot that makes group game buying simple… Instead of endless back-and-forth messages, your friends vote on games directly in Discord" [Fact, SI] | Server | Paste any Steam link to get a game card. Vote "I'm In" / "Not For Me" / "Already Own". Everyone is pinged on consensus. Price tracking and sale alerts. Linking Steam auto-detects ownership [Fact, SI] | Add bot; Steam link optional [Fact, SI] | Free [Fact, SI] | Game cards posted in channel [Interpretation] | App created **≈2026-03-06** [Fact, SNOW] | https://partyup.bot/ · https://discord.com/discovery/applications/1479507954464985128 |
| B3 | **Let's Play Something** | Finds games several players own and picks "a random gem" [Fact, SI] | **2–6 libraries** [Fact, SI] | Rich embeds, game art, "witty commentary"; @mentions after linking [Fact, SI] | Link accounts [Fact, SI] | Not verified | Embeds in channel | Not verified | https://discordbotlist.com/bots/lets-play-something |
| B4 | **Library Compare-er** | `/compare` pages through the common library; `/random` gives one suggestion [Fact, SI] | Multi | — | — | — | — | App created ≈2019-04-17 [Fact, SNOW] | https://discordbotlist.com/bots/library-compare-er |
| B5 | **Games in Common** (top.gg) | Answers "What games do we all have?" and "What should we play?" [Fact, SI] | Multi | Picks a game for you [Fact, SI] | DM your Steam profile URL; profile must be public [Fact, SI] | — | — | App created ≈2020-07-05 [Fact, SNOW] | https://top.gg/bot/729452317572726795 |
| B6 | **Games-in-Common / PlayTogether** (jmuhlfel) | `/gamesincommon` ranked by playtime, completed achievements or ratings [Fact, SI/GH] | **Up to 8** tagged users [Fact, GH] | Ranking choices | Users authorize Steam through their Discord connections [Fact, GH] | Open source | — | 48 commits, 0★ [Fact, GH] | https://github.com/jmuhlfel/games-in-common |
| B7 | Hobby bots: GamesMatcher, SteamBot, SteamGamesChecker | GamesMatcher `$match` orders by last activity. SteamBot compares "all current voice chat attendees" [Fact, SI] | — | — | — | — | — | — | https://github.com/dbuteau/games-matcher · https://github.com/xdjinnx/steam-bot · https://github.com/CarsonV/SteamGamesChecker |
| B8 | Nearby (not comparison) | Steambase: Steam stats, price changes, player trends inside Discord [Fact, SI]. Scheduling: Apollo, Game Nights bot, LFG Bot, teamplay.gg [Fact, SI] | — | — | — | — | — | Game Nights bot app ≈2024-10-16 [Fact, SNOW] | https://steambase.io/tools/steam-discord-bot/ · https://apollo.fyi/ · https://top.gg/bot/1296074420716175471 · https://lfg-bot.com/ · https://teamplay.gg/discord-lfg-bot |

## 4. Matrix C: Steam (Valve) built-ins, the default substitute

| # | Feature | What it does | Limits | Sources (acc. 2026-10-03) |
|---|---|---|---|---|
| C1 | **Library "Friends" filter + "Find Games to Play Together"** (client beta, Sept 2022) | Add friends under Advanced Filtering to see games you all own. Right-click a friend and choose "Find Games to Play Together" to auto-fill the filter **and apply the Multiplayer tag**. Right-click a Group Chat header for "smaller group chats or voice channels (8 members or less)". Save the result as a Dynamic Collection [Fact, SI] | Desktop client only; groups of 8 or fewer; ownership only (no price, near-miss, vote or backlog) [Interpretation] | https://gamingonlinux.com/2022/09/steam-beta-lets-you-create-a-collection-filtered-by-games-you-and-friends-own · https://steamcommunity.com/groups/SteamClientBeta/discussions/3/3378284761900998853 |
| C2 | Profile games page: games you both own | Filters a friend's game list to games you both own [Fact, SI] | One friend at a time [Fact, SI] | https://steamcommunity.com/discussions/forum/10/1693788384137550818/ |
| C3 | **Remote Play Together** | "Only the host needs the game". Streams local multiplayer "to up to four players". Store pages can be narrowed by this feature [Fact, SI, via Steam Navigator guide; Valve page not fetchable] | Needs the host's PC and bandwidth [Interpretation] | https://www.steamnavigator.com/blog/steam-remote-play-together-guide |
| C4 | **Steam Families** (2024) | Family library sharing; discussed on HN and ResetEra [Fact, SI] | **Sharing rules not verified in this session.** See the JTBD doc for the API side | https://news.ycombinator.com/item?id=41519680 · https://www.resetera.com/threads/introducing-steam-families-now-available-for-everyone.978510/ |
| C5 | "Play Next" | Machine-learning suggestions from your own library [Fact, SI, TechRadar] | Solo, not group. Date not verified | https://www.techradar.com/news/cant-decide-which-pc-game-to-play-next-steams-ai-will-choose-a-game-from-your-library |
| C6 | Friends-who-own data | Web API method `IPlayerService/GetFriendsGameplayInfo`: "Get a list of friends who are playing, have played, own, or want a game" [Fact, GH] | Undocumented; requires a user access token [Fact, GH] | https://github.com/xPaw/SteamWebAPIDocumentation (`api.json`) |

Not in the table: **Steam Replay** (Valve's shareable year-in-review). No source for it could be retrieved before the search budget ran out, so it is **unverified (2026-10-03)**. Check it manually as a share-card benchmark.

## 5. Matrix D: Adjacent substitutes

| # | Product / category | What it covers | Verified notes | Sources (acc. 2026-10-03) |
|---|---|---|---|---|
| D1 | **IsThereAnyDeal** (+ Augmented Steam extension) | Price history, deals, waitlists; public API | API ToS allows commercial use "IF the resulting app is available to public". Forbids changing data, including affiliate tags, and forbids "an app that could be considered a competition". Changelog 2.9.0 adds tiered rate limits, webhooks, and OAuth filters such as "in Waitlist" [Fact, GH]. AugmentedSteam repo updated **2026-10-02** (1,775★); API repo updated **2026-09-07** [Fact, GH] | https://github.com/IsThereAnyDeal · https://raw.githubusercontent.com/IsThereAnyDeal/API/master/TERMS_OF_SERVICE.md · https://raw.githubusercontent.com/IsThereAnyDeal/API/master/CHANGELOG.md |
| D2 | GG.deals; SteamDB (calculator, sales, random game) | Deals, keyshop prices, account value | **Not verified (2026-10-03).** SI says only: "SteamDB has a feature that randomly selects games from your library if you log into your account" | https://steamdb.info/ · https://gg.deals/ (not opened; the search budget ran out before they could be researched, 2026-10-03) |
| D3 | **HowLongToBeat** | Completion times | No stable public API. The unofficial Python wrapper keeps breaking: "August 2024 no longer returning data" (2024-08-07), "Search URL has changed" (2024-12-29), "All searches return None… due to HLTB API changes" (2025-11-27), "It doesn't work anymore" (2026-02-06, 2026-03-31, 2026-05-15), Turbopack regex break (2026-08-25), parser bug (2026-10-02) [Fact, GH] | https://github.com/ScrappyCocco/HowLongToBeat-PythonAPI/issues |
| D4 | Backloggd, Infinite Backlog, GG (ggapp.io), Grouvee, SavePoint | Personal backlogs and game diaries | **Not verified (2026-10-03).** A SavePoint ad seen in SI: "Track your games like you track movies. Try SavePoint free" | https://www.twoaveragegamers.com/?p=32139 |
| D5 | **Co-Optimus** | Co-op game database and editorial; Steam curator since 2014 [Fact, SI] | Player-count data quality and access terms not verified | https://www.co-optimus.com/editorial/72/Finding_Co-Op_Gamers_Using_Co-Optimus.html · https://www.co-optimus.com/amparticle/12293/steam-launches-curator-stores-follow-ours-for-co-op-recommendations.html |
| D6 | Random pickers | Wheel of Steam Games (GitHub prize wheel) [Fact, GH]. LoginOne Random Game Picker WordPress plugin v1.2, with "Recently Played" and "VR Games" filters [Fact, SI]. Steam forum requests such as "Random Game or Surprise Me Button" [Fact, SI] | Solo only | https://github.com/EIGHTFINITE/wheel-of-steam-games · https://wordpress.org/plugins/loginone-random-game-picker-for-steam/ · https://steamcommunity.com/discussions/forum/10/558747922076303609 |
| D7 | **AI assistants via MCP** | A "Steam MCP Server" exposes a `compare_players` tool to LLM agents [Fact, SI] | People can increasingly ask a chat assistant "what do my friends and I share?" [Interpretation] | https://glama.ai/mcp/servers/Grinv/steam-games-mcp/tools/compare_players |
| D8 | itch.io browse facets | Player-count facets combined with co-op tags (e.g. `/games/player-count-4/tag-co-op`) [Fact, SI] | Shows that store-level player counts exist elsewhere. Steam does not expose them (JTBD doc §4) | https://itch.io/games/player-count-4/tag-co-op |

---

## 6. Competitor profiles

Each profile uses the same fields. Where a field says "Not observed", the page could not be opened (see §0).

### 6.1 Steam client: "Find Games to Play Together" + library friend filters (Valve)
- **Core promise:** see which games you and selected friends all own, from inside your library [Fact, SI, gamingonlinux 2022-09].
- **UX strengths:** zero setup and fully trusted. Right-clicking a friend or a group chat (8 members or fewer) auto-applies the Multiplayer tag. Can be saved as a Dynamic Collection [Fact, SI].
- **UX weaknesses:** desktop client only; no price or near-miss view; no voting or roulette; no backlog-across-the-group view; no shareable output; nothing for groups over 8 [Interpretation].
- **Monetization:** none; it is a platform feature.
- **Virality:** none outside Steam.
- **Accounts:** everyone must be Steam friends [Interpretation].
- **Discovery:** library tags and categories.
- **Visual / mobile:** Not observed. Steam's mobile app was not checked.
- **Freshness:** shipped to beta in Sept 2022 [Fact, SI].
- **Why someone still picks WeBothPlay:** it works from a phone or Discord without the client, handles groups up to 12, saves presets, shows who is missing which game, includes roulette and Backlog Slayer, and produces a link to share [Interpretation].

### 6.2 ReadyUp (Discord): the main threat to WeBothPlay's bot
- **Core promise:** "The Discord bot that plans game night". It links your crew's libraries and finds the games everyone owns [Fact, SI].
- **UX strengths:**
  - Libraries across platforms: Steam, Xbox, PlayStation, Battle.net.
  - `/common` works for a whole server or a single role.
  - Filters for player count, controller support and Steam Deck.
  - Timed votes with live tallies.
  - LFG cards with RSVPs, plus recurring schedules with timezone and DST handling.
  - Daily or weekly background sync.
  - Wishlist sale alerts and per-user privacy toggles. [Fact, SI]
- **UX weaknesses:** Discord-only, so there is no web dashboard or link to share outside Discord. Not verified: data freshness, rate limits, behavior with private profiles [Interpretation].
- **Monetization:** "Free forever, for every server. No feature will ever move behind a paywall." [Fact, SI]
- **Virality:** spreads server by server through installs [Interpretation].
- **Accounts:** a SteamID, gamertag or online ID; "No passwords" [Fact, SI].
- **Discovery:** votes, LFG and schedules rather than catalog discovery [Observation].
- **Visual / mobile:** Not observed. Inherits Discord's mobile UX [Interpretation].
- **Freshness:** app created about 2026-07-04 [Fact, SNOW], so it is new and moving fast.
- **Why someone still picks WeBothPlay:**
  - Groups that don't share one server.
  - People who want a web view with art, filters and history.
  - Backlog Slayer, shared wishlists, profile dashboards, `/flex`, `/hype`, leaderboards.
  - Up to 12 people from a saved preset.

  [Interpretation] Ownership, player-count and Deck filters on their own are no longer differentiators against ReadyUp.

### 6.3 Co-Op Now (web): the main threat to WeBothPlay's site
- **Core promise:** "find co-op games to play together, syncs Steam libraries, lets your squad vote on games, provides AI-powered recommendations, and helps you plan game nights" [Fact, SI].
- **UX strengths:**
  - Removes single-player titles automatically.
  - The group page shows who owns what, who is missing a copy, and combined group playtime.
  - Swipe-to-pick voting and a game-night planner that "turns 'we should play sometime' into actual dates".
  - LFG player matching, a PC compatibility check, and deal tracking.
  - An SEO hub of co-op lists and per-game co-op pages. [Fact, SI]
- **UX weaknesses:** a wide scope ("hub") can mean heavier onboarding. Group accounts are likely needed before results appear [Interpretation, unverified].
- **Monetization:** free during beta; donations and badges [Fact, SI].
- **Virality:** group pages, player matching, search traffic from 2026 "best co-op" pages [Fact, SI].
- **Accounts:** paste a Steam ID; reads the public library; group membership [Fact, SI].
- **Visual / mobile:** Not observed.
- **Freshness:** content dated 2026 [Fact, SI].
- **Why someone still picks WeBothPlay:**
  - It handles every multiplayer type, not just co-op: PvP, party, MMO.
  - It has a Discord bot with commands people already use.
  - Backlog Slayer, roulette, shared wishlists.
  - It could be faster if results appear without creating a group or account [Interpretation].

### 6.4 Steamr (web)
- **Core promise:** "a tool for democracy for game night" [Fact, SI].
- **UX strengths:** no account and nothing to install. Results show only multiplayer games. Share an invite link; everyone picks privately; one veto each, which produces a fair outcome [Fact, SI].
- **UX weaknesses:** no backlog, wishlist or Discord integration seen [Observation, unverified].
- **Monetization:** none seen [Observation].
- **Virality:** the invite link pulls everyone in [Interpretation].
- **Accounts:** optional Steam sign-in, or paste a Steam ID or URL [Fact, SI].
- **Visual / mobile:** Not observed.
- **Freshness:** unknown.
- **Why someone still picks WeBothPlay:** saved squads, a bot, Backlog Slayer, wishlists, activity, dashboards. [Interpretation] Steamr's private-pick-plus-veto mechanic is the pattern to match or beat.

### 6.5 Steam Library Compare (web)
- **Core promise:** find shared games across unlimited players [Fact, SI].
- **UX strengths:** a 0–100 compatibility score per game that combines ownership rate, multiplayer support, combined playtime, recent activity, and free or on-sale status [Fact, SI].
- **UX weaknesses:** not observed.
- **Monetization, accounts, freshness:** not verified.
- **Why someone still picks WeBothPlay:** decision tools (roulette, voting), a bot, presets. [Interpretation] A single score already exists here, so WeBothPlay's ranking needs to add things this score lacks: headcount fit, host-only Remote Play Together, Deck, and "alive" status.

### 6.6 Steam Navigator (web)
- **Core promise:** make picking the next game easier [Fact, SI].
- **UX strengths:** shows non-shared games too, sorts by hours, has a parameterized URL, and publishes useful guides (including Remote Play Together) [Fact, SI].
- **UX weaknesses:** **maximum 4 players and top 50 results** [Fact, SI].
- **Monetization:** not verified.
- **Why someone still picks WeBothPlay:** groups of 5–12, filters, roulette, a bot [Interpretation].

### 6.7 SteamTogether (web, older)
- **Core promise:** games you can play with all your friends [Fact, SI].
- **UX strengths:** near-misses (games "2 or less players are missing") and sale-first ordering. Founding rationale: "As a group of more than 2 players it simply is near impossible to have everyone go through their games library and find a game that everyone owns." [Fact, SI]
- **UX weaknesses / freshness:** status unknown.
- **Why someone still picks WeBothPlay:** active development and a bot. [Interpretation] Its near-miss plus on-sale idea is worth copying, and pairing it with host-only Remote Play Together would improve on it.

### 6.8 SteamWGP (web, open source)
- **Core promise:** swipe until everyone likes the same game: "The first game liked by everyone is chosen" [Fact, GH].
- **UX strengths:** a playful consensus mechanic, 5 languages, libraries shared only with consent [Fact, GH].
- **UX weaknesses:** low maintenance activity. Last commit was a dependency bump on 2026-04-07; substantive commits stop in Feb 2025 [Fact, GH].
- **Monetization:** none.
- **Why someone still picks WeBothPlay:** maintained, a bot, more features [Interpretation].

### 6.9 PartyUp (Discord)
- **Core promise:** coordinate group purchases [Fact, SI].
- **UX strengths:** "I'm In / Not For Me / Already Own" votes, consensus pings, price alerts, ownership detection [Fact, SI].
- **Monetization:** free [Fact, SI].
- **Freshness:** app created about 2026-03-06 [Fact, SNOW].
- **Why someone still picks WeBothPlay:** it covers the "play tonight" job, not only "what to buy". [Interpretation] PartyUp confirms demand for the price-gap / group-buy job (JTBD frustration F5).

### 6.10 Let's Play Something, Library Compare-er, Games in Common, and other bots
- **Core promise:** intersect libraries in Discord and pick one at random [Fact, SI].
- **UX weaknesses:** small group caps: Let's Play Something takes 2–6, jmuhlfel's bot up to 8 [Fact, SI/GH]. Several were created in 2019–2020 [Fact, SNOW].
- **Why someone still picks WeBothPlay:** more commands, plus web dashboards [Interpretation].

### 6.11 Steam Friends Filters (Lorenzo Stanco)
- A tag and feature filter tool with friend compare and color strips, dating to 2014 [Fact, SI].
- A power-user tool, not a decision tool [Interpretation].

### 6.12 Steam Game Finder (Nebukam): dormant
- Archived; last updated 2023-10-27 [Fact, GH].
- Steam answers still recommend it [Observation, SI], so a well-SEO'd, maintained alternative can capture that intent [Interpretation].

### 6.13 Deal trackers (IsThereAnyDeal; GG.deals and SteamDB not verified)
- ITAD is active (repos updated Sept–Oct 2026) and offers a public API with explicit terms [Fact, GH].
- **Implication** [Interpretation]: WeBothPlay can show "cheapest current price for the missing copy" using ITAD data only if it keeps ITAD's links and affiliate tags unmodified and credits ITAD. Building a full deal tracker would breach ITAD's "no competition" clause, so prices should stay a side feature of "get everyone in".

### 6.14 Backlog tools (HowLongToBeat verified; others not)
- HowLongToBeat integrations break often (8 breakage issues from Aug 2024 to Oct 2026) [Fact, GH].
- **Implication** [Interpretation]: for a low-maintenance business, do not scrape HowLongToBeat. Use Steam playtime signals and optional external links instead.

### 6.15 AI assistants (MCP)
- A Steam MCP server with `compare_players` exists [Fact, SI].
- **Implication** [Interpretation]: the plain list of games everyone owns can be done by chatbots. WeBothPlay's defensible value is the group ritual (shared link, votes, roulette, Discord) and curated "playable together" data.

---

## 7. Gaps WeBothPlay can own

Each gap lists the evidence behind it, why it matters, and how confident I am.

1. **"Playable together tonight", not just "owned by all".**
   - **Evidence:** Competitors each cover a piece. SteamTogether shows near-misses and sales. Steam Library Compare has a score covering free, sale and recency. ReadyUp filters by player count, controller and Deck. Steam Navigator publishes a Remote Play Together guide. [Fact, SI; Matrices A and B]
   - **Gap:** None of the descriptions gathered combine:
     - host-only Remote Play Together ("only the host needs the game" [Fact, SI]),
     - free-to-play titles everyone can install,
     - headcount fit,
     - device fit (Deck playtime and compatibility),
     - an "is anyone still playing it" check,
     - near-miss cost.
   - **Why it matters:** this is exactly the "what can we actually play" job.
   - **Confidence:** [Interpretation]; descriptions were not exhaustive.
2. **One shareable lobby that works the same on web, phone and Discord, with no login for participants.**
   - **Evidence:** Steamr does no-account web voting; ReadyUp, PartyUp and Let's Play Something are Discord-only; Co-Op Now uses group sync and accounts [Fact, SI]. WeBothPlay already has both a web app and a bot.
   - **Gap:** the same session state on both surfaces, through one link: friends vote from Discord or a phone browser, and the result posts back to the channel.
   - **Confidence:** [Interpretation].
3. **Group backlog ("we all own it, nobody has played it").**
   - **Evidence:** None of the competitor descriptions above mention a cross-group unplayed list [Observation]. Steam's "Play Next" is solo [Fact, SI].
   - **Gap:** Backlog Slayer is genuinely distinctive. Promote it to a first-class "Forgotten gems" lane next to roulette.
   - **Confidence:** [Interpretation].
4. **Privacy-fix UX.**
   - **Evidence:** Every tool requires public "Game details" [Fact, SI/GH]. Steam's API returns `{"response":{}}` for private game details but `{"response":{"game_count":0}}` for an empty public library [Fact, GH, lutris #6890, 2026-09-13]. Misleading errors are common [Fact, GH].
   - **Gap:** detect exactly which friend is blocked and why, then give them a one-tap fix: a deep link plus a copy-paste message. Also return partial results immediately.
   - **Confidence:** [Interpretation]. No competitor description mentions guided fixes, but I could not open their apps.
5. **Bigger groups for free, which neutralizes a weak paywall.**
   - **Evidence:** Steam client handles groups of 8 or fewer; Steam Navigator 4; Let's Play Something 6; Steam Library Compare "no hard limit"; ReadyUp works server-wide [Fact, SI].
   - **WeBothPlay today:** free tier capped at 3 players and category filters behind Pro [Fact, CODE @HEAD 8eb616d: `tierLimits = { 'Noob': 3, 'Pro': 6, 'Hacker': 12 }`; `FilterBar` buttons gated by `isPremium`]. The working-tree refactor uses `PLAN_LIMITS` Noob 4 / Pro 8 / Hacker 12.
   - **Gap:** make the core job free (at least 8 players, matching Steam's client, plus the multiplayer filter). Charge for convenience, cosmetics and automation.
   - **Confidence:** [Interpretation].
6. **Social shareables tied to real decisions.**
   - **Evidence:** WeBothPlay already has `/compatibility`, `/flex`, `/hype`, `/leaderboard` and profile dashboards [Fact, CODE: `bot/commands/*`].
   - **Gap:** turn each decision into a share card, for example "Tonight we're playing X (picked by roulette from 37 co-op games we all own)". That gives every session a growth loop. No competitor description mentions outcome cards [Observation].
   - **Confidence:** [Interpretation].
7. **SEO for the "games in common" intent that dormant tools still hold.**
   - **Evidence:** Steam forum answers still point to archived or legacy tools (Nebukam, Steam Companion, SteamParty) [Fact, SI/GH]. Co-Op Now is investing in 2026 co-op content [Fact, SI].
   - **Gap:** landing pages for "games for 5 players", "Remote Play Together games you already own" and "free co-op games for groups", each fed by WeBothPlay's metadata cache.
   - **Confidence:** [Interpretation].

**Gaps not to chase (low-maintenance lens)** [Interpretation]
- **Cross-platform library linking (Xbox, PSN, Battle.net):** ReadyUp already does it for free, and those integrations are maintenance-heavy.
- **HowLongToBeat data:** fragile (D3).
- **A full deal tracker:** conflicts with ITAD's terms, and ITAD, GG.deals and SteamDB are entrenched.
- **LFG with strangers:** Co-Op Now and LFG bots cover it; it needs moderation.

---

## 8. Manual verification checklist (about 20 minutes, for a human with a normal browser)

The research environment could not render these pages. To complete the visual and mobile columns:

1. On a phone (375 px wide), open Steamr, Co-Op Now, Steam Library Compare, Steam Navigator and SteamTogether. Record:
   - time to first result with 3 friends,
   - whether sign-in is forced,
   - whether the results list is scannable (art, badges for multiplayer, co-op, Remote Play Together),
   - share or invite flow,
   - ad density.
2. Add ReadyUp and Let's Play Something to a test server. Run `/common` (ReadyUp) or the compare command with one private-profile friend and note the error copy, then test vote UX on mobile Discord.
3. Check whether any of them distinguishes "Game details private" from "profile private", and whether any offers Remote Play Together or near-miss logic.
4. Check Co-Op Now's pricing page for whether supporter tiers unlock any features.
5. Search Reddit manually (r/Steam, r/pcgaming, r/gamingsuggestions, r/CoOpGaming) for "games in common", "what should we play", and "5 player co-op", and add any 2025–2026 threads to the JTBD doc. Reddit was inaccessible from the research environment.
