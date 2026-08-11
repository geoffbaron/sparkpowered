import { ImageResponse } from "next/og";

export const alt =
  "Spark Powered — independent guidance on EVs, solar and home batteries";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #fffbeb 0%, #fff7ed 55%, #ffedd5 100%)",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              background: "linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="46" height="50" viewBox="0 0 20 22" fill="none">
              <path d="M11.5 1L2 13h7l-1 8 10-12h-7l1.5-8z" fill="white" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: -1,
            }}
          >
            Spark Powered
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.08,
              letterSpacing: -2.5,
              maxWidth: 940,
            }}
          >
            EVs, solar and home batteries — explained
          </div>
          <div style={{ fontSize: 34, color: "#475569", maxWidth: 900 }}>
            Hourly clean-energy news, an EV matcher, a battery sizer, and honest
            answers to the objections.
          </div>
        </div>

        {/* Footer rule */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 200,
              height: 8,
              borderRadius: 4,
              background: "linear-gradient(90deg, #fbbf24 0%, #ea580c 100%)",
            }}
          />
          <div style={{ fontSize: 28, color: "#92400e", fontWeight: 600 }}>
            sparkpowered.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
