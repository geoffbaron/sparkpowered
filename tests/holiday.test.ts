import { test } from "node:test";
import assert from "node:assert/strict";
import { LIGHT_PRESETS, gasUsdPerMcf, heatCostPerHour, lightsCost, stringWatts } from "../src/lib/holiday";

test("lights cost is watts x hours x days at the rate", () => {
  // 400 W, 6 h, 40 nights = 96 kWh; at 18 cents = $17.28
  const c = lightsCost(400, 18, 6, 40);
  assert.equal(c.kwh, 96);
  assert.ok(Math.abs(c.usd - 17.28) < 1e-9);
});

test("every incandescent preset has an LED twin that draws less", () => {
  for (const p of LIGHT_PRESETS.filter((p) => p.id.startsWith("inc-"))) {
    const led = LIGHT_PRESETS.find((q) => q.id === p.id.replace("inc-", "led-"));
    assert.ok(led, `${p.id} has no LED twin`);
    assert.ok(stringWatts(led!) < stringWatts(p));
  }
});

test("space heater math: 1,500 W at 18 cents is 27 cents an hour; heat pump is cheaper", () => {
  const h = heatCostPerHour(18, 15);
  assert.ok(Math.abs(h.heater - 0.27) < 1e-9);
  assert.ok(h.heatPump < h.heater);
  assert.ok(h.furnace > 0 && h.furnace < h.heater);
});

test("gas price falls back to national for unknown states", () => {
  assert.ok(gasUsdPerMcf("ZZ") > 0);
  assert.ok(gasUsdPerMcf(null) > 0);
  assert.ok(gasUsdPerMcf("AL") > 0);
});
