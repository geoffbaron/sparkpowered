/**
 * "What can it run?" tables for single power stations
 * (/power-stations/<id>/what-it-runs).
 *
 * No new maths: run time is the site's one formula, usable watt-hours
 * (rated capacity x USABLE_FRACTION, src/lib/everyday.ts) divided by the
 * load's watts (DOE: watts x hours = watt-hours, src/lib/offgrid.ts). Loads
 * come from LOAD_DEFS in src/lib/offgrid.ts; the few extra appliances below
 * are rows read from the same EWEB generator sizing sheet the outage
 * calculator already cites. The start-up check is the outage calculator's
 * rule (running watts plus the motor's extra starting watts must fit under
 * the station's surge rating), except that a surge the maker says is for
 * heating-type loads only is not counted for motors.
 */

import type { Product } from "@/data/products";
import { CPAP_NO_HUMIDIFIER_W, LOADS, USABLE_FRACTION, duration } from "@/lib/everyday";
import { HEATER_WATTS } from "@/lib/holiday";
import { OFFGRID_SOURCES, loadDef, type SourceKey } from "@/lib/offgrid";
import { productById } from "@/lib/products";

/** Date the appliance figures and the model list below were checked. */
export const CAN_IT_RUN_CHECKED = "2026-11-11";

/**
 * Models with a page, chosen on 2026-11-11: in stock on the maker's US site,
 * a tracked affiliate brand, and Google search suggestions asking what the
 * model runs or for how long (queries listed in
 * docs/fact-check-2026-11-11-intent.md). The Bluetti Elite 100 V2 has search
 * demand too but the same 1,024 Wh and a table identical to the C1000 Gen 2's,
 * so it is covered on that page instead of getting a near-copy of its own.
 */
export const CAN_IT_RUN_IDS = [
  "anker-solix-c1000-gen-2",
  "bluetti-ac180",
  "bluetti-elite-200-v2",
  "anker-solix-c2000-gen-2",
  "bluetti-elite-300",
] as const;

export const whatItRunsPath = (id: string) => `/power-stations/${id}/what-it-runs`;

export type RunUnit = "hours" | "nights" | "charges" | "minutes";

export interface Appliance {
  id: string;
  label: string;
  /** Watts used for run time: the all-day average for fridge-type loads, the running watts otherwise. */
  avgW: number;
  /** Running watts for the output check. */
  runW: number;
  /** Extra watts for a moment when a motor starts (0 if none). */
  startW: number;
  unit: RunUnit;
  /** How the figure is meant, shown under the table row. */
  basis: string;
  source: SourceKey;
}

const fromLoad = (id: string, label: string, unit: RunUnit, basis: string): Appliance => {
  const d = loadDef(id);
  const avgW = d.kind === "daily" ? (d.whPerDay ?? 0) / 24 : (d.watts ?? 0);
  return { id, label, avgW, runW: d.runW, startW: d.startW, unit, basis, source: d.source };
};

const ewebRow = (id: string, label: string, runW: number, startW: number, unit: RunUnit, basis: string): Appliance => ({
  id, label, avgW: runW, runW, startW, unit, basis, source: "eweb",
});

/** The 15 appliances every page lists, in this order. */
export const APPLIANCES: Appliance[] = [
  fromLoad("fridge", "Kitchen refrigerator", "hours", "Typical US fridge (839 kWh a year, EIA), compressor cycling on and off"),
  fromLoad("freezer", "Chest or upright freezer", "hours", "Typical separate freezer (570 kWh a year, EIA), cycling"),
  fromLoad("cpap", `CPAP with heated humidifier (${LOADS.cpapW} W)`, "nights", `${LOADS.cpapNightHours}-hour nights`),
  { ...fromLoad("cpap", `CPAP with humidifier off (${CPAP_NO_HUMIDIFIER_W} W)`, "nights", `${LOADS.cpapNightHours}-hour nights`), id: "cpap-dry", avgW: CPAP_NO_HUMIDIFIER_W, runW: CPAP_NO_HUMIDIFIER_W },
  fromLoad("router", `Wi-Fi router (${LOADS.routerW} W)`, "hours", "Running nonstop"),
  { ...fromLoad("led", "Four LED bulbs (9 W each)", "hours", "All four on together"), avgW: 4 * LOADS.ledW, runW: 4 * LOADS.ledW },
  fromLoad("laptop", "Laptop (60 W)", "hours", "Plugged in and working"),
  fromLoad("tv", "Main TV", "hours", "Typical main TV and its boxes (210 kWh a year, EIA), averaged over the day"),
  fromLoad("phone", "Phone charges", "charges", `${LOADS.phoneChargeWh} Wh per full charge`),
  { ...fromLoad("microwave", "Microwave (1,000 W)", "minutes", "Minutes of cooking at full power"), avgW: 1000 },
  // EWEB: "Space Heater 1,500"; the same 1,500 W the space heater cost calculator uses.
  ewebRow("heater", `Space heater on high (${HEATER_WATTS.toLocaleString("en-US")} W)`, HEATER_WATTS, 0, "hours", "On high the whole time; a thermostat cycling it stretches this"),
  // EWEB: "Sump Pump - 1/3 HP 800 1,300".
  ewebRow("sump", "1/3 HP sump pump (800 W)", 800, 1300, "hours", "Hours of actual pumping; a sump pump only runs when the pit fills"),
  fromLoad("well", "1/3 HP well pump (1,000 W)", "hours", "Hours of actual pumping; a 120 V pump"),
  fromLoad("furnace", "1/3 HP furnace blower fan (700 W)", "hours", "Hours of blower running; a wired-in furnace needs a transfer switch (NFPA)"),
  // EWEB: "Window AC - 12,000 BTU 3,250 3,950".
  ewebRow("window-ac", "12,000 BTU window AC (3,250 W)", 3250, 3950, "hours", "EWEB's generator-sizing figure; a smaller unit draws less, see its label"),
];

