import { ImageResponse } from "next/og";
import { getShare } from "@/lib/shares";
import { ComparisonCard, SiteCard, imageData, loadOgFonts } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "WeBothPlay comparison card";

export default async function Image({ params }) {
  const { id } = await params;
  const fonts = await loadOgFonts();
  const share = await getShare(id).catch(() => null);
  if (!share) return new ImageResponse(<SiteCard />, { ...size, fonts });
  const s = share.summary;
  const players = await Promise.all(s.players.slice(0, 6).map(async (p) => ({ ...p, avatarData: await imageData(p.avatar) })));
  return new ImageResponse(<ComparisonCard s={{ ...s, players: [...players, ...s.players.slice(6)] }} />, {
    ...size,
    fonts,
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
  });
}
