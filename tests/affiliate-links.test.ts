/**
 * Affiliate link drift guard (Oct 31 2026). No network: it checks the data, the
 * link helpers and the source text.
 *
 * Fails when:
 *   - an approved program is switched off or its tracking format changes,
 *   - any product URL on an approved brand's store would render untracked,
 *   - a hand-written Awin, Rakuten, EVIQO or Epoch link has the wrong ids,
 *   - a buy link for an approved brand has no product (lands on the home page),
 *   - a product record's URL is a bare store home page (any brand),
 *   - a page writes a raw <a href="..."> straight to an approved brand's store.
 *
 * Spec citations in Sources lists stay plain on purpose; they are built from
 * `sourceUrl` / source objects and rendered by <Sources>, not by these helpers.
 * The live-site counterpart is scripts/check-affiliate-links.mjs.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AFFILIATES, bareHost, brandForUrl, isHomePage, partnerUrl, type BrandId } from "../src/data/affiliates";
import { PlainLink } from "../src/components/guide-ui";
import { RedodoDealBox } from "../src/components/RedodoDeal";

const AWIN_ID = "3125360";
const RAKUTEN_ID = "2P5eyfaQKtI";

type Rule = { awin: number } | { rakuten: number } | { param: string };

/** Every approved program and its exact tracking format. Edit only when a program changes. */
const APPROVED: Partial<Record<BrandId, Rule>> = {
  bluetti: { awin: 59271 },
  lectron: { awin: 91891 },
  autel: { awin: 72577 },
  redodo: { awin: 97969 },
  litime: { awin: 71451 },
  piscifun: { awin: 89509 },
  anker: { rakuten: 53552 },
  eviqo: { param: "ref=zycwdczj" },
  epoch: { param: "rfsn=9396856.73d8c8" },
  vatrer: { awin: 119703 },
};
/** Approved on Awin but not used on this site yet: any link to them must still be wrapped. */
const APPROVED_UNUSED: Record<string, number> = { "vatrer.com": 119703, "kingbullbike.com": 124136 };

const approvedHosts = new Map<string, Rule>([
  ...Object.entries(APPROVED).map(([b, r]) => [bareHost(AFFILIATES[b as BrandId].homeUrl), r] as [string, Rule]),
  ...Object.entries(APPROVED_UNUSED).map(([h, mid]) => [h, { awin: mid }] as [string, Rule]),
]);
const awinMidForHost = (host: string) => {
  const r = approvedHosts.get(host);
  return r && "awin" in r ? r.awin : null;
};

/** Checks an outbound href against the rule for the store it ends up on. Returns a problem or null. */
function trackingProblem(href: string, productUrl: string): string | null {
  const host = bareHost(productUrl);
  const rule = approvedHosts.get(host);
  if (!rule) return null;
  if ("awin" in rule) {
    const u = new URL(href);
    if (u.hostname !== "www.awin1.com") return `${productUrl} is not wrapped in Awin`;
    if (u.searchParams.get("awinmid") !== String(rule.awin)) return `${href} has the wrong awinmid (want ${rule.awin})`;
    if (u.searchParams.get("awinaffid") !== AWIN_ID) return `${href} has the wrong awinaffid`;
    if (u.searchParams.get("ued") !== productUrl) return `${href} does not land on ${productUrl}`;
    return null;
  }
  if ("rakuten" in rule) {
    const u = new URL(href);
    if (u.hostname !== "click.linksynergy.com") return `${productUrl} is not wrapped in Rakuten`;
    if (u.searchParams.get("id") !== RAKUTEN_ID || u.searchParams.get("mid") !== String(rule.rakuten)) return `${href} has the wrong Rakuten ids`;
    if (u.searchParams.get("murl") !== productUrl) return `${href} does not land on ${productUrl}`;
    return null;
  }
  const [k, v] = rule.param.split("=");
  if (new URL(href).searchParams.get(k) !== v) return `${href} is missing ?${rule.param}`;
  return null;
}

function files(dir: string, re = /\.tsx?$/): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p, re) : re.test(p) ? [p] : [];
  });
}

