"use client";

import { useEffect, useMemo, useState } from "react";
import { Baby, Heart } from "lucide-react";
import { formatGregorianAr } from "@/lib/hijri";

type Mode = "lmp" | "conception" | "due";

const AVG_CYCLE_DAYS = 28;
const AVG_PREGNANCY_DAYS = 280; // 40 weeks from LMP (Naegele's rule)

export function PregnancyCalculator() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("lmp");
  const today = useMemo(() => new Date(), []);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.getDate());
  const [cycleLen, setCycleLen] = useState(AVG_CYCLE_DAYS);

  useEffect(() => setMounted(true), []);

  const result = useMemo(() => {
    const input = new Date(year, month - 1, day);
    if (isNaN(input.getTime())) return null;

    // Compute LMP from input by mode
    let lmp: Date;
    if (mode === "lmp") lmp = input;
    else if (mode === "conception")
      lmp = new Date(input.getTime() - 14 * 86400000);
    else /* due */ lmp = new Date(input.getTime() - AVG_PREGNANCY_DAYS * 86400000);

    // Adjust for non-28-day cycles (Naegele's rule with cycle correction)
    const cycleAdjust = cycleLen - AVG_CYCLE_DAYS;
    const dueDate = new Date(
      lmp.getTime() + (AVG_PREGNANCY_DAYS + cycleAdjust) * 86400000,
    );
    const conception = new Date(lmp.getTime() + (14 + cycleAdjust) * 86400000);

    // Current pregnancy age from LMP to today
    const daysSinceLmp = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
    if (daysSinceLmp < 0 || daysSinceLmp > 300) {
      return { lmp, conception, dueDate, currentWeek: 0, currentDay: 0, trimester: 0, daysUntilDue: 0, valid: false };
    }

    const currentWeek = Math.floor(daysSinceLmp / 7);
    const currentDay = daysSinceLmp % 7;
    const trimester = currentWeek < 13 ? 1 : currentWeek < 27 ? 2 : 3;
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / 86400000);

    return { lmp, conception, dueDate, currentWeek, currentDay, trimester, daysUntilDue, valid: true };
  }, [mode, year, month, day, cycleLen, today]);

  if (!mounted) return <div className="card p-6 animate-pulse h-96" />;

  return (
    <div className="not-prose card p-6 my-8">
      {/* Mode toggle */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {[
          { key: "lmp" as Mode, label: "أول يوم آخر دورة" },
          { key: "conception" as Mode, label: "تاريخ الحمل" },
          { key: "due" as Mode, label: "تاريخ الولادة" },
        ].map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              mode === m.key
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Date + cycle inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NumberField label="اليوم" value={day} min={1} max={31} onChange={setDay} />
        <NumberField label="الشهر" value={month} min={1} max={12} onChange={setMonth} />
        <NumberField label="السنة" value={year} min={2000} max={2050} onChange={setYear} />
        <NumberField
          label="طول الدورة (يوم)"
          value={cycleLen}
          min={21}
          max={40}
          onChange={setCycleLen}
        />
      </div>

      {result && result.valid && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <BigCard
              icon={<Baby className="w-5 h-5" />}
              label="أنتِ حالياً في"
              main={`الأسبوع ${result.currentWeek}`}
              sub={`و${result.currentDay} أيام · الثلث ${["الأول", "الثاني", "الثالث"][result.trimester - 1]}`}
              gradient="from-pink-500 to-pink-700"
            />
            <BigCard
              icon={<Heart className="w-5 h-5" />}
              label="تاريخ الولادة المتوقّع"
              main={formatGregorianAr(result.dueDate)}
              sub={result.daysUntilDue > 0 ? `بعد ${result.daysUntilDue} يوم` : "تجاوزتِ التاريخ المتوقّع"}
              gradient="from-emerald-500 to-emerald-700"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <InfoBox
              label="تاريخ الحمل التقريبي"
              main={formatGregorianAr(result.conception)}
            />
            <InfoBox
              label="أول يوم آخر دورة (LMP)"
              main={formatGregorianAr(result.lmp)}
            />
          </div>
        </div>
      )}

      {result && !result.valid && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
          التاريخ غير منطقي — تأكّد من الإدخال (يجب أن يكون خلال ٩ أشهر الماضية).
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
        الحساب تقريبي وفق قاعدة Naegele المعتمَدة عالمياً (LMP + ٢٨٠ يوماً). للحصول على تاريخ ولادة دقيق، راجعي طبيبتك — الفحص بالسونار في الثلث الأول أدقّ من الحساب بالتقويم.
      </p>
    </div>
  );
}

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
        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-base font-semibold text-center tabular-nums"
      />
    </label>
  );
}

function BigCard({
  icon, label, main, sub, gradient,
}: { icon: React.ReactNode; label: string; main: string; sub: string; gradient: string; }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} text-white p-5`}>
      <div className="flex items-center gap-1.5 text-xs opacity-90 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold">{main}</div>
      <div className="text-sm opacity-90 mt-1">{sub}</div>
    </div>
  );
}

function InfoBox({ label, main }: { label: string; main: string }) {
  return (
    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</div>
      <div className="font-semibold text-slate-900 dark:text-slate-100">{main}</div>
    </div>
  );
}
