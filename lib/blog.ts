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
  authorSlug?: string;
  authorRole?: string;
  reviewedBySlug?: string;
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

/**
 * Same shape as Article, minus the (potentially large) MDX body.
 * Use for lists / cards / homepage grids so we don't serialize the
 * full body into every RSC payload — 3 related articles alone were
 * adding ~90KB to each article HTML.
 */
export type ArticleSummary = Omit<Article, "content">;

/** Strip the `content` field from an Article for use in cards / lists. */
export function toSummary(a: Article): ArticleSummary {
  const { content: _unused, ...rest } = a;
  void _unused;
  return rest;
}

/**
 * Minimal shape needed to render an ArticleCard / FeaturedArticle.
 * Drops frontmatter fields the card never reads (faq, tags, cover,
 * updatedAt, author, draft) — on a big cluster page (178 AI articles)
 * that trims ~250KB of unused JSON out of the RSC-serialized HTML.
 */
export type ArticleCardData = {
  slug: string;
  locale: ArticleLocale;
  readingMinutes: number;
  frontmatter: Pick<
    ArticleFrontmatter,
    "title" | "description" | "cluster" | "publishedAt"
  >;
};

export function toCardData(a: Article): ArticleCardData {
  return {
    slug: a.slug,
    locale: a.locale,
    readingMinutes: a.readingMinutes,
    frontmatter: {
      title: a.frontmatter.title,
      description: a.frontmatter.description,
      cluster: a.frontmatter.cluster,
      publishedAt: a.frontmatter.publishedAt,
    },
  };
}

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

export function getArticlesByAuthor(authorSlug: string, locale: ArticleLocale = "ar"): Article[] {
  return getAllArticles(locale).filter((a) => a.frontmatter.authorSlug === authorSlug);
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
 * Deterministic string hash → non-negative integer.
 * Used to rotate cross-cluster picks per article so that tail-of-list
 * articles receive incoming dofollow links instead of always the newest
 * ones being surfaced.
 */
function hashSlug(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Get related articles for a given article — restricted to the same locale.
 *
 * Selection strategy:
 *   half: same-cluster newest-first (topical relevance)
 *   half: cross-cluster, rotated by hash(currentSlug) so different articles
 *         surface different siblings. Without this rotation, the newest
 *         cross-cluster articles get all the inlinks and older articles
 *         end up with just one incoming link — exactly the pattern Ahrefs
 *         flags as "Page has only one dofollow incoming internal link".
 */
export function getRelatedArticles(article: Article, count = 6): Article[] {
  const all = getAllArticles(article.locale);
  const sameCluster = all.filter(
    (a) => a.frontmatter.cluster === article.frontmatter.cluster && a.slug !== article.slug,
  );
  const others = all.filter(
    (a) => a.frontmatter.cluster !== article.frontmatter.cluster,
  );

  const sameQuota = Math.min(sameCluster.length, Math.ceil(count / 2));
  const crossQuota = count - sameQuota;

  // Deterministic stride sampling. Every article in a pool is picked
  // exactly `quota` times across the site — perfect internal-link
  // distribution. Without this, a big cluster like AI (178 articles)
  // leaves 170+ older siblings with zero same-cluster inlinks, which
  // Ahrefs flags as "only one dofollow incoming internal link".
  //
  // For pool of size N, stride = floor(N / (quota+1)) guarantees the
  // `quota` picks land on distinct positions and every target position
  // is reached by exactly `quota` sources.
  const hash = hashSlug(article.slug);
  const myIdxIn = (pool: Article[]) =>
    pool.findIndex((a) => a.slug === article.slug);
  const strideSample = (
    fullPool: Article[],
    excludeSelf: boolean,
    n: number,
  ): Article[] => {
    const N = fullPool.length;
    if (N === 0 || n === 0) return [];
    if (N <= n + (excludeSelf ? 1 : 0)) {
      return excludeSelf ? fullPool.filter((a) => a.slug !== article.slug) : fullPool;
    }
    // Anchor per-article: use current article's index if it's in the pool,
    // otherwise use hash-mod so different source articles pick different
    // windows of the cross-cluster pool (uniform inlink distribution).
    const anchorIdx = excludeSelf ? Math.max(0, myIdxIn(fullPool)) : hash % N;
    const step = Math.max(1, Math.floor(N / (n + (excludeSelf ? 1 : 0))));
    const picks: Article[] = [];
    for (let k = 1; k <= n; k++) {
      const j = (anchorIdx + step * k) % N;
      picks.push(fullPool[j]);
    }
    return picks;
  };

  // For sameCluster we anchor to the current article's position in the
  // full cluster list (before filtering out self) so strides walk a
  // ring past the current article.
  const sameFull = all.filter(
    (a) => a.frontmatter.cluster === article.frontmatter.cluster,
  );
  return [
    ...strideSample(sameFull, true, sameQuota),
    ...strideSample(others, false, crossQuota),
  ];
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
