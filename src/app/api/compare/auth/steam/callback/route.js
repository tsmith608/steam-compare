// Steam returns here after sign-in. We verify the assertion, create a signed
// session cookie and send the user back (or close the popup).
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { checkAssertion, verifyWithSteam, safeNextPath } from "@/lib/openid";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";
import { getPlayerSummaries } from "@/lib/steam";
import { logServerError } from "@/lib/ops";
import { recordEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

// The page only ever embeds constant, JSON-encoded values with "<" escaped,
// so nothing user-controlled (like a Steam display name) reaches the HTML.
function finishPage({ ok, next, error }) {
  const payload = JSON.stringify({ ok, next, error: error || null }).replace(/</g, "\\u003c");
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Signing in…</title>
<style>body{background:#07080a;color:#e6e8eb;font:15px system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0}</style></head>
<body><p>Signing you in…</p><script>(function(){var r=${payload};
if(window.opener){try{window.opener.postMessage({type:r.ok?"steam-auth-success":"steam-auth-error",error:r.error},window.location.origin);}catch(e){}window.close();}
var q=r.ok?"":(r.next.indexOf("?")>-1?"&":"?")+"auth_error="+encodeURIComponent(r.error);window.location.replace(r.next+q);})();</script></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(req) {
  const url = new URL(req.url);
  const sp = url.searchParams;
  const next = safeNextPath(req.cookies.get("wbp_next")?.value);

  const fail = (error) => {
    const res = finishPage({ ok: false, next, error });
    res.cookies.set("steam_nonce", "", { path: "/", maxAge: 0 });
    return res;
  };

  const cookieNonce = req.cookies.get("steam_nonce")?.value || "";
  if (!cookieNonce || cookieNonce !== sp.get("nonce")) return fail("nonce");

  const expectedReturnTo = new URL("/api/compare/auth/steam/callback", url.origin).toString();
  const local = checkAssertion(sp, expectedReturnTo);
  if (!local.ok) return fail(local.error);

  try {
    if (!(await verifyWithSteam(sp))) return fail("invalid");
  } catch {
    return fail("network");
  }
  const steamid = local.steamid;

  // Remember the signed-in user (display name, avatar, custom URL).
  try {
    const summary = (await getPlayerSummaries([steamid]).catch(() => new Map())).get(steamid);
    const vanity = summary?.profileurl?.match(/\/id\/([^/?#]+)/)?.[1] || null;
    await query(
      `INSERT INTO users (steam_id, persona_name, avatar_url, vanity_id, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (steam_id) DO UPDATE SET
         persona_name = COALESCE(EXCLUDED.persona_name, users.persona_name),
         avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
         vanity_id = COALESCE(EXCLUDED.vanity_id, users.vanity_id),
         updated_at = NOW()`,
      [steamid, summary?.personaname || null, summary?.avatar || null, vanity]
    );
  } catch (err) {
    await logServerError("auth-callback", err);
  }

  await recordEvent("account_signed_in", {});

  const res = finishPage({ ok: true, next, error: null });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(steamid), sessionCookieOptions());
  res.cookies.set("steam_nonce", "", { path: "/", maxAge: 0 });
  res.cookies.set("wbp_next", "", { path: "/", maxAge: 0 });
  return res;
}
