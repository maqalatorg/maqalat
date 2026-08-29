import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/blog";
import { findCluster } from "@/lib/clusters";

/**
 * Editorial article card — typography-first, no shadow chrome.
 * Divider-based layout keeps grid quiet and readable.
 */
export function ArticleCard({ article }: { article: Article }) {
  const cluster = findCluster(article.frontmatter.cluster);
  const date = new Date(article.frontmatter.publishedAt).toLocaleDateString(
    "ar-SA-u-nu-latn",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <Link
      href={`/${article.slug}`}
      className="group block border-t border-slate-200 dark:border-slate-800 pt-6 pb-2 first:border-t-0 first:pt-0"
    >
      {/* Kicker: cluster name — small, uppercase, editorial */}
      {cluster && (
        <div className="text-[11px] uppercase tracking-widest text-emerald-800 dark:text-emerald-400 mb-3">
          {cluster.titleAr}
        </div>
      )}

      {/* Title */}
      <h3
        className="font-display text-xl sm:text-2xl leading-snug font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors"
        style={{ letterSpacing: "-0.005em" }}
      >
        {article.frontmatter.title}
      </h3>

      {/* Excerpt */}
      <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
        {article.frontmatter.description}
      </p>

      {/* Meta line */}
      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
        <span>{date}</span>
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" /> {article.readingMinutes} د
        </span>
      </div>
    </Link>
  );
}
