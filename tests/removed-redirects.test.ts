import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PATTERN_EXAMPLES, REMOVED, REMOVED_PATTERNS, RV_AND_BOAT } from "../src/lib/removed";

// Nov 24 2026 narrowing: every removed address must keep answering with a 301
// to a page that exists. If one of these fails, a removed page has started to
// 404 (or chain) for anyone who saved or linked it.

type Rule = { source: string; destination: string; statusCode?: number; permanent?: boolean; has?: unknown };

async function rules(): Promise<Rule[]> {
  const { default: config } = await import("../next.config");
  return (await config.redirects!()) as Rule[];
}

async function livePaths() {
  const { default: sitemap } = await import("../src/app/sitemap");
  return new Set(sitemap().map((e) => new URL(e.url).pathname.replace(/^$/, "/") || "/"));
}

/** Path-to-regexp light: enough for :name and :name* segments. */
function matches(source: string, path: string) {
  const re = new RegExp(
    "^" +
      source
        .replace(/:[a-z]+\*/gi, ".*")
        .replace(/:[a-z]+(\([^)]*\))?/gi, (_m, g) => (g ? g : "[^/]+")) +
      "$",
  );
  return re.test(path);
}

function firstRule(all: Rule[], path: string) {
  return all.filter((r) => !r.has).find((r) => matches(r.source, path));
}

test("every removed address is a 301 to a live page, with no chain", async () => {
  const all = await rules();
  const live = await livePaths();
  for (const r of REMOVED) {
    const rule = firstRule(all, r.source);
    assert.ok(rule, `${r.source} has no redirect`);
    assert.equal(rule.destination, r.destination, `${r.source} redirects to the wrong place`);
    assert.equal(rule.statusCode, 301, `${r.source} is not a 301`);
    assert.ok(!live.has(r.source), `${r.source} is still in the sitemap`);
    if (r.destination.startsWith("/")) {
      const dest = r.destination.split("#")[0];
      assert.ok(live.has(dest), `${r.source} points at ${dest}, which is not a live page`);
      assert.ok(!firstRule(all, dest), `${r.source} -> ${dest} chains into another redirect`);
    } else {
      assert.match(r.destination, /^https:\/\/campervolts\.com\//);
    }
  }
});

test("whole removed sections (state pages and the like) redirect too", async () => {
  const all = await rules();
  const live = await livePaths();
  for (const ex of PATTERN_EXAMPLES) {
    const rule = firstRule(all, ex.path);
    assert.ok(rule, `${ex.path} has no redirect`);
    assert.equal(rule.destination, ex.destination);
    assert.equal(rule.statusCode, 301);
    assert.ok(live.has(ex.destination), `${ex.destination} is not live`);
  }
  for (const p of REMOVED_PATTERNS) assert.ok(all.some((r) => r.source === p.source && r.statusCode === 301), `${p.source} missing`);
});

test("removed pages are not built, so the redirect is the only answer", () => {
  for (const r of [...REMOVED, ...RV_AND_BOAT]) {
    if (r.source.startsWith("/compare/") || r.source.startsWith("/questions/")) continue; // dynamic routes, filtered in data
    assert.ok(!existsSync(join("src/app", r.source, "page.tsx")), `src/app${r.source}/page.tsx still exists`);
  }
  assert.ok(!existsSync("src/app/states/[slug]/page.tsx"), "state pages still built");
});

test("no page links to a removed address", () => {
  const removed = new Set(REMOVED.map((r) => r.source));
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx?|json)$/.test(f) && !p.endsWith("removed.ts")) {
        const text = readFileSync(p, "utf8");
        for (const m of text.matchAll(/["'`(](\/[a-z0-9/-]+)(?:#[a-z0-9-]*)?["'`)]/g)) {
          const path = m[1];
          if (removed.has(path) || /^\/states\/[a-z-]+$/.test(path) || path.startsWith("/solartopia")) offenders.push(`${p}: ${path}`);
        }
      }
    }
  };
  walk("src");
  const llms = readFileSync("public/llms.txt", "utf8");
  for (const m of llms.matchAll(/sparkpowered\.com(\/[a-z0-9/-]*)/g)) {
    if (removed.has(m[1]) || /^\/states\/./.test(m[1])) offenders.push(`public/llms.txt: ${m[1]}`);
  }
  assert.deepEqual(offenders, []);
});
