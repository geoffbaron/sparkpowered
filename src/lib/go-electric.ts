/**
 * The Go Electric planner: yearly savings for each switch, for one household in
 * one state. Pure functions over serialisable inputs so the same code runs on
 * the server (state pages, home page) and in the browser (the planner).
 *
 * Every price comes from EIA (electricity, gasoline, natural gas), every
 * household usage figure from EIA's Residential Energy Consumption Survey, and
 * every efficiency from a federal standard or ENERGY STAR spec listed in
 * ASSUMPTIONS below. Savings are energy-bill savings only unless a line says
 * otherwise (the EV line adds Argonne's maintenance estimate separately).
 */

import home from "@/data/home-energy.json";
import { REFERENCE_EVS } from "@/lib/energy";

/** Million Btu in one kWh. */
const MMBTU_PER_KWH = 0.003412;
/** EIA: average heat content of natural gas delivered to consumers, about 1,036 Btu per cubic foot. */
export const MMBTU_PER_MCF = 1.036;

export interface Source {
  label: string;
  url: string;
}

export const ASSUMPTIONS = {
  furnaceAfue: {
    value: 0.8,
    text: "Gas furnace efficiency 80% (AFUE), the federal minimum for gas furnaces sold today",
    source: { label: "Federal efficiency standards for home appliances, 10 CFR 430.32", url: "https://www.ecfr.gov/current/title-10/chapter-II/subchapter-D/part-430/subpart-C/section-430.32" },
  },
  heatPumpCop: {
    value: 7.5 / 3.412,
    text: "Heat pump delivers 2.2 units of heat per unit of electricity over a season (HSPF2 7.5, the federal minimum for new split-system heat pumps since 2023). Cold-climate models do better.",
    source: { label: "Federal efficiency standards for home appliances, 10 CFR 430.32", url: "https://www.ecfr.gov/current/title-10/chapter-II/subchapter-D/part-430/subpart-C/section-430.32" },
  },
  gasWaterHeaterUef: {
    value: 0.58,
    text: "Gas tank water heater efficiency 0.58 (UEF), the federal minimum for a 40-gallon tank",
    source: { label: "Federal efficiency standards for home appliances, 10 CFR 430.32", url: "https://www.ecfr.gov/current/title-10/chapter-II/subchapter-D/part-430/subpart-C/section-430.32" },
  },
  electricWaterHeaterUef: {
    value: 0.92,
    text: "Standard electric tank water heater efficiency 0.92 (UEF), the federal minimum for a 50-gallon tank",
    source: { label: "Federal efficiency standards for home appliances, 10 CFR 430.32", url: "https://www.ecfr.gov/current/title-10/chapter-II/subchapter-D/part-430/subpart-C/section-430.32" },
  },
  heatPumpWaterHeaterUef: {
    value: 3.3,
    text: "Heat pump water heater efficiency 3.3 (UEF), the ENERGY STAR minimum",
    source: { label: "ENERGY STAR Residential Water Heaters Version 5.0 specification", url: "https://www.energystar.gov/sites/default/files/asset/document/ENERGY%20STAR%20Residential%20Water%20Heaters%20Version%205.0%20Specification%20and%20Partner%20Commitments.pdf" },
  },
  gasCooktopEfficiency: {
    value: 1,
    text: "Induction is about 3 times as efficient as a gas burner (ENERGY STAR), so it needs a third of the energy for the same cooking",
    source: { label: "ENERGY STAR, 2021 Emerging Technology Award: induction cooking tops", url: "https://www.energystar.gov/about/2021_residential_induction_cooking_tops" },
  },
  inductionEfficiency: { value: 3 },
  maintenance: {
    evCentsPerMile: 6.1,
    gasCentsPerMile: 10.1,
    text: "Scheduled maintenance: 6.1¢ a mile for a battery-electric car vs 10.1¢ for a gasoline car (Argonne National Laboratory, 2021)",
    source: { label: "US DOE Fact of the Week #1190, citing Argonne National Laboratory (2021)", url: "https://www.energy.gov/cmei/vehicles/articles/fotw-1190-june-14-2021-battery-electric-vehicles-have-lower-scheduled" },
  },
} as const;

