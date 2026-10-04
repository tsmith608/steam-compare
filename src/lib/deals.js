// Where to buy a game. The default is the official Steam store page. Optional
// affiliate stores appear only when the owner configures a deep-link template
// (from the Impact/Awin dashboard) containing "{url}", e.g.
//   NEXT_PUBLIC_AFFILIATE_HUMBLE="https://humblebundleinc.sjv.io/c/123/456/789?u={url}"
// Affiliate links are labelled and carry rel="sponsored".
import { steamStore } from "@/lib/site";

const STORES = [
  { key: "HUMBLE", name: "Humble Store", search: (q) => `https://www.humblebundle.com/store/search?search=${encodeURIComponent(q)}` },
  { key: "GMG", name: "Green Man Gaming", search: (q) => `https://www.greenmangaming.com/search/?query=${encodeURIComponent(q)}` },
  { key: "FANATICAL", name: "Fanatical", search: (q) => `https://www.fanatical.com/en/search?search=${encodeURIComponent(q)}` },
];

const TEMPLATES = {
  HUMBLE: process.env.NEXT_PUBLIC_AFFILIATE_HUMBLE,
  GMG: process.env.NEXT_PUBLIC_AFFILIATE_GMG,
  FANATICAL: process.env.NEXT_PUBLIC_AFFILIATE_FANATICAL,
};

export function dealLinks(appid, name) {
  const links = [{ store: "Steam", url: steamStore(appid), sponsored: false }];
  for (const s of STORES) {
    const tpl = TEMPLATES[s.key];
    if (tpl && tpl.includes("{url}")) {
      links.push({ store: s.name, url: tpl.replace("{url}", encodeURIComponent(s.search(name))), sponsored: true });
    }
  }
  return links;
}

export const hasAffiliates = () => Object.values(TEMPLATES).some((t) => t && t.includes("{url}"));
