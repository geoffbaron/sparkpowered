import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NATIONAL_CHOICE, parseLocate, resolveState } from "../src/lib/visitor-state";
import { clientIp, ipTable, lookupState, normalizeIp } from "../src/lib/ip-state";
import { STATES } from "../src/lib/energy";

const VALID = STATES.map((s) => s.abbr);

test("URL state wins over everything", () => {
  assert.deepEqual(resolveState({ url: "tx", saved: "CA", detected: "OH" }, VALID), { abbr: "TX", source: "url" });
});

test("a state the visitor picked beats the estimate", () => {
  assert.deepEqual(resolveState({ saved: "CA", detected: "TX" }, VALID), { abbr: "CA", source: "saved" });
});

test("picking the national average is remembered and blocks the estimate", () => {
  assert.deepEqual(resolveState({ saved: NATIONAL_CHOICE, detected: "TX" }, VALID), { abbr: null, source: "saved" });
});

test("the estimate is used when nothing else is set", () => {
  assert.deepEqual(resolveState({ detected: "TX" }, VALID), { abbr: "TX", source: "detected" });
});

test("unknown or junk values fall back to the page default", () => {
  assert.deepEqual(resolveState({ url: "ZZ", saved: "nope", detected: "PR" }, VALID), { abbr: null, source: null });
  assert.deepEqual(resolveState({}, VALID), { abbr: null, source: null });
});

test("parseLocate only accepts a two-letter state", () => {
  assert.equal(parseLocate({ state: "TX", country: "US" }), "TX");
  assert.equal(parseLocate({ state: null, country: null }), null);
  assert.equal(parseLocate({ state: "<script>" }), null);
  assert.equal(parseLocate(null), null);
  assert.equal(parseLocate("TX"), null);
});

test("IP addresses are cleaned before lookup", () => {
  assert.equal(normalizeIp(" 72.177.0.1 "), "72.177.0.1");
  assert.equal(normalizeIp("72.177.0.1:443"), "72.177.0.1");
  assert.equal(normalizeIp("::ffff:72.177.0.1"), "72.177.0.1");
  assert.equal(normalizeIp("[2600:1700::1]:80"), "2600:1700::1");
  assert.equal(normalizeIp("not-an-ip"), null);
  assert.equal(normalizeIp(""), null);
});

test("client IP comes from the first forwarded address", () => {
  assert.equal(clientIp(new Headers({ "x-forwarded-for": "72.177.0.1, 10.0.0.2" })), "72.177.0.1");
  assert.equal(clientIp(new Headers({ "x-real-ip": "2.136.0.1" })), "2.136.0.1");
  assert.equal(clientIp(new Headers()), null);
});

test("offline table maps US addresses to states and nothing else", () => {
  const t = ipTable();
  assert.ok(t.v4.start.length > 100_000 && t.v6.start.length > 10_000, "table looks complete");
  for (const s of t.states) assert.ok(VALID.includes(s), `${s} is a site state`);
  for (let i = 1; i < t.v4.start.length; i++) assert.ok(t.v4.start[i] > t.v4.end[i - 1], "IPv4 ranges sorted, no overlap");

  assert.equal(lookupState("72.177.0.1"), "TX"); // Austin (Spectrum)
  assert.equal(lookupState("24.28.0.1"), "TX");
  assert.equal(lookupState("::ffff:72.177.0.1"), "TX");
  assert.equal(lookupState("99.0.0.1"), "CA");
  assert.ok(VALID.includes(lookupState("2600:1700::1") ?? ""), "US IPv6 resolves to a state");
  assert.equal(lookupState("2.136.0.1"), null); // Spain
  assert.equal(lookupState("81.2.69.160"), null); // UK
  assert.equal(lookupState("127.0.0.1"), null);
  assert.equal(lookupState("10.1.2.3"), null);
  assert.equal(lookupState("8.8.8.8"), null); // US but no state on record
  assert.equal(lookupState(null), null);
});

test("the locate route never logs or stores the address", () => {
  const src = readFileSync("src/app/api/locate/route.ts", "utf8") + readFileSync("src/lib/ip-state.ts", "utf8");
  assert.doesNotMatch(src, /console\.|writeFile|cookies\(\)\.set|fetch\(/);
  assert.match(readFileSync("src/app/api/locate/route.ts", "utf8"), /no-store/);
});

test("the proxy (edge middleware) does not load the IP table", () => {
  assert.doesNotMatch(readFileSync("src/proxy.ts", "utf8"), /ip-state|geoip/);
});
