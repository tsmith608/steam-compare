import "./globals.css";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./components/SiteFooter";
import Script from "next/script";

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
        url: "/logo.png",
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
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  other: {
    "google-adsense-account": "ca-pub-5774226834741887",
    "impact-site-verification": "a9cefe9f-8aad-4a52-a4c2-195be9478964",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* AdSense Main Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/position/js/adsbygoogle.js?client=ca-pub-5774226834741887"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Google Analytics Placeholder */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KSRRGKT9ZZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KSRRGKT9ZZ');
          `}
        </Script>
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
