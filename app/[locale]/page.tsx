import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { FeaturedArticle } from "@/components/FeaturedArticle";
import { ClusterIcon } from "@/components/ClusterIcon";
import { getAllArticles, getPopularArticles } from "@/lib/blog";
import { ENABLED_CLUSTERS } from "@/lib/clusters";

export default function HomePage() {
  const all = getAllArticles();
  const [featured, ...rest] = all;
  const popular = getPopularArticles(6);

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* ─── Featured hero ────────────────────────────────────────────── */}
      {featured && (
        <section className="pt-8 sm:pt-10">
          <FeaturedArticle article={featured} />
        </section>
      )}

      {/* ─── Most Read ────────────────────────────────────────────────── */}
      {popular.length > 0 && (
        <section id="popular" className="pt-14 scroll-mt-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              الأكثر قراءة
            </h2>
            <span className="text-sm text-slate-500">اختيار المحرّر</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Latest ───────────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section id="latest" className="pt-14 scroll-mt-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              آخر المقالات
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

      {/* ─── Sections ─────────────────────────────────────────────────── */}
      <section id="sections" className="pt-14 pb-16 scroll-mt-20">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            الأقسام
          </h2>
          <span className="text-sm text-slate-500">
            {ENABLED_CLUSTERS.length} {ENABLED_CLUSTERS.length === 1 ? "قسم نشط" : "أقسام نشطة"}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENABLED_CLUSTERS.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="card p-6 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 grid place-items-center mb-4 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <ClusterIcon
                  name={c.icon}
                  className="w-6 h-6 text-emerald-700 dark:text-emerald-400"
                />
              </div>
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
    </div>
  );
}
