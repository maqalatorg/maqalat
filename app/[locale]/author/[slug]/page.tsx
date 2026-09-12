import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { User, Mail, ExternalLink, ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  AUTHORS,
  getAuthor,
  authorName,
  authorRole,
  authorBio,
  authorProfileUrl,
} from "@/lib/authors";
import { getArticlesByAuthor, toCardData, type ArticleLocale } from "@/lib/blog";
import {
  authorProfileJsonLd,
  breadcrumbJsonLd,
  normalizeMetaDescription,
  normalizeTitle,
  SITE_URL,
} from "@/lib/seo";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 3600;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    Object.keys(AUTHORS).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const author = getAuthor(slug);
  if (!author) return {};
  const loc: ArticleLocale = locale === "en" ? "en" : "ar";
  const isEn = loc === "en";
  const name = authorName(author, loc);
  const role = authorRole(author, loc);
  const title = normalizeTitle(isEn ? `${name} — Author Profile` : `${name} — صفحة الكاتب`);
  const description = normalizeMetaDescription(
    isEn
      ? `${name} (${role}) — profile, credentials, and published articles on Maqalat.`
      : `${name} (${role}) — بيو ومؤهّلات وقائمة مقالاته المنشورة على مقالات.`,
  );
  const canonical = authorProfileUrl(author.slug, loc);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ar: authorProfileUrl(author.slug, "ar"),
        en: authorProfileUrl(author.slug, "en"),
        "x-default": authorProfileUrl(author.slug, "ar"),
      },
    },
    openGraph: {
      type: "profile",
      locale: isEn ? "en_US" : "ar_SA",
      url: canonical,
      title,
      description,
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const author = getAuthor(slug);
  if (!author) notFound();
  const loc: ArticleLocale = locale === "en" ? "en" : "ar";
  const t = await getTranslations({ locale, namespace: "author" });
  const tArticle = await getTranslations({ locale, namespace: "article" });

  const name = authorName(author, loc);
  const role = authorRole(author, loc);
  const bio = authorBio(author, loc);
  const articles = getArticlesByAuthor(author.slug, loc).map(toCardData);

  return (
    <>
      <JsonLd data={authorProfileJsonLd(author, loc)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tArticle("breadcrumbHome"), url: loc === "ar" ? "/" : `/${loc}` },
          { name: t("breadcrumb") },
          { name },
        ])}
      />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-700">
            {tArticle("breadcrumbHome")}
          </Link>
          <span>/</span>
          <span className="text-slate-700">{t("breadcrumb")}</span>
          <span>/</span>
          <span className="text-slate-700 line-clamp-1">{name}</span>
        </nav>

        <header className="mb-10 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                {name}
              </h1>
              {role && (
                <p className="mt-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  {role}
                </p>
              )}
              <p className="mt-2 text-sm text-slate-500">
                {t("publishedCount", { count: articles.length })}
              </p>
            </div>
          </div>

          {bio && (
            <p className="mt-6 text-slate-700 dark:text-slate-300 leading-relaxed">
              {bio}
            </p>
          )}

          {(author.sameAs?.length || author.email) && (
            <div className="mt-6">
              <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                {t("sameAsLabel")}
              </h2>
              <ul className="flex flex-wrap gap-3 text-sm">
                {author.email && (
                  <li>
                    <a
                      href={`mailto:${author.email}`}
                      className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {author.email}
                    </a>
                  </li>
                )}
                {author.sameAs?.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {new URL(url).hostname.replace(/^www\./, "")}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        <section className="mb-12 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-3">
            <ShieldCheck className="w-5 h-5" />
            {t("standardsTitle")}
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-5">
            {t("standardsIntro")}
          </p>
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {t("standardSourcesLabel")}
              </dt>
              <dd className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t("standardSourcesBody")}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {t("standardYmylLabel")}
              </dt>
              <dd className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t("standardYmylBody")}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {t("standardHonestyLabel")}
              </dt>
              <dd className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t("standardHonestyBody")}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {t("standardCorrectionsLabel")}
              </dt>
              <dd className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t("standardCorrectionsBody")}
              </dd>
            </div>
          </dl>
          <Link
            href="/editorial-policy"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            {t("standardsSeePolicy")} →
          </Link>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            {t("articlesTitle", { name })}
          </h2>
          {articles.length === 0 ? (
            <p className="text-slate-500">{t("empty")}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {articles.map((a) => (
                <ArticleCard key={`${a.slug}-${a.locale}`} article={a} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
