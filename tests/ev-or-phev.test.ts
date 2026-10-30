import { test } from "node:test";
import assert from "node:assert/strict";
import phevFile from "../src/data/epa-phevs.json";
import winterFile from "../src/data/state-winter-temps.json";
import {
  COLD,
  DC_FAST,
  ICCT_PHEV,
  RULES,
  decide,
  evYear,
  gasCarYear,
  phevYear,
  winterRetention,
  type Answers,
  type PickerEv,
  type PickerPhev,
  type Prices,
} from "../src/lib/ev-or-phev";
import { DEFAULT_PHEV_ID, PICKER_PHEVS, PICKER_STATES, PICKER_US } from "../src/lib/ev-or-phev-data";
import { CALC_EVS, DEFAULT_EV_ID } from "../src/lib/calculator-data";
import { ROUTES } from "../src/lib/seo";
import { NAV_GROUPS } from "../src/lib/nav";

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && Date.parse(s) <= Date.now();

const phev: PickerPhev = {
  id: 1, make: "Test", model: "2026 PHEV", label: "2026 Test PHEV",
  electricRangeMiles: 40, kwhPer100mi: 35, gasMpg: 40, labelElectricShare: 0.69, premium: false,
};
const ev: PickerEv = { id: 2, make: "Test", model: "2026 EV", label: "2026 Test EV", kwhPer100mi: 30, rangeMiles: 300 };
const warm: Prices = { centsPerKwh: 20, gasUsd: 3.5, gasCarMpg: 25.5, winterTempF: 50 };
const base: Answers = { dailyMiles: 30, charging: "home", tripsPerYear: 4, tripMiles: 200, tows: false };

