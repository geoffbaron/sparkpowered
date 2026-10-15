/**
 * Serialisable inputs for the Go Electric planner, built from the same
 * generated data every other page uses.
 */
import { lawFor } from "@/data/plugin-solar-law";
import { INSTALLED_BATTERY_COST, PLUGIN_KITS, ROOFTOP_SOLAR_COST } from "@/data/products";
import { STATES, stateByAbbr, NATIONAL, type StateEnergy } from "@/lib/energy";
import { plan, type Costs, type PlannerInputs, type PlannerState } from "@/lib/go-electric";
import { pluginModel } from "@/lib/plugin-solar";

/** The 800 W kit used as the plug-in solar example across the site. */
export const PLANNER_KIT = PLUGIN_KITS.find((k) => k.id === "pluggedsolar-800w-kit")!;

export const PLANNER_COSTS: Costs = {
  rooftopPerWatt: ROOFTOP_SOLAR_COST.perWatt,
  pluginKitUsd: PLANNER_KIT.priceUsd,
  pluginKitW: PLANNER_KIT.panelW,
};

export function plannerState(s: StateEnergy): PlannerState {
  return {
    abbr: s.abbr,
    name: s.name,
    slug: s.slug,
    centsPerKwh: s.electricity.residentialCentsPerKwhYtd,
    gasolineUsd: s.gasoline.usdPerGallon,
    avgMonthlyBillUsd: Math.round(s.usage.avgMonthlyBillUsd),
    avgMonthlyKwh: s.usage.avgMonthlyKwh,
    solarKwhPerKwYear: s.solar.kwhPerKwYear,
    pluginKwhPerKwYear: pluginModel(s.abbr).tilted.kwhPerKwYear,
    pluginLaw: lawFor(s.abbr)?.status ?? "none",
  };
}

export const PLANNER_STATES: PlannerState[] = [...STATES].sort((a, b) => a.name.localeCompare(b.name)).map(plannerState);

/** The household we assume until someone tells us otherwise: average bill, average car, gas heat, owner. */
export function defaultInputs(st: PlannerState): PlannerInputs {
  return {
    car: "average",
    milesPerWeek: 230,
    monthlyBillUsd: st.avgMonthlyBillUsd,
    heat: "gas",
    water: "gas",
    stove: "gas",
    home: "own",
  };
}

/** The planner's result for a state's typical household, for server-rendered pages. */
export function typicalPlan(abbr: string) {
  const st = plannerState(stateByAbbr(abbr)!);
  return { st, ...plan(st, defaultInputs(st), PLANNER_COSTS) };
}

/** Typical-household total for every state, for the home page picker. */
export const TYPICAL_TOTALS: Record<string, number> = Object.fromEntries(
  PLANNER_STATES.map((st) => [st.abbr, Math.round(plan(st, defaultInputs(st), PLANNER_COSTS).total / 10) * 10]),
);

export const INSTALLED_BATTERY = INSTALLED_BATTERY_COST;
export const US_GAS_PRICE = NATIONAL.gasolineUsdPerGallon;
