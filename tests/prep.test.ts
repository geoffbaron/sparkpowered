import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CALORIE_TABLE,
  EPA_BLEACH_TABLE,
  NWR_FREQUENCIES_MHZ,
  PREP_LINKS,
  READY_KIT,
  WATER_SOURCES,
  STANDARDS,
  addMonths,
  bleachDose,
  boilMinutes,
  buildKit,
  caloriesPerDay,
  compareKit,
  containersFor,
  foodNeeded,
  logToPercent,
  nwrCountyUrl,
  nwrStationsUrl,
  waterNeeded,
} from "../src/lib/prep";
import { PREP_PRODUCTS, WATER_PRODUCTS } from "../src/data/prep-products";
import { AFFILIATES } from "../src/data/affiliates";

test("EPA bleach table matches the EPA page cell for cell", () => {
  const expected: [string, string, string][] = [
    ["1 quart or liter", "2 drops", "2 drops"],
    ["1 gallon", "8 drops", "6 drops"],
    ["2 gallons", "16 drops (1/4 tsp)", "12 drops (1/8 teaspoon)"],
    ["4 gallons", "1/3 teaspoon", "1/4 teaspoon"],
    ["8 gallons", "2/3 teaspoon", "1/2 teaspoon"],
  ];
  assert.equal(EPA_BLEACH_TABLE.length, expected.length);
  EPA_BLEACH_TABLE.forEach((r, i) => {
    assert.deepEqual([r.label, r.dose["6"], r.dose["8.25"]], expected[i]);
  });
});

test("bleach doses double for cloudy or cold water", () => {
  assert.equal(bleachDose("1gal", "6", false).dose, "8 drops");
  assert.equal(bleachDose("1gal", "6", true).dose, "16 drops");
  assert.equal(bleachDose("1gal", "8.25", true).dose, "12 drops");
  assert.equal(bleachDose("2gal", "8.25", true).dose, "24 drops");
  assert.equal(bleachDose("4gal", "6", true).dose, "2/3 teaspoon");
  assert.equal(bleachDose("8gal", "6", true).dose, "1 1/3 teaspoons");
  assert.equal(bleachDose("8gal", "8.25", true).dose, "1 teaspoon");
  for (const r of EPA_BLEACH_TABLE) for (const s of ["6", "8.25"] as const) for (const c of [true, false]) {
    assert.doesNotMatch(bleachDose(r.id, s, c).dose, /NaN|undefined/);
  }
});

test("boil time: CDC 1 minute, 3 above 6,500 ft; EPA 3 above 5,000 ft", () => {
  assert.deepEqual(boilMinutes(0), { cdc: 1, epa: 1, agree: true });
  assert.deepEqual(boilMinutes(5000), { cdc: 1, epa: 1, agree: true });
  assert.deepEqual(boilMinutes(5500), { cdc: 1, epa: 3, agree: false });
  assert.deepEqual(boilMinutes(6500), { cdc: 1, epa: 3, agree: false });
  assert.deepEqual(boilMinutes(6501), { cdc: 3, epa: 3, agree: true });
  assert.deepEqual(boilMinutes(Number.NaN), { cdc: 1, epa: 1, agree: true });
});

test("water: 1 gallon per person per day, doubled in heat, user extras added", () => {
  assert.equal(waterNeeded({ people: 1, days: 3 }).total, 3);
  assert.equal(waterNeeded({ people: 4, days: 14 }).total, 56);
  assert.equal(waterNeeded({ people: 4, days: 14, hot: true }).total, 112);
  const w = waterNeeded({ people: 2, days: 14, extraGallonsPerDay: 0.5, petGallonsPerDay: 0.25 });
  assert.equal(w.peopleGallons, 28);
  assert.equal(w.extraGallons, 7);
  assert.equal(w.petGallons, 3.5);
  assert.equal(w.total, 38.5);
  // No invented defaults: pets and special needs add nothing unless entered.
  assert.equal(waterNeeded({ people: 3, days: 3 }).petGallons, 0);
  assert.equal(waterNeeded({ people: 3, days: 3 }).extraGallons, 0);
  assert.ok(Number.isFinite(waterNeeded({ people: Number.NaN, days: Number.NaN }).total));
});

test("containers round up; refresh date is 6 months later", () => {
  assert.equal(containersFor(56, 5), 12);
  assert.equal(containersFor(55, 55), 1);
  assert.equal(containersFor(56, 55), 2);
  assert.equal(containersFor(0, 5), 0);
  assert.equal(addMonths("2026-10-26"), "2027-04-26");
  assert.equal(addMonths("2026-08-31"), "2027-02-28");
  assert.equal(addMonths("2027-08-31"), "2028-02-29");
});

test("purifier log reductions convert to the EPA percentages", () => {
  assert.equal(logToPercent(6).toFixed(4), "99.9999");
  assert.equal(logToPercent(4).toFixed(2), "99.99");
  assert.equal(logToPercent(3).toFixed(1), "99.9");
});

