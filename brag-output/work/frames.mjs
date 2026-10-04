// Captures the composition: `node frames.mjs --stills 0.5,1.4` for QA stills,
// `node frames.mjs --all` for every frame (30 fps) → work/frames/f_00000.png,
// or `node frames.mjs --cues` for the sound cues → work/cues.json (soundtrack.mjs reads it).
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const URL_ = opt("--url", "http://localhost:3100/brag/index.html");
const FPS = Number(opt("--fps", 30));
const DUR = Number(opt("--duration", 24.5));
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 })).newPage();
page.on("pageerror", (e) => console.error("PAGEERROR", e.message));
await page.route(/steamstatic\.com|steampowered\.com|googletagmanager|google-analytics/, (r) => r.abort());
await page.goto(URL_, { waitUntil: "load" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });

const shot = async (t, file) => {
  await page.evaluate((tt) => window.seek(tt), t);
  await page.screenshot({ path: file, type: "png", animations: "disabled", caret: "hide" });
};

if (args.includes("--cues")) {
  const cues = await page.evaluate(() => window.__cues);
  fs.writeFileSync(path.join(here, "cues.json"), JSON.stringify(cues, null, 1));
  console.log(`cues: ${cues.cues.length} → cues.json`);
} else if (args.includes("--stills")) {
  const dir = path.join(here, "stills");
  fs.mkdirSync(dir, { recursive: true });
  for (const t of opt("--stills", "").split(",").map(Number)) await shot(t, path.join(dir, `s_${t.toFixed(2).padStart(5, "0")}.png`));
  console.log("stills done");
} else if (args.includes("--all")) {
  const dir = path.join(here, "frames");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(FPS * DUR);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await shot(i / FPS, path.join(dir, `f_${String(i).padStart(5, "0")}.png`));
    if (i % 60 === 0) console.log(`frame ${i}/${n} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  console.log(`frames done: ${n}`);
}
await browser.close();
