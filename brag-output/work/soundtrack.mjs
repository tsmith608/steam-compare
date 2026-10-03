// Original soundtrack for the WeBothPlay brag video, synthesized from scratch:
// dark phonk-style beat, 120 BPM in A minor — distorted 808, syncopated kicks,
// rolling hats and a cowbell hook — with every sound effect placed on the
// composition's cues (timings mirror composition/compose.js, 21 s cut).
//   node soundtrack.mjs [--duration 21] [--out music.wav]
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const SR = 48000;
const DUR = Number(opt("--duration", 21));
const N = Math.round(SR * DUR);
const OUT = path.resolve(here, opt("--out", "music.wav"));

// ------------------------------------------------------------------ buses
const bus = () => ({ L: new Float32Array(N), R: new Float32Array(N) });
const drums = bus(), low = bus(), music = bus(), sfx = bus(), send = bus();
const duck = new Float32Array(N).fill(1);

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, Bb: 10, B: 11 };
const n = (name, oct) => 12 * (oct + 1) + NOTE[name];
let seed = 11;
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
function kick() {
  const out = new Float32Array(Math.round(0.3 * SR));
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (50 + 180 * Math.exp(-t * 38))) / SR;
    const env = Math.exp(-t * 20) * Math.min(1, t * 1200);
    out[i] = Math.tanh(Math.sin(ph) * env * 2.6) * 0.9;
  }
  // Beater click so the kick still reads on phone speakers.
  const c = noiseHit(0.012, 400, "bp", 3200, 0.8);
  for (let i = 0; i < c.length; i++) out[i] += c[i] * 0.5;
  return out;
}
// Distorted 808: a sine sub plus a hard, asymmetric clip of it band-limited to
// 180 Hz–2.4 kHz (the growl phone speakers can play), a pitch drop at the start
// and a glide into the next note.
function bass808(m, len, glideTo = null) {
  const out = new Float32Array(Math.round((len + 0.05) * SR));
  let ph = 0;
  const f0 = mtof(m), f1 = glideTo ? mtof(glideTo) : f0;
  const hp = biquad("hp", 180, 0.7), lp = biquad("lp", 2400, 0.7);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const glide = glideTo ? Math.min(1, Math.max(0, (t - len * 0.55) / (len * 0.35))) : 0;
    const f = f0 * Math.pow(f1 / f0, glide) * (1 + 0.9 * Math.exp(-t * 45));
    ph += (2 * Math.PI * f) / SR;
    const env = Math.min(1, t * 400) * (t < len ? Math.exp(-t * 1.8) : Math.exp(-len * 1.8) * Math.exp(-(t - len) * 60));
    const s = Math.sin(ph);
    const growl = run(lp, run(hp, Math.tanh(s * 9 + 0.35)));
    out[i] = (Math.tanh(s * 1.6) * 0.4 + growl * 0.42) * env;
  }
  return out;
}
function noiseHit(len, decay, type, f, q = 0.9) {
  const out = new Float32Array(Math.round(len * SR));
  for (let i = 0; i < out.length; i++) out[i] = rnd() * Math.exp((-i / SR) * decay);
  return filterArr(out, type, f, q);
}
function clap() {
  const out = new Float32Array(Math.round(0.28 * SR));
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let env = 0;
    for (const o of [0, 0.009, 0.019]) if (t >= o) env = Math.max(env, Math.exp(-(t - o) * (o < 0.015 ? 160 : 20)));
    out[i] = rnd() * env;
  }
  return filterArr(filterArr(out, "bp", 1300, 0.6), "hp", 400);
}
function snare() {
  const out = new Float32Array(Math.round(0.25 * SR));
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (190 - 40 * t)) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 30) * 0.5 + rnd() * Math.exp(-t * 18) * 0.6;
  }
  return filterArr(out, "hp", 180);
}
// 808-style cowbell: two detuned squares through a band-pass, tight decay.
function cowbell(m, len = 0.22, bright = 1) {
  const out = new Float32Array(Math.round(len * SR));
  const f = mtof(m), f2 = f * 1.4814;
  const fl = biquad("bp", f * 2.2 * bright, 1.4);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const sq = Math.sign(Math.sin(2 * Math.PI * f * t)) + Math.sign(Math.sin(2 * Math.PI * f2 * t)) * 0.8;
    const env = Math.min(1, t * 3000) * (Math.exp(-t * 22) * 0.75 + Math.exp(-t * 6) * 0.25);
    out[i] = run(fl, sq) * env;
  }
  return out;
}
function pad(m, len, cutoff = 700) {
  const out = new Float32Array(Math.round((len + 0.3) * SR));
  const ph = [0, 0.3, 0.6];
  const fl = biquad("lp", cutoff, 0.8);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let v = 0;
    for (let k = 0; k < 3; k++) {
      ph[k] = (ph[k] + (mtof(m) * (1 + (k - 1) * 0.007)) / SR) % 1;
      v += 2 * ph[k] - 1;
    }
    const env = Math.min(1, t / 0.25) * (t > len ? Math.exp(-(t - len) * 8) : 1);
    out[i] = run(fl, v / 3) * env;
  }
  return out;
}
function boom(len = 0.9) {
  const out = new Float32Array(Math.round(len * SR));
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (38 + 90 * Math.exp(-t * 9))) / SR;
    out[i] = Math.tanh(Math.sin(ph) * 2.5 * Math.exp(-t * 3.2)) * 0.8 + rnd() * Math.exp(-t * 25) * 0.3;
  }
  return out;
}
function click(f = 2200, q = 1.6, gainTone = 0) {
  const out = noiseHit(0.03, 170, "bp", f, q);
  if (gainTone) for (let i = 0; i < out.length; i++) out[i] += Math.sin((2 * Math.PI * f * 0.25 * i) / SR) * Math.exp((-i / SR) * 120) * gainTone;
  return out;
}
function whoosh(len, f0, f1, rising = true) {
  const out = new Float32Array(Math.round(len * SR));
  const fl = biquad("bp", f0, 1.1);
  for (let i = 0; i < out.length; i++) {
    const p = i / out.length;
    if (i % 64 === 0) retune(fl, "bp", f0 * Math.pow(f1 / f0, p), 1.1);
    const env = rising ? Math.pow(p, 2.2) : Math.sin(Math.PI * p) ** 1.5;
    out[i] = run(fl, rnd()) * env;
  }
  return out;
}
function buzz(m, len = 0.16) {
  const out = new Float32Array(Math.round(len * SR));
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = Math.sign(Math.sin(2 * Math.PI * mtof(m) * t)) * Math.min(1, t * 800) * Math.exp(-t * 14);
  }
  return filterArr(out, "lp", 900, 0.8);
}

