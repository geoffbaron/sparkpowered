import { test } from "node:test";
import assert from "node:assert/strict";
import { COMPARISONS } from "../src/data/comparisons";

// 2026-11-11 prune (docs/prune-2026-11-11.md): duplicate compare pages 308 to the page that carries the same pair.
test("folded compare pages redirect to a live comparison and leave the sitemap", async () => {
  const { default: config } = await import("../next.config");
  const { default: sitemap } = await import("../src/app/sitemap");
  const rules = await config.redirects!();
  const urls = new Set(sitemap().map((e) => new URL(e.url).pathname));
  const folded: Record<string, string> = { "ecoflow-delta-pro-3-vs-anker-solix-f3800-plus": "anker-solix-vs-ecoflow" };
  for (const [from, to] of Object.entries(folded)) {
    const r = rules.find((x) => x.source === `/compare/${from}`);
    assert.ok(r, `${from} has no redirect`);
    assert.equal(r.destination, `/compare/${to}`);
    assert.equal(r.permanent, true);
    assert.ok(!COMPARISONS.some((c) => c.slug === from), `${from} still built`);
    assert.ok(COMPARISONS.some((c) => c.slug === to), `${to} is not a live comparison`);
    assert.ok(!urls.has(`/compare/${from}`) && urls.has(`/compare/${to}`));
  }
});
