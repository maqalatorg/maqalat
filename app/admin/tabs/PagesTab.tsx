"use client";

import { useEffect, useState } from "react";

type PageStat = {
  path: string;
  slug: string;
  locale: string;
  views: number;
  uniqueVisitors: number;
  clicks: number;
  lastSeen: string | null;
};

type Response = {
  ok: boolean;
  days: number;
  totals: { views: number; clicks: number; uniqueVisitors: number; pages: number };
  stats: PageStat[];
};

export function PagesTab({ days }: { days: number }) {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/analytics/pages?days=${days}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) throw new Error(j.error || "خطأ");
        setData(j);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="text-slate-400">تحميل...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!data) return null;

  const rows = data.stats.filter(
    (s) => !filter || s.path.toLowerCase().includes(filter.toLowerCase()) || s.slug.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi label="إجمالي الزيارات" value={data.totals.views} />
        <Kpi label="زوّار فريدون" value={data.totals.uniqueVisitors} />
        <Kpi label="إجمالي النقرات" value={data.totals.clicks} />
        <Kpi label="عدد الصفحات النشطة" value={data.totals.pages} />
      </div>

      <input
        placeholder="بحث بالمسار أو الـ slug..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full mb-4 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-sm"
      />

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60 text-slate-300">
            <tr>
              <th className="text-right px-4 py-3">المسار</th>
              <th className="text-right px-4 py-3">اللغة</th>
              <th className="text-right px-4 py-3">زيارات</th>
              <th className="text-right px-4 py-3">فريدون</th>
              <th className="text-right px-4 py-3">نقرات</th>
              <th className="text-right px-4 py-3">CTR</th>
              <th className="text-right px-4 py-3">آخر ظهور</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500">
                  لا بيانات بعد — لن تُملأ الجدول حتى يبدأ التتبّع بعد النشر.
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.path} className="border-t border-slate-800 hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-xs text-emerald-300">
                    <a href={s.path} target="_blank" rel="noreferrer" className="hover:underline">
                      {s.path}
                    </a>
                  </td>
                  <td className="px-4 py-3">{s.locale}</td>
                  <td className="px-4 py-3">{s.views.toLocaleString("ar-EG")}</td>
                  <td className="px-4 py-3">{s.uniqueVisitors.toLocaleString("ar-EG")}</td>
                  <td className="px-4 py-3">{s.clicks.toLocaleString("ar-EG")}</td>
                  <td className="px-4 py-3">
                    {s.views > 0 ? `${((s.clicks / s.views) * 100).toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {s.lastSeen ? new Date(s.lastSeen).toLocaleString("ar-EG") : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="text-2xl font-bold mt-1">{value.toLocaleString("ar-EG")}</div>
    </div>
  );
}
