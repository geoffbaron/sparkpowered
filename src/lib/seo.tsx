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
  "Keeping your home powered in an outage, with a battery";

export const SITE_DESCRIPTION =
  "How to keep a US home running in a power outage with a portable power station or home battery: how to connect it to the house, what it will run and for how long, checked against the makers' manuals.";

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
  // The layout adds " | Spark Powered"; leave it off when it would push the title past 60 characters.
  const withBrand = `${title} | ${SITE_NAME}`;
  return {
    title: withBrand.length <= 60 ? title : { absolute: title },
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
  alt: "Spark Powered: home backup power in an outage",
};

/**
 * Every indexable route with the date its content last really changed. Drives
 * sitemap.ts. Google uses lastmod only when it is consistently accurate, so
 * these are content dates, never the build or request time. /news is left out
 * on purpose (it is noindex). State pages are added in sitemap.ts.
 */
export const CONTENT_UPDATED = "2026-10-15";

/** Content date of the /questions hubs (src/data/questions.ts). */
export const QUESTIONS_UPDATED = "2026-10-25";

/** The same date as a full timestamp with timezone, for JSON-LD date fields. */
export const QUESTIONS_UPDATED_AT = `${QUESTIONS_UPDATED}T12:00:00+00:00`;

export const ROUTES: { path: string; lastModified: string }[] = [
  { path: "/", lastModified: "2026-11-24" },
  { path: "/battery-calculator", lastModified: CONTENT_UPDATED },
  { path: "/home-battery-backup", lastModified: "2026-11-24" },
  { path: "/home-backup", lastModified: "2026-11-14" },
  { path: "/home-backup/anker-solix-f3800-plus-hookup", lastModified: "2026-11-14" },
  { path: "/home-backup/bluetti-apex-300-hookup", lastModified: "2026-11-14" },
  { path: "/compare/growatt-helios-3600-vs-bluetti-apex-300", lastModified: "2026-11-14" },
  { path: "/power-station-for-refrigerator", lastModified: "2026-11-24" },
  { path: "/power-stations/anker-solix-c1000-gen-2/what-it-runs", lastModified: "2026-11-11" },
  { path: "/power-stations/bluetti-ac180/what-it-runs", lastModified: "2026-11-11" },
  { path: "/power-stations/bluetti-elite-200-v2/what-it-runs", lastModified: "2026-11-11" },
  { path: "/power-stations/anker-solix-c2000-gen-2/what-it-runs", lastModified: "2026-11-11" },
  { path: "/power-stations/bluetti-elite-300/what-it-runs", lastModified: "2026-11-11" },
  { path: "/ev-charger-tripping-gfci", lastModified: "2026-11-14" },
  { path: "/ev-charger-extension-cord", lastModified: "2026-11-14" },
  { path: "/home-backup/hookup-picker", lastModified: "2026-11-14" },
  { path: "/compare", lastModified: CONTENT_UPDATED },
  { path: "/states", lastModified: "2026-11-24" },
  { path: "/questions/home-batteries-backup", lastModified: "2026-11-11" },
  { path: "/power-outage-backup-calculator", lastModified: "2026-11-24" },
  { path: "/home-backup/well-pump", lastModified: "2026-11-14" },
  { path: "/home-backup/pellet-stove", lastModified: "2026-11-14" },
  { path: "/home-backup/bluetti-elite-200-v2-solar-panels", lastModified: "2026-11-14" },
  { path: "/generator-runtime-calculator", lastModified: "2026-10-26" },
  { path: "/about", lastModified: "2026-11-24" },
  { path: "/methodology", lastModified: CONTENT_UPDATED },
  { path: "/disclaimer", lastModified: CONTENT_UPDATED },
  { path: "/privacy", lastModified: CONTENT_UPDATED },
  { path: "/contact", lastModified: "2026-11-24" },
];

/**
 * Pages that print state electricity prices or show DATA_UPDATED. Their
 * sitemap date is the later of the content date above and the data date, so
 * a price refresh moves lastmod without editing ROUTES (sitemap.ts).
 */
export const DATA_ROUTES = new Set([
  "/",
  "/states",
  "/methodology",
  "/power-outage-backup-calculator",
]);

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

/**
 * The person behind every article (Nov 24 2026: Geoff's name goes on the site).
 * Articles reference him by @id; the full Person node lives in the root layout.
 * sameAs lists only public pages confirmed to name him.
 */
export const AUTHOR = {
  name: "Geoff Baron",
  email: "geoff@mylastlap.com",
  photo: "/images/geoff-baron-96.webp",
  photoLarge: "/images/geoff-baron-320.webp",
  sameAs: ["https://geoffbaron.com", "https://mylastlap.com", "https://anywargame.com/press"],
} as const;

export const AUTHOR_REF = { "@id": url("/about#editor") };

export const authorPerson = () => ({
  "@type": "Person",
  "@id": url("/about#editor"),
  name: AUTHOR.name,
  url: url("/about"),
  image: url(AUTHOR.photoLarge),
  email: `mailto:${AUTHOR.email}`,
  jobTitle: "Editor",
  description: "Builds software and runs LastLap Lab LLC. Not an electrician; researches every page from makers' manuals, spec sheets and official sources.",
  worksFor: { "@type": "Organization", name: "LastLap Lab LLC", url: "https://mylastlap.com" },
  sameAs: [...AUTHOR.sameAs],
});

/** The honest "last updated" date of a page: its content date in ROUTES. */
export function pageUpdated(path: string) {
  return ROUTES.find((r) => r.path === path)?.lastModified ?? CONTENT_UPDATED;
}
