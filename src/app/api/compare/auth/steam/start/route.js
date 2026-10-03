// Redirects to Steam's OpenID sign-in page.
import { NextResponse } from "next/server";
import crypto from "crypto";
import { buildSteamLoginUrl, safeNextPath } from "@/lib/openid";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const origin = req.nextUrl.origin;
  const nonce = crypto.randomUUID();

  const returnTo = new URL("/api/compare/auth/steam/callback", origin);
  returnTo.searchParams.set("nonce", nonce);

  const res = NextResponse.redirect(buildSteamLoginUrl(returnTo.toString(), origin), { status: 302 });
  const cookie = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 };
  res.cookies.set("steam_nonce", nonce, cookie);
  res.cookies.set("wbp_next", safeNextPath(req.nextUrl.searchParams.get("next")), cookie);
  return res;
}
