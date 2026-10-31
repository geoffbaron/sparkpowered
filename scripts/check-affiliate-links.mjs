#!/usr/bin/env node
/**
 * Crawl a live site's sitemap and report outbound link problems:
 *   UNTRACKED  a buy link to an approved partner's store without its tracking
 *   BAD-IDS    a tracking link with the wrong publisher id or merchant id
 *   HOME-PAGE  a buy link to an approved partner that lands on its bare home page
 *   BRAND-HOME (note only) a sponsored link to a non-partner brand's home page; fine for a
 *              brand mention, wrong if the page names a product
 *   DEAD       (with --dead) the landing page answers 404/410/5xx
 *   BLOCKED    (with --dead) the store refused our checker (403/429); open it by hand
 *
 * Spec citations stay plain on purpose and are never reported as UNTRACKED: links
 * inside a page's "Sources" section, and plain <a> tags that are neither marked
 * sponsored nor rendered by the site's link helpers (which always set data-partner).
 * A raw buy link written by hand would look like a citation here; the unit test
 * tests/affiliate-links.test.ts catches those in the source instead.
 *
 * Usage:
 *   node scripts/check-affiliate-links.mjs                       # https://sparkpowered.com
 *   node scripts/check-affiliate-links.mjs https://campervolts.com
 *   node scripts/check-affiliate-links.mjs https://sparkpowered.com --dead   # also fetch every landing page
 *   node scripts/check-affiliate-links.mjs http://localhost:3000 --pages /best-home-ev-charger,/lithium-rv-battery
 *
 * Exits 1 when it finds UNTRACKED, BAD-IDS, HOME-PAGE or DEAD links. No dependencies.
 * Keep APPROVED in step with tests/affiliate-links.test.ts.
 */

const AWIN_ID = "3125360";
const RAKUTEN_ID = "2P5eyfaQKtI";
/** Approved programs, by store host (no www). */
const APPROVED = {
  "bluettipower.com": { brand: "Bluetti", awin: 59271 },
  "ev-lectron.com": { brand: "Lectron", awin: 91891 },
  "autelenergy.us": { brand: "Autel", awin: 72577 },
  "redodopower.com": { brand: "Redodo", awin: 97969 },
  "litime.com": { brand: "LiTime", awin: 71451 },
  "piscifun.com": { brand: "Piscifun", awin: 89509 },
  "vatrer.com": { brand: "Vatrer", awin: 119703 },
  "vatrerpower.com": { brand: "Vatrer", awin: 119703 },
  "kingbullbike.com": { brand: "Kingbull", awin: 124136 },
  "ankersolix.com": { brand: "Anker SOLIX", rakuten: 53552 },
  "eviqo.io": { brand: "EVIQO", param: ["ref", "zycwdczj"] },
  "epochbatteries.com": { brand: "Epoch", param: ["rfsn", "9396856.73d8c8"] },
};

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:\/\//.test(a)) ?? "https://sparkpowered.com").replace(/\/$/, "");
const checkDead = args.includes("--dead");
const pagesArg = args.includes("--pages") ? args[args.indexOf("--pages") + 1] : null;
const UA = "affiliate-link-check (site owner's link audit)";

const host = (u) => new URL(u).hostname.toLowerCase().replace(/^www\./, "");
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

async function get(url) {
  const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  return { status: res.status, url: res.url, text: res.ok ? await res.text() : "" };
}

async function pageList() {
  if (pagesArg) return pagesArg.split(",").map((p) => base + p);
  const urls = [];
  const queue = [`${base}/sitemap.xml`];
  while (queue.length) {
    const r = await get(queue.shift());
    for (const m of r.text.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const loc = decode(m[1].trim()).replace(/^https?:\/\/[^/]+/, base);
      (/\.xml$/.test(loc) ? queue : urls).push(loc);
    }
  }
  return [...new Set(urls)];
}

/** Where a link really lands, unwrapping Awin and Rakuten. */
function landing(href) {
  const u = new URL(href);
  if (u.hostname === "www.awin1.com") return u.searchParams.get("ued") ?? href;
  if (u.hostname === "click.linksynergy.com") return u.searchParams.get("murl") ?? href;
  return href;
}

function idProblem(href, land) {
  const rule = APPROVED[host(land)];
  const u = new URL(href);
  if (u.hostname === "www.awin1.com") {
    if (u.searchParams.get("awinaffid") !== AWIN_ID) return `awinaffid ${u.searchParams.get("awinaffid")}`;
    if (rule?.awin && u.searchParams.get("awinmid") !== String(rule.awin)) return `awinmid ${u.searchParams.get("awinmid")} (want ${rule.awin})`;
    return null;
  }
  if (u.hostname === "click.linksynergy.com") {
    if (u.searchParams.get("id") !== RAKUTEN_ID) return `Rakuten id ${u.searchParams.get("id")}`;
    if (rule?.rakuten && u.searchParams.get("mid") !== String(rule.rakuten)) return `Rakuten mid ${u.searchParams.get("mid")}`;
    return null;
  }
  return null;
}

