// Captures the real signed-in flow (Steam sign-in → friend picker → group)
// for the brag composition. Signs the capture browser in as the demo user
// with a session cookie signed by the local server's SESSION_SECRET.
import { chromium } from "@playwright/test";
import crypto from "node:crypto";
import fs from "node:fs";

const BASE = "http://localhost:3100";
const SECRET = process.env.SESSION_SECRET;
if (!SECRET || SECRET.length < 32) throw new Error("Set SESSION_SECRET to the local server's value");
const sid = "76561190000000001"; // Demo · Nova
const now = Math.floor(Date.now() / 1000);
const payload = Buffer.from(JSON.stringify({ v: 1, sid, iat: now, exp: now + 3600 })).toString("base64url");
const token = `${payload}.${crypto.createHmac("sha256", SECRET).update(payload).digest("base64url")}`;

const file = new URL("./fragments.json", import.meta.url);
const out = JSON.parse(fs.readFileSync(file, "utf8"));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, reducedMotion: "reduce" });
await ctx.addCookies([{ name: "wbp_session", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
const page = await ctx.newPage();
await page.route(/steamstatic\.com|steampowered\.com|googletagmanager|google-analytics/, (r) => r.abort());

// The sign-in link on the signed-out form (what a new visitor taps).
const anon = await browser.newPage({ viewport: { width: 360, height: 640 } });
await anon.route(/steamstatic\.com|googletagmanager/, (r) => r.abort());
await anon.goto(BASE + "/", { waitUntil: "load" });
await anon.getByRole("link", { name: /Sign in to pick friends/ }).waitFor(); // renders once the session check finishes
out.formSignedOut = await anon.locator("form").first().evaluate((el) => el.closest(".surface-raised").outerHTML);
await anon.close();

// Back from Steam: /?pick=1 opens the friend picker.
await page.goto(BASE + "/?pick=1", { waitUntil: "load" });
const dialog = page.getByRole("dialog", { name: "Pick friends" });
await dialog.waitFor();
await dialog.locator("button[aria-pressed]").first().waitFor();
const grab = () => dialog.evaluate((el) => el.outerHTML);
out.picker = [await grab()];
for (const name of ["Bram", "Kit", "Juno"]) {
  await dialog.locator("button[aria-pressed]", { hasText: name }).click();
  out.picker.push(await grab());
}
await dialog.getByRole("button", { name: /Add 3 to group/ }).click();
await dialog.waitFor({ state: "hidden" });
await page.waitForTimeout(200);
out.formSignedIn = await page.locator("form").first().evaluate((el) => el.closest(".surface-raised").outerHTML);
out.headerSignedIn = await page.locator("header").first().evaluate((el) => el.outerHTML);
fs.writeFileSync(file, JSON.stringify(out, null, 1));
console.log("picker states:", out.picker.length, "| friends:", (out.picker[0].match(/aria-pressed/g) || []).length, "| signed-in form rows:", (out.formSignedIn.match(/<li/g) || []).length);
await browser.close();
