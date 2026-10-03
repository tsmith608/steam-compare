# WeBothPlay retrofit — research brief

**Date:** 2026-10-03 · **Method:** five parallel research passes (job-to-be-done & competitors, design & typography, monetization & Stripe, SEO/growth/Discord, TikTok) plus a full code audit.
**Detailed evidence** (every source with URL, date and a [Fact]/[Observation]/[Interpretation] label) lives in:

| Topic | File |
|---|---|
| Job-to-be-done, user frustrations, Steam API facts | [`research/JTBD_RESEARCH.md`](research/JTBD_RESEARCH.md) |
| Competitors & substitutes | [`COMPETITOR_MATRIX.md`](COMPETITOR_MATRIX.md) |
| 2025–26 award-level design, typography, motion, a11y | [`DESIGN_RESEARCH.md`](DESIGN_RESEARCH.md) |
| Willingness to pay, gating, Stripe 2026, affiliates, ads | [`research/MONETIZATION_RESEARCH.md`](research/MONETIZATION_RESEARCH.md) |
| Search, structured data, Discord distribution, Steam ToU | [`research/SEO_GROWTH_RESEARCH.md`](research/SEO_GROWTH_RESEARCH.md) |
| TikTok 2026 + event calendar | [`../../marketing/TIKTOK_RESEARCH_2026.md`](../../marketing/TIKTOK_RESEARCH_2026.md) |

## Limits of this research (read first)

- **The live site could not be reached** from the build environment (the network policy blocks `webothplay.com`). The audit ran the exact code on `main` locally instead; production data and behaviour were not observed.
- **Most primary sites were blocked for page fetches** (Reddit, Steam Community, docs.stripe.com, TikTok, Google, Discord, Awwwards). Agents used search-result extracts (tagged "SI" in the detailed docs), official doc repositories on GitHub, installed SDK source and verbatim mirrors. **Reddit could not be read at all — no Reddit quotes were invented.**
- **The session's shared web-search budget (200 queries) ran out** part-way through. Items that could not be verified are marked *unverified* in the detailed docs, notably: affiliate commission rates, several 2026 legal statuses, and **the exact dates of Steam Next Fest (Oct), Scream Fest, the Autumn Sale, The Game Awards and the Winter Sale**. Event content in the 90-day calendar is therefore gated behind a "verify the date first" status.

## The ten conclusions that drove decisions

