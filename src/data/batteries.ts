/**
 * 12 V (and 24 V / 48 V) lithium batteries that replace lead-acid batteries in
 * RVs, vans, boats and small solar systems, plus the lead-acid battery we
 * compare them with.
 *
 * RULES (enforced by tests/batteries.test.ts):
 *   - Every spec and price is copied from the maker's own US product page, and
 *     `sourceUrl` + `retrieved` say where and when.
 *   - `priceUsd` is the single-battery price shown on that page that day;
 *     `listPriceUsd` is the crossed-out regular price, if one was shown.
 *   - Use null for anything the maker does not publish. Never estimate.
 *   - No ratings or reviews: we have not collected any.
 * Outbound links are built from `url` by src/data/affiliates.ts.
 */

import type { BrandId } from "@/data/affiliates";

export type BatteryUse = "rv" | "marine" | "cold" | "trolling" | "home";

export interface DeepCycleBattery {
  id: string;
  brand: Exclude<BrandId, "energysage">;
  model: string;
  /** Short plain-English name used in picks, e.g. "12V 100Ah". */
  short: string;
  url: string;
  sourceUrl: string;
  /** YYYY-MM-DD the specs and price were checked. */
  retrieved: string;
  /** Nominal volts as sold (12.8 V packs are sold as "12V"). */
  volts: 12 | 24 | 48;
  nominalV: number;
  ampHours: number;
  /** Rated energy in watt-hours (nominal volts x amp-hours, as the maker states it). */
  energyWh: number;
  /** Continuous discharge current from the maker's spec table, amps. */
  continuousA: number;
  /** Cycles the maker rates it for at 100% depth of discharge. */
  cycles: number;
  weightLb: number;
  warrantyYears: number | null;
  /** Service life the maker states, years. */
  lifeYears: number | null;
  bluetooth: boolean;
  /** Stops charging below freezing to protect the cells. */
  lowTempCutoff: boolean;
  /** Warms itself so it can charge below freezing. */
  selfHeating: boolean;
  priceUsd: number;
  listPriceUsd: number | null;
  uses: BatteryUse[];
  notes: string[];
}

const RD = "https://www.redodopower.com/products/";
const CHECKED = "2026-10-16";

