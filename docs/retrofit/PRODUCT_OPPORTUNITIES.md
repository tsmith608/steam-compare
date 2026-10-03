# Product opportunities

**Question:** what stops WeBothPlay from being the fastest, most enjoyable answer to *"what should our group play tonight?"*
**Inputs:** [JTBD research](research/JTBD_RESEARCH.md), [competitor matrix](COMPETITOR_MATRIX.md), the [audit](CURRENT_STATE_AUDIT.md).

Refined job statement: *"When my friends and I want to play together, help us see what we can **all** play right now — without anyone buying or installing anything, and without a 20-minute debate — and then get us to an actual decision."* The second half (deciding) is the differentiator; the first half is table stakes (Steam's own client does it for chats of up to 8).

## Scoring

Each opportunity scored 1–5 on: **V**alue to users · **F**requency · **D**ifferentiation · **C**ost (5 = cheap) · **R**evenue potential · Vi**r**ality · **M**aintenance (5 = low). Total /35.

| # | Opportunity | V | F | D | C | R | Vr | M | Total | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Free core for ≤ 8 + all filters** (parity with Steam, beat competitors) | 5 | 5 | 3 | 5 | 3 | 4 | 5 | **30** | ✅ Shipped |
| 2 | **Private-profile handling** (partial results, who's hidden, copyable fix message, guide) | 5 | 4 | 4 | 4 | 2 | 4 | 5 | **28** | ✅ Shipped |
| 3 | **Shareable results URL + share card** (OG image with the group's numbers + a fun fact) | 4 | 4 | 4 | 4 | 3 | 5 | 4 | **28** | ✅ Shipped (`/s/[id]`) |
| 4 | **Group vote with one veto each** + "spin among the survivors" | 5 | 4 | 4 | 3 | 3 | 5 | 4 | **28** | ✅ Shipped (`/poll/[id]`) |
| 5 | **"One copy away"** (games everyone owns except one person, with price from store data) | 4 | 3 | 5 | 4 | 4 | 3 | 5 | **28** | ✅ Shipped |
| 6 | **Filters on store tags** incl. Remote Play Together, controller, free; hide single-player by default | 5 | 5 | 2 | 4 | 2 | 2 | 4 | **24** | ✅ Shipped |
| 7 | **"Best for tonight" sort** (recent group activity > everyone has played > hours) | 4 | 5 | 3 | 5 | 1 | 1 | 5 | **24** | ✅ Shipped |
| 8 | **Fun facts** (most played together, everyone owns but nobody launched, "the carry") | 3 | 4 | 4 | 5 | 1 | 5 | 5 | **27** | ✅ Shipped |
| 9 | **Roulette that respects filters**, ≤ 1.1 s, skippable, haptic | 4 | 4 | 2 | 5 | 1 | 3 | 5 | **24** | ✅ Shipped |
| 10 | **Saved groups** (account, per plan) + recent groups (device) | 4 | 4 | 2 | 4 | 4 | 1 | 4 | **23** | ✅ Shipped |
| 11 | **Example comparison** on the homepage and `/compare?demo=1` | 4 | 3 | 3 | 5 | 2 | 3 | 5 | **25** | ✅ Shipped |
| 12 | Multi-paste of profile links, inline validation, field-level errors | 4 | 5 | 2 | 5 | 1 | 1 | 5 | **23** | ✅ Shipped |
| 13 | Wishlist overlap + gift ideas (fixed for Steam's new wishlist API) | 3 | 2 | 3 | 4 | 3 | 2 | 4 | **21** | ✅ Shipped |
| 14 | Tool landing pages (/roulette, /backlog, /coop) that open results in that mode | 3 | 3 | 2 | 5 | 2 | 2 | 5 | **22** | ✅ Shipped |
| 15 | **Discord: user-install app + public result cards with buttons** (Open comparison / Reroll / Add to server) | 4 | 4 | 3 | 3 | 3 | 5 | 3 | **25** | 🔶 Partly: links now carry attribution; command contexts documented — next sprint |
| 16 | **Discord: replace GuildMembers intent** with `/perk activate` per guild (avoids yearly intent review at 10k users) | 2 | 2 | 1 | 3 | 2 | 1 | 5 | **16** | 📋 Next (documented) |
| 17 | Steam Deck verified badge + review score via `IStoreBrowseService/GetItems` (batched, undocumented) | 3 | 3 | 3 | 3 | 1 | 1 | 3 | **17** | 📋 Next — needs live testing against Steam |
| 18 | "Tonight mode" wizard (players, session length, mood → narrowed list) | 3 | 3 | 3 | 3 | 2 | 2 | 4 | **20** | 🔶 Covered by filters + sort + vote; a guided wizard can wait for usage data |
| 19 | Sale alerts for "one copy away" / shared wishlist (email/Discord) | 4 | 2 | 3 | 2 | 5 | 2 | 2 | **20** | 📋 Premium candidate; needs email provider + price source terms check |
| 20 | Player-count data (IGDB/PCGamingWiki) | 3 | 3 | 3 | 2 | 1 | 1 | 2 | **15** | ⏸ Later (third-party auth/licensing, data quality) |
| 21 | Console library linking | 2 | 2 | 1 | 1 | 1 | 1 | 1 | **9** | ❌ Skip (ReadyUp does it free; high maintenance) |
| 22 | HowLongToBeat integration | 2 | 2 | 2 | 2 | 1 | 1 | 1 | **11** | ❌ Skip (no official API; frequent breakage) |
| 23 | Full deal tracker | 2 | 2 | 1 | 2 | 3 | 1 | 1 | **12** | ❌ Skip (IsThereAnyDeal's API terms forbid competing apps) |
| 24 | AI recommendations | 2 | 2 | 1 | 2 | 2 | 1 | 2 | **12** | ❌ Skip (no evidence of need; cost + trust) |

## What changed for the user (end to end)

1. **Land** → the form is the hero; a live mini-result of an example group shows the payoff before any typing.
2. **Add the group** → paste several links at once, or sign in through Steam and tick friends; saved/recent groups are one tap.
3. **See the overlap** → `/compare?p=…` (shareable, refreshable): headline numbers, fun facts, tabs for *everyone owns / one copy away / nobody's played / only one owns / wishlists*.
4. **Narrow it** → search, "best for tonight" sort, co-op/couch/PvP/controller/free filters, single-player hidden; grid or list.
5. **Decide** → spin (respects filters) or star a few and send a **vote link** (one veto each, live results, spin among survivors).
6. **Share** → a link whose preview card shows the group's numbers and a joke-worthy fact.
7. **Launch** → `steam://run/<appid>` from any card or the roulette result.

## Next 3 product bets (in order)

1. **Discord public result cards + user-install** — the bot is the highest-leverage distribution loop (every result is seen by a whole server).
2. **Deck/review badges via batched store data** — better "tonight" decisions with zero new third parties (verify the endpoint against live Steam first).
3. **Sale alerts for one-copy-away games** — the clearest Premium value that isn't a paywall on the core.
