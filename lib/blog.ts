import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

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
  content: string;
  frontmatter: ArticleFrontmatter;
  readingMinutes: number;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "articles");

/** Read a single article by slug. Returns null if not found or draft in prod. */
export function getArticle(slug: string): Article | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as ArticleFrontmatter;

  // Hide drafts in production; show in dev for preview.
  if (fm.draft && process.env.NODE_ENV === "production") return null;

  return {
    slug,
    content,
    frontmatter: fm,
    readingMinutes: Math.ceil(readingTime(content).minutes),
  };
}

/** List all published articles, newest first. */
export function getAllArticles(): Article[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((f) => getArticle(f.replace(/\.mdx$/, "")))
    .filter((a): a is Article => a !== null)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.publishedAt).getTime() -
        new Date(a.frontmatter.publishedAt).getTime(),
    );
}

/** List articles in a given cluster. */
export function getArticlesByCluster(clusterSlug: string): Article[] {
  return getAllArticles().filter((a) => a.frontmatter.cluster === clusterSlug);
}

/**
 * Get related articles for a given article.
 * Priority:
 *   1. Same cluster, excluding self
 *   2. If < 4 in same cluster, top up with newest from other clusters
 * Never returns fewer than the requested count if the site has enough articles.
 * (Fix for the Top-6 orphan trap from DealPulse.)
 */
export function getRelatedArticles(article: Article, count = 4): Article[] {
  const all = getAllArticles();
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

/** Search index — includes full-text body so search matches article content. */
export function getSearchIndex() {
  return getAllArticles().map((a) => {
    const body = stripMdx(a.content);
    return {
      slug: a.slug,
      title: a.frontmatter.title,
      description: a.frontmatter.description,
      cluster: a.frontmatter.cluster,
      tags: a.frontmatter.tags || [],
      // First 2000 chars of body — enough for keyword matching, small enough to ship
      excerpt: body.slice(0, 2000),
    };
  });
}
