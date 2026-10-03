import { test, expect, expectNoHorizontalScroll } from "./fixtures.mjs";

test.describe("pricing", () => {
  test("plans, prices and the honest free tier", async ({ page }) => {
    await page.goto("/upgrade");
    for (const plan of ["Noob", "Pro", "Hacker"]) await expect(page.getByRole("heading", { name: plan, exact: true })).toBeVisible();
    await expect(page.getByText("$3.99").first()).toBeVisible();
    await expect(page.getByText("$9.99").first()).toBeVisible();
    await expect(page.getByText(/8 players/i).first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("checkout needs a Steam sign-in first", async ({ page, request }) => {
    await page.goto("/upgrade");
    await expect(page.getByRole("link", { name: "Sign in through Steam to upgrade" }).first()).toHaveAttribute("href", /\/api\/compare\/auth\/steam\/start\?next=%2Fupgrade|\/api\/compare\/auth\/steam\/start\?next=\/upgrade/);
    const res = await request.post("/api/checkout", { data: { tier: "Pro" } });
    expect(res.status()).toBe(401);
  });

  test("account-only APIs refuse anonymous callers", async ({ request }) => {
    expect((await request.post("/api/portal")).status()).toBe(401);
    expect((await request.post("/api/user/profile", { data: { bio: "x" } })).status()).toBe(401);
    expect((await request.post("/api/claim-premium", { data: { transactionId: "abc" } })).status()).toBe(401);
    expect((await request.get("/api/debug/db")).status()).toBe(404);
  });
});
