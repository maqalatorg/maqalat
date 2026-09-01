"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PagesTab } from "./tabs/PagesTab";
import { VisitorsTab } from "./tabs/VisitorsTab";
import { EditorTab } from "./tabs/EditorTab";

type TabId = "pages" | "visitors" | "editor";

const TABS: { id: TabId; label: string }[] = [
  { id: "pages", label: "١. كل الروابط (زيارات + نقرات)" },
  { id: "visitors", label: "٢. الزوّار والمدن لكل رابط" },
  { id: "editor", label: "٣. تعديل / حذف / رفع وسائط" },
];

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("pages");
  const [days, setDays] = useState(30);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم مقالات</h1>
          <p className="text-slate-400 text-sm mt-1">تحليلات مباشرة + تحرير محتوى</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
          >
            <option value={1}>آخر يوم</option>
            <option value={7}>آخر ٧ أيام</option>
            <option value={30}>آخر ٣٠ يوم</option>
            <option value={90}>آخر ٩٠ يوم</option>
          </select>
          <button
            onClick={logout}
            className="rounded-md bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm border border-slate-700"
          >
            خروج
          </button>
        </div>
      </header>

      <nav className="flex gap-2 border-b border-slate-800 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              tab === t.id
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "pages" && <PagesTab days={days} />}
      {tab === "visitors" && <VisitorsTab days={days} />}
      {tab === "editor" && <EditorTab />}
    </div>
  );
}
