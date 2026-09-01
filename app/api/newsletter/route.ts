import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscribeBody = {
  email?: string;
  locale?: string;
  source?: string;
};

export async function POST(request: Request) {
  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
    return NextResponse.json(
      { ok: false, error: "not_configured" },
      { status: 503 },
    );
  }

  let body: SubscribeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const locale = body.locale === "en" ? "en" : "ar";
  const source = body.source?.slice(0, 64) || "site";

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    await resend.contacts.create({
      email,
      audienceId: RESEND_AUDIENCE_ID,
      unsubscribed: false,
      // Store locale + source in first/last name fields for later segmentation
      // (Resend contacts API only stores email + first/last name + unsubscribed).
      firstName: locale,
      lastName: source,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    // Resend returns "Contact already exists" — treat as success (idempotent).
    if (/already exist/i.test(message)) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    return NextResponse.json({ ok: false, error: "provider_error" }, { status: 502 });
  }
}
