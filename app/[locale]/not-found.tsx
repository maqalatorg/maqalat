"use client";

import { Home, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-emerald-600 mb-4">
          {t("code")}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          {t("title")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {t("body")}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            {t("homeCta")}
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-sm font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            {t("searchCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
