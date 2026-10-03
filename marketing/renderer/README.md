# Social renderer

Turns small JSON content objects into **1080×1920** TikTok assets in the WeBothPlay design system (same fonts, colours and overlap mark as the website): MP4 masters, cover images, Photo Mode carousel slides and transparent overlays.

```bash
npm run social:calendar                          # rebuild posts.json (+ the 90-day CSV) from the content bank
npm run social:render -- --only W03-MON          # one post
npm run social:render -- --only W03-MON,W03-WED  # several
npm run social:render -- --skip-existing         # everything not rendered yet (one child process per post)
npm run social:render -- --file my-posts.json --fps 24 --out ./my-out
```

Requirements: Node ≥ 20.9 and `ffmpeg` on the PATH. Output goes to `marketing/renders/out/`, which is gitignored. A rendered sample of every template and a contact sheet are committed in `marketing/renders/samples/`.

| Output | When |
|---|---|
| `<id>.mp4` | Animated templates. Silent H.264 master, 30 fps: add Commercial Music Library audio or a voiceover in TikTok/CapCut |
| `<id>-cover.png` | The final frame, for the cover picker |
| `<id>-slide-N.png` | `top-five` also exports carousel slides (cover, 5 items, end card) |
| `<id>.png` | `hook-overlay`: transparent PNG to lay over your own screen recording |

## Post format

`posts.json` is an array of `{ "id", "template", "data", "duration"? }`. Fields shared by most templates:

- `hook`: the headline in the top band.
- `demo: true`: adds the **"Demo data · fictional friend group"** label. Use it whenever numbers or names aren't a real, consenting group.
- `cta` / `sub`: override the end-card text.

| Template | Length | `data` fields | Example |
|---|---|---|---|
| `overlap-reveal` | 12 s | `hook`, `players: [{name, count}]` (≤ 8), `shared`, `union`, `punchline`, `funFact`, `sharedLabel?` | Rings merge → "64 games they ALL own" |
| `roulette` | 10 s | `hook`, `titles: [..]` (6–10), `winner` (one of the titles), `reason` | Reel spins and lands on the winner |
| `nobody-played` | 9 s | `players` (count), `game`, `punchline` | "All 4 of us own this game · Combined hours: 0" |
| `stat-card` | 8 s | `hook`, `value` (number, counts up), `prefix?`, `suffix?`, `label`, `sub`, `big?` (number size, default 220) | "36h · Nova in Marvel Rivals" |
| `top-five` | 16 s + slides | `hook`, `items: [{name, why}]` (5), `coverSub?` | A list, revealed item by item |
| `meme-card` | 8 s | `lines: ["Speaker:: text", "plain line", …]` | A chat-style beat sheet (emoji supported) |
| `hook-overlay` | still | `text`, `demo?`, `size?` (default 66) | Headline band for screen recordings |
| `end-card` | 3 s | `cta?`, `sub?` | Wordmark + `webothplay.com` |

All text stays inside TikTok's safe area (x 64–940, y 150–1436, defined as `SAFE` in `lib.mjs`). The bottom of the frame is left for TikTok's caption and buttons. Long game titles shrink automatically in `nobody-played`; reel rows in `roulette` use a fixed 50 px size, so keep those titles under ~26 characters.

## Adding a template

1. Add `{ duration, render(t, data) }` (or `{ overlay: true, render }`) to `templates.mjs`. Build it from the primitives in `lib.mjs` (`Frame`, `Hook`, `Rings`, `Text`, `Pill`, `EndCard`, easing helpers). `t` is the time in seconds.
2. Register it in `TEMPLATES`.
3. Add a post using it to the bank in `marketing/tiktok/build-calendar.mjs` (or to your own JSON file) and render it with `--only`.

Frames are de-duplicated (identical frames are rendered once), so holds and static beats cost nothing.

## Content rules (from the brief and the style guide)

- **No game art, logos or screenshots** are drawn by the templates. Game names appear as text only, and they're trademarks of their owners.
- Fictional groups (Nova, Bram, Kit, Juno, …) always carry the demo label. Never present them as real users or real usage numbers.
- Claims about games (player counts, Friend's Pass, local co-op) must be checkable on the game's Steam store page before posting.

## Licences

- **Fonts:** Archivo and Inter, SIL Open Font License 1.1 (`src/assets/fonts/OFL-*.txt`). Embedding them in videos and images is permitted.
- **Emoji:** [Twemoji](https://github.com/jdecked/twemoji) graphics © Twitter, Inc. and other contributors, licensed **CC-BY 4.0**. They're loaded from the `@twemoji/svg` package (MIT packaging). If a post shows emoji, credit "Emoji: Twemoji (CC-BY 4.0)" somewhere reasonable, such as the account bio or a pinned comment.
- **Rendering:** [Satori](https://github.com/vercel/satori) (MPL-2.0) and [resvg-js](https://github.com/yisibl/resvg-js) (MPL-2.0), used as unmodified libraries.
