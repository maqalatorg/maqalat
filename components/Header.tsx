import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { getSearchIndex } from "@/lib/blog";
import { ENABLED_CLUSTERS } from "@/lib/clusters";

export function Header() {
  const searchIndex = getSearchIndex();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo — icon + wordmark + subtitle */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="مقالات — الصفحة الرئيسية">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center shadow-card group-hover:shadow-card-hover transition-shadow">
            <BookOpen className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-bold text-xl text-emerald-800 dark:text-emerald-300">مقالات</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">
              مرجعك الحديث
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0">
          {ENABLED_CLUSTERS.map((c) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              className="px-3 py-1.5 rounded-full text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              {c.titleAr}
            </Link>
          ))}
          <Link
            href="/about"
            className="px-3 py-1.5 rounded-full text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            من نحن
          </Link>
        </nav>

        {/* Search + toggle */}
        <div className="flex items-center gap-2 shrink-0 flex-1 justify-end max-w-xs">
          <div className="flex-1">
            <SearchBar index={searchIndex} />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
