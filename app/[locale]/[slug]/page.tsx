import { MDXRemote } from "next-mdx-remote-client/rsc";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, Clock, User } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  getArticle,
  getAllArticles,
  getAllSlugs,
  getRelatedArticles,
  hasArabicVersion,
  hasEnglishVersion,
  type ArticleLocale,
} from "@/lib/blog";
import { findCluster } from "@/lib/clusters";
import {
  articleJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
  howToJsonLd,
  SITE_URL,
} from "@/lib/seo";
import { mdxComponents } from "@/mdx-components";

/**
 * Slugs whose article body embeds an interactive tool — used to emit
 * HowTo schema alongside the Article schema so Google can surface the
 * step-by-step tool in rich results.
 */
const TOOL_HOWTO: Record<string, { name: string; description: string; totalTime: string; steps: { name: string; text: string }[] }> = {
  "zakat-calculator-guide": {
    name: "احسب زكاة مالك",
    description: "خطوات حساب الزكاة الشرعية على النقود والذهب والفضة وعروض التجارة.",
    totalTime: "PT3M",
    steps: [
      { name: "احسب النصاب", text: "احسب قيمة ٨٥ جراماً من الذهب بالسعر الحالي — لو مالك أقل، فلا زكاة." },
      { name: "تحقّق من الحول", text: "تأكّد من مرور سنة قمرية (٣٥٤ يوماً) على بلوغ مالك للنصاب." },
      { name: "أدرج الأصول", text: "اجمع النقد والودائع والذهب والفضة وعروض التجارة والمستحقّات." },
      { name: "اطرح الديون", text: "اطرح الأقساط المستحقّة في السنة الحالية فقط، لا الأقساط طويلة الأمد كاملةً." },
      { name: "احسب ٢٫٥٪", text: "الزكاة = صافي المال × ٢٫٥٪ — هذه القيمة المطلوب إخراجها." },
    ],
  },
  "bmi-calculator-guide": {
    name: "احسب مؤشر كتلة جسمك",
    description: "خطوات حساب BMI وتحديد نطاق الوزن الصحي لطولك.",
    totalTime: "PT1M",
    steps: [
      { name: "قِس طولك بالأمتار", text: "استخدم متراً وقياساً دقيقاً — الطول بالسنتيمتر ÷ ١٠٠ = بالمتر." },
      { name: "قِس وزنك بالكيلوجرام", text: "على ميزان مضبوط في الصباح قبل الفطور بلا ملابس ثقيلة." },
      { name: "طبّق المعادلة", text: "BMI = الوزن ÷ (الطول × الطول) — الأداة تحسبها لك." },
      { name: "قارن مع WHO", text: "تحت ١٨٫٥ نحافة، ١٨٫٥-٢٤٫٩ طبيعي، فوق ٢٥ زيادة وزن." },
    ],
  },
  "pregnancy-calculator-guide": {
    name: "احسبي موعد الولادة",
    description: "احسبي تاريخ الولادة والأسبوع الحالي بقاعدة Naegele مع تصحيح طول الدورة.",
    totalTime: "PT1M",
    steps: [
      { name: "حدّدي تاريخ آخر دورة (LMP)", text: "اليوم الأول من آخر دورة شهرية — لا اليوم الأخير." },
      { name: "أدخلي طول دورتك", text: "المتوسط بين ٢١ و٣٥ يوماً؛ ٢٨ إن كانت منتظمة." },
      { name: "احصلي على تاريخ الولادة", text: "LMP + ٢٨٠ يوماً + تصحيح طول الدورة = التاريخ المتوقّع." },
      { name: "راجعي بالسونار", text: "الفحص في الثلث الأول (٧-١٣ أسبوعاً) يعطي دقّة ±٥ أيام." },
    ],
  },
  "menstrual-cycle-calculator": {
    name: "احسبي دورتك ونافذة الخصوبة",
    description: "توقّع الدورة القادمة، يوم التبويض، ونافذة الخصوبة بحسب طول دورتك.",
    totalTime: "PT1M",
    steps: [
      { name: "أدخلي تاريخ آخر دورة", text: "اليوم الأول من نزول الحيض في آخر دورة." },
      { name: "أدخلي طول دورتك", text: "المتوسط للدورات الثلاث الأخيرة (بين ٢١ و٣٥ يوماً)." },
      { name: "احسبي التبويض", text: "التبويض قبل الدورة القادمة بـ١٤ يوماً — لا بعد الحالية." },
      { name: "حدّدي نافذة الخصوبة", text: "٥ أيام قبل التبويض + يوم التبويض = ٦ أيام إجمالاً." },
    ],
  },
  "saudi-salary-dates-2026-2027": {
    name: "اعرف موعد راتبك",
    description: "احسب موعد راتب الحكومة، المتقاعدين، حساب المواطن، والضمان المطوّر تلقائياً.",
    totalTime: "PT30S",
    steps: [
      { name: "اختر نوع الدفع", text: "من قائمة التصفية اختر: راتب حكومي / متقاعدين / حساب المواطن / الضمان." },
      { name: "اقرأ التاريخ الميلادي", text: "الجدول يعرض التاريخ التالي مع اليوم من الأسبوع." },
      { name: "تحقّق من تعديل نهاية الأسبوع", text: "لو صادف الجمعة يُقدَّم للخميس، ولو صادف السبت يُؤجَّل للأحد." },
    ],
  },
  "hijri-gregorian-converter-2026": {
    name: "حوّل بين الهجري والميلادي",
    description: "أداة تحويل تفاعلية بدقّة تقويم أم القرى المعتمَد.",
    totalTime: "PT10S",
    steps: [
      { name: "اختر التقويم", text: "حدّد اتّجاه التحويل: هجري إلى ميلادي أو العكس." },
      { name: "أدخل التاريخ", text: "اليوم والشهر والسنة في الحقول." },
      { name: "اقرأ النتيجة", text: "التحويل فوري بحسب بيانات أم القرى دون خادم." },
    ],
  },
};
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/config";

