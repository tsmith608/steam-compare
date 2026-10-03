// Original soundtrack for the WeBothPlay brag video, synthesized from scratch:
// 120 BPM in C major, with every sound effect pitched to the track and placed
// on the composition's cues (timings mirror composition/compose.js).
//   node soundtrack.mjs [--duration 20] [--out music.wav]
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const SR = 48000;
const DUR = Number(opt("--duration", 20));
const N = Math.round(SR * DUR);
const OUT = path.resolve(here, opt("--out", "music.wav"));

// ------------------------------------------------------------------ buses
const bus = () => ({ L: new Float32Array(N), R: new Float32Array(N) });
const drums = bus(), bass = bus(), keys = bus(), lead = bus(), sfx = bus(), send = bus();
const duck = new Float32Array(N).fill(1); // sidechain gain from the kick

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const n = (name, oct) => 12 * (oct + 1) + NOTE[name];
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

// RBJ biquad
function biquad(type, f, q = 0.707) {
  const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
  let b0, b1, b2, a0, a1, a2;
  if (type === "lp") [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
  else if (type === "hp") [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  else [b0, b1, b2] = [a, 0, -a]; // band-pass
  [a0, a1, a2] = [1 + a, -2 * c, 1 - a];
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
}
function run(fl, x) {
  const y = fl.b0 * x + fl.b1 * fl.x1 + fl.b2 * fl.x2 - fl.a1 * fl.y1 - fl.a2 * fl.y2;
  fl.x2 = fl.x1; fl.x1 = x; fl.y2 = fl.y1; fl.y1 = y;
  return y;
}
const filterArr = (arr, type, f, q) => {
  const fl = biquad(type, f, q);
  for (let i = 0; i < arr.length; i++) arr[i] = run(fl, arr[i]);
  return arr;
};

// ------------------------------------------------------------- instruments
function kick(len = 0.42) {
  const out = new Float32Array(Math.round(len * SR));
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const f = 54 + 100 * Math.exp(-t * 34);
    ph += (2 * Math.PI * f) / SR;
    const env = Math.exp(-t * 9.5) * Math.min(1, t * 900);
    out[i] = Math.sin(ph) * env + (t < 0.004 ? rnd() * 0.25 * (1 - t / 0.004) : 0);
  }
  return out;
}
function noiseHit(len, decay, type, f, q = 0.9) {
  const out = new Float32Array(Math.round(len * SR));
  for (let i = 0; i < out.length; i++) out[i] = rnd() * Math.exp((-i / SR) * decay);
  return filterArr(out, type, f, q);
}
function clap() {
  const out = new Float32Array(Math.round(0.32 * SR));
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let env = 0;
    for (const o of [0, 0.011, 0.022]) if (t >= o) env = Math.max(env, Math.exp(-(t - o) * (o < 0.02 ? 140 : 18)));
    out[i] = rnd() * env;
  }
  return filterArr(filterArr(out, "bp", 1500, 0.7), "hp", 500);
}
// Detuned saw voice through a low-pass envelope (keys, stabs, bass).
function voice(freq, len, { cutoff = 2400, env = 6, detune = 0.006, saws = 2, attack = 0.004, release = 0.08, sweep = 0, sub = 0 } = {}) {
  const total = Math.round((len + release) * SR);
  const out = new Float32Array(total);
  const phases = Array.from({ length: saws }, (_, k) => k * 0.37);
  const fl = biquad("lp", cutoff, 0.9);
  let subPh = 0;
  for (let i = 0; i < total; i++) {
    const t = i / SR;
    let v = 0;
    for (let k = 0; k < saws; k++) {
      const fk = freq * (1 + detune * (k - (saws - 1) / 2));
      phases[k] = (phases[k] + fk / SR) % 1;
      v += 2 * phases[k] - 1;
    }
    v /= saws;
    if (sub) {
      subPh += (2 * Math.PI * freq * 0.5) / SR;
      v += Math.sin(subPh) * sub;
    }
    if (i % 32 === 0) {
      const c = Math.max(120, cutoff * (Math.exp(-t * env) * 0.85 + 0.15) * (1 + sweep * t));
      Object.assign(fl, biquad("lp", c, 0.9), { x1: fl.x1, x2: fl.x2, y1: fl.y1, y2: fl.y2 });
    }
    const a = Math.min(1, t / attack) * (t > len ? Math.exp(-(t - len) / (release / 4)) : 1);
    out[i] = run(fl, v) * a;
  }
  return out;
}
function bell(freq, len = 1.2, bright = 1) {
  const out = new Float32Array(Math.round(len * SR));
  const parts = [[1, 1, 3.2], [2.0, 0.42 * bright, 5], [3.01, 0.22 * bright, 7], [4.2, 0.1 * bright, 9]];
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let v = 0;
    for (const [m, a, d] of parts) v += Math.sin(2 * Math.PI * freq * m * t) * a * Math.exp(-t * d);
    out[i] = v * Math.min(1, t * 2000) * 0.5;
  }
  return out;
}
function blip(f0, f1, len = 0.09, shape = "sine") {
  const out = new Float32Array(Math.round(len * SR));
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR, p = t / len;
    const f = f0 * Math.pow(f1 / f0, Math.min(1, p * 1.6));
    ph += (2 * Math.PI * f) / SR;
    const s = shape === "tri" ? (2 / Math.PI) * Math.asin(Math.sin(ph)) : Math.sin(ph);
    out[i] = s * Math.min(1, t * 1500) * Math.exp(-p * 5);
  }
  return out;
}
function whoosh(len, f0, f1, decayIn = true) {
  const out = new Float32Array(Math.round(len * SR));
  const fl = biquad("bp", f0, 1.2);
  for (let i = 0; i < out.length; i++) {
    const p = i / out.length;
    if (i % 64 === 0) Object.assign(fl, biquad("bp", f0 * Math.pow(f1 / f0, p), 1.2), { x1: fl.x1, x2: fl.x2, y1: fl.y1, y2: fl.y2 });
    const env = decayIn ? Math.sin(Math.PI * Math.min(1, p)) ** 1.5 : Math.pow(p, 2);
    out[i] = run(fl, rnd()) * env;
  }
  return out;
}