/** Every object (at any depth) in a module's exports. */
function walk(value: unknown, out: Record<string, unknown>[] = [], seen = new Set<unknown>()): Record<string, unknown>[] {
  if (!value || typeof value !== "object" || seen.has(value)) return out;
  seen.add(value);
  if (!Array.isArray(value)) out.push(value as Record<string, unknown>);
  for (const v of Object.values(value)) walk(v, out, seen);
  return out;
}

test("every approved program is on, with its exact tracking format", () => {
  for (const [brand, rule] of Object.entries(APPROVED) as [BrandId, Rule][]) {
    const a = AFFILIATES[brand];
    assert.equal(a.tracked, true, `${brand} is approved: keep tracked: true`);
    const product = `${a.homeUrl}products/example-item`;
    const link = partnerUrl(brand, { productUrl: product });
    assert.equal(link.tracked, true, brand);
    assert.equal(trackingProblem(link.href, product), null, `${brand}: ${trackingProblem(link.href, product)}`);
    if ("awin" in rule) assert.ok(a.deepLink?.includes(`awinmid=${rule.awin}&awinaffid=${AWIN_ID}&ued={url}`), `${brand} deepLink`);
  }
});

test("rejected and pending brands stay plain", () => {
  for (const b of ["ecoflow", "jackery", "renogy", "goalzero"] as BrandId[]) {
    assert.equal(AFFILIATES[b].tracked, false, `${b} is not approved`);
    assert.equal(APPROVED[b], undefined);
  }
});

