// Original soundtrack for the WeBothPlay brag video, synthesized from scratch:
// a chill lo-fi beat (electric piano with tape wobble, warm sub bass, dusty
// swung half-time drums, vinyl crackle) that follows the edit. Every sound
// effect is a note in key, placed on a cue the composition exports
// (frames.mjs --cues → cues.json), and the arrangement changes on the cuts:
// drums arrive with the bot, the music muffles while the picker is open, drops
// to hats for the spin and lands back in the groove.
//   node soundtrack.mjs [--out music.wav]
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const { timeline: T, cues } = JSON.parse(fs.readFileSync(path.join(here, "cues.json"), "utf8"));
const SR = 48000;
const DUR = T.end;
const N = Math.round(SR * DUR);
const OUT = path.resolve(here, opt("--out", "music.wav"));
const at = (kind) => cues.filter((c) => c.kind === kind);
const one = (kind) => at(kind)[0]?.t;

// ------------------------------------------------------------------ buses
const bus = () => ({ L: new Float32Array(N), R: new Float32Array(N) });
const keys = bus(), low = bus(), drums = bus(), fx = bus(), bed = bus(), send = bus();

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

function add(b, start, samples, gain = 1, pan = 0, sendAmt = 0) {
  const i0 = Math.round(start * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4), gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let k = 0; k < samples.length; k++) {
    const i = i0 + k;
    if (i < 0 || i >= N) continue;
    b.L[i] += samples[k] * gl;
    b.R[i] += samples[k] * gr;
    if (sendAmt) {
      send.L[i] += samples[k] * gl * sendAmt;
      send.R[i] += samples[k] * gr * sendAmt;
    }
  }
}
function biquad(type, f, q = 0.707) {
  const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
  let b0, b1, b2;
  if (type === "lp") [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
  else if (type === "hp") [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  else [b0, b1, b2] = [a, 0, -a];
  const a0 = 1 + a;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: (-2 * c) / a0, a2: (1 - a) / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
}
function run(fl, x) {
  const y = fl.b0 * x + fl.b1 * fl.x1 + fl.b2 * fl.x2 - fl.a1 * fl.y1 - fl.a2 * fl.y2;
  fl.x2 = fl.x1; fl.x1 = x; fl.y2 = fl.y1; fl.y1 = y;
  return y;
}
const retune = (fl, type, f, q) => Object.assign(fl, biquad(type, f, q), { x1: fl.x1, x2: fl.x2, y1: fl.y1, y2: fl.y2 });
const filterArr = (arr, type, f, q) => {
  const fl = biquad(type, f, q);
  for (let i = 0; i < arr.length; i++) arr[i] = run(fl, arr[i]);
  return arr;
};

// ------------------------------------------------------------- instruments
// Electric piano: 1:1 FM (bright attack that mellows), a little tine, tape wow.
function epiano(m, len, vel = 1) {
  const f = mtof(m), n = Math.round((len + 1.4) * SR), out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * f * (1 + 0.0022 * Math.sin(2 * Math.PI * 0.5 * t + m))) / SR;
    const I = (1.3 * Math.exp(-t * 6) + 0.22) * (0.6 + 0.4 * vel);
    const env = Math.min(1, t / 0.005) * Math.exp(-t * 0.85) * (t < len ? 1 : Math.exp(-(t - len) * 6));
    const tine = 0.07 * Math.sin(ph * 7.1) * Math.exp(-t * 22);
    out[i] = (Math.sin(ph + I * Math.sin(ph)) + tine) * env * vel;
  }
  return out;
}
function sub(m, len) {
  const f = mtof(m), n = Math.round((len + 0.12) * SR), out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * f) / SR;
    const env = Math.min(1, t / 0.012) * Math.exp(-t * 1.1) * (t < len ? 1 : Math.exp(-(t - len) * 30));
    out[i] = Math.tanh(1.6 * (Math.sin(ph) + 0.3 * Math.sin(2 * ph))) * env;
  }
  return out;
}
// Kalimba-ish pluck: fundamental, an inharmonic tine partial, a soft octave.
function pluck(m, len = 1.4, damp = 3.2) {
  const f = mtof(m), n = Math.round(len * SR), out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR, w = 2 * Math.PI * f * t;
    const a = Math.min(1, t / 0.002);
    out[i] = a * (Math.sin(w) * Math.exp(-t * damp) + 0.16 * Math.sin(w * 5.4) * Math.exp(-t * 26) + 0.08 * Math.sin(w * 2) * Math.exp(-t * 7));
  }
  return out;
}
// Soft bell: FM at 3.5:1 with a fading index.
function bell(m, len = 2.2) {
  const f = mtof(m), n = Math.round(len * SR), out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR, ph = 2 * Math.PI * f * t;
    out[i] = Math.sin(ph + 1.6 * Math.exp(-t * 3.5) * Math.sin(3.5 * ph)) * Math.exp(-t * 1.6) * Math.min(1, t / 0.003);
  }
  return out;
}
function noise(len, decay, type, f, q = 0.8) {
  const out = new Float32Array(Math.round(len * SR));
  for (let i = 0; i < out.length; i++) out[i] = rnd() * Math.exp((-i / SR) * decay);
  return filterArr(out, type, f, q);
}
function kick() {
  const out = new Float32Array(Math.round(0.35 * SR));
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (48 + 70 * Math.exp(-t * 28))) / SR;
    out[i] = Math.tanh(1.4 * Math.sin(ph) * Math.exp(-t * 11)) * Math.min(1, t / 0.002);
  }
  return filterArr(out, "lp", 1800, 0.7);
}
function snare() {
  const out = new Float32Array(Math.round(0.3 * SR));
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (210 - 50 * t)) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 26) * 0.45 + rnd() * Math.exp(-t * 15) * 0.55;
  }
  return filterArr(filterArr(out, "lp", 4800, 0.7), "hp", 160);
}
const hat = (open = false) => filterArr(noise(open ? 0.22 : 0.05, open ? 14 : 70, "hp", 6500), "lp", 10500, 0.7);
const tock = (f = 1100) => {
  const out = new Float32Array(Math.round(0.08 * SR));
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = (Math.sin(2 * Math.PI * f * t) * 0.8 + Math.sin(2 * Math.PI * f * 2.7 * t) * 0.25) * Math.exp(-t * 70);
  }
  return out;
};
function swish(len, f0, f1, up = true) {
  const out = new Float32Array(Math.round(len * SR));
  const fl = biquad("bp", f0, 1.2);
  for (let i = 0; i < out.length; i++) {
    const p = i / out.length;
    if (i % 64 === 0) retune(fl, "bp", f0 * Math.pow(f1 / f0, p), 1.2);
    out[i] = run(fl, rnd()) * (up ? Math.pow(p, 1.8) * (1 - Math.pow(p, 12)) : Math.sin(Math.PI * p) ** 1.4);
  }
  return out;
}

