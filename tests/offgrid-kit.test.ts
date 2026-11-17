import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AFFILIATES } from "../src/data/affiliates";
import { PRODUCTS, SOLAR_PANELS } from "../src/data/products";
import { STATES } from "../src/lib/energy";
import { dailyWh, decemberPerKwDay, generatorPlan, sizeOffGrid, solarWhPerDay } from "../src/lib/offgrid";
import { GOAL_DAYS, foodNeeded, waterNeeded } from "../src/lib/prep";
import {
  EXAMPLE_GENERATOR,
  HOME_PRESETS,
  KIT_BATTERY_DAYS,
  KIT_DAYS,
  buildKit,
  homePreset,
  kitPicks,
  kitStations,
  presetKits,
} from "../src/lib/offgrid-kit";
import { ROUTES } from "../src/lib/seo";

const decs = STATES.map((s) => ({ s, d: decemberPerKwDay(s) })).sort((a, b) => a.d - b.d);
const darkest = decs[0];
const sunniest = decs[decs.length - 1];

test("every preset in every state gets an in-stock, tracked, priced power package", () => {
  for (const { s, d } of decs) {
    for (const k of presetKits(d)) {
      assert.ok(k.power, `${k.home.id} in ${s.name} has no station`);
      const p = PRODUCTS.find((x) => x.id === k.power!.match.option.id)!;
      assert.ok(AFFILIATES[p.brand].tracked, `${p.id} is not a tracked brand`);
      assert.notEqual(p.brand, "naturesgenerator");
      assert.ok(!p.soldOut && p.priceUsd != null, `${p.id} sold out or unpriced`);
      if (k.power!.match.addOns > 0) assert.ok(p.addOn && !p.addOn.soldOut && p.addOn.priceUsd != null, `${p.id} add-on unavailable`);
      assert.equal(k.power!.panel.brand, p.brand, "panels come from the station's maker");
      assert.ok(!k.power!.panel.soldOut);
      assert.ok(k.power!.panels >= 1);
      assert.ok(k.power!.panelW <= (p.solarInputW ?? 0), `${p.id} panels over its solar input`);
      assert.ok(p.acOutputW >= k.runningW, `${p.id} cannot run everything at once`);
    }
  }
});

test("package totals add up from the dated prices", () => {
  for (const k of presetKits(decemberPerKwDay(STATES[0]))) {
    const p = PRODUCTS.find((x) => x.id === k.power!.match.option.id)!;
    const sum = p.priceUsd! + k.power!.match.addOns * (p.addOn?.priceUsd ?? 0) + k.power!.panels * k.power!.panel.priceUsd;
    assert.ok(Math.abs(sum - k.power!.priceUsd) < 0.01, `${k.home.id}: ${sum} vs ${k.power!.priceUsd}`);
    assert.equal(k.power!.match.totalWh, p.capacityWh + k.power!.match.addOns * (p.addOn?.capacityWh ?? 0));
  }
});

test("sizing reuses the shared formulas", () => {
  const d = decemberPerKwDay(STATES[5]);
  for (const h of HOME_PRESETS) {
    const k = buildKit({ home: h.id, loads: h.loads, perKwDay: d });
    assert.equal(k.whPerDay, dailyWh(kitPicks(h, h.loads)));
    assert.deepEqual(k.size, sizeOffGrid({ whPerDay: k.whPerDay, perKwDay: d, days: KIT_BATTERY_DAYS }));
    assert.equal(k.power!.solarWhDay, solarWhPerDay(k.power!.panelW, d));
    assert.equal(k.shortfallWhDay, Math.max(0, k.whPerDay - k.power!.solarWhDay));
    const fuel =
      generatorPlan({ tankSize: EXAMPLE_GENERATOR.tankGal, runtimeHours: EXAMPLE_GENERATOR.runtimeHours, hoursPerDay: k.shortfallWhDay / EXAMPLE_GENERATOR.ratedW, days: KIT_DAYS - k.generator.darkDays }).fuel +
      generatorPlan({ tankSize: EXAMPLE_GENERATOR.tankGal, runtimeHours: EXAMPLE_GENERATOR.runtimeHours, hoursPerDay: k.whPerDay / EXAMPLE_GENERATOR.ratedW, days: k.generator.darkDays }).fuel;
    assert.ok(Math.abs(fuel - k.generator.gallons) < 1e-9);
    assert.equal(k.water.storeGallons, waterNeeded({ people: h.people.length, days: GOAL_DAYS }).total);
    assert.equal(k.water.storeGallons + k.water.treatGallons, waterNeeded({ people: h.people.length, days: KIT_DAYS }).total);
    assert.equal(k.food.total, foodNeeded(h.people, KIT_DAYS, "moderate").total);
  }
});

