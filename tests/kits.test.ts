import { test } from "node:test";
import assert from "node:assert/strict";
import { AFFILIATES, cartUrl } from "../src/data/affiliates";
import { KITS, KIT_EXCLUDED, KITS_CHECKED, kitById } from "../src/data/kits";
import { componentSystemLink, configTotals, coverage, fitKit, kitCartLink, matchKits, shoppingListText, type KitNeed } from "../src/lib/kits";
import { CABIN_TIERS, DEFAULT_AUTONOMY_DAYS, dailyWh, peakWatts, sizeOffGrid } from "../src/lib/offgrid";
import { USABLE_FRACTION } from "../src/lib/everyday";

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const isHttps = (u: string) => /^https:\/\/[^\s]+$/.test(u);

test("every kit has lines, variant ids, prices, a date and sources", () => {
  assert.ok(KITS.length >= 9, `only ${KITS.length} kits`);
  const ids = KITS.map((k) => k.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const k of KITS) {
    assert.ok(k.lines.length > 0, `${k.id} has no lines`);
    assert.ok(isDate(k.checked), `${k.id} checked date`);
    assert.equal(k.checked, KITS_CHECKED);
    assert.ok(k.sources.length > 0 && k.sources.every(isHttps), `${k.id} sources`);
    assert.ok(AFFILIATES[k.brand].cartOrigin, `${k.id}: ${k.brand} has no cart origin`);
    const origin = new URL(AFFILIATES[k.brand].cartOrigin!).host;
    assert.ok(k.acOutputW > 0 && k.solarInputW > 0, `${k.id} station specs`);
    const extras = [k.addBattery, k.addPanel].filter((x) => x != null);
    for (const l of [...k.lines, ...extras]) {
      assert.ok(Number.isSafeInteger(l.variantId) && l.variantId > 1e9, `${k.id} variant id ${l.variantId}`);
      assert.ok(l.unitPriceUsd > 20 && l.unitPriceUsd < 20_000, `${k.id} price ${l.unitPriceUsd}`);
      assert.ok(isHttps(l.url) && new URL(l.url).host === origin, `${k.id} url ${l.url} is on ${origin}`);
      assert.ok(l.label.length > 5, `${k.id} label`);
      assert.ok(l.wh >= 0 && l.panelW >= 0 && l.wh + l.panelW > 0, `${k.id} line adds nothing`);
    }
    for (const l of k.lines) assert.ok(Number.isInteger(l.qty) && l.qty >= 1, `${k.id} qty`);
    for (const x of extras) {
      assert.ok(Number.isInteger(x.max) && x.max >= 1, `${k.id} extra max`);
      assert.ok(x.basis.length > 10, `${k.id} extra needs a stated basis`);
    }
    if (k.addPanel) {
      // Extras never push panels past the station's solar input.
      assert.ok(k.panelW + k.addPanel.max * k.addPanel.panelW <= k.solarInputW, `${k.id} panels exceed solar input`);
      assert.equal(k.addPanel.wh, 0);
    }
    if (k.addBattery) assert.equal(k.addBattery.panelW, 0);
    assert.ok(k.panelW <= k.solarInputW, `${k.id} panels exceed solar input`);
    assert.ok(k.batteryWh > 0, `${k.id} has no battery`);
  }
});

test("kit totals add up from the lines", () => {
  for (const k of KITS) {
    const wh = k.lines.reduce((t, l) => t + l.wh * l.qty, 0);
    const w = k.lines.reduce((t, l) => t + l.panelW * l.qty, 0);
    const usd = k.lines.reduce((t, l) => t + l.unitPriceUsd * l.qty, 0);
    assert.ok(Math.abs(k.batteryWh - wh) < 0.01, `${k.id} Wh`);
    assert.equal(k.panelW, w, `${k.id} W`);
    assert.ok(Math.abs(k.priceUsd - usd) < 0.01, `${k.id} price`);
    const none = configTotals({ kit: k, extraBatteries: 0, extraPanels: 0 });
    assert.equal(none.priceUsd, k.priceUsd);
    assert.equal(none.batteryWh, k.batteryWh);
  }
  // Spot checks against the stores' own figures on Oct 26 2026.
  assert.equal(kitById("bluetti-ac180-200w").priceUsd, 769);
  assert.equal(kitById("bluetti-apex-300-4xb300k-1000w").priceUsd, 1599 + 4 * 1079 + 2 * 799);
  assert.equal(kitById("bluetti-apex-300-4xb300k-1000w").batteryWh, 13824);
  assert.equal(kitById("ecoflow-delta-pro-3-2eb-800w").batteryWh, 12288);
});

