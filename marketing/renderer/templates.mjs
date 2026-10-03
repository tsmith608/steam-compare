// 9:16 templates. Each is { duration (s), render(t, data) -> element tree }.
// Everything important stays inside SAFE (x 64–940, y 150–1436).
import { W, H, C, SAFE, SAFE_W, h, Frame, Rings, Hook, EndCard, Text, Pill, Dot, Wordmark, seg, easeOut, easeInOut, fmt, fadeIn } from "./lib.mjs";

// Timing follows marketing/TIKTOK_RESEARCH_2026.md §3: the payoff is on screen
// from frame 1, the key message lands by 3 s, motion starts within 1 s, and the
// end card lasts under 2 s.
const END_AT = (d) => d - 1.8;

// After the payoff (holdFrom), a slow 14 px upward drift keeps the frame
// moving until the end card. Vertical only, so nothing leaves the safe area's
// x range (a zoom would push the widest lines into TikTok's right rail).
// The demo label stays put (it lives in Frame).
function withEnd(t, duration, body, data, holdFrom = duration) {
  if (t >= END_AT(duration)) return Frame({ demo: false, children: [EndCard({ cta: data.cta, sub: data.sub })] });
  const drift = -14 * easeInOut(seg(t, holdFrom, END_AT(duration)));
  const stage = h("div", { style: { display: "flex", position: "absolute", left: 0, top: 0, width: W, height: H, transform: `translateY(${drift.toFixed(2)}px)` } }, ...body);
  return Frame({ demo: data.demo !== false, children: [stage] });
}

/* --------------------------------------------------------- overlap-reveal */
export const overlapReveal = {
  duration: 9,
  render(t, d) {
    const players = d.players || [];
    // Rows sit below the rings (y 1110–1430), so they tighten for bigger groups.
    const rowFont = players.length > 6 ? 28 : players.length > 4 ? 32 : 38;
    const rowGap = players.length > 6 ? 4 : players.length > 4 ? 10 : 18;
    // 0–1.6 s: rings close and the shared count runs (payoff). 2.2–4.8 s: each
    // library. 4.8 s+: punchline and fun fact. 7.2 s: end card.
    const merge = easeInOut(seg(t, 0, 0.8));
    const count = d.shared * easeOut(seg(t, 0.15, 1.6));
    const rowsVisible = t < 4.8;
    const rows = players.map((p, i) =>
      h(
        "div",
        { style: { display: "flex", alignItems: "center", marginBottom: rowGap, ...fadeIn(seg(t, 2.2 + i * 0.3, 2.6 + i * 0.3)) } },
        Dot(i),
        Text(p.name, { fontSize: rowFont, fontWeight: 700, width: 360 }),
        Text(`${fmt(p.count * easeOut(seg(t, 2.2 + i * 0.3, 3.0 + i * 0.3)))} games`, { fontSize: rowFont, color: C.ink2 })
      )
    );
    const body = [
      Hook(d.hook || "4 friends. 4 Steam libraries.", { size: 72 }),
      h("div", { style: { display: "flex", position: "absolute", left: SAFE.left - 20, top: 520 } }, Rings({ width: SAFE_W + 40, merge, glow: seg(t, 0.8, 1.4) })),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", left: SAFE.left, top: 640, width: SAFE_W } },
        Text(fmt(count), { fontFamily: "ArchivoWide", fontSize: 260, lineHeight: 0.9, color: C.accentHi, letterSpacing: -8 }),
        Text(d.sharedLabel || "games they ALL own", { fontSize: 50, fontWeight: 700, marginTop: 20, ...fadeIn(seg(t, 0.5, 0.9)) })
      ),
      rowsVisible
        ? h("div", { style: { display: "flex", flexDirection: "column", position: "absolute", left: SAFE.left, top: 1110, width: SAFE_W, opacity: 1 - seg(t, 4.5, 4.8) } }, ...rows)
        : h(
            "div",
            { style: { display: "flex", flexDirection: "column", position: "absolute", left: SAFE.left, top: 1110, width: SAFE_W, ...fadeIn(seg(t, 4.8, 5.3)) } },
            Text(d.punchline || `${fmt(d.union)} games between them.`, { fontSize: 42, color: C.ink2, width: SAFE_W }),
            d.funFact ? Text(d.funFact, { fontSize: 40, color: C.ink1, marginTop: 18, width: SAFE_W }) : null
          ),
    ];
    return withEnd(t, this.duration, body, d, 5.3);
  },
};

