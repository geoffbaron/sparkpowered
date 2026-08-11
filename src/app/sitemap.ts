import type { MetadataRoute } from "next";
import { ROUTES, url } from "@/lib/seo";

// Stamped once when the bundle is built. Using the request time instead would
// claim every page changed on every crawl, which teaches crawlers to ignore the
// field — a deploy is the honest signal that the pages actually moved.
const BUILD_TIME = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: url(route.path),
    lastModified: BUILD_TIME,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
