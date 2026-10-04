# WeBothPlay Social Style Guide (TikTok, Shorts, Reels)

How WeBothPlay looks and sounds in 9:16 video. Written 2026-10-03. This guide matches the website's design system (`src/app/globals.css`, `docs/retrofit/DESIGN_RESEARCH.md`) and the social renderer (`marketing/renderer/lib.mjs`, `templates.mjs`).

**Citations.** "(research §3.4)" = a section of `marketing/TIKTOK_RESEARCH_2026.md`; "(research Q6.1)" = finding 1 under Q6 in its §2; "(design §7)" = `docs/retrofit/DESIGN_RESEARCH.md`.

**Vocabulary used here.** Pillars P1–P11 (P3 Squad stats and P5 Pile of shame use demo data most). Series: Overlap Reveal, Spin It, Pile of Shame, One Copy Away, Carry Report, Group Chat Energy, Ask the Squad, Tonight's Pick. Formats: Screen recording + VO · Template render · Template + screen recording · Photo Mode carousel · Reply-to-comment video.

---

## 0. Five principles

1. **The product is the hero.** Real UI and real results, not decoration.
2. **Payoff first.** Frame 1 shows the result; motion starts inside the first second (research §3.3).
3. **One signature moment per video:** the count landing, or the roulette landing. Everything else is quick and quiet (design §4 P5).
4. **Dark, calm, high contrast.** Near-black stage, near-white type, one blue for meaning.
5. **Honest by design.** Demo data is labelled. Nothing looks like Steam or Valve (research §3.11).

---

## 1. Palette with roles

| Role | Hex | Use | Never |
|---|---|---|---|
| **Stage** (background) | `#060708` | Every frame's background (the renderer default) | Pure gray or gradient backgrounds |
| Surface 1 / 2 / 3 | `#101317` / `#161a1f` / `#1d2229` | Plates behind text, chips, cards, the demo label | Frosted/blurred glass |
| Hairline | `rgba(232,238,247,0.14)` | 2 px borders on plates, chips, reel rows | Glows |
| **Ink 1** (primary text) | `#f3f5f8` | Hooks, captions, game titles | — |
| Ink 2 (secondary text) | `#b7bdc7` | Labels, sub-lines, the demo label | Hooks |
| Ink 3 (minimum text) | `#8a919d` | Disclaimers, slide counters ("2/5") | Anything below 24 px |
| **Brand blue** (signal) | `#3b82f6` | Rings, the lit lens, bars, dots, Friend 1 | Small text, or white text on it at body sizes |
| **Text-safe blue** | `#60a5fa` | Blue text on dark: the keyword highlight, hero numbers, the "Both" in the wordmark, "TONIGHT'S PICK" | Big flat fills |
| Amber | `#f5a524` | **Premium only, so never in organic content** | Warnings, highlights, flicker effects |
| Discord blurple | `#5865f2` | Discord elements only (the `/compare` command plate, the bot end card) | Brand accents |

All text colors above pass WCAG AA on `#060708`; the ratios are noted in `src/app/globals.css` (design §7).

### Friend colors (validated colorblind-safe, fixed order)

| Order | Hex | Demo group |
|---|---|---|
| 1 | `#3b82f6` | Nova |
| 2 | `#e0621f` | Bram |
| 3 | `#13a674` | Kit |
| 4 | `#c948d2` | Juno |
| 5 | `#c98500` | — |
| 6 | `#0f9fb8` | — |
| 7 | `#e5446d` | — |
| 8 | `#7c6cf0` | — |

**Rules:** keep the order (friend 1 is always `#3b82f6`). Always pair a friend color with a name or initial, never color alone. A missing friend gets a **hollow** dot in their color plus the word "missing", not red. Don't reuse friend colors for anything else.

---

## 2. Typography

All fonts are SIL OFL and fine for video and social graphics (design §5.2). The renderer loads them from `src/assets/fonts/`.