// --------------------------------------------------------------- harmony
// 120 BPM, bars of 2 s (half-time feel). One chord per bar; the reveal lifts to
// C major 9, the ending settles on A minor 9.
const BAR = 2, S16 = 0.125;
const V = {
  Am9: { v: [57, 60, 64, 67, 71], b: 33 },
  Fmaj9: { v: [53, 57, 60, 64, 67], b: 29 },
  Dm9: { v: [50, 53, 57, 60, 64], b: 38 },
  Em7: { v: [52, 55, 59, 62, 67], b: 40 },
  Cmaj9: { v: [48, 52, 55, 59, 62], b: 36 },
  G6: { v: [55, 59, 62, 64, 67], b: 31 },
};
const BARS = ["Am9", "Fmaj9", "Dm9", "Em7", "Am9", "Fmaj9", "Cmaj9", "G6", "Fmaj9", "Em7", "Fmaj9", "Am9"];
const chordAt = (t) => V[BARS[Math.min(BARS.length - 1, Math.floor(t / BAR))]];
const PENTA = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93];
const near = (m, set) => set.reduce((a, b) => (Math.abs(b - m) < Math.abs(a - m) ? b : a));
const inChord = (t, oct = 12) => chordAt(t).v.map((m) => m + oct); // chord tones an octave up
const drumsOn = (t) => (t >= 4.0 && t < T.spin) || (t >= 18.0 && t < T.outro);
const hatsOn = (t) => t >= 2.5 && t < T.outro;
const bassOn = (t) => (t >= 4.0 && t < T.spin) || (t >= 18.0 && t < T.outro);

