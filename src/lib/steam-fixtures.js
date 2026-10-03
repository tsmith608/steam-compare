// Synthetic demo data. The four "Demo" players are fictional: their SteamID64s
// sit below the first valid account number (76561197960265728), so they can
// never collide with a real Steam account. Game titles and app IDs are real so
// cover art loads, but every library, playtime and name here is made up.

export const DEMO_STEAM_IDS = [
  "76561190000000001",
  "76561190000000002",
  "76561190000000003",
  "76561190000000004",
];

export const DEMO_PROFILES = {
  "76561190000000001": { personaname: "Demo · Nova", vanity: "demo-nova" },
  "76561190000000002": { personaname: "Demo · Bram", vanity: "demo-bram" },
  "76561190000000003": { personaname: "Demo · Kit", vanity: "demo-kit" },
  "76561190000000004": { personaname: "Demo · Juno", vanity: "demo-juno" },
};

// Category descriptions mirror the Steam store's wording.
const C = {
  sp: "Single-player",
  mp: "Multi-player",
  coop: "Co-op",
  ocoop: "Online Co-op",
  lcoop: "Shared/Split Screen Co-op",
  pvp: "PvP",
  opvp: "Online PvP",
  rpt: "Remote Play Together",
  ctrl: "Full controller support",
  xplat: "Cross-Platform Multiplayer",
  mmo: "MMO",
};

