# WeBothPlay: Design Research for the 2026 Retrofit

**Research date:** 2026-10-03. Every source was accessed on this date unless a different date is given.
**Scope:** Task A (award references and gaming-adjacent products), Task B (typography and licensing), Task C (motion, performance and accessibility).
**Companion docs:** `docs/retrofit/COMPETITOR_MATRIX.md` (competitors and substitutes) and `docs/retrofit/research/` (JTBD).
**Status:** research input only. This document changes no code.

---

## 0. Decisions at a glance

| Topic | Recommendation | Label |
|---|---|---|
| Type system | **Archivo** for display and gaming UI labels (variable `wdth` 62–125, `wght` 100–900). **Inter** for UI and reading (variable `opsz` 14–32, `wght` 100–900), used for UI and body text only and never for headlines. **JetBrains Mono** for Steam IDs and data (`wght` 100–800; optional, not preloaded). All three are SIL OFL 1.1 with **no Reserved Font Names**, and all three are available through `next/font/google` in the installed Next.js 16.1.6. | License, axes and availability: [Fact]. Choice: [Interpretation] |
| Fluid type | Viewport 320→1440 px, base 16→18 px, ratio 1.2→1.333. `clamp()` tokens are in §6. Dense app UI (tables, filters) uses fixed sizes. | [Interpretation] |
| Color | Keep black, the blue-400/500/600 accent and amber for Premium, each with one fixed role. The minimum text color is `#8C939E`, which reaches at least 4.78:1 on every proposed surface. Stop using gray-500/600 for text: gray-500 on black is 4.34:1 and gray-600 is 2.78:1. White on blue-500 is 3.68:1, which fails for button text. | Contrast values: [Fact] (computed). Rules: [Interpretation] |
| Motion | Use one signature moment (roulette → "Tonight's pick"). Feedback takes ≤150 ms and transitions 200–300 ms, with no ambient loops. Reduced motion applies everywhere. Same-document View Transitions are Baseline (since 2025-10-14) and can be used with a fallback. **Cross-document View Transitions and scroll-driven animations are not Baseline:** stable Firefox has neither as of Firefox 157 (2026-09-29), so use them only as progressive enhancement. | Support data: [Fact]. Principles: [Interpretation] |
| Performance | Google's "good" thresholds are LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 (web-vitals v6.2.2). The proposed internal budgets are LCP ≤ 2.0 s, INP ≤ 150 ms and CLS ≤ 0.05. Critical fonts stay at or below ~200 KB WOFF2 (measured: Archivo ~93 KB, Inter ~103 KB). | Thresholds: [Fact]. Budgets: [Interpretation] |
| Accessibility | WCAG 2.2 AA. **Correction to the brief:** SC 2.4.13 Focus Appearance is **AAA**, not AA. Adopt it anyway, because it costs little. SC 2.4.11 (Focus Not Obscured, Minimum) and SC 2.5.8 (Target Size, 24×24) are AA. | [Fact] |

---

## 1. Method

### 1.1 Questions
1. Which 2025–2026 award-winning or premium gaming-adjacent sites offer principles a Steam utility can borrow without turning into generic SaaS?
2. Which typefaces have the right personality, rendering quality, tabular figures and uppercase quality, and also have licenses verified for both commercial web use and social video/images?
3. What is the actual browser-support status of the 2026 motion features (View Transitions, scroll-driven animations), and which performance and accessibility thresholds apply?

### 1.2 Sources, access and constraints (read this first)
- **Direct page fetching was blocked** by the environment's egress proxy for: awwwards.com, cssdesignawards.com, thefwa.com, godly.website, land-book.com, siteinspire.com, linear.app, raycast.com, store.steampowered.com, partner.steamgames.com, fonts.google.com, fontshare.com, fontsinuse.com, developer.mozilla.org, web.dev, caniuse.com, w3.org, wikipedia.org, tympanus.net (Codrops) and blog.lusion.co.
- Award facts and descriptions of reference sites therefore come from **search-index extracts** (WebSearch, standard and extended modes) of the awarding bodies' pages and of studio case studies and press. I ran about 30 searches before the session-wide search quota (200, shared with parallel agents) ran out. All later verification used primary sources on GitHub and local files.
- **Primary sources read directly (GH, PKG, CODE, MEAS):**
  - google/fonts `METADATA.pb` and `OFL.txt` for every candidate family.
  - The font binaries themselves, inspected with fontTools 4.66.1 (OpenType features, metrics, axes) and rendered on the brand background with Pillow + libraqm.
  - The SIL OFL-FAQ v1.1-update7 (November 2023; copy in `silnrsi/font-charis`).
  - MDN browser-compat-data (`main`, package v8.1.4), web-platform-dx/web-features (Baseline status), GoogleChrome/web-vitals (v6.2.2 source and CHANGELOG), w3c/wcag source (respec `publishDate: "2024-12-12"`) and the web-platform-tests/interop 2026 README.
  - Upstream font READMEs.
  - The installed Next.js 16.1.6 (`font-data.json` plus the `next/font/google` validation code), React 19.2.4, framer-motion 12.26.2 and Tailwind 3.4.18.
  - This repository's source.
- **Not sampled:** Godly, Land-book and Siteinspire were blocked and no search budget was left, so **this document claims no examples from them**. The itch.io and Steam Deck product pages were not researched (see §10).
- **No first-hand visits.** I could not open any reference site in a browser. Descriptions of how they look are as *reported* by case studies, award citations or press, unless they are explicitly my own renders.

### 1.3 Evidence labels and codes
- **[Fact]**: verified in a primary source or in an awarding body's own listing (via search extract), or measured first-hand in this session.
- **[Observation]**: what a third party reports about a design, or what I saw in my own renders.
- **[Interpretation]**: my design reasoning or recommendation.
- Access codes: **SI** = search-index extract (the page could not be opened). **GH** = read on github.com or raw.githubusercontent.com. **PKG** = installed package in `node_modules`. **CODE** = this repository. **MEAS** = my own measurement or render.
- Each key conclusion carries an **Evidence** line in the form *Source · URL · Date · What was learned · Why it matters · Label*.

---

## 2. Current state (two snapshots)

The repository is being retrofitted in parallel. HEAD is `eea422c` and the working tree contains uncommitted design-system changes, so this section separates the two.

### 2.1 Committed code (`8eb616d`; `page.jsx`, `layout.jsx` and `globals.css` are unchanged in HEAD `eea422c`)
- Inter was loaded with static weights 400–900 (`src/app/layout.jsx`). [Fact, CODE]
- The hero `h1` "Compare Steam libraries instantly" used `font-extralight` with gradient-clipped text from white to white/70 (`src/app/page.jsx` L366–369). The comparison form (`CleanDataEntryForm`) came right after it (L395), so **the tool was already near the top**. Keep that. [Fact, CODE; Interpretation]
- `AnimatedBackground` rendered **8 floating "balls"** behind the hero, which is exactly the orb cliché the brief rules out. [Fact, CODE]
- Counts across `src/`: `font-extralight` ×7, `font-light` ×6, `font-thin` ×1, `text-gray-400` ×85, `text-gray-500` ×80, `text-gray-600` ×14 and `backdrop-blur*` ×43, plus a 32 px blurred `.glass-card`. [Fact, CODE]
- There was **no** `prefers-reduced-motion`, `useReducedMotion` or `MotionConfig` anywhere, even though infinite animations existed (`shimmer`, `glow-spin`, `breathing`) and `scroll-behavior: smooth` was set globally. [Fact, CODE]
- Steam art came only from small landscape assets (`capsule_sm_120.jpg`, `capsule_231x87.jpg`, `header.jpg`). [Fact, CODE]
- AdSense and GA loaded with `strategy="afterInteractive"` in the root layout. [Fact, CODE]

### 2.2 Uncommitted working tree as of 2026-10-03 (parallel workstream)
- Fonts: **Bricolage Grotesque** for display (`axes: ["opsz","wdth"]`), **Mona Sans** for UI (`axes: ["wdth"]`) and **JetBrains Mono** for numbers (`src/app/layout.jsx`). [Fact, CODE]
- New tokens in `globals.css`: `--bg #060708`, surfaces, `--ink-1…4`, `--accent #3b82f6`, `--accent-hi #60a5fa`, `--accent-lo #2563eb` and amber. There is a global reduced-motion block, a `:focus-visible` 2 px outline and `.btn { min-height: 44px }`. [Fact, CODE] These address several §2.1 findings. [Interpretation]
- **Issues this research flags in the working tree** (computed in this session):
  - `.btn-primary` uses **white on `#3b82f6`, which is 3.68:1**, and its hover is white on `#4a8ef7` at **3.23:1**. At 15 px semibold that is not "large text", so it **fails SC 1.4.3**. Fix it with a `#2563eb` fill (5.17:1) or dark text on `#60a5fa` (7.93:1). [Fact, MEAS; Interpretation]
  - `body { font-feature-settings: "ss01" on, "cv11" on }`: in Mona Sans, `ss01` is "Square dots" and `cv11` **does not exist** (it is an Inter feature). This looks like a leftover from Inter. [Fact, MEAS (GSUB feature names)]
  - `.label` is set at 11 px with 0.14em tracking in condensed Mona. In my renders, condensed uppercase at 11 px is fragile. Recommendation: at least 12 px with 0.06–0.08em tracking (§6.4). [Observation, MEAS; Interpretation]
  - The font choice is compared with the recommended system in §5.7.

---

## 3. Reference studies (13 primary + secondary list)

Each study below lists its URL(s), award and date, what it is, the transferable **principle** (tagged by category), how it applies to WeBothPlay, and what **not** to copy.

### R1 · Messenger by abeto (Games & Entertainment / Web & Interactive)
- **URLs:** Awwwards Sites of the Year listing https://www.awwwards.com/websites/sites_of_the_year/ · Awwwards case-study announcement https://x.com/awwwards/status/2011469546712965498 (2026-01-14, decoded from the post ID) · background: https://en.wikipedia.org/wiki/Messenger_(video_game) and https://www.creativedevjobs.com/blog/best-threejs-portfolio-examples-2025
- **Award/date:** SOTD 2025-11-10. Listed as **Site of the Year 2025**, plus a Developer Award. [Fact, SI awwwards.com]
- **What it is (reported):** a tiny WebGL planet where you play a mail carrier. It is multiplayer: you can see other players and wave at them with emoji. Built with Three.js + three-mesh-bvh, Houdini/Blender models and WebSocket multiplayer on Node.js. [Fact, SI]
- **Principle (micro-interactions, social presence):** co-presence signaled through light, low-stakes gestures makes a solo browser session feel social. [Interpretation]
- **Apply:**
  - Show friends as live participants in the comparison: an avatar stack with per-friend loading status (e.g. "2,031 games ✓"), "4/4 own it" chips, and a one-tap reaction on shared result links. [Interpretation]
- **Do NOT copy:** the WebGL world, 3D navigation, real-time multiplayer infrastructure, or any loading that blocks the tool.