for (let bar = 0; bar < BARS.length; bar++) {
  const t0 = bar * BAR, ch = V[BARS[bar]], last = bar === BARS.length - 1;
  // piano: strum on the downbeat, a softer re-strike on the "and" of beat 3
  const len = last ? DUR - t0 : 1.9;
  ch.v.forEach((m, k) => add(keys, t0 + k * 0.018 + rnd() * 0.004, epiano(m, len, 0.75 + 0.1 * rnd()), 0.24, (k - 2) * 0.22, 0.32));
  if (!last && bar > 0) ch.v.slice(1).forEach((m, k) => add(keys, t0 + 1.25 + k * 0.014, epiano(m, 0.6, 0.45), 0.19, (k - 1.5) * 0.25, 0.3));
  // bass: root on 1, again on the "and" of 3
  if (bassOn(t0)) {
    add(low, t0, sub(ch.b, 1.05), 0.27);
    add(low, t0 + 1.25, sub(ch.b, 0.55), 0.2);
  }
  for (let st = 0; st < 16; st++) {
    const t = t0 + st * S16;
    const swing = st % 4 === 2 ? 0.036 : 0, hum = rnd() * 0.004;
    if (drumsOn(t)) {
      if (st === 0 || st === 10) add(drums, t + hum, kick(), st === 0 ? 0.5 : 0.4);
      if (st === 7 && bar % 2 === 1) add(drums, t + hum, kick(), 0.2);
      if (st === 8) add(drums, t + hum, snare(), 0.34, 0.05, 0.22);
    }
    if (hatsOn(t) && st % 2 === 0) {
      const soft = t < 4.0 || (t >= T.spin && t < 18.0);
      add(drums, t + swing + hum, hat(st === 14 && drumsOn(t)), (st % 4 === 0 ? 0.1 : 0.075) * (soft ? 0.8 : 1), st % 4 === 0 ? 0.2 : -0.2);
    }
  }
}

