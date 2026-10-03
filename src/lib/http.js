// Small helpers shared by route handlers: JSON errors, caller identity for
// rate limiting, and a best-effort in-memory rate limiter.
import { NextResponse } from "next/server";

export function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function unauthorized(message = "Sign in with Steam to do that.") {
  return jsonError(message, 401, { code: "auth_required" });
}

/** Best-effort client IP (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(req) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Fixed-window counters per serverless instance. This is a speed bump, not a
// wall: for hard limits configure Vercel Firewall rate-limit rules (see
// docs/retrofit/OWNER_OPERATIONS_GUIDE.md).
const buckets = new Map();
const MAX_BUCKETS = 10_000;

/**
 * @returns {{ ok: boolean, retryAfter: number }}
 */
export function rateLimit(key, { limit, windowMs }, now = Date.now()) {
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [k, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(k);
      }
      if (buckets.size >= MAX_BUCKETS) buckets.clear();
    }
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  return {
    ok: bucket.count <= limit,
    retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** Returns a 429 response when the caller is over the limit, else null. */
export function limitOrNull(req, name, opts) {
  const { ok, retryAfter } = rateLimit(`${name}:${clientIp(req)}`, opts);
  if (ok) return null;
  return NextResponse.json(
    { error: "You're going a little fast. Try again in a moment.", code: "rate_limited" },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

export function resetRateLimits() {
  buckets.clear();
}

/** Reads a JSON body without throwing; returns {} for empty/invalid bodies. */
export async function readJson(req, maxBytes = 64 * 1024) {
  const text = await req.text();
  if (!text || text.length > maxBytes) return {};
  try {
    const data = JSON.parse(text);
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

/**
 * Endpoints called only by the Discord bot. When BOT_API_KEY is configured the
 * bot must send it as a Bearer token; without it the endpoints stay open (for
 * backwards compatibility) but log a warning once per instance.
 */
let warnedNoBotKey = false;
export function botAuthError(req) {
  const key = process.env.BOT_API_KEY;
  if (!key) {
    if (!warnedNoBotKey) {
      console.warn("[security] BOT_API_KEY is not set; bot endpoints are unauthenticated");
      warnedNoBotKey = true;
    }
    return null;
  }
  const given = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (given.length === key.length && timingSafeEqualStr(given, key)) return null;
  return jsonError("Unauthorized", 401);
}

function timingSafeEqualStr(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const isSteamId64 = (v) => typeof v === "string" && /^\d{17}$/.test(v);
export const isSnowflake = (v) => typeof v === "string" && /^\d{15,21}$/.test(v);

/** True only when BOT_API_KEY is configured and the request carries it. */
export function isBotRequest(req) {
  return !!process.env.BOT_API_KEY && botAuthError(req) === null;
}
