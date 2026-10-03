// Database integration tests. They run only when TEST_DATABASE_URL points at a
// disposable database with the migrations applied (never production):
//   TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webothplay npm test
// Rows use demo-range Steam IDs (below the real range) and are removed afterwards.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;
const ID = (n) => `7656119000009${String(n).padStart(4, "0")}`;
const DAY = 86_400_000;

describe.skipIf(!url)("database", () => {
  let query, grantKofiPremium, recordEvent;

  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    ({ query } = await import("@/lib/db"));
    ({ grantKofiPremium } = await import("@/lib/billing"));
    ({ recordEvent } = await import("@/lib/analytics"));
    await query("DELETE FROM users WHERE steam_id LIKE '7656119000009%'");
  });

  afterAll(async () => {
    await query("DELETE FROM users WHERE steam_id LIKE '7656119000009%'");
    await query("DELETE FROM events WHERE anon_id = 'integration-test-anon'");
  });

  const user = async (id) => (await query("SELECT tier, source, expires_at FROM users WHERE steam_id = $1", [id])).rows[0];
  const seed = (id, cols) =>
    query("INSERT INTO users (steam_id, tier, source, subscription_id, expires_at) VALUES ($1, $2, $3, $4, $5)", [
      id, cols.tier, cols.source || null, cols.subscription_id || null, cols.expires_at || null,
    ]);
  const daysFromNow = (d) => (new Date(d).getTime() - Date.now()) / DAY;

  describe("grantKofiPremium", () => {
    it("creates 32 days of Pro for a new supporter", async () => {
      await grantKofiPremium({ steamId: ID(1), transactionId: "t1", tier: "Pro" });
      const u = await user(ID(1));
      expect(u.tier).toBe("Pro");
      expect(daysFromNow(u.expires_at)).toBeGreaterThan(31.9);
    });

    it("upgrades a free account", async () => {
      await seed(ID(2), { tier: "Noob" });
      await grantKofiPremium({ steamId: ID(2), transactionId: "t2", tier: "Hacker" });
      const u = await user(ID(2));
      expect(u.tier).toBe("Hacker");
      expect(daysFromNow(u.expires_at)).toBeGreaterThan(31.9);
    });

    it("never turns a permanent plan into a 32-day one", async () => {
      await seed(ID(3), { tier: "Pro", source: "kofi" });
      await grantKofiPremium({ steamId: ID(3), transactionId: "t3", tier: "Pro" });
      expect((await user(ID(3))).expires_at).toBeNull();
    });

    it("doesn't downgrade an active Hacker plan, but extends it", async () => {
      await seed(ID(4), { tier: "Hacker", source: "kofi", expires_at: new Date(Date.now() + 10 * DAY) });
      await grantKofiPremium({ steamId: ID(4), transactionId: "t4", tier: "Pro" });
      const u = await user(ID(4));
      expect(u.tier).toBe("Hacker");
      expect(daysFromNow(u.expires_at)).toBeGreaterThan(31.9);
    });

    it("leaves a live Stripe subscription in charge", async () => {
      await seed(ID(5), { tier: "Pro", source: "stripe", subscription_id: "sub_test", expires_at: new Date(Date.now() + 20 * DAY) });
      await grantKofiPremium({ steamId: ID(5), transactionId: "t5", tier: "Hacker" });
      const u = await user(ID(5));
      expect(u.source).toBe("stripe");
      expect(u.tier).toBe("Pro");
    });

    it("restarts an expired plan from the payment date", async () => {
      await seed(ID(6), { tier: "Hacker", source: "kofi", expires_at: new Date(Date.now() - 5 * DAY) });
      const paid = new Date(Date.now() - 2 * DAY);
      await grantKofiPremium({ steamId: ID(6), transactionId: "t6", tier: "Pro", from: paid });
      const u = await user(ID(6));
      expect(u.tier).toBe("Pro");
      expect(daysFromNow(u.expires_at)).toBeGreaterThan(29.9);
      expect(daysFromNow(u.expires_at)).toBeLessThan(30.1);
    });
  });

  describe("recordEvent", () => {
    it("stores only allow-listed, de-identified data", async () => {
      const ok = await recordEvent(
        "comparison_succeeded",
        { players: 3, note: "steam 76561197960287930", via: "web" },
        { anonId: "integration-test-anon", path: "/76561197960287930?x=1", referrer: "https://www.reddit.com/r/x", utm: { source: "tiktok<script>" } }
      );
      expect(ok).toBe(true);
      expect(await recordEvent("made_up_event", {}, { anonId: "integration-test-anon" })).toBe(false);
      const row = (await query("SELECT * FROM events WHERE anon_id = 'integration-test-anon' ORDER BY ts DESC LIMIT 1")).rows[0];
      expect(row.path).toBe("/:id");
      expect(row.ref_domain).toBe("reddit.com");
      expect(row.utm_source).toBe("tiktokscript");
      expect(row.props).toEqual({ players: 3, via: "web" });
    });
  });
});
