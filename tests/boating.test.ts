import { test } from "node:test";
import assert from "node:assert/strict";
import { BLUETTI_BOAT, BOAT_BATTERIES, BOAT_CHARGERS, ELECTRIC_OUTBOARDS, FUEL_PRICES, PISCIFUN_GEAR } from "../src/data/boating";
import { partnerUrl } from "../src/data/affiliates";
import {
  ELECTRIC_HOUR_USD,
  ELECTRONICS,
  GAS_HOUR_USD,
  MOTORS,
  RUNTIME_BATTERIES,
  SPEEDS,
  electronicsHours,
  hoursLabel,
  hoursPrecise,
  lithiumCostPhrase,
  minutesApart,
  runtimeFor,
  runtimeHours,
  seasonFuel,
} from "../src/lib/boating";
import { ROUTES } from "../src/lib/seo";

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && Date.parse(s) <= Date.now();

test("boating data is dated, priced and plausible", () => {
  for (const b of BOAT_BATTERIES) {
    assert.ok(isDate(b.retrieved), b.id);
    assert.ok(b.priceUsd > 20 && b.priceUsd < 3000, b.id);
    assert.ok(Math.abs(b.volts * b.ampHours - b.energyWh) / b.energyWh < 0.08, `${b.id} energy`);
    assert.match(b.url, /^https:\/\//);
  }
  for (const o of ELECTRIC_OUTBOARDS) {
    assert.ok(isDate(o.retrieved), o.id);
    assert.ok((o.packagePriceUsd ?? o.motorPriceUsd ?? 0) > 1000, o.id);
    assert.ok(o.batteryWh > 500, o.id);
  }
  for (const c of BOAT_CHARGERS) assert.ok(c.priceUsd > 20 && isDate(c.retrieved), c.id);
  assert.ok(FUEL_PRICES.gasUsdPerGal > 2 && FUEL_PRICES.electricCentsPerKwh > 10);
});

test("runtime calculator gives finite hours for every motor, speed and battery", () => {
  for (const m of MOTORS) {
    const list = RUNTIME_BATTERIES[m.volts];
    assert.ok(list.length >= 3, `${m.id} battery options`);
    for (const s of SPEEDS) {
      for (const b of list) {
        const h = runtimeHours(m, s.share, b.usableAh);
        assert.ok(Number.isFinite(h) && h > 0 && h < 100, `${m.id} ${s.id} ${b.id}: ${h}`);
        assert.doesNotMatch(hoursLabel(h), /NaN|undefined|Infinity/);
      }
    }
  }
  // Newport's formula: 100 Ah at 50 A = 2 hours.
  assert.equal(runtimeFor("55-12", "full", "redodo-12v-100ah"), 2);
  // Lithium doubles AGM of the same rating.
  assert.equal(runtimeFor("55-12", "half", "redodo-12v-100ah"), 2 * runtimeFor("55-12", "half", "agm-12"));
});

test("electronics and fuel maths are sane", () => {
  for (const e of ELECTRONICS) assert.ok(e.amps > 0.3 && e.amps < 5 && Number.isFinite(electronicsHours(480, e.amps)), e.id);
  assert.ok(ELECTRIC_HOUR_USD > 0 && ELECTRIC_HOUR_USD < GAS_HOUR_USD);
  assert.ok(seasonFuel(100).saved > 0);
});

test("partner links in the boating section carry our Awin id", () => {
  const links = [
    ...BOAT_BATTERIES.filter((b) => b.brand).map((b) => partnerUrl(b.brand!, { productId: b.id, productUrl: b.url })),
    ...BOAT_CHARGERS.map((c) => partnerUrl(c.brand, { productId: c.id, productUrl: c.url })),
    partnerUrl("bluetti", { productUrl: BLUETTI_BOAT.b1210.url }),
    partnerUrl("piscifun", { productUrl: PISCIFUN_GEAR.electricReel.url }),
  ];
  for (const l of links) {
    assert.equal(l.tracked, true);
    assert.match(l.href, /awinaffid=3125360/);
  }
});

test("boating pages are in the sitemap", () => {
  for (const p of ["/boating", "/trolling-motor-battery-life", "/kayak-trolling-motor-battery", "/electric-outboard-motor", "/fish-finder-battery", "/24v-vs-36v-trolling-motor", "/charge-lithium-battery-on-boat"]) {
    assert.ok(ROUTES.some((r) => r.path === p), p);
  }
});

test("comparison copy never shows a negative dollar figure", () => {
  const usd = (n: number) => `$${n}`;
  assert.equal(lithiumCostPhrase(399.99, 626.97, usd), "pay about $227 less for lithium");
  assert.equal(lithiumCostPhrase(700, 650, usd), "pay about $50 more for lithium");
  assert.equal(lithiumCostPhrase(500.2, 500, usd), "pay about the same for lithium");
  assert.equal(hoursPrecise(100 / 26), "about 3.8 hours");
  assert.equal(minutesApart(100 / 26, 100 / 28), 15);
  assert.equal(minutesApart(1, 2), 60);
});
