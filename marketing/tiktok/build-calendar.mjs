#!/usr/bin/env node
// Builds marketing/tiktok/90_DAY_CALENDAR.csv and marketing/renderer/posts.json
// from the content bank below. Edit the bank, then: npm run social:calendar
//
// Cadence (marketing/TIKTOK_RESEARCH_2026.md §3.1): 4 baseline posts/week
// (Mon/Wed/Fri/Sun). Tue/Thu are a reserve bank (publish only in confirmed
// event weeks or after the week-4 gate); Saturday is a trend slot with a
// fallback concept. Steam event content is gated on verifying dates first.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const START = new Date(Date.UTC(2026, 9, 5)); // Mon 5 Oct 2026

// ---------------------------------------------------------------- defaults
const TAGS = {
  core: "#steam #coopgames #gamestoplaywithfriends #webothplay",
  pc: "#pcgaming #multiplayergames #steamgames #webothplay",
  horror: "#steam #horrorgames #coopgames #halloween",
  sale: "#steamsale #pcgaming #coopgames #webothplay",
  meme: "#pcgaming #gamingmemes #steam #webothplay",
  discord: "#discord #steam #coopgames #webothplay",
};
const AUDIO = {
  vo: "Off-camera VO (own voice or TikTok TTS) + UI SFX + low CML bed; swap bed before cross-posting",
  bed: "CML upbeat bed + UI SFX (clicks, whoosh on reveal); no copyrighted music",
  trend: "Trending sound ONLY if it is in the Commercial Music Library; else original audio",
  quiet: "No music: VO + SFX only (keeps it platform-portable)",
};
const METRIC = {
  P1: "Shares per 1k views + comments", P2: "Profile visits + bio link clicks", P3: "Shares + saves",
  P4: "Completion rate (% watched in full)", P5: "Saves", P6: "Saves + Search traffic share",
  P7: "Shares per 1k views", P8: "Profile visits + site visits (utm)", P9: "Search traffic share + link clicks",
  P10: "Follows per 1k views", P11: "Comments (genuine replies)", TREND: "Views at 24h vs. account median",
};
const PILLAR = {
  P1: "P1 Pain point", P2: "P2 Instant demo", P3: "P3 Squad stats (demo data)", P4: "P4 Roulette",
  P5: "P5 Pile of shame (backlog)", P6: "P6 Already own it (recommendations)", P7: "P7 Group chat energy (memes)",
  P8: "P8 Feature drops", P9: "P9 Steam moments", P10: "P10 Build in public", P11: "P11 Ask the squad", TREND: "Trend slot",
};
const EXPERIMENT = (week) =>
  week <= 2 ? "Hook pattern: number-shock vs call-out" :
  week <= 4 ? "Length bucket: 9–20s vs 25–45s" :
  week <= 6 ? "Voiceover vs text-only" :
  week <= 8 ? "Explicit CTA vs question ending" :
  week <= 10 ? "Posting slot (12:00 / 17:00 / 20:00 local)" :
  week <= 12 ? "Photo Mode carousel vs video" : "Series title on screen vs none";

const DEMO = { demo: true };
const NOVA = [
  { name: "Nova", count: 65 }, { name: "Bram", count: 58 }, { name: "Kit", count: 52 }, { name: "Juno", count: 49 },
];
const CTA_SITE = "Compare your group's Steam libraries free — link in bio";
const CTA_Q = "Question ending (no CTA)";

