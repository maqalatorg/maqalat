"use client";

import Fuse from "fuse.js";
import { Search, X, Command } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type IndexItem = {
  slug: string;
  title: string;
  description: string;
  cluster: string;
  tags: string[];
  excerpt: string;
};

/** Normalize Arabic text: strip diacritics + unify alef/yaa forms. */
function normalizeArabic(s: string): string {
  return s
    .replace(/[ً-ٰٟۖ-ۭ]/g, "") // diacritics
    .replace(/[إأآا]/g, "ا") // alef variants
    .replace(/ى/g, "ي") // yaa
    .replace(/ة/g, "ه") // taa marbuta
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .toLowerCase();
}

export function SearchBar({ index }: { index: IndexItem[] }) {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);

  // Pre-normalize the index for fuzzy Arabic search
  const normalizedIndex = useMemo(
    () =>
      index.map((it) => ({
        ...it,
        _t: normalizeArabic(it.title),
        _d: normalizeArabic(it.description),
        _b: normalizeArabic(it.excerpt),
        _tg: it.tags.map(normalizeArabic),
      })),
    [index],
  );

  const fuse = useMemo(
    () =>
      new Fuse(normalizedIndex, {
        keys: [
          { name: "_t", weight: 0.45 }, // title
          { name: "_d", weight: 0.20 }, // description
          { name: "_b", weight: 0.20 }, // body excerpt
          { name: "_tg", weight: 0.15 }, // tags
        ],
        threshold: 0.4, // typo-tolerant (higher = more forgiving)
        distance: 200, // allow matches farther in the text
        ignoreLocation: true,
        minMatchCharLength: 2,
        includeMatches: false,
      }),
    [normalizedIndex],
  );

  const results = useMemo(() => {
    const q = normalizeArabic(query.trim());
    if (!q) return [];
    return fuse.search(q).slice(0, 12).map((r) => r.item);
  }, [fuse, query]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Cmd+K / Ctrl+K opens the command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (paletteOpen) {
      setTimeout(() => paletteInputRef.current?.focus(), 40);
    }
  }, [paletteOpen]);

  return (
    <>
      {/* Inline header search */}
      <div ref={containerRef} className="relative w-full max-w-md">
        <div className="relative">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t("placeholder")}
            className="w-full ps-4 pe-10 py-2.5 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm placeholder:text-slate-400 backdrop-blur transition-all"
            aria-label={t("ariaLabel")}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute end-10 top-1/2 -translate-y-1/2 w-5 h-5 grid place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={t("clearLabel")}
            >
              <X className="w-3 h-3 text-slate-500" />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex absolute end-10 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          )}
        </div>
        {open && results.length > 0 && (
          <div className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-card border border-slate-200 dark:border-slate-800 z-50">
            {results.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.slug}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {r.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {r.description}
                </div>
              </Link>
            ))}
          </div>
        )}
        {open && query && results.length === 0 && (
          <div className="absolute top-full mt-2 w-full rounded-2xl bg-white dark:bg-slate-900 shadow-card border border-slate-200 dark:border-slate-800 z-50 p-4 text-sm text-slate-500">
            {t("noResultsFor", { query })}
          </div>
        )}
      </div>

      {/* Cmd+K palette (full-screen) */}
      {paletteOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-start pt-24 sm:pt-32 px-4 bg-slate-950/60 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-[fade-up_0.2s_ease-out]"
            role="dialog"
            aria-label={t("paletteLabel")}
          >
            <div className="relative border-b border-slate-200 dark:border-slate-800">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
              <input
                ref={paletteInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("palettePlaceholder")}
                className="w-full ps-12 pe-16 py-4 text-lg bg-transparent focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500"
                aria-label={t("close")}
              >
                ESC
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {results.length === 0 && !query && (
                <div className="p-6 text-center text-slate-500 text-sm">
                  {t("emptyStart")}
                </div>
              )}
              {results.length === 0 && query && (
                <div className="p-6 text-center text-slate-500 text-sm">
                  {t("noResultsShort", { query })}
                </div>
              )}
              {results.map((r) => (
                <Link
                  key={r.slug}
                  href={`/${r.slug}`}
                  onClick={() => setPaletteOpen(false)}
                  className="block px-5 py-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                >
                  <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {r.title}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {r.description}
                  </div>
                </Link>
              ))}
            </div>
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-3">
              <span>{t("openHint")}</span>
              <span>{t("closeHint")}</span>
              <span className="ms-auto flex items-center gap-1">
                {t("poweredBy")}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
