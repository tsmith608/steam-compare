# /brag-slim plan — WeBothPlay

Run: brag-slim (Opus 5.5 dispatch from /brag) · format **vertical 1080×1920, 30 fps** (TikTok/Reels/Shorts first) · tone **default** (punchy, playful, clean) over a **dark phonk** track · 21 s · original music + SFX built for this video.

## Inspect — answers

| Question | Answer |
|---|---|
| What is it? | WeBothPlay compares your friends' Steam libraries, shows every game you all own, then helps the group actually pick one. |
| Who is it for / what does it do for them? | Friend groups on Steam stuck in the nightly "what are we playing?" loop. Sign in with Steam → pick friends → shared games → spin or vote → launch. |
| What sets it apart? | It doesn't stop at the overlap: roulette that respects filters, a group vote with **one veto each**, "one copy away", share cards. Free for up to 8 friends. |
| Most impressive / funniest claim | The product's own example group: **39 games they all own** — and *"Everyone owns Bloons TD 6. Nobody has launched it."* |
| Visual hook | A group chat stuck on "idk" → the site's own question: **What are we playing tonight?** |
| Real UI / flow to show | Home form → **Sign in to pick friends** (Steam sign-in) → the **Pick friends** modal (tick friends, "Add 3 to group") → group rows show names → Compare → results ("39 games you all own", overlap rings, fun fact) → filter chips (Co-op: 31 of 39) → Spin → "Tonight's pick" → vote (I'd play / Veto) |
| Tone | default: playful, clean, postable; the joke comes from the real situation (idk / nobody launched Bloons). Music is dark and driving, not bright "corporate" pop. |
| One-line share caption | Sign in with Steam, pick your friends, see every game you all own. Our example group had 39, and nobody had ever launched Bloons TD 6. |

Source material: the real app (production build, mock mode) — its compiled CSS, fonts (Archivo/Inter), components and the labelled example group (fictional players, real games). The signed-in screens are captured from the real flow: a session cookie for demo player Nova stands in for the Steam round trip (the picker lists Nova's mock Steam friends). Avatars are the site's own profile pictures (`public/pfp/`); the demo players use them in the app too (example group, home hero, picker), so the video shows what the site shows. The composition drops the "Demo ·" name prefix, shows Nova's name in place of the mock "Steam user" and adds one unticked friend (Mae, with another of the site's pfps) so the list reads like a real friends list. Steam's image CDN is unreachable from the build machine, so covers show the app's own typographic fallback tiles (also keeps third-party game art out of an ad). Every number on screen comes from the example group; the results carry the site's "Example group" label.

## Angle

**"Stop asking. Start playing."** The group chat says "idk"; WeBothPlay signs you in with Steam, you tick your friends, and it says *39 games you all own*, picks one, and settles arguments with a vote. Lead with the relatable pain, show the two-tap setup, reveal the number on the drop, show the decision tools, end on the URL.

## Storyboard (cuts on the beat, 120 BPM: 1 beat = 0.5 s, bars start on even seconds)

| # | Time | Scene | On screen | Motion | Sound |
|---|---|---|---|---|---|
| 1 | 0.0–2.5 | **Hook** | Group-chat bubbles: "what are we playing tonight?" → "idk" → "idk either lol" → typing… | Bubbles pop in; typing dots | Filtered cowbell hook + hats, a taste of the 808; soft pops on the bubbles |
| 2 | 2.5–6.0 | **Sign in + pick friends** | "Sign in with Steam." over the real form; tap **Sign in to pick friends** → the **Pick friends** modal: tick Bram, Kit, Juno → **Add 3 to group** → rows read *Nova · you, Bram · friend…*, 4/8 players → **Compare libraries** → "Opening results…" | Focus ring + tap, modal slides up, ticks one per beat, rows drop in | Half-time verse; a tap per action; snare roll + riser into the drop |
| 3 | 6.0–9.5 | **Reveal** | Overlap rings close; **39** counts up; "games you all own"; avatars N·B·K·J; fun fact: "Everyone owns it, nobody's launched it: Bloons TD 6" | Rings merge, count-up, card rises | **Drop** on 6.0: kicks, claps, cowbell hook, distorted 808; count ticks; hit on 39 |
| 4 | 9.5–12.0 | **Narrow** | Real result cards + filter chips; tap **Co-op** → "31 of 39 games" | Grid drifts up, chip press, count updates | Tap, soft whoosh |
| 5 | 12.0–15.5 | **Spin** | "Can't decide? Spin for it." → reel of real titles spins, lands on **Deep Rock Galactic** → "Tonight's pick" + "Launch in Steam" | Reel decelerates, highlight | Hook drops out for tension; ratchet ticks slowing; impact on the landing |
| 6 | 15.5–18.0 | **Vote** | "Can't agree? Vote." rows with "I'd play" taps and one **Veto** → "Leading: Deep Rock Galactic" | Taps one per beat, veto strike | Taps, low buzz on the veto, hat roll |
| 7 | 18.0–21.0 | **Outro** | Wordmark, "Find what your group can play tonight.", **webothplay.com**, "Free for groups of up to 8 · Powered by Steam" | Rings settle, type in | Impact, long 808, the hook once more, tape stop |

Durations: 2.5 + 3.5 + 3.5 + 2.5 + 3.5 + 2.5 + 3.0 = **21.0 s**. The reveal (6 s), the spin (12 s) and the outro (18 s) land on bar downbeats.

Readability: every line meant to be read stays settled ≥ 0.3 s/word (hook 5 words ≈ 1.5 s; fun fact held ≈ 2.5 s).

## Music

Original, synthesized from code (`work/soundtrack.mjs`, deterministic): dark phonk at 120 BPM in A minor. A distorted 808 (clean sub plus a clipped growl layer so it still reads on phone speakers) with glides; a cowbell hook in a 3-3-2 rhythm that leans on the ♭2 (B♭); the chords are A minor, B♭ and F. Hard kicks, claps, rolling hats. Every sound effect sits on a composition cue. Mix: −13.5 LUFS integrated, −1.5 dBFS true peak.

## Revision log

- **v2 (owner feedback):** the first cut's music read as "corporate, happy-go-lucky", so it's now dark phonk. The first cut also showed pasting profile links, but the main path is Steam sign-in plus the friend picker, so scene 2 shows that flow. Recording it surfaced a product bug: friends added from the picker showed as raw SteamID64s in the form. They now show by name (`CompareForm.jsx`, covered by `tests/e2e/picker.spec.mjs`). Avatars use the site's own pfps (`public/pfp/`, restored) instead of letter circles, in the app's demo players and in the video.

## Variant

Second cut, same assets: **yc-parody** vertical (~18 s, hard cuts, one claim per scene, played straight): "Introducing a breakthrough in deciding what to play." → "39 games. You all own them." → "One spin." → "One veto each." → "Free. webothplay.com".
