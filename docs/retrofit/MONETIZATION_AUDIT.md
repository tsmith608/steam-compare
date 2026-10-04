# Monetization audit

Research with sources: [research/MONETIZATION_RESEARCH.md](research/MONETIZATION_RESEARCH.md). Items marked *(owner decision)* change production billing or legal terms and are **not** applied automatically — they are listed in [NEEDS_FROM_OWNER.md](NEEDS_FROM_OWNER.md).

## 1. Where it stood

| Stream | State before | Problem |
|---|---|---|
| Stripe subscriptions | Pro $3.99/mo (compare 6), Hacker $9.99/mo (compare 12 + Discord server perk) | **Webhook broken for the pinned API version** (Premium could fail to activate or renew); downgrades created a second subscription; portal plan switches ignored; anyone could open anyone's billing portal |
| Ko-fi | Webhook + claim by transaction id | Webhook unauthenticated without its token; claims repeatable onto any account; non-"Pro/Hacker" Ko-fi tier names granted nothing |
| AdSense | Script on every page, slots on results | Non-standard script path (likely never served), no `ads.txt`, no consent, shown to Premium users on some pages |
| "Affiliate" links | CDKeys search links | **No affiliate id** (UTM only → $0), grey-market key reseller, no disclosure |
| Free tier | 3 players (form said 4), filters and saved squads paywalled | Worse than Steam's free built-in (8 players) and every competitor |

## 2. Benchmarks (what similar products charge)

| Product | Plan | Price | Source |
|---|---|---|---|
| Backloggd | Supporter / Backer | $1 / $3 per month | research table B1 |
| Infinite Backlog | Legend / Myth | €3 / €6 per month ("core features never paywalled") | B2 |
| Tracker Network | Premium | $3/mo or $30/yr | B6 |
| Blitz | Pro | $4.99/mo | B7 |
| Discord Nitro Basic | — | $2.99/mo, $29.99/yr | B10 |
| Carl-bot (Discord) | Premium per server | $7.99/mo for 1 server | B11 |
| MEE6 (Discord) | Premium per server | $13.99/mo | B12 |
| Trakt | VIP | $60/yr after a price rise **and** free-tier cuts → strong backlash | B14 |

**Reading:** individuals in this niche pay roughly **$2.50–$4/month**; Discord communities pay **per server**; taking features away from the free tier is the fastest way to anger users (Trakt). *(Interpretation.)*

## 3. What we changed

### Packaging (implemented in `src/lib/plans.js` — single source of truth)

| | **Noob** (free) | **Pro** — $3.99/mo | **Hacker** — $9.99/mo |
|---|---|---|---|
| Players per comparison | **8** (was 3) | 12 (was 6) | 16 (was 12) |
| Filters, sort, search, roulette, votes, share cards, one-copy-away, backlog | ✅ all free | ✅ | ✅ |
| Saved groups (synced to Steam login) | 3 | 50 | 200 |
| Discord premium commands | — | ✅ | ✅ + **server perk** |
| Profile customization + badge | — | ✅ | ✅ |
| Ads | none for anyone | — | — |

- **Existing subscribers keep their plan and price**; their limits only went up.
- If *anyone* in a comparison has Premium, that comparison gets the bigger limit (existing behaviour, kept and made consistent).
- Annual billing is coded and appears automatically once annual Stripe prices exist (`STRIPE_PRICE_ID_PRO_ANNUAL`, `STRIPE_PRICE_ID_HACKER_ANNUAL`). Displayed annual prices are $29.99 and $79.99 *(owner decision: create those Prices or edit `PRICING`)*.

### Billing robustness (implemented)