/** EWEB: "Electric Water Heater 4,500". Too big for any station with a page; named in the "cannot run" list. */
export const WATER_HEATER_W = 4500;

export const usableWh = (p: Pick<Product, "capacityWh">, wh = p.capacityWh) => wh * USABLE_FRACTION;

/** Run time in the appliance's unit, from `wh` of rated capacity (the base battery unless an add-on total is given). */
export function runFor(p: Product, a: Appliance, wh = p.capacityWh) {
  const hours = usableWh(p, wh) / a.avgW;
  if (a.unit === "nights") return hours / LOADS.cpapNightHours;
  if (a.unit === "charges") return usableWh(p, wh) / LOADS.phoneChargeWh;
  if (a.unit === "minutes") return hours * 60;
  return hours;
}

/** True when the maker says the surge figure applies to heating-type loads only (Bluetti's Power Lifting). */
export const surgeIsHeatingOnly = (p: Product) => p.notes.some((n) => /heating-type loads/i.test(n));

/** Surge available to start a motor: the stated surge, or just the continuous rating when there is none for motors. */
export const motorSurgeW = (p: Product) => (surgeIsHeatingOnly(p) ? p.acOutputW : (p.surgeW ?? p.acOutputW));

export type Fit = "runs" | "start-unconfirmed" | "too-big";

export function fitFor(p: Product, a: Appliance): Fit {
  if (a.runW > p.acOutputW) return "too-big";
  if (a.startW > 0 && a.runW + a.startW > motorSurgeW(p)) return "start-unconfirmed";
  return "runs";
}

/** "about 9 hours", "4 nights", "65 charges", "about 52 minutes". */
export function runText(p: Product, a: Appliance, wh = p.capacityWh) {
  const v = runFor(p, a, wh);
  if (a.unit === "nights") {
    const n = Math.floor(v * 2) / 2;
    return n >= 1 ? `${n.toLocaleString("en-US")} night${n === 1 ? "" : "s"}` : `${Math.round(v * LOADS.cpapNightHours)} hours`;
  }
  if (a.unit === "charges") return `about ${Math.floor(v / 5) * 5} charges`;
  if (a.unit === "minutes") return `about ${Math.round(v / 5) * 5} minutes`;
  return hoursText(v);
}

/** Like duration() in everyday.ts, with minutes and half hours below 3 hours so short loads read correctly. */
export function hoursText(h: number) {
  if (h < 1) return `about ${Math.max(5, Math.round((h * 60) / 5) * 5)} minutes`;
  if (h < 3) {
    const half = Math.round(h * 2) / 2;
    return `about ${half.toLocaleString("en-US")} hour${half === 1 ? "" : "s"}`;
  }
  return duration(h);
}

export interface RunRow {
  a: Appliance;
  fit: Fit;
  text: string;
  value: number;
}

export function runTable(p: Product): RunRow[] {
  return APPLIANCES.map((a) => ({ a, fit: fitFor(p, a), text: runText(p, a), value: runFor(p, a) }));
}

export const appliance = (id: string) => {
  const a = APPLIANCES.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown appliance ${id}`);
  return a;
};

/** Sources every page cites for the appliance watts. */
export const APPLIANCE_SOURCES = [...new Set(APPLIANCES.map((a) => a.source).concat(["doeFormula"]))].map((k) => OFFGRID_SOURCES[k] as { name: string; url: string; detail?: string });

export const canItRunProducts = () => CAN_IT_RUN_IDS.map((id) => productById(id));
