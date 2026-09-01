import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArticleCard } from "@/components/ArticleCard";
import { ClusterIcon } from "@/components/ClusterIcon";
import { getArticlesByCluster } from "@/lib/blog";
import { CLUSTERS, findCluster } from "@/lib/clusters";
import { SITE_URL } from "@/lib/seo";
import { locales } from "@/i18n/config";

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
  const title = isEn ? cluster.titleEn : cluster.titleAr;
  const description = isEn ? cluster.descriptionEn : cluster.descriptionAr;
  const path = locale === "ar" ? `/c/${slug}` : `/${locale}/c/${slug}`;
  const siteName = isEn ? "Maqalat" : "مقالات";
  return {
    title: `${title} — ${siteName}`,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: `${title} — ${siteName}`,
      description,
      url: `${SITE_URL}${path}`,
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
