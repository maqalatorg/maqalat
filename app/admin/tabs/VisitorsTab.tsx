"use client";

import { useEffect, useState } from "react";

type PageOption = { path: string; views: number };

type CityStat = { city: string; country: string; views: number; visitors: number };
type VisitorStat = {
  visitorId: string;
  visits: number;
  city: string;
  country: string;
  firstSeen: string;
  lastSeen: string;
};
type ClickItem = { target: string; type: string; createdAt: string; city?: string; country?: string };

type Detail = {
  ok: boolean;
  path: string;
  totals: { views: number; visitors: number; clicks: number };
  cities: CityStat[];
  visitors: VisitorStat[];
  clicks: ClickItem[];
};

export function VisitorsTab({ days }: { days: number }) {
  const [pages, setPages] = useState<PageOption[]>([]);
  const [path, setPath] = useState<string>("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/analytics/pages?days=${days}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setPages(j.stats.map((s: { path: string; views: number }) => ({ path: s.path, views: s.views })));
          if (!path && j.stats.length > 0) setPath(j.stats[0].path);
        }
      });
  }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!path) return;
    setLoading(true);
    fetch(`/api/admin/analytics/page?path=${encodeURIComponent(path)}&days=${days}`)
      .then((r) => r.json())
      .then((j) => setDetail(j.ok ? j : null))
      .finally(() => setLoading(false));
  }, [path, days]);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <select
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-sm"
        >
          {pages.length === 0 ? <option>لا توجد صفحات بعد</option> : null}
          {pages.map((p) => (
            <option key={p.path} value={p.path}>
              {p.path} ({p.views.toLocaleString("ar-EG")})
            </option>
          ))}
        </select>
        <input
          placeholder="أو الصق مساراً يدوياً..."
          onKeyDown={(e) => {
            if (e.key === "Enter") setPath((e.target as HTMLInputElement).value);
          }}
          className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-sm"
        />
      </div>

      {loading ? <div className="text-slate-400">تحميل...</div> : null}

      {detail ? (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Kpi label="زيارات هذه الصفحة" value={detail.totals.views} />
            <Kpi label="زوّار فريدون" value={detail.totals.visitors} />
            <Kpi label="نقرات" value={detail.totals.clicks} />
          </div>

          <section className="mb-8">
            <h3 className="font-semibold mb-3 text-slate-200">المدن</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/60 text-slate-300">
                  <tr>
                    <th className="text-right px-4 py-3">المدينة</th>
                    <th className="text-right px-4 py-3">البلد</th>
                    <th className="text-right px-4 py-3">زيارات</th>
                    <th className="text-right px-4 py-3">زوّار</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.cities.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-500">لا مدن</td>
                    </tr>
                  ) : (
                    detail.cities.map((c, i) => (
                      <tr key={i} className="border-t border-slate-800">
                        <td className="px-4 py-2">{c.city}</td>
                        <td className="px-4 py-2 text-slate-400">{c.country || "—"}</td>
                        <td className="px-4 py-2">{c.views.toLocaleString("ar-EG")}</td>
                        <td className="px-4 py-2">{c.visitors.toLocaleString("ar-EG")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="font-semibold mb-3 text-slate-200">الزوّار الأفراد</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/60 text-slate-300">
                  <tr>
                    <th className="text-right px-4 py-3">Visitor ID</th>
                    <th className="text-right px-4 py-3">المدينة</th>
                    <th className="text-right px-4 py-3">زيارات</th>
                    <th className="text-right px-4 py-3">أول زيارة</th>
                    <th className="text-right px-4 py-3">آخر زيارة</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.visitors.slice(0, 200).map((v) => (
                    <tr key={v.visitorId} className="border-t border-slate-800">
                      <td className="px-4 py-2 font-mono text-xs text-emerald-300">
                        {v.visitorId.slice(0, 12)}…
                      </td>
                      <td className="px-4 py-2">
                        {v.city} <span className="text-slate-500 text-xs">{v.country}</span>
                      </td>
                      <td className="px-4 py-2">{v.visits}</td>
                      <td className="px-4 py-2 text-slate-400 text-xs">{new Date(v.firstSeen).toLocaleString("ar-EG")}</td>
                      <td className="px-4 py-2 text-slate-400 text-xs">{new Date(v.lastSeen).toLocaleString("ar-EG")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {detail.clicks.length > 0 ? (
            <section>
              <h3 className="font-semibold mb-3 text-slate-200">آخر ١٠٠ نقرة</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800 text-xs">
                <table className="w-full">
                  <thead className="bg-slate-900/60 text-slate-300">
                    <tr>
                      <th className="text-right px-3 py-2">النوع</th>
                      <th className="text-right px-3 py-2">الوجهة</th>
                      <th className="text-right px-3 py-2">المدينة</th>
                      <th className="text-right px-3 py-2">وقت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.clicks.map((c, i) => (
                      <tr key={i} className="border-t border-slate-800">
                        <td className="px-3 py-2">{c.type}</td>
                        <td className="px-3 py-2 max-w-md truncate">{c.target}</td>
                        <td className="px-3 py-2">{c.city || "—"}</td>
                        <td className="px-3 py-2 text-slate-400">{new Date(c.createdAt).toLocaleString("ar-EG")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
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
