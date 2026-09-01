import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getFile, putFile, deleteFile, isGithubConfigured } from "@/lib/github";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_DIR = path.join(process.cwd(), "content", "articles");

function fileRelPath(slug: string, locale: "ar" | "en"): string {
  const suffix = locale === "en" ? ".en.mdx" : ".mdx";
  return path.posix.join("content", "articles", `${slug}${suffix}`);
}

function localAbsPath(slug: string, locale: "ar" | "en"): string {
  const suffix = locale === "en" ? ".en.mdx" : ".mdx";
  return path.join(CONTENT_DIR, `${slug}${suffix}`);
}

/** GET /api/admin/articles/file?slug=xxx&locale=ar */
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const slug = req.nextUrl.searchParams.get("slug");
  const locale = (req.nextUrl.searchParams.get("locale") || "ar") as "ar" | "en";
  if (!slug) return NextResponse.json({ ok: false, error: "missing slug" }, { status: 400 });

  const abs = localAbsPath(slug, locale);
  if (!fs.existsSync(abs)) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  const content = fs.readFileSync(abs, "utf8");
  return NextResponse.json({ ok: true, slug, locale, content });
}

/** PUT /api/admin/articles/file  body: { slug, locale, content, message? } */
export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const slug = String(body.slug || "");
  const locale = (body.locale || "ar") as "ar" | "en";
  const content = String(body.content ?? "");
  const message = String(body.message || `admin: update ${slug} (${locale})`);
  if (!slug || !content) return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });

  const rel = fileRelPath(slug, locale);
  const abs = localAbsPath(slug, locale);

  // Local write (always) — makes local dev instant
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");

  // Remote commit (production redeploy trigger)
  let commit: string | null = null;
  if (isGithubConfigured()) {
    try {
      const existing = await getFile(rel);
      const result = await putFile({
        path: rel,
        content,
        message,
        sha: existing?.sha,
      });
      commit = result.commitSha;
    } catch (err) {
      return NextResponse.json(
        { ok: true, localWrite: true, remoteCommit: false, warning: String(err) },
        { status: 200 },
      );
    }
  }

  return NextResponse.json({ ok: true, localWrite: true, remoteCommit: Boolean(commit), commit });
}

/** DELETE /api/admin/articles/file  body: { slug, locale } */
export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const slug = String(body.slug || "");
  const locale = (body.locale || "ar") as "ar" | "en";
  if (!slug) return NextResponse.json({ ok: false, error: "missing slug" }, { status: 400 });

  const rel = fileRelPath(slug, locale);
  const abs = localAbsPath(slug, locale);

  if (fs.existsSync(abs)) fs.unlinkSync(abs);

  let commit: string | null = null;
  if (isGithubConfigured()) {
    try {
      const existing = await getFile(rel);
      if (existing) {
        commit = await deleteFile({
          path: rel,
          sha: existing.sha,
          message: `admin: delete ${slug} (${locale})`,
        });
      }
    } catch (err) {
      return NextResponse.json(
        { ok: true, localDelete: true, remoteCommit: false, warning: String(err) },
        { status: 200 },
      );
    }
  }

  return NextResponse.json({ ok: true, localDelete: true, remoteCommit: Boolean(commit), commit });
}
