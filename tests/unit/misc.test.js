import { describe, expect, it } from "vitest";
import { sanitizeProps, refDomain, EVENT_NAMES, SERVER_ONLY_EVENTS } from "@/lib/analytics";
import { parseSteamInput } from "@/lib/steam";
import { signLink, verifyLinkSignature } from "@/lib/discord-link";
import { rateLimit, resetRateLimits } from "@/lib/http";

describe("analytics", () => {
  it("drops identifying or oversized props", () => {
    const out = sanitizeProps({ players: 4, steam: "76561198000000001", ok: true, "Bad Key": 1, label: "x".repeat(200), obj: { a: 1 } });
    expect(out).toEqual({ players: 4, ok: true, label: "x".repeat(80) });
  });
  it("reduces referrers to a domain", () => {
    expect(refDomain("https://www.tiktok.com/@x/video/1")).toBe("tiktok.com");
    expect(refDomain("not a url")).toBeNull();
  });
  it("keeps server-only events inside the taxonomy", () => {
    for (const e of SERVER_ONLY_EVENTS) expect(EVENT_NAMES.has(e)).toBe(true);
  });
});

describe("parseSteamInput", () => {
  it("understands ids, profile URLs and custom URLs", () => {
    expect(parseSteamInput("76561198000000001")).toEqual({ kind: "id", steamid: "76561198000000001" });
    expect(parseSteamInput("https://steamcommunity.com/profiles/76561198000000001/")).toEqual({ kind: "id", steamid: "76561198000000001" });
    expect(parseSteamInput("steamcommunity.com/id/gabelogannewell")).toEqual({ kind: "vanity", vanity: "gabelogannewell" });
    expect(parseSteamInput("https://steamcommunity.com/id/some_name/?foo=1")).toEqual({ kind: "vanity", vanity: "some_name" });
    expect(parseSteamInput("plainname")).toEqual({ kind: "vanity", vanity: "plainname" });
  });
  it("rejects junk", () => {
    expect(parseSteamInput("")).toBeNull();
    expect(parseSteamInput("<script>")).toBeNull();
    expect(parseSteamInput("a")).toBeNull();
    expect(parseSteamInput("x".repeat(300))).toBeNull();
  });
});

describe("discord link signatures", () => {
  const secret = "s3cret";
  const exp = Math.floor(Date.now() / 1000) + 600;
  it("verifies valid signatures and rejects forgeries/expiry", () => {
    expect(verifyLinkSignature("123456789012345678", exp, signLink("123456789012345678", exp, secret), secret)).toBe(true);
    expect(verifyLinkSignature("999999999999999999", exp, signLink("123456789012345678", exp, secret), secret)).toBe(false);
    expect(verifyLinkSignature("123456789012345678", exp - 3600, signLink("123456789012345678", exp - 3600, secret), secret)).toBe(false);
    expect(verifyLinkSignature("123456789012345678", exp, undefined, secret)).toBe(false);
  });
  it("is permissive only when no secret is configured", () => {
    expect(verifyLinkSignature("123456789012345678", null, null, undefined)).toBe(true);
  });
});

describe("rateLimit", () => {
  it("blocks after the limit within a window", () => {
    resetRateLimits();
    const opts = { limit: 2, windowMs: 1000 };
    expect(rateLimit("k", opts, 0).ok).toBe(true);
    expect(rateLimit("k", opts, 1).ok).toBe(true);
    expect(rateLimit("k", opts, 2).ok).toBe(false);
    expect(rateLimit("k", opts, 1001).ok).toBe(true);
  });
});