- Webhook verified with the signing secret, **idempotent** (`stripe_events`; a crashed claim is re-claimable after 5 minutes), **order-independent** (subscription state is re-read from Stripe on every event), and compatible with the current API (`items.data[].current_period_end`, `invoice.parent.subscription_details.subscription`) with fallbacks for older payloads.
- Tier derived from the **price id** (portal plan switches stick), then metadata.
- Handles `checkout.session.completed`, `customer.subscription.created|updated|deleted|paused|resumed`, `invoice.paid|payment_succeeded|payment_failed`. Access continues through Stripe's retry window (2-day grace on the period end); `billing_status` shows "past due" on the pricing page with a fix link.
- Checkout requires a Steam session, reuses the Stripe customer, routes existing subscribers to the **Customer Portal** (no duplicate subscriptions), enables promotion codes, optional automatic tax (`STRIPE_AUTOMATIC_TAX=1`), and returns to `/upgrade/success`, which waits for the webhook.
- Failures alert the owner on Discord (`OWNER_ALERT_WEBHOOK_URL`); the weekly report includes MRR, active/past-due counts, new Premium, cancellations and failed payments.
- Ko-fi: verification token required (fails closed + alert), single-use claims onto the signed-in account only, legacy tier names normalised. Claims now grant the same 32 days per payment as the webhook (the old claim path set no expiry, so a reused transaction id meant permanent Premium). Existing permanent plans are kept: a new payment can only extend access, never shorten it, and never overrides a live Stripe subscription (`grantKofiPremium` in `src/lib/billing.js`, covered by integration tests).

### Upgrade moments (no dark patterns)

Upsells appear only when a limit is hit: a 9th player in the form, the plan-limit result page, the saved-groups limit. No pop-ups, no countdowns, no fake "most popular" label (the Pro card says "Recommended"), renewal terms printed beside every paid button, cancellation in two clicks via the portal.

### Secondary revenue

- **AdSense removed** (likely $0 today; hurts speed and trust; would need `ads.txt` + EU/UK consent to do properly). Re-add only if traffic makes ≥ $25/month plausible.
- **CDKeys removed.** Store links now go to the **official Steam store**.
- **Optional affiliate stores** (Humble Store, Green Man Gaming, Fanatical) appear only when the owner pastes approved deep-link templates (`NEXT_PUBLIC_AFFILIATE_HUMBLE` / `_GMG` / `_FANATICAL`, each containing `{url}`), are marked `rel="sponsored"`, and come with a disclosure line. *(Owner: apply on Impact/Awin; commission rates unverified.)* There is no Steam affiliate program; IsThereAnyDeal's API terms forbid removing its affiliate tags, so it isn't used.

## 4. Recommended Stripe dashboard settings *(owner, 15 minutes)*

1. **Webhook endpoint** → keep the existing `https://webothplay.com/api/webhooks/stripe` endpoint and its API version (the handler re-reads subscriptions through the SDK and accepts both event formats); select the events listed above. Only a newly created endpoint needs its signing secret pasted into `STRIPE_WEBHOOK_SECRET`.
2. **Billing → Revenue recovery**: Smart Retries (8 tries / 2 weeks) then cancel; turn on emails for failed payments, expiring cards and upcoming renewals (7 days before annual renewals); receipts on.
3. **Customer Portal**: allow cancel (at period end, ask for a reason), switch between the Pro/Hacker (monthly + annual) prices, update payment method, invoice history.
4. **Tax** *(owner decision)*: either Stripe Tax (`STRIPE_AUTOMATIC_TAX=1` after registering where required) or Stripe Managed Payments (Stripe as merchant of record, +3.5% per the research, unverified details).
5. **Terms of service checkbox** at checkout: set the ToS URL (`/terms`) in Stripe's public details first.

## 5. Next revenue ideas (ranked)

1. **Per-server Discord plan** (the research's "Premium + Server" at ~$6.99/mo) — replaces the "any Hacker member unlocks a server" perk that one subscriber can spread across many servers. Grandfather current Hackers. *(owner decision)*
2. **Sale alerts** for one-copy-away and shared-wishlist games (Premium).
3. **Annual plans** (cuts Stripe fees per subscriber-year substantially per the research's fee math).