// ------------------------------------------- sounds on the composition's cues
// Accents sit above the piano (octaves 5–6) and the piano dips under each one.
const P = (t, m, g = 0.28, pan = 0, len, damp) => add(fx, t, pluck(m, len, damp), g, pan, 0.35);
// chat: three soft notes stepping down (the "idk" sag), typing ticks
at("msg").forEach((c, i) => P(c.t, [88, 86, 84][i] ?? 84, 0.26, 0.1));
for (let k = 0; k < 6; k++) add(fx, one("typing") + 0.05 + k * 0.13, tock(2600), 0.04, -0.25);
// the "Add to your server" card, the tap, the bot joining (two-note chime)
add(fx, one("card"), swish(0.3, 500, 2600), 0.08, 0, 0.3);
at("tap").forEach((c) => {
  add(fx, c.t, tock(1150), 0.12);
  P(c.t, near(inChord(c.t, 24)[2], PENTA), 0.2, 0.1);
});
add(fx, one("join"), bell(84, 1.6), 0.12, -0.1, 0.4);
add(fx, one("join") + 0.11, bell(91, 1.8), 0.11, 0.1, 0.4);
// typing /compare and the three mentions, send
add(fx, one("key"), tock(2300), 0.1, -0.1);
P(one("key"), 79, 0.16, -0.1);
at("mention").forEach((c, i) => { add(fx, c.t, tock(2200), 0.06); P(c.t, [84, 86, 88][i], 0.2, 0.15); });
add(fx, one("send"), swish(0.16, 900, 3200, false), 0.08, 0, 0.2);
P(one("send"), 91, 0.18);
// the bot's reply: a bell dyad and a low bloom
add(fx, one("reply"), bell(88, 2.4), 0.13, -0.15, 0.45);
add(fx, one("reply") + 0.02, bell(93, 2.4), 0.1, 0.15, 0.45);
add(low, one("reply"), sub(33, 0.9), 0.16);
// web: picker opens/closes (swish), notes rise with each friend, rows drop in
at("modal").forEach((c) => add(fx, c.t, swish(0.26, c.open ? 600 : 2400, c.open ? 2400 : 700, !!c.open), 0.06, 0, 0.3));
at("pick").forEach((c, i) => P(c.t, [81, 84, 88][i], 0.26, 0.12));
[0, 0.07, 0.14].forEach((d, i) => P(one("rows") + d, [91, 93, 96][i], 0.12, i * 0.2 - 0.2, 0.9, 5));
// into the reveal: a swell, the count-up as a rising run, a bell on "39"
add(fx, T.reveal - 0.8, swish(0.8, 300, 5200), 0.08, 0, 0.35);
add(fx, T.reveal, noise(1.6, 2.2, "hp", 5200), 0.04, 0, 0.4);
at("count").forEach((c, i) => P(c.t, PENTA[6 + i], 0.15, (i % 2) * 0.3 - 0.15, 0.8, 4.5));
[81, 88, 91, 95].forEach((m, i) => add(fx, one("hit") + i * 0.012, bell(m, 2.6), 0.085, (i - 1.5) * 0.25, 0.5));
// spin: soft wood ticks as tiles pass, a chime and the bass on the landing
at("tick").forEach((c, i, a) => add(fx, c.t, tock(1500 + i * 12), 0.06 + 0.06 * (i / a.length), (i % 2) * 0.3 - 0.15));
[81, 84, 88, 95].forEach((m, i) => add(fx, one("land") + i * 0.03, bell(m, 2.4), 0.095, (i - 1.5) * 0.2, 0.5));
add(low, one("land"), sub(29, 0.7), 0.22);
// vote: two notes up, a soft falling "nope" for the veto, a chime for the leader
at("vote").forEach((c, i) => P(c.t, [84, 88][i] ?? 88, 0.24, 0.1));
P(one("veto"), 88, 0.2, -0.1, 0.5, 9);
P(one("veto") + 0.08, 81, 0.22, -0.1, 0.6, 9);
add(fx, one("lead"), bell(93, 2), 0.1, 0.1, 0.4);
add(fx, one("lead") + 0.1, bell(100, 2), 0.07, -0.1, 0.4);
// outro: a swell in, the motif on the wordmark, soft chimes on the buttons
add(fx, T.outro - 0.6, swish(0.6, 400, 4200), 0.07, 0, 0.35);
[81, 84, 88].forEach((m, i) => P(one("mark") + i * 0.11, m, 0.2, (i - 1) * 0.25, 2.2, 2.2));
add(fx, one("cta"), bell(93, 2.6), 0.1, 0, 0.5);
P(one("cta2"), 88, 0.16, 0.1, 2, 2.5);
add(low, 22.0, sub(33, 2.2), 0.2);
// Make room: the piano dips briefly (5 ms in, ~120 ms out) under each accent.
{
  const duck = new Float32Array(N).fill(1);
  for (const c of cues) {
    if (["scene", "spin", "outro", "typing", "tick", "modal", "rows"].includes(c.kind)) continue;
    const depth = c.kind === "count" ? 0.15 : 0.32, i0 = Math.round(c.t * SR);
    for (let k = 0; k < SR * 0.6 && i0 + k < N; k++) duck[i0 + k] = Math.min(duck[i0 + k], 1 - depth * Math.min(1, k / (SR * 0.005)) * Math.exp(-k / (SR * 0.12)));
  }
  for (let i = 0; i < N; i++) { keys.L[i] *= duck[i]; keys.R[i] *= duck[i]; }
}

// vinyl bed: sparse crackle + a little hiss, the whole way through (seeded, so renders repeat)
{
  const cr = new Float32Array(N), hiss = noise(DUR, 0, "lp", 5500);
  for (let i = 0; i < N; i++) {
    if ((rnd() + 1) / 2 < 14 / SR) {
      const a = 0.3 + Math.abs(rnd()) * 0.7;
      for (let k = 0; k < 48 && i + k < N; k++) cr[i + k] += a * rnd() * Math.exp(-k / 6);
    }
  }
  filterArr(cr, "bp", 2600, 0.6);
  add(bed, 0, cr, 0.05);
  add(bed, 0, hiss, 0.006);
}

