"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "فشل الدخول");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">لوحة تحكم مقالات</h1>
        <label className="block mb-2 text-sm text-slate-300">كلمة السر</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full rounded-lg bg-slate-950/70 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {error ? (
          <div className="mt-3 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-semibold py-3 transition"
        >
          {loading ? "..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
