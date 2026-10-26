/**
 * Ready-to-buy solar kits: everything for one system from one brand's own
 * store, so a reader can put the whole kit in that store's cart in one click.
 *
 * RULES (enforced by tests/kits.test.ts):
 *   - Every line is a Shopify variant id, quantity and price read from the
 *     brand's own US store (/products/<handle>.js) on `checked`, and was in
 *     stock that day. Sold-out items go in KIT_EXCLUDED, not in a kit.
 *   - Prefer the brand's own bundle variant (one line). When the parts cost
 *     less than the bundle, the kit uses the parts and says so in `notes`.
 *   - Panels are only paired with a station the brand itself sells them with
 *     (a bundle or a stated pairing). Extra panels and batteries are only
 *     offered up to a count the brand states; `basis` says where.
 *   - Totals are derived from the lines, never typed in.
 * Outbound cart links are built by cartUrl() in src/data/affiliates.ts.
 */

import type { BrandId } from "@/data/affiliates";

/** Brands whose store accepts a cart permalink (see cartOrigin in affiliates.ts). */
export type KitBrand = Extract<BrandId, "bluetti" | "ecoflow" | "jackery">;

/** The day every price and stock state below was read. */
export const KITS_CHECKED = "2026-10-26";

export interface KitLine {
  /** Shopify variant id on the brand's US store. */
  variantId: number;
  qty: number;
  /** Plain name of what arrives, e.g. "AC180 power station + 200 W solar panel". */
  label: string;
  /** Store price for one, USD, on KITS_CHECKED. */
  unitPriceUsd: number;
  /** Product page the variant lives on (also the price source). */
  url: string;
  /** Rated battery Wh in one unit of this line (0 for panels). */
  wh: number;
  /** Solar panel watts in one unit of this line (0 if none). */
  panelW: number;
}

/** An optional extra (battery or panel) the reader can add with a stepper. */
export interface KitExtra {
  variantId: number;
  label: string;
  unitPriceUsd: number;
  url: string;
  wh: number;
  panelW: number;
  /** Most the reader can add to this kit. */
  max: number;
  /** Where the limit comes from (the brand's stated pairing or expansion limit). */
  basis: string;
}

export interface KitDef {
  id: string;
  brand: KitBrand;
  name: string;
  /** Short line on who it suits. */
  blurb: string;
  lines: KitLine[];
  /** Station's continuous AC output, watts. */
  acOutputW: number;
  /** Station's maximum solar input, watts, as stated by the brand. */
  solarInputW: number;
  /** 120/240 V output for well pumps and home circuits. */
  splitPhase?: boolean;
  addBattery?: KitExtra;
  addPanel?: KitExtra;
  checked: string;
  /** Pages the variants, prices and specs were read from. */
  sources: string[];
  notes?: string[];
}

