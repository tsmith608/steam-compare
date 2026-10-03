// Opens the Stripe Customer Portal (cancel, change plan, card, invoices) for
// the signed-in user only.
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionSteamId } from "@/lib/session";
import { jsonError, unauthorized } from "@/lib/http";
import { getStripe } from "@/lib/billing";
import { logServerError } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const steamid = await getSessionSteamId();
  if (!steamid) return unauthorized();
  const stripe = getStripe();
  if (!stripe) return jsonError("Payments aren't set up yet.", 503);

  try {
    const res = await query("SELECT stripe_customer_id FROM users WHERE steam_id = $1", [steamid]);
    const customer = res.rows[0]?.stripe_customer_id;
    if (!customer) return jsonError("No billing account found for this Steam account.", 404);
    const session = await stripe.billingPortal.sessions.create({ customer, return_url: `${request.nextUrl.origin}/upgrade` });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    await logServerError("api/portal", err);
    return jsonError("Couldn't open billing right now.", 500);
  }
}
