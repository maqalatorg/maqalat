"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";

/**
 * BMI (Body Mass Index) calculator per WHO classification.
 * Also computes ideal weight range (Devine formula bounds).
 */

type Unit = "metric" | "imperial";

const CATEGORIES = [
  { max: 18.5, labelAr: "نحافة", colorClass: "from-sky-500 to-sky-700" },
  { max: 25, labelAr: "وزن طبيعي", colorClass: "from-emerald-500 to-emerald-700" },
  { max: 30, labelAr: "زيادة وزن", colorClass: "from-amber-500 to-amber-600" },
  { max: 35, labelAr: "سمنة (درجة ١)", colorClass: "from-orange-500 to-orange-700" },
  { max: 40, labelAr: "سمنة (درجة ٢)", colorClass: "from-red-500 to-red-700" },
  { max: Infinity, labelAr: "سمنة مفرطة (درجة ٣)", colorClass: "from-red-700 to-red-900" },
];

export function BMICalculator() {
  const [mounted, setMounted] = useState(false);
  const [unit, setUnit] = useState<Unit>("metric");
  const [height, setHeight] = useState(170); // cm
  const [weight, setWeight] = useState(70); // kg
  const [heightFt, setHeightFt] = useState(5); // ft
  const [heightIn, setHeightIn] = useState(7);
  const [weightLb, setWeightLb] = useState(154);
  const [gender, setGender] = useState<"male" | "female">("male");

  useEffect(() => setMounted(true), []);

  const result = useMemo(() => {
    let hM: number, wKg: number;
    if (unit === "metric") {
      hM = height / 100;
      wKg = weight;
    } else {
      hM = (heightFt * 12 + heightIn) * 0.0254;
      wKg = weightLb * 0.453592;
    }
    if (hM <= 0 || wKg <= 0) return null;
    const bmi = wKg / (hM * hM);
    const category = CATEGORIES.find((c) => bmi < c.max) ?? CATEGORIES[0];

    // Ideal weight range (BMI 18.5–24.9)
    const idealMin = 18.5 * hM * hM;
    const idealMax = 24.9 * hM * hM;

    return {
      bmi,
      category,
      idealMin,
      idealMax,
      currentKg: wKg,
      diff: wKg - (idealMin + idealMax) / 2,
    };
  }, [unit, height, weight, heightFt, heightIn, weightLb]);

  if (!mounted) return <div className="card p-6 animate-pulse h-96" />;

  return (
    <div className="not-prose card p-6 my-8">
      {/* Unit toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[
          { key: "metric" as Unit, label: "متري (سم/كغ)" },
          { key: "imperial" as Unit, label: "إمبراطوري (قدم/رطل)" },
        ].map((u) => (
          <button
            key={u.key}
            type="button"
            onClick={() => setUnit(u.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              unit === u.key
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>

      {/* Gender (informational — not used in BMI itself) */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setGender("male")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            gender === "male"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600"
          }`}
        >
          ذكر
        </button>
        <button
          type="button"
          onClick={() => setGender("female")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            gender === "female"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600"
          }`}
        >
          أنثى
        </button>
      </div>

      {/* Inputs */}
      {unit === "metric" ? (
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="الطول (سم)" value={height} min={50} max={250} onChange={setHeight} />
          <NumberField label="الوزن (كغ)" value={weight} min={10} max={300} onChange={setWeight} />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <NumberField label="الطول (قدم)" value={heightFt} min={2} max={8} onChange={setHeightFt} />
          <NumberField label="الطول (بوصة)" value={heightIn} min={0} max={11} onChange={setHeightIn} />
          <NumberField label="الوزن (رطل)" value={weightLb} min={20} max={660} onChange={setWeightLb} />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${result.category.colorClass} text-white p-6 text-center`}>
            <div className="inline-flex items-center gap-1.5 text-xs opacity-90 mb-1">
              <Activity className="w-4 h-4" />
              مؤشر كتلة الجسم
            </div>
            <div className="text-5xl font-extrabold tabular-nums">
              {result.bmi.toFixed(1)}
            </div>
            <div className="text-lg font-medium mt-1 opacity-95">
              {result.category.labelAr}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBox
              label="الوزن المثالي لطولك"
              main={`${result.idealMin.toFixed(1)} – ${result.idealMax.toFixed(1)} كغ`}
              sub="نطاق طبيعي حسب WHO (BMI 18.5 – 24.9)"
            />
            <InfoBox
              label={result.diff > 0 ? "فوق الوزن المثالي بـ" : "تحت الوزن المثالي بـ"}
              main={`${Math.abs(result.diff).toFixed(1)} كغ`}
              sub={result.diff > 0 ? "قد يحتاج تخفيف" : "قد يحتاج زيادة"}
            />
          </div>

          {/* BMI scale */}
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">مقياس BMI</div>
            <div className="flex h-3 rounded-full overflow-hidden">
              {CATEGORIES.slice(0, 5).map((c) => (
                <div
                  key={c.labelAr}
                  className={`flex-1 bg-gradient-to-l ${c.colorClass}`}
                  title={c.labelAr}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
              <span>40</span>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
        BMI مؤشر عام سريع، لكنه لا يميّز بين العضلات والدهون. الرياضيون قد يظهرون في خانة «زيادة وزن» بسبب كتلة العضلات. للتقييم الأدقّ يستخدم الأطباء نسبة الدهون + محيط الخصر إلى الورك + التحاليل. راجع طبيباً قبل أي حمية أو برنامج رياضي مكثّف.
      </p>
    </div>
  );
}

function NumberField({
  label, value, min, max, onChange,
}: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(parseFloat(e.target.value) || min)}
        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-lg font-semibold text-center tabular-nums"
      />
    </label>
  );
}

function InfoBox({ label, main, sub }: { label: string; main: string; sub: string }) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{main}</div>
      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}
