import { test } from "node:test";
import assert from "node:assert/strict";
import { lifeTerms } from "../src/lib/everyday";

test("battery life terms scale with capacity", () => {
  const a = lifeTerms(1000);
  const b = lifeTerms(2000);
  assert.ok(Math.abs(b.fridgeHours - 2 * a.fridgeHours) < 1e-9);
  assert.ok(a.fridgeHours > 5 && a.fridgeHours < 15);
});
