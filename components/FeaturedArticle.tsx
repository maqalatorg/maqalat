import Link from "next/link";
import { Clock, Calendar, ArrowLeft, Sparkles } from "lucide-react";
import type { Article } from "@/lib/blog";
import { findCluster } from "@/lib/clusters";
import { ClusterIcon } from "./ClusterIcon";

/**
 * Featured article — magazine-style hero with iconic cover, no emojis.
 */
export function FeaturedArticle({ article }: { article: Article }) {
  const cluster = findCluster(article.frontmatter.cluster);
  const date = new Date(article.frontmatter.publishedAt).toLocaleDateString(
    "ar-SA-u-nu-latn",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <Link href={`/${article.slug}`} className="card group block overflow-hidden">
      <div className="grid md:grid-cols-[1fr_1.2fr] items-stretch">
        {/* Left: emerald cover with lucide icon anchor + subtle pattern */}
        <div className="relative min-h-[220px] md:min-h-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 grid place-items-center overflow-hidden">
          {/* Decorative concentric rings */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-6 rounded-full border border-white/40" />
            <div className="absolute inset-14 rounded-full border border-white/30" />
            <div className="absolute inset-24 rounded-full border border-white/20" />
          </div>
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 45%)"
          }} />
          {cluster && (
            <div className="relative text-white/95 drop-shadow-2xl">
              <ClusterIcon name={cluster.icon} className="w-28 h-28 md:w-36 md:h-36" strokeWidth={1.25} />
            </div>
          )}
          <div className="absolute top-4 start-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-medium border border-white/30">
            <Sparkles className="w-3.5 h-3.5" />
            المقال المميّز
          </div>
        </div>

        {/* Right: content */}
        <div className="p-6 sm:p-8 flex flex-col">
          {cluster && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-medium">
                <ClusterIcon name={cluster.icon} className="w-3.5 h-3.5" strokeWidth={2} />
                {cluster.titleAr}
              </span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors leading-tight">
            {article.frontmatter.title}
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 sm:line-clamp-4">
            {article.frontmatter.description}
          </p>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {date}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {article.readingMinutes} دقيقة
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 group-hover:gap-2.5 transition-all">
              اقرأ <ArrowLeft className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
