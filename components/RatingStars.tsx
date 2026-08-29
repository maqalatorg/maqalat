"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getDb } from "@/lib/firebase";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Article rating widget — 5 stars, one vote per browser (localStorage guard).
 * Firestore document schema:
 *   ratings/{slug} = { sum: number, count: number, updatedAt: Timestamp }
 */
export function RatingStars({ slug }: { slug: string }) {
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const storageKey = `maqalat-rating-${slug}`;

  useEffect(() => {
    const prior = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (prior) setMyVote(Number(prior));

    const db = getDb();
    if (!db) return;
    getDoc(doc(db, "ratings", slug)).then((snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as { sum: number; count: number };
      if (data.count > 0) {
        setAvg(data.sum / data.count);
        setCount(data.count);
      }
    });
  }, [slug, storageKey]);

  const submit = async (stars: number) => {
    const db = getDb();
    if (!db || busy || myVote != null) return;
    setBusy(true);
    try {
      const ref = doc(db, "ratings", slug);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const cur = snap.exists()
          ? (snap.data() as { sum: number; count: number })
          : { sum: 0, count: 0 };
        tx.set(ref, {
          sum: cur.sum + stars,
          count: cur.count + 1,
          updatedAt: serverTimestamp(),
        });
      });
      localStorage.setItem(storageKey, String(stars));
      setMyVote(stars);
      setAvg((prev) => {
        const newSum = (prev ?? 0) * count + stars;
        const newCount = count + 1;
        return newSum / newCount;
      });
      setCount((c) => c + 1);
    } finally {
      setBusy(false);
    }
  };

  const display = hover ?? myVote ?? 0;

  return (
    <div className="flex items-center gap-3">
      <div
        className="inline-flex items-center gap-1"
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = display >= n;
          const disabled = myVote != null || busy;
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => submit(n)}
              onMouseEnter={() => !disabled && setHover(n)}
              className="disabled:cursor-default hover:scale-110 transition-transform"
              aria-label={`قيّم ${n} من 5`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  active
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300 dark:text-slate-600"
                }`}
              />
            </button>
          );
        })}
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {avg != null ? (
          <>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {avg.toFixed(1)}
            </span>{" "}
            من 5 · {count} تقييم
          </>
        ) : (
          <span>كن أول من يقيّم</span>
        )}
        {myVote && <span className="ms-2 text-emerald-600">✓ شكراً لتقييمك</span>}
      </div>
    </div>
  );
}
