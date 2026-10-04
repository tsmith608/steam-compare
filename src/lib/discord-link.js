// Signed /link URLs. The Discord bot signs (discordId, expiry) with
// DISCORD_LINK_SECRET; the website verifies before linking accounts, so nobody
// can craft a link page that attaches their Steam account to someone else's
// Discord account (or vice versa).
import crypto from "crypto";

export function signLink(discordId, exp, secret) {
  return crypto.createHmac("sha256", secret).update(`${discordId}.${exp}`).digest("hex");
}

/** True when no secret is configured (legacy mode) or the signature is valid. */
export function verifyLinkSignature(discordId, exp, sig, secret, now = Date.now()) {
  if (!secret) return true;
  if (!sig || !exp || !Number.isFinite(Number(exp)) || Number(exp) * 1000 < now) return false;
  const a = Buffer.from(signLink(discordId, exp, secret));
  const b = Buffer.from(String(sig));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