/** Gas cars people can pick as "what I drive now", with EPA combined mpg from fueleconomy.gov. */
export const GAS_CARS = [
  { key: "small", label: "Small car (like a Toyota Corolla)", mpg: 35, evKey: "efficient", note: "2025 Toyota Corolla, 35 mpg combined (fueleconomy.gov)" },
  { key: "average", label: "Average new car or SUV", mpg: 25.5, evKey: "typical", note: "25.5 mpg, the average new vehicle (EPA Automotive Trends)" },
  { key: "suv", label: "Small SUV (like a Toyota RAV4)", mpg: 30, evKey: "typical", note: "2025 Toyota RAV4 FWD, 30 mpg combined (fueleconomy.gov)" },
  { key: "truck", label: "Pickup (like a Ford F-150)", mpg: 21, evKey: "large", note: "2025 Ford F-150 2WD 2.7L, 21 mpg combined (fueleconomy.gov)" },
] as const;

export type CarKey = (typeof GAS_CARS)[number]["key"] | "none";
export type HeatFuel = "gas" | "electric" | "heatpump" | "other";
export type WaterFuel = "gas" | "electric" | "heatpump" | "other";
export type StoveFuel = "gas" | "electric";
export type HomeType = "own" | "rent";

export interface PlannerState {
  abbr: string;
  name: string;
  slug: string;
  centsPerKwh: number;
  gasolineUsd: number;
  avgMonthlyBillUsd: number;
  avgMonthlyKwh: number;
  solarKwhPerKwYear: number;
  pluginKwhPerKwYear: number;
  pluginLaw: "law" | "pending" | "none";
}

export interface PlannerInputs {
  car: CarKey;
  milesPerWeek: number;
  monthlyBillUsd: number;
  heat: HeatFuel;
  water: WaterFuel;
  stove: StoveFuel;
  home: HomeType;
}

export interface Costs {
  rooftopPerWatt: number;
  pluginKitUsd: number;
  pluginKitW: number;
}

export type SwitchId = "ev" | "heatpump" | "hpwh" | "induction" | "solar" | "plugin" | "ebike";

export interface SwitchResult {
  id: SwitchId;
  /** Yearly saving in dollars; can be negative (honest result) or null when not applicable. */
  yearly: number | null;
  /** Upfront cost, only where we have a sourced figure. */
  upfront: number | null;
  paybackYears: number | null;
  /** One plain-English line with the everyday outcome. */
  headline: string;
  /** Short proof lines (the numbers behind the headline). */
  proof: string[];
  /** Set when the switch does not apply to this household. */
  skip?: string;
}

const HOME = home as unknown as {
  national: Record<string, number>;
  states: Record<string, { gasUsdPerMcf: number | null; gasSpaceHeatMmbtu: number | null; gasWaterHeatMmbtu: number | null; elecWaterHeatKwh: number | null; gasCookingMmbtu: number | null }>;
};

export function homeFigures(abbr: string) {
  const s = HOME.states[abbr];
  const n = HOME.national;
  return {
    gasUsdPerMcf: s?.gasUsdPerMcf ?? n.gasUsdPerMcf,
    gasSpaceHeatMmbtu: s?.gasSpaceHeatMmbtu ?? n.gasSpaceHeatMmbtu,
    gasWaterHeatMmbtu: s?.gasWaterHeatMmbtu ?? n.gasWaterHeatMmbtu,
    elecWaterHeatKwh: s?.elecWaterHeatKwh ?? n.elecWaterHeatKwh,
    gasCookingMmbtu: s?.gasCookingMmbtu ?? n.gasCookingMmbtu,
  };
}

