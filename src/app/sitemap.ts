import type { MetadataRoute } from "next";
import { ROUTES, url } from "@/lib/seo";
import { DATA_UPDATED, STATES } from "@/lib/energy";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...ROUTES.map((route) => ({ url: url(route.path), lastModified: route.lastModified })),
    ...STATES.map((s) => ({ url: url(`/states/${s.slug}`), lastModified: DATA_UPDATED })),
  ];
}