// [appid, name, genres, categories, isFree]
export const FIXTURE_GAMES = [
  [548430, "Deep Rock Galactic", ["Action"], [C.sp, C.mp, C.coop, C.ocoop, C.ctrl, C.xplat], false],
  [1966720, "Lethal Company", ["Action", "Indie"], [C.mp, C.coop, C.ocoop], false],
  [553850, "HELLDIVERS™ 2", ["Action"], [C.mp, C.coop, C.ocoop, C.ctrl, C.xplat], false],
  [892970, "Valheim", ["Action", "Adventure", "Indie", "RPG"], [C.sp, C.mp, C.coop, C.ocoop, C.ctrl], false],
  [739630, "Phasmophobia", ["Action", "Indie"], [C.sp, C.mp, C.coop, C.ocoop], false],
  [252950, "Rocket League", ["Action", "Racing", "Sports"], [C.mp, C.pvp, C.opvp, C.lcoop, C.ctrl, C.xplat], true],
  [105600, "Terraria", ["Action", "Adventure", "Indie", "RPG"], [C.sp, C.mp, C.coop, C.ocoop, C.pvp, C.ctrl], false],
  [413150, "Stardew Valley", ["Indie", "RPG", "Simulation"], [C.sp, C.mp, C.coop, C.ocoop, C.lcoop, C.rpt, C.ctrl], false],
  [550, "Left 4 Dead 2", ["Action"], [C.sp, C.mp, C.coop, C.ocoop, C.lcoop, C.pvp, C.ctrl], false],
  [620, "Portal 2", ["Action", "Adventure"], [C.sp, C.mp, C.coop, C.ocoop, C.lcoop, C.ctrl], false],
  [1426210, "It Takes Two", ["Action", "Adventure"], [C.mp, C.coop, C.ocoop, C.lcoop, C.rpt, C.ctrl], false],
  [2001120, "Split Fiction", ["Action", "Adventure"], [C.mp, C.coop, C.ocoop, C.lcoop, C.ctrl, C.xplat], false],
  [632360, "Risk of Rain 2", ["Action", "Indie"], [C.sp, C.mp, C.coop, C.ocoop, C.ctrl], false],
  [945360, "Among Us", ["Casual"], [C.mp, C.opvp, C.xplat], false],
  [381210, "Dead by Daylight", ["Action"], [C.mp, C.opvp, C.ctrl, C.xplat], false],
  [730, "Counter-Strike 2", ["Action"], [C.mp, C.pvp, C.opvp], true],
  [570, "Dota 2", ["Action", "Strategy"], [C.mp, C.coop, C.pvp, C.opvp], true],
  [440, "Team Fortress 2", ["Action"], [C.mp, C.pvp, C.opvp], true],
  [4000, "Garry's Mod", ["Indie", "Simulation"], [C.sp, C.mp, C.coop, C.opvp], false],
  [1172470, "Apex Legends™", ["Action", "Adventure"], [C.mp, C.opvp, C.ctrl, C.xplat], true],
  [578080, "PUBG: BATTLEGROUNDS", ["Action", "Adventure"], [C.mp, C.pvp, C.opvp], true],
  [359550, "Tom Clancy's Rainbow Six® Siege", ["Action"], [C.mp, C.pvp, C.opvp, C.coop, C.ocoop], false],
  [1085660, "Destiny 2", ["Action", "Adventure"], [C.mp, C.coop, C.ocoop, C.opvp, C.ctrl, C.xplat], true],
  [1245620, "ELDEN RING", ["Action", "RPG"], [C.sp, C.mp, C.coop, C.ocoop, C.opvp, C.ctrl], false],
  [1086940, "Baldur's Gate 3", ["Adventure", "RPG", "Strategy"], [C.sp, C.mp, C.coop, C.ocoop, C.lcoop, C.ctrl], false],
  [1145360, "Hades", ["Action", "Indie", "RPG"], [C.sp, C.ctrl], false],
  [646570, "Slay the Spire", ["Indie", "Strategy"], [C.sp, C.ctrl], false],
  [427520, "Factorio", ["Casual", "Indie", "Simulation", "Strategy"], [C.sp, C.mp, C.coop, C.ocoop, C.pvp], false],
  [294100, "RimWorld", ["Indie", "Simulation", "Strategy"], [C.sp], false],
  [1623730, "Palworld", ["Action", "Adventure", "Indie", "RPG"], [C.sp, C.mp, C.coop, C.ocoop, C.opvp, C.ctrl, C.xplat], false],
  [1172620, "Sea of Thieves", ["Action", "Adventure"], [C.mp, C.coop, C.ocoop, C.opvp, C.ctrl, C.xplat], false],
  [594650, "Hunt: Showdown 1896", ["Action"], [C.mp, C.coop, C.ocoop, C.opvp, C.ctrl], false],
  [230410, "Warframe", ["Action"], [C.mp, C.coop, C.ocoop, C.opvp, C.ctrl, C.xplat], true],
  [252490, "Rust", ["Action", "Adventure", "Indie", "RPG"], [C.mp, C.opvp, C.mmo], false],
  [242760, "The Forest", ["Action", "Adventure", "Indie", "Simulation"], [C.sp, C.mp, C.coop, C.ocoop], false],
  [1326470, "Sons Of The Forest", ["Action", "Adventure", "Simulation"], [C.sp, C.mp, C.coop, C.ocoop, C.ctrl], false],
  [108600, "Project Zomboid", ["Indie", "RPG", "Simulation"], [C.sp, C.mp, C.coop, C.ocoop, C.lcoop, C.opvp], false],
  [322330, "Don't Starve Together", ["Adventure", "Indie", "Simulation"], [C.mp, C.coop, C.ocoop, C.ctrl], false],
  [1097150, "Fall Guys", ["Action", "Casual", "Sports"], [C.mp, C.opvp, C.ctrl, C.xplat], true],
  [2357570, "Overwatch® 2", ["Action"], [C.mp, C.opvp, C.coop, C.ctrl, C.xplat], true],
  [1551360, "Forza Horizon 5", ["Action", "Racing", "Sports"], [C.sp, C.mp, C.coop, C.ocoop, C.opvp, C.ctrl, C.xplat], false],
  [1222700, "A Way Out", ["Action", "Adventure"], [C.mp, C.coop, C.ocoop, C.lcoop, C.rpt, C.ctrl], false],
  [2767030, "Marvel Rivals", ["Action"], [C.mp, C.opvp, C.ctrl, C.xplat], true],
  [1361210, "Warhammer 40,000: Darktide", ["Action"], [C.mp, C.coop, C.ocoop, C.ctrl, C.xplat], false],
  [552500, "Warhammer: Vermintide 2", ["Action"], [C.sp, C.mp, C.coop, C.ocoop, C.ctrl], false],
  [431240, "Golf With Your Friends", ["Casual", "Indie", "Sports"], [C.mp, C.opvp, C.lcoop, C.rpt, C.ctrl, C.xplat], false],
  [286160, "Tabletop Simulator", ["Casual", "Indie", "Simulation", "Strategy"], [C.sp, C.mp, C.coop, C.opvp], false],
  [1364780, "Street Fighter™ 6", ["Action", "Sports"], [C.sp, C.mp, C.pvp, C.opvp, C.lcoop, C.ctrl, C.xplat], false],
  [2073850, "THE FINALS", ["Action"], [C.mp, C.opvp, C.ctrl, C.xplat], true],
  [1144200, "Ready or Not", ["Action", "Simulation"], [C.sp, C.mp, C.coop, C.ocoop, C.pvp], false],
  [813780, "Age of Empires II: Definitive Edition", ["Strategy"], [C.sp, C.mp, C.coop, C.ocoop, C.opvp, C.xplat], false],
  [1794680, "Vampire Survivors", ["Action", "Casual", "Indie", "RPG"], [C.sp, C.mp, C.lcoop, C.rpt, C.ctrl], false],
  [1145350, "Hades II", ["Action", "Indie", "RPG"], [C.sp, C.ctrl], false],
  [291550, "Brawlhalla", ["Action", "Indie"], [C.mp, C.pvp, C.opvp, C.lcoop, C.ctrl, C.xplat], true],
  [2246340, "Monster Hunter Wilds", ["Action", "Adventure", "RPG"], [C.sp, C.mp, C.coop, C.ocoop, C.ctrl, C.xplat], false],
  [582010, "Monster Hunter: World", ["Action"], [C.sp, C.mp, C.coop, C.ocoop, C.ctrl], false],
  [728880, "Overcooked! 2", ["Action", "Casual", "Indie", "Simulation"], [C.sp, C.mp, C.coop, C.ocoop, C.lcoop, C.rpt, C.ctrl], false],
  [1260320, "Party Animals", ["Action", "Casual", "Indie"], [C.mp, C.opvp, C.lcoop, C.rpt, C.ctrl, C.xplat], false],
  [960090, "Bloons TD 6", ["Strategy"], [C.sp, C.mp, C.coop, C.ocoop, C.ctrl, C.xplat], false],
  [1203620, "Enshrouded", ["Action", "Adventure", "Indie", "RPG"], [C.sp, C.mp, C.coop, C.ocoop, C.ctrl], false],
  [526870, "Satisfactory", ["Adventure", "Indie", "Simulation", "Strategy"], [C.sp, C.mp, C.coop, C.ocoop], false],
  [2881650, "Content Warning", ["Action", "Casual", "Indie"], [C.mp, C.coop, C.ocoop], false],
  [3241660, "R.E.P.O.", ["Action", "Casual", "Indie"], [C.mp, C.coop, C.ocoop], false],
  [3164500, "Schedule I", ["Action", "Indie", "Simulation"], [C.sp, C.mp, C.coop, C.ocoop], false],
  [218620, "PAYDAY 2", ["Action", "RPG"], [C.sp, C.mp, C.coop, C.ocoop, C.ctrl], false],
  [289070, "Sid Meier's Civilization® VI", ["Strategy"], [C.sp, C.mp, C.opvp, C.xplat], false],
  [1174180, "Red Dead Redemption 2", ["Action", "Adventure"], [C.sp, C.mp, C.coop, C.ocoop, C.opvp, C.ctrl], false],
  [1517290, "Battlefield™ 2042", ["Action"], [C.mp, C.opvp, C.coop, C.ctrl, C.xplat], false],
  [2183900, "Warhammer 40,000: Space Marine 2", ["Action", "Adventure"], [C.sp, C.mp, C.coop, C.ocoop, C.opvp, C.ctrl, C.xplat], false],
  [1272080, "PAYDAY 3", ["Action"], [C.mp, C.coop, C.ocoop, C.ctrl, C.xplat], false],
];

