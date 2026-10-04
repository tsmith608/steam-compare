import { afterEach, describe, expect, it } from "vitest";
import { effectiveTier, highestTier, normalizeTier } from "@/lib/plans";
import { invoiceSubscriptionId, subscriptionPeriodEnd, tierForSubscription } from "@/lib/billing";

describe("plans", () => {
  it("normalizes legacy tier names", () => {
    expect(normalizeTier(null)).toBe("Noob");
    expect(normalizeTier("Hacker")).toBe("Hacker");
    expect(normalizeTier("Gold")).toBe("Hacker");
    expect(normalizeTier("Bronze")).toBe("Pro");
    expect(normalizeTier("Supporter")).toBe("Pro");
  });

  it("honours expiry", () => {
    const now = new Date("2026-10-03T00:00:00Z");
    expect(effectiveTier({ tier: "Pro", expires_at: "2026-10-04T00:00:00Z" }, now)).toBe("Pro");
    expect(effectiveTier({ tier: "Pro", expires_at: "2026-10-01T00:00:00Z" }, now)).toBe("Noob");
    expect(effectiveTier({ tier: "Hacker", expires_at: null }, now)).toBe("Hacker");
  });

  it("picks the best plan in a group", () => {
    expect(highestTier(["Noob", "Pro", "Noob"])).toBe("Pro");
    expect(highestTier(["Pro", "Hacker"])).toBe("Hacker");
    expect(highestTier([])).toBe("Noob");
  });
});

describe("billing helpers (Stripe basil+/clover shapes)", () => {
  afterEach(() => {
    delete process.env.STRIPE_PRICE_ID_PRO;
    delete process.env.STRIPE_PRICE_ID_HACKER;
    delete process.env.STRIPE_PRICE_ID_HACKER_ANNUAL;
  });

  it("reads the period end from subscription items, falling back to the old field", () => {
    expect(subscriptionPeriodEnd({ items: { data: [{ current_period_end: 200 }, { current_period_end: 300 }] } })).toBe(300);
    expect(subscriptionPeriodEnd({ current_period_end: 100, items: { data: [] } })).toBe(100);
    expect(subscriptionPeriodEnd(null)).toBeNull();
  });

  it("finds an invoice's subscription in both shapes", () => {
    expect(invoiceSubscriptionId({ parent: { subscription_details: { subscription: "sub_new" } } })).toBe("sub_new");
    expect(invoiceSubscriptionId({ subscription: "sub_old" })).toBe("sub_old");
    expect(invoiceSubscriptionId({ parent: { subscription_details: { subscription: { id: "sub_obj" } } } })).toBe("sub_obj");
    expect(invoiceSubscriptionId({})).toBeNull();
  });

  it("derives the tier from the price so portal plan switches stick", () => {
    process.env.STRIPE_PRICE_ID_PRO = "price_pro";
    process.env.STRIPE_PRICE_ID_HACKER = "price_hacker";
    process.env.STRIPE_PRICE_ID_HACKER_ANNUAL = "price_hacker_year";
    expect(tierForSubscription({ metadata: { tier: "Pro" }, items: { data: [{ price: { id: "price_hacker" } }] } })).toBe("Hacker");
    expect(tierForSubscription({ metadata: { tier: "Pro" }, items: { data: [{ price: { id: "price_hacker_year" } }] } })).toBe("Hacker");
    expect(tierForSubscription({ metadata: { tier: "Hacker" }, items: { data: [{ price: { id: "price_unknown" } }] } })).toBe("Hacker");
    expect(tierForSubscription({ metadata: {}, items: { data: [] } })).toBe("Pro");
  });
});
