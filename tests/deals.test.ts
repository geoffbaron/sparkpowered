import { test } from "node:test";
import assert from "node:assert/strict";
import { AFFILIATES } from "../src/data/affiliates";
import { BLACK_FRIDAY_2026, dealVerdict, isDealLive, liveDeals } from "../src/data/deals";
import { ebikeById } from "../src/data/ebikes";
import { productById } from "../src/lib/products";

test("every deal is from a brand we earn on, with dated start and end", () => {
  for (const d of BLACK_FRIDAY_2026) {
    assert.ok(AFFILIATES[d.brand].tracked, `${d.id}: ${d.brand} is not tracked`);
    assert.notEqual(d.brand, "naturesgenerator", `${d.id}: no new Nature's Generator placements`);
    assert.ok(Date.parse(d.startsAt) < Date.parse(d.endsAt), `${d.id} dates`);
    assert.ok(d.endsLabel && d.datesLabel, `${d.id} labels`);
    assert.match(d.checked, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(d.log.every((p) => p.date < d.checked || p.date === d.checked), `${d.id}: log after the check`);
    if (d.makerWasUsd !== null) assert.ok(d.makerWasUsd > d.salePriceUsd, `${d.id}: was price`);
    if (d.kind === "power-station") assert.ok(productById(d.productId));
    else assert.ok(ebikeById(d.productId));
  }
});

test("a deal shows only inside its maker's sale dates", () => {
  const apex = BLACK_FRIDAY_2026.find((d) => d.id === "bf26-bluetti-apex-300")!;
  assert.equal(isDealLive(apex, Date.parse("2026-11-18T23:59:00-08:00")), true);
  assert.equal(isDealLive(apex, Date.parse("2026-11-19T00:00:00-08:00")), false);
  assert.equal(liveDeals(Date.parse("2026-12-01T00:00:00-08:00")).length, 0);
});

test("the verdict compares with the lowest price we logged before", () => {
  assert.equal(dealVerdict({ salePriceUsd: 90, log: [{ date: "2026-10-01", usd: 100 }] }).kind, "lowest");
  assert.equal(dealVerdict({ salePriceUsd: 100, log: [{ date: "2026-10-01", usd: 120 }, { date: "2026-10-26", usd: 100 }] }).kind, "matches");
  const v = dealVerdict({ salePriceUsd: 529.99, log: [{ date: "2026-10-15", usd: 549.99 }, { date: "2026-10-26", usd: 499.99 }] });
  assert.deepEqual(v, { kind: "higher", lowUsd: 499.99, lowDate: "2026-10-26" });
  assert.equal(dealVerdict({ salePriceUsd: 10, log: [] }).kind, "new");
});
