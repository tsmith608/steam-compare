// Shared building blocks for the 9:16 social renderer.
// Same palette, fonts and motif as the website (src/app/globals.css, src/lib/og.jsx).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export const W = 1080;
export const H = 1920;
// TikTok-safe critical box (marketing/TIKTOK_RESEARCH_2026.md §3.4).
export const SAFE = { left: 64, right: 940, top: 150, bottom: 1436 };
export const SAFE_W = SAFE.right - SAFE.left;

export const C = {
  bg: "#060708",
  surface: "#101317",
  surface2: "#161a1f",
  line: "rgba(232,238,247,0.14)",
  ink1: "#f3f5f8",
  ink2: "#b7bdc7",
  ink3: "#8a919d",
  accent: "#3b82f6",
  accentHi: "#60a5fa",
  amber: "#f5a524",
  players: ["#3b82f6", "#e0621f", "#13a674", "#c948d2", "#c98500", "#0f9fb8", "#e5446d", "#7c6cf0"],
};

export function loadFonts() {
  const dir = path.join(ROOT, "src", "assets", "fonts");
  const read = (f) => fs.readFileSync(path.join(dir, f));
  return [
    { name: "ArchivoWide", data: read("Archivo-ExpandedExtraBold.ttf"), weight: 800, style: "normal" },
    { name: "Archivo", data: read("Archivo-SemiBold.ttf"), weight: 600, style: "normal" },
    { name: "Inter", data: read("Inter-Medium.ttf"), weight: 500, style: "normal" },
    { name: "Inter", data: read("Inter-Bold.ttf"), weight: 700, style: "normal" },
  ];
}

/** Minimal hyperscript for Satori: h("div", {style}, ...children). */
export function h(type, props = {}, ...children) {
  const kids = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
  return { type, props: { ...props, children: kids.length === 0 ? undefined : kids.length === 1 ? kids[0] : kids } };
}

// ---- easing / timing helpers -------------------------------------------------
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** 0→1 progress of a segment [start, end] in seconds at time t. */
export const seg = (t, start, end) => clamp((t - start) / (end - start));
export const fmt = (n) => Math.round(n).toLocaleString("en-US");

// ---- building blocks ----------------------------------------------------------
export function Frame({ children, demo = true }) {
  return h(
    "div",
    { style: { display: "flex", position: "relative", width: W, height: H, background: C.bg, fontFamily: "Inter", color: C.ink1 } },
    ...children,
    demo ? DemoLabel() : null
  );
}

export function DemoLabel() {
  return h(
    "div",
    {
      style: {
        display: "flex",
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top + 4,
        fontFamily: "Archivo",
        fontSize: 26,
        letterSpacing: 3,
        color: C.ink2,
        border: `2px solid ${C.line}`,
        borderRadius: 10,
        padding: "8px 14px",
        background: "rgba(16,19,23,0.85)",
      },
    },
    "DEMO DATA · FICTIONAL FRIEND GROUP"
  );
}

export function Wordmark({ size = 44 }) {
  return h(
    "div",
    { style: { display: "flex", fontFamily: "ArchivoWide", fontSize: size, color: C.ink1, letterSpacing: -0.5 } },
    h("span", {}, "We"),
    h("span", { style: { color: C.accentHi } }, "Both"),
    h("span", {}, "Play")
  );
}

/** Two overlapping rings; `merge` 0→1 slides them together, `glow` lights the lens. */
export function Rings({ width = 900, merge = 1, glow = 1, opacity = 1 }) {
  const shift = 140 * (1 - merge);
  const ax = 250 - shift;
  const bx = 390 + shift;
  const height = Math.round((width * 420) / 640);
  return h(
    "svg",
    { width, height, viewBox: "0 0 640 420", style: { opacity } },
    h("circle", { cx: ax, cy: 210, r: 190, fill: "none", stroke: "rgba(232,238,247,0.22)", "stroke-width": 2.5 }),
    h("circle", { cx: bx, cy: 210, r: 190, fill: "none", stroke: "rgba(232,238,247,0.22)", "stroke-width": 2.5 }),
    glow > 0 && merge > 0.98
      ? h("path", {
          d: "M320 33 A190 190 0 0 1 320 387 A190 190 0 0 1 320 33 Z",
          fill: `rgba(59,130,246,${0.22 * glow})`,
          stroke: `rgba(96,165,250,${0.75 * glow})`,
          "stroke-width": 2.5,
        })
      : null
  );
}

export function Text(text, style = {}) {
  return h("div", { style: { display: "flex", ...style } }, text);
}

export function Hook(text, { top = 230, size = 76, color = C.ink1, accentWord } = {}) {
  // Hook band: y 220→700 (research §3.4). ≤26 chars per line keeps it legible.
  const words = String(text).split(" ");
  return h(
    "div",
    {
      style: {
        display: "flex",
        flexWrap: "wrap",
        position: "absolute",
        left: SAFE.left,
        top,
        width: SAFE_W,
        fontFamily: "ArchivoWide",
        fontSize: size,
        lineHeight: 1.04,
        color,
        letterSpacing: -1,
      },
    },
    ...words.map((w) =>
      h("span", { style: { marginRight: 22, color: accentWord && w.replace(/[^\w]/g, "").toLowerCase() === accentWord.toLowerCase() ? C.accentHi : color } }, w)
    )
  );
}

export function EndCard({ cta = "Compare your group's Steam libraries", sub = "free · webothplay.com" }) {
  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: SAFE.left,
        top: 640,
        width: SAFE_W,
      },
    },
    Wordmark({ size: 64 }),
    Text(cta, { marginTop: 40, fontSize: 46, fontWeight: 700, textAlign: "center", justifyContent: "center", width: SAFE_W }),
    Text(sub, { marginTop: 18, fontSize: 38, color: C.accentHi }),
    Text("Not affiliated with Valve. Steam is a trademark of Valve Corporation.", { marginTop: 70, fontSize: 24, color: C.ink3, textAlign: "center", justifyContent: "center", width: SAFE_W })
  );
}

export function Pill(text, { color = C.ink1, bg = C.surface2, size = 32 } = {}) {
  return h(
    "div",
    { style: { display: "flex", fontSize: size, fontWeight: 700, color, background: bg, border: `2px solid ${C.line}`, borderRadius: 14, padding: "12px 20px", marginRight: 14, marginBottom: 14 } },
    text
  );
}

export function Dot(i, size = 22) {
  return h("div", { style: { display: "flex", width: size, height: size, borderRadius: size, background: C.players[i % 8], marginRight: 18 } });
}

export const fadeIn = (p) => ({ opacity: easeOut(p), transform: `translateY(${(1 - easeOut(p)) * 24}px)` });