/* ---------------------------------------------------------------- roulette */
export const roulette = {
  duration: 9,
  render(t, d) {
    const titles = d.titles || [];
    const winnerIdx = Math.max(0, titles.indexOf(d.winner));
    const ROW = 136;
    const spinEnd = 3.4; // spins from frame 1, lands by 3.4 s
    const total = 3 * titles.length + winnerIdx; // three full loops then land
    const p = easeOut(seg(t, 0.1, spinEnd));
    const pos = p * total;
    const visible = [];
    for (let k = -2; k <= 2; k++) {
      const idx = Math.floor(pos) + k;
      const title = titles[((idx % titles.length) + titles.length) % titles.length];
      const y = (k - (pos - Math.floor(pos))) * ROW;
      const isCenter = Math.abs(y) < ROW / 2;
      visible.push(
        h(
          "div",
          {
            style: {
              display: "flex",
              position: "absolute",
              left: 0,
              top: 2 * ROW + y,
              width: SAFE_W,
              height: ROW - 16,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              background: isCenter && t > spinEnd ? "rgba(59,130,246,0.22)" : C.surface2,
              border: `3px solid ${isCenter && t > spinEnd ? C.accentHi : C.line}`,
              fontSize: 50,
              fontWeight: 700,
              color: isCenter ? C.ink1 : C.ink3,
            },
          },
          title
        )
      );
    }
    const body = [
      Hook(d.hook || "Can't decide? Spin it.", { size: 76 }),
      h("div", { style: { display: "flex", position: "absolute", left: SAFE.left, top: 500, width: SAFE_W, height: 5 * ROW, overflow: "hidden" } }, ...visible),
      h("div", { style: { display: "flex", position: "absolute", left: SAFE.left - 24, top: 500 + 2 * ROW + (ROW - 16) / 2 - 18, width: 0, height: 0, borderTop: "18px solid transparent", borderBottom: "18px solid transparent", borderLeft: `24px solid ${C.accentHi}` } }),
      t > spinEnd + 0.2
        ? h(
            "div",
            { style: { display: "flex", flexDirection: "column", position: "absolute", left: SAFE.left, top: 1250, width: SAFE_W, ...fadeIn(seg(t, spinEnd + 0.2, spinEnd + 0.8)) } },
            Text("TONIGHT'S PICK", { fontFamily: "Archivo", fontSize: 30, letterSpacing: 4, color: C.accentHi }),
            Text(d.reason || "Everyone owns it.", { fontSize: 40, color: C.ink2, marginTop: 10 })
          )
        : null,
    ];
    return withEnd(t, this.duration, body, d, spinEnd + 0.8);
  },
};

/* ----------------------------------------------------------- nobody-played */
export const nobodyPlayed = {
  duration: 9,
  render(t, d) {
    const n = d.players || 4;
    const body = [
      // Fictional demo groups are described in the third person, never as "us".
      Hook(d.hook || (d.demo === false ? `All ${n} of us own this game.` : `All ${n} friends own this game.`), { size: 70 }),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", position: "absolute", left: SAFE.left, top: 620, width: SAFE_W, ...fadeIn(seg(t, 0, 0.3)) } },
        Text(d.game, { fontFamily: "ArchivoWide", fontSize: d.game.length > 18 ? 80 : d.game.length > 9 ? 96 : 124, lineHeight: 1.02, color: C.ink1, width: SAFE_W })
      ),
      t >= 1.0
        ? h(
            "div",
            { style: { display: "flex", alignItems: "flex-end", position: "absolute", left: SAFE.left, top: 960, width: SAFE_W, ...fadeIn(seg(t, 1.0, 1.4)) } },
            Text("Combined hours:", { fontSize: 50, fontWeight: 700, color: C.ink2, marginRight: 24, marginBottom: 22 }),
            Text("0", { fontFamily: "ArchivoWide", fontSize: 200, lineHeight: 0.9, color: C.accentHi })
          )
        : null,
      t >= 2.4 ? Text(d.punchline || "Tonight's the night.", { position: "absolute", left: SAFE.left, top: 1250, width: SAFE_W, fontSize: 46, fontWeight: 700, ...fadeIn(seg(t, 2.4, 2.9)) }) : null,
    ];
    return withEnd(t, this.duration, body, d, 3.0);
  },
};

/* --------------------------------------------------------------- stat-card */
export const statCard = {
  duration: 9,
  render(t, d) {
    const value = Number(d.value || 0) * easeOut(seg(t, 0.1, 1.5));
    const body = [
      Hook(d.hook, { size: 70 }),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", position: "absolute", left: SAFE.left, top: 700, width: SAFE_W } },
        Text(`${d.prefix || ""}${fmt(value)}${d.suffix || ""}`, { fontFamily: "ArchivoWide", fontSize: d.big || 220, lineHeight: 0.9, color: C.accentHi, letterSpacing: -6 }),
        Text(d.label || "", { fontSize: 50, fontWeight: 700, marginTop: 24, width: SAFE_W, ...fadeIn(seg(t, 0.6, 1.0)) }),
        d.sub ? Text(d.sub, { fontSize: 40, color: C.ink2, marginTop: 20, width: SAFE_W, ...fadeIn(seg(t, 1.4, 1.9)) }) : null
      ),
    ];
    return withEnd(t, this.duration, body, d, 2.0);
  },
};

