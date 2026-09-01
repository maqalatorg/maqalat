import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type ArticleLocale = "ar" | "en";

export type ArticleFrontmatter = {
  title: string;
  description: string;
  cluster: string;
  publishedAt: string; // ISO date
  updatedAt?: string; // ISO date
  cover?: string;
  author?: string;
  tags?: string[];
  faq?: { q: string; a: string }[];
  draft?: boolean;
};

export type Article = {
  slug: string;
  locale: ArticleLocale;
  content: string;
  frontmatter: ArticleFrontmatter;
  readingMinutes: number;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "articles");

/**
 * File-naming convention (sibling files):
 *   content/articles/{slug}.mdx      → Arabic (default)
 *   content/articles/{slug}.en.mdx   → English version of same slug
 *
 * URL structure:
 *   /                            → AR default
 *   /{slug}                      → AR article
 *   /en/{slug}                   → EN article (only if the .en.mdx exists)
 */

function filePathFor(slug: string, locale: ArticleLocale): string {
  const suffix = locale === "en" ? ".en.mdx" : ".mdx";
  return path.join(CONTENT_DIR, `${slug}${suffix}`);
}

/** Read a single article by slug + locale. Returns null if file missing or draft in prod. */
export function getArticle(slug: string, locale: ArticleLocale = "ar"): Article | null {
  const filePath = filePathFor(slug, locale);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as ArticleFrontmatter;

  if (fm.draft && process.env.NODE_ENV === "production") return null;

  return {
    slug,
    locale,
    content,
    frontmatter: fm,
    readingMinutes: Math.ceil(readingTime(content).minutes),
  };
}

/** True if an English version of this slug exists on disk. */
export function hasEnglishVersion(slug: string): boolean {
  return fs.existsSync(filePathFor(slug, "en"));
}

/** True if an Arabic version of this slug exists on disk. */
export function hasArabicVersion(slug: string): boolean {
  return fs.existsSync(filePathFor(slug, "ar"));
}

/** List all published articles for a given locale, newest first. */
export function getAllArticles(locale: ArticleLocale = "ar"): Article[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const suffix = locale === "en" ? ".en.mdx" : ".mdx";
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => {
      if (locale === "en") return f.endsWith(".en.mdx");
      // AR: any .mdx that isn't a .en.mdx sibling
      return f.endsWith(".mdx") && !f.endsWith(".en.mdx");
    });
  return files
    .map((f) => {
      const slug = f.replace(new RegExp(`\\${suffix}$`), "");
      return getArticle(slug, locale);
    })
    .filter((a): a is Article => a !== null)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.publishedAt).getTime() -
        new Date(a.frontmatter.publishedAt).getTime(),
    );
}

/** All slugs that have at least one language version (union of AR + EN). */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  const slugs = new Set<string>();
  for (const f of files) {
    slugs.add(f.replace(/\.en\.mdx$/, "").replace(/\.mdx$/, ""));
  }
  return [...slugs];
}

/** List articles in a given cluster for a specific locale. */
export function getArticlesByCluster(clusterSlug: string, locale: ArticleLocale = "ar"): Article[] {
  return getAllArticles(locale).filter((a) => a.frontmatter.cluster === clusterSlug);
}

/**
 * List popular articles for a locale.
 * Placeholder: currently returns newest first.
 */
export function getPopularArticles(limit?: number, locale: ArticleLocale = "ar"): Article[] {
  const list = getAllArticles(locale);
  return limit ? list.slice(0, limit) : list;
}

/**
 * Get related articles for a given article — restricted to the same locale.
 * Priority: same cluster first, then newest from other clusters.
 */
export function getRelatedArticles(article: Article, count = 4): Article[] {
  const all = getAllArticles(article.locale);
  const sameCluster = all.filter(
    (a) => a.frontmatter.cluster === article.frontmatter.cluster && a.slug !== article.slug,
  );
  const others = all.filter(
    (a) => a.frontmatter.cluster !== article.frontmatter.cluster,
  );
  return [...sameCluster, ...others].slice(0, count);
}

/** Strip MDX/markdown to plain text for full-text search indexing. */
function stripMdx(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, " ") // code blocks
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → text
    .replace(/<[^>]+>/g, " ") // html/jsx tags
    .replace(/[#>*_~|]/g, " ") // md syntax
    .replace(/\s+/g, " ")
    .trim();
}

/** Search index for a locale — includes full-text body so search matches article content. */
export function getSearchIndex(locale: ArticleLocale = "ar") {
  return getAllArticles(locale).map((a) => {
    const body = stripMdx(a.content);
    return {
      slug: a.slug,
      title: a.frontmatter.title,
      description: a.frontmatter.description,
      cluster: a.frontmatter.cluster,
      tags: a.frontmatter.tags || [],
      excerpt: body.slice(0, 2000),
    };
  });
}
