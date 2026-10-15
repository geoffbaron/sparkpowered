import { test } from "node:test";
import assert from "node:assert/strict";
import { PLUGIN_KITS, PRODUCTS } from "../src/data/products";
import { AFFILIATES, partnerUrl, type BrandId } from "../src/data/affiliates";
import { STATE_LAWS } from "../src/data/plugin-solar-law";
import { COMPARISONS } from "../src/data/comparisons";
import { sizerMatches, sizerConfig, productById } from "../src/lib/products";
import { pluginFigures, pluginModel } from "../src/lib/plugin-solar";
import { STATES, stateByAbbr } from "../src/lib/energy";
import { ROUTES } from "../src/lib/seo";

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const isHttps = (u: string) => /^https:\/\/[^\s]+$/.test(u);

test("dataset is non-trivial and ids are unique", () => {
  assert.ok(PRODUCTS.length >= 15, `only ${PRODUCTS.length} products`);
  const ids = PRODUCTS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/);
  for (const c of ["portable", "home"] as const)
    assert.ok(PRODUCTS.some((p) => p.category === c), `no ${c} products`);
  assert.ok(PLUGIN_KITS.length >= 4, "plug-in kits");
});

test("every product has a source URL and a retrieval date", () => {
  for (const p of PRODUCTS) {
    assert.ok(isHttps(p.url), `${p.id} url`);
    assert.ok(isHttps(p.sourceUrl), `${p.id} sourceUrl`);
    assert.ok(isDate(p.retrieved), `${p.id} retrieved`);
    assert.ok(Date.parse(p.retrieved) <= Date.now(), `${p.id} retrieved in the future`);
    if (p.addOn) assert.ok(isHttps(p.addOn.url), `${p.id} add-on url`);
    if (p.installedPerKwh) {
      assert.ok(isHttps(p.installedPerKwh.url));
      assert.ok(isDate(p.installedPerKwh.retrieved));
    }
  }
  for (const k of PLUGIN_KITS) {
    assert.ok(isHttps(k.url) && isHttps(k.sourceUrl), `${k.id} urls`);
    assert.ok(isDate(k.retrieved), `${k.id} retrieved`);
    assert.ok(k.inverterW > 0 && k.inverterW <= 2000 && k.priceUsd > 0, `${k.id} specs`);
    assert.ok(k.brand in AFFILIATES, `${k.id} brand`);
  }
  const kitIds = [...PRODUCTS.map((p) => p.id), ...PLUGIN_KITS.map((k) => k.id)];
  assert.equal(new Set(kitIds).size, kitIds.length, "ids unique across products and kits");
});

test("specs are plausible and internally consistent", () => {
  for (const p of PRODUCTS) {
    assert.ok(p.capacityWh > 0 && p.capacityWh < 100_000, `${p.id} capacity`);
    assert.ok(p.acOutputW > 0 && p.acOutputW <= 30_000, `${p.id} output`);
    assert.ok(p.chemistry === null || ["LFP", "NMC"].includes(p.chemistry), `${p.id} chemistry`);
    if (p.warrantyYears != null) assert.ok(p.warrantyYears >= 1 && p.warrantyYears <= 25, `${p.id} warranty`);
    if (p.install === "professional") assert.ok(p.priceUsd == null || p.installedPerKwh, `${p.id} installed cost`);
    if (p.maxCapacityWh != null) assert.ok(p.maxCapacityWh > p.capacityWh, `${p.id} max capacity`);
    if (p.surgeW != null) assert.ok(p.surgeW >= p.acOutputW, `${p.id} surge`);
    if (p.priceUsd != null) assert.ok(p.priceUsd > 50 && p.priceUsd < 50_000, `${p.id} price`);
    if (p.priceUsd == null) assert.ok(p.priceNote, `${p.id} needs a priceNote when unpriced`);
    if (p.listPriceUsd != null && p.priceUsd != null) assert.ok(p.listPriceUsd >= p.priceUsd, `${p.id} list price`);
    if (p.addOn) {
      assert.ok(p.maxCapacityWh, `${p.id} has add-on but no max capacity`);
      assert.ok(p.capacityWh + p.addOn.capacityWh * p.addOn.maxUnits <= p.maxCapacityWh! + 1, `${p.id} add-on exceeds stated max`);
    }
    assert.ok(p.brand in AFFILIATES, `${p.id} brand missing from affiliate config`);
  }
});

