import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  // Tailwind CSS is small; inlining it removes a render-blocking request for first-time visitors.
  experimental: { inlineCss: true },
  images: { formats: ["image/avif", "image/webp"], qualities: [55, 65, 75] },

  async redirects() {
    return [{ source: "/objections", destination: "/myths", permanent: true }];
  },

  async headers() {
    return [
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
