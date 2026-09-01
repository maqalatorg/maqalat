import { NextRequest, NextResponse } from "next/server";
import { recordPageview, recordClick } from "@/lib/analytics";
import { getDb } from "@/lib/firebase";

export const runtime = "nodejs";

// GET /api/track — diagnostic: is Firestore configured?
export async function GET() {
  const configured = Boolean(getDb());
  const envSet = {
    NEXT_PUBLIC_FIREBASE_API_KEY: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
  };
  return NextResponse.json({ ok: configured, firestoreConfigured: configured, envSet });
}

/**
 * POST /api/track
 *
 * Body: { kind: "pageview", path, locale, visitorId, referrer? }
 *   or: { kind: "click", slug, target, type, visitorId }
 *
 * Server enriches with geo (Vercel headers) + user agent.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kind = body.kind as string;

    // Vercel edge injects these headers on every request in production
    const geoCity = req.headers.get("x-vercel-ip-city");
    const geoCountry = req.headers.get("x-vercel-ip-country");
    const geoRegion = req.headers.get("x-vercel-ip-country-region");
    const userAgent = req.headers.get("user-agent") || undefined;

    const city = geoCity ? decodeURIComponent(geoCity) : undefined;
    const country = geoCountry || undefined;
    const region = geoRegion || undefined;

    if (kind === "pageview") {
      const path = String(body.path || "/").slice(0, 300);
      const slug = path.replace(/^\/(en\/)?/, "").replace(/\/$/, "") || "__home__";
      await recordPageview({
        slug,
        path,
        locale: String(body.locale || "ar"),
        visitorId: String(body.visitorId || "").slice(0, 64),
        city,
        country,
        region,
        referrer: body.referrer ? String(body.referrer).slice(0, 300) : undefined,
        userAgent,
      });
      return NextResponse.json({ ok: true });
    }

    if (kind === "click") {
      await recordClick({
        slug: String(body.slug || "").slice(0, 200),
        target: String(body.target || "").slice(0, 500),
        type: (body.type as "outbound" | "adsense" | "internal" | "cta" | "other") || "other",
        visitorId: String(body.visitorId || "").slice(0, 64),
        city,
        country,
        region,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "unknown kind" }, { status: 400 });
  } catch (err) {
    // Fail silently to avoid disrupting UX — analytics is best-effort.
    // Include hint in body for diagnostics (safe, not user-visible in normal flow).
    console.error("[track] error:", err);
    return NextResponse.json(
      { ok: false, hint: String(err instanceof Error ? err.message : err).slice(0, 200) },
      { status: 200 },
    );
  }
}