| Family | Weight / cut | Used for |
|---|---|---|
| **Archivo Expanded** | ExtraBold 800 (renderer name `ArchivoWide`) | Hooks, hero numbers, game titles as hero text, the wordmark |
| **Archivo** | SemiBold 600, uppercase, tracked +3 px | Labels, series kickers, the demo label, "TONIGHT'S PICK", slide counters |
| **Inter** | Bold 700 for captions and body; Medium 500 for small print | Captions, sub-lines, disclaimers |
| **JetBrains Mono** | Medium 500 | Discord commands (`/compare`) and fictional IDs. Set it in CapCut; the renderer doesn't load it |

### Type scale on 1080×1920

| Role | Font | Size | Line height | Limits | Color |
|---|---|---|---|---|---|
| **Hook** | Archivo Expanded 800 | **60–80 px** (renderer: 64–76; overlay 66) | 1.04, tracking −1 px | **3–7 words, ≤26 characters per line, ≤2 lines** | Ink 1, plus one keyword in `#60a5fa` |
| Hero number | Archivo Expanded 800, tabular | 200–260 px | 0.9 | 1–4 characters | `#60a5fa` |
| Game title as hero text | Archivo Expanded 800 | 80–124 px (shrinks with length) | 1.02 | ≤2 lines | Ink 1 |
| **Body / captions** | Inter 700 | **40–48 px** | 1.25 | **≤26 characters per line, ≤2 lines per block** | Ink 1 (secondary lines Ink 2) |
| Kicker / label | Archivo 600 caps, +3 px | 26–34 px | 1.2 | One line | Ink 2; series kicker `#60a5fa` |
| Demo label | Archivo 600 caps, +3 px | 26 px | — | One line (see §4) | Ink 2 on a Surface 1 plate |
| Disclaimer | Inter 500 | 24 px | 1.3 | ≤2 lines | Ink 3 |
| Command | JetBrains Mono 500 | 36–44 px | — | One line | Ink 1 on a Surface 2 plate |

Sizes come from research §3.4 (hook 60–80 px, body 40–48 px, ≤26 characters per line, heavy weight with contrast).

**Rules**
- Two families plus a mono, and no more. Nothing lighter than Medium 500. No gradient text (design §4 P2).
- Sentence case for hooks and captions. Caps only for labels and kickers.
- Break lines by hand so no line ends on a lone word. Never hyphenate.
- Use the UI's exact feature names: "Best for tonight", "One copy away", "Nobody's played", "Only one owns", "Tonight's pick", "Couch / Remote Play".

---

## 3. Layout grid and safe zones

**Critical-content box: x 64 → 940, y 150 → 1436** (876 × 1286 px). It keeps clear of the right action rail (140 px) and the bottom caption/CTA area (484 px) (research §3.4).

```
 x:  0    64                                     940    1080
y:0  +----+---------------------------------------+------+
     |    TOP UI (status bar, tabs): nothing essential    |
150  +----+---------------------------------------+      |
     |    | LABEL ROW (154-200): demo label        |  R   |
220  |    +---------------------------------------+  I   |
     |    | HOOK BAND (220-700)                    |  G   |
     |    |   series kicker, then hook, <=2 lines  |  H   |
700  |    +---------------------------------------+  T   |
     |    | MEDIA / STAT ZONE (700-900)            |      |
     |    |   hero number, rings, landed card      |  R   |
900  |    +---------------------------------------+  A   |
     |    | BODY / CAPTION BAND (900-1400)         |  I   |
     |    |   captions, question line, CTA line    |  L   |
1400 |    +---------------------------------------+      |
1436 +----+---------------------------------------+      |
     |  BOTTOM UI (1436-1920): caption, username,  | 940- |
     |  music, CTA. Nothing essential.             | 1080 |
1920 +---------------------------------------------+------+
```

