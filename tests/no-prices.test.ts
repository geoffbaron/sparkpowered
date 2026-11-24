// Spark Powered lists no product prices (Nov 24 2026): every product links to the
// seller's own page for today's price. These checks keep prices from creeping back.
// Market averages (EnergySage per kWh and per watt, HomeGuide and Qmerit install
// ranges, EIA energy prices, DOE line costs) and incentives are not product prices
// and stay allowed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PLUGIN_KITS, PRODUCTS } from "../src/data/products";
import { BATTERIES } from "../src/data/batteries";
import { BOAT_BATTERIES } from "../src/data/boating";
import { AFFILIATES } from "../src/data/affiliates";
import { batteryProduct, reviewedProduct } from "../src/lib/structured-data";
import { productJson } from "../src/components/products";

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|json)$/.test(p) ? [p] : [];
  });
const SRC = files("src").map((f) => ({ f, text: readFileSync(f, "utf8") }));

// Brand names whose products we link to. EnergySage is a quote service whose
// market averages we do cite, so it is left out.
const BRANDS = [...new Set(Object.values(AFFILIATES).map((a) => a.name))]
  .filter((n) => n !== "EnergySage")
  .concat(["Jackery", "DJI", "Renogy", "Battle Born", "Lectric", "Aventon", "Torqeedo", "ePropulsion", "Grizzl-E", "ChargePoint", "Emporia"]);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const NEAR = new RegExp(`(?:${BRANDS.map(esc).join("|")})[^.\\n]{0,80}\\$\\d`);

test("no product data or code carries a price field", () => {
  const field = /\b(?:priceUsd|listPriceUsd|unitPriceUsd|packagePriceUsd|motorPriceUsd|salePriceUsd|makerWasUsd|installedPerKwh|pluginKitUsd|salePrice|saleEndsAt|regularPrice)\b/;
  const hits = SRC.filter(({ text }) => field.test(text)).map(({ f }) => f);
  assert.deepEqual(hits, []);
});


test("product markup has no offers or prices", () => {
  const trees = [
    ...PRODUCTS.map((p) => productJson(p, "/best-portable-power-stations")),
    ...BOAT_BATTERIES.map((b) => batteryProduct(b, "/fish-finder-battery")),
    ...BATTERIES.map((b) => batteryProduct({ ...b, name: `Redodo ${b.model}`, maker: "Redodo" }, "/best-trolling-motor-battery")),
    ...PLUGIN_KITS.map((k) => reviewedProduct({ name: k.name, brand: k.brand, url: k.url, pagePath: "/plug-in-solar", description: "x" })),
  ];
  for (const t of trees) {
    const json = JSON.stringify(t);
    assert.ok(!/"offers"|"price"/.test(json), json.slice(0, 120));
  }
});

test("no dollar figure sits next to a product brand in the source", () => {
  const hits: string[] = [];
  for (const { f, text } of SRC) {
    if (/state-incentives|state-local|incentives\.ts|admin\//.test(f)) continue;
    for (const line of text.split("\n")) {
      const m = line.match(NEAR);
      // Public charging network rates (per kWh) are energy prices, not product prices.
      if (m && !/Supercharger members/.test(m[0])) hits.push(`${f}: ${m[0]}`);
    }
  }
  assert.deepEqual(hits, []);
});

test("llms.txt quotes no product price", () => {
  const llms = readFileSync("public/llms.txt", "utf8");
  const bad = llms.split("\n").filter((l) => NEAR.test(l) || /price \$\d|at \$\d/.test(l));
  assert.deepEqual(bad, []);
  assert.match(llms, /We do not list product prices/);
});

