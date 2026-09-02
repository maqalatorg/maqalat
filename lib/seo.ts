export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maqalat.org";
export const SITE_NAME_AR = "مقالات";
export const SITE_NAME_EN = "Maqalat";
export const SITE_TAGLINE_AR = "مرجعك الحديث لكل ما تحتاج معرفته";
export const SITE_TAGLINE_EN = "Your Modern Reference for Everything You Need to Know";
export const DEFAULT_OG = "/og-default.png";
export const AUTHOR = "مقالات";
export const CONTACT_EMAIL = "maqalatorg@gmail.com";

/** Cluster (topic) definitions. Keep in sync with lib/clusters.ts. */
export type ClusterSlug =
  | "calendar"
  | "universities"
  | "health"
  | "finance"
  | "cars"
  | "tutorials"
  | "websites"
  | "fabrics";

/**
 * The publisher entity — used as author on articles when we don't have
 * a named individual expert. This is a publisher-driven E-E-A-T model:
 * the organisation itself carries the credentials, not a fake persona.
 */
function publisherEntity() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}#org`,
    name: SITE_NAME_AR,
    alternateName: SITE_NAME_EN,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    email: CONTACT_EMAIL,
    foundingDate: "2026-08-29",
    knowsAbout: [
      "التقويم الهجري الميلادي",
      "الجامعات السعودية",
      "الصحة العامة",
      "الرواتب والدعم الحكومي",
      "الزكاة والفقه المالي",
    ],
    publishingPrinciples: `${SITE_URL}/editorial-policy`,
    ownershipFundingInfo: `${SITE_URL}/about`,
    diversityPolicy: `${SITE_URL}/editorial-policy`,
    correctionsPolicy: `${SITE_URL}/editorial-policy`,
  };
}

/** Generate JSON-LD for a blog post (Article schema) with strong publisher signals. */
export function articleJsonLd(opts: {
  title: string;
  description: string;
  slug: string;
  cover?: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  locale?: "ar" | "en";
  keywords?: string[];
  wordCount?: number;
}) {
  const loc = opts.locale ?? "ar";
  const path = loc === "ar" ? `/${opts.slug}` : `/${loc}/${opts.slug}`;
  const org = publisherEntity();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title.slice(0, 110),
    description: opts.description,
    image: opts.cover ? [`${SITE_URL}${opts.cover}`] : [`${SITE_URL}${DEFAULT_OG}`],
    datePublished: opts.publishedAt,
    dateModified: opts.updatedAt || opts.publishedAt,
    inLanguage: loc === "en" ? "en" : "ar-SA",
    author: {
      "@type": "Organization",
      "@id": `${SITE_URL}#org`,
      name: opts.author || AUTHOR,
      url: SITE_URL,
    },
    publisher: org,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${path}`,
    },
    isAccessibleForFree: true,
    ...(opts.keywords && opts.keywords.length ? { keywords: opts.keywords.join(", ") } : {}),
    ...(opts.wordCount ? { wordCount: opts.wordCount } : {}),
  };
}

/** JSON-LD for the site itself (Organization + WebSite). */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      publisherEntity(),
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}#site`,
        url: SITE_URL,
        name: SITE_NAME_AR,
        publisher: { "@id": `${SITE_URL}#org` },
        inLanguage: "ar-SA",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/** JSON-LD for a FAQ block. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/**
 * BreadcrumbList JSON-LD.
 * Pass an ordered list of { name, url? } — the last item should omit `url`
 * (it represents the current page).
 */
export function breadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.url ? { item: it.url.startsWith("http") ? it.url : `${SITE_URL}${it.url}` } : {}),
    })),
  };
}

/**
 * HowTo JSON-LD — for articles built around a tool/calculator with clear
 * steps (e.g., zakat calculation, BMI computation, pregnancy dating).
 */
export function howToJsonLd(opts: {
  name: string;
  description: string;
  totalTime?: string; // ISO-8601 duration, e.g. "PT2M"
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    ...(opts.totalTime ? { totalTime: opts.totalTime } : {}),
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
