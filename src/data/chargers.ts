/**
 * Home EV chargers we recommend. Specs and prices are copied from the maker's
 * US product pages on `retrieved` (sourceUrl), like src/data/products.ts.
 * Outbound links go through PartnerLink, which uses the tracked links in
 * src/data/affiliates.ts.
 */
import { AFFILIATES, type BrandId } from "@/data/affiliates";

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
  /** For a charger that can be plugged in or hardwired: the most it draws when hardwired. */
  hardwiredAmps?: number;
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
    listPriceUsd: 479.99,
    url: "https://ev-lectron.com/products/lectron-nexus-level-2-j1772-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
    sourceUrl: "https://ev-lectron.com/products/lectron-nexus-level-2-j1772-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
    retrieved: "2026-10-31",
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
    listPriceUsd: 479.99,
    url: "https://ev-lectron.com/products/lectron-nexus-level-2-nacs-tesla-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
    sourceUrl: "https://ev-lectron.com/products/lectron-nexus-level-2-nacs-tesla-ev-charging-station-240v-40-amp-23ft-cable-wall-mount-j-hook-plug-holder-nema-14-50",
    retrieved: "2026-10-31",
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
    retrieved: "2026-10-31",
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
    retrieved: "2026-10-31",
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
    retrieved: "2026-10-31",
    notes: [
      "The fastest home option here: up to 12 kW, about a quarter faster than a 40-amp plug-in charger, for cars that can take it.",
      "Wired straight into your panel, which Autel recommends for outdoor installs.",
      "Same app scheduling, 25-foot cable and 3-year warranty as the 40-amp model.",
    ],
  },
  // EVIQO (affiliate since Oct 31 2026). Read from eviqo.io product pages and their
  // Shopify .js product data on Oct 31 2026; price is the 3-year (standard) warranty
  // option. Logged in docs/fact-check-eviqo.md.
  {
    id: "eviqo-l2-j1772",
    brand: "eviqo",
    name: "Level 2 (J1772), plug-in 40A or hardwired 48A",
    plug: "J1772",
    level: "Level 2",
    amps: 40,
    hardwiredAmps: 48,
    milesPerHour: 38,
    maxKw: 9.6,
    scheduling: true,
    outlet: "NEMA 14-50 plug-in (40 A), or hardwired by an electrician (48 A), 240 V",
    cableFt: 25,
    certifications: ["UL/ETL listed (EVIQO's wording)", "ENERGY STAR"],
    warrantyYears: 3,
    priceUsd: 299,
    listPriceUsd: 499,
    url: "https://eviqo.io/products/eviqo_level2_ev_charger",
    sourceUrl: "https://eviqo.io/products/eviqo_level2_ev_charger",
    retrieved: "2026-10-31",
    notes: [
      "One charger, two ways to install: plug into a NEMA 14-50 outlet for 40 amps (up to 38 miles of range an hour, EVIQO's figure), or have an electrician hardwire it for 48 amps (up to 46).",
      "A switch inside sets the maximum to 16, 32, 40 or 48 amps to match your circuit; the app fine-tunes from 6 amps up, schedules charging and tracks use (needs 2.4 GHz Wi-Fi).",
      "IP66 / NEMA 4 weatherproof, rated -22°F to 122°F, so it can go outdoors. Fits every J1772 EV and plug-in hybrid; Teslas need an adapter.",
    ],
  },
  {
    id: "eviqo-gen2-j1772-40a",
    brand: "eviqo",
    name: "Level 2 Gen 2 (J1772), 40A plug-in",
    plug: "J1772",
    level: "Level 2",
    amps: 40,
    milesPerHour: null,
    maxKw: 9.6,
    scheduling: true,
    outlet: "NEMA 14-50 (240 V)",
    cableFt: 25,
    certifications: ["UL/ETL listed (EVIQO's wording)", "ENERGY STAR"],
    warrantyYears: 3,
    priceUsd: 450.99,
    listPriceUsd: 579.99,
    url: "https://eviqo.io/products/eviqo-level-2-ev-charger-gen-2-14-50-nema-plug-in-240v",
    sourceUrl: "https://eviqo.io/products/eviqo-level-2-ev-charger-gen-2-14-50-nema-plug-in-240v",
    retrieved: "2026-10-31",
    notes: [
      "The newer plug-in model: adds a high-visibility holster and a side reset button. Same 40 amps, app and 25-foot cable as EVIQO's lower-priced J1772 model.",
    ],
  },
  {
    id: "eviqo-j1772-hardwired-48a",
    brand: "eviqo",
    name: "Level 2 (J1772), 48A hardwired",
    plug: "J1772",
    level: "Level 2",
    amps: 48,
    milesPerHour: null,
    maxKw: 11.5,
    scheduling: true,
    outlet: "Hardwired by an electrician on a 60 A circuit (240 V)",
    cableFt: 25,
    certifications: ["UL/ETL listed (EVIQO's wording)", "ENERGY STAR"],
    warrantyYears: 3,
    priceUsd: 450.99,
    listPriceUsd: 579.99,
    url: "https://eviqo.io/products/eviqo-level-2-ev-charger-hardwire-version-240v-48-amp-home-charging-station-25-cable-40-input-cable",
    sourceUrl: "https://eviqo.io/products/eviqo-level-2-ev-charger-hardwire-version-240v-48-amp-home-charging-station-25-cable-40-input-cable",
    retrieved: "2026-10-31",
    notes: [
      "48 amps on a dedicated 60-amp circuit; a switch unlocks 50 amps on a 70-amp circuit. Same holster and reset button as the Gen 2 plug-in.",
    ],
  },
  {
    id: "eviqo-nacs-40a",
    brand: "eviqo",
    name: "NACS Level 2 (Tesla), 40A plug-in",
    plug: "NACS",
    level: "Level 2",
    amps: 40,
    milesPerHour: 38,
    maxKw: 9.6,
    scheduling: true,
    outlet: "NEMA 14-50 (240 V)",
    cableFt: 25,
    certifications: ["UL/ETL listed (EVIQO's wording)", "ENERGY STAR"],
    warrantyYears: 3,
    priceUsd: 480.99,
    listPriceUsd: 599,
    url: "https://eviqo.io/products/eviqo-level-2-ev-charger-nacs-charger-compatible-with-tesla",
    sourceUrl: "https://eviqo.io/products/eviqo-level-2-ev-charger-nacs-charger-compatible-with-tesla",
    retrieved: "2026-10-31",
    notes: [
      "Tesla-style (NACS) plug with a button that opens a Tesla's charge port. About 38 miles of range an hour (EVIQO's figure).",
      "App scheduling for cheaper overnight rates, 25-foot cable, IP66 / NEMA 4 weatherproof.",
    ],
  },
  {
    id: "eviqo-nacs-hardwired-48a",
    brand: "eviqo",
    name: "NACS Level 2 (Tesla), 48A hardwired",
    plug: "NACS",
    level: "Level 2",
    amps: 48,
    milesPerHour: null,
    maxKw: 11.5,
    scheduling: true,
    outlet: "Hardwired by an electrician on a 60 A circuit (240 V)",
    cableFt: 25,
    certifications: ["UL/ETL listed (EVIQO's wording)", "ENERGY STAR"],
    warrantyYears: 3,
    priceUsd: 480.99,
    listPriceUsd: 599,
    url: "https://eviqo.io/products/eviqo-level-2-ev-charger-hardwired-nacs-charger-compatible-with-tesla",
    sourceUrl: "https://eviqo.io/products/eviqo-level-2-ev-charger-hardwired-nacs-charger-compatible-with-tesla",
    retrieved: "2026-10-31",
    notes: [
      "A hardwired Tesla-style (NACS) charger: 48 amps on a dedicated 60-amp circuit, app scheduling, 25-foot cable, IP66 / NEMA 4 weatherproof for outdoor installs.",
    ],
  },
];

/** The maker's display name, e.g. "Lectron", "Autel", "EVIQO". */
export const brandName = (c: Pick<HomeCharger, "brand">) => AFFILIATES[c.brand].name;

export const chargerById = (id: string) => {
  const c = HOME_CHARGERS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown charger ${id}`);
  return c;
};
