/**
 * The arithmetic and the decision rules behind /ev-or-plug-in-hybrid.
 *
 * Plain values and pure functions only, so the client picker and the server
 * page (and the tests) share exactly one copy. No prices live here: the
 * electricity and gasoline prices come in from src/lib/energy.ts through
 * src/lib/ev-or-phev-data.ts. The only figures in this file are the sourced
 * constants below (fast-charging price, cold-weather range, ICCT real-world
 * share), each with its URL and the date we read it, and the tool's own
 * assumptions, which the page lists under "How we decide".
 */

export interface Sourced {
  label: string;
  url: string;
  /** Date we read the figure (YYYY-MM-DD). */
  retrieved: string;
}

/** Public DC fast charging, national average price per kWh. */
export const DC_FAST = {
  usdPerKwh: 0.54,
  label: "Paren, State of the Industry Report: US EV Fast Charging, Q3 2026 (Oct 13, 2026)",
  url: "https://www.paren.app/reports/us-ev-fast-charging-q3-2026",
  retrieved: "2026-10-30",
  note: "National average DC fast-charging price of $0.540 per kWh for Q3 2026, excluding free chargers. Tesla Supercharger members paid less ($0.396).",
} as const;

/**
 * Share of normal range an EV keeps in the cold, from real-world data on
 * 30,000+ cars: 78% at 32°F and 70% at 20°F (Recurrent, Nov 19, 2025).
 */
export const COLD = {
  at32F: 0.78,
  at20F: 0.7,
  label: "Recurrent, winter EV range study of 30,000+ cars (Nov 19, 2025)",
  url: "https://www.recurrentauto.com/research/winter-ev-range-loss",
  retrieved: "2026-10-30",
} as const;

/** The cold adjustment covers December to February, the NOAA winter window. */
export const WINTER_MONTHS = 3;

/** ICCT's US study of real-world PHEV use (California BAR and Fuelly data). */
export const ICCT_PHEV = {
  lessElectricMin: 26,
  lessElectricMax: 56,
  moreGasMin: 42,
  moreGasMax: 67,
  vehicles: 1465,
  label: "ICCT, Real-world usage of plug-in hybrid vehicles in the United States (fact sheet, Dec 2022)",
  url: "https://theicct.org/wp-content/uploads/2022/12/fs-real-world-phev-us-dec22.pdf",
  retrieved: "2026-10-30",
} as const;

export type Charging = "home" | "work" | "rarely";

/**
 * Tool assumptions (not measured facts). Shown on the page in plain words.
 * - plug-in days: home = every day, work = 5 workdays of 7, rarely = never.
 * - work charging is priced at the state's home rate (many workplaces charge
 *   less or nothing, some charge more).
 * - a trip "needs a fast-charging stop" when one leg is longer than 80% of
 *   the EV's EPA range (arriving with a 20% buffer).
 * - "frequent" long trips means 12 or more a year (about once a month).
 * - a PHEV "can't cover your day" when the day is more than 1.25 times its
 *   electric range (the battery covers under 80% of the day's miles).
 */
export const RULES = {
  plugInDays: { home: 7 / 7, work: 5 / 7, rarely: 0 } as Record<Charging, number>,
  tripBuffer: 0.8,
  frequentTrips: 12,
  dailyOverRange: 1.25,
} as const;

export interface PickerState {
  abbr: string;
  name: string;
  centsPerKwh: number;
  gasUsd: number;
  /** NOAA 1991-2020 normal December-February average, or null where NOAA has none. */
  winterTempF: number | null;
}

export interface PickerPhev {
  id: number;
  make: string;
  /** Model year and model, without the make. */
  model: string;
  label: string;
  electricRangeMiles: number;
  kwhPer100mi: number;
  gasMpg: number;
  /** Share of miles the EPA label assumes are electric (utility factor). */
  labelElectricShare: number;
  premium: boolean;
}

export interface PickerEv {
  id: number;
  make: string;
  model: string;
  label: string;
  kwhPer100mi: number;
  rangeMiles: number;
}

export interface Answers {
  dailyMiles: number;
  charging: Charging;
  tripsPerYear: number;
  /** One-way length of a typical road trip, miles. */
  tripMiles: number;
  tows: boolean;
}

