import { test } from "node:test";
import assert from "node:assert/strict";
import { STATES } from "../src/lib/energy";
import { LEAD_ACID_REF } from "../src/data/batteries";
import { FRIDGE_KWH_YEAR, LOADS, USABLE_FRACTION } from "../src/lib/everyday";
import {
  BATTERY_TYPES,
  CABIN_TIERS,
  ESSENTIALS,
  LINE_EXTENSION,
  LOAD_DEFS,
  OFFGRID_LINKS,
  OFFGRID_SOURCES,
  OFFGRID_START,
  OUTAGE_START,
  PANEL_WATTS,
  bestMonth,
  dailyWh,
  decemberPerKwDay,
  generatorPlan,
  installedEstimate,
  lineExtensionCost,
  lineWh,
  loadPercent,
  matchStations,
  medianDecember,
  offGridByState,
  offGridStates,
  outageBatteryWh,
  peakWatts,
  sizeOffGrid,
  solarWhPerDay,
  stationOptions,
  typicalWinterState,
  type StationOption,
} from "../src/lib/offgrid";

const close = (a: number, b: number, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);

test("December output is monthly total ÷ 31 and is the darkest month in every state", () => {
  assert.equal(STATES.length, 51);
  for (const s of STATES) {
    const dec = decemberPerKwDay(s);
    close(dec, s.solar.monthlyKwhPerKw[11] / 31);
    assert.ok(dec > 0 && dec < 6, `${s.abbr} December ${dec}`);
    assert.ok(bestMonth(s).perKwDay >= dec, s.abbr);
  }
  const ak = STATES.find((s) => s.abbr === "AK")!;
  close(decemberPerKwDay(ak), 7.1 / 31);
});

test("load maths follows DOE watts × hours and the EIA yearly figures", () => {
  close(lineWh({ id: "fridge", count: 1 }), (FRIDGE_KWH_YEAR * 1000) / 365);
  close(lineWh({ id: "freezer", count: 2 }), (2 * 570 * 1000) / 365);
  assert.equal(lineWh({ id: "led", count: 4, hours: 5 }), 4 * LOADS.ledW * 5);
  assert.equal(lineWh({ id: "well", count: 1, hours: 1.5 }), 1500);
  assert.equal(lineWh({ id: "router", count: 1, hours: 99 }), 240, "hours capped at 24");
  assert.equal(lineWh({ id: "cpap", count: -3 }), 0, "negative counts are zero");
  // The essentials day matches the site's existing definition.
  close(dailyWh(ESSENTIALS), (FRIDGE_KWH_YEAR * 1000) / 8760 * 24 + LOADS.routerW * 24 + 4 * LOADS.ledW * 5 + 2 * LOADS.phoneChargeWh, 1e-6);
  assert.ok(Math.abs(dailyWh(OFFGRID_START) - dailyWh(ESSENTIALS)) < 1e-9, "calculator starts on the essentials");
  assert.ok(Math.abs(dailyWh(OUTAGE_START) - dailyWh(ESSENTIALS)) < 1e-9, "outage list starts on the essentials");
  for (const d of LOAD_DEFS) assert.ok(d.source in OFFGRID_SOURCES, `${d.id} source`);
});

test("off-grid sizing: panels from December output, battery from days ÷ usable share", () => {
  const z = sizeOffGrid({ whPerDay: 3000, perKwDay: 2, days: 3, usable: 0.85 });
  assert.equal(z.panelW, 1500);
  assert.equal(z.panels, Math.ceil(1500 / PANEL_WATTS));
  close(z.batteryWh, 9000 / 0.85);
  const agm = sizeOffGrid({ whPerDay: 3000, perKwDay: 2, days: 3, usable: BATTERY_TYPES.agm.usable });
  close(agm.batteryWh, 18000);
  assert.equal(BATTERY_TYPES.lithium.usable, USABLE_FRACTION);
  assert.equal(BATTERY_TYPES.agm.usable, LEAD_ACID_REF.depthOfDischarge);
  const zero = sizeOffGrid({ whPerDay: 3000, perKwDay: 0 });
  assert.equal(zero.panelW, 0, "no NaN or Infinity when output is zero");
  for (const v of Object.values(sizeOffGrid({ whPerDay: NaN, perKwDay: 2 }))) assert.ok(Number.isFinite(v));
});

test("state table covers 50 states and DC, darkest December first, with finite sizes", () => {
  const rows = offGridByState(dailyWh(ESSENTIALS));
  assert.equal(rows.length, 51);
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i].perKwDay >= rows[i - 1].perKwDay);
  for (const r of rows) {
    assert.ok(Number.isFinite(r.size.panelW) && r.size.panelW > 0, r.s.abbr);
    assert.ok(Number.isFinite(r.size.batteryWh) && r.size.batteryWh > 0, r.s.abbr);
  }
  assert.equal(rows[0].s.abbr, "AK");
  const props = offGridStates();
  assert.equal(props.length, 51);
  assert.ok(props.every((p) => p.slug && p.city && p.dec > 0));
  const t = typicalWinterState();
  assert.ok(Math.abs(decemberPerKwDay(t) - medianDecember()) < 0.2);
});