// --------------------------------------------------------------- the track
// 120 BPM; a 16th is 0.125 s; bars start on even seconds, so the reveal (6 s),
// the spin (12 s) and the outro (18 s) land on downbeats.
const S16 = 0.125, BAR = 2;
const at = (bar, step = 0) => bar * BAR + step * S16;
const CH = { 0: "A", 1: "A", 2: "Bb", 3: "A", 4: "A", 5: "F", 6: "A", 7: "Bb", 8: "A", 9: "A", 10: "A" };
const ROOT = { A: n("A", 1), F: n("F", 1), Bb: n("Bb", 1) };
const CHORD = { A: [n("A", 3), n("C", 4), n("E", 4)], F: [n("F", 3), n("A", 3), n("C", 4)], Bb: [n("Bb", 3), n("D", 4), n("F", 4)] };
// Cowbell hook over two bars (16th step → note): 3-3-2 rhythm, leaning on the b2 (Bb).
const HOOK = [[0, n("A", 5)], [3, n("A", 5)], [6, n("C", 6)], [8, n("A", 5)], [10, n("Bb", 5)], [11, n("A", 5)], [14, n("G", 5)], [16, n("A", 5)], [19, n("A", 5)], [22, n("C", 6)], [24, n("E", 6)], [26, n("D", 6)], [27, n("C", 6)], [30, n("Bb", 5)]];
const KICKS = [0, 6, 8, 11];

