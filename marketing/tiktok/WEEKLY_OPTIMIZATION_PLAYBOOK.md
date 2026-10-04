# WeBothPlay Weekly Optimization Playbook

A 30-minute review every week, run right before the batch session. Pull the numbers, sort each post into **Double down / Iterate / Retire**, and write at most five actions into next week's batch. Written 2026-10-03 for the 13-week plan (2026-10-05 → 2027-01-03).

**Citations.** "(research §3.12)" = a section of `marketing/TIKTOK_RESEARCH_2026.md`; "(research Q1.3)" = finding 3 under Q1 in its §2. Thresholds marked *house rule* are defaults you can tune after a month of data.

**Vocabulary used here.** Pillars P1–P11 (P1 Pain point · P2 Instant demo · P3 Squad stats · P4 Roulette · P5 Pile of shame · P6 Already own it · P7 Group chat energy · P8 Feature drops · P9 Steam moments · P10 Build in public · P11 Ask the squad). Series: Overlap Reveal, Spin It, Pile of Shame, One Copy Away, Carry Report, Group Chat Energy, Ask the Squad, Tonight's Pick. Hook patterns: NS, CO, POV, RC, MB, CH, BA, Q, L, CG. Post IDs: `W06-MON`.

---

## 0. When, and what it covers

- **When:** Thursday, before the batch session (`CONTENT_STRATEGY.md` §7).
- **Posts reviewed:** every post that reached 72 h since the last review: normally last week's Wed, Fri and Sun, plus this week's Mon. Also re-read search-heavy posts at 7 days (*house rule*).
- **Site data:** the last 7 days on `/admin`. The same numbers arrive in Discord every Monday in the automatic owner report.
- **Baseline:** the **account median**, the rolling median of the last 12 published videos for each metric. Carousels are tracked separately (*house rule*). Compare with medians, not averages: Buffer found median views per post barely change and the gains come from outliers (research Q1.3).

---

## 1. The 30-minute agenda

| Minutes | Do |
|---|---|
| 0–10 | **TikTok Studio:** pull §2's metrics for each post into the results log (`EXPERIMENT_PLAN.md` §7) |
| 10–15 | **`/admin`:** TikTok visitors, the funnel, failure codes, feature usage (§3). Run the SQL if you have database access |
| 15–25 | **Classify** each post with §4 and the decision table (§5). Update test tallies; note any decision now due |
| 25–30 | **Act:** write up to 5 actions into next week's calendar rows (hooks to swap, CTAs to add or remove, a variation to make). Set the bio `utm_campaign`. Fill in the weekly template (§6) |

---

## 2. Metrics from TikTok Studio

Studio labels change. Use what your Studio shows, and write "n/a" when a metric is missing. **Per 1k = (count ÷ views) × 1,000.**

| Metric | Where / how | Why it matters |
|---|---|---|
| Views at 24 h and 72 h | Video analytics | Reach; the 72 h figure is the main comparison point (research §3.8) |
| Average watch time | Video analytics | Typical watch time is single-digit seconds (about 6 → 9 s for entertaining content), so small gains count (research Q2.2) |
| **Watch ratio** | Average watch time ÷ video length | Compares videos of different lengths |
| Completion rate | "% watched full video" | Quick hits and Spin It should lead (research §3.12) |
| Retention at 1 s and 3 s | Retention graph, if shown | Hook health: frame 1 and the 3-second message (research §3.3) |
| Rewatches | If not shown: a watch ratio above 1.0 means people looped it | Loopable endings (research Q7.5) |
| Shares per 1k | Engagement | Group-chat value. Shares per post rose 45% year on year (research Q1.5) |
| Saves per 1k | Engagement | List and carousel value (research Q7.1) |
| Comments per 1k | Engagement; read the actual comments | Genuine conversation, and reply-video material |
| Profile visits per 1k | Per-video profile views if shown, otherwise the weekly account total | Funnel step 2 |
| Follows per 1k | Video analytics | Series pull; a week-8 gate input (research §3.1, §3.12) |
| Link clicks | Bio/website clicks, if your account shows them | Funnel step 3 |
| **Search share %** | Traffic source → Search; read the search queries too, if shown | Search-led discovery. Promote winning phrases into series titles (research §3.5) |
| Traffic-source split | For You / Search / Profile / Following | For You delivered 58% of TikTok views in 2025 (research Q1.4) |

---

## 3. Metrics from `/admin` (and SQL)

