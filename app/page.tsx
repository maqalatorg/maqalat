import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { FeaturedArticle } from "@/components/FeaturedArticle";
import { getAllArticles } from "@/lib/blog";
import { ENABLED_CLUSTERS } from "@/lib/clusters";

export default function HomePage() {
  const all = getAllArticles();
  const [featured, ...rest] = all;

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* ─── Featured hero (visual + immediate value) ─────────────────── */}
      {featured && (
        <section className="pt-8 sm:pt-10">
          <FeaturedArticle article={featured} />
        </section>
      )}

      {/* ─── Sections (with real cards, DealPulse-inspired but our own) ─ */}
      <section className="pt-14 pb-4">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            الأقسام
          </h2>
          <span className="text-sm text-slate-500">
            {ENABLED_CLUSTERS.length} أقسام نشطة
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENABLED_CLUSTERS.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="card p-6 group">
              <div className="text-4xl mb-3">{c.emoji}</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                {c.titleAr}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                {c.descriptionAr}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400 group-hover:gap-2 transition-all">
                استكشف <ArrowLeft className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Latest articles ──────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="pt-14 pb-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              أحدث المقالات
            </h2>
            <span className="text-sm text-slate-500">
              {all.length} {all.length === 1 ? "مقال" : "مقالات"}
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