// ------------------------------------------------------------- content bank
// One entry per day, in date order (13 weeks × 7 days).
// slot: base | reserve | trend | event (event = publish only once the event date is verified)
const BANK = [
  // ---- Week 1 (Oct 5–11): launch the new look; pain → demo → spin
  { slot: "base", p: "P1", concept: "4 friends, 1,300 Steam games, nothing to play", hook: "4 friends. 1,300 games. Nothing to play?", len: "12s", format: "Template render", template: "overlap-reveal",
    data: { ...DEMO, hook: "4 friends. 1,300 games. Nothing to play?", players: [{ name: "Nova", count: 412 }, { name: "Bram", count: 377 }, { name: "Kit", count: 298 }, { name: "Juno", count: 221 }], shared: 64, union: 1308, punchline: "64 games they could launch tonight.", funFact: "Most played together: Deep Rock Galactic" },
    visual: "Rings merge, count-up to 64, fun fact, end card", vo: "Four friends, thirteen hundred games... and somehow nothing to play. Here's what they all own.", onscreen: "4 friends · 1,308 games → 64 they ALL own", cta: CTA_Q, caption: "games to play with friends when nobody can decide — what's your group's number?", kw: "games to play with friends, steam games in common", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "reserve", p: "P7", concept: "'What do you guys want to play?' → silence", hook: "Every group chat at 9pm", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["9:02 PM", "Me:: what do you guys wanna play", "Everyone:: idk whatever", "Me:: ok so... nothing again"] },
    visual: "Text-message beats revealed one by one", vo: "—", onscreen: "what do you guys wanna play / idk whatever", cta: CTA_Q, caption: "every group chat at 9pm 😐 #gamestoplaywithfriends", kw: "what game should we play", tags: TAGS.meme, audio: AUDIO.bed },
  { slot: "base", p: "P2", concept: "Paste 4 profiles → shared library in 5 seconds", hook: "Stop asking what everyone owns", len: "20s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Stop asking what everyone owns", demo: true },
    visual: "Record /compare?demo=1: paste links (or demo), results appear, scroll grid, tap 'Co-op' chip", vo: "Paste everyone's Steam profile. Five seconds later: every game you all own, sorted by what you actually play.", onscreen: "paste profiles → every game you ALL own", cta: CTA_SITE, caption: "compare steam libraries with your friends in seconds (free) #steam", kw: "compare steam libraries, steam games in common", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "reserve", p: "P3", concept: "The 'carry' — one friend has all the hours", hook: "One friend: 36 hours. Everyone else: 0.", len: "8s", format: "Template render", template: "stat-card",
    data: { ...DEMO, hook: "Nova carries this game alone.", value: 36, suffix: "h", label: "Nova in Marvel Rivals", sub: "Bram, Kit & Juno: 0 hours combined" },
    visual: "Big count-up 0→36h, then the zero line", vo: "Every group has one. The carry.", onscreen: "Nova: 36h · everyone else: 0h", cta: CTA_Q, caption: "who's the carry in your group? (demo data, fictional friends)", kw: "multiplayer games steam", tags: TAGS.pc, audio: AUDIO.bed },
  { slot: "base", p: "P4", concept: "Spin It #1 — the roulette decides tonight", hook: "Can't decide? Spin it.", len: "10s", format: "Template render", template: "roulette",
    data: { ...DEMO, hook: "Can't decide? Spin it.", titles: ["Deep Rock Galactic", "Lethal Company", "Valheim", "Left 4 Dead 2", "Terraria", "R.E.P.O.", "Phasmophobia", "Risk of Rain 2"], winner: "Left 4 Dead 2", reason: "All 4 own it · 147h together" },
    visual: "Typographic reel spins and lands; 'Tonight's pick'", vo: "No more twenty-minute debates. The wheel picks.", onscreen: "Tonight's pick: Left 4 Dead 2", cta: CTA_Q, caption: "steam game roulette for your friend group — would you accept the spin?", kw: "steam game roulette, what game should we play", tags: TAGS.core, audio: AUDIO.bed },
  { slot: "trend", p: "TREND", concept: "Trend slot — adapt a trending format to 'deciding what to play'", hook: "(from the trend)", len: "9–20s", format: "Template + screen recording", template: null,
    visual: "Use a CML trending sound/format; fallback: post the reserve meme", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "games to play with friends", tags: TAGS.core, audio: AUDIO.trend },
  { slot: "base", p: "P11", concept: "Ask the squad: your group's fallback game", hook: "Your group's fallback game is…", len: "12s", format: "Template render", template: "meme-card",
    data: { lines: ["Every group has a fallback game.", "The one you play when nobody can decide.", "What's yours?"] },
    visual: "Three lines, then end card", vo: "Every group has a fallback game. What's yours?", onscreen: "what's your group's fallback game?", cta: CTA_Q, caption: "be honest: what does your group ALWAYS fall back to? 👇", kw: "games to play with friends", tags: TAGS.core, audio: AUDIO.bed },

  // ---- Week 2 (Oct 12–18): Next Fest window (verify), backlog intro
  { slot: "base", p: "P5", concept: "Pile of Shame #1 — everyone owns it, nobody played it", hook: "All 4 of us own this game.", len: "9s", format: "Template render", template: "nobody-played",
    data: { ...DEMO, players: 4, game: "Bloons TD 6", punchline: "Nobody has ever launched it." },
    visual: "Game title, 'Combined hours: 0' blinks", vo: "All four of us own it. Combined hours: zero.", onscreen: "Combined hours: 0", cta: CTA_Q, caption: "the steam backlog your whole group shares 💀 (demo data)", kw: "steam backlog", tags: TAGS.core, audio: AUDIO.bed },
  { slot: "event", p: "P9", concept: "Steam Next Fest: co-op demos worth trying as a group (only if Next Fest is live — verify dates)", hook: "Free co-op demos this week", len: "35s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Free co-op demos to try with friends" },
    visual: "Screen-record Steam store Next Fest hub (no logos as hero); list 3 co-op demos; end on WeBothPlay", vo: "Next Fest has free co-op demos. Here are three to try with your group tonight.", onscreen: "3 free co-op demos (Next Fest)", cta: CTA_Q, caption: "steam next fest co-op demos to play with friends #steamnextfest", kw: "co-op games on steam, steam next fest", tags: "#steamnextfest #coopgames #pcgaming #steam", audio: AUDIO.vo },
  { slot: "base", p: "P2", concept: "Private profile? Here's who's hiding — and the fix", hook: "Your friend's games won't show up?", len: "25s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Your friend's games won't show up?" },
    visual: "Record a comparison with the private demo friend (76561190000000005): banner, 'Copy a message for them'", vo: "If a friend's games won't show, it's one Steam setting: Game details. We tell you who, and give you the message to send.", onscreen: "Game details → Public", cta: CTA_SITE, caption: "steam game details private? the 30-second fix 🔧", kw: "steam game details private, compare steam libraries", tags: TAGS.pc, audio: AUDIO.vo },
  { slot: "reserve", p: "P6", concept: "5 co-op games your group probably already owns (carousel)", hook: "Co-op games you already own", len: "carousel (7 slides)", format: "Photo Mode carousel", template: "top-five",
    data: { hook: "5 co-op games your group probably already owns", items: [{ name: "Left 4 Dead 2", why: "4-player co-op classic" }, { name: "Portal 2", why: "Short, clever 2-player campaign" }, { name: "Terraria", why: "Endless co-op building and bosses" }, { name: "Risk of Rain 2", why: "Fast roguelike runs, up to 4" }, { name: "Don't Starve Together", why: "Survival chaos for the whole group" }] },
    visual: "Cover + 5 slides + end card", vo: "—", onscreen: "5 co-op games you already own", cta: CTA_Q, caption: "co-op games on steam your group probably already owns — which one are you launching? save this", kw: "co-op games on steam, games to play with friends", tags: TAGS.core, audio: AUDIO.bed },
  { slot: "base", p: "P3", concept: "The overlap you didn't know you had", hook: "We had 39 games in common??", len: "12s", format: "Template render", template: "overlap-reveal",
    data: { ...DEMO, hook: "We had 39 games in common??", players: NOVA, shared: 39, union: 70, punchline: "80% overlap. 39 options.", funFact: "Everyone owns Bloons TD 6. Nobody has launched it." },
    visual: "Rings merge → 39", vo: "We kept saying we had nothing in common. Thirty-nine games.", onscreen: "39 games in common · 80% overlap", cta: CTA_Q, caption: "steam games in common with your friends — guess your overlap % (demo data)", kw: "steam games in common", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "trend", p: "TREND", concept: "Trend slot (fallback: 'Group Chat Energy' meme from bank)", hook: "(from the trend)", len: "9–20s", format: "Template render", template: null, visual: "Adapt the trend in <30 min or post fallback", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "what game should we play", tags: TAGS.meme, audio: AUDIO.trend },
  { slot: "base", p: "P4", concept: "Spin It #2 — filtered to horror co-op first", hook: "Horror night. Let the wheel pick.", len: "10s", format: "Template render", template: "roulette",
    data: { ...DEMO, hook: "Horror night. Let the wheel pick.", titles: ["Phasmophobia", "Lethal Company", "R.E.P.O.", "Content Warning", "The Forest", "Dead by Daylight"], winner: "Lethal Company", reason: "All 4 own it · 116h together" },
    visual: "Reel lands on Lethal Company", vo: "Filter to horror co-op, then spin.", onscreen: "Tonight's pick: Lethal Company", cta: CTA_Q, caption: "co-op horror games to play with friends — the wheel has spoken", kw: "co-op games on steam", tags: TAGS.horror, audio: AUDIO.bed },

  // ---- Week 3 (Oct 19–25): one copy away + votes
  { slot: "base", p: "P2", concept: "One Copy Away — the game only one friend is missing", hook: "Everyone owns it except Juno", len: "20s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Everyone owns it except Juno", demo: true },
    visual: "Record 'One copy away' tab on demo: Baldur's Gate 3 missing Juno; show store link", vo: "Three of us own it. One doesn't. That's the purchase that unlocks game night.", onscreen: "One copy away: 13 games", cta: CTA_SITE, caption: "the one game your friend still doesn't own 👀 (demo data)", kw: "multiplayer games steam, steam games in common", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "reserve", p: "P7", concept: "'I don't mind, you pick' → 40 minutes later", hook: "'I don't mind, you pick'", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["You:: you pick", "Friend:: no you pick", "40 minutes later", "Everyone:: ...we should just go to bed"] },
    visual: "Beats + end card", vo: "—", onscreen: "you pick / no you pick", cta: CTA_Q, caption: "the hardest multiplayer game is deciding what to launch", kw: "what game should we play", tags: TAGS.meme, audio: AUDIO.bed },
  { slot: "base", p: "P8", concept: "Group vote with one veto each", hook: "Settle it with a vote. One veto each.", len: "25s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "One veto each. No more arguing." },
    visual: "Star 3 games → Start a vote → open /poll on phone → tap, veto → results", vo: "Shortlist three games, send the vote link. Everyone gets one veto. Highest score wins.", onscreen: "shortlist → vote link → one veto each", cta: CTA_SITE, caption: "how to pick a game with friends without a 30 minute debate", kw: "what game should we play, games to play with friends", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "reserve", p: "P6", concept: "Remote Play Together: only the host needs the game", hook: "Only ONE of you needs to own it", len: "20s", format: "Template render", template: "stat-card",
    data: { hook: "Only ONE of you needs to own it.", value: 1, suffix: " copy", label: "Remote Play Together", sub: "The host owns it; friends join through Steam (in supported games)" },
    visual: "Stat card '1 copy'", vo: "In games that support Remote Play Together, only the host needs to own it.", onscreen: "1 copy · Remote Play Together", cta: CTA_Q, caption: "steam remote play together: friends join without buying (supported games) — did you know?", kw: "co-op games on steam", tags: TAGS.pc, audio: AUDIO.vo },
  { slot: "base", p: "P1", concept: "Manually checking everyone's library vs. 5 seconds", hook: "Checking 4 libraries by hand?", len: "15s", format: "Template + screen recording", template: "hook-overlay", data: { text: "Checking 4 libraries by hand? 😩" },
    visual: "Split: scrolling a Steam library forever (blurred, no logos) vs. WeBothPlay result", vo: "You could scroll four libraries... or paste four links.", onscreen: "30 minutes vs 5 seconds", cta: CTA_SITE, caption: "compare steam libraries the fast way (free)", kw: "compare steam libraries", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "trend", p: "TREND", concept: "Trend slot (fallback: Ask the squad prompt)", hook: "(from the trend)", len: "9–20s", format: "Template render", template: null, visual: "Adapt or fallback", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "games to play with friends", tags: TAGS.core, audio: AUDIO.trend },
  { slot: "base", p: "P3", concept: "Squad stats: hours your group has sunk into shared games", hook: "Our group: 5,383 hours in shared games", len: "8s", format: "Template render", template: "stat-card",
    data: { ...DEMO, hook: "4 friends. Shared games only.", value: 5383, suffix: "h", label: "played together (and apart)", sub: "Most of it in Counter-Strike 2" },
    visual: "Count-up 0→5,383h", vo: "Four friends. Five thousand hours in games they all own.", onscreen: "5,383 hours", cta: CTA_Q, caption: "how many hours has your group sunk into the same games? (demo data)", kw: "multiplayer games steam", tags: TAGS.pc, audio: AUDIO.bed },

  // ---- Week 4 (Oct 26–Nov 1): HALLOWEEN (Sat Oct 31) — event week
  { slot: "base", p: "P6", concept: "Co-op horror your group already owns (Halloween)", hook: "Halloween co-op you already own", len: "carousel (7 slides)", format: "Photo Mode carousel", template: "top-five",
    data: { hook: "Co-op horror games your group might already own", items: [{ name: "Phasmophobia", why: "Ghost hunting for up to 4" }, { name: "Lethal Company", why: "Scrap, scream, repeat" }, { name: "R.E.P.O.", why: "Physics-chaos horror heists" }, { name: "Content Warning", why: "Film the horror, go viral" }, { name: "Dead by Daylight", why: "4 vs 1 classic" }] },
    visual: "Cover + 5 + end", vo: "—", onscreen: "co-op horror you already own", cta: CTA_Q, caption: "co-op horror games to play with friends this halloween 🎃 save for friday", kw: "co-op games on steam, horror games with friends", tags: TAGS.horror, audio: AUDIO.bed },
  { slot: "event", p: "P9", concept: "Steam Scream Fest picks (ONLY if Scream Fest dates are confirmed)", hook: "Scream Fest co-op picks", len: "35s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Scream Fest co-op picks" },
    visual: "Store recording; 3 picks; WeBothPlay 'one copy away' angle", vo: "Scream Fest is on. Here's how to pick a horror game your whole group will actually play.", onscreen: "3 horror co-op picks", cta: CTA_Q, caption: "steam scream fest co-op picks #steam", kw: "steam sale, co-op games on steam", tags: TAGS.horror, audio: AUDIO.vo },
  { slot: "base", p: "P4", concept: "Spin It: Halloween edition", hook: "Spin for tonight's scare", len: "10s", format: "Template render", template: "roulette",
    data: { ...DEMO, hook: "Spin for tonight's scare.", titles: ["Phasmophobia", "R.E.P.O.", "Content Warning", "Lethal Company", "The Forest", "Sons Of The Forest"], winner: "R.E.P.O.", reason: "All 4 own it · played this week" },
    visual: "Reel → R.E.P.O.", vo: "Halloween. Horror filter on. Spin.", onscreen: "Tonight's pick: R.E.P.O.", cta: CTA_Q, caption: "halloween game night: the wheel picked R.E.P.O. 👻", kw: "steam game roulette", tags: TAGS.horror, audio: AUDIO.bed },
  { slot: "event", p: "P7", concept: "That one friend who won't play horror (Halloween meme)", hook: "That one friend on horror night", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["Us:: horror night!!", "That one friend:: I'll just watch", "Also that friend:: *screams first*"] },
    visual: "Beats", vo: "—", onscreen: "I'll just watch", cta: CTA_Q, caption: "tag the friend who 'just watches' 👀", kw: "horror games with friends", tags: TAGS.horror, audio: AUDIO.bed },
  { slot: "base", p: "P5", concept: "Pile of Shame: the horror game nobody's opened", hook: "We all bought it on sale. Nobody played it.", len: "9s", format: "Template render", template: "nobody-played",
    data: { ...DEMO, players: 4, game: "Sons Of The Forest", punchline: "Halloween is the excuse." },
    visual: "Title + 'Combined hours: 0'", vo: "We all bought it on sale. Combined hours: zero.", onscreen: "Combined hours: 0", cta: CTA_Q, caption: "the horror game your whole group owns and nobody opened (demo data)", kw: "steam backlog", tags: TAGS.horror, audio: AUDIO.bed },
  { slot: "event", p: "TREND", concept: "HALLOWEEN (Sat Oct 31) — trend slot: costume/scare format adapted to game night", hook: "(from the trend)", len: "9–20s", format: "Template + screen recording", template: null, visual: "Adapt a Halloween trend; keep product visible", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "games to play with friends", tags: TAGS.horror, audio: AUDIO.trend },
  { slot: "base", p: "P11", concept: "Ask the squad: scariest co-op game you've played together", hook: "Scariest game your group has played?", len: "12s", format: "Template render", template: "meme-card",
    data: { lines: ["Halloween's over.", "But be honest:", "What's the scariest game your group has played together?"] },
    visual: "Lines + end card", vo: "What's the scariest game your group has played together?", onscreen: "scariest co-op game?", cta: CTA_Q, caption: "drop your group's scariest co-op game 👇", kw: "co-op games on steam", tags: TAGS.horror, audio: AUDIO.bed },

  // ---- Week 5 (Nov 2–8): sharing + voice
  { slot: "base", p: "P8", concept: "Share card: send your overlap to the group chat", hook: "Send this to your group chat", len: "20s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Send this to your group chat" },
    visual: "Press Share → preview card → paste in Discord (demo); show the card unfurl", vo: "One tap and your group's overlap becomes a card in the chat.", onscreen: "share → card in your chat", cta: CTA_SITE, caption: "steam games in common, as a card for your group chat", kw: "steam games in common", tags: TAGS.discord, audio: AUDIO.vo },
  { slot: "reserve", p: "P7", concept: "Steam library vs. games actually played", hook: "My Steam library vs. what I play", len: "9s", format: "Template render", template: "stat-card",
    data: { hook: "My Steam library vs. what I actually play", value: 412, label: "games owned", sub: "Played this year: the same 3." },
    visual: "412 count-up, then punchline", vo: "Four hundred games. The same three.", onscreen: "412 owned · 3 played", cta: CTA_Q, caption: "be honest how many games in your library have you never opened", kw: "steam backlog", tags: TAGS.meme, audio: AUDIO.bed },
  { slot: "base", p: "P2", concept: "Filter like a pro: co-op + controller + nobody's played", hook: "3 taps to tonight's game", len: "20s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "3 taps to tonight's game", demo: true },
    visual: "Tap chips: Co-op, Controller, Nobody's played → list shrinks → spin", vo: "Co-op. Controller. Nobody's played it. Three taps, one game.", onscreen: "Co-op · Controller · Nobody's played", cta: CTA_SITE, caption: "find co-op games on steam your friends already own", kw: "co-op games on steam", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "reserve", p: "P3", concept: "Library sizes in one friend group (bar race)", hook: "Who has the biggest library?", len: "12s", format: "Template render", template: "overlap-reveal",
    data: { ...DEMO, hook: "Who has the biggest Steam library?", players: [{ name: "Ash", count: 1204 }, { name: "Remy", count: 311 }, { name: "Ola", count: 96 }], shared: 58, union: 1460, punchline: "Ash owns 1,204 games. They share 58.", funFact: "Ola owns 96 — and 58 of them overlap." },
    visual: "Counts climb, rings merge → 58", vo: "Twelve hundred games, and only fifty-eight they all share.", onscreen: "1,204 vs 96 → 58 shared", cta: CTA_Q, caption: "the friend with 1,200 steam games vs the friend with 96 (demo data)", kw: "steam games in common", tags: TAGS.pc, audio: AUDIO.bed },
  { slot: "base", p: "P6", concept: "Games for 5+ friends (headcount problem)", hook: "Too many friends for 4-player games?", len: "35s", format: "Template render", template: "top-five",
    data: { hook: "Big group? Games that fit more than 4", items: [{ name: "Valheim", why: "Up to 10 per server" }, { name: "Among Us", why: "Social deduction for big groups" }, { name: "Garry's Mod", why: "Sandbox chaos, big lobbies" }, { name: "Project Zomboid", why: "Survive together, many players" }, { name: "Golf With Your Friends", why: "Party golf, up to 12" }] },
    visual: "List reveal", vo: "Most co-op games stop at four. These don't.", onscreen: "5+ friends? try these", cta: CTA_Q, caption: "multiplayer games for big friend groups (5+) — save this", kw: "multiplayer games steam, games to play with friends", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "trend", p: "TREND", concept: "Trend slot (fallback: reply-to-comment video from week's best comment)", hook: "(from the trend / comment)", len: "9–20s", format: "Reply-to-comment video", template: null, visual: "Reply to a real comment with a demo", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "compare steam libraries", tags: TAGS.core, audio: AUDIO.trend },
  { slot: "base", p: "P4", concept: "Spin It: 'loser picks next time' rule", hook: "New rule: the wheel decides", len: "10s", format: "Template render", template: "roulette",
    data: { ...DEMO, hook: "New rule: the wheel decides.", titles: ["Stardew Valley", "Terraria", "Deep Rock Galactic", "Portal 2", "Golf With Your Friends", "Overcooked! 2"], winner: "Overcooked! 2", reason: "All 4 own it · friendship test" },
    visual: "Reel → Overcooked! 2", vo: "New rule. Nobody argues with the wheel.", onscreen: "Tonight's pick: Overcooked! 2", cta: CTA_Q, caption: "the wheel picked overcooked. pray for our friendship", kw: "steam game roulette", tags: TAGS.core, audio: AUDIO.bed },

  // ---- Week 6 (Nov 9–15): Discord week
  { slot: "base", p: "P8", concept: "Discord bot: /compare everyone in voice", hook: "Type /compare in your voice channel", len: "20s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Type /compare in voice" },
    visual: "Record bot in a test server: /compare → embed → 'View full comparison'", vo: "Already in voice? Type slash compare. It checks everyone in the channel.", onscreen: "/compare → shared games", cta: "Add the bot — link in bio", caption: "discord bot that finds games your whole server owns", kw: "games to play with friends, discord bot", tags: TAGS.discord, audio: AUDIO.vo },
  { slot: "reserve", p: "P7", concept: "Discord at 10pm: 'GG one more?'", hook: "'one more game' at 2am", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["10:00 PM:: one game", "11:30 PM:: ok one more", "2:14 AM:: last one fr", "Work tomorrow:: 💀"] },
    visual: "Beats", vo: "—", onscreen: "one more game", cta: CTA_Q, caption: "it's never one more game", kw: "games to play with friends", tags: TAGS.meme, audio: AUDIO.bed },
  { slot: "base", p: "P5", concept: "Pile of Shame #3: the free game everyone claimed", hook: "Everyone claimed it. Nobody played it.", len: "9s", format: "Template render", template: "nobody-played",
    data: { ...DEMO, players: 4, game: "Party Animals", punchline: "Tonight's the night." },
    visual: "Combined hours: 0", vo: "Everyone grabbed it. Nobody played it.", onscreen: "Combined hours: 0", cta: CTA_Q, caption: "your group's backlog is free entertainment 💀 (demo data)", kw: "steam backlog", tags: TAGS.core, audio: AUDIO.bed },
  { slot: "reserve", p: "P2", concept: "Sign in & pick friends from your Steam list", hook: "Pick friends straight from Steam", len: "15s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Pick friends straight from Steam" },
    visual: "Sign in through Steam (blur personal info) → Pick from Steam friends → compare", vo: "Sign in through Steam, tick your friends, compare. No copying links.", onscreen: "sign in → tick friends → compare", cta: CTA_SITE, caption: "compare steam libraries with your friends list", kw: "compare steam libraries", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "base", p: "P1", concept: "The 20-minute debate (time-lapse)", hook: "We spent 20 minutes deciding", len: "12s", format: "Template render", template: "stat-card",
    data: { hook: "Time spent deciding vs. playing", value: 23, suffix: " min", label: "deciding what to play", sub: "Time playing before someone had to leave: 15 min" },
    visual: "Count-up 23 min", vo: "Twenty-three minutes deciding. Fifteen playing.", onscreen: "23 min deciding · 15 playing", cta: CTA_SITE, caption: "the hardest multiplayer game is deciding what to launch", kw: "what game should we play", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "trend", p: "TREND", concept: "Trend slot (fallback: 'Carry Report' stat card)", hook: "(from the trend)", len: "9–20s", format: "Template render", template: null, visual: "Adapt or fallback", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "multiplayer games steam", tags: TAGS.pc, audio: AUDIO.trend },
  { slot: "base", p: "P11", concept: "Ask the squad: biggest library in your group?", hook: "How many Steam games do you own?", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["Quick poll:", "How many games are in your Steam library?", "Under 50 · 50–200 · 200–500 · 500+"] },
    visual: "Lines", vo: "How many games are in your Steam library?", onscreen: "how many steam games do you own?", cta: CTA_Q, caption: "how many games are in your steam library? be honest 👇", kw: "steam games", tags: TAGS.pc, audio: AUDIO.bed },

  // ---- Week 7 (Nov 16–22): recommendations + build in public
  { slot: "base", p: "P6", concept: "Short-session co-op (under an hour)", hook: "Only have an hour? Play these", len: "carousel (7 slides)", format: "Photo Mode carousel", template: "top-five",
    data: { hook: "Co-op games for when you only have an hour", items: [{ name: "Risk of Rain 2", why: "One run ≈ 30–45 min" }, { name: "Deep Rock Galactic", why: "Missions fit a lunch break" }, { name: "Golf With Your Friends", why: "18 holes of chaos" }, { name: "Vampire Survivors", why: "30-minute couch co-op runs" }, { name: "Overcooked! 2", why: "Short levels, loud friends" }] },
    visual: "Cover + 5 + end", vo: "—", onscreen: "1 hour? these.", cta: CTA_Q, caption: "co-op games for a quick session with friends — save this", kw: "co-op games on steam", tags: TAGS.core, audio: AUDIO.bed },
  { slot: "reserve", p: "P10", concept: "Build in public: why the free tier now covers 8 players", hook: "Why we made it free for 8", len: "35s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Why we made it free for 8 friends" },
    visual: "Talk over the pricing page; honest reasoning (Steam's own feature does 8)", vo: "Steam already compares up to eight people for free, so we made ours free for eight too — with way more on top.", onscreen: "free for up to 8", cta: CTA_SITE, caption: "building a tool for game night: why we made it free for 8", kw: "compare steam libraries", tags: TAGS.pc, audio: AUDIO.quiet },
  { slot: "base", p: "P3", concept: "The overlap with a 3-person group", hook: "3 friends, 900 games, 31 shared", len: "12s", format: "Template render", template: "overlap-reveal",
    data: { ...DEMO, hook: "3 friends. 900 games.", players: [{ name: "Theo", count: 402 }, { name: "Mae", count: 288 }, { name: "Rin", count: 214 }], shared: 31, union: 812, punchline: "31 games all three can play tonight.", funFact: "Rin is one copy away from 12 more." },
    visual: "Rings → 31", vo: "Three friends. Nine hundred games. Thirty-one they all own.", onscreen: "31 shared", cta: CTA_Q, caption: "what's your trio's overlap? (demo data)", kw: "steam games in common", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "reserve", p: "P7", concept: "The friend who owns everything except the one game", hook: "Owns 800 games. Not this one.", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["Friend with 800 Steam games:", "*doesn't own the one game we want*", "'I'll get it on sale'", "(they will not)"] },
    visual: "Beats", vo: "—", onscreen: "I'll get it on sale", cta: CTA_Q, caption: "tag the friend who owns everything except the game you want", kw: "games to play with friends", tags: TAGS.meme, audio: AUDIO.bed },
  { slot: "base", p: "P2", concept: "Full walkthrough: 0 → game launched in 30 seconds", hook: "From 'what do we play' to launched in 30s", len: "35s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "0 → launched in 30 seconds", demo: true },
    visual: "Timer overlay; paste → filter → spin → 'Launch in Steam'", vo: "Thirty seconds. Paste, filter, spin, launch.", onscreen: "00:30", cta: CTA_SITE, caption: "how to pick a game with friends in 30 seconds", kw: "what game should we play, compare steam libraries", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "trend", p: "TREND", concept: "Trend slot (fallback: Ask the squad)", hook: "(from the trend)", len: "9–20s", format: "Template render", template: null, visual: "Adapt or fallback", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "games to play with friends", tags: TAGS.core, audio: AUDIO.trend },
  { slot: "base", p: "P4", concept: "Spin It: survivors-only (after vetoes)", hook: "3 vetoes later… spin the survivors", len: "12s", format: "Template render", template: "roulette",
    data: { ...DEMO, hook: "3 vetoes later. Spin the survivors.", titles: ["Valheim", "Terraria", "Deep Rock Galactic", "Stardew Valley"], winner: "Valheim", reason: "Survived the vote · 2 yes votes" },
    visual: "Short reel of 4 survivors → Valheim", vo: "Everyone used their veto. Spin what's left.", onscreen: "Tonight's pick: Valheim", cta: CTA_Q, caption: "group vote with vetoes, then the wheel decides", kw: "steam game roulette", tags: TAGS.core, audio: AUDIO.bed },

  // ---- Week 8 (Nov 23–29): THANKSGIVING (Thu Nov 26) · BLACK FRIDAY (Fri Nov 27) · Autumn Sale (verify) — event week
  { slot: "base", p: "P9", concept: "Before the sale: check what's 'one copy away'", hook: "Before you buy anything on sale", len: "20s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Before you buy anything on sale…", demo: true },
    visual: "One copy away tab → price + discount from store data", vo: "Before the sales: check which games your group is one copy away from. That's the best buy.", onscreen: "one copy away = best buy", cta: CTA_SITE, caption: "steam sale tip: buy the game that unlocks the most game nights", kw: "steam sale, games to play with friends", tags: TAGS.sale, audio: AUDIO.vo },
  { slot: "event", p: "P9", concept: "Steam Autumn Sale: group buys under $10 (ONLY once sale dates/prices are verified)", hook: "Group picks under $10", len: "35s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Co-op picks under $10 (this sale)" },
    visual: "Store recording with live prices; never quote prices without checking that day", vo: "Five co-op games under ten dollars this sale. Check which your friends already own.", onscreen: "co-op under $10", cta: CTA_Q, caption: "steam autumn sale co-op picks under $10 #steamsale", kw: "steam sale, co-op games on steam", tags: TAGS.sale, audio: AUDIO.vo },
  { slot: "base", p: "P6", concept: "Thanksgiving: couch co-op for family", hook: "Home for the holidays? Couch co-op", len: "carousel (7 slides)", format: "Photo Mode carousel", template: "top-five",
    data: { hook: "Couch co-op for when the family's home", items: [{ name: "Overcooked! 2", why: "Chaos in the kitchen, up to 4" }, { name: "It Takes Two", why: "2-player, one copy via Friend's Pass" }, { name: "Stardew Valley", why: "Cozy split-screen farming" }, { name: "Castle Crashers", why: "4-player couch brawler" }, { name: "Vampire Survivors", why: "Local co-op, easy to learn" }] },
    visual: "Cover + 5 + end", vo: "—", onscreen: "couch co-op picks", cta: CTA_Q, caption: "couch co-op games for thanksgiving with family — save this 🦃", kw: "co-op games on steam, games to play with friends", tags: TAGS.core, audio: AUDIO.bed },
  { slot: "event", p: "P7", concept: "THANKSGIVING (Thu Nov 26): 'what are you thankful for' → shared library", hook: "Thankful for 39 games in common", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["Thankful for:", "friends who game", "39 games in common", "and the wheel that decides for us"] },
    visual: "Beats", vo: "—", onscreen: "thankful for 39 games in common", cta: CTA_Q, caption: "happy thanksgiving to everyone with a group chat 🦃", kw: "games to play with friends", tags: TAGS.core, audio: AUDIO.bed },
  { slot: "base", p: "P3", concept: "BLACK FRIDAY (Fri Nov 27): the one purchase that unlocks 13 games", hook: "1 purchase = 13 more games together", len: "8s", format: "Template render", template: "stat-card",
    data: { ...DEMO, hook: "Juno buys ONE game…", value: 13, label: "games the group is one copy away from", sub: "Best buy: Baldur's Gate 3 (everyone else owns it)" },
    visual: "Count-up 13", vo: "Black Friday tip: buy the game your friends already own.", onscreen: "one copy away: 13", cta: CTA_SITE, caption: "black friday gaming tip: buy what your friends already own (demo data)", kw: "steam sale, steam games in common", tags: TAGS.sale, audio: AUDIO.vo },
  { slot: "event", p: "TREND", concept: "Black Friday weekend trend slot (deals energy; no price claims without checking)", hook: "(from the trend)", len: "9–20s", format: "Template + screen recording", template: null, visual: "Adapt a shopping trend to 'buy what your friends own'", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "steam sale", tags: TAGS.sale, audio: AUDIO.trend },
  { slot: "base", p: "P5", concept: "Pile of Shame: what you bought last sale", hook: "Last sale's haul: still unplayed", len: "9s", format: "Template render", template: "nobody-played",
    data: { ...DEMO, players: 4, game: "Destiny 2", punchline: "Play the backlog before the next sale." },
    visual: "Combined hours: 0", vo: "Before you buy more... this is still unplayed.", onscreen: "Combined hours: 0", cta: CTA_Q, caption: "check your shared backlog before the steam sale (demo data)", kw: "steam backlog, steam sale", tags: TAGS.sale, audio: AUDIO.bed },

  // ---- Week 9 (Nov 30–Dec 6): CYBER MONDAY (Mon Nov 30) + wishlists
  { slot: "base", p: "P8", concept: "Wishlist overlap: the game your whole group wants", hook: "The game ALL of you wishlisted", len: "20s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "The game you ALL wishlisted", demo: true },
    visual: "Wishlists tab: Split Fiction on every wishlist (demo)", vo: "It's on everyone's wishlist. Buy it together when it drops.", onscreen: "on every wishlist", cta: CTA_SITE, caption: "cyber monday: find the game your whole group wishlisted", kw: "steam games in common", tags: TAGS.sale, audio: AUDIO.vo },
  { slot: "reserve", p: "P7", concept: "Wishlist 400 games, buy 0", hook: "My wishlist vs. my wallet", len: "9s", format: "Template render", template: "stat-card",
    data: { hook: "My Steam wishlist vs. my wallet", value: 214, label: "games wishlisted", sub: "Bought this sale: 0. Waiting for -90%." },
    visual: "214 count-up", vo: "Two hundred fourteen wishlisted. Zero bought.", onscreen: "214 wishlisted · 0 bought", cta: CTA_Q, caption: "how big is your wishlist", kw: "steam sale", tags: TAGS.meme, audio: AUDIO.bed },
  { slot: "base", p: "P2", concept: "Gift ideas: what your friend wants that you can vouch for", hook: "Steal this gift idea trick", len: "20s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Gift idea trick for gamer friends", demo: true },
    visual: "Wishlists tab → Gift ideas: 'Kit wants it · Nova owns it' → Gift on Steam", vo: "Your friend wants it. You already own it and love it. That's the gift.", onscreen: "they want it · you own it", cta: CTA_SITE, caption: "gift ideas for gamer friends (that they actually want)", kw: "steam games", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "reserve", p: "P6", concept: "Free-to-play fallbacks everyone can install", hook: "Nothing in common? Free games", len: "carousel (7 slides)", format: "Photo Mode carousel", template: "top-five",
    data: { hook: "Zero games in common? Free fallbacks", items: [{ name: "Team Fortress 2", why: "Classic, free, still chaotic" }, { name: "Warframe", why: "Free co-op looter" }, { name: "Brawlhalla", why: "Free platform fighter" }, { name: "THE FINALS", why: "Free team shooter" }, { name: "Dota 2", why: "Free, if you dare" }] },
    visual: "Cover + 5 + end", vo: "—", onscreen: "free fallbacks", cta: CTA_Q, caption: "free games to play with friends on steam — save this", kw: "games to play with friends, multiplayer games steam", tags: TAGS.core, audio: AUDIO.bed },
  { slot: "base", p: "P1", concept: "When one friend has a private profile", hook: "'Why can't I see your games?'", len: "15s", format: "Template render", template: "meme-card",
    data: { lines: ["Us:: what games do you have", "Friend:: idk just check my steam", "Their profile:: 🔒 Game details private", "Us:: 😐"] },
    visual: "Beats → end card", vo: "—", onscreen: "game details private 🔒", cta: CTA_SITE, caption: "steam game details private? one setting fixes it (guide in bio)", kw: "steam game details private", tags: TAGS.pc, audio: AUDIO.bed },
  { slot: "trend", p: "TREND", concept: "Trend slot (fallback: Spin It)", hook: "(from the trend)", len: "9–20s", format: "Template render", template: null, visual: "Adapt or fallback", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "steam game roulette", tags: TAGS.core, audio: AUDIO.trend },
  { slot: "base", p: "P3", concept: "Most played together vs. most owned", hook: "Most played together: 1,685 hours", len: "8s", format: "Template render", template: "stat-card",
    data: { ...DEMO, hook: "Our most-played shared game:", value: 1685, suffix: "h", label: "Counter-Strike 2", sub: "Juno's share: 42 minutes" },
    visual: "Count-up 1,685h", vo: "Sixteen hundred hours together. Juno: forty-two minutes.", onscreen: "1,685h · Juno: 42 min", cta: CTA_Q, caption: "the game your group has sunk the most hours into (demo data)", kw: "multiplayer games steam", tags: TAGS.pc, audio: AUDIO.bed },

  // ---- Week 10 (Dec 7–13): Game Awards window (verify) + recommendations
  { slot: "base", p: "P6", concept: "Underrated co-op your group owns from bundles", hook: "Bundles gave you these co-op gems", len: "35s", format: "Template render", template: "top-five",
    data: { hook: "Co-op gems you probably got in a bundle", items: [{ name: "Warhammer: Vermintide 2", why: "4-player melee horde co-op" }, { name: "PAYDAY 2", why: "Heists for 4" }, { name: "Don't Starve Together", why: "Survive (badly) together" }, { name: "Tabletop Simulator", why: "Any board game, online" }, { name: "Portal 2", why: "The co-op campaign holds up" }] },
    visual: "List reveal", vo: "Check your library. You probably own these already.", onscreen: "co-op gems from bundles", cta: CTA_Q, caption: "co-op games on steam you forgot you owned — check your library", kw: "co-op games on steam", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "event", p: "P9", concept: "The Game Awards: co-op nominees your group can play (ONLY once date + nominees are confirmed)", hook: "Game Awards co-op picks", len: "35s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Game Awards: co-op picks" },
    visual: "Text-led; no broadcast footage; list confirmed nominees only", vo: "The Game Awards are this week. Here are the co-op nominees, and how to check who in your group owns them.", onscreen: "co-op nominees", cta: CTA_Q, caption: "game awards co-op nominees to play with friends", kw: "co-op games on steam", tags: TAGS.pc, audio: AUDIO.vo },
  { slot: "base", p: "P4", concept: "Spin It: the 'cozy' filter", hook: "Cozy night. Spin.", len: "10s", format: "Template render", template: "roulette",
    data: { ...DEMO, hook: "Cozy night. Spin.", titles: ["Stardew Valley", "Don't Starve Together", "Terraria", "Golf With Your Friends", "Bloons TD 6", "Overcooked! 2"], winner: "Stardew Valley", reason: "All 4 own it · 385h together" },
    visual: "Reel → Stardew Valley", vo: "Cozy filter. Spin. Farm.", onscreen: "Tonight's pick: Stardew Valley", cta: CTA_Q, caption: "cozy co-op game night, decided by the wheel", kw: "steam game roulette", tags: TAGS.core, audio: AUDIO.bed },
  { slot: "reserve", p: "P7", concept: "Patch notes day: 'one more game' energy", hook: "When the group finally agrees", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["Group chat:: what are we playing", "Me:: *sends vote link*", "Everyone:: *votes in 30 seconds*", "Me:: why didn't we do this years ago"] },
    visual: "Beats", vo: "—", onscreen: "votes in 30 seconds", cta: CTA_Q, caption: "the vote link era", kw: "what game should we play", tags: TAGS.meme, audio: AUDIO.bed },
  { slot: "base", p: "P2", concept: "Big group demo: 8 friends, one comparison", hook: "8 friends. 1 comparison.", len: "20s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "8 friends. 1 comparison.", demo: true },
    visual: "Paste 8 profile links at once (multi-paste), results", vo: "Paste eight profiles at once. Free.", onscreen: "8 friends · free", cta: CTA_SITE, caption: "compare steam libraries for big friend groups (up to 8 free)", kw: "compare steam libraries", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "trend", p: "TREND", concept: "Trend slot (fallback: Ask the squad)", hook: "(from the trend)", len: "9–20s", format: "Template render", template: null, visual: "Adapt or fallback", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "games to play with friends", tags: TAGS.core, audio: AUDIO.trend },
  { slot: "base", p: "P11", concept: "Ask the squad: game you'd force your friends to play", hook: "One game you'd force on your friends", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["You can make your friends play ONE game together.", "No complaints allowed.", "What is it?"] },
    visual: "Lines", vo: "You can make your friends play one game. What is it?", onscreen: "one game, no complaints", cta: CTA_Q, caption: "what game would you force your friend group to play? 👇", kw: "games to play with friends", tags: TAGS.core, audio: AUDIO.bed },

  // ---- Week 11 (Dec 14–20): Winter Sale window (verify) — event week if confirmed
  { slot: "base", p: "P9", concept: "Winter Sale plan: shared wishlist first, then one-copy-away", hook: "Your Winter Sale game plan", len: "20s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Winter Sale plan for your group", demo: true },
    visual: "Wishlists tab → one copy away tab", vo: "Winter Sale plan: buy what everyone wishlisted, then the game one friend is missing.", onscreen: "1. shared wishlist 2. one copy away", cta: CTA_SITE, caption: "steam winter sale plan for your friend group", kw: "steam sale, steam games in common", tags: TAGS.sale, audio: AUDIO.vo },
  { slot: "event", p: "P9", concept: "Steam Winter Sale day 1 (ONLY once dates are verified): group buys", hook: "Winter Sale: group buys", len: "35s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Winter Sale: buy these as a group" },
    visual: "Store recording, verified prices only", vo: "The Winter Sale is live. Here's what's worth buying as a group.", onscreen: "group buys", cta: CTA_Q, caption: "steam winter sale co-op picks for friends #steamwintersale", kw: "steam sale, co-op games on steam", tags: "#steamwintersale #steamsale #coopgames #pcgaming", audio: AUDIO.vo },
  { slot: "base", p: "P5", concept: "Pile of Shame: holiday backlog challenge", hook: "Backlog challenge: holiday edition", len: "12s", format: "Template render", template: "stat-card",
    data: { ...DEMO, hook: "Holiday challenge: play the backlog", value: 13, label: "games all 4 own, nobody's really played", sub: "One per night until New Year?" },
    visual: "Count-up 13", vo: "Thirteen games we all own and never played. One a night until New Year.", onscreen: "13 unplayed", cta: CTA_SITE, caption: "steam backlog challenge for your friend group (demo data)", kw: "steam backlog", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "event", p: "P7", concept: "Winter Sale meme: 'I have no money' → buys 6 games", hook: "'I'm not buying anything this sale'", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["Me before the sale:: I'm not buying anything", "Me 4 minutes in:: *6 games in cart*", "My backlog:: 👁️👄👁️"] },
    visual: "Beats", vo: "—", onscreen: "not buying anything", cta: CTA_Q, caption: "every steam sale ever", kw: "steam sale", tags: TAGS.sale, audio: AUDIO.bed },
  { slot: "base", p: "P8", concept: "Saved groups: one tap to compare your squad again", hook: "Your squad, one tap away", len: "15s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Your squad, one tap away" },
    visual: "Save group → home page saved chip → instant compare", vo: "Save your group once. Next time it's one tap.", onscreen: "save group → one tap", cta: CTA_SITE, caption: "save your friend group and compare again in one tap", kw: "compare steam libraries", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "event", p: "TREND", concept: "Winter Sale weekend trend slot", hook: "(from the trend)", len: "9–20s", format: "Template + screen recording", template: null, visual: "Adapt; no unverified prices", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "steam sale", tags: TAGS.sale, audio: AUDIO.trend },
  { slot: "base", p: "P6", concept: "Gift-friendly co-op: buy one, play together", hook: "Gift this and you both win", len: "carousel (7 slides)", format: "Photo Mode carousel", template: "top-five",
    data: { hook: "Co-op gifts that come with a game night", items: [{ name: "It Takes Two", why: "Friend's Pass: one copy, two players" }, { name: "Split Fiction", why: "2-player co-op adventure" }, { name: "Deep Rock Galactic", why: "Rock and stone, up to 4" }, { name: "Valheim", why: "Viking survival with friends" }, { name: "R.E.P.O.", why: "Cheap, loud, hilarious" }] },
    visual: "Cover + 5 + end", vo: "—", onscreen: "co-op gifts", cta: CTA_Q, caption: "co-op game gifts for friends this holiday — save this 🎁", kw: "co-op games on steam, games to play with friends", tags: TAGS.core, audio: AUDIO.bed },

  // ---- Week 12 (Dec 21–27): holidays (Christmas Fri Dec 25)
  { slot: "base", p: "P3", concept: "Holiday overlap: cousins edition", hook: "Cousins compared Steam libraries", len: "12s", format: "Template render", template: "overlap-reveal",
    data: { ...DEMO, hook: "5 cousins compared Steam libraries", players: [{ name: "Sam", count: 260 }, { name: "Lea", count: 184 }, { name: "Ivo", count: 141 }, { name: "Pia", count: 77 }, { name: "Dan", count: 59 }], shared: 14, union: 536, punchline: "14 games all five can play.", funFact: "Everyone owns Rocket League. Of course." },
    visual: "Rings → 14", vo: "Five cousins. Five hundred games. Fourteen in common.", onscreen: "5 cousins → 14 shared", cta: CTA_Q, caption: "holiday game night with the cousins: what do we all own? (demo data)", kw: "games to play with friends, steam games in common", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "reserve", p: "P7", concept: "Christmas morning: new games, same group chat argument", hook: "New games for Christmas. Same argument.", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["Christmas:: everyone got new games", "Group chat:: so what are we playing", "Also group chat:: the same 3 games"] },
    visual: "Beats", vo: "—", onscreen: "the same 3 games", cta: CTA_Q, caption: "new games, same group chat argument 🎄", kw: "what game should we play", tags: TAGS.meme, audio: AUDIO.bed },
  { slot: "base", p: "P4", concept: "Spin It: holiday couch session", hook: "Family's here. Spin for couch co-op.", len: "10s", format: "Template render", template: "roulette",
    data: { ...DEMO, hook: "Family's here. Spin it.", titles: ["Overcooked! 2", "Golf With Your Friends", "Stardew Valley", "Vampire Survivors", "Party Animals"], winner: "Golf With Your Friends", reason: "Everyone owns it · even Grandma" },
    visual: "Reel → Golf With Your Friends", vo: "Couch co-op filter. Spin. Fore.", onscreen: "Tonight's pick: Golf With Your Friends", cta: CTA_Q, caption: "holiday couch co-op, decided by the wheel ⛳", kw: "steam game roulette", tags: TAGS.core, audio: AUDIO.bed },
  { slot: "reserve", p: "P2", concept: "Phone demo: compare from the couch", hook: "Do it from your phone", len: "15s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "Works on your phone too", demo: true },
    visual: "Record mobile viewport: paste → results → vote", vo: "Works on your phone. Compare, vote, done.", onscreen: "phone → compare → vote", cta: CTA_SITE, caption: "compare steam libraries from your phone", kw: "compare steam libraries", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "base", p: "P1", concept: "CHRISTMAS (Fri Dec 25): 'we have nothing to play' (we have 39)", hook: "'We have nothing to play'", len: "12s", format: "Template render", template: "overlap-reveal",
    data: { ...DEMO, hook: "'We have nothing to play.'", players: NOVA, shared: 39, union: 70, punchline: "You have 39. Merry Christmas.", funFact: "Everyone owns Bloons TD 6. Nobody has launched it." },
    visual: "Rings → 39", vo: "Nothing to play? You have thirty-nine.", onscreen: "you have 39", cta: CTA_Q, caption: "merry christmas to every group that says 'we have nothing to play' 🎄 (demo data)", kw: "games to play with friends", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "trend", p: "TREND", concept: "Holiday trend slot", hook: "(from the trend)", len: "9–20s", format: "Template render", template: null, visual: "Adapt or fallback", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "games to play with friends", tags: TAGS.core, audio: AUDIO.trend },
  { slot: "base", p: "P11", concept: "Ask the squad: best game you played together this year", hook: "Best game you played together in 2026?", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["2026 is almost over.", "Best game your group played together this year?", "Go."] },
    visual: "Lines", vo: "Best game your group played together this year?", onscreen: "best co-op game of 2026?", cta: CTA_Q, caption: "best game your group played together in 2026? 👇", kw: "co-op games on steam", tags: TAGS.core, audio: AUDIO.bed },

  // ---- Week 13 (Dec 28–Jan 3): year-end recap (New Year Fri Jan 1)
  { slot: "base", p: "P3", concept: "Year in shared games (recap card)", hook: "Our group's year in shared games", len: "12s", format: "Template render", template: "stat-card",
    data: { ...DEMO, hook: "Our group's year in shared games", value: 39, label: "games all four of us own", sub: "Most played: Counter-Strike 2 · forgotten: Bloons TD 6" },
    visual: "Recap stat", vo: "Thirty-nine games in common. One we never launched.", onscreen: "39 shared · 1 forgotten", cta: CTA_SITE, caption: "your friend group's year in shared steam games (demo data)", kw: "steam games in common", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "reserve", p: "P10", concept: "Build in public: what we learned from 3 months of game nights", hook: "What 3 months of game nights taught us", len: "35s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "3 months of game nights taught us…" },
    visual: "Honest learnings from /admin (aggregate only; no user data)", vo: "Three months in: the vote link beat the roulette, and private profiles were the biggest blocker.", onscreen: "what we learned", cta: CTA_Q, caption: "building a game-night tool: what we learned", kw: "games to play with friends", tags: TAGS.pc, audio: AUDIO.quiet },
  { slot: "base", p: "P5", concept: "New Year's resolution: clear the shared backlog", hook: "2027 resolution: play what we own", len: "9s", format: "Template render", template: "nobody-played",
    data: { ...DEMO, players: 4, game: "PUBG: BATTLEGROUNDS", punchline: "Resolution: launch it once." },
    visual: "Combined hours: 0", vo: "New year. Same backlog. Combined hours: zero.", onscreen: "Combined hours: 0", cta: CTA_Q, caption: "new year's resolution: play the steam backlog your group already owns (demo data)", kw: "steam backlog", tags: TAGS.core, audio: AUDIO.bed },
  { slot: "reserve", p: "P7", concept: "NYE: 'one more game' into the new year", hook: "11:58 PM: 'one more game'", len: "9s", format: "Template render", template: "meme-card",
    data: { lines: ["11:58 PM:: one more game", "12:00 AM:: happy new year!! ok one more", "3:00 AM:: 2027 is off to a great start"] },
    visual: "Beats", vo: "—", onscreen: "one more game", cta: CTA_Q, caption: "how my group is spending new year's eve 🎆", kw: "games to play with friends", tags: TAGS.meme, audio: AUDIO.bed },
  { slot: "base", p: "P2", concept: "NEW YEAR (Fri Jan 1): start 2027 by finding your overlap", hook: "First game night of 2027?", len: "20s", format: "Screen recording + VO", template: "hook-overlay", data: { text: "First game night of 2027?", demo: true },
    visual: "Full flow quick cut: paste → results → spin → launch", vo: "First game night of the year. Paste, spin, launch.", onscreen: "paste → spin → launch", cta: CTA_SITE, caption: "first game night of 2027 — compare steam libraries free", kw: "compare steam libraries, games to play with friends", tags: TAGS.core, audio: AUDIO.vo },
  { slot: "trend", p: "TREND", concept: "New Year trend slot", hook: "(from the trend)", len: "9–20s", format: "Template render", template: null, visual: "Adapt or fallback", vo: "—", onscreen: "—", cta: CTA_Q, caption: "—", kw: "games to play with friends", tags: TAGS.core, audio: AUDIO.trend },
  { slot: "base", p: "P4", concept: "Spin It: new year, new rule", hook: "2027 rule: the wheel decides", len: "10s", format: "Template render", template: "roulette",
    data: { ...DEMO, hook: "2027 rule: the wheel decides.", titles: ["Deep Rock Galactic", "Valheim", "Risk of Rain 2", "Terraria", "Lethal Company", "R.E.P.O."], winner: "Deep Rock Galactic", reason: "All 4 own it · rock and stone" },
    visual: "Reel → Deep Rock Galactic", vo: "New year. New rule. Nobody argues with the wheel.", onscreen: "Tonight's pick: Deep Rock Galactic", cta: CTA_Q, caption: "new year, new rule: the wheel decides what we play", kw: "steam game roulette", tags: TAGS.core, audio: AUDIO.bed },
];

