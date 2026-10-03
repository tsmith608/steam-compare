# WeBothPlay TikTok Experiment Plan (13 weeks)

Weeks of **2026-10-05 → 2027-01-03**. One primary variable per test, at least 3 posts per variant, and a written decision at the end of each test. Written 2026-10-03.

**This plan runs the tests named in the calendar's "Experimental variable" column** (`90_DAY_CALENDAR.csv`). The calendar decides each post's concept. This plan decides which posts are variant A or B, and how to judge them.

**Citations.** "(research §3.12)" = a section of `marketing/TIKTOK_RESEARCH_2026.md`; "(research Q7.2)" = finding 2 under Q7 in its §2. Thresholds marked *house rule* are decision defaults, not research findings.

**Vocabulary used here.** Pillars P1–P11 (P1 Pain point · P2 Instant demo · P3 Squad stats · P4 Roulette · P5 Pile of shame · P6 Already own it · P7 Group chat energy · P8 Feature drops · P9 Steam moments · P10 Build in public · P11 Ask the squad). Formats: Screen recording + VO · Template render · Template + screen recording · Photo Mode carousel · Reply-to-comment video. Hook pattern codes: NS, CO, POV, RC, MB, CH, BA, Q, L, CG (`HOOK_LIBRARY.md` §1). Post IDs: `W01-MON`.

---

## 1. Principles

