import { ImageResponse } from "next/og";

export const alt = "WorkWise PH — Philippine Labor Market Analytics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%", width: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", background: "#0f1729", color: "#ffffff",
          padding: 72, fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#93b4ff" }}>
          Philippine Labor Force Survey · 2005–2026
        </div>
        <div style={{ fontSize: 76, lineHeight: 1.05, maxWidth: 980 }}>
          Two decades of Philippine labor data, read closely.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#3457d5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>W</div>
          WorkWise PH
        </div>
      </div>
    ),
    { ...size },
  );
}
