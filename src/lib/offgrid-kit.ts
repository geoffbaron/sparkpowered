/**
 * The 90-day off-grid kit: one household package (power, generator fuel,
 * water and food) by home size, state and the loads that matter.
 *
 * Every figure comes from the site's existing maths, never a second formula:
 *   - loads, December solar sizing, station matching: src/lib/offgrid.ts
 *   - motor starts and 240 V well pumps: loadFit / pumpFit in offgrid.ts
 *   - generator fuel: generatorPlan in offgrid.ts, from a maker's spec sheet
 *   - water and food: waterNeeded and foodNeeded in src/lib/prep.ts
 * Prices are the dated store prices in src/data/products.ts.
 */

import { AFFILIATES } from "@/data/affiliates";
import { OFFGRID_SYSTEMS, PRODUCTS, SOLAR_PANELS, type OffGridSystem, type SolarPanel } from "@/data/products";
import { motorSurgeW } from "@/lib/can-it-run";
import { LOADS } from "@/lib/everyday";
import {
  dailyWh,
  generatorPlan,
  loadDef,
  loadFit,
  matchStations,
  peakWatts,
  pumpFit,
  pumpLoad,
  pumpMotor,
  sizeOffGrid,
  solarWhPerDay,
  stationOptions,
  type LoadPick,
  type OffGridSize,
  type StationMatch,
  type StationOption,
} from "@/lib/offgrid";
import { GOAL_DAYS, foodNeeded, waterNeeded, type FoodPerson } from "@/lib/prep";
import { bleachFor, cookingPlan, gardenFor, staplesFor } from "@/lib/survival-kit";

/** The package covers this many days. */
export const KIT_DAYS = 90;

/**
 * Days of battery with no sun. Shorter than the off-grid calculator's 3 because
 * the package carries a generator for longer dark stretches; past these 2 days
 * the generator recharges the battery.
 */
export const KIT_BATTERY_DAYS = 2;

/** Our example for storms longer than the battery: days the generator carries the whole load. The reader changes it. */
export const DARK_DAY_CHOICES = [0, 7, 14] as const;
export const DEFAULT_DARK_DAYS = 7;

/**
 * Example generator for the fuel line, from Honda's EU2200i spec page (read Nov 17 2026):
 * 1,800 W rated, 0.95 gal tank, 3.2 hours a tank at rated load. We use the rated-load
 * row because charging a big battery keeps a small generator near full load.
 * The reader can put in their own generator's figures.
 */
export const EXAMPLE_GENERATOR = {
  name: "Honda EU2200i",
  ratedW: 1800,
  tankGal: 0.95,
  runtimeHours: 3.2,
  url: "https://powerequipment.honda.com/generators/models/eu2200i",
  read: "2026-11-17",
};

export type HomeSize = "small" | "medium" | "large";
export type KitLoad = "lights" | "internet" | "fridge" | "freezer" | "well" | "cpap" | "heat";

export interface HomePreset {
  id: HomeSize;
  label: string;
  blurb: string;
  /** Household for food and water. */
  people: FoodPerson[];
  leds: number;
  phones: number;
  loads: KitLoad[];
  /** Large homes are more often on a well; default to treating the pump as 240 V. */
  well240: boolean;
}

const adult = (sex: FoodPerson["sex"]): FoodPerson => ({ age: 40, sex });
const child = (age: number, sex: FoodPerson["sex"]): FoodPerson => ({ age, sex });

export const HOME_PRESETS: HomePreset[] = [
  {
    id: "small",
    label: "Small home",
    blurb: "1 to 2 people, about 1,000 sq ft or a cabin",
    people: [adult("male"), adult("female")],
    leds: 4,
    phones: 2,
    loads: ["lights", "internet", "fridge"],
    well240: false,
  },
  {
    id: "medium",
    label: "Medium home",
    blurb: "A family of 4, about 2,000 sq ft",
    people: [adult("male"), adult("female"), child(12, "male"), child(8, "female")],
    leds: 6,
    phones: 4,
    loads: ["lights", "internet", "fridge", "freezer", "heat"],
    well240: false,
  },
  {
    id: "large",
    label: "Large home",
    blurb: "5 or more people, about 3,000 sq ft, often on a well",
    people: [adult("male"), adult("female"), child(15, "male"), child(11, "female"), child(6, "male")],
    leds: 8,
    phones: 5,
    loads: ["lights", "internet", "fridge", "freezer", "well", "heat"],
    well240: true,
  },
];

