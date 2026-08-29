import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";
import type { Article } from "@/lib/blog";
import { findCluster } from "@/lib/clusters";

/**
 * Editorial-style featured article — magazine hero for the newest post.
 * Focus: typography, breathing room, invites clicking to read.
 */
export function FeaturedArticle({ article }: { article: Article }) {
  const cluster = findCluster(article.frontmatter.cluster);
  const date = new Date(article.frontmatter.publishedAt).toLocaleDateString(
    "ar-SA-u-nu-latn",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <Link href={`/${article.slug}`} className="block group">
      <article className="relative overflow-hidden">
        {/* Editorial label above */}
        <div className="flex items-center gap-3 mb-6 text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
          <span className="w-8 h-px bg-emerald-700 dark:bg-emerald-500" />
          <span>المقال المميّز</span>
        </div>

        {/* Body */}
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] items-start">
          {/* Left: title + excerpt */}
          <div>
            <h1
              className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.15] font-bold text-slate-900 dark:text-slate-50 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors"
              style={{ letterSpacing: "-0.01em" }}
            >
              {article.frontmatter.title}
            </h1>
            <p className="mt-5 text-lg sm:text-xl leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
              {article.frontmatter.description}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <span>اقرأ المقال</span>
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </div>
          </div>

          {/* Right: meta panel */}
          <aside className="text-sm text-slate-600 dark:text-slate-400 space-y-4 md:border-s md:border-slate-200 dark:md:border-slate-800 md:ps-8">
            {cluster && (
              <div>
                <div className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  القسم
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {cluster.titleAr}
                </div>
              </div>
            )}
            <div>
              <div className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                نُشر
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{date}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                مدّة القراءة
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {article.readingMinutes} دقيقة
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                الكاتب
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {article.frontmatter.author || "فريق مقالات"}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </Link>
  );
}
