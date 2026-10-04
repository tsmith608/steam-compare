// Captures the Discord part of the brag video from the real product:
//  1. the site's /discord page header (the "Add to your server" button), and
//  2. the reply the bot's own /compare command builds (bot/commands/compare.js),
//     run against the local mock API for the demo group.
// Only what needs Discord or the database is stubbed: which Steam account each
// (fictional) Discord user linked with /link, and the plan check (free tier).
// Emoji are Twemoji graphics, which is what Discord draws.
//   BOT_API_BASE=http://localhost:3100 node capture-discord.mjs
import { chromium } from "@playwright/test";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const BASE = process.env.BOT_API_BASE || "http://localhost:3100";
process.env.BOT_API_BASE = BASE;
const file = path.join(here, "fragments.json");
const out = JSON.parse(fs.readFileSync(file, "utf8"));

// 1 · /discord page header
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 360, height: 640 } });
await page.route(/steamstatic\.com|googletagmanager|google-analytics/, (r) => r.abort());
await page.goto(BASE + "/discord", { waitUntil: "load" });
out.discordHero = await page.locator("main header").first().evaluate((el) => el.outerHTML);
await browser.close();

// 2 · the bot's /compare reply
const require = createRequire(path.join(here, "../../bot/package.json"));
const api = require("./utils/api");
const tier = require("./utils/tierCheck");
const LINKS = { 1001: "76561190000000001", 1002: "76561190000000002", 1003: "76561190000000003", 1004: "76561190000000004" };
api.resolveSteamIds = async (ids) => ids.filter((id) => LINKS[id]).map((discordId) => ({ discordId, steamId: LINKS[discordId] }));
tier.checkTierAccess = async () => ({ allowed: true, currentTier: "Noob" });
const compare = require("./commands/compare");
const mentions = { user1: { id: "1002", username: "bram" }, user2: { id: "1003", username: "kit" }, user3: { id: "1004", username: "juno" } };
let reply = null;
await compare.execute({
  user: { id: "1001", username: "nova" },
  member: { voice: { channel: null } },
  guild: null,
  options: { getUser: (n) => mentions[n] || null, getChannel: () => null, getString: () => null },
  deferReply: async () => {},
  editReply: async (payload) => { reply = payload; },
});
if (!reply?.embeds?.length) throw new Error(`bot replied without an embed: ${JSON.stringify(reply)}`);
out.botCompare = {
  embeds: reply.embeds.map((e) => e.toJSON()),
  components: (reply.components || []).map((c) => c.toJSON()),
};

// Twemoji for every emoji in the reply (file names drop U+FE0F unless there's a ZWJ).
const text = JSON.stringify(out.botCompare);
const emojiDir = path.join(here, "../../node_modules/@twemoji/svg");
out.emoji = {};
for (const [e] of text.matchAll(/\p{Extended_Pictographic}(‍\p{Extended_Pictographic}|️)*/gu)) {
  const cps = [...e].map((c) => c.codePointAt(0).toString(16));
  const key = (e.includes("‍") ? cps : cps.filter((c) => c !== "fe0f")).join("-");
  const svg = path.join(emojiDir, `${key}.svg`);
  if (fs.existsSync(svg)) out.emoji[e] = `data:image/svg+xml;base64,${fs.readFileSync(svg).toString("base64")}`;
  else console.warn(`no Twemoji for ${e} (${key})`);
}

fs.writeFileSync(file, JSON.stringify(out, null, 1));
const em = out.botCompare.embeds[0];
console.log("discord hero:", out.discordHero.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160));
console.log("embed:", em.title, "|", em.description.replace(/\n/g, " / "));
for (const fl of em.fields) console.log(` [${fl.name}]`, fl.value.split("\n").slice(0, 4).join(" / "), fl.value.split("\n").length > 4 ? "…" : "");
console.log("buttons:", out.botCompare.components.flatMap((r) => r.components.map((c) => `${c.label} (style ${c.style})`)).join(", "));
console.log("emoji:", Object.keys(out.emoji).join(" "));