// Who owns what (index into FIXTURE_GAMES) and rough hours per player.
// Hand-tuned so the demo shows every feature: a large overlap, a game all four
// own that nobody has launched, a lopsided "carry" game, near-misses, and
// games only one person owns.
const OWNERSHIP = {
  // appid: [hoursNova, hoursBram, hoursKit, hoursJuno]  (null = not owned)
  548430: [212, 96, 41, 18],
  1966720: [34, 51, 22, 9],
  553850: [88, 0.5, 61, null],
  892970: [140, 77, 0, 12],
  739630: [26, 33, 14, 0],
  252950: [410, 6, 35, 2],
  105600: [96, 180, 0, 43],
  413150: [55, 0, 120, 210],
  550: [61, 44, 27, 15],
  620: [18, 22, 11, 9],
  1426210: [16, 16, null, 0],
  2001120: [0, 0, null, null],
  632360: [72, 1.2, 38, 0],
  945360: [9, 12, 7, 4],
  381210: [0.4, 0, 0, 0],
  730: [1240, 380, 64, 0.7],
  570: [3, 900, null, null],
  440: [120, 35, 2, 0],
  4000: [210, 160, 48, 90],
  1172470: [0, 1.5, 0.2, 0],
  578080: [0, 0, 0, 0],
  359550: [64, null, 5, null],
  1085660: [0, 0, 0, 0],
  1245620: [130, 15, null, 64],
  1086940: [88, 121, 46, null],
  1145360: [40, null, 22, 61],
  646570: [77, null, null, 140],
  427520: [300, 12, null, null],
  294100: [null, 400, null, null],
  1623730: [41, 38, 0, 6],
  1172620: [0, 0, 0, 0],
  594650: [null, 22, null, null],
  230410: [0, 0.3, 0, 0],
  252490: [33, 0, 0, null],
  242760: [21, 18, 9, 0],
  1326470: [0, 0, 0, 0],
  108600: [12, 0, 1, null],
  322330: [44, 61, 28, 19],
  1097150: [3, 1, 6, 0],
  2357570: [0, 0, 0, 0],
  1551360: [52, null, 18, 7],
  1222700: [0, 0, null, 0],
  2767030: [36, 0, 0, 0],
  1361210: [null, null, 31, null],
  552500: [14, 2, 0, 0],
  431240: [6, 4, 3, 5],
  286160: [0, 0, 0, 0.2],
  1364780: [null, 48, null, null],
  2073850: [0, 0, 0, null],
  1144200: [22, null, null, 11],
  813780: [null, 66, 9, null],
  1794680: [24, 3, 0, 31],
  1145350: [12, null, null, 30],
  291550: [0, 0, 0, 0],
  2246340: [74, null, 40, null],
  582010: [160, 0, 90, 0],
  728880: [5, 4, 0, 8],
  1260320: [0, 0, 0, 0],
  960090: [0, 0, 0, 0],
  1203620: [18, 0, null, 0],
  526870: [96, null, null, null],
  2881650: [4, 3, 2, 0],
  3241660: [11, 9, 13, 7],
  3164500: [0, 0, null, 0],
  218620: [37, 140, 0, null],
  289070: [210, null, null, null],
  1174180: [0, 0, 0, 0],
  1517290: [0, null, 0, null],
  2183900: [28, null, null, null],
  1272080: [0, 0, null, null],
};

