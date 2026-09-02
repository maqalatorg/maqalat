"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import {
  PAYMENT_TYPES,
  getUpcomingPayments,
  formatCountdown,
  type Payment,
} from "@/lib/salaries";
import { formatGregorianAr, formatHijriAr, formatWeekdayAr } from "@/lib/hijri";

export function SalaryCalendar() {
  const [now, setNow] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  if (!now) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="h-32 bg-slate-100 dark:bg-slate-900 rounded" />
      </div>
    );
  }

  const upcoming = getUpcomingPayments(now, 12);
  const filtered = filter ? upcoming.filter((p) => p.type.id === filter) : upcoming;
  const next = filtered[0];

  return (
    <div className="not-prose space-y-6 my-8">
      {/* Next payment countdown card */}
      {next && <NextPaymentCard payment={next} now={now} />}

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            filter === null
              ? "bg-emerald-600 text-white border-emerald-600"
              : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500"
          }`}
        >
          الكل ({upcoming.length})
        </button>
        {PAYMENT_TYPES.map((t) => {
          const active = filter === t.id;
          const count = upcoming.filter((p) => p.type.id === t.id).length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(active ? null : t.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500"
              }`}
            >
              {t.shortAr} ({count})
            </button>
          );
        })}
      </div>

      {/* Full table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr className="text-slate-600 dark:text-slate-400">
                <th className="text-start px-4 py-3 font-semibold">نوع الدفع</th>
                <th className="text-start px-4 py-3 font-semibold">التاريخ الميلادي</th>
                <th className="text-start px-4 py-3 font-semibold hidden md:table-cell">
                  التاريخ الهجري
                </th>
                <th className="text-start px-4 py-3 font-semibold hidden sm:table-cell">
                  اليوم
                </th>
                <th className="text-end px-4 py-3 font-semibold">المتبقّي</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const daysLeft = Math.ceil(
                  (p.date.getTime() - now.getTime()) / 86400000,
                );
                const adjusted =
                  p.rawDate.getTime() !== p.date.getTime();
                return (
                  <tr
                    key={`${p.type.id}-${p.date.toISOString()}`}
                    className={`border-b border-slate-100 dark:border-slate-800 last:border-0 ${
                      i === 0 ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${p.type.colorClass}`}
                      >
                        {p.type.shortAr}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {formatGregorianAr(p.date)}
                      {adjusted && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 ms-2">
                          (مُقدَّم)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap hidden md:table-cell">
                      {formatHijriAr(p.date)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                      {formatWeekdayAr(p.date)}
                    </td>
                    <td className="px-4 py-3 text-end font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      {daysLeft === 0
                        ? "اليوم"
                        : daysLeft === 1
                          ? "غداً"
                          : `${daysLeft} يوم`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        الجدول يتحدّث تلقائياً بحسب تاريخ اليوم — التاريخ المنقضي يختفي والقادم يظهر. القاعدة الرسمية: راتب الموظف الحكومي ٢٧ من كل شهر ميلادي (وزارة المالية)، المتقاعدين ١ ميلادي (تأمينات موحّدة منذ مايو ٢٠٢٤)، حساب المواطن ١٠ ميلادي، الضمان المطوّر ١ ميلادي، الضمان القديم ٨ هجري. لو صادف الموعد الجمعة يُقدَّم إلى الخميس، ولو صادف السبت يُؤجَّل إلى الأحد.
      </p>
    </div>
  );
}

function NextPaymentCard({ payment, now }: { payment: Payment; now: Date }) {
  const ms = payment.date.getTime() - now.getTime();
  const { days, hours, minutes, seconds } = formatCountdown(ms);
  const isToday = days === 0 && ms > -86400000;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white p-6 sm:p-8 shadow-card">
      {/* Decorative rings */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -end-16 -bottom-16 w-64 h-64 rounded-full border-2 border-white" />
        <div className="absolute -end-8 -bottom-8 w-48 h-48 rounded-full border-2 border-white" />
      </div>

      <div className="relative flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur grid place-items-center shrink-0">
          <Wallet className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="text-sm opacity-90">القادم</div>
          <div className="text-2xl sm:text-3xl font-bold mt-1">{payment.type.nameAr}</div>
          <div className="mt-2 text-sm opacity-90">
            {formatGregorianAr(payment.date)} · {formatWeekdayAr(payment.date)} · {formatHijriAr(payment.date)}
          </div>
        </div>
      </div>

      {isToday ? (
        <div className="relative mt-6 text-center py-4 bg-white/15 backdrop-blur rounded-xl font-bold text-xl">
          يُصرف اليوم
        </div>
      ) : (
        <div className="relative mt-6 grid grid-cols-4 gap-2 text-center">
          {[
            { label: "يوم", value: days },
            { label: "ساعة", value: hours },
            { label: "دقيقة", value: minutes },
            { label: "ثانية", value: seconds },
          ].map((unit) => (
            <div
              key={unit.label}
              className="bg-white/15 backdrop-blur rounded-xl p-3"
            >
              <div className="text-2xl sm:text-3xl font-bold tabular-nums">
                {String(unit.value).padStart(2, "0")}
              </div>
              <div className="text-[11px] opacity-80 mt-1">{unit.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
