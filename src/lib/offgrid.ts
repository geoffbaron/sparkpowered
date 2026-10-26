/**
 * Off-grid and outage power maths: daily loads, winter solar sizing by state,
 * battery size for days without sun, outage backup and generator fuel.
 * Plain values and functions only, so server pages and client calculators
 * share one set of numbers.
 *
 * Every load figure has a source in OFFGRID_SOURCES and on the page that uses
 * it. Hours of use are the visitor's own inputs; our defaults are example
 * settings, labelled as such on the page.
 */

import type { BrandId } from "@/data/affiliates";
import { LEAD_ACID_REF } from "@/data/batteries";
import { INSTALLED_BATTERY_COST, PRODUCTS, ROOFTOP_SOLAR_COST } from "@/data/products";
import { PANEL_WATTS, SOURCES, STATES, type StateEnergy } from "@/lib/energy";
import { COOLER_WH_DAY, FRIDGE_KWH_YEAR, LOADS, USABLE_FRACTION } from "@/lib/everyday";
import { fullName } from "@/lib/products";

export { PANEL_WATTS, USABLE_FRACTION };

/** Sources cited by the off-grid pages. Each page lists the ones it uses. */
export const OFFGRID_SOURCES = {
  pvwatts: { name: SOURCES.solar.name, url: SOURCES.solar.url, detail: `monthly output per kW by state, ${SOURCES.solar.period}; ${SOURCES.solar.assumptions}` },
  pvwattsApi: { name: "PVWatts v8 API documentation (National Laboratory of the Rockies)", url: "https://developer.nlr.gov/docs/solar/pvwatts/v8/", detail: "monthly AC output; 14% system losses" },
  recsFridge: { name: "EIA Residential Energy Consumption Survey 2020, table CE4.6.EL.ST", url: "https://www.eia.gov/consumption/residential/data/2020/index.php?view=state", detail: `refrigerators: ${FRIDGE_KWH_YEAR} kWh a year per household` },
  recsAppliances: { name: "EIA Residential Energy Consumption Survey 2020, table CE5.3b (detailed electricity end use)", url: "https://www.eia.gov/consumption/residential/data/2020/c&e/xls/ce5.3b.xlsx", detail: "separate freezers 570 kWh, most-used TV 210 kWh, microwaves 107 kWh a year per household" },
  eweb: { name: "Eugene Water & Electric Board, Generator sizing considerations", url: "https://www.eweb.org/documents/emergency-preparedness/generator-sizing-considerations.pdf", detail: "running and starting watts: well pump 1/3 HP 1,000 W (+2,000 W to start), furnace fan blower 1/3 HP 700 W (+1,400), refrigerator/freezer 700 W (+2,200), microwave 1,000 W, laptop 60 W, phone charger 20 W" },
  resmed: { name: "ResMed battery guide (AirSense 10)", url: "https://document.resmed.com/documents/products/serviceandsupport/battery-guide/battery-guide_glo_eng.pdf", detail: "28 W with heated humidifier, about 11 W without" },
  doeLed: { name: "US DOE Energy Saver, Energy efficient lighting fact sheet (2021)", url: "https://www.energy.gov/sites/default/files/2021-08/ES-EE%20Lighting_080921.pdf", detail: "a 1,100-lumen LED screw-in bulb uses as little as 9 W" },
  phone: { name: "TidBITS, iPhone battery-life tables", url: "https://tidbits.com/resources/2026-09/iphone-battery-life-specs.html", detail: "iPhone 16 battery 13.84 Wh; we use 15 Wh a charge to allow for charging losses" },
  router: { name: "EnergySage, How many watts does a Wi-Fi router use?", url: "https://www.energysage.com/electricity/house-watts/how-many-watts-does-a-wi-fi-router-use/", detail: "about 10 W" },
  cooler: { name: "Dometic CFX3 35 specifications", url: "https://www.dometic.com/en-ae/professional/product/dometic-cfx3-35-9600025317", detail: "0.98 Ah an hour at 12 V on a 90°F day" },
  doeFormula: { name: "US DOE Energy Saver, Estimating appliance and home electronic energy use (archived copy)", url: "http://web.archive.org/web/20260701182252/https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use", detail: "watts × hours a day ÷ 1,000 = kWh a day" },
  doeStandAlone: { name: "US DOE Energy Saver, Grid-connected or stand-alone renewable energy systems (archived copy)", url: "http://web.archive.org/web/20260609211316/https://www.energy.gov/energysaver/grid-or-stand-alone-renewable-energy-systems", detail: "extending a power line can cost $15,000 to $50,000 per mile" },
  doeBos: { name: "US DOE Energy Saver, Balance-of-system equipment for renewable energy systems (archived copy)", url: "http://web.archive.org/web/20260501014122/https://www.energy.gov/energysaver/balance-system-equipment-required-renewable-energy-systems", detail: "balance-of-system equipment (batteries, controllers, inverters, wiring) could be half of a stand-alone system's cost; size batteries for cloudy weather, with a backup generator" },
  agm: { name: `${LEAD_ACID_REF.name} product page`, url: LEAD_ACID_REF.url, detail: "rated at 50% depth of discharge" },
  solarCost: { name: ROOFTOP_SOLAR_COST.source, url: ROOFTOP_SOLAR_COST.url, detail: `$${ROOFTOP_SOLAR_COST.perWatt.toFixed(2)} per watt installed` },
  batteryCost: { name: INSTALLED_BATTERY_COST.source, url: INSTALLED_BATTERY_COST.url, detail: `$${INSTALLED_BATTERY_COST.medianPerKwh.toLocaleString("en-US")} per kWh installed` },
  readyOutage: { name: "Ready.gov, Power outages", url: "https://www.ready.gov/power-outages", detail: "fridge keeps food cold about 4 hours, a full freezer about 48; throw out food at 40°F or higher for 2 hours; generators at least 20 ft from windows, doors and attached garages; CO detectors on every level" },
  readyGenerators: { name: "Ready.gov, Generator safety", url: "https://www.ready.gov/power-outages#generator", detail: "generators and fuel outdoors, at least 20 ft from windows, doors and attached garages; let it cool before refueling" },
  foodsafety: { name: "FoodSafety.gov, Food safety during power outages", url: "https://www.foodsafety.gov/food-safety-charts/food-safety-during-power-outage", detail: "4 hours in a closed fridge, 48 hours in a full freezer" },
  cdcCo: { name: "CDC, Prevent carbon monoxide poisoning", url: "https://www.cdc.gov/natural-disasters/psa-toolkit/prevent-carbon-monoxide-poisoning.html", detail: "at least 20 ft from the house, away from doors, windows and vents; install a battery-operated CO detector" },
  cpscCo: { name: "CPSC, Portable generators regulatory agenda statement (October 2025)", url: "https://www.reginfo.gov/public/jsp/eAgenda/StaticContent/202510/Statement_3041_CPSC.pdf", detail: "an average of 74 generator CO deaths and about 4,314 medically attended injuries a year, 2004-2021" },
  cpscStandards: { name: "CPSC, Portable generators: voluntary standards", url: "https://cpsc.gov/Regulations-Laws--Standards/Voluntary-Standards/Portable-Generators", detail: "UL 2201 and ANSI/PGMA G300 CO shutoff standards are voluntary" },
  nfpa: { name: "NFPA, Generator safety tip sheet (copy hosted by the Village of Penn Yan)", url: "https://www.villageofpennyan.gov/uploads/1/2/3/8/123892065/nfpa-generator-safety.pdf", detail: "never in an attached garage; CO alarms; cool before refueling; fuel in labeled containers outside living areas; transfer switch by a qualified electrician" },
  epaWells: { name: "US EPA, Private drinking water wells", url: "https://www.epa.gov/privatewells" },
  epaSeptic: { name: "US EPA, Septic systems", url: "https://www.epa.gov/septic" },
} as const;

