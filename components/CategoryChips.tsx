import Link from "next/link";
import { ENABLED_CLUSTERS } from "@/lib/clusters";

/**
 * Horizontal category chip navigation — editorial magazine style.
 * Compact, discoverable, doesn't dominate visually.
 */
export function CategoryChips() {
  return (
    <nav aria-label="الأقسام" className="flex flex-wrap items-center gap-2">
      <Link
        href="/"
        className="px-4 py-1.5 rounded-full text-sm border border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium"
      >
        الكل
      </Link>
      {ENABLED_CLUSTERS.map((c) => (
        <Link
          key={c.slug}
          href={`/c/${c.slug}`}
          className="px-4 py-1.5 rounded-full text-sm border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-700 hover:text-emerald-800 dark:hover:border-emerald-400 dark:hover:text-emerald-300 transition-colors"
        >
          {c.titleAr}
        </Link>
      ))}
    </nav>
  );
}