test("every source is linked and dated", () => {
  for (const s of [DC_FAST, COLD, ICCT_PHEV, phevFile.source, winterFile.source]) {
    assert.match(s.url, /^https:\/\//, s.url);
    assert.ok(isDate(s.retrieved), `${s.url} retrieved`);
  }
  assert.ok(DC_FAST.usdPerKwh > 0.3 && DC_FAST.usdPerKwh < 0.9);
});

test("PHEV data is modest, plausible and has the typical default", () => {
  assert.ok(PICKER_PHEVS.length >= 20 && PICKER_PHEVS.length < 150);
  assert.ok(JSON.stringify(phevFile).length < 40_000, "keep epa-phevs.json small");
  for (const p of PICKER_PHEVS) {
    assert.ok(p.electricRangeMiles >= 15 && p.electricRangeMiles < 120, p.label);
    assert.ok(p.kwhPer100mi > 20 && p.kwhPer100mi < 90, p.label);
    assert.ok(p.gasMpg >= 10 && p.gasMpg < 70, p.label);
    assert.ok(p.labelElectricShare > 0.3 && p.labelElectricShare < 0.95, p.label);
  }
  assert.equal(new Set(PICKER_PHEVS.map((p) => p.id)).size, PICKER_PHEVS.length);
  const def = PICKER_PHEVS.find((p) => p.id === DEFAULT_PHEV_ID);
  assert.ok(def && /RAV4/.test(def.label));
  assert.ok(CALC_EVS.some((e) => e.id === DEFAULT_EV_ID));
});

test("winter temperatures cover every state but Hawaii and are plausible", () => {
  for (const s of PICKER_STATES) {
    if (s.abbr === "HI") assert.equal(s.winterTempF, null);
    else assert.ok(s.winterTempF != null && s.winterTempF > -10 && s.winterTempF < 70, s.abbr);
  }
  assert.equal(PICKER_US.winterTempF, null);
});

test("cold adjustment only applies to cold states", () => {
  assert.equal(winterRetention(null), 1);
  assert.equal(winterRetention(45), 1);
  assert.equal(winterRetention(32), COLD.at32F);
  assert.equal(winterRetention(25), COLD.at32F);
  assert.equal(winterRetention(13), COLD.at20F);
  const mn = PICKER_STATES.find((s) => s.abbr === "MN")!;
  const fl = PICKER_STATES.find((s) => s.abbr === "FL")!;
  assert.equal(winterRetention(mn.winterTempF), COLD.at20F);
  assert.equal(winterRetention(fl.winterTempF), 1);
});

test("PHEV electric share matches hand arithmetic", () => {
  // 30-mile day fits the 40-mile range: every everyday mile is electric.
  const r = phevYear(phev, base, warm);
  const daily = 30 * 365;
  const trips = 4 * 200 * 2;
  assert.equal(r.miles, daily + trips);
  assert.ok(Math.abs(r.electricMiles - daily) < 1e-6);
  assert.ok(Math.abs(r.electricShare - daily / (daily + trips)) < 1e-9);
  const usd = (daily * 0.35 * 0.2) + (trips / 40) * 3.5;
  assert.ok(Math.abs(r.totalUsd - usd) < 1e-6);

  // 60-mile day: only 40 per day on the battery.
  const long = phevYear(phev, { ...base, dailyMiles: 60, tripsPerYear: 0 }, warm);
  assert.ok(Math.abs(long.electricShare - 40 / 60) < 1e-9);

  // Work-only charging: 5 days in 7.
  const work = phevYear(phev, { ...base, charging: "work", tripsPerYear: 0 }, warm);
  assert.ok(Math.abs(work.electricShare - RULES.plugInDays.work) < 1e-9);

  // Never plugged in: all gasoline.
  const none = phevYear(phev, { ...base, charging: "rarely" }, warm);
  assert.equal(none.electricMiles, 0);
  assert.ok(Math.abs(none.totalUsd - ((daily + trips) / 40) * 3.5) < 1e-6);
});

test("cold winters cut PHEV electric miles and raise EV energy", () => {
  const cold = { ...warm, winterTempF: 15 };
  const a = { ...base, dailyMiles: 40, tripsPerYear: 0 };
  const w = phevYear(phev, a, warm);
  const c = phevYear(phev, a, cold);
  // Dec-Feb: 40 * 0.70 = 28 electric miles of 40.
  const expected = (40 * 365 * 9) / 12 + (28 * 365 * 3) / 12;
  assert.ok(Math.abs(c.electricMiles - expected) < 1e-6);
  assert.ok(c.electricShare < w.electricShare);
  assert.ok(evYear(ev, a, cold).kwh > evYear(ev, a, warm).kwh);
});

test("EV prices home miles at the home rate and trips at fast charging", () => {
  const r = evYear(ev, base, warm);
  const daily = 30 * 365;
  const trips = 4 * 400;
  assert.ok(Math.abs(r.dailyUsd - daily * 0.3 * 0.2) < 1e-6);
  assert.ok(Math.abs(r.tripUsd - trips * 0.3 * DC_FAST.usdPerKwh) < 1e-6);
  const street = evYear(ev, { ...base, charging: "rarely" }, warm);
  assert.ok(Math.abs(street.dailyUsd - daily * 0.3 * DC_FAST.usdPerKwh) < 1e-6);
  const g = gasCarYear(base, warm);
  assert.ok(Math.abs(g.totalUsd - ((daily + trips) / 25.5) * 3.5) < 1e-6);
});

test("verdict rules fire in order", () => {
  assert.equal(decide(ev, phev, base, warm).rule, "default");
  assert.equal(decide(ev, phev, base, warm).kind, "ev");
  const none = decide(ev, phev, { ...base, charging: "rarely", tows: true }, warm);
  assert.equal(none.rule, "no-charging");
  assert.equal(none.kind, "hybrid");
  assert.equal(decide(ev, phev, { ...base, tows: true }, warm).kind, "phev");
  const longDay = decide(ev, phev, { ...base, dailyMiles: 80, tripsPerYear: 20, tripMiles: 400 }, warm);
  assert.equal(longDay.rule, "long-days");
  assert.equal(longDay.kind, "ev");
  // 50 miles is within 1.25 x 40: not a "long day".
  assert.notEqual(decide(ev, phev, { ...base, dailyMiles: 50 }, warm).rule, "long-days");
  const trips = decide(ev, phev, { ...base, tripsPerYear: 12, tripMiles: 300 }, warm);
  assert.equal(trips.rule, "long-trips");
  assert.equal(trips.kind, "phev");
  // Short trips, however many, don't need a stop.
  assert.equal(decide(ev, phev, { ...base, tripsPerYear: 30, tripMiles: 200 }, warm).kind, "ev");
  for (const v of [none, longDay, trips]) {
    assert.ok(v.reasons.length >= 1 && v.reasons.length <= 2);
    for (const x of v.reasons) assert.doesNotMatch(x, /NaN|undefined|Infinity/);
  }
});

test("every state gives finite results with the default cars", () => {
  const e = CALC_EVS.find((x) => x.id === DEFAULT_EV_ID)!;
  const p = PICKER_PHEVS.find((x) => x.id === DEFAULT_PHEV_ID)!;
  for (const s of [...PICKER_STATES, PICKER_US]) {
    const prices = { centsPerKwh: s.centsPerKwh, gasUsd: s.gasUsd, gasCarMpg: 25.5, winterTempF: s.winterTempF };
    const ph = phevYear(p, base, prices);
    const ey = evYear(e, base, prices);
    assert.ok(Number.isFinite(ph.totalUsd) && ph.totalUsd > 0, s.abbr);
    assert.ok(Number.isFinite(ey.totalUsd) && ey.totalUsd > 0, s.abbr);
    assert.ok(ey.totalUsd < gasCarYear(base, prices).totalUsd, `${s.abbr}: home-charged EV beats gas`);
  }
});

test("page is in the sitemap and the nav", () => {
  assert.ok(ROUTES.some((r) => r.path === "/ev-or-plug-in-hybrid"));
  const cars = NAV_GROUPS.find((g) => g.id === "cars")!;
  assert.ok(cars.links.some((l) => l.href === "/ev-or-plug-in-hybrid"));
});
