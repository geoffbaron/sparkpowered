/**
 * Home-backup hookup picker (/home-backup/hookup-picker): five answers in, a
 * way to connect a portable battery to the house, the battery size, the
 * in-stock models that fit and a parts list with rough costs.
 *
 * Nothing here is typed in by hand:
 * - Loads, daily watt-hours, running and starting watts: LOAD_DEFS, dailyWh and
 *   peakWatts in src/lib/offgrid.ts (EIA RECS, EWEB generator sizing sheet).
 * - Battery size: outageBatteryWh (offgrid.ts), i.e. a day's use / 85% usable.
 * - Whether a model can start a motor: motorSurgeW in src/lib/can-it-run.ts.
 * - Models, prices, stock: src/data/products.ts; hookup facts and part costs:
 *   src/data/hookup.ts (each with its source and read date).
 *
 * Rules the tests hold this to:
 * - Renters, and anyone not hiring an electrician, get extension cords only.
 * - 240 V loads only get 120/240 V models, or two units joined by the maker's
 *   own hub where the maker sells one.
 * - Sold-out models and sold-out add-on batteries are never recommended.
 * - Every method that touches the panel says licensed electrician and permit.
 */

import type { BrandId } from "@/data/affiliates";
import { PARTS, type Part } from "@/data/hookup";
import { USABLE_FRACTION, dailyWh, loadDef, outageBatteryWh, peakWatts, type LoadPick } from "@/lib/offgrid";

export type Volts = "120" | "240";
export type Tenure = "own" | "rent";
export type Budget = "1500" | "3000" | "5000" | "any";
export type Method = "cords" | "interlock" | "switch" | "panel";

/** Loads offered in step 1, all from LOAD_DEFS. */
export const PICKER_LOADS = ["fridge", "freezer", "router", "led", "phone", "cpap", "laptop", "tv", "microwave", "furnace", "well"] as const;
export type PickerLoadId = (typeof PICKER_LOADS)[number];

/** How many of each load a tap adds (four bulbs, two phone charges), matching the site's essentials day. */
export const LOAD_COUNTS: Partial<Record<PickerLoadId, number>> = { led: 4, phone: 2 };

/** Loads that are wired in, not plugged in: only transfer equipment at the panel can power them. */
export const HARDWIRED: readonly string[] = ["well", "furnace"];

export const BUDGET_USD: Record<Budget, number> = { "1500": 1500, "3000": 3000, "5000": 5000, any: Infinity };

export const METHOD_LABEL: Record<Method, string> = {
  cords: "Extension cords to each appliance",
  interlock: "Inlet box and interlock kit",
  switch: "Manual transfer switch",
  panel: "The maker's own home panel kit",
};

/** One buyable setup: a single model, or two of a 120 V model joined by the maker's hub for 240 V. */
export interface Candidate {
  /** productId, or productId + "-pair". */
  key: string;
  productId: string;
  name: string;
  brand: BrandId;
  units: 1 | 2;
  /** Battery in the setup before add-ons. */
  capacityWh: number;
  addOn: { model: string; capacityWh: number; usd: number; max: number } | null;
  /** Equipment price before add-ons: unit(s) plus the hub for a pair. */
  priceUsd: number;
  acOutputW: number;
  /** Watts available to start a motor (can-it-run's motorSurgeW; a pair is held to its continuous rating). */
  motorSurgeW: number;
  has240: boolean;
  /** The 30 A+ outlet an inlet box or transfer switch connects to, if we have read it on the maker's page. */
  outlet: string | null;
  smartPanel: { name: string; usd: number; url: string; retrieved: string; note: string } | null;
  hub: { name: string; usd: number; url: string; retrieved: string; outlet: string } | null;
  url: string;
  retrieved: string;
}

export interface HookupData {
  candidates: Candidate[];
}

export interface HookupInput {
  loads: PickerLoadId[];
  days: 1 | 2 | 3;
  volts: Volts;
  tenure: Tenure;
  budget: Budget;
  electrician: boolean;
}

export const DEFAULT_INPUT: HookupInput = {
  loads: ["fridge", "router", "led", "phone"],
  days: 1,
  volts: "120",
  tenure: "own",
  budget: "3000",
  electrician: true,
};

export interface Match {
  c: Candidate;
  addOns: number;
  totalWh: number;
  /** Equipment at the maker's listed prices: unit(s), hub, add-ons and the maker's panel kit if the method uses it. */
  equipmentUsd: number;
  /** Equipment plus the parts list, low and high. */
  totalUsd: [number, number];
  /** Hours the setup runs the covered loads with no recharging. */
  hours: number;
  reachesNeed: boolean;
  /** Running watts plus the biggest motor start fit under the setup's motor surge. */
  startOk: boolean;
  overBudget: boolean;
}

