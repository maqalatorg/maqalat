import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 120,
          fontWeight: 800,
          color: "white",
          fontFamily: "sans-serif",
          lineHeight: 1,
          paddingBottom: 8,
        }}
      >
        م
      </div>
    ),
    size,
  );
}
