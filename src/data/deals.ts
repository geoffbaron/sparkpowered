/**
 * Black Friday 2026 deals from brands we earn on, each read on the maker's own US
 * store and checked against the prices we have recorded for it before. A deal is
 * shown only between its maker's published start and end, so it drops off the page
 * by itself when the sale ends (the page checks the clock per request).
 * Plain values only, so server and client code can both import it.
 */

import type { BrandId } from "@/data/affiliates";

export interface PricePoint {
  /** YYYY-MM-DD we read the price on the maker's US site. */
  date: string;
  usd: number;
}

export interface Deal {
  id: string;
  brand: BrandId;
  kind: "power-station" | "ebike";
  /** Id in products.ts or ebikes.json, for specs. */
  productId: string;
  name: string;
  /** Maker's product page (no tracking; PartnerLink adds it). */
  url: string;
  salePriceUsd: number;
  /** The maker's own crossed-out price, shown as theirs, never as ours. */
  makerWasUsd: number | null;
  /** Prices we recorded before this sale, oldest first, from our own checks. */
  log: PricePoint[];
  saleName: string;
  /** Sale page on the maker's site (no tracking). */
  saleUrl: string;
  /** First moment shown, ISO with offset. */
  startsAt: string;
  /** First moment NOT shown, ISO with offset (end of the last sale day, US Pacific). */
  endsAt: string;
  /** The maker's stated sale dates as readers see them. */
  datesLabel: string;
  /** Last day we show the price. */
  endsLabel: string;
  /** How the price is reached, when it is not simply the shelf price. */
  howNote?: string;
  /** YYYY-MM-DD we read the sale price. */
  checked: string;
}

const CHECKED = "2026-11-11";
const ANKER_SALE = { saleName: "Anker SOLIX Black Friday Early Access", saleUrl: "https://www.ankersolix.com/black-friday-pps", startsAt: "2026-11-10T00:00:00-08:00", endsAt: "2026-11-19T00:00:00-08:00", datesLabel: "Nov 10-18", endsLabel: "Nov 18" };
// Bluetti's terms: 12:00 AM PST Nov 5 to 11:59 PM PST Nov 18, 2026.
const BLUETTI_SALE = { saleName: "Bluetti Black Friday Early Access", saleUrl: "https://www.bluettipower.com/pages/black-friday", startsAt: "2026-11-05T00:00:00-08:00", endsAt: "2026-11-19T00:00:00-08:00", datesLabel: "Nov 5-18", endsLabel: "Nov 18" };
const GROWATT_SALE = { saleName: "Growatt Black Friday Sale", saleUrl: "https://growattportable.com/", startsAt: "2026-11-10T00:00:00-08:00", endsAt: "2026-12-01T00:00:00-08:00", datesLabel: "Nov 10-30", endsLabel: "Nov 30" };
// Himiway's page: up to $1,000 off select e-bikes Nov 1-15 (its D5 2.0 gift offer runs to Nov 30,
// but the page doesn't say which price lasts that long, so we stop showing prices after Nov 14).
const HIMIWAY_SALE = { saleName: "Himiway Black Friday sale", saleUrl: "https://himiwaybike.com/pages/black-friday", startsAt: "2026-11-01T00:00:00-07:00", endsAt: "2026-11-15T00:00:00-08:00", datesLabel: "Nov 1-15", endsLabel: "Nov 14" };

