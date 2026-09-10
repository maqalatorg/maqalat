import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArticleCard } from "@/components/ArticleCard";
import { ClusterIcon } from "@/components/ClusterIcon";
import { getArticlesByCluster } from "@/lib/blog";
import { CLUSTERS, findCluster } from "@/lib/clusters";
import {
  SITE_URL,
  DEFAULT_OG,
  normalizeTitle,
  normalizeMetaDescription,
} from "@/lib/seo";
import { locales } from "@/i18n/config";

// ISR: cache the cluster page at the edge for 1h. Cuts TTFB ~1s → <100ms.
export const revalidate = 3600;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    CLUSTERS.filter((c) => c.enabled).map((c) => ({ locale, cluster: c.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; cluster: string }>;
}): Promise<Metadata> {
  const { locale, cluster: slug } = await params;
  const cluster = findCluster(slug);
  if (!cluster) return {};
  const isEn = locale === "en";
  const rawTitle = isEn ? cluster.titleEn : cluster.titleAr;
  const rawDescription = isEn ? cluster.descriptionEn : cluster.descriptionAr;
  const path = locale === "ar" ? `/c/${slug}` : `/${locale}/c/${slug}`;
  const canonicalUrl = `${SITE_URL}${path}`;
  const siteName = isEn ? "Maqalat" : "مقالات";
  const seoTitle = normalizeTitle(rawTitle);
  const seoDescription = normalizeMetaDescription(
    rawDescription,
    isEn ? `Curated ${rawTitle} content on Maqalat.` : `أفضل محتوى ${rawTitle} على مقالات.`,
  );
  const coverUrl = `${SITE_URL}${DEFAULT_OG}`;

  // Cluster pages exist for both AR and EN — always emit both.
  const arUrl = `${SITE_URL}/c/${slug}`;
  const enUrl = `${SITE_URL}/en/c/${slug}`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: { ar: arUrl, en: enUrl, "x-default": arUrl },
    },
    openGraph: {
      type: "website",
      locale: isEn ? "en_US" : "ar_SA",
      siteName,
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      images: [{ url: coverUrl, width: 1200, height: 630, alt: seoTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [coverUrl],
    },
  };
}

export default async function ClusterPage({
  params,
}: {
  params: Promise<{ locale: string; cluster: string }>;
}) {
  const { locale, cluster: slug } = await params;
  if (!locales.includes(locale as (typeof locales)[number])) notFound();
  setRequestLocale(locale);
  const cluster = findCluster(slug);
  if (!cluster || !cluster.enabled) notFound();

  const isEn = locale === "en";
  const t = await getTranslations({ locale, namespace: "cluster" });
  const articles = getArticlesByCluster(slug, locale as "ar" | "en");

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="text-center mb-10">
        <div className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-5">
          <ClusterIcon
            name={cluster.icon}
            className="w-8 h-8 text-emerald-700 dark:text-emerald-400"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          {isEn ? cluster.titleEn : cluster.titleAr}
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {isEn ? cluster.descriptionEn : cluster.descriptionAr}
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          {t("empty")}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
