// Captures the real WeBothPlay UI (production build, mock mode) as HTML fragments
// for the brag composition. Run with the app on http://localhost:3100.
import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = "http://localhost:3100";
const out = {};
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.route(/steamstatic\.com|steampowered\.com|googletagmanager|google-analytics/, (r) => r.abort());

// Shell: classes that carry the font variables, and the stylesheet(s).
await page.goto(BASE + "/", { waitUntil: "load" });
out.htmlClass = await page.evaluate(() => document.documentElement.className);
out.bodyClass = await page.evaluate(() => document.body.className);
out.css = await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute("href")));
out.wordmark = await page.locator("header a[aria-label='WeBothPlay home']").first().evaluate((el) => el.outerHTML);

// Home form with four rows.
const add = page.getByRole("button", { name: /add a friend/i });
await add.click();
await add.click();
out.form = await page.locator("form").first().evaluate((el) => el.closest(".surface-raised")?.outerHTML || el.outerHTML);

// Results for the labelled example group.
await page.goto(BASE + "/compare?demo=1", { waitUntil: "load" });
await page.getByRole("heading", { level: 1 }).waitFor();
await page.waitForFunction(() => !document.querySelector('[role="group"][aria-label="Filters"]')?.textContent.includes("…"), null, { timeout: 15000 });
await page.waitForTimeout(600);
out.results = await page.evaluate(() => {
  const h1 = document.querySelector("h1");
  const header = h1.closest("section");
  const q = (sel, root = document) => root.querySelector(sel);
  const pill = [...header.querySelectorAll("p")].find((p) => p.textContent.includes("Example group"));
  const avatars = h1.previousElementSibling;
  const nameLine = h1.nextElementSibling;
  const stats = [...header.querySelectorAll("div")].find((d) => d.className.includes("grid-cols-2") && d.querySelectorAll("button").length >= 4);
  const facts = q("ul", header);
  const toolbar = q('[role="group"][aria-label="Filters"]').closest("div.sticky");
  const count = [...document.querySelectorAll("p[aria-live=polite]")].find((p) => /games/.test(p.textContent));
  const cards = [...document.querySelectorAll("main ul li")].filter((li) => li.querySelector("h3")).slice(0, 12).map((li) => ({ name: li.querySelector("h3").textContent, html: li.outerHTML }));
  return {
    pill: pill?.outerHTML, avatars: avatars?.outerHTML, h1: h1.outerHTML, nameLine: nameLine?.outerHTML,
    stats: stats?.outerHTML, facts: facts?.outerHTML, toolbar: toolbar?.outerHTML, count: count?.outerHTML, cards,
  };
});
// Co-op filter applied.
await page.getByRole("group", { name: "Filters" }).getByRole("button", { name: /^Co-op/ }).click();
await page.waitForTimeout(300);
out.coop = await page.evaluate(() => {
  const toolbar = document.querySelector('[role="group"][aria-label="Filters"]').closest("div.sticky");
  const count = [...document.querySelectorAll("p[aria-live=polite]")].find((p) => /games/.test(p.textContent));
  const cards = [...document.querySelectorAll("main ul li")].filter((li) => li.querySelector("h3")).slice(0, 12).map((li) => ({ name: li.querySelector("h3").textContent, html: li.outerHTML }));
  return { toolbar: toolbar.outerHTML, count: count.outerHTML, cards };
});
await page.getByRole("group", { name: "Filters" }).getByRole("button", { name: /^Co-op/ }).click();

// Roulette, re-spun until it lands on Deep Rock Galactic (a real outcome of the real component).
await page.getByRole("button", { name: "Spin" }).click();
const dialog = page.getByRole("dialog");
await dialog.getByText(/tonight's pick/i).waitFor();
for (let i = 0; i < 80; i++) {
  const name = await dialog.locator("h2, h3, p.display, .display").allTextContents();
  if (name.join(" ").includes("Deep Rock Galactic")) break;
  await dialog.getByRole("button", { name: /spin again/i }).click();
  await page.waitForTimeout(80);
}
out.roulette = await dialog.evaluate((el) => el.outerHTML);
out.rouletteHasDRG = out.roulette.includes("Deep Rock Galactic");
await dialog.getByRole("button", { name: "Close" }).click();

// Vote page for four shared games.
const res = await page.request.post(BASE + "/api/polls", { data: { users: ["76561190000000001", "76561190000000002", "76561190000000003", "76561190000000004"], appids: [548430, 1966720, 892970, 3241660] } });
const poll = await res.json();
await page.goto(BASE + "/poll/" + poll.id, { waitUntil: "load" });
await page.getByRole("heading", { name: "What are we playing tonight?" }).waitFor();
out.pollVote = await page.locator("main").evaluate((el) => el.querySelector(".max-w-3xl")?.outerHTML || el.innerHTML);
await page.getByRole("button", { name: "I'd play" }).nth(0).click();
await page.getByRole("button", { name: "I'd play" }).nth(2).click();
await page.getByRole("button", { name: "Veto" }).nth(3).click();
out.pollVoteTapped = await page.locator("main").evaluate((el) => el.querySelector(".max-w-3xl")?.outerHTML);
await page.getByPlaceholder("So the group knows who voted").fill("Kit");
await page.getByRole("button", { name: "Cast my vote" }).click();
await page.getByText("Leading").waitFor();
out.pollResults = await page.locator("main").evaluate((el) => el.querySelector(".max-w-3xl")?.outerHTML);

fs.writeFileSync(new URL("./fragments.json", import.meta.url), JSON.stringify(out, null, 1));
console.log("captured:", Object.keys(out).join(", "), "| results cards:", out.results.cards.length, "| coop cards:", out.coop.cards.length, "| DRG pick:", out.rouletteHasDRG);
await browser.close();
