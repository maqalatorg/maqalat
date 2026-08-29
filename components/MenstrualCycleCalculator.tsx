"use client";

import { useEffect, useMemo, useState } from "react";
import { Droplet, Sparkles, Circle } from "lucide-react";
import { formatGregorianAr, formatWeekdayAr } from "@/lib/hijri";

const DEFAULT_CYCLE = 28;
const DEFAULT_PERIOD_LEN = 5;

export function MenstrualCycleCalculator() {
  const [mounted, setMounted] = useState(false);
  const today = useMemo(() => new Date(), []);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.getDate());
  const [cycleLen, setCycleLen] = useState(DEFAULT_CYCLE);
  const [periodLen, setPeriodLen] = useState(DEFAULT_PERIOD_LEN);

  useEffect(() => setMounted(true), []);

  const result = useMemo(() => {
    const lastPeriod = new Date(year, month - 1, day);
    if (isNaN(lastPeriod.getTime())) return null;

    // Predict next 3 cycles
    const cycles = [0, 1, 2].map((i) => {
      const start = new Date(lastPeriod.getTime() + i * cycleLen * 86400000);
      const end = new Date(start.getTime() + (periodLen - 1) * 86400000);
      const ovulation = new Date(start.getTime() + (cycleLen - 14) * 86400000);
      // Fertile window: 5 days before ovulation + ovulation day itself
      const fertileStart = new Date(ovulation.getTime() - 5 * 86400000);
      const fertileEnd = new Date(ovulation.getTime() + 1 * 86400000);
      return { start, end, ovulation, fertileStart, fertileEnd };
    });

    // Find the next upcoming period (first cycle whose start > today, if any)
    const next = cycles.find((c) => c.start > today) || cycles[1];
    const daysUntilNext = Math.ceil((next.start.getTime() - today.getTime()) / 86400000);

    // Find current fertile window if we're in one
    const currentFertile = cycles.find(
      (c) => today >= c.fertileStart && today <= c.fertileEnd,
    );

    return { cycles, next, daysUntilNext, currentFertile };
  }, [year, month, day, cycleLen, periodLen, today]);

  if (!mounted) return <div className="card p-6 animate-pulse h-96" />;

  return (
    <div className="not-prose card p-6 my-8">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <NumberField label="اليوم" value={day} min={1} max={31} onChange={setDay} />
        <NumberField label="الشهر" value={month} min={1} max={12} onChange={setMonth} />
        <NumberField label="السنة" value={year} min={2000} max={2050} onChange={setYear} />
        <NumberField label="طول الدورة" value={cycleLen} min={21} max={40} onChange={setCycleLen} />
        <NumberField label="مدة الحيض" value={periodLen} min={2} max={10} onChange={setPeriodLen} />
      </div>

      {result && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          {/* Fertile window alert if active */}
          {result.currentFertile && (
            <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white p-4">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="w-5 h-5" />
                أنتِ حالياً في نافذة الخصوبة
              </div>
              <div className="text-sm opacity-90 mt-1">
                من {formatGregorianAr(result.currentFertile.fertileStart)} إلى {formatGregorianAr(result.currentFertile.fertileEnd)}
              </div>
            </div>
          )}

          {/* Next period countdown */}
          <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white p-5">
            <div className="flex items-center gap-2 text-xs opacity-90 mb-1">
              <Droplet className="w-4 h-4" />
              الدورة القادمة
            </div>
            <div className="text-2xl font-bold">{formatGregorianAr(result.next.start)}</div>
            <div className="text-sm opacity-90 mt-1">
              {formatWeekdayAr(result.next.start)} · بعد {result.daysUntilNext} يوم
            </div>
          </div>

          {/* Cycle table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <tr className="text-slate-600 dark:text-slate-400">
                    <th className="text-start px-3 py-2 font-semibold">الدورة</th>
                    <th className="text-start px-3 py-2 font-semibold">بداية الحيض</th>
                    <th className="text-start px-3 py-2 font-semibold hidden sm:table-cell">نهاية الحيض</th>
                    <th className="text-start px-3 py-2 font-semibold">التبويض</th>
                    <th className="text-start px-3 py-2 font-semibold hidden md:table-cell">نافذة الخصوبة</th>
                  </tr>
                </thead>
                <tbody>
                  {result.cycles.map((c, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100">
                        الدورة {i + 1}
                      </td>
                      <td className="px-3 py-2 text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Circle className="w-2 h-2 fill-rose-500 text-rose-500" />
                          {formatGregorianAr(c.start)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap hidden sm:table-cell">
                        {formatGregorianAr(c.end)}
                      </td>
                      <td className="px-3 py-2 text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Circle className="w-2 h-2 fill-amber-500 text-amber-500" />
                          {formatGregorianAr(c.ovulation)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap hidden md:table-cell">
                        {formatGregorianAr(c.fertileStart)} – {formatGregorianAr(c.fertileEnd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
        الحساب تقريبي — يوم التبويض يُقدَّر بـ١٤ يوماً قبل الدورة القادمة، ونافذة الخصوبة تشمل الأيام الخمسة السابقة له. الدورات غير المنتظمة تحتاج متابعة مع طبيبة نساء أو تطبيق تتبّع فعلي (مثل Flo أو Clue).
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
