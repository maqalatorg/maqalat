import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, issueSessionCookie } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ ok: false, error: "missing password" }, { status: 400 });
  }
  const ok = await verifyPassword(password);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "invalid password" }, { status: 401 });
  }
  await issueSessionCookie();
  return NextResponse.json({ ok: true });
}
