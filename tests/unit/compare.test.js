import { describe, expect, it } from "vitest";
import { computeComparison } from "@/lib/compare";

const g = (appid, name, hours = 0, extra = {}) => ({ appid, name, playtime_forever: Math.round(hours * 60), ...extra });

const A = { steamid: "a", games: [g(1, "Alpha", 10), g(2, "Bravo", 0), g(3, "Charlie", 50), g(4, "Delta", 1)], wishlist: [9] };
const B = { steamid: "b", games: [g(1, "Alpha", 5), g(2, "Bravo", 0), g(3, "Charlie", 0.5), g(5, "Echo", 3)], wishlist: [9, 4] };
const C = { steamid: "c", games: [g(1, "Alpha", 2), g(2, "Bravo", 1), g(5, "Echo", 8), g(6, "Foxtrot", 0)], wishlist: [9] };

describe("computeComparison", () => {
  it("finds games everyone owns, sorted by combined playtime", () => {
    const r = computeComparison([A, B, C]);
    expect(r.shared.map((x) => x.name)).toEqual(["Alpha", "Bravo"]);
    expect(r.shared[0].playtimes).toEqual({ a: 600, b: 300, c: 120 });
    expect(r.shared[0].playedBy).toBe(3);
    expect(r.stats.sharedCount).toBe(2);
    expect(r.stats.unionCount).toBe(6);
  });

  it("lists games only one person owns", () => {
    const r = computeComparison([A, B, C]);
    expect(r.unique.a.map((x) => x.name)).toEqual(["Delta"]);
    expect(r.unique.c.map((x) => x.name)).toEqual(["Foxtrot"]);
    expect(r.unique.b).toEqual([]);
  });

  it("finds near misses (everyone but one) for 3+ players", () => {
    const r = computeComparison([A, B, C]);
    const names = r.nearMisses.map((x) => x.name).sort();
    expect(names).toEqual(["Charlie", "Echo"]);
    expect(r.nearMisses.find((x) => x.name === "Charlie").missing).toEqual(["c"]);
    expect(computeComparison([A, B]).nearMisses).toEqual([]);
  });

  it("builds the backlog from shared games nobody has really played", () => {
    const r = computeComparison([A, B, C]);
    expect(r.backlog.map((x) => x.name)).toEqual(["Bravo"]);
    expect(r.stats.unplayedSharedCount).toBe(0);
  });

  it("counts recently played titles that are not owned (Family Sharing)", () => {
    const borrower = { steamid: "d", games: [g(1, "Alpha", 1)], recent: [{ appid: 2, name: "Bravo", playtime_2weeks: 30, playtime_forever: 30 }] };
    const r = computeComparison([A, borrower]);
    expect(r.shared.map((x) => x.name).sort()).toEqual(["Alpha", "Bravo"]);
  });

  it("matches wishlists to friends who own the game", () => {
    const r = computeComparison([A, B, C]);
    expect(r.sharedWishlist.map((x) => x.appid)).toEqual([9]);
    expect(r.wishlistMatches.b).toEqual([{ appid: 4, name: "Delta", owners: ["a"] }]);
  });

  it("reports a 'carry' when one player has all the hours", () => {
    const P = { steamid: "p", games: [g(7, "Grind", 300)] };
    const Q = { steamid: "q", games: [g(7, "Grind", 0.5)] };
    expect(computeComparison([P, Q]).stats.carry).toMatchObject({ name: "Grind", steamid: "p" });
  });

  it("is deterministic for fun facts", () => {
    const X = { steamid: "x", games: [g(1, "One"), g(2, "Two"), g(3, "Three")] };
    const Y = { steamid: "y", games: [g(1, "One"), g(2, "Two"), g(3, "Three")] };
    expect(computeComparison([X, Y]).stats.forgotten).toEqual(computeComparison([X, Y]).stats.forgotten);
  });
});
