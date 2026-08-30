import { ImageResponse } from "next/og";
import { SITE_NAME_AR, SITE_TAGLINE_AR } from "@/lib/seo";

export const runtime = "edge";

async function loadCairo(weight: "Bold" | "ExtraBold"): Promise<ArrayBuffer | null> {
  const urls = [
    `https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/cairo/static/Cairo-${weight}.ttf`,
    `https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/static/Cairo-${weight}.ttf`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "force-cache" });
      if (res.ok) return await res.arrayBuffer();
    } catch {}
  }
  return null;
}

export async function GET() {
  const [bold, extraBold] = await Promise.all([
    loadCairo("Bold"),
    loadCairo("ExtraBold"),
  ]);

  const fonts = [
    ...(bold ? [{ name: "Cairo", data: bold, weight: 700 as const, style: "normal" as const }] : []),
    ...(extraBold ? [{ name: "Cairo", data: extraBold, weight: 800 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        dir="rtl"
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #064E3B 0%, #047857 45%, #10B981 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Cairo, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)",
          }}
        />

        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 32,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 96,
            fontWeight: 800,
            color: "#047857",
            marginBottom: 36,
            boxShadow: "0 20px 60px -20px rgba(0,0,0,0.4)",
            lineHeight: 1,
            paddingBottom: 8,
          }}
        >
          م
        </div>

        <div
          style={{
            fontSize: 128,
            fontWeight: 800,
            color: "white",
            lineHeight: 1,
            letterSpacing: -2,
            marginBottom: 20,
          }}
        >
          {SITE_NAME_AR}
        </div>

        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          {SITE_TAGLINE_AR}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: 1,
          }}
        >
          maqalat.org
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
      headers: {
        "cache-control": "public, immutable, no-transform, max-age=31536000",
      },
    },
  );
}
