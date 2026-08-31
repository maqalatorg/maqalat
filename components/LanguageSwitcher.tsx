"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/config";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");
  const [isPending, startTransition] = useTransition();

  const otherLocale: Locale = currentLocale === "ar" ? "en" : "ar";
  const otherLabel = otherLocale === "ar" ? t("arabic") : t("english");

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          router.replace(pathname, { locale: otherLocale });
        });
      }}
      disabled={isPending}
      aria-label={`${t("switch")}: ${otherLabel}`}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors disabled:opacity-60"
    >
      <Languages className="w-4 h-4" strokeWidth={2.2} />
      <span className="hidden sm:inline">{otherLabel}</span>
    </button>
  );
}
