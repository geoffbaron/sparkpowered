import { test } from "node:test";
import assert from "node:assert/strict";
import data from "../src/data/ebikes.json";
import { withSaleEnded, ebikeSaleNote, type Ebike } from "../src/data/ebikes";

const bikes = data.bikes as Ebike[];

test("every dated e-bike sale has a label and the brand's regular price", () => {
  for (const b of bikes.filter((x) => x.saleEndsAt)) {
    assert.ok(!Number.isNaN(Date.parse(b.saleEndsAt!)), `${b.id} saleEndsAt`);
    assert.ok(b.saleEndsLabel, `${b.id} saleEndsLabel`);
    assert.ok(b.regularPrice && b.regularPrice > b.price, `${b.id} regularPrice`);
  }
});

test("a sale price is dropped for the regular price once the sale ends", () => {
  const a7 = bikes.find((b) => b.id === "himiway-a7-pro-commuter-ebike")!;
  const during = withSaleEnded(a7, Date.parse("2026-11-14T23:00:00-08:00"));
  assert.equal(during.price, 1999);
  assert.equal(ebikeSaleNote(during), "Himiway's sale price through Nov 14");
  const after = withSaleEnded(a7, Date.parse("2026-11-15T00:00:00-08:00"));
  assert.equal(after.price, 2899);
  assert.equal(ebikeSaleNote(after), "");
});

// Ended sales must be re-checked on the maker's page and removed from the data, not left to the fallback.
test("no e-bike sale in the data ended more than 3 days ago", () => {
  for (const b of bikes.filter((x) => x.saleEndsAt)) {
    assert.ok(Date.now() < Date.parse(b.saleEndsAt!) + 3 * 86400e3, `${b.id}: sale ended ${b.saleEndsLabel}; re-check the price`);
  }
});
