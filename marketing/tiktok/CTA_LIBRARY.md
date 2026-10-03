# WeBothPlay CTA Library

How every TikTok video (and its Shorts/Reels version) ends, what goes in the pinned comment, the bio and the end card, and how links are tagged. Written 2026-10-03 for the 13-week plan (2026-10-05 → 2027-01-03).

**Citations.** "(research §3.7)" = a section of `marketing/TIKTOK_RESEARCH_2026.md`; "(research Q5.8)" = finding 8 under Q5 in its §2. Code paths point to this repo.

**Vocabulary used here.** Pillars P1–P11 (P1 Pain point · P2 Instant demo · P3 Squad stats · P4 Roulette · P5 Pile of shame · P6 Already own it · P7 Group chat energy · P8 Feature drops · P9 Steam moments · P10 Build in public · P11 Ask the squad). Series: Overlap Reveal, Spin It, Pile of Shame, One Copy Away, Carry Report, Group Chat Energy, Ask the Squad, Tonight's Pick. Calendar post IDs look like `W06-MON`.

---

## 0. Rules at a glance

| Rule | Detail | Source |
|---|---|---|
| **Every video** shows the product and closes with a small end card (≤2 s, inside the safe box) | The end card is a sign-off, not the explicit CTA | research §3.7 |
| **Explicit site CTA on about 1 in 3 videos** (1–2 a week) | Canonical line: "Compare your group's Steam libraries free — link in bio." | research §3.7 |
| **All other videos end on a genuine question** about the content | §1 | research §3.7, Q5.8 |
| **Discord CTA about twice a month** | It takes the explicit-CTA slot that week | research §3.7 |
| **Never Premium, prices or purchase prompts** in organic posts | Say "free to compare". In TikTok Shop markets, content that sends people off-platform to buy gets reduced visibility | research §3.7, Q5.3, Q9.2 |
| **Pinned comment on every demo video**, a one-line how-to | §8 | research §3.7 |
| **One CTA per video** | Don't stack a site CTA, a share ask and a question | House rule |
| **No engagement bait** | No like/follow/tag/comment-for-reward asks | research Q5.1–Q5.2 |

**Before you rely on "link in bio":** confirm the account can show a website link. Business accounts usually can; personal accounts have commonly needed 1,000+ followers (research Q9.1, unverified).

---

## 1. Soft endings: genuine questions (no CTA)

Use these on the roughly 2 in 3 videos without an explicit CTA. Say the line, show it in the body band (y 900→1400), and repeat it in the caption. A good question is about *this* video, is one you'll actually read, and has no reward or quota attached.

