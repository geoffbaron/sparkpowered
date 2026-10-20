import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { REDODO_HALLOWEEN_2026 as sale, isSaleLive, saleSavingUsd } from "../src/data/sales";
import { partnerUrl } from "../src/data/affiliates";

const at = (iso: string) => Date.parse(iso);

test("Redodo Halloween sale shows through Nov 1 Pacific and is gone on Nov 2", () => {
  assert.equal(isSaleLive(sale, at("2026-10-19T23:59:59-07:00")), false, "before the start");
  assert.equal(isSaleLive(sale, at("2026-10-20T00:00:00-07:00")), true, "first minute");
  assert.equal(isSaleLive(sale, at("2026-10-25T12:00:00Z")), true);
  assert.equal(isSaleLive(sale, at("2026-11-01T23:59:59-08:00")), true, "last second of Nov 1 Pacific");
  assert.equal(isSaleLive(sale, at("2026-11-02T00:00:00-08:00")), false, "midnight Nov 2 Pacific");
  assert.equal(isSaleLive(sale, at("2026-11-02T07:59:59Z")), true, "still Nov 1 in California");
  assert.equal(isSaleLive(sale, at("2026-11-02T08:00:00Z")), false);
  assert.equal(isSaleLive(sale, at("2027-01-01T00:00:00Z")), false);
});

test("sale prices are real savings and links are tracked Awin deep links", () => {
  for (const i of sale.items) {
    assert.ok(saleSavingUsd(i) > 0, i.name);
    assert.ok(i.salePriceUsd > 100 && i.salePriceUsd < 2000, i.name);
  }
  assert.deepEqual(sale.items.map(saleSavingUsd), [90, 14]);
  for (const u of [sale.url, ...sale.items.map((i) => i.url)]) {
    const l = partnerUrl(sale.brand, { productUrl: u });
    assert.ok(l.tracked, u);
    assert.match(l.href, /awinmid=97969&awinaffid=3125360&ued=https%3A%2F%2Fwww\.redodopower\.com%2F/);
  }
});

test("the sale callout is decided per request, not frozen at build time", () => {
  const src = readFileSync("src/components/SaleCallout.tsx", "utf8");
  assert.match(src, /await connection\(\)/);
  assert.match(src, /<Suspense/);
  assert.match(src, /isSaleLiveNow\(sale\)/);
  assert.doesNotMatch(src, /^\s*["']use client["']/);
});
