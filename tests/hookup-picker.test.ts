import { test } from "node:test";
import assert from "node:assert/strict";
import { PRODUCTS, type Product } from "../src/data/products";
import { AFFILIATES } from "../src/data/affiliates";
import { PARTS } from "../src/data/hookup";
import { DEFAULT_INPUT, PICKER_LOADS, pick, type Budget, type HookupInput, type PickerLoadId, type Tenure, type Volts } from "../src/lib/hookup-picker";
import { hookupData } from "../src/lib/hookup-picker-data";
import { dailyWh, outageBatteryWh, peakWatts } from "../src/lib/offgrid";
import { productById } from "../src/lib/products";

const data = hookupData();
const run = (o: Partial<HookupInput>) => pick({ ...DEFAULT_INPUT, ...o }, data);

/** Every combination of the five answers (with a few load sets), for the rule checks. */
function* allInputs(): Generator<HookupInput> {
  const loadSets: PickerLoadId[][] = [["fridge", "router", "led", "phone"], ["fridge", "freezer", "well", "furnace"], ["cpap", "router"], [...PICKER_LOADS]];
  for (const loads of loadSets)
    for (const days of [1, 2, 3] as const)
      for (const volts of ["120", "240"] as Volts[])
        for (const tenure of ["own", "rent"] as Tenure[])
          for (const budget of ["1500", "3000", "5000", "any"] as Budget[])
            for (const electrician of [true, false]) yield { loads, days, volts, tenure, budget, electrician };
}

test("renters and people not hiring an electrician get extension cords only, never a panel option", () => {
  for (const inp of allInputs()) {
    if (inp.tenure === "own" && inp.electrician) continue;
    const r = pick(inp, data);
    assert.equal(r.method, "cords", JSON.stringify(inp));
    assert.equal(r.panelAllowed, false);
    assert.ok(!r.alternatives.some((m) => m !== "cords"), `panel alternative offered: ${r.alternatives}`);
    assert.ok(r.parts.every((p) => p.id === "cords"));
  }
});

test("240 V loads only get 120/240 V models or a two-unit setup on the maker's own hub", () => {
  for (const inp of allInputs()) {
    if (inp.volts !== "240") continue;
    for (const m of pick(inp, data).matches) {
      const p = productById(m.c.productId);
      if (m.c.units === 2) {
        assert.equal(p.volts, "120V");
        assert.ok(m.c.hub, `${m.c.key} pair without a hub`);
      } else assert.equal(p.volts, "120/240V", `${m.c.key} offered for 240 V`);
    }
  }
});

test("sold-out models, sold-out add-ons and untracked brands are never recommended", () => {
  for (const c of data.candidates) {
    const p = productById(c.productId);
    assert.ok(!p.soldOut, c.key);
    assert.ok(AFFILIATES[p.brand].tracked, c.key);
    assert.notEqual(p.brand, "naturesgenerator");
    if (c.addOn) assert.ok(!p.addOn?.soldOut, `${c.key} add-on is sold out`);
  }
  assert.ok(!data.candidates.some((c) => c.productId === "anker-solix-f3800-plus"), "F3800 Plus is sold out");
  // A sold-out add-on is never counted, even if the data flips.
  const helios = data.candidates.find((c) => c.key === "growatt-helios-3600")!;
  assert.equal(helios.addOn, null);
});

test("a model that sells out disappears from the picker", () => {
  const apexOut: Product[] = PRODUCTS.map((p) => (p.id === "bluetti-apex-300" ? { ...p, soldOut: true } : p));
  const d = hookupData(apexOut);
  const r = pick({ ...DEFAULT_INPUT, volts: "240", loads: ["fridge", "well"], budget: "any" }, d);
  assert.ok(!r.matches.some((m) => m.c.productId === "bluetti-apex-300"));
});

test("anything at the panel says licensed electrician and permit", () => {
  for (const inp of allInputs()) {
    const r = pick(inp, data);
    if (r.method === "cords") {
      assert.equal(r.electrician, false);
      continue;
    }
    assert.equal(r.electrician, true);
    assert.equal(r.permit, true);
    assert.ok(r.parts.some((p) => p.id === "permit"), "permit missing from parts");
    assert.ok(r.notes.some((n) => /licensed electrician/i.test(n) && /permit/i.test(n)), "electrician + permit note missing");
  }
});

test("every result warns against backfeeding through a wall or dryer outlet", () => {
  for (const inp of allInputs()) assert.ok(pick(inp, data).notes.some((n) => /backfeeding/i.test(n) && /dryer outlet/i.test(n)));
});