export interface Prices {
  /** Home (and workplace) electricity, cents per kWh. */
  centsPerKwh: number;
  gasUsd: number;
  /** mpg of the average gas car we compare with. */
  gasCarMpg: number;
  winterTempF: number | null;
}

/** Share of normal range kept in winter for a state's December-February normal. */
export function winterRetention(winterTempF: number | null) {
  if (winterTempF == null) return 1;
  if (winterTempF <= 20) return COLD.at20F;
  if (winterTempF <= 32) return COLD.at32F;
  return 1;
}

const DAYS = 365;
const seasons = (ret: number) => [
  { share: (12 - WINTER_MONTHS) / 12, ret: 1 },
  { share: WINTER_MONTHS / 12, ret },
];

export function yearlyMiles(a: Answers) {
  const daily = Math.max(0, a.dailyMiles) * DAYS;
  const trips = Math.max(0, a.tripsPerYear) * Math.max(0, a.tripMiles) * 2;
  return { daily, trips, total: daily + trips };
}

/**
 * Plug-in hybrid: each day, the battery covers min(day, electric range) on the
 * days it was plugged in; the rest of the day, and every road-trip mile, runs
 * on gasoline. In winter the range shrinks and each electric mile takes more
 * energy, both by the cold retention factor.
 */
export function phevYear(car: PickerPhev, a: Answers, p: Prices) {
  const m = yearlyMiles(a);
  const plug = RULES.plugInDays[a.charging];
  const day = Math.max(0, a.dailyMiles);
  let eMiles = 0;
  let kwh = 0;
  for (const s of seasons(winterRetention(p.winterTempF))) {
    const perDay = Math.min(day, car.electricRangeMiles * s.ret) * plug;
    const miles = perDay * DAYS * s.share;
    eMiles += miles;
    kwh += (miles * car.kwhPer100mi) / 100 / s.ret;
  }
  const gasMiles = m.total - eMiles;
  const electricUsd = (kwh * p.centsPerKwh) / 100;
  const gasUsd = (gasMiles / car.gasMpg) * p.gasUsd;
  return {
    miles: m.total,
    electricMiles: eMiles,
    gasMiles,
    electricShare: m.total > 0 ? eMiles / m.total : 0,
    /** Share of the everyday (non-trip) miles on electricity. */
    dailyElectricShare: m.daily > 0 ? eMiles / m.daily : 0,
    kwh,
    gallons: gasMiles / car.gasMpg,
    electricUsd,
    gasUsd,
    totalUsd: electricUsd + gasUsd,
  };
}

/**
 * Electric car: everyday miles at the home (or work) rate, or at the public
 * fast-charging price when there is nowhere to plug in regularly; road-trip
 * miles at the fast-charging price. Winter miles take more energy by the cold
 * retention factor.
 */
export function evYear(car: PickerEv, a: Answers, p: Prices) {
  const m = yearlyMiles(a);
  const ret = winterRetention(p.winterTempF);
  const per100 = seasons(ret).reduce((s, x) => s + (x.share * car.kwhPer100mi) / x.ret, 0);
  const dailyKwh = (m.daily * per100) / 100;
  const tripKwh = (m.trips * per100) / 100;
  const dailyRate = a.charging === "rarely" ? DC_FAST.usdPerKwh : p.centsPerKwh / 100;
  const dailyUsd = dailyKwh * dailyRate;
  const tripUsd = tripKwh * DC_FAST.usdPerKwh;
  return {
    miles: m.total,
    kwh: dailyKwh + tripKwh,
    dailyUsd,
    tripUsd,
    fastChargeShare: m.total > 0 ? ((a.charging === "rarely" ? m.daily : 0) + m.trips) / m.total : 0,
    totalUsd: dailyUsd + tripUsd,
  };
}

/** Average new gasoline car for the same miles. */
export function gasCarYear(a: Answers, p: Prices) {
  const m = yearlyMiles(a);
  const gallons = m.total / p.gasCarMpg;
  return { miles: m.total, gallons, totalUsd: gallons * p.gasUsd };
}

export type VerdictKind = "ev" | "phev" | "hybrid";

export interface Verdict {
  kind: VerdictKind;
  /** Which rule fired, for tests and for the "How we decide" list. */
  rule: "no-charging" | "tows" | "long-days" | "long-trips" | "default";
  headline: string;
  reasons: string[];
}