test("affiliate config: untracked brands link to their own pages; tracked brands have a usable link", () => {
  for (const [brand, a] of Object.entries(AFFILIATES) as [BrandId, (typeof AFFILIATES)[BrandId]][]) {
    assert.ok(isHttps(a.homeUrl), `${brand} homeUrl`);
    const plain = partnerUrl(brand, { productUrl: "https://example.com/p" });
    if (!a.tracked) {
      assert.equal(plain.href, "https://example.com/p");
      assert.equal(plain.tracked, false);
    } else {
      const any = a.deepLink || a.links?.home || a.links?.battery || a.links?.solar || Object.keys(a.productLinks ?? {}).length;
      assert.ok(any, `${brand} is tracked but has no links`);
      if (a.deepLink) assert.ok(a.deepLink.includes("{url}"), `${brand} deepLink needs {url}`);
    }
  }
});

test("plug-in solar law entries cite the legislature and use real states", () => {
  assert.ok(STATE_LAWS.some((l) => l.abbr === "UT" && l.status === "law"), "Utah law missing");
  const abbrs = STATE_LAWS.map((l) => l.abbr);
  assert.equal(new Set(abbrs).size, abbrs.length);
  for (const l of STATE_LAWS) {
    assert.ok(stateByAbbr(l.abbr), l.abbr);
    assert.ok(isHttps(l.url), `${l.abbr} url`);
    assert.ok(l.summary.length > 20, `${l.abbr} summary`);
  }
});

test("plug-in solar model covers every state and is below rooftop-free bounds", () => {
  for (const s of STATES) {
    const m = pluginModel(s.abbr);
    assert.ok(m.tilted.kwhPerKwYear > 800 && m.tilted.kwhPerKwYear < 2000, s.abbr);
    assert.ok(m.vertical_s.kwhPerKwYear < m.tilted.kwhPerKwYear, `${s.abbr} vertical should be lower`);
    const f = pluginFigures(s, 800, "tilted", 1000);
    assert.ok(f.kwhYear > 600 && f.kwhYear < 1600, `${s.abbr} 800 W kit kWh`);
    assert.ok(f.paybackYears! > 1, `${s.abbr} payback`);
  }
});

test("battery sizer returns 2-4 real products that reach the computed size", () => {
  for (const kwhNeeded of [5, 6, 12, 18, 30, 50, 106]) {
    const m = sizerMatches(kwhNeeded);
    const min = kwhNeeded > 60 ? 1 : 2;
    assert.ok(m.length >= min && m.length <= 4, `${kwhNeeded} kWh gave ${m.length}`);
    for (const x of m) {
      const c = sizerConfig(x.product, kwhNeeded);
      assert.ok(c.totalWh >= kwhNeeded * 1000, `${x.product.id} config too small for ${kwhNeeded} kWh`);
    }
  }
  assert.ok(sizerMatches(12, { excludeBrands: ["tesla"] }).every((x) => x.product.brand !== "tesla"));
});

test("comparisons reference products in the dataset and have unique slugs", () => {
  assert.ok(COMPARISONS.length >= 6 && COMPARISONS.length <= 10);
  const slugs = COMPARISONS.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const c of COMPARISONS) {
    assert.match(c.slug, /^[a-z0-9-]+-vs-[a-z0-9-]+$/);
    for (const pair of c.pairs) {
      productById(pair[0]);
      productById(pair[1]);
    }
    assert.ok(c.verdict.length > 80, `${c.slug} verdict too thin`);
  }
});

test("new money pages are in the sitemap", () => {
  const paths = ROUTES.map((r) => r.path);
  for (const p of ["/plug-in-solar", "/best-portable-power-stations", "/home-battery-backup", "/compare"])
    assert.ok(paths.includes(p), p);
});
