/**
 * Outbound partner links, one entry per brand. This is the ONLY place a
 * tracking link should ever be written.
 *
 * How to add an approved affiliate link:
 *   1. Set `tracked: true` and fill `network`.
 *   2. Either paste category links into `links` (home / battery / solar), or,
 *      if the network supports deep links, set `deepLink` to a template that
 *      contains `{url}` (the product page URL is URL-encoded into it), e.g.
 *      "https://brand.pxf.io/c/123/456/789?u={url}".
 *   3. Run `npm test` — the tests check every tracked brand has a usable link.
 *
 * Until a brand is approved, links go to the brand's ordinary product page with
 * no tracking, so every page works today. Every outbound product link is
 * rendered by <PartnerLink> with rel="sponsored nofollow noopener" and a
 * disclosure on the page either way.
 */

export type BrandId =
  | "ecoflow"
  | "anker"
  | "jackery"
  | "bluetti"
  | "dji"
  | "tesla"
  | "enphase"
  | "franklinwh"
  | "brightsaver"
  | "mangopower"
  | "pluggedsolar"
  | "craftstrom"
  | "lectron"
  | "energysage";

export interface BrandAffiliate {
  /** Display name. */
  name: string;
  /** Brand's own US home page (no tracking). */
  homeUrl: string;
  /** True only once the brand has approved us and links below carry tracking. */
  tracked: boolean;
  network?: string;
  /** Commission and cookie window as stated by the program, for our own records. */
  commission?: string;
  cookieDays?: number;
  /** Category landing links (tracked when `tracked` is true). */
  links?: { home?: string; battery?: string; solar?: string };
  /** Deep-link template containing `{url}`; wraps any product page URL. */
  deepLink?: string;
  /** Per-product tracked links, keyed by product id from src/data/products.ts. */
  productLinks?: Record<string, string>;
}

export const AFFILIATES: Record<BrandId, BrandAffiliate> = {
  ecoflow: { name: "EcoFlow", homeUrl: "https://us.ecoflow.com/", tracked: false },
  anker: { name: "Anker SOLIX", homeUrl: "https://www.anker.com/", tracked: false },
  jackery: { name: "Jackery", homeUrl: "https://www.jackery.com/", tracked: false },
  bluetti: { name: "Bluetti", homeUrl: "https://www.bluettipower.com/", tracked: false },
  dji: { name: "DJI", homeUrl: "https://store.dji.com/", tracked: false },
  tesla: { name: "Tesla", homeUrl: "https://www.tesla.com/powerwall", tracked: false },
  enphase: { name: "Enphase", homeUrl: "https://enphase.com/", tracked: false },
  franklinwh: { name: "FranklinWH", homeUrl: "https://www.franklinwh.com/", tracked: false },
  brightsaver: { name: "Bright Saver", homeUrl: "https://www.brightsaver.org/", tracked: false },
  mangopower: { name: "Mango Power", homeUrl: "https://www.mangopower.com/", tracked: false },
  pluggedsolar: { name: "PluggedSolar", homeUrl: "https://pluggedsolar.com/", tracked: false },
  craftstrom: { name: "CraftStrom", homeUrl: "https://craftstrom.com/", tracked: false },
  // Approved on Awin (MID 91891), 8% commission, 30-day cookie.
  lectron: {
    name: "Lectron",
    homeUrl: "https://ev-lectron.com/",
    tracked: true,
    network: "Awin",
    commission: "8%",
    cookieDays: 30,
    links: { home: "https://www.awin1.com/cread.php?awinmid=91891&awinaffid=3125360&ued=https%3A%2F%2Fev-lectron.com%2F" },
    productLinks: {
      "lectron-nexus-j1772": "https://www.awin1.com/cread.php?awinmid=91891&awinaffid=3125360&ued=https%3A%2F%2Fev-lectron.com%2Fproducts%2Flectron-nexus-level-2-j1772-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
      "lectron-nexus-nacs": "https://www.awin1.com/cread.php?awinmid=91891&awinaffid=3125360&ued=https%3A%2F%2Fev-lectron.com%2Fproducts%2Flectron-nexus-level-2-nacs-tesla-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
      "lectron-portable-nacs": "https://www.awin1.com/cread.php?awinmid=91891&awinaffid=3125360&ued=https%3A%2F%2Fev-lectron.com%2Fproducts%2Flectron-portable-level-1-2-tesla-nacs-ev-charger-120v-240v-adjustable-current-8-40a-nema-5-15-14-50",
    },
  },
  // Applied, pending on Awin (plain links until approved): Bluetti, Jackery, EcoFlow, Oupes, Pecron, Autel,
  // and per-sale solar installers Momentum Solar, Solar Savings, Solar Simplified, Nautilus community solar.
  energysage: {
    name: "EnergySage",
    homeUrl: "https://www.energysage.com/",
    tracked: false,
    links: { solar: "https://www.energysage.com/onboarding/start/" },
  },
};

export interface ResolvedLink {
  href: string;
  /** True when the URL carries an affiliate tracking code. */
  tracked: boolean;
}

/**
 * The URL to send a reader to for a product (or a brand's category page when
 * no product URL is given). Tracked link if the brand is approved, otherwise
 * the brand's own page.
 */
export function partnerUrl(
  brand: BrandId,
  opts: { productId?: string; productUrl?: string; category?: "home" | "battery" | "solar" } = {},
): ResolvedLink {
  const a = AFFILIATES[brand];
  const { productId, productUrl, category } = opts;
  const categoryLink = category ? a.links?.[category] : undefined;
  if (a.tracked) {
    // Best: a tracked link straight to the product.
    if (productId && a.productLinks?.[productId]) return { href: a.productLinks[productId], tracked: true };
    if (productUrl && a.deepLink) return { href: a.deepLink.replace("{url}", encodeURIComponent(productUrl)), tracked: true };
    // Next: the tracked category page (e.g. the brand's power station range).
    if (categoryLink) return { href: categoryLink, tracked: true };
    // A brand-level link only when we are not pointing at a specific product,
    // so a reader who clicked a product never lands on an unrelated home page.
    if (!productUrl && a.links?.home) return { href: a.links.home, tracked: true };
  }
  if (productUrl) return { href: productUrl, tracked: false };
  return { href: categoryLink ?? a.homeUrl, tracked: false };
}

/** EnergySage "compare solar quotes" link (tracked once approved). */
export function solarQuotesUrl(): ResolvedLink {
  return partnerUrl("energysage", { category: "solar" });
}

export const DISCLOSURE_TEXT =
  "We may earn a commission if you buy through these links. It never changes our recommendations.";
