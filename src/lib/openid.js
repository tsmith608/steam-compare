// Steam OpenID 2.0 helpers (sign-in only; Steam has no OAuth for this).
export const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const CLAIMED_ID_RE = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

export function buildSteamLoginUrl(returnTo, realm) {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${STEAM_OPENID_ENDPOINT}?${params.toString()}`;
}

/**
 * Local checks on a positive assertion before asking Steam to verify the
 * signature. Rejects assertions minted for another site (return_to), from
 * another provider (op_endpoint) or with a malformed identity.
 * @returns {{ok:true, steamid:string} | {ok:false, error:string}}
 */
export function checkAssertion(params, expectedReturnTo) {
  if (params.get("openid.mode") !== "id_res") return { ok: false, error: "cancelled" };
  if (params.get("openid.op_endpoint") !== STEAM_OPENID_ENDPOINT) return { ok: false, error: "invalid" };

  const returnTo = params.get("openid.return_to") || "";
  let rt;
  try {
    rt = new URL(returnTo);
  } catch {
    return { ok: false, error: "invalid" };
  }
  const expected = new URL(expectedReturnTo);
  if (rt.origin !== expected.origin || rt.pathname !== expected.pathname) return { ok: false, error: "invalid" };

  const claimed = params.get("openid.claimed_id") || "";
  const identity = params.get("openid.identity") || "";
  const m = claimed.match(CLAIMED_ID_RE);
  if (!m || identity !== claimed) return { ok: false, error: "nosteamid" };

  const signed = (params.get("openid.signed") || "").split(",");
  for (const field of ["claimed_id", "identity", "return_to", "response_nonce"]) {
    if (!signed.includes(field)) return { ok: false, error: "invalid" };
  }
  return { ok: true, steamid: m[1] };
}

/** Asks Steam to confirm the assertion signature (check_authentication). */
export async function verifyWithSteam(params, fetchImpl = fetch) {
  const body = new URLSearchParams();
  for (const [k, v] of params) if (k.startsWith("openid.")) body.set(k, v);
  body.set("openid.mode", "check_authentication");
  const res = await fetchImpl(STEAM_OPENID_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(8000),
  });
  const text = await res.text();
  return /^is_valid\s*:\s*true\s*$/m.test(text);
}

/** Only same-site relative paths are allowed as post-login destinations. */
export function safeNextPath(raw) {
  if (!raw || typeof raw !== "string") return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  if (raw.length > 300) return "/";
  return raw;
}
