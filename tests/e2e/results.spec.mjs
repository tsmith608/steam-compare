import { test, expect, expectNoHorizontalScroll, DEMO_IDS, PRIVATE_DEMO_ID } from "./fixtures.mjs";

const countLine = (page) => page.locator("p[aria-live=polite]").filter({ hasText: /games/ }).first();

test.describe("results", () => {
  test("demo results: headline, tabs, filters, search, sort", async ({ page }) => {
    await page.goto("/compare?demo=1");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toContainText("games you all own");
    await expectNoHorizontalScroll(page);

    // Filters narrow the list and say so.
    const total = (await countLine(page).innerText()).match(/[\d,]+/)[0];
    await page.getByRole("group", { name: "Filters" }).getByRole("button", { name: /Co-op/ }).first().click();
    await expect(page.getByRole("group", { name: "Filters" }).getByRole("button", { name: /Co-op/ }).first()).toHaveAttribute("aria-pressed", "true");
    await expect(countLine(page)).toContainText(` of ${total} games`);

    // Search finds a specific shared game.
    await page.getByRole("button", { name: /Co-op/ }).first().click();
    await page.getByRole("searchbox").fill("terraria");
    await expect(page.getByRole("link", { name: /Terraria on the Steam store/ }).first()).toBeVisible();

    // Sort and tabs are operable.
    await page.getByRole("searchbox").fill("");
    await page.getByLabel("Sort").selectOption({ label: "A–Z" });
    await page.getByRole("tab", { name: /Nobody's played/ }).click();
    await expect(page.getByRole("tab", { name: /Nobody's played/ })).toHaveAttribute("aria-selected", "true");
  });

  test("roulette picks a game from the current list", async ({ page }) => {
    await page.goto("/compare?demo=1");
    await page.getByRole("button", { name: "Spin" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/tonight's pick/i)).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toBeHidden();
  });

  test("shortlist → vote link → vote → live results", async ({ page, request }) => {
    const res = await request.post("/api/compare", { data: { users: DEMO_IDS } });
    const shared = (await res.json()).shared.map((g) => g.name);
    await page.goto("/compare?demo=1");
    await page.getByRole("searchbox").fill(shared[0]);
    await page.getByRole("button", { name: `Shortlist ${shared[0]}` }).first().click();
    await page.getByRole("searchbox").fill(shared[1]);
    await page.getByRole("button", { name: `Shortlist ${shared[1]}` }).first().click();
    await expect(page.getByText("2 shortlisted")).toBeVisible();

    await page.getByRole("button", { name: "Start a vote" }).click();
    const dialog = page.getByRole("dialog", { name: "Put it to a vote" });
    const voteLink = dialog.getByRole("link", { name: /Open the vote/ });
    await expect(voteLink).toBeVisible();
    const pollPath = new URL(await voteLink.getAttribute("href")).pathname;
    expect(pollPath).toMatch(/^\/poll\/[\w-]+$/);

    await page.goto(pollPath);
    await expect(page.getByRole("heading", { name: "What are we playing tonight?" })).toBeVisible();
    await page.getByRole("button", { name: "I'd play" }).first().click();
    await page.getByPlaceholder("So the group knows who voted").fill("E2E");
    await page.getByRole("button", { name: "Cast my vote" }).click();
    await expect(page.getByText(/1 voted: E2E/)).toBeVisible();
    await expect(page.getByText("Leading")).toBeVisible();
  });

  test("share link has its own page and preview image", async ({ page, request }) => {
    await page.goto("/compare?demo=1");
    await page.getByRole("button", { name: "Share" }).click();
    const dialog = page.getByRole("dialog", { name: "Share this comparison" });
    const preview = dialog.getByRole("img", { name: "Preview of the share card" });
    await expect(preview).toBeVisible();
    const id = (await preview.getAttribute("src")).match(/^\/s\/([\w-]+)\/opengraph-image/)[1];

    const og = await request.get(`/s/${id}/opengraph-image`);
    expect(og.ok()).toBe(true);
    expect(og.headers()["content-type"]).toContain("image/png");

    await page.goto(`/s/${id}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });

  test("a private profile doesn't block everyone else", async ({ page }) => {
    await page.goto(`/compare?p=${DEMO_IDS[0]},${DEMO_IDS[1]},${PRIVATE_DEMO_ID}`);
    await expect(page.getByRole("region", { name: "Hidden libraries" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("games you all own");
    await expect(page.getByRole("link", { name: "How to fix it" })).toHaveAttribute("href", "/guides/steam-game-details-private");
  });

  test("a bad profile is reported, not a blank page", async ({ page }) => {
    await page.goto(`/compare?p=${DEMO_IDS[0]},this-vanity-does-not-exist-xyz`);
    await expect(page.getByRole("link", { name: "Edit the group" }).first()).toBeVisible();
  });
});
