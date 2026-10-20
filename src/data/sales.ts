/**
 * Time-limited brand sales shown as a small note beside our picks. A sale never
 * changes a recommendation; it is an extra line that disappears on its own when
 * the sale ends. Plain values only, so server and client code can both import it.
 */

export interface SaleItem {
  /** Short product name as we show it. */
  name: string;
  /** Brand product page (no tracking; PartnerLink adds it). */
  url: string;
  salePriceUsd: number;
  /** Everyday price on the brand's site before the sale (not the inflated list price). */
  regularPriceUsd: number;
}

export interface BrandSale {
  id: string;
  brand: "redodo";
  title: string;
  /** Sale landing page on the brand's site (no tracking). */
  url: string;
  /** First moment shown, ISO with offset. */
  startsAt: string;
  /** First moment NOT shown, ISO with offset (end of the last sale day, US Pacific). */
  endsAt: string;
  /** Last sale day as readers see it. */
  endsLabel: string;
  items: SaleItem[];
  /** Brand's new-customer offer, in our words. */
  note?: string;
  /** Date we read the prices on the brand's site. */
  checked: string;
}

const RD = "https://www.redodopower.com/products/";

// Read on redodopower.com on 2026-10-20. Regular prices are what Redodo charged
// before the sale (our own records from Oct 19 and 20, matching Redodo's "save $90"
// and "save $14" labels), not the higher crossed-out list price on the product page.
export const REDODO_HALLOWEEN_2026: BrandSale = {
  id: "redodo-halloween-2026",
  brand: "redodo",
  title: "Redodo Halloween sale",
  url: "https://www.redodopower.com/pages/redodo-brand-sale-2026",
  startsAt: "2026-10-20T00:00:00-07:00",
  // Nov 1 is after the switch to standard time (2 a.m. that day), so midnight Pacific is UTC-8.
  endsAt: "2026-11-02T00:00:00-08:00",
  endsLabel: "Nov 1",
  items: [
    { name: "24V 100Ah Group 31 Bluetooth", url: `${RD}redodo-24v-100ah-group-31-bluetooth-lithium-battery`, salePriceUsd: 579.99, regularPriceUsd: 669.99 },
    { name: "24V 125Ah Self-Heating", url: `${RD}redodo-24v-125ah-lifepo4-trolling-motor-battery`, salePriceUsd: 615.99, regularPriceUsd: 629.99 },
  ],
  note: "New Redodo customers can also sign up on Redodo's site for 6% off a first order; it can't be combined with other discounts.",
  checked: "2026-10-20",
};

/** True while the sale is on at `now` (milliseconds since epoch). */
export function isSaleLive(sale: Pick<BrandSale, "startsAt" | "endsAt">, now: number): boolean {
  return now >= Date.parse(sale.startsAt) && now < Date.parse(sale.endsAt);
}

/** Same check against the current clock; call only at request time (after connection()). */
export const isSaleLiveNow = (sale: Pick<BrandSale, "startsAt" | "endsAt">) => isSaleLive(sale, Date.now());

export const saleSavingUsd = (i: SaleItem) => Math.round((i.regularPriceUsd - i.salePriceUsd) * 100) / 100;
