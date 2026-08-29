export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maqalat.org";
export const SITE_NAME_AR = "مقالات";
export const SITE_NAME_EN = "Maqalat";
export const SITE_TAGLINE_AR = "مرجعك الحديث لكل ما تحتاج معرفته";
export const SITE_TAGLINE_EN = "Your Modern Reference for Everything You Need to Know";
export const DEFAULT_OG = "/og-default.png";
export const AUTHOR = "فريق مقالات";

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

/** Generate JSON-LD for a blog post (Article schema). */
export function articleJsonLd(opts: {
  title: string;
  description: string;
  slug: string;
  cover?: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    image: opts.cover ? `${SITE_URL}${opts.cover}` : `${SITE_URL}${DEFAULT_OG}`,
    datePublished: opts.publishedAt,
    dateModified: opts.updatedAt || opts.publishedAt,
    author: { "@type": "Organization", name: opts.author || AUTHOR },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME_AR,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${opts.slug}`,
    },
  };
}

/** JSON-LD for the site itself (Organization + WebSite). */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}#org`,
        name: SITE_NAME_AR,
        alternateName: SITE_NAME_EN,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
      },
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
