#!/usr/bin/env node
// WeBothPlay social renderer: JSON content objects → 1080×1920 MP4s, covers,
// carousel slides and transparent overlays, in the website's design system.
//
//   npm run social:render                         # everything in posts.json
//   npm run social:render -- --only W01-MON,W01-WED
//   npm run social:render -- --file my-posts.json --fps 24
//   npm run social:render -- --clean            # wipe earlier renders, render everything
//
// GitHub Actions runs this automatically when the calendar or templates change
// (.github/workflows/social-render.yml) and commits the results.
// Output: marketing/renders/posts/<id>.mp4 (+ -cover.png, -slide-N.png, .png)
// Videos are silent masters: add Commercial Music Library audio or voiceover
// in TikTok/CapCut (see marketing/tiktok/STYLE_GUIDE.md).
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { TEMPLATES } from "./templates.mjs";
import { W, H, loadFonts } from "./lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const file = path.resolve(opt("file", path.join(here, "posts.json")));
const only = (opt("only", "") || "").split(",").filter(Boolean);
const fps = Number(opt("fps", 30));
const outDir = path.resolve(opt("out", path.join(here, "..", "renders", "posts")));
const keepFrames = args.includes("--keep-frames");

const posts = JSON.parse(fs.readFileSync(file, "utf8")).filter((p) => !only.length || only.includes(p.id));
fs.mkdirSync(outDir, { recursive: true });

// --clean removes earlier renders first, so renamed or removed posts don't linger.
if (args.includes("--clean") && !only.length && !args.includes("--child")) {
  for (const f of fs.readdirSync(outDir)) if (/\.(mp4|png)$/.test(f)) fs.unlinkSync(path.join(outDir, f));
}

// Rendering many videos in one process accumulates native (resvg) memory, so
// batches run one post per child process.
if (posts.length > 1 && !args.includes("--child")) {
  const skipExisting = args.includes("--skip-existing");
  const passThrough = args.filter((a, i) => a !== "--skip-existing" && a !== "--only" && args[i - 1] !== "--only");
  let failed = 0;
  for (const post of posts) {
    if (skipExisting && (fs.existsSync(path.join(outDir, `${post.id}.mp4`)) || fs.existsSync(path.join(outDir, `${post.id}.png`)))) continue;
    const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), ...passThrough, "--only", post.id, "--child"], { stdio: "inherit" });
    if (child.status !== 0) {
      failed++;
      console.error(`✗ ${post.id} failed (exit ${child.status})`);
    }
  }
  process.exit(failed ? 1 : 0);
}

const fonts = loadFonts();

// Emoji come from Twemoji (graphics CC-BY 4.0, see marketing/renderer/README.md),
// read from node_modules so any emoji in a post renders instead of a blank box.
const emojiDir = path.join(here, "..", "..", "node_modules", "@twemoji", "svg");
const emojiCache = new Map();
function emojiCode(segment) {
  // Twemoji file names drop U+FE0F unless the sequence contains a ZWJ (U+200D).
  const cps = [...(segment.includes("\u200d") ? segment : segment.replace(/\ufe0f/g, ""))].map((c) => c.codePointAt(0).toString(16));
  return cps.join("-");
}
async function loadAdditionalAsset(code, segment) {
  if (code !== "emoji") return [];
  const key = emojiCode(segment);
  if (!emojiCache.has(key)) {
    const file = path.join(emojiDir, `${key}.svg`);
    emojiCache.set(key, fs.existsSync(file) ? `data:image/svg+xml;base64,${fs.readFileSync(file).toString("base64")}` : null);
    if (!emojiCache.get(key)) console.warn(`  (no Twemoji graphic for ${segment} → ${key}.svg)`);
  }
  return emojiCache.get(key) || [];
}

async function png(tree, { transparent = false } = {}) {
  const svg = await satori(tree, { width: W, height: H, fonts, loadAdditionalAsset });
  return new Resvg(svg, { fitTo: { mode: "width", value: W }, background: transparent ? "rgba(0,0,0,0)" : "#060708" }).render().asPng();
}

for (const post of posts) {
  const tpl = TEMPLATES[post.template];
  if (!tpl) {
    console.warn(`skip ${post.id}: unknown template "${post.template}"`);
    continue;
  }
  const started = Date.now();
  const data = post.data || {};

  if (tpl.overlay) {
    fs.writeFileSync(path.join(outDir, `${post.id}.png`), await png(tpl.render(0, data), { transparent: true }));
    console.log(`✓ ${post.id} overlay (${Date.now() - started} ms)`);
    continue;
  }

  if (tpl.slides) {
    const slides = tpl.slides(data);
    for (let i = 0; i < slides.length; i++) fs.writeFileSync(path.join(outDir, `${post.id}-slide-${i + 1}.png`), await png(slides[i]));
  }

  const duration = Number(post.duration || tpl.duration);
  const frames = Math.ceil(duration * fps);
  const frameDir = path.join(outDir, `${post.id}-frames`);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });

  let lastKey = null;
  let lastBuf = null;
  let rendered = 0;
  for (let f = 0; f < frames; f++) {
    const t = f / fps;
    // A post may override the length; templates time their end card from this.duration.
    const tree = tpl.render.call({ ...tpl, duration }, t, data);
    const key = JSON.stringify(tree);
    if (key !== lastKey) {
      lastBuf = await png(tree);
      lastKey = key;
      rendered++;
    }
    fs.writeFileSync(path.join(frameDir, `${String(f).padStart(4, "0")}.png`), lastBuf);
  }

  // Cover = the last content frame before the dissolve into the end card starts (2.0 s from the end).
  const coverAt = Math.min(frames - 1, Math.round((post.coverAt ?? Math.max(0.5, duration - 2.1)) * fps));
  fs.copyFileSync(path.join(frameDir, `${String(coverAt).padStart(4, "0")}.png`), path.join(outDir, `${post.id}-cover.png`));

  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y",
    "-framerate", String(fps),
    "-i", path.join(frameDir, "%04d.png"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium",
    "-movflags", "+faststart",
    path.join(outDir, `${post.id}.mp4`),
  ]);
  if (!keepFrames) fs.rmSync(frameDir, { recursive: true, force: true });
  console.log(`✓ ${post.id} ${post.template} ${duration}s — ${rendered}/${frames} unique frames, ${((Date.now() - started) / 1000).toFixed(1)} s`);
}
