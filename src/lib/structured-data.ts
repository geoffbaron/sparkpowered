/**
 * Product markup for our buyer's guides.
 *
 * Spark Powered reviews products; it does not sell them. Google reads a
 * Product with a plain Offer as a merchant listing and then asks for return
 * policies and shipping we cannot truthfully give. So every product we mark up
 * is the subject of our editorial review:
 *
 * - `review` is a Review by Spark Powered with the page's content date. We give
 *   no star scores on the site, so there is no reviewRating; Google allows that
 *   when the review has an author and a date.
 * - No `offers` and no price: we show no prices on the site (they change too
 *   often), so the markup carries none either. tests/no-prices.test.ts guards it.
 * - `image` is our own page image: we have no licence to reuse makers' photos.
 * - No aggregateRating: we have no user ratings to report.
 */

import { CONTENT_UPDATED, OG_IMAGE, ROUTES, SITE_NAME, url } from "@/lib/seo";

export const IN_STOCK = "https://schema.org/InStock";

export interface ReviewedProductInput {
  name: string;
  brand: string;
  /** One plain sentence from our copy or the specs we list. */
  description: string;
  /** The guide page the product is reviewed on, e.g. "/home-backup". */
  pagePath: string;
  /** The maker's or seller's product page. */
  url: string;
  /** Real identifiers only: never invent a sku, mpn or gtin. */
  model?: string;
  sku?: string;
  mpn?: string;
  image?: string;
  /** Review date; defaults to the guide's content date from ROUTES. */
  reviewDate?: string;
  /** Extra schema.org Product properties (category, additionalProperty...). */
  extra?: Record<string, unknown>;
}

/** The date a guide's content last changed, used as the review date. */
export function pageDate(path: string) {
  return ROUTES.find((r) => r.path === path)?.lastModified ?? CONTENT_UPDATED;
}

export function reviewedProduct(p: ReviewedProductInput): Record<string, unknown> {
  return {
    "@type": "Product",
    name: p.name,
    image: p.image ?? OG_IMAGE.url,
    description: p.description,
    brand: { "@type": "Brand", name: p.brand },
    ...(p.model ? { model: p.model } : {}),
    ...(p.sku ? { sku: p.sku } : {}),
    ...(p.mpn ? { mpn: p.mpn } : {}),
    url: p.url,
    ...p.extra,
    review: {
      "@type": "Review",
      name: `${p.name} review`,
      url: url(p.pagePath),
      datePublished: p.reviewDate ?? pageDate(p.pagePath),
      author: { "@type": "Person", "@id": url("/about#editor"), name: "Geoff Baron", url: url("/about") },
      publisher: { "@type": "Organization", name: SITE_NAME, url: url("/") },
    },
  };
}

/** An ItemList of reviewed products for a guide page. */
export function productList(path: string, name: string, items: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url(path)}#products`,
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
  };
}

/** A battery from src/data/boating.ts or src/data/batteries.ts, as a reviewed product. */
export function batteryProduct(
  b: { name: string; maker: string; url: string; volts: number; ampHours: number; energyWh: number },
  pagePath: string,
) {
  return reviewedProduct({
    name: b.name,
    brand: b.maker,
    url: b.url,
    pagePath,
    description: `${b.volts}V ${b.ampHours}Ah lithium battery from ${b.maker}, rated at ${b.energyWh.toLocaleString("en-US")} Wh.`,
  });
}
