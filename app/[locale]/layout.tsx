import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { siteJsonLd, SITE_URL } from "@/lib/seo";
import { locales, type Locale } from "@/i18n/config";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) return {};

  const isEn = locale === "en";
  const siteName = isEn ? "Maqalat" : "مقالات";
  const tagline = isEn
    ? "Your Modern Reference for Everything You Need to Know"
    : "مرجعك الحديث لكل ما تحتاج معرفته";
  const description = isEn
    ? "Maqalat — your modern reference for everything you need to know. Original expert content on the Hijri calendar, Saudi universities, health, finance, and more."
    : "مقالات — مرجعك الحديث لكل ما تحتاج معرفته. محتوى عربي أصيل بمصادر رسمية موثّقة في التقويم، الجامعات، الصحة، المال، السيارات وأكثر.";

  const canonicalPath = isEn ? "/en" : "/";

  return {
    title: {
      default: `${siteName} — ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: isEn ? "en_US" : "ar_SA",
      url: `${SITE_URL}${canonicalPath}`,
      siteName,
      title: `${siteName} — ${tagline}`,
      description,
      images: [
        { url: "/og-default.png", width: 1200, height: 630, alt: siteName },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: tagline,
      images: ["/og-default.png"],
    },
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
      languages: {
        ar: SITE_URL,
        en: `${SITE_URL}/en`,
        "x-default": SITE_URL,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd data={siteJsonLd()} />
      <Header />
      <main className="relative z-10 min-h-screen">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
