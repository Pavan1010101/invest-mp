import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Invest Madhya Pradesh | Global Investors Summit 2026",
  description: "Register for India's premier investment summit. Connect with government leaders, explore opportunities across key sectors, and invest in the future of Madhya Pradesh.",
  keywords: ["investment", "Madhya Pradesh", "summit", "India", "investors", "MPIDC", "business"],
  icons: {
    icon: [
      { url: "/images/favicon.png" },
      { url: "/icon.png" },
    ],
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
  openGraph: {
    title: "Invest Madhya Pradesh — Global Investors Summit 2026",
    description: "Register for India's premier investment summit. Connect with government leaders, explore opportunities across key sectors.",
    type: "website",
    images: ["/images/gis-banner.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="icon" href="/images/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/images/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Noto+Sans+Devanagari:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
