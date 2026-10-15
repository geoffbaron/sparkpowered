/**
 * Central SEO constants. Every canonical URL, sitemap entry, OG tag and
 * JSON-LD block derives from these so the site can never disagree with itself
 * about who it is or where it lives.
 */

import type { Metadata } from "next";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sparkpowered.com"
).replace(/\/$/, "");

export const SITE_NAME = "Spark Powered";

export const SITE_TAGLINE =
  "EV, solar and home battery guidance for people going electric";

export const SITE_DESCRIPTION =
  "Free, independent calculators for EVs, solar panels and home batteries, built on government data: EV charging cost by state, solar panel sizing, home battery sizing, an EV matcher and a solar installer finder.";

/**
 * Absolute URL for a site-relative path.
 *
 * The bare root returns no trailing slash, matching what Next resolves
 * `alternates.canonical: "/"` to. Otherwise the sitemap and og:url would say
 * `https://sparkpowered.com/` while the canonical on the same page said
 * `https://sparkpowered.com` — equivalent to a crawler, but needless noise.
 */
export function url(path = "/") {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Builds a page's title, description, canonical, Open Graph and Twitter tags
 * from one set of strings.
 *
 * Declaring `openGraph` or `twitter` on a page replaces the root layout's
 * object wholesale rather than merging into it, so a page that sets only a
 * title silently loses the share image and the large-image card type. Routing
 * every page through here keeps those attached.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: url(path),
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export const OG_IMAGE = {
  url: url("/opengraph-image"),
  width: 1200,
  height: 630,
  alt: "Spark Powered — independent guidance on EVs, solar and home batteries",
};

/**
 * Every indexable route with the date its content last really changed. Drives
 * sitemap.ts. Google uses lastmod only when it is consistently accurate, so
 * these are content dates, never the build or request time. /news is left out
 * on purpose (it is noindex). State pages are added in sitemap.ts.
 */
export const CONTENT_UPDATED = "2026-10-15";

export const ROUTES: { path: string; lastModified: string }[] = [
  { path: "/", lastModified: CONTENT_UPDATED },
  { path: "/ev-charging-cost", lastModified: CONTENT_UPDATED },
  { path: "/solar-calculator", lastModified: CONTENT_UPDATED },
  { path: "/battery-calculator", lastModified: CONTENT_UPDATED },
  { path: "/calculator", lastModified: CONTENT_UPDATED },
  { path: "/solar-finder", lastModified: CONTENT_UPDATED },
  { path: "/states", lastModified: CONTENT_UPDATED },
  { path: "/incentives", lastModified: CONTENT_UPDATED },
  { path: "/objections", lastModified: CONTENT_UPDATED },
  { path: "/about", lastModified: CONTENT_UPDATED },
  { path: "/methodology", lastModified: CONTENT_UPDATED },
  { path: "/disclaimer", lastModified: CONTENT_UPDATED },
  { path: "/privacy", lastModified: CONTENT_UPDATED },
];

/**
 * Renders a JSON-LD block. Structured data is how answer engines quote a page
 * without having to infer meaning from Tailwind class names.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