const usd0 = (n: number) => `$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
const usd2 = (n: number) => `$${n.toFixed(2)}`;

export function evSwitch(st: PlannerState, i: PlannerInputs): SwitchResult {
  if (i.car === "none") return { id: "ev", yearly: null, upfront: null, paybackYears: null, headline: "", proof: [], skip: "You told us you don't drive." };
  const car = GAS_CARS.find((c) => c.key === i.car) ?? GAS_CARS[1];
  const ev = REFERENCE_EVS.find((e) => e.key === car.evKey)!;
  const miles = i.milesPerWeek * 52;
  const rate = st.centsPerKwh / 100;
  const gasYear = (miles / car.mpg) * st.gasolineUsd;
  const evYear = (miles / 100) * ev.kwhPer100mi * rate;
  const maint = (miles * (ASSUMPTIONS.maintenance.gasCentsPerMile - ASSUMPTIONS.maintenance.evCentsPerMile)) / 100;
  const fuelSaving = gasYear - evYear;
  const eGallon = (ev.kwhPer100mi / 100) * rate * car.mpg;
  return {
    id: "ev",
    yearly: fuelSaving + maint,
    upfront: null,
    paybackYears: null,
    headline: `Like paying ${usd2(eGallon)} a gallon instead of ${usd2(st.gasolineUsd)}.`,
    proof: [
      `Gas now: about ${usd0(gasYear)} a year for ${Math.round(miles).toLocaleString("en-US")} miles at ${car.mpg} mpg.`,
      `Charging at home: about ${usd0(evYear)} a year in a ${ev.year} ${ev.make} ${ev.model}.`,
      `Fuel saved ${usd0(fuelSaving)} + less maintenance ${usd0(maint)} (Argonne).`,
    ],
  };
}

export function heatPumpSwitch(st: PlannerState, i: PlannerInputs): SwitchResult {
  const h = homeFigures(st.abbr);
  const rate = st.centsPerKwh / 100;
  const delivered = h.gasSpaceHeatMmbtu * ASSUMPTIONS.furnaceAfue.value; // heat the home needs, MMBtu
  const hpKwh = delivered / MMBTU_PER_KWH / ASSUMPTIONS.heatPumpCop.value;
  const hpCost = hpKwh * rate;
  if (i.heat === "heatpump") return { id: "heatpump", yearly: null, upfront: null, paybackYears: null, headline: "", proof: [], skip: "You already heat with a heat pump." };
  if (i.heat === "other") return { id: "heatpump", yearly: null, upfront: null, paybackYears: null, headline: "", proof: [], skip: "We don't have state prices for propane or heating oil yet." };
  if (i.heat === "electric") {
    const resKwh = delivered / MMBTU_PER_KWH;
    const saving = resKwh * rate - hpCost;
    return {
      id: "heatpump",
      yearly: saving,
      upfront: null,
      paybackYears: null,
      headline: `Same warm house for about ${Math.round((1 - 1 / ASSUMPTIONS.heatPumpCop.value) * 100)}% less electricity than baseboard or a furnace with electric coils.`,
      proof: [
        `Electric resistance heat now: about ${usd0(resKwh * rate)} a year.`,
        `Heat pump: about ${usd0(hpCost)} a year. It also replaces your air conditioner.`,
      ],
    };
  }
  const gasCost = (h.gasSpaceHeatMmbtu / MMBTU_PER_MCF) * h.gasUsdPerMcf;
  const saving = gasCost - hpCost;
  return {
    id: "heatpump",
    yearly: saving,
    upfront: null,
    paybackYears: null,
    headline:
      saving > 50
        ? `Heats and cools with one machine, and costs about ${usd0(saving)} a year less than gas.`
        : saving > -50
          ? "Costs about the same as gas to run, and it is also your air conditioner."
          : `Costs about ${usd0(saving)} a year more than gas to run in your state at today's prices.`,
    proof: [
      `Gas furnace now: about ${usd0(gasCost)} a year (average ${st.name} gas-heated home).`,
      `Heat pump: about ${usd0(hpCost)} a year in electricity for the same heat.`,
    ],
  };
}

