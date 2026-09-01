/**
 * Analytics — Firestore-backed pageview + click tracking.
 *
 * Collections:
 *   pageviews/  → { slug, path, locale, visitorId, city, country, region, referrer, userAgent, createdAt }
 *   clicks/     → { slug, target, type, visitorId, city, country, region, createdAt }
 *
 * Free-tier budget: 20K writes/day, 50K reads/day. Each pageview = 1 write.
 * If traffic grows past ~15K pageviews/day, migrate aggregation to a scheduled roll-up job.
 */

import { getDb } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit as fsLimit,
  Timestamp,
} from "firebase/firestore";

export type PageviewInput = {
  slug: string;
  path: string;
  locale: string;
  visitorId: string;
  city?: string;
  country?: string;
  region?: string;
  referrer?: string;
  userAgent?: string;
};

export type ClickInput = {
  slug: string;
  target: string;
  type: "outbound" | "adsense" | "internal" | "cta" | "other";
  visitorId: string;
  city?: string;
  country?: string;
  region?: string;
};

/** Firestore rejects `undefined` field values — strip them before writing. */
function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out as Partial<T>;
}

export async function recordPageview(input: PageviewInput): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firestore not configured");
  await addDoc(collection(db, "pageviews"), {
    ...stripUndefined(input),
    createdAt: serverTimestamp(),
  });
}

export async function recordClick(input: ClickInput): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firestore not configured");
  await addDoc(collection(db, "clicks"), {
    ...stripUndefined(input),
    createdAt: serverTimestamp(),
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Read helpers (admin dashboard)
// ────────────────────────────────────────────────────────────────────────────

export type RawPageview = {
  slug: string;
  path: string;
  locale: string;
  visitorId: string;
  city?: string;
  country?: string;
  region?: string;
  referrer?: string;
  createdAt: Date;
};

export type RawClick = {
  slug: string;
  target: string;
  type: string;
  visitorId: string;
  city?: string;
  country?: string;
  region?: string;
  createdAt: Date;
};

function tsToDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  return new Date();
}

/** Fetch all pageviews since `sinceDays` days ago. */
export async function fetchPageviews(sinceDays = 30): Promise<RawPageview[]> {
  const db = getDb();
  if (!db) return [];
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, "pageviews"),
    where("createdAt", ">=", Timestamp.fromDate(since)),
    orderBy("createdAt", "desc"),
    fsLimit(10000),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      slug: (data.slug as string) || "",
      path: (data.path as string) || "",
      locale: (data.locale as string) || "ar",
      visitorId: (data.visitorId as string) || "",
      city: data.city as string | undefined,
      country: data.country as string | undefined,
      region: data.region as string | undefined,
      referrer: data.referrer as string | undefined,
      createdAt: tsToDate(data.createdAt),
    };
  });
}

/** Fetch clicks since `sinceDays` days ago. */
export async function fetchClicks(sinceDays = 30): Promise<RawClick[]> {
  const db = getDb();
  if (!db) return [];
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, "clicks"),
    where("createdAt", ">=", Timestamp.fromDate(since)),
    orderBy("createdAt", "desc"),
    fsLimit(10000),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      slug: (data.slug as string) || "",
      target: (data.target as string) || "",
      type: (data.type as string) || "other",
      visitorId: (data.visitorId as string) || "",
      city: data.city as string | undefined,
      country: data.country as string | undefined,
      region: data.region as string | undefined,
      createdAt: tsToDate(data.createdAt),
    };
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Aggregations (used by admin dashboard APIs)
// ────────────────────────────────────────────────────────────────────────────

export type PageStat = {
  path: string;
  slug: string;
  locale: string;
  views: number;
  uniqueVisitors: number;
  clicks: number;
  lastSeen: Date | null;
};

/** Aggregate pageviews + clicks per path. */
export function aggregateByPage(views: RawPageview[], clicks: RawClick[]): PageStat[] {
  const byPath = new Map<string, PageStat>();

  for (const v of views) {
    const key = v.path || "/";
    if (!byPath.has(key)) {
      byPath.set(key, {
        path: key,
        slug: v.slug,
        locale: v.locale,
        views: 0,
        uniqueVisitors: 0,
        clicks: 0,
        lastSeen: null,
      });
    }
    const s = byPath.get(key)!;
    s.views += 1;
    if (!s.lastSeen || v.createdAt > s.lastSeen) s.lastSeen = v.createdAt;
  }

  // Unique visitors per path
  const uniquePerPath = new Map<string, Set<string>>();
  for (const v of views) {
    const key = v.path || "/";
    if (!uniquePerPath.has(key)) uniquePerPath.set(key, new Set());
    if (v.visitorId) uniquePerPath.get(key)!.add(v.visitorId);
  }
  for (const [key, set] of uniquePerPath) {
    if (byPath.has(key)) byPath.get(key)!.uniqueVisitors = set.size;
  }

  // Clicks per slug (fall back — clicks store slug, not full path)
  for (const c of clicks) {
    const s = [...byPath.values()].find((p) => p.slug === c.slug);
    if (s) s.clicks += 1;
  }

  return [...byPath.values()].sort((a, b) => b.views - a.views);
}

export type CityStat = { city: string; country: string; views: number; visitors: number };

/** Per-page city breakdown. */
export function cityBreakdown(views: RawPageview[], path: string): CityStat[] {
  const relevant = views.filter((v) => (v.path || "/") === path);
  const byCity = new Map<string, { city: string; country: string; views: number; visitors: Set<string> }>();
  for (const v of relevant) {
    const city = v.city || "غير معروف";
    const country = v.country || "";
    const key = `${city}|${country}`;
    if (!byCity.has(key)) {
      byCity.set(key, { city, country, views: 0, visitors: new Set() });
    }
    const entry = byCity.get(key)!;
    entry.views += 1;
    if (v.visitorId) entry.visitors.add(v.visitorId);
  }
  return [...byCity.values()]
    .map((e) => ({ city: e.city, country: e.country, views: e.views, visitors: e.visitors.size }))
    .sort((a, b) => b.views - a.views);
}

export type VisitorStat = {
  visitorId: string;
  visits: number;
  city: string;
  country: string;
  firstSeen: Date;
  lastSeen: Date;
};

/** Per-page visitor list (individual visitors for a specific path). */
export function visitorBreakdown(views: RawPageview[], path: string): VisitorStat[] {
  const relevant = views.filter((v) => (v.path || "/") === path);
  const byVisitor = new Map<string, VisitorStat>();
  for (const v of relevant) {
    if (!v.visitorId) continue;
    if (!byVisitor.has(v.visitorId)) {
      byVisitor.set(v.visitorId, {
        visitorId: v.visitorId,
        visits: 0,
        city: v.city || "غير معروف",
        country: v.country || "",
        firstSeen: v.createdAt,
        lastSeen: v.createdAt,
      });
    }
    const s = byVisitor.get(v.visitorId)!;
    s.visits += 1;
    if (v.createdAt < s.firstSeen) s.firstSeen = v.createdAt;
    if (v.createdAt > s.lastSeen) s.lastSeen = v.createdAt;
  }
  return [...byVisitor.values()].sort((a, b) => b.visits - a.visits);
}
