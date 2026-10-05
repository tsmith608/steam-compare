// The Discord bot's commands, run against the site (production build, Steam
// mock mode, real database). Only Discord is stood in for: each command gets an
// object shaped like a discord.js interaction. The bot's API calls, the site's
// answers and discord.js building the reply are all real, so a reply Discord
// would reject (a steam:// button, say) fails here too.
// Needs the bot's dependencies: npm ci --prefix bot.
import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import pg from "pg";
import { test, expect } from "@playwright/test";
import { DEMO_IDS, PRIVATE_DEMO_ID } from "./fixtures.mjs";

// Same values as the webServer env in playwright.config.mjs.
const BOT_API_KEY = "e2e-bot-api-key-e2e-bot-api-key-0000";
const DISCORD_LINK_SECRET = "e2e-discord-link-secret-e2e-discord-0000";
const SESSION_SECRET = "e2e-session-secret-e2e-session-secret-0000";
const DATABASE_URL = process.env.E2E_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/webothplay";

// Fictional Discord accounts linked to the demo players. Only the private demo
// profile gets a paid tier, because the UI tests compare the other four and
// check their free limits. It unlocks Premium for the test server through the
// Hacker server perk.
const HACKER = { id: "100000000000000001", username: "hidden", steamId: PRIVATE_DEMO_ID };
const NOVA = { id: "100000000000000002", username: "nova", steamId: DEMO_IDS[0] };
const BRAM = { id: "100000000000000003", username: "bram", steamId: DEMO_IDS[1] };
const KIT = { id: "100000000000000004", username: "kit", steamId: DEMO_IDS[2] };
const JUNO = { id: "100000000000000005", username: "juno", steamId: DEMO_IDS[3] }; // linked by the /link test itself
const STRANGER = { id: "100000000000000009", username: "stranger" }; // never linked
const SEEDED = [HACKER, NOVA, BRAM, KIT];

const bot = createRequire(path.resolve("bot/package.json"));
const command = (name) => bot(`./commands/${name}.js`);

function sessionToken(sid) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ v: 1, sid, iat: now, exp: now + 3600 })).toString("base64url");
  return `${payload}.${crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url")}`;
}

function discordUser(account) {
  return {
    id: account.id,
    username: account.username,
    globalName: account.username,
    displayName: account.username,
    bot: false,
    displayAvatarURL: () => "https://cdn.discordapp.com/embed/avatars/0.png",
    toString: () => `<@${account.id}>`,
  };
}

function testServer(accounts) {
  const { Collection } = bot("discord.js");
  const members = new Collection(accounts.map((a) => [a.id, { id: a.id, user: discordUser(a), displayName: a.username }]));
  return { id: "900000000000000001", name: "Test Server", iconURL: () => null, members: { cache: members, fetch: async () => members } };
}

/** A stand-in for a slash-command interaction that records every reply as Discord would receive it. */
function interaction(account, { options = {}, guild = null } = {}) {
  const replies = [];
  const record = (message) => {
    const m = typeof message === "string" ? { content: message } : message;
    replies.push({ ...m, embeds: (m.embeds || []).map((e) => e.toJSON?.() ?? e), components: (m.components || []).map((c) => c.toJSON?.() ?? c) });
  };
  const self = {
    user: discordUser(account),
    guild,
    replied: false,
    deferred: false,
    replies,
    options: {
      getUser: (name) => options[name] ?? null,
      getString: (name) => options[name] ?? null,
      getChannel: (name) => options[name] ?? null,
      getInteger: (name) => options[name] ?? null,
      getBoolean: (name) => options[name] ?? null,
      getFocused: () => options.focused ?? "",
    },
    deferReply: async () => { self.deferred = true; },
    reply: async (m) => { self.replied = true; record(m); },
    editReply: async (m) => record(m),
    followUp: async (m) => record(m),
    update: async (m) => record(m),
    respond: async (choices) => replies.push({ choices }),
  };
  return self;
}

async function run(name, account, opts) {
  const i = interaction(account, opts);
  await command(name).execute(i);
  expect(i.replies.length, `/${name} replied`).toBeGreaterThan(0);
  return i.replies.at(-1);
}

