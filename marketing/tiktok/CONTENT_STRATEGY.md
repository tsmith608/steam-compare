# WeBothPlay on TikTok: Content Strategy

Window: 13 weeks, Mon 2026-10-05 → Sun 2027-01-03 · Written 2026-10-03 · Owner: solo founder, a few hours a week, never on camera.

**Read with:** `90_DAY_CALENDAR.csv` (what to post each day) · `HOOK_LIBRARY.md` · `CTA_LIBRARY.md` · `STYLE_GUIDE.md` · `SHOT_AND_MOTION_GUIDE.md` · `EXPERIMENT_PLAN.md` · `WEEKLY_OPTIMIZATION_PLAYBOOK.md` (all in `marketing/tiktok/`).

**Citations.** "(research §3.4)" points to a section of `marketing/TIKTOK_RESEARCH_2026.md`. "(research Q4.1)" points to finding 1 under question Q4 in its §2. "(JTBD F3)" and "(matrix C1)" point to `docs/retrofit/research/JTBD_RESEARCH.md` and `docs/retrofit/COMPETITOR_MATRIX.md`. Any number not tied to one of these comes from the product facts or is a house rule, and is marked as such.

---

## 0. The plan on one page

| Topic | Decision |
|---|---|
| Goal | Turn TikTok views into comparisons: **view → profile → site → comparison**. |
| Cadence | **4 posts/week (Mon/Wed/Fri/Sun)**: videos, except 4 of the 52 baseline slots, which are Photo Mode carousels. Floor 3/week, never 7+ days without a post. 7/week only in event weeks whose dates are confirmed. Optional +1 Photo Mode carousel/week, as a bonus (research §3.1). |
| Length mix | 50% quick hits (9–20 s) · 35% demos/lists (25–45 s) · 15% deep dives (60–120 s) (research §3.2). |
| Hook | The payoff is in frame 1. Motion within 1 s. Key message on screen by 3 s. One searchable phrase in the first on-screen text, the voiceover (within 5 s) and caption line 1 (research §3.3, §3.5). |
| Safe zone (1080×1920) | Critical content inside **x 64→940, y 150→1436**. Hook band y 220→700, body band y 900→1400 (research §3.4). |
| Audio | Business Account. Commercial Music Library (CML) or original audio only (research §3.6). |
| CTA | Explicit site CTA on about 1 in 3 videos. Discord CTA about twice a month. **No Premium or purchase CTAs in organic posts.** Say "free to compare" (research §3.7). |
| Disclosure | "Your brand" (Promotional content) toggle on for every post (research §3.6). |
| Hashtags | 3–5, never more than 5 (research §3.5). |
| Scheduling | TikTok Studio web scheduler or an official TikTok-partner scheduler. Never automate engagement. Reply to comments by hand daily (research §3.9). |
| Guardrails | No Steam logo, no implied Valve endorsement, no hero game art, no Microsoft-owned game content as hero, label demo data on screen (research §3.11). |
| Time budget | About 4–4.5 hours/week: one ~2-hour batch, a 30-minute review, 10–15 minutes of replies a day. |

---

## 1. Goals and the funnel

### 1.1 The funnel

| Stage | What has to happen | What moves it | Where you measure it |
|---|---|---|---|
| **1. View** | The video stops the scroll and gets watched. | Payoff in frame 1, motion in the first second, key message by 3 s, a searchable phrase. | TikTok Studio: views at 24 h/72 h, average watch time, % watched in full, traffic source (For You / Search / Profile / Following). |
| **2. Profile** | The viewer wants more and taps the name. | Series that promise more episodes, a clear account name and bio, product visible in the video. | TikTok Studio: profile views, follows per 1k views. |
| **3. Site** | They tap the bio link. | An explicit CTA on about 1 in 3 videos, a pinned how-to comment, a bio that says what the link does. | `/admin` → "Top sources (unique visitors)" row `tiktok` (bio link carries `utm_source=tiktok`). Bio-link clicks in TikTok Studio, if shown. |
| **4. Comparison** | They paste their group's profiles (or try the demo) and get results. | A clear demo in the video ("paste links → results"), a smooth product, private-profile guidance. | Events with `utm_source=tiktok`: `comparison_started`, `comparison_succeeded`, `result_shared` (SQL in `WEEKLY_OPTIMIZATION_PLAYBOOK.md` §3). Site-wide funnel and "Why comparisons failed" on `/admin`. |
| **Loop** | They send a share link or vote link to the group chat. | Share cards and the group vote, shown in P8 videos. | `/admin` → Feature usage: `result_shared`, `share_viewed`, `poll_created`, `poll_voted`. |

**Why the loop matters.** Shares per post rose 45% year on year while comments fell 24% (Socialinsider, research Q1.5). An older TikTok/Material study found 90% of TikTok gamers encouraged friends to play a game they discovered there (research Q3.5, older data). Group play is shared by nature, so design for "send this to the group chat" moments (research Q5.8).

