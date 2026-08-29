"use client";

import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";

type Person = { name: string; year: number; month: number; day: number };

const emptyPerson = (defaultYear: number, name: string): Person => ({
  name,
  year: defaultYear,
  month: 1,
  day: 1,
});

export function AgeDifference() {
  const [mounted, setMounted] = useState(false);
  const [a, setA] = useState<Person>(emptyPerson(2000, "الشخص الأول"));
  const [b, setB] = useState<Person>(emptyPerson(1990, "الشخص الثاني"));

  useEffect(() => setMounted(true), []);

  const result = useMemo(() => {
    const dateA = new Date(a.year, a.month - 1, a.day);
    const dateB = new Date(b.year, b.month - 1, b.day);
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return null;
    const older = dateA < dateB ? { ...a, date: dateA } : { ...b, date: dateB };
    const younger = dateA < dateB ? { ...b, date: dateB } : { ...a, date: dateA };
    const diff = calcDifference(older.date, younger.date);
    const totalDays = Math.floor(
      (younger.date.getTime() - older.date.getTime()) / 86400000,
    );
    return { older, younger, diff, totalDays };
  }, [a, b]);

  if (!mounted) return <div className="card p-6 animate-pulse h-96" />;

  return (
    <div className="not-prose card p-6 my-8">
      <div className="grid gap-6 md:grid-cols-2">
        <PersonBox person={a} onChange={setA} accent="emerald" />
        <PersonBox person={b} onChange={setB} accent="sky" />
      </div>

      {result && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white p-6 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs opacity-80 mb-3">
              <Users className="w-4 h-4" />
              الفرق في العمر
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold tabular-nums">
              {result.diff.years}
              <span className="text-xl font-medium opacity-80"> سنة</span>
            </div>
            <div className="mt-2 text-base opacity-90">
              {result.diff.years} سنة، {result.diff.months} شهر، {result.diff.days} يوم
            </div>
            <div className="mt-1 text-sm opacity-75">
              أي {result.totalDays.toLocaleString("ar-SA-u-nu-latn")} يوم
            </div>
            <div className="mt-4 text-sm bg-white/10 backdrop-blur rounded-xl py-2 px-3">
              <strong>{result.older.name}</strong> أكبر من{" "}
              <strong>{result.younger.name}</strong> بـ{result.diff.years} سنة
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PersonBox({
  person,
  onChange,
  accent,
}: {
  person: Person;
  onChange: (p: Person) => void;
  accent: "emerald" | "sky";
}) {
  const ring = accent === "emerald" ? "ring-emerald-500/40 border-emerald-500" : "ring-sky-500/40 border-sky-500";
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={person.name}
        onChange={(e) => onChange({ ...person, name: e.target.value })}
        placeholder="اسم الشخص"
        className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 ${ring} font-semibold`}
      />
      <div className="grid grid-cols-3 gap-2">
        <NumberField
          label="اليوم"
          value={person.day}
          min={1}
          max={31}
          onChange={(v) => onChange({ ...person, day: v })}
        />
        <NumberField
          label="الشهر"
          value={person.month}
          min={1}
          max={12}
          onChange={(v) => onChange({ ...person, month: v })}
        />
        <NumberField
          label="السنة"
          value={person.year}
          min={1900}
          max={2200}
          onChange={(v) => onChange({ ...person, year: v })}
        />
      </div>
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
      <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || min)}
        className="w-full px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-base font-semibold text-center tabular-nums"
      />
    </label>
  );
}

function calcDifference(older: Date, younger: Date) {
  let years = younger.getFullYear() - older.getFullYear();
  let months = younger.getMonth() - older.getMonth();
  let days = younger.getDate() - older.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(younger.getFullYear(), younger.getMonth(), 0).getDate();
    days += prevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}