/* ---------------------------------------------------------------- top-five */
export const topFive = {
  duration: 11,
  render(t, d) {
    const items = (d.items || []).slice(0, 5);
    const step = 1.3;
    const body = [
      Hook(d.hook, { size: 64, top: 220 }),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", position: "absolute", left: SAFE.left, top: 560, width: SAFE_W } },
        ...items.map((it, i) =>
          h(
            "div",
            { style: { display: "flex", alignItems: "flex-start", marginBottom: 34, ...fadeIn(seg(t, 0.4 + i * step, 0.9 + i * step)) } },
            Text(String(i + 1), { fontFamily: "ArchivoWide", fontSize: 72, color: C.accentHi, width: 90, lineHeight: 1 }),
            h("div", { style: { display: "flex", flexDirection: "column", width: SAFE_W - 90 } }, Text(it.name, { fontSize: 46, fontWeight: 700 }), Text(it.why, { fontSize: 32, color: C.ink2, marginTop: 6 }))
          )
        )
      ),
    ];
    return withEnd(t, this.duration, body, d, 0.9 + (items.length - 1) * step);
  },
  // Static slides for a Photo Mode carousel: cover + one per item + end.
  slides(d) {
    const items = (d.items || []).slice(0, 5);
    const cover = Frame({ demo: false, children: [Hook(d.hook, { size: 84, top: 520 }), Text(d.coverSub || "swipe →", { position: "absolute", left: SAFE.left, top: 1200, fontSize: 44, color: C.accentHi })] });
    const per = items.map((it, i) =>
      Frame({
        demo: false,
        children: [
          Text(`${i + 1}/${items.length}`, { position: "absolute", left: SAFE.left, top: SAFE.top + 20, fontFamily: "Archivo", fontSize: 34, letterSpacing: 3, color: C.ink3 }),
          Text(it.name, { position: "absolute", left: SAFE.left, top: 560, width: SAFE_W, fontFamily: "ArchivoWide", fontSize: it.name.length > 14 ? 92 : 116, lineHeight: 1 }),
          Text(it.why, { position: "absolute", left: SAFE.left, top: 1000, width: SAFE_W, fontSize: 46, color: C.ink2, lineHeight: 1.3 }),
        ],
      })
    );
    const end = Frame({ demo: false, children: [EndCard({ cta: d.cta, sub: d.sub })] });
    return [cover, ...per, end];
  },
};

/* --------------------------------------------------------------- meme-card */
export const memeCard = {
  duration: 9,
  render(t, d) {
    const lines = d.lines || [];
    const body = [
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", position: "absolute", left: SAFE.left, top: 360, width: SAFE_W } },
        ...lines.map((ln, i) => {
          const [who, said] = ln.split("::");
          return h(
            "div",
            { style: { display: "flex", flexDirection: "column", marginBottom: 46, ...fadeIn(seg(t, i * 1.0, 0.4 + i * 1.0)) } },
            said ? Text(who.trim(), { fontFamily: "Archivo", fontSize: 32, letterSpacing: 3, color: C.ink3, marginBottom: 8 }) : null,
            Text((said || who).trim(), { fontFamily: said ? "Inter" : "ArchivoWide", fontWeight: 700, fontSize: said ? 56 : 70, lineHeight: 1.15, width: SAFE_W })
          );
        })
      ),
    ];
    return withEnd(t, this.duration, body, { ...d, demo: false }, lines.length * 1.0);
  },
};

/* ------------------------------------------------------------ hook-overlay */
// Transparent PNG to place over a screen recording (hook band, y 220–700).
export const hookOverlay = {
  overlay: true,
  render(_t, d) {
    return h(
      "div",
      { style: { display: "flex", position: "relative", width: 1080, height: 1920, fontFamily: "Inter" } },
      h(
        "div",
        {
          style: {
            display: "flex",
            position: "absolute",
            left: SAFE.left,
            top: 230,
            width: SAFE_W,
            padding: "26px 30px",
            background: "rgba(6,7,8,0.82)",
            borderRadius: 22,
            border: `2px solid ${C.line}`,
            fontFamily: "ArchivoWide",
            fontSize: d.size || 66,
            lineHeight: 1.06,
            color: C.ink1,
          },
        },
        d.text
      ),
      d.demo
        ? h("div", { style: { display: "flex", position: "absolute", left: SAFE.left, top: SAFE.top - 2, fontFamily: "Archivo", fontSize: 24, letterSpacing: 3, color: C.ink2, background: "rgba(6,7,8,0.82)", borderRadius: 8, padding: "6px 12px" } }, "DEMO DATA · FICTIONAL FRIEND GROUP")
        : null
    );
  },
};

/* ---------------------------------------------------------------- end-card */
export const endCard = {
  duration: 1.8,
  render(_t, d) {
    return Frame({ demo: false, children: [EndCard({ cta: d.cta, sub: d.sub })] });
  },
};

export const TEMPLATES = {
  "overlap-reveal": overlapReveal,
  roulette,
  "nobody-played": nobodyPlayed,
  "stat-card": statCard,
  "top-five": topFive,
  "meme-card": memeCard,
  "hook-overlay": hookOverlay,
  "end-card": endCard,
};

export { Wordmark, Pill };