export function waterHeaterSwitch(st: PlannerState, i: PlannerInputs): SwitchResult {
  const h = homeFigures(st.abbr);
  const rate = st.centsPerKwh / 100;
  if (i.water === "heatpump") return { id: "hpwh", yearly: null, upfront: null, paybackYears: null, headline: "", proof: [], skip: "You already have a heat pump water heater." };
  if (i.water === "other") return { id: "hpwh", yearly: null, upfront: null, paybackYears: null, headline: "", proof: [], skip: "We don't have state prices for propane or oil yet." };
  if (i.water === "electric") {
    const deliveredKwh = h.elecWaterHeatKwh * ASSUMPTIONS.electricWaterHeaterUef.value;
    const hpKwh = deliveredKwh / ASSUMPTIONS.heatPumpWaterHeaterUef.value;
    const saving = (h.elecWaterHeatKwh - hpKwh) * rate;
    return {
      id: "hpwh",
      yearly: saving,
      upfront: null,
      paybackYears: null,
      headline: `Same hot showers for about ${Math.round((1 - hpKwh / h.elecWaterHeatKwh) * 100)}% less electricity.`,
      proof: [`Electric tank now: about ${usd0(h.elecWaterHeatKwh * rate)} a year.`, `Heat pump water heater: about ${usd0(hpKwh * rate)} a year.`],
    };
  }
  const delivered = h.gasWaterHeatMmbtu * ASSUMPTIONS.gasWaterHeaterUef.value;
  const hpKwh = delivered / MMBTU_PER_KWH / ASSUMPTIONS.heatPumpWaterHeaterUef.value;
  const gasCost = (h.gasWaterHeatMmbtu / MMBTU_PER_MCF) * h.gasUsdPerMcf;
  const saving = gasCost - hpKwh * rate;
  return {
    id: "hpwh",
    yearly: saving,
    upfront: null,
    paybackYears: null,
    headline: saving > 20 ? `Hot water for about ${usd0(saving)} a year less than gas.` : "Costs about the same as gas to run, with no flame or flue in your home.",
    proof: [`Gas water heater now: about ${usd0(gasCost)} a year.`, `Heat pump water heater: about ${usd0(hpKwh * rate)} a year.`],
  };
}

export function inductionSwitch(st: PlannerState, i: PlannerInputs): SwitchResult {
  const h = homeFigures(st.abbr);
  const rate = st.centsPerKwh / 100;
  const delivered = h.gasCookingMmbtu * ASSUMPTIONS.gasCooktopEfficiency.value;
  const indKwh = delivered / MMBTU_PER_KWH / ASSUMPTIONS.inductionEfficiency.value;
  const indCost = indKwh * rate;
  if (i.stove === "electric") {
    return {
      id: "induction",
      yearly: null,
      upfront: null,
      paybackYears: null,
      headline: "Already electric? Induction is faster and easier to clean than a coil or glass-top stove.",
      proof: [],
      skip: "You already cook with electricity.",
    };
  }
  const gasCost = (h.gasCookingMmbtu / MMBTU_PER_MCF) * h.gasUsdPerMcf;
  return {
    id: "induction",
    yearly: gasCost - indCost,
    upfront: null,
    paybackYears: null,
    headline: "No gas burning in your kitchen, faster boiling, and a cooktop you wipe clean.",
    proof: [`Cooking with gas: about ${usd0(gasCost)} a year. Induction: about ${usd0(indCost)} a year.`, "The bill difference is small either way; the payoff is cleaner air at home."],
  };
}

