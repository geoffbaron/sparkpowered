import { test } from "node:test";
import assert from "node:assert/strict";
import { matchEpa } from "../src/lib/epa-match";
import { safeEqual, safeNext, adminToken } from "../src/lib/admin-auth";
import installers, { searchInstallers } from "../src/data/installers";
import { ROUTES } from "../src/lib/seo";

test("EPA matching finds common models and rejects discontinued ones", () => {
  assert.equal(matchEpa("Chevrolet Equinox EV")?.rangeMax, 319);
  assert.ok(matchEpa("Tesla Model 3")!.rangeMax >= 363);
  assert.ok(matchEpa("Hyundai Ioniq 5"));
  assert.ok(matchEpa("Volkswagen ID.4"));
  assert.equal(matchEpa("Ford F-150 Lightning"), null);
  // Model 3 must not match Model S/X/Y
  assert.ok(matchEpa("Tesla Model 3")!.label.includes("Model 3"));
});

test("admin redirect target is restricted to /admin", () => {
  assert.equal(safeNext("https://evil.example"), "/admin");
  assert.equal(safeNext("//evil.example"), "/admin");
  assert.equal(safeNext(null), "/admin");
  assert.equal(safeNext("/admin/leads"), "/admin/leads");
});

test("admin token never equals the password", async () => {
  const t = await adminToken("hunter2");
  assert.notEqual(t, "hunter2");
  assert.equal(t, await adminToken("hunter2"));
  assert.ok(safeEqual(t, t));
  assert.ok(!safeEqual(t, t.slice(1)));
});

test("installer list excludes companies that exited residential solar", () => {
  const names = installers.map((i) => i.name);
  for (const gone of ["ADT Solar", "Sunnova", "Elevation", "SunPower by Dealers"]) assert.ok(!names.includes(gone), gone);
  assert.ok(searchInstallers("TX").length >= 3);
  assert.ok(searchInstallers(null).every((i) => i.nationwide));
});

test("sitemap routes are unique, dated, and exclude noindex pages", () => {
  const paths = ROUTES.map((r) => r.path);
  assert.equal(new Set(paths).size, paths.length);
  assert.ok(!paths.includes("/news"));
  for (const r of ROUTES) assert.match(r.lastModified, /^\d{4}-\d{2}-\d{2}$/);
});

test("calculator default EV exists in the dropdown list", async () => {
  const { CALC_EVS, DEFAULT_EV_ID } = await import("../src/lib/calculator-data");
  const ev = CALC_EVS.find((e) => e.id === DEFAULT_EV_ID);
  assert.ok(ev, "default EV missing from list");
  assert.equal(ev!.make, "Chevrolet");
  assert.match(ev!.model, /Equinox EV FWD/);
});
