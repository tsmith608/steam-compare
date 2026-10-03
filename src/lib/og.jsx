// Server-rendered cards (next/og / Satori): share cards, poll cards, the site
// Open Graph image, and the 9:16 social templates in marketing/renderer.
// Satori supports a subset of CSS: flexbox only, inline styles.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const C = {
  bg: "#060708",
  surface: "#101317",
  surface2: "#161a1f",
  line: "rgba(232,238,247,0.12)",
  ink1: "#f3f5f8",
  ink2: "#b7bdc7",
  ink3: "#8a919d",
  accent: "#3b82f6",
  accentHi: "#60a5fa",
  amber: "#f5a524",
  players: ["#3b82f6", "#e0621f", "#13a674", "#c948d2", "#c98500", "#0f9fb8", "#e5446d", "#7c6cf0"],
};

let fontCache = null;
export async function loadOgFonts() {
  if (fontCache) return fontCache;
  const dir = join(process.cwd(), "src", "assets", "fonts");
  const [wide, semi, interMed, interBold] = await Promise.all([
    readFile(join(dir, "Archivo-ExpandedExtraBold.ttf")),
    readFile(join(dir, "Archivo-SemiBold.ttf")),
    readFile(join(dir, "Inter-Medium.ttf")),
    readFile(join(dir, "Inter-Bold.ttf")),
  ]);
  fontCache = [
    { name: "ArchivoWide", data: wide, weight: 800, style: "normal" },
    { name: "Archivo", data: semi, weight: 600, style: "normal" },
    { name: "Inter", data: interMed, weight: 500, style: "normal" },
    { name: "Inter", data: interBold, weight: 700, style: "normal" },
  ];
  return fontCache;
}

/** Fetches an image as a data URI (or null) so a slow/missing avatar never breaks a card. */
export async function imageData(url, timeoutMs = 2500) {
  if (!url || !/^https:\/\//.test(url)) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "image/jpeg";
    if (!/^image\/(jpeg|png|webp|gif)/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 600_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export function Wordmark({ size = 34 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", fontFamily: "ArchivoWide", fontSize: size, color: C.ink1, letterSpacing: -0.5 }}>
      <span>We</span>
      <span style={{ color: C.accentHi }}>Both</span>
      <span>Play</span>
    </div>
  );
}

export function Rings({ width = 520, opacity = 1 }) {
  const h = Math.round((width * 420) / 640);
  return (
    <svg width={width} height={h} viewBox="0 0 640 420" style={{ opacity }}>
      <circle cx="250" cy="210" r="190" fill="none" stroke="rgba(232,238,247,0.16)" strokeWidth="2" />
      <circle cx="390" cy="210" r="190" fill="none" stroke="rgba(232,238,247,0.16)" strokeWidth="2" />
      <path d="M320 33 A190 190 0 0 1 320 387 A190 190 0 0 1 320 33 Z" fill="rgba(59,130,246,0.18)" stroke="rgba(96,165,250,0.6)" strokeWidth="2" />
    </svg>
  );
}

export function AvatarStack({ players, size = 76, max = 6 }) {
  const shown = players.slice(0, max);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            width: size,
            height: size,
            marginLeft: i === 0 ? 0 : -size * 0.28,
            borderRadius: size,
            border: `4px solid ${C.bg}`,
            background: C.players[i % 8],
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            fontFamily: "ArchivoWide",
            fontSize: size * 0.4,
            color: C.bg,
          }}
        >
          {p.avatarData ? <img src={p.avatarData} alt="" width={size} height={size} style={{ objectFit: "cover" }} /> : (p.name || "?").slice(0, 1).toUpperCase()}
        </div>
      ))}
      {players.length > max && (
        <div style={{ display: "flex", marginLeft: 14, fontFamily: "Inter", fontWeight: 700, fontSize: size * 0.34, color: C.ink2 }}>+{players.length - max}</div>
      )}
    </div>
  );
}

const fmt = (n) => Number(n || 0).toLocaleString("en-US");