export type SourceKey = keyof typeof OFFGRID_SOURCES;

/** Source list entries for a page, in the order given. */
export const sourcesFor = (keys: SourceKey[]) => keys.map((k) => ({ ...OFFGRID_SOURCES[k] }));

// ---------------------------------------------------------------------------
// Loads
// ---------------------------------------------------------------------------

export interface LoadDef {
  id: string;
  label: string;
  /** "daily": a fixed Wh a day per unit (from yearly survey data); "hourly": watts × hours the visitor sets. */
  kind: "daily" | "hourly";
  /** Wh a day per unit, for "daily" loads. */
  whPerDay?: number;
  /** Watts while running, for "hourly" loads. */
  watts?: number;
  /** Example hours a day (the visitor changes it). */
  hours?: number;
  /** Running watts for the peak-output check. */
  runW: number;
  /** Extra watts for a moment when a motor starts (0 if none). */
  startW: number;
  unit: string;
  source: SourceKey;
}

const perDay = (kwhYear: number) => (kwhYear * 1000) / 365;

/**
 * Typical loads. Yearly kWh from EIA RECS 2020 (CE4.6.EL.ST, CE5.3b); watts
 * from ResMed, US DOE, EnergySage and the EWEB generator sizing sheet.
 */
export const LOAD_DEFS: LoadDef[] = [
  { id: "fridge", label: "Refrigerator", kind: "daily", whPerDay: perDay(FRIDGE_KWH_YEAR), runW: 700, startW: 2200, unit: "fridge", source: "recsFridge" },
  // EIA RECS 2020 CE5.3b: separate freezers average 570 kWh a year.
  { id: "freezer", label: "Chest or upright freezer", kind: "daily", whPerDay: perDay(570), runW: 700, startW: 2200, unit: "freezer", source: "recsAppliances" },
  { id: "led", label: "LED light bulb (9 W)", kind: "hourly", watts: LOADS.ledW, hours: 5, runW: LOADS.ledW, startW: 0, unit: "bulb", source: "doeLed" },
  { id: "phone", label: "Phone charge (15 Wh each)", kind: "daily", whPerDay: LOADS.phoneChargeWh, runW: 20, startW: 0, unit: "charge", source: "phone" },
  { id: "router", label: "Wi-Fi router (10 W)", kind: "hourly", watts: LOADS.routerW, hours: 24, runW: LOADS.routerW, startW: 0, unit: "router", source: "router" },
  { id: "cpap", label: "CPAP with heated humidifier (28 W)", kind: "hourly", watts: LOADS.cpapW, hours: LOADS.cpapNightHours, runW: LOADS.cpapW, startW: 0, unit: "CPAP", source: "resmed" },
  { id: "laptop", label: "Laptop (60 W)", kind: "hourly", watts: 60, hours: 4, runW: 60, startW: 0, unit: "laptop", source: "eweb" },
  // EIA RECS 2020 CE5.3b: most-used TV and related equipment 210 kWh a year.
  { id: "tv", label: "TV (typical main TV)", kind: "daily", whPerDay: perDay(210), runW: 0, startW: 0, unit: "TV", source: "recsAppliances" },
  // EIA RECS 2020 CE5.3b: microwaves 107 kWh a year. EWEB: 1,000 W running.
  { id: "microwave", label: "Microwave", kind: "daily", whPerDay: perDay(107), runW: 1000, startW: 0, unit: "microwave", source: "recsAppliances" },
  // EWEB: water well pump 1/3 HP, 1,000 W running, 2,000 W more to start.
  { id: "well", label: "Well pump (1/3 HP, 1,000 W)", kind: "hourly", watts: 1000, hours: 1, runW: 1000, startW: 2000, unit: "pump", source: "eweb" },
  // EWEB: furnace fan blower 1/3 HP, 700 W running, 1,400 W more to start.
  { id: "furnace", label: "Furnace blower fan (1/3 HP, 700 W)", kind: "hourly", watts: 700, hours: 6, runW: 700, startW: 1400, unit: "blower", source: "eweb" },
  { id: "cooler", label: "12 V compressor cooler", kind: "daily", whPerDay: COOLER_WH_DAY, runW: 0, startW: 0, unit: "cooler", source: "cooler" },
];

