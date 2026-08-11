import type { MetadataRoute } from "next";
import { url } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin is password-gated and /api returns JSON — neither belongs in an index.
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: url("/sitemap.xml"),
  };
}
