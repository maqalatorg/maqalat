"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";

/**
 * End-of-Service Gratuity Calculator — Saudi Labor Law, Articles 84–85.
 *
 * Article 84: Employer must pay end-of-service gratuity on termination —
 *   half a month's wage per year for the first five years, and one full
 *   month's wage per year for each subsequent year. Fractions of a year
 *   are pro-rated. Wage = last wage (basic + regular fixed allowances).
 *
 * Article 85: When the worker RESIGNS on a limited-term (open-ended)
 *   contract:
 *     • Less than 2 years  → no gratuity
 *     • 2 to <5 years      → 1/3 of the full amount
 *     • 5 to <10 years     → 2/3 of the full amount
 *     • 10 years or more   → full amount
 *
 * Article 87 exceptions (worker gets full amount even if resigning):
 *   force majeure beyond control, marriage of a female worker within 6
 *   months (dropped by the 2019 amendment for new hires), or reaching
 *   retirement age. We surface this note in the UI, not in the formula.
 *
 * This calculator is INFORMATIONAL. Actual entitlement can vary with
 * bonuses, commissions, unused leave, contract type (fixed vs open),
 * dismissal-for-cause (Article 80 removes entitlement entirely), and
 * pending sanctions. For a real claim, verify via HRSD or a labor court.
 */

type TerminationCause =
  | "employer" // Article 84 — employer terminates without valid cause
  | "resign" // Article 85 — worker resigns
  | "retirement" // Article 87 — full amount regardless of cause
  | "mutual"; // Mutual — treated as full amount by default