### R2 · Lando Norris by OFF+BRAND (Entertainment / Sport)
- **URLs:** case study https://www.itsoffbrand.com/our-work/lando-norris · https://www.webgpu.com/showcase/mclaren-f1-driver-lando-norris-official-website/ · https://www.lapa.ninja/post/landonorris/ · SOTY celebration post https://x.com/Norrislandofans/status/2027229106249822213 (2026-02-27)
- **Award/date:** Awwwards **Site of the Year 2025** and Users' Choice, plus a Developer Award. [Fact, SI]
- **What it is (reported):** "bold lime green typography, cinematic scroll driven sequences, and a 3D helmet". Built on Webflow, with WebGL for the 3D elements and Rive for motion. OFF+BRAND describes it as "a design system that balances McLaren's racing heritage with Lando's youthful, playful energy. Bold typography, vibrant accent colors, and immersive video content…" [Observation, SI]
- **Principle (oversized editorial type, one loud accent, real footage):** a single saturated accent, used with complete conviction against dark neutrals and carried by heavy display type, reads as performance and sport. [Interpretation]
- **Apply:**
  - Make blue WeBothPlay's equivalent of the lime: one saturated accent for the primary action and the "shared by everyone" state.
  - Use heavy, expanded Archivo for one or two brand moments per page.
  - Replace abstract art with real product footage (the repository already ships `public/panels/*.mp4`). [Interpretation]
- **Do NOT copy:** scroll-driven cinematic sequences that hold back content, 3D hero objects, lime green, motorsport kitsch, or the Webflow/Rive stack.