export const loadDef = (id: string) => {
  const d = LOAD_DEFS.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown load ${id}`);
  return d;
};

/** One line of a visitor's load list. */
export interface LoadPick {
  id: string;
  count: number;
  /** Hours a day, for hourly loads. */
  hours?: number;
}

/** Wh a day for one line: DOE's watts × hours, or the survey's daily figure. */
export function lineWh(p: LoadPick) {
  const d = loadDef(p.id);
  const count = Math.max(0, p.count);
  if (d.kind === "daily") return count * (d.whPerDay ?? 0);
  const h = Math.max(0, Math.min(24, p.hours ?? d.hours ?? 0));
  return count * (d.watts ?? 0) * h;
}

export const dailyWh = (picks: LoadPick[]) => picks.reduce((t, p) => t + lineWh(p), 0);

/**
 * Peak output a power station or generator must supply if everything listed
 * runs at once: running watts of each load plus the single biggest motor start
 * (the EWEB method).
 */
export function peakWatts(picks: LoadPick[]) {
  const on = picks.filter((p) => p.count > 0);
  const running = on.reduce((t, p) => t + loadDef(p.id).runW * p.count, 0);
  const start = on.reduce((m, p) => Math.max(m, loadDef(p.id).startW), 0);
  return { running, start, peak: running + start };
}

/** The "essentials" day used across the site: fridge, Wi-Fi, 4 LED bulbs for 5 hours, 2 phone charges. */
export const ESSENTIALS: LoadPick[] = [
  { id: "fridge", count: 1 },
  { id: "router", count: 1, hours: 24 },
  { id: "led", count: 4, hours: 5 },
  { id: "phone", count: 2 },
];

/** Starting list for the outage calculator: the essentials, with the other outage loads at zero. */
export const OUTAGE_START: LoadPick[] = [
  ...ESSENTIALS,
  { id: "freezer", count: 0 },
  { id: "cpap", count: 0, hours: LOADS.cpapNightHours },
  { id: "well", count: 0, hours: 1 },
  { id: "furnace", count: 0, hours: 6 },
];

/** Starting list for the off-grid calculator: everything, essentials switched on. */
export const OFFGRID_START: LoadPick[] = LOAD_DEFS.map((d) => {
  const e = ESSENTIALS.find((x) => x.id === d.id);
  return e ?? { id: d.id, count: 0, hours: d.hours };
});

// ---------------------------------------------------------------------------
// Winter solar by state
// ---------------------------------------------------------------------------

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DECEMBER = 11;

/** kWh a day from 1 kW of panels in a given month (PVWatts monthly total ÷ days). */
export function kwhPerKwDay(s: Pick<StateEnergy, "solar">, month = DECEMBER) {
  return s.solar.monthlyKwhPerKw[month] / DAYS_IN_MONTH[month];
}

/** December: the month off-grid systems are sized for. */
export const decemberPerKwDay = (s: Pick<StateEnergy, "solar">) => kwhPerKwDay(s, DECEMBER);

/** The state's best month by daily output, for contrast. */
export function bestMonth(s: Pick<StateEnergy, "solar">) {
  let best = 0;
  for (let m = 1; m < 12; m++) if (kwhPerKwDay(s, m) > kwhPerKwDay(s, best)) best = m;
  return { month: best, name: MONTH_NAMES[best], perKwDay: kwhPerKwDay(s, best) };
}

/** Usable share of a battery bank's rated capacity. */
export const BATTERY_TYPES = {
  lithium: { label: "Lithium (LiFePO4)", usable: USABLE_FRACTION },
  agm: { label: "Lead-acid (AGM)", usable: LEAD_ACID_REF.depthOfDischarge },
} as const;
export type BatteryType = keyof typeof BATTERY_TYPES;

/** Our starting point for days with little or no sun; the visitor picks their own. */
export const DEFAULT_AUTONOMY_DAYS = 3;

export interface OffGridSize {
  whPerDay: number;
  /** Panel watts that replace a day's use in December. */
  panelW: number;
  panels: number;
  /** Rated battery size for `days` of use with no sun. */
  batteryWh: number;
}

/**
 * Panel watts = Wh a day ÷ December kWh per kW per day.
 * Battery Wh = Wh a day × days of autonomy ÷ usable fraction.
 */
export function sizeOffGrid({ whPerDay, perKwDay, days = DEFAULT_AUTONOMY_DAYS, usable = USABLE_FRACTION }: { whPerDay: number; perKwDay: number; days?: number; usable?: number }): OffGridSize {
  const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
  const panelW = perKwDay > 0 ? safe(whPerDay / perKwDay) : 0;
  return {
    whPerDay: safe(whPerDay),
    panelW,
    panels: Math.ceil(panelW / PANEL_WATTS),
    batteryWh: usable > 0 ? safe((whPerDay * Math.max(0, days)) / usable) : 0,
  };
}

/** Every state (and DC), sized for the same daily use, worst December first. */
export function offGridByState(whPerDay: number, days = DEFAULT_AUTONOMY_DAYS) {
  return STATES.map((s) => {
    const perKwDay = decemberPerKwDay(s);
    return { s, perKwDay, size: sizeOffGrid({ whPerDay, perKwDay, days }) };
  }).sort((a, b) => a.perKwDay - b.perKwDay);
}

/** Median December output across the states, for "how does my state compare". */
export function medianDecember() {
  const v = STATES.map(decemberPerKwDay).sort((a, b) => a - b);
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

/** Solar Wh a day from `panelW` of panels at `perKwDay`. */
export const solarWhPerDay = (panelW: number, perKwDay: number) => Math.max(0, panelW) * Math.max(0, perKwDay);

/**
 * A rough installed price using national averages for grid-tied systems:
 * EnergySage's $/W for rooftop solar and $/kWh for installed batteries.
 */
export function installedEstimate(panelW: number, batteryWh: number) {
  const solar = panelW * ROOFTOP_SOLAR_COST.perWatt;
  const battery = (batteryWh / 1000) * INSTALLED_BATTERY_COST.medianPerKwh;
  return { solar, battery, total: solar + battery };
}

/** US DOE Energy Saver: extending a power line can cost $15,000 to $50,000 per mile. */
export const LINE_EXTENSION = { lowPerMile: 15_000, highPerMile: 50_000 };

export function lineExtensionCost(miles: number) {
  const m = Math.max(0, miles);
  return { low: m * LINE_EXTENSION.lowPerMile, high: m * LINE_EXTENSION.highPerMile };
}

// ---------------------------------------------------------------------------
// Cabin tiers
// ---------------------------------------------------------------------------

export interface CabinTier {
  id: "weekend" | "parttime" | "fulltime";
  label: string;
  blurb: string;
  picks: LoadPick[];
}

/** Example cabin load lists. The calculator lets the visitor build their own. */
export const CABIN_TIERS: CabinTier[] = [
  {
    id: "weekend",
    label: "Weekend cabin",
    blurb: "Lights, phones and a 12 V compressor cooler instead of a fridge",
    picks: [
      { id: "led", count: 4, hours: 5 },
      { id: "phone", count: 2 },
      { id: "cooler", count: 1 },
    ],
  },
  {
    id: "parttime",
    label: "Part-time cabin",
    blurb: "A full-size fridge, Wi-Fi, lights, a laptop and a TV",
    picks: [
      { id: "fridge", count: 1 },
      { id: "router", count: 1, hours: 24 },
      { id: "led", count: 6, hours: 5 },
      { id: "phone", count: 2 },
      { id: "laptop", count: 1, hours: 4 },
      { id: "tv", count: 1 },
    ],
  },
  {
    id: "fulltime",
    label: "Full-time home",
    blurb: "Fridge, freezer, well pump, furnace blower, microwave and the rest",
    picks: [
      { id: "fridge", count: 1 },
      { id: "freezer", count: 1 },
      { id: "router", count: 1, hours: 24 },
      { id: "led", count: 8, hours: 5 },
      { id: "phone", count: 4 },
      { id: "laptop", count: 1, hours: 4 },
      { id: "tv", count: 1 },
      { id: "microwave", count: 1 },
      { id: "well", count: 1, hours: 1 },
      { id: "furnace", count: 1, hours: 6 },
    ],
  },
];

export const cabinTier = (id: CabinTier["id"]) => CABIN_TIERS.find((t) => t.id === id)!;

// ---------------------------------------------------------------------------
// Matching power stations
// ---------------------------------------------------------------------------

/** What a client calculator needs to know about a power station. */
export interface StationOption {
  id: string;
  name: string;
  brand: BrandId;
  capacityWh: number;
  addOnWh: number | null;
  addOnMax: number;
  addOnUsd: number | null;
  priceUsd: number;
  solarInputW: number | null;
  acOutputW: number;
  surgeW: number | null;
  url: string;
}

/** Every do-it-yourself power station or battery with a listed price, as calculator options. */
export function stationOptions(): StationOption[] {
  return PRODUCTS.filter((p) => p.install === "diy" && p.priceUsd != null).map((p) => ({
    id: p.id,
    name: fullName(p),
    brand: p.brand,
    capacityWh: p.capacityWh,
    addOnWh: p.addOn?.capacityWh ?? null,
    addOnMax: p.addOn?.maxUnits ?? 0,
    addOnUsd: p.addOn?.priceUsd ?? null,
    priceUsd: p.priceUsd!,
    solarInputW: p.solarInputW,
    acOutputW: p.acOutputW,
    surgeW: p.surgeW,
    url: p.url,
  }));
}

export interface StationMatch {
  option: StationOption;
  addOns: number;
  totalWh: number;
  totalUsd: number;
}

/**
 * Cheapest stations (one per brand) that reach `needWh` with their own add-on
 * batteries and, if `panelW` is given, take at least that much solar input and,
 * if `peakW` is given, have continuous output to cover it.
 */
export function matchStations(options: StationOption[], needWh: number, { panelW = 0, runningW = 0, limit = 3 }: { panelW?: number; runningW?: number; limit?: number } = {}) {
  const out: StationMatch[] = [];
  for (const o of options) {
    if (panelW > 0 && (o.solarInputW == null || o.solarInputW < panelW)) continue;
    if (runningW > 0 && o.acOutputW < runningW) continue;
    let addOns = 0;
    if (o.capacityWh < needWh && o.addOnWh) addOns = Math.ceil((needWh - o.capacityWh) / o.addOnWh);
    if (addOns > o.addOnMax) continue;
    const totalWh = o.capacityWh + addOns * (o.addOnWh ?? 0);
    if (totalWh < needWh) continue;
    if (addOns > 0 && o.addOnUsd == null) continue;
    out.push({ option: o, addOns, totalWh, totalUsd: o.priceUsd + addOns * (o.addOnUsd ?? 0) });
  }
  out.sort((a, b) => a.totalUsd - b.totalUsd || a.totalWh - b.totalWh);
  const seen = new Set<string>();
  return out.filter((m) => (seen.has(m.option.brand) ? false : (seen.add(m.option.brand), true))).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Outage backup
// ---------------------------------------------------------------------------

/** Rated power station size to cover `days` of `whPerDay` with no recharging. */
export const outageBatteryWh = (whPerDay: number, days: number) => (Math.max(0, whPerDay) * Math.max(0, days)) / USABLE_FRACTION;

/** Panel sizes offered for winter recharging, in watts. */
export const RECHARGE_PANELS_W = [200, 400, 800];

// ---------------------------------------------------------------------------
// Generator fuel
// ---------------------------------------------------------------------------

export const FUELS = {
  gasoline: { label: "Gasoline", unit: "gallons", unitShort: "gal" },
  propane: { label: "Propane", unit: "pounds", unitShort: "lb" },
  diesel: { label: "Diesel", unit: "gallons", unitShort: "gal" },
} as const;
export type Fuel = keyof typeof FUELS;

/** Your load as a share of the generator's rated running watts, to pick the right spec-sheet runtime row. */
export const loadPercent = (loadW: number, ratedW: number) => (ratedW > 0 ? (Math.max(0, loadW) / ratedW) * 100 : 0);

/**
 * Fuel to store, from the generator's own spec sheet: fuel per hour = tank ÷
 * the maker's rated runtime per tank at your load. We do not assume a fuel
 * rate; it varies too much by model.
 */
export function generatorPlan({ tankSize, runtimeHours, hoursPerDay, days }: { tankSize: number; runtimeHours: number; hoursPerDay: number; days: number }) {
  const ok = tankSize > 0 && runtimeHours > 0;
  const perHour = ok ? tankSize / runtimeHours : 0;
  const hours = Math.max(0, Math.min(24, hoursPerDay)) * Math.max(0, days);
  const fuel = perHour * hours;
  return {
    perHour,
    hours,
    fuel,
    perDay: perHour * Math.max(0, Math.min(24, hoursPerDay)),
    tanks: ok ? Math.ceil(fuel / tankSize - 1e-9) : 0,
  };
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export const fmtWh = (wh: number) => (wh >= 10_000 ? `${(wh / 1000).toFixed(0)} kWh` : wh >= 1000 ? `${(wh / 1000).toFixed(1)} kWh` : `${Math.round(wh).toLocaleString("en-US")} Wh`);
export const fmtW = (w: number) => (w >= 10_000 ? `${(w / 1000).toFixed(1)} kW` : `${(Math.round(w / 10) * 10).toLocaleString("en-US")} W`);
export const fmtKwh = (wh: number) => `${(wh / 1000).toFixed(wh >= 10_000 ? 0 : 1)} kWh`;

// ---------------------------------------------------------------------------
// Calculator props
// ---------------------------------------------------------------------------

/** Per-state solar figures the client calculators need, alphabetical. */
export function offGridStates() {
  return STATES.map((s) => ({ abbr: s.abbr, name: s.name, slug: s.slug, city: s.solar.city, dec: decemberPerKwDay(s) })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/** The state whose December output is closest to the median: the calculators' starting example. */
export function typicalWinterState() {
  const m = medianDecember();
  return [...STATES].sort((a, b) => Math.abs(decemberPerKwDay(a) - m) - Math.abs(decemberPerKwDay(b) - m))[0];
}

/** The off-grid and emergency prep pages, for each page's "Keep going" links (a page drops itself). */
export const OFFGRID_LINKS = [
  { href: "/off-grid-solar-calculator", label: "Off-grid solar calculator", desc: "Panels and battery for your state's darkest month" },
  { href: "/off-grid-cabin-solar-kit", label: "Cabin solar kit size", desc: "Weekend, part-time or full-time, by state" },
  { href: "/how-to-go-off-grid", label: "How to go off grid", desc: "Power line cost vs solar and battery, step by step" },
  { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "Fridge, CPAP, well pump and furnace through an outage" },
  { href: "/generator-runtime-calculator", label: "Generator runtime and fuel", desc: "How much fuel to store, and how to run it safely" },
  { href: "/emergency-water-storage-calculator", label: "Emergency water storage", desc: "Gallons to store for your household" },
  { href: "/how-to-purify-water", label: "How to purify water", desc: "Bleach drops, boiling and filters" },
  { href: "/best-emergency-water-filters", label: "Emergency water filters", desc: "Filters and purifiers by certification" },
  { href: "/emergency-kit-checklist", label: "Emergency kit checklist", desc: "What a 72-hour and 2-week kit needs" },
  { href: "/emergency-food-calculator", label: "Emergency food calculator", desc: "Calories to store, not servings" },
  { href: "/noaa-weather-radio", label: "NOAA weather radio", desc: "Find your station and county code" },
];

export const relatedFor = (path: string) => OFFGRID_LINKS.filter((l) => l.href !== path);

export const CAMPER_VOLTS_URL = "https://campervolts.com";
