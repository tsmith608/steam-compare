import "./globals.css";
import SiteHeader from "./SiteHeader";

export const metadata = {
  title: "We Both Play - Steam Library Comparison Tool",
  description: "Compare Steam libraries instantly. Find shared games, uncover unique titles, and plan your next co-op adventure with friends.",
  keywords: ["Steam", "Compare", "Library", "Multiplayer", "Co-op", "Games", "Friends"],
  authors: [{ name: "Trenton Smith" }],
  openGraph: {
    title: "We Both Play - Compare Steam Libraries",
    description: "Find out what games you and your friends own in common.",
    url: "https://webothplay.com",
    siteName: "We Both Play",
    images: [
      {
        url: "/og-image.png", // Ensure this exists or use a screenshot
        width: 1200,
        height: 630,
        alt: "We Both Play Interface",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "We Both Play",
    description: "Compare Steam libraries and find shared games instantly.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