test("bigger homes need more", () => {
  const [s, m, l] = presetKits(decemberPerKwDay(STATES[0]));
  assert.ok(s.whPerDay < m.whPerDay && m.whPerDay < l.whPerDay);
  assert.ok(s.food.total < m.food.total && m.food.total < l.food.total);
  assert.ok(s.water.storeGallons < m.water.storeGallons && m.water.storeGallons < l.water.storeGallons);
});

test("well pump: 240 V picks a 120/240 V station and flags the start honestly", () => {
  const k = buildKit({ home: "large", loads: homePreset("large").loads, perKwDay: sunniest.d });
  assert.ok(k.well240);
  const p = PRODUCTS.find((x) => x.id === k.power!.match.option.id)!;
  assert.equal(p.volts, "120/240V");
  assert.ok(k.notes.includes("well-240v"));
  assert.ok(k.wellStart === "runs" || k.notes.includes("well-soft-start"), "an uncovered start must say soft starter");
  // A 120 V pump can use any station.
  const k120 = buildKit({ home: "large", loads: homePreset("large").loads, perKwDay: sunniest.d, well240: false });
  assert.ok(!k120.notes.includes("well-240v"));
});

test("cloudy winter states say solar alone will not keep up and carry generator fuel", () => {
  for (const k of presetKits(darkest.d)) {
    assert.ok(k.notes.includes("cloudy-winter"), `${k.home.id} in ${darkest.s.name}`);
    assert.ok(k.shortfallWhDay > 0 && k.generator.gallons > 0);
  }
  // Even a sunny state carries fuel for storm days.
  for (const k of presetKits(sunniest.d)) assert.ok(k.generator.gallons > 0);
  // No storm days and full December solar: fuel only for the panels' shortfall.
  const sm = buildKit({ home: "small", loads: homePreset("small").loads, perKwDay: sunniest.d, darkDays: 0 });
  if (sm.shortfallWhDay === 0) assert.equal(sm.generator.gallons, 0);
});

test("the page states the essentials-only limits and has its route", () => {
  const src = readFileSync("src/components/offgrid/KitNotes.tsx", "utf8");
  for (const s of ["central air conditioning", "electric", "range", "dryer", "Solar alone will not keep up", "soft starter", "licensed"]) assert.ok(src.includes(s), s);
  assert.ok(ROUTES.some((r) => r.path === "/off-grid-kit"));
  assert.match(readFileSync("public/llms.txt", "utf8"), /sparkpowered\.com\/off-grid-kit\)/);
  const page = readFileSync("src/app/off-grid-kit/page.tsx", "utf8");
  assert.doesNotMatch(page.replace(/\$\{/g, ""), /\$\d/, "no hard-coded prices in the page");
});

test("kit stations and panels are dated and tracked", () => {
  assert.ok(kitStations().length > 0);
  for (const s of SOLAR_PANELS) {
    assert.ok(AFFILIATES[s.brand].tracked);
    assert.match(s.retrieved, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(s.priceUsd > 0 && s.watts > 0);
    if (s.listPriceUsd != null) assert.ok(s.listPriceUsd >= s.priceUsd);
  }
});
