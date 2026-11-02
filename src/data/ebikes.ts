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
export const EBIKES = data.bikes as Ebike[];
export const EBIKE_ALTERNATIVES = data.alternatives as Record<"heavy" | "hills" | "commuter" | "folding", EbikeAlternative>;

export function ebikeById(id: string): Ebike {
  const b = EBIKES.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown e-bike ${id}`);
  return b;
}
