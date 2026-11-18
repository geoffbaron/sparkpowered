import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AFFILIATES, partnerUrl } from "../src/data/affiliates";
import { OFFGRID_SYSTEMS, PRODUCTS, SOLAR_PANELS } from "../src/data/products";
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
  kitSystems,
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
      if (k.power!.system) {
        const sys = k.power!.system;
        assert.ok(AFFILIATES[sys.brand].tracked && !sys.soldOut, `${sys.id} untracked or sold out`);
        assert.equal(k.power!.panel, null, "a system's panels are in its box");
        assert.equal(k.power!.panelW, sys.panel.count * sys.panel.watts);
        assert.ok(k.power!.panelW <= sys.solarInputW);
        assert.ok(sys.acOutputW >= k.runningW, `${sys.id} cannot run everything at once`);
        assert.ok(k.power!.match.totalWh >= k.size.batteryWh, "a system holds the full battery size");
        assert.ok(k.notes.includes("system-install"));
        continue;
      }
      const p = PRODUCTS.find((x) => x.id === k.power!.match.option.id)!;
      assert.ok(AFFILIATES[p.brand].tracked, `${p.id} is not a tracked brand`);
      assert.notEqual(p.brand, "naturesgenerator");
      assert.ok(!p.soldOut && p.priceUsd != null, `${p.id} sold out or unpriced`);
      if (k.power!.match.addOns > 0) assert.ok(p.addOn && !p.addOn.soldOut && p.addOn.priceUsd != null, `${p.id} add-on unavailable`);
      assert.equal(k.power!.panel!.brand, p.brand, "panels come from the station's maker");
      assert.ok(!k.power!.panel!.soldOut);
      assert.ok(k.power!.panels >= 1);
      assert.ok(k.power!.panelW <= (p.solarInputW ?? 0), `${p.id} panels over its solar input`);
      assert.ok(p.acOutputW >= k.runningW, `${p.id} cannot run everything at once`);
    }
  }
});

