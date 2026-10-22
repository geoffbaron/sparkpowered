import { ImageResponse } from "next/og";
import { MAX_STARS } from "@/data/solartopia";
import { decodeStars, shareSentence, totalStars } from "@/lib/solartopia/share";

export const alt = "A Solartopia result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STAR = "M12 1.5l3 7 7.5.5-5.7 5 1.8 7.5L12 17.6 5.4 21.5l1.8-7.5L1.5 9l7.5-.5z";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const stars = decodeStars(code) ?? [0, 0, 0, 0, 0];
  const total = totalStars(stars);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(180deg,#1E2A4A 0%,#5B3A63 62%,#C8734B 100%)", padding: 70, fontFamily: "sans-serif", color: "#FFFEF7" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 60, fontWeight: 800 }}>Solartopia</div>
          <div style={{ fontSize: 30, color: "#FFD27A" }}>Spark Powered</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>{shareSentence(stars)}</div>
          <div style={{ display: "flex", gap: 36 }}>
            {stars.map((n, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[0, 1, 2].map((k) => (
                    <svg key={k} width="52" height="52" viewBox="0 0 24 24">
                      <path d={STAR} fill={k < n ? "#F5B700" : "rgba(255,254,247,0.25)"} />
                    </svg>
                  ))}
                </div>
                <div style={{ fontSize: 24, color: "#E9D3A6" }}>{`Day ${i + 1}`}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#FFD27A" }}>
          <div>{`${total} of ${MAX_STARS} stars`}</div>
          <div>Free, five minutes, sparkpowered.com/solartopia</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
