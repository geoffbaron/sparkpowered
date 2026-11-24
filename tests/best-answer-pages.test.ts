import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SRC } from "../src/data/backup-sources";
import { FRIDGE_RECS, apexHours } from "../src/lib/backup-math";
import { ROUTES } from "../src/lib/seo";

/** The five pages rebuilt as the best answer for their question (Nov 24 2026). */
const PAGES = [
  "/home-backup",
  "/home-backup/anker-solix-f3800-plus-hookup",
  "/home-backup/bluetti-apex-300-hookup",
  "/home-backup/well-pump",
  "/power-station-for-refrigerator",
];

test("each rebuilt page: short title, Article + FAQ, outage calculator link, dated sources, no prices or stock photos", () => {
  for (const path of PAGES) {
    assert.ok(ROUTES.some((r) => r.path === path), `${path} in the sitemap`);
    const src = readFileSync(`src/app${path}/page.tsx`, "utf8");
    const title = src.match(/const TITLE = "([^"]+)"/)?.[1];
    assert.ok(title && title.length <= 60, `${path} title ${title?.length}`);
    assert.match(src, /ArticleJsonLd|"@type": "Article"/, path);
    assert.match(src, /<Faq /, path);
    assert.match(src, /href="\/power-outage-backup-calculator"/, path);
    assert.match(src, /<WhatWeChecked/, path);
    assert.match(src, /<QuickAnswer>/, path);
    assert.doesNotMatch(src, /\$\d/, `${path} hard-codes a price`);
    assert.doesNotMatch(src, /HOOKUP_COSTS|range\(/, `${path} shows installed-cost ranges`);
    assert.doesNotMatch(src, /HubHero|PhotoCredit/, `${path} uses a stock photo`);
  }
});

test("every citation is dated and says what was taken from it", () => {
  for (const [k, s] of Object.entries(SRC)) {
    assert.match(s.read, /^\d{4}-\d{2}-\d{2}$/, k);
    assert.ok(s.url.startsWith("https://"), k);
    assert.ok((s.what ?? "").length > 10, k);
  }
});

test("EIA appliance figures and Bluetti's run-time formula", () => {
  // CE5.3b: 2.11 and 1.94 million Btu at 3,412 Btu per kWh.
  assert.equal(FRIDGE_RECS.mostUsedKwhYear, 618);
  assert.equal(FRIDGE_RECS.freezerKwhYear, 569);
  // Apex 300 manual p.28: 2,764.8 Wh × 0.95 × 0.9 ÷ (100 W + 20 W)
  assert.equal(apexHours(2764.8, 100).toFixed(1), "19.7");
});
