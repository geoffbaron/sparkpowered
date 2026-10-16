import { test } from "node:test";
import assert from "node:assert/strict";
import { BATTERIES, LEAD_ACID_REF } from "../src/data/batteries";
import { AFFILIATES, partnerUrl } from "../src/data/affiliates";
import { PICKER_BATTERIES, RV_LOADS, lifetimeCost, recommend } from "../src/lib/rv-battery";
import { ROUTES } from "../src/lib/seo";

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

test("battery dataset: 4-8 sourced, dated Redodo products with unique ids", () => {
  assert.ok(BATTERIES.length >= 4 && BATTERIES.length <= 8, `${BATTERIES.length} batteries`);
  const ids = BATTERIES.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const b of BATTERIES) {
    assert.match(b.id, /^[a-z0-9-]+$/);
    assert.match(b.url, /^https:\/\/www\.redodopower\.com\/products\/[a-z0-9-]+$/, `${b.id} url`);
    assert.match(b.sourceUrl, /^https:\/\//, `${b.id} sourceUrl`);
    assert.ok(isDate(b.retrieved) && Date.parse(b.retrieved) <= Date.now(), `${b.id} retrieved`);
    assert.ok(b.brand in AFFILIATES, `${b.id} brand`);
  }
});

test("battery specs are plausible and consistent", () => {
  for (const b of BATTERIES) {
    assert.ok(Math.abs(b.nominalV * b.ampHours - b.energyWh) <= 1, `${b.id} energy = volts x amp-hours`);
    assert.ok(Math.abs(b.nominalV - b.volts * 1.0667) < 0.2, `${b.id} nominal volts`);
    assert.ok(b.priceUsd > 50 && b.priceUsd < 5000, `${b.id} price`);
    if (b.listPriceUsd != null) assert.ok(b.listPriceUsd >= b.priceUsd, `${b.id} list price`);
    assert.ok(b.weightLb > 5 && b.weightLb < 150, `${b.id} weight`);
    assert.ok(b.cycles >= 1000 && b.cycles <= 15000, `${b.id} cycles`);
    if (b.selfHeating) assert.ok(b.lowTempCutoff, `${b.id} self-heating implies low-temp cutoff`);
    assert.ok(b.notes.length > 0, `${b.id} notes`);
  }
  assert.ok(LEAD_ACID_REF.weightLb > 40 && LEAD_ACID_REF.depthOfDischarge === 0.5);
});

test("Redodo links are tracked Awin deep links to the product page", () => {
  assert.equal(AFFILIATES.redodo.tracked, true);
  for (const b of BATTERIES) {
    const l = partnerUrl("redodo", { productId: b.id, productUrl: b.url });
    assert.equal(l.tracked, true);
    assert.ok(l.href.startsWith("https://www.awin1.com/cread.php?awinmid=97969&awinaffid=3125360&ued="), l.href);
    assert.equal(decodeURIComponent(l.href.split("ued=")[1]), b.url);
  }
});

test("RV picker recommends a battery that covers the need, and scales up", () => {
  assert.deepEqual(PICKER_BATTERIES.map((b) => b.volts), [12, 12, 12]);
  const basics = RV_LOADS.filter((l) => l.defaultOn).reduce((s, l) => s + l.whDay, 0);
  assert.ok(basics > 300 && basics < 1000, `default loads ${basics} Wh`);
  for (const days of [1, 2, 3, 4, 7]) {
    for (const wh of [200, basics, 1200, 2500]) {
      const r = recommend(wh, days);
      assert.ok(r.count >= 1 && r.count <= 4);
      if (r.count < 4) assert.ok(r.totalWh * 0.9 >= wh * days - 1, `${wh}x${days} too small`);
      assert.ok(r.leadAcidLb > r.totalLb, "lithium should be lighter than lead-acid for the same energy");
    }
  }
  assert.equal(recommend(500, 2).battery.id, "redodo-12v-100ah");
});

test("lithium costs less per year than AGM at every usage level", () => {
  for (const n of [50, 100, 200, 365]) {
    const c = lifetimeCost(n);
    assert.ok(c.lithium.perYear < c.leadAcid.perYear, `${n} nights`);
    assert.ok(c.lithium.years <= 10);
  }
});

test("lithium RV battery page is in the sitemap", () => {
  assert.ok(ROUTES.some((r) => r.path === "/lithium-rv-battery"));
});