import { ArticleCard } from "@/components/ArticleCard";
import { FAQ } from "@/components/FAQ";
import { RatingStars } from "@/components/RatingStars";
import { CommentsSection } from "@/components/CommentsSection";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { JsonLd } from "@/components/JsonLd";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ClusterIcon } from "@/components/ClusterIcon";

// Prevent conflicts with static cluster/legal routes
const RESERVED_SLUGS = new Set([
  "about",
  "privacy",
  "contact",
  "terms",
  "editorial-policy",
  "methodology",
  "tools",
  "search",
  "c",
  "api",
  "sitemap.xml",
  "robots.txt",
  "ads.txt",
]);

export async function generateStaticParams() {
  // Emit (locale, slug) combinations only where the file actually exists.
  // AR articles for /{slug}; EN articles for /en/{slug} — no ghost pages.
  const params: { locale: string; slug: string }[] = [];
  for (const slug of getAllSlugs()) {
    if (hasArabicVersion(slug)) params.push({ locale: "ar", slug });
    if (hasEnglishVersion(slug)) params.push({ locale: "en", slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return {};

  const loc = locale as ArticleLocale;
  const article = getArticle(slug, loc);
  if (!article) return {};

  const fm = article.frontmatter;
  const canonicalPath = loc === "ar" ? `/${slug}` : `/${loc}/${slug}`;

  // Build hreflang alternates for whichever versions actually exist.
  const languages: Record<string, string> = {};
  if (hasArabicVersion(slug)) languages.ar = `${SITE_URL}/${slug}`;
  if (hasEnglishVersion(slug)) languages.en = `${SITE_URL}/en/${slug}`;
  languages["x-default"] = languages.ar || languages.en;

  return {
    title: fm.title,
    description: fm.description,
    openGraph: {
      title: fm.title,
      description: fm.description,
      type: "article",
      locale: loc === "en" ? "en_US" : "ar_SA",
      publishedTime: fm.publishedAt,
      modifiedTime: fm.updatedAt,
      url: `${SITE_URL}${canonicalPath}`,
      images: fm.cover ? [fm.cover] : ["/og-default.png"],
    },
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
      languages,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as (typeof locales)[number])) notFound();
  setRequestLocale(locale);

  if (RESERVED_SLUGS.has(slug)) notFound();

  const loc = locale as ArticleLocale;
  const isEn = loc === "en";
  const article = getArticle(slug, loc);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: "article" });
  const cluster = findCluster(article.frontmatter.cluster);
  const related = getRelatedArticles(article, 3);

  const dateStr = new Date(article.frontmatter.publishedAt).toLocaleDateString(
    isEn ? "en-US" : "ar-SA",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const clusterTitle = isEn ? cluster?.titleEn : cluster?.titleAr;

  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={articleJsonLd({
          title: article.frontmatter.title,
          description: article.frontmatter.description,
          slug,
          cover: article.frontmatter.cover,
          publishedAt: article.frontmatter.publishedAt,
          updatedAt: article.frontmatter.updatedAt,
          author: article.frontmatter.author,
          locale: loc,
          keywords: article.frontmatter.tags,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("breadcrumbHome"), url: loc === "ar" ? "/" : `/${loc}` },
          ...(cluster
            ? [
                {
                  name: (isEn ? cluster.titleEn : cluster.titleAr) || cluster.slug,
                  url: loc === "ar" ? `/c/${cluster.slug}` : `/${loc}/c/${cluster.slug}`,
                },
              ]
            : []),
          { name: article.frontmatter.title },
        ])}
      />
      {article.frontmatter.faq && (
        <JsonLd data={faqJsonLd(article.frontmatter.faq)} />
      )}
      {TOOL_HOWTO[slug] && loc === "ar" && (
        <JsonLd data={howToJsonLd(TOOL_HOWTO[slug])} />
      )}

      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-4 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-700">
            {t("breadcrumbHome")}
          </Link>
          <span>/</span>
          {cluster && (
            <>
              <Link href={`/c/${cluster.slug}`} className="hover:text-emerald-700">
                {clusterTitle}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-700 line-clamp-1">
            {article.frontmatter.title}
          </span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {cluster && (
            <Link
              href={`/c/${cluster.slug}`}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-medium mb-4"
            >
              <ClusterIcon name={cluster.icon} className="w-3.5 h-3.5" strokeWidth={2} />
              {clusterTitle}
            </Link>
          )}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
            {article.frontmatter.title}
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            {article.frontmatter.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-4 h-4" />{" "}
              {article.frontmatter.author || t("authorDefault")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {dateStr}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />{" "}
              {t("readingMinutes", { count: article.readingMinutes })}
            </span>
          </div>
        </header>

        {/* Body */}
        <div className="prose-maqalat">
          <MDXRemote source={article.content} components={mdxComponents} />
        </div>

        {/* Rating */}
        <section className="mt-12 card p-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
            {t("ratingQuestion")}
          </h2>
          <RatingStars slug={slug} />
        </section>

        {/* FAQ */}
        {article.frontmatter.faq && <FAQ items={article.frontmatter.faq} />}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              {t("relatedTitle")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}

        {/* Newsletter */}
        <NewsletterSignup source={`article:${slug}`} />

        {/* Comments */}
        <CommentsSection slug={slug} />
      </article>
    </>
  );
}
