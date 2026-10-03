# WeBothPlay Shot & Motion Guide

How to build each video, second by second: shot lists, screen-recording setup, zooms and cuts, sound, assembly in CapCut, and the 5-minute review before scheduling. Written 2026-10-03 for the 13-week plan (2026-10-05 → 2027-01-03).

**Citations.** "(research §3.3)" = a section of `marketing/TIKTOK_RESEARCH_2026.md`; "(research Q7.5)" = finding 5 under Q7 in its §2. Numbers marked *house rule* are production defaults you can tune.

**Vocabulary used here.** Formats: Screen recording + VO · Template render · Template + screen recording · Photo Mode carousel · Reply-to-comment video. Renderer templates: overlap-reveal, roulette, nobody-played, stat-card, top-five, meme-card, hook-overlay, end-card. Series: Overlap Reveal, Spin It, Pile of Shame, One Copy Away, Carry Report, Group Chat Energy, Ask the Squad, Tonight's Pick. Pillars P1–P11.

---

## 1. Timing rules

| Rule | Value | Source |
|---|---|---|
| Frame 1 shows the payoff | The count, the landed pick, the zero hours, or the finished result | research §3.3 #1 |
| First motion | **Before 1 s** (counter, reel tick, cursor zoom) | research §3.3 #3 |
| Key message on screen | **By 3 s** | research §3.3 #2, Q2.3 |
| Searchable phrase spoken | **Within 5 s** | research §3.3 #4 |
| End card | **≤2 s**, inside the safe box | research §3.7 |
| Length buckets | Quick 9–20 s · Demo 25–45 s · Deep 60–120 s | research §3.2 |
| New visual beat | Every 2–3 s | *house rule* |
| Text hold | Long enough to read it twice at normal speed | *house rule* |
| Ending | Echo frame 1 so the replay loops | research Q7.5 |

Why the rush: typical watch time per view is single-digit seconds; entertaining content moves it from about 6 to about 9 s (research Q2.2).

---

## 2. Screen-recording setup and checklist

### 2.1 Setup (once)

- **Capture spec:** a 360 × 640 CSS-pixel viewport at 3× DPR, which gives 1080 × 1920 (research §3.4).
  - **Phone (easiest):** a browser viewport about 360 CSS px wide at 3× DPR, with the built-in screen recorder.
  - **Desktop:** Chrome DevTools device mode, custom device 360 × 640 at DPR 3. Check the output: if a test clip is smaller than 1080 × 1920, your screen can't show enough physical pixels, so record on the phone (`STYLE_GUIDE.md` §7).
