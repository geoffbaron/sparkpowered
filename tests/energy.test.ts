import { test } from "node:test";
import assert from "node:assert/strict";
import data from "../src/data/state-energy.json";
import {
  STATES,
  NATIONAL,
  batteryFigures,
  chargingFigures,
  evCostPer100,
  gasCostPer100,
  ordinal,
  solarFigures,
  stateBySlug,
} from "../src/lib/energy";

test("covers all 50 states and DC with unique slugs", () => {
  assert.equal(STATES.length, 51);
  assert.equal(new Set(STATES.map((s) => s.slug)).size, 51);
  assert.ok(stateBySlug("district-of-columbia"));
  assert.ok(stateBySlug("new-york"));
});

test("no placeholder solar data ships", () => {
  assert.ok(!JSON.stringify(data).includes("placeholder"), "rebuild state-energy.json without --dev");
});

test("every figure is present and in a plausible range", () => {
  for (const s of STATES) {
    const { residentialCentsPerKwhYtd: r } = s.electricity;
    assert.ok(r > 5 && r < 60, `${s.abbr} price ${r}`);
    assert.ok(s.usage.avgMonthlyKwh > 300 && s.usage.avgMonthlyKwh < 1500, `${s.abbr} usage`);
    assert.ok(s.gasoline.usdPerGallon > 2 && s.gasoline.usdPerGallon < 8, `${s.abbr} gas`);
    assert.ok(s.solar.kwhPerKwYear > 700 && s.solar.kwhPerKwYear < 2000, `${s.abbr} solar`);
    assert.equal(s.solar.monthlyKwhPerKw.length, 12);
    assert.ok(s.charging.ports > 0 && s.charging.dcFast > 0, `${s.abbr} chargers`);
  }
});

test("every data source is named, linked and dated", () => {
  for (const [key, src] of Object.entries(data.sources)) {
    assert.ok(src.name && src.url.startsWith("https://"), key);
    assert.match(src.retrieved, /^\d{4}-\d{2}-\d{2}$/, key);
  }
});

test("cost formulas", () => {
  assert.equal(evCostPer100(0.2, 30), 6);
  assert.ok(Math.abs(gasCostPer100(4, 25) - 16) < 1e-9);
  assert.equal(NATIONAL.gasMpg, 25.5);
  const tx = stateBySlug("texas")!;
  const c = chargingFigures(tx);
  assert.ok(Math.abs(c.evMonthly - c.evPer100 * 10) < 1e-9);
  assert.ok(c.gasPer100 > c.evPer100);
});

test("solar and battery sizing", () => {
  const az = stateBySlug("arizona")!;
  const f = solarFigures(az, 1000);
  assert.ok(Math.abs(f.systemKw - 12000 / az.solar.kwhPerKwYear) < 1e-9);
  assert.equal(f.panels, Math.ceil((f.systemKw * 1000) / 400));
  assert.ok(Math.abs(f.breakEvenPerWatt(10) - (f.valuePerKwYear * 10) / 1000) < 1e-9);
  const b = batteryFigures(az);
  assert.ok(Math.abs(b.hoursPerPowerwall - (13.5 / b.dailyKwh) * 24) < 1e-9);
});

test("ordinal suffixes", () => {
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 51].map(ordinal), ["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "51st"]);
});
