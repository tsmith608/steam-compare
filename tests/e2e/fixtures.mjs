// Shared test setup: no third-party network (Steam CDN art, analytics), so
// tests are fast and deterministic. Covers fall back to their text placeholders.
import { test as base, expect } from "@playwright/test";

export const DEMO_IDS = ["76561190000000001", "76561190000000002", "76561190000000003", "76561190000000004"];
export const PRIVATE_DEMO_ID = "76561190000000005";

let visitor = 0;

export const test = base.extend({
  // Each test looks like its own visitor (local server trusts X-Forwarded-For),
  // so the per-IP comparison rate limit isn't shared across the whole suite.
  extraHTTPHeaders: async ({}, use, testInfo) => {
    visitor += 1;
    await use({ "x-forwarded-for": `10.${testInfo.workerIndex % 250}.${Math.floor(visitor / 250) % 250}.${(visitor % 250) + 1}` });
  },
  page: async ({ page }, use) => {
    await page.route(/steamstatic\.com|steampowered\.com|akamaihd\.net|googletagmanager\.com|google-analytics\.com/, (route) => route.abort());
    await use(page);
  },
});

/** The page never scrolls sideways (common mobile regression). */
export async function expectNoHorizontalScroll(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(1);
}

export { expect };
