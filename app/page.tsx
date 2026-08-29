import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { SmartHero } from "@/components/SmartHero";
import { getAllArticles, getSearchIndex } from "@/lib/blog";
import { ENABLED_CLUSTERS } from "@/lib/clusters";

export default function HomePage() {
  const all = getAllArticles();
  const latest = all.slice(0, 9);
  const searchIndex = getSearchIndex();

  return (
    <div>
      <SmartHero
        stats={{
          articles: all.length,
          clusters: ENABLED_CLUSTERS.length,
          sources: 0,
        }}
        searchIndex={searchIndex}
      />

      {/* Clusters grid */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            تصفّح الأقسام
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENABLED_CLUSTERS.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="card p-6 group">
              <div className="text-3xl mb-3">{c.emoji}</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                {c.titleAr}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {c.descriptionAr}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400 group-hover:gap-2 transition-all">
                استكشف <ArrowLeft className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest articles */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          أحدث المقالات
        </h2>
        {latest.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            المقالات قيد التحضير — أول عنقود قادم قريباً.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
