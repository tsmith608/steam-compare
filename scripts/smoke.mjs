#!/usr/bin/env node
// Checks a deployed site from the outside, the way visitors and the Discord bot use it.
//   npm run smoke                         (https://webothplay.com)
//   npm run smoke -- https://<preview>.vercel.app
// With BOT_API_KEY in .env.local (or the environment) it also checks that the
// site accepts the bot's key, i.e. that Vercel and Railway have the same value.
// It doesn't sign in or pay. The demo comparison counts as one in analytics.
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root, false, { info: () => {}, error: () => {} });

const base = (process.argv.slice(2).find((a) => /^https?:\/\//.test(a)) || "https://webothplay.com").replace(/\/+$/, "");
const DEMO = ["76561190000000001", "76561190000000002", "76561190000000003", "76561190000000004"];
const NOBODY = "100000000000000000"; // a Discord ID nobody has linked
const results = [];

async function get(pathname, init = {}) {
  return fetch(`${base}${pathname}`, { redirect: "follow", signal: AbortSignal.timeout(20_000), ...init });
}

/** Runs one check. `fn` returns a detail string on success and throws (with the reason) on failure. */
async function check(name, fn, { warnOnly = false } = {}) {
  try {
    const detail = await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}${detail ? `: ${detail}` : ""}`);
  } catch (err) {
    results.push({ name, ok: warnOnly, warn: warnOnly });
    console.log(`  ${warnOnly ? "!" : "✗"} ${name}: ${err.message}`);
  }
}

const expectStatus = (res, ...ok) => {
  if (!ok.includes(res.status)) throw new Error(`HTTP ${res.status} (expected ${ok.join(" or ")})`);
};

console.log(`Checking ${base}\n`);

await check("health", async () => {
  const res = await get("/api/health");
  const body = await res.json().catch(() => null);
  if (!body?.checks) throw new Error(`HTTP ${res.status}, no health report`);
  const c = body.checks;
  const missing = [
    !c.database && "the database is unreachable (check DATABASE_URL in Vercel)",
    !c.steamKeyConfigured && "the Steam API key is missing (STEAM_API_KEY)",
    !c.sessionSecretConfigured && "SESSION_SECRET is missing or shorter than 32 characters",
  ].filter(Boolean);
  if (missing.length) throw new Error(missing.join("; "));
  return "database, Steam key and session secret OK";
});

await check("daily check has run in the last 36 hours", async () => {
  const c = (await (await get("/api/health")).json()).checks;
  if (c.dailyCronFresh === false || c.dailyCronFresh === undefined) throw new Error("not yet. Expected for the first day after launch; otherwise check Vercel → Settings → Cron Jobs and CRON_SECRET");
  return "yes";
}, { warnOnly: true });

for (const page of ["/", "/upgrade", "/discord", "/guides", "/help", "/privacy", "/terms", "/robots.txt", "/sitemap.xml", `/compare?p=${DEMO.join(",")}`]) {
  await check(`page ${page}`, async () => expectStatus(await get(page), 200));
}

await check("security headers", async () => {
  const h = (await get("/")).headers;
  const problems = [
    h.get("x-content-type-options") !== "nosniff" && "X-Content-Type-Options",
    h.get("x-frame-options") !== "DENY" && "X-Frame-Options",
    !/frame-ancestors/.test(h.get("content-security-policy") || "") && "Content-Security-Policy",
    base.startsWith("https:") && !h.get("strict-transport-security") && "Strict-Transport-Security",
  ].filter(Boolean);
  if (problems.length) throw new Error(`missing or wrong: ${problems.join(", ")}`);
});

await check("demo comparison (API)", async () => {
  const res = await get("/api/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ users: DEMO }) });
  expectStatus(res, 200);
  const shared = (await res.json()).stats?.sharedCount;
  if (!(shared > 0)) throw new Error("no shared games in the demo group");
  return `${shared} shared games`;
});

await check("single library (used by the bot)", async () => {
  const res = await get(`/api/library?steamid=${DEMO[0]}`);
  expectStatus(res, 200);
  return `${(await res.json()).shared?.length || 0} games`;
});

await check("old debug route is gone", async () => expectStatus(await get("/api/debug/db"), 404));

await check("bot-only endpoints need the bot's key", async () => {
  const res = await get(`/api/discord/link?discord_id=${NOBODY}`);
  if (res.status !== 401) throw new Error(`HTTP ${res.status} without a key: BOT_API_KEY isn't set in Vercel, so anyone can call the bot's endpoints`);
});

if (process.env.BOT_API_KEY) {
  await check("the site accepts the bot's key (Vercel and Railway match)", async () => {
    const res = await get(`/api/discord/link?discord_id=${NOBODY}`, { headers: { Authorization: `Bearer ${process.env.BOT_API_KEY}` } });
    if (res.status === 401) throw new Error("the site rejected BOT_API_KEY from .env.local. Make Vercel, Railway and .env.local use the same value");
    expectStatus(res, 200, 404);
  });
} else {
  console.log("  - skipped: bot key match (no BOT_API_KEY in .env.local)");
}

await check("Stripe webhook is configured", async () => {
  const res = await get("/api/webhooks/stripe", { method: "POST", headers: { "Content-Type": "application/json", "stripe-signature": "t=0,v1=0" }, body: "{}" });
  if (res.status === 500) throw new Error("STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is missing in Vercel");
  expectStatus(res, 400); // a made-up signature is rejected, which only happens once both are set
  return "signatures are checked";
});

const failed = results.filter((r) => !r.ok);
const warned = results.filter((r) => r.warn);
console.log(`\n${results.length - failed.length - warned.length} passed${warned.length ? `, ${warned.length} warning${warned.length > 1 ? "s" : ""}` : ""}${failed.length ? `, ${failed.length} failed` : ""}`);
process.exit(failed.length ? 1 : 0);
