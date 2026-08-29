"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Calendar } from "lucide-react";
import {
  gregorianToHijri,
  hijriToGregorian,
  hijriMonthName,
  formatGregorianAr,
  formatHijriAr,
  formatWeekdayAr,
} from "@/lib/hijri";

type Direction = "g2h" | "h2g";

const HIJRI_MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}. ${hijriMonthName(i + 1)}`,
}));

export function HijriConverter() {
  const [mounted, setMounted] = useState(false);
  const [direction, setDirection] = useState<Direction>("g2h");
  const today = useMemo(() => new Date(), []);
  const todayHijri = useMemo(() => gregorianToHijri(today), [today]);

  // Gregorian inputs
  const [gYear, setGYear] = useState(today.getFullYear());
  const [gMonth, setGMonth] = useState(today.getMonth() + 1);
  const [gDay, setGDay] = useState(today.getDate());

  // Hijri inputs
  const [hYear, setHYear] = useState(todayHijri.year);
  const [hMonth, setHMonth] = useState(todayHijri.month);
  const [hDay, setHDay] = useState(todayHijri.day);

  useEffect(() => setMounted(true), []);

  const result = useMemo(() => {
    if (direction === "g2h") {
      const d = new Date(gYear, gMonth - 1, gDay);
      if (isNaN(d.getTime())) return null;
      return {
        gregorian: d,
        hijri: gregorianToHijri(d),
      };
    } else {
      const g = hijriToGregorian({ year: hYear, month: hMonth, day: hDay });
      return {
        gregorian: g,
        hijri: { year: hYear, month: hMonth, day: hDay },
      };
    }
  }, [direction, gYear, gMonth, gDay, hYear, hMonth, hDay]);

  if (!mounted) return <div className="card p-6 animate-pulse h-64" />;

  return (
    <div className="not-prose card p-6 my-8">
      {/* Direction toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setDirection("g2h")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            direction === "g2h"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          }`}
        >
          ميلادي ← هجري
        </button>
        <ArrowLeftRight className="w-4 h-4 text-slate-400" />
        <button
          type="button"
          onClick={() => setDirection("h2g")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            direction === "h2g"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          }`}
        >
          هجري ← ميلادي
        </button>
      </div>

      {/* Inputs */}
      {direction === "g2h" ? (
        <div className="grid grid-cols-3 gap-3">
          <NumberField label="اليوم" value={gDay} min={1} max={31} onChange={setGDay} />
          <NumberField label="الشهر" value={gMonth} min={1} max={12} onChange={setGMonth} />
          <NumberField label="السنة" value={gYear} min={1900} max={2200} onChange={setGYear} />
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
          <NumberField label="السنة" value={hYear} min={1300} max={1600} onChange={setHYear} />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="grid gap-4 sm:grid-cols-2">
            <ResultBox
              label="التاريخ الميلادي"
              main={formatGregorianAr(result.gregorian)}
              sub={formatWeekdayAr(result.gregorian)}
              highlighted={direction === "h2g"}
            />
            <ResultBox
              label="التاريخ الهجري"
              main={formatHijriAr(result.gregorian)}
              sub={formatWeekdayAr(result.gregorian)}
              highlighted={direction === "g2h"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
      </span>
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
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: { value: number; label: string }[];
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-base font-medium"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultBox({
  label,
  main,
  sub,
  highlighted,
}: {
  label: string;
  main: string;
  sub: string;
  highlighted: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        highlighted
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
          : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{main}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}