test("covers the range from a weekend cabin to the biggest systems", () => {
  assert.ok(KITS.some((k) => k.batteryWh >= 1000 && k.batteryWh <= 2100 && k.panelW >= 200 && k.panelW <= 400), "weekend size");
  assert.ok(KITS.some((k) => k.batteryWh >= 12000), "part-time cabin size");
  for (const b of ["bluetti", "ecoflow", "jackery"] as const) assert.ok(KITS.filter((k) => k.brand === b).length >= 3, `${b} kits`);
  assert.ok(KIT_EXCLUDED.length > 0 && KIT_EXCLUDED.every((x) => x.reason && isDate(x.checked)));
});

test("extras update totals, clamp to the brand's limit, and merge into cart lines", () => {
  const k = kitById("bluetti-apex-300-4xb300k-1000w");
  const t = configTotals({ kit: k, extraBatteries: 99, extraPanels: 5 });
  assert.equal(t.batteryWh, Math.round((13824 + 2 * 2764.8) * 100) / 100);
  assert.equal(t.priceUsd, k.priceUsd + 2 * 1079);
  assert.equal(t.panelW, 1000);
  const b300k = t.items.find((i) => i.variantId === 47262756896987)!;
  assert.equal(b300k.qty, 6);
  assert.equal(t.items.length, 3);
  const ac = configTotals({ kit: kitById("bluetti-ac180-200w"), extraBatteries: 1, extraPanels: 1 });
  assert.equal(ac.panelW, 400);
  assert.equal(ac.batteryWh, 1152);
  assert.equal(ac.priceUsd, 769 + 349);
  assert.equal(configTotals({ kit: k, extraBatteries: -3, extraPanels: Number.NaN }).priceUsd, k.priceUsd);
});

test("cart links: Shopify permalink, merged lines, wrapped in Awin for Bluetti, plain for untracked brands", () => {
  const raw = cartUrl("ecoflow", [
    { variantId: 41826183151689, qty: 1 },
    { variantId: 41631849971785, qty: 1 },
    { variantId: 41826183151689, qty: 1 },
    { variantId: 39993294454857, qty: 0 },
  ]);
  assert.equal(raw.href, "https://us.ecoflow.com/cart/41826183151689:2,41631849971785:1?storefront=true");
  assert.equal(raw.tracked, false);

  const bl = kitCartLink({ kit: kitById("bluetti-apex-300-4xb300k-1000w"), extraBatteries: 1, extraPanels: 0 });
  assert.equal(bl.tracked, true);
  const u = new URL(bl.href);
  assert.equal(u.host, "www.awin1.com");
  assert.equal(u.searchParams.get("awinmid"), "59271");
  assert.equal(u.searchParams.get("ued"), "https://www.bluettipower.com/cart/47351562174683:1,47262756896987:5,49003448860891:2?storefront=true");

  const jk = kitCartLink({ kit: kitById("jackery-5000-plus-1000w"), extraBatteries: 1, extraPanels: 0 });
  assert.equal(jk.href, "https://www.jackery.com/cart/41341600038999:1,41317176213591:1?storefront=true");
  assert.throws(() => cartUrl("anker", [{ variantId: 1, qty: 1 }]));
  assert.throws(() => cartUrl("bluetti", []));

  const shop = componentSystemLink();
  assert.equal(shop.href, "https://shopsolarkits.com/");
  assert.equal(shop.tracked, false);
  assert.equal(AFFILIATES.shopsolar.tracked, false);
});

const need = (batteryWh: number, panelW: number, runningW: number, whPerDay = batteryWh * USABLE_FRACTION / 3): KitNeed => ({ batteryWh, panelW, runningW, whPerDay });

test("matching: cheapest covering kit first, then value or room to grow, then another brand", () => {
  const m = matchKits(need(1000, 300, 200));
  assert.equal(m.tooBig, false);
  assert.ok(m.picks.length >= 2 && m.picks.length <= 3);
  assert.equal(m.picks[0].role, "least");
  assert.equal(m.picks[0].label, "Covers it for the least");
  for (const p of m.picks) if (p.role !== "short") assert.ok(p.coverage.covers, `${p.config.kit.id} should cover`);
  const prices = m.picks.filter((p) => p.role !== "least").map((p) => p.totals.priceUsd);
  for (const x of prices) assert.ok(x >= m.picks[0].totals.priceUsd);
  const brands = new Set(m.picks.map((p) => p.config.kit.brand));
  assert.ok(brands.size >= 2, "at least two brands");
  // The weekend kit adds a second panel to get closer to 300 W.
  const ac = m.picks.find((p) => p.config.kit.id === "bluetti-ac180-200w");
  if (ac) assert.equal(ac.config.extraPanels, 1);
});