| ID | Line (spoken and on screen) | Best for |
|---|---|---|
| SQ01 | Which of these would your group actually finish? | P5, P6 lists |
| SQ02 | What does your group always fall back to? | P11, P7 |
| SQ03 | Who's the carry in your group, and in what game? | P3 (Carry Report) |
| SQ04 | Would your group accept the spin? | P4 (Spin It) |
| SQ05 | What's the game your whole group owns and nobody's launched? | P5 (Pile of Shame) |
| SQ06 | Couch or online: what does your group actually play? | P6 |
| SQ07 | What would you veto first? | P8, P11 (Tonight's Pick) |
| SQ08 | Which game is your group one copy away from? | P6 (One Copy Away) |
| SQ09 | What's one co-op game you'd add to this list? | P6, P9 lists |
| SQ10 | Longest your group has spent deciding? | P1, P7 |
| SQ11 | Which filter would your group tap first? | P2 |
| SQ12 | Horror night or cozy night? | P4 seasonal |
| SQ13 | Spin It group or vote group? | P4, P8 |
| SQ14 | What's on your group's pile of shame? | P5 |
| SQ15 | What should I build next? | P10. Only if you'll act on the answers |
| SQ16 | How many games do you think your group shares? | P3 (Overlap Reveal), after showing the demo's 39 |

---

## 2. Explicit site CTA

**Canonical line (use it word for word on most CTA videos):**
> **Compare your group's Steam libraries free — link in bio.**

On screen, split it to stay ≤26 characters per line, in the body band: `Compare your group's` / `Steam libraries free` / `link in bio`. Or use the short form `Free to compare` / `link in bio`.

| ID | Spoken line | Use when |
|---|---|---|
| XS01 | Compare your group's Steam libraries free — link in bio. | Default; P2 and P8 demos |
| XS02 | Free to compare. Link in bio. | Quick hits where the full line doesn't fit |
| XS03 | Try the demo group, or paste your own — link in bio. | Videos built on demo data (the homepage links to the demo) |
| XS04 | Paste everyone's profiles. It tells you who's hidden. Link in bio. | Private-profile videos (P8, P1) |
| XS05 | Make a vote link for your group — free, link in bio. | Group vote and Tonight's Pick videos |
| XS06 | Check what your group already owns first — link in bio. | P9 sale weeks. No "buy", no prices |

**Placement:** the CTA line runs in the last 2–3 seconds before the end card, inside the body band. Pair it with the pinned how-to comment (§8) and a UTM-tagged bio link (§7).

---

## 3. Discord bot CTA (about twice a month)

**What's free in Discord today** (`src/app/discord/page.jsx`, `bot/commands/help.js`): `/link` (each friend links Steam once), `/compare` (mention your friends), `/help`. **`/roulette`, `/backlog`, `/stats`, `/compatibility`, `/flex`, `/hype` and `/leaderboard` are Premium in the bot.**

- **Never** use a Premium command as an organic CTA. A viewer who tries it hits a paywall, which makes it a Premium pitch in disguise. Show Roulette and "Nobody's played" on the **website**, where they're free.
- **Voice-channel `/compare` is Premium** (`bot/commands/compare.js`; the Discord page and `/help` now say so). Show `/compare` **with friends mentioned**. A free user who types `/compare` in a voice call without mentions triggers voice mode and gets the Premium message, so avoid demonstrating that.

| ID | Spoken line | On screen |
|---|---|---|
| DB01 | Add the bot. Everyone runs /link once. Then /compare your friends. | `Add the bot` / `/link → /compare @friends` |
| DB02 | Already in Discord? Find steam games in common right there. | `Discord: /compare @friends` |
| DB03 | Add the bot from the link in bio. Then /compare your friends. | `Bot: link in bio` |
| DB04 | Results open on the site, with filters, roulette and the vote. | `/compare → full results` |

**Where the bot link lives:** the bio link goes to the homepage. Its "Add to your server" button records `discord_cta_clicked` (location `home_bot`), so Discord CTA posts are measured by `discord_cta_clicked` events from `utm_source=tiktok` visits (`WEEKLY_OPTIMIZATION_PLAYBOOK.md` §3).

**Visuals:** blurple (#5865F2) only on the Discord element. Record in a private test server with consenting, linked accounts. Show commands in JetBrains Mono.

**Calendar note:** the calendar has one Discord CTA (`W06-MON`). Add one about every other week by giving a P8 or P2 post's explicit slot to DB01–DB04.

---

## 4. Vote and share CTAs

These send people to features that bring more friends in. They count as the video's explicit CTA.

| ID | Line | Use on |
|---|---|---|
| VS01 | Star a few, send the vote link, spin among the survivors. | Tonight's Pick, P8 |
| VS02 | Send the share link. It previews right in Discord. | P8 share card |
| VS03 | One veto each. Send the vote link before game night. | Group vote demos |
| VS04 | Save this list for game night. | P6 lists and carousels. A platform action: use instead of, never alongside, a site CTA |
| VS05 | Send this to whoever picks next. | At most once a week; only when the video is genuinely useful to a group |

---

## 5. Comment prompts that are not bait

A comment prompt is fine when **all four** are true: (1) it's about this video; (2) you'll read and use the answers; (3) there's no reward, quota or condition; (4) the payoff of the video doesn't depend on commenting.

| ID | Prompt | Feeds |
|---|---|---|
| CP01 | Tell me your group's fallback game. | Ask the Squad list, reply videos |
| CP02 | Which game is your group one copy away from? | One Copy Away episodes |
| CP03 | What's sitting on your group's pile of shame? | Pile of Shame episodes |
| CP04 | What filter is missing? | P10 feedback |
| CP05 | Scariest co-op game your group has played? | P11 seasonal |
| CP06 | What would you veto? | Tonight's Pick |
| CP07 | Who carries your group, and in what? | Carry Report |
| CP08 | Co-op game we missed? | P6 list follow-ups |

**The reply-video loop** (research §3.9: 1–2 a week can count toward the baseline)
1. During daily replies (10–15 min), flag comments that ask "how", disagree usefully, or give a great answer.
2. Answer one with TikTok's Reply-to-comment video. Show the comment sticker inside the safe box, then answer with a screen recording.
3. Never invent comments, never reply as a fake viewer, and never show a commenter's Steam data without their consent.

**Comment-reply templates** (by hand, never automated)

| Comment | Reply |
|---|---|
| "How does it work?" | Paste everyone's Steam profile links (or sign in through Steam and pick friends). You get every game you all own. Link in bio. |
| "Is it free?" | Comparing is free for groups up to 8. There are optional paid plans for bigger groups and Discord extras, but you don't need them to compare. |
| "Do you need my password?" | No. Only public Steam data, and never your password. Friends' "Game details" need to be public. |
| "My friend's games don't show" | Their Steam "Game details" are probably private. The site tells you who, and gives you a message to send them. |
| "Is this made by Steam?" | No. WeBothPlay is independent. Not affiliated with Valve. |
| "Those people are fake?" | Yes. Nova, Bram, Kit and Juno are a demo group: fictional players, real games. |

The "Is it free?" reply answers a direct question factually. It is the only place paid plans come up, and it never links to pricing.

---

## 6. Bio text options

TikTok bios are short. **Check the in-app character counter. If both lines don't fit, keep the disclaimer and cut the pitch.** The disclaimer is required (research §3.11 #1). Keep "Steam" out of the username and display name: it reads as affiliation (house rule).

**Display name:** `WeBothPlay` or `WeBothPlay · games in common`

| ID | Platform | Bio text |
|---|---|---|
| BIO1 | TikTok | Find games your whole group already owns. Free to compare.<br>Not affiliated with Valve. Steam is a trademark of Valve Corporation. |
| BIO2 | TikTok | What are we playing? Paste your group's profiles.<br>Not affiliated with Valve. Steam is a trademark of Valve Corporation. |
| BIO3 | TikTok (shortest) | Games your group can play tonight.<br>Not affiliated with Valve. Steam is a trademark of Valve Corporation. |
| BIO4 | Instagram | Games your whole group owns, in one link. Free to compare.<br>Not affiliated with Valve. Steam is a trademark of Valve Corporation. |
| BIO5 | YouTube channel description | WeBothPlay compares your friends' Steam libraries and shows every game your whole group owns, then helps you pick one: Best for tonight, Roulette, or a group vote with one veto each. Free to compare at webothplay.com. Videos featuring Nova, Bram, Kit and Juno use demo data: fictional players, real games. Not affiliated with Valve. Steam is a trademark of Valve Corporation. |

**Bio link:** `https://webothplay.com/?utm_source=tiktok&utm_medium=social&utm_campaign=bio` (§7). Use `utm_source=instagram` or `utm_source=youtube` on the other platforms.

---

## 7. UTM conventions

**Format:** `https://webothplay.com/?utm_source=<platform>&utm_medium=social&utm_campaign=<campaign>`

| Parameter | Values | Rule |
|---|---|---|
| `utm_source` | `tiktok` · `youtube` · `instagram` | Lowercase, always |
| `utm_medium` | `social` | Always |
| `utm_campaign` | `bio` (default) · a series slug · a post ID · an event slug · `discord` | Lowercase letters, digits and hyphens, ≤40 characters (house rule). The site strips other characters (`src/lib/analytics.js`) |

**Series slugs:** `overlap-reveal` · `spin-it` · `pile-of-shame` · `one-copy-away` · `carry-report` · `group-chat-energy` · `ask-the-squad` · `tonights-pick`.

**Post IDs:** the calendar ID in lowercase (`W06-MON` → `w06-mon`).

| Situation | Link |
|---|---|
| Everyday TikTok bio | `…/?utm_source=tiktok&utm_medium=social&utm_campaign=bio` |
| A week pushing one series' CTA | `…/?utm_source=tiktok&utm_medium=social&utm_campaign=pile-of-shame` |
| CTA test weeks 7–8, if you switch the bio link when each post goes live (optional, 1 minute per post) | `…/?utm_source=tiktok&utm_medium=social&utm_campaign=w07-fri` |
| A Discord CTA week | `…/?utm_source=tiktok&utm_medium=social&utm_campaign=discord` |
| Confirmed event | `…/?utm_source=tiktok&utm_medium=social&utm_campaign=winter-sale-2026` |
| YouTube Shorts (channel links) | `…/?utm_source=youtube&utm_medium=social&utm_campaign=bio` |
| Instagram Reels (bio link) | `…/?utm_source=instagram&utm_medium=social&utm_campaign=bio` |

**Rules**
- **Always link to the homepage (`/`).** Only the homepage records `landing_viewed`, which feeds "Top sources" on `/admin` (`src/components/AnalyticsBoot.jsx`). Deep links keep their attribution but don't show up as visitors.
- **TikTok gives you one bio link**, so attribution is per campaign, not per post, unless you switch the link as each post goes live.
- **Attribution is first-touch per browser tab session** (`src/lib/track.js`). A viewer who copies the link into another browser may arrive untagged, so treat UTM numbers as a floor.
- Log every campaign value you use in the weekly template (`WEEKLY_OPTIMIZATION_PLAYBOOK.md` §6).

---

## 8. Pinned-comment templates

Pin by hand during your daily reply session. Scheduling tools may not pin.

| ID | Use on | Text |
|---|---|---|
| PC01 | Every P2/P8 demo | How: paste everyone's Steam profile links (or sign in through Steam and pick friends) → every game you all own, sorted by Best for tonight. Free to compare, link in bio. |
| PC02 | Any demo-data video | Nova, Bram, Kit and Juno are a demo group: fictional players, real games. Try it with your own group, link in bio. |
| PC03 | Private-profile videos | Friend's games not showing? Steam → your profile → Edit Profile → Privacy Settings → set "Game details" to Public (and untick "Always keep my total playtime private"). |
| PC04 | Spin It | Roulette spins through your shared games in about a second. Filter first (Co-op, Couch / Remote Play…) to narrow it. Skip or spin again anytime. |
| PC05 | Tonight's Pick / vote | Star a few games → Group vote → send the link. Everyone taps what they'd play, one veto each, then spin among the survivors. |
| PC06 | Discord CTA posts | Discord: add the bot, everyone runs /link once, then /compare and mention your friends. |
| PC07 | Any post where Steam is prominent | Not affiliated with Valve. Steam is a trademark of Valve Corporation. |
| PC08 | P9 event posts | Dates checked [date] on Steam's official events page. Prices change, so check the store. |

---

## 9. End-card variants

All end cards stay inside the safe box (x 64→940, y 150→1436) and on screen **≤2 s** (research §3.7). The renderer's end card already runs 1.8 s, both inside templates and as the standalone `end-card` asset.

| ID | Content | When |
|---|---|---|
| EC01 | Renderer default (`END-SITE` in `posts.json`): WeBothPlay wordmark · "Compare your group's Steam libraries" · "free · webothplay.com" · Valve disclaimer | Default for every video |
| EC02 | Minimal: wordmark · `webothplay.com` / `free to compare` (set the `cta`/`sub` fields) | Quick hits and memes |
| EC03 | Question: the SQ line above the wordmark (CapCut text, ≤2 lines) | Soft-ending videos, so the question stays readable |
| EC04 | Discord (`END-DISCORD` in `posts.json`): wordmark · "Add the WeBothPlay bot to your server" · "free · webothplay.com/discord". Add a blurple Discord element in CapCut if you want one | Discord CTA posts only |
| EC05 | Series: kicker `PILE OF SHAME · #4` · wordmark · `free to compare` | Series episodes (until the week-13 test says otherwise) |
| EC06 | Demo reminder | Don't put demo numbers on an end card. If you must, add the demo label: the renderer's end card has none |

**Never on an end card:** Premium, prices, amber (#f5a524, which is Premium-only), the Steam logo, game art, "link in comments".

---

## 10. Frequency, rotation and logging

| CTA type | Frequency | Typical home |
|---|---|---|
| Explicit site CTA (XS) | About 1 in 3 videos, 1–2 a week (research §3.7) | P2, P8 demos; P9 "check first" |
| Discord (DB) | About twice a month, in the explicit slot (research §3.7) | P8 |
| Vote/share (VS01–VS03) | Counts as explicit; at most 1 a week (house rule) | Tonight's Pick, P8 |
| Save / send (VS04–VS05) | At most 1 a week each (house rule) | P6 lists, carousels |
| Question ending (SQ) | Every other video | P1, P3, P4, P5, P7, P11 |
| Pinned how-to (PC01) | Every demo video | P2, P8 |

**Default rotation at 4 posts/week:** a 3-week cycle of 1, 1, then 2 explicit CTAs, which is 4 of 12 posts, or 1 in 3. In 2 of every 4 weeks, one explicit slot is a Discord CTA.

**Calendar alignment:** the calendar's CTA column sets which posts carry the explicit CTA (21 of its 52 baseline posts, including one Discord CTA). In weeks 7–8, follow the CTA test's assignment (`EXPERIMENT_PLAN.md` T4). In other weeks, if a week has 3 or more explicit CTAs, change the weakest fit (usually a P3 stat-card) to a question ending.

**Log every post** with its CTA ID (XS01, SQ04, DB01…) and `utm_campaign` in the results log (`EXPERIMENT_PLAN.md` §7). The weekly review compares CTA and no-CTA videos on profile visits per 1k views.

---

## 11. Never in organic content

- Premium, Pro, Hacker, prices, "upgrade", "unlock", "subscribe", "support us", "bigger groups with Premium".
- Discord Premium commands (`/roulette`, `/backlog`…) as a CTA; voice-channel `/compare` until the plan gating is confirmed free.
- "Buy now", "on sale for $X", or any unverified price or date.
- "Comment X to get the link", "follow for part 2" (unless part 2 is scheduled), "like if…", "tag 3 friends", giveaways (research Q5.2, §3.11 #5).
- "Official", "Steam's tool", "Valve-approved", the Steam logo (research §3.11 #1).
- Automated replies, likes or follows of any kind (research §3.9 #5).
