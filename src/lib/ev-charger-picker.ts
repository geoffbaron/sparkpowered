/**
 * Home EV charger picker: a few plain answers in, one charger spec out, plus
 * matching products from src/data/chargers.ts (only brands we carry) and an
 * installation estimate from INSTALL_COST (Qmerit 2026 via EnergySage).
 *
 * Every number here comes from data the site already sources:
 * - kWh per 100 miles: EPA reference EVs in state-energy.json.
 * - The 125% continuous-load rule (circuit = charger amps / 0.8) and the
 *   30-amp dryer circuit -> 24 amps: ChargePoint's Home Flex table and DOE
 *   (see the /questions/ev-charging answers).
 * - Level 1 = a 12-amp cord on 120 volts (1.44 kW), as in components/chargers.
 * - An 8-hour overnight window, the DOE's own Level 1 example ("about 40 miles
 *   in 8 hours").
 * Logged in docs/fact-check-ev-charger-picker.md.
 */

import { HOME_CHARGERS, type HomeCharger } from "@/data/chargers";

/**
 * The sourced figures the picker needs, passed in from the server page so the
 * client bundle doesn't carry the whole state data file.
 */
export interface PickerData {
  /** EPA kWh per 100 miles for each reference car. */
  evs: Record<CarAnswer, { make: string; model: string; kwhPer100mi: number }>;
  install: {
    usAverage: number;
    byState: Record<string, number>;
    subpanel: [number, number];
    serviceUpgrade: [number, number];
    longRun: [number, number];
  };
  /** State names for the estimate dropdown. */
  states: { abbr: string; name: string }[];
}

export type PlugAnswer = "tesla" | "nacs" | "j1772" | "unsure";
export type CarAnswer = "efficient" | "typical" | "large";
/** What power is (or could be) where you park. */
export type PowerAnswer = "outlet1450" | "dryer" | "new50" | "big" | "tight" | "unsure";
export type MountAnswer = "plugin" | "hardwired" | "move" | "either";
export type SpotAnswer = "garage" | "outside";
export type ReachAnswer = "short" | "long";

export interface PickerInput {
  plug: PlugAnswer;
  car: CarAnswer;
  dailyMiles: number;
  power: PowerAnswer;
  mount: MountAnswer;
  spot: SpotAnswer;
  reach: ReachAnswer;
  /** Wants app scheduling for cheaper overnight (time-of-use) rates. */
  smart: boolean;
  /** Two-letter state for the installation estimate; "" = US average. */
  state: string;
}

export const DEFAULT_INPUT: PickerInput = {
  plug: "j1772",
  car: "typical",
  dailyMiles: 40,
  power: "unsure",
  mount: "either",
  spot: "garage",
  reach: "short",
  smart: false,
  state: "",
};

/** Daily-miles choices shown as buttons. */
export const MILES_CHOICES = [20, 40, 60, 100, 150] as const;

/** Volts for Level 2 and Level 1. */
export const LEVEL2_VOLTS = 240;
/** A typical Level 1 cord: 12 amps on 120 volts = 1.44 kW. */
export const LEVEL1_KW = (12 * 120) / 1000;
/** Overnight charging window (DOE's own example uses 8 hours). */
export const OVERNIGHT_HOURS = 8;
/** EV charging is a continuous load: the circuit must be 125% of the charger's draw. */
export const CONTINUOUS_FACTOR = 1.25;
/** Level 2 settings we size to (charger draw, amps). */
export const AMP_STEPS = [24, 32, 40, 48] as const;
/** Longest cable on the chargers we carry (Autel and EVIQO 25 ft; Lectron 23 ft). */
export const LONGEST_CABLE_FT = Math.max(...HOME_CHARGERS.map((c) => c.cableFt ?? 0));

export const kwAt = (amps: number) => (amps * LEVEL2_VOLTS) / 1000;
/** Standard breaker for a charger draw: 24 -> 30, 32 -> 40, 40 -> 50, 48 -> 60. */
export const circuitFor = (amps: number) => Math.ceil((amps * CONTINUOUS_FACTOR) / 10) * 10;


/** Miles of range added per hour at a given kW (EPA kWh/100 mi includes charging losses). */
export const milesPerHour = (kw: number, kwhPer100: number) => kw / (kwhPer100 / 100);

/** Most a circuit lets you draw, by what is (or could be) where you park. */
export function maxAmpsFor(power: PowerAnswer): number {
  switch (power) {
    case "dryer":
      return 24; // 30-amp dryer circuit
    case "tight":
      return 32; // a 40-amp circuit where the panel is nearly full
    case "big":
      return 48; // a 60-amp or bigger hardwired circuit
    default:
      return 40; // NEMA 14-50 on a 50-amp circuit, or a new 50-amp circuit
  }
}