test("matching: coverage figures are honest", () => {
  const k = kitById("bluetti-elite-400-700w");
  const c = coverage({ kit: k, extraBatteries: 0, extraPanels: 0 }, { batteryWh: 3000, panelW: 2430, runningW: 3000, whPerDay: 1000 });
  assert.equal(c.usablePanelW, 700);
  assert.equal(c.panelPct, Math.round((700 / 2430) * 100));
  assert.equal(c.inputCapped, true, "Elite 400 takes 1,000 W, under the 2,430 W need");
  assert.equal(c.runsAll, false);
  assert.equal(c.covers, false);
  assert.ok(Math.abs(c.batteryDays! - (3840 * USABLE_FRACTION) / 1000) < 1e-9);
  const unknown = coverage({ kit: k, extraBatteries: 0, extraPanels: 0 }, { batteryWh: 3000, panelW: 0, runningW: 0, whPerDay: 0 });
  assert.equal(unknown.panelPct, null);
  assert.equal(unknown.runsAll, null);
  assert.equal(unknown.batteryDays, null);
  assert.equal(unknown.covers, true);
});

test("matching: a 13 kWh part-time cabin gets a 13 kWh-class kit with extras", () => {
  const m = matchKits(need(13000, 2400, 1500));
  assert.equal(m.tooBig, false);
  const first = m.picks[0];
  assert.ok(first.totals.batteryWh >= 13000);
  assert.ok(first.coverage.panelPct! < 100, "no plug-and-play kit's panels reach 2.4 kW here; shown honestly");
  // Kits from other brands that come close are shown, marked short.
  for (const p of m.picks.slice(1)) if (p.role === "short") assert.ok(!p.coverage.covers && p.totals.batteryWh >= 13000 * 0.75);
  assert.ok(m.picks.length >= 2, "nearest kits from other brands fill in");
  const f = fitKit(kitById("bluetti-apex-300-b300k-700w"), need(13000, 0, 0));
  assert.equal(f.extraBatteries, 3);
});

test("matching: too big for any kit returns the closest with shortfalls and the component fallback", () => {
  const m = matchKits(need(60000, 9000, 9000));
  assert.equal(m.tooBig, true);
  assert.ok(m.picks.length >= 1 && m.picks.length <= 3);
  assert.equal(new Set(m.picks.map((p) => p.config.kit.brand)).size, m.picks.length);
  for (const p of m.picks) {
    assert.equal(p.role, "closest");
    assert.ok(p.coverage.batteryShortWh > 0);
    assert.equal(p.coverage.covers, false);
  }
  // The biggest Bluetti option is used at its maximum.
  const bl = m.picks.find((p) => p.config.kit.brand === "bluetti")!;
  assert.ok(bl.totals.batteryWh >= 19000);
});

test("every cabin tier in a dark and a sunny state gets kits or the fallback, never nothing", () => {
  for (const perKwDay of [1.2, 4.5]) {
    for (const t of CABIN_TIERS) {
      const wh = dailyWh(t.picks);
      const s = sizeOffGrid({ whPerDay: wh, perKwDay, days: DEFAULT_AUTONOMY_DAYS });
      const m = matchKits({ batteryWh: s.batteryWh, panelW: s.panelW, runningW: peakWatts(t.picks).running, whPerDay: wh });
      assert.ok(m.picks.length > 0, `${t.id} at ${perKwDay}`);
      for (const p of m.picks) {
        assert.ok(Number.isFinite(p.totals.priceUsd) && p.totals.priceUsd > 0);
        assert.ok(p.coverage.batteryDays == null || Number.isFinite(p.coverage.batteryDays));
        assert.match(kitCartLink(p.config).href, /^https:\/\//);
      }
    }
  }
});

test("shopping list text has every item, the total and the cart link", () => {
  const c = { kit: kitById("ecoflow-delta-3-plus-220w"), extraBatteries: 1, extraPanels: 1 };
  const txt = shoppingListText(c, "EcoFlow", "Oct 26, 2026");
  assert.match(txt, /1 x DELTA 3 Plus/);
  assert.match(txt, /Smart Extra Battery/);
  assert.match(txt, /220 W bifacial/);
  assert.match(txt, /Total: \$1,727\.00/);
  assert.match(txt, /us\.ecoflow\.com\/cart\/41826183151689:1,41631849971785:1,39993294454857:1\?storefront=true/);
});
