/**
 * Maths and constants for the boating section. Shared by server pages and the
 * runtime calculator (a client component), so every number lives here and
 * never in a "use client" file.
 */

import { BATTERIES, LEAD_ACID_REF, TROLLING_EXTRA } from "@/data/batteries";
import { BOAT_BATTERIES, FUEL_PRICES, GAS_OUTBOARDS } from "@/data/boating";

/** Hours we count as a full day of fishing. */
export const FISHING_DAY_HOURS = 8;

export interface Motor {
  id: string;
  label: string;
  volts: 12 | 24 | 36;
  thrustLb: number;
  /** Maximum amp draw from the maker's manual (full speed). */
  maxAmps: number;
  source: string;
}

const MK = "from Minn Kota's Endura C2 manual";

/**
 * Minn Kota's published maximum amp draw (Endura C2 manuals, Max Amp Draw
 * table). Minn Kota notes these are peaks at full speed, so they are the
 * ceiling, not a continuous load.
 */
export const MOTORS: Motor[] = [
  { id: "30-12", label: "30 lb, 12 V", volts: 12, thrustLb: 30, maxAmps: 30, source: `30 A ${MK}` },
  { id: "45-12", label: "45 lb, 12 V", volts: 12, thrustLb: 45, maxAmps: 42, source: `42 A ${MK}` },
  { id: "55-12", label: "55 lb, 12 V", volts: 12, thrustLb: 55, maxAmps: 50, source: `50 A ${MK}` },
  { id: "70-24", label: "70 lb, 24 V", volts: 24, thrustLb: 70, maxAmps: 42, source: `42 A ${MK}` },
  { id: "80-24", label: "80 lb, 24 V", volts: 24, thrustLb: 80, maxAmps: 56, source: `56 A ${MK}` },
  { id: "101-36", label: "101 lb, 36 V", volts: 36, thrustLb: 101, maxAmps: 46, source: `46 A ${MK}` },
  { id: "112-36", label: "112 lb, 36 V", volts: 36, thrustLb: 112, maxAmps: 52, source: `52 A ${MK}` },
];

export const MINN_KOTA_MANUAL = {
  name: "Minn Kota Endura C2 owner's manual (Max Amp Draw table)",
  url: "https://johnsonoutdoors.widen.net/content/pmt3jgylgd/pdf/EnduraC2-50-User-Manual-2067171rb.pdf",
};
export const NEWPORT_RUNTIME_GUIDE = {
  name: "Newport Vessels: calculate trolling motor runtime with a battery",
  url: "https://newportvessels.com/blogs/learn/trolling-motor-calculate-motor-runtime-with-a-battery",
};

export interface Speed {
  id: string;
  label: string;
  /** Share of the motor's maximum draw. */
  share: number;
  hint: string;
}

/**
 * Full speed uses the maker's max draw. Half speed halves it, Newport's rule
 * of thumb for lower speeds. Slow trolling at a quarter is our own estimate,
 * stated as such on the page.
 */
export const SPEEDS: Speed[] = [
  { id: "slow", label: "Slow troll", share: 0.25, hint: "Creeping a bank or holding position on a calm day: a quarter of full draw (our estimate)." },
  { id: "half", label: "Half speed", share: 0.5, hint: "Moving between spots or pushing into a breeze: half of full draw (Newport's rule of thumb)." },
  { id: "full", label: "Full speed", share: 1, hint: "Wide open into wind or current: Minn Kota's maximum draw." },
];

export interface RuntimeBattery {
  id: string;
  label: string;
  volts: 12 | 24 | 36;
  /** Amp-hours you can actually use at the motor's voltage. */
  usableAh: number;
  usableWh: number;
  weightLb: number | null;
  priceUsd: number | null;
  /** Redodo product page (tracked through our Awin link); null for the AGM reference. */
  url: string | null;
  leadAcid: boolean;
}

const all = [...BATTERIES, ...TROLLING_EXTRA];
const rd = (id: string) => {
  const b = all.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown battery ${id}`);
  return b;
};
const boat = (id: string) => {
  const b = BOAT_BATTERIES.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown boat battery ${id}`);
  return b;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