1. **One primary variable per test.** Keep the rest as similar as you can: pillar family, length bucket, format, CTA and slot.
2. **Balance, don't randomize.** With 8 posts per block, assign variants by hand so each gets a similar mix of formats, weekdays and slots (tables in §4–§5).
3. **At least 3 posts per variant before judging** (research §3.3 #8). Most tests here get 4.
4. **Read the primary metric at 72 h.** Re-read search-heavy videos at 7 days (*house rule*). The research compares slots at 24 h and 72 h (research §3.8).
5. **Compare medians, not averages.** Buffer found median views per post barely move with cadence; the gains come from outliers (research Q1.3). If one post exceeds 5× the account median, report the test with and without it (*house rule*).
6. **Account median** = the rolling median of the last 12 published videos, per metric. Carousels are tracked separately (*house rule*).
7. **What stays out of tests:** event extras, trend-slot posts and reply-to-comment videos. Log them anyway; they feed the account median.
8. **Background variables:** the weeks 1–4 slot rotation (T0) and the hook-pattern ride-along (T9) run underneath the main test. They are balanced across its variants, so they don't bias it.

---

## 2. The 13-week roadmap

| Week | Dates | Primary test (calendar) | Background | Gates and dates |
|---|---|---|---|---|
| W1 | Oct 5–11 | **T1** Hook pattern: number shock (NS) vs call-out (CO) | T0 slot rotation | — |
| W2 | Oct 12–18 | T1 | T0 | Next Fest extras only if dates are verified |
| W3 | Oct 19–25 | **T2** Length bucket: 9–20 s vs 25–45 s | T0 · T9 (RC, POV) | — |
| W4 | Oct 26–Nov 1 | T2 | T0 · T9 | Halloween Sat Oct 31 · **Week-4 cadence gate** |
| W5 | Nov 2–8 | **T3** Voiceover vs text-only | **Lock slots A/B** · T9 (CH, Q) | — |
| W6 | Nov 9–15 | T3 | T9 | — |
| W7 | Nov 16–22 | **T4** Explicit CTA vs question ending | T9 (MB, BA) | — |
| W8 | Nov 23–29 | T4 | T9 | Thanksgiving Thu Nov 26, Black Friday Fri Nov 27 · **Week-8 gate** |
| W9 | Nov 30–Dec 6 | **T5** Posting-slot re-test | T9 (L, CG) | Cyber Monday Mon Nov 30 |
| W10 | Dec 7–13 | T5 | T9 | Game Awards extras only if verified |
| W11 | Dec 14–20 | **T6** Photo Mode carousel vs video | — | Winter Sale extras only if verified |
| W12 | Dec 21–27 | T6 | — | Christmas Fri Dec 25 |
| W13 | Dec 28–Jan 3 | **T7** Series title on screen vs none (finish in the week of Jan 4) | Optional slot re-test | New Year's Day Fri Jan 1 · **Quarter review** |
| All weeks | — | Observational: **T8** demo vs meme · **T10** deep dives vs median | — | — |

**Gates (research §3.1, §3.8)**
- **End of W4:** if production feels sustainable and views per post are stable or rising, go to 5–6/week through W8 by publishing reserve-bank posts. Extra posts add pairs to T2 and T3.
- **Start of W5:** lock the two best slots (±1 h) from T0.
- **End of W8:** keep the higher rate only if total views and follows per 1k views improved without hurting average watch time.
- **W9 and W13:** re-test one alternative slot (every 4 weeks).

---

## 3. Test cards

### T0. Posting-slot rotation (W1–W4, background)

| | |
|---|---|
| Question | Which posting times work for this audience? |
| Hypothesis | 20:00 (inside Metricool's 6–9 pm window, strongest at 8 pm) beats 12:00 and 17:00 (research Q10.1). The time-zone basis is unknown, so this is a hypothesis to test |
| Variants | 12:00 · 17:00 · 20:00, in the main audience's time zone (research §3.8) |
| Sample | 16 baseline posts: 12:00 ×6, 17:00 ×5, 20:00 ×5 (grid in §4) |
| Primary metric | Views at 24 h and 72 h, relative to the median |
| Secondary | Average watch time, % watched in full, follows per 1k views, traffic-source mix (research §3.8) |
| Decision (W5) | Lock the top two slots by median 72 h views. If the third-place slot beats the second on both average watch time and follows per 1k, lock it instead of the second. Check TikTok Studio's audience-activity view too, if shown (research §3.8) |

### T1. Hook pattern: number shock vs call-out (W1–W2)

| | |
|---|---|
| Hypothesis | Number shock (a demo number in frame 1) beats call-out on retention at 3 s, because the payoff *is* the hook (research §3.3 #1, Q3.9) |
| Variants | NS (H001–H009) vs CO (H010–H018) |
| Held constant | Paired posts share format and length; each variant gets 2 posts a week and one 20:00 slot |
| Sample | 4 vs 4 (§5.1) |
| Primary metric | Retention at 3 s from the retention graph. If not shown, use the watch ratio (average watch time ÷ length) |
| Secondary | 72 h views, shares per 1k, follows per 1k |
| Decision | The winner becomes the default pattern for posts outside the T9 ride-along rotation, and gets 3 variations (playbook §4). A pattern with 3 posts below the account median is dropped for now (research §3.12) |

### T2. Length bucket: 9–20 s vs 25–45 s (W3–W4)

| | |
|---|---|
| Hypothesis | Quick hits win on % watched in full and views; demos win on profile visits per 1k views (research Q2.7) |
| Variants | Quick (9–20 s) vs demo (25–45 s) |
| Sample | 4 quick vs 3 demo (the W04-MON carousel is excluded) (§5.2) |
| Primary metric | **Profile visits per 1k views** (the funnel step that matters) |
| Secondary / guardrail | 72 h views; % watched in full; TikTok visitors on demo days |
| Decision | Keep 50/35/15 (research §3.2) unless one bucket wins both the primary and the 72 h views. Then shift 10 points toward it for the next 4 weeks and re-check (*house rule*) |

### T3. Voiceover vs text-only (W5–W6)

| | |
|---|---|
| Hypothesis | Voiceover raises the watch ratio and the share of Search traffic (vendor guides say TikTok indexes speech; unverified, research Q3.12). Text-only is faster to make |
| Variants | VO (your voice or TikTok text-to-speech) + SFX vs on-screen text only + SFX. Same CML bed rule for both |
| Sample | 4 vs 4, each with screen recordings and templates (§5.3) |
| Primary metric | Watch ratio |
| Secondary | Search share %, % watched in full, production minutes |
| Decision | Clear VO win → VO is the default. Tie → text-only for quick hits and VO for demos (*house rule*) |

### T4. Explicit CTA vs question ending (W7–W8)

| | |
|---|---|
| Hypothesis | The explicit CTA ("Compare your group's Steam libraries free — link in bio.") raises profile visits and site visits without hurting completion (research §3.7) |
| Variants | XS01 (or XS02) vs an SQ question (`CTA_LIBRARY.md`) |
| Sample | 3 vs 3, each with one screen-recording demo and two templates (§5.4). Carousels excluded |
| Primary metric | Profile visits per 1k views |
| Secondary | TikTok visitors and `comparison_started` on CTA days. Optional: switch the bio `utm_campaign` to each post's ID when it goes live (`CTA_LIBRARY.md` §7). Guardrail: % watched in full |
| Decision | CTA wins with no completion loss → keep 1 in 3 and put CTAs on the strongest demos. CTA loses completion by more than 25% (*house rule*) → move the CTA into the pinned comment and caption for quick hits |

### T5. Posting-slot re-test (W9–W10)

| | |
|---|---|
| Hypothesis | The W5 lock still holds after the audience and season shift |
| Variants | Slot A (the best locked slot) vs the challenger (the dropped slot, or a new candidate from TikTok Studio's follower-activity view) |
| Sample | 4 vs 4 (§5.5). The calendar names 12:00 / 17:00 / 20:00; a three-way test needs ≥9 posts, so run it only if event extras or reserve posts lift the count |
| Primary metric | 72 h views relative to the median |
| Secondary | Watch ratio, follows per 1k |
| Decision | The challenger replaces B if it beats B's median by ≥25% and wins 3 of 4 posts against same-week posts (*house rule*). Otherwise keep the lock |

### T6. Photo Mode carousel vs video (W11–W12)

| | |
|---|---|
| Hypothesis | Carousels win saves but lose reach and shares. Metricool found videos got 5.6× the views and 7.8× the interactions of image/carousel posts (research Q7.1). Fanpage Karma found carousels had 81% higher engagement and 82% more likes, but were shared about 33% less (research Q7.2) |
| Variants | Carousel (top-five slides) vs list video (a top-five render or a list demo, 16–45 s) |
| Sample | 3 vs 3 (§5.6). Earlier calendar carousels (W04-MON, W07-MON, W08-WED) are context, not sample |
| Primary metric | **Saves per 1k views** |
| Secondary | 72 h views, shares per 1k, profile visits per 1k, minutes to make |
| Decision | Keep the weekly bonus carousel if carousels' median saves per 1k is at least the videos' **and** a carousel takes ≤20 min (*house rule*). Otherwise go monthly. A carousel never replaces a baseline video (research §3.1) |

### T7. Series title on screen vs none (W13, finish in the week of Jan 4)

| | |
|---|---|
| Hypothesis | A visible series title ("PILE OF SHAME · #4" kicker plus caption line 2) raises follows per 1k views: viewers expect more episodes (research §3.5) |
| Variants | Title on screen (the default until now) vs no title, with the series kept in the caption only |
| Sample | 2 vs 2 in W13, plus the first 2 series posts of the week of 2027-01-04, giving 3+ vs 3+ (§5.7) |
| Primary metric | Follows per 1k views |
| Secondary | Profile visits per 1k; % watched in full (guardrail) |
| Decision | Title wins → keep titles and promote winning search phrases into series names. Tie → keep titles (no cost) |

### T8. Demo vs meme (observational, all quarter)

| | |
|---|---|
| Question | What does each earn us? |
| Groups | All quick-hit (9–20 s) P2 screen-recording demos vs all P7 meme-cards, including meme trend posts |
| Metrics | Shares per 1k (memes expected to win) · profile visits per 1k, and TikTok visitors on the day (demos expected to win) |
| Decision (W13) | Set the P2:P7 balance for next quarter. If memes win shares **and** match demos on profile visits, give them more baseline slots. Needs ≥3 of each, so publish P7 reserve posts if you pass the week-4 gate |

### T9. Hook-pattern ride-along (W3–W12, background)

The eight patterns not in T1 get tested against the account median, without a dedicated test.

| Block | Patterns to use |
|---|---|
| W3–W4 | RC and POV |
| W5–W6 | CH and Q |
| W7–W8 | MB and BA |
| W9–W10 | L and CG |
| W11–W12 | The T1 winner and the best ride-along pattern |

**Rule:** inside each block, give both variants of the primary test the same pattern mix. Judge each pattern with the research rule: drop it after 3 posts below the account median, and double down on any pattern that beats the median by 2× twice (research §3.12).

### T10. Deep dives vs the account median (observational)

| | |
|---|---|
| Question | Do 60–120 s videos earn their production time? Buffer's older, correlational data linked >60 s videos to ≥43.2% more reach (research Q2.1) |
| Sample | Every 60–120 s video, mostly confirmed event roundups. If no events are confirmed, make 1–2 evergreen P6 list deep dives (60–75 s) to test |
| Decision (W13) | Keep 15% deep dives if their median 72 h views is at least the account median and their watch ratio isn't the worst bucket. Otherwise go to 10% next quarter (*house rule*) |

---

## 4. T0 slot grid (W1–W4)

Slots rotate 12:00 → 17:00 → 20:00 through the baseline posts, so each weekday gets each slot (research §3.8).

| Week | Mon | Wed | Fri | Sun |
|---|---|---|---|---|
| W1 | 12:00 | 17:00 | 20:00 | 12:00 |
| W2 | 17:00 | 20:00 | 12:00 | 17:00 |
| W3 | 20:00 | 12:00 | 17:00 | 20:00 |
| W4 | 12:00 (carousel) | 17:00 | 20:00 | 12:00 |

From W5: use **slot A** and **slot B** (the two winners), alternating so every test variant gets each slot about equally.

---

## 5. Variant assignments on the current calendar

If the calendar changes, keep the rule: each variant gets a similar mix of formats, weekdays and slots. Suggested hook IDs are from `HOOK_LIBRARY.md`. Check every demo number against the demo facts first (`CONTENT_STRATEGY.md` §8.3).

### 5.1 T1 (W1–W2): NS vs CO

| Post | Concept (calendar) | Format | Slot | Variant | Suggested hook |
|---|---|---|---|---|---|
| W01-MON | 4 friends, nothing to play | Template 9 s | 12:00 | CO | H011 "Game night organizers, this one's yours" |
| W01-WED | Paste 4 profiles → shared library | SR + VO 20 s | 17:00 | NS | H008 "4 profiles in. 39 games out." |
| W01-FRI | Spin It #1 | Template 9 s | 20:00 | NS | H009 "One spin. Tonight's pick. Done." |
| W01-SUN | Ask the squad: fallback game | Template 9 s | 12:00 | CO | H010 "To the friend who always says 'idk'" + SQ02 |
| W02-MON | Pile of Shame #1 | Template 9 s | 17:00 | NS | H002 "All four own it. Combined hours: 0." |
| W02-WED | Private profile? Here's who's hiding | SR + VO 25 s | 20:00 | CO | H012 "To the friend with private game details" |
| W02-FRI | The overlap you didn't know you had | Template 9 s | 12:00 | NS | H001 "4 friends. 39 games in common." |
| W02-SUN | Spin It #2, horror filter | Template 9 s | 17:00 | CO | Adapt H013 → "Horror night crew: spin this" |

Pairs (same format): MON1↔FRI2 · WED1↔WED2 · FRI1↔SUN2 · SUN1↔MON2. Each variant: 2 posts a week; slots NS 17/20/17/12 and CO 12/12/20/17.

### 5.2 T2 (W3–W4): quick vs demo

| Post | Concept | Plan | Slot | Variant |
|---|---|---|---|---|
| W03-MON | One Copy Away (Juno missing BG3) | Extend to 30–35 s: add wishlist overlap and gift ideas | 20:00 | Demo |
| W03-WED | Group vote with one veto each | 25–35 s as planned | 12:00 | Demo |
| W03-FRI | Checking 4 libraries by hand | 15 s | 17:00 | Quick |
| W03-SUN | Squad stats | Stat-card, extend to ≥9 s. Check the calendar's "5,383 hours" against the site's demo results before rendering | 20:00 | Quick |
| W04-WED | Spin It: Halloween edition | 10 s | 17:00 | Quick |
| W04-FRI | Pile of Shame: the horror game nobody's opened | Extend to 25–30 s: template opener plus a recording of "Nobody's played" and a spin | 20:00 | Demo |
| W04-SUN | Ask the squad: scariest co-op | 12 s | 12:00 | Quick |
| W04-MON | Halloween co-op carousel | Not a video: excluded | 12:00 | — |

### 5.3 T3 (W5–W6): VO vs text-only

| Post | Concept | Format | Variant | Slot |
|---|---|---|---|---|
| W05-MON | Share card | SR 20 s | VO | A |
| W05-WED | Filter like a pro | SR 20 s | Text-only | B |
| W05-FRI | Games for 5+ friends | Template 11 s | Text-only | A |
| W05-SUN | Spin It: loser picks next time | Template 9 s | VO | B |
| W06-MON | Discord bot `/compare` | SR 20 s | VO | B |
| W06-WED | Pile of Shame #3 | Template 9 s | Text-only | A |
| W06-FRI | The 20-minute debate | Template 9 s | VO | A |
| W06-SUN | Ask the squad: biggest library | Template 9 s | Text-only | B |

Notes. **W06-MON:** show `/compare` with friends mentioned. Voice-channel compare is Pro in the bot today (`CTA_LIBRARY.md` §3). **W05-FRI:** frame it as "games your whole group of 5+ owns", with no player-count claims (Steam has no max-player data; JTBD F4). **W06-FRI:** don't state "20 minutes" as fact; it's a joke format.

### 5.4 T4 (W7–W8): explicit CTA vs question

This swaps the calendar's CTA column on four posts, so each variant gets one screen-recording demo and two templates.

| Post | Concept | Format | Variant | CTA |
|---|---|---|---|---|
| W07-WED | Overlap with a 3-person group | Template 9 s | **CTA** | XS02. A separate fictional group (Theo, Mae, Rin) with self-consistent numbers and the demo label. If you screen-record instead, use the site's own 3-player demo numbers |
| W07-FRI | Full walkthrough | SR 35 s | **CTA** | XS01. Don't claim "30 seconds" unless the clip is uncut |
| W07-SUN | Spin It: survivors only | Template 9 s | Question | SQ04 |
| W08-MON | Before the sale: check One Copy Away | SR 20 s | Question | SQ08 (frame it around Black Friday unless the Autumn Sale is verified) |
| W08-FRI | Black Friday: 13 games, one copy away | Template 9 s | Question | SQ08. The calendar now says "13 games, one copy away" with "Each needs just one purchase" (H079 wording) |
| W08-SUN | Pile of Shame: last sale's haul | Template 9 s | **CTA** | XS03 |

### 5.5 T5 (W9–W10): slot A vs challenger

| Post | Format | Slot |
|---|---|---|
| W09-MON | SR 20 s | A |
| W09-WED | SR 20 s | Challenger |
| W09-FRI | Template 9 s | A |
| W09-SUN | Template 9 s | Challenger |
| W10-MON | Template 11 s | Challenger |
| W10-WED | Template 9 s | A |
| W10-FRI | SR 20 s | Challenger |
| W10-SUN | Template 9 s | A |

### 5.6 T6 (W11–W12): carousel vs video

| Variant | Posts |
|---|---|
| Carousel | W11-SUN (calendar) · one bonus carousel in W11 · one bonus carousel in W12 |
| List video | W10-MON (P6 list, 35 s; posted a week earlier) · W11-WED reworked as top-five "Everyone owns, nobody plays" (H074, 25–30 s) · W12-FRI reworked as "5 games they already own" (demo, 25–30 s) |

### 5.7 T7 (W13 → week of Jan 4): series title vs none

| Post | Series | Variant |
|---|---|---|
| W13-MON | Overlap Reveal (year recap) | Title on screen |
| W13-WED | Pile of Shame (resolution) | No title |
| W13-FRI | One Copy Away / Overlap Reveal (New Year demo) | No title |
| W13-SUN | Spin It (2027 rule) | Title on screen |
| First series post, week of Jan 4 | Any | Title on screen |
| Second series post, week of Jan 4 | Any | No title |

---

## 6. Decision rules

| Situation | Rule |
|---|---|
| **Clear winner** | Its median on the primary metric beats the other's by ≥25%, **and** it wins at least 3 of 4 pairs (2 of 3 for 3-vs-3 tests), **and** no guardrail metric falls by more than 25% (*house rule*) |
| **No clear winner** | Pick the variant that's cheaper to make. Optionally extend once by 2 posts per variant |
| **Too few posts** | Never decide below 3 posts per variant (research §3.3 #8). Extend into the next block on posts that don't touch its test |
| **Hook pattern** | 3 posts below the account median → drop the pattern for now (research §3.12) |
| **Format or series** | Beats the account median by 2× twice → double down (research §3.12; playbook §4) |
| **Outlier** | One post above 5× the median: report the test with and without it (*house rule*) |
| **Something broke** | Site outage, comparison failures spike, or a post is restricted: mark the affected posts "void" and re-run those pairs |
| **Write it down** | Every finished test gets a summary card (§7) and one line in the weekly review |

---

## 7. Results log template

Keep this as a spreadsheet or a Markdown file. One row per published post, including posts that aren't in a test.

| Post ID | Date · slot | Test · variant | Pillar | Series | Format | Hook ID · pattern | Length (s) | VO? | CTA ID | Bio campaign | 72 h views | Avg watch (s) | Watch ratio | % full | Ret. 3 s | Shares/1k | Saves/1k | Comments/1k | Follows/1k | Profile visits/1k | Search % | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| W01-MON | 2026-10-05 · 12:00 | T1 · CO | P1 | Overlap Reveal | Template render | H011 · CO | 12 | Y | SQ02 | bio | | | | | | | | | | | | |

**Test summary card** (copy one per test)

```
Test: T_ · <name>                 Weeks: W_–W_
Variants: A = ____  ·  B = ____
Posts: A = [IDs]  ·  B = [IDs]
Primary metric: ____   A median: ____   B median: ____   Pairs won: A _ / B _
Guardrails: ____ (A ____ vs B ____)
Outliers excluded? Y/N, which: ____
Decision: Double down / Iterate / Retire / No clear winner
What changes next block: ____
Confidence: low / medium (never "high" on <6 posts per variant)
```
