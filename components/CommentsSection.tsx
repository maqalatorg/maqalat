"use client";

import { MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { getDb } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";

type Comment = {
  id: string;
  name: string;
  email: string; // stored but never displayed
  body: string;
  createdAt: Timestamp | null;
};

export function CommentsSection({ slug }: { slug: string }) {
  const [items, setItems] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const db = getDb();
    if (!db) return;
    const q = query(
      collection(db, "comments"),
      where("slug", "==", slug),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Comment, "id">) })),
      );
    });
    return () => unsub();
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedBody = body.trim();

    if (trimmedName.length < 2) return setError("الاسم قصير جداً");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return setError("إيميل غير صحيح");
    if (trimmedBody.length < 3) return setError("التعليق قصير جداً");
    if (trimmedBody.length > 2000) return setError("التعليق طويل جداً (الحد ٢٠٠٠ حرف)");

    const db = getDb();
    if (!db) return setError("قاعدة البيانات غير متوفرة حالياً");

    setStatus("sending");
    try {
      await addDoc(collection(db, "comments"), {
        slug,
        name: trimmedName,
        email: trimmedEmail,
        body: trimmedBody,
        createdAt: serverTimestamp(),
      });
      setName("");
      setEmail("");
      setBody("");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setError("تعذّر إرسال التعليق. حاول لاحقاً.");
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-emerald-600" />
        التعليقات {items.length > 0 && <span className="text-base font-normal text-slate-500">({items.length})</span>}
      </h2>

      {/* Form */}
      <form onSubmit={submit} className="card p-5 mb-8 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم"
            className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm"
            required
            maxLength={80}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني (لن يُنشر)"
            className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm"
            required
            maxLength={200}
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="اكتب تعليقك هنا…"
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm resize-y"
          required
          maxLength={2000}
        />
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            بريدك لن يظهر ولن يُرسل إليه شيء — يُستخدم فقط لمنع الإزعاج.
          </p>
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-60 transition-colors"
          >
            <Send className="w-4 h-4" />
            {status === "sending" ? "جاري الإرسال…" : status === "sent" ? "أُرسل ✓" : "أرسل"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            لا تعليقات بعد — كن أول من يكتب.
          </div>
        )}
        {items.map((c) => {
          const initial = c.name?.charAt(0) || "؟";
          const time = c.createdAt?.toDate?.().toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return (
            <div key={c.id} className="card p-4 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center text-white font-bold shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</span>
                  {time && <span className="text-xs text-slate-500">· {time}</span>}
                </div>
                <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {c.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
