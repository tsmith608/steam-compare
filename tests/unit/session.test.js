import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken, SESSION_MAX_AGE } from "@/lib/session";

const ID = "76561198000000001";

describe("session tokens", () => {
  it("round-trips a SteamID64", async () => {
    const token = await createSessionToken(ID);
    expect(await verifySessionToken(token)).toBe(ID);
  });

  it("rejects tampered payloads and signatures", async () => {
    const token = await createSessionToken(ID);
    const [payload, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ v: 1, sid: "76561198999999999", iat: 0, exp: 9999999999 })).toString("base64url");
    expect(await verifySessionToken(`${forged}.${sig}`)).toBeNull();
    expect(await verifySessionToken(`${payload}.${sig.slice(0, -2)}xx`)).toBeNull();
    expect(await verifySessionToken(`${payload}`)).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
    expect(await verifySessionToken(null)).toBeNull();
  });

  it("expires", async () => {
    const issued = Date.now() - (SESSION_MAX_AGE + 10) * 1000;
    const token = await createSessionToken(ID, issued);
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("refuses to sign non-Steam ids", async () => {
    await expect(createSessionToken("abc")).rejects.toThrow();
    await expect(createSessionToken("7656119800000000")).rejects.toThrow();
  });
});
