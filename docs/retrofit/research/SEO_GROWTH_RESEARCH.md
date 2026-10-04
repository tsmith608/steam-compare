# WeBothPlay: SEO & Growth Research

**As of:** 2026-10-03. **Scope:** search demand and SERPs, Google's 2024–2026 guidance, technical SEO for Next.js App Router, structured data, Discord distribution, other low-maintenance channels, and Steam API/brand compliance.
**Companion doc:** `docs/retrofit/research/JTBD_RESEARCH.md` covers user jobs and Steam Web API data facts (wishlist endpoint, player-count gaps, rate limits). This doc refers to it rather than repeating it.

---

## 0. Method, labels, limitations

**Labels used on every key conclusion**
- **[Fact]**: verified wording or data from a primary source, or from a verbatim copy of one (the copy is named).
- **[Observation]**: what I saw in search results, code, or third-party material. Not a policy statement.
- **[Interpretation]**: my inference or recommendation.
- **[Unverified]**: from prior knowledge or a single secondary fragment. Check it before relying on it.

**Access constraints in this session** (they shape how sources are cited)
1. **Web search budget.** I ran 26 searches (standard and extended) before the session-wide cap of 200 searches, shared with other agents, was reached. All SERP observations come from those 26 runs on 2026-10-03.
2. **Direct fetching was blocked.** WebFetch and curl were refused by the egress proxy for developers.google.com, nextjs.org, discord.com, steamcommunity.com, web.dev, reddit.com, semrush.com, searchengineland.com and others. webothplay.com was off-limits by instruction.
3. **How primary sources were read instead**
   - **Discord docs**: official repo `discord/discord-api-docs` @ `c43598d` (2026-10-02). It is the source of discord.com/developers/docs.
   - **Next.js docs**: official repo `vercel/next.js` `docs/` @ `86d92b9` (2026-10-03, Next 16.4.0-canary.58), plus framework source files where the docs were silent.
   - **Google Search Central**: verbatim third-party mirrors.
     - `ikun245/GoogleSEO.MD` @ `9f9c1bc` (crawl committed 2026-06-02; includes the docs changelog through May 2026).
     - `lesishu/seo-guide-skill` @ `ab8af27` (2026-06-10; keeps Google's "Last updated" stamps).
     - `0xenzyme/awesome-seo-articles` @ `5ac0776` (2026-09-08): Google Search Central blog, Ahrefs blog and Semrush blog, with original URLs and dates.
   - **Reddit, YouTube, Instagram policies**: Open Terms Archive `OpenTermsArchive/pga-versions` @ `52f551d` (2026-10-03).
   - **Steam Web API Terms and Steam's /dev page**: several independent verbatim copies found with GitHub code search (named in §10). Repeated identical wording across unrelated repos is strong evidence. It is still not the live page. Re-read https://steamcommunity.com/dev/apiterms once before shipping.
4. **No invented numbers.** No public keyword-volume source was reachable (Semrush was blocked, and no public page showed volumes for these queries). Volumes are described qualitatively only.
5. **SERP caveat.** The WebSearch tool returns US results from an unspecified engine, in its own order. Treat "who shows up" as indicative. It is not a Google rank position.

---

## 1. Executive summary

1. **Build tool pages first.** Tool-intent queries ("compare steam libraries", "steam games in common", "random steam game picker") return working tools, not editorial sites. Friend-group listicles ("games to play with friends steam") are owned by large publishers and polluted by parasite pages. Both Google's AI guide and Ahrefs' AI Overview data favour non-commodity, tool-like assets. [Interpretation; §3, §5]
2. **Steam's native features are the real incumbent.** They cover one friend at a time (games-in-common filter, library filter, Dynamic Collections, "Find Games to Play Together"). WeBothPlay wins on 3–12 people, a decision step (roulette/vote), and privacy troubleshooting. [Observation; §3]
3. **Start with eight pages:** five tool pages (Compare, Roulette, Group Backlog, Co-op Finder, Shared Wishlist), one Discord bot page, and two genuine guides. Do not build per-game pages, indexable user or comparison pages, or listicles. [Interpretation; §4]
4. **FAQ rich results are gone.** Google deprecated the FAQ rich result entirely: "no longer appear in Google Search starting May 7, 2026." HowTo was deprecated in September 2023. [Fact; §7]
5. **Structured data that still pays off:** WebSite (site name), Organization (logo), BreadcrumbList (desktop only), Article on guides, and VideoObject if videos are the main content. SoftwareApplication/WebApplication earns a rich result only with genuine on-page ratings or reviews. [Fact + Interpretation; §7]
6. **Retrofit bug found today.** The new root layout sets `alternates: { canonical: "/" }`. Next.js metadata merges shallowly, so every page that doesn't set its own `alternates` inherits a canonical pointing at the home page. Move the canonical to each page. [Fact + Observation; §2, §6]
7. **Discord's intent rules changed on 2026-06-10.** Privileged-intent review now triggers at **10,000 users**, not 100 servers. Access must be renewed every year. App Verification and intent review are now separate. The bot's only reason for the privileged GuildMembers intent is the "server perk" scan and roster fetches, and both can be replaced. Dropping the intent removes a recurring review from a solo owner's workload. [Fact + Interpretation; §8]
8. **Turn on User Install.** Commands then work in any server or DM without a server admin. Pair it with public result messages that carry "Open full comparison", "Add to server" and "Add to my apps" buttons. That is the main viral loop. [Fact + Interpretation; §8]
9. **Best three non-TikTok channels:** (1) Discord (App Directory, user install, shareable results), (2) Google organic via the eight pages, (3) Reddit through genuine participation and sanctioned launch threads. Shareable result cards power all three. YouTube Shorts is a near-free fourth once TikTok clips exist. [Interpretation; §9]
10. **Steam compliance gaps.** The site has no "Powered by Steam" link, which Steam's /dev page says "Each page that uses the Steam Web API must contain". The privacy policy doesn't name the country where Steam data is stored, which the ToU requires. Login uses a custom Steam-logo button rather than Valve's official "Sign in through Steam" images. [Fact + Observation; §10]

---

## 2. Current-state findings in this repo (working tree on 2026-10-03; other agents are mid-retrofit)

| # | Finding | Where | Why it matters | Fix | Label |
|---|---|---|---|---|---|
| 1 | Root layout sets `alternates: { canonical: "/" }` (added by the in-progress retrofit) | `src/app/layout.jsx` | Shallow merge: child segments that don't set `alternates` inherit it, so every page canonicalizes to `/`. Google may then drop the inner pages | Delete it from the root layout. Set `alternates.canonical` on each indexable `page.jsx` | [Fact] merge rule (N1) + [Observation] code |
| 2 | `metadataBase` was missing in the old layout; the retrofit now adds `new URL(SITE_URL)` | `src/app/layout.jsx` | Without it, Next resolves relative OG URLs to the Vercel production URL or **localhost**, which breaks Discord/X previews. The docs say it's a build error | Keep the retrofit change | [Fact] (N1, N9) |
| 3 | Sitemap uses `lastModified: new Date()` for every URL, plus `priority`/`changefreq`; no blog posts | `src/app/sitemap.js` | Google ignores priority/changefreq and uses lastmod only when "consistently and verifiably" accurate | Real per-page dates; add the new landing pages and guides; drop the ignored fields | [Fact] (G20) |
| 4 | `/[id]` catch-all is a client component with no metadata. Any path renders a Steam dashboard with status 200 | `src/app/[id]/page.jsx` | Soft-404s, an unbounded URL space, and indexable pages about arbitrary Steam users. `/compare` (now linked by the bot) would be captured by this catch-all if no `/compare` route ships | Server wrapper: validate the ID, return `notFound()`, set `robots: { index: false }`, keep out of the sitemap | [Fact] (G23) + [Observation] |
| 5 | `/profile/[id]` is client-only with no metadata | `src/app/profile/[id]/page.jsx` | The same thin, user-specific pages | Server wrapper + noindex (or index only opt-in public profiles with substantive content) | [Interpretation] |
| 6 | Blog posts are changelogs ("Getting Ready to Launch…", "Progress & Roadmap") | `src/app/blog/data.js` | They match no search demand. Fine as a changelog, but not an SEO asset | Keep them as `/changelog`-style updates; put the effort into the two guides in §4 | [Interpretation] |
| 7 | No JSON-LD anywhere | `grep application/ld+json` → none | No site-name preference signal, no Organization logo | See §7 | [Observation] |
| 8 | Hardcoded testimonials with star ratings | `src/app/components/TestimonialsSection.jsx` | Never mark these up as Review/AggregateRating. Google requires genuine user ratings, and these can't be verified | Leave them unmarked. Get consent if they are real users | [Fact] (G17) + [Interpretation] |
| 9 | No "Powered by Steam" link; privacy policy names no storage country; custom Steam-emblem login button | footer, `src/app/privacy/page.jsx`, `SteamLoginButton.jsx` | Steam requirements, quoted in §10 | §10.5 | [Fact] + [Observation] |
| 10 | Bot install URL is server-only (`scope=bot applications.commands`, permissions 18432) | `src/lib/site.js` | No user-install path, so the bot can't spread through individual users | Add an `integration_type=1` link, or switch to the Discord Provided Link, which lets the user choose | [Fact] (D5, D15) |
| 11 | Bot welcome text says "Welcome to **Steamer**!", while the site says WeBothPlay | `bot/index.js` | Inconsistent brand naming across the App Directory, the site name and search | Use one name everywhere | [Observation] |

The retrofit has already fixed or is fixing several things, which this doc does not re-recommend: the HMAC-signed, 1-hour `/link` URL (`bot/utils/api.js linkUrl`), UTM-tagged `compareUrl`, bot API key auth, and removing AdSense from the root layout. One caveat on the signed link: if `DISCORD_LINK_SECRET` is unset, `linkUrl` emits an unsigned URL. The website must reject unsigned or expired links, not accept them. [Observation]

---

## 3. Search demand & SERP observations

All results below are **[Observation]** from WebSearch runs on 2026-10-03 (US; engine unspecified; tool order, not Google positions).

### 3.1 Cluster A: library comparison ("compare steam libraries", "steam games in common", "find steam games friends own", "games we both own steam")

- **What showed up**
  - **Steam Community threads (2014–2024)** asking this exact question, many of them. Also a Tildes thread, "Is there a tool/method to find games you have in common with someone else?".
  - **Explainers**: cyberpost.co "Can you compare Steam library", and squadroll.com "How to Find Games Everyone Owns on Steam (2026 Guide)".
  - **Tool sites**, when the query adds "tool"/"website"/"multiple friends": steamnavigator.com/compare_games (up to 4 players), steamr.io/games-in-common, steamcompanion.com/compare (up to 8 friends, plus a "difference" view), steamfriends.io, steamlibrarycompare.com ("unlimited players", compatibility scoring), pickaga.me, steamcompare.games, steamparty.azurewebsites.net, lorenzostanco.com/lab/steam/friends, sfn.sheev.net (codeberg kevinfiol/sfn).
  - **GitHub projects**: adriansteffan/steam-library-checker, dilaouid/steam-wgp.
  - **webothplay.com/about** appeared for "what game should we play with friends tool steam libraries decide". **Parasite-style pages also ranked**, e.g. games.rjuuc.edu.np "Steam Games In Common" and grad-programs.info.ncsu.edu "4+ Ways To Share Your Steam Library with Friends".
- **Steam's native answer**, as summarized from results:
  - A friend's Games page has a filter for games you both own.
  - The Library filter by friends can be saved as a Dynamic Collection (Steam beta, Sept 2022; GamingOnLinux: https://www.gamingonlinux.com/2022/09/steam-beta-lets-you-create-a-collection-filtered-by-games-you-and-friends-own/).
  - Right-clicking a friend gives "Find Games to Play Together", which pre-fills the filter and the Multiplayer tag.
  - I did not verify this on Valve pages.
- **Intent**: split. Head terms are informational how-tos, answered by Steam's own features. "Tool/multiple friends" modifiers are transactional (use a tool).
- **Implication**: own both. The home page is the tool. One guide honestly explains the native methods and their 1:1 limits, then shows when a group tool helps. [Interpretation]

### 3.2 Cluster B: decision/picker ("what steam game should we play", "multiplayer game picker", "friend group game picker")

- **"what steam game should we play"**: generic listicles (GamesRadar "25 Best Steam games you can play right now", TechSpot, Inquirer), forum threads, parasite pages (cache.studiobinder.com, wep.iot.nokia.com). The query doesn't match a tool intent.
- **"multiplayer game picker" / "friend group game picker"**
  - PickThe.Games: swipe-voting, crossplay checks, about 6,100 games, "free… no ads… no premium tier" per a playxarena.com guide.
  - Pickaru: generic group swipe.
  - A Tines "game picker" mini-app story, plus App Store finger-pickers.
  - Steam-specific group pickers: SquadRoll (party code) and SteamWGP (swipe until unanimous).
- **Implication**: "group decision" is an emerging category with funded-looking and free competitors. Voting/veto inside the comparison is a better differentiator than a standalone "picker" page. [Interpretation]

### 3.3 Cluster C: randomizer ("steam game roulette", "random steam game picker")

- **Plain "steam game roulette"**: ambiguous. Results were games (Buckshot Roulette, Roulette Dungeon, Roulette Hero) plus an old Kill Screen piece about a "Steam Roulette" service.
- **With modifiers ("spin wheel library", "from my library website")**: steam-roulette.com, steamrandomizer.com, randomsteam.kgivler.com, thewheelhaus.com ("Steam Roulette" format popularized by Funhaus), randomgamepicker.com/library, pickaga.me, backlogrouletteapp.com, spinthewheelrandompicker.com wheels, a WordPress plugin ("LoginOne Random Game Picker for Steam"), and many GitHub repos.
- **Implication**: crowded and solo-focused. WeBothPlay's angle is **group** roulette, drawing only from games everyone owns, with optional co-op-only and unplayed filters. Title and H1 should use searcher language ("Steam roulette for groups"). [Interpretation]

### 3.4 Cluster D: backlog ("steam backlog")

- **Articles**: PCWorld "It's time to admit I just don't want to play my Steam backlog", Gigazine on a backlog-value estimate (2024-06-26), bossrush.net guide, aywren.com on Dynamic Collections.
- **Many purpose-built tools**: Backlog Coach (with a "Best Steam Backlog Manager Tools in 2026" listicle), VaultShuffle, Backlog Shuffle (AI), Backlog Roulette, pickaga.me, a Tinder-style swiper (games.gg news), GitHub self-hosted tools.
- **Implication**: solo-backlog tools are saturated. Own only the **group backlog** job ("owned by all of us, played by none"). Don't fight for "steam backlog" head terms. [Interpretation]

### 3.5 Cluster E: co-op ("co-op game finder", "games to play with friends steam")

- **"co-op game finder"**: Co-Optimus (long-running co-op database), a Gamepressure news piece on a "Steam Group Game Finder" site, an old ShinyLoot article.
- **"games to play with friends steam"**: standard results were dominated by **hijacked-subdomain/parasite pages**: mgmt.pabau.com/news/…, services.flexco.com, my.homepage.net/news/…, app.atlantaleasing.com/news/…, dosf2-tkd.advision-ecommerce.com, plus a SteelSeries blog.
- **"best games to play with friends on steam 2026"**: GameSpot gallery, GameRant, gaming.net ("October 2026"), a Substack ("friendslop"), driffle, TechTimes.
- **Implication**: listicle intent with strong editorial incumbents. It is also the content type Google calls "commodity" (§5.4). A useful page here is a filter tool ("co-op games your group already owns"), not a list. [Interpretation]

### 3.6 Competitor landscape (tools seen)

| Job | Tools observed (2026-10-03) | Gap WeBothPlay can own [Interpretation] |
|---|---|---|
| Multi-friend overlap | SteamCompanion (≤8), Steam Navigator (≤4), Steamr, SteamFriends.io, Steam Library Compare, Pick a Game, SteamParty, Steam Compare, sfn | 2–12 players; private-profile diagnosis (JTBD F3); wishlist overlap; Discord-native use |
| Group decision | PickThe.Games, SquadRoll, SteamWGP, Pickaru | Decide only among games the group already owns, inside Discord |
| Randomizer | steam-roulette.com, Wheelhaus, Steam Randomizer, RandomGamePicker, Backlog Roulette | Group roulette with co-op/unplayed filters and a share card |
| Backlog | Backlog Coach, VaultShuffle, Backlog Shuffle, pickaga.me | The group backlog |
| Co-op discovery | Co-Optimus, editorial lists | Co-op filter over owned libraries, honest about player-count gaps (JTBD §4.3) |

### 3.7 Volume indications

- **[Fact]** No public keyword-volume figures were obtainable in-session. Semrush's public pages were blocked, and no reachable public page showed volumes for these queries.
- **[Observation]** Qualitatively, demand is real but niche:
  - At least 10 small tools target cluster A and C queries.
  - The same question recurs on Steam forums from 2014 to 2024.
  - Steam shipped native features for it (2022 beta).
- **[Interpretation]** Head terms like "games to play with friends" are large but editorial and AI-Overview-exposed. Tool long-tails are small but convertible. Measure with Google Search Console (impressions per page and query) 6–8 weeks after the pages launch. Don't guess.

---

## 4. Recommended information architecture (start with ≤8 indexable pages)

### 4.1 Pages to build

| # | URL (suggested) | Type | Primary cluster / intent | Unique value (must exist, or don't publish) | Schema |
|---|---|---|---|---|---|
| 1 | `/` | Tool | A: "compare steam libraries", "steam games in common", "games we both own" | Compare 2–12 libraries; shared / only-you / unique; private-profile detection with fix steps; works without login (paste profile URLs) | WebSite, Organization, WebApplication (no rating) |
| 2 | `/roulette` | Tool | C: "steam roulette for groups", "random game we all own" | Random pick from the group's shared games; co-op-only and unplayed toggles; reroll; share card | WebApplication? (optional), BreadcrumbList |
| 3 | `/backlog` | Tool | D (group angle) | "Owned by all of us, played by none"; sort by playtime gaps; share card | BreadcrumbList |
| 4 | `/coop` | Tool | E (tool angle): "co-op games we all own" | Shared games filtered by Steam categories (Online Co-op 38, Remote Play Together 44; see JTBD §4.3). Must say "player count unknown" where it is; never invent caps | BreadcrumbList |
| 5 | `/wishlist` | Tool | "games we both want / buy together" (**hypothesis, unvalidated**) | Overlap of wishlists via `IWishlistService/GetWishlist` (JTBD §4.2); sale planning | BreadcrumbList |
| 6 | `/discord` (consolidates `/commands`) | Product | "steam discord bot compare games" | Install to server or to your account (two buttons); command reference with real screenshots | BreadcrumbList, VideoObject if a demo video is primary |
| 7 | `/guides/find-games-everyone-owns-on-steam` | Guide | A/B informational | First-hand, step-by-step native Steam methods (filter, Dynamic Collection, "Find Games to Play Together") with screenshots; where each breaks (1:1, client-only, privacy); when a group tool helps | Article, BreadcrumbList |
| 8 | `/guides/steam-game-details-privacy` | Guide / support | Troubleshooting that every comparison hits | Exact settings path; "profile public ≠ game details public" (JTBD §4.1); how to verify; what WeBothPlay can and can't see | Article, BreadcrumbList |

**Pages 2–5 must not be thin doorways.** Each needs distinct functionality and copy. Google's doorway policy names "Creating substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy" (G1). If `/coop` or `/wishlist` can't offer distinct function at launch, make them sections or filters on `/` instead. [Fact + Interpretation]

**Phase 2 (link asset, only with real data):** "What friend groups actually own." Aggregated, anonymized stats from N comparisons (overlap %, most-shared co-op games). This is the "proprietary asset" type that correlated with gains in a 400-site core-update analysis (T4). Check it against the Steam ToU data clauses (§10) and the privacy policy first. [Interpretation]

### 4.2 Keep out of the index (noindex, crawlable, not in the sitemap)

`/[id]` dashboards, `/profile/[id]`, `/compare?p=…` results, any short-code share page (`/c/[code]`), `/dashboard`, `/auth/*`, `/upgrade/claim`.

- **Why noindex rather than robots.txt:** "For the `noindex` rule to be effective, the page or resource must not be blocked by a robots.txt file" (G22).
- **Why keep share pages crawlable:** so Discord/X/Reddit crawlers can read their OG tags. Discordbot gets blocking metadata in `<head>` (N8).

[Fact + Interpretation]

### 4.3 Thin or unhelpful content to avoid, and why

| Avoid | Why | Label |
|---|---|---|
| Per-game pages ("play X with friends", "games like X co-op") generated from Steam data | Scaled content abuse examples include "Scraping feeds, search results, or other content to generate many pages … where little value is provided to users" (G1) | [Fact] policy / [Interpretation] application |
| Pages per query variant ("compare steam libraries with 3 friends / 4 friends…") | Google's AI guide: creating "separate content for every possible variation of how people might search … violates Google's scaled content abuse spam policy" (G7) | [Fact] |
| "Best co-op games 2026" listicles | "Commodity content (for example, something like '7 Tips for First-Time Homebuyers') is often based on common knowledge…" (G7). Editorial incumbents dominate (§3.5); AI Overviews cut clicks hardest on informational queries (T1, T2) | [Fact] + [Interpretation] |
| AI-written blog posts at volume | "Are you using extensive automation to produce content on many topics?" (G28) | [Fact] |
| Indexable user/comparison pages | Thin, unbounded, user-specific; ToU says retrieve data "as requested by the end user" (§10) | [Interpretation] |
| FAQ schema for rich results | Feature deprecated as of 2026-05-07 (G9b) | [Fact] |
| Marking up testimonials as reviews | Ratings must be genuine; never fabricate | [Fact] (G17) |

### 4.4 Internal linking & conversion paths [Interpretation]

- Every tool page links to the others in a "Next step" row (Compare → Roulette / Backlog / Co-op / Wishlist) and to `/discord`.
- Guides link to the tool with pre-filled state. Example: the privacy guide's "Check again" button re-runs the user's comparison.
- Result screens offer "Share card", "Open in Discord" and "Add the bot".

---

## 5. Google 2024–2026 guidance that constrains the plan

### 5.1 Helpfulness is part of core ranking (since March 2024)

- **[Fact]** "we have enhanced our core ranking systems to show more helpful results using a variety of innovative signals and approaches. There's no longer one signal or system used to do this". The same post announced three new spam policies: expired domain abuse, scaled content abuse and site reputation abuse. Site reputation enforcement started May 5, 2024.
  - Source: G2, https://developers.google.com/search/blog/2024/03/core-update-spam-policies (2024-03-05).
  - **Why it matters:** there's no separate "helpful content system" to game. Page-level usefulness is evaluated by core systems.
- **[Fact]** Self-assessment questions Google publishes:
  - "Does your content clearly demonstrate first-hand expertise…?"
  - "Are you producing lots of content on many different topics in hopes that some of it might perform well in search results?"
  - "Are you writing to a particular word count…? (No, we don't.)"
  - Source: G28, https://developers.google.com/search/docs/fundamentals/creating-helpful-content (Last updated 2025-12-10; mirror).
  - **Why it matters:** the two guides should be written from hands-on testing, with screenshots.

### 5.2 Spam policies relevant to a small utility site (current text)

Source for all quotes: G1, https://developers.google.com/search/docs/essentials/spam-policies. "Last updated 2026-04-13 UTC" per the mirror; the 2026-06-02 mirror adds the AI wording in the first row.

| Policy | Exact wording (excerpt) | Why it matters for WeBothPlay | Label |
|---|---|---|---|
| Definition of spam (2026) | "…attempting to manipulate Search systems into ranking content highly or attempting to manipulate generative AI responses in Google Search." The changelog (May 2026) says "Clarified that our spam policies also apply to generative AI responses" | "GEO hacks" are covered by spam policy too | [Fact] |
| Scaled content abuse | "…when many pages are generated for the primary purpose of manipulating search rankings and not helping users… no matter how it's created." | Rules out programmatic per-game or per-variant pages | [Fact] |
| Doorway abuse | "…sites or pages are created to rank for specific, similar search queries. They lead users to intermediate pages that are not as useful as the final destination." | Tool pages must each be the final destination | [Fact] |
| Misleading functionality | "A site that claims to provide certain functionality (for example, PDF merge, countdown timer, online dictionary service), but intentionally leads users to deceptive ads rather than providing the claimed services" | If AdSense returns, ads must never sit where the tool's result or CTA should be | [Fact] |
| Site reputation abuse | "…a tactic where third-party content is published on a host site mainly because of that host's already-established ranking signals…" (2026 wording). Earlier: "no amount of first-party involvement alters the fundamental third-party nature of the content" (G2b, 2024-11-19). From 2026-08-30, manual actions under this policy don't apply to EEA users (G3, 2026-08-28) | Don't host guest posts or sponsored articles for SEO. Also explains the parasite pages seen in §3.5 | [Fact] |
| Back button hijacking (new) | "It occurs when a site interferes with a user's browser navigation and prevents them from using their back button…"; enforcement from **2026-06-15** (G4, 2026-04-13) | Roulette and result flows must not push fake history entries | [Fact] |

### 5.3 Update timeline that matters (2025–2026)

| Date | Event | Source | Label |
|---|---|---|---|
| 2025-03-13 | March 2025 core update; AI Overviews grew sharply afterwards (Ahrefs: +116% Mar 12 → May 6) | T3 https://ahrefs.com/blog/ai-overview-growth/ (2025-05-13) | [Observation] |
| 2025-06 | June 2025 core update | Semrush article linking the Google status incident | [Observation] |
| 2025-12 | December 2025 core update. An analysis of 400+ sites found "proprietary assets" like original data and tools were the third-strongest predictor of gains | T4 https://ahrefs.com/blog/information-gain/ (2026-08-20), citing Cyrus Shepard | [Observation] supports the tool-first strategy |
| 2026-02-05 | February 2026 Discover core update | G29 https://developers.google.com/search/blog/2026/02/discover-core-update | [Fact] |
| 2026-03 | March 2026 core update | Referenced by an Amsive "winners/losers" analysis cited in T4 | [Observation] |
| 2026-04-13 | Back-button-hijacking policy (enforced 2026-06-15) | G4 | [Fact] |
| 2026-05-07 | FAQ rich results stop appearing | G9b (docs changelog, May 2026) | [Fact] |
| 2026-06-24→26 | June 2026 spam update; per Google's comments to SER, not aimed at link spam or site reputation | T5 https://www.semrush.com/blog/google-completes-spam-update-rollout/ (2026-06-30) | [Observation] |
| 2026-08-18→21 | August 2026 spam update (third of 2026) | T6 https://www.semrush.com/blog/google-august-2026-spam-update/ (2026-08-26) | [Observation] |

### 5.4 AI Overviews / AI Mode and utility sites

- **[Fact] Eligibility.** "To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet… There are no additional technical requirements." AI features "may use a 'query fan-out' technique".
  - Source: G6, https://developers.google.com/search/docs/appearance/ai-features (mirror 2026-06-02).
- **[Fact] No special markup.** "LLMS.txt files and other 'special' markup: You don't need to create new machine readable files…" and "Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add."
  - Source: G7, https://developers.google.com/search/docs/fundamentals/ai-optimization-guide (announced 2026-05-15).
  - **Why it matters:** skip llms.txt and "AEO" work. Spend the effort on the tool and the guides.
- **[Fact] Measurement.** AI Mode data counts toward Search Console totals (changelog, June 2025). Dedicated "Search Generative AI performance reports" launched to "a subset of websites" on 2026-06-03.
  - Source: G8, https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports.
- **[Observation] Click impact (third-party).**
  - Ahrefs: an AI Overview correlated with a **34.5%** lower CTR for position 1 (March 2025 data; 2025-04-17, https://ahrefs.com/blog/ai-overviews-reduce-clicks/).
  - The rerun found **58%** lower (December 2025 data; 2026-02-04, https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/).
  - Ahrefs also reports that 99.2% of AIO-triggering keywords are informational.
  - Google's own position: clicks from AIO pages "are higher quality" (G5, 2025-05-21).
- **[Interpretation] What this means here.**
  - "Do-something" queries ("compare steam libraries") are far less exposed than informational listicles.
  - Tool pages should still carry a crisp server-rendered explanation (what it does, steps, limits), so AI features can cite them.
  - Track conversions (comparisons run, bot installs), not just clicks.

---

## 6. Technical SEO checklist: Next.js App Router (Next 16)

Doc links are canonical nextjs.org / Google URLs (read via the official repo and mirrors, §0).

| # | Item | Doc / evidence | Repo status (2026-10-03) | Priority |
|---|---|---|---|---|
| 1 | `metadataBase: new URL('https://webothplay.com')` in the root layout | N1 https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase: "Using a relative path in a URL-based `metadata` field without configuring a `metadataBase` will cause a build error." Framework source falls back to "the Vercel production deployment, and localhost as a last resort" (N9) | Added by retrofit | P0 ✓ |
| 2 | **Per-page canonical, never in the root layout** | N1 merging: "Metadata objects exported from multiple segments … are **shallowly** merged"; fields not redefined are inherited. Google: "Use absolute paths rather than relative paths with the rel="canonical" link element" (G21, Last updated 2026-03-27). `metadataBase` turns `/x` into an absolute URL | **Bug: root sets canonical "/"** | P0 |
| 3 | Title template without duplicate branding | `title: { default, template }` (N1). Google: "Avoid repeated or boilerplate text in <title> elements" (G27) | Retrofit uses the template "%s · WeBothPlay". Strip "- We Both Play" from child titles | P1 |
| 4 | Metadata only from Server Components | "`generateMetadata` and the `metadata` export are only supported in Server Components" (N1) | `/[id]` and `/profile/[id]` are client pages, so wrap them | P0 |
| 5 | Shared OG fields: spread them, don't redefine | "nested fields such as `openGraph` and `robots` … are **overwritten** by the last segment to define them" (N1) | Use a `shared-metadata.js` helper | P1 |
| 6 | `opengraph-image.tsx` per route (1200×630) via `ImageResponse` from `next/og`; `twitter-image` optional | N2 https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image: OG ≤ 8MB, Twitter ≤ 5MB; images are statically optimized unless they use request-time data; props receive **`params` only**. N3 https://nextjs.org/docs/app/api-reference/functions/image-response: "Only flexbox and a subset of CSS properties"; "Maximum bundle size of `500KB`"; fonts ttf/otf/woff | Old layout used `/logo.png` declared 1200×630 | P0 for share pages |
| 7 | Dynamic share images: use path-based short codes (`/c/[code]`) so `opengraph-image` gets `params`. Alternatively, set `openGraph.images` to a route handler in `generateMetadata` (which receives `searchParams`) | N1, N2 | `generate-short-code` API exists | P1 [Interpretation] |
| 8 | Link-preview bots get blocking metadata | N8 https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots. The default list includes `Discordbot`, `Twitterbot`, `Slackbot`, `redditbot`, `facebookexternalhit`, `LinkedInBot`, `WhatsApp` (source `html-bots.ts`). Googlebot may receive streamed metadata in `<body>`, which Next says it verified. Google: "will respect robots meta tags in the body section … as well" | Nothing to do. Don't set `htmlLimitedBots: /.*/` unless needed | Info |
| 9 | noindex user-specific routes with `robots: { index: false, follow: true }`. Keep them crawlable | G22: noindex must not be blocked by robots.txt. Changelog Dec 2025: "If there's a possibility that you do want the page indexed, don't use a noindex tag in the original page code" | Not done | P0 |
| 10 | Real 404s for invalid IDs: `notFound()` from a server component | G23 https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics (Last updated 2026-03-04): avoid soft 404s in SPAs. Changelog Dec 2025: non-200 pages "might not" be sent to rendering | Not done | P0 |
| 11 | `sitemap.js` with real `lastModified`; include tools and guides; exclude noindex URLs; use `generateSitemaps` if it ever exceeds 50,000 URLs | N4 https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap ("special Route Handler that is cached by default"). G20 https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap (Last updated 2025-12-10): "Google ignores `<priority>` and `<changefreq>` values" | Needs work | P1 |
| 12 | `robots.js`: allow `/`, disallow `/api/`, point to the sitemap. Don't disallow pages that carry noindex | N5 https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots; G21: "Don't use the robots.txt file for canonicalization purposes" | OK | Info |
| 13 | Icons via file conventions: `app/favicon.ico` (top level only), `app/icon.png`, `app/apple-icon.png` | N7 https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons | Old layout referenced a missing `/favicon.ico` and `/apple-icon.png`; the retrofit now points to `/icon.png` | P2 |
| 14 | JSON-LD as `<script type="application/ld+json">` in `layout`/`page`, escaping `<` as `<` | N6 https://nextjs.org/docs/app/guides/json-ld | None yet | P1 |
| 15 | Server-render indexable copy on tool pages (H1, intro, steps, limits); hydrate the tool | G6: must be indexable with a snippet. Changelog March 2026: using JavaScript "is not 'making it harder for Google Search'", but rendering is still conditional | Mixed | P0 |
| 16 | Canonical consistency with JS: same canonical in the initial HTML and after rendering, or none in the initial HTML | Changelog Dec 2025 (G-CL) | Next renders metadata server-side, so OK | Info |
| 17 | Core Web Vitals: LCP ≤ 2.5 s, INP < 200 ms, CLS < 0.1 | G24 https://developers.google.com/search/docs/appearance/core-web-vitals (Last updated 2025-12-10). INP replaced FID in March 2024 (G26, 2023-05-10 announcement; web-vitals v5 removed `onFID`). "Core Web Vitals are used by our ranking systems… There is no single signal" (G25) | AdSense is out of the layout (good); GA uses `afterInteractive` | P1 |
| 18 | `og:image` doubles as a search thumbnail source | Changelog March 2026: "Google uses both schema.org markup and the `og:image` meta tag as sources when determining image thumbnails in Google Search and Discover." | Make OG images clean and legible | P1 |
| 19 | Site name: WebSite JSON-LD on the home page with `name` "WeBothPlay" and `alternateName` "We Both Play" | G19 https://developers.google.com/search/docs/appearance/site-names: "`WebSite` structured data is most important, if you want to specify a preference"; it must be on the home page | None | P1 |
| 20 | Search Console: verify the domain property, submit the sitemap, watch Pages / Performance / CWV, and the Gen-AI report if enabled | G8 | Unknown | P0 |

**Minimal root-layout pattern** [Interpretation, based on N1]

```js
// app/layout.jsx: no canonical here
export const metadata = {
  metadataBase: new URL('https://webothplay.com'),
  title: { default: 'WeBothPlay: Compare Steam libraries with friends', template: '%s · WeBothPlay' },
  openGraph: { siteName: 'WeBothPlay', type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
};

// app/roulette/page.jsx (server component wrapping a client tool)
export const metadata = {
  title: 'Steam roulette for groups',
  description: 'Spin a random game from the Steam games your whole group already owns.',
  alternates: { canonical: '/roulette' },
};

// app/[id]/page.jsx (server wrapper)
export const metadata = { robots: { index: false, follow: true } };
```

---

## 7. Structured data recommendations (eligibility as of 2026)

| Type | Google status 2026 | Use on | Notes | Label + source |
|---|---|---|---|---|
| **WebSite** (site name) | Supported | `/` only | `name` "WeBothPlay", `alternateName` "We Both Play", `url` | [Fact] G19 |
| **Organization** | Supported (logo, knowledge panel) | `/` or `/about` | "There are no required properties"; add `logo`, `url`, `sameAs` (Discord, TikTok, YouTube, GitHub) | [Fact] G18 https://developers.google.com/search/docs/appearance/structured-data/organization |
| **BreadcrumbList** | Supported; **desktop display only** since 2025-01-23 | Tool pages, guides | "we continue to support breadcrumb markup for use in desktop search results" | [Fact] G14 https://developers.google.com/search/blog/2025/01/simplifying-breadcrumbs |
| **Article / BlogPosting** | Supported (still in the search gallery) | Two guides, real posts | Helps titles, dates and images. Use visible author and dates | [Fact] G15 |
| **SoftwareApplication / WebApplication** | Supported, but the rich result needs `name`, `offers.price` (0 if free) and **one of** `aggregateRating`/`review` | `/` | "For mobile applications and web applications, Google also supports MobileApplication and WebApplication." Use `applicationCategory` `UtilitiesApplication` or `EntertainmentApplication`. Review rules: "Don't aggregate reviews or ratings from other websites"; the self-serving ban is specific to LocalBusiness/Organization. **Expect no rich result** unless real, visible, first-party user ratings exist. Never fabricate | [Fact] G16 https://developers.google.com/search/docs/appearance/structured-data/software-app, G17 …/review-snippet; [Interpretation] |
| **VideoObject** | Supported | `/discord` or the home page, if a demo video is the main content | The repo has demo MP4s (`public/panels/*.mp4`) | [Fact] G15; [Interpretation] |
| **FAQPage** | **Deprecated**: "This feature will no longer appear in Google Search starting May 7, 2026." (From Aug 2023 it was limited to "well-known, authoritative government and health websites".) | None for rich results | FAQ *content* is fine for users | [Fact] G9b changelog (May 2026); G9 https://developers.google.com/search/blog/2023/08/howto-faq-changes |
| **HowTo** | **Deprecated**: "As of September 13, Google Search no longer shows How-to rich results on desktop, which means this result type is now deprecated." | None | | [Fact] G9 (update 2023-09-14) |
| Retired in 2025 | Book Actions, Course Info, ClaimReview, Estimated Salary, Learning Video, Special Announcement, Vehicle Listing (announced 2025-06-12). Book Actions' banner was later removed "as there's still a feature using the markup" | n/a | | [Fact] G11 https://developers.google.com/search/blog/2025/06/simplifying-search-results; changelog Nov 2025 |
| Practice problem / Dataset | Practice problem "no longer shown in Google Search results" (docs removed Jan 2026); Dataset is "only used by Dataset Search, and not Google Search" | n/a | | [Fact] changelog |
| Sitelinks search box | Removed from results starting 2024-11-21 | n/a | | [Fact] https://developers.google.com/search/blog/2024/10/sitelinks-search-box |
| Any type, for AI features | Not required: "no special schema.org markup you need to add" | n/a | | [Fact] G7 |

**Home-page JSON-LD sketch** [Interpretation; validate with the Rich Results Test]

```json
[
  {"@context":"https://schema.org","@type":"WebSite","name":"WeBothPlay","alternateName":"We Both Play","url":"https://webothplay.com/"},
  {"@context":"https://schema.org","@type":"Organization","name":"WeBothPlay","url":"https://webothplay.com/","logo":"https://webothplay.com/icon.png","sameAs":["<discord invite>","<tiktok>","<youtube>"]},
  {"@context":"https://schema.org","@type":"WebApplication","name":"WeBothPlay","url":"https://webothplay.com/","applicationCategory":"UtilitiesApplication","operatingSystem":"Web","offers":{"@type":"Offer","price":0,"priceCurrency":"USD"}}
]
```

The WebApplication block describes the app but will not earn a Software App rich result without genuine ratings. That's fine; don't add fake ones.

---

## 8. Discord as distribution

### 8.1 Platform facts (Discord docs repo @ `c43598d`, 2026-10-02)

| # | Conclusion | Label | Source (URL, date) | What I learned | Why it matters |
|---|---|---|---|---|---|
| D-a | App Directory and App Launcher listing requires **verification** and opting into discovery | [Fact] | D4 https://discord.com/developers/docs/platform/discovery ; D2 …/discovery/enabling-discovery | "To appear here, your app needs to be verified and opted into discovery." The team owner must "complete identity and application verification". Appearance takes "up to 24 hours". Directory: https://discord.com/discovery/applications | A one-time chore that unlocks search inside Discord |
| D-b | Ranking and assets | [Fact] | D1 …/discovery/overview ; D3 …/discovery/best-practices | "Search results are ranked based on relevance to the query and popularity based on usage." Description ≤ 400 chars; Summary ≤ 200; "up to five words" as tags; images, video, support server. Ad-supported and IAP apps are tagged | Usage drives rank, so public, frequently used commands compound |
| D-c | Social discovery is built in | [Fact] | D1 | "When your app is used in a server, it may be visible to other users, allowing them to learn more about it and install it themselves from your app's profile." | Public results are acquisition |
| D-d | Install links gate directory eligibility | [Fact] | D5 https://discord.com/developers/docs/resources/application#install-links | Choosing "None" means "your app will not be eligible for the App Directory". "Discord Provided Links are limited to the `application.commands` and `bot` scopes". With User Install and Guild Install both enabled, the user picks | Use the Discord Provided Link, or two explicit buttons (`integration_type=0` / `1`, D15) |
| D-e | **User-installable apps** | [Fact] | D5 #installation-context; D6 …/interactions/application-commands#contexts; D8 change log 2024-06-27 | `integration_types`: `GUILD_INSTALL` 0, `USER_INSTALL` 1. `contexts`: `GUILD` 0, `BOT_DM` 1, `PRIVATE_CHANNEL` 2. These apply only to global commands. User installs are "visible only to the authorizing user", "limited to using commands", and must respect the user's permissions. GA since 2024-06-27; "Interaction responses are no longer forced to be ephemeral for servers with over 25 members." Discord recommends "supporting both installation contexts" | `/compare @friends` can spread user to user without a server admin |
| D-f | Limits in user-install-only use | [Fact] | D7 …/receiving-and-responding; D16 …/topics/permissions | "limited to 5 followup messages per interaction" when only user-installed. `USE_EXTERNAL_APPS`: "When disabled, … the responses will be ephemeral. This only applies to apps not also installed to the server." Default user-install settings support only `applications.commands` | Design one-message results (edit, don't follow up), and degrade gracefully |
| D-g | Response deadlines | [Fact] | D7 | "Interaction `tokens` are valid for **15 minutes** … but you **must send an initial response within 3 seconds**." Deferral types 5/6. Components V2 can't be set on the defer: "you must do that with the edit original response endpoint". Interaction endpoints are "not bound to the application's Global Rate Limit" | Always defer API-backed commands (most already do) |
| D-h | **Privileged intents changed on 2026-06-10** | [Fact] | D8 change log 2026-06-10; D10 …/gateway/getting-started-with-privileged-intent-review; D9 …/events/gateway#privileged-intents | "Once your app reaches 10,000 users, you'll need to apply for Privileged Intent access." Reapply "once per year". Apps "can continue joining servers … while their submission is under review". A 90-day window to apply after notice. "we have separated App Verification and the Privileged Intent review process." | The old "75/100 servers" mental model for intents is outdated |
| D-i | Verification threshold (servers) | [Fact] + [Unverified] | D9 | The gateway doc still says "For verified apps (required for apps in 100+ guilds)…". The current Developer Portal criteria and the "apply at 75 servers" detail were not verified (Help Center blocked) | Check the portal's App Verification page. Expect identity verification of the team owner |
| D-j | GUILD_MEMBERS alternatives | [Fact] | D11 …/gateway/you-might-not-need-a-privileged-intent | The intent gives member events and "the ability to request a complete list of every member". Without it: Get Guild Member, Search Guild Members, and "Interaction-provided member data … with no intent required". "Full member list to on-demand lookups…" | The server-perk scan and roster fetches can drop the intent |
| D-k | Rate limits | [Fact] | D12 …/topics/rate-limits | "All bots can make up to 50 requests per second". Invalid requests: "10,000 per 10 minutes" (401/403/429) means a temporary Cloudflare ban. Gateway: 120 events per 60 s per connection | Handle 429s and avoid per-member REST loops |
| D-l | **Components V2** (2025-04-22) | [Fact] | D13 …/components/overview & reference; change log 2025-04-22 | Section, Container, Separator, Text Display, Thumbnail, Media Gallery, File. `IS_COMPONENTS_V2` (`1<<15`) "disables traditional content and embeds". "Messages allow up to 40 total components". Legacy components "will **not** be deprecated" | Rich result cards with game art and buttons in one message |
| D-m | Linked Roles | [Fact] | D14 …/resources/application-role-connection-metadata | A bot with `role_connections_verification_url` appears as a role verification method. It writes metadata via `role_connections.write`. "An application can have a maximum of 5 metadata records." Integer and boolean comparisons | Admins can gate roles on WeBothPlay data (e.g. "linked Steam", "≥ 10 co-op games"), which keeps the app visible in role settings |
| D-n | OAuth2 `connections` exposes the user's **Steam** connection with a `verified` flag | [Fact] | D15 …/topics/oauth2 ; …/resources/user#connection-object | Scope `connections` "allows `/users/@me/connections` to return linked third-party accounts". Services include `steam`; the object has `id`, `verified`, `visibility`. Battle.net (from 2026-09-22) and Riot/League (from 2026-07-10) were removed from this endpoint after migrating to the Social SDK; Steam remains | One-click linking: "Login with Discord" can read a verified Steam ID. Platform risk noted |
| D-o | Other 2026 changes | [Fact] | D8 change log | Context-menu commands up to 15 per type (2026-03-03). Fuzzy autocomplete (2026-09-11). `CREATE_EVENTS` required to create scheduled events (from 2026-02-23). Channel obfuscation mandatory 2026-11-16: "If your bot only acts in channels it has permission to view, this change does not affect you". Age assurance (2026-09-22): most apps unaffected | A "Compare with me" user command and a `/gamenight` scheduled event are viable |
| D-p | Activities | [Fact] | D17 …/activities/overview | "web apps hosted in an iframe that use the Embedded App SDK", on desktop, mobile and web | Possible later (group roulette/voting in voice), but high effort |
| D-q | Install telemetry | [Fact] | D19 …/events/webhook-events | The Application Authorized webhook carries `integration_type` (0 server, 1 user) | Measure the user-install vs server-install mix |

### 8.2 Implications for the current bot

The bot uses Guilds, GuildVoiceStates and **GuildMembers**. `bot/utils/tierCheck.js` maps `guild.members.cache` for the Hacker server perk, and `/leaderboard` and `/hype` call `guild.members.fetch()`.

- **Today (under 10,000 users):** GuildMembers is a toggle, so nothing is blocked. [Fact, D-h]
- **At 10,000 reachable users:** apply within 90 days, justify the use case, and reapply every year. If you lose access, these features fail. [Fact, D-h]
- **Replacement design** [Interpretation, grounded in D-j]
  1. **Server perk:** a Hacker member runs `/perk activate` in a server. Store `guild_id → owner`, then check `interaction.guild_id` in the database. No member scan. Bonus: no bulk list of member IDs gets sent to the website API, which is better for data minimization.
  2. **Leaderboard / hype:** keep an opt-in roster. When a linked user runs any command in a guild, upsert `(guild_id, discord_id)`. Rank only roster members, and prune with Get Guild Member on demand.
  3. **Voice auto-detect:** keep GuildVoiceStates. It is not privileged.
  4. **Remove GuildMembers** from `bot/index.js` once 1–2 ship.
- **Note** [Interpretation]: `members.cache` holds only members the client has seen. The current perk check is unreliable anyway on large servers, so the redesign also fixes a bug.

### 8.3 Concrete bot UX recommendations (prioritized)

**P0**
1. **Enable User Install.** Re-register global commands with explicit contexts:
   - `/compare`, `/roulette`, `/compatibility`, `/stats`, `/backlog`, `/link`, `/help`: `integration_types: [0,1]`, `contexts: [0,1,2]`.
   - `/leaderboard`, `/hype`, perk commands: `integration_types: [0]`, `contexts: [0]`.
   - In user-only installs there is no guild cache. Read users from command options and say "add the bot to this server for voice-channel compare". [Fact D-e/D-f; Interpretation]
2. **Make results public and shareable.** Defaults:
   - `/compare` and `/roulette` results go to the channel. Errors, upsells and `/link` stay ephemeral.
   - Each result carries a 1200×630 card image (rendered by the website's `ImageResponse` endpoint) and buttons: **Open full comparison** (UTM link, as in the retrofit's `compareUrl`), **Reroll**, **Add to server**, **Add to my apps**.
   - If the response is forced ephemeral (`USE_EXTERNAL_APPS` off), say so briefly. [Interpretation]
3. **Drop the GuildMembers dependency** (§8.2).
4. **Verify the app and enable Discovery.**
   - Summary (≤ 200 chars) leads with the problem, e.g. "Can't decide what to play? See every game your whole squad owns — then spin for one."
   - Five tags such as steam, games, co-op, compare, roulette.
   - Add GIFs of real commands, a support server, and privacy/ToS links. Use one consistent name (WeBothPlay, not Steamer). [Fact D-a/D-b; Interpretation]

**P1**

5. **One-click linking:** website "Login with Discord" (`identify connections`). If a **verified** Steam connection exists, link it after the user confirms. Otherwise fall back to Steam OpenID with the signed `/link` URL. [Fact D-n; Interpretation]
6. **User context-menu command "Compare with me":** right-click any user, then Apps, then compare. Within the 15-per-type limit. [Fact D-o; Interpretation]
7. **Components V2 result layout:** a Container with a Media Gallery of shared-game capsules, a Section per pick with a "Launch in Steam" link button, and a Separator. Send it with the edit-original-response call after deferring. [Fact D-g/D-l]
8. **`/gamenight`:** pick or vote on a game, then create a Discord scheduled event with a link back. Needs `CREATE_EVENTS`; request it only for this command's install flow. [Fact D-o; Interpretation]

**P2**

9. **Linked Roles:** metadata such as `steam_linked` (bool), `coop_games_owned` (int ≥), `library_size` (int ≥). Admins create "Verified Steam" roles, and members link through WeBothPlay. [Fact D-m; Interpretation]
10. **Activity** for live group voting in voice. Only after traction. [Fact D-p; Interpretation]
11. **Measure:** Application Authorized webhooks by `integration_type`; UTM by command; ratio of result views to site visits. [Fact D-q]

### 8.4 Linking options compared [Interpretation]

| Option | Friction | Trust / security | Notes |
|---|---|---|---|
| Steam OpenID via signed bot link (current retrofit) | Medium: 2 sites | Good if the HMAC is enforced and unsigned links are rejected | Works for everyone; keeps Steam auth on Valve's page (see §10 password rule) |
| Discord OAuth2 `identify connections` | Low: 1 click for users with a verified Steam connection | Discord vouches for identity; `verified` flag | Not every user has Steam connected; endpoint deprecations show platform risk (D-n) |
| Linked Roles (`role_connections.write`) | Medium; admin setup | Server-visible | A distribution feature, not a replacement for linking |

### 8.5 Why bots spread, and the loop to build [Interpretation, grounded in D-c/D-b]

The loop: a user runs `/compare @a @b @c` and a public card lands in the channel. Friends see their names and overlap stats, which is identity plus curiosity. One tap on "Open full comparison" or "Add to my apps" turns them into users, and their usage raises directory rank (usage-ranked, D-b). Keep cards about **the group** (names, overlap %, "the game you all own but never played"), not about the product.

---

## 9. Other low-maintenance channels

### 9.1 Effort / impact (all [Interpretation] unless marked)

| Channel | Effort | Impact | Time to impact | Platform risk | Verdict |
|---|---|---|---|---|---|
| **Discord** (directory, user install, public results) | Medium once, then low | High, compounding | Weeks | Medium | **#1** |
| **Google organic** (§4 pages) | Medium once, low ongoing | Medium–high, compounding | 3–6+ months | Low–medium (tool queries are less AIO-exposed) | **#2** |
| **Reddit** (helpful answers + sanctioned launch threads) | Low–medium ongoing | Medium (spiky); threads also rank and get cited | Days | Medium (removals/bans) | **#3** |
| YouTube Shorts (repurpose TikTok edits) | Low marginal | Low–medium | Weeks | Low | Free #4 |
| Instagram Reels (repurpose) | Low marginal | Low | Weeks | Low | Optional |
| Hacker News Show HN | Low | Variable; links if it lands | One day | Low | One shot, technical framing |
| Product Hunt | Medium prep | Low–medium, one-off | One day | Low | Optional brand/backlink moment |
| Newsletters / creators | Medium | Unknown (no sourced economics found) | Weeks | Low | Free perk-for-usage deals first |
| Steam Curator page | Low | Low | Months | Low | Only with genuinely curated co-op lists [Unverified mechanics] |
| Email lifecycle | Medium setup | Low–medium retention | Ongoing | Low | Opt-in only; sale-time wishlist alerts |
| Share cards / referral loop | Medium (build once) | High multiplier | Immediate | Low | Build into every result |

### 9.2 Evidence per channel

**Reddit**
- **[Fact] Rule 2:** "Abide by community rules. Post authentic content into communities where you have a personal interest, and do not cheat or engage in content manipulation (including spamming, vote manipulation, ban evasion, or subscriber fraud) or otherwise interfere with or disrupt Reddit communities."
  - Source: R1, https://redditinc.com/policies/reddit-rules (OTA copy 2026-10-03).
- **[Fact] Spam definition:** "Spam – defined as repeated or unsolicited actions (whether automated or manual) that negatively affect redditors, communities, and/or Reddit itself – is never allowed."
- **[Fact] Advice to business owners:** "If your contributions to Reddit consist primarily of links to a business that you run, own, or otherwise benefit from, please be thoughtful about the frequency of posting, or consider advertising opportunities using our self-serve platform." And: "community moderators adjudicate what constitutes unwanted/spammy content in their communities".
  - Source: R2, "What constitutes spam? Am I a spammer?" (OTA copy 2026-10-03).
- **[Unverified] Subreddit rules** for r/Steam, r/pcgaming, r/gamingsuggestions and r/SideProject could not be read (Reddit blocked, search exhausted). Read each sidebar and wiki before posting.
- **[Observation] r/webdev "Showoff Saturday"**: several independent secondary sources (2022–2026) describe a Saturday-only project-sharing convention there (e.g. wasp-lang's 2022 launch post; 2026 GTM notes).
- **[Observation] Reddit's weight in AI citations fluctuates.** Semrush reports Reddit's share of ChatGPT Search citations fell from 3.8% to 0.5% in August 2026 (T6).
- **[Interpretation] Playbook**
  - Answer existing "how do we find games we all own" threads with the native-Steam method first, and disclose that you built WeBothPlay.
  - One launch post each in r/SideProject and Showoff Saturday, plus a gaming sub only if its rules allow tools.
  - Never repeat the same link across subs in a week.

**YouTube Shorts / Instagram Reels**
- **[Fact]** YouTube renamed "repetitious content" to "inauthentic content" on 2025-07-15, "to better clarify this includes content that is repetitive or mass-produced".
  - Source: Y1, YouTube channel monetization policies (OTA copy 2026-10-03: https://github.com/OpenTermsArchive/pga-versions/blob/main/YouTube/Content%20Monetisation%20Policy.md).
- **[Fact]** Instagram: "Content that is unoriginal or reproduced without making meaningful enhancements (commentary, parody, creative editing, etc.) cannot be monetized."
  - Source: I1, OTA `Instagram/Content Monetisation Policy.md` (2026-10-03).
- **[Observation, secondary] Shorts length:** "square/vertical videos up to 3 minutes uploaded on/after October 15, 2024 can be categorized as Shorts". This is how 2026 notes cite YouTube Help, "Understand three-minute YouTube Shorts". Instagram ranking signals (watch time, sends) are widely attributed to Adam Mosseri (Jan 2025); I didn't verify that against a primary source.
- **[Interpretation]** Export clean, watermark-free masters from the TikTok workflow, and vary hooks and captions per platform. Avoid mass-produced templated clips.

**Hacker News**
- **[Fact] Rules** (copies of https://news.ycombinator.com/showhn.html):
  - "Show HN is for something you've made that other people can play with."
  - "Off topic: blog posts, sign-up pages, newsletters, lists, and other reading material."
  - "Please make it easy for users to try your thing out, ideally without barriers such as signups or emails."
  - "Please don't ask friends to upvote or comment."
- **[Interpretation]** The compare tool qualifies because it works without login. Frame it technically, e.g. how 12 libraries are compared fast under Steam API limits and how privacy states are detected.

**Product Hunt**
- **[Observation, secondary 2026 notes quoting PH pages]**
  - "Once you've created a personal account, you will need to wait one week before you can post a product."
  - "you cannot ask people directly to upvote your product"
  - "12:01 am Pacific Time is the best time to launch."
  - PH publishes featuring guidelines (https://help.producthunt.com/en/articles/9883485-product-hunt-featuring-guidelines).
  - Sources: https://www.producthunt.com/launch ; https://help.producthunt.com/en/articles/481909-how-can-i-get-access-to-post.
- **[Interpretation]** Low value for a consumer gaming utility beyond a backlink and maker feedback. Do it once, after the share cards and Discord user install ship.

**Steam Curator**
- **[Unverified]** Curator pages can post recommendations with short blurbs and an external "full review" link.
- **[Interpretation]** A "Great with 4+ friends (co-op)" curator list linking to WeBothPlay's `/coop` filter is cheap to run if kept genuinely curated. Confirm Valve's curator rules first.

**Email lifecycle**
- **[Interpretation]** Steam OpenID gives no email, so collect it only with explicit opt-in. Low-touch sequence:
  1. Welcome, with "your group's top 3 unplayed shared games".
  2. Steam-sale alert: "2 of your group's shared-wishlist games are discounted".
  3. Monthly "new co-op overlap".
- Don't DM Discord users unprompted. Reddit-style "unsolicited" rules apply culturally on Discord too.

**Share cards and referral loops**
- **[Observation, secondary]** Semrush's analysis of Spotify Wrapped credits its shareability to data that lets users "express their personalities and compare their listening habits against their peers'", a story format, a campaign hashtag, and everyone getting results at once (https://www.semrush.com/blog/best-social-media-campaigns/, updated 2025-01-30; https://www.semrush.com/blog/content-marketing-examples/).
- **[Interpretation]** Design rules for WeBothPlay cards:
  1. About **us**: friend names and avatars, overlap %, "compatibility" score.
  2. One surprising stat ("You all own *Deep Rock Galactic*, and none of you has played it").
  3. Formats: 1200×630 for link unfurls (Discord/X/Reddit) and 1080×1920 for stories and TikTok.
  4. A short deep link with a `ref` code.
  5. Rendered server-side with `ImageResponse` (N3).
  6. Seasonal moments, e.g. a "Squad Year in Review" in December, borrowing the Wrapped and Steam Replay timing.

---

## 10. Steam API & brand compliance

**Verification note.** The live pages were not fetchable. Wording comes from **multiple independent verbatim copies** found via GitHub code search (the repos named below). One copy says the ToU page shows "Last updated July 2010". Re-read the live pages once before treating any quote as final.

### 10.1 Steam Web API Terms of Use: https://steamcommunity.com/dev/apiterms

| Clause (verbatim) | Copies seen | Why it matters for WeBothPlay | Label |
|---|---|---|---|
| "You are limited to one hundred thousand (100,000) calls to the Steam Web API per day. Valve may approve higher daily call limits if you adhere to these API Terms of Use." | huntingzhu/Steam_Recommendation_System; offish/SCMM; DeviousDrops/GameRec; Nieole/romcat; mobeck15/Game-Library (comment); tylerschloesser/dst-server-manager | Budget: a 12-person compare is at least 12 `GetOwnedGames` calls plus summaries. Cache aggressively and count calls per day | [Fact, via copies] |
| "You will post a privacy policy regarding the use of nonpublic end user data (including such Steam Data), and you will treat the Steam Data consistent with that policy. You will only retrieve Steam Data about a Steam end user as requested by the end user. You will inform the end user about any Steam Data you will store, and you will store the Steam Data in a country (or countries) identified in your privacy policy." | KyleTaylorLange/SOEN6111 README (full sentence); fragments in tylerschloesser, Nieole/romcat, Shaostoul/Humanity | Privacy policy must name the storage country. Fetch only on user action; no background crawling or indexable pages of non-users' data | [Fact, via copies] |
| "You agree to keep your Steam Web API key confidential, and not to share it with any third party." | tylerschloesser/dst-server-manager; fragment in Shaostoul/Humanity | Server-side key only (already the pattern) | [Fact, via copies] |
| "You may not use the Steam Web API or Steam Data in any way that violates the Steam Subscriber Agreement. You may not use the Steam Web API in any way that degrades the operation or performance of Steam or any games distributed via Steam." | Reddit comment quoting the ToU (2013, in ptsantar dataset); the second sentence is also in DeviousDrops/GameRec (2026) | Rate-limit yourself and back off on errors | [Fact, via copies] |
| "4. Acceptable Use. You agree not to use the Steam Web API, Steam Data, or Valve Brand & Links in any way that is unlawful, or harms Valve, … Valve may terminate your use of the Steam Web API, Steam Data and Valve Brand & Links at any time in Valve's sole discretion." | Same 2013 quote | Valve can terminate at will, so don't depend on undocumented endpoints for core features | [Fact, via copies] |
| No implied relationship with Valve (paraphrased as no statements that "assert or imply any other relationship with Valve" without written approval) | Fragment only (Shaostoul/Humanity, 2026-09-25) | Keep the "not affiliated with Valve" line; no Valve or Steam logos in branding | [Unverified wording] |
| Warranty disclaimer passed to end users: GOG's privacy policy states "In accordance with Valve's requirements, Steam Data is provided: (I) "AS IS," "WITH ALL FAULTS" AND "AS AVAILABLE,"…" | GOG privacy policy copies (sonu-gupta/tosdr corpus, MathTauAthogen/autoTOS) | Consider adding Valve's disclaimer to the Terms (verify the clause first) | [Observation] |

### 10.2 "Powered by Steam": Steam Web API documentation page https://steamcommunity.com/dev, section "Valve Brand and Links"

- **[Fact, via copies: BstWPY/WildGraphBench corpus; WPPlugins/steam-news-widget readme]** "Each page that uses the Steam Web API must contain a link to http://steampowered.com with the text "Powered by Steam". We suggest that you put this link in your footer so it is out of the way but still visible to interested users."
- **Correction to the brief:** this requirement sits on the **/dev documentation page**, under "Valve Brand and Links". It is not in the /apiterms text I could corroborate. The ToU does reference "Valve Brand & Links".

### 10.3 OpenID button and password rule (same /dev page)

- **[Fact, via copies]** "If you are using OpenID on your site, we request that you use one of the following buttons as your link to the Steam sign in page. These images represent the Steam brand to users, underscoring that Steam account credentials may be used to sign in to your site."
- **[Fact, via copies]** OpenID "allows your application to authenticate a user's SteamID without requiring them to enter their Steam username or password on your site (which would be a violation of the API Terms of Use.)"

### 10.4 Game capsule images

- **[Observation]** No Valve rule found that governs third-party display of store capsules. Steamworks art rules address developers, not third parties. The site hotlinks `cdn.cloudflare.steamstatic.com` / `cdn.akamai.steamstatic.com` capsules (`src/lib/site.js`).
- **[Interpretation]** Keep displaying official capsules unaltered, at native sizes, next to the game's name and a store link. Don't use game art in WeBothPlay's own logo, ads or OG branding beyond representing the user's actual games. Keep the non-affiliation notice, and honor takedown requests.

### 10.5 Gaps to fix

| Gap | Fix | Label |
|---|---|---|
| No "Powered by Steam" link on pages using the API | Footer link on every page: `<a href="https://steampowered.com/">Powered by Steam</a>`. This matches the /dev wording, which names http://steampowered.com; the https form of the same domain is fine | [Fact] requirement; [Observation] gap |
| Privacy policy lacks the Steam-data storage country (and lists Ko-fi but not the Stripe flow in the code) | Add "Steam data is stored in <country/region of DB host>" and the retention period; list all processors | [Fact] requirement; [Observation] gap |
| Custom Steam-emblem login button (`SteamLoginButton.jsx`, header) | Use Valve's official "Sign in through Steam" images for the OpenID link | [Fact] request; [Observation] gap |
| User-initiated fetching | Fetch friends' libraries only on explicit user action; cache briefly; no indexable pages of arbitrary Steam IDs (§4.2) | [Interpretation] of the "as requested by the end user" clause |
| Daily call budget | Track calls per day; alert at 70% of 100,000 | [Fact] limit; [Interpretation] |

---

## 11. Verify manually before acting

1. Live wording of https://steamcommunity.com/dev/apiterms and https://steamcommunity.com/dev ("Valve Brand and Links").
2. Discord Developer Portal → App Verification: current server threshold and criteria (docs still say "required for apps in 100+ guilds").
3. Sidebar rules of r/Steam, r/pcgaming, r/gamingsuggestions, r/SideProject, and r/webdev's Showoff Saturday.
4. Product Hunt featuring guidelines; YouTube and Instagram length limits on their help pages.
5. Steam Curator rules for external links.
6. Search demand: Search Console impressions per new page after 6–8 weeks; optionally Google Keyword Planner.
7. Whether `/compare` ships as a real route before the bot's new `compareUrl` goes live. Today it would be captured by `/[id]`.

---

## 12. Source register

**Google (canonical URLs; read via mirrors named in §0)**
- G1 Spam policies: https://developers.google.com/search/docs/essentials/spam-policies (Last updated 2026-04-13; AI wording in the 2026-06-02 crawl)
- G2 March 2024 core update & spam policies: https://developers.google.com/search/blog/2024/03/core-update-spam-policies (2024-03-05)
- G2b Site reputation abuse update: https://developers.google.com/search/blog/2024/11/site-reputation-abuse (2024-11-19)
- G3 Site reputation policy, EEA change: https://developers.google.com/search/blog/2026/08/update-site-reputation-policy (2026-08-28)
- G4 Back button hijacking: https://developers.google.com/search/blog/2026/04/back-button-hijacking (2026-04-13)
- G5 Succeeding in AI search: https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search (2025-05-21)
- G6 AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- G7 Optimizing for generative AI features: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide (blog 2026-05-15)
- G8 Gen AI performance reports: https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports (2026-06-03)
- G9 HowTo & FAQ changes: https://developers.google.com/search/blog/2023/08/howto-faq-changes (2023-08-08; update 2023-09-14)
- G9b / G-CL Documentation changelog ("What's new"): https://developers.google.com/search/updates (FAQ deprecation, May 2026; JS clarifications, Dec 2025; og:image, Mar 2026; practice problem, Jan 2026)
- G10 FAQPage doc: https://developers.google.com/search/docs/appearance/structured-data/faqpage (Last updated 2026-04-08, before the deprecation notice)
- G11 Simplifying search results: https://developers.google.com/search/blog/2025/06/simplifying-search-results (2025-06-12)
- G12 Update on simplification: https://developers.google.com/search/blog/2025/11/update-on-our-efforts (2025-11-05)
- G14 Breadcrumbs on mobile: https://developers.google.com/search/blog/2025/01/simplifying-breadcrumbs (2025-01-23)
- G15 Search gallery: https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- G16 Software app: https://developers.google.com/search/docs/appearance/structured-data/software-app
- G17 Review snippet: https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- G18 Organization: https://developers.google.com/search/docs/appearance/structured-data/organization
- G19 Site names: https://developers.google.com/search/docs/appearance/site-names
- G20 Build a sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap (Last updated 2025-12-10)
- G21 Consolidate duplicate URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls (Last updated 2026-03-27)
- G22 Block indexing: https://developers.google.com/search/docs/crawling-indexing/block-indexing (Last updated 2025-12-10)
- G23 JavaScript SEO basics: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics (Last updated 2026-03-04)
- G24 Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals (Last updated 2025-12-10)
- G25 Page experience: https://developers.google.com/search/docs/appearance/page-experience (Last updated 2025-12-10)
- G26 Introducing INP: https://developers.google.com/search/blog/2023/05/introducing-inp (2023-05-10); web-vitals v5 upgrade notes: https://github.com/GoogleChrome/web-vitals/blob/main/docs/upgrading-to-v5.md
- G27 Title links: https://developers.google.com/search/docs/appearance/title-link (Last updated 2025-12-10)
- G28 Creating helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content (Last updated 2025-12-10)
- G29 Discover core update: https://developers.google.com/search/blog/2026/02/discover-core-update (2026-02-05)
- Sitelinks search box farewell: https://developers.google.com/search/blog/2024/10/sitelinks-search-box (2024-10-21)

**Third-party data**
- T1 https://ahrefs.com/blog/ai-overviews-reduce-clicks/ (2025-04-17)
- T2 https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/ (2026-02-04)
- T3 https://ahrefs.com/blog/ai-overview-growth/ (2025-05-13)
- T4 https://ahrefs.com/blog/information-gain/ (2026-08-20)
- T5 https://www.semrush.com/blog/google-completes-spam-update-rollout/ (2026-06-30)
- T6 https://www.semrush.com/blog/google-august-2026-spam-update/ (2026-08-26)

**Next.js** (repo `vercel/next.js` docs @ `86d92b9`, 2026-10-03)
- N1 https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- N2 https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
- N3 https://nextjs.org/docs/app/api-reference/functions/image-response
- N4 https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap (and `generate-sitemaps`)
- N5 https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- N6 https://nextjs.org/docs/app/guides/json-ld
- N7 https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
- N8 https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots ; https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/router/utils/html-bots.ts
- N9 https://github.com/vercel/next.js/blob/canary/packages/next/src/lib/metadata/resolvers/resolve-url.ts

**Discord** (repo `discord/discord-api-docs` @ `c43598d`, 2026-10-02)
- D1 https://discord.com/developers/docs/discovery/overview
- D2 https://discord.com/developers/docs/discovery/enabling-discovery
- D3 https://discord.com/developers/docs/discovery/best-practices
- D4 https://discord.com/developers/docs/platform/discovery
- D5 https://discord.com/developers/docs/resources/application#installation-context (and #install-links)
- D6 https://discord.com/developers/docs/interactions/application-commands#contexts
- D7 https://discord.com/developers/docs/interactions/receiving-and-responding
- D8 https://discord.com/developers/docs/change-log (2024-06-27; 2025-04-22; 2026-03-03; 2026-06-10; 2026-08-12; 2026-08-14; 2026-09-11; 2026-09-22)
- D9 https://discord.com/developers/docs/events/gateway#privileged-intents
- D10 https://discord.com/developers/docs/gateway/getting-started-with-privileged-intent-review
- D11 https://discord.com/developers/docs/gateway/you-might-not-need-a-privileged-intent
- D12 https://discord.com/developers/docs/topics/rate-limits
- D13 https://discord.com/developers/docs/components/overview ; https://discord.com/developers/docs/components/reference
- D14 https://discord.com/developers/docs/resources/application-role-connection-metadata
- D15 https://discord.com/developers/docs/topics/oauth2 ; https://discord.com/developers/docs/resources/user#connection-object
- D16 https://discord.com/developers/docs/topics/permissions
- D17 https://discord.com/developers/docs/activities/overview
- D18 https://discord.com/developers/docs/resources/voice#get-user-voice-state
- D19 https://discord.com/developers/docs/events/webhook-events

**Platforms and policies**
- R1 Reddit Rules: https://redditinc.com/policies/reddit-rules (OTA `Reddit/Quality Guidelines.md`, 2026-10-03)
- R2 Reddit spam guidance (OTA `Reddit/Community Guidelines.md`, 2026-10-03)
- Y1 YouTube monetization policies (OTA `YouTube/Content Monetisation Policy.md`)
- I1 Instagram/Meta content monetization (OTA `Instagram/Content Monetisation Policy.md`)
- H1 https://news.ycombinator.com/showhn.html (copies)
- P1 https://www.producthunt.com/launch ; https://help.producthunt.com/en/articles/481909-how-can-i-get-access-to-post (secondary 2026 notes)

**Steam**
- S1 https://steamcommunity.com/dev/apiterms
- S2 https://steamcommunity.com/dev
- Copies via GitHub code search, as listed in §10

**SERP (§3)**
- WebSearch tool, 26 runs, 2026-10-03, with the result URLs as listed.
