/**
 * E-bikes from our partner brands, for the /e-bikes guides.
 *
 * RULES
 *  - Every spec and price is copied from the maker's own US product page on
 *    EBIKES_CHECKED by scripts/build_ebike_data.py; a spec the page doesn't
 *    state is null and the page says "not stated", never a guess.
 *  - Payload is rider plus cargo. Only a maker's stated rider limit may be
 *    called a rider limit.
 *  - We have not ridden these bikes. Pages compare stated specs only.
 */

import data from "@/data/ebikes.json";

export type EbikeBrand = "himiway" | "engwe" | "kingbull";

export interface Ebike {
  id: string;
  brand: EbikeBrand;
  model: string;
  url: string;
  price: number;
  listPrice: number | null;
  motorW: number | null;
  peakW: number | null;
  torqueNm: number | null;
  motorType: string | null;
  batteryV: number | null;
  batteryAh: number | null;
  batteryWh: number | null;
  rangeMiles: string | null;
  rangeConditions?: string | null;
  weightLb: number | null;
  payloadLb: number | null;
  rearRackLb?: number | null;
  class: string | null;
  topSpeedMph: string | null;
  throttle: boolean | null;
  paSensor: string | null;
  folding: boolean;
  foldedDims: string | null;
  tire: string | null;
  frame: string | null;
  fendersLightsRack: string | null;
  suspension?: string | null;
  certification?: string | null;
  /** Set when `price` is a dated brand sale: first moment the sale price is NOT shown (ISO, US Pacific). */
  saleEndsAt?: string;
  /** Last sale day as readers see it. */
  saleEndsLabel?: string;
  /** The brand's own pre-sale price, shown once the sale has ended until we re-check the page. */
  regularPrice?: number;
}

/** A well-known bike from a brand we have no partnership with, for "when it's the better pick". */
export interface EbikeAlternative {
  brand: string;
  model: string;
  url: string;
  price: number;
  listPrice?: number;
  keySpec: string;
  whenBetter: string;
}

export const EBIKES_CHECKED: string = data.retrieved;
/** A sale price stops being shown once its end passes: the bike falls back to the brand's regular price. */
export function withSaleEnded(b: Ebike, now: number): Ebike {
  if (!b.saleEndsAt || now < Date.parse(b.saleEndsAt)) return b;
  const { saleEndsAt: _e, saleEndsLabel: _l, ...rest } = b;
  return { ...rest, price: b.regularPrice ?? b.price };
}
export const EBIKES = (data.bikes as Ebike[]).map((b) => withSaleEnded(b, Date.now()));

/** "Himiway's sale price through Nov 14", or "" when the price isn't a dated sale. */
export function ebikeSaleNote(b: Ebike): string {
  if (!b.saleEndsLabel) return "";
  const maker = b.brand === "engwe" ? "ENGWE" : b.brand[0].toUpperCase() + b.brand.slice(1);
  return `${maker}'s sale price through ${b.saleEndsLabel}`;
}
export const EBIKE_ALTERNATIVES = data.alternatives as Record<"heavy" | "hills" | "commuter" | "folding", EbikeAlternative>;

export function ebikeById(id: string): Ebike {
  const b = EBIKES.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown e-bike ${id}`);
  return b;
}
