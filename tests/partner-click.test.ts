import { test } from "node:test";
import assert from "node:assert/strict";
import { AFFILIATES, cartUrl, partnerUrl } from "../src/data/affiliates";
import { partnerClick, sectionOf } from "../src/lib/partner-click";

test("every approved partner's link is recognized as a tracked partner click", () => {
  for (const [id, a] of Object.entries(AFFILIATES)) {
    if (!a.tracked) continue;
    const href = partnerUrl(id as keyof typeof AFFILIATES, {}).href;
    assert.deepEqual(partnerClick(href), { brand: id, tracked: true }, `${id}: ${href}`);
  }
});

test("a plain link to a brand's store counts as an untracked partner click", () => {
  assert.deepEqual(partnerClick("https://www.renogy.com/products/x"), { brand: "renogy", tracked: false });
});

test("cart links, internal links and unrelated sites", () => {
  assert.equal(partnerClick(cartUrl("bluetti", [{ variantId: 1, qty: 1 }]).href)?.brand, "bluetti");
  assert.equal(partnerClick("/ev-charger-picker"), null);
  assert.equal(partnerClick("https://sparkpowered.com/plug-in-solar"), null);
  assert.equal(partnerClick("https://www.irs.gov/x"), null);
  assert.equal(partnerClick("not a url ::"), null);
});

test("store clicks are grouped by the first path segment", () => {
  assert.equal(sectionOf("/home-backup/bluetti-apex-300-hookup"), "home-backup");
  assert.equal(sectionOf("/"), "home");
  assert.equal(sectionOf("/black-friday-deals"), "black-friday-deals");
});