### 3.1 What `/admin` shows (last 7 days)

| Panel | What to read |
|---|---|
| **Top sources (unique visitors)** | The `tiktok` row: visitors whose bio link carried `utm_source=tiktok`. Also `youtube` and `instagram` |
| **Funnel** (site-wide) | Visited the homepage → Started a comparison → Got results → Shared or sent a vote → Started checkout → Became Premium |
| Tiles | Website comparisons with results · Visit → results % · Discord bot comparisons |
| **Why comparisons failed** | Failure codes and counts (§4, R3) |
| Feature usage | `roulette_spun`, `poll_created`, `poll_voted`, `result_shared`, `share_viewed`, `filter_used`, `group_saved`, `demo_viewed`, `discord_cta_clicked`, `deal_clicked` |
| Errors | Client and server errors; check them when comparisons fail |

**Premium is information only.** Glance at "Became Premium". Never change organic content to push it (research §3.7).

### 3.2 TikTok-only funnel (optional SQL, needs read access to the production database)

Website comparisons send the visitor's first-touch UTM with the request, so results and failures can be split by source (`src/components/results/ResultsPage.jsx`, `src/app/api/compare/route.js`).

```sql
-- TikTok-attributed funnel, last 7 days, by bio campaign
SELECT COALESCE(utm_campaign, '(none)')                                         AS campaign,
       COUNT(DISTINCT anon_id) FILTER (WHERE name = 'landing_viewed')            AS visitors,
       COUNT(*) FILTER (WHERE name = 'demo_viewed')                              AS demo_views,
       COUNT(*) FILTER (WHERE name = 'comparison_started')                       AS started,
       COUNT(*) FILTER (WHERE name = 'comparison_succeeded'
                          AND COALESCE(props->>'demo', 'false') <> 'true')       AS real_results,
       COUNT(*) FILTER (WHERE name = 'comparison_succeeded'
                          AND props->>'demo' = 'true')                           AS demo_results,
       COUNT(*) FILTER (WHERE name = 'comparison_failed')                        AS failed,
       COUNT(*) FILTER (WHERE name = 'result_shared')                            AS shared,
       COUNT(*) FILTER (WHERE name = 'discord_cta_clicked')                      AS discord_clicks
FROM events
WHERE utm_source = 'tiktok'
  AND ts >= NOW() - INTERVAL '7 days'
GROUP BY 1
ORDER BY visitors DESC;

-- Why TikTok visitors' comparisons failed, last 7 days
SELECT COALESCE(props->>'code', 'unknown') AS code, COUNT(*) AS n
FROM events
WHERE name = 'comparison_failed' AND utm_source = 'tiktok'
  AND ts >= NOW() - INTERVAL '7 days'
GROUP BY 1
ORDER BY n DESC;
```

**Read it as**
- **Click-through:** TikTok visitors ÷ TikTok views that week. A trend, not a benchmark.
- **Start rate:** started ÷ visitors.
- **Completion:** (real_results + demo_results) ÷ started.
- **Real vs demo:** real_results ÷ demo_results tells you whether viewers bring their own group or only try the demo.
- **UTM numbers are a floor.** Attribution is first-touch per browser tab, so viewers who copy the link elsewhere arrive untagged (`CTA_LIBRARY.md` §7).
- **No database access?** Use `/admin`'s `tiktok` visitors and the site-wide funnel, and note the limitation in the template.

---

## 4. Classification rules

Sort every reviewed post into one of three classes at 72 h, against the account median:

- **Double down** = make more of this, soon.
- **Iterate** = keep the idea, fix one thing.
- **Retire** = stop making it.

A post can trigger several rules; apply the strongest action first. Thresholds are house rules unless a research section is cited. The research supplies the 2×-twice double-down and the 3-posts-below-median retirement (research §3.12).

### Required rules

**R1. Winning hook → make 3 variations.**
- *Trigger:* retention at 3 s (or watch ratio) is in the top quarter of the last 12 videos, **and** 72 h views are at or above the median.
- *Action:* write 3 variations within the next two batches. Keep the pattern and the frame-1 visual type. Change one thing per variation: the fact (39 → 80% → 13), the friend (Nova → Juno) or the searchable phrase (`HOOK_LIBRARY.md` §5).

**R2. High views, low clicks → strengthen the product connection and CTA.**
- *Trigger:* 72 h views ≥1.5× the median, but profile visits per 1k are below the median and TikTok visitors didn't rise (*house rule*).
- *Action:* in the next version, show real product UI by 3 s and add the explicit CTA (XS01; it counts toward the 1 in 3). Pin PC01. Check that the bio says what the link does and carries the right `utm_campaign`.