export type ProductMatch = { charger: HomeCharger; why: string; setTo?: number };

export interface PickerResult {
  connector: "NACS" | "J1772";
  kwhPerDay: number;
  /** Hours to put back a day's miles: Level 1 and each Level 2 step. */
  hours: { level1: number; byAmps: Record<number, number> };
  level1Enough: boolean;
  /** Smallest Level 2 draw that refills the day overnight. */
  neededAmps: number;
  /** What we recommend you charge at (needed, capped by the circuit). */
  amps: number;
  circuitAmps: number;
  milesPerHour: number;
  /** True when even the recommended setting can't refill the day overnight. */
  shortOvernight: boolean;
  connection: "plug-in" | "hardwired";
  newCircuit: boolean;
  /** One line describing the charger to look for. */
  spec: string;
  products: ProductMatch[];
  /** Shown instead of products when nothing we carry fits. */
  noMatch: string | null;
  notes: string[];
  install: { low: number; high: number; stateAvg: number | null; zero: boolean; extras: string[] };
}

const charger = (id: string) => HOME_CHARGERS.find((c) => c.id === id)!;

export function pick(input: PickerInput, data: PickerData): PickerResult {
  const INSTALL_COST = data.install;
  const ev = data.evs[input.car];
  if (!ev) throw new Error(`Unknown car ${input.car}`);
  const kwhPerDay = (input.dailyMiles * ev.kwhPer100mi) / 100;
  const connector: "NACS" | "J1772" = input.plug === "tesla" || input.plug === "nacs" ? "NACS" : "J1772";

  const byAmps: Record<number, number> = {};
  for (const a of AMP_STEPS) byAmps[a] = kwhPerDay / kwAt(a);
  const level1 = kwhPerDay / LEVEL1_KW;
  const level1Enough = level1 <= OVERNIGHT_HOURS;
  // 24 amps only comes up for dryer circuits; a new circuit starts at 32.
  const neededAmps = AMP_STEPS.filter((a) => a >= 32).find((a) => byAmps[a] <= OVERNIGHT_HOURS) ?? 48;

  const cap = maxAmpsFor(input.power);
  // Plug-in tops out at 40 amps (a NEMA 14-50 on a 50-amp circuit); 48 needs hardwiring.
  const wantsPlug = input.mount === "plugin" || input.mount === "move";
  const ceiling = wantsPlug ? Math.min(cap, 40) : cap;
  // Where there's room, the standard setup is 40 amps on a 50-amp circuit (a NEMA
  // 14-50): it costs the same as 32 and leaves headroom. We go above 40 only when
  // the day needs it and the circuit allows it; tight panels and dryer circuits cap lower.
  const amps = input.power === "dryer" ? 24 : Math.min(Math.max(neededAmps, 40), ceiling);
  const circuitAmps = circuitFor(amps);
  const shortOvernight = byAmps[amps] > OVERNIGHT_HOURS;

  const outdoorHardwire = input.spot === "outside" && input.mount === "either";
  const connection: "plug-in" | "hardwired" =
    input.mount === "hardwired" || amps > 40 || outdoorHardwire ? "hardwired" : "plug-in";
  const newCircuit = !(input.power === "outlet1450" || input.power === "dryer");

  const notes: string[] = [];
  if (input.power !== "dryer" && neededAmps < amps)
    notes.push(`Your driving only needs about ${neededAmps} amps. ${amps} amps is the standard plug-in setup (a NEMA 14-50 on a ${circuitFor(amps)}-amp circuit) and leaves headroom for longer days.`);
  if (input.plug === "unsure")
    notes.push("Check your car's charge port before you buy. Most automakers committed to building the Tesla-style NACS port (SAE J3400) into new cars from 2025, while non-Tesla EVs built through 2024 have the round J1772 / CCS1 port, so look at the car or its manual rather than going by the brand.");
  if (input.plug === "nacs")
    notes.push("Your car has the Tesla-style (NACS) port, so a NACS charger plugs straight in.");
  if (outdoorHardwire)
    notes.push("Parking outside: Autel recommends hardwiring for outdoor installs, and ChargePoint recommends hardwiring where local code requires a GFCI breaker on the outlet.");
  if (input.reach === "long")
    notes.push(`The chargers we carry have ${Math.min(...HOME_CHARGERS.filter((c) => c.cableFt).map((c) => c.cableFt!))} to ${LONGEST_CABLE_FT}-foot cables. Measure from where the charger will hang to your car's port; if it's farther, ask the electrician to put the outlet or charger closer to where you park.`);
  if (input.power === "dryer")
    notes.push("A 30-amp dryer circuit allows 24 amps of charging under the 125% rule, and nothing else should run on it while the car charges. Have an electrician check the circuit first.");
  if (input.power === "tight")
    notes.push("Ask the electrician for a load calculation first. A 40-amp circuit with the charger set to 32 amps often avoids a panel upgrade.");
  if (input.power === "outlet1450")
    notes.push("Have an electrician confirm the outlet is on its own 50-amp circuit and in good shape before you charge on it every night.");
  if (shortOvernight)
    notes.push(`At ${amps} amps your day takes about ${Math.ceil(byAmps[amps])} hours to put back, longer than one night. A bigger circuit would help.`);

  // ---------------------------------------------------------------- products
  const products: ProductMatch[] = [];
  let noMatch: string | null = null;
  const lj = charger("lectron-nexus-j1772");
  const ln = charger("lectron-nexus-nacs");
  const lp = charger("lectron-portable-nacs");
  const a40 = charger("autel-elite-home-40a");
  const a50 = charger("autel-elite-home-50a");
  const ej = charger("eviqo-l2-j1772");
  const en = charger("eviqo-nacs-40a");
  const enh = charger("eviqo-nacs-hardwired-48a");
  // Ranked by spec and price only. EVIQO's J1772 model is the lowest-priced charger we
  // carry and matches or beats the others on cable, app and adjustability, so it leads
  // the J1772 answers; for NACS, Lectron is cheaper and EVIQO adds the app.
  const eviqoSwitch = "A switch inside sets the maximum to 16, 32, 40 or 48 amps";

  if (input.power === "dryer") {
    noMatch = `Look for a Level 2 ${connector} charger you can set to 24 amps or lower, with a plug that matches your dryer outlet (dryer outlets are a different shape from a NEMA 14-50). None of the chargers we carry ships with that plug, so we don't link one. For faster charging, add a 50-amp circuit instead.`;
  } else if (connection === "hardwired") {
    if (connector === "J1772") {
      products.push({
        charger: ej,
        setTo: amps < ej.hardwiredAmps! ? amps : undefined,
        why: `Hardwired it runs at up to ${ej.hardwiredAmps} amps. ${eviqoSwitch}, so the electrician sets it to ${amps} for your ${circuitAmps}-amp circuit. App scheduling, ${ej.cableFt}-foot cable, IP66 weatherproof for indoor or outdoor use. The lowest price here.`,
      });
      products.push({
        charger: a50,
        setTo: amps < a50.amps ? amps : undefined,
        why: `Hardwired, adjustable up to 50 amps, so the electrician sets it to ${amps} amps for your ${circuitAmps}-amp circuit. App scheduling, ${a50.cableFt}-foot cable, rated for indoor or outdoor use.`,
      });
    } else {
      products.push({
        charger: enh,
        setTo: amps < enh.amps ? amps : undefined,
        why: `Tesla-style (NACS) plug, hardwired, up to ${enh.amps} amps. ${eviqoSwitch}, so the electrician sets it to ${amps} for your ${circuitAmps}-amp circuit. App scheduling, ${enh.cableFt}-foot cable, IP66 weatherproof.`,
      });
    }
  } else if (input.mount === "move" && connector === "NACS") {
    products.push({ charger: lp, setTo: amps < 40 ? amps : undefined, why: "Portable: works from an ordinary outlet or a NEMA 14-50, adjustable from 8 to 40 amps, and moves with you. Lectron listed it as a pre-order shipping mid-November." });
    if (input.smart)
      products.push({ charger: en, setTo: amps < 40 ? amps : undefined, why: `Or a wall-mounted plug-in for the same NEMA 14-50 outlet, with app scheduling and a ${en.cableFt}-foot cable; unplug it and take it when you move.` });
    else products.push({ charger: ln, why: "Or a wall-mounted plug-in for the same NEMA 14-50 outlet, 40 amps, IP66 weatherproof." });
  } else if (amps < 40) {
    // A 40-amp circuit: needs a charger you can turn down to 32 amps.
    if (connector === "J1772") {
      products.push({ charger: ej, setTo: amps, why: `${eviqoSwitch}, so it can be set to ${amps} for a ${circuitAmps}-amp circuit. NEMA 14-50 plug, app scheduling, ${ej.cableFt}-foot cable. The lowest price here.` });
      products.push({ charger: a40, setTo: amps, why: `Adjustable up to 40 amps, so it can be set to ${amps} for a ${circuitAmps}-amp circuit. NEMA 14-50 plug, app scheduling, ${a40.cableFt}-foot cable.` });
    } else {
      const portable: ProductMatch = { charger: lp, setTo: amps, why: `Adjustable from 8 to 40 amps, so it can be set to ${amps} for a ${circuitAmps}-amp circuit. NEMA 14-50 and ordinary-outlet plugs. The lower price; Lectron listed it as a pre-order shipping mid-November.` };
      const wall: ProductMatch = { charger: en, setTo: amps, why: `${eviqoSwitch}, so it can be set to ${amps} for a ${circuitAmps}-amp circuit. Wall-mounted NEMA 14-50 plug-in with app scheduling and a ${en.cableFt}-foot cable.` };
      if (input.smart) products.push(wall, portable);
      else products.push(portable, wall);
    }
  } else if (connector === "NACS") {
    const lectron: ProductMatch = { charger: ln, why: `Tesla-style (NACS) plug, 40 amps, up to ${ln.milesPerHour} miles of range an hour (Lectron's figure), NEMA 14-50 plug-in, IP66 weatherproof, ${ln.cableFt}-foot cable. The lower price; no app.` };
    const eviqo: ProductMatch = { charger: en, why: `Tesla-style (NACS) plug, 40 amps, up to ${en.milesPerHour} miles of range an hour (EVIQO's figure), NEMA 14-50 plug-in, ${en.cableFt}-foot cable. Its app schedules charging for your utility's cheaper overnight hours.` };
    if (input.smart) products.push(eviqo, lectron);
    else products.push(lectron, eviqo);
  } else {
    const eviqo: ProductMatch = { charger: ej, why: `40 amps plugged in, up to ${ej.milesPerHour} miles of range an hour (EVIQO's figure), NEMA 14-50, ${ej.cableFt}-foot cable, IP66 weatherproof, and an app that schedules charging for cheaper overnight hours. The lowest price here.` };
    const lectron: ProductMatch = { charger: lj, why: `40 amps, up to ${lj.milesPerHour} miles of range an hour (Lectron's figure), NEMA 14-50 plug-in, IP66 weatherproof, ${lj.cableFt}-foot cable, ETL listed to UL 2594. No app.` };
    const autel: ProductMatch = { charger: a40, why: `40 amps, NEMA 14-50 plug-in, ${a40.cableFt}-foot cable. Its app schedules charging for your utility's cheaper overnight hours.` };
    products.push(eviqo, input.smart ? autel : lectron);
  }

  // ---------------------------------------------------------------- spec line
  const where = connection === "hardwired" ? `hardwired on a ${circuitAmps}-amp circuit` : input.power === "dryer" ? "on your 30-amp dryer circuit" : `plugged into a NEMA 14-50 on a ${circuitAmps}-amp circuit`;
  const spec = `A ${amps}-amp Level 2 ${connector} charger, ${where}${input.smart ? ", with app scheduling" : ""}${input.spot === "outside" ? ", rated for outdoor use" : ""}.`;

  // ---------------------------------------------------------------- install
  const stateAvg = input.state ? INSTALL_COST.byState[input.state] ?? null : null;
  const base = stateAvg ?? INSTALL_COST.usAverage;
  const extras: string[] = [];
  let low = 0;
  let high = 0;
  const zero = !newCircuit;
  if (newCircuit) {
    low = base;
    high = base;
    if (input.power === "tight") {
      extras.push(`If the panel needs a subpanel: +$${INSTALL_COST.subpanel[0].toLocaleString()} to $${INSTALL_COST.subpanel[1].toLocaleString()}; a full service upgrade: +$${INSTALL_COST.serviceUpgrade[0].toLocaleString()} to $${INSTALL_COST.serviceUpgrade[1].toLocaleString()}.`);
      high += INSTALL_COST.serviceUpgrade[1];
    }
    if (input.reach === "long") {
      high += INSTALL_COST.longRun[1];
      extras.push(`A long run of 60 to 80 feet from the panel adds about $${INSTALL_COST.longRun[0].toLocaleString()} to $${INSTALL_COST.longRun[1].toLocaleString()}.`);
    }
  }

  return {
    connector,
    kwhPerDay,
    hours: { level1, byAmps },
    level1Enough,
    neededAmps,
    amps,
    circuitAmps,
    milesPerHour: milesPerHour(kwAt(amps), ev.kwhPer100mi),
    shortOvernight,
    connection,
    newCircuit,
    spec,
    products: products.slice(0, 2),
    noMatch,
    notes,
    install: { low, high, stateAvg, zero, extras },
  };
}
