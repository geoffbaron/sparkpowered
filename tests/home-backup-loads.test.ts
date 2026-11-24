import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AFFILIATES } from "../src/data/affiliates";
import { HOME_BACKUP_PAGES } from "../src/data/home-backup";
import { appliance, fitFor, loadPageProducts, motorStation, motorSurgeW } from "../src/lib/can-it-run";
import { NEC_COLD_FACTORS, PUMP_MOTORS, coldVoc, loadFit, pumpFit, pumpLoad, pumpMotor, pvLayout } from "../src/lib/offgrid";
import { productById } from "../src/lib/products";
import { ROUTES } from "../src/lib/seo";

const PAGES = ["/home-backup/well-pump", "/home-backup/pellet-stove", "/home-backup/bluetti-elite-200-v2-solar-panels"];

test("fitFor is the shared load fit check", () => {
  for (const id of ["bluetti-ac180", "anker-solix-f3000", "bluetti-apex-300"]) {
    const p = productById(id);
    for (const a of ["well", "furnace", "window-ac", "heater"].map(appliance)) {
      assert.equal(fitFor(p, a), loadFit(a, { acOutputW: p.acOutputW, motorSurgeW: motorSurgeW(p) }));
    }
  }
});

test("Apex 300's 7,680 W is Power Lifting (heating only), not a motor surge", () => {
  const apex = productById("bluetti-apex-300");
  assert.equal(motorSurgeW(apex), apex.acOutputW);
});

test("pump watts: volts x amps when given, Franklin's table otherwise; start is volts x locked rotor amps", () => {
  const m = pumpMotor("1-2hp-230v-3w");
  const t = pumpLoad(m);
  assert.equal(t.runW, 960);
  assert.equal(t.startTotalW, 230 * 23);
  assert.equal(t.runW + t.startW, t.startTotalW);
  assert.ok(t.needs240);
  const n = pumpLoad(m, 5.5);
  assert.equal(n.runW, 230 * 5.5);
  assert.equal(n.basis, "nameplate");
  assert.equal(pumpLoad(m, 0).basis, "table");
  for (const x of PUMP_MOTORS) assert.ok(x.lockedRotorA * x.volts > x.maxW, x.id);
});

test("a 230 V pump never fits a 120 V station; the Apex 300 runs it but doesn't confirm the start", () => {
  const l = pumpLoad(pumpMotor("1-2hp-230v-3w"));
  assert.equal(pumpFit(l, motorStation(productById("bluetti-elite-200-v2"))), "needs-240v");
  assert.equal(pumpFit(l, motorStation(productById("bluetti-apex-300"))), "start-unconfirmed");
  assert.equal(pumpFit(pumpLoad(pumpMotor("1-2hp-115v-3w")), motorStation(productById("anker-solix-f3000"))), "runs");
});

test("load pages compare only in-stock, unpriced, non-Nature's Generator stations", () => {
  for (const p of loadPageProducts()) {
    assert.ok(!p.soldOut && !("priceUsd" in p) && p.install === "diy", p.id);
    assert.notEqual(p.brand, "naturesgenerator");
  }
});

test("cold Voc: IAEI's worked example and the NEC table factors", () => {
  // IAEI (Wiles 2019): 45 V, -0.36%/C, -10 C -> 50.67 V
  assert.equal(coldVoc(45, -0.36, -10).toFixed(2), "50.67");
  assert.deepEqual(NEC_COLD_FACTORS.map((f) => f.factor), [1.18, 1.25]);
  const input = { minV: 12, maxV: 60, maxA: 20, maxW: 1000 };
  const two = pvLayout({ vocV: 24.6, iscA: 10.8, watts: 200 }, 2, 1, input);
  assert.equal(two.voc.toFixed(1), "49.2");
  assert.ok(two.voltsOk && two.cold[0].ok && !two.cold[1].ok);
  const par = pvLayout({ vocV: 44, iscA: 11.4, watts: 350 }, 1, 2, input);
  assert.ok(par.voltsOk && !par.currentOk);
  assert.ok(!pvLayout({ vocV: 44, iscA: 11.4, watts: 350 }, 2, 1, input).voltsOk);
  assert.ok(!pvLayout({ vocV: 49.1, iscA: 13.31, watts: 500 }, 1, 2, input).capped);
  assert.ok(pvLayout({ vocV: 44, iscA: 11.4, watts: 350 }, 1, 3, input).capped);
});

test("shipped load pages are live, routed, in llms.txt, and link one tracked model", () => {
  const llms = readFileSync("public/llms.txt", "utf8");
  for (const path of PAGES) {
    assert.ok(HOME_BACKUP_PAGES.find((p) => p.href === path)?.live, path);
    assert.ok(ROUTES.some((r) => r.path === path), path);
    assert.ok(llms.includes(`https://sparkpowered.com${path})`), path);
    const src = readFileSync(`src/app${path}/page.tsx`, "utf8");
    assert.match(src, /<AffiliateDisclosure/);
    assert.match(src, /<QuickAnswer>/);
    assert.match(src, /<WhatWeChecked/);
    assert.match(src, /"@type": "Article"/);
    assert.match(src, /<Faq /);
    assert.match(src, /href: "\/home-backup"/);
    assert.equal((src.match(/<OurPick/g) ?? []).length, 1, path);
    assert.doesNotMatch(src, /\$\d/, `${path} hard-codes a price`);
  }
  assert.ok(!HOME_BACKUP_PAGES.some((p) => p.href === "/home-backup/furnace"));
  assert.ok(AFFILIATES[productById("bluetti-elite-200-v2").brand].tracked);
});
