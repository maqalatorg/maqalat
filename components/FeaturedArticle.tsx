import Link from "next/link";
import { Clock, Calendar, ArrowLeft, Sparkles } from "lucide-react";
import type { Article } from "@/lib/blog";
import { findCluster } from "@/lib/clusters";

/**
 * Featured article — big hero card with gradient cover + title + meta.
 * Draws the eye immediately, gives Maqalat visual richness.
 */
export function FeaturedArticle({ article }: { article: Article }) {
  const cluster = findCluster(article.frontmatter.cluster);
  const date = new Date(article.frontmatter.publishedAt).toLocaleDateString(
    "ar-SA-u-nu-latn",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <Link href={`/${article.slug}`} className="card group block overflow-hidden">
      <div className="grid md:grid-cols-[1fr_1.1fr] items-stretch">
        {/* Left: colorful gradient cover with emoji anchor */}
        <div className="relative min-h-[240px] md:min-h-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 grid place-items-center overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.2) 0%, transparent 50%)"
          }} />
          <div className="relative text-8xl md:text-9xl drop-shadow-2xl select-none opacity-90">
            {cluster?.emoji ?? "📖"}
          </div>
          <div className="absolute top-4 start-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-medium border border-white/30">
            <Sparkles className="w-3.5 h-3.5" />
            المقال المميّز
          </div>
        </div>

        {/* Right: content */}
        <div className="p-6 sm:p-8 flex flex-col">
          {cluster && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-medium">
                {cluster.emoji} {cluster.titleAr}
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