function isTracked(href, land) {
  const rule = APPROVED[host(land)];
  if (!rule) return true;
  const h = new URL(href).hostname;
  if (rule.awin) return h === "www.awin1.com";
  if (rule.rakuten) return h === "click.linksynergy.com";
  return new URL(href).searchParams.get(rule.param[0]) === rule.param[1];
}

function sourceRanges(html) {
  const out = [];
  for (const m of html.matchAll(/<section[^>]*aria-labelledby="sources[^"]*"[^>]*>/g)) {
    const end = html.indexOf("</section>", m.index);
    out.push([m.index, end < 0 ? html.length : end]);
  }
  return out;
}

const findings = [];
const landings = new Map(); // landing URL -> first page
const pages = await pageList();
console.log(`Checking ${pages.length} pages on ${base}${checkDead ? " (with landing pages)" : ""}...`);

let i = 0;
async function worker() {
  while (i < pages.length) {
    const page = pages[i++];
    let r;
    try {
      r = await get(page);
    } catch (e) {
      findings.push(["PAGE-ERROR", page, String(e.message ?? e)]);
      continue;
    }
    if (r.status !== 200) {
      findings.push(["PAGE-ERROR", page, `status ${r.status}`]);
      continue;
    }
    const ranges = sourceRanges(r.text);
    const inSources = (idx) => ranges.some(([a, b]) => idx > a && idx < b);
    for (const m of r.text.matchAll(/<a\b([^>]*)>/g)) {
      const attrs = m[1];
      const hrefM = attrs.match(/href="(https?:\/\/[^"]+)"/);
      if (!hrefM) continue;
      const href = decode(hrefM[1]);
      let land, lh;
      try {
        land = landing(href);
        lh = host(land);
      } catch {
        continue;
      }
      if (lh === host(base)) continue;
      const sponsored = /rel="[^"]*sponsored/.test(attrs);
      const citation = inSources(m.index) || (!sponsored && !/data-partner=/.test(attrs));
      const approved = APPROVED[lh];
      if (sponsored || approved) if (!landings.has(land)) landings.set(land, page);
      const bad = idProblem(href, land);
      if (bad) findings.push(["BAD-IDS", page, `${href} (${bad})`]);
      if (approved && !citation && !isTracked(href, land)) findings.push(["UNTRACKED", page, `${approved.brand}: ${href}`]);
      if ((sponsored || (approved && !citation)) && new URL(land).pathname.replace(/\/+$/, "") === "") {
        // Approved partner home pages fail; a non-partner brand named without a product is only noted.
        findings.push([approved ? "HOME-PAGE" : "BRAND-HOME", page, `${approved?.brand ?? lh}: ${href}`]);
      }
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

if (checkDead) {
  const list = [...landings.keys()];
  let j = 0;
  async function deadWorker() {
    while (j < list.length) {
      const land = list[j++];
      try {
        const res = await fetch(land, { headers: { "user-agent": UA }, redirect: "follow" });
        if ([403, 429].includes(res.status)) findings.push(["BLOCKED", landings.get(land), `${res.status} ${land}`]);
        else if (res.status >= 400) findings.push(["DEAD", landings.get(land), `${res.status} ${land}`]);
        else if (new URL(res.url).pathname.replace(/\/+$/, "") === "" && new URL(land).pathname.replace(/\/+$/, "") !== "")
          findings.push(["HOME-PAGE", landings.get(land), `redirects to the home page: ${land}`]);
      } catch (e) {
        findings.push(["DEAD", landings.get(land), `${land} (${e.cause?.code ?? e.message})`]);
      }
    }
  }
  await Promise.all(Array.from({ length: 3 }, deadWorker));
}

const order = ["UNTRACKED", "BAD-IDS", "HOME-PAGE", "DEAD", "BLOCKED", "BRAND-HOME", "PAGE-ERROR"];
findings.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]) || a[1].localeCompare(b[1]));
const seen = new Set();
for (const [kind, page, detail] of findings) {
  const key = `${kind}|${page}|${detail}`;
  if (seen.has(key)) continue;
  seen.add(key);
  console.log(`${kind.padEnd(10)} ${page.replace(base, "") || "/"}  ${detail}`);
}
const failing = findings.filter(([k]) => ["UNTRACKED", "BAD-IDS", "HOME-PAGE", "DEAD"].includes(k)).length;
console.log(`\n${pages.length} pages, ${landings.size} partner landing URLs, ${failing} problem(s).`);
process.exit(failing ? 1 : 0);
