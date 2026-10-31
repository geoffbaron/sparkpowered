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
  | "redodo"
  | "autel"
  | "eviqo"
  | "piscifun"
  | "litime"
  | "epoch"
  | "vatrer"
  | "energysage"
  | "sungold"
  | "goalzero"
  | "renogy"
  | "signaturesolar"
  | "shopsolar"
  | "grayl"
  | "msr"
  | "lifestraw"
  | "sawyer"
  | "katadyn"
  | "survivorfilter"
  | "epic"
  | "aquatru"
  | "mymedic"
  | "amk"
  | "valleyfood"
  | "readywise"
  | "mountainhouse"
  | "midland";

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
  /**
   * Query parameter the brand's own affiliate script reads (e.g. GoAffPro's
   * "ref=CODE"). Appended to any product URL on the brand's own site.
   */
  refParam?: string;
  /** Per-product tracked links, keyed by product id from src/data/products.ts. */
  productLinks?: Record<string, string>;
  /**
   * Shopify store origin that accepts cart permalinks (/cart/<variant>:<qty>,...).
   * Set only after checking that a permalink on this origin opens the store's
   * cart with every item in it.
   */
  cartOrigin?: string;
}

export const AFFILIATES: Record<BrandId, BrandAffiliate> = {
  // Cart permalinks checked Oct 26 2026: us.ecoflow.com/cart/... lands on the cart with the items.
  ecoflow: { name: "EcoFlow", homeUrl: "https://us.ecoflow.com/", tracked: false, cartOrigin: "https://us.ecoflow.com" },
  // Approved Oct 19 2026 on Rakuten Advertising (Anker SOLIX, MID 53552) for publisher
  // 4764556. The deeplink id is our encrypted Rakuten publisher id from the approval email.
  // Program terms on application: 5% base, 3.5% on some SKUs, 30-day cookie.
  anker: {
    name: "Anker SOLIX",
    homeUrl: "https://www.ankersolix.com/",
    tracked: true,
    network: "Rakuten",
    commission: "5% (3.5% some SKUs)",
    cookieDays: 30,
    links: { home: "https://click.linksynergy.com/deeplink?id=2P5eyfaQKtI&mid=53552&murl=https%3A%2F%2Fwww.ankersolix.com%2F" },
    deepLink: "https://click.linksynergy.com/deeplink?id=2P5eyfaQKtI&mid=53552&murl={url}",
  },
  // Cart permalinks checked Oct 26 2026: www.jackery.com/cart/... lands on the cart with the items.
  jackery: { name: "Jackery", homeUrl: "https://www.jackery.com/", tracked: false, cartOrigin: "https://www.jackery.com" },
  // Approved Oct 16 2026 on Awin (BLUETTI US, MID 59271) for publisher 3125360.
  bluetti: {
    name: "Bluetti",
    homeUrl: "https://www.bluettipower.com/",
    tracked: true,
    network: "Awin",
    commission: "5-10%",
    cookieDays: 30,
    links: { home: "https://www.awin1.com/cread.php?awinmid=59271&awinaffid=3125360&ued=https%3A%2F%2Fwww.bluettipower.com%2F" },
    deepLink: "https://www.awin1.com/cread.php?awinmid=59271&awinaffid=3125360&ued={url}",
    // Cart permalinks checked Oct 26 2026: www.bluettipower.com/cart/... lands on the cart with the items.
    cartOrigin: "https://www.bluettipower.com",
  },
  dji: { name: "DJI", homeUrl: "https://store.dji.com/", tracked: false },
  tesla: { name: "Tesla", homeUrl: "https://www.tesla.com/powerwall", tracked: false },
  enphase: { name: "Enphase", homeUrl: "https://enphase.com/", tracked: false },
  franklinwh: { name: "FranklinWH", homeUrl: "https://www.franklinwh.com/", tracked: false },
  brightsaver: { name: "Bright Saver", homeUrl: "https://www.brightsaver.org/", tracked: false },
  mangopower: { name: "Mango Power", homeUrl: "https://www.mangopower.com/", tracked: false },
  pluggedsolar: { name: "PluggedSolar", homeUrl: "https://pluggedsolar.com/", tracked: false },
  craftstrom: { name: "CraftStrom", homeUrl: "https://craftstrom.com/", tracked: false },
  // Approved on Awin (MID 91891); welcome email says 5% commission, 30-day cookie.
  lectron: {
    name: "Lectron",
    homeUrl: "https://ev-lectron.com/",
    tracked: true,
    network: "Awin",
    commission: "5%",
    cookieDays: 30,
    links: { home: "https://www.awin1.com/cread.php?awinmid=91891&awinaffid=3125360&ued=https%3A%2F%2Fev-lectron.com%2F" },
    // Any Lectron product page, so a link without a productId below is still tracked.
    deepLink: "https://www.awin1.com/cread.php?awinmid=91891&awinaffid=3125360&ued={url}",
    productLinks: {
      "lectron-nexus-j1772": "https://www.awin1.com/cread.php?awinmid=91891&awinaffid=3125360&ued=https%3A%2F%2Fev-lectron.com%2Fproducts%2Flectron-nexus-level-2-j1772-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
      "lectron-nexus-nacs": "https://www.awin1.com/cread.php?awinmid=91891&awinaffid=3125360&ued=https%3A%2F%2Fev-lectron.com%2Fproducts%2Flectron-nexus-level-2-nacs-tesla-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
      "lectron-portable-nacs": "https://www.awin1.com/cread.php?awinmid=91891&awinaffid=3125360&ued=https%3A%2F%2Fev-lectron.com%2Fproducts%2Flectron-portable-level-1-2-tesla-nacs-ev-charger-120v-240v-adjustable-current-8-40a-nema-5-15-14-50",
    },
  },
  // Approved Oct 16 2026 on Awin (Redodo Power, MID 97969, read from the Awin tag on
  // redodopower.com) for publisher 3125360. Commission and cookie window are our
  // working figures until confirmed on the Awin programme page.
  redodo: {
    name: "Redodo",
    homeUrl: "https://www.redodopower.com/",
    tracked: true,
    network: "Awin",
    commission: "about 5%",
    cookieDays: 30,
    links: { home: "https://www.awin1.com/cread.php?awinmid=97969&awinaffid=3125360&ued=https%3A%2F%2Fwww.redodopower.com%2F" },
    deepLink: "https://www.awin1.com/cread.php?awinmid=97969&awinaffid=3125360&ued={url}",
  },
  // Approved Oct 19 2026 on Awin (Autel Energy, MID 72577) for publisher 3125360.
  // Commission and cookie window are working figures (about 10%, unconfirmed) until
  // read from the Awin programme page.
  autel: {
    name: "Autel",
    homeUrl: "https://autelenergy.us/",
    tracked: true,
    network: "Awin",
    commission: "about 10%, unconfirmed",
    cookieDays: 30,
    links: { home: "https://www.awin1.com/cread.php?awinmid=72577&awinaffid=3125360&ued=https%3A%2F%2Fautelenergy.us%2F" },
    deepLink: "https://www.awin1.com/cread.php?awinmid=72577&awinaffid=3125360&ued={url}",
  },
  // Approved Oct 31 2026 on GoAffPro (EVIQO, portal partners.eviqo.io), ref code zycwdczj.
  // Program terms: 10% (12% at 50+ sales a month, 14% at 101+), 60-day cookie, PayPal payouts.
  // Tracking is the store's own GoAffPro script reading ?ref= on any eviqo.io page
  // (checked Oct 31 2026: product pages load with the parameter and the GoAffPro loader).
  eviqo: {
    name: "EVIQO",
    homeUrl: "https://eviqo.io/",
    tracked: true,
    network: "GoAffPro",
    commission: "10% (12% at 50+ sales a month, 14% at 101+)",
    cookieDays: 60,
    links: { home: "https://eviqo.io/?ref=zycwdczj" },
    refParam: "ref=zycwdczj",
  },
  // Joined Oct 20 2026 on Awin (Piscifun, MID 89509, from the Awin invitation email) for
  // publisher 3125360. Invitation states 10% commission and a 30-day cookie. Fishing
  // gear; used only for a short "rounding out the boat" note on the trolling page.
  piscifun: {
    name: "Piscifun",
    homeUrl: "https://www.piscifun.com/",
    tracked: true,
    network: "Awin",
    commission: "10%",
    cookieDays: 30,
    links: { home: "https://www.awin1.com/cread.php?awinmid=89509&awinaffid=3125360&ued=https%3A%2F%2Fwww.piscifun.com%2F" },
    deepLink: "https://www.awin1.com/cread.php?awinmid=89509&awinaffid=3125360&ued={url}",
  },
  // Approved Oct 23 2026 on Awin (LiTime, MID 71451) for publisher 3125360. Programme
  // rules: no bidding on the LiTime brand in ads, no false or misleading claims.
  litime: {
    name: "LiTime",
    homeUrl: "https://www.litime.com/",
    tracked: true,
    network: "Awin",
    links: { home: "https://www.awin1.com/cread.php?awinmid=71451&awinaffid=3125360&ued=https%3A%2F%2Fwww.litime.com%2F" },
    deepLink: "https://www.awin1.com/cread.php?awinmid=71451&awinaffid=3125360&ued={url}",
  },
  // Approved Oct 31 2026 on Refersion (Epoch Batteries, epochbatteries.refersion.com).
  // Tracking is Refersion's ?rfsn= parameter on any epochbatteries.com page (checked Oct 31
  // 2026: product pages load with it). Program terms: 10% base, 30-day window, no paid ads,
  // disclose the commission.
  epoch: {
    name: "Epoch Batteries",
    homeUrl: "https://www.epochbatteries.com/",
    tracked: true,
    network: "Refersion",
    commission: "10%",
    cookieDays: 30,
    links: { home: "https://www.epochbatteries.com/?rfsn=9396856.73d8c8" },
    refParam: "rfsn=9396856.73d8c8",
  },
  // Approved Oct 31 2026 on Awin (Vatrer Power, MID 119703) for publisher 3125360. 3% commission,
  // 30-day cookie. US store: www.vatrerpower.com.
  vatrer: {
    name: "Vatrer",
    homeUrl: "https://www.vatrerpower.com/",
    tracked: true,
    network: "Awin",
    commission: "3%",
    cookieDays: 30,
    links: { home: "https://www.awin1.com/cread.php?awinmid=119703&awinaffid=3125360&ued=https%3A%2F%2Fwww.vatrerpower.com%2F" },
    deepLink: "https://www.awin1.com/cread.php?awinmid=119703&awinaffid=3125360&ued={url}",
  },
  // Applied, pending on Awin (plain links until approved): Jackery, EcoFlow, Oupes, Pecron,
  // and per-sale solar installers Momentum Solar, Solar Savings, Solar Simplified, Nautilus community solar.
  energysage: {
    name: "EnergySage",
    homeUrl: "https://www.energysage.com/",
    tracked: false,
    links: { solar: "https://www.energysage.com/onboarding/start/" },
  },

  // Off-grid and emergency prep brands (Oct 26 2026). Plain links until each program approves us.
  sungold: { name: "SunGold Power", homeUrl: "https://sungoldpower.com/", tracked: false },
  goalzero: { name: "Goal Zero", homeUrl: "https://www.goalzero.com/", tracked: false },
  renogy: { name: "Renogy", homeUrl: "https://www.renogy.com/", tracked: false },
  signaturesolar: { name: "Signature Solar", homeUrl: "https://signaturesolar.com/", tracked: false },
  // Component systems (separate panels, inverter, battery bank) for loads too big for a
  // plug-and-play kit. Awin application pending (Oct 26 2026): plain link until approved.
  shopsolar: { name: "Shop Solar Kits", homeUrl: "https://shopsolarkits.com/", tracked: false },
  grayl: { name: "Grayl", homeUrl: "https://grayl.com/", tracked: false },
  msr: { name: "MSR", homeUrl: "https://www.msrgear.com/", tracked: false },
  lifestraw: { name: "LifeStraw", homeUrl: "https://lifestraw.com/", tracked: false },
  sawyer: { name: "Sawyer", homeUrl: "https://www.sawyer.com/", tracked: false },
  katadyn: { name: "Katadyn", homeUrl: "https://www.katadyngroup.com/us/en", tracked: false },
  survivorfilter: { name: "Survivor Filter", homeUrl: "https://survivorfilter.com/", tracked: false },
  epic: { name: "Epic Water Filters", homeUrl: "https://www.epicwaterfilters.com/", tracked: false },
  aquatru: { name: "AquaTru", homeUrl: "https://aquatru.com/", tracked: false },
  mymedic: { name: "MyMedic", homeUrl: "https://mymedic.com/", tracked: false },
  amk: { name: "Adventure Medical Kits", homeUrl: "https://www.adventuremedicalkits.com/", tracked: false },
  valleyfood: { name: "Valley Food Storage", homeUrl: "https://valleyfoodstorage.com/", tracked: false },
  readywise: { name: "ReadyWise", homeUrl: "https://readywise.com/", tracked: false },
  mountainhouse: { name: "Mountain House", homeUrl: "https://mountainhouse.com/", tracked: false },
  midland: { name: "Midland", homeUrl: "https://midlandusa.com/", tracked: false },
};

