import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ARTICLE, ARTICLE_FACT_ORDER, DAYS, FACTS, GOAL_PICK, PAGE } from "../src/data/solartopia";
import { STATES } from "../src/lib/energy";
import { allEndingFigures } from "../src/lib/solartopia/ending";
import { productById } from "../src/lib/products";
import { chargerById } from "../src/data/chargers";
import { ROUTES } from "../src/lib/seo";

test("every fact has a source, an https url and dates, and is verified", () => {
  for (const f of Object.values(FACTS)) {
    assert.ok(f.source.length > 5, f.id);
    assert.match(f.url, /^https:\/\//, f.id);
    assert.match(f.published, /^(\d{4}-\d{2}-\d{2}|undated)$/, f.id);
    assert.match(f.retrieved, /^\d{4}-\d{2}-\d{2}$/, f.id);
    assert.equal(f.verified, true, `${f.id} is not verified`);
    assert.ok(f.text.length > 20 && !/\bkWh\b|\bkW\b/.test(f.text), f.id);
  }
  for (const d of DAYS) {
    assert.ok(FACTS[d.main] && FACTS[d.behind], `day ${d.n}`);
  }
  assert.deepEqual([...new Set(ARTICLE_FACT_ORDER)].sort(), Object.keys(FACTS).sort());
});

test("the page copy matches the brief", () => {
  assert.equal(PAGE.title, "Solartopia: A Free 5-Minute Solar Power Game");
  assert.ok(PAGE.description.length <= 200);
  assert.ok(ROUTES.some((r) => r.path === "/solartopia"));
  const words = ARTICLE.flatMap((s) => [s.heading, ...s.paragraphs]).join(" ").split(/\s+/).length;
  assert.ok(words >= 600, `article has ${words} words before facts and sources`);
  assert.deepEqual(ARTICLE.map((s) => s.heading), [
    "Water", "Health", "School", "Food", "Getting around", "Why solar is now the cheapest power we've built", "What solar can't do yet", "Bring it home",
    "How the game works and what we simplified",
  ]);
});

test("ending numbers exist for all 51 states, no blanks", () => {
  const all = allEndingFigures();
  assert.equal(Object.keys(all).length, 51);
  assert.equal(STATES.length, 51);
  for (const [abbr, f] of Object.entries(all)) {
    assert.equal(f.abbr, abbr);
    for (const [k, v] of Object.entries(f)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v) && v > 0, `${abbr}.${k} = ${v}`);
      else assert.ok(typeof v === "string" && v.length >= 2 && !/undefined|NaN/.test(v), `${abbr}.${k}`);
    }
    assert.ok(f.evMonthlyUsd < f.gasMonthlyUsd * 1.5);
  }
});

test("affiliate picks exist", () => {
  assert.equal(productById(GOAL_PICK.outage!.productId).brand, "bluetti");
  assert.equal(chargerById(GOAL_PICK.drive!.productId).brand, "lectron");
  assert.equal(GOAL_PICK.bill, undefined);
});

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|css)$/.test(p) ? [p] : [];
  });
}

test("no emoji and no alert, confirm or prompt in the game folders", () => {
  const dirs = ["src/components/solartopia", "src/lib/solartopia", "src/app/solartopia"];
  const emoji = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
  for (const f of [...dirs.flatMap(files), "src/data/solartopia.ts"]) {
    const src = readFileSync(f, "utf8");
    assert.doesNotMatch(src, emoji, `${f} has an emoji`);
    assert.doesNotMatch(src, /(^|[^.\w])(alert|confirm|prompt)\s*\(/, `${f} uses a browser dialog`);
  }
});
