import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const STEAM_API_KEY = process.env.STEAM_API_KEY;

export async function GET(req) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  // 1) Nonce check
  const cookieNonce = req.cookies.get?.("steam_nonce")?.value || "";
  const returnedNonce = sp.get("nonce") || "";
  if (!cookieNonce || cookieNonce !== returnedNonce) {
    return redirectHome(url.origin, { auth_error: "nonce" });
  }

  // 2) Verify with Steam
  const verifyParams = new URLSearchParams(sp);
  verifyParams.set("openid.mode", "check_authentication");
  let verifyText = "";
  try {
    verifyText = await fetch(OPENID_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyParams.toString(),
    }).then(r => r.text());
  } catch {
    return redirectHome(url.origin, { auth_error: "network" });
  }
  if (!/is_valid\s*:\s*true/i.test(verifyText)) {
    return redirectHome(url.origin, { auth_error: "invalid" });
  }

  // 3) Extract SteamID64 from claimed_id
  const claimed = sp.get("openid.claimed_id") || "";
  const m = claimed.match(/\/id\/(\d+)(?:\/)?$/);
  const steamid = m?.[1];
  if (!steamid) {
    return redirectHome(url.origin, { auth_error: "nosteamid" });
  }

  // 4) Get persona & avatar for header
  let name = "", avatar = "";
  try {
    const sum = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamid}`)
      .then(r => r.json());
    const me = sum?.response?.players?.[0];
    if (me) {
      name = me.personaname || "";
      avatar = me.avatarmedium || me.avatarfull || "";
    }
  } catch {
    // non-fatal
  }

  // 5) Clear nonce cookie and redirect with query params
  const qp = new URLSearchParams({
    autopick: "1",
    steamid,
  });
  if (name) qp.set("name", encodeURIComponent(name));
  if (avatar) qp.set("avatar", encodeURIComponent(avatar));

  const res = NextResponse.redirect(`${url.origin}/?${qp.toString()}`, 302);
  res.cookies.set("steam_nonce", "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });
  return res;
}

function redirectHome(origin, params = {}) {
  const q = new URLSearchParams({ autopick: "1", ...params });
  return NextResponse.redirect(`${origin}/?${q.toString()}`, 302);
}
