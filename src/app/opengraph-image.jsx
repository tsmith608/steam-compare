import { ImageResponse } from "next/og";
import { SiteCard, loadOgFonts } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "WeBothPlay — What are we playing tonight?";

export default async function Image() {
  return new ImageResponse(<SiteCard />, { ...size, fonts: await loadOgFonts() });
}