export function solarSwitch(st: PlannerState, i: PlannerInputs, c: Costs): SwitchResult {
  if (i.home === "rent") return { id: "solar", yearly: null, upfront: null, paybackYears: null, headline: "", proof: [], skip: "Rooftop solar is for owners; plug-in solar is the renter's version." };
  const rate = st.centsPerKwh / 100;
  const yearKwh = (i.monthlyBillUsd * 12) / rate;
  const kw = yearKwh / st.solarKwhPerKwYear;
  const upfront = kw * 1000 * c.rooftopPerWatt;
  const yearly = yearKwh * rate;
  return {
    id: "solar",
    yearly,
    upfront,
    paybackYears: upfront / yearly,
    headline: `Panels sized to cover your whole bill: up to ${usd0(yearly / 12)} a month back in your pocket.`,
    proof: [
      `About ${Math.ceil((kw * 1000) / 400)} panels (${kw.toFixed(1)} kW) for about ${usd0(upfront)} before incentives.`,
      "Assumes your utility credits all the power it makes at full price; less generous credits stretch the payback out.",
    ],
  };
}

export function pluginSwitch(st: PlannerState, i: PlannerInputs, c: Costs): SwitchResult {
  const rate = st.centsPerKwh / 100;
  const kwh = (st.pluginKwhPerKwYear * c.pluginKitW) / 1000;
  const yearly = kwh * rate;
  const billShare = kwh / ((i.monthlyBillUsd * 12) / rate);
  const lawLine =
    st.pluginLaw === "law"
      ? `${st.name} has a plug-in solar law, so you can connect a small kit without a utility contract.`
      : st.pluginLaw === "pending"
        ? `${st.name} has a plug-in solar bill pending; ask your utility before connecting.`
        : `${st.name} has no plug-in solar law yet: ask your utility first, or pair panels with a power station instead.`;
  return {
    id: "plugin",
    yearly,
    upfront: c.pluginKitUsd,
    paybackYears: c.pluginKitUsd / yearly,
    headline: `Plugs into an outlet and trims about ${Math.max(1, Math.round(billShare * 100))}% off your bill. No roof, no installer.`,
    proof: [`Up to ${usd0(yearly)} a year from an 800 W kit on a stand, if you use what it makes.`, lawLine],
  };
}

export function ebikeSwitch(st: PlannerState, i: PlannerInputs): SwitchResult {
  const car = GAS_CARS.find((c) => c.key === i.car) ?? GAS_CARS[1];
  const perTrip = (10 / car.mpg) * st.gasolineUsd;
  const twoAWeek = perTrip * 2 * 52;
  return {
    id: "ebike",
    yearly: twoAWeek,
    upfront: null,
    paybackYears: null,
    headline: `Every 10-mile round trip you ride instead of drive saves about ${usd2(perTrip)} in gas.`,
    proof: [`Two of those trips a week is about ${usd0(twoAWeek)} a year in gas alone, before parking and wear on the car.`],
  };
}

export function plan(st: PlannerState, i: PlannerInputs, c: Costs) {
  const all = [
    evSwitch(st, i),
    heatPumpSwitch(st, i),
    waterHeaterSwitch(st, i),
    inductionSwitch(st, i),
    solarSwitch(st, i, c),
    pluginSwitch(st, i, c),
    ebikeSwitch(st, i),
  ];
  // Rooftop and plug-in solar are alternatives: count the bigger one for owners, plug-in for renters.
  const solar = all.find((x) => x.id === "solar")!;
  const counted = all.filter((x) => x.yearly != null && !x.skip && x.yearly > 0 && !(x.id === "plugin" && solar.yearly != null && !solar.skip) && x.id !== "ebike");
  const total = counted.reduce((n, x) => n + (x.yearly ?? 0), 0);
  const ranked = [...all].filter((x) => !x.skip && x.yearly != null).sort((a, b) => (b.yearly ?? 0) - (a.yearly ?? 0));
  return { all, ranked, total, counted: counted.map((x) => x.id) };
}