- **Columns (house rule):** 6 columns of 126 px with 24 px gutters inside the 876 px box. Align text left at x 64.
- **Zones flex:** large visuals (rings, reels, recordings) may span 500–1400 px vertically, but **text stays in its band**, and nothing essential leaves the box.
- **Decorative bleed:** rings may extend slightly past the box (the renderer draws them from x 44). Numbers and labels never do.
- **Guide layer:** keep TikTok's official safe-zone template (from the Ads Help in-feed spec page) as a CapCut overlay, and preview in TikTok Studio before scheduling. Long captions push TikTok's overlay higher, so keep captions short (research §3.4).
- **Shorts and Reels** have different UI: preview in each app and nudge text if it collides (research §3.10).

---

## 4. Demo-data label

**Text:** `Demo data · fictional friend group`. The renderer sets it in caps: `DEMO DATA · FICTIONAL FRIEND GROUP`.

| Property | Spec (matches `DemoLabel()` in `marketing/renderer/lib.mjs`) |
|---|---|
| Font | Archivo SemiBold 600, uppercase, tracking 3 px |
| Size | 26 px. Don't go smaller |
| Color | Ink 2 `#b7bdc7` |
| Plate | `rgba(16,19,23,0.85)`, 2 px hairline border, 10 px radius, 8 × 14 px padding |
| Position | Top-left of the safe box: x 64, y ≥150 (renderer: y 154), above the hook band |
| Duration | **Every frame where demo data is visible**, including flash-forward frames and covers (research §3.3 #7) |

**Where it comes from**
- **Stamped automatically:** overlap-reveal, roulette, nobody-played, stat-card and top-five videos (unless `demo: false`), and hook-overlay when `demo: true`.
- **Not stamped:** meme-card (no demo data), end cards, and **top-five carousel slides**. If a carousel slide states demo-group facts, add the label before posting (TikTok text tool or CapCut).
- **Raw screen recordings of the demo:** use a hook-overlay rendered with `demo: true`, or a saved CapCut text preset with this spec.

**Also:** write "(demo data)" in the caption. Never cover the label with stickers or captions. Talk about the demo group in the third person (`CONTENT_STRATEGY.md` §8.3).

---

## 5. The rings motif

**Meaning:** two libraries, one overlap. Two outlined rings with the shared lens lit blue, the same device as the website's `OverlapMark`.

| Property | Spec (renderer `Rings()`) |
|---|---|
| Ring stroke | `rgba(232,238,247,0.22)`, about 3–4 px at full width |
| Lens fill | `rgba(59,130,246,0.22)` (brand blue at 22%) |
| Lens edge | `rgba(96,165,250,0.75)` |
| Width | Up to the full safe box |
| Label inside the lens (optional) | `BOTH OWN` or the count, in Archivo caps |

**Motion:** the rings slide together, then the lens lights. Once per video. Never spinning, pulsing or glowing in a loop.

**Groups bigger than two:** keep the two-ring mark and show each friend as a colored dot and row (as overlap-reveal does). Don't draw 4–8 overlapping rings; they're unreadable.

**Use it on:** Overlap Reveal centerpieces, P3 covers, end-card accents. Not as wallpaper behind every video.

---

## 6. Motion principles

| Principle | Rule |
|---|---|
| Payoff first | Frame 1 holds the result: hook text with the number, the landed card, the zero. Motion starts before 1 s (research §3.3 #1, #3) |
| One signature moment | The count landing or the roulette landing. Everything else is feedback (design §4 P5) |
| Easing | Entrances ease out, like the renderer's cubic `easeOut` and the site's `cubic-bezier(0.2, 0.8, 0.2, 1)`. Landings get a small overshoot, then settle (`cubic-bezier(0.34, 1.4, 0.64, 1)`). Text fades in with a 24 px rise (renderer `fadeIn`) |
| Durations (house rules) | Text entrances 200–400 ms. Count-ups readable by 3 s. The site's Roulette spins in about a second; the renderer's reel lands at about 5.6 s, so use a flash-forward open (`SHOT_AND_MOTION_GUIDE.md` §4). Hold every key frame long enough to read it twice |
| No ambient motion | No floating particles, orbs, light sweeps, glitches, shakes, parallax tilts or looping glows |
| Direction | Left → right for before → after and for merging rings. Top → down for lists |
| Cuts over effects | Hard cuts by default, match cuts on rings and cards. No spins, star wipes or zoom-blur transitions |
| Loops | The last content frame echoes frame 1, so a replay feels continuous (research Q7.5) |

---

## 7. Screen recordings: framing

**Spec:** a 360 × 640 CSS-pixel viewport at 3× DPR, which gives 1080 × 1920 (research §3.4). The full setup checklist is in `SHOT_AND_MOTION_GUIDE.md` §2.

**Getting a sharp 1080 × 1920 capture**
- **Easiest:** a phone whose browser viewport is about 360 CSS px wide at 3× DPR, using its built-in screen recorder. Crop to 9:16 in CapCut.
- **Desktop:** Chrome DevTools device mode (custom device 360 × 640, DPR 3) gives the right layout. But the captured resolution depends on your screen: it needs to show 1,920 physical pixels of height (a portrait or 4K display). **If the file comes out smaller than 1080 × 1920, record on a phone instead.** Soft UI text is the most common quality failure.

**Framing rules**
- **Full-bleed**, no fake phone mockups (house rule): they shrink the UI.
- The thing that matters (the count, the tapped chip, the landed card) sits **inside the safe box**. Zoom 1.0 → about 1.5× and pan to keep it there.
- When a hook-overlay plate covers the hook band, scroll so the key UI sits below y 700.
- **Data:** the demo group (`/compare?demo=1`) or a real group with written consent, with IDs, URLs and avatars blurred.
- **Never record Steam's own pages** (sign-in, privacy settings, store). They carry the Steam logo.
- **Capsule art** appears only as it naturally does in the UI: small, many titles. Never zoom in until one game's art fills the frame. Don't linger on Microsoft-owned titles (research §3.11 #2).

---

## 8. Captions and subtitles

### Burned-in captions (every voiced video)

| Property | Spec |
|---|---|
| Font | Inter Bold 700, 44 px (range 40–48) |
| Color | Ink 1; highlight only the searchable phrase in `#60a5fa` |
| Backing | A `#060708` plate at about 80% opacity with a 22 px radius (as the renderer's overlay), or a 4–6 px dark stroke |
| Position | Body band, y 900 → 1400 |
| Length | ≤26 characters per line, ≤2 lines, one block at a time |
| Style | Sentence case, no emoji, synced to the voiceover, UI feature names spelled exactly |

**TikTok auto-captions:** if you turn them on, keep the body band free (research §3.4). Never stack them on top of burned-in captions.

### Post caption (the text under the video)

1. **Line 1:** the searchable phrase plus the value, inside the first ~100 characters before "See more" (research Q3.10).
2. "(demo data)" when demo data appears.
3. The question or CTA (`CTA_LIBRARY.md`).
4. "Not affiliated with Valve." when Steam is prominent (research §3.11 #1).
5. **3–5 hashtags, never more than 5** (research §3.5, Q4.3): 1 broad (#steam or #pcgaming) + 2 intent (#coopgames, #gamestoplaywithfriends, #multiplayergames, #steamgames) + 0–1 event (only while a confirmed event is live) + 0–1 brand (#webothplay).

---

## 9. Covers and thumbnails

The renderer exports `<id>-cover.png` for video templates. By default it grabs the frame 4 s before the end; set `coverAt` (in seconds) in `posts.json` to land on the payoff frame. Pick or make a cover for every post.

- **Show the payoff:** the count, the landed pick, "0 hours".
- **Title:** 3–5 words in the hook band (Archivo Expanded 800). Add the series kicker (`SPIN IT · #4`) until the week-13 test says otherwise.
- **Same layout per series**, so the profile grid reads as a set. Profile grids crop covers, so check your own grid and keep the title clear of the top and bottom edges.
- Demo label if demo data is visible.
- **Never:** a game's key art as the cover, publisher logos, the Steam logo, amber.
- **Carousels:** slide 1 is the cover. It works as a headline on its own, and every slide stands alone (research Q7.1).

---

## 10. Audio policy

- **Business Account → Commercial Music Library (CML) or original audio only.** Business accounts see only "Commercial Sounds", and general-library songs aren't cleared for brand content (research Q6.1, §3.6).
- **Default stack:** off-camera voiceover (your voice or TikTok's built-in text-to-speech) + UI SFX + a quiet CML bed (research §3.6).
- **Workflow:** renderer outputs are silent masters. Your CapCut master holds VO + SFX only, so it is original audio. Add a CML bed inside TikTok when posting, if your posting route supports TikTok sounds; partner schedulers may need "notify me, finish in app" (research Q11.3). Without a bed, VO + SFX is fully compliant.
- **Mix:** the voiceover sits on top. The bed is low enough that every word is clear on a phone speaker at half volume. Check on a phone.
- **Voice:** calm, quick, plain. Opening line ≤10 words, with the searchable phrase within 5 s.
- **Cross-posting:** the CML licence covers TikTok only (research Q6.2). Use the bed-free master, plus music licensed for that platform, or none.
- **Never:** ripped trending songs, general-library music, game soundtracks or game SFX, Steam or Discord notification sounds, clips from streamers.
- **AI:** TikTok's built-in text-to-speech is fine. A realistic AI voice clone, or AI visuals of people or scenes, needs TikTok's AI-generated content label (research §3.6). Default: don't use them.

---

## 11. Accessibility

- **Contrast:** use only the text colors in §1 on the stage color. Put text over recordings on a plate. Never set small white text on `#3b82f6`.
- **Captions on:** burned-in captions for every voiced video. Text-only videos caption themselves.
- **Works muted:** the on-screen text alone must carry the message.
- **No flashing:** never more than three flashes in any one second (WCAG 2.3.1). No strobing reels, no full-screen color flicker. The nobody-played template holds its "0" steady in blue (no flicker, no amber).
- **Color is never the only signal:** friend colors always come with names; "missing" is a hollow dot plus the word.
- **Size floor:** nothing smaller than 24 px (disclaimers only). Body text ≥40 px.
- **Gentle motion:** smooth zooms, no shakes, no pulsing.

---

## 12. Never do

| Never | Why |
|---|---|
| The Steam logo, Steam's UI chrome, a Steam-lookalike layout, or Valve and Steam event marks (for example a Next Fest logo) | WeBothPlay has no licence, and nothing may imply affiliation (research Q6.5–Q6.6, §3.11 #1) |
| "Official", "Steam's tool", "in partnership with Steam" | Implies endorsement (research §3.11 #1) |
| A game's key art as hero or cover; trailers; gameplay; publisher logos | IP risk rises when one game's art becomes the hero (research Q6.10, §3.11 #2) |
| Microsoft-owned game content as hero. The demo group includes Sea of Thieves, Forza Horizon 5, Age of Empires II: Definitive Edition and Overwatch 2 | Promoting a commercial site with Microsoft game content needs permission (research Q6.8) |
| Real Steam names, avatars, IDs or profile URLs without written consent | Privacy (research §3.11 #3) |
| Glassmorphism, neon glows, gradient text, purple-blue "AI" gradients, orbs, cubes, particles, 3D chrome, sparkle bursts, stock "gamer" photos, AI-generated people | Off-brand clichés (design §4 P2, P4) |
| Amber in organic content; blurple outside Discord elements | Color roles (design §7.3) |
| More than two families plus a mono; weights lighter than Medium | Type discipline (design §4 P2) |
| Text in the unsafe zones; more than two text blocks on screen at once; emoji walls | Legibility (research §3.4) |
