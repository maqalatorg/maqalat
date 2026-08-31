import type { Viewport } from "next";
import { Cairo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { headers } from "next/headers";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { SITE_URL } from "@/lib/seo";
import { defaultLocale, isRtl } from "@/i18n/config";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

// Base metadata — locale-specific metadata is generated in app/[locale]/layout.tsx.
// Values here apply to system routes (sitemap, robots, og-default.png) and act as
// fallbacks for anything not overridden.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FEFCF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0F1E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware sets x-next-intl-locale header. Fall back to defaultLocale for
  // request paths not matched by middleware (sitemap.xml, robots.txt, etc).
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") || defaultLocale;
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={cairo.variable}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <div className="watermark-bg" aria-hidden="true" />
          {children}
        </ThemeProvider>
        <Analytics />
        <GoogleAnalytics />
        <GoogleAdSense />
      </body>
    </html>
  );
}