function agmString(volts: 12 | 24 | 36): RuntimeBattery {
  const n = volts / 12;
  return {
    id: `agm-${volts}`,
    label: n === 1 ? "100Ah AGM" : `${n} x 100Ah AGM`,
    volts,
    usableAh: LEAD_ACID_REF.ampHours * LEAD_ACID_REF.depthOfDischarge,
    usableWh: n * 12 * LEAD_ACID_REF.ampHours * LEAD_ACID_REF.depthOfDischarge,
    weightLb: round2(n * LEAD_ACID_REF.weightLb),
    priceUsd: round2(n * LEAD_ACID_REF.priceUsd),
    url: null,
    leadAcid: true,
  };
}

function lithium(id: string, label: string, volts: 12 | 24 | 36, count = 1): RuntimeBattery {
  const b = all.find((x) => x.id === id) ?? null;
  const o = b ? null : boat(id);
  const ah = b ? b.ampHours : o!.ampHours;
  const wh = (b ? b.energyWh : o!.energyWh) * count;
  return {
    id,
    label,
    volts,
    usableAh: ah,
    usableWh: wh,
    weightLb: round2((b ? b.weightLb : o!.weightLb ?? 0) * count) || null,
    priceUsd: round2((b ? b.priceUsd : o!.priceUsd) * count),
    url: b ? b.url : o!.url,
    leadAcid: false,
  };
}

/** Battery choices for each motor voltage, smallest first, the AGM reference first of all. */
export const RUNTIME_BATTERIES: Record<12 | 24 | 36, RuntimeBattery[]> = {
  12: [
    agmString(12),
    lithium("redodo-12v-50ah-bluetooth-trolling", "Lithium 12V 50Ah", 12),
    lithium("redodo-12v-100ah", "Lithium 12V 100Ah", 12),
    lithium("redodo-12v-120ah-group24-trolling", "Lithium 12V 120Ah", 12),
  ],
  24: [
    agmString(24),
    lithium("redodo-24v-50ah-trolling", "Lithium 24V 50Ah", 24),
    lithium("redodo-24v-100ah-group31-trolling", "Lithium 24V 100Ah", 24),
    lithium("redodo-24v-125ah-trolling-self-heating", "Lithium 24V 125Ah", 24),
  ],
  36: [
    agmString(36),
    lithium("redodo-36v-50ah-trolling", "Lithium 36V 50Ah", 36),
    { ...lithium("redodo-12v-100ah", "3 x lithium 12V 100Ah", 36, 3), id: "redodo-12v-100ah-x3", usableAh: rd("redodo-12v-100ah").ampHours },
  ],
};

export const batteriesFor = (v: 12 | 24 | 36) => RUNTIME_BATTERIES[v];

/**
 * Hours on the water: usable amp-hours divided by the motor's draw (Newport's
 * formula, runtime = amp-hours / amps). Batteries in series keep their
 * amp-hours, so this works at 12, 24 and 36 V alike.
 */
export function runtimeHours(motor: Pick<Motor, "maxAmps">, share: number, usableAh: number): number {
  const amps = motor.maxAmps * share;
  return amps > 0 && usableAh > 0 ? usableAh / amps : 0;
}

/** "about 4 hours", "about 1.5 hours", "under an hour". */
export function hoursLabel(h: number): string {
  if (!Number.isFinite(h) || h <= 0) return "under an hour";
  if (h < 0.95) return `about ${Math.max(10, Math.round((h * 60) / 5) * 5)} minutes`;
  if (h < 3) return `about ${Math.round(h * 2) / 2} hours`.replace("about 1 hours", "about 1 hour");
  return `about ${Math.round(h)} hours`;
}

