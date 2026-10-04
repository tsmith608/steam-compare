// Public site constants (safe to import from client components).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://webothplay.com").replace(/\/$/, "");
export const SITE_NAME = "WeBothPlay";
export const TAGLINE = "Compare Steam libraries and find what your group can play tonight.";

export const BOT_INSTALL_URL =
  process.env.NEXT_PUBLIC_DISCORD_BOT_INSTALL_URL ||
  "https://discord.com/oauth2/authorize?client_id=1472792413499293779&permissions=18432&scope=bot%20applications.commands";

// Short invite codes expire; set NEXT_PUBLIC_DISCORD_INVITE_URL to a permanent one.
export const COMMUNITY_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/uBUYgE75";

// Defaults to the address already published on the old contact page; set
// NEXT_PUBLIC_SUPPORT_EMAIL to a dedicated support alias.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "trentonsmith608@gmail.com";

export const steamHeader = (appid) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
export const steamCapsule = (appid) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`;
export const steamPortrait = (appid) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`;
export const steamStore = (appid) => `https://store.steampowered.com/app/${appid}/`;
export const steamRun = (appid) => `steam://run/${appid}`;