export const VERDICT_LABEL: Record<VerdictKind, string> = {
  ev: "An electric car",
  phev: "A plug-in hybrid",
  hybrid: "A regular hybrid, or wait until you can plug in",
};

const round = (n: number) => Math.round(n).toLocaleString("en-US");
const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** Whether one leg of the typical trip is past the EV's range with the buffer. */
export function tripNeedsStop(ev: PickerEv, a: Answers) {
  return a.tripMiles > ev.rangeMiles * RULES.tripBuffer;
}

/**
 * The rules, in order; the first that applies decides.
 *  1. Nowhere to plug in regularly: a regular hybrid (or wait).
 *  2. Tows a trailer or camper: a plug-in hybrid.
 *  3. A usual day well past the PHEV's electric range: an EV.
 *  4. Frequent road trips longer than the EV goes on a charge: a plug-in hybrid.
 *  5. Otherwise: an EV.
 */
export function decide(ev: PickerEv, phev: PickerPhev, a: Answers, p: Prices): Verdict {
  const e = evYear(ev, a, p);
  const h = phevYear(phev, a, p);
  const g = gasCarYear(a, p);
  const v = (kind: VerdictKind, rule: Verdict["rule"], reasons: string[]): Verdict => ({
    kind,
    rule,
    headline: VERDICT_LABEL[kind],
    reasons,
  });

  if (a.charging === "rarely") {
    return v("hybrid", "no-charging", [
      "Without a place to plug in, a plug-in hybrid runs almost entirely on gasoline, so you'd pay for a battery you rarely use.",
      `An electric car would live on public fast chargers at about $${DC_FAST.usdPerKwh.toFixed(2)} per kWh: about ${money(e.totalUsd)} a year for your miles, against ${money(g.totalUsd)} in an average gas car. Home or work charging is what makes an EV cheap.`,
    ]);
  }
  if (a.tows) {
    return v("phev", "tows", [
      "Towing takes far more energy than normal driving, so an electric car's range drops sharply and you'd stop to charge much more often. A gas engine handles towing days without planning around chargers.",
      `You can still drive your ${round(a.dailyMiles)}-mile days on electricity in a plug-in hybrid. Check the tow rating of any model before you buy.`,
    ]);
  }
  if (a.dailyMiles > phev.electricRangeMiles * RULES.dailyOverRange) {
    return v("ev", "long-days", [
      `Your ${round(a.dailyMiles)}-mile day is well past the ${phev.label}'s ${phev.electricRangeMiles} miles of electric range, so it would burn gasoline every day: only ${Math.round(h.electricShare * 100)}% of its miles would be electric.`,
      `The ${ev.label} covers the whole day on one charge (EPA range ${ev.rangeMiles} miles), for about ${money(e.totalUsd)} a year against ${money(h.totalUsd)} for the plug-in hybrid.`,
    ]);
  }
  if (a.tripsPerYear >= RULES.frequentTrips && tripNeedsStop(ev, a)) {
    return v("phev", "long-trips", [
      `You take ${round(a.tripsPerYear)} road trips a year of about ${round(a.tripMiles)} miles each way, more than the ${ev.label} can go on one charge with a safety margin, so most trips need fast-charging stops.`,
      `A plug-in hybrid still covers ${Math.round(h.dailyElectricShare * 100)}% of your everyday driving on electricity and fills up with gas in minutes on the road.`,
    ]);
  }
  const reasons = [
    a.charging === "home"
      ? `Your ${round(a.dailyMiles)}-mile day fits easily in the ${ev.label}'s ${ev.rangeMiles}-mile range, charged at home overnight.`
      : `Your ${round(a.dailyMiles)}-mile day fits easily in the ${ev.label}'s ${ev.rangeMiles}-mile range, so charging on workdays covers the weekend too.`,
  ];
  if (e.totalUsd <= h.totalUsd) {
    reasons.push(`It costs about ${money(e.totalUsd)} a year to run, against ${money(h.totalUsd)} for the plug-in hybrid and ${money(g.totalUsd)} for an average gas car.`);
  } else {
    reasons.push(
      `Running costs are close: about ${money(e.totalUsd)} a year against ${money(h.totalUsd)} for the plug-in hybrid, because your road trips would be on fast chargers. On every normal day you'd still leave home full and skip the gas station.`,
    );
  }
  return v("ev", "default", reasons);
}