function bar808(bar, steps, gain) {
  const root = ROOT[CH[bar]], next = ROOT[CH[bar + 1] || CH[bar]];
  steps.forEach((st, k) => {
    const endStep = k + 1 < steps.length ? steps[k + 1] : 16;
    const len = (endStep - st) * S16;
    const glide = k === steps.length - 1 && next !== root ? next : null;
    add(low, at(bar, st), bass808(root, len, glide), gain);
  });
}

// Intro (0–2 s): filtered hook + hats, a taste of the 808.
{
  const fl = biquad("lp", 900, 0.9);
  const tmp = new Float32Array(Math.round(2.2 * SR));
  for (const [st, m] of HOOK) {
    if (st >= 16) continue;
    const c = cowbell(m, 0.2);
    const i0 = Math.round(st * S16 * SR);
    for (let k = 0; k < c.length && i0 + k < tmp.length; k++) tmp[i0 + k] += c[k];
  }
  for (let i = 0; i < tmp.length; i++) {
    if (i % 64 === 0) retune(fl, "lp", 1300 + 3200 * (i / tmp.length), 0.9);
    tmp[i] = run(fl, tmp[i]);
  }
  add(music, 0, tmp, 0.5, 0.1, 0.4);
  for (let st = 2; st < 16; st += 2) add(drums, at(0, st), noiseHit(0.04, 80, "hp", 7000), 0.1, 0.25);
  add(low, at(0, 0), bass808(n("A", 1), 0.75), 0.35);
  add(music, 0, pad(CHORD.A[0] - 12, 2.0, 500), 0.05, 0, 0.3);
}
// Verse (bars 1–2, 2–6 s): half-time drums, hook, 808 on the downbeats.
for (const bar of [1, 2]) {
  add(drums, at(bar, 0), kick(), 0.6);
  add(drums, at(bar, 10), kick(), 0.45);
  add(drums, at(bar, 8), snare(), 0.32, 0, 0.25);
  for (let st = 0; st < 16; st += 2) add(drums, at(bar, st), noiseHit(0.04, 80, "hp", 7000), st % 4 ? 0.11 : 0.07, 0.25);
  bar808(bar, [0, 10], 0.5);
  for (const [st, m] of HOOK) if ((bar === 1 && st < 16) || (bar === 2 && st >= 16 && st < 28)) add(music, at(bar, st % 16), cowbell(m, 0.2), 0.4, 0.15, 0.4);
  add(music, at(bar), pad(CHORD[CH[bar]][0], 2.0, 650), 0.045, -0.1, 0.3);
  for (const m of CHORD[CH[bar]].slice(1)) add(music, at(bar), pad(m, 2.0, 650), 0.038, 0.1, 0.3);
}
// Build into the drop: snare roll + rising noise, then a beat of silence-ish.
for (let k = 0; k < 8; k++) add(drums, at(2, 8 + k), snare(), 0.1 + k * 0.025, (k % 2) * 0.2 - 0.1, 0.2);
add(sfx, at(2, 4), whoosh(1.4, 300, 7000, true), 0.16, 0, 0.3);
// Drop + chorus (bars 3–8, 6–18 s). Bar 6 (spin) strips the hook for tension.
for (let bar = 3; bar <= 8; bar++) {
  const spin = bar === 6;
  for (const st of KICKS) {
    add(drums, at(bar, st), kick(), 0.66);
    const i0 = Math.round(at(bar, st) * SR);
    for (let k = 0; k < SR * 0.22 && i0 + k < N; k++) duck[i0 + k] = Math.min(duck[i0 + k], 0.4 + 0.6 * (k / (SR * 0.22)));
  }
  for (const st of [4, 12]) add(drums, at(bar, st), clap(), 0.36, 0.05, 0.3);
  for (let st = 0; st < 16; st++) {
    const roll = (bar === 5 || bar === 8) && st >= 12;
    add(drums, at(bar, st), noiseHit(0.035, 95, "hp", 7000), st % 2 ? 0.08 : 0.13, st % 2 ? -0.3 : 0.3);
    if (roll) add(drums, at(bar, st) + S16 / 2, noiseHit(0.03, 110, "hp", 7500), 0.08, 0.3);
  }
  bar808(bar, KICKS, 0.62);
  if (!spin) for (const [st, m] of HOOK) if ((bar % 2 === 1 && st < 16) || (bar % 2 === 0 && st >= 16)) add(music, at(bar, st % 16), cowbell(m, 0.22), 0.5, 0.15, 0.45);
  const chordCut = spin ? 420 : 900;
  CHORD[CH[bar]].forEach((m, i) => add(music, at(bar), pad(m, 2.0, chordCut), 0.045, i - 1, 0.35));
}
// Outro (bar 9+, 18–21 s): impact, long 808, the hook once more, tape stop.
add(drums, at(9), boom(1.4), 0.5);
add(drums, at(9), noiseHit(1.6, 2.4, "hp", 5000), 0.14, 0, 0.4);
add(low, at(9), bass808(n("A", 1), 2.2), 0.6);
for (const [st, m] of HOOK) if (st < 16) add(music, at(9, st), cowbell(m, 0.24), 0.45, 0.15, 0.55);
for (const st of [0, 8]) add(drums, at(9, st), kick(), 0.5);
add(drums, at(9, 4), clap(), 0.3, 0.05, 0.4);
add(drums, at(9, 12), clap(), 0.3, 0.05, 0.4);
CHORD.A.forEach((m, i) => add(music, at(9), pad(m, 2.6, 800), 0.045, i - 1, 0.5));

