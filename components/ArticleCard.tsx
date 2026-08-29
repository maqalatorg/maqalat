import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import type { Article } from "@/lib/blog";
import { findCluster } from "@/lib/clusters";

export function ArticleCard({ article }: { article: Article }) {
  const cluster = findCluster(article.frontmatter.cluster);
  const date = new Date(article.frontmatter.publishedAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/${article.slug}`} className="card p-5 group block">
      <div className="flex items-center gap-2 mb-3">
        {cluster && (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-medium">
            {cluster.emoji} {cluster.titleAr}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
        {article.frontmatter.title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
        {article.frontmatter.description}
      </p>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> {date}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {article.readingMinutes} دقيقة قراءة
        </span>
      </div>
    </Link>
  );
}