export const homePreset = (id: HomeSize) => HOME_PRESETS.find((h) => h.id === id)!;

export const KIT_LOADS: { id: KitLoad; label: string; hint: string }[] = [
  { id: "lights", label: "Lights and phones", hint: "LED bulbs 5 hours a night, a phone charge each a day" },
  { id: "internet", label: "Internet", hint: "Wi-Fi router, on all day" },
  { id: "fridge", label: "Fridge", hint: "An average kitchen fridge" },
  { id: "freezer", label: "Chest freezer", hint: "A separate freezer" },
  { id: "well", label: "Well pump", hint: "1 hour of pumping a day" },
  { id: "cpap", label: "CPAP or medical", hint: "CPAP with heated humidifier, every night" },
  { id: "heat", label: "Furnace blower or pellet stove", hint: "Furnace fan 6 hours a day; a pellet stove uses less" },
];

/** The load list for a home and its switched-on loads, using the shared load definitions. */
export function kitPicks(home: HomePreset, loads: KitLoad[]): LoadPick[] {
  const on = new Set(loads);
  const picks: LoadPick[] = [];
  if (on.has("lights")) picks.push({ id: "led", count: home.leds, hours: 5 }, { id: "phone", count: home.phones });
  if (on.has("internet")) picks.push({ id: "router", count: 1, hours: 24 });
  if (on.has("fridge")) picks.push({ id: "fridge", count: 1 });
  if (on.has("freezer")) picks.push({ id: "freezer", count: 1 });
  if (on.has("well")) picks.push({ id: "well", count: 1, hours: 1 });
  if (on.has("cpap")) picks.push({ id: "cpap", count: 1, hours: LOADS.cpapNightHours });
  if (on.has("heat")) picks.push({ id: "furnace", count: 1, hours: 6 });
  return picks;
}

/** Brands with an in-stock panel we list; the kit only picks their stations, so every power line has a matching panel. */
const panelFor = (brand: string): SolarPanel | undefined => SOLAR_PANELS.find((p) => p.brand === brand && !p.soldOut);

/** Stations the kit may pick: in stock, priced, a tracked brand, with a priced panel from the same maker. */
export function kitStations(): StationOption[] {
  return stationOptions().filter((o) => AFFILIATES[o.brand].tracked && o.brand !== "naturesgenerator" && panelFor(o.brand));
}

const product = (id: string) => PRODUCTS.find((p) => p.id === id)!;

/**
 * Complete off-grid systems (installed inverter, 48 V battery bank, panels in the box) as
 * calculator options, so the same matchStations picks the battery count. Used only when no
 * power station we track holds the household's battery size.
 */
export function kitSystems(): StationOption[] {
  return OFFGRID_SYSTEMS.filter((s) => AFFILIATES[s.brand].tracked && !s.soldOut).map((s) => ({
    id: s.id,
    name: `${AFFILIATES[s.brand].name} ${s.model}`,
    brand: s.brand,
    capacityWh: s.capacityWh,
    addOnWh: s.addOn.capacityWh,
    addOnMax: s.addOn.maxUnits,
    addOnInStock: !s.addOn.soldOut,
    solarInputW: s.solarInputW,
    acOutputW: s.acOutputW,
    surgeW: s.surgeW,
    url: s.url,
  }));
}

export const systemById = (id: string) => OFFGRID_SYSTEMS.find((s) => s.id === id);

/** The example 240 V pump the well-pump page uses: 1/2 HP, 230 V, 3-wire (Franklin Electric table). */
export const EXAMPLE_PUMP_240 = pumpMotor("1-2hp-230v-3w");

export type WellStart = "runs" | "soft-start" | "none";

export interface KitInput {
  home: HomeSize;
  loads: KitLoad[];
  /** December kWh a day per kW of panels for the state. */
  perKwDay: number;
  /** Treat the well pump as 240 V. */
  well240?: boolean;
  darkDays?: number;
  generator?: { ratedW: number; tankGal: number; runtimeHours: number };
  /** Minutes a day of cooking with both stove burners on high. Defaults to our example per person. */
  cookMinutes?: number;
}

