// Starts a Stripe Checkout session for the signed-in user. If they already
// have a live subscription we send them to the Customer Portal instead, so a
// plan change can never create a second, double-billed subscription.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionSteamId } from "@/lib/session";
import { jsonError, limitOrNull, readJson, unauthorized } from "@/lib/http";
import { getStripe, priceFor } from "@/lib/billing";
import { recordEvent } from "@/lib/analytics";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const steamid = await getSessionSteamId();
  if (!steamid) return unauthorized("Sign in with Steam so we know which account to upgrade.");
  const limited = limitOrNull(request, "checkout", { limit: 10, windowMs: 10 * 60_000 });
  if (limited) return limited;

  const stripe = getStripe();
  if (!stripe) return jsonError("Payments aren't set up yet.", 503);

  const { tier: rawTier, interval: rawInterval, ctx } = await readJson(request);
  const tier = rawTier === "Hacker" ? "Hacker" : "Pro";
  const interval = rawInterval === "year" ? "year" : "month";
  const price = priceFor(tier, interval) || (interval === "year" ? null : priceFor(tier, "month"));
  if (!price) return jsonError(interval === "year" ? "Annual billing isn't available yet." : "Payments aren't set up yet.", 503);

  const origin = request.nextUrl.origin;
  try {
    const userRes = await query("SELECT stripe_customer_id, subscription_id, billing_status FROM users WHERE steam_id = $1", [steamid]);
    const user = userRes.rows[0] || {};

    if (user.subscription_id && ["active", "trialing", "past_due"].includes(user.billing_status || "active") && user.stripe_customer_id) {
      const portal = await stripe.billingPortal.sessions.create({ customer: user.stripe_customer_id, return_url: `${origin}/upgrade` });
      return NextResponse.json({ url: portal.url, portal: true });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      ...(user.stripe_customer_id ? { customer: user.stripe_customer_id } : {}),
      client_reference_id: steamid,
      metadata: { steam_id: steamid, tier },
      subscription_data: { metadata: { steam_id: steamid, tier } },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      ...(process.env.STRIPE_AUTOMATIC_TAX === "1" ? { automatic_tax: { enabled: true } } : {}),
      success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade?canceled=1`,
    });
    await recordEvent("checkout_started", { tier, interval }, ctx && typeof ctx === "object" ? ctx : {});
    return NextResponse.json({ url: session.url });
  } catch (err) {
    await logServerError("api/checkout", err);
    return jsonError("We couldn't start checkout. Please try again.", 500);
  }
}
