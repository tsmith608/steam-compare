import "./globals.css";
import SiteHeader from "./SiteHeader";

export const metadata = {
  title: "We Both Play",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },           // fallback
      { url: "/icon.png", type: "image/png" },     // crisp in modern browsers
    ],
  },
  description: "Compare Steam libraries"
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
