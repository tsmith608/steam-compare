# WeBothPlay: Monetization Research

Prepared **2026-10-03** as input to the WeBothPlay retrofit. WeBothPlay is a free web app plus Discord bot that compares Steam libraries among friends.

**Scope:**
- willingness-to-pay (WTP) benchmarks
- feature gating
- legal and compliance
- Stripe 2026 technical changes
- dunning, Customer Portal and tax
- merchant-of-record (MoR) alternatives
- affiliate programs
- display ads
- a pricing and packaging proposal

---

## 0. Method, labels and limitations (read this first)

**Labels**

| Label | Meaning |
|---|---|
| **[Fact]** | Confirmed this session from a primary artifact, or from a search-engine summary of the vendor's own page (marked "via search index"). Primary artifacts include Stripe's own SDK source, types and changelog (npm or GitHub) and a vendor's own docs repo on GitHub. |
| **[Observation]** | Something seen in data or code: this repo, the source of an active open-source deals site, or ad-block filter lists. It is not a vendor statement. |
| **[Interpretation]** | My reasoning or recommendation. |
| **[Unverified]** | From prior knowledge, or a third-party claim I could not confirm this session. Treat it as a lead and verify it before acting. |

Evidence IDs (E1…E40) point to the **Evidence log** in §10. That log gives the source, URL, date, what was learned and why it matters.

**Limitations (they materially affect confidence):**
- **Blocked pages.** The egress proxy blocked direct page fetches for almost every relevant domain:
  - docs.stripe.com, stripe.com, support.stripe.com
  - ftc.gov, federalregister.gov, eur-lex.europa.eu, gov.uk, leginfo.legislature.ca.gov
  - paddle.com, polar.sh, lemonsqueezy.com
  - revenuecat.com, gg.deals, backloggd.com, wikipedia.org
  - pagead2.googlesyndication.com, and webothplay.com itself
- **Search budget ran out.** The session's shared web-search budget was exhausted (200/200) partway through. These lookups therefore could not be completed:
  - most affiliate commission rates and cookie windows
  - the 2026 legal status checks (FTC, California, EU, UK)
  - AdSense RPM data
  - a few product prices

  These items are marked **[Unverified]** or "not captured" rather than guessed.
- **What stayed reachable:**
  - search summaries obtained before the budget ran out
  - GitHub, including raw files
  - the npm registry
- **Primary sources used:**
  - Stripe's own SDK: stripe-node 20.3.1 in this repo (pinned to `2026-01-28.clover`) and the latest stripe-node **23.0.0** (pinned to `2026-09-30.endive`) from npm. This is the authority for API-shape facts.
  - Polar's own docs repo, for Polar fees.
  - IsThereAnyDeal's API repo, for its terms of use.
  - The source of an active open-source deals site, for which affiliate network each store uses.
- **Prices** are as observed on the date shown. The retrieval date is 2026-10-03 unless another date is given. Regional and promotional pricing varies.

---

## 1. Executive summary

1. **Packaging.** Replace the "Pro (6 users) vs Hacker (12 users)" ladder with plans split by *who pays*:
   - **Free**
   - **Premium** (an individual): **$3.99/mo or $29.99/yr**
   - **Premium + Server** (a Discord community): **$6.99/mo or $54.99/yr**. This plan unlocks the bot for **one designated server** instead of "any server a Hacker member is in".
   - Grandfather existing subscribers. Use no free trial; offer a 14-day refund instead.
   - Reasoning is in §9 [Interpretation, based on E31–E33].
2. **Gating.** Keep core comparison free:
   - shared games
   - basic filters and roulette
   - links to shared results
   - basic bot commands

   Charge for scale (bigger groups), persistence (saved squads, history), automation (alerts and digests), power tools, customization, being ad-free, and the community-wide bot unlock.

   Never claw back features that are free today [Interpretation, E25, E34].
3. **Stripe field paths under the current API** (`2025-03-31.basil` and later, including clover, dahlia and endive) [Fact, E1–E4]:
   - Period end: `subscription.items.data[i].current_period_end` (Subscription-level `current_period_end` is gone).
   - Invoice → subscription: `invoice.parent.subscription_details.subscription`, with a guard on `invoice.parent.type === 'subscription_details'` (`invoice.subscription` is gone).
   - Also removed on Invoice: `paid`, `charge`, `payment_intent`, `subscription_details` and `discount`.
   - The **2026-09-30.endive** release (stripe-node 23) removes `payment_method_types` from Checkout Session create params [Fact, E8].
   - The working tree already reads both the old and new shapes (`src/lib/billing.js`) [Observation, E36].
4. **Webhook events to handle:**
   - `checkout.session.completed`
   - `customer.subscription.created`, `.updated` and `.deleted` (plus `.paused` and `.resumed` if pausing is ever used)
   - `invoice.paid` (and/or `invoice.payment_succeeded`)
   - `invoice.payment_failed`
   - Optional: `invoice.payment_action_required`, `charge.dispute.created`, `charge.refunded`

   Deduplicate on `event.id`, and re-fetch the subscription instead of trusting event order. Stripe retries delivery for up to 3 days in live mode [Fact, E11–E12].
5. **Dunning, portal and tax:**
   - Smart Retries at **8 tries over 2 weeks**, which is Stripe's recommended default. When retries run out, cancel the subscription [Fact, E13].
   - Enable the failed-payment, expiring-card and upcoming-renewal emails (renewal reminders mainly for annual plans) [Fact, E14].
   - Customer Portal: cancel at period end with a reason, switch between the 4 prices, update card, invoice history [Fact, E15].
   - **Tax:** a US solo seller with EU/UK consumers almost certainly owes VAT from the first sale [Unverified, prior knowledge]. The lowest-maintenance fix that keeps the current Stripe Checkout code is **Stripe Managed Payments**. It costs +3.5% on top of standard fees, and Stripe becomes merchant of record (GA in 39 countries since 2026-04-22) [Fact, E18–E19].
6. **Affiliates.** The three best trust-preserving options are authorized stores that support product-level deep links. Commission rates and cookie windows **could not be verified** this session [Unverified].
   - **Humble Bundle**: Impact
   - **Green Man Gaming**: Impact
   - **Fanatical**: Awin

   [Observation, E26]
7. **CDKeys verdict:**
   - The current links carry only UTM parameters (`utm_medium=affiliate`) and no affiliate ID, so they earn **nothing**. They are also not disclosed [Observation, E35].
   - CDKeys appears to trade today as **Loaded**, whose affiliate links run through **Impact** (`go.loaded.com/c/…/18216`) [Observation, E26–E27].
   - It is a third-party key reseller. Do not make it the default way to buy. If it is kept at all, join through Impact, label it "key reseller" and disclose the affiliate relationship.
8. **Ads.**
   - The site's AdSense loader URL uses a non-standard path, `pagead2.googlesyndication.com/position/js/adsbygoogle.js`. GitHub has **0** uses of that path against roughly 3.2M uses of `/pagead/js/`. Ads may not be serving at all; check this first [Observation, E37].
   - There is no `ads.txt` and no consent management platform (CMP) in the code.
   - In this niche, ads plus an "ad-free" premium perk is the norm (Backloggd, Grouvee, Infinite Backlog, Tracker.gg) [Observation, B-table].
   - Keep 1–2 lazy, space-reserved slots for free users only, and set a kill threshold (§8).

---

## 2. Willingness-to-pay benchmarks

### 2.1 Table

| # | Product | Plan(s) | Price observed | Notes | URL | Date | Evidence quality |
|---|---|---|---|---|---|---|---|
| B1 | **Backloggd** (game log) | Supporter / Backer (Patreon) | **$1/mo; $3/mo** | Backer gets ad-free browsing, an all-time stats page, a yearly recap and a 60-day activity history (free tier: 14 days). All functional features are free. | https://www.patreon.com/backloggd (tiers as summarized by https://www.twoaveragegamers.com/backloggd-review/) | 2026-10-03 | Secondary summary of the Patreon page [Observation] |
| B2 | **Infinite Backlog** (collection tracker) | Backlog Legend / Backlog Myth (Patreon) | **€3/mo; €6/mo** | Bulk edit, year in review, keeps the site ad-free. "Core features will never be locked behind a paywall." | https://infinitebacklog.net/support-us | 2026-10-03 (search index) | Vendor page [Fact] |
| B3 | **Grouvee** (backlog tracker) | Gold / Super Gold / Super Gold XL | **$10/yr; $20/yr; $50/yr** | Removes banner ads (also for visitors to your profile), profile customization, badge and gold ring, supporter recognition | https://www.grouvee.com/subscription/ | 2026-10-03 (search index) | Vendor page [Fact] |
| B4 | **IsThereAnyDeal** | Patreon supporter | **from $1.50/mo** | The site is funded mainly by affiliate links through its `itad.link` redirector, plus Patreon | https://www.patreon.com/IsThereAnyDeal | 2026-10-03 (search index) | Vendor page [Fact]; funding model [Observation] |
| B5 | **SteamDB** | none | **Free: no ads, no paywalls** | Acquired by Nexus Mods. Plans to monetize via affiliate links and sponsorships. Existing free features stay free; any monetization applies only to new features. | https://www.pcgamer.com/gaming-industry/steamdb-changes-hands-to-nexus-mods-which-means-it-needs-to-make-money-now-but-there-wont-be-ads-or-paywalls/ | Article date not captured | News [Observation] |
| B6 | **Tracker Network** (tracker.gg) | Premium | **$3/mo; $30/yr** | Ad-free across TRN sites and apps. The page also lists one-time options, and the snapshot figures were partly inconsistent. | https://thetrackernetwork.com/premium | 2026-10-03 (search index) | Vendor page, medium confidence [Fact] |
| B7 | **Blitz** (game companion) | Blitz Pro / Premium | **$4.99/mo** (varies by card country) | Free trial, then monthly | https://support.blitz.gg/hc/en-us/articles/4415422406425-How-much-does-Blitz-Pro-cost- | 2026-10-03 (search index) | Vendor help center [Fact] |
| B8 | **Mobalytics** | Plus | **$9.99/mo; $24.99 per 3 mo; $69.99/yr** | 7-day free trial; first-year discount for new users | https://mobalytics.gg/lol/glp/plus ; https://support.mobalytics.gg/hc/en-us/articles/360050449072-Can-I-try-Plus-for-free | 2026-10-03 (search index) | Vendor [Fact] |
| B9 | **Medal** (clips) | Premium | **$9.99/mo, or $7.99/mo billed annually** | June 2026 post "Same price, more stuff": added value while holding price | https://medal.tv/premium ; https://medal.tv/blog/posts/same-price-more-stuff-check-out-the-updates-to-medal-premium | 2026-10-03; blog June 2026 | Vendor [Fact] |
| B10 | **Discord** | Nitro / Nitro Basic | **Nitro $9.99/mo or $99.99/yr; Basic $2.99/mo; Basic annual $29.99** (Discord blog) | A 2026 third-party page lists Basic annual at $39.99. That is unresolved, and $39.99 would be *more* than 12 × $2.99. | https://discord.com/nitro ; https://discord.com/blog/introducing-discord-nitro-basic | 2026-10-03 | Vendor [Fact]; Basic annual [Unverified, conflicting] |
| B11 | **Carl-bot** (Discord bot) | Premium (Patreon, priced by server count) | **$7.99/mo (1 server), $12.99 (2), $16.99 (3), $24.99 (5), $35.99 (8)** | A price increase grandfathered existing patrons at their old price | https://www.patreon.com/carlbot/join ; https://www.patreon.com/carlbot/posts/price-for-carl-131208404 | 2026-10-03 (search index) | Vendor [Fact] |
| B12 | **MEE6** (Discord bot) | Premium (per server) | Snapshot: **$13.99/mo ($6.99 first month); $59.99/yr ($29.99 first year); lifetime $54.99** | 7-day refunds; transferable between servers. Third-party sites quote $11.95/mo and $89.90/yr, so pricing is clearly promotional and variable. | https://mee6.xyz/en/premium | 2026-10-03 (search index) | Vendor [Fact], volatile |
| B13 | **Statbot** (Discord bot) | Per-server upgrades, bought individually or in bundles | **from ~$8.52/mo** (Data+ & Drilldowns); "All For Less" bundle from ~$8.97/mo; "Stat Essentials" from ~$10.76/mo | Multi-month and multi-server discounts | https://statbot.net/upgrade ; https://docs.statbot.net/docs/usage/premium-upgrades/ | 2026-10-03 (search index) | Vendor [Fact] |
| B14 | **Trakt** (adjacent: TV/film tracker) | VIP | **$60/yr** (raised from $30 in 2025; all legacy rates ended 2025-05-20) | Free tier cut to 2 lists × 100 items, and 100-item watchlists and collections. Strong user backlash. | https://alternativeto.net/news/2025/2/trakt-tv-has-set-stricter-limits-for-free-users-and-raised-vip-subscription-prices-by-100-/ ; https://alternativeto.net/news/2025/5/trakt-announces-all-vip-renewals-will-switch-to-a-new-standard-rate-doubling-prices/ | Feb and May 2025 | News [Observation] |
| B15 | **Letterboxd** (adjacent: film log) | Patron | **$48.99/yr** (Pro price not captured) | Patron = Pro plus customization, extra stats, early access | https://en.wikipedia.org/wiki/Letterboxd (via search) | 2026-10-03 | Secondary [Unverified] |
| — | HowLongToBeat, GG.deals, Dyno, Porofessor, Overwolf apps, Playtracker, GG app, Steam reputation tools | — | **Not captured** (page blocked, or search budget exhausted). No HLTB premium plan was found in the one search run. | — | — | — | — |

