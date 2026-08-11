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
  "Independent guidance on electric vehicles, solar panels and home batteries. Hourly clean-energy news, an EV matcher, a battery sizer, a solar installer finder, and straight answers to the 15 questions people ask before going electric.";

/** Absolute URL for a site-relative path. */
export function url(path = "/") {
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

/** Every indexable route, in priority order. Drives sitemap.ts. */
export const ROUTES = [
  {
    path: "/",
    changeFrequency: "hourly" as const,
    priority: 1,
  },
  {
    path: "/calculator",
    changeFrequency: "daily" as const,
    priority: 0.9,
  },
  {
    path: "/battery-calculator",
    changeFrequency: "daily" as const,
    priority: 0.9,
  },
  {
    path: "/solar-finder",
    changeFrequency: "weekly" as const,
    priority: 0.9,
  },
  {
    path: "/objections",
    changeFrequency: "monthly" as const,
    priority: 0.8,
  },
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
