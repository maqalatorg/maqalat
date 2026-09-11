export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maqalat.org";
export const SITE_NAME_AR = "مقالات";
export const SITE_NAME_EN = "Maqalat";
export const SITE_TAGLINE_AR = "مرجعك الحديث لكل ما تحتاج معرفته";
export const SITE_TAGLINE_EN = "Your Modern Reference for Everything You Need to Know";
export const DEFAULT_OG = "/og-default.png";
export const AUTHOR = "مقالات";
export const CONTACT_EMAIL = "maqalatorg@gmail.com";

import { getAuthor, authorName, authorRole, authorBio, authorProfileUrl, type Author } from "./authors";

/**
 * SEO metadata length guardrails (bytes-agnostic, char-counted).
 * Google truncates ~55-60 for titles and ~155-160 for descriptions.
 * We reserve TITLE_SUFFIX_RESERVE chars for the site-name suffix
 * appended by the root layout template `%s | Maqalat/مقالات`.
 */
export const TITLE_MAX = 60;
export const TITLE_SUFFIX_RESERVE = 12; // " | مقالات" ~= 10, buffer 2
export const DESC_MIN = 120;
export const DESC_MAX = 155;

/**
 * Truncate on a word boundary, adding an ellipsis when we actually cut.
 * Never returns a string longer than `max` characters.
 */
export function seoTruncate(s: string, max: number): string {
  if (!s) return s;
  if (s.length <= max) return s;
  const window = s.slice(0, max - 1);
  const lastSpace = Math.max(
    window.lastIndexOf(" "),
    window.lastIndexOf("، "),
    window.lastIndexOf("، "),
    window.lastIndexOf("."),
    window.lastIndexOf("،"),
  );
  const cut = lastSpace > max * 0.6 ? window.slice(0, lastSpace) : window;
  return `${cut.trimEnd()}…`;
}

/**
 * Ensure a meta description falls within Google's healthy window.
 * If too long → truncate on a word boundary.
 * If too short → append the title context so search snippets have body.
 */
export function normalizeMetaDescription(desc: string, titleCtx?: string): string {
  const d = (desc || "").trim();
  if (d.length > DESC_MAX) return seoTruncate(d, DESC_MAX);
  if (d.length >= DESC_MIN) return d;
  if (!titleCtx) return d;
  // Extend by appending a natural continuation with the title context.
  const separator = d.endsWith(".") || d.endsWith("،") || d.endsWith("؟") ? " " : " — ";
  const extended = `${d}${separator}${titleCtx.trim()}`;
  return extended.length > DESC_MAX ? seoTruncate(extended, DESC_MAX) : extended;
}

/**
 * Prepare the page title so that after Next.js appends the site suffix
 * (` | مقالات`) we still fit under TITLE_MAX.
 */
export function normalizeTitle(title: string): string {
  const t = (title || "").trim();
  const budget = TITLE_MAX - TITLE_SUFFIX_RESERVE;
  return t.length <= budget ? t : seoTruncate(t, budget);
}

/**
 * Build a complete Metadata object for a static page (about, contact, etc.)
 * with:
 *   - canonical URL matching the current path
 *   - og:url === canonical (fixes Ahrefs "Open Graph URL not matching canonical")
 *   - complete OG (siteName, type, locale, image w/ dimensions + alt)
 *   - twitter card
 *   - hreflang alternates for both locales
 * Both ar and en static pages exist for every path in this set, so we
 * always emit ar + en + x-default.
 */
export function staticPageMetadata(opts: {
  locale: "ar" | "en";
  path: string; // e.g. "/about"  (no locale prefix)
  title: string;
  description: string;
}) {
  const { locale, path, title, description } = opts;
  const isEn = locale === "en";
  const arUrl = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const enUrl = path === "/" ? `${SITE_URL}/en` : `${SITE_URL}/en${path}`;
  const canonicalUrl = isEn ? enUrl : arUrl;
  const siteName = isEn ? SITE_NAME_EN : SITE_NAME_AR;
  const seoTitle = normalizeTitle(title);
  const seoDescription = normalizeMetaDescription(description);
  const coverUrl = `${SITE_URL}${DEFAULT_OG}`;
  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: { ar: arUrl, en: enUrl, "x-default": arUrl },
    },
    openGraph: {
      type: "website" as const,
      locale: isEn ? "en_US" : "ar_SA",
      siteName,
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      images: [{ url: coverUrl, width: 1200, height: 630, alt: seoTitle }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: seoTitle,
      description: seoDescription,
      images: [coverUrl],
    },
  };
}

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

