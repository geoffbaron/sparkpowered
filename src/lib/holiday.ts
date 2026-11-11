/**
 * Seasonal running costs: holiday lights and space heaters. Plain values and
 * functions only, so server pages and client calculators share one set of
 * numbers.
 *
 * Every typical wattage here is a starting point the visitor can override
 * with the figure printed on their own box or label.
 */

import home from "@/data/home-energy.json";
import { NATIONAL, STATES, type StateEnergy, ytdWindow } from "@/lib/energy";
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
 * by The Day, New London). Checked against current product labels on
 * 2026-11-11: Christmas Lite Co 25-bulb LED C9 set, 2.4 W (1000Bulbs.com);
 * PartyLights LED C9 25-light set, "2.4W per string"; Super Bright LEDs
 * 17 ft 25-bulb LED C9 string, 2.1 W. Screw-in LED C9
 * replacement bulbs draw more; see LED_C9_REPLACEMENT_W.
 */
export const LIGHT_PRESETS: LightPreset[] = [
  { id: "led-mini", label: "LED mini lights, 100 bulbs", bulbs: 100, wattsPerBulb: 0.07 },
  { id: "inc-mini", label: "Old-style mini lights, 100 bulbs", bulbs: 100, wattsPerBulb: 0.4 },
  { id: "led-c9", label: "LED C9 big bulbs, 25 bulbs", bulbs: 25, wattsPerBulb: 0.096 },
  { id: "inc-c9", label: "Old-style C9 big bulbs, 25 bulbs", bulbs: 25, wattsPerBulb: 7 },
];

export const stringWatts = (p: LightPreset) => p.bulbs * p.wattsPerBulb;

/**
 * Screw-in LED C9 replacement bulbs (for an old C9 cord) are brighter and draw
 * more than a sealed LED C9 set: 0.75 W a bulb on the label of Christmas.com's
 * 25-pack of warm white C9 E17 LED bulbs, checked 2026-11-11.
 */
/** Date the LED C9 product labels below were read. */
export const LED_C9_CHECKED = "2026-11-11";
export const LED_C9_REPLACEMENT_W = 0.75;
export const LED_C9_REPLACEMENT_SOURCE = {
  name: "Christmas.com, 25-pack C9 LED replacement bulbs, warm white (0.75 W a bulb on the label)",
  url: "https://christmas.com/25-pack-c9-led-outdoor-christmas-replacement-bulbs-warm-white-c9-e17-base",
};

/** Current LED C9 set labels behind the 2.4 W string figure. */
export const LED_C9_LABEL_SOURCES = [
  { name: "Christmas Lite Co 25-bulb LED C9 set, 2.4 W (1000Bulbs.com listing)", url: "https://1000bulbs.com/product/200216/CMS-25C9-8GWWDLX.html" },
  { name: "PartyLights LED C9 25-light set, 2.4 W per string", url: "https://partylights.com/led-c9-25-lightset-warmwhite" },
];

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

/** Watts of the example display: LED and old-style mini lights. */
export const displayWatts = () => ({
  led: DISPLAY_STRINGS * stringWatts(presetById("led-mini")),
  old: DISPLAY_STRINGS * stringWatts(presetById("inc-mini")),
});

/**
 * Percent change in the average residential price, this year to date against
 * the same months last year. The display's running cost changes by the same
 * percent, since watts and hours are fixed.
 */
export function priceChangePct(current: number, previous: number) {
  return (current / previous - 1) * 100;
}

export const stateChangePct = (s: StateEnergy) =>
  priceChangePct(s.electricity.residentialCentsPerKwhYtd, s.electricity.residentialCentsPerKwhYtdPrevYear);

/** Whole-percent change with a sign: "+15%", "-9%", "0%". */
export function formatChangePct(pct: number) {
  const r = Math.round(pct);
  return r === 0 ? "0%" : `${r > 0 ? "+" : "-"}${Math.abs(r)}%`;
}

/** "January to August 2026": the EIA year-to-date window in words. */
export const ytdWindowWords = () => ytdWindow().replace("–", " to ");

/** Season cost of the example display in every state, most expensive first. */
export function lightsByState() {
  const w = displayWatts();
  return STATES.map((s) => {
    const c = s.electricity.residentialCentsPerKwhYtd;
    return { s, c, led: lightsCost(w.led, c).usd, old: lightsCost(w.old, c).usd, pct: stateChangePct(s) };
  }).sort((a, b) => b.c - a.c);
}

/**
 * The dated headline numbers for the Christmas lights page, all computed from
 * the state data so they follow every price refresh.
 */
export function lightsKeyFindings() {
  const rows = lightsByState();
  const w = displayWatts();
  const us = NATIONAL.residentialCentsPerKwhYtd;
  const priciest = rows[0];
  const cheapest = rows[rows.length - 1];
  const byChange = [...rows].sort((a, b) => b.pct - a.pct);
  const biggestRises = byChange.filter((r) => Math.round(r.pct) > 0).slice(0, 3);
  const last = byChange[byChange.length - 1];
  const largestDrop = Math.round(last.pct) < 0 ? last : null;
  const c9Old = lightsCost(stringWatts(presetById("inc-c9")), us).usd;
  return {
    usCents: us,
    usLed: lightsCost(w.led, us).usd,
    usOld: lightsCost(w.old, us).usd,
    usChangePct: priceChangePct(us, NATIONAL.residentialCentsPerKwhYtdPrevYear),
    priciest,
    cheapest,
    /** An LED display in the priciest state costs less than old-style bulbs in the cheapest. */
    bulbBeatsState: priciest.led < cheapest.old,
    biggestRises,
    largestDrop,
    c9OldString: c9Old,
  };
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