- **A dedicated browser profile for recordings:** no extensions, bookmarks bar hidden, page zoom 100%, the site's default dark theme.
- **Do Not Disturb on;** no notifications or personal tabs.
- **Tap indicator:** Android's developer option "Show taps", or DevTools touch emulation on desktop. If your device can't show taps, add a tap marker in CapCut.
- **Frame rate:** record at 30 or 60 fps and edit at 30 fps (the renderer's default).
- **Data**
  - Demo group: `webothplay.com/compare?demo=1`, or "Try the demo" on the homepage.
  - Privacy flow: the fictional private demo profile.
  - Real groups: written consent from every member.
  - Discord: a private test server with consenting, linked accounts, using free commands only (`/link`, `/compare` with friends mentioned).

### 2.2 Before you press record

- [ ] A 3-second test clip is 1080 × 1920 and the UI text is sharp at 100% zoom
- [ ] The demo group is loaded (or consent is on file for a real group)
- [ ] "Recent groups" and "Saved groups" show no real friends' names; you're signed out unless the flow needs sign-in
- [ ] Filters are reset; the sort is "Best for tonight"
- [ ] The page is scrolled so the key UI will sit **below** the hook band (y > 700)
- [ ] No Microsoft-owned title (Sea of Thieves, Forza Horizon 5, Age of Empires II: Definitive Edition, Overwatch 2) is where the action happens
- [ ] Tap indicator on

### 2.3 While recording

- **One action per clip.** Record each step as its own clip, with 1 s of stillness before and after (*house rule*).
- **Calm, deliberate taps;** one smooth scroll at a time; let results finish loading.
- **Sign-in flows:** cut from tapping "Sign in through Steam" straight to being back on WeBothPlay. **Never show Steam's sign-in, settings or store pages:** they carry the Steam logo.
- **Discord:** show the bot's messages; keep Discord branding incidental; blur server and member names that aren't consenting test accounts.

### 2.4 After recording

- [ ] Blur any real IDs, profile URLs, avatars or names
- [ ] Trim waiting time. **Don't state a speed** ("in 5 seconds") unless the clip proves it uncut
- [ ] File it as `W##-DAY/recording.mp4`, or under the library ID (R01–R14 in `CONTENT_STRATEGY.md` §8.2)

---

## 3. Shot lists per format

### 3.1 Screen recording + VO (P2, P8, some P5/P6)

| Shot | Content | Motion |
|---|---|---|
| S1 Payoff open | The finished result (count, landed pick, fun fact) with the hook-overlay PNG | Zoom 1.0 → 1.15 or a tap, starting at frame 1 |
| S2 Key message | VO line with the searchable phrase; tighten on the number or card | Ease-out zoom, hold |
| S3 Setup | Paste profile links, or sign in and pick friends | Speed ramp 2–4× (*house rule*) |
| S4 Result | Result count and the "Best for tonight" list | Zoom on the count, then the top card |
| S5 Feature | One filter, One copy away, the Group vote, or Roulette | Tap marker, zoom on the element |
| S6 Payoff again | The landed pick or the count | Matches S1 |
| S7 Close | Question or CTA line (body band), then end card ≤2 s | Cut |

### 3.2 Template render (P1, P3, P4, P5, P7, P11)

| Shot | Content |
|---|---|
| S1 | Template frame 1, with the payoff in the hook text, or a flash-forward of the landing (§4.5) |
| S2 | The template plays (count, reel, "Combined hours: 0", list) |
| S3 | Punchline or fun fact (template field) |
| S4 | Question or CTA (VO plus a body-band line in CapCut) |
| S5 | End card (1.8 s as rendered) |

Add VO and SFX in CapCut. The renders are silent masters.

### 3.3 Template + screen recording (P1, P2, P3)

| Shot | Content |
|---|---|
| S1 (0–3 s) | Template opener showing the payoff stat (overlap-reveal or stat-card), or its flash-forward |
| S2 | Cut to the recording that proves it (paste → result) |
| S3 | One feature beat (filter, One copy away, vote) |
| S4 | Back to the stat or landing (loop) |
| S5 | Question or CTA, then end card ≤2 s |

### 3.4 Photo Mode carousel (P6, P9, P5)

| Slide | Content |
|---|---|
| 1 (cover) | A headline that works alone, with the payoff visible: the top-five `-slide-1.png` |
| 2–6 | One item per slide, each one standalone. Add the demo label to any slide stating demo-group facts (the renderer's slides don't stamp it) |
| Last | End card (EC01 or EC02 in `CTA_LIBRARY.md` §9) |

Carousels are a save-worthy supplement, not the reach engine. Metricool found videos got 5.6× the views and 7.8× the interactions of image/carousel posts (research Q7.1). Fanpage Karma found carousels earned 81% higher engagement but about 33% fewer shares (research Q7.2). Use CML or original audio only, and put the searchable phrase first in the caption.

### 3.5 Reply-to-comment video (P11, P8)

| Shot | Content |
|---|---|
| S1 | TikTok's comment sticker, moved inside the safe box (top of the hook band), with the payoff visible below it |
| S2 | The answer: a screen recording showing exactly what was asked |
| S3 | The payoff and a short thanks (no incentive, no "comment more") |
| S4 | Question or CTA, then end card ≤2 s |

Real comments only. Never show a commenter's Steam data without consent. 1–2 a week can count toward the baseline (research §3.9).

---

## 4. Beat templates

Each row is a beat. "VO" = voiceover. The hook text stays in the hook band (y 220→700); captions and question/CTA lines sit in the body band (y 900→1400).

### 4.1 12-second quick hit (Overlap Reveal, Pile of Shame, Carry Report, Group Chat Energy)

| Time | Visual | On-screen text | Audio |
|---|---|---|---|
| 0.0–1.0 | Payoff frame (count, landed pick, zero) or flash-forward. Motion starts at frame 1 | Hook, 3–7 words | VO starts by 0.3 s with the spoken hook (≤10 words, includes the phrase); soft tick |
| 1.0–3.0 | The payoff resolves and holds | Hook stays; key message readable | VO finishes the line |
| 3.0–6.0 | Context: where it came from (quick UI flash or a second fact) | One caption block | One VO sentence |
| 6.0–8.5 | The twist: carry, nobody launched, one copy away | Caption | VO plus a light hit |
| 8.5–10.0 | Question, or the CTA on 1 in 3 videos | Question/CTA line | VO says it |
| 10.0–12.0 | End card (≤2 s), then loop | End card | Short sting or silence |

### 4.2 20-second quick hit or short demo (Spin It, short P2)

| Time | Beat |
|---|---|
| 0–1 | Payoff plus motion (flash-forward of the landing, or the count already on screen) |
| 1–3 | Key message plus the searchable phrase |
| 3–7 | Step 1: paste profiles, or the filter tap |
| 7–12 | Step 2: results, "Best for tonight", the spin |
| 12–15 | Second payoff: fun fact or landed pick |
| 15–18 | Question or CTA |
| 18–20 | End card |

### 4.3 35-second demo (P2, P8, One Copy Away, Tonight's Pick)

| Time | Beat |
|---|---|
| 0–1 | Payoff plus motion |
| 1–3 | Key message plus the searchable phrase |
| 3–6 | The problem in one relatable line |
| 6–12 | Step 1: paste profiles (speed-ramped) or sign in and pick friends |
| 12–19 | Step 2: the count, "Best for tonight", one filter |
| 19–26 | Step 3: the feature (One copy away, Group vote, or Roulette) |
| 26–30 | The payoff again (landed pick or survivors) |
| 30–33 | CTA (XS01) or question |
| 33–35 | End card |

### 4.4 75-second deep dive (P9 event roundup, P6 list)

| Time | Beat |
|---|---|
| 0–1 | Payoff plus motion: the full list on one frame, or item #1 |
| 1–3 | Key message: "5 co-op games…" plus the phrase |
| 3–8 | How the list was made (from a group's shared library, labelled; or verified event dates) |
| 8–20 | Item 5 |
| 20–32 | Item 4 |
| 32–44 | Item 3 |
| 44–56 | Item 2 |
| 56–66 | Item 1 |
| 66–70 | Recap frame with all five (save-worthy) |
| 70–73 | Question or CTA |
| 73–75 | End card |

Show items as text plus real UI recordings. No trailers, no gameplay, no key art (research §3.11 #2).

### 4.5 Fixing renderer templates whose payoff lands late

The renderer templates follow these rules out of the box. Motion starts at frame 1, the payoff lands by about 3 s, the frame keeps a slow upward drift after the payoff, and the end card lasts 1.8 s.

| Template | Length | When the payoff lands | Anything to do? |
|---|---|---|---|
| overlap-reveal | 9 s | Rings close and the count runs from frame 1, complete by 1.6 s. Libraries at 2.2–4.8 s, punchline from 4.8 s | Optional: a 0.5 s flash-forward of the final count if you want frame 1 itself to show "64" |
| roulette | 9 s | Reel spins from frame 1 and lands at 3.4 s; "Tonight's pick" at 3.6 s | None |
| nobody-played | 9 s | Title at frame 1, "Combined hours: 0" at 1.0 s (pulses blue/white, never amber), punchline at 2.4 s | None. Demo groups default to the third person ("All 4 friends own…") |
| stat-card | 9 s | Number counts 0.1–1.5 s; label at 0.6 s; sub-line at 1.4 s | None |
| top-five | 11 s | Item 1 at 0.4 s, then one every 1.3 s | None |
| meme-card | 9 s | Line 1 at frame 1, then one per second | None |
| end-card | 1.8 s | — | Append it to screen recordings as is |

**Flash-forward, step by step:** in CapCut, freeze the frame where the payoff is fully visible, place 0.5–0.8 s of it at the very start, then cut to the template from 0 s. The cut plus the micro-zoom gives you motion inside the first second.

---

## 5. Cursor, zoom and transitions

| Move | Rule (*house rules*) |
|---|---|
| Tap | Visible tap marker, one action per beat |
| Zoom in | 1.0 → 1.4–1.6× on the element in use, ease-out over 300–400 ms, then hold ≥1 s |
| Zoom out | Before moving to a different part of the screen. Never zoom and pan in opposite directions |
| Pan | Follow the action smoothly. Keep the element inside the safe box |
| Speed ramp | 2–4× for typing, pasting and scrolling. Cut waits cleanly; never claim a speed you didn't show |
| Transitions | Hard cut by default. Match cuts (ring → ring, card → card). A fast slide only inside the roulette. No spins, star wipes, glitch or zoom-blur |
| Text animation | Fade plus 24 px rise in 200–400 ms (renderer `fadeIn`). No typewriter effect on hooks: it slows reading |
| Signature moment | One per video: the count landing or the reel landing, with a small overshoot and settle |

---

## 6. Hook-overlay PNGs plus recordings, in CapCut

1. **Render the overlay.** Add to `marketing/renderer/posts.json`:
   `{ "id": "W06-WED", "template": "hook-overlay", "data": { "text": "Stop asking what everyone owns", "demo": true } }`
   Push it and GitHub renders it (or run `npm run social:render -- --only W06-WED` locally). Output: `marketing/renders/posts/W06-WED.png`, 1080 × 1920 and transparent, with the plate already in the hook band.
2. **New CapCut project:** 9:16, 1080 × 1920, 30 fps.
3. **Track 1:** the screen recording, scaled to fill, with the key UI inside the safe box (zoom and pan as in §5).
4. **Track 2:** the overlay PNG at position 0,0 and 100% scale; it's pre-positioned. Keep it on for at least the first 3 s, or the whole clip.
5. **Guide layer:** TikTok's safe-zone template on top while editing. **Delete it before export.**
6. **Demo label:** with `demo: true` the overlay carries it. Extend the PNG, or add a label preset (`STYLE_GUIDE.md` §4), for **every** second the recording shows demo data.
7. **Captions:** CapCut auto-captions → restyle to `STYLE_GUIDE.md` §8 (Inter Bold 44 px, plate, ≤26 characters per line) → move into the body band (y 900→1400) → fix feature names ("Best for tonight", "One copy away").
8. **Audio:** a VO track and an SFX track. **No CML in the master:** add any CML bed in TikTok when posting.
9. **Flash-forward** if needed (§4.5).
10. **End card:** append the renderer end card (already 1.8 s).
11. **Export:** 1080 × 1920, 30 fps, high bitrate. No CapCut watermark, no ending clip. Name it `W06-WED-master.mp4`.
12. **Save the project as a CapCut template** for the format, so next week starts from step 3.

---

## 7. SFX guidance

| Moment | Sound | Note |
|---|---|---|
| Tap or paste | Soft UI click | Subtle; not on every tap |
| Counter | Soft ticks that speed up, then stop on the landing | About as long as the count |
| Reel | Decelerating ticks, a firm "thunk" on the landing | Pairs with the overshoot and settle |
| Landing / reveal | One short low hit or chime | Once per video, on the signature moment |
| Text entrance | Nothing, or a very soft whoosh | Don't sound every caption |
| End card | Short sting or silence | — |

**Rules**
- Use only SFX licensed for commercial use on **every** platform you post to. Check each asset, including CapCut's built-in library.
- No game sounds, no Steam or Discord notification sounds, no meme clips from the general library (research §3.6).
- SFX sit under the voiceover; no loud whooshes or harsh highs.
- **SFX support, they never carry meaning.** The video must work muted. An often-quoted older TikTok figure says 88% of users call sound vital (research Q2.5, older, not re-verified), so make the sound good. But the text does the work.

---

## 8. The 5-minute review (every video, before scheduling)

**Minute 1: watch muted**
- [ ] Frame 1 shows the payoff
- [ ] Something moves before 1 s
- [ ] The key message is readable by 3 s
- [ ] The point lands without sound

**Minute 2: watch with sound**
- [ ] The searchable phrase is said within 5 s, and every word of the VO is clear over the bed
- [ ] Original audio only (VO + licensed SFX); no CML baked into the master
- [ ] Every promised payoff is shown; no fake "part 2"

**Minute 3: safe zones (with the template overlay)**
- [ ] All text is inside x 64→940, y 150→1436; hook in y 220→700; captions in y 900→1400
- [ ] The demo label is visible for every second demo data is
- [ ] End card ≤2 s; length fits its bucket (9–20, 25–45 or 60–120 s)

**Minute 4: compliance**
- [ ] No Steam logo, Steam pages or Valve implication; no hero key art; no Microsoft-owned title as hero; no real names or IDs
- [ ] Demo numbers match the demo facts (39 · 70 · 80% · Counter-Strike 2 · Bloons TD 6 · Nova 36 h · Baldur's Gate 3 / Juno · 13) or what the site's demo results show; third person
- [ ] No Premium, prices or purchase prompts; no unverified dates, prices, speeds or player counts

**Minute 5: post settings**
- [ ] Caption line 1 starts with the phrase and the value; "(demo data)"; Valve disclaimer if Steam is prominent
- [ ] 3–5 hashtags
- [ ] Cover chosen (payoff plus title; no game art)
- [ ] "Your brand" toggle on
- [ ] CTA matches the plan (about 1 in 3 explicit); pinned comment ready for demos
- [ ] Logged: post ID, test and variant, hook ID, CTA ID, bio `utm_campaign`
- [ ] Scheduled in TikTok Studio (web) or an official partner scheduler, in the planned slot