// ------------------------------------------------- sound effects on the cues
// 1 · chat (pops are soft muted plucks, typing ticks)
[[0.1, n("E", 5)], [0.62, n("C", 5)], [1.08, n("A", 4)]].forEach(([t, m]) => {
  add(sfx, t, click(1600, 1.4, 0.4), 0.12, 0.15);
  add(sfx, t, cowbell(m, 0.12, 0.6), 0.06, 0.15, 0.3);
});
for (let k = 0; k < 6; k++) add(sfx, 1.55 + k * 0.12, click(3400, 3), 0.035, -0.2);
// 2 · sign in, picker, picks, add, compare
add(sfx, 2.98, click(1900, 1.4, 0.5), 0.14);
add(sfx, 3.3, whoosh(0.32, 500, 2500, false), 0.08, 0, 0.3);
[[3.85, n("A", 4)], [4.2, n("C", 5)], [4.55, n("E", 5)]].forEach(([t, m]) => {
  add(sfx, t, click(2300, 1.6, 0.3), 0.12);
  add(sfx, t, cowbell(m, 0.14, 0.7), 0.07, 0.1, 0.3);
});
add(sfx, 4.95, click(1800, 1.4, 0.6), 0.14);
add(sfx, 5.6, click(1700, 1.4, 0.6), 0.15);
// 3 · reveal (scene runs 6.0–9.5): drop impact, glitch count ticks, hit on 39
add(sfx, 6.0, boom(1.0), 0.32);
for (let k = 0; k < 10; k++) {
  const t = 6.15 + 0.9 * (1 - Math.pow(1 - (k + 1) / 11, 1 / 3));
  add(sfx, t, click(2600 + k * 160, 3, 0.2), 0.05, k % 2 ? 0.25 : -0.25);
}
add(sfx, 7.05, noiseHit(0.4, 9, "hp", 3000), 0.06, 0, 0.4);
add(sfx, 7.05, cowbell(n("A", 5), 0.3, 1.1), 0.09, 0, 0.5);
add(sfx, 6.95, whoosh(0.35, 900, 3000, false), 0.05, 0.2, 0.3);
// 4 · narrow (9.5–12.0)
add(sfx, 9.48, whoosh(0.3, 700, 2400, false), 0.05);
add(sfx, 10.25, click(2100, 1.6, 0.5), 0.13);
add(sfx, 10.38, cowbell(n("E", 5), 0.12, 0.7), 0.05, 0, 0.3);
// 5 · spin (12.0–15.5): a ratchet tick per tile passing the marker, impact on landing
{
  const SPIN0 = 12.25, SPIN1 = 13.85, LAND = 22;
  const eo = (p) => 1 - Math.pow(1 - p, 3);
  let last = 1;
  for (let t = SPIN0; t <= SPIN1; t += 32 / SR) {
    const idx = Math.floor(1 + (LAND - 1) * eo(Math.min(1, (t - SPIN0) / (SPIN1 - SPIN0))) + 0.5);
    if (idx > last) {
      last = idx;
      add(sfx, t, click(3000 - idx * 35, 2.4), 0.09, (idx % 2) * 0.3 - 0.15);
    }
  }
  add(sfx, SPIN1, boom(0.8), 0.3);
  add(sfx, SPIN1, cowbell(n("A", 5), 0.35, 1.1), 0.1, 0, 0.5);
  add(sfx, 14.75, click(1800, 1.4, 0.6), 0.13);
}
// 6 · vote (15.5–18.0): two picks, a veto buzz, leading
[[15.95, n("C", 5)], [16.3, n("E", 5)]].forEach(([t, m]) => {
  add(sfx, t, click(2300, 1.6, 0.4), 0.12);
  add(sfx, t, cowbell(m, 0.12, 0.7), 0.06, 0.1, 0.3);
});
add(sfx, 16.68, click(1400, 1.2, 0.6), 0.12);
add(sfx, 16.68, buzz(n("E", 2), 0.18), 0.14, -0.1);
add(sfx, 17.05, cowbell(n("E", 5), 0.14), 0.07, -0.1, 0.4);
add(sfx, 17.17, cowbell(n("A", 5), 0.22), 0.07, 0.1, 0.4);
// 7 · outro: reverse rush into the impact, click on the CTA
add(sfx, 17.45, whoosh(0.55, 400, 6000, true), 0.12, 0, 0.3);
add(sfx, 18.66, click(2000, 1.4, 0.5), 0.1);