test("battery size and watts come from the site's own load formulas", () => {
  const r = run({ loads: ["fridge", "router", "led", "phone"], days: 2 });
  assert.equal(Math.round(r.dailyWh), Math.round(dailyWh(r.covered)));
  assert.equal(Math.round(r.needWh), Math.round(outageBatteryWh(r.dailyWh, 2)));
  assert.equal(r.peakW, peakWatts(r.covered).peak);
});

test("cords can't reach a wired-in well pump or furnace: listed as not covered and left out of the sizing", () => {
  const r = run({ tenure: "rent", loads: ["fridge", "well", "furnace"] });
  assert.equal(r.method, "cords");
  assert.deepEqual(r.covered.map((c) => c.id), ["fridge"]);
  assert.equal(r.notCovered.length, 2);
  assert.ok(r.notes.some((n) => /owner's OK/.test(n)));
});

test("owner with a 240 V well pump and an electrician: a panel method and a 240 V setup that starts the pump", () => {
  const r = run({ loads: ["fridge", "well"], volts: "240", budget: "5000" });
  assert.equal(r.method, "switch");
  assert.ok(r.matches.length > 0);
  const top = r.matches[0];
  assert.ok(top.reachesNeed && top.startOk, JSON.stringify(top.c.key));
  assert.ok(top.c.has240);
  assert.ok(top.c.outlet);
});

test("no budget limit and a model with the maker's panel kit: the panel kit is offered, with no prices", () => {
  const r = run({ loads: ["fridge", "well"], volts: "240", budget: "any" });
  assert.equal(r.method, "panel");
  const apex = r.matches.find((m) => m.c.productId === "bluetti-apex-300")!;
  assert.ok(apex && apex.c.smartPanel);
  for (const k of ["equipmentUsd", "totalUsd", "overBudget"]) assert.ok(!(k in apex), k);
});

test("panel methods only offer models whose 30 A+ outlet we have read", () => {
  for (const inp of allInputs()) {
    const r = pick(inp, data);
    if (r.method === "interlock" || r.method === "switch") for (const m of r.matches) assert.ok(m.c.outlet, m.c.key);
  }
});

test("small plug-in needs on a tight budget stay on cords even for owners", () => {
  const r = run({ budget: "1500", loads: ["fridge", "router"] });
  assert.equal(r.method, "cords");
  assert.ok(r.alternatives.includes("interlock"));
});

test("parts ranges are low-high, sourced and dated", () => {
  for (const p of Object.values(PARTS)) {
    assert.ok(p.usd[0] > 0 && p.usd[0] <= p.usd[1], p.id);
    assert.match(p.source.url, /^https:\/\//);
    assert.match(p.source.retrieved, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("candidates carry specs from products.ts and no prices", () => {
  for (const c of data.candidates) {
    const p = productById(c.productId);
    assert.ok(!("priceUsd" in c), c.key);
    if (c.hub) assert.ok(!("usd" in c.hub), c.key);
    if (c.smartPanel) assert.ok(!("usd" in c.smartPanel), c.key);
    assert.equal(c.acOutputW, c.units === 1 ? p.acOutputW : c.hub ? c.acOutputW : NaN);
  }
});

test("an owner with only a few plug-in loads is told cords, with the panel ways as alternatives", () => {
  const r = run({ budget: "5000" });
  assert.equal(r.method, "cords");
  assert.deepEqual(r.alternatives, ["interlock", "switch", "panel"]);
  const many = run({ budget: "5000", loads: ["fridge", "freezer", "router", "led", "phone", "tv"] });
  assert.equal(many.method, "switch");
});

test("two-unit setups are only offered for 240 V, and setups that fit come first", () => {
  for (const inp of allInputs()) {
    const r = pick(inp, data);
    if (inp.volts === "120") assert.ok(r.matches.every((m) => m.c.units === 1));
    const firstMiss = r.matches.findIndex((m) => !(m.reachesNeed && m.startOk));
    if (firstMiss >= 0) assert.ok(r.matches.slice(firstMiss).every((m) => !(m.reachesNeed && m.startOk)), JSON.stringify(inp));
  }
});

test("setups that cover the need come smallest first; when none do, the biggest battery is shown first", () => {
  const r = run({ tenure: "rent", budget: "1500", loads: ["fridge", "router", "led", "phone"], days: 1 });
  const fits = r.matches.filter((m) => m.reachesNeed && m.startOk);
  for (let i = 1; i < fits.length; i++) assert.ok(fits[i - 1].totalWh <= fits[i].totalWh);
  const short = r.matches.filter((m) => !m.reachesNeed);
  for (let i = 1; i < short.length; i++) assert.ok(short[i - 1].totalWh >= short[i].totalWh);
});
