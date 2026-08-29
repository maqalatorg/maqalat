import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { getSearchIndex } from "@/lib/blog";
import { ENABLED_CLUSTERS } from "@/lib/clusters";

/**
 * Editorial masthead — like a newspaper header. Wordmark on start,
 * quiet navigation, search + theme toggle on the end.
 */
export function Header() {
  const searchIndex = getSearchIndex();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        {/* Wordmark — pure typography, no emoji/icon */}
        <Link
          href="/"
          className="font-display text-2xl font-bold text-emerald-900 dark:text-emerald-300 hover:opacity-80 transition-opacity leading-none shrink-0"
          style={{ letterSpacing: "-0.01em" }}
          aria-label="مقالات — الصفحة الرئيسية"
        >
          مقالات
        </Link>

        {/* Quiet nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
          {ENABLED_CLUSTERS.map((c) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              className="hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
            >
              {c.titleAr}
            </Link>
          ))}
          <Link
            href="/about"
            className="hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
          >
            من نحن
          </Link>
        </nav>

        {/* Search + theme */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block w-64">
            <SearchBar index={searchIndex} />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
