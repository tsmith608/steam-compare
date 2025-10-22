// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "Steam Compare",
  description: "Compare Steam libraries between friends",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen">
        {children}
      </body>
    </html>
  );
}
