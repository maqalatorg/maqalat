import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/blog";
import { ENABLED_CLUSTERS } from "@/lib/clusters";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: now, priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: now, priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: now, priority: 0.4 },
    { url: `${SITE_URL}/editorial-policy`, lastModified: now, priority: 0.4 },
  ];

  const clusterPages: MetadataRoute.Sitemap = ENABLED_CLUSTERS.map((c) => ({
    url: `${SITE_URL}/c/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

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
