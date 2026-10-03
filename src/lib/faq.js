// FAQ copy shared by the homepage and /help. Keep answers literally true:
// if the product changes, change these.
import { PLAN_LIMITS } from "@/lib/plans";

export const HOME_FAQ = [
  {
    q: "Do I have to sign in?",
    a: "No. Paste profile links, SteamID64s or custom URL names and compare. Signing in through Steam (on Steam's own site — we never see your password) lets you pick friends from your Steam friends list.",
  },
  {
    q: "Why can't you see a friend's games?",
    a: "Their Steam \"Game details\" privacy setting is probably set to Friends Only or Private. It's separate from profile visibility. We'll tell you exactly who is hidden, still compare everyone else, and give you a message to send them with the one-minute fix.",
  },
  {
    q: "Is it free?",
    a: `Yes. Comparisons for up to ${PLAN_LIMITS.Noob.maxPlayers} players, filters, roulette, group votes and share links are free. Premium adds bigger groups (up to ${PLAN_LIMITS.Hacker.maxPlayers}), saved groups and Discord bot extras.`,
  },
  {
    q: "What do you store?",
    a: "We don't store game libraries — they're fetched from Steam when you compare. If you sign in we keep your Steam ID, display name and avatar. Share and vote links store the Steam IDs in that group plus a short summary. Usage stats are anonymous counts with no IDs attached.",
  },
  {
    q: "Does it work with Steam Family Sharing?",
    a: "Partly. Steam's API lists games each person owns. Borrowed games played in the last two weeks count too, but borrowed games nobody has played recently won't appear.",
  },
  {
    q: "Is this made by Valve?",
    a: "No. WeBothPlay is an independent project that uses the public Steam Web API. It isn't affiliated with or endorsed by Valve.",
  },
];