export const motorById = (id: string) => {
  const m = MOTORS.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown motor ${id}`);
  return m;
};
export const speedById = (id: string) => SPEEDS.find((s) => s.id === id)!;

/** Runtime for a motor id, speed id and battery id (used by the pages' tables). */
export function runtimeFor(motorId: string, speedId: string, batteryId: string): number {
  const m = motorById(motorId);
  const b = batteriesFor(m.volts).find((x) => x.id === batteryId);
  if (!b) throw new Error(`Battery ${batteryId} not offered at ${m.volts} V`);
  return runtimeHours(m, speedById(speedId).share, b.usableAh);
}

/* ------------------------------------------------------------------ */
/* Electric outboard vs gas: running cost per hour and per season       */
/* ------------------------------------------------------------------ */

/** Cost of an hour at full throttle on a 1 kW electric outboard (ePropulsion Spirit 1.0 class), at the US average power price. */
export const ELECTRIC_HOUR_USD = (1 * FUEL_PRICES.electricCentsPerKwh) / 100;

/**
 * Cost of an hour at full throttle on Honda's 2.3 hp gas outboard, from Honda's
 * own figures: a 0.29 gal tank lasts up to 60 minutes at full throttle.
 */
export const GAS_HOUR_USD =
  (GAS_OUTBOARDS.hondaBf23.tankGal / GAS_OUTBOARDS.hondaBf23.fullThrottleHours) * FUEL_PRICES.gasUsdPerGal;

export function seasonFuel(hours: number) {
  return { electric: hours * ELECTRIC_HOUR_USD, gas: hours * GAS_HOUR_USD, saved: hours * (GAS_HOUR_USD - ELECTRIC_HOUR_USD) };
}

/** Dollars to fully charge a battery of this size at the US average power price. */
export const chargeCostUsd = (wh: number) => (wh / 1000) * (FUEL_PRICES.electricCentsPerKwh / 100);

/* ------------------------------------------------------------------ */
/* Fish finders                                                         */
/* ------------------------------------------------------------------ */

export interface Electronics {
  id: string;
  name: string;
  /** Typical or rated draw in amps at 12 V, as the maker publishes it. */
  amps: number;
  basis: string;
  url: string;
}

/** Fish finder and live sonar draws from the makers' manuals and spec sheets. */
export const ELECTRONICS: Electronics[] = [
  { id: "striker", name: "Garmin STRIKER (4 to 9 in)", amps: 1, basis: "rated current, Garmin manual", url: "https://www8.garmin.com/manuals/webhelp/striker/EN-US/GUID-D30135D2-E787-4F87-BBBE-C64FF7418A28.html" },
  { id: "hook-reveal-5", name: "Lowrance HOOK Reveal 5", amps: 0.9, basis: "at full backlight, Lowrance spec sheet", url: "https://www.gpscentral.ca/wp-content/uploads/Lowrance_HOOK_Reveal_5_specs.pdf" },
  { id: "helix-7", name: "Humminbird HELIX 7 MEGA DI/SI G4N", amps: 0.95, basis: "Humminbird HELIX manual", url: "https://johnsonoutdoors.widen.net/content/q8ds6x8zvr/pdf/532509-5EN_B-HELIX-Series-Operations-Manual.pdf" },
  { id: "echomap-7", name: "Garmin ECHOMAP UHD2 7x", amps: 1.1, basis: "typical draw, Garmin manual", url: "https://www8.garmin.com/manuals/webhelp/GUID-CDD85099-F5B6-41B4-84D1-524AE6475690/EN-US/GUID-75C00654-2AD5-442F-BAD0-46A65CB9652A.html" },
  { id: "helix-10", name: "Humminbird HELIX 10 MEGA DI+/SI+ G4N", amps: 2.7, basis: "Humminbird HELIX manual", url: "https://johnsonoutdoors.widen.net/content/q8ds6x8zvr/pdf/532509-5EN_B-HELIX-Series-Operations-Manual.pdf" },
  { id: "mega-live", name: "Humminbird MEGA Live (live sonar)", amps: 0.93, basis: "maximum, Humminbird install guide", url: "https://johnsonoutdoors.widen.net/content/fviuwe0vdb/pdf/532769-3EN_C-MEGA-Live-Installation-Guide.pdf" },
  { id: "livescope-plus", name: "Garmin LiveScope Plus (live sonar)", amps: 1.75, basis: "21 W typical, Garmin install guide (21 W / 12 V)", url: "https://www8.garmin.com/manuals/webhelp/GUID-B524FC8E-CB9A-4156-B565-59B23B4E0E6F/EN-US/Livescope_Plus_LVS34_Install_EN-US.pdf" },
];

export const electronicsById = (id: string) => {
  const e = ELECTRONICS.find((x) => x.id === id);
  if (!e) throw new Error(`Unknown electronics ${id}`);
  return e;
};

/** Hours a battery of this many watt-hours runs electronics drawing this many amps at 12 V. */
export const electronicsHours = (wh: number, amps: number) => (amps > 0 ? wh / (amps * 12) : 0);