export const BATTERIES: DeepCycleBattery[] = [
  {
    id: "redodo-12v-100ah", brand: "redodo", model: "12V 100Ah LiFePO4 Lithium Battery", short: "12V 100Ah",
    url: `${RD}12v-100ah-lithium-battery`, sourceUrl: `${RD}12v-100ah-lithium-battery`, retrieved: CHECKED,
    volts: 12, nominalV: 12.8, ampHours: 100, energyWh: 1280, continuousA: 100, cycles: 4000,
    weightLb: 22.05, warrantyYears: 5, lifeYears: 10, bluetooth: false, lowTempCutoff: false, selfHeating: false,
    priceUsd: 242.89, listPriceUsd: 279.99, uses: ["rv", "marine", "trolling"],
    notes: [
      "Redodo's budget model; same size as a Group 31 lead-acid battery.",
      "Rated 4,000 cycles at 100% depth of discharge; Redodo states a 10-year life and 5-year warranty.",
      "Redodo says it suits 30 to 70 lb thrust trolling motors and is not for engine starting.",
    ],
  },
  {
    id: "redodo-12v-100ah-group31-bluetooth", brand: "redodo", model: "12V 100Ah Group 31 Bluetooth Lithium Battery", short: "12V 100Ah Bluetooth",
    url: `${RD}redodo-12v-100ah-smart-bluetooth-lithium-battery`, sourceUrl: `${RD}redodo-12v-100ah-smart-bluetooth-lithium-battery`, retrieved: CHECKED,
    volts: 12, nominalV: 12.8, ampHours: 100, energyWh: 1280, continuousA: 100, cycles: 4000,
    weightLb: 22.84, warrantyYears: 5, lifeYears: null, bluetooth: true, lowTempCutoff: true, selfHeating: false,
    priceUsd: 265.99, listPriceUsd: 389.99, uses: ["rv", "marine", "trolling"],
    notes: [
      "Shows charge level, current and remaining time in the Redodo phone app.",
      "Stops charging below 32°F to protect the cells.",
    ],
  },
  {
    id: "redodo-12v-100ah-self-heating", brand: "redodo", model: "12V 100Ah Self-Heating Lithium Battery", short: "12V 100Ah Self-Heating",
    url: `${RD}self-heating-redodo-12v-100ah-lithium-battery`, sourceUrl: `${RD}self-heating-redodo-12v-100ah-lithium-battery`, retrieved: CHECKED,
    volts: 12, nominalV: 12.8, ampHours: 100, energyWh: 1280, continuousA: 100, cycles: 4000,
    weightLb: 23.32, warrantyYears: 5, lifeYears: 10, bluetooth: false, lowTempCutoff: true, selfHeating: true,
    priceUsd: 279.99, listPriceUsd: 559.99, uses: ["rv", "cold", "marine"],
    notes: [
      "Built-in 100 W heating pads switch on below 32°F and off at 41°F, then charging resumes.",
      "Stops discharging below -4°F, per Redodo.",
    ],
  },
  {
    id: "redodo-12v-200ah-plus", brand: "redodo", model: "12V 200Ah Plus Deep Cycle Lithium Battery", short: "12V 200Ah Plus",
    url: `${RD}12v-200ah-plus-deep-cycle-lithium-battery`, sourceUrl: `${RD}12v-200ah-plus-deep-cycle-lithium-battery`, retrieved: CHECKED,
    volts: 12, nominalV: 12.8, ampHours: 200, energyWh: 2560, continuousA: 200, cycles: 4000,
    weightLb: 45.59, warrantyYears: 5, lifeYears: 10, bluetooth: false, lowTempCutoff: false, selfHeating: false,
    priceUsd: 449.99, listPriceUsd: 769.99, uses: ["rv", "home"],
    notes: [
      "200 A battery management system: 2,560 W continuous, enough for a microwave or coffee maker through an inverter.",
      "Redodo says it replaces two 12V 200Ah AGM batteries.",
    ],
  },
  {
    id: "redodo-12v-300ah", brand: "redodo", model: "12V 300Ah Lithium LiFePO4 Battery", short: "12V 300Ah",
    url: `${RD}12v-300ah-lithium-battery`, sourceUrl: `${RD}12v-300ah-lithium-battery`, retrieved: CHECKED,
    volts: 12, nominalV: 12.8, ampHours: 300, energyWh: 3840, continuousA: 200, cycles: 4000,
    weightLb: 59.6, warrantyYears: 5, lifeYears: 10, bluetooth: false, lowTempCutoff: false, selfHeating: false,
    priceUsd: 599.99, listPriceUsd: 1099.99, uses: ["rv", "home"],
    notes: [
      "About 20.6 x 9.3 x 8.6 inches; Redodo says one replaces six 12V 100Ah AGM batteries.",
      "IP65 water resistance; listed as a pre-order when we checked.",
    ],
  },
  {
    id: "redodo-24v-50ah-trolling", brand: "redodo", model: "24V 50Ah Bluetooth Lithium Trolling Motor Battery", short: "24V 50Ah Trolling",
    url: `${RD}redodo-24v-50ah-trolling-motor-battery-with-bluetooth`, sourceUrl: `${RD}redodo-24v-50ah-trolling-motor-battery-with-bluetooth`, retrieved: CHECKED,
    volts: 24, nominalV: 25.6, ampHours: 50, energyWh: 1280, continuousA: 50, cycles: 4000,
    weightLb: 21.14, warrantyYears: 5, lifeYears: null, bluetooth: true, lowTempCutoff: true, selfHeating: false,
    priceUsd: 299.99, listPriceUsd: 359.99, uses: ["trolling", "marine"],
    notes: [
      "One battery runs a 24 V trolling motor of up to 100 lb thrust, where lead-acid needs two 12 V batteries wired together.",
      "60 A for 30 minutes at full throttle, per Redodo.",
    ],
  },
  {
    id: "redodo-48v-100ah", brand: "redodo", model: "48V (51.2V) 100Ah LiFePO4 Lithium Solar Battery", short: "48V 100Ah",
    url: `${RD}redodo-51-2v-100ah-lithium-solar-battery`, sourceUrl: `${RD}redodo-51-2v-100ah-lithium-solar-battery`, retrieved: CHECKED,
    volts: 48, nominalV: 51.2, ampHours: 100, energyWh: 5120, continuousA: 100, cycles: 4000,
    weightLb: 82, warrantyYears: 5, lifeYears: null, bluetooth: true, lowTempCutoff: true, selfHeating: false,
    priceUsd: 929.99, listPriceUsd: 1699.99, uses: ["home"],
    notes: [
      "For 48 V off-grid solar and home backup systems with a 48 V inverter; up to four in parallel (20.48 kWh).",
      "Bluetooth monitoring; charging pauses below 32°F.",
    ],
  },
];

/**
 * The lead-acid battery we compare against: a widely sold 12 V 100 Ah AGM
 * deep-cycle battery, specs and price from the maker's US store.
 */
export const LEAD_ACID_REF = {
  name: "Renogy Deep Cycle AGM Battery 12V 100Ah",
  url: "https://www.renogy.com/products/deep-cycle-agm-battery-12-volt-100ah",
  retrieved: CHECKED,
  priceUsd: 208.99,
  weightLb: 63.9,
  ampHours: 100,
  /** Renogy rates 500 cycles at 50% depth of discharge and advises not going below 50%. */
  cycles: 500,
  depthOfDischarge: 0.5,
  warrantyYears: 2,
  warrantyNote: "2-year prorated",
};

/** Sources for the cold-weather and safety answers. */
export const BATTERY_FACTS = {
  coldCharging: {
    name: "Battery University BU-410: Charging at high and low temperatures",
    url: "https://batteryuniversity.com/article/bu-410-charging-at-high-and-low-temperatures",
  },
  lfpSafety: {
    name: "Battery University BU-205: Types of lithium-ion",
    url: "https://batteryuniversity.com/article/bu-205-types-of-lithium-ion",
  },
  fridge: {
    name: "Dometic CFX3 35 specifications",
    url: "https://www.dometic.com/en-ae/professional/product/dometic-cfx3-35-9600025317",
    detail: "0.98 Ah per hour at 12 V, 90°F outside, 39°F inside",
  },
};
