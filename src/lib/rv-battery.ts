/**
 * Sizing and lifetime-cost maths for the lithium RV / van / boat battery page.
 * Pure functions so tests can check them and the picker can run them in the
 * browser.
 */

import { BATTERIES, LEAD_ACID_REF, type DeepCycleBattery } from "@/data/batteries";
import { LOADS } from "@/lib/everyday";

export interface RvLoad {
  id: string;
  label: string;
  /** Watt-hours a day, from the battery. */
  whDay: number;
  /** How we got the number. */
  basis: string;
  defaultOn?: boolean;
}

/** Inverter loss for things that plug into a 120 V outlet. */
const INVERTER = 1.1;

/**
 * Everyday 12 V loads. Figures with a maker or agency source say so; the rest
 * are our stated estimates from typical wattage x hours.
 */
export const RV_LOADS: RvLoad[] = [
  { id: "fridge", label: "12 V compressor fridge", whDay: Math.round(0.98 * 12 * 24), basis: "Dometic CFX3 35: 0.98 Ah an hour on a 90°F day", defaultOn: true },
  { id: "lights", label: "LED lights, evening", whDay: 4 * LOADS.ledW * 5, basis: "4 LED bulbs at 9 W for 5 hours (US DOE)", defaultOn: true },
  { id: "phones", label: "Phones and a tablet", whDay: 3 * LOADS.phoneChargeWh, basis: "3 full charges at 15 Wh", defaultOn: true },
  { id: "pump", label: "Water pump", whDay: 30, basis: "about 60 W for 30 minutes (our estimate)", defaultOn: true },
  { id: "fan", label: "Roof vent fan overnight", whDay: 8 * 20, basis: "about 20 W for 8 hours (our estimate)" },
  { id: "furnace", label: "Furnace blower on cold nights", whDay: 8 * 40, basis: "about 40 W of blower for 8 hours of run time (our estimate)" },
  { id: "cpap", label: "CPAP machine", whDay: Math.round(LOADS.cpapW * LOADS.cpapNightHours * INVERTER), basis: "28 W for 8 hours with humidifier (ResMed), plus inverter loss" },
  { id: "laptop", label: "Laptop for work", whDay: Math.round(50 * 6 * INVERTER), basis: "about 50 W for 6 hours (our estimate), plus inverter loss" },
  { id: "tv", label: "TV and streaming box", whDay: Math.round(60 * 3 * INVERTER), basis: "about 60 W for 3 hours (our estimate)" },
  { id: "coffee", label: "Coffee maker each morning", whDay: Math.round(1000 * (10 / 60) * INVERTER), basis: "1,000 W for 10 minutes through an inverter" },
  { id: "microwave", label: "Microwave, 10 minutes a day", whDay: Math.round(1500 * (10 / 60) * INVERTER), basis: "draws about 1,500 W from the battery for 10 minutes (our estimate)" },
];

/** Keep a little in reserve rather than run the battery flat every night. */
export const RESERVE = 0.9;

export interface Recommendation {
  battery: DeepCycleBattery;
  count: number;
  totalWh: number;
  totalUsd: number;
  totalLb: number;
  /** Lead-acid batteries (at 50% depth of discharge) needed for the same usable energy. */
  leadAcidCount: number;
  leadAcidLb: number;
}

/** 12 V batteries the picker chooses from, smallest first (one per size). */
export const PICKER_BATTERIES = ["redodo-12v-100ah", "redodo-12v-200ah-plus", "redodo-12v-300ah"].map(
  (id) => BATTERIES.find((b) => b.id === id)!,
);

/** Most identical 12 V batteries Redodo allows in parallel. */
export const MAX_PARALLEL = 4;

export function leadAcidUsableWh() {
  return 12 * LEAD_ACID_REF.ampHours * LEAD_ACID_REF.depthOfDischarge;
}

/** Smallest Redodo 12 V setup that covers `whDay` for `days` without solar. */
export function recommend(whDay: number, days: number): Recommendation {
  const need = (whDay * days) / RESERVE;
  let battery = PICKER_BATTERIES.find((b) => b.energyWh >= need);
  let count = 1;
  if (!battery) {
    battery = PICKER_BATTERIES[PICKER_BATTERIES.length - 1];
    count = Math.min(MAX_PARALLEL, Math.ceil(need / battery.energyWh));
  }
  const totalWh = battery.energyWh * count;
  const leadAcidCount = Math.max(1, Math.ceil(totalWh / leadAcidUsableWh()));
  return {
    battery,
    count,
    totalWh,
    totalUsd: Math.round(battery.priceUsd * count * 100) / 100,
    totalLb: Math.round(battery.weightLb * count),
    leadAcidCount,
    leadAcidLb: Math.round(leadAcidCount * LEAD_ACID_REF.weightLb),
  };
}

/** Days a setup lasts on `whDay`, keeping the reserve. */
export const daysOn = (totalWh: number, whDay: number) => (whDay > 0 ? (totalWh * RESERVE) / whDay : Infinity);

export interface LifetimeCost {
  nightsPerYear: number;
  leadAcid: { units: number; usd: number; years: number; perYear: number };
  lithium: { usd: number; years: number; perYear: number };
}

/**
 * Cost per year for about the same usable energy as one 12V 100Ah lithium battery,
 * assuming one full use (cycle) per night away. Lead-acid life here counts
 * cycles only, which flatters it: real AGM batteries also wear out with age.
 */
export function lifetimeCost(nightsPerYear: number): LifetimeCost {
  const li = BATTERIES.find((b) => b.id === "redodo-12v-100ah")!;
  // Two 100 Ah AGMs at half depth (1,200 Wh) is the usual like-for-like swap for one 1,280 Wh lithium.
  const units = Math.round(li.energyWh / leadAcidUsableWh());
  const laYears = LEAD_ACID_REF.cycles / nightsPerYear;
  const liYears = Math.min(li.lifeYears ?? 10, li.cycles / nightsPerYear);
  const laUsd = units * LEAD_ACID_REF.priceUsd;
  return {
    nightsPerYear,
    leadAcid: { units, usd: laUsd, years: laYears, perYear: laUsd / Math.min(laYears, li.lifeYears ?? 10) },
    lithium: { usd: li.priceUsd, years: liYears, perYear: li.priceUsd / liYears },
  };
}

/** Lifetime energy each battery delivers before it is worn out, kWh. */
export function lifetimeKwh() {
  const li = BATTERIES.find((b) => b.id === "redodo-12v-100ah")!;
  return {
    lithium: (li.energyWh * li.cycles) / 1000,
    leadAcid: (leadAcidUsableWh() * LEAD_ACID_REF.cycles) / 1000,
  };
}