export interface HookupResult {
  method: Method;
  /** Other methods that would also work for these answers. */
  alternatives: Method[];
  /** False for renters and anyone not hiring an electrician: nothing at the panel is offered. */
  panelAllowed: boolean;
  covered: LoadPick[];
  /** Selected loads the method cannot power (wired-in loads with cords only). */
  notCovered: string[];
  dailyWh: number;
  needWh: number;
  runningW: number;
  peakW: number;
  matches: Match[];
  parts: Part[];
  partsUsd: [number, number];
  /** Every method at the panel: a licensed electrician installs it. */
  electrician: boolean;
  permit: boolean;
  notes: string[];
}

export const loadPicks = (ids: readonly string[]): LoadPick[] =>
  ids.map((id) => ({ id, count: LOAD_COUNTS[id as PickerLoadId] ?? 1, hours: loadDef(id).hours }));

/** Parts for a method; the switch size follows the number of different loads. */
export function partsFor(method: Method, circuits: number): Part[] {
  if (method === "cords") return [PARTS.cords];
  if (method === "interlock") return [PARTS.interlock, PARTS.inlet, PARTS.inletCord, PARTS.supplies, PARTS.interlockLabor, PARTS.permit];
  if (method === "switch") return [circuits <= 6 ? PARTS.switch6 : PARTS.switch10, PARTS.inlet, PARTS.inletCord, PARTS.switchLabor, PARTS.permit];
  // The maker's kit is equipment (priced on the match); the electrician's time and permit are parts.
  return [PARTS.switchLabor, PARTS.permit];
}

const sum = (parts: Part[]): [number, number] => [parts.reduce((t, p) => t + p.usd[0], 0), parts.reduce((t, p) => t + p.usd[1], 0)];

/** Five or more different plug-in loads around the house is where cords get unwieldy. */
export const MANY_LOADS = 5;

function chooseMethod(inp: HookupInput, hardwired: boolean, loadCount: number, data: HookupData): Method {
  if (inp.tenure === "rent" || !inp.electrician) return "cords";
  const atPanel = hardwired || inp.volts === "240";
  // Plug-in loads only: cords do the job, unless there are many of them and room in the budget.
  if (!atPanel && (inp.budget === "1500" || loadCount < MANY_LOADS)) return "cords";
  if (inp.budget === "any" && data.candidates.some((c) => c.smartPanel && (inp.volts === "120" || c.has240))) return "panel";
  if (inp.budget === "1500") return "interlock";
  return "switch";
}

function matchesFor(method: Method, inp: HookupInput, data: HookupData, needWh: number, runningW: number, peakW: number, partsUsd: [number, number], hourlyW: number): Match[] {
  const limit = BUDGET_USD[inp.budget];
  const out: Match[] = [];
  for (const c of data.candidates) {
    if (inp.volts === "240" && !c.has240) continue;
    // Two units on a hub exist only to make 240 V; never offered for 120 V needs.
    if (inp.volts === "120" && c.units === 2) continue;
    if ((method === "interlock" || method === "switch") && !c.outlet) continue;
    if (method === "panel" && !c.smartPanel) continue;
    if (runningW > c.acOutputW) continue;
    let addOns = 0;
    if (c.capacityWh < needWh && c.addOn) addOns = Math.min(c.addOn.max, Math.ceil((needWh - c.capacityWh) / c.addOn.capacityWh));
    const totalWh = c.capacityWh + addOns * (c.addOn?.capacityWh ?? 0);
    const equipmentUsd = c.priceUsd + addOns * (c.addOn?.usd ?? 0) + (method === "panel" && c.smartPanel ? c.smartPanel.usd : 0);
    const totalUsd: [number, number] = [equipmentUsd + partsUsd[0], equipmentUsd + partsUsd[1]];
    out.push({
      c,
      addOns,
      totalWh,
      equipmentUsd,
      totalUsd,
      hours: hourlyW > 0 ? (totalWh * USABLE_FRACTION) / hourlyW : Infinity,
      reachesNeed: totalWh >= needWh,
      startOk: peakW <= c.motorSurgeW,
      overBudget: totalUsd[0] > limit,
    });
  }
  // Fits the need, starts the motors, within budget; then within budget; then cheapest. One setup per brand.
  out.sort(
    (a, b) =>
      Number(b.reachesNeed && b.startOk && !b.overBudget) - Number(a.reachesNeed && a.startOk && !a.overBudget) ||
      Number(a.overBudget) - Number(b.overBudget) ||
      Number(b.reachesNeed) - Number(a.reachesNeed) ||
      Number(b.startOk) - Number(a.startOk) ||
      // Neither reaches the size: the bigger battery first.
      (!a.reachesNeed && !b.reachesNeed ? b.totalWh - a.totalWh : 0) ||
      a.totalUsd[0] - b.totalUsd[0],
  );
  const seen = new Set<string>();
  return out.filter((m) => (seen.has(m.c.brand) ? false : (seen.add(m.c.brand), true))).slice(0, 3);
}

