import type { MetadataRoute } from "next";
import { DATA_ROUTES, ROUTES, url } from "@/lib/seo";
import { DATA_UPDATED, STATES } from "@/lib/energy";
import { COMPARISONS } from "@/data/comparisons";

/** ISO dates compare as strings. */
const later = (a: string, b: string) => (a > b ? a : b);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...ROUTES.map((route) => ({ url: url(route.path), lastModified: DATA_ROUTES.has(route.path) ? later(route.lastModified, DATA_UPDATED) : route.lastModified })),
    ...STATES.map((s) => ({ url: url(`/states/${s.slug}`), lastModified: DATA_UPDATED })),
    ...COMPARISONS.map((c) => ({ url: url(`/compare/${c.slug}`), lastModified: c.updated })),
  ];
}
