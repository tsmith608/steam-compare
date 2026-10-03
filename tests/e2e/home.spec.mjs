import { test, expect, expectNoHorizontalScroll } from "./fixtures.mjs";

test.describe("homepage", () => {
  test("the compare form is the first thing you can use", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("What are we");
    const first = page.getByPlaceholder("Your Steam profile or ID");
    await expect(first).toBeVisible();
    const box = await first.boundingBox();
    const viewport = page.viewportSize();
    expect(box.y + box.height, "first profile field is above the fold").toBeLessThan(viewport.height);
    await expectNoHorizontalScroll(page);
  });

  test("invalid input gets an inline, announced error", async ({ page }) => {
    await page.goto("/");
    const first = page.getByPlaceholder("Your Steam profile or ID");
    await first.fill("not a profile!!");
    await page.getByRole("button", { name: /compare/i }).first().click();
    await expect(first).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("That doesn't look like a Steam profile link")).toBeVisible();
  });

  test("two profiles go straight to a shareable results URL", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Your Steam profile or ID").fill("76561190000000001");
    await page.getByPlaceholder("A friend's Steam profile or ID").first().fill("https://steamcommunity.com/profiles/76561190000000002/");
    await page.getByRole("button", { name: /compare/i }).first().click();
    await expect(page).toHaveURL(/\/compare\?p=76561190000000001,76561190000000002/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("games you all own");
  });

  test("example link opens a labelled demo", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "See an example first" }).click();
    await expect(page).toHaveURL(/\/compare\?demo=1/);
    await expect(page.getByText("Example group — fictional players, real games.")).toBeVisible();
  });
});

test.describe("site basics", () => {
  test("unknown pages are real 404s", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "No overlap here." })).toBeVisible();
    const notAnId = await page.goto("/12345");
    expect(notAnId.status()).toBe(404);
  });

  test("health, robots and sitemap respond", async ({ request }) => {
    const health = await request.get("/api/health");
    expect(health.ok()).toBe(true);
    expect((await health.json()).checks.database).toBe(true);
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Sitemap:");
    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain("/guides/compare-steam-libraries");
  });

  test("security headers are set", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBeTruthy();
    expect(h["referrer-policy"]).toBeTruthy();
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("skip link moves keyboard focus to the content", async ({ page, browserName }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "keyboard flow is a desktop concern");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});