export interface KitPower {
  match: StationMatch;
  /** Set when the pick is a complete off-grid system rather than a power station: panels come in its box. */
  system: OffGridSystem | null;
  /** True when no station we track holds the full battery size; the biggest one is used and the generator does more. */
  short: boolean;
  /** The panel bought separately; null for a system, whose panels are in the box. */
  panel: SolarPanel | null;
  /** Panel watts, for the panels bought or the ones in the system's box. */
  panelWatts: number;
  panels: number;
  panelW: number;
  /** True when the station's solar input is below the December panel need. */
  inputCapped: boolean;
  solarWhDay: number;
}

export interface KitPackage {
  home: HomePreset;
  picks: LoadPick[];
  whPerDay: number;
  size: OffGridSize;
  runningW: number;
  power: KitPower | null;
  well240: boolean;
  wellStart: WellStart | null;
  /** Wh a day the panels fall short in an average December day. */
  shortfallWhDay: number;
  generator: {
    ratedW: number;
    tankGal: number;
    runtimeHours: number;
    decemberHours: number;
    darkDays: number;
    darkHours: number;
    hours: number;
    gallons: number;
    tanks: number;
  };
  water: { storeDays: number; storeGallons: number; treatDays: number; treatGallons: number; totalGallons: number };
  food: { daily: number; total: number; people: number };
  /** Food staples, stove fuel, water treatment and garden, scaled by household. */
  supplies: {
    staples: ReturnType<typeof staplesFor>;
    cooking: ReturnType<typeof cookingPlan>;
    bleach: ReturnType<typeof bleachFor>;
    garden: ReturnType<typeof gardenFor>;
  };
  /** Plain-language warnings the page must show. */
  notes: string[];
}

function pickPower(options: StationOption[], needWh: number, runningW: number): { match: StationMatch; short: boolean } | null {
  const m = matchStations(options, needWh, { runningW, limit: 1 })[0];
  if (m) return { match: m, short: false };
  // Nothing holds it: take the station that reaches the most with its add-ons.
  let best: StationMatch | null = null;
  for (const o of options) {
    if (runningW > 0 && o.acOutputW < runningW) continue;
    const addOns = o.addOnWh && o.addOnInStock ? o.addOnMax : 0;
    const totalWh = o.capacityWh + addOns * (o.addOnWh ?? 0);
    if (!best || totalWh > best.totalWh || (totalWh === best.totalWh && addOns < best.addOns)) best = { option: o, addOns, totalWh };
  }
  return best ? { match: best, short: true } : null;
}


