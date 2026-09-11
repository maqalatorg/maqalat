import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { FeaturedArticle } from "@/components/FeaturedArticle";
import { ClusterIcon } from "@/components/ClusterIcon";
import { getAllArticles, getPopularArticles, toCardData } from "@/lib/blog";
import { ENABLED_CLUSTERS } from "@/lib/clusters";
import type { Locale } from "@/i18n/config";

// ISR: render once per hour and cache at the edge. Homepage reads 200+ MDX
// files via getAllArticles(); serving from cache drops TTFB from ~3s to <200ms.
export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeBody />;
}

function HomeBody() {
  const t = useTranslations("home");
  const currentLocale = useLocale() as Locale;
  const isEn = currentLocale === "en";
  const Arrow = isEn ? ArrowRight : ArrowLeft;

  // toCardData strips the MDX body AND the unused frontmatter fields
  // (faq / tags / cover / author / updatedAt) — homepage HTML drops
  // from ~1MB → well under the Ahrefs 250KB threshold.
  const all = getAllArticles(currentLocale).map(toCardData);
  const totalCount = all.length;
  const [featured, ...rest] = all;
  // Cap latest section to keep homepage HTML lightweight.
  // Full catalog is discoverable via cluster hubs in the Sections grid below.
  const latest = rest.slice(0, 24);
  const popular = getPopularArticles(6, currentLocale).map(toCardData);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="sr-only">
        {isEn
          ? "Maqalat — Your Modern Reference for Everything You Need to Know"
          : "مقالات — مرجعك الحديث لكل ما تحتاج معرفته"}
      </h1>
      {featured && (
        <section className="pt-8 sm:pt-10">
          <FeaturedArticle article={featured} />
        </section>
      )}

      {popular.length > 0 && (
        <section id="popular" className="pt-14 scroll-mt-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {t("popularTitle")}
            </h2>
            <span className="text-sm text-slate-500">{t("popularSubtitle")}</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section id="latest" className="pt-14 scroll-mt-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {t("latestTitle")}
            </h2>
            <span className="text-sm text-slate-500">
              {t("articleCount", { count: totalCount })}
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      <section id="sections" className="pt-14 pb-16 scroll-mt-20">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {t("sectionsTitle")}
          </h2>
          <span className="text-sm text-slate-500">
            {t("sectionCount", { count: ENABLED_CLUSTERS.length })}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENABLED_CLUSTERS.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="card p-6 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 grid place-items-center mb-4 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <ClusterIcon
                  name={c.icon}
                  className="w-6 h-6 text-emerald-700 dark:text-emerald-400"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                {isEn ? c.titleEn : c.titleAr}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                {isEn ? c.descriptionEn : c.descriptionAr}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400 group-hover:gap-2 transition-all">
                {t("explore")} <Arrow className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
