# /brag-slim plan — WeBothPlay

Run: brag-slim (Opus 5.5 dispatch from /brag) · format **vertical 1080×1920, 30 fps** (TikTok/Reels/Shorts first) · tone **default** (punchy, playful, clean) over a **chill lo-fi** track · 24.5 s · original music + SFX built for this video.

## Inspect — answers

| Question | Answer |
|---|---|
| What is it? | WeBothPlay compares your friends' Steam libraries, shows every game you all own, then helps the group actually pick one. |
| Who is it for / what does it do for them? | Friend groups on Steam stuck in the nightly "what are we playing?" loop, usually in a Discord server. Add the bot → `/compare` your friends right in chat. Or on the web: sign in with Steam → pick friends → shared games → spin or vote → launch. |
| What sets it apart? | It lives where the group already talks (the Discord bot is the main integration), and it doesn't stop at the overlap: roulette, a group vote with **one veto each**, "one copy away", share cards. Free for up to 8 friends. |
| Most impressive / funniest claim | The product's own example group: **39 games they all own**, and *"Everyone owns Bloons TD 6. Nobody has launched it."* |
| Visual hook | A Discord channel stuck on "idk": **what are we playing tonight?** |
| Real UI / flow to show | The site's `/discord` header with **Add to your server** → the bot joins the channel → `/compare @Bram @Kit @Juno` → the bot's real reply (🎮 Library Comparison, 🏆 Top Shared Games (39 total), View Full Comparison / 🎰 Pick a Random Game) → on the web: **Sign in to pick friends** → the **Pick friends** modal → group rows show names → results ("39 games you all own", overlap rings, fun fact) → Spin → "Tonight's pick" → vote (I'd play / Veto) → outro with both CTAs |
| Tone | default: playful, clean, postable; the joke comes from the real situation (idk / nobody launched Bloons). Music is chill and follows the edit, not aggressive and not bright "corporate" pop. |
| One-line share caption | Add the bot, type /compare, and see every Steam game your group owns. Our example group had 39, and nobody had ever launched Bloons TD 6. |

Source material, all from the real product:

- **Web screens:** the production build in mock mode, with its compiled CSS, fonts (Archivo/Inter), components and the labelled example group (fictional players, real games). The signed-in screens come from the real flow; a session cookie for demo player Nova stands in for the Steam round trip.
- **Discord channel:** a stylized client (Discord's colours and layout, our own markup). The bot's reply in it is real. `work/capture-discord.mjs` runs the bot's own `/compare` command (`bot/commands/compare.js`) against the demo API and records the exact embed and buttons it sends. Only the Discord→Steam account links (`/link`) and the plan check are stubbed. Emoji are Twemoji, as in Discord.
- **"Add to your server":** the site's real `/discord` header and button.
- **Avatars:** the site's own profile pictures (`public/pfp/`), which the demo players use in the app too. The bot's avatar is the site's logo mark.
- **Composition edits:** the composition drops the "Demo ·" name prefix, shows Nova's name in place of the mock "Steam user", and adds one unticked friend (Mae) so the picker reads like a real friends list.
- **Game covers:** the app's own typographic fallback tiles, because Steam's image CDN is unreachable from the build machine. This also keeps third-party game art out of an ad.

Every number on screen comes from the example group. The web results carry the site's "Example group" label, and the bot's "39 total" is the same group.

## Angle

**"Settle it where you're already talking."** The Discord chat says "idk". Add the bot, type `/compare`, and it answers with every game the group owns. Then the website goes further: sign in with Steam, tick your friends, see *39 games you all own*, spin for one, or settle it with a vote. End on both CTAs.

## Storyboard (120 BPM grid: 1 beat = 0.5 s, bars start on even seconds)

| # | Time | Scene | On screen | Motion | Sound |
|---|---|---|---|---|---|
| 1 | 0.0–2.5 | **Hook (Discord)** | `#game-night`: "what are we playing tonight?" → "idk" → "idk either lol" → *Juno is typing…* | Close camera on the chat; messages pop in | Electric piano + vinyl; a soft note per message, stepping down |
| 2 | 2.5–4.6 | **Add the bot** | Camera pulls back to the whole channel; the site's card "Discord bot · Settle it without leaving the voice channel." → tap **Add to your server** → "**WeBothPlay** joined the party." | Card rises, tap, drops away | Hats come in; tap note; two-note chime on the join |
| 3 | 4.6–8.5 | **The bot answers** | Nova types `/compare @Bram @Kit @Juno` → "Nova used /compare" → *WeBothPlay is thinking…* → the real embed: 🎮 Library Comparison, Comparing, 🏆 Top Shared Games (39 total) 1. Counter-Strike 2 … → buttons | Mentions pop in, send, embed fades up, slow scroll to the buttons | **Drums and bass arrive with the bot (4.0)**; notes on the mentions; bell dyad on the reply |
| 4 | 8.5–12.0 | **On the web** | "Sign in with Steam." → tap **Sign in to pick friends** → **Pick friends** modal: tick Bram, Kit, Juno → **Add 3 to group** → *Nova · you, Bram · friend…* → **Compare libraries** | Focus ring + taps, modal pops in, slides out | Groove; the music muffles while the modal is open; rising notes per friend |
| 5 | 12.0–15.5 | **Reveal** | Overlap rings close; **39** counts up; "games you all own"; avatars; fun fact: Bloons TD 6 | Rings merge, count-up, card rises | Swell into the downbeat, lift to C major 9, a rising run with the count, bells on "39" |
| 6 | 15.5–19.0 | **Spin** | "Can't decide? Spin for it." → reel lands on **Deep Rock Galactic** → "Tonight's pick" + Launch in Steam | Reel decelerates | Drums drop to hats; soft wood ticks as tiles pass; chime + bass on the landing; groove back on 18.0 |
| 7 | 19.0–21.5 | **Vote** | "Can't agree? Vote." I'd play ×2, one **Veto** → "Leading: Deep Rock Galactic" | Taps one per beat | Notes up for the votes, a soft falling "nope" for the veto, a chime for the leader |
| 8 | 21.5–24.5 | **Outro** | Wordmark, "Find what your group can play tonight.", **webothplay.com**, **Add to your server**, "Free for groups of up to 8 · Powered by Steam" | Rings settle, type in | Drums out, a motif on the wordmark, chimes on the buttons, the last chord rings out |

Durations: 2.5 + 2.1 + 3.9 + 3.5 + 3.5 + 3.5 + 2.5 + 3.0 = **24.5 s** (735 frames). The reveal lands on a bar downbeat (12.0 s).

Readability: every line meant to be read stays settled ≥ 0.3 s/word. The hook is shown close (16 px); the bot's reply holds ≈ 3 s, including a slow scroll so its buttons show.

## Music

Original, synthesized from code (`work/soundtrack.mjs`, deterministic). A chill lo-fi beat at 120 BPM with a half-time feel: an FM electric piano with tape wobble (A minor 9 → F major 9 → D minor 9 → E minor 7, lifting to C major 9 → G6 for the reveal, ending on A minor 9), a warm sub, dusty swung drums and vinyl crackle.

It follows the animations by construction. The composition exports every cue (`window.__cues` → `frames.mjs --cues` → `work/cues.json`), and the soundtrack places a sound on each one. Taps, mentions, friend picks, the count-up, votes and the veto are kalimba and bell notes in key, and the piano dips briefly under each accent. The arrangement changes on the cuts: the drums arrive with the bot, the piano muffles while the picker modal is open, the drums drop out for the spin, and the drums leave for the outro.

Mix: −12.9 LUFS integrated, −1.5 dBFS peak. Through a phone-speaker filter, the sections stay within about 3 dB of each other.

## Revision log

- **v3 (owner feedback):**
  - The phonk was too aggressive. It's now chill lo-fi, generated from the composition's cues so it follows the animations.
  - The Discord bot is the main integration, so the video now opens in a Discord channel: add the bot, `/compare`, the bot's real reply. The web flow follows. The co-op filter scene was cut to keep the length near 24 s.
- **v2 (owner feedback):**
  - The first cut's music read as "corporate, happy-go-lucky", so it became dark phonk.
  - The first cut showed pasting profile links. The real path is Steam sign-in plus the friend picker, so scene 2 shows that flow.
  - Recording it surfaced a product bug: friends added from the picker showed as raw SteamID64s. They now show by name (`CompareForm.jsx`, covered by `tests/e2e/picker.spec.mjs`).
  - Avatars use the site's own pfps (`public/pfp/`, restored) instead of letter circles, in the app's demo players and in the video.

## Variant

Second cut, same assets: **yc-parody** vertical (~18 s, hard cuts, one claim per scene, played straight): "Introducing a breakthrough in deciding what to play." → "39 games. You all own them." → "One spin." → "One veto each." → "Free. webothplay.com".
