import crypto from "crypto";

const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

/** Short, unambiguous, URL-safe random id (no 0/O/1/l/I). */
export function shortId(len = 8) {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export const isShortId = (v) => typeof v === "string" && /^[2-9a-zA-Z]{6,12}$/.test(v);
