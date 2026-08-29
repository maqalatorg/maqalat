import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { FeaturedArticle } from "@/components/FeaturedArticle";
import { CategoryChips } from "@/components/CategoryChips";
import { getAllArticles } from "@/lib/blog";
import { ENABLED_CLUSTERS } from "@/lib/clusters";

export default function HomePage() {
  const all = getAllArticles();
  const [featured, ...rest] = all;

  return (
    <div>
      {/* ─── Editorial masthead ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-10 sm:pt-14">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 mb-3">
            Maqalat · مقالات
          </div>
          <h1
            className="font-display text-2xl sm:text-3xl font-normal text-slate-700 dark:text-slate-300 leading-relaxed"
            style={{ letterSpacing: "-0.005em" }}
          >
            مقالات مرجعية، بمصادر رسمية، بلا فبركة —
            <br className="hidden sm:block" />
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              للقارئ العربي الذي يستحقّ الأفضل.
            </span>
          </h1>
        </div>

        {/* Category chips */}
        <div className="mt-8 flex justify-center">
          <CategoryChips />
        </div>
      </section>

      {/* ─── Featured article ─────────────────────────────────────────── */}
      {featured && (
        <section className="max-w-6xl mx-auto px-4 mt-14 pb-14 border-b border-slate-200 dark:border-slate-800">
          <FeaturedArticle article={featured} />
        </section>
      )}

      {/* ─── Latest articles grid ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 mt-14 pb-16">
        <div className="flex items-baseline justify-between mb-10">
          <h2
            className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100"
            style={{ letterSpacing: "-0.01em" }}
          >
            المقالات
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {all.length} {all.length === 1 ? "مقال" : "مقالات"}
          </div>
        </div>

        {rest.length === 0 && all.length <= 1 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            <p className="text-lg">جاري تحضير المزيد من المقالات — قريباً بإذن الله.</p>
          </div>
        ) : (
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Sections index ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-20 border-t border-slate-200 dark:border-slate-800 pt-14">
        <h2
          className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100 mb-10"
          style={{ letterSpacing: "-0.01em" }}
        >
          الأقسام
        </h2>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {ENABLED_CLUSTERS.map((c, i) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              className="group border-t border-slate-200 dark:border-slate-800 pt-5"
            >
              <div className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-2">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3
                className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors mb-2"
                style={{ letterSpacing: "-0.005em" }}
              >
                {c.titleAr}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {c.descriptionAr}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-800 dark:text-emerald-400 font-medium">
                تصفّح <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
