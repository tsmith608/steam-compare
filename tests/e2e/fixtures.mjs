// Shared test setup: no third-party network (Steam CDN art, analytics), so
// tests are fast and deterministic. Covers fall back to their text placeholders.
import { test as base, expect } from "@playwright/test";

export const DEMO_IDS = ["76561190000000001", "76561190000000002", "76561190000000003", "76561190000000004"];
export const PRIVATE_DEMO_ID = "76561190000000005";

export const test = base.extend({
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