### 1.2 What each pillar does in the funnel

| Funnel job | Pillars |
|---|---|
| Reach (views, shares) | P1 Pain point · P3 Squad stats · P4 Roulette · P7 Group chat energy |
| Consideration (profile visits, saves) | P2 Instant demo · P5 Pile of shame · P6 Already own it · P8 Feature drops |
| Action (site visits, comparisons) | Any video carrying the explicit CTA, P2 demos with a pinned how-to, P8 Discord posts |
| Community and trust | P10 Build in public · P11 Ask the squad · reply-to-comment videos |
| Timely spikes | P9 Steam moments (only once dates are verified) |

### 1.3 Goals for the 13 weeks

1. **Consistency.** Publish the baseline every week: about 52 videos over 13 weeks, plus about 15 more if the event weeks are confirmed (research §3.1).
2. **Learning.** Finish the seven calendar tests (`EXPERIMENT_PLAN.md`), and lock the two best posting slots by week 5 (research §3.8).
3. **Funnel growth.** TikTok visitors and TikTok-attributed comparisons started should grow week over week, while comparisons started per TikTok visitor holds steady. *House rule:* set absolute targets only after 4 weeks of your own data. No benchmark exists for an account like this one.
4. **Repeatable winners.** By week 13, have at least two series or hook families that beat the account median by 2× twice, which is the research's "double down" bar (research §3.12).

---

## 2. Audience: who, where, when

### 2.1 Who