/** One complete 90-day package. */
export function buildKit(input: KitInput): KitPackage {
  const home = homePreset(input.home);
  const picks = kitPicks(home, input.loads);
  const whPerDay = dailyWh(picks);
  const size = sizeOffGrid({ whPerDay, perKwDay: input.perKwDay, days: KIT_BATTERY_DAYS });
  const runningW = peakWatts(picks).running;
  const hasWell = input.loads.includes("well");
  const well240 = hasWell && (input.well240 ?? home.well240);

  let options = kitStations();
  if (well240) options = options.filter((o) => product(o.id).volts === "120/240V");
  let chosen = whPerDay > 0 ? pickPower(options, size.batteryWh, runningW) : null;
  // No station holds it: a complete off-grid system that does, if one we track fits.
  let system: OffGridSystem | null = null;
  if (whPerDay > 0 && (!chosen || chosen.short)) {
    const sys = kitSystems().filter((o) => !well240 || systemById(o.id)!.volts === "120/240V");
    const m = matchStations(sys, size.batteryWh, { runningW, limit: 1 })[0];
    if (m) {
      chosen = { match: m, short: false };
      system = systemById(m.option.id)!;
    }
  }

  let power: KitPower | null = null;
  if (system && chosen) {
    const panelW = system.panel.count * system.panel.watts;
    power = {
      match: chosen.match,
      system,
      short: false,
      panel: null,
      panelWatts: system.panel.watts,
      panels: system.panel.count,
      panelW,
      inputCapped: false,
      solarWhDay: solarWhPerDay(panelW, input.perKwDay),
    };
  } else if (chosen) {
    const o = chosen.match.option;
    const panel = panelFor(o.brand)!;
    const cap = o.solarInputW ?? 0;
    const target = Math.min(size.panelW, cap);
    let panels = Math.ceil(target / panel.watts - 1e-9);
    if (panels * panel.watts > cap) panels = Math.floor(cap / panel.watts);
    const panelW = panels * panel.watts;
    power = {
      match: chosen.match,
      system: null,
      short: chosen.short,
      panel,
      panelWatts: panel.watts,
      panels,
      panelW,
      inputCapped: cap < size.panelW,
      solarWhDay: solarWhPerDay(panelW, input.perKwDay),
    };
  }

  let wellStart: WellStart | null = null;
  if (hasWell) {
    if (!power) wellStart = "none";
    else {
      const sys = power.system;
      const p = sys ? null : product(power.match.option.id);
      const st = sys
        ? { volts: sys.volts, acOutputW: sys.acOutputW, motorSurgeW: sys.surgeW ?? sys.acOutputW }
        : { volts: p!.volts, acOutputW: p!.acOutputW, motorSurgeW: motorSurgeW(p!) };
      const fit = well240 ? pumpFit(pumpLoad(EXAMPLE_PUMP_240), st) : loadFit(loadDef("well"), st);
      wellStart = fit === "runs" ? "runs" : fit === "start-unconfirmed" ? "soft-start" : "none";
    }
  }

  const shortfallWhDay = Math.max(0, whPerDay - (power?.solarWhDay ?? 0));
  const gen = input.generator ?? EXAMPLE_GENERATOR;
  const darkDays = Math.max(0, Math.min(KIT_DAYS, input.darkDays ?? DEFAULT_DARK_DAYS));
  const hoursFor = (wh: number) => (gen.ratedW > 0 ? Math.min(24, wh / gen.ratedW) : 0);
  // Ordinary December days: the generator makes up what the panels miss.
  const dec = generatorPlan({ tankSize: gen.tankGal, runtimeHours: gen.runtimeHours, hoursPerDay: hoursFor(shortfallWhDay), days: KIT_DAYS - darkDays });
  // Storm days: no useful sun, the generator carries the whole day.
  const dark = generatorPlan({ tankSize: gen.tankGal, runtimeHours: gen.runtimeHours, hoursPerDay: hoursFor(whPerDay), days: darkDays });
  const gallons = dec.fuel + dark.fuel;

  const people = home.people.length;
  const stored = waterNeeded({ people, days: GOAL_DAYS });
  const all = waterNeeded({ people, days: KIT_DAYS });
  const food = foodNeeded(home.people, KIT_DAYS, "moderate");

  const notes: string[] = [];
  if (power?.short) notes.push("battery-short");
  if (power?.inputCapped) notes.push("solar-input-capped");
  if (shortfallWhDay > 0) notes.push("cloudy-winter");
  if (power?.system) notes.push("system-install");
  if (power?.system && size.panelW > power.panelW) notes.push("system-more-panels");
  if (hasWell && well240) notes.push("well-240v");
  if (wellStart === "soft-start") notes.push("well-soft-start");
  if (hasWell && !power) notes.push("well-no-station");

  return {
    home,
    picks,
    whPerDay,
    size,
    runningW,
    power,
    well240,
    wellStart,
    shortfallWhDay,
    generator: {
      ratedW: gen.ratedW,
      tankGal: gen.tankGal,
      runtimeHours: gen.runtimeHours,
      decemberHours: dec.hours,
      darkDays,
      darkHours: dark.hours,
      hours: dec.hours + dark.hours,
      gallons,
      tanks: gen.tankGal > 0 ? Math.ceil(gallons / gen.tankGal - 1e-9) : 0,
    },
    water: { storeDays: GOAL_DAYS, storeGallons: stored.total, treatDays: KIT_DAYS - GOAL_DAYS, treatGallons: all.total - stored.total, totalGallons: all.total },
    food: { daily: food.daily, total: food.total, people },
    supplies: {
      staples: staplesFor(food.total),
      cooking: cookingPlan(people, KIT_DAYS, input.cookMinutes),
      bleach: bleachFor(all.total - stored.total),
      garden: gardenFor(people, KIT_DAYS),
    },
    notes,
  };
}

/** Product ids a package can show, for price dates and sources. */
export const kitProductIds = (k: KitPackage) => (k.power && !k.power.system ? [k.power.match.option.id] : []);

/** Complete systems a package can show, for price dates and sources. */
export const kitSystemIds = (k: KitPackage) => (k.power?.system ? [k.power.system.id] : []);

/** The three preset packages for one state's December sun. */
export const presetKits = (perKwDay: number) => HOME_PRESETS.map((h) => buildKit({ home: h.id, loads: h.loads, perKwDay }));