// ---------------------------------------------------------------- build rows
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SLOT_STATUS = {
  base: "Planned — baseline (publish)",
  reserve: "Reserve bank — publish only in a confirmed event week or after the week-4 gate",
  trend: "Trend slot — fill with a trending format or post the fallback",
  event: "Event extra — verify the event date first; publish only if confirmed",
};

function productionStatus(e) {
  if (e.slot === "trend") return "Fill on the day (≤30 min) — fallback concept noted";
  if (e.slot === "event" && e.p === "P9") return "Blocked: verify event date at partner.steamgames.com/doc/marketing/upcoming_events";
  if (e.template && e.template !== "hook-overlay") return "Ready to render (npm run social:render -- --only ID)";
  if (e.template === "hook-overlay") return "Overlay ready to render; needs screen recording (demo group)";
  return "Needs production";
}

if (BANK.length !== 91) throw new Error(`Content bank has ${BANK.length} entries; expected 91 (13 weeks × 7).`);

const rows = [];
const posts = [];
BANK.forEach((e, i) => {
  const date = new Date(START.getTime() + i * 86400000);
  const iso = date.toISOString().slice(0, 10);
  const week = Math.floor(i / 7) + 1;
  const id = `W${String(week).padStart(2, "0")}-${DOW[date.getUTCDay()].toUpperCase()}`;
  const assets = [
    e.template ? `renderer template: ${e.template} (posts.json id ${id})` : null,
    /Screen recording/.test(e.format) ? "screen recording of webothplay.com/compare?demo=1 at 360×640 CSS px @3×" : null,
    /VO/.test(e.format) || (e.vo && e.vo !== "—") ? "voiceover (own voice or TikTok TTS)" : null,
    "end card (renderer end-card)",
  ].filter(Boolean).join("; ");
  rows.push({
    Date: `${iso} (${DOW[date.getUTCDay()]})`,
    Week: week,
    "Content pillar": PILLAR[e.p],
    Concept: e.concept,
    Hook: e.hook,
    "Video length": e.len,
    Format: e.format,
    "Visual concept": e.visual,
    Voiceover: e.vo,
    "On-screen text": e.onscreen,
    CTA: e.cta,
    Caption: e.caption,
    Keywords: e.kw,
    Hashtags: e.tags,
    "Audio guidance": e.audio,
    "Asset dependencies": assets,
    "Production status": productionStatus(e),
    "Scheduled status": SLOT_STATUS[e.slot],
    "Experimental variable": EXPERIMENT(week),
    "Success metric": METRIC[e.p],
  });
  if (e.template) posts.push({ id, template: e.template, data: { ...e.data } });
});

// Two reusable end cards for screen-recorded posts.
posts.push({ id: "END-SITE", template: "end-card", data: {} });
posts.push({ id: "END-DISCORD", template: "end-card", data: { cta: "Add the WeBothPlay bot to your server", sub: "free · webothplay.com/discord" } });

const cols = Object.keys(rows[0]);
const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n") + "\n";
fs.writeFileSync(path.join(here, "90_DAY_CALENDAR.csv"), csv);
fs.writeFileSync(path.join(here, "..", "renderer", "posts.json"), JSON.stringify(posts, null, 2) + "\n");

const counts = rows.reduce((a, r) => ((a[r["Scheduled status"].split(" —")[0]] = (a[r["Scheduled status"].split(" —")[0]] || 0) + 1), a), {});
console.log(`Wrote ${rows.length} calendar rows and ${posts.length} render-ready posts.`, counts);
