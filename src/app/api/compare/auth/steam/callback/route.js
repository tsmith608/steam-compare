import { NextResponse } from "next/server";
import { query } from "@/lib/db";

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
  let name = "", avatar = "", vanityId = "";
  try {
    const sum = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamid}`)
      .then(r => r.json());
    const me = sum?.response?.players?.[0];
    if (me) {
      name = me.personaname || "";
      avatar = me.avatarmedium || me.avatarfull || "";

      // Extract vanityId from profileurl
      // https://steamcommunity.com/id/vanityname/ or https://steamcommunity.com/profiles/17digitid/
      if (me.profileurl && me.profileurl.includes("/id/")) {
        const vanityMatch = me.profileurl.match(/\/id\/([^\/?#]+)/);
        if (vanityMatch) vanityId = vanityMatch[1];
      }
    }
  } catch {
    // non-fatal
  }

  // 4.5) Store in DB
  if (steamid) {
    try {
      await query(
        `INSERT INTO users (steam_id, persona_name, vanity_id, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (steam_id) DO UPDATE SET
         persona_name = EXCLUDED.persona_name,
         vanity_id = EXCLUDED.vanity_id,
         updated_at = NOW()`,
        [steamid, name, vanityId]
      );
    } catch (dbErr) {
      console.error("Failed to store user info in DB:", dbErr);
    }
  }

  // 5) Clear nonce cookie
  const resCookies = new Map();
  resCookies.set("steam_nonce", { value: "", httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });

  // 6) Build profile object
  const profile = { steamid, name, avatar, vanityId };
  const safeProfile = JSON.stringify(profile);

  // 7) Return HTML that handles both Popup (close & notify) and Redirect (go home)
  // If window.opener exists, we are in a popup -> send message and close.
  // Otherwise, we are in a full page redirect -> go to homepage with params.
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Authenticating...</title></head>
    <body>
    <script>
      (function() {
        var profile = ${safeProfile};
        var targetOrigin = window.location.origin;
        
        if (window.opener) {
          // Popup mode: notify opener
          try {
            window.opener.postMessage({ type: "steam-auth-success", profile: profile }, targetOrigin);
            window.close();
          } catch(e) {
            console.error(e);
          }
        } else {
          // Redirect mode: forward to home
          var q = new URLSearchParams();
          q.set("autopick", "1");
          q.set("steamid", profile.steamid);
          if (profile.name) q.set("name", profile.name);
          if (profile.avatar) q.set("avatar", profile.avatar);
          if (profile.vanityId) q.set("vanity", profile.vanityId);
          window.location.href = "/?" + q.toString();
        }
      })();
    </script>
    </body>
    </html>
  `;

  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });

  // Apply cookie clearing
  response.cookies.set("steam_nonce", "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });

  return response;
}

function redirectHome(origin, params = {}) {
  // Error fallback: send message 'steam-auth-error' if popup, else redirect home
  const safeParams = JSON.stringify(params);
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
    <script>
      (function() {
        var params = ${safeParams};
        if (window.opener) {
           window.opener.postMessage({ type: "steam-auth-error", error: params }, window.location.origin);
           window.close();
        } else {
           var q = new URLSearchParams(params);
           q.set("autopick", "1");
           window.location.href = "/?" + q.toString();
        }
      })();
    </script>
    </body>
    </html>
  `;
  return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html" } });
}
