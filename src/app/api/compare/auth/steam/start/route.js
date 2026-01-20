
// src/app/api/compare/auth/steam/start/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * Redirects the user to Steam's official OpenID login page.
 * Steam will send them back to /api/auth/steam/callback with
 * the OpenID parameters after they approve.
 */
export async function GET(req) {
  const origin = req.nextUrl.origin;

  // CSRF nonce (round-trip via return_to + cookie)
  const nonce = crypto.randomUUID();

  // Where Steam should return the user
  const returnTo = new URL("/api/compare/auth/steam/callback", origin);
  returnTo.searchParams.set("nonce", nonce);

  // Build OpenID request
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo.toString(),
    "openid.realm": origin,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  const redirectUrl = `https://steamcommunity.com/openid/login?${params.toString()}`;

  // Set CSRF cookie and redirect
  const res = NextResponse.redirect(redirectUrl, { status: 302 });
  res.cookies.set("steam_nonce", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  return res;
}
