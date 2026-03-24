import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Lightning bolt */}
        <svg
          width="20"
          height="22"
          viewBox="0 0 20 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.5 1L2 13h7l-1 8 10-12h-7l1.5-8z"
            fill="white"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
