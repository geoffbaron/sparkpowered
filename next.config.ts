import type { NextConfig } from "next";
import { REMOVED, REMOVED_PATTERNS, type Removed } from "./src/lib/removed";

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  // Tailwind CSS is small; inlining it removes a render-blocking request for first-time visitors.
  experimental: { inlineCss: true },

  async redirects() {
    const moved = (r: Removed) => ({ source: r.source, destination: r.destination, statusCode: 301 as const });
    return [
      // www answers once DNS points it here: send it to the bare domain, same path.
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: "www.sparkpowered.com" }],
        destination: "https://sparkpowered.com/:path*",
        statusCode: 301 as const,
      },
      // Pages removed in the Nov 24 2026 narrowing (src/lib/removed.ts). Fixed addresses first, then whole sections.
      ...REMOVED.map(moved),
      ...REMOVED_PATTERNS.map(moved),
    ];
  },

  async headers() {
    return [
      {
        // Photos are pre-encoded and never change in place (new photo, new file name).
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/videos/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // JSON endpoints should never appear in search results.
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