// --------------------------------------------------------------- the track
// Bars are 2 s, offset by one beat so the reveal (5 s), the spin (11 s) and the
// outro (17 s) land on downbeats. Bar k starts at T0 + 2k.
const BEAT = 0.5, BAR = 2, T0 = 1.0;
const at = (bar, beat = 0) => T0 + bar * BAR + beat * BEAT;
const PROG = { "-1": ["A", "C", "E"], 0: ["A", "C", "E"], 1: ["F", "A", "C"], 2: ["C", "E", "G"], 3: ["G", "B", "D"], 4: ["A", "C", "E"], 5: ["F", "A", "C"], 6: ["C", "E", "G"], 7: ["G", "B", "D"], 8: ["C", "E", "G"], 9: ["C", "E", "G"] };
const ROOT = { A: n("A", 1), F: n("F", 1), C: n("C", 2), G: n("G", 1) };
const chordNotes = (bar, oct = 4) => PROG[bar].map((nm, i) => n(nm, oct + (i > 0 && NOTE[nm] < NOTE[PROG[bar][0]] ? 1 : 0)));

// Intro pad (0–5 s): soft, filtered, swelling into the reveal.
for (const bar of [-1, 0, 1]) {
  const start = bar === -1 ? 0 : at(bar), len = bar === -1 ? T0 : BAR;
  for (const m of chordNotes(bar)) add(keys, start, voice(mtof(m), len, { cutoff: bar === -1 ? 1300 : 1100 + bar * 500, env: 0.6, saws: 3, attack: bar === -1 ? 0.08 : 0.05, release: 0.3, detune: 0.008 }), bar === -1 ? 0.13 : 0.075, (m % 3) / 3 - 0.33, 0.35);
}
for (let e = 0; e < 4; e++) add(drums, 0.0 + e * BEAT + BEAT / 2, noiseHit(0.08, 45, "hp", 7000), 0.08, 0.25, 0.2);
for (let e = 0; e < 2; e++) add(drums, 0.0 + e * 0.5 * BAR / 2 + 0.25, clap(), 0.1, 0.1, 0.35);
add(sfx, 0.0, whoosh(1.0, 300, 2500, false), 0.06, 0, 0.3);
// Light verse groove (bars 0–1): kick on 1 and 3, snaps on 2 and 4, shaker 8ths.
for (const bar of [0, 1]) {
  for (const b of [0, 2]) add(drums, at(bar, b), kick(), 0.46);
  for (const b of [1, 3]) add(drums, at(bar, b), clap(), 0.18, 0.1, 0.25);
  for (let e = 0; e < 8; e++) add(drums, at(bar, e / 2), noiseHit(0.05, 70, "hp", 7500), e % 2 ? 0.07 : 0.035, 0.3);
  for (let e = 0; e < 4; e++) add(bass, at(bar, e), voice(mtof(ROOT[PROG[bar][0]]), 0.42, { cutoff: 520, env: 7, saws: 1, sub: 0.5, release: 0.05 }), 0.2);
}
// Drop / chorus (bars 2–7) and outro bar 8: four on the floor, offbeat hats,
// claps on 2 and 4, octave bass, offbeat chord stabs, a lead hook.
const LEAD = {
  2: [["E", 5, 0], ["G", 5, 0.5], ["A", 5, 1], ["G", 5, 1.5], ["E", 5, 2.5]],
  3: [["D", 5, 0], ["G", 5, 0.5], ["B", 4, 1.5], ["D", 5, 2], ["G", 5, 3]],
  4: [["C", 5, 0], ["E", 5, 0.5], ["A", 5, 1], ["G", 5, 1.5], ["E", 5, 2.5]],
  5: [["F", 5, 0], ["A", 5, 0.5], ["G", 5, 1.5], ["E", 5, 2], ["C", 5, 3]],
  6: [["E", 5, 0], ["G", 5, 0.5], ["C", 6, 1], ["B", 5, 1.5], ["G", 5, 2.5]],
  7: [["D", 5, 0], ["F", 5, 0.5], ["G", 5, 1], ["B", 5, 2], ["D", 6, 3]],
};
for (let bar = 2; bar <= 8; bar++) {
  const spin = bar === 5; // filter the band while the roulette spins
  for (let b = 0; b < 4; b++) {
    if (bar === 8 && b > 0) break;
    add(drums, at(bar, b), kick(), 0.44);
    const i0 = Math.round(at(bar, b) * SR);
    for (let k = 0; k < SR * 0.32 && i0 + k < N; k++) duck[i0 + k] = Math.min(duck[i0 + k], 0.45 + 0.55 * Math.min(1, k / (SR * 0.3)));
    if (b % 2 === 1) add(drums, at(bar, b), clap(), 0.32, 0.05, 0.3);
    add(drums, at(bar, b + 0.5), noiseHit(0.16, 22, "hp", 6500), 0.11, -0.25);
    add(drums, at(bar, b), noiseHit(0.04, 90, "hp", 9000), 0.04, 0.3);
  }
  if (bar === 8) continue;
  const root = mtof(ROOT[PROG[bar][0]]);
  for (let e = 0; e < 8; e++) add(bass, at(bar, e / 2), voice(root * (e % 4 === 3 ? 2 : 1), 0.2, { cutoff: spin ? 700 : 1300, env: 8, saws: 1, sub: 0.2, release: 0.04 }), 0.15);
  for (const b of [0.5, 1.5, 2.5, 3.5]) for (const m of chordNotes(bar)) add(keys, at(bar, b), voice(mtof(m), 0.16, { cutoff: spin ? 1200 : 3200, env: 12, saws: 2, release: 0.12 }), 0.088, (m % 4) / 4 - 0.4, 0.35);
  if (!spin) for (const [nm, oc, b] of LEAD[bar]) add(lead, at(bar, b), voice(mtof(n(nm, oc)), 0.22, { cutoff: 4200, env: 9, saws: 2, detune: 0.004, release: 0.18 }), 0.125, 0.15, 0.45);
}
// Riser into the drop and the final chord.
add(sfx, at(1, 2), whoosh(1.0, 400, 6000, false), 0.12, 0, 0.4);
add(drums, at(2), noiseHit(1.6, 2.6, "hp", 5000), 0.11, 0, 0.3); // crash on the reveal
add(drums, at(8), noiseHit(1.8, 2.2, "hp", 5000), 0.12, 0, 0.35); // crash on the outro
for (const m of chordNotes(8)) add(keys, at(8), voice(mtof(m), 2.6, { cutoff: 2400, env: 1.2, saws: 3, release: 0.6, attack: 0.01 }), 0.06, (m % 3) / 3 - 0.33, 0.5);
add(bass, at(8), voice(mtof(n("C", 2)), 2.4, { cutoff: 480, env: 1.5, saws: 1, sub: 0.4, release: 0.5 }), 0.18);

