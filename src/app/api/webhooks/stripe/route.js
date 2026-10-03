// Stripe webhook. Verified, idempotent (each event id processed once) and
// order-independent: subscription state is always re-read from Stripe rather
// than trusted from the payload, so late or out-of-order events can't regress
// a user's plan.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { applySubscription, getStripe, invoiceSubscriptionId, tierForSubscription } from "@/lib/billing";
import { recordEvent } from "@/lib/analytics";
import { alertOwner, logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

// Claim an event for processing. Returns false if it was already handled or is
// being handled right now; a claim older than 5 minutes (crashed handler) can
// be taken over so Stripe's retry isn't swallowed.
async function claimEvent(event) {
  try {
    const res = await query(
      `INSERT INTO stripe_events (id, type, status, received_at) VALUES ($1, $2, 'processing', NOW())
       ON CONFLICT (id) DO UPDATE SET received_at = NOW()
         WHERE stripe_events.status = 'processing' AND stripe_events.received_at < NOW() - INTERVAL '5 minutes'
       RETURNING id`,
      [event.id, event.type]
    );
    return res.rowCount === 1;
  } catch {
    // Table missing (un-migrated DB): process anyway; handlers are idempotent.
    return true;
  }
}

async function completeEvent(id) {
  await query("UPDATE stripe_events SET status = 'done', processed_at = NOW() WHERE id = $1", [id]).catch(() => {});
}

async function releaseEvent(id) {
  await query("DELETE FROM stripe_events WHERE id = $1", [id]).catch(() => {});
}

async function handle(stripe, event) {
  const obj = event.data.object;
  switch (event.type) {
    case "checkout.session.completed": {
      if (obj.mode !== "subscription" || !obj.subscription) return;
      const steamId = obj.client_reference_id || obj.metadata?.steam_id || null;
      const sub = await stripe.subscriptions.retrieve(typeof obj.subscription === "string" ? obj.subscription : obj.subscription.id);
      const updated = await applySubscription(sub, { steamId });
      if (!updated) throw new Error(`checkout ${obj.id} has no Steam id`);
      await query(
        `INSERT INTO stripe_transactions (id, customer_id, steam_id, amount, currency, status, type)
         VALUES ($1, $2, $3, $4, $5, 'completed', 'checkout') ON CONFLICT (id) DO NOTHING`,
        [obj.id, obj.customer, updated, (obj.amount_total || 0) / 100, obj.currency]
      );
      await recordEvent("checkout_succeeded", { tier: tierForSubscription(sub) });
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.resumed":
    case "customer.subscription.paused": {
      const sub = await stripe.subscriptions.retrieve(obj.id);
      await applySubscription(sub);
      return;
    }
    case "customer.subscription.deleted": {
      const sub = await stripe.subscriptions.retrieve(obj.id).catch(() => obj);
      await applySubscription({ ...sub, status: "canceled" });
      await recordEvent("subscription_canceled", {});
      return;
    }
    case "invoice.paid":
    case "invoice.payment_succeeded": {
      const subId = invoiceSubscriptionId(obj);
      if (!subId) return;
      await applySubscription(await stripe.subscriptions.retrieve(subId));
      return;
    }
    case "invoice.payment_failed": {
      const subId = invoiceSubscriptionId(obj);
      if (!subId) return;
      // Stripe retries and emails the customer; we just reflect the status.
      await applySubscription(await stripe.subscriptions.retrieve(subId));
      await recordEvent("payment_failed", { attempt: obj.attempt_count || 0 });
      return;
    }
    default:
      return;
  }
}

export async function POST(request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    await alertOwner("stripe-config", "Stripe webhook received but STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET is missing");
    return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig || "", secret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (!(await claimEvent(event))) return NextResponse.json({ received: true, duplicate: true });

  try {
    await handle(stripe, event);
    await completeEvent(event.id);
    return NextResponse.json({ received: true });
  } catch (err) {
    await releaseEvent(event.id);
    await logServerError("stripe-webhook", err, { type: event.type });
    await alertOwner("stripe-webhook", `Stripe webhook failed (${event.type})`, `${event.id}: ${err.message}. Stripe will retry automatically.`);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
