import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { fetchPageviews, fetchClicks, aggregateByPage } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const days = Number(req.nextUrl.searchParams.get("days") || "30");
  const [views, clicks] = await Promise.all([fetchPageviews(days), fetchClicks(days)]);
  const stats = aggregateByPage(views, clicks);
  return NextResponse.json({
    ok: true,
    days,
    totals: {
      views: views.length,
      clicks: clicks.length,
      uniqueVisitors: new Set(views.map((v) => v.visitorId).filter(Boolean)).size,
      pages: stats.length,
    },
    stats,
  });
}
