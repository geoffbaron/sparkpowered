import { test } from "node:test";
import assert from "node:assert/strict";
import { CPAP_PACK, INSTALL_COST, OTHER_CHARGERS } from "../src/data/buyer-guides";
import { OTHER_LITHIUM, TROLLING_EXTRA, BATTERIES } from "../src/data/batteries";
import { PRODUCTS } from "../src/data/products";
import { COMPARISONS } from "../src/data/comparisons";
import { partnerUrl } from "../src/data/affiliates";
import { STATES } from "../src/lib/energy";
import { ROUTES } from "../src/lib/seo";
import { TROLLING_CHOICE } from "../src/lib/trolling";

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && Date.parse(s) <= Date.now();
const isHttps = (u: string) => /^https:\/\/[^\s]+$/.test(u);

test("non-partner chargers are sourced, dated and plausible", () => {
  assert.ok(OTHER_CHARGERS.length >= 3);
  for (const c of OTHER_CHARGERS) {
    assert.ok(isHttps(c.url), `${c.id} url`);
    assert.ok(isDate(c.retrieved), `${c.id} retrieved`);
    assert.ok(c.priceUsd > 100 && c.priceUsd < 2000, `${c.id} price`);
    assert.ok(c.amps >= 16 && c.amps <= 80, `${c.id} amps`);
    assert.ok(c.plugs.length > 0 && c.note.length > 20, `${c.id} plugs/note`);
    assert.ok(!/awin1\.com/.test(c.url), `${c.id} must not carry tracking`);
  }
});

test("installation cost covers every state with a sourced, sane average", () => {
  assert.ok(isHttps(INSTALL_COST.url) && isDate(INSTALL_COST.retrieved));
  for (const s of STATES) {
    const v = INSTALL_COST.byState[s.abbr];
    assert.ok(v && v > 1000 && v < 6000, `${s.abbr} ${v}`);
  }
  const vals = Object.values(INSTALL_COST.byState);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  assert.ok(Math.abs(mean - INSTALL_COST.usAverage) < 400, `state mean ${mean} vs US ${INSTALL_COST.usAverage}`);
  for (const k of ["typicalRange", "permit", "newCircuit", "subpanel", "serviceUpgrade", "longRun", "hardwireVsPlug"] as const)
    assert.ok(INSTALL_COST[k][0] < INSTALL_COST[k][1], k);
});

test("trolling and comparison batteries are sourced and consistent", () => {
  const ids = [...BATTERIES, ...TROLLING_EXTRA].map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length, "battery ids unique");
  for (const b of TROLLING_EXTRA) {
    assert.match(b.url, /^https:\/\/www\.redodopower\.com\/products\/[a-z0-9-]+$/);
    assert.ok(isDate(b.retrieved), `${b.id} retrieved`);
    assert.ok(Math.abs(b.nominalV * b.ampHours - b.energyWh) <= 1, `${b.id} energy`);
    assert.ok(Math.abs(b.nominalV - b.volts * 1.0667) < 0.2, `${b.id} volts`);
    if (b.listPriceUsd != null) assert.ok(b.listPriceUsd >= b.priceUsd);
    const l = partnerUrl("redodo", { productId: b.id, productUrl: b.url });
    assert.ok(l.href.startsWith("https://www.awin1.com/cread.php?awinmid=97969&awinaffid=3125360&ued="), l.href);
  }
  for (const o of OTHER_LITHIUM) {
    assert.ok(isHttps(o.url) && isDate(o.retrieved), o.id);
    assert.ok(o.priceUsd > 100 && o.energyWh > 500, o.id);
  }
  for (const v of [12, 24, 36] as const) {
    for (const id of [TROLLING_CHOICE[v].short, TROLLING_CHOICE[v].long]) {
      const b = ids.includes(id) && [...BATTERIES, ...TROLLING_EXTRA].find((x) => x.id === id)!;
      assert.ok(b, `${id} exists`);
      assert.equal(b.volts, v, `${id} matches ${v} V`);
    }
  }
});

test("Bluetti models link through Awin with our publisher id", () => {
  const bluetti = PRODUCTS.filter((p) => p.brand === "bluetti");
  assert.ok(bluetti.length >= 7);
  for (const p of [...bluetti, { id: CPAP_PACK.id, url: CPAP_PACK.url }]) {
    const l = partnerUrl("bluetti", { productId: p.id, productUrl: p.url });
    assert.equal(l.tracked, true);
    assert.ok(l.href.includes("awinmid=59271&awinaffid=3125360"), l.href);
    assert.equal(decodeURIComponent(l.href.split("ued=")[1]), p.url);
  }
  assert.ok(isDate(CPAP_PACK.retrieved));
});

test("new comparisons and guide pages are in the sitemap", () => {
  for (const slug of ["bluetti-ac180-vs-elite-100-v2", "bluetti-elite-200-v2-vs-elite-300", "bluetti-elite-200-v2-vs-ac200l"])
    assert.ok(COMPARISONS.some((c) => c.slug === slug), slug);
  const paths = ROUTES.map((r) => r.path);
  for (const p of [
    "/best-power-station-for-cpap",
    "/power-station-for-refrigerator",
    "/best-trolling-motor-battery",
    "/lithium-vs-agm-battery",
    "/best-home-ev-charger",
    "/ev-charger-installation-cost",
  ])
    assert.ok(paths.includes(p), p);
});
