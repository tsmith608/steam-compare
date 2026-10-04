# WeBothPlay: Jobs-to-be-Done Research

Research date: **2026-10-03** (every source accessed on that date unless noted).
Companion doc: `docs/retrofit/COMPETITOR_MATRIX.md`.

Hypothesis tested: *"My friends and I want to play something. We own too many games. Tell us what we can actually play together and help us choose one."*

**Verdict** [Interpretation]: the hypothesis is **confirmed but too narrow**. The evidence shows that "what we own in common" is only step 2 of a longer job. The frustrations cluster before it (getting everyone's data despite privacy settings) and after it:
- Does the game fit our headcount and devices?
- Can the one friend who doesn't own it still join?
- How do we decide fairly and quickly?

---

## 0. Method, labels, limitations

- **Labels**
  - **[Fact]**: stated directly in an inspectable source, or in a product's or thread's own text as returned by the search index.
  - **[Observation]**: a pattern across sources, or something only partly verified.
  - **[Interpretation]**: my inference or recommendation.
- **Evidence codes** (same as the matrix doc)
  - **SI**: search-index excerpt. The page itself could not be opened. Thread titles are verbatim; body text is the index's rendering and may be lightly paraphrased.
  - **GH**: read directly on GitHub.
  - **REG**: package registry.
  - **CODE**: this repo at `HEAD 8eb616d`.
- **What was searched:** about 43 WebSearch queries and about 80 WebFetch attempts (about 25 blocked by the egress proxy), covering Steam Community forums, ResetEra, Linus Tech Tips, Quora, Tildes, Hacker News, product sites, GitHub issues and PRs, and Steam API references (xPaw's `api.json`, SteamDatabase Protobufs, the Revadike internal API wiki).
- **What could not be done**
  1. **Reddit was completely inaccessible.** The search tool returned "domains are not accessible to our user agent: ['reddit.com']" and page fetches failed. **No Reddit quotes appear in this document**; none were invented. §7 lists the exact queries a human should run.
  2. Steam Community, HN, Tildes and Valve docs could be searched but were **blocked from opening**. ResetEra, Quora and Linus Tech Tips threads were found through search but not opened. All of these bodies are SI excerpts.
  3. The shared WebSearch budget (200 per session) ran out mid-research. Topics with thin evidence are flagged ("insufficient evidence in-session").
- **How "frequency" was judged:** frequency means the number of distinct, independent sources found in-session that express the pain. That includes user threads and products built specifically to address it. It is **a signal of persistence, not a population estimate.** Intensity means how much a pain blocks the job: blocker, major friction, or annoyance.

---

## 1. Refined job statements

### 1.1 Core functional job (primary)
> **When** my friends and I are online together (usually already in a Discord or voice call) with an evening to fill,
> **help us** find a game that **all of us can launch tonight**, including ones the group owns, ones only the host needs, and free ones, that **fits our headcount and devices**,
> **and get us to a fair decision in about two minutes**,
> **so we** spend the night playing instead of scrolling libraries and arguing.

This differs from the original hypothesis in four ways [Interpretation]:
- **"Owned by all" becomes "playable by all."** That adds Remote Play Together host-only titles (Steam Navigator guide: "Only the host needs the game" [Fact, SI]), free-to-play titles, and near-misses.
- **Headcount and device fit** are part of "can actually play".
- **Decision fairness** is part of "choose one". Competitors market veto and voting (Steamr: "each person vetoes one game" [Fact, SI]).
- **The context is "already together on Discord or voice."** Steam's own feature works from a group or voice chat with 8 or fewer members [Fact, SI], and every 2026 entrant is either Discord-native or link-based.

### 1.2 Related jobs
| ID | Job statement | Evidence pointer |
|---|---|---|
| J2 | When one or two friends are missing a game, show the **cheapest or fastest way to get everyone in**: host-only Remote Play Together, a free alternative, sale price, gift. | F5 (SteamTogether near-misses, PartyUp, Co-Op Now "who's missing a copy") |
| J3 | When we plan ahead, help us **pick a new game to buy together** and tell us when it's cheap. | PartyUp; ReadyUp wishlist sale alerts (F5) |
| J4 | When our usual game is stale, **surface games we all already own but forgot**. | F6 (Steam "Play Next", random-pick requests); WeBothPlay Backlog Slayer |
| J5 | When a friend joins the group, **get their library in without a privacy-settings support session**. | F3 |

### 1.3 Emotional and social jobs [Interpretation, inferred from competitor copy and thread themes]
- **Fairness:** no single friend picks every time. Shows up in veto, unanimous swipe, and timed-vote mechanics.
- **Momentum:** "turns 'we should play sometime' into actual dates" (Co-Op Now copy [Fact, SI]).
- **Belonging and identity:** compatibility, flex and leaderboard features. WeBothPlay already has `/compatibility`, `/flex`, `/leaderboard` [Fact, CODE].

### 1.4 Job map: where it breaks today
| Step | User goal | Main breakage (frustration ID) |
|---|---|---|
| 1. Assemble squad | Pick who's playing | Groups over 8 are not handled by the Steam client; group presets (F1, F4) |
| 2. Get everyone's data | Libraries visible | **Game details privacy, silent failures (F3)** |
| 3. Find the playable set | Owned, host-only, or free | Owned-only thinking; one friend is missing it (F5); family-share confusion (F8) |
| 4. Narrow | Headcount, mode, device, mood | No max-player data; Deck and controller fit (F4, F9) |
| 5. Decide | Fair, fast | Paralysis and arguments (F2) |
| 6. Get ready | Buy or install | Price gaps, sale timing (F5) |
| 7. Play, then repeat | Next time is easier | No memory of past picks; backlog forgotten (F6) |

---

## 2. Ranked frustrations

| Rank | Frustration | Frequency signal (distinct sources found) | Intensity | Confidence |
|---|---|---|---|---|
| **1** | **Finding what the whole group (3 or more people) owns is tedious; Steam's tools are one-to-one or client-only** | High: about 12 user threads or requests from 2016 onward (most dates not shown), plus 17 or more purpose-built tools and bots | Major friction | High |
| **2** | **Even with the overlap, nobody can decide (paralysis and fairness)** | High: about 6 titled threads, a Steam "Play Next" feature, and 7 or more products whose main pitch is voting or random picking | Major friction | High |
| **3** | **Privacy settings silently break comparisons** (Game details is separate from profile visibility) | Medium-high: 2 independent GitHub reports from Sept 2026, Steam threads, every competitor's stated requirement, mainstream "hide your activity" guides | **Blocker** | High |
| **4** | **Headcount mismatch:** groups of 5–8 hit 4-player caps, and Steam has no max-player data | Medium: a dedicated Steam group, a ResetEra "3–8 people" thread, a forum thread, competitor caps and new player-count filters | Blocker when it hits | Medium |
| **5** | **One friend doesn't own it, or the price gap** | Medium-high: near-miss and sale features at 3 competitors, a whole bot (PartyUp, 2026), "cheapest party game" and "free" threads, Remote Play Together guides | Major friction | Medium-high |
| 6 | Huge backlogs and forgotten games (solo is well evidenced; the group angle is not) | Medium (solo) / Low (group) | Annoyance | Medium (solo), Low (group) |
| 7 | Mixed-platform squads (console plus PC) | Medium: ReadyUp's cross-platform linking, Steam's crossplay category | Blocker for mixed groups | Medium |
| 8 | Steam Families confusion (lent titles, playing simultaneously) | Low-medium: HN and ResetEra threads, a Steam thread, a GitHub feature request (Sept 2026), an Augmented Steam request | Major friction for affected users | Low-medium |
| 9 | Device fit: Steam Deck, controller, couch co-op | Low-medium: ReadyUp filters, a Steam thread on local co-op search | Major friction for Deck users | Medium |
| 10 | Dead or abandoned multiplayer games | **Insufficient evidence in-session** | Unknown | Low |
| 11 | DLC required to play together | **Insufficient evidence in-session** | Unknown | Low |

### Evidence cards

#### F1: Whole-group overlap is tedious; native tools are one-to-one or client-only
- **[Fact, SI]** Steam Suggestions thread, title verbatim: **"\"Filter games you both own\" for multiple friends at the same time"**.
  - Posted by BJAKKE, **2018-02-25**. https://steamcommunity.com/discussions/forum/10/1693788384137550818/
  - The index's summary, which matches this thread's title: manually checking which games "all 4 or more friends" own "can take a long time when people have hundreds of games in their libraries".
- **[Fact, SI]** "Steam Friends Feature: Check Shared Games" by Kain, **2016-06-17**. https://steamcommunity.com/discussions/forum/10/358415206084911014/
- **[Fact, SI]** "Find common multiplayer games within a group of Steam users" by Nebukam, **2020-12-29** (a tool announcement). https://steamcommunity.com/discussions/forum/7/3004430047192084242/
- **[Fact, SI]** More titles found (dates not shown in the index):
  - "Games in common between a groups of friends" (…/forum/10/612823460272850743/)
  - "Steam Feature to see which games you and your friends own" (…/forum/10/828939164040155247/)
  - "See all friends who own a game" (…/forum/10/598198356184334914)
  - "Steam Friends compare" (…/forum/10/1489992713689737695/)
  - "Is there a way to see a list of who has a certain game on your list of friends?" (…/forum/1/3875966763790708688/)
  - "Comparison of games libraries" (…/forum/1/4691154324419539981/)
  - All under https://steamcommunity.com/discussions/.
- **[Fact, SI]** Discord feature request: "Games Library - Filter by commonly installed games". https://support.discord.com/hc/en-us/community/posts/360055249551-Games-Library-Filter-by-commonly-installed-games (date not shown)
- **[Fact, SI]** Tildes: "Is there a tool/method to find games you have in common with someone else?" https://tildes.net/~games/1k9m/is_there_a_tool_method_to_find_games_you_have_in_common_with_someone_else (date not shown)
- **[Fact, SI]** SteamTogether's founding rationale: "As a group of more than 2 players it simply is near impossible to have everyone go through their games library and find a game that everyone owns." https://steamcommunity.com/groups/steamtogether
- **[Fact, SI]** Valve's partial fix (client beta, Sept 2022): friend filters plus "Find Games to Play Together", for group or voice chats of "8 members or less". https://gamingonlinux.com/2022/09/steam-beta-lets-you-create-a-collection-filtered-by-games-you-and-friends-own
- **Why it matters** [Interpretation]: the need has lasted from 2016 to 2026, but the basic intersection is now commoditized and built into the Steam client for groups of up to 8. WeBothPlay wins only on:
  - access from a phone, Discord or a link,
  - groups larger than 8,
  - saved squads,
  - everything after the overlap (fit, decide, get everyone in).

#### F2: Overlap exists, but no decision
- **[Fact, SI]** Steam threads (titles verbatim; dates not shown):
  - "How do you decide what to play from the Library of your games?" (…/forum/1/2961670087546780668/)
  - "Random Game or Surprise Me Button" (…/forum/10/558747922076303609)
  - "Game Randomizer" (…/forum/10/864957183145518808/)
  - "Game Decider" (…/forum/7/540743756957651461/)
  - "Steam Roulette" (…/forum/10/846943514118168744/)
  - The index summarized one strand as "gamer's block," when endless choice causes decision paralysis.
- **[Fact, SI]** TechRadar headline: "Can't decide which PC game to play next? Steam's AI will choose a game from your library". https://www.techradar.com/news/cant-decide-which-pc-game-to-play-next-steams-ai-will-choose-a-game-from-your-library (date not verified)
- **[Fact, GH]** Hobby repos built for exactly this:
  - "When you and your friends can't decide what to play, this tool can help." (Mullen-Zen/game-vote, updated 2025-03-08)
  - "A tool to help you decide what to play with your friends (Steam only)." (MarcosTypeAP/what-2-play, updated 2025-01-15)
  - Source: https://github.com/search?q=steam+friends+%22what+to+play%22&type=repositories
- **[Fact, SI/GH]** Competitor copy built around the decision step:
  - Steamr: "democracy for game night… each person vetoes one game".
  - SteamWGP: "The first game liked by everyone is chosen".
  - ReadyUp: "When deadlocked, you can start a timed vote straight from your /common results".
  - PartyUp: "Instead of endless back-and-forth messages".
  - Co-Op Now: "turns 'we should play sometime' into actual dates".
  - URLs are in the matrix doc §2–3.
- **Why it matters** [Interpretation]: the decision ritual is where 2026 products compete. WeBothPlay's Game Roulette is a start, but roulette alone gives one person's spin. Groups want **private input, then a fair reveal**: likes or vetoes, then a weighted spin, then a result posted to the channel.

#### F3: Privacy settings silently break comparisons (blocker)
- **[Fact, GH]** Lutris issue #6890, opened **2026-09-13**: "GetOwnedGames does distinguish the two cases: with public game details and an empty library it returns {"response":{"game_count":0}}, while private game details give {"response":{}}."
  - The issue also reports that the app's error message pointed users at profile visibility instead of the **Privacy Settings → Game details** setting.
  - https://github.com/lutris/lutris/issues/6890
- **[Fact, GH]** tg_achievement_bot issue #39, opened **2026-09-08**: "connect_steam's own `is_public` check passed (communityvisibilitystate == PUBLIC), but backfill logged "steam backfill for tg_id=127383366 stored 0 achievements" with no explanation anywhere - the person just saw a normal-looking success flow and then permanently 0 achievements, no error, nothing to act on."
  - https://github.com/MadOmsk/tg_achievement_bot/issues/39
- **[Fact, SI]** Steam Help threads returned for a privacy query include:
  - https://steamcommunity.com/discussions/forum/1/3004429475621711793
  - https://steamcommunity.com/discussions/forum/1/2974027084080339219 (2020-11-23)
  - https://steamcommunity.com/discussions/forum/0/4843149419128079480 (2024-10-07)

  The index's summary of them reports a user whose Game details were set to "Friends Only" yet friends couldn't see the games until it was set to "Public". It also gives a workaround: check and then uncheck "Always keep my total playtime private even if users can see my game details". The index did not attribute this to a specific thread.
- **[Fact, SI]** Every comparison product states the requirement:
  - Steam Navigator: "All Steam profiles must be set to public and game details must be public".
  - Co-Op Now reads the "publicly visible game library".
  - The Games in Common bot: "your Steam profile needs to be public".
  - See matrix doc §2–3.
- **[Fact, SI]** Mainstream guides teach people to hide activity: TrustedReviews "How to hide your game activity on Steam" (https://www.trustedreviews.com/how-to/how-to-hide-your-game-activity-on-steam-4342314) and How-To Geek on making a Steam profile private (https://www.howtogeek.com/336931/how-to-make-your-steam-profile-private/). Some friends will be private **by choice**.
- **Why it matters** [Interpretation]:
  - One private friend breaks the whole group's answer.
  - Silent failure ("0 shared games") reads as "this site is broken".
  - The fix is cheap: detect which friend and which setting; give a one-tap deep link plus a copy-paste message for the friend; show partial results immediately.
  - Because people choose privacy, also offer a non-public path, such as having that friend sign in once through Steam OpenID. Whether a signed-in user's own private library can be read with WeBothPlay's key is **not verified**; test before promising it.

#### F4: Headcount mismatch (4-player caps, groups of 5–8)
- **[Fact, SI]** A Steam group exists specifically for games with more than 4 local players: "morethan4localmultiplayer". https://steamcommunity.com/groups/morethan4localmultiplayer/discussions/0/1700542332331331452
- **[Fact, SI]** ResetEra thread, title verbatim: "Best Steam online co-op or party games for 3-8 people?" https://www.resetera.com/threads/best-steam-online-co-op-or-party-games-for-3-8-people.236371/ (date not shown)
- **[Observation, SI]** A search for games for a 6-friend group returned several Steam threads, including "What is best game to Play with friends" (https://steamcommunity.com/discussions/forum/1/756142248507245415) and a thread dated 2015-12-27 (https://steamcommunity.com/discussions/forum/1/458604254440702024). The index's summary of those answers is organized by headcount: Satisfactory "up to 8 people", Killing Floor 2 "a good 6 player game", Titan Quest "up to 6". The index did not say which thread each suggestion came from.
- **[Fact, SI]** Caps in the market:
  - Steam client group feature: 8 or fewer.
  - Remote Play Together: "up to four players".
  - Steam Navigator: maximum 4.
  - Let's Play Something: 2–6.
  - jmuhlfel's bot: up to 8.
- **[Fact, SI]** New entrants now market headcount filters. ReadyUp filters "by player count…". Co-Op Now promises co-op games "with the right player count and setup".
- **[Fact, GH]** Steam's store item data has **no max-player field** (§4.3).
- **Why it matters** [Interpretation]: for 5–8-person groups, a shared co-op game that caps at 4 is a false positive that costs trust. Headcount fit is a parity feature now. The cheap version (categories plus cached external data plus crowd confirmation) beats waiting for perfect data.

#### F5: One friend doesn't own it; price gaps
- **[Fact, SI]** SteamTogether lists games "2 or less players are missing", and "Games that are on sale will be listed first so you might as well purchase the missing game and get cracking." https://steamcommunity.com/groups/steamtogether
- **[Fact, SI]** Co-Op Now's group page shows "who's missing a copy". https://co-op.now/features/steam-library-sync
- **[Fact, SI]** PartyUp, an entire bot for group purchases ("I'm In" / "Not For Me" / "Already Own", price alerts), created about 2026-03-06. https://partyup.bot/
- **[Fact, SI]** ResetEra title, verbatim including the typo: "I'm going to have friends over, I need the cheapest best party gale thats available on steam." https://www.resetera.com/threads/im-going-to-have-friends-over-i-need-the-cheapest-best-party-gale-thats-available-on-steam.634916/
- **[Fact, SI]** Quora: "What are some free small multiplayer games to play with a friend on Steam?" https://www.quora.com/What-are-some-free-small-multiplayer-games-to-play-with-a-friend-on-Steam
- **[Fact, SI]** Remote Play Together: "Only the host needs the game—if you own a local co-op game, three friends can join and play with you without buying anything." (Steam Navigator guide) https://www.steamnavigator.com/blog/steam-remote-play-together-guide
- **[Fact, SI]** Remote Play Together users ask: "Is there any way to get Remote Play Together working in games that are on Steam officially but don't have this feature built in?" https://steamcommunity.com/groups/homestream/discussions/0/800092931632516877/
- **[Observation, SI]** The search index includes a Wikipedia article titled "Friendslop", a recent label for cheap co-op games bought by friend groups. Its definition and dates were not verified in-session.
- **Why it matters** [Interpretation]: "host-only" Remote Play Together titles and free-to-play titles turn many near-misses into games the group can play tonight at no cost. Real near-misses ("Sam needs it, $7.99, 60% off") are the natural, ethical monetization point (affiliate) and the trigger for the J3 sale-alert loop.

#### F6: Backlogs and forgotten games
- **[Fact, SI]** Solo backlog paralysis is well documented: the F2 threads, Steam's "Play Next", a 2025 backlog-challenge post (https://ramblingreviews.substack.com/p/2025-backlog-challenge), backlog trackers (SavePoint ad copy: "Track your games like you track movies").
- **[Observation]** I found **no** in-session evidence of groups specifically asking for a cross-group unplayed list. That is both an opportunity (no competitor claims it) and a risk (unvalidated demand).
- **Why it matters** [Interpretation]: Backlog Slayer is a real differentiator. Validate it by measuring click-through on a "Forgotten gems" lane before investing further.

#### F7: Mixed-platform squads
- **[Fact, SI]** ReadyUp links "Steam, Xbox, PlayStation, and Battle.net". https://readyupbot.com/
- **[Fact, GH]** Steam has a "Cross-Platform Multiplayer" store category (id 27). https://github.com/Revadike/InternalSteamWebAPI/wiki/Get-Store-Categories
- **[Fact, SI]** A reposted headline (URL slug) reads "steam s multiplayer game streaming now works with friends without steam". https://www.goodreads.com/author_blog_posts/21008173-steam-s-multiplayer-game-streaming-now-works-with-friends-without-steam. That this refers to Remote Play Together guest invites is my inference [Interpretation]; the date was not verified.
- **Why it matters** [Interpretation]: show a crossplay badge and Remote Play Together guest hints. **Do not** build console library linking: it is high-maintenance, and ReadyUp already does it for free.

#### F8: Steam Families confusion
- **[Fact, GH]** Ludarium issue #62 (**2026-09-26**): "IFamilyGroupsService/GetSharedLibraryApps looks like the source: it lists a family group's apps and who owns each". It also notes that lent titles are absent from `GetOwnedGames`. https://github.com/Halaburda00/ludarium/issues/62
- **[Fact, SI]** Related discussions:
  - HN "Steam Families Is Here": https://news.ycombinator.com/item?id=41519680
  - ResetEra "Introducing Steam Families (Now Available for everyone)": https://www.resetera.com/threads/introducing-steam-families-now-available-for-everyone.978510/
  - Steam Help "games shared across accounts not in steam family": https://steamcommunity.com/discussions/forum/1/595138831417676974/
  - Augmented Steam feature request #322 (2019-06-28), "Family sharing indication (game owned by a family member) on store pages": https://github.com/IsThereAnyDeal/AugmentedSteam/issues
- **[Unverified in-session]** Valve's Families rules (member cap; one player per copy at a time). Confirm on Valve's help pages before showing copy about them.
- **[Fact, CODE]** `src/lib/compare.js` merges recently played titles a user doesn't own as `borrowed: true` "so they can still count as shared".
- **Why it matters** [Interpretation]: a borrowed copy may not be playable at the same time as its owner. Label borrowed titles and never count two family members on one copy as "both own".

#### F9: Device fit (Steam Deck, controller, couch co-op)
- **[Fact, SI]** ReadyUp filters "controller support, or Steam Deck compatibility".
- **[Fact, SI]** Steam Help thread: "How to search for local co-op games in library?" https://steamcommunity.com/discussions/forum/1/810939351222987848/
- **[Fact, GH]** Per-game Deck playtime and compatibility data are available (§4.4).
- **Why it matters** [Interpretation]: cheap to add with data WeBothPlay can already get, for example "2 of you play mostly on Deck; showing Verified/Playable first".

#### F10 / F11: Dead multiplayer games; DLC requirements
- **Insufficient evidence in-session.** Treat both as hypotheses.
- **[Fact, GH]** Useful API hooks: `ISteamUserStats/GetNumberOfCurrentPlayers` (appid; no key parameter listed) for an "is anyone still playing this" badge; `has_dlc` in owned-games data; `IStoreBrowseService/GetDLCForApps` exists (§4).

---

## 3. Codebase cross-check (CODE @ `HEAD 8eb616d`; the working tree is mid-refactor by other agents)

| # | Finding | Evidence | Label | Status in working tree |
|---|---|---|---|---|
| K1 | The production compare route calls the **removed** wishlist endpoint | `src/app/api/compare/route.js:117`: `https://store.steampowered.com/wishlist/profiles/${steamid}/wishlistdata/` | [Fact] | Refactor routes through `src/lib/steam.js:258`, which calls `IWishlistService/GetWishlist/v1/` ✔ |
| K2 | "Shared Wishlist" and "Buy for Friend" are probably empty in production | Follows from K1 and §4.2. Not tested live | [Interpretation] | Fixed by the refactor once deployed |
| K3 | Played free-to-play titles are excluded from libraries | HEAD `fetchLibrary` uses `include_appinfo=true` with no `include_played_free_games` (route.js:79) | [Fact] | Refactor adds `include_played_free_games: 1` ✔. Free-to-play games a friend has never launched still won't appear, so add a "free for everyone" lane based on store `is_free` |
| K4 | Store metadata requests can exceed the store rate limit | HEAD `/api/game-details` sends one appdetails request per app, 5 in parallel, 200 ms between batches. A 300-game shared list means about 300 store calls, versus the community-documented 200 per 5 minutes per IP (§4.5) | [Fact] code, [Interpretation] impact | Refactor caches in an `app_meta` table (TTL 14 days, `fetchBudget` 30 per call) ✔ |
| K5 | The core job is paywalled | HEAD: `tierLimits = { 'Noob': 3, 'Pro': 6, 'Hacker': 12 }`; category filter buttons disabled unless `isPremium` (`FilterBar.jsx`) | [Fact] | Refactor `src/lib/plans.js`: Noob 4 / Pro 8 / Hacker 12. Filter gating not re-checked |
| K6 | Private-profile detection matches Steam's actual behavior | Refactor `getOwnedGames` treats a missing `games` **and** missing `game_count` as private (matches §4.1) | [Fact] | ✔. Make sure the UI copy names **"Game details"** specifically |
| K7 | Borrowed titles counted as shared | `buildMaps` in `src/lib/compare.js` | [Fact] | Label them as borrowed; see F8 |

---

## 4. Steam Web API and platform facts (verified where possible)

Official Valve pages (`partner.steamgames.com/doc/webapi/*`, `steamcommunity.com/dev/apiterms`) were **not fetchable** from the research environment. Facts below come from:
- **xPaw's `api.json`**, generated from Steam's supported-API list and protobufs: https://github.com/xPaw/SteamWebAPIDocumentation, raw file https://raw.githubusercontent.com/xPaw/SteamWebAPIDocumentation/master/api.json (fetched 2026-10-03).
- **SteamDatabase Protobufs**: https://github.com/SteamDatabase/Protobufs (fetched 2026-10-03).
- **GitHub issues and code**, cited per row.

Re-check critical items against Valve's docs before shipping.

### 4.1 Owned games and privacy
| Fact | Source (date) | Label | Why it matters |
|---|---|---|---|
| `IPlayerService/GetOwnedGames` parameters: `include_appinfo`, `include_played_free_games` ("Free games are excluded by default…"), `appids_filter`, `include_free_sub`, `skip_unvetted_apps`, `language`, `include_extended_appinfo` ("capsule, sortas, and capabilities"), **`include_family_licenses`** ("Also return games the player has played via a family share without owning them. These are flagged with family_shared.") | xPaw `api.json` (2026-10-03) | [Fact] | Always send `include_played_free_games=1`. Test `include_family_licenses` to label borrowed titles instead of guessing from recent activity (K7) |
| Response fields per game include `playtime_forever`, `playtime_2weeks`, `rtime_last_played`, `playtime_windows/mac/linux_forever`, **`playtime_deck_forever`**, `has_dlc`, `has_workshop`, `has_leaderboards`, `content_descriptorids`, `playtime_disconnected` | `steam/steammessages_player.steamclient.proto`, `CPlayer_GetOwnedGames_Response` (2026-10-03) | [Fact] | Spot Deck-first friends; build "forgotten gems" from `rtime_last_played`; flag DLC |
| Private **Game details** returns `{"response":{}}`. A public but empty library returns `{"response":{"game_count":0}}` | lutris #6890 (2026-09-13) | [Fact] | Exact, cheap detection of the blocker (F3) |
| Profile visibility (`GetPlayerSummaries.communityvisibilitystate`) does **not** indicate Game details visibility | tg_achievement_bot #39 (2026-09-08) | [Fact] | Don't treat "profile public" as "library readable" |
| "Friends only" Game details should be treated as private for server-side calls made with WeBothPlay's key | Inferred; not tested in-session. SI threads show friends-only confusion | [Interpretation] | Copy should say "set Game details to **Public**" |
| `ISteamUser/GetFriendList` needs a visible friends list. The refactor returns `null` when it is private | xPaw `api.json`; CODE `src/lib/steam.js` | [Fact] | The friend picker needs a manual add-by-URL fallback |
| `IPlayerService/GetFriendsGameplayInfo` (undocumented): "Get a list of friends who are playing, have played, own, or want a game"; needs an access token | xPaw `api.json` | [Fact] | This is Steam's own "friends who own" data. Not usable without user tokens; listed for context |

### 4.2 Wishlist endpoint status: old endpoint removed (late Nov 2024)
| Fact | Source (date) | Label |
|---|---|---|
| The Home Assistant integration broke ("Could not find a Steam profile…") | boralyl/steam-wishlist issue #29, **2024-11-28**: https://github.com/boralyl/steam-wishlist/issues/29 | [Fact] |
| The fix PR says: "It uses the Steam Web API to retrieve wishlist data now that the old json endpoint was removed." | PR #30, merged **2024-12-07**: https://github.com/boralyl/steam-wishlist/pull/30 | [Fact] |
| Current code there: `GET_WISHLIST_URL = "https://api.steampowered.com/IWishlistService/GetWishlist/v1"` and `GET_APPS_URL = "https://api.steampowered.com/IStoreBrowseService/GetItems/v1"` | https://raw.githubusercontent.com/boralyl/steam-wishlist/main/custom_components/steam_wishlist/sensor_manager.py | [Fact] |
| "The users.get_profile_wishlist() function is no longer working (due to API removal)". The old URL `…/wishlist/profiles/{steamid}/wishlistdata?p={page}` is replaced by `IWishlistService/GetWishlist/v1`, which "returns only `appid`, `priority` and `date_added`" | deivit24/python-steam-api #55, **2025-07-14**: https://github.com/deivit24/python-steam-api/issues/55 | [Fact] |
| Wishlist breakages in Augmented Steam cluster in Nov 2024–Jan 2025 (#2084 on 2024-11-27, #2096, #2110, #2115, #2116) | https://github.com/IsThereAnyDeal/AugmentedSteam/issues?q=is%3Aissue+wishlist+created%3A2024-10-01..2025-01-31 | [Observation] |
| Steam users asked "Whats going on with my Steam Wishlist?" during Nov 17–28, 2024. A guide is titled "Remove hidden items from your Steam wishlist! (Outdated - 20/11/2024)" | https://steamcommunity.com/discussions/forum/0/4625854789815653237/ · https://steamcommunity.com/sharedfiles/filedetails/?id=1746978201 | [Fact, SI] |
| The Steam API list exposes `IWishlistService/GetWishlist` (param: `steamid` only, no `key` listed), `GetWishlistItemCount` (`steamid`), `GetWishlistSortedFiltered` (with a `share_token` that "Determines what items are visible"), and `GetWishlistItemsOnSale` (undocumented, needs an access key) | xPaw `api.json` (2026-10-03) | [Fact] |
| The Revadike wiki's `wishlistdata` page was last edited 2022-02-24 and does not mention the removal, so it is stale | https://github.com/Revadike/InternalSteamWebAPI/wiki/Get-Wishlist-Data | [Fact] |
| Whether `GetWishlist` respects profile or Game details privacy, and whether a key is required in practice | One SI excerpt claims "no API key required, but the profile must be public"; not verified | [Unverified] |

**Implication** [Interpretation]: the caller's report is **confirmed**. Ship the refactor's `GetWishlist` path, which fixes K1 and K2. Because the endpoint returns IDs only, resolve names and prices through the cached app metadata (or `GetItems`). Treat failures as "wishlist unavailable", never as "empty".

### 4.3 Player count ("max players"): Steam does not expose it
| Fact | Source (date) | Label |
|---|---|---|
| Steam's store item data has only category-ID lists (`supported_player_categoryids`, `feature_categoryids`, `controller_categoryids`) in `StoreItem.Categories`. There is **no numeric max-player field** | `steammessages_storebrowse.steamclient.proto` (2026-10-03) | [Fact] |
| Category IDs confirmed: 1 "Multi-player", 2 "Single-player", 9 "Co-op", 27 "Cross-Platform Multiplayer", 28 "Full Controller Support", 38 "Online Co-op", **44 "Remote Play Together"**. Endpoint: `store.steampowered.com/actions/ajaxgetstorecategories` | Revadike wiki "Get Store Categories" (last edited 2022-02-24): https://github.com/Revadike/InternalSteamWebAPI/wiki/Get-Store-Categories | [Fact] |
| Other categories (Shared/Split Screen variants, LAN, PvP variants, a "Family Sharing" category) exist, but their **IDs were not verified in-session** | — | [Unverified] |
| **IGDB** `multiplayer_modes` has numeric caps: `Onlinemax`, `Onlinecoopmax`, `Offlinemax`, `Offlinecoopmax`, plus flags `Lancoop`, `Splitscreen`, `Splitscreenonline`, `Dropin`, `Campaigncoop`. Requires a Client-ID and App Access Token (Twitch) | Go client docs: https://pkg.go.dev/github.com/Henry-Sarabia/igdb/v2 (v2.0.0-alpha.4, 2020-12-15) | [Fact] field names; coverage and terms [Unverified] |
| **PCGamingWiki** game pages have a network multiplayer table with a per-mode (Local, LAN, Online, Asynchronous) rating, **player count**, and notes (Co-op/Versus). An open-source Playnite plugin parses it through the MediaWiki API (`/w/api.php`, `action=parse`) | https://github.com/sharkusmanch/playnite-pcgamingwiki-metadata-provider (archived 2025-01-21), `src/PCGamingWikiHTMLParser.cs`, `src/PCGWGame.cs` | [Fact] |
| Co-Optimus maintains a co-op database | https://www.co-optimus.com/editorial/72/Finding_Co-Op_Gamers_Using_Co-Optimus.html | [Fact, SI]; API and terms [Unverified] |

**Implication** [Interpretation]: build a cached `game_player_caps` table, filled in this order:
1. IGDB caps, matched by Steam appid through IGDB's external-games mapping (verify).
2. PCGamingWiki (low request rate, attribution).
3. Crowd confirmations ("We played this with 6: ✅").

Steam category 44 alone unlocks a strong feature now: host-only Remote Play Together near-misses. Never claim a cap you don't have; show "player count unknown" instead.

### 4.4 Steam Deck and device data
| Fact | Source (date) | Label |
|---|---|---|
| Unauthenticated endpoint `store.steampowered.com/saleaction/ajaxgetdeckappcompatibilityreport?nAppID=<id>` returns `resolved_category` (0 Unknown, 1 Unsupported, 2 Playable, 3 Verified), `resolved_items`, and `steamos_resolved_category` | proton-pulse-web #189 (**2026-07-03**): https://github.com/mdeguzis/proton-pulse-web/issues/189 · Revadike wiki (2022-02-23): https://github.com/Revadike/InternalSteamWebAPI/wiki/Get-Deck-Compatibility-Report · vapor #5 (2023-12-13) | [Fact] (undocumented, may change) |
| `StoreItem.Platforms` includes `steam_deck_compat_category`, `steam_os_compat_category`, and also **`steam_frame_compat_category`** and **`steam_machine_compat_category`** | `steammessages_storebrowse.steamclient.proto` (2026-10-03) | [Fact] field presence |
| Per-user Deck playtime: `playtime_deck_forever` | §4.1 | [Fact] |

**Implication** [Interpretation]: a "Deck-friendly for our squad" filter costs almost nothing. Fetch compatibility in batches through the metadata cache. Valve's compatibility ratings now extend beyond the Deck, so design the badge to be device-generic.

### 4.5 Store metadata and rate limits
| Fact | Source (date) | Label |
|---|---|---|
| appdetails: "This API is now rate limited to 200 requests per 5 minutes, and multiple appids no longer work in a single request without filters" (multiple appids work with `filters=price_overview`) | Revadike wiki "Get App Details", last edited **2024-04-12**: https://github.com/Revadike/InternalSteamWebAPI/wiki/Get-App-Details | [Fact] community-documented, unofficial |
| The same wiki's home page says: "There's a limit to 300 store requests per 5 mins." | https://github.com/Revadike/InternalSteamWebAPI/wiki | [Fact], conflicts with the row above, so plan for **200 per 5 min per IP** |
| `IStoreBrowseService/GetItems` (undocumented; "Access key") takes **batches** of ids with a `data_request` (`include_basic_info`, `include_platforms`, `include_tag_count`, `include_ratings`, `include_reviews`, `include_best_purchase_option`, …). It returns categories, platforms (Deck), reviews, and price options | xPaw `api.json`; protobuf `StoreBrowseItemDataRequest`; used in production by boralyl/steam-wishlist since 2024-12 | [Fact] |
| `IStoreService/GetAppList`: catalog paging, "Default 10k, max 50k", `if_modified_since` | xPaw `api.json` | [Fact] |
| Steam Web API daily cap: "Steam Web API is limited to 100,000 calls per day" | SteamRE/DepotDownloader #122 (2020-07-15). Secondary source; confirm at https://steamcommunity.com/dev/apiterms | [Fact] as reported, [Unverified] officially |

### 4.6 Families, live player counts, gifting
| Fact | Source | Label |
|---|---|---|
| `IFamilyGroupsService/GetSharedLibraryApps` (undocumented) returns a family's apps with `owner_steamids`, `exclude_reason`, `rt_last_played`, and `rt_playtime`. Needs an access key or token | xPaw `api.json`; `steammessages_familygroups.steamclient.proto` | [Fact] |
| `ISteamUserStats/GetNumberOfCurrentPlayers(appid)`: no key parameter listed | xPaw `api.json` | [Fact], enables an "alive" badge |
| `ICheckoutService/GetFriendOwnershipForGifting` (undocumented) exists | xPaw `api.json` | [Fact]; context for "gift it" flows |

### 4.7 Third-party data terms
| Fact | Source (date) | Label |
|---|---|---|
| IsThereAnyDeal API terms: "You MAY use this API for commercial purposes IF the resulting app is available to public"; "You MUST NOT change provided data in any way. This means that you can't remove affiliate tags…"; "You MUST NOT make an app that could be considered a competition to IsThereAnyDeal" | https://raw.githubusercontent.com/IsThereAnyDeal/API/master/TERMS_OF_SERVICE.md (fetched 2026-10-03) | [Fact] |
| ITAD API changelog 2.9.0: tiered rate limits by verification status; OAuth with user filters such as "in Waitlist"; webhooks | https://raw.githubusercontent.com/IsThereAnyDeal/API/master/CHANGELOG.md | [Fact] |
| HowLongToBeat has no stable API. The most-used unofficial wrapper logged 8 breakage issues from 2024-08-07 to 2026-10-02 | https://github.com/ScrappyCocco/HowLongToBeat-PythonAPI/issues | [Fact] |

---

## 5. Ranked product opportunities

**Scoring:** each criterion is scored 1–5 (5 = best). For **Dev cost** and **Maintenance**, 5 means cheapest or lowest maintenance. Totals are a guide, not math. All scores are [Interpretation].

| Rank | Opportunity | User value | Frequency | Differentiation | Dev cost | Virality | Maintenance | Total | Frustrations addressed |
|---|---|---|---|---|---|---|---|---|---|
| **1** | **Free core, repackaged Premium**: at least 8 players free (matching Steam's client), multiplayer and co-op filter free. Premium sells convenience: more presets, history, scheduled digests, cosmetic dashboards, server perks | 5 | 5 | 3 | 5 | 4 | 5 | **27** | F1, F4 |
| **2** | **Privacy-aware onboarding and partial results**: per-friend status ("Game details private"), one-tap fix link, copy-paste DM text, "recheck", results shown for everyone else immediately | 5 | 4 | 4 | 5 | 3 | 5 | **26** | F3 |
| **3** | **"Playable tonight" engine**: owned by all, plus host-only Remote Play Together (category 44), plus free-to-play for all, plus near-misses with the missing person and price. Badges for headcount (where known), Deck, controller, crossplay | 5 | 5 | 4 | 4 | 3 | 4 | **25** | F1, F4, F5, F9 |
| **4** | **Shareable decision lobby**: one link (web or phone, no login for voters) where each friend privately likes or vetoes. Then a weighted Roulette reveal, with the result posted to Discord. The bot gets `/tonight` as the entry point | 5 | 5 | 2 | 3 | 5 | 4 | **24** | F2 |
| **5** | **Outcome share cards** (OG images): "Tonight: X, picked from 37 co-op games we all own", "Our squad compatibility: 81%". Auto-generated for Discord, X and Bluesky | 3 | 4 | 3 | 4 | 5 | 5 | **24** | F2 (+ growth) |
| 6 | **Forgotten gems lane** (Backlog Slayer 2.0): all own it, nobody played it in 2 or more years (`rtime_last_played`), multiplayer only, works with Roulette | 3 | 3 | 4 | 5 | 3 | 5 | 23 | F6 |
| 7 | **Squad-fit filters v1**: Deck-first friends (`playtime_deck_forever`) plus compatibility; controller category; crossplay category; "alive" badge (`GetNumberOfCurrentPlayers` threshold for online-only games) | 4 | 4 | 3 | 4 | 2 | 4 | 21 | F4, F9, F10 |
| 8 | Discord game-night loop: `/tonight` poll, reminder for the chosen time, server-saved squads | 4 | 4 | 2 | 3 | 4 | 3 | 20 | F2 |
| 9 | Group wishlist and near-miss sale digest (weekly email or Discord DM; affiliate links that respect ITAD terms) | 3 | 3 | 3 | 3 | 3 | 3 | 18 | F5 |
| 10 | Headcount fit v2: IGDB and PCGamingWiki caps plus crowd confirmations | 4 | 4 | 3 | 2 | 2 | 2 | 17 | F4 |
| 11 | Steam Families awareness (label borrowed copies; warn about playing simultaneously) | 2 | 2 | 4 | 3 | 1 | 3 | 15 | F8 |
| ✗ | Console library linking (Xbox, PSN, Battle.net) | 4 | 3 | 1 | 1 | 2 | 1 | 12 | F7. **Don't build**: ReadyUp already does it for free |
| ✗ | HowLongToBeat session-length estimates | 3 | 3 | 2 | 2 | 1 | 1 | 12 | **Don't build**: fragile scraping (§4.7) |

**P0 hygiene, unscored, ship first** [Interpretation]: deploy the refactor's fixes for K1 (wishlist), K3 (free-to-play), K4 (metadata cache) and K6 (privacy detection). Then confirm in production that the shared wishlist is non-empty for a test squad.

### 5.1 Short specs for the top 5 [Interpretation]

1. **Free core.**
   - Free: up to 8 players, the multiplayer, co-op and Remote Play Together filters, near-misses, Roulette.
   - Paid: 9–12 players, unlimited saved squads, session history, weekly digests, profile cosmetics, Discord "server perk".
   - Rationale: the free alternatives are Steam's client (groups of 8 or fewer), ReadyUp, Steamr and Co-Op Now (matrix doc §1).
   - Metric: comparisons per week, and paid conversion on convenience features.
2. **Privacy onboarding.**
   - On `{"response":{}}`, show per friend: "🔒 Game details private". Offer a button opening Steam's privacy settings page (`https://steamcommunity.com/my/edit/settings`; confirm this URL, it was not checked in-session) and a prefilled DM: "Set Steam → Privacy → Game details to Public so we can find games we share."
   - Show results for the remaining friends with a banner.
   - Metric: share of comparisons with at least one private friend, and the recovery rate within 24 hours.
3. **"Playable tonight" engine.**
   - Lanes: **Everyone owns** · **Host-only, Remote Play Together** (one owner plus category 44) · **Free for everyone** (store `is_free`) · **Missing 1** (who, plus price).
   - Badges: Deck · Controller · Crossplay · players (if known) · "alive".
   - Metric: rate of "picked" outcomes per session.
4. **Decision lobby.**
   - `/tonight` in Discord, or "Start vote" on the web, creates a short link.
   - Each voter gets 3 likes and 1 veto on a phone-friendly card stack drawn from the playable lanes.
   - Reveal: a weighted Roulette over the survivors.
   - The result posts back to the channel and the web page.
   - Metric: time to decision (target under 2 minutes), and voters per session (the virality coefficient).
5. **Share cards.**
   - Server-rendered OG images for result, compatibility, and forgotten-gem cards, linked back to the lobby or comparison.
   - Metric: link opens per card, and new users from referrals.

---

## 6. What this means for positioning [Interpretation]

- **Message:** "Find what your whole squad can play **tonight**, and pick it in 2 minutes." Avoid "compare libraries": everyone says that, and Steam does it.
- **Proof points to show on the landing page:**
  - works with private-profile friends (guided fix),
  - 8 players free,
  - host-only Remote Play Together picks,
  - one link from Discord or a phone.
- **Low-maintenance guardrails:**
  - Cache all store metadata (14 days or more), and use batch calls.
  - Avoid scraping-dependent data such as HowLongToBeat.
  - Keep price data either from Steam (`GetItems` best purchase option) or from ITAD under its terms.
  - Treat undocumented Steam endpoints as optional enrichments that fail soft.

---

## 7. Validation plan and open questions

1. **Manual Reddit pass (about 1 hour; blocked in this environment).**
   - Subreddits: r/Steam, r/pcgaming, r/patientgamers, r/gamingsuggestions, r/CoOpGaming, r/ShouldIbuythisgame. Filter by 2025–2026.
   - Queries: `"games in common"`, `"what should we play"`, `"5 player co-op"`, `"6 friends"`, `"game details private"`, `"remote play together" "only one copy"`, `"family sharing" "same time"`, `"dead servers" co-op`, `"DLC" "to play with friends"`.
   - Add dated quotes to §2 and re-rank F6, F10 and F11.
2. **Instrument (privacy-safe, aggregate):**
   - group-size distribution,
   - share of comparisons hitting a private friend, and recovery rate,
   - time from results to pick,
   - Roulette rerolls,
   - lane click-through (owned, host-only, free, missing 1),
   - share-card opens.
3. **Micro-survey** in the Discord bot `/help` and after a comparison, 3 questions: "What stopped you from playing tonight?", "Biggest group size?", "Anyone on Deck or console?".
4. **Open technical questions to test with a live key:**
   - Does `GetWishlist` respect Game details privacy?
   - What does `include_family_licenses` return?
   - Can a user who signed in through OpenID but keeps Game details private be read? Expectation: no, because OpenID gives identity, not a token.
   - How many IGDB matches can be found from Steam appids?
5. **Competitor watch:**
   - ReadyUp: created about July 2026; watch for web features and premium tiers.
   - Co-Op Now: watch whether "free during beta" ends and what moves behind the paywall.
