import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getAllArticles, hasEnglishVersion, hasArabicVersion, getAllSlugs } from "@/lib/blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const slugs = getAllSlugs();
  const arList = getAllArticles("ar");
  const enList = getAllArticles("en");

  const arBySlug = new Map(arList.map((a) => [a.slug, a]));
  const enBySlug = new Map(enList.map((a) => [a.slug, a]));

  const items = slugs.map((slug) => {
    const ar = arBySlug.get(slug);
    const en = enBySlug.get(slug);
    const primary = ar || en;
    return {
      slug,
      title: primary?.frontmatter.title || slug,
      cluster: primary?.frontmatter.cluster || "",
      publishedAt: primary?.frontmatter.publishedAt || "",
      hasAr: hasArabicVersion(slug),
      hasEn: hasEnglishVersion(slug),
      arPath: hasArabicVersion(slug) ? `/${slug}` : null,
      enPath: hasEnglishVersion(slug) ? `/en/${slug}` : null,
    };
  });

  items.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));

  return NextResponse.json({ ok: true, items });
}
