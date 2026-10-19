/**
 * Home EV chargers we recommend. Specs and prices are copied from the maker's
 * US product pages on `retrieved` (sourceUrl), like src/data/products.ts.
 * Outbound links go through PartnerLink, which uses the tracked links in
 * src/data/affiliates.ts.
 */
import type { BrandId } from "@/data/affiliates";

export interface HomeCharger {
  id: string;
  brand: Exclude<BrandId, "energysage">;
  name: string;
  /** "J1772" fits most non-Tesla EVs; "NACS" fits Teslas and newer NACS-port EVs. */
  plug: "J1772" | "NACS";
  level: "Level 2" | "Level 1 & 2";
  amps: number;
  /** Maker's stated miles of range added per hour at full power. */
  milesPerHour: number | null;
  /** Maker's stated maximum output in kW, where given. */
  maxKw?: number;
  /** Phone app that can schedule charging (e.g. for cheaper overnight rates). */
  scheduling?: boolean;
  outlet: string;
  cableFt: number | null;
  certifications: string[];
  warrantyYears: number | null;
  priceUsd: number;
  listPriceUsd: number | null;
  url: string;
  sourceUrl: string;
  retrieved: string;
  notes: string[];
}

export const HOME_CHARGERS: HomeCharger[] = [
  {
    id: "lectron-nexus-j1772",
    brand: "lectron",
    name: "NEXUS Level 2 (J1772)",
    plug: "J1772",
    level: "Level 2",
    amps: 40,
    milesPerHour: 38,
    outlet: "NEMA 14-50 (240 V)",
    cableFt: 23,
    certifications: ["ETL listed to UL 2594, UL 2231, UL 2251", "ENERGY STAR"],
    warrantyYears: 3,
    priceUsd: 419.99,
    listPriceUsd: 469.99,
    url: "https://ev-lectron.com/products/lectron-nexus-level-2-j1772-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
    sourceUrl: "https://ev-lectron.com/products/lectron-nexus-level-2-j1772-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
    retrieved: "2026-10-15",
    notes: [
      "Fits most non-Tesla EVs, such as the Chevrolet Equinox EV, Ford Mustang Mach-E and Volkswagen ID.4 (Lectron's list).",
      "Plugs into a 240-volt NEMA 14-50 outlet, the kind used for electric ranges and RVs; if you don't have one, an electrician adds it.",
      "Weatherproof (IP66) for a driveway or garage.",
    ],
  },
  {
    id: "lectron-nexus-nacs",
    brand: "lectron",
    name: "NEXUS Level 2 (Tesla / NACS)",
    plug: "NACS",
    level: "Level 2",
    amps: 40,
    milesPerHour: 38,
    outlet: "NEMA 14-50 (240 V)",
    cableFt: 23,
    certifications: ["ETL listed to UL 2594, UL 2231, UL 2251, UL 817", "ENERGY STAR"],
    warrantyYears: 3,
    priceUsd: 419.99,
    listPriceUsd: 469.99,
    url: "https://ev-lectron.com/products/lectron-nexus-level-2-nacs-tesla-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
    sourceUrl: "https://ev-lectron.com/products/lectron-nexus-level-2-nacs-tesla-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
    retrieved: "2026-10-15",
    notes: [
      "For Teslas and newer EVs with the NACS (Tesla-style) port.",
      "Same 40-amp, 240-volt NEMA 14-50 setup as the J1772 version.",
    ],
  },
  {
    id: "lectron-portable-nacs",
    brand: "lectron",
    name: "Portable Level 1 & 2 (Tesla / NACS)",
    plug: "NACS",
    level: "Level 1 & 2",
    amps: 40,
    milesPerHour: null,
    outlet: "NEMA 5-15 (ordinary 120 V outlet) or NEMA 14-50 (240 V)",
    cableFt: null,
    certifications: ["ETL listed"],
    warrantyYears: null,
    priceUsd: 319.99,
    listPriceUsd: 369.99,
    url: "https://ev-lectron.com/products/lectron-portable-level-1-2-tesla-nacs-ev-charger-120v-240v-adjustable-current-8-40a-nema-5-15-14-50",
    sourceUrl: "https://ev-lectron.com/products/lectron-portable-level-1-2-tesla-nacs-ev-charger-120v-240v-adjustable-current-8-40a-nema-5-15-14-50",
    retrieved: "2026-10-15",
    notes: [
      "Comes with plugs for both an ordinary outlet and a 240-volt NEMA 14-50, adjustable from 8 to 40 amps.",
      "Good for renters or a second home; Lectron listed it as shipping in mid-November when we checked.",
    ],
  },
  {
    id: "autel-elite-home-40a",
    brand: "autel",
    name: "MaxiCharger AC Elite Home 40A",
    plug: "J1772",
    level: "Level 2",
    amps: 40,
    milesPerHour: null,
    maxKw: 9.6,
    scheduling: true,
    outlet: "NEMA 14-50 (240 V)",
    cableFt: 25,
    certifications: [],
    warrantyYears: 3,
    priceUsd: 559,
    listPriceUsd: null,
    url: "https://autelenergy.us/products/maxicharger-ac-wallbox-home-40a-nema-14-50-ev-charger-with-separate-holster",
    sourceUrl: "https://autelenergy.us/products/maxicharger-ac-wallbox-home-40a-nema-14-50-ev-charger-with-separate-holster",
    retrieved: "2026-10-19",
    notes: [
      "Smart charger: the Autel Charge app starts, stops and schedules charging, so you can set it to charge only in your utility's cheaper overnight hours.",
      "Fits every EV and plug-in hybrid with a J1772 port; Teslas need a J1772 adapter.",
      "Plugs into a 240-volt NEMA 14-50 outlet; 25-foot cable reaches a car parked nose-in or backed in. Free US shipping.",
    ],
  },
  {
    id: "autel-elite-home-50a",
    brand: "autel",
    name: "MaxiCharger AC Elite Home 50A (hardwired)",
    plug: "J1772",
    level: "Level 2",
    amps: 50,
    milesPerHour: null,
    maxKw: 12,
    scheduling: true,
    outlet: "Hardwired by an electrician (240 V)",
    cableFt: 25,
    certifications: [],
    warrantyYears: 3,
    priceUsd: 599,
    listPriceUsd: null,
    url: "https://autelenergy.us/products/maxicharger-ac-hardwired-wallbox-with-side-holster",
    sourceUrl: "https://autelenergy.us/products/maxicharger-ac-hardwired-wallbox-with-side-holster",
    retrieved: "2026-10-19",
    notes: [
      "The fastest home option here: up to 12 kW, about a quarter faster than a 40-amp plug-in charger, for cars that can take it.",
      "Wired straight into your panel, which Autel recommends for outdoor installs.",
      "Same app scheduling, 25-foot cable and 3-year warranty as the 40-amp model.",
    ],
  },
];

export const chargerById = (id: string) => {
  const c = HOME_CHARGERS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown charger ${id}`);
  return c;
};
