import type { Viewport } from "next";
import { SITE_URL } from "@/lib/seo";

// Root layout is intentionally minimal — no <html>, no headers()/cookies().
// The <html lang dir> tag and all providers live in app/[locale]/layout.tsx
// so that ISR (revalidate) on individual pages actually kicks in. Reading
// headers() here would opt every descendant page into dynamic rendering,
// which is why article/cluster/home HTML was being served as
// `Cache-Control: no-cache` despite `export const revalidate = 3600`.

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
