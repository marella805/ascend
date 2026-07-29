import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASCEND — Training Progress as a Character Sheet",
  description: "Log a session, watch the attribute climb, hold the streak, close the season with a rank.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ASCEND",
  },
  icons: {
    apple: "/icons/icon-192.png",
    icon: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0D10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/bold/style.css" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body style={{ minHeight: '100vh', background: '#060708' }}>{children}</body>
    </html>
  );
}
