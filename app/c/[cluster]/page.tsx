import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { ClusterIcon } from "@/components/ClusterIcon";
import { getArticlesByCluster } from "@/lib/blog";
import { CLUSTERS, findCluster } from "@/lib/clusters";
import { SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return CLUSTERS.filter((c) => c.enabled).map((c) => ({ cluster: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cluster: string }>;
}): Promise<Metadata> {
  const { cluster: slug } = await params;
  const cluster = findCluster(slug);
  if (!cluster) return {};
  return {
    title: `${cluster.titleAr} — مقالات`,
    description: cluster.descriptionAr,
    alternates: { canonical: `${SITE_URL}/c/${slug}` },
    openGraph: {
      title: `${cluster.titleAr} — مقالات`,
      description: cluster.descriptionAr,
      url: `${SITE_URL}/c/${slug}`,
    },
  };
}

export default async function ClusterPage({
  params,
}: {
  params: Promise<{ cluster: string }>;
}) {
  const { cluster: slug } = await params;
  const cluster = findCluster(slug);
  if (!cluster || !cluster.enabled) notFound();

  const articles = getArticlesByCluster(slug);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="text-center mb-10">
        <div className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-5">
          <ClusterIcon
            name={cluster.icon}
            className="w-8 h-8 text-emerald-700 dark:text-emerald-400"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          {cluster.titleAr}
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {cluster.descriptionAr}
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          لا توجد مقالات في هذا القسم بعد — قريباً بإذن الله.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
