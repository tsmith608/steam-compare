import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SessionProvider } from "@/components/SessionProvider";
import AnalyticsBoot from "@/components/AnalyticsBoot";
import { SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site";

// Type system (see docs/retrofit/DESIGN_SYSTEM.md), all SIL OFL 1.1:
// - Archivo (variable width 62–125): expanded heavy headlines, condensed caps
//   labels and tabular stats — the brand voice.
// - Inter (optical sizes): interface and body text only; covers Cyrillic and
//   Greek so friends' Steam names render properly.
// - JetBrains Mono: Steam IDs and codes; not preloaded.
const display = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
  axes: ["wdth"],
});
const sans = Inter({
  subsets: ["latin", "latin-ext", "cyrillic", "greek"],
  variable: "--font-sans",
  display: "swap",
  axes: ["opsz"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-KSRRGKT9ZZ";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WeBothPlay — Compare Steam libraries, find what to play together",
    template: "%s · WeBothPlay",
  },
  description:
    "Compare your friends' Steam libraries in seconds. See every game your group already owns, find what one copy would unlock, and let the roulette pick tonight's game.",
  applicationName: SITE_NAME,
  keywords: ["compare steam libraries", "steam games in common", "games we both own", "co-op game finder", "steam game picker"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "WeBothPlay — What are we playing tonight?",
    description: TAGLINE,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeBothPlay — What are we playing tonight?",
    description: TAGLINE,
  },
  icons: { icon: [{ url: "/icon.png", type: "image/png" }], apple: "/icon.png" },
  other: {
    "google-adsense-account": "ca-pub-5774226834741887",
    "impact-site-verification": "a9cefe9f-8aad-4a52-a4c2-195be9478964",
  },
};

export const viewport = {
  themeColor: "#060708",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <SessionProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </SessionProvider>
        <AnalyticsBoot />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