export interface Kit extends KitDef {
  /** Derived from the lines. */
  batteryWh: number;
  panelW: number;
  priceUsd: number;
  itemCount: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Totals from the lines, so a typo in a hand-typed total can never reach the page. */
export function kitFromDef(d: KitDef): Kit {
  return {
    ...d,
    batteryWh: round2(d.lines.reduce((t, l) => t + l.wh * l.qty, 0)),
    panelW: d.lines.reduce((t, l) => t + l.panelW * l.qty, 0),
    priceUsd: round2(d.lines.reduce((t, l) => t + l.unitPriceUsd * l.qty, 0)),
    itemCount: d.lines.reduce((t, l) => t + l.qty, 0),
  };
}

const BL = "https://www.bluettipower.com/products/";
const EF = "https://us.ecoflow.com/products/";
const JK = "https://www.jackery.com/products/";

const B300K: KitExtra = {
  variantId: 47262756896987,
  label: "BLUETTI B300K expansion battery for Apex 300 (2,764.8 Wh)",
  unitPriceUsd: 1079,
  url: `${BL}apex-300-b300k-expansion-battery`,
  wh: 2764.8,
  panelW: 0,
  max: 0,
  basis: "Bluetti: the Apex 300 takes up to six B300K batteries",
};

const DEFS: KitDef[] = [
  // ---------------------------------------------------------------- Bluetti
  {
    id: "bluetti-ac180-200w",
    brand: "bluetti",
    name: "Bluetti AC180 + 200 W solar",
    blurb: "Weekend cabin or camp: lights, phones and a 12 V cooler",
    lines: [
      { variantId: 45427542491355, qty: 1, label: "AC180 power station (1,152 Wh) + 200 W solar panel, Bluetti bundle", unitPriceUsd: 769, url: `${BL}ac180`, wh: 1152, panelW: 200 },
    ],
    acOutputW: 1800,
    solarInputW: 500,
    addPanel: {
      variantId: 46104316248283,
      label: "Extra BLUETTI 200 W solar panel",
      unitPriceUsd: 349,
      url: `${BL}bluetti-sp200l-solar-panel-200w`,
      wh: 0,
      panelW: 200,
      max: 1,
      basis: "Bluetti sells the AC180 with two 200 W panels (500 W solar input)",
    },
    checked: KITS_CHECKED,
    sources: [`${BL}ac180`, `${BL}bluetti-sp200l-solar-panel-200w`],
  },
  {
    id: "bluetti-elite-300-350w",
    brand: "bluetti",
    name: "Bluetti Elite 300 + 350 W solar",
    blurb: "A weekend place with a fridge, or a small part-time cabin",
    lines: [
      { variantId: 48309261664475, qty: 1, label: "Elite 300 power station (3,014 Wh) + 350 W solar panel, Bluetti bundle", unitPriceUsd: 1499, url: `${BL}elite-300-350w`, wh: 3014.4, panelW: 350 },
    ],
    acOutputW: 2400,
    solarInputW: 1200,
    checked: KITS_CHECKED,
    sources: [`${BL}elite-300-350w`, `${BL}elite-300-portable-power-station`],
    notes: ["On Oct 26 2026 this bundle ($1,499) cost less than the Elite 300 alone ($1,699)."],
  },
  {
    id: "bluetti-elite-400-700w",
    brand: "bluetti",
    name: "Bluetti Elite 400 + 700 W solar",
    blurb: "Part-time cabin essentials with two panels",
    lines: [
      { variantId: 47915195957467, qty: 1, label: "Elite 400 power station (3,840 Wh) + two 350 W solar panels, Bluetti bundle", unitPriceUsd: 2448, url: `${BL}elite-400-2-350w`, wh: 3840, panelW: 700 },
    ],
    acOutputW: 2600,
    solarInputW: 1000,
    checked: KITS_CHECKED,
    sources: [`${BL}elite-400-2-350w`],
  },
  {
    id: "bluetti-apex-300-b300k-700w",
    brand: "bluetti",
    name: "Bluetti Apex 300 + B300K + 700 W solar",
    blurb: "120/240 V home-style system you can grow to 19 kWh",
    lines: [
      { variantId: 47354165887195, qty: 1, label: "Apex 300 (2,764.8 Wh) + B300K battery (2,764.8 Wh) + two 350 W solar panels, Bluetti bundle", unitPriceUsd: 3698, url: `${BL}apex-300-b300k-2-200w`, wh: 5529.6, panelW: 700 },
    ],
    acOutputW: 3840,
    solarInputW: 2400,
    splitPhase: true,
    addBattery: { ...B300K, max: 5 },
    checked: KITS_CHECKED,
    sources: [`${BL}apex-300-b300k-2-200w`, `${BL}apex-300-b300k-expansion-battery`, `${BL}apex-300-home-battery-backup`],
  },
  {
    id: "bluetti-apex-300-4xb300k-1000w",
    brand: "bluetti",
    name: "Bluetti Apex 300 + 4 × B300K + 1,000 W solar",
    blurb: "Part-time or full-time cabin: about 13.8 kWh of storage",
    lines: [
      { variantId: 47351562174683, qty: 1, label: "BLUETTI Apex 300 home battery (2,764.8 Wh)", unitPriceUsd: 1599, url: `${BL}apex-300-home-battery-backup`, wh: 2764.8, panelW: 0 },
      { variantId: B300K.variantId, qty: 4, label: B300K.label, unitPriceUsd: B300K.unitPriceUsd, url: B300K.url, wh: B300K.wh, panelW: 0 },
      { variantId: 49003448860891, qty: 2, label: "BLUETTI 500 W solar panel", unitPriceUsd: 799, url: `${BL}500w-portable-solar-panel`, wh: 0, panelW: 500 },
    ],
    acOutputW: 3840,
    solarInputW: 2400,
    splitPhase: true,
    addBattery: { ...B300K, max: 2 },
    checked: KITS_CHECKED,
    sources: [`${BL}apex-300-home-battery-backup`, `${BL}apex-300-b300k-expansion-battery`, `${BL}500w-portable-solar-panel`, `${BL}apex-300-2-b300k-2-500w`],
    notes: [
      "Bought as parts: on Oct 26 2026 Bluetti's own Apex 300 + 2 × B300K + 2 × 500 W bundle ($5,499) cost more than the same parts ($5,355).",
      "Bluetti sells the Apex 300 with two 500 W panels; we do not pair more without a stated pairing.",
    ],
  },

  // ---------------------------------------------------------------- EcoFlow
  {
    id: "ecoflow-delta-3-plus-220w",
    brand: "ecoflow",
    name: "EcoFlow DELTA 3 Plus + 220 W solar",
    blurb: "Weekend cabin or camp, with room for one extra battery",
    lines: [
      { variantId: 41826183151689, qty: 1, label: "DELTA 3 Plus power station (1,024 Wh) + 220 W bifacial solar panel, EcoFlow bundle", unitPriceUsd: 919, url: `${EF}delta-3-plus-portable-power-station`, wh: 1024, panelW: 220 },
    ],
    acOutputW: 1800,
    solarInputW: 1000,
    addBattery: {
      variantId: 41631849971785,
      label: "EcoFlow DELTA 3 Series Smart Extra Battery (1,024 Wh)",
      unitPriceUsd: 409,
      url: `${EF}delta-3-series-smart-extra-battery`,
      wh: 1024,
      panelW: 0,
      max: 1,
      basis: "EcoFlow: the DELTA 3 Plus takes one extra battery",
    },
    addPanel: {
      variantId: 39993294454857,
      label: "Extra EcoFlow 220 W bifacial solar panel",
      unitPriceUsd: 399,
      url: `${EF}220w-bifacial-portable-solar-panel-bundle`,
      wh: 0,
      panelW: 220,
      max: 1,
      basis: "EcoFlow sells the DELTA 3 Plus with two 220 W panels",
    },
    checked: KITS_CHECKED,
    sources: [`${EF}delta-3-plus-portable-power-station`, `${EF}delta-3-series-smart-extra-battery`, `${EF}220w-bifacial-portable-solar-panel-bundle`],
  },
  {
    id: "ecoflow-delta-pro-3-eb-400w",
    brand: "ecoflow",
    name: "EcoFlow DELTA Pro 3 + Extra Battery + 400 W solar",
    blurb: "120/240 V, about 8 kWh, for a part-time cabin or long outages",
    lines: [
      { variantId: 56095773524041, qty: 1, label: "DELTA Pro 3 (4,096 Wh) + Smart Extra Battery (4,096 Wh) + 400 W solar panel, EcoFlow bundle", unitPriceUsd: 4789, url: `${EF}delta-pro-3-portable-power-station`, wh: 8192, panelW: 400 },
    ],
    acOutputW: 4000,
    solarInputW: 2600,
    splitPhase: true,
    addBattery: {
      variantId: 41385808199753,
      label: "EcoFlow DELTA Pro 3 Smart Extra Battery (4,096 Wh)",
      unitPriceUsd: 1899,
      url: `${EF}delta-pro-3-extra-battery`,
      wh: 4096,
      panelW: 0,
      max: 1,
      basis: "EcoFlow: the DELTA Pro 3 takes up to two extra batteries",
    },
    addPanel: {
      variantId: 39998021697609,
      label: "Extra EcoFlow 400 W portable solar panel",
      unitPriceUsd: 699,
      url: `${EF}400w-portable-solar-panel`,
      wh: 0,
      panelW: 400,
      max: 1,
      basis: "EcoFlow sells the DELTA Pro 3 with two 400 W panels",
    },
    checked: KITS_CHECKED,
    sources: [`${EF}delta-pro-3-portable-power-station`, `${EF}delta-pro-3-extra-battery`, `${EF}400w-portable-solar-panel`],
  },
  {
    id: "ecoflow-delta-pro-3-2eb-800w",
    brand: "ecoflow",
    name: "EcoFlow DELTA Pro 3 + 2 Extra Batteries + 800 W solar",
    blurb: "The DELTA Pro 3 at its full 12.3 kWh",
    lines: [
      { variantId: 41385808298057, qty: 1, label: "DELTA Pro 3 (4,096 Wh) + two Smart Extra Batteries (4,096 Wh each), EcoFlow bundle", unitPriceUsd: 6169, url: `${EF}delta-pro-3-extra-battery`, wh: 12288, panelW: 0 },
      { variantId: 54553987612745, qty: 1, label: "Two EcoFlow 400 W portable solar panels (2-pack)", unitPriceUsd: 1099, url: `${EF}400w-portable-solar-panel`, wh: 0, panelW: 800 },
    ],
    acOutputW: 4000,
    solarInputW: 2600,
    splitPhase: true,
    checked: KITS_CHECKED,
    sources: [`${EF}delta-pro-3-extra-battery`, `${EF}400w-portable-solar-panel`, `${EF}delta-pro-3-solar-generator`],
  },

  // ---------------------------------------------------------------- Jackery
  {
    id: "jackery-1000-v2-200w",
    brand: "jackery",
    name: "Jackery Explorer 1000 v2 + 200 W solar",
    blurb: "Weekend cabin or camp: lights, phones and a 12 V cooler",
    lines: [
      { variantId: 40910606205015, qty: 1, label: "Explorer 1000 v2 (1,070 Wh, black) + SolarSaga 200W panel, Jackery bundle", unitPriceUsd: 699, url: `${JK}jackery-solar-generator-1000-v2`, wh: 1070, panelW: 200 },
    ],
    acOutputW: 1500,
    solarInputW: 400,
    checked: KITS_CHECKED,
    sources: [`${JK}jackery-solar-generator-1000-v2`],
  },
  {
    id: "jackery-2000-v2-400w",
    brand: "jackery",
    name: "Jackery Explorer 2000 v2 + 400 W solar",
    blurb: "A weekend place with a fridge",
    lines: [
      { variantId: 41264595861591, qty: 1, label: "Explorer 2000 v2 (2,042 Wh) + two SolarSaga 200W panels, Jackery bundle", unitPriceUsd: 1399, url: `${JK}jackery-solar-generator-2000-v2`, wh: 2042, panelW: 400 },
    ],
    acOutputW: 2200,
    solarInputW: 400,
    checked: KITS_CHECKED,
    sources: [`${JK}jackery-solar-generator-2000-v2`],
  },
  {
    id: "jackery-5000-plus-1000w",
    brand: "jackery",
    name: "Jackery Explorer 5000 Plus + 1,000 W solar",
    blurb: "120/240 V and 7,200 W output, for well pumps and home circuits",
    lines: [
      { variantId: 41341600038999, qty: 1, label: "Explorer 5000 Plus (5,040 Wh) + two SolarSaga 500 X panels, Jackery bundle", unitPriceUsd: 4639, url: `${JK}jackery-explorer-5000-plus`, wh: 5040, panelW: 1000 },
    ],
    acOutputW: 7200,
    solarInputW: 4000,
    splitPhase: true,
    addBattery: {
      variantId: 41317176213591,
      label: "Jackery Battery Pack 5000 Plus (5,040 Wh)",
      unitPriceUsd: 2599,
      url: `${JK}jackery-battery-pack-5000-plus`,
      wh: 5040,
      panelW: 0,
      max: 1,
      basis: "Jackery sells the 5000 Plus as a 10 kWh set with one Battery Pack 5000 Plus; we offer no more than that",
    },
    checked: KITS_CHECKED,
    sources: [`${JK}jackery-explorer-5000-plus`, `${JK}jackery-battery-pack-5000-plus`],
    notes: ["Jackery's product description says up to 4,000 W input in its solar section."],
  },
];

export const KITS: Kit[] = DEFS.map(kitFromDef);

export const kitById = (id: string) => {
  const k = KITS.find((x) => x.id === id);
  if (!k) throw new Error(`Unknown kit ${id}`);
  return k;
};

/** Items we checked and left out, so the next price check knows why. */
export const KIT_EXCLUDED: { brand: BrandId; item: string; reason: string; checked: string }[] = [
  { brand: "bluetti", item: "AC200L power station", reason: "sold out", checked: KITS_CHECKED },
  {
    brand: "bluetti",
    item: "B300K listed \"for AC200L/AC300\" (/products/b300k)",
    reason: "not used with the Apex 300; Bluetti sells a separate \"B300K for Apex 300\" listing, which the kits use",
    checked: KITS_CHECKED,
  },
  { brand: "jackery", item: "Battery Pack 1000 Plus (add-on for the Explorer 1000 Plus)", reason: "sold out", checked: KITS_CHECKED },
  { brand: "ecoflow", item: "DELTA 3 Plus + 2 × 220W panel bundle", reason: "sold out (single-panel bundle plus an extra panel used instead)", checked: KITS_CHECKED },
  { brand: "anker", item: "F3000 + 440 W panel bundles and the BP3000 battery", reason: "sold out", checked: KITS_CHECKED },
  {
    brand: "anker",
    item: "All Anker SOLIX kits (F3800 Plus + BP3800, C2000 Gen 2, C1000 Gen 2)",
    reason:
      "ankersolix.com is not a standard Shopify storefront: a cart link on its us.ankersolix.com store goes straight to checkout at higher prices than the site shows (C2000 Gen 2 + BP2000: $2,099.98 at checkout, against $1,649.98 for the same two items in our Oct 2026 product data from ankersolix.com)",
    checked: KITS_CHECKED,
  },
];