// ------------------------------------------------- sound effects on the cues
const C5 = n("C", 5);
const scale = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19];
// 1 · chat pops (E5, G5, C6) and typing ticks
[[0.1, n("E", 5)], [0.62, n("G", 5)], [1.08, n("C", 6)]].forEach(([t, m]) => add(sfx, t, blip(mtof(m) * 0.75, mtof(m), 0.08), 0.16, 0.15, 0.3));
for (let k = 0; k < 6; k++) add(sfx, 1.55 + k * 0.12, noiseHit(0.02, 200, "bp", 3200, 2), 0.035, -0.2);
// 2 · paste ticks (C5 D5 E5 G5), button press
[2.95, 3.3, 3.65, 4.0].forEach((t, i) => {
  add(sfx, t, noiseHit(0.025, 160, "bp", 2600, 1.5), 0.06);
  add(sfx, t, blip(mtof(C5 + scale[i < 3 ? i : 4]), mtof(C5 + scale[i < 3 ? i : 4]), 0.07, "tri"), 0.08, 0, 0.25);
});
add(sfx, 4.42, noiseHit(0.03, 140, "bp", 1800, 1.4), 0.1);
add(sfx, 4.42, blip(mtof(n("G", 4)), mtof(n("C", 5)), 0.09), 0.08);
// 3 · reveal: low impact, rising count blips, bell on 39, fact swish
add(sfx, 5.0, blip(110, 42, 0.5), 0.22);
for (let k = 0; k < 9; k++) {
  const t = 5.15 + 0.9 * (1 - Math.pow(1 - (k + 1) / 10, 1 / 3)); // follows the ease-out count
  add(sfx, t, blip(mtof(C5 + scale[k]), mtof(C5 + scale[k]), 0.05, "tri"), 0.045, k % 2 ? 0.2 : -0.2, 0.3);
}
[n("C", 6), n("E", 6), n("G", 6)].forEach((m, i) => add(sfx, 6.05 + i * 0.012, bell(mtof(m), 1.4, 0.8), 0.07, i - 1, 0.5));
add(sfx, 5.95, whoosh(0.35, 1200, 3500), 0.05, 0.2, 0.3);
// 4 · scene in, chip tap, count bump
add(sfx, 8.48, whoosh(0.3, 900, 2600), 0.05);
add(sfx, 9.25, noiseHit(0.03, 150, "bp", 2000, 1.4), 0.09);
add(sfx, 9.25, blip(mtof(n("A", 5)), mtof(n("A", 5)), 0.08, "tri"), 0.08, 0, 0.25);
add(sfx, 9.38, blip(mtof(n("E", 5)), mtof(n("G", 5)), 0.09, "tri"), 0.06, 0, 0.3);
// 5 · roulette: one ratchet tick per tile passing the marker, chord hit on landing
{
  const SPIN0 = 11.25, SPIN1 = 12.85, TW = 148, LAND = 22;
  const eo = (p) => 1 - Math.pow(1 - p, 3);
  let last = 1;
  for (let t = SPIN0; t <= SPIN1; t += 1 / SR * 32) {
    const p = eo(Math.min(1, (t - SPIN0) / (SPIN1 - SPIN0)));
    const idx = Math.floor(1 + (LAND - 1) * p + 0.5);
    if (idx > last) {
      last = idx;
      add(sfx, t, noiseHit(0.018, 260, "bp", 3800 - idx * 40, 2.5), 0.07, (idx % 2) * 0.3 - 0.15);
    }
  }
  add(sfx, SPIN1, blip(mtof(n("G", 4)), mtof(n("C", 5)), 0.12), 0.1);
  for (const m of [n("C", 5), n("E", 5), n("G", 5), n("C", 6)]) add(keys, SPIN1, voice(mtof(m), 0.5, { cutoff: 3200, env: 5, saws: 2, release: 0.4 }), 0.06, 0, 0.5);
  add(sfx, SPIN1 + 0.02, bell(mtof(n("C", 6)), 1.0, 1), 0.06, 0, 0.5);
  add(sfx, 11.15, noiseHit(0.03, 150, "bp", 2000, 1.4), 0.06);
  add(sfx, 13.75, noiseHit(0.03, 150, "bp", 1800, 1.4), 0.08);
  add(sfx, 13.75, blip(mtof(n("E", 5)), mtof(n("G", 5)), 0.08, "tri"), 0.06);
}
// 6 · vote: two "I'd play" (bright), one veto (down), leading
[[14.95, n("G", 5)], [15.3, n("C", 6)]].forEach(([t, m]) => {
  add(sfx, t, noiseHit(0.025, 160, "bp", 2400, 1.4), 0.07);
  add(sfx, t, blip(mtof(m) * 0.9, mtof(m), 0.09, "tri"), 0.08, 0.1, 0.3);
});
add(sfx, 15.68, noiseHit(0.03, 150, "bp", 1400, 1.4), 0.07);
add(sfx, 15.68, blip(mtof(n("E", 4)), mtof(n("C", 4)), 0.16, "tri"), 0.1, -0.1, 0.2);
add(sfx, 16.05, blip(mtof(n("G", 5)), mtof(n("G", 5)), 0.1, "tri"), 0.06, -0.1, 0.4);
add(sfx, 16.17, blip(mtof(n("C", 6)), mtof(n("C", 6)), 0.18, "tri"), 0.06, 0.1, 0.4);
// 7 · outro: soft pop on the CTA
add(sfx, 17.66, blip(mtof(n("C", 5)), mtof(n("G", 5)), 0.1), 0.06, 0, 0.4);

// ------------------------------------------------------------------- mixing
// Freeverb-style room on the send bus.
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
        c.store = y * 0.75 + c.store * 0.25;
        c.buf[c.i] = inp[i] * 0.4 + c.store * 0.78;
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
const L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const d = duck[i];
  L[i] = drums.L[i] + bass.L[i] * d + keys.L[i] * (0.6 + 0.4 * d) + lead.L[i] + sfx.L[i] + rvL[i] * 0.22;
  R[i] = drums.R[i] + bass.R[i] * d + keys.R[i] * (0.6 + 0.4 * d) + lead.R[i] + sfx.R[i] + rvR[i] * 0.22;
}
// Rumble filter, gentle bus compression via soft clip, then normalise to -1 dBFS.
filterArr(L, "hp", 32, 0.7);
filterArr(R, "hp", 32, 0.7);
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.4) / 1.4;
  R[i] = Math.tanh(R[i] * 1.4) / 1.4;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = Math.pow(10, -1.5 / 20) / peak; // sample peak -1.5 dBFS keeps true peak under -1
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.02) * Math.min(1, (DUR - t) / 0.35);
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
console.log(`wrote ${OUT} (${DUR}s, peak normalised to -1.5 dBFS)`);
