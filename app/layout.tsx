import type { Metadata, Viewport } from "next";
import { Cairo, Amiri } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { JsonLd } from "@/components/JsonLd";
import { siteJsonLd, SITE_URL, SITE_NAME_AR, SITE_TAGLINE_AR } from "@/lib/seo";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

// Editorial serif for large display headlines — gives publication feel
const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME_AR} — ${SITE_TAGLINE_AR}`,
    template: `%s | ${SITE_NAME_AR}`,
  },
  description:
    "مقالات — مرجعك الحديث لكل ما تحتاج معرفته. محتوى عربي أصيل بمصادر رسمية موثّقة في التقويم، الجامعات، الصحة، المال، السيارات وأكثر.",
  keywords: [
    "مقالات",
    "مرجع عربي",
    "التقويم الهجري",
    "الإجازات الرسمية السعودية",
    "الجامعات السعودية",
    "نظام نور",
    "شروحات",
    "دليل",
    "معرفة",
  ],
  authors: [{ name: SITE_NAME_AR }],
  creator: SITE_NAME_AR,
  publisher: SITE_NAME_AR,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: SITE_URL,
    siteName: SITE_NAME_AR,
    title: `${SITE_NAME_AR} — ${SITE_TAGLINE_AR}`,
    description: "مرجعك الحديث لكل ما تحتاج معرفته.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: SITE_NAME_AR }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME_AR,
    description: SITE_TAGLINE_AR,
    images: ["/og-default.png"],
  },
  icons: { icon: "/favicon.ico" },
  alternates: {
    canonical: SITE_URL,
    languages: { "ar-SA": SITE_URL, "x-default": SITE_URL },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${cairo.variable} ${amiri.variable}`}>
      <head>
        <JsonLd data={siteJsonLd()} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <div className="watermark-bg" aria-hidden="true" />
          <Header />
          <main className="relative z-10 min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