| Segment | Who they are | The job they hire us for | Pain we lead with (JTBD) |
|---|---|---|---|
| **The organizer** (primary) | The friend who starts game night in Discord or the group chat. PC/Steam player in a group of 3–8. | "Find a game all of us can launch tonight, and get us to a fair decision fast." (JTBD 1.1) | F1 finding the overlap is tedious · F2 nobody can decide |
| **The bigger group** | 5–8 friends who outgrow 4-player assumptions. | See what the whole group owns, not pairs. | F1 · F4 headcount (we can't verify player caps, so never promise them) |
| **The backlog group** | Friends who all bought the same bundles and sales. | "Surface games we all already own but forgot." (JTBD J4) | F6 backlogs (the group backlog is our differentiator; matrix §7 gap 3) |
| **The private friend** | Has Steam "Game details" set to private, often without knowing. | Get their library in without a support session (JTBD J5). | F3 privacy silently breaks comparisons |
| **Discord regulars** | Groups that live in one server. | Compare without leaving Discord. | F1 in a server context |

### 2.2 Where

- **For You feed.** It delivered 58% of TikTok views in 2025, up from 31% in 2023 (Dash Social, research Q1.4). Followers matter less than the hook, which helps a new account.
- **TikTok Search.** 1 in 4 users start searching within 30 seconds of opening the app, and 2 in 3 searchers value finding useful things beyond their query (TikTok Next 2026, research Q4.1). That is why every video is built around one searchable phrase.
- **Group chats and Discord.** The video's second life is being sent to friends. Make the payoff something worth forwarding.

### 2.3 When

- They need us **right before a session**: evenings and weekends, often already in a voice call (JTBD 1.1).
- Metricool's 2026 study found 6–9 pm best for views, with 8 pm strongest (research Q10.1). The time-zone basis is unknown, so treat it as a starting hypothesis.
- **Weeks 1–4:** rotate 12:00, 17:00 and 20:00 in your main audience's time zone. **From week 5:** lock the best two slots (±1 h) and re-test one alternative every 4 weeks (research §3.8). The slot grid is in `EXPERIMENT_PLAN.md` §4.
- Pick **one** main audience time zone (where most TikTok viewers and site visitors are) and schedule everything in it.

### 2.4 What they search for

Rotate these eight phrases. Each video gets exactly one. Show it in the first on-screen text (the hook, or the first caption when the hook can't hold it), say it within 5 s, and put it at the start of caption line 1 (research §3.3 #4, §3.5).

| Phrase | Best pillars |
|---|---|
| "games to play with friends" | P1, P6, P7 |
| "co-op games on steam" | P6, P9 |
| "steam games in common" | P2, P3 |
| "compare steam libraries" | P2, P8 |
| "what game should we play" | P1, P4, P7 |
| "steam backlog" | P5 |
| "multiplayer games steam" | P6, P9 |
| "steam game roulette" | P4 |

Every week, check each video's Search share in TikTok Studio. Promote phrases that win into series titles (research §3.5).

---

## 3. Positioning

**One line:** *WeBothPlay turns "what are we playing?" into one link. Everyone's Steam libraries go in, and the games your whole group can play come out, with a fair way to pick one.*

**The message is "what your group can play tonight", not "compare libraries".** Basic overlap is a commodity: Steam's client does it, and so do many free tools (matrix §1; JTBD F1). Still use "compare steam libraries" as a *search phrase*, because people search for it.

### 3.1 Versus "just use Steam's built-in feature"

Steam's desktop client has library friend filters and "Find Games to Play Together" for group or voice chats of 8 or fewer (matrix C1). It is free, trusted and good. **Never attack it, and never claim what Steam can't do.** The research could not check Steam's mobile app or every client feature (matrix §6.1).

| Situation | What we show | How we say it |
|---|---|---|
| Everyone is at a desk with Steam open | Not our moment | "Steam's filter is great at your desk." |
| The group is in a chat, on phones, or not all in Steam | One link in any browser; the share card previews in Discord | "Send one link to the group." |
| One friend is missing the game | "One copy away", wishlist overlap, gift ideas | "See who's one copy away." |
| Nobody can decide | "Best for tonight" sort, Roulette (spins in about a second), Group vote with one veto each | "Vote, veto, spin the survivors." |
| Big backlog | "Nobody's played": everyone owns it, nobody has more than 2 h | "Your group's pile of shame." |
| A friend's library won't load | Names who's hidden and gives a copyable fix message | "See who's hidden, send them the fix." |

### 3.2 Versus Discord bots

Several free bots compare libraries inside a server (matrix §3). Our angle: **WeBothPlay works whether or not you share a server.** It is a link anyone can open, with filters, a vote and a share card, and there is a WeBothPlay bot for groups that live in Discord. **Never name competitors in videos** (house rule: we can't verify their current features).

### 3.3 Words

| Use | Avoid (and why) |
|---|---|
| "free to compare" | "free forever", "unlimited", any price (Premium exists; no purchase CTAs, research §3.7) |
| "games you all own", "what your group can play tonight" | "official", "Steam's tool", "Valve-approved" (implies endorsement, research Q6.5–Q6.6) |
| "one copy away", "nobody's played", "tonight's pick" | "the only", "the best", "#1" (unverifiable) |
| "see who's hidden and send the fix" | "works with private profiles" (it can't read private libraries; it names them) |
| "Steam" as a plain description ("for your Steam library") | The Steam logo or Steam-style UI anywhere (research §3.11 #1) |

---

## 4. The 11 pillars

**Shares** are targets across all videos published in the 13 weeks, including event extras. They roughly match the calendar's mix. The calendar decides the day; these shares keep it balanced.

| Pillar | Purpose | Share (target) | Main formats | Example concepts | Success metric |
|---|---|---|---|---|---|
| **P1 Pain point** | Name the "what are we playing?" problem so the viewer feels seen. | ~8% | Template render (meme-card, stat-card); Template + screen recording | "Checking 4 libraries by hand?"; "Stop suggesting games half the group owns"; the private-profile mystery | Shares per 1k views; genuine comments |
| **P2 Instant demo** | Show the product working in seconds. | ~13% | Screen recording + VO; Template + screen recording | Paste 4 profiles → results; 3 filter taps to tonight's game; sign in through Steam and pick friends; do it from your phone | Profile visits per 1k; TikTok visitors; comparisons started |
| **P3 Squad stats (demo data)** | Turn a group's library into a story worth sharing. | ~11% | Template render (overlap-reveal, stat-card) | "39 games all four own"; "80% overlap"; "Nova carries Marvel Rivals"; most played together | Shares and saves per 1k; % watched in full |
| **P4 Roulette** | The signature moment: short, loopable, satisfying. | ~10% | Template render (roulette); Screen recording + VO (site Roulette) | Spin It weekly; horror, couch and cozy filters; spin among the survivors | % watched in full; average watch time |
| **P5 Pile of shame (backlog)** | The group backlog, a gap no competitor description claims (matrix §7 gap 3). | ~8% | Template render (nobody-played); Screen recording | Everyone owns Bloons TD 6, nobody launched it; 13 games nobody's really played; New Year resolution | Saves per 1k; shares per 1k |
| **P6 Already own it (recommendations)** | Search-led lists built from what groups own. | ~11% | Photo Mode carousel; Template render (top-five) | Co-op games you might already own; couch co-op for the holidays; free-to-play fallbacks; One Copy Away | Saves per 1k; Search share % |
| **P7 Group chat energy (memes)** | Relatable jokes about deciding. Reach and shares; cheap stretch-week filler. | ~14% | Template render (meme-card) | 9 pm "idk, you pick"; "one more game" at 2 am; "I'm not buying anything this sale" | Shares per 1k; 24 h views vs median |
| **P8 Feature drops** | Explain one feature per video. | ~7% | Screen recording + VO | Group vote with one veto each; share card preview; private-profile fix; saved groups; Discord `/compare` | Profile visits per 1k; feature usage on `/admin` |
| **P9 Steam moments (sales/events, dates verified first)** | Ride confirmed Steam events and fixed holidays. | ~9% (mostly stretch weeks) | Screen recording + VO; Photo Mode carousel; 60–120 s deep dives | Next Fest co-op demos to try together; "before the sale: check One Copy Away"; Halloween co-op you might own | Search share %; 72 h views; TikTok visitors |
| **P10 Build in public (rare)** | Honest behind-the-scenes, as voiceover or text, never on camera (TikTok Next "Reali-Tea", research Q3.7, Q7.5). | ~3% | Screen recording + VO | Why I built it (true story only); what changed after feedback | Follows per 1k; comments |
| **P11 Ask the squad (community prompts)** | Real questions that start conversations and feed reply videos. | ~6% | Template render; Reply-to-comment video | Your group's fallback game; scariest co-op night; the game you'd force on your friends | Genuine comments; reply-video candidates |

**Pillar rules**
- **P3, P5 and P6 use demo data most.** Label it on screen for as long as it is visible (research §3.3 #7).
- **P9 only after verification** (§10). P10 only with true first-person facts.
- **P11 questions must be real.** Answer them, and turn the best answers into Reply-to-comment videos (research §3.9: 1–2 a week can count toward the baseline).

---

## 5. Series

Series give viewers a reason to visit the profile and follow. The calendar numbers them in its concepts (for example "Spin It #1").

| Series | Pillar | Format / template | Length | Beat structure | Rhythm |
|---|---|---|---|---|---|
| **Overlap Reveal** | P3, P2 | overlap-reveal template, optional screen-recording proof | 12–20 s | Payoff in the hook text → rings merge → count lands → fun fact → question | ~2/month |
| **Spin It** | P4 | roulette template, or a screen recording of the site's Roulette | 10–15 s | Landed pick (flash-forward) → spin → "Tonight's pick" → question | Most weeks |
| **Pile of Shame** | P5 | nobody-played template | 9–12 s | "All four own [game]" → "Combined hours: 0" → punchline → question | ~2/month |
| **One Copy Away** | P6, P2 | Screen recording (One copy away section), stat-card | 15–25 s | Game + who's missing → why it matters → question | ~monthly |
| **Carry Report** | P3 | stat-card | 9–12 s | "Nova: 36 h. Everyone else: 0." → "who's the carry in your group?" | ~monthly (trend-slot fallback) |
| **Group Chat Energy** | P7 | meme-card | ~9 s | Chat lines → punchline → end card | Reserve bank and trend-slot fallback |
| **Ask the Squad** | P11 | meme-card or stat-card; Reply-to-comment video | 9–12 s | Question → example answer (demo, labelled) → ask | ~2/month plus replies |
| **Tonight's Pick** | P4, P8 | Screen recording: Shortlist → Group vote → spin among the survivors | 20–35 s | Survivors → spin → pick | ~monthly |

**Series title on screen:** until the week-13 test (`EXPERIMENT_PLAN.md` T7), show the series name as a small kicker above the hook and as caption line 2. Week 13 tests whether removing it changes follows per 1k views.

---

## 6. Cadence and length mix

### 6.1 How the calendar's slots work

| Calendar status | Days | Rule |
|---|---|---|
| **Planned — baseline (publish)** | Mon, Wed, Fri, Sun | The 4 posts/week baseline (48 videos + 4 carousels over 13 weeks; research §3.1). Saturday trend slots and reserve rows are optional extras, not baseline. |
| **Event extra — verify the event date first** | Mostly Tue/Thu | Publish only if the event's dates are confirmed (§10). This is how event weeks reach 7/week. |
| **Reserve bank** | Tue/Thu | Publish only in a confirmed event week, or after you pass the week-4 gate. |
| **Trend slot** | Sat | Optional. See §9. Outside confirmed event weeks it is the only routine exception to 4/week, and it is used only when a trend clears the bar. The bank fallback goes out only in confirmed event weeks or after the week-4 gate. |

**Other cadence rules**
- **Floor:** 3 posts/week; never 7+ days without a post (research §3.1).
- **Carousels are a bonus** (research §3.1). When the calendar puts a carousel in a baseline slot, that week has 3 videos + 1 carousel. That is above the floor; add a reserve video if you have time.
- **Reply-to-comment videos** can count toward the baseline, 1–2 a week (research §3.9).
- **Week-4 gate:** if production feels sustainable and views per post are stable or rising, go to 5–6/week through week 8 by publishing reserve-bank posts. **Week-8 gate:** keep the higher rate only if total views and follows per 1k views improved without hurting average watch time (research §3.1).
- **Why not daily?** Buffer's within-account study of 11.4M posts found the steepest per-post gain going from 1 to 2–5 posts/week (up to +17% views per post). Going higher added less per step (up to +29% at 6–10/week, +34% at 11+), and the median post barely moved (research Q1.3). Dash Social found brands posting fewer than 6 times a week had 63% higher TikTok engagement (research Q1.4). For a solo owner, sustainable quality is the constraint (research Q1.9).

### 6.2 Length mix

| Bucket | Share | Length | Use it for |
|---|---|---|---|
| Quick hits | 50% | 9–20 s | Memes, number reveals, roulette spins, one idea, loopable |
| Demos and lists | 35% | 25–45 s | Screen-recorded feature demos; "5 co-op games your group might already own" |
| Deep dives | 15% | 60–120 s | Event roundups (Next Fest co-op demos, Winter Sale group picks). These test Buffer's correlation of >60 s videos with more reach (research §3.2, Q2.1; older, correlational data) |

**Calendar note.** Most calendar posts are 8–20 s. To get near 50/35/15, extend some P2, P6 and P8 posts to 25–45 s (add the "how" steps) and make confirmed event roundups 60–120 s. Stat-card renders default to 8 s, so take them to at least 9 s to stay in the quick-hit bucket.

---

## 7. Weekly production system

### 7.1 The week

| When | Task | Time |
|---|---|---|
| **Thursday** | Weekly review (`WEEKLY_OPTIMIZATION_PLAYBOOK.md`), then the batch session for **next** Mon–Sun, then schedule. Batching on Thursday keeps the following Sunday within a 10-day scheduling window (vendor guides disagree between 10 and 30 days; verify yours, research Q11.1). | 30 min + ~2 h |
| **Saturday** | Trend-slot check; post only if a trend qualifies (§9). | 0–30 min |
| **Daily** | Reply to comments by hand. Note 1–2 comments that deserve a reply video (research §3.9). | 10–15 min |
| **Monday** | Skim the automatic weekly owner report in Discord (site funnel). | 5 min |
| **Weeks 4, 8 and 12** | Monthly reset (playbook §7). | +20 min |

### 7.2 The ~2-hour batch session

| Minutes | Do this |
|---|---|
| 0–10 | Open next week's 4 baseline rows in the calendar. Apply this week's test assignments (`EXPERIMENT_PLAN.md`). Pick hooks (`HOOK_LIBRARY.md`) and CTAs (`CTA_LIBRARY.md`). Check every demo number against §8.3. |
| 10–25 | Record the screen clips you need, all in one sitting (`SHOT_AND_MOTION_GUIDE.md` §2). |
| 25–40 | Update `marketing/renderer/posts.json` and run `npm run social:render -- --only W06-MON,W06-WED` (your IDs). Record voiceovers while it renders. |
| 40–80 | Edit in CapCut, about 10 minutes per video: flash-forward open if needed, overlays, captions, end card ≤2 s. |
| 80–100 | Run the 5-minute review on each video (`SHOT_AND_MOTION_GUIDE.md` §8). |
| 100–120 | Schedule in TikTok Studio (web) or an official partner scheduler: caption, 3–5 hashtags, cover, "Your brand" on. Log post IDs and UTM. |

Confirmed event weeks add 3 short videos. Do them in a second, ~45-minute session.

---

## 8. Asset system

### 8.1 Renderer templates (`marketing/renderer`)

- Each post is a JSON object in `posts.json`, keyed by the calendar ID (for example `W01-MON`).
- Render with `npm run social:render -- --only W01-MON`. Output goes to `marketing/renders/out/<id>.mp4`, plus `-cover.png`, `-slide-N.png` for carousels, and `<id>.png` for overlays.
- **Renders are silent masters.** Add voiceover and SFX in CapCut, and any CML bed in TikTok.
- Templates already respect the safe box and stamp the demo label (except carousel slides; see `STYLE_GUIDE.md` §4).

| Template | Use | Series | Default length | Watch out |
|---|---|---|---|---|
| overlap-reveal | Count-up of shared games with rings | Overlap Reveal | 9 s | Count runs from frame 1 and lands by 1.6 s (`SHOT_AND_MOTION_GUIDE.md` §4) |
| roulette | Typographic reel landing on "Tonight's pick" | Spin It | 9 s | Spins from frame 1, lands at 3.4 s |
| nobody-played | "All four own X. Combined hours: 0." | Pile of Shame | 9 s | Demo groups default to the third person; set `demo: false` only for a real, consenting group |
| stat-card | One big stat + headline | Carry Report, P3 | 9 s | Number lands by 1.5 s |
| top-five | Ranked list; also exports one PNG per slide | P6 lists, carousels | 11 s | Slides don't stamp the demo label |
| meme-card | Caption-led chat lines | Group Chat Energy | 9 s | No demo data |
| hook-overlay | Transparent PNG hook for screen recordings | P2, P8 | still | Set `demo: true` when the recording shows demo data |
| end-card | "Compare your group's Steam libraries · free · webothplay.com" + Valve disclaimer | All | 1.8 s | Already under 2 s (research §3.7) |

### 8.2 Screen-recording library (record once, reuse)

Record at 360×640 CSS px at 3× DPR (research §3.4); setup is in `SHOT_AND_MOTION_GUIDE.md` §2. Re-record a clip whenever that part of the UI changes.

| ID | Clip | Data |
|---|---|---|
| R01 | Paste 4 profile links → scanning → results | Demo group (`/compare?demo=1`) |
| R02 | Sign in through Steam → pick friends | Your own account; blur friends unless they consented. **Cut the Steam sign-in page** (it shows the Steam logo) |
| R03 | Filter chips: Co-op, Online co-op, Couch / Remote Play, PvP, Controller, Free to play, Nobody's played, Played lately | Demo |
| R04 | Sort menu: Best for tonight, Most played together, Least played | Demo |
| R05 | One copy away (Baldur's Gate 3, Juno missing) | Demo |
| R06 | Nobody's played backlog (13 games) | Demo |
| R07 | Only one owns · Wishlist overlap + gift ideas | Demo |
| R08 | Roulette: spin (~1 s), skip, spin again | Demo |
| R09 | Shortlist (star games) → Group vote link → vote with one veto → live results → spin among the survivors | Demo, voted from 2 devices |
| R10 | Share link → preview card in a chat | Demo, in a private test chat |
| R11 | Fun facts: most played together, nobody launched, "Nova carries Marvel Rivals" | Demo |
| R12 | Private profile: who is hidden + "Copy a message for them" | The fictional private demo profile |
| R13 | Saved groups and recent groups | Demo |
| R14 | Discord: `/link`, then `/compare` mentioning friends | Test server; linked accounts with consent; free commands only |

### 8.3 Demo data: where the numbers come from

The site's example group is fictional: **Nova, Bram, Kit, Juno**, with real game titles. Label every frame that shows it: **"Demo data · fictional friend group"**.

| Fact | Value |
|---|---|
| Games all four own | 39 |
| Games between them | 70 |
| Overlap | 80% |
| Most played together | Counter-Strike 2 |
| Everyone owns it, nobody has launched it | Bloons TD 6 |
| Carry | Nova carries Marvel Rivals (36 h; others 0) |
| One copy away | Baldur's Gate 3 (Juno is missing it) |
| Nobody has really played | 13 games |
| Share card text | "39 games in common · Everyone owns Bloons TD 6. Nobody has launched it." |

**Rules**
- **Only show numbers the site shows.** Use this table, or a number you can read on the site's demo results yourself. Viewers who open the demo will check. The calendar's W01-MON figures ("1,308 games → 64 they ALL own", and the matching player counts in `posts.json`) don't match the demo group, so fix them before rendering.
- **Talk about the demo group in the third person** ("they", "this group", the names), never "we", "us" or "my friends". Synthetic results must never look like real users (research §3.11 #3).
- **Never hero these titles from the demo group:** Sea of Thieves, Forza Horizon 5, Age of Empires II: Definitive Edition and Overwatch 2 are Microsoft-owned (research Q6.8). Valve's own games (Counter-Strike 2, Dota 2, Team Fortress 2, Left 4 Dead 2, Portal 2) appear as text only, never as art or footage (Valve's video policy covers non-commercial use, research Q6.7).
- **Real groups** appear only with written consent from every member, with names, avatars and IDs blurred unless they agreed otherwise (research §3.11 #3).

### 8.4 Files

Keep one folder per post, named by its calendar ID: `W06-MON/` holding `recording.mp4`, the render, `vo.wav`, `W06-MON-master.mp4` (no CML) and `caption.txt`. Keep shared folders for `sfx/` (commercial-use licence for every platform you post on), `hooks/` (overlay PNGs) and `bank/` (finished fallbacks for the trend slot).

---

## 9. The trend slot (1 per week)

The calendar's trend slot is **Saturday**. Use it when something is moving on TikTok that fits the brand. Otherwise skip it (fallback rules in §6.1).

### 9.1 Jump on a trend only if every answer is yes

1. **Fit:** does it map to a pillar, usually P7, P1 or P4, and to "deciding what to play"?
2. **Audio:** is the sound in the Commercial Music Library, or does the format work with original audio? A Business Account can't use the general library (research Q6.1).
3. **Assets:** can you make it with a template (meme-card, hook-overlay) and a clip you already have?
4. **Safe:** no tragedy, politics or pile-ons, no game footage or trailers, no real people's names or IDs.
5. **Alive:** have you seen the format from several unrelated creators in the last few days, still rising in your feed? *(House rule.)*
6. **True:** does the joke work without inventing stats, prices or dates?

### 9.2 The 30-minute lane

| Minutes | Step |
|---|---|
| 0–5 | Run the checklist above. Any "no" → stop and keep the 4 baseline posts. |
| 5–10 | Write it: pick the closest hook pattern from `HOOK_LIBRARY.md`, swap in the trend's wording, keep 3–7 words on screen. |
| 10–20 | Make it: meme-card or hook-overlay render plus a library clip. VO or SFX. End card ≤2 s. |
| 20–25 | Run the 5-minute review (`SHOT_AND_MOTION_GUIDE.md` §8). |
| 25–30 | Post with a CML sound if you need one, 3–5 hashtags, "Your brand" on. Log it as `W##-SAT`. |

### 9.3 Never

- Rip a trending song from the general library, or re-upload someone else's video. Stitch or Duet only through TikTok's own features.
- Use game trailers or gameplay, or make a game's key art the hero.
- Fake a "part 2", or tease a result you don't show (research §3.3 #6).
- Post price claims, unverified event dates or unverified release dates. The research flags GTA VI's date as unverified, and the game as console-only at launch (research §4).
- Use the Steam logo or a Valve look, or bait engagement ("like if…", "follow for…") (research Q5.2).

---

## 10. Event handling

**Rule:** no event-specific post until the dates are verified at **partner.steamgames.com/doc/marketing/upcoming_events** (or Steam News). This page was blocked during research, so nothing below is confirmed except fixed dates (research §4, §5).

**Process**
1. Before each event, check the page and note the dates, the source and the check date in the calendar row.
2. If confirmed, that week can go to 7/week by publishing the "Event extra" rows (research §3.1).
3. Add at most one event hashtag (#steamnextfest, #steamsale or #steamwintersale), and only while it is live (research §3.5).
4. When the event ends, stop pushing its posts. Event posts are not evergreen.

| Event | Date status (research §4) | Angle |
|---|---|---|
| Steam Next Fest (Oct 2026) | Unconfirmed | Co-op demos to try with your group (titles as text; no trailers) |
| Steam Scream Fest | Unconfirmed | Co-op horror your group already owns |
| Halloween | **Fixed: Sat 2026-10-31** (week 4) | Co-op horror roulette |
| US Thanksgiving / Black Friday / Cyber Monday | **Rule-derived: Thu 2026-11-26 / Fri 2026-11-27 / Mon 2026-11-30** | Holiday couch co-op; "one copy away before you buy anything" |
| Steam Autumn Sale | Unconfirmed | Check what the group owns first |
| The Game Awards 2026 | Unconfirmed | Nominees your group might already own |
| Steam Winter Sale | Unconfirmed | One game the whole group can play |
| Steam Replay 2026 | Unconfirmed | Compare your group's year |
| Christmas / New Year's Day | **Fixed: Fri 2026-12-25 / Fri 2027-01-01** | New-game group sessions; "Pile of Shame" resolution |

**Sale content.** Frame it as "what your group already owns" and "who's one copy away". Never say "buy now", and never quote a price you didn't check on the store that day. In TikTok Shop markets, content that sends people off-platform to buy gets reduced visibility (research Q5.3).

---

## 11. Cross-posting to YouTube Shorts and Instagram Reels

Repost natively, without looking lazy:

1. **Clean master.** Export from CapCut with no TikTok watermark. Never re-upload TikTok's download (research Q12.4).
2. **Swap the audio.** CML is licensed for TikTok only (research Q6.2). The master already has no CML bed because you add it in TikTok, so use voiceover + SFX, or music licensed for that platform.
3. **Rewrite the words.** New first line, new caption, the platform's own hashtag habits, at most 5 hashtags on Instagram (research Q4.4). Consider a re-rendered hook-overlay with a different hook. It's an extra test, not a copy.
4. **Check safe zones per platform.** Our TikTok box is a conservative start. Preview in each app before posting, because their buttons and caption areas sit differently (research §3.10).
5. **Length.** Keep core cuts ≤60 s (research §3.10). Don't rely on 3-minute uploads until you have verified the current limits (research Q12.3, unverified).
6. **Accounts.** One official account per platform. Don't mass-post identical files across accounts (research §3.10).
7. **Timing (house rule).** Post on TikTok first, then cross-post the best performers within the same week.

| | TikTok | YouTube Shorts | Instagram Reels |
|---|---|---|---|
| Audio | Original audio, or a CML bed added in TikTok | Master audio, or YouTube's own library | Master audio, or Instagram's own library |
| Link | Bio link, `utm_source=tiktok` | Channel links, `utm_source=youtube` | Bio link, `utm_source=instagram` |
| Disclaimer | Bio, plus caption when Steam is prominent | Channel description, plus video description | Bio, plus caption |
| Disclosure | "Your brand" toggle | YouTube's own paid-promotion rules | Instagram's own branded-content rules |

---

## 12. Compliance checklist (every post)

**Account and audio**
- [ ] Posted from the Business Account, with CML or original audio only (research §3.6)
- [ ] "Your brand" disclosure toggle on (research §3.6)
- [ ] AI label on any realistic synthetic media (research §3.6). Default: none used.

**Steam / Valve**
- [ ] No Steam logo anywhere: video, cover, end card, avatar (research §3.11 #1)
- [ ] "Steam" used only descriptively. No "official", "Steam's tool" or any implied partnership.
- [ ] Disclaimer in the bio, and in the caption when Steam is prominent: "Not affiliated with Valve. Steam is a trademark of Valve Corporation."
- [ ] No recordings of Steam's own pages (sign-in, settings, store), which carry the logo
- [ ] Claims about Steam features are backed by a Valve source. For example, Remote Play Together claims came only from a third-party guide (JTBD F5).

**Game IP**
- [ ] Capsule art appears only inside real UI recordings: small, many titles, never one game's art as the cover (research §3.11 #2)
- [ ] No Microsoft-owned game footage or art as hero content (research Q6.8)
- [ ] No trailers or gameplay clips; no publisher logos

**Demo data and privacy**
- [ ] "Demo data · fictional friend group" on screen for as long as demo data is visible
- [ ] Demo numbers match §8.3; third person only
- [ ] No real Steam names, avatars, IDs or profile URLs without written consent; IDs blurred in real recordings

**Claims and CTAs**
- [ ] "Free to compare", with no Premium, prices or purchase CTA (research §3.7)
- [ ] No unverified event dates, prices, player counts or speed claims
- [ ] Every promised payoff is shown; no fake "part 2" (research §3.3 #6)
- [ ] No engagement bait (`HOOK_LIBRARY.md` §4)

**Format**
- [ ] Text inside x 64→940, y 150→1436; 3–5 hashtags; keyword in caption line 1

**Publishing**
- [ ] Scheduled in TikTok Studio or an official partner scheduler; nothing automates likes, follows, comments or DMs (research §3.9 #5)

---

## 13. KPIs

| KPI | Source | How to read it |
|---|---|---|
| Videos published per week | Your log | 4 baseline; floor 3; 7 only in confirmed event weeks |
| Median 72 h views (rolling last 12 videos, house rule) | TikTok Studio | The account baseline for every comparison |
| Average watch time; watch ratio (average watch time ÷ length) | TikTok Studio | Typical watch time per view is single-digit seconds: entertaining content went from about 6 to about 9 s (research Q2.2). The opening decides most outcomes. |
| % watched in full | TikTok Studio | Quick hits and Spin It should lead |
| Retention at 1 s and 3 s (from the retention graph, if shown) | TikTok Studio | Hook health |
| Shares, saves and comments per 1k views | TikTok Studio | Shares = group-chat value; saves = list value |
| Follows and profile visits per 1k views | TikTok Studio | Series and brand pull |
| Search share % | TikTok Studio, traffic source | Track it on every video and promote winning phrases (research §3.5) |
| TikTok visitors | `/admin` → Top sources → `tiktok` | Weekly |
| TikTok comparisons started / with results / shared | SQL on events with `utm_source=tiktok` (playbook §3) | Weekly; watch the started-per-visitor ratio |
| Comparison failures | `/admin` → "Why comparisons failed" | Product friction, not content |
| Gates | Week 4 and week 8 rules (research §3.1); slot lock in week 5 (research §3.8) | Decisions, not vanity |

**No absolute targets yet.** Metricool's 2026 average was 32,895 views per video, down 31% year on year as accounts posted about 80% more (research Q1.7). That is a market average, not a target for a new account. Set your own targets after week 4.

---

## 14. Before week 1 (one-time setup)

- [ ] TikTok **Business Account**, with "Your brand" disclosure ready (research §3.6)
- [ ] Confirm the account can show a bio link. Personal accounts have commonly needed 1,000+ followers; business accounts usually can, but verify (research Q9.1, unverified)
- [ ] Bio set with the UTM link and Valve disclaimer (`CTA_LIBRARY.md` §6–7)
- [ ] Download TikTok's official safe-zone template from the Ads Help in-feed spec page and keep it as a CapCut guide layer (research §3.4)
- [ ] Check whether your account has **keyword management**. If so, remove irrelevant auto-keywords and suggest "co-op games" and "games to play with friends" (research Q4.2, §3.5)
- [ ] Verify the TikTok Studio scheduling window (10 or 30 days?) and whether your partner scheduler can add TikTok sounds (research §5 #4, #9)
- [ ] Read the current Community Guidelines, including the engagement-bait wording (research §5 #7)
- [ ] Record the screen-recording library R01–R14; build CapCut project presets (`SHOT_AND_MOTION_GUIDE.md` §6)
- [ ] Align `posts.json` demo numbers with §8.3
- [ ] Set up a private Discord test server, with consenting test accounts, for bot recordings
- [ ] Choose the main audience time zone