export function EndOfServiceCalculator() {
  const [mounted, setMounted] = useState(false);
  const [wage, setWage] = useState(0);
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [cause, setCause] = useState<TerminationCause>("employer");

  useEffect(() => setMounted(true), []);

  const result = useMemo(() => {
    const totalYears = Math.max(0, years + months / 12);
    // Article 84 base formula, pro-rated per Article 84's "and portions
    // thereof shall be paid in equivalent portions" clause.
    const firstFiveYears = Math.min(totalYears, 5);
    const beyondFiveYears = Math.max(0, totalYears - 5);
    const halfWageYears = firstFiveYears * (wage / 2);
    const fullWageYears = beyondFiveYears * wage;
    const fullAmount = halfWageYears + fullWageYears;

    // Apply Article 85 resignation coefficient
    let coefficient = 1;
    let coefficientLabel = "١٠٠٪ (كامل الاستحقاق)";
    if (cause === "resign") {
      if (totalYears < 2) {
        coefficient = 0;
        coefficientLabel = "٠٪ (الاستقالة قبل سنتين)";
      } else if (totalYears < 5) {
        coefficient = 1 / 3;
        coefficientLabel = "٣٣٫٣٪ (استقالة بين ٢-٥ سنوات)";
      } else if (totalYears < 10) {
        coefficient = 2 / 3;
        coefficientLabel = "٦٦٫٧٪ (استقالة بين ٥-١٠ سنوات)";
      } else {
        coefficient = 1;
        coefficientLabel = "١٠٠٪ (استقالة بعد ١٠ سنوات)";
      }
    } else if (cause === "employer" || cause === "retirement" || cause === "mutual") {
      coefficient = 1;
      coefficientLabel =
        cause === "retirement"
          ? "١٠٠٪ (بلوغ سن التقاعد، م.٨٧)"
          : cause === "mutual"
          ? "١٠٠٪ (إنهاء بالتراضي)"
          : "١٠٠٪ (إنهاء من صاحب العمل، م.٨٤)";
    }

    const finalAmount = fullAmount * coefficient;
    return {
      totalYears,
      halfWageYears,
      fullWageYears,
      fullAmount,
      coefficient,
      coefficientLabel,
      finalAmount,
    };
  }, [wage, years, months, cause]);

  if (!mounted) return <div className="card p-6 animate-pulse h-96" />;

  return (
    <div className="not-prose card p-6 my-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
            الأجر ومدّة الخدمة
          </h4>
          <MoneyField
            label="آخر أجر شهري (ريال) — الأساسي + البدلات الثابتة"
            value={wage}
            onChange={setWage}
            hint="لا تُحتسب العمولات المتغيّرة"
          />
          <div className="grid grid-cols-2 gap-2">
            <MoneyField label="سنوات الخدمة" value={years} onChange={setYears} />
            <MoneyField
              label="أشهر إضافية"
              value={months}
              onChange={(n) => setMonths(Math.min(11, Math.max(0, n)))}
              hint="٠-١١ شهر"
            />
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
            سبب انتهاء العلاقة
          </h4>
          <label className="block">
            <span className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
              اختر السبب — يحدّد المادة المطبَّقة
            </span>
            <select
              value={cause}
              onChange={(e) => setCause(e.target.value as TerminationCause)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm"
            >
              <option value="employer">إنهاء من صاحب العمل (م.٨٤)</option>
              <option value="resign">استقالة الموظف (م.٨٥)</option>
              <option value="retirement">بلوغ سن التقاعد (م.٨٧)</option>
              <option value="mutual">إنهاء بالتراضي</option>
            </select>
          </label>
          <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-900/40 rounded-lg p-3">
            <strong>تنبيه:</strong> الفصل التأديبي وفق المادة ٨٠ (خطأ جسيم) يُسقط الاستحقاق كاملاً — لا تستخدم هذه الحاسبة لتلك الحالة.
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        {wage > 0 && result.totalYears > 0 ? (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs opacity-90 mb-2">
              <Wallet className="w-4 h-4" />
              مكافأة نهاية الخدمة المستحقّة
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold tabular-nums">
              {formatSar(result.finalAmount)}
            </div>
            <div className="text-lg mt-1 opacity-95">ريال سعودي</div>
            <div className="mt-4 text-xs bg-white/15 backdrop-blur rounded-xl py-2 px-3 inline-block leading-relaxed">
              <div>
                الاستحقاق الكامل قبل التخفيض: {formatSar(result.fullAmount)} ريال
              </div>
              <div>معامل الاستحقاق: {result.coefficientLabel}</div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              أدخِل الأجر ومدّة الخدمة لعرض النتيجة.
            </div>
          </div>
        )}

        {wage > 0 && result.totalYears > 0 && (
          <details className="mt-4">
            <summary className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-emerald-700">
              تفاصيل الاحتساب (المادة ٨٤)
            </summary>
            <div className="mt-3 text-sm bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 space-y-1 leading-loose">
              <div>
                إجمالي مدّة الخدمة:{" "}
                <strong>{result.totalYears.toFixed(3)} سنة</strong>
              </div>
              <div>
                نصف أجر شهر × {Math.min(result.totalYears, 5).toFixed(3)} سنة =
                <strong> {formatSar(result.halfWageYears)}</strong> ريال (السنوات الخمس الأولى)
              </div>
              {result.totalYears > 5 && (
                <div>
                  أجر شهر كامل × {(result.totalYears - 5).toFixed(3)} سنة =
                  <strong> {formatSar(result.fullWageYears)}</strong> ريال (ما بعد الخمس الأولى)
                </div>
              )}
              <div>
                الاستحقاق الكامل: <strong>{formatSar(result.fullAmount)}</strong> ريال
              </div>
              <div>
                × معامل السبب ({(result.coefficient * 100).toFixed(1)}٪) =
                <strong> {formatSar(result.finalAmount)}</strong> ريال
              </div>
            </div>
          </details>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
        الحاسبة إعلامية فقط، مبنيّة على المواد ٨٤-٨٥-٨٧ من نظام العمل السعودي. لا تُحتسب العمولات المتغيّرة أو أيّام الإجازة غير المستحقّة أو الجزاءات المعلَّقة. للحالات المتنازع عليها راجع مكتب العمل عبر <a href="https://www.hrsd.gov.sa" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">وزارة الموارد البشرية</a> أو المحكمة العمّالية.
      </p>
    </div>
  );
}

function MoneyField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
        {label}
      </span>
      <input
        type="number"
        value={value || ""}
        min={0}
        step={0.01}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-base font-semibold tabular-nums"
        placeholder="0"
      />
      {hint && <span className="block text-[10px] text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

function formatSar(n: number): string {
  return n.toLocaleString("ar-SA-u-nu-latn", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
