# /brag-slim plan — WeBothPlay

Run: brag-slim (Opus 5.5 dispatch from /brag) · format **vertical 1080×1920, 30 fps** (TikTok/Reels/Shorts first) · tone **default** (punchy, playful, clean) · ~20 s · original music + SFX built for this video.

## Inspect — answers

| Question | Answer |
|---|---|
| What is it? | WeBothPlay compares your friends' Steam libraries, shows every game you all own, then helps the group actually pick one. |
| Who is it for / what does it do for them? | Friend groups on Steam stuck in the nightly "what are we playing?" loop. Paste profile links → shared games → spin or vote → launch. |
| What sets it apart? | It doesn't stop at the overlap: roulette that respects filters, a group vote with **one veto each**, "one copy away", share cards. Free for up to 8 friends. |
| Most impressive / funniest claim | The product's own example group: **39 games they all own** — and *"Everyone owns Bloons TD 6. Nobody has launched it."* |
| Visual hook | A group chat stuck on "idk" → the site's own headline: **What are we playing tonight?** |
| Real UI / flow to show | Home form (paste profiles) → results ("39 games you all own", overlap rings, fun fact) → filter chips (Co-op: 31 of 39) → Spin → "Tonight's pick" → vote (I'd play / Veto) |
| Tone | default: playful, clean, postable; the joke comes from the real situation (idk / nobody launched Bloons). |
| One-line share caption | Four friends, 39 games they all own, and nobody had ever launched Bloons TD 6. WeBothPlay finds what your group can play tonight, then spins for it. |

Source material: the real app (production build, mock mode) — its compiled CSS, fonts (Archivo/Inter), components and the labelled example group (fictional players, real games). Steam's image CDN is unreachable from the build machine, so covers show the app's own typographic fallback tiles (also keeps third-party game art out of an ad). Every number on screen comes from that example group; it carries the site's "Example group" label.

## Angle

**"Stop asking. Start playing."** The group chat says "idk"; WeBothPlay says *39 games you all own*, picks one, and settles arguments with a vote. Lead with the relatable pain, reveal the number, show the decision tools, end on the URL.

## Storyboard (cuts on the beat, 120 BPM: 1 beat = 0.5 s)

| # | Time | Scene | On screen | Motion | Sound |
|---|---|---|---|---|---|
| 1 | 0.0–2.5 | **Hook** | Group-chat bubbles: "what are we playing tonight?" → "idk" → "idk either 💀" | Bubbles pop in on beats; typing dots | Soft pops in key; music enters with filtered intro |
| 2 | 2.5–5.0 | **Paste** | The real "Your group" form: 4 numbered rows fill with profile links; "Compare libraries" pressed | Rows fill one per beat, button press | Light ticks per row, tap |
| 3 | 5.0–8.5 | **Reveal** | Overlap rings close; **39** counts up; "games you all own"; avatars N·B·K·J; fun fact card: "Everyone owns Bloons TD 6. Nobody has launched it." | Rings merge, count-up, card rises | Drop: full groove; rising count blips; bell on 39 |
| 4 | 8.5–11.0 | **Narrow** | Real result cards + filter chips; tap **Co-op** → "31 of 39 games" | Grid drifts up, chip press, count updates | Tap, soft whoosh |
| 5 | 11.0–14.5 | **Spin** | "Pick for us" → reel of real cards spins, lands: **Tonight's pick: Deep Rock Galactic** + "Launch in Steam" | Reel decelerates, highlight ring | Ratchet ticks slowing, chord hit on land |
| 6 | 14.5–17.0 | **Vote** | "Can't agree? Vote." cards with "I'd play" taps and one **Veto** → "Leading: Deep Rock Galactic" | Taps one per beat, veto strike | Taps, low "nope" blip on veto |
| 7 | 17.0–20.0 | **Outro** | Wordmark, "Find what your group can play tonight.", **webothplay.com · free** | Rings settle, type in | Final chord + tail |

Durations: 2.5 + 2.5 + 3.5 + 2.5 + 3.5 + 2.5 + 3.0 = **20.0 s**.

Readability: every line meant to be read stays settled ≥ 0.3 s/word (hook 5 words ≈ 1.5 s; fun fact 9 words ≈ 2.7 s held from 5.6 s to 8.5 s).

## Variant

Second cut, same assets: **yc-parody** vertical (~18 s, hard cuts, one claim per scene, played straight): "Introducing a breakthrough in deciding what to play." → "39 games. You all own them." → "One spin." → "One veto each." → "Free. webothplay.com".