/** Host without a leading "www.", lower case. */
export const bareHost = (url: string) => new URL(url).hostname.toLowerCase().replace(/^www\./, "");

/**
 * The brand whose own store a URL points at (matched on the brand's homeUrl
 * host, with or without "www."), or null. Lets plain links to an approved
 * brand be caught and tracked instead of slipping out untagged.
 */
export function brandForUrl(url: string): BrandId | null {
  let host: string;
  try {
    host = bareHost(url);
  } catch {
    return null;
  }
  for (const [id, a] of Object.entries(AFFILIATES) as [BrandId, BrandAffiliate][]) {
    if (bareHost(a.homeUrl) === host) return id;
  }
  return null;
}

/** True when a URL is a store's bare home page (no product or category path). */
export function isHomePage(url: string): boolean {
  try {
    const u = new URL(url);
    return u.pathname === "/" || u.pathname === "";
  } catch {
    return false;
  }
}

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
    if (productUrl && a.refParam) return { href: `${productUrl}${productUrl.includes("?") ? "&" : "?"}${a.refParam}`, tracked: true };
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

/** One line of a store cart: a Shopify variant id and how many. */
export interface CartItem {
  variantId: number;
  qty: number;
}

/**
 * A link that opens the brand's own store cart with every item already in it
 * (a Shopify cart permalink). `?storefront=true` lands on the cart page rather
 * than jumping straight to checkout, so the reader sees the items and prices
 * first. Repeated variants are merged; zero quantities are dropped. When the
 * brand is approved, the permalink is wrapped in its deep-link template so the
 * sale is tracked, exactly as partnerUrl does for product pages.
 */
export function cartUrl(brand: BrandId, items: CartItem[]): ResolvedLink {
  const a = AFFILIATES[brand];
  if (!a.cartOrigin) throw new Error(`${brand} has no cart permalink origin`);
  const merged = new Map<number, number>();
  for (const i of items) {
    const qty = Math.floor(i.qty);
    if (!Number.isSafeInteger(i.variantId) || i.variantId <= 0 || qty <= 0) continue;
    merged.set(i.variantId, (merged.get(i.variantId) ?? 0) + qty);
  }
  if (merged.size === 0) throw new Error(`cart for ${brand} has no items`);
  const lines = [...merged].map(([id, qty]) => `${id}:${qty}`).join(",");
  const permalink = `${a.cartOrigin}/cart/${lines}?storefront=true`;
  if (a.tracked && a.deepLink) return { href: a.deepLink.replace("{url}", encodeURIComponent(permalink)), tracked: true };
  return { href: permalink, tracked: false };
}

/** EnergySage "compare solar quotes" link (tracked once approved). */
export function solarQuotesUrl(): ResolvedLink {
  return partnerUrl("energysage", { category: "solar" });
}

export const DISCLOSURE_TEXT =
  "We may earn a commission if you buy through these links. It never changes our recommendations.";
