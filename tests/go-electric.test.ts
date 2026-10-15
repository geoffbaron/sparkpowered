import { test } from "node:test";
import assert from "node:assert/strict";
import { plan, evSwitch, heatPumpSwitch, ASSUMPTIONS } from "../src/lib/go-electric";
import { PLANNER_COSTS, PLANNER_STATES, TYPICAL_TOTALS, defaultInputs } from "../src/lib/planner-data";
import { MYTHS } from "../src/data/myths";
import { HOME_CHARGERS } from "../src/data/chargers";
import { AFFILIATES, partnerUrl } from "../src/data/affiliates";
import { lifeTerms } from "../src/lib/everyday";
import home from "../src/data/home-energy.json";

const isHttps = (u: string) => /^https:\/\//.test(u);

test("home energy data covers every state with a gas price", () => {
  for (const st of PLANNER_STATES) {
    const h = (home.states as Record<string, { gasUsdPerMcf: number | null }>)[st.abbr];
    assert.ok(h && h.gasUsdPerMcf && h.gasUsdPerMcf > 3 && h.gasUsdPerMcf < 80, `${st.abbr} gas price`);
  }
});

test("planner produces finite, sensible results for every state", () => {
  for (const st of PLANNER_STATES) {
    const r = plan(st, defaultInputs(st), PLANNER_COSTS);
    assert.ok(Number.isFinite(r.total), st.abbr);
    assert.ok(r.total > 500 && r.total < 10000, `${st.abbr} total ${r.total}`);
    for (const s of r.all) if (s.yearly != null) assert.ok(Number.isFinite(s.yearly), `${st.abbr} ${s.id}`);
    assert.equal(TYPICAL_TOTALS[st.abbr], Math.round(r.total / 10) * 10);
  }
});

test("EV saving matches hand arithmetic", () => {
  const st = PLANNER_STATES.find((s) => s.abbr === "OH")!;
  const r = evSwitch(st, { ...defaultInputs(st), car: "average", milesPerWeek: 100 });
  const miles = 5200;
  const gas = (miles / 25.5) * st.gasolineUsd;
  const ev = (miles / 100) * 31.1 * (st.centsPerKwh / 100);
  const maint = (miles * (ASSUMPTIONS.maintenance.gasCentsPerMile - ASSUMPTIONS.maintenance.evCentsPerMile)) / 100;
  assert.ok(Math.abs(r.yearly! - (gas - ev + maint)) < 0.01);
});

test("heat pump is honest: resistance heat always saves, owners of heat pumps are skipped", () => {
  for (const st of PLANNER_STATES) {
    assert.ok(heatPumpSwitch(st, { ...defaultInputs(st), heat: "electric" }).yearly! > 0, st.abbr);
    assert.ok(heatPumpSwitch(st, { ...defaultInputs(st), heat: "heatpump" }).skip);
  }
});

test("renters get plug-in solar, not rooftop", () => {
  const st = PLANNER_STATES[0];
  const r = plan(st, { ...defaultInputs(st), home: "rent" }, PLANNER_COSTS);
  assert.ok(r.counted.includes("plugin") && !r.counted.includes("solar"));
});

test("every myth has a short answer, a verdict and https sources", () => {
  const ids = MYTHS.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(MYTHS.length >= 13);
  for (const m of MYTHS) {
    assert.ok(m.short.length > 30 && m.answer.length > 80, m.id);
    assert.ok(m.sources.length >= 1 && m.sources.every((s) => isHttps(s.url)), m.id);
  }
});

test("home chargers are sourced, dated and use tracked Lectron links", () => {
  for (const c of HOME_CHARGERS) {
    assert.ok(isHttps(c.url) && isHttps(c.sourceUrl) && /^\d{4}-\d{2}-\d{2}$/.test(c.retrieved), c.id);
    const link = partnerUrl(c.brand, { productId: c.id, productUrl: c.url });
    assert.ok(link.tracked && link.href.startsWith("https://www.awin1.com/"), c.id);
  }
  assert.equal(AFFILIATES.lectron.tracked, true);
});

test("battery life terms scale with capacity", () => {
  const a = lifeTerms(1000);
  const b = lifeTerms(2000);
  assert.ok(Math.abs(b.fridgeHours - 2 * a.fridgeHours) < 1e-9);
  assert.ok(a.fridgeHours > 5 && a.fridgeHours < 15);
});
