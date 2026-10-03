// Server-side sessions for Steam sign-in.
//
// A session is an HMAC-signed cookie holding the SteamID64 that Steam's
// OpenID endpoint verified. Nothing else in the app may be used to decide
// who the caller is: request bodies, query params and browser storage are
// all attacker-controlled.
import crypto from "crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export const SESSION_COOKIE = "wbp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SESSION_VERSION = 1;

let cachedSecret = null;

/**
 * The signing secret. Prefer SESSION_SECRET; if it is missing we fall back to
 * a random secret persisted in the database so a deploy without the env var
 * still works (and survives cold starts) instead of silently breaking sign-in.
 */
export async function getSessionSecret() {
  if (cachedSecret) return cachedSecret;

  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) {
    cachedSecret = fromEnv;
    return cachedSecret;
  }

  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET is not set and no database is configured");
    }
    cachedSecret = "dev-only-session-secret-do-not-use-in-production";
    return cachedSecret;
  }

  console.warn("[session] SESSION_SECRET not set; using database-backed secret");
  await query("CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
  await query(
    "INSERT INTO app_settings (key, value) VALUES ('session_secret', $1) ON CONFLICT (key) DO NOTHING",
    [crypto.randomBytes(48).toString("base64url")]
  );
  const res = await query("SELECT value FROM app_settings WHERE key = 'session_secret'");
  cachedSecret = res.rows[0].value;
  return cachedSecret;
}

function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Builds the signed cookie value for a verified SteamID64. */
export async function createSessionToken(steamid, now = Date.now()) {
  if (!/^\d{17}$/.test(String(steamid))) throw new Error("Invalid SteamID64");
  const payload = Buffer.from(
    JSON.stringify({
      v: SESSION_VERSION,
      sid: String(steamid),
      iat: Math.floor(now / 1000),
      exp: Math.floor(now / 1000) + SESSION_MAX_AGE,
    })
  ).toString("base64url");
  return `${payload}.${sign(payload, await getSessionSecret())}`;
}

/** Returns the SteamID64 for a valid, unexpired token, otherwise null. */
export async function verifySessionToken(token, now = Date.now()) {
  if (!token || typeof token !== "string" || token.length > 512) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload, await getSessionSecret()));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.v !== SESSION_VERSION) return null;
    if (!/^\d{17}$/.test(data.sid)) return null;
    if (typeof data.exp !== "number" || data.exp * 1000 < now) return null;
    return data.sid;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/** SteamID64 of the signed-in caller, or null. */
export async function getSessionSteamId() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