// Recent (last two weeks) minutes, to light up "playing lately".
const RECENT = {
  548430: [380, 120, 0, 60],
  3241660: [240, 300, 420, 0],
  1966720: [0, 90, 0, 0],
  730: [600, 0, 0, 0],
  413150: [0, 0, 0, 320],
};

const NOW = Date.UTC(2026, 9, 1) / 1000;

export function fixtureLibrary(steamid) {
  const idx = DEMO_STEAM_IDS.indexOf(String(steamid));
  if (idx === -1) return null;
  const games = [];
  for (const [appid, name] of FIXTURE_GAMES) {
    const hours = OWNERSHIP[appid]?.[idx];
    if (hours === null || hours === undefined) continue;
    const recent = RECENT[appid]?.[idx] || 0;
    const minutes = Math.round(hours * 60);
    games.push({
      appid,
      name,
      playtime_forever: minutes,
      playtime_2weeks: recent || undefined,
      rtime_last_played: minutes > 0 ? NOW - ((appid * 7919 + idx * 104729) % (400 * 86400)) : 0,
    });
  }
  return games;
}

export function fixtureRecent(steamid) {
  const idx = DEMO_STEAM_IDS.indexOf(String(steamid));
  if (idx === -1) return [];
  return FIXTURE_GAMES.filter(([appid]) => RECENT[appid]?.[idx] > 0).map(([appid, name]) => ({
    appid,
    name,
    playtime_2weeks: RECENT[appid][idx],
    playtime_forever: Math.round((OWNERSHIP[appid]?.[idx] || 0) * 60),
  }));
}

export function fixtureWishlist(steamid) {
  const idx = DEMO_STEAM_IDS.indexOf(String(steamid));
  if (idx === -1) return [];
  // Kit and Juno want Split Fiction; Juno wants HELLDIVERS 2 (others own it).
  const wants = { 2: [2001120, 1361210], 3: [2001120, 553850], 1: [2001120], 0: [] };
  return (wants[idx] || []).map((appid) => ({ appid }));
}

export function fixtureAppDetails(appid) {
  const row = FIXTURE_GAMES.find(([id]) => id === Number(appid));
  if (!row) return null;
  const [id, name, genres, categories, isFree] = row;
  return {
    type: "game",
    name,
    steam_appid: id,
    is_free: isFree,
    genres: genres.map((description) => ({ description })),
    categories: categories.map((description) => ({ description })),
    controller_support: categories.includes("Full controller support") ? "full" : undefined,
    platforms: { windows: true, mac: false, linux: false },
  };
}

export function fixtureFriends(steamid) {
  if (!DEMO_STEAM_IDS.includes(String(steamid))) return [];
  return DEMO_STEAM_IDS.filter((id) => id !== String(steamid));
}
