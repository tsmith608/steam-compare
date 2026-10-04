// The main flow for returning users: sign in through Steam, pick friends,
// compare. The session cookie is signed with the E2E server's SESSION_SECRET
// (playwright.config.mjs), standing in for a completed Steam sign-in.
import crypto from "node:crypto";
import { test, expect } from "./fixtures.mjs";

const SECRET = "e2e-session-secret-e2e-session-secret-0000";
function sessionToken(sid) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ v: 1, sid, iat: now, exp: now + 3600 })).toString("base64url");
  return `${payload}.${crypto.createHmac("sha256", SECRET).update(payload).digest("base64url")}`;
}

test("signed in: pick friends from Steam, they show by name, compare", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "wbp_session", value: sessionToken("76561190000000001"), url: baseURL }]);
  await page.goto("/?pick=1"); // where the Steam sign-in returns to
  const dialog = page.getByRole("dialog", { name: "Pick friends" });
  await expect(dialog).toBeVisible();
  for (const name of ["Bram", "Kit", "Juno"]) await dialog.getByRole("button", { name: new RegExp(name) }).click();
  await expect(dialog.getByText("3 selected")).toBeVisible();
  await dialog.getByRole("button", { name: "Add 3 to group" }).click();
  await expect(dialog).toBeHidden();

  // Friends appear by their Steam name, not as raw SteamID64s.
  await expect(page.getByText("Demo · Bram")).toBeVisible();
  await expect(page.locator('input[value="76561190000000002"]')).toHaveCount(0);
  await expect(page.getByText("4/8 players")).toBeVisible();

  await page.getByRole("button", { name: /compare libraries/i }).click();
  await expect(page).toHaveURL(/\/compare\?p=76561190000000001,/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("games you all own");
});
