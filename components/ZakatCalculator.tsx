"use client";

import { useEffect, useMemo, useState } from "react";
import { Coins } from "lucide-react";

/**
 * Zakat calculator — money + gold + silver + trade goods.
 * Nisab (threshold): 85 grams of gold or its equivalent in local currency.
 * Rate: 2.5% (rub' al-'ushr) on wealth held for a full lunar year (Hawl).
 */

const ZAKAT_RATE = 0.025;
const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;

export function ZakatCalculator() {
  const [mounted, setMounted] = useState(false);
  const [goldGramPrice, setGoldGramPrice] = useState(310); // ~SAR per gram of 24k (indicative)
  const [silverGramPrice, setSilverGramPrice] = useState(3.5);
  const [cash, setCash] = useState(0);
  const [bank, setBank] = useState(0);
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
  const [trade, setTrade] = useState(0);
  const [debts, setDebts] = useState(0);

  useEffect(() => setMounted(true), []);

  const result = useMemo(() => {
    const goldValue = gold * goldGramPrice;
    const silverValue = silver * silverGramPrice;
    const totalAssets = cash + bank + goldValue + silverValue + trade;
    const zakatableAmount = Math.max(0, totalAssets - debts);
    const nisabSAR = GOLD_NISAB_GRAMS * goldGramPrice;
    const meetsNisab = zakatableAmount >= nisabSAR;
    const zakatDue = meetsNisab ? zakatableAmount * ZAKAT_RATE : 0;
    return {
      goldValue,
      silverValue,
      totalAssets,
      zakatableAmount,
      nisabSAR,
      meetsNisab,
      zakatDue,
    };
  }, [cash, bank, gold, silver, trade, debts, goldGramPrice, silverGramPrice]);

  if (!mounted) return <div className="card p-6 animate-pulse h-96" />;

  return (
    <div className="not-prose card p-6 my-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
            الأموال
          </h4>
          <MoneyField label="النقد في يدك (ريال)" value={cash} onChange={setCash} />
          <MoneyField
            label="الرصيد البنكي والمدّخرات (ريال)"
            value={bank}
            onChange={setBank}
          />
          <MoneyField
            label="قيمة عروض التجارة والاستثمار (ريال)"
            value={trade}
            onChange={setTrade}
          />
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
            الذهب والفضة
          </h4>
          <MoneyField
            label="جرامات الذهب المملوكة"
            value={gold}
            onChange={setGold}
            hint={`سعر الجرام: ${goldGramPrice} ريال`}
          />
          <MoneyField
            label="جرامات الفضة المملوكة"
            value={silver}
            onChange={setSilver}
            hint={`سعر الجرام: ${silverGramPrice} ريال`}
          />
          <MoneyField
            label="الديون المستحقّة عليك (ريال)"
            value={debts}
            onChange={setDebts}
          />
        </div>
      </div>

      {/* Advanced: gold/silver spot prices */}
      <details className="mt-4">
        <summary className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-emerald-700">
          تعديل أسعار الذهب/الفضة الحالية
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <MoneyField
            label="سعر جرام الذهب اليوم (ريال)"
            value={goldGramPrice}
            onChange={setGoldGramPrice}
          />
          <MoneyField
            label="سعر جرام الفضة اليوم (ريال)"
            value={silverGramPrice}
            onChange={setSilverGramPrice}
          />
        </div>
      </details>

      {/* Result */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        {result.meetsNisab ? (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs opacity-90 mb-2">
              <Coins className="w-4 h-4" />
              زكاتك المستحقّة
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold tabular-nums">
              {formatSar(result.zakatDue)}
            </div>
            <div className="text-lg mt-1 opacity-95">ريال سعودي</div>
            <div className="mt-4 text-sm bg-white/15 backdrop-blur rounded-xl py-2 px-3 inline-block">
              ٢٫٥٪ من {formatSar(result.zakatableAmount)} ريال (بعد خصم الديون)
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              لم تبلغ ثروتك النصاب
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              النصاب حالياً = {formatSar(result.nisabSAR)} ريال (قيمة ٨٥ جرام ذهب)
              <br />
              ثروتك الصافية: {formatSar(result.zakatableAmount)} ريال
            </div>
            <div className="text-sm text-slate-500 mt-2">لا تجب الزكاة عليك هذه السنة.</div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
        الحساب وفق مذهب الجمهور: نسبة الزكاة ٢٫٥٪ على ما بلغ النصاب وحال عليه الحول (سنة هجرية). النصاب معتمَد على ٨٥ جرام ذهب. أسعار الذهب/الفضة إرشادية — عدّلها للسعر الفعلي في يومك. للحالات الخاصة (الأنعام، الزروع، الركاز) راجع مصادر فقهية متخصّصة أو دار الإفتاء.
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
