# WeBothPlay design system

The retrofit keeps the recognisable identity — **near-black stage, the original blue, amber for Premium, the two-puzzle-piece mark** — and replaces effects (glass, gradient text, extralight headlines, floating orbs) with typography, tone and one recurring motif. Source of truth: `src/app/globals.css` (tokens) → `tailwind.config.js` (names) → components. Research behind each choice: [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md).

## 1. Concept

**"Two libraries, one overlap."** The brand device is two thin rings whose shared lens is lit blue (`src/components/home/OverlapMark.jsx`, reused in share cards, OG images, the 404 page and social templates). Everything else is quiet so that the data — counts, covers, friends' colours — is the loudest thing on screen.

## 2. Colour tokens — before → after

| Role | Before | After | Contrast on `--bg` | Notes |
|---|---|---|---|---|
| Page background | `#000` → `#292b2d` gradient | `--bg #060708` | — | One stage colour; no body gradient |
| Raised / surfaces | `bg-white/10`, glass + blur | `--bg-raised #0b0d10`, `--surface-1 #101317`, `-2 #161a1f`, `-3 #1d2229` | — | Depth from tone steps, not blur |
| Hairlines | `border-white/10` (ad hoc) | `--line rgba(232,238,247,.08)`, `--line-strong .16` | — | Two weights only |
| Primary text | white / `gray-100` | `--ink-1 #f3f5f8` | **18.5:1** | |
| Secondary text | `gray-300/400` | `--ink-2 #b7bdc7` | **10.7:1** | |
| Tertiary text | `gray-500` (4.3:1), `gray-600` (2.8:1 ✗) | `--ink-3 #8a919d` | **6.4:1** (5.9:1 on surface-1) | Dimmest allowed for text |
| Decorative | — | `--ink-4 #5c636e` | 3.3:1 | Icons/decoration only |
| Brand signal | `blue-500 #3b82f6` everywhere (incl. behind white text: **3.68:1 ✗**) | `--accent #3b82f6` for rings, bars, dots, focus | 5.5:1 as text | Same hue — identity preserved |
| Accent text | `blue-400 #60a5fa` | `--accent-hi #60a5fa` | **7.9:1** | |
| Primary button | white on `#3b82f6` (3.68:1 ✗) | white on `--accent-lo #2563eb` (**5.17:1**), hover `#1d4ed8` (**6.70:1**) | | AA fix |
| Premium | amber-400/500 + gradients | `--amber #f5a524`, `--amber-hi #fbbf24` (12.1:1); button text `#1b1203` on amber (**9.1:1**) | | Reserved for Premium only |
| Discord | `#5865F2` | `--discord #5865f2` (white text 4.6:1) | | Discord contexts only |
| Status | ad hoc | `--success #34d399`, `--warning #fbbf24`, `--danger #f87171` (7.3:1) | | Always with icon + text |

### Friend colours (categorical)

One colour per friend, in fixed order, everywhere (form dots, avatars, playtime bars, share cards, social templates). Validated **as a set** with the dataviz validator against the dark surface: lightness band ✓, chroma floor ✓, **adjacent CVD ΔE ≥ 10** ✓, normal-vision ΔE ≥ 22 ✓, ≥3:1 contrast ✓.

`#3b82f6 · #e0621f · #13a674 · #c948d2 · #c98500 · #0f9fb8 · #e5446d · #7c6cf0`

Identity is never colour-alone: rows are numbered, avatars carry names, bars follow the avatar order and have text equivalents.

## 3. Typography

