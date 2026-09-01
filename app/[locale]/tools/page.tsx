import type { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Cake,
  Scale,
  Timer,
  CalendarClock,
  Heart,
  Baby,
  Wallet,
  Coins,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SITE_URL } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const path = locale === "ar" ? "/tools" : `/${locale}/tools`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${SITE_URL}${path}`,
      type: "website",
    },
  };
}

type Tool = {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  nameKey:
    | "hijriName"
    | "salaryName"
    | "zakatName"
    | "bmiName"
    | "ageName"
    | "pregnancyName"
    | "cycleName"
    | "countdownName";
  descKey:
    | "hijriDesc"
    | "salaryDesc"
    | "zakatDesc"
    | "bmiDesc"
    | "ageDesc"
    | "pregnancyDesc"
    | "cycleDesc"
    | "countdownDesc";
  badgeKey?: "hijriBadge";
};

const TOOLS: Tool[] = [
  { href: "/hijri-gregorian-converter-2026", icon: CalendarClock, nameKey: "hijriName", descKey: "hijriDesc", badgeKey: "hijriBadge" },
  { href: "/saudi-salary-dates-2026-2027", icon: Wallet, nameKey: "salaryName", descKey: "salaryDesc" },
  { href: "/zakat-calculator-guide", icon: Coins, nameKey: "zakatName", descKey: "zakatDesc" },
  { href: "/bmi-calculator-guide", icon: Scale, nameKey: "bmiName", descKey: "bmiDesc" },
  { href: "/age-calculator-guide", icon: Cake, nameKey: "ageName", descKey: "ageDesc" },
  { href: "/pregnancy-calculator-guide", icon: Baby, nameKey: "pregnancyName", descKey: "pregnancyDesc" },
  { href: "/menstrual-cycle-calculator", icon: Heart, nameKey: "cycleName", descKey: "cycleDesc" },
  { href: "/countdown-ramadan-eid-national-day", icon: Timer, nameKey: "countdownName", descKey: "countdownDesc" },
];

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ToolsBody />;
}

function ToolsBody() {
  const t = useTranslations("tools");
  const locale = useLocale() as Locale;
  const isEn = locale === "en";
  const arrow = isEn ? "→" : "←";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-14 md:mb-20">
        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-5 tracking-wide">
          {t("badge", { count: TOOLS.length })}
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-100 mb-5 tracking-tight">
          {t("h1")}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-slate-200/60 dark:border-slate-800 transition-all hover:-translate-y-1"
            >
              {tool.badgeKey && (
                <span className={`absolute top-4 ${isEn ? "right-4" : "left-4"} px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold tracking-wide`}>
                  {t(tool.badgeKey)}
                </span>
              )}

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center shadow-md group-hover:scale-110 transition-transform mb-5">
                <Icon className="w-7 h-7 text-white" strokeWidth={2.2} />
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                {t(tool.nameKey)}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t(tool.descKey)}
              </p>

              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 group-hover:gap-2.5 transition-all">
                {t("useCta")}
                <span className="text-lg leading-none">{arrow}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 md:mt-24 text-center py-10 px-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
          {t("missingTitle")}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-5 max-w-lg mx-auto">
          {t("missingBody")}
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
        >
          {t("missingCta")}
          <span className="text-lg leading-none">{arrow}</span>
        </Link>
      </div>
    </div>
  );
}
