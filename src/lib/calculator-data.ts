/**
 * Slim, serialisable inputs for the client-side calculators. Kept separate so
 * the browser bundle only carries the handful of fields the widgets use.
 */
import evData from "@/data/epa-evs.json";
import { NATIONAL, REFERENCE_EVS, STATES } from "@/lib/energy";
import { lawFor } from "@/data/plugin-solar-law";
import { pluginModel } from "@/lib/plugin-solar";

export interface CalcState {
  abbr: string;
  name: string;
  centsPerKwh: number;
  gasUsd: number;
  gasArea: string;
  avgMonthlyKwh: number;
  kwhPerKwYear: number;
  /** Plug-in kit output per kW on a south-facing stand (scripts/plugin_solar_model.py). */
  pluginKwhPerKwYear: number;
  /** Plug-in solar law: "law", "pending" or "none", and the bill if any. */
  pluginLaw: "law" | "pending" | "none";
  pluginBill: string | null;
}

export interface CalcEv {
  id: number;
  make: string;
  /** Model year and model, without the make. */
  model: string;
  label: string;
  kwhPer100mi: number;
  rangeMiles: number;
}

export const CALC_STATES: CalcState[] = [...STATES]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((s) => ({
    abbr: s.abbr,
    name: s.name,
    centsPerKwh: s.electricity.residentialCentsPerKwhYtd,
    gasUsd: s.gasoline.usdPerGallon,
    gasArea: s.gasoline.level === "state" ? s.name : s.gasoline.area,
    avgMonthlyKwh: s.usage.avgMonthlyKwh,
    kwhPerKwYear: s.solar.kwhPerKwYear,
    pluginKwhPerKwYear: pluginModel(s.abbr).tilted.kwhPerKwYear,
    pluginLaw: lawFor(s.abbr)?.status ?? "none",
    pluginBill: lawFor(s.abbr)?.bill ?? null,
  }));

export const CALC_US = {
  centsPerKwh: NATIONAL.residentialCentsPerKwhYtd,
  gasUsd: NATIONAL.gasolineUsdPerGallon,
  gasMpg: NATIONAL.gasMpg,
};

interface RawEv {
  id: number;
  year: number;
  make: string;
  model: string;
  rangeMiles: number;
  kwhPer100mi: number;
}

/**
 * One entry per distinct make + model description, keeping the newest model
 * year, so the dropdown is not padded with identical 2026 and 2027 rows.
 */
export const CALC_EVS: CalcEv[] = (() => {
  const seen = new Map<string, RawEv>();
  for (const v of (evData as { vehicles: RawEv[] }).vehicles) {
    const key = `${v.make}|${v.model}`;
    const prev = seen.get(key);
    if (!prev || v.year > prev.year) seen.set(key, v);
  }
  return [...seen.values()]
    .sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`))
    .map((v) => ({
      id: v.id,
      make: v.make,
      model: `${v.year} ${v.model}`,
      label: `${v.year} ${v.make} ${v.model}`,
      kwhPer100mi: v.kwhPer100mi,
      rangeMiles: v.rangeMiles,
    }));
})();

/**
 * The reference "typical" EV, resolved to the entry the dropdown actually
 * carries (the list keeps the newest model year of each model, so the ID can
 * differ from the reference record's).
 */
export const DEFAULT_EV_ID = (() => {
  const ref = REFERENCE_EVS.find((e) => e.key === "typical")!;
  const hit = CALC_EVS.find((e) => e.id === ref.id) ?? CALC_EVS.find((e) => e.make === ref.make && e.model.endsWith(ref.model));
  return (hit ?? CALC_EVS[0]).id;
})();