| # | Conclusion | Evidence (abridged) | Label | What we did |
|---|---|---|---|---|
| 1 | **Showing what everyone owns is a commodity; deciding is the unsolved part.** Steam's own client has offered "Find Games to Play Together" for chats of up to 8 since 2022, and 2026 entrants compete on voting and vetoes. | GamingOnLinux on the Steam beta, Sept 2022 — <https://gamingonlinux.com/2022/09/steam-beta-lets-you-create-a-collection-filtered-by-games-you-and-friends-own>; ReadyUp "Free forever, for every server" (app created ≈2026-07-04) — <https://readyupbot.com/>; Co-Op Now (swipe voting, "who's missing a copy") — <https://co-op.now/features> | Fact (search extracts) | Built roulette, shortlist → **group vote with one veto each**, "one copy away", fun facts, share cards. |
| 2 | **The free tier must not be worse than Steam itself.** The old code capped free comparisons at 3 and paywalled category filters, while every competitor is free. | Same sources as #1; JTBD §opportunities | Interpretation | Free now covers **up to 8 players with every filter**. Premium sells bigger groups (12/16), saved groups and Discord extras. |
| 3 | **Private "Game details" silently breaks results** — and it is a separate setting from profile visibility. A private library returns `{"response":{}}`; an empty public one returns `{"response":{"game_count":0}}`. | Lutris issue (2026-09-13) — <https://github.com/lutris/lutris/issues/6890>; Steam forum threads 2020–2024 | Fact | Comparisons now **continue with everyone else**, name who is hidden, and give a copyable fix message + guide. |
| 4 | **Steam removed the old wishlist JSON endpoint in late Nov 2024**; the replacement `IWishlistService/GetWishlist/v1` returns app IDs only. The old code still called the removed endpoint, so "Shared wishlist" was almost certainly empty in production. | boralyl/steam-wishlist issue #29 (2024-11-28) and fix PR #30 (2024-12-07): "now that the old json endpoint was removed" — <https://github.com/boralyl/steam-wishlist/pull/30> | Fact | New Steam client uses `IWishlistService`; names come from owned games or cached store data. |
| 5 | **Steam has no max-player data**; groups of 5–8 hit 4-player caps; Remote Play Together (host-only ownership) is an underused fix. | JTBD §frustrations; Steam category list | Fact + Interpretation | Filters use Steam's own category tags (incl. *Remote Play Together*); copy never invents player counts; the guide explains caps. |
| 6 | **The installed Stripe SDK (v20.3.1) pins API `2026-01-28.clover`, where `subscription.current_period_end` moved to subscription items and `invoice.subscription` moved to `invoice.parent.subscription_details.subscription`.** The old webhook read the removed fields, so new purchases and renewals could fail to grant Premium. | Stripe changelog — <https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-subscription-current-period-start-and-end>, <https://docs.stripe.com/changelog/basil/2025-03-31/adds-new-parent-field-to-invoicing-objects>; verified locally in `node_modules/stripe/types` | Fact | Webhook rewritten: new field paths with fallbacks, idempotency, price-based tiers, failed-payment handling, owner alerts. |
| 7 | **The existing ads earned nothing and the "affiliate" links earned nothing.** AdSense loaded from a non-standard path (`/position/js/` vs `/pagead/js/`), with no `ads.txt` and no consent banner; the CDKeys links carried only UTM tags (no affiliate ID) and pointed at a third-party key reseller without disclosure. | Monetization research §ads, §affiliates (code inspection + GitHub usage counts) | Fact (code) + Interpretation | Removed AdSense and CDKeys. Store links go to Steam; optional, labelled affiliate links (Humble/GMG/Fanatical) switch on via env vars after approval. |
| 8 | **Posting cadence: 2–5 posts/week captures most of the gain; median views per post barely change with volume.** Brands posting <6/week saw higher engagement. TikTok caps posts at 5 hashtags (since Aug 2025). Business accounts are limited to the Commercial Music Library. | Buffer, 11.4M posts (2025-10-08) — <https://buffer.com/resources/how-often-should-you-post-on-tiktok/>; Dash Social 2026 — <https://pages.dashsocial.com/hubfs/social-media-benchmark/2026/H1/tiktok.pdf>; Search Engine Land (2025-08-19) — <https://searchengineland.com/tiktok-limits-hashtags-460894> | Fact | 4/week baseline (Mon/Wed/Fri/Sun), 7/week only in confirmed event weeks, floor 3; a daily-capable reserve bank in the calendar. |
| 9 | **Google: FAQ rich results stopped appearing on 2026-05-07; per-query-variant or scraped per-game pages count as scaled content abuse.** | Google Search Central changelog (May 2026); Search spam policies; Google's 2026 guidance on AI features (detailed in SEO research §7) | Fact | No FAQ schema; a small set of genuinely useful pages: 3 tool pages (/roulette, /backlog, /coop), 3 guides, Discord page; noindex on per-user pages. |
| 10 | **Steam Web API terms:** 100,000 calls/day; data only as requested by the end user; storage country must be named in the privacy policy; keep the key confidential; `/dev` page: "Each page that uses the Steam Web API must contain a link to http://steampowered.com with the text 'Powered by Steam'". Discord privileged-intent review now triggers at 10,000 users (since 2026-06-10). | Verbatim copies of the Steam ToU and /dev page; Discord docs repo (SEO research §8, §10) | Fact (from copies; re-check live) | Footer "Powered by Steam" link; privacy policy names the United States; no compared-friend data is persisted; key never leaves the server; Discord intent change documented as a next step. |

## Design research → decisions

- **Typography by role, not effect** (no extralight gradient headlines): **Archivo** (variable width 62–125) for expanded headlines and condensed caps labels, **Inter** for UI text (it covers Cyrillic/Greek Steam names), **JetBrains Mono** for IDs — all SIL OFL 1.1 (OFL FAQ allows use in video/graphics). [DESIGN_RESEARCH §5]
- **The tool is the hero** — the compare form sits above the fold on phone and desktop. [§3]
- **Colour roles**: blue for actions/selection/focus, amber only for Premium, blurple only for Discord; body text never dimmer than ≈`#8C939E`. **Bug caught:** white on `#3b82f6` is 3.68:1 (fails AA); primary buttons now use `#2563eb` (5.2:1). [§5.7]
- **Depth from tone, not glass**; one signature motion (roulette → "Tonight's pick"); motion budgets 80–150 ms feedback, ≤1.2 s roulette, skippable; respect reduced motion. [§6]
- **Core Web Vitals "good"**: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. **WCAG 2.2 AA** (2.4.13 Focus Appearance is AAA, not AA — the brief was corrected). [§7]

## Where the evidence was thin (and how we hedged)

| Gap | Hedge |
|---|---|
| Steam event dates Oct 2026–Jan 2027 | Calendar rows are "Blocked: verify event date" until checked at partner.steamgames.com/doc/marketing/upcoming_events |
| Affiliate commission rates | Affiliate links ship **off**; owner applies and pastes deep-link templates |
| EU/UK VAT obligations for a solo US seller | Documented as an owner decision (Stripe Tax vs Stripe Managed Payments as merchant of record) |
| Real users' reactions (no Reddit access, no live analytics) | First-party funnel analytics now exist so decisions after launch can use real data |
| Valve's current Steam sign-in button guidance | Prominent sign-in uses Steam's wording ("Sign in through Steam"); swapping to Valve's official button images is listed in NEEDS_FROM_OWNER |
