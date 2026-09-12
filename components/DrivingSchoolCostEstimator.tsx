"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Car, MapPin, GraduationCap, Wallet } from "lucide-react";

type LicenseType = "car" | "motorcycle" | "heavy" | "public";
type ExperienceLevel = "beginner" | "some_experience" | "foreign_license";

const CITIES_AR = [
  "الرياض",
  "جدة",
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام / الخبر / الظهران",
  "الطائف",
  "بريدة",
  "تبوك",
  "أبها",
  "خميس مشيط",
  "حائل",
  "جازان",
  "نجران",
  "عرعر",
];

const CITIES_EN = [
  "Riyadh",
  "Jeddah",
  "Makkah",
  "Madinah",
  "Dammam / Khobar / Dhahran",
  "Taif",
  "Buraidah",
  "Tabuk",
  "Abha",
  "Khamis Mushait",
  "Hail",
  "Jazan",
  "Najran",
  "Arar",
];

const SCHOOLS_BY_CITY: Record<string, string[]> = {
  "الرياض": ["مدرسة تعليم القيادة (دلّني)", "مدرسة تعليم القيادة بجامعة الأميرة نورة (للنساء)", "الرياض للقيادة", "ساعي"],
  "Riyadh": ["Dallini Driving School", "Princess Nourah University Driving School (for women)", "Riyadh Driving School", "Saei"],
  "جدة": ["مدرسة تعليم القيادة السعودية", "دلّني — فرع جدة", "مدرسة تعليم القيادة بجامعة الملك عبدالعزيز"],
  "Jeddah": ["Saudi Driving School", "Dallini — Jeddah branch", "King Abdulaziz University Driving School"],
  "مكة المكرمة": ["مدرسة مكة للقيادة", "دلّني — فرع مكة"],
  "Makkah": ["Makkah Driving School", "Dallini — Makkah branch"],
  "المدينة المنورة": ["مدرسة تعليم القيادة بالمدينة", "دلّني — فرع المدينة"],
  "Madinah": ["Madinah Driving School", "Dallini — Madinah branch"],
  "الدمام / الخبر / الظهران": ["مدرسة الشرقية لتعليم القيادة", "دلّني — فرع الدمام", "مدرسة تعليم القيادة بجامعة الإمام عبدالرحمن"],
  "Dammam / Khobar / Dhahran": ["Eastern Driving School", "Dallini — Dammam branch", "IAU Driving School"],
  "الطائف": ["مدرسة الطائف لتعليم القيادة"],
  "Taif": ["Taif Driving School"],
  "بريدة": ["مدرسة القصيم لتعليم القيادة"],
  "Buraidah": ["Qassim Driving School"],
  "تبوك": ["مدرسة تبوك لتعليم القيادة"],
  "Tabuk": ["Tabuk Driving School"],
  "أبها": ["مدرسة عسير لتعليم القيادة"],
  "Abha": ["Aseer Driving School"],
  "خميس مشيط": ["مدرسة خميس مشيط لتعليم القيادة"],
  "Khamis Mushait": ["Khamis Mushait Driving School"],
  "حائل": ["مدرسة حائل لتعليم القيادة"],
  "Hail": ["Hail Driving School"],
  "جازان": ["مدرسة جازان لتعليم القيادة"],
  "Jazan": ["Jazan Driving School"],
  "نجران": ["مدرسة نجران لتعليم القيادة"],
  "Najran": ["Najran Driving School"],
  "عرعر": ["مدرسة الحدود الشمالية لتعليم القيادة"],
  "Arar": ["Northern Borders Driving School"],
};

const COST_RANGES_SAR: Record<LicenseType, { min: number; max: number }> = {
  car: { min: 2200, max: 3800 },
  motorcycle: { min: 800, max: 1500 },
  heavy: { min: 3500, max: 6000 },
  public: { min: 3000, max: 5000 },
};

const HOURS_RANGES: Record<LicenseType, { min: number; max: number }> = {
  car: { min: 20, max: 30 },
  motorcycle: { min: 10, max: 15 },
  heavy: { min: 30, max: 45 },
  public: { min: 25, max: 35 },
};

