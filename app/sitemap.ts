import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/blog";
import { ENABLED_CLUSTERS } from "@/lib/clusters";
import { SITE_URL } from "@/lib/seo";

/**
 * Sitemap strategy:
 * - Static pages (about, contact, /tools, legal) and cluster pages exist in
 *   both Arabic (canonical, no prefix) and English (/en/*). Emit one URL per
 *   locale with hreflang alternates so Google can pick the right version.
 * - Articles are currently Arabic-only (10 articles). English pages 404 until
 *   Phase 2 content lands, so we don't emit /en/{slug} URLs yet.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const arPaths = ["/", "/about", "/privacy", "/terms", "/contact", "/editorial-policy", "/tools"];

  const staticPages: MetadataRoute.Sitemap = arPaths.flatMap((path) => {
    const arUrl = `${SITE_URL}${path === "/" ? "" : path}`.replace(/\/$/, "") || SITE_URL;
    const enUrl = `${SITE_URL}/en${path === "/" ? "" : path}`.replace(/\/$/, "");
    const alternates = {
      languages: { ar: arUrl, en: enUrl, "x-default": arUrl },
    };
    const priority = path === "/" ? 1.0 : path === "/tools" ? 0.7 : 0.4;
    return [
      { url: arUrl, lastModified: now, priority, alternates },
      { url: enUrl, lastModified: now, priority: priority * 0.7, alternates },
    ];
  });

  const clusterPages: MetadataRoute.Sitemap = ENABLED_CLUSTERS.flatMap((c) => {
    const arUrl = `${SITE_URL}/c/${c.slug}`;
    const enUrl = `${SITE_URL}/en/c/${c.slug}`;
    const alternates = { languages: { ar: arUrl, en: enUrl, "x-default": arUrl } };
    return [
      { url: arUrl, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8, alternates },
      { url: enUrl, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5, alternates },
    ];
  });

  // Articles: Arabic only for now. When EN articles land, add /en/{slug} + alternates.
  const articlePages: MetadataRoute.Sitemap = getAllArticles().map((a) => ({
    url: `${SITE_URL}/${a.slug}`,
    lastModified: a.frontmatter.updatedAt
      ? new Date(a.frontmatter.updatedAt)
      : new Date(a.frontmatter.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...clusterPages, ...articlePages];
}