// ------------------------------------------------------------------- mixing
function reverb(inL, inR) {
  const combs = [1557, 1617, 1491, 1422].map((d) => Math.round((d * SR) / 44100));
  const aps = [556, 441].map((d) => Math.round((d * SR) / 44100));
  const process = (inp, spread) => {
    const outp = new Float32Array(N);
    const cb = combs.map((d) => ({ buf: new Float32Array(d + spread), i: 0, store: 0 }));
    const ab = aps.map((d) => ({ buf: new Float32Array(d + spread), i: 0 }));
    for (let i = 0; i < N; i++) {
      let s = 0;
      for (const c of cb) {
        const y = c.buf[c.i];
        c.store = y * 0.7 + c.store * 0.3;
        c.buf[c.i] = inp[i] * 0.4 + c.store * 0.8;
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
const [rvL, rvR] = reverb(send.L, send.R);
let L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const d = duck[i];
  L[i] = drums.L[i] + low.L[i] + music.L[i] * (0.55 + 0.45 * d) + sfx.L[i] + rvL[i] * 0.2;
  R[i] = drums.R[i] + low.R[i] + music.R[i] * (0.55 + 0.45 * d) + sfx.R[i] + rvR[i] * 0.2;
}
// Tape stop over the last 0.7 s: playback slows to a halt.
{
  const t0 = DUR - 0.7, i0 = Math.round(t0 * SR), len = N - i0;
  const srcL = L.slice(), srcR = R.slice();
  let pos = i0;
  for (let k = 0; k < len; k++) {
    const p = k / len;
    const speed = Math.max(0, 1 - p) ** 1.6;
    pos += speed;
    const j = Math.floor(pos), fr = pos - j;
    const a = j < N - 1 ? srcL[j] * (1 - fr) + srcL[j + 1] * fr : 0;
    const b = j < N - 1 ? srcR[j] * (1 - fr) + srcR[j + 1] * fr : 0;
    L[i0 + k] = a * (1 - p * 0.6);
    R[i0 + k] = b * (1 - p * 0.6);
  }
}
// Rumble filter, saturation as gentle glue, normalise (sample peak -1.5 dBFS), fades.
filterArr(L, "hp", 30, 0.7);
filterArr(R, "hp", 30, 0.7);
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.5) / 1.5;
  R[i] = Math.tanh(R[i] * 1.5) / 1.5;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = Math.pow(10, -1.5 / 20) / peak;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.01) * Math.min(1, (DUR - t) / 0.08);
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
console.log(`wrote ${OUT} (${DUR}s)`);
