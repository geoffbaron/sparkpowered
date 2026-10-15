import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  // Tailwind CSS is small; inlining it removes a render-blocking request for first-time visitors.
  experimental: { inlineCss: true },

  async redirects() {
    return [{ source: "/objections", destination: "/myths", permanent: true }];
  },

  async headers() {
    return [
      {
        // Photos are pre-encoded and never change in place (new photo, new file name).
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
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
