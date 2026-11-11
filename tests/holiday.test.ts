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

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { DATA_UPDATED, NATIONAL, SOURCES, STATES } from "../src/lib/energy";
import { DATA_ROUTES } from "../src/lib/seo";
import sitemap from "../src/app/sitemap";
import {
  formatChangePct,
  lightsByState,
  lightsKeyFindings,
  priceChangePct,
  ytdWindowWords,
} from "../src/lib/holiday";

test("year-over-year change: sign and whole-percent rounding", () => {
  assert.equal(formatChangePct(14.7), "+15%");
  assert.equal(formatChangePct(-9.07), "-9%");
  assert.equal(formatChangePct(-0.07), "0%");
  assert.ok(Math.abs(priceChangePct(18.19, 17.03) - 6.81) < 0.01);
});

test("every state row carries its price change, computed from the data", () => {
  for (const r of lightsByState()) {
    const e = r.s.electricity;
    assert.ok(Number.isFinite(r.pct), r.s.name);
    assert.ok(Math.abs(r.pct - (e.residentialCentsPerKwhYtd / e.residentialCentsPerKwhYtdPrevYear - 1) * 100) < 1e-9);
  }
});

test("key findings follow the data: priciest, cheapest, biggest rises, largest drop", () => {
  const kf = lightsKeyFindings();
  const rows = lightsByState();
  assert.equal(kf.priciest.s.abbr, rows[0].s.abbr);
  assert.equal(kf.cheapest.s.abbr, rows[rows.length - 1].s.abbr);
  assert.ok(kf.biggestRises.length <= 3);
  for (let i = 1; i < kf.biggestRises.length; i++) assert.ok(kf.biggestRises[i - 1].pct >= kf.biggestRises[i].pct);
  const maxPct = Math.max(...rows.map((r) => r.pct));
  if (kf.biggestRises.length) assert.equal(kf.biggestRises[0].pct, maxPct);
  const minPct = Math.min(...rows.map((r) => r.pct));
  assert.equal(kf.largestDrop ? kf.largestDrop.pct : null, Math.round(minPct) < 0 ? minPct : null);
  assert.equal(kf.bulbBeatsState, kf.priciest.led < kf.cheapest.old);
  assert.ok(kf.c9OldString > 0 && kf.usLed > 0 && kf.usOld > kf.usLed);
});

// The numbers in the press pitch (story.md) on EIA's August 2026 data. When the
// data moves to a later month, this block skips; recheck the pitch then.
const august = SOURCES.electricityPrice.ytdLabel === "August 2026 YTD";
test("pitch numbers on August 2026 data", { skip: !august && "data is no longer August 2026" }, () => {
  const kf = lightsKeyFindings();
  const r2 = (n: number) => n.toFixed(2);
  assert.equal(NATIONAL.residentialCentsPerKwhYtd, 18.19);
  assert.equal(r2(kf.usLed), "3.06");
  assert.equal(r2(kf.usOld), "17.46");
  assert.equal(kf.priciest.s.name, "Hawaii");
  assert.equal(r2(kf.priciest.old), "44.55");
  assert.equal(r2(kf.priciest.led), "7.80");
  assert.equal(kf.cheapest.s.name, "North Dakota");
  assert.equal(r2(kf.cheapest.old), "11.96");
  assert.equal(r2(kf.cheapest.led), "2.09");
  assert.equal(Math.round(kf.usChangePct), 7);
  assert.deepEqual(kf.biggestRises.map((r) => [r.s.abbr, formatChangePct(r.pct)]), [["DC", "+17%"], ["NH", "+15%"], ["HI", "+15%"]]);
  assert.equal(kf.largestDrop?.s.abbr, "CT");
  assert.equal(formatChangePct(kf.largestDrop!.pct), "-9%");
  assert.equal(r2(kf.c9OldString), "7.64");
  assert.equal(kf.bulbBeatsState, true);
  const rows = lightsByState();
  assert.deepEqual(rows.slice(0, 5).map((r) => r.s.abbr), ["HI", "CA", "ME", "MA", "NY"]);
  assert.equal(ytdWindowWords(), "January to August 2026");
  assert.equal(SOURCES.electricityPrice.released, "2026-10-23");
});

test("the lights page has the key findings, the vs-last-year column, the cite line and the press contact", () => {
  const page = readFileSync("src/app/christmas-lights-cost/page.tsx", "utf8");
  for (const s of ['data-testid="key-findings"', "vs last year", 'data-testid="how-to-cite"', 'data-testid="press-contact"', "geoff@mylastlap.com"]) {
    assert.ok(page.includes(s), s);
  }
  // The press address must be the one published on /about.
  assert.ok(readFileSync("src/app/about/page.tsx", "utf8").includes("geoff@mylastlap.com"));
  // No figure typed into the key findings: no dollar amounts or percents in the source text.
  const block = page.slice(page.indexOf('id="key-findings"'), page.indexOf("<QuickAnswer>"));
  assert.ok(!/\$\d|\d%/.test(block), "key findings must be computed, not typed");
});

test("CSV has the change_vs_last_year_pct column and the source line", async () => {
  const { GET } = await import("../src/app/christmas-lights-cost/data.csv/route");
  const text = await GET().text();
  const lines = text.trim().split("\n");
  assert.ok(lines[0].endsWith(",change_vs_last_year_pct"));
  assert.equal(lines[1].split(",").length, 6);
  assert.match(lines[lines.length - 1], /^"?Source: Spark Powered/);
  assert.equal(lines.filter((l) => /^\d+,/.test(l)).length, STATES.length);
});

test("sitemap dates of data pages follow DATA_UPDATED", () => {
  const map = sitemap();
  for (const path of DATA_ROUTES) {
    const e = map.find((m) => m.url.endsWith(path === "/" ? ".com" : path) || m.url.endsWith(path));
    assert.ok(e, path);
    assert.ok(String(e!.lastModified) >= DATA_UPDATED, `${path} lastModified ${e!.lastModified}`);
  }
  // Every route page that shows DATA_UPDATED is in DATA_ROUTES.
  for (const dir of readdirSync("src/app")) {
    const f = `src/app/${dir}/page.tsx`;
    if (!existsSync(f) || !readFileSync(f, "utf8").includes("DATA_UPDATED")) continue;
    if (dir === "states") continue;
    assert.ok(DATA_ROUTES.has(`/${dir}`), `/${dir} uses DATA_UPDATED but is not in DATA_ROUTES`);
  }
});
