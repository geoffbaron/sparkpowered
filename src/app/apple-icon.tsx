import { ImageResponse } from "next/og";

// Also used as the Organization logo in structured data, which Google wants
// to be at least 112px square.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="100" height="110" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.5 1L2 13h7l-1 8 10-12h-7l1.5-8z" fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
