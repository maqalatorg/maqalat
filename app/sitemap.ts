import type { MetadataRoute } from "next";
import {
  getAllSlugs,
  getArticle,
  hasArabicVersion,
  hasEnglishVersion,
} from "@/lib/blog";
import { ENABLED_CLUSTERS } from "@/lib/clusters";
import { SITE_URL } from "@/lib/seo";

/**
 * Bilingual sitemap:
 * - Static/cluster pages: emit AR + EN URLs with hreflang alternates (both languages exist for all UI pages).
 * - Articles: emit only where the language file actually exists. Sibling naming
 *   convention: {slug}.mdx (AR) + {slug}.en.mdx (EN). hreflang alternates
 *   reference both when both exist.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = ["/", "/about", "/privacy", "/terms", "/contact", "/editorial-policy", "/methodology", "/tools"];

  const staticPages: MetadataRoute.Sitemap = staticPaths.flatMap((p) => {
    const arUrl = p === "/" ? SITE_URL : `${SITE_URL}${p}`;
    const enUrl = p === "/" ? `${SITE_URL}/en` : `${SITE_URL}/en${p}`;
    const alternates = {
      languages: { ar: arUrl, en: enUrl, "x-default": arUrl },
    };
    const priority = p === "/" ? 1.0 : p === "/tools" ? 0.7 : 0.4;
    return [
      { url: arUrl, lastModified: now, priority, alternates },
      { url: enUrl, lastModified: now, priority: priority * 0.9, alternates },
    ];
  });

  const clusterPages: MetadataRoute.Sitemap = ENABLED_CLUSTERS.flatMap((c) => {
    const arUrl = `${SITE_URL}/c/${c.slug}`;
    const enUrl = `${SITE_URL}/en/c/${c.slug}`;
    const alternates = { languages: { ar: arUrl, en: enUrl, "x-default": arUrl } };
    return [
      { url: arUrl, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8, alternates },
      { url: enUrl, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7, alternates },
    ];
  });

  const articlePages: MetadataRoute.Sitemap = [];
  for (const slug of getAllSlugs()) {
    const hasAr = hasArabicVersion(slug);
    const hasEn = hasEnglishVersion(slug);

    const languages: Record<string, string> = {};
    if (hasAr) languages.ar = `${SITE_URL}/${slug}`;
    if (hasEn) languages.en = `${SITE_URL}/en/${slug}`;
    languages["x-default"] = languages.ar || languages.en;
    const alternates = { languages };

    if (hasAr) {
      const article = getArticle(slug, "ar");
      if (article) {
        articlePages.push({
          url: `${SITE_URL}/${slug}`,
          lastModified: article.frontmatter.updatedAt
            ? new Date(article.frontmatter.updatedAt)
            : new Date(article.frontmatter.publishedAt),
          changeFrequency: "monthly",
          priority: 0.7,
          alternates,
        });
      }
    }

    if (hasEn) {
      const article = getArticle(slug, "en");
      if (article) {
        articlePages.push({
          url: `${SITE_URL}/en/${slug}`,
          lastModified: article.frontmatter.updatedAt
            ? new Date(article.frontmatter.updatedAt)
            : new Date(article.frontmatter.publishedAt),
          changeFrequency: "monthly",
          priority: 0.7,
          alternates,
        });
      }
    }
  }

  return [...staticPages, ...clusterPages, ...articlePages];
}
