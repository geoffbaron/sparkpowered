/**
 * Figures for the "Now power your home" ending. Server side only: it reads the
 * state data and plug-in model. The game fetches them from
 * /solartopia/ending-data so the 48 KB state file never ships in the game
 * bundle.
 */

import { STATES, batteryFigures, chargingFigures, type StateEnergy } from "@/lib/energy";
import { REFERENCE_KIT_W, pluginFigures } from "@/lib/plugin-solar";
import { lawFor } from "@/data/plugin-solar-law";

export interface EndingFigures {
  abbr: string;
  name: string;
  /** Average monthly electric bill, whole dollars. */
  billUsd: number;
  /** Most a reference plug-in kit can be worth in a year, whole dollars. */
  pluginValueYear: number;
  kitW: number;
  /** One sentence on plug-in solar rules here. */
  lawLine: string;
  /** Hours of an average home a single home battery covers. */
  batteryHours: number;
  evMonthlyUsd: number;
  gasMonthlyUsd: number;
  savingMonthlyUsd: number;
}

export function lawLine(s: StateEnergy) {
  const law = lawFor(s.abbr);
  if (law?.status === "law") return `${s.name} has a plug-in solar law (${law.bill}): ${law.statusText}.`;
  if (law?.status === "pending") return `${s.name} has a plug-in solar bill pending (${law.bill}), but no law yet.`;
  return `${s.name} has no plug-in solar law yet, so connecting a kit normally needs your utility's approval.`;
}

export function endingFigures(s: StateEnergy): EndingFigures {
  const plug = pluginFigures(s, REFERENCE_KIT_W, "tilted");
  const charge = chargingFigures(s);
  const bat = batteryFigures(s);
  return {
    abbr: s.abbr,
    name: s.name,
    billUsd: Math.round(s.usage.avgMonthlyBillUsd),
    pluginValueYear: Math.round(plug.valueYear),
    kitW: REFERENCE_KIT_W,
    lawLine: lawLine(s),
    batteryHours: Math.round(bat.hoursPerPowerwall * 10) / 10,
    evMonthlyUsd: Math.round(charge.evMonthly),
    gasMonthlyUsd: Math.round(charge.gasMonthly),
    savingMonthlyUsd: Math.round(charge.savingMonthly),
  };
}

export function allEndingFigures(): Record<string, EndingFigures> {
  return Object.fromEntries(STATES.map((s) => [s.abbr, endingFigures(s)]));
}
