import { ImageResponse } from "next/og";
import { getPoll } from "@/lib/shares";
import { PollCard, SiteCard, loadOgFonts } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vote on tonight's game";

export default async function Image({ params }) {
  const { id } = await params;
  const fonts = await loadOgFonts();
  const poll = await getPoll(id).catch(() => null);
  return new ImageResponse(poll ? <PollCard options={poll.options} /> : <SiteCard />, { ...size, fonts });
}
