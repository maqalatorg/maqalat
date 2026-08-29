import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import type { Article } from "@/lib/blog";
import { findCluster } from "@/lib/clusters";

/**
 * Article card — DealPulse-style card with shadow, hover lift, emerald tag.
 */
export function ArticleCard({ article }: { article: Article }) {
  const cluster = findCluster(article.frontmatter.cluster);
  const date = new Date(article.frontmatter.publishedAt).toLocaleDateString(
    "ar-SA-u-nu-latn",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <Link href={`/${article.slug}`} className="card p-6 group block h-full flex flex-col">
      {/* Cluster tag */}
      {cluster && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-medium">
            {cluster.emoji} {cluster.titleAr}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors leading-snug line-clamp-2">
        {article.frontmatter.title}
      </h3>

      {/* Excerpt */}
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed flex-1">
        {article.frontmatter.description}
      </p>

      {/* Meta */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> {date}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {article.readingMinutes} د
        </span>
      </div>
    </Link>
  );
}
