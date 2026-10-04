// Automated WCAG 2.2 A/AA checks (axe-core). Automated tools catch roughly a
// third of issues; keyboard and screen-reader passes are still manual.
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures.mjs";

const PAGES = ["/", "/compare?demo=1", "/upgrade", "/discord", "/help", "/guides/compare-steam-libraries", "/guides/steam-game-details-private", "/privacy", "/this-page-does-not-exist"];

for (const path of PAGES) {
  test(`no serious accessibility violations: ${path}`, async ({ page }) => {
    await page.goto(path);
    if (path.startsWith("/compare")) await expect(page.getByRole("heading", { level: 1 })).toContainText("games you all own");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact));
    const report = serious.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
    expect(report, report.join("\n")).toEqual([]);
  });
}