test("peak output adds running watts and the single biggest motor start", () => {
  const p = peakWatts([
    { id: "well", count: 1 },
    { id: "furnace", count: 1 },
    { id: "led", count: 4 },
    { id: "freezer", count: 0 },
  ]);
  assert.equal(p.running, 1000 + 700 + 4 * LOADS.ledW);
  assert.equal(p.start, 2000);
  assert.equal(p.peak, p.running + 2000);
});

test("station matching respects capacity, add-ons, solar input and output", () => {
  const opts: StationOption[] = [
    { id: "a", name: "A", brand: "bluetti", capacityWh: 1000, addOnWh: 1000, addOnMax: 2, addOnUsd: 500, priceUsd: 800, solarInputW: 1000, acOutputW: 2000, surgeW: 4000, url: "https://x" },
    { id: "b", name: "B", brand: "ecoflow", capacityWh: 2000, addOnWh: null, addOnMax: 0, addOnUsd: null, priceUsd: 1500, solarInputW: 500, acOutputW: 2400, surgeW: null, url: "https://y" },
  ];
  const m = matchStations(opts, 2500);
  assert.equal(m.length, 1);
  assert.equal(m[0].option.id, "a");
  assert.equal(m[0].addOns, 2);
  assert.equal(m[0].totalUsd, 1800);
  assert.equal(matchStations(opts, 1800, { panelW: 800 })[0].option.id, "a");
  assert.equal(matchStations(opts, 1800, { runningW: 2200 })[0].option.id, "b");
  assert.equal(matchStations(opts, 5000).length, 0);
  // Real products: every DIY station with a price, and small cabins find a match.
  const real = stationOptions();
  assert.ok(real.length >= 10);
  const weekend = CABIN_TIERS.find((t) => t.id === "weekend")!;
  const tx = STATES.find((s) => s.abbr === "TX")!;
  const z = sizeOffGrid({ whPerDay: dailyWh(weekend.picks), perKwDay: decemberPerKwDay(tx) });
  assert.ok(matchStations(real, z.batteryWh, { panelW: z.panelW }).length >= 1);
});

test("outage, solar recharge and cost helpers", () => {
  close(outageBatteryWh(2000, 2), 4000 / USABLE_FRACTION);
  assert.equal(outageBatteryWh(-5, 2), 0);
  assert.equal(solarWhPerDay(400, 2.5), 1000);
  const c = lineExtensionCost(2);
  assert.deepEqual(c, { low: 2 * LINE_EXTENSION.lowPerMile, high: 2 * LINE_EXTENSION.highPerMile });
  assert.deepEqual(LINE_EXTENSION, { lowPerMile: 15000, highPerMile: 50000 });
  const e = installedEstimate(1000, 10_000);
  assert.ok(e.solar > 0 && e.battery > 0 && Math.abs(e.total - e.solar - e.battery) < 1e-9);
});

test("generator fuel comes only from the spec-sheet runtime the visitor enters", () => {
  const g = generatorPlan({ tankSize: 4, runtimeHours: 8, hoursPerDay: 12, days: 3 });
  assert.equal(g.perHour, 0.5);
  assert.equal(g.hours, 36);
  assert.equal(g.fuel, 18);
  assert.equal(g.perDay, 6);
  assert.equal(g.tanks, 5);
  const exact = generatorPlan({ tankSize: 1, runtimeHours: 6, hoursPerDay: 6, days: 2 });
  assert.equal(exact.tanks, 2);
  const none = generatorPlan({ tankSize: 0, runtimeHours: 0, hoursPerDay: 12, days: 3 });
  assert.deepEqual([none.perHour, none.fuel, none.tanks], [0, 0, 0]);
  assert.equal(generatorPlan({ tankSize: 1, runtimeHours: 1, hoursPerDay: 40, days: 1 }).hours, 24);
  assert.equal(loadPercent(1500, 3000), 50);
  assert.equal(loadPercent(1500, 0), 0);
});

test("sources are https or archived DOE pages, and related links cover the section", () => {
  for (const [k, s] of Object.entries(OFFGRID_SOURCES)) {
    assert.ok(/^https:\/\//.test(s.url) || s.url.startsWith("http://web.archive.org/"), `${k} url`);
    assert.ok(s.name.length > 5, `${k} name`);
  }
  const hrefs = OFFGRID_LINKS.map((l) => l.href);
  for (const p of ["/off-grid-solar-calculator", "/off-grid-cabin-solar-kit", "/how-to-go-off-grid", "/power-outage-backup-calculator", "/generator-runtime-calculator", "/emergency-water-storage-calculator", "/noaa-weather-radio"])
    assert.ok(hrefs.includes(p), p);
});