export function pick(inp: HookupInput, data: HookupData): HookupResult {
  const chosen = PICKER_LOADS.filter((id) => inp.loads.includes(id));
  const hardwiredChosen = chosen.filter((id) => HARDWIRED.includes(id));
  let method = chooseMethod(inp, hardwiredChosen.length > 0, chosen.length, data);
  const panelAllowed = inp.tenure === "own" && inp.electrician;

  const coveredIds = method === "cords" ? chosen.filter((id) => !HARDWIRED.includes(id)) : chosen;
  const covered = loadPicks(coveredIds);
  const notCovered = method === "cords" ? hardwiredChosen.map((id) => loadDef(id).label) : [];
  const wh = dailyWh(covered);
  const needWh = outageBatteryWh(wh, inp.days);
  const { running, peak } = peakWatts(covered);

  const build = (m: Method) => {
    const parts = partsFor(m, coveredIds.length);
    const partsUsd = sum(parts);
    return { parts, partsUsd, matches: matchesFor(m, inp, data, needWh, running, peak, partsUsd, wh / 24) };
  };
  let r = build(method);
  // No model takes the maker's panel kit for these answers: fall back to a transfer switch.
  if (method === "panel" && !r.matches.some((m) => m.reachesNeed)) {
    method = "switch";
    r = build(method);
  }

  const alternatives: Method[] = [];
  if (method !== "cords" && hardwiredChosen.length === 0 && inp.volts === "120") alternatives.push("cords");
  if (panelAllowed) {
    for (const m of ["interlock", "switch", "panel"] as Method[]) {
      if (m === method) continue;
      if (m === "panel" && !data.candidates.some((c) => c.smartPanel && (inp.volts === "120" || c.has240))) continue;
      alternatives.push(m);
    }
  }

  const notes: string[] = [];
  if (inp.tenure === "rent")
    notes.push("Renting: nothing gets connected to the building's wiring. Plug each appliance straight into the battery, or into a heavy-duty outdoor-rated cord running to it.");
  else if (!inp.electrician)
    notes.push("Without a licensed electrician, the only safe way is plugging appliances into the battery. Connecting to house wiring is electrician's work with a permit.");
  if (notCovered.length)
    notes.push(`${notCovered.join(" and ")} ${notCovered.length > 1 ? "are" : "is"} wired in, so a cord can't reach ${notCovered.length > 1 ? "them" : "it"}. Powering ${notCovered.length > 1 ? "them" : "it"} takes a transfer switch installed by a licensed electrician${inp.tenure === "rent" ? ", with the owner's OK" : ""}.`);
  if (inp.volts === "240")
    notes.push("240 V loads need a 120/240 V model, or two of the same 120 V model joined by the maker's own hub. Check that the load's running watts on its nameplate fit the setup's output.");
  if (method !== "cords")
    notes.push("A licensed electrician installs it, with a permit and inspection where your area requires one. Your electrician picks the switch or interlock listed for your panel and sizes the breaker and wire.");
  if (method === "interlock")
    notes.push("An interlock lets you turn on any breaker, so you must keep the total under the battery's output yourself. Some areas don't accept interlocks; your electrician and permit office decide.");
  if (r.matches.some((m) => !m.startOk) && covered.some((p) => loadDef(p.id).startW > 0))
    notes.push("A motor (fridge, freezer, pump or blower) needs a burst of extra watts to start. Setups marked 'start not confirmed' may not start everything at once; stagger them.");
  notes.push("Never plug the battery into a wall or dryer outlet to power the house. That's called backfeeding: it can electrocute utility workers and neighbors and start a fire.");

  return {
    method,
    alternatives,
    panelAllowed,
    covered,
    notCovered,
    dailyWh: wh,
    needWh,
    runningW: running,
    peakW: peak,
    matches: r.matches,
    parts: r.parts,
    partsUsd: r.partsUsd,
    electrician: method !== "cords",
    permit: method !== "cords",
    notes,
  };
}
