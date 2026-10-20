import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PLUGIN_KITS, PRODUCTS } from "../src/data/products";
import { BATTERIES } from "../src/data/batteries";
import { BOAT_BATTERIES } from "../src/data/boating";
import { batteryProduct, reviewedProduct } from "../src/lib/structured-data";
import { productJson } from "../src/components/products";

type Node = Record<string, unknown>;

/** Every object in a JSON-LD tree, depth first. */
function nodes(x: unknown, out: Node[] = []): Node[] {
  if (Array.isArray(x)) x.forEach((y) => nodes(y, out));
  else if (x && typeof x === "object") {
    out.push(x as Node);
    Object.values(x).forEach((y) => nodes(y, out));
  }
  return out;
}

const nonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;

function checkOffer(o: Node, where: string) {
  const price = o["@type"] === "AggregateOffer" ? o.lowPrice : o.price;
  assert.ok(price != null && Number.isFinite(Number(price)), `${where}: offer without a price`);
  assert.equal(o.priceCurrency, "USD", `${where}: offer currency`);
  assert.match(String(o.availability), /^https:\/\/schema\.org\//, `${where}: offer without availability`);
}

function checkProduct(p: Node, where: string) {
  assert.ok(nonEmpty(p.name), `${where}: Product without name`);
  assert.ok(nonEmpty(p.image), `${where}: ${p.name} has no image`);
  assert.ok(nonEmpty(p.description), `${where}: ${p.name} has no description`);
  const brand = p.brand as Node | undefined;
  assert.ok(brand && brand["@type"] === "Brand" && nonEmpty(brand.name), `${where}: ${p.name} has no brand`);
  assert.equal(p.aggregateRating, undefined, `${where}: ${p.name} claims ratings we do not have`);
  const review = p.review as Node | undefined;
  assert.ok(review && review["@type"] === "Review", `${where}: ${p.name} is not marked as our review`);
  assert.equal((review.author as Node).name, "Spark Powered", `${where}: review author`);
  assert.match(String(review.datePublished), /^\d{4}-\d{2}-\d{2}$/, `${where}: review date`);
  if (p.offers) {
    const o = p.offers as Node;
    // A plain Offer reads to Google as us selling the item (a merchant listing).
    assert.equal(o["@type"], "AggregateOffer", `${where}: ${p.name} offer type`);
    checkOffer(o, `${where}: ${p.name}`);
  }
}

function checkTree(data: unknown, where: string) {
  for (const n of nodes(data)) {
    if (n["@type"] === "Product") checkProduct(n, where);
    if (n["@type"] === "Dataset") {
      const sc = n.spatialCoverage as Node | undefined;
      assert.ok(sc && typeof sc === "object" && sc["@type"] === "Place" && nonEmpty(sc.name), `${where}: Dataset spatialCoverage must be a Place`);
    }
  }
}

test("generated product markup is complete for every product we list", () => {
  for (const p of PRODUCTS) checkTree(productJson(p, "/best-portable-power-stations"), p.id);
  for (const b of BOAT_BATTERIES) checkTree(batteryProduct(b, "/fish-finder-battery"), b.id);
  for (const b of BATTERIES) checkTree(batteryProduct({ ...b, name: `Redodo ${b.model}`, maker: "Redodo" }, "/best-trolling-motor-battery"), b.id);
  for (const k of PLUGIN_KITS)
    checkTree(reviewedProduct({ name: k.name, brand: k.brand, url: k.url, pagePath: "/plug-in-solar", description: "x", priceUsd: k.priceUsd }), k.id);
});

test("Product markup is only built through src/lib/structured-data.ts", () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(p) ? [p] : [];
    });
  for (const f of files("src")) {
    if (f.endsWith("structured-data.ts")) continue;
    assert.doesNotMatch(readFileSync(f, "utf8"), /"@type":\s*"Product"/, `${f} builds Product markup by hand`);
  }
});

// After `next build`, check the JSON-LD actually rendered into every prerendered page.
const BUILT = ".next/server/app";
test("JSON-LD on built pages parses and passes the checks", { skip: !existsSync(BUILT) && "no build" }, () => {
  const html = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? html(p) : p.endsWith(".html") ? [p] : [];
    });
  let products = 0;
  let datasets = 0;
  for (const f of html(BUILT)) {
    for (const m of readFileSync(f, "utf8").matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const data = JSON.parse(m[1]);
      checkTree(data, f);
      products += nodes(data).filter((n) => n["@type"] === "Product").length;
      datasets += nodes(data).filter((n) => n["@type"] === "Dataset").length;
    }
  }
  assert.ok(products > 20, `only ${products} Products found in built pages`);
  assert.ok(datasets >= 1, "no Dataset found in built pages");
});
