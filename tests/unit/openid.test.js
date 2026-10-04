import { describe, expect, it } from "vitest";
import { checkAssertion, safeNextPath, STEAM_OPENID_ENDPOINT, verifyWithSteam } from "@/lib/openid";

const RETURN_TO = "https://webothplay.com/api/compare/auth/steam/callback";

function assertion(overrides = {}) {
  const claimed = "https://steamcommunity.com/openid/id/76561198000000001";
  return new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "id_res",
    "openid.op_endpoint": STEAM_OPENID_ENDPOINT,
    "openid.claimed_id": claimed,
    "openid.identity": claimed,
    "openid.return_to": `${RETURN_TO}?nonce=abc`,
    "openid.response_nonce": "2026-10-03T00:00:00Zxyz",
    "openid.assoc_handle": "1234567890",
    "openid.signed": "signed,op_endpoint,claimed_id,identity,return_to,response_nonce,assoc_handle",
    "openid.sig": "c2ln",
    nonce: "abc",
    ...overrides,
  });
}

describe("checkAssertion", () => {
  it("accepts a well-formed Steam assertion", () => {
    expect(checkAssertion(assertion(), RETURN_TO)).toEqual({ ok: true, steamid: "76561198000000001" });
  });

  it("rejects assertions minted for another site", () => {
    const r = checkAssertion(assertion({ "openid.return_to": "https://evil.example/cb?nonce=abc" }), RETURN_TO);
    expect(r.ok).toBe(false);
  });

  it("rejects other providers and malformed identities", () => {
    expect(checkAssertion(assertion({ "openid.op_endpoint": "https://evil.example/openid" }), RETURN_TO).ok).toBe(false);
    expect(checkAssertion(assertion({ "openid.claimed_id": "https://evil.example/openid/id/76561198000000001" }), RETURN_TO).ok).toBe(false);
    expect(checkAssertion(assertion({ "openid.identity": "https://steamcommunity.com/openid/id/76561198000000002" }), RETURN_TO).ok).toBe(false);
    expect(checkAssertion(assertion({ "openid.mode": "cancel" }), RETURN_TO).ok).toBe(false);
  });

  it("requires the identity fields to be signed", () => {
    expect(checkAssertion(assertion({ "openid.signed": "op_endpoint,return_to" }), RETURN_TO).ok).toBe(false);
  });
});

describe("verifyWithSteam", () => {
  it("posts only openid.* params with check_authentication", async () => {
    let sent;
    const fakeFetch = async (_url, init) => {
      sent = new URLSearchParams(init.body);
      return { text: async () => "ns:http://specs.openid.net/auth/2.0\nis_valid:true\n" };
    };
    expect(await verifyWithSteam(assertion(), fakeFetch)).toBe(true);
    expect(sent.get("openid.mode")).toBe("check_authentication");
    expect(sent.has("nonce")).toBe(false);
  });

  it("treats anything but is_valid:true as invalid", async () => {
    const fakeFetch = async () => ({ text: async () => "is_valid:false\n" });
    expect(await verifyWithSteam(assertion(), fakeFetch)).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("only allows same-site relative paths", () => {
    expect(safeNextPath("/compare?p=1")).toBe("/compare?p=1");
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath("/\\evil.example")).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
  });
});