// ------------------------------------------------------------------- mixing
function reverb(inL, inR) {
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => Math.round((d * SR) / 44100));
  const aps = [556, 441, 341].map((d) => Math.round((d * SR) / 44100));
  const process = (inp, spread) => {
    const outp = new Float32Array(N);
    const cb = combs.map((d) => ({ buf: new Float32Array(d + spread), i: 0, store: 0 }));
    const ab = aps.map((d) => ({ buf: new Float32Array(d + spread), i: 0 }));
    for (let i = 0; i < N; i++) {
      let s = 0;
      for (const c of cb) {
        const y = c.buf[c.i];
        c.store = y * 0.6 + c.store * 0.4;
        c.buf[c.i] = inp[i] * 0.35 + c.store * 0.84;
        c.i = (c.i + 1) % c.buf.length;
        s += y;
      }
      for (const a of ab) {
        const y = a.buf[a.i];
        a.buf[a.i] = s + y * 0.5;
        a.i = (a.i + 1) % a.buf.length;
        s = y - s * 0.5;
      }
      outp[i] = s;
    }
    return outp;
  };
  return [process(inL, 0), process(inR, 23)];
}
// Keys: warm low-pass that dips while the friend picker is open (music "behind" the modal).
{
  const open = at("modal").find((c) => c.open)?.t ?? -1, close = at("modal").find((c) => !c.open)?.t ?? -1;
  const cutoff = (t) => {
    const dip = Math.min(1, Math.max(0, (t - open) / 0.15)) * (1 - Math.min(1, Math.max(0, (t - close) / 0.25)));
    return 4200 * Math.pow(950 / 4200, dip);
  };
  for (const ch of ["L", "R"]) {
    const fl = biquad("lp", 4200, 0.6), arr = keys[ch];
    for (let i = 0; i < N; i++) {
      if (i % 64 === 0) retune(fl, "lp", cutoff(i / SR), 0.6);
      arr[i] = run(fl, arr[i]);
    }
  }
  // gentle autopan on the piano
  for (let i = 0; i < N; i++) {
    const p = 0.12 * Math.sin(2 * Math.PI * 0.21 * (i / SR));
    const l = keys.L[i], r = keys.R[i];
    keys.L[i] = l * (1 - p) + r * Math.max(0, p);
    keys.R[i] = r * (1 + p) + l * Math.max(0, -p);
  }
}
filterArr(drums.L, "lp", 10000, 0.7);
filterArr(drums.R, "lp", 10000, 0.7);
const [rvL, rvR] = reverb(send.L, send.R);
let L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  L[i] = keys.L[i] + low.L[i] + drums.L[i] + fx.L[i] + bed.L[i] + rvL[i] * 0.22;
  R[i] = keys.R[i] + low.R[i] + drums.R[i] + fx.R[i] + bed.R[i] + rvR[i] * 0.22;
}
// Rumble filter, soft tape saturation, normalise (sample peak −1.5 dBFS), fades.
filterArr(L, "hp", 32, 0.7);
filterArr(R, "hp", 32, 0.7);
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.3) / 1.3;
  R[i] = Math.tanh(R[i] * 1.3) / 1.3;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = Math.pow(10, -1.5 / 20) / peak;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.02) * Math.min(1, Math.pow(Math.max(0, (DUR - t) / 1.4), 1.5));
  L[i] *= g * fade;
  R[i] *= g * fade;
}

// ---------------------------------------------------------------- WAV out
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), i * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write("RIFF", 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write("WAVE", 8);
hdr.write("fmt ", 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
hdr.write("data", 36); hdr.writeUInt32LE(data.length, 40);
fs.writeFileSync(OUT, Buffer.concat([hdr, data]));
console.log(`wrote ${OUT} (${DUR}s, ${cues.length} cues)`);