### 2.2 What the benchmarks show

- **O1. Three price clusters** [Observation]:
  - **(a)** Individual supporter or ad-free tiers in game tracking and utilities: **$1–$4/mo, or $10–$50/yr** (B1–B4, B6, B10 Basic).
  - **(b)** Performance, coaching and clip apps: **$4.99–$9.99/mo** (B7–B9).
  - **(c)** Discord bot premiums: **~$7–$14/mo per server** (B11–B13).
  - WeBothPlay's individual use case sits in (a). Its Discord use case sits in (c), at the low end because the bot does one job.
- **O2. Annual discounts** [Fact, computed from the table]:

  | Product | Annual discount vs 12 × monthly |
  |---|---|
  | Tracker | 17% |
  | Discord Nitro | 17% |
  | Medal | 20% |
  | Mobalytics | 42% |
  | MEE6 (regular price) | 64% |

  Mainstream subscriptions sit at about **17–20% ("2 months free")**. Gaming tools that market hard go to 40–64%. Annual-only supporter tiers are common (Grouvee, Trakt, Letterboxd).
- **O3. Per-server licensing is the Discord norm** [Observation]. Carl-bot is priced by number of servers, MEE6 per server (transferable), Statbot per server. The current "any Hacker member in the server unlocks it for everyone" rule is unusual. It is abusable: one subscriber who joins many servers unlocks all of them.
- **O4. Trials appear mainly in the $5–$10 performance apps** (Mobalytics 7-day, Blitz) [Observation]. None of the $1–$4 supporter-style tiers captured advertise trials.
- **O5. Lifetime deals:**
  - MEE6 sells a lifetime plan [Fact, B12].
  - Users publicly ask Tracker.gg (https://feedback.tracker.gg/t/lifetime-subscription/20752) and Medal (https://feedback.medal.tv/2451) for lifetime options [Observation].
  - So demand exists, but few small tools offer it.
- **O6. Trust norms in this audience** [Observation, E25, E34]:
  - SteamDB, Infinite Backlog and Backloggd all publicly commit that core features stay free.
  - Trakt's move to cut free limits *and* double prices drew visible backlash.
  - Medal advertised "same price, more stuff".
- **O7. Grandfathering is standard practice** when prices change (Carl-bot) [Fact, B11].

### 2.3 Pricing norms for WeBothPlay [Interpretation]

- **Monthly vs annual.** Usage is bursty: game nights, Steam sales, a new co-op release. Monthly subscribers tend to cancel once the immediate need passes, so lead with annual.
  - At $3.99, fixed card fees dominate: about **$0.44 per monthly charge (11%)** against **$1.38 per $29.99 annual charge (4.6%)** on Stripe. That works out to $5.32/yr in fees for a monthly payer against $1.38 for an annual payer (§6.5).
  - Annual billing also cuts renewal events from 12 to 1, which means fewer chances for involuntary churn.
- **Annual discount.** About **37%** ($29.99 against $47.88) is defensible for this audience. It also matches the $2.50/mo effective price of Tracker's $30/yr and Nitro Basic's $29.99/yr.
- **Trials.** None for Premium; the free tier already works as the trial. Trials also add obligations: California and the UK regime require trial-ending reminders [Unverified, §4]. Offer a **14-day no-questions refund** instead. That lines up with EU/UK withdrawal periods and with MEE6's 7-day refunds.
- **Lifetime.** Don't sell it. It creates a permanent service obligation while the product depends on third-party APIs (Steam Web API, Discord). If upfront cash is wanted, sell a limited "Founders 2-year" plan instead.
- **Pay-what-you-want / supporter.** Keep **Ko-fi as a one-off tip jar**. Stop selling Ko-fi *memberships* for new users, so all recurring billing lives in one system with self-serve cancellation. Map legacy Ko-fi tiers through `normalizeTier` (already in `src/lib/plans.js`) [Observation].

---

## 3. Feature-gating recommendations

### 3.1 Principles [Interpretation, informed by O6 and B1–B3]

1. **The core question stays free:** "what do we all own and could play tonight?" Charge for **scale, persistence, automation, power tools, cosmetics and ad-free**, and for the **community-wide bot unlock**.
2. **Never paywall the viral loop.** Anyone can open a shared comparison link, and a free user can join a squad that a Premium user created.
3. **Never take away what is free today** (the Trakt lesson). If free limits must change, raise them, or move a feature only for *new* accounts.
4. **Contextual upsell at the moment of need**, not on first visit. No interstitials, no countdown timers.
5. **One limit per dimension**, shown up front in the pricing table, so nobody is surprised by a limit later.

### 3.2 Gating matrix (proposed)

| Capability | Free | Premium (individual) | Premium + Server |
|---|---|---|---|
| Compare libraries | Up to **4** players (working tree: `PLAN_LIMITS.Noob.maxPlayers = 4`; the original brief said 3) | Up to **12** | Up to 12 |
| Shared games, basic filters (multiplayer/co-op), basic roulette, basic backlog finder | ✓ | ✓ | ✓ |
| View or join a comparison someone shared | ✓ | ✓ | ✓ |
| Saved groups/squads | 1 | Unlimited (or high cap) | Unlimited |
| Advanced filters ("owned by k of n", tags, playtime, exclusions), weighted roulette with history | — | ✓ | ✓ |
| Alerts/digests: "a new game became shared in your squad", "shared wishlist game on sale" (via ITAD API; ITAD's affiliate tags must be kept, see §7) | — | ✓ | ✓ |
| Profile customization | — | ✓ | ✓ |
| No ads (the AdSense **script is never loaded**) | — | ✓ | ✓ |
| Bot: basic commands (`/link`, `/compare` up to the free limit) | ✓ | ✓ | ✓ |
| Bot: premium commands **when the subscriber runs them** | — | ✓ | ✓ |
| Bot: premium commands for **everyone in one designated server** (`/premium activate`, re-bind at most once per 30 days) | — | — | ✓ |
| Data export, account deletion, cancellation, privacy controls | ✓ (never gated) | ✓ | ✓ |

### 3.3 Upgrade moments (where the paywall appears) [Interpretation]

1. **Limit hit.** When a user tries to add the 5th player, show an inline card where the "add friend" input was:

   > Groups up to 12 are Premium — $29.99/yr (≈$2.50/mo) or $3.99/mo

   Keep a visible "Compare these 4 now" button so the core action is never blocked.
2. **Second saved squad.** Same pattern.
3. **Advanced filter clicked.** Show a preview with blurred results and one sentence of value. Don't open a modal wall.
4. **Bot premium command in an unlicensed server.** Send an *ephemeral* reply with what the command does, a link, and "ask a server admin". Show it at most once per user per day.
5. **After success.** After a roulette pick or a completed comparison, show a low-key "Enjoying WeBothPlay? Support it" with Premium and Ko-fi options.
6. **Next to each ad.** A small "Remove ads" link.

### 3.4 Dark-pattern guardrails (checklist)

- [ ] Show price, billing interval, renewal and "cancel anytime" text **next to the pay button**. Use Checkout `custom_text.submit` [Fact: parameter exists, E16].
- [ ] No pre-checked add-ons. Promotional email consent is off unless the user opts in (Checkout `consent_collection.promotions` is US-only and opt-in) [Fact, E16].
- [ ] Cancellation is one click from the account page: a portal deep link with `flow_data.type = 'subscription_cancel'` [Fact, E15]. No forced chat or email to cancel.
- [ ] No confirmshaming copy. Any retention offer must sit beside an equally prominent "Cancel" button [Unverified on legal specifics, §4.2].
- [ ] Annual plans get a reminder email before renewal (Stripe upcoming-renewal email) [Fact, E14].
- [ ] Say exactly what happens on cancel: access continues until period end, then the account reverts to Free with no data loss.
- [ ] Affiliate links are labeled ("We may earn a commission") [Unverified legal basis, §4.1].

---

## 4. Legal and compliance notes

> **Status caveat:** I could not reach any government or legislative site, and the search budget ran out before the legal checks. Everything in §4 is **[Unverified, prior knowledge]** unless an E-reference says otherwise. Each item lists what to verify. In practice, building to the **strictest common denominator** (California ARL plus the EU withdrawal rules) covers most other places.

### 4.1 United States, federal

- **FTC Negative Option Rule ("click-to-cancel")** [Unverified]:
  - The amended rule was finalized in Oct 2024 and published Nov 15, 2024.
  - It was **vacated in full by the U.S. Court of Appeals for the 8th Circuit on July 8, 2025** (*Custom Communications, Inc. v. FTC*) on procedural grounds.
  - I could **not** confirm whether the FTC re-proposed the rule in 2026.
  - **Verify at** https://www.ftc.gov/legal-library/browse/rules/negative-option-rule (blocked from here).
- **ROSCA (15 U.S.C. §§8401–8405) still applies regardless** [Unverified, long-standing]:
  - disclose material terms clearly before taking billing information
  - obtain express informed consent
  - provide a simple way to cancel

  The FTC keeps enforcing it; for example, the Amazon Prime matter settled in Sept 2025 [Unverified]. Practical effect: the Stripe Checkout disclosures and the portal cancellation flow in §5.6 and §6.3 are the compliance mechanism.
- **Affiliate disclosure** [Unverified, long-standing]:
  - The FTC Endorsement Guides (16 CFR Part 255, revised 2023) expect clear disclosure of material connections, including affiliate commissions, close to the link.
  - Today's CDKeys button ("Find cheap key on CDKeys") has no disclosure. It earns nothing either, but a disclosure is needed once real affiliate IDs are used.

### 4.2 United States, states

- **California Automatic Renewal Law** (Bus. & Prof. Code §17600 et seq.), as amended by **AB 2863 (effective July 1, 2025)** [Unverified, prior knowledge; verify current text]. It requires:
  - clear and conspicuous auto-renewal terms before purchase
  - **express affirmative consent** to the auto-renewal terms, separate from other terms
  - an acknowledgment the customer can keep, including how to cancel
  - **online cancellation through a prominent link or button** for customers who signed up online
  - limits on save offers: the cancellation option must stay immediately available
  - notice of price changes (roughly 7–30 days ahead)
  - periodic (annual) reminders for subscriptions
  - keeping a record of consent

  Implementation map: §5.6 (Checkout consent and text), §6.2 (renewal emails), §6.3 (portal cancellation), plus one confirmation email sent by the app.
- **Other states** with auto-renewal laws include NY, CO, IL, MN, VA, DC, and Massachusetts regulations from 2025 [Unverified]. Meeting the California requirements is the practical baseline.

### 4.3 European Union

- **14-day right of withdrawal** for distance digital services (Consumer Rights Directive), when service starts immediately at the consumer's express request, with a proportionate charge [Unverified, long-standing].
  - Simplest compliant approach: a **14-day full-refund policy**, handled in the Stripe Dashboard.
- **"Withdrawal function" (withdrawal button)** [Unverified]:
  - Directive (EU) 2023/2673 inserts Art. 11a into the CRD, applying from **19 June 2026**.
  - Contracts concluded through an online interface need a clearly labeled function to withdraw during the withdrawal period.
  - A visible "Cancel / withdraw" entry in the account page that leads to the portal plus a refund flow is the low-effort approach.
  - **Verify** national transposition.
- **Germany: §312k BGB "Verträge hier kündigen" cancellation button** (since July 1, 2022) [Unverified, long-standing].
- **Digital Fairness Act**: the Commission proposal was expected around 2026 [Unverified]. Its targets include subscription traps and dark patterns.
- **VAT:** see §4.5.

### 4.4 United Kingdom

- **Cooling-off:** 14 days under the Consumer Contracts Regulations 2013 [Unverified, long-standing].
- **DMCC Act 2024 subscription-contracts regime:**
  - pre-contract key information
  - reminder notices, including before trials and discounted periods end
  - renewal cooling-off periods
  - single-step exit
  - Commencement was expected **no earlier than 2026**. I could **not** confirm the date [Unverified]. Verify on gov.uk.

### 4.5 Indirect tax (why merchant of record matters for a solo dev)

- **US sales tax** [Unverified, long-standing, post-*Wayfair*]:
  - Obligations depend on the home state's treatment of SaaS/digital goods.
  - Other states only matter above economic-nexus thresholds, commonly $100k in annual sales.
  - At WeBothPlay's likely revenue, the realistic exposure is the **home state** only.
- **EU VAT on electronically supplied services to consumers** [Unverified, long-standing]:
  - A non-EU seller owes VAT **from the first sale**; there is no threshold for non-EU businesses.
  - Normally reported through the One-Stop-Shop *non-Union* scheme.
- **UK VAT on digital services** from non-UK sellers: also **no threshold** [Unverified, long-standing].
- **Consequence** [Interpretation]: once EU/UK subscribers are more than a handful, the choice is:
  - (a) Stripe Tax at 0.5% where registered [Fact, E17], plus your own VAT registrations and filings, or
  - (b) a **merchant of record**: Stripe Managed Payments, Paddle or Polar (§6.6).

  For "low maintenance", (b) wins.

### 4.6 Ads and privacy

- **Google consent requirement** [Unverified, long-standing]: since January 16, 2024, Google requires a **Google-certified CMP** integrated with IAB TCF v2.2 to serve personalized ads to users in the EEA, UK and Switzerland. AdSense offers its own "Privacy & messaging" CMP.
- The codebase contains **no CMP** [Observation, E37].
- The privacy page still describes Ko-fi as the payment processor, and the terms page says "All payments are processed securely via Ko-fi". Both pages need to mention Stripe (or the MoR) [Observation, E35].

### 4.7 Compliance-to-implementation map (low maintenance)

| Requirement (strictest common denominator) | Where it lives |
|---|---|
| Auto-renew terms next to the pay button | Checkout `custom_text.submit`, e.g. *"Renews automatically at $29.99/year until canceled. Cancel anytime in Account → Manage billing."* |
| Express consent to the terms | Checkout `consent_collection.terms_of_service: 'required'`. This needs a ToS URL in Dashboard → Public details [Fact, E16]. Add `custom_text.terms_of_service_acceptance` wording that covers auto-renewal [Interpretation]. |
| Retainable acknowledgment | Stripe receipt/invoice email plus one app "Welcome to Premium" email with the terms and cancel link |
| Online cancellation, as easy as signup | Account page → portal deep link (`flow_data.type='subscription_cancel'`) [Fact, E15] |
| Renewal reminders (annual) | Stripe "Send emails about upcoming renewals" [Fact, E14] |
| Price-change notice | App email 30 days ahead (Stripe does not send this) [Interpretation] |
| EU/UK withdrawal | 14-day refund policy, plus the "Cancel / withdraw" entry |
| Tax | Stripe Tax and registrations, or an MoR (§6.6) |
| Affiliate disclosure | Inline "We may earn a commission" next to store links |
| Ads consent (EEA/UK/CH) | AdSense Privacy & messaging CMP, or another certified CMP |

---

## 5. Stripe 2026 technical notes

### 5.1 API version timeline (from stripe-node changelogs) [Fact, E1, E5–E8]

| API version | Released | Type | Pinned by stripe-node | Relevant to WeBothPlay |
|---|---|---|---|---|
| `2025-03-31.basil` | 2025-03-31 | **Major (breaking)** | 18.0.0 (2025-04-01) | Period fields moved to subscription items. New `Invoice.parent`; Invoice `subscription`/`charge`/`payment_intent`/`paid`/`discount` removed. Upcoming-invoice API → `invoices.createPreview`. `coupon`/`promotion_code` params → `discounts` |
| `2025-04-30` … `2025-08-27.basil` | monthly | Additive | 18.1–18.5 | `cancel_at` enums `max_period_end`/`min_period_end` (2025-05-28 / 2025-07-30); `billing_mode` (2025-06-30) |
| `2025-09-30.clover` | 2025-09-30 | **Major** | 19.0.0 | `Discount.coupon` → `Discount.source.coupon`; `PromotionCode.coupon` → `PromotionCode.promotion.coupon`; Checkout `excluded_payment_method_types`; `flexible` billing mode |
| `2025-10-29` … `2026-02-25.clover` | monthly | Additive | 19.2–20.4 | **This repo: stripe ^20.3.1 → pins `2026-01-28.clover`** |
| `2026-03-25.dahlia` | 2026-03-25 | **Major** | 21.0.0. 22.0.0 (2026-04-02) adds SDK-only breaking changes. | API breaks are mostly in Stripe.js. SDK: `decimal_string` → `Stripe.Decimal`; an error if the wrong webhook parse method is used; `new Stripe()` required; callbacks removed (v22) |
| `2026-04-22` … `2026-08-26.dahlia` | monthly | Additive | 22.1–22.6 | `allowed_payment_method_types` (2026-07-29); `payment_method_types` removal entry for PaymentIntents/SetupIntents (2026-08-26) |
| **`2026-09-30.endive`** | 2026-09-30 | **Major** | **23.0.0** (latest on npm, 2026-10-01) | **Checkout `payment_method_types` param removed**; Node ≥20; `verifyHeader` now defaults to timestamp tolerance; `Subscription.pause`; `status_details` on Invoice and Subscription |

### 5.2 Exact field paths under the current API [Fact, E1–E4]

| Need | Pre-basil (gone) | Current API (basil → endive) |
|---|---|---|
| Subscription period end | `subscription.current_period_end` | `subscription.items.data[i].current_period_end` (and `…current_period_start`). With one item, use `items.data[0]`; with several, take the max or the relevant item. |
| Invoice → subscription | `invoice.subscription` | `invoice.parent.subscription_details.subscription` (string, or Subscription if expanded). Guard with `invoice.parent?.type === 'subscription_details'`. |
| Subscription metadata on an invoice | `invoice.subscription_details.metadata` | `invoice.parent.subscription_details.metadata` (frozen snapshot at finalization) |
| Line item → subscription / period | (various) | `invoice.lines.data[i].parent.subscription_item_details.subscription`; `invoice.lines.data[i].period.end` |
| "Is the invoice paid?" | `invoice.paid` (boolean) | `invoice.status === 'paid'`; payments via `invoice.payments` (InvoicePayment) |
| Charge / PaymentIntent of an invoice | `invoice.charge`, `invoice.payment_intent` | `invoice.payments.data[].payment.payment_intent` or `.charge` (InvoicePayment resource). `payments` is optional in the type, so request it with `expand: ['payments']` or list via `invoicePayments.list` [Fact for field names, E4; Interpretation on expand]. |
| Discounts | `invoice.discount`, `subscription.discount` | `discounts[]`; coupon now at `discount.source.coupon` (clover) |
| Checkout payment methods | `payment_method_types: ['card']` | Omit it (dynamic payment methods), or use `allowed_payment_method_types` / `excluded_payment_method_types`. **Removed from create params in endive.** |

```js
// Current-API helpers (equivalent logic already exists in src/lib/billing.js)
const periodEnd = (sub) => Math.max(...sub.items.data.map((i) => i.current_period_end)); // unix seconds
const invoiceSubId = (inv) =>
  inv.parent?.type === 'subscription_details'
    ? (typeof inv.parent.subscription_details.subscription === 'string'
        ? inv.parent.subscription_details.subscription
        : inv.parent.subscription_details.subscription.id)
    : null;
```

Stripe changelog pages, found via search index; the pages themselves were blocked here:
- https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-subscription-current-period-start-and-end
- https://docs.stripe.com/changelog/basil/2025-03-31/adds-new-parent-field-to-invoicing-objects
- https://docs.stripe.com/changelog/basil/2025-03-31/invoice-preview-api-deprecations
- https://docs.stripe.com/changelog/basil/2025-03-31/add-support-for-multiple-partial-payments-on-invoices
- https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-singular-coupon-promotion-code
- https://docs.stripe.com/changelog/basil/2025-06-30/billing-mode-hash
- https://docs.stripe.com/changelog/clover/2025-09-30/exclude-payment-methods-checkout-sessions
- https://docs.stripe.com/changelog/dahlia
- https://docs.stripe.com/changelog/dahlia/2026-07-29/allowed-payment-method-types-parameter
- https://docs.stripe.com/changelog/dahlia/2026-08-26/removes-payment-method-types-parameter-from-payment-intents-setup-intents
- SDK changelog: https://github.com/stripe/stripe-node/blob/master/CHANGELOG.md
- Migration guides: https://github.com/stripe/stripe-node/wiki/Migration-guide-for-v21 and https://github.com/stripe/stripe-node/wiki/Migration-guide-for-v22

### 5.3 How the breaking changes hit each handler

| Event | What changed | Safe handling |
|---|---|---|
| `checkout.session.completed` | Session fields are stable. Retrieving the subscription returns the **current** shape (no top-level period fields). Do not pass `payment_method_types` on creation (endive). | Read `client_reference_id`/`metadata.steam_id` and `subscription`. Retrieve the subscription. Take the period end from `items.data[]`. |
| `customer.subscription.updated` | Payload shape follows the **webhook endpoint's API version** (E10). On basil and later there is no `current_period_end` at top level. Portal plan switches do **not** update `subscription.metadata`. | Re-fetch the subscription. Derive the tier from `items.data[].price.id` (or `lookup_key`), **not** metadata. Read `status`, `cancel_at_period_end`, `cancel_at`. |
| `customer.subscription.deleted` | Same shape rules | Downgrade at `ended_at`. Keep the customer record. |
| `invoice.paid` | `invoice.subscription` removed | Use `invoice.parent.subscription_details.subscription`, re-fetch the subscription, and extend access to the items' period end. |
| `invoice.payment_failed` | Same | Resolve the subscription the same way. Mark `past_due`, show a banner plus a portal card-update deep link, and let Smart Retries and Stripe emails do the rest. |

**SDK-pin trap** [Fact, E4, E10]:
- `new Stripe(key)` with no `apiVersion` uses the SDK's pinned version for **API calls**, which is `2026-01-28.clover` in this repo.
- Webhook **payloads** use the endpoint's own `api_version`. If the endpoint has none, they use the account default.
- The SDK documents that this version **cannot be changed after creation** ("The API version that events are rendered as for this webhook endpoint. You can't change this value after you create the endpoint.").
- The committed code at `HEAD` read `subscription.current_period_end` from a `subscriptions.retrieve()` call. Under clover that is `undefined`, which becomes an invalid date, which makes the DB write fail. Upgrades from `checkout.session.completed` could therefore silently fail [Observation, E36]. The working tree has since fixed this.

**Upgrade practice** [Interpretation, consistent with E10]:
1. Create the webhook endpoint with an explicit `api_version` equal to the SDK pin.
2. When upgrading the SDK (for example to 23.x / endive), create a *new* endpoint on the new version.
3. Deploy code that accepts both shapes, which `billing.js` already does.
4. Switch over, then delete the old endpoint.

### 5.4 Webhook best practices [Fact, E11–E12, unless marked]

- **Retries.** Live mode retries delivery for **up to 3 days** with exponential backoff. Sandbox retries **3 times over a few hours**. Return 2xx quickly; do slow work after recording the event.
- **Duplicates.** Log processed `event.id`s and skip repeats while still returning 200. Sometimes Stripe creates two separate Event objects; to catch those, dedupe on `data.object.id` plus `event.type`.
- **Ordering is not guaranteed.** Do not use `created` (second precision) to order events. Re-fetch the object and apply its latest state. The working tree does this [Observation, E36].
- **Claim then process** [Interpretation]. The working tree inserts into `stripe_events` before processing and deletes the row if processing fails. If the process dies mid-handler (for example a serverless timeout), the claim stays and Stripe's retry is skipped. Store `processing_started_at`, and allow re-processing after a TTL (for example 10 minutes), or mark processed only after success.
- **Provisioning model** (from Stripe's subscription webhook docs): provision on `invoice.paid` when the subscription is active; notify on `invoice.payment_failed`; revoke on `customer.subscription.deleted`. Optionally, Stripe **Entitlements** (`entitlements.active_entitlement_summary.updated`) can replace hand-rolled tier mapping.
- **Event names confirmed in SDK enums** [Fact, E4]:
  - `checkout.session.completed`
  - `customer.subscription.created`, `.updated`, `.deleted`, `.paused`, `.resumed`, `.trial_will_end`
  - `invoice.paid`, `invoice.payment_succeeded`, `invoice.payment_failed`, `invoice.payment_action_required`, `invoice.upcoming`
  - `entitlements.active_entitlement_summary.updated`
  - `charge.dispute.created`, `charge.refunded`
- **Docs:**
  - https://docs.stripe.com/webhooks
  - https://docs.stripe.com/webhooks/process-undelivered-events
  - https://docs.stripe.com/billing/subscriptions/webhooks
  - https://docs.stripe.com/api/events/types
  - https://docs.stripe.com/upgrades

### 5.5 Recommended event set for WeBothPlay

| Event | Action |
|---|---|
| `checkout.session.completed` (mode=subscription) | Bind customer to Steam ID via `client_reference_id`, retrieve the subscription, upsert state |
| `customer.subscription.created`, `.updated`, `.paused`, `.resumed` | Re-fetch and upsert: status, tier from price, period end from items, `cancel_at_period_end` |
| `customer.subscription.deleted` | Revert to Free |
| `invoice.paid` / `invoice.payment_succeeded` | Re-fetch the subscription via `parent.subscription_details.subscription` and extend |
| `invoice.payment_failed` | Reflect `past_due` and show an in-app banner with a portal card-update link |
| `invoice.payment_action_required` (optional) | Banner linking to `invoice.hosted_invoice_url` (Strong Customer Authentication for EU cards) |
| `charge.dispute.created`, `charge.refunded` (optional) | Revoke on dispute or full refund; alert the owner |
| `customer.subscription.trial_will_end` | Only if trials are ever introduced |

### 5.6 Checkout configuration [Fact for parameter semantics, E16; Interpretation for the choices]

| Parameter | Recommendation | Working-tree status [Observation, E36] |
|---|---|---|
| `mode: 'subscription'`, `line_items: [{price}]` | One of 4 Price IDs (2 plans × monthly/annual) | ✓ (env `STRIPE_PRICE_ID_PRO[_ANNUAL]`, `…HACKER[_ANNUAL]`) |
| `customer` | Reuse the stored `stripe_customer_id`. `customer_creation` **cannot** be set in subscription mode, because Checkout always creates a customer when none is passed. | ✓ |
| `client_reference_id` + `subscription_data.metadata.steam_id` | Keep both | ✓ |
| `allow_promotion_codes: true` | For launches and creator codes | ✓ |
| `automatic_tax: {enabled: true}` | Only with Stripe Tax and real registrations (0.5% per transaction where registered), or move to an MoR | ✓ behind `STRIPE_AUTOMATIC_TAX=1` |
| `billing_address_collection` | `'auto'` (the default) | ✓ |
| `consent_collection.terms_of_service: 'required'` | **Add.** Needs a ToS URL in Dashboard settings. Pair it with `custom_text.terms_of_service_acceptance` covering auto-renewal. | ✗ missing |
| `custom_text.submit` | **Add** the renewal disclosure sentence (§4.7) | ✗ missing |
| `payment_method_types` | **Do not use** (removed in endive). Optionally `allowed_payment_method_types`. | ✓ not used |
| `success_url` with `{CHECKOUT_SESSION_ID}` | Keep; fulfill via webhook, not the success page | ✓ |
| `adaptive_pricing: {enabled: true}` | Optional local-currency display. Eligibility for subscriptions is unverified. | — |
| Existing subscriber clicking "upgrade" | Send them to the portal instead of a 2nd Checkout, to avoid double billing | ✓ |

---

## 6. Dunning, Customer Portal, receipts, tax and merchant-of-record options

### 6.1 Smart Retries and failed-payment end state [Fact, E13]

- **Setting:** Smart Retries at **8 tries within 2 weeks**, Stripe's recommended default. The options are 1 week, 2 weeks, 3 weeks, 1 month or 2 months.
- **After the final retry:** **cancel the subscription** [Interpretation]. This is the simplest choice for a $3.99 consumer product, and the `customer.subscription.deleted` event reverts the user to Free. The alternatives are `unpaid` or staying `past_due`; both need extra app logic.
- **Access during dunning** [Interpretation]: keep Premium while the status is `past_due`; the working tree already treats `past_due` as active. Show a banner: "Your card failed — update it to keep Premium."

### 6.2 Customer emails [Fact, E14]

These are under Dashboard → **Settings → Billing → Subscriptions and emails**. Turn on:

| Setting | Notes |
|---|---|
| **Send emails when card payments fail** | Includes a hosted update-payment-method link |
| **Send emails about expiring cards** | Sent 1 month before expiry |
| **Send emails about upcoming renewals** | Configure the days before under "Prevent failed payments → Upcoming renewal events". Recommended **7–14 days for annual plans**. This also covers the reminder obligations in §4. |
| **Trial-ending reminders** | Only if trials are added |
| **Receipts** | Turn on successful-payment and finalized-invoice emails so every renewal produces a retainable record. The exact toggle names are under Settings → Emails / Billing [Unverified naming]. |

If invoices may need customer authentication (EU cards), also enable Stripe's hosted confirmation-link email [Unverified naming].

### 6.3 Customer Portal configuration [Fact for capabilities, E15]

Configure under Dashboard → Settings → Billing → Customer portal:

| Setting | Recommendation |
|---|---|
| Cancel subscriptions | Mode **at period end**. Collect a cancellation reason (cheap churn research). Optional retention **coupon offer**: the API supports `subscription_cancel.retention.coupon_offer`. Keep "Cancel" equally prominent if used (CA ARL save-offer rules [Unverified]). |
| Switch plans | Allow among the **4 prices** (Premium and Premium+Server, monthly and annual). Upgrades take effect immediately with proration; downgrades and monthly-to-annual switches can use `schedule_at_period_end` conditions. |
| Payment methods | Allow updates |
| Invoice history | On |
| Customer info | Allow email updates |
| Business links | ToS and privacy policy links; default return URL `/upgrade` or `/account` |
| One-click buttons | Portal deep links with `flow_data.type`: `payment_method_update`, `subscription_cancel`, `subscription_update`, `subscription_update_confirm` |
| Tier logic | Derive the tier from the **price ID**, not metadata, because portal switches don't touch metadata. The working tree does this in `tierForSubscription` [Observation, E36]. |

### 6.4 Tax decision [Interpretation, using E17–E19]

| Situation | Recommendation |
|---|---|
| Almost all paying users in the US; home state does not tax digital/SaaS | Stripe direct, `automatic_tax` off. Watch the thresholds. |
| Home state taxes SaaS/digital goods | Register there. Enable Stripe Tax at 0.5% on transactions in registered jurisdictions only. |
| Material EU/UK (or AU/CA/etc.) consumer revenue | **Use an MoR.** First choice: **Stripe Managed Payments**, because the code already uses Stripe Checkout. Docs list an "Update a Stripe Checkout integration to use Managed Payments" path: https://docs.stripe.com/payments/managed-payments/update-checkout [Fact: page exists, E18]. **Verify before switching:** US eligibility, and compatibility with existing subscriptions and the Customer Portal [Unverified]. |

### 6.5 Fee math at WeBothPlay price points [Fact for inputs where marked; arithmetic computed]

Inputs:
- Stripe US domestic card 2.9% + 30¢ [Unverified, standard US rate, not re-checked]
- Stripe Billing 0.7% [Fact, E17]
- Stripe Tax 0.5% [Fact, E17]
- Managed Payments +3.5% [Fact, E19]
- Paddle 5% + 50¢ [Unverified, third-party]
- Polar Starter 5% + 50¢, plus 1.5% for non-US cards [Fact, E22]

| Charge | Stripe direct | + Stripe Tax | Stripe + Managed Payments | Paddle / Polar Starter / Lemon Squeezy (5% + 50¢) |
|---|---|---|---|---|
| $3.99 monthly | $0.44 (11.1%) | $0.46 (11.6%) | $0.58 (14.6%) | $0.70 (17.5%) |
| $6.99 monthly | $0.55 (7.9%) | $0.59 (8.4%) | $0.80 (11.4%) | $0.85 (12.2%) |
| $29.99 annual | $1.38 (4.6%) | $1.53 (5.1%) | $2.43 (8.1%) | $2.00 (6.7%) |
| $54.99 annual | $2.28 (4.1%) | $2.55 (4.6%) | $4.20 (7.6%) | $3.25 (5.9%) |

**Per subscriber-year:**

| Plan | Gross | Stripe direct fees | Managed Payments fees | 5% + 50¢ fees |
|---|---|---|---|---|
| Monthly (12 × $3.99) | $47.88 | $5.32 | $7.00 | $8.39 |
| Annual ($29.99) | $29.99 | $1.38 | $2.43 | $2.00 |

**Caveats:**
- An MoR remits VAT, so EU/UK net revenue is lower under any compliant option; direct Stripe without VAT registration only *looks* cheaper.
- International cards add about +1.5% on Stripe [Unverified] and on Polar [Fact].
- Paddle reportedly quotes custom pricing below $10 [Unverified].

### 6.6 Merchant-of-record alternatives for a solo developer

| Option | Seller of record | Headline fees | Status (2026) | Notes |
|---|---|---|---|---|
| **Stripe direct (+ Billing, optional Tax)** | You | 2.9% + 30¢ [Unverified] + 0.7% Billing [Fact] (+0.5% Tax where registered [Fact]) | — | Lowest fees; you own tax compliance |
| **Stripe Managed Payments** | **Stripe** | **+3.5% per transaction** on top of standard processing. Includes tax calculation/collection/filing, fraud, eligible disputes, transaction support and FX margins. Billing fee extra. [Fact, E19] | **GA for businesses in 39 countries as of 2026-04-22.** Digital products only (software, **video games**, digital media, courses, web services). Checkout or Payment Links. Direct accounts only (no Connect). Subscriptions through Billing. [Fact, E18] | Smallest migration from today's code. Verify US eligibility and portal behavior. |
| **Paddle** | Paddle | 5% + 50¢ [Unverified, third-party summaries]; "custom pricing for products under $10" [Unverified] | Operating | Separate checkout and webhooks to rebuild |
| **Lemon Squeezy** (Stripe-owned since 2024) | Lemon Squeezy | 5% + 50¢ reported [Unverified] | Third-party reports say it still runs standalone in 2026, with a migration path toward Stripe Managed Payments and slowed product development [Unverified, E20] | **Avoid for new builds.** Roadmap uncertain. |
| **Polar** | Polar | **Starter: 5% + 50¢** for organizations created on or after **2026-05-27**. Paid plans: Pro $20/mo at 3.8% + 40¢, Growth $100/mo at 3.6% + 35¢, Scale $400/mo at 3.4% + 30¢. **+1.5% non-US cards; $15 per dispute;** payout fees ($2/mo + 0.25% + $0.25 per payout). Organizations created earlier keep 4% + 40¢ + 0.5% for subscriptions. [Fact, E22] | Operating (announced 2026-05-20) | Developer-oriented. Fees are not refunded when you refund a customer. |

---

## 7. Affiliate and secondary revenue (legal and trust-preserving)

### 7.1 Steam

- **No paid Steam affiliate program was found** [Unverified, absence of evidence; Valve pages were unreachable].
- An active open-source deals site appends **`?curator_clanid=<id>`** to Steam links [Observation, E26]. That is Steam Curator attribution: it gives curator-side traffic statistics and followers, not money [Unverified semantics].
- **Recommendation** [Interpretation]: keep "View on Steam" as the primary, honest action. Optionally create a WeBothPlay Steam Curator page and add `curator_clanid` for statistics.

### 7.2 Program table

**Evidence notes:**
- **Network evidence** comes from live affiliate-link builders in the source of an active open-source deals site, `pepe-deals/pepe-deals-blazor-web` (E26). The `*.sjv.io` and `go.loaded.com/c/{partner}/{ad}/{campaign}` link formats are Impact's tracking format.
- **Commission and cookie columns** are **[Unverified]**; the program pages were unreachable and the search budget was exhausted.
- A 2026 third-party developer note claims "~5%" for Humble and Fanatical and "3–5%" for CDKeys. It is of unknown provenance and contradicts the observed networks for Humble and CDKeys, so treat it as **low confidence** (E28).

| Program | Network (evidence) | Product-page deep links | Commission | Cookie | Approval | Trust risk | Verdict |
|---|---|---|---|---|---|---|---|
| **Humble Bundle** | **Impact**: `humblebundleinc.sjv.io/c/{pub}/{ad}/25796?prodsku=…&u=<url>` [Observation]. A third-party note says PartnerStack, which conflicts. | **Yes** (`u=`; `prodsku`) | Unverified | Unverified | Impact application plus brand approval [Interpretation] | **Low.** Authorized publisher partner; charity angle. | **Top pick** |
| **Green Man Gaming** | **Impact**: `greenmangaming.sjv.io/c/{pub}/{ad}/15105?prodsku=…&u=<url>` [Observation]. Also used by PCGamingWiki links (seen in filter lists, E30). | **Yes** | Unverified | Unverified | Impact | **Low.** Authorized retailer. | **Top pick** |
| **Fanatical** | **Awin**: `awin1.com/cread.php?awinmid=118821&awinaffid=…&ued=<url>` [Observation]. A third-party note says Impact, which conflicts. | **Yes** (`ued=`) | Unverified | Unverified | Awin application | **Low.** Authorized. | **Top pick** |
| Gamesplanet | In-house `?ref=` [Observation] | Yes | Unverified | Unverified | Direct | Low | Good secondary (UK/DE/FR/US stores) |
| WinGameStore | In-house `?ars=`; affiliate feed on macgamestore.com [Observation] | Yes | Unverified | Unverified | Direct | Low | Secondary (US) |
| IndieGala | In-house `?ref=` [Observation] | Yes | Unverified | Unverified | Direct | Low–medium | Secondary |
| GamersGate / DLGamer / GameBillet | In-house `?aff=` / `?affil=` / `?affiliate=` [Observation] | Yes | Unverified | Unverified | Direct | Low | Secondary |
| Voidu | Product feed via **Daisycon** (program 12328) [Observation] | Likely (via feed) | Unverified | Unverified | Daisycon | Low | Secondary |
| Gamesload | Not observed | — | — | — | — | — | Not researched (may no longer operate [Unverified]) |
| GOG | **No affiliate tags** on GOG links in the deals-site code [Observation]. Program status unverified. | — | — | — | — | Low | Link without commission |
| Epic Games Store Support-A-Creator | Creator code applied at checkout, not a URL network. ~5% and ~1,000-follower eligibility per prior knowledge [Unverified]. The deals site adds no Epic tag [Observation]. | Creator tag | Unverified | n/a | Application plus follower threshold | Low | **Poor fit** (Steam-centric tool) |
| GG.deals | Not captured | — | — | — | — | — | — |
| **IsThereAnyDeal (API)** | n/a. **ITAD's API terms forbid removing ITAD's affiliate tags** and changing data, require attribution, allow commercial use if the app is public, and forbid competing apps [Fact, E23]. | n/a | You earn nothing | n/a | API key | Low | Use for price data and alerts only; ITAD earns the commission |
| Instant Gaming | In-house referral `?igr=` [Observation, E29] | Yes | Unverified | Unverified | Direct | **Medium** (key reseller) | Not as default |
| **Loaded (formerly CDKeys)** | **Impact**: `go.loaded.com/c/{pub}/{ad}/18216?u=<url>`, Impact product catalogs 12134 (US) and 12138 (EU) [Observation]. Legacy CDKeys in-house `?mw_aref=` codes seen in ~2020 links [Observation, E27]. A third-party note says CJ, which conflicts (E28). | Yes (`u=`) | Unverified | Unverified | Impact | **Medium–high** (third-party key reseller) | See §7.3 |
| Kinguin | **Impact**: `kinguin.sjv.io/c/{pub}/{ad}/50048` [Observation] | Yes | Unverified | Unverified | Impact | **High** (open marketplace) | Avoid |
| G2A | Goldmine, in-house [Unverified] | — | Unverified | — | — | **High** (marketplace; developer backlash [Unverified]) | Avoid |
| Amazon Associates | Amazon, in-house | Yes | Low single digits for video games historically [Unverified] | 24h historically [Unverified] | 3 qualifying sales in 180 days historically [Unverified] | Low | Skip (poor fit) |

**Observation, E30:** uBlock Origin and AdGuard filter lists rewrite or strip some affiliate redirectors on specific sites. For example, an `href-sanitizer` rule on pcgamingwiki.com targets `greenmangaming.sjv.io/c/*?u=`, and AdGuard hides Instant Gaming `?igr=` links on some Italian sites. Expect attribution leakage among ad-blocking PC gamers.

### 7.3 CDKeys verdict

1. **The current setup earns $0** [Observation, E35]:
   - `src/app/page.jsx` builds `https://www.cdkeys.com/catalogsearch/result/?q=…&utm_source=steamcompare&utm_medium=affiliate&utm_campaign=search`.
   - UTM parameters are analytics tags, not affiliate IDs.
   - The code comment calls `steamcompare` a "placeholder ID", but no program is attached.
   - The button reads "Find cheap key on CDKeys" with no disclosure.
2. **Does CDKeys run an affiliate program in 2026? Yes, under the Loaded brand, on Impact** [Observation, E26]:
   - An active deals site builds `go.loaded.com/c/{partner}/{ad}/18216` links and pulls Loaded's Impact product catalogs.
   - The rebrand from CDKeys to Loaded is inferred, not confirmed: open `cdkeys.com` in a browser to see whether it redirects [Unverified].
   - The repo's `impact-site-verification` meta tag fits an Impact account, which would also let the developer apply to Humble and GMG; approval is per brand [Interpretation].
3. **Trust** [Interpretation]:
   - Loaded/CDKeys is a third-party key reseller, not an authorized publisher storefront.
   - It is lower risk than open marketplaces (G2A, Kinguin), but keys can be region-locked or sourced outside publisher channels.
   - Sending "where to buy" traffic there by default conflicts with a friends-first, trust-based brand.
4. **Recommendation:**
   - Replace the CDKeys button with a **"Where to buy"** row: **Steam** (always), then **Humble / GMG / Fanatical** deep links. Show a small "We may earn a commission" note.
   - If a cheapest-price signal is wanted, use the **ITAD API** with ITAD's links left intact.
   - Keep Loaded only as an optional, clearly labeled **"key reseller"** link: Impact tracking link plus disclosure, never the primary call to action.

---

## 8. Display ads assessment

### 8.1 Codebase observations, to fix before judging ad revenue [Observation, E37]

- **The loader URL looks broken.**
  - `src/app/layout.jsx` loads `https://pagead2.googlesyndication.com/position/js/adsbygoogle.js?client=ca-pub-5774226834741887`.
  - The standard path is `/pagead/js/adsbygoogle.js`. GitHub code search finds **0** files using `/position/js/adsbygoogle.js` against roughly 3.2M using `/pagead/js/adsbygoogle.js?client=`.
  - If the URL 404s, **no ads render and AdSense revenue is $0**. Check the Network tab and the AdSense dashboard.
- **No `ads.txt`** in `public/`. AdSense warns about "earnings at risk" without one [Unverified behavior].
- **No CMP** for EEA/UK/CH traffic (§4.6).
- The AdSense script loads **for everyone, including premium users**. Ad units on `/terms`, `/privacy`, `/about` and `/contact` don't pass `isPremium`, so the "ad removal" perk leaks there. If Auto ads are enabled in the dashboard, premium users could also see auto-placed ads [Interpretation].
- `GoogleAdSense.jsx` reserves `min-h-[90px]`, but responsive units are often taller (~250–280px on mobile), so content still shifts and the Cumulative Layout Shift (CLS) score suffers [Interpretation; see web.dev CLS guidance, Unverified URL https://web.dev/articles/optimize-cls].

### 8.2 Economics (illustrative only; RPMs are assumptions, not market data)

| Monthly page views | @ $0.50 RPM | @ $2 RPM | @ $5 RPM |
|---|---|---|---|
| 10k | $5 | $20 | $50 |
| 50k | $25 | $100 | $250 |
| 100k | $50 | $200 | $500 |
| 300k | $150 | $600 | $1,500 |

- **Sanity anchor** [computed]: one annual Premium subscriber nets about **$2.38/month** ($29.99 − $1.38 in fees, ÷ 12). That equals about **1,200 page views/month at a $2 RPM**.
- Gaming-utility RPMs are generally low, and many PC gamers block ads [Unverified]. Replace these assumptions with the real AdSense report once the loader is fixed.
- AdSense pays publishers a revenue share. Since 2024 it is expressed as 80% after Google's buy-side fee, roughly 68% overall for Google Ads demand [Unverified].

### 8.3 Do ads and subscriptions conflict at small scale? [Interpretation]

- **They coexist in this niche.** "Ad-free" is a premium or supporter perk at Backloggd (B1), Grouvee (B3), Infinite Backlog (B2) and Tracker.gg (B6). Ads give the perk its value.
- **The costs are real:**
  - worse experience and Core Web Vitals for the free users you hope to convert
  - CMP and `ads.txt` overhead
  - ad-blocker leakage
  - possible brand dissonance next to "friends-first" positioning
- **The alternative model exists:** SteamDB runs with no ads and no paywalls and is funded by affiliate links and sponsorships (B5).

### 8.4 Recommendation and kill criteria

1. Fix the loader URL, add `ads.txt`, and enable the AdSense **Privacy & messaging** CMP.
2. **Never load the AdSense script for premium users.** Move the `<Script>` behind the premium check, or inject it client-side only for free users.
3. Keep **1–2 units**, below the fold on results and commands pages, lazy-loaded, with **reserved height that matches the unit** (fixed-size units are better than `auto`). Remove ads from the legal, about and contact pages.
4. **Kill criteria** (review quarterly): if net ad revenue is under about $25/month, *or* Core Web Vitals (LCP/CLS/INP) fail on pages with ads, remove ads entirely. Then position the site as "No ads. Ever." and fund it with Premium, affiliates and tips.

---

## 9. Recommended pricing and packaging

### 9.1 Proposal

| Plan | Price | For | Includes |
|---|---|---|---|
| **Free** | $0 | Everyone | Compare up to 4; 1 saved group; shared games, basic filters, roulette and backlog finder; basic bot commands; open any shared link |
| **Premium** | **$3.99/mo or $29.99/yr** (≈ $2.50/mo; 37% off) | Individuals | Up to 12 players; unlimited saved squads; advanced filters and power tools; alerts and digests; profile customization; **no ads**; premium bot commands when *you* run them |
| **Premium + Server** | **$6.99/mo or $54.99/yr** (34% off) | Discord community admins | Everything in Premium, plus premium bot commands for **everyone in 1 designated server** (`/premium activate`; re-bind limited) |

Implementation stays at **4 Stripe Price IDs**, which already matches the working tree's 4 environment variables. Keep `Pro`/`Hacker` as internal tier IDs if renaming the database is not worth it, and change only display names and limits.

**Other terms:**
- **Refunds:** 14-day no-questions refund
- **Trials:** none
- **Lifetime:** none
- **Ko-fi:** tips only

### 9.2 Why this structure (explicit reasoning)

1. **Segment by buyer, not by headcount** [Interpretation]. Choosing between "6 (or 8) vs 12 players" is weak differentiation: few groups exceed 8, and it forces a guess at checkout. "For you" against "for your Discord" is a real difference in value and in who pays.
2. **Price sits inside the observed WTP clusters** [Observation → Interpretation]:
   - **Individuals:** effective $2.50–$4/mo (Tracker $3 or $30/yr; Backloggd $3; Nitro Basic $2.99 or $29.99/yr; Infinite Backlog €3). $3.99 monthly and $29.99 annual sit in the middle-to-top of the cluster.
   - **Communities:** multipurpose bots charge $7.99–$13.99 per server per month (Carl-bot; MEE6 regular). WeBothPlay's single-purpose bot belongs below that, at **$6.99**. That figure is a **hypothesis to test**: try $5.99 vs $6.99 vs $7.99 if traffic allows.
3. **Annual-first economics** [computed, §6.5]:
   - A monthly payer costs $5.32/yr in Stripe fees; an annual payer costs $1.38.
   - Annual billing has 1 renewal event instead of 12, so less involuntary churn and less dunning work.
   - It fits bursty usage.
4. **Abuse resistance and market norm** [Observation O3]. Per-server activation replaces "any Hacker member in the server unlocks everyone", which one subscriber can spread across unlimited servers. It also matches how Discord users already buy bot premium.
5. **Low maintenance:**
   - The same 4 prices.
   - One entitlement rule: the tier comes from the price ID, plus a `server_activations` table.
   - No trials, so no trial reminders.
   - Ko-fi memberships retired.
6. **Trust** (O6). The core stays free, the free limit rises (3 → 4 in the working tree), and nothing free today is removed.

### 9.3 Alternatives considered

| Option | Pros | Cons | When to choose |
|---|---|---|---|
| **A: Premium + "Premium + Server" (recommended)** | Clear segmentation; captures community value; abuse-resistant | 2 products to explain | Default |
| **B: Single Premium** ($3.99/$29.99) including 1 server unlock | Absolute minimum: 1 product, 2 prices | Under-monetizes communities; one cheap sub unlocks a whole server | If the bot is a small share of usage |
| **C: Status quo plus annual** (Pro $3.99/$29.99; Hacker $9.99/$79.99 with up to 3 servers) | No migration | Weak headcount differentiation; Hacker priced above multipurpose bots | If any repricing is off the table |

### 9.4 Migration and grandfathering [Interpretation; Carl-bot precedent, B11]

- Existing subscriptions keep their Stripe prices automatically.
- Map the legacy Price IDs onto the new entitlements in `tierForSubscription`:
  - **Legacy Pro** becomes **Premium**. This is an upgrade: 12 players at no extra cost.
  - **Legacy Hacker ($9.99)** becomes **Premium + Server with up to 3 servers**, as a thank-you. Email these customers that they can switch to $6.99 for 1 server at any time in the portal. Do not silently keep charging more than the new list price for less.
- Ko-fi legacy tiers keep mapping through `normalizeTier` until they lapse. New recurring sales go through Stripe only.

### 9.5 Metrics and experiments

- Conversion at each upgrade moment (§3.3)
- Annual share of new subscriptions (target >50%)
- Monthly recurring revenue
- Voluntary vs involuntary churn
- Refund rate
- Server activations per Premium + Server subscription
- Ad RPM and Core Web Vitals on pages with ads
- Affiliate clicks → EPC (earnings per click)
- **First experiment:** the free limit (4 vs 3), measured against overall conversion **and** sharing/virality.

---

## 10. Evidence log

Format: **ID** — conclusion. *Source*; URL; date; what was learned; why it matters; label.

- **E1.** Basil removed Subscription-level period fields and Invoice subscription fields.
  - *Source:* stripe-node CHANGELOG v18.0.0
  - *URL:* https://github.com/stripe/stripe-node/blob/master/CHANGELOG.md (also `node_modules/stripe/CHANGELOG.md`)
  - *Date:* 2025-04-01
  - *Learned:* Removed `current_period_end`/`start` on Subscription and added them on SubscriptionItem. Removed Invoice `charge`, `paid`, `payment_intent`, `quote`, `subscription`, `subscription_details`, `subscription_proration_date`, etc., and added `parent`. Removed `discount`, and the upcoming-invoice methods.
  - *Why:* These are exactly the fields the old webhook code read.
  - **[Fact]**
- **E2.** Period end now lives on subscription items.
  - *Source:* Stripe changelog "Adds subscription item-level billing periods and removes subscription-level periods" (via search index)
  - *URL:* https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-subscription-current-period-start-and-end
  - *Date:* retrieved 2026-10-03
  - *Learned:* Use `items.data.current_period_end`/`_start`.
  - *Why:* Official migration path.
  - **[Fact]**
- **E3.** Invoice → subscription moved under `parent`.
  - *Source:* Stripe changelog "Invoicing resources now specify how they were generated" (via search index)
  - *URL:* https://docs.stripe.com/changelog/basil/2025-03-31/adds-new-parent-field-to-invoicing-objects
  - *Date:* retrieved 2026-10-03
  - *Learned:* Use `invoice.parent.subscription_details.subscription` and check `parent.type`.
  - *Why:* Official migration path.
  - **[Fact]**
- **E4.** SDK type definitions confirm the current shapes.
  - *Source:* stripe-node 20.3.1 (this repo) and 23.0.0 (npm)
  - *URL:* https://www.npmjs.com/package/stripe
  - *Date:* 2026-02-05 / 2026-09-30
  - *Learned:* `Invoice.Parent.SubscriptionDetails.subscription: string | Subscription`; `SubscriptionItem.current_period_end: number`; `InvoiceLineItem.parent.subscription_item_details.subscription` and `period.end`; event-name enums; Subscription status values include `past_due`, `paused`, `unpaid`.
  - *Why:* Authoritative shapes for the pinned versions.
  - **[Fact]**
- **E5.** Clover (2025-09-30) breaking changes.
  - *Source:* stripe-node 19.0.0 changelog
  - *URL:* as E1
  - *Date:* 2025-09-30
  - *Learned:* `Discount.coupon` → `source.coupon`; `PromotionCode.coupon` → `promotion.coupon`; `iterations` removed; `flexible` billing mode; Checkout `excluded_payment_method_types`.
  - *Why:* Affects promo-code handling.
  - **[Fact]**
- **E6.** Dahlia (2026-03-25) is the next major release.
  - *Source:* stripe-node 21.0.0 changelog; Stripe dahlia overview (via search index)
  - *URL:* https://docs.stripe.com/changelog/dahlia
  - *Date:* 2026-03-25
  - *Learned:* API breaks are mainly in Stripe.js. The SDK switches to the Decimal type and errors on the wrong webhook parse method.
  - *Why:* Low impact for server-side Checkout.
  - **[Fact]**
- **E7.** stripe-node v22 SDK-level breaking changes.
  - *Source:* migration guide
  - *URL:* https://github.com/stripe/stripe-node/wiki/Migration-guide-for-v22
  - *Date:* 2026-04-02
  - *Learned:* `new Stripe()` required; no callbacks; RequestOptions must be the last argument; no per-request host.
  - *Why:* Upgrade checklist.
  - **[Fact]**
- **E8.** Endive is the latest version and removes Checkout `payment_method_types`.
  - *Source:* stripe-node 23.0.0 CHANGELOG (npm tarball)
  - *URL:* https://www.npmjs.com/package/stripe/v/23.0.0
  - *Date:* 2026-09-30
  - *Learned:* Pins `2026-09-30.endive`. Removes `payment_method_types` on `Checkout.SessionCreateParams` (and PaymentIntent/SetupIntent params). Node ≥20. `verifyHeader` defaults to timestamp tolerance. `Subscription.pause`. `status_details`.
  - *Why:* The next upgrade must not send `payment_method_types`.
  - **[Fact]**
- **E9.** The `payment_method_types` removal started with PaymentIntents/SetupIntents.
  - *Source:* Stripe changelog (via search index)
  - *URL:* https://docs.stripe.com/changelog/dahlia/2026-08-26/removes-payment-method-types-parameter-from-payment-intents-setup-intents ; https://docs.stripe.com/changelog/dahlia/2026-07-29/allowed-payment-method-types-parameter
  - *Date:* retrieved 2026-10-03
  - *Learned:* `payment_method_types` returns 400 `payment_method_types_no_longer_supported` on newer versions; use `allowed_payment_method_types`.
  - *Why:* Direction of travel.
  - **[Fact]**
- **E10.** Webhook payload versions are set per endpoint and are immutable.
  - *Source:* stripe-node `WebhookEndpoint` type docs
  - *URL:* as E4
  - *Date:* 2026-09-30
  - *Learned:* "The API version that events are rendered as for this webhook endpoint. You can't change this value after you create the endpoint." Create params: "Events sent to this endpoint will be generated with this Stripe Version instead of your account's default."
  - *Why:* Explains the payload-shape mismatches and the upgrade path.
  - **[Fact]**
- **E11.** Webhook delivery rules.
  - *Source:* Stripe webhooks docs (via search index)
  - *URL:* https://docs.stripe.com/webhooks
  - *Date:* retrieved 2026-10-03
  - *Learned:* Up to 3 days of retries in live mode, 3 over a few hours in sandbox; dedupe by event ID; ordering not guaranteed; don't use `created` for ordering.
  - *Why:* Idempotency and design.
  - **[Fact]**
- **E12.** Subscription event semantics.
  - *Source:* Stripe "Using webhooks with subscriptions" (via search index)
  - *URL:* https://docs.stripe.com/billing/subscriptions/webhooks
  - *Date:* retrieved 2026-10-03
  - *Learned:* Provision on `invoice.paid` while active; handle `invoice.payment_failed`; revoke on `customer.subscription.deleted`; the entitlements summary event exists.
  - *Why:* Defines the event set.
  - **[Fact]**
- **E13.** Smart Retries defaults.
  - *Source:* Stripe Smart Retries docs (via search index)
  - *URL:* https://docs.stripe.com/billing/revenue-recovery/smart-retries
  - *Date:* retrieved 2026-10-03
  - *Learned:* 8 tries in 2 weeks recommended; windows from 1 week to 2 months; end state canceled, unpaid or past_due.
  - *Why:* Dunning settings.
  - **[Fact]**
- **E14.** Customer email options.
  - *Source:* Stripe "Automate customer emails" (via search index)
  - *URL:* https://docs.stripe.com/billing/revenue-recovery/customer-emails
  - *Date:* retrieved 2026-10-03
  - *Learned:* Failed-payment, upcoming-renewal, expiring-card (1 month ahead) and trial-ending emails; located at Settings → Billing → Subscriptions and emails.
  - *Why:* Low-maintenance dunning and reminder compliance.
  - **[Fact]**
- **E15.** Customer Portal capabilities.
  - *Source:* stripe-node `BillingPortal` types
  - *URL:* as E4
  - *Date:* 2026-09-30
  - *Learned:* `subscription_cancel` (mode, cancellation_reason, proration); `subscription_update` (default_allowed_updates, schedule_at_period_end, trial_update_behavior, billing_cycle_anchor); invoice_history; payment_method_update; `flow_data` types; retention coupon offers.
  - *Why:* Portal configuration.
  - **[Fact]**
- **E16.** Checkout parameter semantics.
  - *Source:* stripe-node `Checkout.Sessions` types
  - *URL:* as E4
  - *Date:* 2026-09-30
  - *Learned:* `customer_creation` only in payment/setup mode (subscription mode always creates a customer); `consent_collection.terms_of_service: 'required'` needs a ToS URL; `promotions` consent is US-only; `custom_text.submit` and `terms_of_service_acceptance`; `allow_promotion_codes`; `automatic_tax`; `billing_address_collection` defaults to `auto`; `adaptive_pricing`; `allowed_payment_method_types`.
  - *Why:* Checkout configuration and compliance text.
  - **[Fact]**
- **E17.** Billing and Tax pricing.
  - *Source:* Stripe pricing and support pages (via search index)
  - *URL:* https://stripe.com/billing/pricing ; https://stripe.com/tax/pricing ; https://support.stripe.com/questions/understanding-stripe-tax-pricing
  - *Date:* retrieved 2026-10-03
  - *Learned:* Billing pay-as-you-go 0.7%; Stripe Tax no-code 0.5% of volume in jurisdictions where registered.
  - *Why:* Fee math and tax decision.
  - **[Fact]**
- **E18.** Managed Payments scope and availability.
  - *Source:* Stripe Managed Payments docs (via search index)
  - *URL:* https://docs.stripe.com/payments/managed-payments ; https://docs.stripe.com/payments/managed-payments/eligibility ; https://docs.stripe.com/payments/managed-payments/update-checkout
  - *Date:* retrieved 2026-10-03
  - *Learned:* Stripe is merchant of record, with tax handled in 80+ countries; works with Checkout or Payment Links; digital products including software and video games; direct accounts only; subscriptions through Billing; **GA in 39 countries as of 2026-04-22**.
  - *Why:* Lowest-effort tax compliance.
  - **[Fact]**
- **E19.** Managed Payments pricing.
  - *Source:* Stripe support "Managed Payments pricing" (via search index)
  - *URL:* https://support.stripe.com/questions/managed-payments-pricing
  - *Date:* retrieved 2026-10-03
  - *Learned:* 3.5% per successful transaction plus standard processing fees; includes tax handling, fraud, disputes, support and FX margins; calculated on the amount including tax; Billing fee separate.
  - *Why:* Fee math.
  - **[Fact]**
- **E20.** Lemon Squeezy's 2026 status.
  - *Source:* third-party blogs (dodopayments.com, fungies.io; both are competitors)
  - *URL:* https://dodopayments.com/blogs/lemonsqueezy-alternatives ; https://fungies.io/lemon-squeezy-stripe-acquisition-saas-founders-2026/
  - *Date:* 2026
  - *Learned:* Still standalone as of April 2026; being folded toward Managed Payments; 5% + 50¢.
  - *Why:* Avoid as a new dependency.
  - **[Unverified]**
- **E21.** Paddle pricing.
  - *Source:* third-party summaries
  - *URL:* https://dodopayments.com/blogs/paddle-fees-explained
  - *Date:* 2026
  - *Learned:* 5% + 50¢; custom pricing under $10.
  - *Why:* MoR comparison.
  - **[Unverified]**
- **E22.** Polar fees.
  - *Source:* Polar's own docs and blog in its GitHub repo
  - *URL:* https://github.com/polarsource/polar/blob/main/docs/merchant-of-record/fees.mdx ; blog source `introducing-polar-plans/page.mdx` in the same repo
  - *Date:* blog 2026-05-20; new rate effective 2026-05-27
  - *Learned:* Starter 5% + 50¢; Pro $20/mo at 3.8% + 40¢; Growth $100/mo at 3.6% + 35¢; Scale $400/mo at 3.4% + 30¢; +1.5% non-US cards; $15 per dispute; payout fees; earlier organizations keep 4% + 40¢ + 0.5%.
  - *Why:* MoR comparison.
  - **[Fact]**
- **E23.** IsThereAnyDeal API terms.
  - *Source:* ITAD API Terms of Service
  - *URL:* https://github.com/IsThereAnyDeal/API/blob/master/TERMS_OF_SERVICE.md
  - *Date:* retrieved 2026-10-03 (no date in file)
  - *Learned:* Commercial use allowed if the app is public; attribution required; must not change data or remove affiliate tags; no competing apps.
  - *Why:* The ITAD API can power deal and alert features but cannot become your affiliate revenue.
  - **[Fact]**
- **E24.** How ITAD is funded.
  - *Source:* ITAD Patreon (via search index) and site link behavior
  - *URL:* https://www.patreon.com/IsThereAnyDeal
  - *Date:* retrieved 2026-10-03
  - *Learned:* Patreon from $1.50/mo; affiliate revenue through `itad.link`.
  - *Why:* Benchmark for the affiliate-plus-supporter model.
  - **[Observation]**
- **E25.** SteamDB's monetization stance.
  - *Source:* PC Gamer, TweakTown and others (via search index)
  - *URL:* https://www.pcgamer.com/gaming-industry/steamdb-changes-hands-to-nexus-mods-which-means-it-needs-to-make-money-now-but-there-wont-be-ads-or-paywalls/
  - *Date:* not captured
  - *Learned:* Nexus Mods acquisition; no ads or paywalls; affiliate links and sponsorships; existing free features stay free.
  - *Why:* Sets this audience's trust norm.
  - **[Observation]**
- **E26.** Affiliate networks seen in live link builders.
  - *Source:* `pepe-deals/pepe-deals-blazor-web` (active open-source deals site)
  - *URL:* `https://raw.githubusercontent.com/pepe-deals/pepe-deals-blazor-web/master/pepeizqs%20deals%20blazor%20web/APIs/<Store>/Tienda.cs` for Humble, GreenManGaming, Loaded, Kinguin, Fanatical, IndieGala, Gamesplanet, WinGameStore, GamersGate, DLGamer, GameBillet, Voidu, GOG, EpicGames and Steam
  - *Date:* retrieved 2026-10-03
  - *Learned:*
    - **Impact:** Humble (`humblebundleinc.sjv.io`, campaign 25796), GMG (`greenmangaming.sjv.io`, 15105), Loaded (`go.loaded.com`, 18216; catalogs 12134/12138), Kinguin (`kinguin.sjv.io`, 50048)
    - **Awin:** Fanatical (awinmid 118821)
    - **In-house parameters:** IndieGala and Gamesplanet `ref`, WinGameStore `ars`, GamersGate `aff`, DLGamer `affil`, GameBillet `affiliate`
    - **Daisycon:** Voidu feed
    - **No tags:** GOG, Epic
    - **Steam:** `curator_clanid`
    - All of these support deep links to product URLs.
  - *Why:* Networks and deep-link support for the affiliate shortlist.
  - **[Observation]**
- **E27.** Legacy CDKeys affiliate format.
  - *Source:* GitHub code search (archived Slickdeals HTML, README links)
  - *URL:* GitHub search `"cdkeys.com" "mw_aref"` (139 hits)
  - *Date:* ~2020 snapshots
  - *Learned:* CDKeys used an in-house `?mw_aref=<code>` affiliate parameter.
  - *Why:* History of the program; today's links lack any ID.
  - **[Observation]**
- **E28.** Conflicting third-party network and commission claims.
  - *Source:* third-party repo `EmiyaKiritsugu3/game_deals` (0 stars; created 2026-03-20)
  - *URL:* https://raw.githubusercontent.com/EmiyaKiritsugu3/game_deals/main/docs/affiliate-onboarding.md
  - *Date:* 2026
  - *Learned:* Claims Humble and Kinguin on PartnerStack, Fanatical and Eneba on Impact, CDKeys on CJ; ~5% commissions; CDKeys needs about 10k monthly page views.
  - *Why:* Contradicts E26 for three of these stores (Humble, Kinguin, Fanatical), so treat its commissions as low confidence.
  - **[Unverified]**
- **E29.** Instant Gaming referral format.
  - *Source:* AdGuard FiltersRegistry
  - *URL:* https://github.com/AdguardTeam/FiltersRegistry (filters/26.txt)
  - *Date:* retrieved 2026-10-03
  - *Learned:* Instant Gaming referral links use `?igr=`.
  - *Why:* Program exists in-house; it is a key reseller.
  - **[Observation]**
- **E30.** Filter lists interfere with affiliate links.
  - *Source:* uBlock Origin and AdGuard lists on GitHub
  - *URL:* e.g. `uBlock-Origin/privacy.min.txt` rule `pcgamingwiki.com##+js(href-sanitizer, a[href^="https://greenmangaming.sjv.io/c/"][href*="?u="], ?u)`
  - *Date:* retrieved 2026-10-03
  - *Learned:* Blockers sanitize or hide some affiliate links.
  - *Why:* Expect attribution leakage.
  - **[Observation]**
- **E31.** Individual WTP cluster.
  - *Source:* B1–B4, B6, B10 (table in §2.1)
  - *URL:* see table
  - *Date:* 2026-10-03
  - *Learned:* $1–$4/mo or $10–$50/yr for supporter or ad-free tiers.
  - *Why:* Premium price anchor.
  - **[Fact/Observation]**
- **E32.** Community WTP cluster.
  - *Source:* B11–B13
  - *URL:* see table
  - *Date:* 2026-10-03
  - *Learned:* Per-server bot premiums of about $7–$14/mo.
  - *Why:* Server plan anchor.
  - **[Fact]**
- **E33.** Annual discount norms.
  - *Source:* computed from B6, B8–B10, B12
  - *URL:* —
  - *Date:* 2026-10-03
  - *Learned:* 17–20% for mainstream subscriptions; 40–64% for marketing-heavy gaming tools.
  - *Why:* Annual discount choice.
  - **[Fact, computed]**
- **E34.** Backlash risk from tightening free tiers.
  - *Source:* AlternativeTo news on Trakt
  - *URL:* see B14
  - *Date:* Feb and May 2025
  - *Learned:* Doubling the price while cutting free limits caused backlash.
  - *Why:* Don't claw back free features.
  - **[Observation]**
- **E35.** Repo monetization code.
  - *Source:* local `src/app/page.jsx`, `layout.jsx`, `terms`, `privacy`
  - *URL:* local
  - *Date:* 2026-10-03
  - *Learned:* CDKeys links carry UTM parameters only, with no disclosure. The `impact-site-verification` and `google-adsense-account` meta tags are present. The Terms and Privacy pages still describe Ko-fi as the payment processor.
  - *Why:* Affiliate and legal fixes.
  - **[Observation]**
- **E36.** Repo Stripe code.
  - *Source:* `git show HEAD:src/app/api/webhooks/stripe/route.js` and the working-tree `src/lib/billing.js`, `api/checkout`, `api/portal`, `api/webhooks/stripe`
  - *URL:* local
  - *Date:* 2026-10-03
  - *Learned:* HEAD read the removed fields (`subscription.current_period_end`, `invoice.subscription`) while pinned to clover. The working tree now reads `items[].current_period_end` and `parent.subscription_details.subscription` with fallbacks, dedupes event IDs, re-fetches subscriptions, maps tier from price, redirects existing subscribers to the portal, reuses customers, enables promo codes, and drops `payment_method_types`.
  - *Why:* Status of the technical recommendations.
  - **[Observation]**
- **E37.** Repo ads code.
  - *Source:* local `src/app/layout.jsx`, `components/GoogleAdSense.jsx`, `public/`; GitHub code search
  - *URL:* local; GitHub search `"googlesyndication.com/position/js/adsbygoogle.js"` (0 hits) vs `"googlesyndication.com/pagead/js/adsbygoogle.js?client="` (~3.2M hits)
  - *Date:* 2026-10-03
  - *Learned:* Non-standard loader path; no `ads.txt`; no CMP; script loads for everyone; legal pages show ads without the premium check.
  - *Why:* Ads may be earning $0; compliance gaps.
  - **[Observation]**
- **E38.** Medal held price while adding value.
  - *Source:* Medal blog
  - *URL:* https://medal.tv/blog/posts/same-price-more-stuff-check-out-the-updates-to-medal-premium
  - *Date:* June 2026
  - *Learned:* "Same price, more stuff".
  - *Why:* Positioning precedent.
  - **[Observation]**
- **E39.** Grandfathering precedent.
  - *Source:* Carl-bot Patreon post
  - *URL:* https://www.patreon.com/carlbot/posts/price-for-carl-131208404
  - *Date:* retrieved 2026-10-03
  - *Learned:* Existing patrons kept their old price.
  - *Why:* Supports the migration plan.
  - **[Fact, via search index]**
- **E40.** Demand for lifetime plans.
  - *Source:* Tracker.gg and Medal feedback boards
  - *URL:* https://feedback.tracker.gg/t/lifetime-subscription/20752 ; https://feedback.medal.tv/2451
  - *Date:* retrieved 2026-10-03
  - *Learned:* Users request lifetime plans.
  - *Why:* Demand exists; this doc still recommends against offering one.
  - **[Observation]**

---

## 11. Open items to verify manually (blocked this session)

1. **FTC Negative Option Rule status in 2026.** Was it re-proposed after the July 2025 vacatur? https://www.ftc.gov/legal-library/browse/rules/negative-option-rule
2. **California ARL current text** after AB 2863: consent, save-offer, reminder and price-notice details. https://leginfo.legislature.ca.gov (Bus. & Prof. Code §17600–17606)
3. **UK DMCC subscription regime commencement date** (gov.uk), and **EU CRD Art. 11a withdrawal button** national implementation (applies from 19 June 2026).
4. **Affiliate terms (commission, cookie window, deep-link rules, approval)** for Humble (Impact), GMG (Impact), Fanatical (Awin), Gamesplanet, WinGameStore and Loaded (Impact). Check inside the Impact and Awin dashboards. Also check whether `cdkeys.com` redirects to `loaded.com`.
5. **Steam:** confirm there is no affiliate program, and what `curator_clanid` attribution provides (Steamworks or curator documentation).
6. **Stripe Managed Payments:** US business eligibility, behavior with existing subscriptions and the Customer Portal, and the migration steps (https://docs.stripe.com/payments/managed-payments/update-checkout).
7. **Stripe standard US card pricing** and the international-card surcharge (https://stripe.com/pricing). **Paddle pricing below $10.**
8. **Ko-fi 2026 fees** for memberships and tips. Prior knowledge: 0% on one-off tips and 5% on memberships without Ko-fi Gold [Unverified].
9. **AdSense:** confirm the loader URL fix, real RPM, Privacy & messaging CMP and `ads.txt`.
10. **Discord native Premium Apps / App Subscriptions** as an alternative billing path for the Server plan: fees and availability [Unverified, not researched].