/** The command answered with an embed rather than an error, and its link buttons are web links (Discord rejects steam:// and the like). */
function expectEmbed(reply, title) {
  expect(reply.content || "", "no error message").not.toMatch(/❌/);
  expect(reply.embeds[0]?.title).toContain(title);
  for (const button of linkButtons(reply)) expect(button.url, `${button.label} link`).toMatch(/^https?:\/\//);
}

const linkButtons = (reply) => (reply.components || []).flatMap((row) => row.components || []).filter((b) => b.style === 5);

test.describe("Discord bot", () => {
  // One test at a time (they share the seeded accounts), but a failure doesn't skip the rest.
  test.describe.configure({ mode: "default" });
  let db;
  let saved;
  const steamIds = [...SEEDED, JUNO].map((a) => a.steamId);

  test.beforeAll(async ({ baseURL }) => {
    // bot/utils/api.js reads these when it's first loaded.
    Object.assign(process.env, { BOT_API_BASE: baseURL, BOT_API_KEY, DISCORD_LINK_SECRET });
    db = new pg.Client({ connectionString: DATABASE_URL });
    await db.connect();
    saved = (await db.query("SELECT steam_id, discord_id, tier, expires_at FROM users WHERE steam_id = ANY($1)", [steamIds])).rows;
    await db.query("UPDATE users SET discord_id = NULL WHERE discord_id = ANY($1)", [[...SEEDED, JUNO].map((a) => a.id)]);
    for (const a of SEEDED) {
      await db.query(
        "INSERT INTO users (steam_id, discord_id) VALUES ($1, $2) ON CONFLICT (steam_id) DO UPDATE SET discord_id = EXCLUDED.discord_id",
        [a.steamId, a.id]
      );
    }
    await db.query("UPDATE users SET tier = 'Hacker', expires_at = NULL WHERE steam_id = $1", [HACKER.steamId]);
  });

  test.afterAll(async () => {
    // Put the demo players' rows back as they were.
    const before = new Map(saved.map((r) => [r.steam_id, r]));
    for (const id of steamIds) {
      const r = before.get(id);
      if (r) await db.query("UPDATE users SET discord_id = $2, tier = $3, expires_at = $4 WHERE steam_id = $1", [id, r.discord_id, r.tier, r.expires_at]);
      else await db.query("DELETE FROM users WHERE steam_id = $1", [id]);
    }
    await db.end();
  });

  test("every command loads and builds valid slash-command data", () => {
    const files = fs.readdirSync(path.resolve("bot/commands")).filter((f) => f.endsWith(".js"));
    expect(files.length).toBeGreaterThanOrEqual(10);
    for (const file of files) {
      const cmd = bot(`./commands/${file}`);
      expect(typeof cmd.execute, file).toBe("function");
      expect(cmd.data.toJSON().name, file).toMatch(/^[a-z]+$/);
    }
  });

  test("/help lists the commands", async () => {
    expectEmbed(await run("help", BRAM), "Bot Commands");
  });

  test("/link: the site accepts the bot's signed link, and refuses a forged one", async ({ request, baseURL }) => {
    const reply = await run("link", JUNO);
    expect(reply.ephemeral).toBe(true);
    const url = new URL(reply.content.match(/https?:\/\/\S+/)[0]);
    expect(`${url.origin}${url.pathname}`).toBe(`${baseURL}/auth/discord`);

    const body = { discordId: url.searchParams.get("discord_id"), exp: url.searchParams.get("exp"), sig: url.searchParams.get("sig") };
    const headers = { cookie: `wbp_session=${sessionToken(JUNO.steamId)}` };
    const forged = await request.post("/api/discord/link", { data: { ...body, sig: "0".repeat(64) }, headers });
    expect(forged.status()).toBe(400);
    const linked = await request.post("/api/discord/link", { data: body, headers });
    expect(linked.status(), await linked.text()).toBe(200);

    const lookup = await request.get(`/api/discord/link?discord_id=${JUNO.id}`, { headers: { authorization: `Bearer ${BOT_API_KEY}` } });
    expect((await lookup.json()).steamId).toBe(JUNO.steamId);
  });

  test("/stats builds the Gamer Resume", async () => {
    const reply = await run("stats", BRAM, { guild: testServer([BRAM, HACKER]) });
    expectEmbed(reply, "Gamer Resume");
    expect(reply.embeds[0].fields.find((f) => f.name.includes("Library Size")).value).toMatch(/\*\*\d+\*\* Games/);
  });

  test("/stats asks people who haven't linked to run /link", async () => {
    const reply = await run("stats", STRANGER, { guild: testServer([STRANGER, HACKER]) });
    expect(reply.content).toContain("/link");
  });

  test("/stats offers an upgrade outside a Hacker server", async () => {
    const reply = await run("stats", KIT);
    expect(reply.content).toContain("Pro** feature");
    expect(linkButtons(reply)[0].url).toContain("/upgrade");
  });

  test("/backlog picks a barely-played game, with a web link to Steam", async () => {
    const reply = await run("backlog", BRAM, { guild: testServer([BRAM, HACKER]) });
    expectEmbed(reply, "PILE OF SHAME");
    expect(linkButtons(reply).map((b) => b.url)).toContainEqual(expect.stringMatching(/^https:\/\/store\.steampowered\.com\/app\/\d+$/));
  });

  test("/flex suggests your games and shows your progress", async () => {
    const auto = interaction(BRAM, { options: { focused: "deep" } });
    await command("flex").autocomplete(auto);
    expect(auto.replies[0].choices.map((c) => c.name)).toContain("Deep Rock Galactic");

    expectEmbed(await run("flex", BRAM, { guild: testServer([BRAM, HACKER]), options: { game: "Deep Rock" } }), "Flexing on Deep Rock Galactic");
  });

  test("/roulette picks a game you can all play", async () => {
    const reply = await run("roulette", BRAM, { guild: testServer([BRAM, NOVA, HACKER]), options: { user1: discordUser(NOVA) } });
    expectEmbed(reply, "Roulette");
  });

  test("/compare compares linked friends", async () => {
    const reply = await run("compare", BRAM, { guild: testServer([BRAM, NOVA, HACKER]), options: { user1: discordUser(NOVA) } });
    expect(reply.content || "").not.toMatch(/❌/);
    expect(reply.embeds.length).toBeGreaterThan(0);
    for (const button of linkButtons(reply)) expect(button.url).toMatch(/^https?:\/\//);
  });

  test("/compatibility scores two libraries", async () => {
    const reply = await run("compatibility", BRAM, { guild: testServer([BRAM, NOVA, HACKER]), options: { user: discordUser(NOVA) } });
    expect(reply.content || "").not.toMatch(/❌/);
    expect(reply.embeds.length).toBeGreaterThan(0);
  });

  test("/hype and /leaderboard read the server's linked members", async () => {
    const guild = testServer([BRAM, NOVA, KIT, HACKER]);
    expectEmbed(await run("hype", BRAM, { guild }), "Squad Hype: Test Server");
    const board = await run("leaderboard", BRAM, { guild });
    expect(board.content || "").not.toMatch(/❌/);
    expect(board.embeds.length).toBeGreaterThan(0);
  });

  test("bot-only endpoints refuse requests without the right key", async ({ request }) => {
    const url = `/api/discord/link?discord_id=${BRAM.id}`;
    expect((await request.get(url)).status()).toBe(401);
    expect((await request.get(url, { headers: { authorization: "Bearer wrong-key" } })).status()).toBe(401);
    expect((await request.get(url, { headers: { authorization: `Bearer ${BOT_API_KEY}` } })).status()).toBe(200);
  });

  test("the bot isn't held to the per-visitor limit on /api/library", async ({ request }) => {
    const headers = { authorization: `Bearer ${BOT_API_KEY}`, "x-forwarded-for": "10.250.250.250" };
    const statuses = [];
    for (let n = 0; n < 35; n++) statuses.push((await request.get(`/api/library?steamid=${BRAM.steamId}`, { headers })).status());
    expect(statuses.filter((s) => s !== 200)).toEqual([]);
  });
});
