import type { MetadataRoute } from "next";
import { QUESTIONS_UPDATED, ROUTES, url } from "@/lib/seo";
import { DATA_UPDATED, STATES } from "@/lib/energy";
import { COMPARISONS } from "@/data/comparisons";
import { ALL_QUESTIONS, questionPath } from "@/data/questions";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...ROUTES.map((route) => ({ url: url(route.path), lastModified: route.lastModified })),
    ...STATES.map((s) => ({ url: url(`/states/${s.slug}`), lastModified: DATA_UPDATED })),
    ...STATES.map((s) => ({ url: url(`/off-grid-solar-calculator/${s.slug}`), lastModified: "2026-10-26" })),
    ...ALL_QUESTIONS.map(({ topic, question }) => ({ url: url(questionPath(topic, question)), lastModified: QUESTIONS_UPDATED })),
    ...COMPARISONS.map((c) => ({ url: url(`/compare/${c.slug}`), lastModified: c.updated })),
  ];
}
