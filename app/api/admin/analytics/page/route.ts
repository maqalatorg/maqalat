import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import {
  fetchPageviews,
  fetchClicks,
  cityBreakdown,
  visitorBreakdown,
} from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const path = req.nextUrl.searchParams.get("path");
  if (!path) return NextResponse.json({ ok: false, error: "missing path" }, { status: 400 });
  const days = Number(req.nextUrl.searchParams.get("days") || "30");

  const [views, clicks] = await Promise.all([fetchPageviews(days), fetchClicks(days)]);
  const cities = cityBreakdown(views, path);
  const visitors = visitorBreakdown(views, path);

  const pageClicks = clicks.filter(
    (c) => c.slug === (path.replace(/^\/(en\/)?/, "").replace(/\/$/, "") || "__home__"),
  );

  return NextResponse.json({
    ok: true,
    path,
    days,
    totals: {
      views: views.filter((v) => (v.path || "/") === path).length,
      visitors: visitors.length,
      clicks: pageClicks.length,
    },
    cities,
    visitors,
    clicks: pageClicks.slice(0, 100),
  });
}