test("every product URL in the data files renders tracked when its store is approved", async () => {
  const problems: string[] = [];
  let checked = 0;
  for (const f of files("src/data", /\.ts$/)) {
    const mod = await import(join(process.cwd(), f));
    for (const o of walk(mod)) {
      for (const key of ["url", "productUrl", "priceUrl"]) {
        const url = o[key];
        if (typeof url !== "string" || !/^https?:\/\//.test(url)) continue;
        let host: string;
        try {
          host = bareHost(url);
        } catch {
          continue;
        }
        if (!approvedHosts.has(host)) continue;
        checked++;
        const brand = brandForUrl(url);
        if (!brand) {
          problems.push(`${f}: ${url} is on an approved store with no AFFILIATES entry`);
          continue;
        }
        const link = partnerUrl(brand, { productUrl: url });
        const p = link.tracked ? trackingProblem(link.href, url) : `${url} would render untracked`;
        if (p) problems.push(`${f}: ${p}`);
      }
    }
  }
  assert.ok(checked > 50, `expected many approved-brand product URLs, saw ${checked}`);
  assert.deepEqual(problems, []);
});

test("no product record points at a bare store home page", async () => {
  const problems: string[] = [];
  for (const f of files("src/data", /\.ts$/)) {
    if (f.endsWith("affiliates.ts")) continue;
    const mod = await import(join(process.cwd(), f));
    for (const o of walk(mod)) {
      // A record with a price, or from an approved brand, is a product we send readers to buy.
      // (Non-partner makers sold only by quote, e.g. FranklinWH, may link their home page.)
      const approvedBrand = typeof o.brand === "string" && o.brand in APPROVED;
      if (!approvedBrand && typeof o.priceUsd !== "number") continue;
      for (const key of ["url", "productUrl"]) {
        const url = o[key];
        if (typeof url === "string" && /^https?:\/\//.test(url) && isHomePage(url)) problems.push(`${f}: ${String(o.id ?? o.name ?? "?")} ${key} is a home page (${url})`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test("source: hand-written tracking links carry our ids and the right merchant", () => {
  const problems: string[] = [];
  for (const f of files("src")) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/https:\/\/www\.awin1\.com\/cread\.php\?[^"'`\s)]+/g)) {
      if (m[0].includes("{url}") || m[0].includes("${")) continue;
      const u = new URL(m[0]);
      if (u.searchParams.get("awinaffid") !== AWIN_ID) problems.push(`${f}: wrong awinaffid in ${m[0]}`);
      const ued = u.searchParams.get("ued");
      if (ued) {
        const want = awinMidForHost(bareHost(ued));
        if (want !== null && u.searchParams.get("awinmid") !== String(want)) problems.push(`${f}: ${m[0]} uses awinmid ${u.searchParams.get("awinmid")} for ${bareHost(ued)} (want ${want})`);
      }
    }
    for (const m of src.matchAll(/https:\/\/click\.linksynergy\.com\/deeplink\?[^"'`\s)]+/g)) {
      if (!m[0].includes(`id=${RAKUTEN_ID}`)) problems.push(`${f}: wrong Rakuten id in ${m[0]}`);
    }
    for (const m of src.matchAll(/https:\/\/(?:www\.)?eviqo\.io\/[^"'`\s)]*\?[^"'`\s)]*/g)) {
      if (!m[0].includes("ref=zycwdczj")) problems.push(`${f}: EVIQO link with a query but no ref: ${m[0]}`);
    }
  }
  assert.deepEqual(problems, []);
});

test("source: approved brands never get a buy link with no product, and pages never hand-write one", () => {
  const problems: string[] = [];
  const approved = Object.keys(APPROVED);
  for (const f of files("src", /\.tsx$/)) {
    const src = readFileSync(f, "utf8");
    // <PartnerLink brand="redodo"> with no product falls back to the brand's home page.
    for (const m of src.matchAll(/<PartnerLink\b([^>]*)>/g)) {
      const attrs = m[1];
      const b = attrs.match(/brand="([a-z]+)"/)?.[1];
      if (b && approved.includes(b) && !/productUrl=|productId=|category=/.test(attrs)) problems.push(`${f}: <PartnerLink brand="${b}"> has no product`);
      if (/productUrl=\{AFFILIATES\[[^\]]+\]\.homeUrl\}/.test(attrs)) problems.push(`${f}: PartnerLink productUrl is a home page`);
    }
    // Raw anchors written straight to an approved store skip tracking entirely.
    for (const m of src.matchAll(/<a\b[^>]*href=(?:"|\{["`])(https?:\/\/[^"`]+)/g)) {
      let host = "";
      try {
        host = bareHost(m[1]);
      } catch {
        continue;
      }
      if (approvedHosts.has(host)) problems.push(`${f}: raw <a href> to ${m[1]}; use <PartnerLink>`);
    }
  }
  assert.deepEqual(problems, []);
});

test("a plain link that turns out to be an approved store is tracked; others stay plain", () => {
  const bluetti = "https://www.bluettipower.com/products/ac180";
  const html = renderToStaticMarkup(createElement(PlainLink, { href: bluetti, children: "AC180" }));
  assert.match(html, /href="https:\/\/www\.awin1\.com\/cread\.php\?awinmid=59271&amp;awinaffid=3125360&amp;ued=/);
  assert.match(html, /rel="sponsored nofollow noopener"/);
  const jackery = "https://www.jackery.com/products/jackery-explorer-1000-v2";
  const plain = renderToStaticMarkup(createElement(PlainLink, { href: jackery, children: "Jackery" }));
  assert.ok(plain.includes(`href="${jackery}"`) && plain.includes('data-partner="none"'));
});

test("the Redodo code note lands on a product, never the home page", () => {
  const html = renderToStaticMarkup(createElement(RedodoDealBox, { now: Date.parse("2026-10-30T12:00:00Z") }));
  const href = html.match(/href="([^"]+)"/)![1].replaceAll("&amp;", "&");
  const ued = new URL(href).searchParams.get("ued")!;
  assert.ok(!isHomePage(ued), ued);
  const custom = renderToStaticMarkup(
    createElement(RedodoDealBox, { now: Date.parse("2026-10-30T12:00:00Z"), product: { name: "Redodo 12V 50Ah", url: "https://www.redodopower.com/products/12v-50ah-smart-bluetooth-lithium-battery" } }),
  );
  assert.match(custom, /12v-50ah-smart-bluetooth-lithium-battery/);
});