test("calorie table matches Dietary Guidelines 2020-2025 Table A2-2 spot checks", () => {
  assert.equal(caloriesPerDay(40, "male", "moderate"), 2600);
  assert.equal(caloriesPerDay(40, "female", "moderate"), 2000);
  assert.equal(caloriesPerDay(16, "male", "active"), 3200);
  assert.equal(caloriesPerDay(80, "female", "sedentary"), 1600);
  assert.equal(caloriesPerDay(2, "female", "active"), 1000);
  assert.equal(caloriesPerDay(19, "male", "sedentary"), 2600);
  assert.equal(caloriesPerDay(30, "female", "moderate", "trimester-3"), 2000 + 452);
  assert.equal(caloriesPerDay(30, "male", "moderate", "trimester-3"), 2600);
  // Ages 2 to 110 all resolve to a row, with no gaps.
  for (let a = 2; a <= 110; a++) assert.ok(CALORIE_TABLE.some(([lo, hi]) => a >= lo && a <= hi), `age ${a}`);
  // Adult ranges quoted on the page: women 1,600-2,400, men 2,000-3,000.
  const adults = CALORIE_TABLE.filter(([lo]) => lo >= 19);
  assert.equal(Math.min(...adults.flatMap((r) => r[3])), 1600);
  assert.equal(Math.max(...adults.flatMap((r) => r[3])), 2400);
  assert.equal(Math.min(...adults.flatMap((r) => r[2])), 2000);
  assert.equal(Math.max(...adults.flatMap((r) => r[2])), 3000);
});

test("food math: people x days x calories, kit comparison on real calories", () => {
  const f = foodNeeded([{ age: 40, sex: "male" }, { age: 40, sex: "female" }], 14, "moderate");
  assert.equal(f.daily, 4600);
  assert.equal(f.total, 64400);
  const k = compareKit(46000, 230, f.daily);
  assert.equal(k.days, 10);
  assert.equal(k.usdPer1000, 5);
  assert.equal(compareKit(0, 100, f.daily).usdPer1000, null);
  assert.equal(compareKit(1000, 0, 0).days, 0);
});

test("kit builder scales water and per-person items, and filters household extras", () => {
  const k = buildKit({ people: 4 }, "2wk");
  assert.equal(k.find((l) => l.id === "water")!.qty, "56 gallons (4 people x 14 days)");
  assert.equal(k.find((l) => l.id === "sleeping")!.qty, "4");
  assert.ok(!k.some((l) => l.id === "infant" || l.id === "pet" || l.id === "rx"));
  const k2 = buildKit({ people: 1, infant: true, pet: true, meds: true }, "72h");
  assert.equal(k2.find((l) => l.id === "water")!.qty, "3 gallons (1 person x 3 days)");
  assert.ok(k2.some((l) => l.id === "infant") && k2.some((l) => l.id === "pet") && k2.some((l) => l.id === "rx"));
  assert.equal(READY_KIT.filter((i) => i.group === "basic").length, 14);
});

test("every prep product has a source URL and a checked date, and no excluded brands", () => {
  assert.ok(PREP_PRODUCTS.length > 0);
  for (const p of PREP_PRODUCTS) {
    assert.match(p.sourceUrl, /^https:\/\//, `${p.id} sourceUrl`);
    assert.match(p.url, /^https:\/\//, `${p.id} url`);
    assert.match(p.checked, /^\d{4}-\d{2}-\d{2}$/, `${p.id} checked`);
    assert.ok(p.claim.length > 20, `${p.id} claim`);
    assert.ok(p.standards.length > 0, `${p.id} standards`);
    if (p.brand) assert.ok(AFFILIATES[p.brand], `${p.id} brand is registered`);
    assert.doesNotMatch(`${p.name} ${p.maker} ${p.url}`, /berkey|alexapure/i, `${p.id} is an excluded brand`);
  }
  assert.equal(new Set(PREP_PRODUCTS.map((p) => p.id)).size, PREP_PRODUCTS.length);
  assert.ok(WATER_PRODUCTS.every((p) => p.kind !== "radio"));
});

test("water sources and standards line up", () => {
  const ids = new Set(STANDARDS.map((s) => s.id));
  for (const w of WATER_SOURCES) for (const s of w.standards) assert.ok(ids.has(s), `${w.id} -> ${s}`);
});

test("NOAA Weather Radio data", () => {
  assert.deepEqual(NWR_FREQUENCIES_MHZ, ["162.400", "162.425", "162.450", "162.475", "162.500", "162.525", "162.550"]);
  assert.equal(nwrStationsUrl("WA"), "https://www.weather.gov/nwr/stations?State=WA");
  assert.equal(nwrCountyUrl("TX"), "https://www.weather.gov/nwr/county_coverage?State=TX");
});

test("prep links are unique and every prep page links the others", () => {
  const hrefs = PREP_LINKS.map((l) => l.href);
  assert.equal(new Set(hrefs).size, hrefs.length);
  const pages = [
    "emergency-water-storage-calculator",
    "how-to-purify-water",
    "best-emergency-water-filters",
    "emergency-kit-checklist",
    "emergency-food-calculator",
    "noaa-weather-radio",
  ];
  for (const p of pages) {
    const src = readFileSync(`src/app/${p}/page.tsx`, "utf8");
    assert.match(src, /prepLinksFor\(PATH\)/, `${p} uses the shared related links`);
    assert.match(src, /<Sources/, `${p} has sources`);
    assert.match(src, /<Faq/, `${p} has an FAQ`);
    const title = src.match(/const TITLE = "([^"]+)"/)?.[1] ?? "";
    assert.ok(title.length > 0 && title.length < 65, `${p} title length ${title.length}`);
    if (/PartnerLink/.test(src)) assert.match(src, /<AffiliateDisclosure/, `${p} has a disclosure`);
    assert.doesNotMatch(src, /SHTF|doomsday|gas mask/i);
  }
});
