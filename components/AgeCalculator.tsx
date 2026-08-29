"use client";

import { useEffect, useMemo, useState } from "react";
import { Cake, Sparkles } from "lucide-react";
import {
  gregorianToHijri,
  hijriToGregorian,
  hijriMonthName,
  formatGregorianAr,
  formatHijriAr,
  formatWeekdayAr,
} from "@/lib/hijri";
import { getZodiac, getChineseZodiac } from "@/lib/zodiac";

const HIJRI_MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}. ${hijriMonthName(i + 1)}`,
}));

type Mode = "gregorian" | "hijri";

export function AgeCalculator() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("gregorian");
  const today = useMemo(() => new Date(), []);
  const todayHijri = useMemo(() => gregorianToHijri(today), [today]);

  const [gYear, setGYear] = useState(2000);
  const [gMonth, setGMonth] = useState(1);
  const [gDay, setGDay] = useState(1);
  const [hYear, setHYear] = useState(1420);
  const [hMonth, setHMonth] = useState(1);
  const [hDay, setHDay] = useState(1);

  useEffect(() => setMounted(true), []);

  const result = useMemo(() => {
    const birth =
      mode === "gregorian"
        ? new Date(gYear, gMonth - 1, gDay)
        : hijriToGregorian({ year: hYear, month: hMonth, day: hDay });

    if (isNaN(birth.getTime()) || birth > today) return null;

    const age = computeAge(birth, today);
    const nextBirthday = computeNextBirthday(birth, today);
    const daysToBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / 86400000);
    const zodiac = getZodiac(birth);
    const chinese = getChineseZodiac(birth);
    const birthHijri = gregorianToHijri(birth);
    const totalDaysLived = Math.floor((today.getTime() - birth.getTime()) / 86400000);

    return {
      birth,
      birthHijri,
      age,
      nextBirthday,
      daysToBirthday,
      zodiac,
      chinese,
      totalDaysLived,
    };
  }, [mode, gYear, gMonth, gDay, hYear, hMonth, hDay, today]);

  if (!mounted) return <div className="card p-6 animate-pulse h-96" />;

  return (
    <div className="not-prose card p-6 my-8">
      {/* Mode toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode("gregorian")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            mode === "gregorian"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          }`}
        >
          تاريخ ميلاد ميلادي
        </button>
        <button
          type="button"
          onClick={() => setMode("hijri")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            mode === "hijri"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          }`}
        >
          تاريخ ميلاد هجري
        </button>
      </div>

      {/* Inputs */}
      {mode === "gregorian" ? (
        <div className="grid grid-cols-3 gap-3">
          <NumberField label="اليوم" value={gDay} min={1} max={31} onChange={setGDay} />
          <NumberField label="الشهر" value={gMonth} min={1} max={12} onChange={setGMonth} />
          <NumberField label="السنة" value={gYear} min={1900} max={today.getFullYear()} onChange={setGYear} />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <NumberField label="اليوم" value={hDay} min={1} max={30} onChange={setHDay} />
          <SelectField
            label="الشهر"
            value={hMonth}
            options={HIJRI_MONTHS}
            onChange={setHMonth}
          />
          <NumberField label="السنة" value={hYear} min={1300} max={todayHijri.year} onChange={setHYear} />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          {/* Big age */}
          <div className="text-center py-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
            <div className="text-sm opacity-90 mb-1">عمرك الآن</div>
            <div className="text-5xl font-extrabold tabular-nums">
              {result.age.years}
            </div>
            <div className="text-lg font-medium mt-1 opacity-95">سنة</div>
            <div className="mt-2 text-sm opacity-90">
              {result.age.years} سنة، {result.age.months} شهر، {result.age.days} يوم
            </div>
            <div className="mt-1 text-xs opacity-80">
              أي ما يعادل {result.totalDaysLived.toLocaleString("ar-SA-u-nu-latn")} يوم
            </div>
          </div>

          {/* Birthday countdown + zodiacs */}
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoBox
              icon={<Cake className="w-5 h-5" />}
              label="عيد الميلاد القادم"
              main={
                result.daysToBirthday === 0
                  ? "اليوم! 🎂"
                  : `بعد ${result.daysToBirthday} يوم`
              }
              sub={formatGregorianAr(result.nextBirthday)}
            />
            <InfoBox
              icon={<span className="text-xl">{result.zodiac.symbol}</span>}
              label="برجك الفلكي"
              main={result.zodiac.nameAr}
              sub={`${result.zodiac.element} · ${result.zodiac.traitsAr}`}
            />
            <InfoBox
              icon={<span className="text-lg font-bold">{result.chinese.symbol}</span>}
              label="برجك الصيني"
              main={result.chinese.nameAr}
              sub={result.chinese.traitsAr}
            />
          </div>

          {/* Birth summary */}
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 mb-0.5">تاريخ الميلاد الميلادي</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {formatGregorianAr(result.birth)}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {formatWeekdayAr(result.birth)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 mb-0.5">تاريخ الميلاد الهجري</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {formatHijriAr(result.birth)}
              </div>
            </div>
          </div>
        </div>
      )}

      {result === null && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
          أدخل تاريخ ميلاد صحيح (ليس في المستقبل).
        </div>
      )}
    </div>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────
function computeAge(birth: Date, today: Date) {
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // days in previous month
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function computeNextBirthday(birth: Date, today: Date): Date {
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return next;
}

// ─── shared UI ──────────────────────────────────────────────────────────
function NumberField({
  label, value, min, max, onChange,
}: { label: string; value: number; min: number; max: number; onChange: (n: number) => void; }) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || min)}
        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-lg font-semibold text-center tabular-nums"
      />
    </label>
  );
}

function SelectField({
  label, value, options, onChange,
}: { label: string; value: number; options: { value: number; label: string }[]; onChange: (n: number) => void; }) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-base font-medium"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function InfoBox({
  icon, label, main, sub,
}: { icon: React.ReactNode; label: string; main: string; sub: string; }) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
        <span className="text-emerald-600">{icon}</span>
        {label}
      </div>
      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{main}</div>
      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
        {sub}
      </div>
    </div>
  );
}
