"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ArticleItem = {
  slug: string;
  title: string;
  cluster: string;
  publishedAt: string;
  hasAr: boolean;
  hasEn: boolean;
  arPath: string | null;
  enPath: string | null;
};

export function EditorTab() {
  const [list, setList] = useState<ArticleItem[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<{ slug: string; locale: "ar" | "en" } | null>(null);
  const [content, setContent] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    fetch("/api/admin/articles/list")
      .then((r) => r.json())
      .then((j) => setList(j.ok ? j.items : []));
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return list;
    const q = filter.toLowerCase();
    return list.filter(
      (a) =>
        a.slug.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        (a.arPath || "").toLowerCase().includes(q) ||
        (a.enPath || "").toLowerCase().includes(q),
    );
  }, [list, filter]);

  async function loadArticle(slug: string, locale: "ar" | "en") {
    setSelected({ slug, locale });
    setContent("");
    setMsg(null);
    const res = await fetch(`/api/admin/articles/file?slug=${slug}&locale=${locale}`);
    const j = await res.json();
    if (j.ok) setContent(j.content);
    else setMsg(j.error || "فشل التحميل");
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/articles/file", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: selected.slug, locale: selected.locale, content }),
    });
    const j = await res.json();
    setSaving(false);
    if (j.ok) {
      setMsg(
        j.remoteCommit
          ? `تم الحفظ محلياً + commit على GitHub (${j.commit?.slice(0, 7)})`
          : `تم الحفظ محلياً فقط${j.warning ? ` — تعذّر النشر البعيد: ${j.warning}` : " — لم يُهيّأ GITHUB_TOKEN"}`,
      );
    } else {
      setMsg(j.error || "فشل الحفظ");
    }
  }

  async function del() {
    if (!selected) return;
    if (!confirm(`تأكيد حذف ${selected.slug} (${selected.locale})؟`)) return;
    setSaving(true);
    const res = await fetch("/api/admin/articles/file", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: selected.slug, locale: selected.locale }),
    });
    const j = await res.json();
    setSaving(false);
    setMsg(j.ok ? "تم الحذف" : j.error || "فشل الحذف");
    if (j.ok) {
      setSelected(null);
      setContent("");
      const refresh = await fetch("/api/admin/articles/list").then((r) => r.json());
      setList(refresh.ok ? refresh.items : []);
    }
  }

  async function upload(file: File) {
    setUploading(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await res.json();
    setUploading(false);
    if (!j.ok) {
      setMsg(j.error || "فشل الرفع");
      return;
    }
    const isVideo = /^video\//.test(file.type);
    const snippet = isVideo
      ? `\n<video src="${j.url}" controls style={{width: "100%"}} />\n`
      : `\n![](${j.url})\n`;
    insertAtCursor(snippet);
    setMsg(`رُفع ✓ (${(j.size / 1024).toFixed(0)} KB) — تم إدراج المرجع`);
  }

  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    if (!ta) {
      setContent((c) => c + text);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = content.slice(0, start) + text + content.slice(end);
    setContent(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
      <aside>
        <input
          placeholder="بحث بالـ slug أو العنوان أو المسار /xxx"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full mb-3 rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-sm"
        />
        <div className="rounded-xl border border-slate-800 divide-y divide-slate-800 max-h-[70vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-slate-500 text-sm">لا توجد نتائج</div>
          ) : (
            filtered.map((a) => (
              <div key={a.slug} className="p-3">
                <div className="text-sm font-semibold text-slate-200 truncate">{a.title}</div>
                <div className="text-xs text-slate-500 font-mono truncate">{a.slug}</div>
                <div className="flex gap-2 mt-2">
                  {a.hasAr ? (
                    <button
                      onClick={() => loadArticle(a.slug, "ar")}
                      className={`text-xs px-2 py-1 rounded border ${
                        selected?.slug === a.slug && selected.locale === "ar"
                          ? "bg-emerald-600 border-emerald-500"
                          : "bg-slate-900 border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      AR
                    </button>
                  ) : null}
                  {a.hasEn ? (
                    <button
                      onClick={() => loadArticle(a.slug, "en")}
                      className={`text-xs px-2 py-1 rounded border ${
                        selected?.slug === a.slug && selected.locale === "en"
                          ? "bg-emerald-600 border-emerald-500"
                          : "bg-slate-900 border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      EN
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <section>
        {!selected ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-slate-500">
            اختر مقالاً من القائمة أو ابحث بمسار مثل <code>/countdown-ramadan-eid-national-day</code>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-slate-300 font-mono text-sm">
                  {selected.slug} <span className="text-slate-500">— {selected.locale}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <label className="text-xs px-3 py-2 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 cursor-pointer">
                  {uploading ? "جاري الرفع..." : "رفع صورة/فيديو"}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) upload(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  onClick={save}
                  disabled={saving}
                  className="text-xs px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 font-semibold"
                >
                  {saving ? "..." : "حفظ + نشر"}
                </button>
                <button
                  onClick={del}
                  disabled={saving}
                  className="text-xs px-3 py-2 rounded bg-red-900 hover:bg-red-800 disabled:opacity-40"
                >
                  حذف
                </button>
              </div>
            </div>

            {msg ? (
              <div className="mb-3 text-xs rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-slate-300">
                {msg}
              </div>
            ) : null}

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              className="w-full min-h-[65vh] rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-sm leading-relaxed text-slate-200"
              dir="ltr"
            />
          </>
        )}
      </section>
    </div>
  );
}