### R3 · Oryzo AI by Lusion (Technology / Product storytelling)
- **URLs:** https://www.awwwards.com/sites/oryzo-ai · SOTD post https://x.com/awwwards/status/2043600792184099160 (2026-04-13) · behind-the-scenes article https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations (announced 2026-04-21, https://x.com/lusionltd/status/2046585874926743563) · https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/
- **Award/date:** Awwwards SOTD 2026-04-13 and **Site of the Month, April 2026**. [Fact, SI]
- **What it is (reported):**
  - Awwwards: "A cinematic product story that turns an ordinary cork coaster into an immersive digital experience" (#storytelling #transitions #GSAP).
  - Lusion's behind-the-scenes post says the interface was kept "quiet while letting the content do the talking". About **99% of the type is set in a single family**. The **colour system uses four values** (cream, near-black, muted olive, orange).
  - One section transition deliberately breaks these rules with magazine typefaces, and illustration adds a handmade layer.
  - A **3D→2D transition** turns the 3D model into a working element of the flat UI. [Observation, SI]
- **Principle (restraint with one designated rule-break; continuity transitions):** [Interpretation]
- **Apply:**
  - One type system carries nearly all text, split by role rather than by mood.
  - A four-role palette: ink, near-white, blue and amber.
  - One designated rule-break (for example, the shareable "Squad Replay" card may use extreme widths or italics).
  - Continuity: the winning game's art morphs from the roulette reel into the "Tonight's pick" card through a same-document View Transition. [Interpretation]
- **Do NOT copy:** the satirical premise, cinematic 3D renders, the cream/olive palette, or GSAP-heavy scroll storytelling.

### R4 · Dropbox Brand by Daybreak Studio (Product / Editorial brand system)
- **URLs:** https://www.awwwards.com/sites/dropbox-brand · case study https://www.awwwards.com/case-study-dropbox-brand-guidelines.html (2025-05-07) · https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/ · https://creativebloq.com/design/dropboxs-new-brand-identity-website-puts-boring-style-guides-to-shame · https://dropbox.design/article/brand-guidelines-site · launched around January 2025 (https://designcompass.org/en/2025/01/21/dropbox-brand-website-renewal/)
- **Award/date:** Awwwards SOTD and later Site of the Month (2025; the month was not verified). **CSS Design Awards Website of the Year 2025** (score 9.03) and **Best UX Site**. [Fact, SI]
- **What it is (reported):**
  - Design and development ran in parallel, with "content and layout first to ensure accessibility and performance, while motion and interactivity were layered in once the structure was solid".
  - A **Variable Type Explorer** and an **Icon Slot Machine**.
  - Squash-and-stretch motion on menu tabs.
  - A colour transition "timed to match human eye dilation".
  - Built with Webflow + Rive. [Fact, SI (Awwwards case study, Creative Bloq)]
- **Principle (build order; playful tools with physical motion):** the site that won Best UX is also the most playful brand site on this list, which shows that craft and usability are not in tension. [Interpretation]
- **Apply:**
  - Build the retrofit in this order: IA → type → contrast → states → motion.
  - Treat the roulette as a crafted **slot machine** (anticipation, deceleration, small overshoot, settle) with a reduced-motion variant.
  - Give the segment/tab indicator a subtle squash-and-stretch. [Interpretation]
- **Do NOT copy:** the density of novelty widgets, the brand-guidelines information architecture, or custom-tuned animation on every element.

### R5 · Bruno's Portfolio by Bruno Simon (Web & Interactive)
- **URLs:** https://www.awwwards.com/sites/brunos-portfolio · https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/
- **Award/date:** Awwwards **Site of the Month, January 2026**, and a Developer Award (December 2025). CSS Design Awards WOTY 2025 finalist (8.84). [Fact, SI]
- **What it is:** you move around a 3D world by driving a vehicle with the arrow keys. [Fact, SI]
- **Principle (game controls as navigation; delight from physics):** [Interpretation]
- **Apply:** keyboard accelerators that are never required:
  - Space/Enter spins the roulette and R rerolls.
  - ←/→ steps through shared games and `/` focuses search.
  - Show keycap hints in mono. [Interpretation]
- **Do NOT copy:** 3D driving as navigation, or WebGL worlds.

### R6 · Where Worlds Take Shape by Jérôme Reynet (Games & Entertainment)
- **URLs:** https://www.awwwards.com/sites/where-worlds-take-shape · https://www.awwwards.com/inspiration/integrated-mini-games-where-worlds-take-shape · https://www.cssdesignawards.com/sites/where-worlds-take-shape/48947/
- **Award/date:** Awwwards SOTD 2026-05-03. [Fact, SI]
- **What it is:** a portfolio presented as a playable WebGL world, where projects are found through exploration and real-time play. Awwwards highlights its "Integrated Mini-Games". [Fact, SI]
- **Principle (mini-games built into the content):** [Interpretation]
- **Apply:** the roulette and "Backlog Slayer" live *inside* the results and run on the current filter set, not on a separate page or behind a modal. [Interpretation]
- **Do NOT copy:** making users explore to find core information.

### R7 · Ink Games by ToyFight (Games company)
- **URLs:** https://www.awwwards.com/sites/ink-games · https://toyfight.co/news/gold-run
- **Award/date:** Awwwards SOTD 2025-10-14. SOTD score 7.34 (Design 7.31, Usability 7.21, Creativity 7.6, Content 7.35). Developer Award 7.68, with **Animations/Transitions 8.60, Responsive 8.20, WPO 7.60, Accessibility 7.40**. [Fact, SI]
- **Principle (motion polish is expected; performance and accessibility set you apart):** jurors scored this games site highest on motion and lowest on performance and accessibility. [Interpretation]
- **Apply:** match award-level motion polish, but treat performance and accessibility budgets (§9) as hard gates. [Interpretation]
- **Do NOT copy:** I did not review the site's content. The lesson is about where it scored lowest, not about its visuals.

### R8 · Linear, 2026 UI refresh (premium utility)
- **URLs:** "A calmer interface for a product in motion" https://linear.app/now/behind-the-latest-design-refresh · changelog https://linear.app/changelog/2026-03-12-ui-refresh · LCH theme system: https://linear.app/now/how-we-redesigned-the-linear-ui
- **Date:** 2026-03-12 (changelog). [Fact, SI]
- **What it is (reported):**
  - Consistent headers, navigation and view controls.
  - **Navigation sidebars dimmed** "allowing the main content area to stand out".
  - Borders and separators softened.
  - Themes generated in **LCH** from three variables (base color, accent color, contrast), which Linear's redesign write-ups describe as perceptually uniform. [Fact, SI; the dates of the individual write-ups are mixed in the search extract]
- **Principle (hierarchy by dimming the chrome; perceptual color generation):** [Interpretation]
- **Apply:**
  - Dim the header and filter chrome (`--fg-muted`) so result cards carry the contrast.
  - Generate the ink surface ramp in OKLCH from three inputs. `oklch()` and `color-mix()` have been **Baseline widely available since 2025-11-09** (web-features `oklab`, `color-mix`). [Fact (support), GH; Interpretation (use)]
- **Do NOT copy:** monochrome austerity that removes the gaming energy, or project-management density.

### R9 · Raycast marketing site (premium utility; third-party analyses)
- **URLs:** https://www.webdesignhot.com/design.md/raycast/ · https://design.hagicode.com/designs/raycast/ (third-party design-system breakdowns; no dates shown)
- **What it is (reported):**
  - "Every page reads like an over-sized command palette".
  - A near-black `#07080a` canvas.
  - Inter at 600 for display type.
  - **JetBrains Mono shortcut chips** that "visually quote the product's keyboard-first ethos".
  - A red diagonal-stripe banner at the top of the hero (`#ff5757`→`#a1131a`). [Observation, third-party SI]
- **Principle (the product UI is the marketing language; keycaps):** [Interpretation]
- **Apply:**
  - The homepage "demo" is the real compare UI with real Steam art and real overlap counts, with no illustrative mockups.
  - Mono keycap chips for shortcuts and Steam IDs. [Interpretation]
- **Do NOT copy:** the red stripe banner, Inter-600-for-everything, or macOS-style glass chrome.

### R10 · Steam store redesign, 2025–2026 (plus Valve's hardware messaging)
- **URLs:**
  - Store: https://www.techloy.com/steam-is-testing-a-redesigned-storefront-for-easier-navigation-and-discoverability/ · https://macmyths.com/valves-redesigned-steam-store-what-changed-on-desktop-and-beyond/ · https://www.ubergizmo.com/2026/04/steam-beta-update/ · https://massivelyop.com/2026/06/05/steam-puts-out-a-refreshed-store-home-page-with-more-personalization-and-features/
  - Hardware: https://www.gameinformer.com/2025/11/12/valve-announces-console-like-steam-machine-steam-frame-vr-headset-and-new-steam · https://www.phoronix.com/news/Steam-Machines-Frame-2026
- **Dates:**
  - Store menu redesign in beta from **2025-07-25**.
  - Wider store pages (**940→1200 px**) in beta from **August 2025**.
  - Homepage overhaul shipped to all users on **2026-06-04**, after a beta that started **2026-04-01**. [Fact, SI]
- **What changed (reported):**
  - Browse, Recommendations, Categories and Search moved into a cleaner top navigation.
  - **Hover-triggered micro-trailers**, a personalized release calendar, higher-resolution artwork and a **1,200 px layout**.
  - Better **gamepad navigation** for Steam Deck and Big Picture. [Fact, SI]
  - Hardware (announced 12–13 November 2025; sources differ by time zone): the Steam Machine "lets you play your entire Steam Library… on a TV", and the Steam Frame lets you "play your entire Steam VR and non-VR catalog". [Fact, SI]
- **Principle (platform-native conventions; the library is the hero object):** [Interpretation]
- **Apply:**
  - Cap the results grid at 1200 px.
  - Move from 231×87 capsules to higher-resolution Steam art with consistent crops.
  - On pointer devices, hover shows a preview; on touch there is a tap equivalent.
  - Keep a focus order that works with keyboard and gamepad, for users on the Steam Deck browser. [Interpretation]
- **Do NOT copy:** merchandising rails, carousels, or Valve's visual identity and marks. WeBothPlay must not look affiliated with Valve.

### R11 · Steam Replay 2025 (Valve; data storytelling)
- **URLs:** https://insider-gaming.com/steam-wrapped-2025-steam-replay-release-date-stats/ · https://gamingonlinux.com/2025/12/steam-replay-is-live-and-notes-only-14-of-playtime-spent-by-all-steam-users-was-for-2025-releases
- **Date:** released 2025-12-16. [Fact, SI]
- **What it is (reported):**
  - Each player sees their most-played games, each game's percentage of playtime, launches, genres, longest streaks, demos played, achievements, and comparisons with others.
  - Across all users, **14% of playtime went to 2025 releases, 44% to games 1–7 years old and 40% to games 8 or more years old**. [Fact, SI]
- **Principle (personal data told as an editorial, shareable story):** [Interpretation]
- **Apply:**
  - A "Squad Replay" card with large tabular stats set in Archivo and facts about the shared library, sized for social images and video (§5.2 confirms the OFL allows this).
  - The 40% figure supports the value of the backlog finder. [Interpretation]
- **Do NOT copy:** Valve branding, or a year-end-only cadence.

### R12 · Discord desktop refresh (2025-03-25)
- **URLs:** https://discord.com/blog/discord-update-march-25-2025-changelog · https://tech.yahoo.com/general/article/discords-redesigned-pc-app-has-multiple-dark-modes-a-new-overlay-and-more-160019822.html · https://alternativeto.net/news/2025/3/discord-enhances-pc-gaming-with-revamped-game-overlay-and-refreshed-desktop-app
- **What changed (reported):**
  - Four themes (light, ash, dark and **onyx**, a true black for OLED).
  - **Three UI density options** (default, spacious, compact).
  - A resizable channel list.
  - An overlay rebuilt with movable widgets. [Fact, SI]
- **Principle (user-controlled density; a true-black option):** [Interpretation]
- **Apply:**
  - A compact list ↔ cover grid toggle, remembered per user.
  - Pure `#000` for the hero/OLED stage, with ink surfaces for cards. [Interpretation]
- **Do NOT copy:** blurple as a brand color. WeBothPlay uses `#5865F2` only for Discord actions.

### R13 · Marathon by Bungie, released 2026-03-05 (cautionary)
- **URLs:** https://fontsinuse.com/uses/67879/marathon-2026-video-game-1 · https://kotaku.com/marathon-ui-fontslop-menus-bungie-2000675332 · https://gamingbolt.com/dont-think-for-a-second-were-gonna-remove-the-sauce-says-marathon-ui-designer-about-its-look · https://www.space.com/entertainment/space-games/bungie-explains-marathons-graphic-retro-futurism-aesthetic-and-the-live-narrative-lessons-it-learned-from-destiny-interview
- **What it is (reported):**
  - A "graphic realism" art direction.
  - Fonts In Use lists KH Interference (display), a custom Shapiro Wide 65, IvyPresto Headline (in-game only) and Fraktion Mono (body). None of these is OFL.
  - Players criticized the result as **"fontslop"**: "20 different combinations of fonts, boldness levels, sizes, spacing, all caps vs regular caps, all on one menu page". Bungie's UI designer defended the look. [Fact, SI]
- **Principle (typographic worldbuilding has a cost):** variety serves a game's fiction, but in a utility, every extra type combination slows scanning. [Interpretation]
- **Apply:**
  - Two families plus one mono.
  - One role per style token.
  - At most about 6 type styles per screen.
  - Uppercase only for labels of 13 px or less and for display moments. [Interpretation]
- **Do NOT copy:** the four-family mix, or the commercial fonts.

### Secondary references (award verified via search listing; content not reviewed, so no principle is claimed)

| Site | Award / date | Source |
|---|---|---|
| The Tie-break (Merci Michel) | Awwwards SOTD 2026-09-25, score 7.28 | https://www.awwwards.com/sites/the-tie-break [Fact, SI] |
| Cdiscount – Jumping Max · XOX · Where Worlds Take Shape · Utopia Tokyo | Awwwards Games & Entertainment SOTDs: 2026-05-28 · 2026-05-10 · 2026-05-03 · 2026-03-29 | https://www.awwwards.com/websites/games-entertainment/ [Fact, SI] |
| SEPHORA PINBALL (Cosmic Shelter) · LilFrog (Deux Huit Huit) | Awwwards SOTD 2025-02-28 · 2025-02-11 | https://www.awwwards.com/websites/games-entertainment/?page=5 [Fact, SI] |
| Unseen Studio 2025 Wrapped | Awwwards SOTD (date not verified) | https://www.awwwards.com/sites/unseen-studio-2025-wrapped [Fact, SI] |
| Trevor Noah (OFF+BRAND) · Paul Kalkbrenner (HOLOGRAPHIK) | Awwwards SOTD 2026-09-05 · 2026-09-03 | https://www.awwwards.com/inspiration_search/sites_of_the_day/ [Fact, SI] |
| Night Drive Racing Game (Anderson Mancini dos Santos) | FWA of the Day 2026-10-03, 88 points | https://thefwa.com/cases/night-drive-racing-game [Fact, SI] |
| Awwwards Sites of the Month 2026 | Jan Bruno's Portfolio · Feb The Renaissance Edition · Mar GQ & AP The Extraordinary Lab · Apr Oryzo AI · May Floema · Jun Son Daven · Jul Lama Lama | https://www.awwwards.com/websites/sites_of_the_month/ [Fact, SI] |
| CSSDA WOTY 2025 finalists | The Symphony of Vines (Unseen Studio) 8.88 · Charles Leclerc (Apart & Uprising) 8.85 · The Monolith Project 8.85 · Bruno's Portfolio 8.84 | https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/ [Fact, SI] |

**Pattern across the honors** [Interpretation]: in 2025–2026, Games & Entertainment awards lean heavily toward **playable WebGL toys**: Messenger, Bruno's Portfolio, Where Worlds Take Shape, Jumping Max, Sephora Pinball and Night Drive. WeBothPlay should borrow their *vocabulary of play* for one moment (the roulette) and their care for feedback. It should not borrow their technology or their navigation.

---

## 4. Synthesized principles for WeBothPlay

Principles P1–P8 are the core set; P9 and P10 support them.

| # | Principle | Concretely | Evidence | Check |
|---|---|---|---|---|
| **P1** | **The tool is the hero.** | The paste-profiles input and the Compare CTA are the first interactive elements after the logo, visible without scrolling at 390×844 and 1440×900. Marketing below the fold shows real product output. | R9, R10; §2.1 (the tool already follows the h1) | Measure it in the viewport. Make the CTA the first item in tab order. |
| **P2** | **Editorial type by role, not by effect.** | Expanded Archivo for 1–2 brand moments per page, condensed uppercase Archivo labels for gaming metadata, Inter for reading. No extralight weights and no gradient text. At most ~6 styles per screen. | R2, R3 (~99% of text in one family), R13 (fontslop) | Lint for weights below 400 and for `bg-clip-text` on headings. |
| **P3** | **Four color roles, enforced.** | Ink = surfaces. Near-white = text. Blue = action, selection and focus. Amber = Premium only. Blurple = Discord only. The minimum text color is `#8C939E`. | R3 (four-value system), R8 (three-variable LCH), §7 contrast audit | Run an automated contrast check on the tokens. |
| **P4** | **Depth through tone, not glass.** | Opaque tonal elevation and hairlines. One translucent sticky header at most. No orbs or cubes. Optional static grain on the hero only. | R8 (softened borders); the brief; §2.1 (×43 blur) | Allow at most one `backdrop-filter` and zero ambient animations. |
| **P5** | **One signature moment; everything else is feedback.** | The roulette works like a slot machine and hands off to "Tonight's pick" through a View Transition. Feedback takes ≤150 ms and transitions ≤300 ms. Motion is added last. | R4 (build order, slot machine), R3 (continuity), R7 (scores) | Audit the motion inventory. Every animation needs a stated job. |
| **P6** | **A card system that feels native to Steam.** | Higher-resolution Steam art with consistent crops, a 1200 px results width, ownership/stat chips with tabular figures, and hover previews with touch equivalents. Never imply Valve affiliation. | R10, R11 | Art boxes use `aspect-ratio`. Zero CLS from images. |
| **P7** | **Controlled density the user can tune.** | A compact list ↔ cover grid toggle. Dimmed chrome. Sticky compact filters. Long lists virtualized or `content-visibility:auto` (Baseline since 2025-09-15). | R12, R8; web-features | Measure INP on a library with 2,000+ games. |
| **P8** | **Social presence and shareable stats.** | Friends appear as participants (avatars, per-friend status, "4/4"). A "Squad Replay" card is designed for social images and video. | R1, R11; §5.2 (OFL allows video and graphics) | Check share-card legibility at 1080×1350. |
| P9 | Content-first build order. | IA → type → contrast → states → motion. | R4 | Each PR states which layer it touches. |
| P10 | Performance and accessibility are design constraints. | The budgets in §9 and WCAG 2.2 AA are gates, not polish. | R7; web-vitals; WCAG | CI uses Lighthouse plus field data (CrUX or Vercel Speed Insights). |

---

## 5. Typography research

### 5.1 Requirements → measurable criteria

| Requirement | Measured by |
|---|---|
| Personality for brand moments | Visual renders (MEAS); width and optical-size axes for expressive range |
| UI legibility on dark backgrounds, desktop and mobile | x-height/cap ratio, figure and letter disambiguation (0/O, 1/l/I), renders at 14–17 px |
| Strong tabular figures for stats | OpenType `tnum` (or figures tabular by default), checked in the font binary |
| Good uppercase for gaming labels | OpenType `case` (case-sensitive forms), condensed widths |
| Variable where useful | `fvar` axes; Latin WOFF2 size (MEAS) |
| License for web plus social video/images | OFL text and OFL-FAQ; Reserved Font Names (RFN) audit |
| `next/font/google` availability | Present in the installed Next 16.1.6 `font-data.json` |

### 5.2 License verification (OFL)

- **The OFL 1.1 grants** permission "to use, study, copy, merge, embed, modify, redistribute, and sell modified and unmodified copies of the Font Software". The conditions are:
  1. The font cannot be "sold by itself".
  2. Bundled copies must keep the copyright notice and the license.
  3. A Modified Version may not use a Reserved Font Name.
  4. Author names may not be used to promote derivatives.
  5. Derivatives stay under the OFL.
  - "The requirement for fonts to remain under this license does not apply to any document created using the Font Software."
  - Evidence: OFL.txt · https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/OFL.txt · fetched 2026-10-03 · exact clauses · defines what web and video use is allowed · **[Fact, GH]**
- **Video and social graphics are explicitly allowed.** OFL-FAQ 1.1: "You are very welcome to do so… for any kind of design work. No additional license or permission is required… examples… logos, posters… **video titling**…" OFL-FAQ 1.13: "creating any kind of graphic using a font under the OFL does not make the resulting artwork subject to the OFL."
  - Evidence: SIL OFL-FAQ v1.1-update7 (Nov 2023) · https://raw.githubusercontent.com/silnrsi/font-charis/master/OFL-FAQ.txt (canonical: https://openfontlicense.org/ofl-faq) · settles social video and image use for every OFL candidate · **[Fact, GH]**
- **Webfonts are allowed.** OFL-FAQ 2.1: "loading the fonts dynamically as webfonts through CSS @font-face declarations is… explicitly allowed by the licensing model because it is distribution." · **[Fact, GH]**
- **Subsetting counts as modification.** OFL-FAQ 2.6: "Removing any parts of the font when delivering a webfont… is considered modification. This is permitted by the OFL but would not normally allow the use of RFNs." This matters only for families that have an RFN. · **[Fact, GH]**
- **RFN audit (from each family's `OFL.txt`):**
  - **Mona Sans** (RFN "Mona"), **Hubot Sans** ("Hubot") and **IBM Plex Mono** ("Plex") carry RFNs.
  - None of the other candidates do, including Archivo, Inter, JetBrains Mono, Bricolage Grotesque, Geist/Geist Mono and Martian Mono. · **[Fact, GH]**
  - So: prefer families without an RFN for a self-hosted, subset build, which removes any ambiguity. If you choose an RFN family, serve the unmodified Google-served files and do not re-subset or convert them yourself. · **[Interpretation]**
- **How `next/font/google` works:**
  - It downloads the CSS and font files **at build time** and self-hosts them (`fetch-css-from-google-fonts.js`, `fetch-font-file.js`).
  - `axes` is accepted only when `weight` is omitted or set to `"variable"` (`validate-google-font-function-call.js` L81–86).
  - `display` defaults to `'swap'` and `adjustFontFallback` defaults to `true` (L12).
  - Evidence: Next.js 16.1.6 · `node_modules/next/dist/compiled/@next/font/dist/google/` · **[Fact, PKG]**
- **Fontshare (Clash Display, General Sans, Satoshi):**
  - The ITF Free Font License text could **not** be retrieved (fontshare.com is blocked), so its terms for web, video and repository redistribution are **unverified**.
  - These families are **not available** through `next/font/google`: they are absent from Next 16.1.6 `font-data.json` [Fact, PKG], so they would need `next/font/local`.
  - Recommendation: exclude them until someone has read the license text. [Interpretation]
- **Compliance checklist** [Interpretation]:
  - Keep each family's `OFL.txt` in the repository (e.g. `docs/retrofit/licenses/` or next to any `.ttf` used in video templates).
  - Never sell or offer the font files themselves for download.
  - Do not rename-and-modify an RFN family.
- **Vendor commitments** (upstream READMEs): JetBrains Mono "can be used free of charge, for both commercial and non-commercial purposes. You do not need to give credit". Mona Sans: "licensed under the SIL Open Font License v1.1". · **[Fact, GH]**

### 5.3 Candidate matrix (every family from the brief, verified)

`tnum`, `case` and `zero` are OpenType features found in the Google Fonts binary (MEAS). x/cap is the OS/2 x-height divided by cap height. "Latin WOFF2" is a full-axis Latin subset I built with fontTools (all layout features kept). It approximates Google's subsets; it is not their exact size.

| Family (`next/font` import) | Axes in the Google build | tnum | case | zero | x/cap | Latin WOFF2 | RFN | Verdict |
|---|---|---|---|---|---|---|---|---|
| **Archivo** (`Archivo`) | wdth 62–125, wght 100–900, + italic | ✓ | ✓ | ✓ | 0.77 | **~93 KB** | none | **★ Display + labels** |
| **Inter** (`Inter`) | opsz 14–32, wght 100–900, + italic | ✓ | ✓ | ✓ (+`ss02` "Disambiguation") | 0.75 | ~103 KB (~74 KB at wght 400–700) | none | **★ UI + body** |
| **JetBrains Mono** (`JetBrains_Mono`) | wght 100–800, + italic | mono (tabular by default) | ✓ | ✓ | 0.75 | **~40 KB** | none | **★ Data mono** |
| Bricolage Grotesque (`Bricolage_Grotesque`) | opsz 12–96, wdth 75–100, wght 200–800 | ✓ | ✓ | – | 0.80 | ~151 KB | none | Pairing B display |
| Geist (`Geist`) | wght 100–900 | ✓ | ✓ | – | 0.75 | ~32 KB | none | Pairing B UI |
| Geist Mono (`Geist_Mono`) | wght 100–900 | mono | ✓ | slashed by default (`ss09` removes the slash) | 0.75 | ~34 KB | none | Pairing B mono |
| Hubot Sans (`Hubot_Sans`) | wdth 75–125, wght 200–900, + italic | ✓ | ✓ | – | 0.71 | ~117 KB | **"Hubot"** | Pairing C display |
| Mona Sans (`Mona_Sans`) | wdth 75–125, wght 200–900, + italic (the upstream repo also documents `opsz` 1–100; not in the Google build) | ✓ | ✓ | `ss08` straight-bar zero | 0.71 | ~121 KB | **"Mona"** | Pairing C UI |
| Martian Mono (`Martian_Mono`) | wdth 75–112.5, wght 100–800 | mono | ✓ | slashed by default (seen in render) | 0.75 | ~38 KB | none | Pairing C mono |
| Pathway Extreme (`Pathway_Extreme`) | opsz 8–144, wdth 75–100, wght 100–900, + italic | ✓ | ✓ | – | 0.77 | ~106 KB | none | Strong alternative condensed display |
| Space Grotesk | wght 300–700 | ✓ | ✓ | ✓ | 0.69 | – | none | ✗ Strongly linked to 2020–23 startup sites [Interpretation] |
| Familjen Grotesk | wght 400–700, + italic | tabular by default | ✓ | ✓ | 0.77 | – | none | ✗ Narrow weight range |
| Unbounded | wght 200–900 | ✓ | ✓ | – | 0.75 | – | none | ✗ Wide-rounded "web3" read [Interpretation]; full TTF is 778 KB |
| Big Shoulders (`Big_Shoulders`; replaces "Big Shoulders Display", added 2025-02-06) | opsz 10–72, wght 100–900 | **✗** | ✓ | – | 0.75 | ~78 KB | none | ✗ for UI or stats (no tabular figures). Acceptable for video posters only |
| Anton | static 400 | **✗** | ✓ | ✓ | 0.85 | – | none | ✗ Single weight, no tabular figures |
| Oswald | wght 200–700 | **✗** | ✓ | – | 0.71 | – | none | ✗ No tabular figures |
| Barlow Condensed | static 100–900, + italic | ✓ | **✗** | ✗ | 0.73 | – | none | ✗ Static, no `case` |
| Syne | wght 400–800 | ✓ | ✓ | – | 0.77 | – | none | ✗ Art-school quirk; figures look uneven [Observation] |
| Instrument Sans | wdth 75–100, wght 400–700, + italic | ✓ | ✓ | – | 0.71 | – | none | ~ Tight spacing at text sizes [Observation] |
| Instrument Serif | static 400, + italic | **✗** | ✓ | – | 0.71 | – | none | ✗ The 2024–25 "editorial serif" SaaS trope [Interpretation] |
| Fraunces | SOFT, WONK, opsz 9–144, wght 100–900 | **✗** | ✓ | – | 0.69 | – | none | ✗ Soft serif, no tabular figures |
| Schibsted Grotesk | wght 400–900, + italic | ✓ | ✓ | ✓ | 0.75 | – | none | ~ Solid; its tabular punctuation looks gappy inline [Observation] |
| IBM Plex Mono | static 100–700, + italic | mono | ✗ | ✓ | 0.74 | – | **"Plex"** | ~ RFN, static |
| Chakra Petch | static 300–700, + italic | **✗** | **✗** | ✗ | 0.71 | – | none | ✗ Sci-fi cliché |
| Rajdhani | static 300–700 | **✗** | **✗** | ✗ | 0.79 | – | none | ✗ Weakest feature set |
| Sora · Manrope · Onest | variable wght | ✓ | ✓ | – | 0.73–0.75 | – | none | ~ Competent but generic |
| Hanken Grotesk | wght 100–900, + italic | tabular by default (no `pnum`) | ✓ | – | 0.71 | ~36 KB | none | ~ A good, warmer alternative UI face |
| Saira · Tektur | wdth + wght | ✓ | Saira ✓ / Tektur ✗ | ✓ | 0.74 / 0.80 | – | none | ✗ Racing/sci-fi clichés at the extremes [Interpretation] |
| Clash Display / General Sans / Satoshi (Fontshare) | not in `next/font/google` | – | – | – | – | – | license unverified | ✗ for now (§5.2) |

Evidence for the matrix: google/fonts METADATA.pb and OFL.txt (https://github.com/google/fonts/tree/main/ofl), fetched 2026-10-03, for license, designer, axes and date added. Font binaries were inspected with fontTools for features and metrics. Next 16.1.6 `font-data.json` confirms the import names and axes. · **[Fact, GH, PKG, MEAS]**

Language coverage, which matters because Steam persona names are user-generated and global:
- Inter's `next/font` subsets include **cyrillic, cyrillic-ext, greek, greek-ext, latin, latin-ext and vietnamese**.
- Archivo, Mona Sans and Bricolage cover only latin, latin-ext and vietnamese. **[Fact, PKG]**
- So persona names and game titles must be set in the UI face (Inter), never in the display face. **[Interpretation]**

### 5.4 Visual evaluation (my renders on `#050608`, white/blue/amber; Pillow + libraqm, which is not browser rasterization)

- **Archivo, wdth 125, wght 800:** a wide, rugged grotesque with sports-broadcast energy. At wdth 75 and wght 600, uppercase labels are crisp. Its tabular figures are clean. **[Observation, MEAS]**
- **Bricolage, opsz 96, wdth 75, wght 800:** compressed and poster-like with a strong editorial quirk. The upstream README describes the compressed weights as leaning toward "the anxious and wonky tones of Grotesque Nº9" and the small sizes as "more neutral… exaggerated ink traps" (https://github.com/ateliertriay/bricolage). **[Observation, MEAS; Fact, GH quote]**
- **Mona Sans and Hubot Sans at wdth 125:** polished and wide. Hubot's forms are more technical. Mona's default single-storey "a" reads quirky at 14 px. **[Observation, MEAS]**
- **Big Shoulders, Oswald, Anton:** strong posters, but their figures are proportional, so animated counters would jitter. **[Fact (no `tnum`), MEAS]**
- **Tektur and Saira at the extremes:** "sci-fi/racing game" clichés. Condensed Tektur labels at 15 px were hard to read. **[Observation, MEAS]**
- **UI faces at 14–17 px:** Inter is the most neutral and legible. Geist and Onest are close. Hanken looks smaller because of its x-height (0.493 em). Archivo at wdth 100 runs tight for long paragraphs. **[Observation, MEAS]**
- **Disambiguation:**
  - Archivo, Inter and Geist all draw "l" and "I" identically by default.
  - Inter offers `ss02` (Disambiguation), `cv05` (l with tail) and `cv08` (I with serif).
  - Mona offers `ss03` and `ss04` (l variants).
  - Geist Mono and Martian Mono draw a slashed zero by default.
  - Steam IDs and vanity names should therefore use the mono or Inter's disambiguation features. **[Fact (feature names), MEAS; Interpretation]**

### 5.5 Pairings

**Pairing A, "Broadcast editorial" (recommended winner)**
- **Display and labels:** **Archivo**.
  - Brand moments: `font-stretch` 112.5% on mobile → 125% from 768 px, `wght` 800–850.
  - Headings: 100–112.5%, `wght` 700–800.
  - Labels: 87.5%, `wght` 600–700, uppercase with `case`.
  - Stats: 100–112.5%, `wght` 800, `tabular-nums`.
- **UI and body:** **Inter**. Optical size automatic. 400 for body, 500 for UI, 600 for emphasis. `tabular-nums` in tables. `ss02` (disambiguation) for persona names and IDs.
- **Data:** **JetBrains Mono** at 500 with `slashed-zero` for Steam IDs, share codes and shortcuts.
- **Why it wins:**
  1. One ~93 KB Archivo file provides both an *expanded* editorial voice and *condensed* gaming labels. Its `tnum`, `case`, `zero` and `frac` features are verified. [Fact, MEAS]
  2. Inter has the strongest small-size feature set (`opsz` 14–32, `ss02`, `cv05`, `cv08`, `tnum`, `zero`) and the broadest script coverage. [Fact, MEAS/PKG]
  3. **No RFNs** in any of the three families. [Fact, GH]
  4. The lowest critical font weight of the three pairings (~196 KB). [Fact, MEAS]
  5. Inter already fits the codebase. The brief's "Inter everywhere" problem is solved by taking Inter *out of brand moments*, banning extralight weights and giving the identity to Archivo. [Interpretation]
- **Risk:** Inter is ubiquitous [Interpretation]. Mitigate it by giving every brand surface (hero, section openers, stats, labels, CTAs, share cards) to Archivo.

**Pairing B, "Editorial indie": Bricolage Grotesque + Geist + Geist Mono**
- Display: Bricolage at opsz 96, wdth 75–90, wght 700–800. UI: Geist 400–600. Mono: Geist Mono, slashed zero by default.
- Pros: the most magazine-like voice. The `opsz` axis spans labels (12) through posters (96). Geist and Geist Mono are coherent together. The UI face is the smallest payload (~32 KB).
- Cons: the heaviest display file (~151 KB). Bricolage has no `zero`. Geist reads as Vercel/dev-tool [Interpretation]. Geist subsets have no Greek or Vietnamese [Fact, PKG].

**Pairing C, "Technical wide superfamily": Hubot Sans + Mona Sans + Martian Mono**
- Display and labels: Hubot Sans at wdth 75–125. UI: Mona Sans at wdth 100 (use `ss05` double-storey a for small sizes). Mono: Martian Mono at wdth 87.5–100.
- Pros: width axes that match across the family, excellent wide display type, strong uppercase.
- Cons: **RFNs "Mona" and "Hubot"** (§5.2). Strong association with GitHub's brand: GitHub created Mona Sans with Degarism (repo README) [Fact, GH]. The Google build omits the upstream `opsz` axis [Fact, GH/PKG]. About 120 KB per family [Fact, MEAS].

Alternates inside Pairing A [Interpretation]:
- If the team prefers a condensed, athletic display voice over an expanded broadcast voice, swap Archivo for **Pathway Extreme** (opsz 8–144, wdth 75–100, `tnum` and `case` verified, ~106 KB).
- **Big Shoulders** is acceptable for video posters only.

### 5.6 Recommended system: implementation sketch

```js
// src/app/fonts.js (sketch; not applied by this research)
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";

export const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],            // weight omitted, so variable wght 100–900 + wdth 62–125
  variable: "--font-display",
  display: "swap",
});
export const sans = Inter({
  subsets: ["latin"],        // add "latin-ext"/"cyrillic"/"greek" if analytics justify preloading them
  axes: ["opsz"],            // optical size 14–32
  variable: "--font-sans",
  display: "swap",
});
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,            // keep it off the critical path
});
```

| Role | Family and settings | Size token (§6) | Notes |
|---|---|---|---|
| Brand display (hero, section openers, share-card titles) | Archivo · `font-stretch` 112.5% → 125% at ≥48rem · 800 | `step-5`/`step-6` | Sentence case −0.02em, uppercase −0.01em; `text-wrap: balance` |
| Headings H2–H4 | Archivo · 100–112.5% · 700–800 | `step-1`…`step-3` | |
| Scoreboard stats | Archivo · 100% → 112.5% · 800 · `tabular-nums lining-nums` | `stat` | Line-height 0.9 |
| Labels, tags, nav, table headers, CTAs | Archivo · 87.5% (labels) / 100% (CTA) · 600–700 · uppercase · `case` | `label`/`ui` | Tracking +0.06–0.08em |
| Body, inputs, tooltips, game titles, persona names | Inter · 400/500/600 · optical size auto | `body`/`ui`/`caption` | `tabular-nums` in tables; never below 400 |
| IDs, codes, keycaps | JetBrains Mono · 500 · `slashed-zero` | 13–15 px fixed | Small doses |

Global rules [Interpretation]:
- Set `font-synthesis: none`.
- Prefer high-level properties (`font-weight`, `font-stretch`, `font-optical-sizing`) over `font-variation-settings`. All three are Baseline widely available [Fact, GH web-features].
- Tailwind 3.4.18 has **no** `font-stretch` utility [Fact, PKG], so use `[font-stretch:125%]` or a small plugin.

### 5.7 Note on the work-in-progress pairing in the working tree (Bricolage + Mona Sans + JetBrains Mono)

| Criterion | WIP: Bricolage + Mona + JetBrains | Recommended: Archivo + Inter + JetBrains |
|---|---|---|
| Critical font weight (display + UI, Latin WOFF2, measured) | ~151 + ~121 = **~272 KB** | ~93 + ~103 = **~196 KB** |
| RFN | Mona Sans has RFN "Mona" | none |
| UI-face scripts (persona names) | latin, latin-ext, vietnamese | + cyrillic, greek |
| Wide display moments | Mona at wdth 125 (Bricolage tops out at 100) | Archivo up to wdth 125 |
| Personality | Editorial and indie | Broadcast and editorial |

Verdict [Interpretation]: the WIP pairing is credible and characterful. Pairing A wins on payload, licensing clarity and script coverage. If the team keeps the WIP:
1. Fix the primary button contrast (§2.2).
2. Remove the Inter-only `cv11`, and decide deliberately on Mona's `ss01` (square dots) and `ss05` (double-storey a).
3. Set persona names in a face with Cyrillic and Greek coverage, or accept system fallback.
4. Serve unmodified Mona files (RFN).
5. Raise `.label` to at least 12 px.

---

## 6. Fluid type scale proposal

### 6.1 Parameters
- Viewport range 320 → 1440 px, root 16 px, base step 16 → 18 px. Modular ratio **1.2 at 320 px → 1.333 at 1440 px**: tighter on phones, more editorial contrast on desktop. **[Interpretation]**
- Formula: `clamp(MIN_rem, (MIN − slope·320)_rem + slope·100vw, MAX_rem)`, where `slope = (MAX − MIN)/(1440 − 320)`. The values were computed in this session. **[Fact, MEAS (arithmetic)]**
- Keep the min and max in `rem` so the user's font-size setting and zoom still scale text (SC 1.4.4). Keep max/min at or below about 2.5×; the largest ratio here is 2.20. The 2.5× figure is a widely cited heuristic that I could not re-verify in this session, so test at 200% zoom. **[Interpretation]**
- Use **fixed** sizes inside dense app UI (tables, filter bars, chips: 12/13/14/15/16 px) so data density stays stable. Use the fluid scale for editorial and marketing headings, leads and stats. **[Interpretation]**

### 6.2 Tokens

| Token | px @320 → @1440 | `clamp()` | Family / setting | Line-height | Tracking |
|---|---|---|---|---|---|
| `label` | 12 → 13 | `clamp(0.75rem, 0.7321rem + 0.0893vw, 0.8125rem)` | Archivo 87.5% · 600 · UPPER · `case` | 1.2 | +0.08em → +0.06em |
| `caption` | 13 → 14 | `clamp(0.8125rem, 0.7946rem + 0.0893vw, 0.875rem)` | Inter 400/500 | 1.4 | 0 |
| `ui` | 15 → 16 | `clamp(0.9375rem, 0.9196rem + 0.0893vw, 1rem)` | Inter 500 (CTA: Archivo 700 UPPER) | 1.25 | 0 (CTA +0.04em) |
| `body` | 16 → 18 | `clamp(1rem, 0.9643rem + 0.1786vw, 1.125rem)` | Inter 400 | 1.6 → 1.55 | 0 |
| `lead` | 18 → 22 | `clamp(1.125rem, 1.0536rem + 0.3571vw, 1.375rem)` | Inter 400 | 1.45 | −0.005em |
| `step-1` (H4) | 19.2 → 24 | `clamp(1.2rem, 1.1143rem + 0.4286vw, 1.5rem)` | Archivo 100% · 700 | 1.2 | −0.005em |
| `step-2` (H3) | 23.04 → 32 | `clamp(1.44rem, 1.28rem + 0.8vw, 2rem)` | Archivo 100% · 700 | 1.15 | −0.01em |
| `step-3` (H2) | 27.65 → 42.67 | `clamp(1.7281rem, 1.4599rem + 1.3411vw, 2.6669rem)` | Archivo 112.5% · 800 | 1.05 | −0.015em |
| `step-4` (H1) | 33.18 → 56.89 | `clamp(2.0737rem, 1.6504rem + 2.117vw, 3.5556rem)` | Archivo 112.5% · 800 | 1.0 | −0.02em |
| `step-5` (display) | 39.81 → 75.85 | `clamp(2.4881rem, 1.8446rem + 3.2179vw, 4.7406rem)` | Archivo 112.5% → 125% · 800 | 0.95 | −0.02em (UPPER −0.01em) |
| `step-6` (mega, brand only) | 47.78 → 101.13 | `clamp(2.9863rem, 2.0336rem + 4.7634vw, 6.3206rem)` | Archivo 125% · 850 | 0.9 | −0.025em (UPPER −0.01em) |
| `stat` | 40 → 88 | `clamp(2.5rem, 1.6429rem + 4.2857vw, 5.5rem)` | Archivo 100% → 112.5% · 800 · `tabular-nums` | 0.9 | −0.02em |
| inputs | 16 fixed | `1rem` | Inter 400/500 | 1.25 | 0 |

Inputs stay at 16 px on mobile because iOS Safari zooms into inputs set below 16 px. This is widely documented platform behavior that I did not re-verify in this session. **[Observation]**

### 6.3 Using the width axis responsively (measured)

Advance width of each string in em (Archivo, MEAS):

| Setting | "WE BOTH PLAY" | "WHAT WE ALL OWN" | "37 games in common" |
|---|---|---|---|
| wdth 125 · 800 | 9.76 | 12.45 | 13.11 |
| wdth 112.5 · 800 | 8.72 | 11.12 | 11.76 |
| wdth 100 · 800 | 7.76 | 9.90 | 10.50 |
| wdth 87.5 · 700 | 6.68 | 8.57 | 8.93 |
| wdth 75 · 600 | 5.80 | 7.46 | 7.71 |

- At 320 px with 16 px gutters (288 px measure), "WE BOTH PLAY" fits on **one line only at ≤29.5 px with wdth 125**, ≤37 px with wdth 100, or ≤43 px with wdth 87.5. **[Fact, MEAS]**
- So on mobile, step the width down to 100–112.5% and let display lines wrap to two lines with `text-wrap: balance` (Baseline since 2024-05-13) [Fact, GH]. Switch to 125% from 48rem. `font-stretch` cannot be fluid with `vw` (it accepts only a percentage), so use breakpoints or container queries. Container queries have been Baseline widely available since 2025-08-14. **[Fact (support), GH; Interpretation]**
- At 1440 px, `step-6` (101 px) × 9.76 em ≈ 987 px, which fits a 1200 px container. **[Fact, MEAS]**

### 6.4 Uppercase labels and tracking
- Uppercase labels are **at least 12 px** with **+0.06–0.08em** tracking. Smaller and more condensed text needs more tracking. Do not exceed about 0.1em: wide tracking breaks words apart into letters. **[Interpretation; MEAS renders]**
- Always set `font-feature-settings: "case" 1` on uppercase text so hyphens, brackets and the "·" separator sit at cap height. Archivo, Inter and JetBrains Mono all have `case`. **[Fact, MEAS]**
- Expanded uppercase display needs **no** positive tracking: the width axis already supplies the air. Use 0 to −0.01em. **[Interpretation]**
- Do not uppercase user-generated text (game titles, persona names). Uppercase is for system labels only. **[Interpretation]**

### 6.5 Numerals
- Use `font-variant-numeric: tabular-nums` (Tailwind `tabular-nums`) on every counter, table column, timer, roulette readout and animated count-up. This stops numbers jittering as they change. `font-variant-numeric` is Baseline widely available. **[Fact (support), GH; Interpretation]**
- Use `slashed-zero` (maps to `zero`) for Steam IDs and share codes. Use `proportional-nums` in running prose. **[Interpretation]**
- Families **without** `tnum` (Big Shoulders, Oswald, Anton, Chakra Petch, Rajdhani, Fraunces, Instrument Serif) must never carry stats. **[Fact, MEAS]**

### 6.6 CSS and Tailwind 3 sketch

```css
:root {
  --step-label: clamp(0.75rem, 0.7321rem + 0.0893vw, 0.8125rem);
  --step-caption: clamp(0.8125rem, 0.7946rem + 0.0893vw, 0.875rem);
  --step-ui: clamp(0.9375rem, 0.9196rem + 0.0893vw, 1rem);
  --step-0: clamp(1rem, 0.9643rem + 0.1786vw, 1.125rem);
  --step-lead: clamp(1.125rem, 1.0536rem + 0.3571vw, 1.375rem);
  --step-1: clamp(1.2rem, 1.1143rem + 0.4286vw, 1.5rem);
  --step-2: clamp(1.44rem, 1.28rem + 0.8vw, 2rem);
  --step-3: clamp(1.7281rem, 1.4599rem + 1.3411vw, 2.6669rem);
  --step-4: clamp(2.0737rem, 1.6504rem + 2.117vw, 3.5556rem);
  --step-5: clamp(2.4881rem, 1.8446rem + 3.2179vw, 4.7406rem);
  --step-6: clamp(2.9863rem, 2.0336rem + 4.7634vw, 6.3206rem);
  --step-stat: clamp(2.5rem, 1.6429rem + 4.2857vw, 5.5rem);
}
.t-display { font-family: var(--font-display); font-size: var(--step-5); font-weight: 800;
  font-stretch: 112.5%; line-height: .95; letter-spacing: -0.02em; text-wrap: balance; }
@media (min-width: 48rem) { .t-display { font-stretch: 125%; } }
.t-label { font-family: var(--font-display); font-size: var(--step-label); font-weight: 600;
  font-stretch: 87.5%; text-transform: uppercase; letter-spacing: .08em; font-feature-settings: "case" 1; }
.t-stat { font-family: var(--font-display); font-size: var(--step-stat); font-weight: 800;
  font-variant-numeric: tabular-nums lining-nums; line-height: .9; letter-spacing: -0.02em; }
.t-data { font-family: var(--font-mono); font-variant-numeric: slashed-zero tabular-nums; }
```

```js
// tailwind.config.js (excerpt). Tailwind 3.4: fontSize accepts [size, { lineHeight, letterSpacing }]
fontFamily: { display: ["var(--font-display)"], sans: ["var(--font-sans)"], mono: ["var(--font-mono)"] },
fontSize: {
  label: ["var(--step-label)", { lineHeight: "1.2", letterSpacing: "0.08em" }],
  body: ["var(--step-0)", { lineHeight: "1.6" }],
  h2: ["var(--step-3)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
  display: ["var(--step-5)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
  stat: ["var(--step-stat)", { lineHeight: "0.9", letterSpacing: "-0.02em" }],
},
```

---

## 7. Color and surface guidance (keeping black, blue and amber)

### 7.1 Contrast audit of the current palette (WCAG 2 relative luminance, computed)

| Foreground \ Background | #000000 | #0B0C0E | #14161A | #1C1F24 | #292B2D (old gradient end) |
|---|---|---|---|---|---|
| gray-400 #9CA3AF | 8.27 | 7.71 | 7.13 | 6.51 | 5.60 |
| **gray-500 #6B7280** | **4.34 ✗** | **4.05 ✗** | **3.75 ✗** | **3.42 ✗** | **2.94 ✗** |
| **gray-600 #4B5563** | **2.78 ✗** | 2.59 ✗ | 2.40 ✗ | 2.19 ✗ | 1.88 ✗ |
| blue-400 #60A5FA | 8.26 | 7.70 | 7.12 | 6.50 | 5.59 |
| blue-500 #3B82F6 | 5.71 | 5.32 | 4.92 | 4.49 ✗ | 3.86 ✗ |
| **blue-600 #2563EB** (as text) | **4.06 ✗** | 3.79 ✗ | 3.50 ✗ | 3.20 ✗ | 2.75 ✗ |
| amber-400 #FBBF24 | 12.58 | 11.72 | 10.85 | 9.90 | 8.51 |
| amber-500 #F59E0B | 9.78 | 9.11 | 8.43 | 7.69 | 6.62 |
| Discord #5865F2 (as text) | 4.56 | 4.25 ✗ | 3.93 ✗ | 3.59 ✗ | 3.08 ✗ |

Button fills:

| Combination | Ratio |
|---|---|
| White on blue-600 | 5.17 ✓ |
| **White on blue-500** | **3.68 ✗** (passes only as large text) |
| Black on blue-400 | 8.26 ✓ |
| Black on amber-400 | 12.58 ✓ |
| **White on amber-500** | **2.15 ✗** |
| White on Discord | 4.61 ✓ |

- Evidence: computed in this session using the WCAG 2.x formula · **[Fact, MEAS]**. Thresholds are 4.5:1 for text and 3:1 for large text and UI components (§9.3).
- **Why it matters:** the codebase uses `text-gray-500` 80 times and `text-gray-600` 14 times (§2.1), so many of those uses are AA failures. **[Fact, CODE; Interpretation]**

### 7.2 Proposed tokens (contrast against the proposed surfaces, computed)

| Token | Value | Role | vs #0B0C0E | vs #14161A | vs #24282E |
|---|---|---|---|---|---|
| `--ink-0` | #000000 | Hero/OLED stage (brand black) | – | – | – |
| `--ink-950` | #0B0C0E | Page base | – | – | – |
| `--ink-900` | #14161A | Cards | – | – | – |
| `--ink-800` | #1C1F24 | Raised/hover | – | – | – |
| `--ink-700` | #24282E | Pressed/selected surface | – | – | – |
| `--steel` | #292B2D | The old gradient end, kept for 1 px top highlights and section bands | – | – | – |
| `--fg` | #F2F4F7 | Primary text | 17.76 | 16.44 | 13.44 |
| `--fg-muted` | #A8AFBA | Secondary text | 8.86 | 8.20 | 6.70 |
| `--fg-subtle` | #8C939E | **Minimum text color** (meta) | 6.32 | 5.85 | 4.78 |
| `--control-border` | #6B7280 | Input/control boundaries (non-text) | – | 3.75 ✓ (≥3:1) | – |
| `--line` | rgb(255 255 255 / .08) | Decorative hairline only (≈1.19:1) | – | – | – |
| `--blue-400` | #60A5FA | Links, focus ring, selected state, primary CTA fill (with ink text) | 7.70 | 7.12 | 5.83 |
| `--blue-600` | #2563EB | Alternative CTA fill (with white text, 5.17:1) | – | – | – |
| `--amber-400` | #FBBF24 | Premium (text or fill with ink text) | 11.72 | 10.85 | 8.87 |
| `--discord-text` | #8B93F8 | Blurple when used as text | 7.11 | 6.58 | 5.38 |

### 7.3 Rules of use [Interpretation, grounded in §7.1 facts]
1. **Blue means actionable or selected:** the primary CTA, links, the focus ring, selected filters and the "everyone owns it" highlight. Never use it for decorative gradients, glows or orbs.
2. **Primary CTA.**
   - (a) A `--blue-400` fill with `--ink-950` text (7.70:1). This is recommended: it gives the most contrast and an unmistakable Steam-blue energy. Hover to `#93C5FD`.
   - (b) A `--blue-600` fill with white text (5.17:1), hovering to a *darker* blue.
   - Never put white on blue-500 at body sizes.
3. **Amber means Premium, and nothing else:** badges, the upgrade CTA, Premium-only features and "gold" moments. Use ink text on amber fills; never white (2.15:1). Never use amber for warnings, so its meaning stays intact.
4. **Blurple is only for Discord actions.** White on `#5865F2` passes (4.61:1). When blurple is text on dark cards, use `#8B93F8`.
5. **Text tiers:** `--fg`, `--fg-muted`, then `--fg-subtle` as the minimum. Gray-500 and gray-600 are decorative or disabled only (WCAG exempts inactive components; §9.3).
6. **Drop gradient-clipped headlines.** The current white→white/70 gradient still passes contrast (white at 70% on black ≈ #B3B3B3), but together with extralight strokes it is the "AI-startup" cliché the brief rejects. Solid `--fg` with heavy Archivo carries the identity instead.

### 7.4 Surfaces, depth and texture
- **Tonal elevation:** `--ink-950` base → `--ink-900` cards → `--ink-800` hover, with 1 px hairlines and a 1 px `--steel` top highlight that echoes the legacy gradient. This replaces the 43 blur usages. **[Interpretation; Fact (count), CODE]**
- **At most one translucent layer,** the sticky header: `@supports (backdrop-filter: blur(1px))` with a solid fallback. `backdrop-filter` has been Baseline (newly available) since 2024-09-16. `prefers-reduced-transparency` is **not** Baseline, so treat it as an enhancement. **[Fact, GH web-features]**
- **Texture:** optional static grain at ≤3% opacity on the hero band only. No animated noise. Retire `AnimatedBackground` (the 8 floating balls). **[Interpretation]**
- **Color comes from the games.** Steam art provides the vivid color, and the UI stays neutral so the art reads well. **[Interpretation]**

### 7.5 Imagery and card system
- The current art (231×87 capsules, `capsule_sm_120`) is low-resolution for 2026 high-DPR screens, and Steam's own 2026 homepage moved to higher-resolution artwork in a 1,200 px layout (R10). **[Fact (filenames), CODE; Fact, SI; Interpretation]**
- I believe Steam's library assets include a portrait library capsule (600×900) and a library hero (3840×1240). This is **[Observation, prior knowledge]**: partner.steamgames.com was blocked, so **check the Steamworks "Library Assets" docs before building**.
- **Crop rule:** one aspect ratio per view (landscape header art for list rows, portrait capsules for the grid). Never mix them in one grid. Reserve the box with `aspect-ratio` so there is no CLS. **[Interpretation]**
- **Card anatomy:** art → title (Inter 600, 2-line clamp) → ownership row (friend avatars + "4/4" in tabular figures) → meta chips (Archivo `label`: CO-OP · MAX 4P · CONTROLLER) → playtime stat (tabular). **[Interpretation]**
- **Hover on pointer devices:** raise to `--ink-800`, add a 1 px `--blue-400` inset ring and reveal secondary actions (Open in Steam, Add to roulette). Scale at most 1.02 and use no tilt or parallax. **On touch, the actions are always visible.** **[Interpretation]**

---

## 8. Motion principles

### 8.1 Choreography tiers [Interpretation]

| Tier | Use | Duration | Easing |
|---|---|---|---|
| Feedback | Press, hover, focus, toggles, chip select | 80–150 ms | `cubic-bezier(0.2, 0, 0, 1)` |
| Transition | Panels, filter reflow, tab indicator, card expand | 180–300 ms | Enter `cubic-bezier(0.16, 1, 0.3, 1)` (already used in the codebase); exit at ~70% of the duration with an ease-in |
| Signature (at most one per flow) | Roulette spin → reveal → "Tonight's pick" | 600–1200 ms, skippable | Decelerating spin, small overshoot, settle |
| Ambient | — | **None by default** | Allowed only if pausable (SC 2.2.2) and decorative |

- Animate only `transform` and `opacity`. Never animate layout properties. Set `will-change` only while an animation runs.
- **Results stagger:** at most 30 ms per item, for the first ~10 cards only (≤300 ms in total). The rest appear instantly, so the page feels fast.
- **Count-ups** take at most 600 ms with `tabular-nums`. Under reduced motion, show the final value immediately.

### 8.2 Reduced motion
- `prefers-reduced-motion` has been **Baseline widely available since 2022-07-15**. **[Fact, GH web-features]**
- The pre-retrofit code had no handling at all (§2.1). The working tree now has a global CSS safety net (§2.2). **[Fact, CODE]**
- **Add per-component alternatives on top of the safety net.** A blanket `0.01ms` rule also removes state cues.
  - Replace movement with ~150 ms crossfades.
  - The roulette jumps straight to its result and announces it through `aria-live="polite"`.
  - Count-ups show final values.
  - Panel videos do not autoplay.
  - **[Interpretation]**
- **Framer Motion:** wrap the app in `<MotionConfig reducedMotion="user">`. `ReducedMotionConfig = "always" | "never" | "user"` in framer-motion 12.26.2. **[Fact, PKG]** Use `useReducedMotion()` for bespoke sequences, and `LazyMotion` + `domAnimation` to trim the bundle. Both are exported by the installed version. **[Fact, PKG]**
- **Tailwind:** use the `motion-safe:` and `motion-reduce:` variants (present in 3.4.18). **[Fact, PKG]**

### 8.3 View Transitions (status as of 2026-10-03)

| Feature | Chrome/Edge | Firefox | Safari | Baseline |
|---|---|---|---|---|
| Same-document (`document.startViewTransition`) | 111 | **144** (released 2025-10-14) | 18 | **Newly available, 2025-10-14** |
| `startViewTransition({types})` options | 125 | 147 | 18.2 | — |
| Cross-document (`@view-transition`) | 126 | **not supported** (bug 1860854) | 18.2 | **Not Baseline** |

- Evidence: MDN BCD `api/Document.json` and `css/at-rules/view-transition.json` (package v8.1.4) and web-features `view-transitions` / `cross-document-view-transitions`, fetched 2026-10-03. The current stable releases at that date are Chrome 154 (2026-09-22), Firefox 157 (2026-09-29) and Safari 27 (2026-09-14). · **[Fact, GH]**
- **Interop 2026** includes view transitions (same-document interoperability, `blocking="render"`, `:active-view-transition-type()` and cross-document) and **scroll-driven animations** as focus areas, so Firefox support is in progress. Do not depend on it yet. (https://github.com/web-platform-tests/interop/blob/main/2026/README.md) · **[Fact, GH; Interpretation]**
- **Framework notes:**
  - Next.js 16.1.6 has an `experimental.viewTransition` flag (`config-shared.d.ts`). [Fact, PKG]
  - **React 19.2.4 stable does not export `<ViewTransition>`** (it is canary/experimental only). [Fact, PKG] So call `document.startViewTransition` directly, with `flushSync` for React state updates.
  - App Router navigations are same-document, so cross-document view transitions would apply only to hard navigations. [Interpretation]

```js
// Pattern sketch: progressive and motion-aware
import { flushSync } from "react-dom";
export function withViewTransition(update) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) return update();
  document.startViewTransition(() => flushSync(update));
}
```
```css
.pick-art { view-transition-name: pick-art; }           /* roulette reel → "Tonight's pick" */
::view-transition-group(pick-art) { animation-duration: 320ms; animation-timing-function: cubic-bezier(.16,1,.3,1); }
@media (prefers-reduced-motion: no-preference) { @view-transition { navigation: auto; } } /* cross-doc: enhancement only */
```

### 8.4 Scroll-driven animations
- **Status:** `animation-timeline` is supported in Chrome/Edge 115+ and **Safari 26+**, and Firefox has it **only in preview builds**. It is **not Baseline**, and it is an Interop 2026 focus area. **[Fact, GH (BCD `css/properties/animation-timeline.json`; web-features `scroll-driven-animations`)]**
- **Use** [Interpretation]:
  - Only for decoration, never for essential content or to gate reveals.
  - Content must be fully visible when the feature is unsupported.
  - Never hijack scrolling.
  - Wrap it in `@supports (animation-timeline: view())` **and** `@media (prefers-reduced-motion: no-preference)`.
- Good uses for WeBothPlay [Interpretation]: a subtle header shadow or compaction on scroll, and a reading-progress hairline on blog posts.

### 8.5 Loading states [Interpretation]
- **Show progress per friend while libraries load** ("Fetching 4 libraries · 2/4 · 2,031 games"), with tabular figures. Reserve the final layout so nothing shifts.
- **Skeletons:**
  - Use the card's real geometry.
  - Shimmer at most ~1.5 s per cycle and stop after a few cycles, or use static skeletons with text progress.
  - Under reduced motion, keep them static.
  - The old `.skeleton` shimmer looped forever (§2.1).
- **Errors** (private profile, bad ID) appear inline, next to the friend they belong to, together with how to fix them.
- **Announce the result once** through `aria-live` ("37 games in common").

### 8.6 When WebGL/Three.js is justified
Use it only if **all** of the following hold [Interpretation]:
1. It shows something that 2D or CSS cannot.
2. It is off the critical path: loaded dynamically after LCP, when the browser is idle or the user asks for it.
3. A static fallback carries the same information.
4. It respects reduced motion and pauses when the tab is hidden.
5. INP stays within budget on mid-range Android.

The SOTY winners (R1, R2) use WebGL for spectacle. Ink Games (R7) scored lowest on WPO and accessibility. **For WeBothPlay: no WebGL in the compare, results or dashboard flows.**

---

## 9. Performance and accessibility constraints

### 9.1 Core Web Vitals

| Metric | Good | Poor | Source |
|---|---|---|---|
| LCP | ≤ 2500 ms | > 4000 ms | `LCPThresholds = [2500, 4000]` |
| INP | ≤ 200 ms | > 500 ms | `INPThresholds = [200, 500]` |
| CLS | ≤ 0.1 | > 0.25 | `CLSThresholds = [0.1, 0.25]` |

- Evidence: GoogleChrome/web-vitals source (`src/onLCP.ts`, `onINP.ts`, `onCLS.ts`), v6.2.2 (CHANGELOG entry dated 2026-09-14) · https://github.com/GoogleChrome/web-vitals · these are the thresholds the official library rates against · **[Fact, GH]**
- FID is gone: the CHANGELOG records "[BREAKING] Remove the deprecated `onFID()` function". INP is the responsiveness metric. **[Fact, GH]**
- Field assessment is at the 75th percentile, per web.dev guidance. I could not re-fetch this (web.dev is blocked). **[Observation]**
- **Internal budgets** (p75, mobile, field data) **[Interpretation]**:
  - LCP ≤ 2.0 s on `/` and on results pages.
  - INP ≤ 150 ms on compare, filter and roulette.
  - CLS ≤ 0.05.
  - Measure the current baseline first (Vercel Speed Insights or CrUX), then lock the budgets in CI.

### 9.2 Implementation constraints [Interpretation unless marked]
- **Fonts:**
  - Preload at most two families: ≤ ~200 KB WOFF2 measured for Archivo + Inter [Fact, MEAS]. JetBrains Mono uses `preload: false`.
  - Keep `display: swap` and next/font's automatic metric-adjusted fallback (on by default) [Fact, PKG] so text paints immediately with minimal CLS.
- **Images:**
  - Explicit `width`/`height` or `aspect-ratio` boxes, `loading="lazy"` and `decoding="async"` below the fold.
  - If you adopt `next/image` for Steam CDN art, `images.remotePatterns` is required. `next.config.*` is currently empty [Fact, CODE].
- **Video panels** (`public/panels/*.mp4`): `preload="none"`, a poster image, play only when in view and when motion is allowed, and always provide a pause control (SC 2.2.2).
- **Third-party scripts:** AdSense and GA load `afterInteractive` in the root layout [Fact, CODE]. Prefer `lazyOnload` for ads, put ad slots below the fold, and **reserve slot dimensions** to protect CLS.
- **Long lists:**
  - Use `content-visibility: auto` (Baseline since 2025-09-15) [Fact, GH] with `contain-intrinsic-size`, or virtualize lists over about 200 items.
  - Keep filter input responsive with `useDeferredValue`/`startTransition`.
  - Yield during heavy client-side work.

### 9.3 WCAG 2.2 AA checklist (criterion text verified in the W3C source; respec `publishDate: "2024-12-12"`)

| SC (level) | Requirement (verified text, condensed) | WeBothPlay implementation |
|---|---|---|
| 1.4.3 Contrast (Minimum) (AA) | Text at least 4.5:1; large text at least 3:1; inactive components and logos exempt | Token table in §7.2; stop using gray-500/600 for text |
| 1.4.11 Non-text Contrast (AA) | UI components, their states and meaningful graphics at least 3:1 against adjacent colors | `--control-border` #6B7280 (3.75:1 on cards); hairlines are decorative only |
| 2.4.7 Focus Visible (AA) | The keyboard focus indicator is visible | `:focus-visible { outline: 2px solid #60A5FA; outline-offset: 2px }` (7.70:1 on ink). Use outline, not box-shadow, because forced-colors mode removes box-shadow (CSS Color Adjust; not re-fetched) |
| 2.4.11 Focus Not Obscured (Minimum) (AA, new in 2.2) | A focused component is not *entirely* hidden by author content | `scroll-padding-top: var(--header-h)`; sticky filters, cookie bars and ads must never cover focus |
| 2.4.13 Focus Appearance (**AAA**, new) | Indicator area at least a 2 px perimeter and a 3:1 change between focused and unfocused states | Adopt as an internal standard; the 2 px outline above meets it |
| 2.5.8 Target Size (Minimum) (AA, new) | Targets at least 24×24 CSS px, unless the spacing, equivalent, inline, user-agent or essential exception applies | Chips, avatar "×" removers and icon buttons at least 24 px; **primary mobile actions at 44 px** (2.5.5 AAA, adopted) |
| 2.2.2 Pause, Stop, Hide (A) | Auto-moving content lasting more than 5 s alongside other content can be paused, stopped or hidden | No infinite ambient loops; videos get a pause control |
| 2.3.3 Animation from Interactions (AAA) | Motion triggered by interaction can be disabled | Reduced-motion system (§8.2) |
| 1.4.4 Resize Text / 1.4.10 Reflow (AA) | Text scales to 200%; content reflows at 320 CSS px | `rem`-based `clamp`; the minimum design width is 320 |

- Evidence: w3c/wcag `guidelines/sc/20|21|22/*.html` · https://github.com/w3c/wcag/tree/main/guidelines/sc · fetched 2026-10-03 · exact criterion text and levels · fixes the brief's mislabel (2.4.13 is AAA) · **[Fact, GH]**
- Also relevant: `forced-colors` (Baseline widely available, 2025-03-12) and `prefers-contrast` (widely available, 2024-11-30). Test the focus ring and chips in Windows forced colors. **[Fact, GH; Interpretation]**

### 9.4 Browser support for the CSS features this document relies on (web-features, fetched 2026-10-03)

| Feature | Baseline status |
|---|---|
| prefers-reduced-motion · font-variant-numeric · font-display · font-stretch · font-optical-sizing | Widely available |
| container queries | Widely (2025-08-14) |
| oklab/oklch · color-mix | Widely (2025-11-09) |
| `:has()` | Widely (2026-06-19) |
| text-wrap: balance | Newly (2024-05-13) |
| relative color | Newly (2024-09-16) |
| backdrop-filter | Newly (2024-09-16) |
| @starting-style | Newly (2024-08-06) |
| content-visibility | Newly (2025-09-15) |
| view transitions, same-document | Newly (2025-10-14) |
| cross-document view transitions · scroll-driven animations · text-wrap: pretty · prefers-reduced-transparency · interpolate-size | **Not Baseline**: progressive enhancement only |

Evidence: https://github.com/web-platform-dx/web-features (`features/*.yml.dist`) · **[Fact, GH]**

---

## 10. Gaps and next verification steps
1. **Steam asset specs:** confirm the library capsule and hero dimensions and safe areas in Steamworks "Library Assets" (blocked here).
2. **Godly, Land-book, Siteinspire, itch.io, Steam Deck pages:** sample them manually (blocked here, and the search budget ran out). This research claims no findings from them.
3. **Fontshare ITF FFL:** read the license if any Fontshare family is still under consideration.
4. **Real-browser type QA:** Pillow renders are not ClearType, macOS or Android rasterization. Before final sign-off, check Archivo at wdth 87.5 and 600 at 12 px, and Inter at 14 px on #0B0C0E, on Windows, macOS, iOS and Android.
5. **Performance baseline:** collect field CWV for `/` and a results page before fixing the budgets.
6. **Trademark hygiene:** check use of the "Steam" name and art against Valve's guidelines, and add a "not affiliated with Valve" line (see the R10 caution).

---

## 11. Sources

Access codes: SI = search-index extract (the page could not be opened). GH = GitHub direct. PKG = installed package. CODE = this repository. MEAS = my own measurement or render.

### Awards and reference sites (SI unless noted)
- Awwwards Sites of the Year: https://www.awwwards.com/websites/sites_of_the_year/
- Awwwards Sites of the Month: https://www.awwwards.com/websites/sites_of_the_month/
- Awwwards Sites of the Day: https://www.awwwards.com/websites/sites_of_the_day/
- Awwwards Games & Entertainment: https://www.awwwards.com/websites/games-entertainment/
- Messenger: https://x.com/awwwards/status/2011469546712965498 (2026-01-14) · https://en.wikipedia.org/wiki/Messenger_(video_game) · https://www.creativedevjobs.com/blog/best-threejs-portfolio-examples-2025
- Lando Norris: https://www.itsoffbrand.com/our-work/lando-norris · https://www.webgpu.com/showcase/mclaren-f1-driver-lando-norris-official-website/ · https://www.lapa.ninja/post/landonorris/ · https://x.com/Norrislandofans/status/2027229106249822213 (2026-02-27)
- Oryzo AI: https://www.awwwards.com/sites/oryzo-ai · https://x.com/awwwards/status/2043600792184099160 (2026-04-13) · https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations · https://x.com/lusionltd/status/2046585874926743563 (2026-04-21) · https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/
- Dropbox Brand: https://www.awwwards.com/sites/dropbox-brand · https://www.awwwards.com/case-study-dropbox-brand-guidelines.html (2025-05-07) · https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/ · https://creativebloq.com/design/dropboxs-new-brand-identity-website-puts-boring-style-guides-to-shame · https://dropbox.design/article/brand-guidelines-site · https://designcompass.org/en/2025/01/21/dropbox-brand-website-renewal/
- Bruno's Portfolio: https://www.awwwards.com/sites/brunos-portfolio
- Where Worlds Take Shape: https://www.awwwards.com/sites/where-worlds-take-shape · https://www.awwwards.com/inspiration/integrated-mini-games-where-worlds-take-shape · https://www.cssdesignawards.com/sites/where-worlds-take-shape/48947/
- Ink Games: https://www.awwwards.com/sites/ink-games · https://toyfight.co/news/gold-run
- The Tie-break: https://www.awwwards.com/sites/the-tie-break
- FWA, Night Drive Racing Game: https://thefwa.com/cases/night-drive-racing-game
- Linear: https://linear.app/now/behind-the-latest-design-refresh · https://linear.app/changelog/2026-03-12-ui-refresh · https://linear.app/now/how-we-redesigned-the-linear-ui
- Raycast (third-party analyses): https://www.webdesignhot.com/design.md/raycast/ · https://design.hagicode.com/designs/raycast/
- X post dates were decoded from post IDs (snowflake `(id >> 22) + 1288834974657` ms). [MEAS]

### Gaming platforms (SI)
- Steam store redesign: https://www.techloy.com/steam-is-testing-a-redesigned-storefront-for-easier-navigation-and-discoverability/ · https://macmyths.com/valves-redesigned-steam-store-what-changed-on-desktop-and-beyond/ · https://www.ubergizmo.com/2026/04/steam-beta-update/ · https://massivelyop.com/2026/06/05/steam-puts-out-a-refreshed-store-home-page-with-more-personalization-and-features/
- Steam hardware: https://www.gameinformer.com/2025/11/12/valve-announces-console-like-steam-machine-steam-frame-vr-headset-and-new-steam · https://www.phoronix.com/news/Steam-Machines-Frame-2026
- Steam Replay 2025: https://insider-gaming.com/steam-wrapped-2025-steam-replay-release-date-stats/ · https://gamingonlinux.com/2025/12/steam-replay-is-live-and-notes-only-14-of-playtime-spent-by-all-steam-users-was-for-2025-releases
- Discord: https://discord.com/blog/discord-update-march-25-2025-changelog · https://tech.yahoo.com/general/article/discords-redesigned-pc-app-has-multiple-dark-modes-a-new-overlay-and-more-160019822.html · https://alternativeto.net/news/2025/3/discord-enhances-pc-gaming-with-revamped-game-overlay-and-refreshed-desktop-app
- Marathon: https://fontsinuse.com/uses/67879/marathon-2026-video-game-1 · https://kotaku.com/marathon-ui-fontslop-menus-bungie-2000675332 · https://gamingbolt.com/dont-think-for-a-second-were-gonna-remove-the-sauce-says-marathon-ui-designer-about-its-look · https://www.space.com/entertainment/space-games/bungie-explains-marathons-graphic-retro-futurism-aesthetic-and-the-live-narrative-lessons-it-learned-from-destiny-interview

### Typography and licensing (GH unless noted)
- google/fonts METADATA.pb, OFL.txt and binaries for each family: https://github.com/google/fonts/tree/main/ofl (e.g. `/archivo`, `/inter`, `/jetbrainsmono`, `/bricolagegrotesque`, `/monasans`, `/hubotsans`, `/geist`, `/geistmono`, `/martianmono`, `/bigshoulders`, `/pathwayextreme`)
- OFL 1.1 text: https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/OFL.txt (canonical: https://openfontlicense.org)
- OFL-FAQ v1.1-update7 (Nov 2023): https://raw.githubusercontent.com/silnrsi/font-charis/master/OFL-FAQ.txt (canonical: https://openfontlicense.org/ofl-faq)
- Upstream repositories: https://github.com/Omnibus-Type/Archivo · https://github.com/rsms/inter · https://github.com/JetBrains/JetBrainsMono · https://github.com/ateliertriay/bricolage · https://github.com/vercel/geist-font · https://github.com/github/mona-sans · https://github.com/github/hubot-sans · https://github.com/evilmartians/mono
- Specimen pages (not fetched; blocked): https://fonts.google.com/specimen/Archivo · https://fonts.google.com/specimen/Inter · https://fonts.google.com/specimen/JetBrains+Mono
- Fontshare ITF FFL (not fetched; blocked): https://www.fontshare.com/licenses/itf-ffl
- Next.js 16.1.6 font metadata and loader: `node_modules/next/dist/compiled/@next/font/dist/google/{font-data.json, validate-google-font-function-call.js, get-font-axes.js, fetch-css-from-google-fonts.js}` [PKG]
- Feature inspection, renders and WOFF2 subset sizes: fontTools 4.66.1, Pillow + libraqm, 2026-10-03 [MEAS]

### Web platform and standards (GH)
- MDN browser-compat-data (v8.1.4): https://github.com/mdn/browser-compat-data (`api/Document.json`, `css/at-rules/view-transition.json`, `css/properties/animation-timeline.json`, `browsers/*.json`)
- web-features (Baseline): https://github.com/web-platform-dx/web-features (`features/*.yml.dist`)
- Interop 2026: https://github.com/web-platform-tests/interop/blob/main/2026/README.md
- web-vitals v6.2.2: https://github.com/GoogleChrome/web-vitals (`src/onLCP.ts`, `src/onINP.ts`, `src/onCLS.ts`, `CHANGELOG.md`)
- WCAG 2.2 source: https://github.com/w3c/wcag (`guidelines/sc/**`, `guidelines/respec-config.js` with `publishDate: "2024-12-12"`)

### Local evidence (CODE/PKG)
- `src/app/layout.jsx`, `src/app/page.jsx`, `src/app/globals.css`, `src/app/components/AnimatedBackground.jsx`, `tailwind.config.js`, `next.config.*` (HEAD `8eb616d` → `eea422c`, plus the uncommitted working tree as of 2026-10-03)
- react 19.2.4, framer-motion 12.26.2 (`ReducedMotionConfig`, `LazyMotion`), tailwindcss 3.4.18 (no `fontStretch`; `motion-safe`/`motion-reduce`; `tabular-nums`/`slashed-zero`)
