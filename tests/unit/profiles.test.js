import { describe, expect, it } from "vitest";
import { isIndividualSteamId, profilePathExists } from "@/lib/profiles";

describe("profile paths", () => {
  it("accepts only individual-account SteamID64s", () => {
    expect(isIndividualSteamId("76561197960287930")).toBe(true);
    expect(isIndividualSteamId("76561197960265727")).toBe(false); // one below the first account
    expect(isIndividualSteamId("76561202255233024")).toBe(false); // one past the last
    expect(isIndividualSteamId("7656119796028793")).toBe(false);
  });

  it("404s short numbers and junk without touching the database", async () => {
    expect(await profilePathExists("12345")).toBe(false);
    expect(await profilePathExists("wp-admin.php")).toBe(false);
    expect(await profilePathExists("a")).toBe(false);
    expect(await profilePathExists("76561197960287930")).toBe(true);
    expect(await profilePathExists("76561190000000001")).toBe(true); // demo player
    expect(await profilePathExists("demo-nova")).toBe(true);
  });
});