**R3. High clicks, low comparison completion → investigate product friction.**
- *Trigger:* TikTok visitors or comparisons started rose, but results ÷ started fell below its 4-week level. The Monday owner report also flags fewer than 60% of started comparisons finishing once 20+ were started (`src/lib/report.js`).
- *Action:* open `/admin` → **"Why comparisons failed"** and act on the top code (table below). Fix the product before pushing more CTAs.

**R4. High shares → expand that family.**
- *Trigger:* shares per 1k ≥2× the median.
- *Action:* plan 2–3 more posts in the same pillar, series and pattern within two weeks. If it isn't a series yet, consider naming one.

**R5. Weak first-second retention → rewrite the opening visual and hook.**
- *Trigger:* retention at 1 s in the bottom quarter of the last 12. If no graph is shown, a bottom-quarter watch ratio with views below the median.
- *Action:* fix frame 1. Is the payoff visible? Is there motion before 1 s? Is the hook ≤7 words and inside the hook band? Does it need a flash-forward open (`SHOT_AND_MOTION_GUIDE.md` §4.5)? Re-run the concept with the new opening.

### More rules

**R6. Good hold, low reach** (watch ratio at or above the median, views below 0.5× the median; *house rule*). Rewrite the hook text and the searchable phrase, check the slot and keep 3–5 hashtags. Use keyword management if available (research Q4.2). Don't re-upload the same file.

**R7. High saves** (saves per 1k ≥2× the median). Make a top-five or carousel version, and keep the original as an evergreen reference.

**R8. High search share** (Search share ≥2× the median, or a search query matching one of our phrases). Make it a recurring series title and refresh it monthly (research §3.5).

**R9. Comments ask "how?" or "is it free?"** Pin PC01, reply by hand with the templates in `CTA_LIBRARY.md` §5, and make a Reply-to-comment video (1–2 a week can count toward the baseline; research §3.9).