export function funLine(s) {
  if (s.forgotten) return `Everyone owns ${s.forgotten.name}. Nobody has launched it.`;
  if (s.carry) return `${s.carry.by} has ${fmt(s.carry.hours)}h in ${s.carry.name}. Everyone else: basically none.`;
  if (s.mostPlayed) return `Most played together: ${s.mostPlayed.name} — ${fmt(s.mostPlayed.hours)}h`;
  return `${fmt(s.unionCount)} games between them`;
}

/** 1200×630 share card for a comparison summary (see lib/shares.js summarize()). */
export function ComparisonCard({ s }) {
  const n = s.players.length;
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: C.bg, padding: 64, position: "relative", fontFamily: "Inter" }}>
      <div style={{ display: "flex", position: "absolute", right: -120, top: 60 }}>
        <Rings width={700} opacity={0.9} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Wordmark size={32} />
          {s.demo && (
            <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 20, letterSpacing: 2, color: C.ink2, border: `2px solid ${C.line}`, borderRadius: 8, padding: "6px 12px" }}>
              EXAMPLE GROUP
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <AvatarStack players={s.players} size={70} />
          <div style={{ display: "flex", alignItems: "flex-end", marginTop: 26 }}>
            <div style={{ display: "flex", fontFamily: "ArchivoWide", fontSize: 200, lineHeight: 0.82, color: C.accentHi, letterSpacing: -6 }}>{fmt(s.sharedCount)}</div>
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 28, marginBottom: 8 }}>
              <div style={{ display: "flex", fontWeight: 700, fontSize: 46, color: C.ink1 }}>games in common</div>
              <div style={{ display: "flex", fontSize: 26, color: C.ink2, marginTop: 6 }}>
                {n} friends · {fmt(s.unionCount)} games between them · {s.overlapPct}% overlap
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, color: C.ink1, background: C.surface2, border: `2px solid ${C.line}`, borderRadius: 12, padding: "14px 20px", maxWidth: 860 }}>
            {funLine(s)}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: C.ink3 }}>webothplay.com</div>
        </div>
      </div>
    </div>
  );
}

/** 1200×630 card for a vote link. */
export function PollCard({ options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", background: C.bg, padding: 64, fontFamily: "Inter" }}>
      <Wordmark size={32} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 24, letterSpacing: 3, color: C.accentHi }}>VOTE · ONE VETO EACH</div>
        <div style={{ display: "flex", fontFamily: "ArchivoWide", fontSize: 76, color: C.ink1, marginTop: 14, lineHeight: 1 }}>What are we playing tonight?</div>
        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 34 }}>
          {options.slice(0, 4).map((o, i) => (
            <div key={o.appid} style={{ display: "flex", alignItems: "center", fontSize: 28, fontWeight: 700, color: C.ink1, background: C.surface2, border: `2px solid ${C.line}`, borderRadius: 12, padding: "12px 18px", marginRight: 14, marginBottom: 14 }}>
              <span style={{ color: C.players[i], marginRight: 12 }}>●</span>
              {o.name.length > 26 ? `${o.name.slice(0, 25)}…` : o.name}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: C.ink3 }}>Tap to vote at webothplay.com</div>
    </div>
  );
}

/** 1200×630 default site card. */
export function SiteCard() {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: C.bg, padding: 72, position: "relative", fontFamily: "Inter" }}>
      <div style={{ display: "flex", position: "absolute", right: -60, top: 70 }}>
        <Rings width={680} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        <Wordmark size={36} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "ArchivoWide", fontSize: 92, lineHeight: 0.98, color: C.ink1 }}>What are we</div>
          <div style={{ display: "flex", fontFamily: "ArchivoWide", fontSize: 92, lineHeight: 0.98, color: C.ink1 }}>
            playing&nbsp;<span style={{ color: C.accentHi }}>tonight?</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: C.ink2, marginTop: 26 }}>Compare Steam libraries. See every game your group owns.</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: C.ink3 }}>webothplay.com · free</div>
      </div>
    </div>
  );
}
