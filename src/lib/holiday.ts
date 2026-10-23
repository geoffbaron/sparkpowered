/**
 * Seasonal running costs: holiday lights and space heaters. Plain values and
 * functions only, so server pages and client calculators share one set of
 * numbers.
 *
 * Every typical wattage here is a starting point the visitor can override
 * with the figure printed on their own box or label.
 */

import home from "@/data/home-energy.json";
import { STATES } from "@/lib/energy";
import { ASSUMPTIONS, MMBTU_PER_MCF } from "@/lib/go-electric";

/** Heat in one kWh of electricity, in MMBtu. */
export const MMBTU_PER_KWH = 0.003412;

export interface LightPreset {
  id: string;
  label: string;
  bulbs: number;
  wattsPerBulb: number;
}

/**
 * Per-bulb wattages: incandescent mini 0.4 W, C7/C9 incandescent 5 to 7 W,
 * LED mini 0.07 W (Entergy, "Lighting the holidays: an energy cost
 * comparison"). LED C9: 2.4 W for a 25-bulb string (US DOE figure as reported
 * by The Day, New London).
 */
export const LIGHT_PRESETS: LightPreset[] = [
  { id: "led-mini", label: "LED mini lights, 100 bulbs", bulbs: 100, wattsPerBulb: 0.07 },
  { id: "inc-mini", label: "Old-style mini lights, 100 bulbs", bulbs: 100, wattsPerBulb: 0.4 },
  { id: "led-c9", label: "LED C9 big bulbs, 25 bulbs", bulbs: 25, wattsPerBulb: 0.096 },
  { id: "inc-c9", label: "Old-style C9 big bulbs, 25 bulbs", bulbs: 25, wattsPerBulb: 7 },
];

export const stringWatts = (p: LightPreset) => p.bulbs * p.wattsPerBulb;

/** Season defaults: Thanksgiving weekend to Epiphany, dusk to bedtime. */
export const SEASON_DAYS = 40;
export const HOURS_PER_NIGHT = 6;

/** Cost of running `watts` for `hours` a night over `days` at `centsPerKwh`. */
export function lightsCost(watts: number, centsPerKwh: number, hours = HOURS_PER_NIGHT, days = SEASON_DAYS) {
  const kwh = (watts * hours * days) / 1000;
  return { kwh, usd: (kwh * centsPerKwh) / 100 };
}

/** A standard plug-in space heater draws 1,500 W on high: the most a 15-amp, 120-volt outlet can run continuously. */
export const HEATER_WATTS = 1500;
export const HEATER_HOURS_PER_DAY = 8;

/** Gas price per Mcf for a state, falling back to the national figure where EIA publishes none. */
export function gasUsdPerMcf(abbr: string | null) {
  const states = home.states as Record<string, { gasUsdPerMcf: number | null }>;
  return (abbr && states[abbr]?.gasUsdPerMcf) || home.national.gasUsdPerMcf;
}

/**
 * The same heat three ways: an electric space heater (every kWh becomes a kWh
 * of heat), a gas furnace at the federal minimum efficiency, and a heat pump
 * at the federal minimum seasonal rating. Per hour of heater-equivalent heat.
 */
export function heatCostPerHour(centsPerKwh: number, gasPerMcf: number, watts = HEATER_WATTS) {
  const kwhHeat = watts / 1000;
  const rate = centsPerKwh / 100;
  const heater = kwhHeat * rate;
  const furnace = ((kwhHeat * MMBTU_PER_KWH) / ASSUMPTIONS.furnaceAfue.value / MMBTU_PER_MCF) * gasPerMcf;
  const heatPump = (kwhHeat / ASSUMPTIONS.heatPumpCop.value) * rate;
  return { heater, furnace, heatPump };
}

/** Example display used in the state tables: ten 100-bulb strings of mini lights. */
export const DISPLAY_STRINGS = 10;

const presetById = (id: string) => LIGHT_PRESETS.find((p) => p.id === id)!;

/** Season cost of the example display in every state, most expensive first. */
export function lightsByState() {
  const ledW = DISPLAY_STRINGS * stringWatts(presetById("led-mini"));
  const oldW = DISPLAY_STRINGS * stringWatts(presetById("inc-mini"));
  return STATES.map((s) => {
    const c = s.electricity.residentialCentsPerKwhYtd;
    return { s, c, led: lightsCost(ledW, c).usd, old: lightsCost(oldW, c).usd };
  }).sort((a, b) => b.c - a.c);
}

/** Space heater cost per hour in every state, with the same heat from a furnace and a heat pump. Most expensive first. */
export function heaterByState() {
  return STATES.map((s) => {
    const c = s.electricity.residentialCentsPerKwhYtd;
    return { s, c, gas: gasUsdPerMcf(s.abbr), h: heatCostPerHour(c, gasUsdPerMcf(s.abbr)) };
  }).sort((a, b) => b.h.heater - a.h.heater);
}

/** Rows to CSV text, quoting any cell with a comma or quote. */
export function toCsv(rows: (string | number)[][]) {
  const cell = (v: string | number) => {
    const t = String(v);
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return rows.map((r) => r.map(cell).join(",")).join("\n") + "\n";
}