**R10. A comment flags an error or an IP problem.** Fix the caption, or remove the post the same day. Remove content promptly if a rights-holder objects (research §3.11 #2).

**R11. Format double-down.** Any format or series beating the median by 2× twice gets more slots (research §3.12).

**R12. Pattern retirement.** A hook pattern with 3 posts below the median is parked for now (research §3.12).

**R13. A restriction or "not eligible for For You" notice.** Run the compliance checklist (`CONTENT_STRATEGY.md` §12) and look for bait wording, music or a missing disclosure. Fix the cause; appeal if it's wrong.

### Acting on "Why comparisons failed" (R3)

Codes come from `src/lib/comparison-service.js` and `src/app/api/compare/route.js`.

| Code | What it means | Content action | Product check |
|---|---|---|---|
| `private_profiles` | Fewer than two public libraries: friends' "Game details" are private | Post a P8 explainer (H012, H039 or H070); pin PC03 | The private banner's copy and its "Copy a message for them" button; `/guides/steam-game-details-private` |
| `bad_profiles` | A link, ID or custom URL wasn't found | A 12 s "where to find your profile link" demo; a caption tip | Input parsing; the guide's `#find-profile` section |
| `need_two` | Only one profile entered | Make "paste your friends' links, or sign in and pick friends" explicit in demos | Form copy |
| `duplicates` | The same profile entered twice | Show different friends being added | — |
| `plan_limit` | The group is above the free limit | **No content action.** Never pitch Premium organically | Note the demand for big groups |
| `steam_unavailable`, `steam_rate_limited` | Steam API trouble | Pause explicit CTAs until it clears | Ops logs |
| `config`, `internal` | Our bug | Pause explicit CTAs | Fix first, then resume |

---

## 5. Decision table

| Signal at 72 h (vs the rolling median) | Class | Action | When |
|---|---|---|---|
| A format or series ≥2× the median on views, twice | **Double down** | +2 posts in that format over the next 2 weeks (R11) | Next batch |
| Retention at 3 s in the top quarter and views ≥ the median | **Double down** | 3 hook variations (R1) | Next 2 batches |
| Shares per 1k ≥2× | **Double down** | Expand the family (R4) | Next 2 weeks |
| Saves per 1k ≥2× | **Double down** | List or carousel version (R7) | Next week |
| Search share ≥2× | **Double down** | Series title plus keyword (R8) | Next batch |
| Views ≥1.5× but profile visits per 1k below the median | **Iterate** | Product UI by 3 s, explicit CTA, pinned how-to (R2) | Next batch |
| TikTok visitors up, results ÷ started down | **Iterate (product)** | Failure codes table (R3) | This week |
| Retention at 1 s in the bottom quarter | **Iterate** | Rewrite frame 1 and the hook (R5) | Next batch |
| Watch ratio at or above the median, views below 0.5× | **Iterate** | Hook text, phrase, slot, hashtags (R6) | Next batch |
| "How?" or "free?" comments | **Iterate** | PC01 plus a reply video (R9) | This week |
| Below the median on views **and** watch ratio **and** shares | **Retire** (concept) | Stop it; write one line on why | Now |
| A pattern's 3rd post below the median | **Retire** (pattern) | Park it (R12) | Now |
| An accuracy or rights complaint | **Fix or remove** | Same day (R10) | Today |

**Ties and conflicts:** product friction (R3) beats any content action. A Double down beats an Iterate on the same post. Never act on a single metric from a single post when the rule asks for "twice".

---

## 6. Weekly template (copy into your log)

```markdown
## Week W__ review · Thu 20__-__-__ (30 min)

Posts reviewed (≥72 h): W__-___ · W__-___ · W__-___ · W__-___
7-day re-reads (search-heavy): ____
Account median (last 12): views __ · watch ratio __ · % full __ · shares/1k __ · saves/1k __ · follows/1k __ · profile visits/1k __ · search % __

| Post | Views 72h | Watch ratio | % full | Ret 3s | Shares/1k | Saves/1k | Follows/1k | Profile/1k | Search % | Class | Rule | Action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | | |

Site, last 7 days (/admin):
- Visitors: TikTok __ (prev __) · YouTube __ · Instagram __
- TikTok funnel: started __ · real results __ · demo results __ · failed __ · shared __ · Discord clicks __
- Site-wide: visits __ → started __ → results __ → shared __ · Premium (info only) __
- Top failure codes: ____

Tests: T__ · posts so far A __ / B __ · decision due W__ · notes ____
Cadence: published __ videos (baseline 4, floor 3) · carousel Y/N · trend slot Y/N
Event week? Y/N · dates verified on ____ at partner.steamgames.com/doc/marketing/upcoming_events
Compliance misses: __ (fix ____)
Bio link campaign this week: utm_campaign=____

Next batch actions (max 5):
1. ____
2. ____
3. ____
```

---

## 7. Monthly reset rules

Run these at the reviews closing **W4, W8 and W12** (and at the first review of each calendar month). They add about 20 minutes.

1. **Re-baseline.** Recompute the account median from the last 12 videos; archive older rows.
2. **Gates.**
   - End of W4: cadence gate, 5–6/week through W8 if sustainable and views are stable or rising (research §3.1).
   - Start of W5: lock posting slots A/B (research §3.8).
   - End of W8: keep the higher rate only if total views and follows per 1k improved without hurting average watch time (research §3.1).
   - W9 and W13: re-test one alternative slot (research §3.8).
3. **Hook bank.** Park patterns with 3 posts below the median (research §3.12). Add 3 variations for each winner. Keep 2 finished fallback videos in the trend-slot bank.
4. **Series.** Keep any series with a Double down this month. Pause a series with no post above the median all month (*house rule*).
5. **Keywords.** Pull search queries from TikTok Studio, update the phrase rotation and keyword management, and promote winners into series titles (research §3.5, Q4.2).
6. **Verify.**
   - Upcoming Steam event dates (research §5 #1).
   - The TikTok Studio scheduling window and partner scheduler support (research §5 #4, #9).
   - The Community Guidelines (research §5 #7).
   - That the bio link still shows (research Q9.1).
7. **Compliance spot-check.** Audit 4 random posts against `CONTENT_STRATEGY.md` §12.
8. **Assets.** Re-record screen clips whose UI changed. Re-check `posts.json` demo numbers against the demo facts.
9. **Cross-post.** Send the month's top 3 TikToks to Shorts and Reels with swapped audio and rewritten captions (`CONTENT_STRATEGY.md` §11).
10. **Time check.** If the week took more than 5 hours twice this month, cut the trend slot first, then reserve-bank posts. Never drop below the 3-video floor (research §3.1).
11. **Write five lines:** what won, what lost, what you decided, what you'll test next, what surprised you. These feed P10 posts and next quarter's plan.