export const BLACK_FRIDAY_2026: Deal[] = [
  {
    id: "bf26-bluetti-apex-300", brand: "bluetti", kind: "power-station", productId: "bluetti-apex-300", name: "Bluetti Apex 300",
    url: "https://www.bluettipower.com/products/apex-300-home-battery-backup",
    salePriceUsd: 1499, makerWasUsd: 1699,
    log: [{ date: "2026-10-15", usd: 1599 }, { date: "2026-10-26", usd: 1599 }, { date: "2026-11-06", usd: 1499 }],
    ...BLUETTI_SALE, checked: CHECKED,
    howNote: "Bluetti also takes $50 off orders over $2,000 and adds a free kids' T-shirt or hoodie with an Apex 300.",
  },
  {
    id: "bf26-growatt-helios-3600", brand: "growatt", kind: "power-station", productId: "growatt-helios-3600", name: "Growatt HELIOS 3600",
    url: "https://growattportable.com/products/growatt-helios-3600-portable-power-station",
    salePriceUsd: 1198.98, makerWasUsd: 1599,
    log: [{ date: "2026-11-04", usd: 1599 }],
    ...GROWATT_SALE, checked: CHECKED,
  },
  {
    id: "bf26-anker-c1000-gen-2", brand: "anker", kind: "power-station", productId: "anker-solix-c1000-gen-2", name: "Anker SOLIX C1000 Gen 2",
    url: "https://www.ankersolix.com/products/c1000-gen2",
    salePriceUsd: 529.99, makerWasUsd: 699.99,
    log: [{ date: "2026-10-15", usd: 549.99 }, { date: "2026-10-26", usd: 499.99 }, { date: "2026-11-06", usd: 549.99 }],
    ...ANKER_SALE, checked: CHECKED,
  },
  {
    id: "bf26-anker-c2000-gen-2", brand: "anker", kind: "power-station", productId: "anker-solix-c2000-gen-2", name: "Anker SOLIX C2000 Gen 2",
    url: "https://www.ankersolix.com/products/c2000-gen2",
    salePriceUsd: 949.99, makerWasUsd: 1199.99,
    log: [{ date: "2026-10-15", usd: 999.99 }, { date: "2026-10-26", usd: 899.99 }, { date: "2026-11-06", usd: 999.99 }],
    ...ANKER_SALE, checked: CHECKED,
  },
  {
    id: "bf26-anker-f3000", brand: "anker", kind: "power-station", productId: "anker-solix-f3000", name: "Anker SOLIX F3000",
    url: "https://www.ankersolix.com/products/f3000",
    salePriceUsd: 1699.99, makerWasUsd: 1899.99,
    log: [{ date: "2026-10-15", usd: 1499.99 }, { date: "2026-10-26", usd: 1399.99 }, { date: "2026-11-06", usd: 1699.99 }],
    ...ANKER_SALE, checked: CHECKED,
    howNote: "The $1,699.99 needs Anker's auto-applied $200 code at checkout; the shelf price is $1,899.99.",
  },
  {
    id: "bf26-himiway-a7-pro", brand: "himiway", kind: "ebike", productId: "himiway-a7-pro-commuter-ebike", name: "Himiway A7 Pro commuter e-bike",
    url: "https://himiwaybike.com/products/himiway-a7pro-commuter-ebike",
    salePriceUsd: 1999, makerWasUsd: 2899,
    log: [{ date: "2026-11-02", usd: 1999 }, { date: "2026-11-05", usd: 1999 }],
    ...HIMIWAY_SALE, checked: CHECKED,
  },
  {
    id: "bf26-himiway-d5", brand: "himiway", kind: "ebike", productId: "himiway-d5-2-0-ebike", name: "Himiway D5 2.0 fat-tire e-bike",
    url: "https://himiwaybike.com/products/himiway-d5",
    salePriceUsd: 1999, makerWasUsd: 2199,
    log: [{ date: "2026-11-02", usd: 2199 }, { date: "2026-11-05", usd: 1999 }],
    ...HIMIWAY_SALE, checked: CHECKED,
    howNote: "From Nov 7 Himiway adds a free 20Ah battery to the first 30 D5 2.0 orders.",
  },
  {
    id: "bf26-himiway-d5-st", brand: "himiway", kind: "ebike", productId: "himiway-d5-2-0-st-ebike", name: "Himiway D5 2.0 ST step-through e-bike",
    url: "https://himiwaybike.com/products/himiway-d5-st",
    salePriceUsd: 1999, makerWasUsd: 2199,
    log: [{ date: "2026-11-02", usd: 1999 }, { date: "2026-11-05", usd: 1999 }],
    ...HIMIWAY_SALE, checked: CHECKED,
  },
];

/** True while the deal is on at `now` (milliseconds since epoch). */
export function isDealLive(d: Pick<Deal, "startsAt" | "endsAt">, now: number): boolean {
  return now >= Date.parse(d.startsAt) && now < Date.parse(d.endsAt);
}

export const liveDeals = (now: number) => BLACK_FRIDAY_2026.filter((d) => isDealLive(d, now));

export type DealVerdict = { kind: "lowest" | "matches" | "higher" | "new"; lowUsd: number | null; lowDate: string | null };

/** How the sale price compares with the lowest price we recorded before it. */
export function dealVerdict(d: Pick<Deal, "salePriceUsd" | "log">): DealVerdict {
  if (d.log.length === 0) return { kind: "new", lowUsd: null, lowDate: null };
  const low = d.log.reduce((a, b) => (b.usd < a.usd ? b : a));
  const kind = d.salePriceUsd < low.usd ? "lowest" : d.salePriceUsd === low.usd ? "matches" : "higher";
  return { kind, lowUsd: low.usd, lowDate: low.date };
}
