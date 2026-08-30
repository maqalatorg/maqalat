import type { Metadata } from "next";
import Link from "next/link";
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
import { SITE_NAME_AR } from "@/lib/seo";

const TITLE = "الأدوات";
const DESCRIPTION =
  "مجموعة الأدوات التفاعلية في مقالات — حاسبات ومحوّلات مرجعية لتحويل التاريخ، حساب الزكاة، الرواتب، BMI، الحمل والعمر. سريعة، بدون تسجيل، وتعمل مباشرة في متصفحك.";

export const metadata: Metadata = {
  title: `${TITLE} — ${SITE_NAME_AR}`,
  description: DESCRIPTION,
  alternates: { canonical: "/tools" },
  openGraph: {
    title: `${TITLE} — ${SITE_NAME_AR}`,
    description: DESCRIPTION,
    url: "/tools",
    type: "website",
  },
};

type Tool = {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  name: string;
  desc: string;
  badge?: string;
};

const TOOLS: Tool[] = [
  {
    href: "/hijri-gregorian-converter-2026",
    icon: CalendarClock,
    name: "محوّل التاريخ الهجري ↔ الميلادي",
    desc: "تحويل فوري بين التقويمين لأي تاريخ من ١٩٠٠ إلى ٢١٠٠.",
    badge: "الأكثر استخداماً",
  },
  {
    href: "/saudi-salary-dates-2026-2027",
    icon: Wallet,
    name: "تقويم الرواتب السعودي",
    desc: "مواعيد رواتب الحكومة، القطاع الخاص، التقاعد، وضمان اجتماعي ٢٠٢٦.",
  },
  {
    href: "/zakat-calculator-guide",
    icon: Coins,
    name: "حاسبة الزكاة",
    desc: "احسب زكاة النقود، الذهب، الفضة، وعروض التجارة بدقّة شرعية.",
  },
  {
    href: "/bmi-calculator-guide",
    icon: Scale,
    name: "حاسبة كتلة الجسم (BMI)",
    desc: "قياس الوزن المثالي مع تصنيف WHO والوزن الصحي الموصى به.",
  },
  {
    href: "/age-calculator-guide",
    icon: Cake,
    name: "حاسبة العمر",
    desc: "حساب العمر بالسنوات، الأشهر، الأيام، والساعات من تاريخ الميلاد.",
  },
  {
    href: "/pregnancy-calculator-guide",
    icon: Baby,
    name: "حاسبة الحمل",
    desc: "حساب تاريخ الولادة المتوقّع، الأسبوع الحالي، والفصول الثلاثة.",
  },
  {
    href: "/menstrual-cycle-calculator",
    icon: Heart,
    name: "حاسبة الدورة الشهرية",
    desc: "تتبّع الدورة، الإباضة، والفترة الأكثر خصوبة بدقّة.",
  },
  {
    href: "/countdown-ramadan-eid-national-day",
    icon: Timer,
    name: "العد التنازلي للمناسبات",
    desc: "رمضان، عيدي الفطر والأضحى، يوم عرفة، اليوم الوطني — بالثانية.",
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      {/* Hero */}
      <div className="text-center mb-14 md:mb-20">
        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-5 tracking-wide">
          {TOOLS.length} أدوات تفاعلية
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-100 mb-5 tracking-tight">
          الأدوات
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          حاسبات ومحوّلات مرجعية مصمّمة بدقّة — تعمل مباشرة في متصفحك، بلا تسجيل ولا تنزيل.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-slate-200/60 dark:border-slate-800 transition-all hover:-translate-y-1"
            >
              {tool.badge && (
                <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold tracking-wide">
                  {tool.badge}
                </span>
              )}

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center shadow-md group-hover:scale-110 transition-transform mb-5">
                <Icon className="w-7 h-7 text-white" strokeWidth={2.2} />
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                {tool.name}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {tool.desc}
              </p>

              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 group-hover:gap-2.5 transition-all">
                استخدم الأداة
                <span className="text-lg leading-none">←</span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Bottom band — invite */}
      <div className="mt-16 md:mt-24 text-center py-10 px-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
          أداة ناقصة؟
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-5 max-w-lg mx-auto">
          نضيف أدوات جديدة كل شهر حسب أكثر ما يطلبه القرّاء. اقترح علينا الأداة التي تحتاجها.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
        >
          اقترح أداة
          <span className="text-lg leading-none">←</span>
        </Link>
      </div>
    </div>
  );
}