function authorEntityForArticle(a: Author, loc: "ar" | "en") {
  const schemaType = a.kind === "team" ? "Organization" : "Person";
  const anchor = a.kind === "team" ? "org" : "person";
  const url = authorProfileUrl(a.slug, loc);
  const base = {
    "@type": schemaType,
    "@id": `${url}#${anchor}`,
    name: authorName(a, loc),
    url,
    ...(a.image ? { image: `${SITE_URL}${a.image}` } : {}),
    ...(a.email ? { email: a.email } : {}),
    ...(a.sameAs && a.sameAs.length ? { sameAs: a.sameAs } : {}),
  };
  const role = authorRole(a, loc);
  return a.kind === "team"
    ? {
        ...base,
        ...(role ? { description: role } : {}),
        parentOrganization: { "@id": `${SITE_URL}#org` },
      }
    : {
        ...base,
        ...(role ? { jobTitle: role } : {}),
        worksFor: { "@id": `${SITE_URL}#org` },
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
  authorSlug?: string;
  reviewedBySlug?: string;
  locale?: "ar" | "en";
  keywords?: string[];
  wordCount?: number;
}) {
  const loc = opts.locale ?? "ar";
  const path = loc === "ar" ? `/${opts.slug}` : `/${loc}/${opts.slug}`;
  const org = publisherEntity();
  const person = opts.authorSlug ? getAuthor(opts.authorSlug) : null;
  const reviewer = opts.reviewedBySlug ? getAuthor(opts.reviewedBySlug) : null;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title.slice(0, 110),
    description: opts.description,
    image: opts.cover ? [`${SITE_URL}${opts.cover}`] : [`${SITE_URL}${DEFAULT_OG}`],
    datePublished: opts.publishedAt,
    dateModified: opts.updatedAt || opts.publishedAt,
    inLanguage: loc === "en" ? "en" : "ar-SA",
    author: person
      ? authorEntityForArticle(person, loc)
      : {
          "@type": "Organization",
          "@id": `${SITE_URL}#org`,
          name: opts.author || AUTHOR,
          url: SITE_URL,
        },
    ...(reviewer ? { reviewedBy: authorEntityForArticle(reviewer, loc) } : {}),
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

/** ProfilePage + Person/Organization JSON-LD for /author/[slug]. */
export function authorProfileJsonLd(a: Author, loc: "ar" | "en" = "ar") {
  const url = authorProfileUrl(a.slug, loc);
  const anchor = a.kind === "team" ? "org" : "person";
  const entityType = a.kind === "team" ? "Organization" : "Person";
  const role = authorRole(a, loc);
  const bio = authorBio(a, loc);
  const roleField = a.kind === "team" ? "description" : "jobTitle";
  const entity: Record<string, unknown> = {
    "@type": entityType,
    "@id": `${url}#${anchor}`,
    name: authorName(a, loc),
    url,
    ...(a.image ? { image: `${SITE_URL}${a.image}` } : {}),
    ...(a.email ? { email: a.email } : {}),
    ...(a.sameAs && a.sameAs.length ? { sameAs: a.sameAs } : {}),
  };
  if (role) entity[roleField] = role;
  if (bio) entity.description = bio;
  entity[a.kind === "team" ? "parentOrganization" : "worksFor"] = { "@id": `${SITE_URL}#org` };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${url}#page`,
        url,
        inLanguage: loc === "en" ? "en" : "ar-SA",
        mainEntity: { "@id": `${url}#${anchor}` },
        isPartOf: { "@id": `${SITE_URL}#site` },
      },
      entity,
    ],
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
