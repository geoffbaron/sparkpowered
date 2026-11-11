import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AFFILIATES } from "../src/data/affiliates";
import { STATE_INCENTIVES } from "../src/data/state-incentives";
import { APPLIANCES, CAN_IT_RUN_IDS, appliance, canItRunProducts, fitFor, runFor, whatItRunsPath } from "../src/lib/can-it-run";
import { lifeTerms } from "../src/lib/everyday";
import { productById } from "../src/lib/products";
import { ROUTES } from "../src/lib/seo";

test("what-it-runs pages: tracked, in stock, never Nature's Generator", () => {
  assert.ok(CAN_IT_RUN_IDS.length >= 4 && CAN_IT_RUN_IDS.length <= 6);
  for (const p of canItRunProducts()) {
    assert.ok(AFFILIATES[p.brand].tracked, p.id);
    assert.notEqual(p.brand, "naturesgenerator");
    assert.ok(!p.soldOut, p.id);
    assert.ok(p.priceUsd && p.priceUsd > 0, p.id);
  }
});

test("what-it-runs pages are in ROUTES and llms.txt", () => {
  const llms = readFileSync("public/llms.txt", "utf8");
  for (const id of CAN_IT_RUN_IDS) {
    assert.ok(ROUTES.some((r) => r.path === whatItRunsPath(id)), id);
    assert.ok(llms.includes(whatItRunsPath(id)), id);
  }
});

test("run time uses the site's one formula", () => {
  const p = productById("bluetti-elite-300");
  assert.ok(Math.abs(runFor(p, appliance("fridge")) - lifeTerms(p.capacityWh).fridgeHours) < 1e-9);
  assert.ok(Math.abs(runFor(p, appliance("cpap")) - lifeTerms(p.capacityWh).cpapNights) < 1e-9);
  assert.equal(APPLIANCES.length, 15);
});

test("fit check: output limit and heating-only surge", () => {
  const ac180 = productById("bluetti-ac180");
  assert.equal(fitFor(ac180, appliance("window-ac")), "too-big");
  assert.equal(fitFor(ac180, appliance("heater")), "runs");
  // Bluetti's 2,700 W Power Lifting figure is not a motor surge.
  assert.equal(fitFor(ac180, appliance("fridge")), "start-unconfirmed");
  assert.equal(fitFor(productById("anker-solix-c2000-gen-2"), appliance("well")), "runs");
});

test("each page's table differs from every other page's", () => {
  const sig = canItRunProducts().map((p) => APPLIANCES.map((a) => `${fitFor(p, a)}:${Math.round(runFor(p, a) * 10)}`).join("|"));
  assert.equal(new Set(sig).size, sig.length);
});

test("state incentive rows are complete and official", () => {
  assert.equal(Object.keys(STATE_INCENTIVES).length, 10);
  for (const [abbr, s] of Object.entries(STATE_INCENTIVES)) {
    assert.ok(s.evCredit.length > 40, abbr);
    for (const p of s.programs) {
      assert.match(p.url, /^https:\/\//, `${abbr} ${p.name}`);
      assert.match(p.read, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(p.amount && p.who && p.ends, `${abbr} ${p.name}`);
      if (/afdc\.energy\.gov|dsireusa/.test(p.url)) assert.ok(p.via, `${abbr} ${p.name} must say it rests on AFDC/DSIRE`);
    }
  }
});
