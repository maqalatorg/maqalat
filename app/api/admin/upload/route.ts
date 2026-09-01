import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED = /^(image\/(png|jpe?g|webp|gif|svg\+xml)|video\/(mp4|webm|quicktime))$/i;

/** POST /api/admin/upload — multipart form with `file` field. Returns { url, size, type }. */
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "BLOB_READ_WRITE_TOKEN not configured" },
      { status: 500 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "missing file" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: "file too large (max 50 MB)" }, { status: 413 });
  }
  if (!ALLOWED.test(file.type)) {
    return NextResponse.json({ ok: false, error: `unsupported type: ${file.type}` }, { status: 415 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
  const key = `admin-uploads/${Date.now()}-${safeName}`;

  const blob = await put(key, file, { access: "public", addRandomSuffix: false });
  return NextResponse.json({
    ok: true,
    url: blob.url,
    pathname: blob.pathname,
    size: file.size,
    type: file.type,
  });
}
