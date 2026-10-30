/**
 * Slim, serialisable inputs for the EV-or-plug-in-hybrid picker, built from
 * src/data/epa-phevs.json and src/data/state-winter-temps.json (both from
 * scripts/build_phev_data.py) and the shared state prices in energy.ts.
 */
import phevData from "@/data/epa-phevs.json";
import winterData from "@/data/state-winter-temps.json";
import { NATIONAL, STATES, type Source } from "@/lib/energy";
import type { PickerPhev, PickerState } from "@/lib/ev-or-phev";

interface RawPhev {
  id: number;
  year: number;
  make: string;
  model: string;
  electricRangeMiles: number;
  kwhPer100mi: number;
  gasMpg: number;
  labelElectricShare: number;
  premium: boolean;
}

const PHEV_FILE = phevData as { generated: string; source: Source; typicalId: number; vehicles: RawPhev[] };
const WINTER_FILE = winterData as { generated: string; source: Source; winterTempF: Record<string, number> };

export const PHEV_SOURCE = PHEV_FILE.source;
export const WINTER_SOURCE = WINTER_FILE.source;
export const WINTER_TEMPS = WINTER_FILE.winterTempF;

export const PICKER_PHEVS: PickerPhev[] = [...PHEV_FILE.vehicles]
  .sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`))
  .map((v) => ({
    id: v.id,
    make: v.make,
    model: `${v.year} ${v.model}`,
    label: `${v.year} ${v.make} ${v.model}`,
    electricRangeMiles: v.electricRangeMiles,
    kwhPer100mi: v.kwhPer100mi,
    gasMpg: v.gasMpg,
    labelElectricShare: v.labelElectricShare,
    premium: v.premium,
  }));

export const DEFAULT_PHEV_ID = PHEV_FILE.typicalId;

export const PICKER_STATES: PickerState[] = [...STATES]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((s) => ({
    abbr: s.abbr,
    name: s.name,
    centsPerKwh: s.electricity.residentialCentsPerKwhYtd,
    gasUsd: s.gasoline.usdPerGallon,
    winterTempF: WINTER_TEMPS[s.abbr] ?? null,
  }));

/** National averages; no cold adjustment for the "US average" choice. */
export const PICKER_US: PickerState = {
  abbr: "US",
  name: "US average",
  centsPerKwh: NATIONAL.residentialCentsPerKwhYtd,
  gasUsd: NATIONAL.gasolineUsdPerGallon,
  winterTempF: null,
};