test("package totals add up from the dated prices", () => {
  for (const k of presetKits(decemberPerKwDay(STATES[0]))) {
    const sys = k.power!.system;
    if (sys) {
      const sum = sys.priceUsd + k.power!.match.addOns * sys.addOn.priceUsd!;
      assert.ok(Math.abs(sum - k.power!.priceUsd) < 0.01, `${k.home.id}: ${sum} vs ${k.power!.priceUsd}`);
      assert.equal(k.power!.match.totalWh, sys.capacityWh + k.power!.match.addOns * sys.addOn.capacityWh);
      continue;
    }
    const p = PRODUCTS.find((x) => x.id === k.power!.match.option.id)!;
    const sum = p.priceUsd! + k.power!.match.addOns * (p.addOn?.priceUsd ?? 0) + k.power!.panels * k.power!.panel!.priceUsd;
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
  const volts = k.power!.system?.volts ?? PRODUCTS.find((x) => x.id === k.power!.match.option.id)!.volts;
  assert.equal(volts, "120/240V");
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

/* ------------------------------------------------------------------ */
/* Survival supplies: food, stove fuel, bleach, garden                  */
/* ------------------------------------------------------------------ */

import { BULK_TANK_LB, COOK_MINUTES_PER_PERSON, CROPS, DROPS_PER_TSP, EXAMPLE_STOVE, STAPLES, bleachFor, cookingPlan, gardenFor, staplesFor } from "../src/lib/survival-kit";

test("staples hold exactly the household's calories, from USDA calories per 100 g", () => {
  assert.ok(Math.abs(STAPLES.reduce((s, x) => s + x.share, 0) - 1) < 1e-9, "shares add to 100%");
  for (const k of presetKits(decemberPerKwDay(STATES[0]))) {
    const cal = k.supplies.staples.reduce((s, l) => s + (l.pounds * 453.592 * l.staple.kcalPer100g) / 100, 0);
    assert.ok(Math.abs(cal - k.food.total) < 1, `${k.home.id}: ${cal} vs ${k.food.total}`);
    assert.deepEqual(k.supplies.staples, staplesFor(k.food.total));
  }
  // Rice: 365 kcal per 100 g -> 1 lb is about 1,656 calories.
  const rice = staplesFor(1_000_000)[0];
  assert.equal(rice.staple.id, "rice");
  assert.ok(Math.abs(rice.pounds - (350_000 / 365) * 100 / 453.592) < 1e-9);
});

test("stove fuel reuses the generator fuel formula and the maker's runtime", () => {
  const c = cookingPlan(4, KIT_DAYS);
  const g = generatorPlan({ tankSize: 1, runtimeHours: EXAMPLE_STOVE.hoursPerCylinder, hoursPerDay: (4 * COOK_MINUTES_PER_PERSON) / 60, days: KIT_DAYS });
  assert.equal(c.cylinders, Math.max(0, Math.ceil(g.fuel - 1e-9)));
  assert.ok(Math.abs(c.pounds - (g.fuel * EXAMPLE_STOVE.cylinderOz) / 16) < 1e-9);
  assert.equal(c.bulkTanks, Math.ceil(c.pounds / BULK_TANK_LB - 1e-9));
  assert.equal(cookingPlan(4, KIT_DAYS, 0).cylinders, 0);
});

test("bleach comes from the EPA table", () => {
  assert.equal(DROPS_PER_TSP, 64);
  const b = bleachFor(100);
  assert.equal(b.dropsPerGallon, 8);
  assert.ok(Math.abs(b.flOz - (800 / 64 / 6)) < 1e-9);
  assert.equal(b.flOzCloudy, b.flOz * 2);
});

test("every supply amount scales with household size", () => {
  const [s, m, l] = presetKits(decemberPerKwDay(STATES[0]));
  for (const i of STAPLES.keys()) assert.ok(s.supplies.staples[i].pounds < m.supplies.staples[i].pounds && m.supplies.staples[i].pounds < l.supplies.staples[i].pounds);
  assert.ok(s.supplies.cooking.cylinders < m.supplies.cooking.cylinders && m.supplies.cooking.cylinders < l.supplies.cooking.cylinders);
  assert.ok(s.supplies.bleach.flOz < m.supplies.bleach.flOz && m.supplies.bleach.flOz < l.supplies.bleach.flOz);
  assert.ok(s.supplies.garden.rowFeet[1] < m.supplies.garden.rowFeet[1] && m.supplies.garden.rowFeet[1] < l.supplies.garden.rowFeet[1]);
  assert.equal(m.supplies.bleach.flOz, bleachFor(m.water.treatGallons).flOz);
  assert.deepEqual(m.supplies.garden, gardenFor(m.food.people, KIT_DAYS));
});

test("the garden is honest about the 90-day window", () => {
  const g = gardenFor(4, KIT_DAYS);
  // Long crops are not ready; nothing is ready on day 1.
  for (const l of g.lines) assert.equal(l.daysToEat, Math.max(0, KIT_DAYS - l.crop.days[1]));
  assert.ok(g.lines.some((l) => l.daysToEat === 0), "some crops are not ready inside 90 days");
  assert.ok(CROPS.every((c) => c.days[0] >= 25), "no crop is faster than the extension table says");
  const notes = readFileSync("src/components/offgrid/KitNotes.tsx", "utf8");
  for (const s of ["A garden will not feed you", "never use a portable gas camp stove indoors"]) assert.ok(notes.includes(s), s);
  const page = readFileSync("src/app/off-grid-kit/page.tsx", "utf8");
  for (const s of ["adds a little fresh food near the end", "last spring freeze map", "not medical advice", "doctor or pharmacist", "full-sized by early November", "We have not priced these"]) assert.ok(page.includes(s), s);
  // No invented frost dates: the page links out instead.
  assert.doesNotMatch(page, /last frost[^.]*\b(January|February|March|April|May|June)\b/i);
});

test("no hard-coded prices in the survival parts; food brands are plain links", () => {
  for (const f of ["src/lib/survival-kit.ts", "src/components/offgrid/SurvivalChecklist.tsx", "src/components/offgrid/KitPackageList.tsx", "src/components/offgrid/KitPresetCards.tsx"]) {
    assert.doesNotMatch(readFileSync(f, "utf8").replace(/\$\{/g, ""), /\$\d/, `${f} has a price`);
  }
  for (const b of ["valleyfood", "readywise", "mountainhouse"] as const) assert.equal(AFFILIATES[b].tracked, false);
  const checklist = readFileSync("src/components/offgrid/SurvivalChecklist.tsx", "utf8");
  assert.match(checklist, /@media print/);
  assert.match(readFileSync("src/app/off-grid/page.tsx", "utf8"), /power, water, food and garden/i);
});

/* ------------------------------------------------------------------ */
/* Complete off-grid systems above the portable cap (Eco-Worthy)        */
/* ------------------------------------------------------------------ */

/** The most battery any kit station reaches with all its add-ons. */
const portableCapWh = Math.max(...kitStations().map((o) => o.capacityWh + (o.addOnUsd != null ? o.addOnMax * (o.addOnWh ?? 0) : 0)));

test("past the biggest portable setup, Medium and Large get a system, and Large gets a bigger one", () => {
  for (const { s, d } of decs) {
    const [sm, m, l] = presetKits(d);
    for (const k of [sm, m, l]) {
      if (k.size.batteryWh > portableCapWh) {
        assert.ok(k.power?.system, `${k.home.id} in ${s.name} needs ${k.size.batteryWh} Wh, over the portable cap, but got a station`);
        assert.ok(!k.notes.includes("battery-short"));
      } else assert.equal(k.power?.system, null, `${k.home.id} in ${s.name} fits a station`);
    }
    if (m.size.batteryWh > portableCapWh && l.size.batteryWh > m.power!.match.totalWh) {
      assert.ok(l.power!.match.totalWh > m.power!.match.totalWh, `${s.name}: Large is no bigger than Medium`);
      assert.ok(l.power!.priceUsd > m.power!.priceUsd);
    }
  }
  // The presets as shipped do cross the cap, so the page really shows different gear.
  const [, m, l] = presetKits(decemberPerKwDay(STATES[0]));
  assert.ok(m.size.batteryWh > portableCapWh && l.power!.match.totalWh > m.power!.match.totalWh);
});

test("a 240 V well pump runs on the system from the maker's stated output", () => {
  const k = buildKit({ home: "large", loads: homePreset("large").loads, perKwDay: darkest.d });
  const sys = k.power!.system!;
  assert.equal(sys.volts, "120/240V");
  assert.equal(k.wellStart, "runs", "20,000 W peak covers a 1/2 HP 230 V start");
});

test("off-grid systems: dated, priced, tracked buy links, maker specs only", () => {
  assert.ok(kitSystems().length > 0);
  for (const sys of OFFGRID_SYSTEMS) {
    assert.match(sys.retrieved, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(sys.priceUsd > 0 && (sys.listPriceUsd == null || sys.listPriceUsd >= sys.priceUsd));
    assert.ok(sys.addOn.priceUsd != null && sys.addOn.priceUsd > 0);
    assert.equal(sys.capacityWh, sys.battery.count * sys.battery.moduleWh);
    assert.equal(sys.addOn.capacityWh, sys.battery.moduleWh, "extra batteries are the same module");
    for (const u of [sys.url, sys.addOn.url, sys.inverter.url]) {
      const l = partnerUrl(sys.brand, { productUrl: u });
      assert.ok(l.tracked, `${u} untracked`);
      const q = new URL(l.href).searchParams;
      assert.equal(q.get("awinmid"), "73461");
      assert.equal(q.get("ued"), u);
    }
  }
  const files = ["src/components/offgrid/KitNotes.tsx", "src/components/offgrid/KitPackageList.tsx", "src/components/offgrid/KitPresetCards.tsx", "src/app/off-grid-kit/page.tsx"];
  for (const f of files) assert.doesNotMatch(readFileSync(f, "utf8").replace(/\$\{/g, ""), /\$\d/, `${f} has a price`);
  const notes = readFileSync("src/components/offgrid/KitNotes.tsx", "utf8");
  for (const t of ["licensed electrician", "permit", "/how-to-go-off-grid"]) assert.ok(notes.includes(t), t);
});
