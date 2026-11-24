import { test } from "node:test";
import assert from "node:assert/strict";
import { safeEqual, safeNext, adminToken } from "../src/lib/admin-auth";
import { ROUTES } from "../src/lib/seo";

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

test("sitemap routes are unique, dated, and exclude noindex pages", () => {
  const paths = ROUTES.map((r) => r.path);
  assert.equal(new Set(paths).size, paths.length);
  assert.ok(!paths.includes("/news"));
  for (const r of ROUTES) assert.match(r.lastModified, /^\d{4}-\d{2}-\d{2}$/);
});