export function DrivingSchoolCostEstimator() {
  const locale = useLocale();
  const isAr = locale !== "en";
  const [mounted, setMounted] = useState(false);
  const [city, setCity] = useState<string>(isAr ? "الرياض" : "Riyadh");
  const [type, setType] = useState<LicenseType>("car");
  const [level, setLevel] = useState<ExperienceLevel>("beginner");

  useEffect(() => setMounted(true), []);

  const result = useMemo(() => {
    const range = COST_RANGES_SAR[type];
    const hours = HOURS_RANGES[type];
    const factor = level === "beginner" ? 1 : level === "some_experience" ? 0.65 : 0.35;
    return {
      minCost: Math.round(range.min * factor),
      maxCost: Math.round(range.max * factor),
      minHours: Math.round(hours.min * factor),
      maxHours: Math.round(hours.max * factor),
    };
  }, [type, level]);

  const schools = SCHOOLS_BY_CITY[city] || [];
  const cities = isAr ? CITIES_AR : CITIES_EN;

  const L = isAr
    ? {
        title: "احسب تكلفة تعليم القيادة",
        subtitle: "اختر مدينتك ونوع الرخصة ومستواك — نعطيك تقديراً حقيقياً للتكلفة والوقت",
        cityLabel: "المدينة",
        typeLabel: "نوع الرخصة",
        levelLabel: "مستواك الحالي",
        types: {
          car: "خاصة (سيارة)",
          motorcycle: "دراجة نارية",
          heavy: "نقل ثقيل",
          public: "نقل عام",
        },
        levels: {
          beginner: "مبتدئ تماماً",
          some_experience: "لديّ خبرة قيادة",
          foreign_license: "أحمل رخصة أجنبية",
        },
        resultTitle: "تقدير التكلفة والمدّة",
        costLabel: "التكلفة المتوقّعة",
        hoursLabel: "ساعات التدريب",
        currency: "ريال",
        hoursSuffix: "ساعة",
        schoolsTitle: "المدارس المعتمَدة في",
        noSchools: "لا توجد بيانات محدَّثة عن هذه المدينة — تحقّق من absher.sa للقائمة الرسمية.",
        disclaimer: "الأرقام تقديرية بناءً على أسعار السوق. الأسعار الرسمية تختلف بحسب كل مدرسة والعروض الموسمية.",
      }
    : {
        title: "Driving School Cost Estimator",
        subtitle: "Pick your city, licence type, and level — we give you a real cost and time estimate",
        cityLabel: "City",
        typeLabel: "Licence type",
        levelLabel: "Your current level",
        types: {
          car: "Private (car)",
          motorcycle: "Motorcycle",
          heavy: "Heavy transport",
          public: "Public transport",
        },
        levels: {
          beginner: "Complete beginner",
          some_experience: "Some driving experience",
          foreign_license: "Hold a foreign licence",
        },
        resultTitle: "Cost and duration estimate",
        costLabel: "Expected cost",
        hoursLabel: "Training hours",
        currency: "SAR",
        hoursSuffix: "hours",
        schoolsTitle: "Accredited schools in",
        noSchools: "No current data for this city — check absher.sa for the official list.",
        disclaimer: "Figures are estimates based on market prices. Official prices vary by school and seasonal offers.",
      };

  if (!mounted) return <div className="not-prose card p-6 my-8 animate-pulse h-96" />;

  return (
    <div className="not-prose card p-6 md:p-8 my-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
          <Car className="w-3.5 h-3.5" />
          {L.title}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{L.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <label className="block">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {L.cityLabel}
          </span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-medium"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <Car className="w-3.5 h-3.5" />
            {L.typeLabel}
          </span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as LicenseType)}
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-medium"
          >
            {(Object.keys(L.types) as LicenseType[]).map((t) => (
              <option key={t} value={t}>{L.types[t]}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            {L.levelLabel}
          </span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as ExperienceLevel)}
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-medium"
          >
            {(Object.keys(L.levels) as ExperienceLevel[]).map((l) => (
              <option key={l} value={l}>{L.levels[l]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5" />
            {L.costLabel}
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
            {result.minCost.toLocaleString()} – {result.maxCost.toLocaleString()}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{L.currency}</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            {L.hoursLabel}
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
            {result.minHours} – {result.maxHours}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{L.hoursSuffix}</div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          {L.schoolsTitle} {city}
        </div>
        {schools.length > 0 ? (
          <ul className="space-y-1.5">
            {schools.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-500 italic">{L.noSchools}</p>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-500 mt-5 leading-relaxed">
        {L.disclaimer}
      </p>
    </div>
  );
}