| Role | Family | Settings | Why |
|---|---|---|---|
| Display / headlines | **Archivo** (variable `wdth` 62–125) | ExtraBold 800, `font-stretch: 118%` (`.display-wide`); sub-heads 700 at 106% (`.display`) | Expanded heavy grotesk reads as gaming/HUD without a novelty face |
| Labels | Archivo | 600, `font-stretch: 87.5%`, uppercase, **12 px min**, +0.08em, `case` feature (`.label`) | Condensed caps for UI chrome |
| Stats | Archivo | tabular figures (`.num`) | Counters don't jitter |
| UI & body | **Inter** (variable `opsz`) | 400–700 | Readable; covers **Cyrillic and Greek** (friends' Steam names) |
| IDs & codes | **JetBrains Mono** | slashed zero (`.mono`), not preloaded | Steam IDs, share links |

All three are **SIL OFL 1.1** (usable on the web and in video/graphics). Loaded with `next/font/google` (self-hosted, `display: swap`). Static TTF instances for server-rendered images live in `src/assets/fonts/` with their licences.

**Fluid scale** (`tailwind.config.js`, 360 → 1440 px):

| Token | Size | Line height | Tracking |
|---|---|---|---|
| `text-display-xl` | `clamp(2.5rem, 1.75rem + 3.4vw, 4.75rem)` | 1.02 (hero) | −0.02em |
| `text-display-lg` | `clamp(2.07rem, 1.65rem + 2.1vw, 3.55rem)` | 1.0 | −0.018em |
| `text-display-md` | `clamp(1.73rem, 1.46rem + 1.34vw, 2.67rem)` | 1.06 | −0.015em |
| `text-display-sm` | `clamp(1.375rem, 1.2rem + 0.8vw, 1.875rem)` | 1.15 | −0.01em |
| `text-body-lg` | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)` | 1.55 | — |
| body | 16 px (inputs always 16 px — no iOS zoom) | 1.6 | — |

Rules: no extralight weights, no gradient text, ≤ 6 type styles per screen, text never wears a data colour.

## 4. Layout, shape, depth

- Container 1240 px, gutter `clamp(1rem, 0.6rem + 1.8vw, 2rem)`; explicit `grid-cols-1` on mobile grids (prevents min-content overflow).
- Radii: 6 / 10 (buttons, inputs) / 14 (cards) / 22 (panels). Chips are pills.
- Depth: tone steps + a 1 px inner highlight on raised panels (`.surface-raised`); one soft shadow on raised panels only.
- Film grain (`.grain`) exists for large brand surfaces; not used on data views.

## 5. Components (in `src/components`)

`SiteHeader` (sticky, blurs only after scroll; account menu; full-screen mobile menu) · `SiteFooter` (Powered by Steam, not-affiliated line) · `Icon` (one 24 px set, 1.75 stroke, Lucide-derived; Steam/Discord marks) · `Dialog` (native `<dialog>`: focus trap, Esc, inert background) · `compare/CompareForm` (multi-paste, inline validation, friend picker, saved + recent groups) · `results/*` (ResultsView, GameCard with cover fallbacks, PlayBars, Roulette, Share/Poll dialogs, sections) · `pricing/*` · `content/*` (PageHeader, GuideLayout with Article/Breadcrumb JSON-LD, ToolLanding).

Buttons: `.btn` + `-primary | -ghost | -quiet | -steam | -discord | -amber`, sizes `-sm | -lg`; minimum target 44 px (36 px small). Fields: `.field` with `aria-invalid` styling. Chips: `.chip[aria-pressed]` with a count.

## 6. Motion

| Use | Spec |
|---|---|
| Feedback (press, hover) | 120–200 ms, `cubic-bezier(.2,.8,.2,1)`; press = 1 px down + 1.5% scale |
| Entrances | `.rise` 360 ms, 10 px |
| Signature | **Roulette**: cover reel lands in **1.1 s**, skippable, short haptic tick on mobile, hands off to "Tonight's pick" through a same-document View Transition where supported |
| Counters | hero demo count-up 900 ms ease-out |
| Reduced motion | global `prefers-reduced-motion` rule collapses animations/transitions; roulette reveals instantly; demo ticker stops |

No looping background animation, no scroll-jacking, no WebGL.

## 7. Accessibility baseline (WCAG 2.2 AA)

Skip link; one visible `:focus-visible` ring (2 px `#60a5fa`); semantic landmarks and headings; all icon buttons labelled; `aria-pressed` on toggles, `aria-live` for counts/results/errors; native `<details>` for FAQs; dialogs via `<dialog>`; touch targets ≥ 44 px for primary actions; text contrast table above; colour never the only signal.

## 8. Social & images

Share cards, poll cards, the site OG image and all TikTok templates are rendered from the same tokens (`src/lib/og.jsx`, `marketing/renderer/lib.mjs`). TikTok specifics (safe zones, sizes, labels) are in `marketing/tiktok/STYLE_GUIDE.md`.
