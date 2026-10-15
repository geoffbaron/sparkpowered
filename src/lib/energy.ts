/**
 * State energy data and the arithmetic every page shares.
 *
 * All inputs come from src/data/state-energy.json, which is rebuilt from EIA,
 * AFDC, PVWatts and fueleconomy.gov by scripts/build_state_data.py. Pages must
 * not hard-code a price, rate or production figure — derive it here so the
 * numbers stay consistent everywhere they appear.
 */

import raw from "@/data/state-energy.json";

export interface StateEnergy {
  abbr: string;
  name: string;
  slug: string;
  electricity: {
    residentialCentsPerKwhYtd: number;
    residentialCentsPerKwhYtdPrevYear: number;
    residentialCentsPerKwhLatestMonth: number;
  };
  usage: {
    avgMonthlyKwh: number;
    avgMonthlyBillUsd: number;
    avgPriceCentsPerKwh: number;
    customers: number;
  };
  gasoline: { usdPerGallon: number; area: string; level: "state" | "region" | string };
  charging: { locations: number; ports: number; level1: number; level2: number; dcFast: number };
  solar: {
    placeholder?: boolean;
    city: string;
    kwhPerKwYear: number;
    monthlyKwhPerKw: number[];
    solarRadiationKwhM2Day: number;
  };
}

export interface ReferenceEv {
  key: "efficient" | "typical" | "large" | string;
  label: string;
  id: number;
  year: number;
  make: string;
  model: string;
  rangeMiles: number;
  kwhPer100mi: number;
}

export interface Source {
  name: string;
  url: string;
  period?: string;
  note?: string;
  assumptions?: string;
  weatherUrl?: string;
  retrieved: string;
  ytdLabel?: string;
  ytdPrevLabel?: string;
  monthLabel?: string;
}

interface EnergyData {
  generated: string;
  national: {
    residentialCentsPerKwhYtd: number;
    residentialCentsPerKwhYtdPrevYear: number;
    residentialCentsPerKwhLatestMonth: number;
    avgMonthlyKwh: number;
    avgMonthlyBillUsd: number;
    gasolineUsdPerGallon: number;
    gasMpg: number;
  };
  referenceEvs: ReferenceEv[];
  sources: Record<
    "electricityPrice" | "usage" | "gasoline" | "charging" | "solar" | "vehicles" | "gasMpg",
    Source
  >;
  states: StateEnergy[];
}

export const ENERGY = raw as EnergyData;
export const STATES: StateEnergy[] = ENERGY.states;
export const NATIONAL = ENERGY.national;
export const SOURCES = ENERGY.sources;
export const REFERENCE_EVS = ENERGY.referenceEvs;
export const DATA_UPDATED = ENERGY.generated;

/** Panel wattage assumed when converting system size to a panel count. */
export const PANEL_WATTS = 400;
/** Usable capacity of one Tesla Powerwall 3 (13.5 kWh, Tesla datasheet). */
export const POWERWALL_3_KWH = 13.5;
/** Miles per month used for the headline "monthly cost" figures. */
export const MONTHLY_MILES = 1000;

export function stateBySlug(slug: string) {
  return STATES.find((s) => s.slug === slug);
}

export function stateByAbbr(abbr: string) {
  return STATES.find((s) => s.abbr === abbr.toUpperCase());
}

/** $/kWh for a state (year-to-date average residential price). */
export function rateUsd(s: StateEnergy) {
  return s.electricity.residentialCentsPerKwhYtd / 100;
}

export const nationalRateUsd = () => NATIONAL.residentialCentsPerKwhYtd / 100;

/** Cost to drive 100 miles on electricity. */
export function evCostPer100(rateUsdPerKwh: number, kwhPer100mi: number) {
  return rateUsdPerKwh * kwhPer100mi;
}

/** Cost to drive 100 miles on gasoline. */
export function gasCostPer100(usdPerGallon: number, mpg = NATIONAL.gasMpg) {
  return (100 / mpg) * usdPerGallon;
}

export function referenceEv(key: string) {
  const ev = REFERENCE_EVS.find((e) => e.key === key);
  if (!ev) throw new Error(`Unknown reference EV ${key}`);
  return ev;
}

/** Full set of per-state charging figures used on the cost pages. */
export function chargingFigures(s: StateEnergy) {
  const rate = rateUsd(s);
  const typical = referenceEv("typical");
  const evPer100 = evCostPer100(rate, typical.kwhPer100mi);
  const gasPer100 = gasCostPer100(s.gasoline.usdPerGallon);
  return {
    rate,
    evPer100,
    gasPer100,
    evMonthly: (evPer100 * MONTHLY_MILES) / 100,
    gasMonthly: (gasPer100 * MONTHLY_MILES) / 100,
    savingMonthly: ((gasPer100 - evPer100) * MONTHLY_MILES) / 100,
    byVehicle: REFERENCE_EVS.map((ev) => ({
      ev,
      per100: evCostPer100(rate, ev.kwhPer100mi),
      monthly: (evCostPer100(rate, ev.kwhPer100mi) * MONTHLY_MILES) / 100,
    })),
  };
}

/** Solar sizing for the state's average household. */
export function solarFigures(s: StateEnergy, monthlyKwh = s.usage.avgMonthlyKwh) {
  const annualKwh = monthlyKwh * 12;
  const systemKw = annualKwh / s.solar.kwhPerKwYear;
  const panels = Math.ceil((systemKw * 1000) / PANEL_WATTS);
  const valuePerKwYear = s.solar.kwhPerKwYear * rateUsd(s);
  return {
    annualKwh,
    systemKw,
    panels,
    /** Bill value of one year of output from 1 kW, if every kWh offsets a kWh bought at the average rate. */
    valuePerKwYear,
    /** Installed price per watt at which the system pays for itself in N years under that same assumption. */
    breakEvenPerWatt: (years: number) => (valuePerKwYear * years) / 1000,
  };
}

/** Days of the state's average household use that one battery covers. */
export function batteryFigures(s: StateEnergy) {
  const dailyKwh = s.usage.avgMonthlyKwh / (365 / 12);
  return {
    dailyKwh,
    powerwallsForFullDay: dailyKwh / POWERWALL_3_KWH,
    hoursPerPowerwall: (POWERWALL_3_KWH / dailyKwh) * 24,
  };
}

/** 1 = highest value in the list. */
export function rankBy(fn: (s: StateEnergy) => number, s: StateEnergy) {
  const sorted = [...STATES].sort((a, b) => fn(b) - fn(a));
  return sorted.findIndex((x) => x.abbr === s.abbr) + 1;
}

export function ordinal(n: number) {
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix}`;
}

export const usd = (n: number, digits = 0) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const cents = (c: number) => `${c.toFixed(1)}¢`;

export const num = (n: number, digits = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** "January–July 2026"-style label for the EIA year-to-date window. */
export function ytdWindow() {
  const label = SOURCES.electricityPrice.ytdLabel ?? "";
  const m = /^(\w+) (\d{4}) YTD$/.exec(label);
  return m ? `January–${m[1]} ${m[2]}` : label;
}
