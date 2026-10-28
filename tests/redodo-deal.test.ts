import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RedodoDealBox } from "../src/components/RedodoDeal";
import { REDODO_AW10_2026 as deal, isSaleLive } from "../src/data/sales";

const at = (iso: string) => Date.parse(iso);
const render = (iso: string) => renderToStaticMarkup(createElement(RedodoDealBox, { now: at(iso) }));

test("Redodo AW10 code shows through Nov 1 Pacific and is gone on Nov 2", () => {
  assert.equal(isSaleLive(deal, at("2026-10-28T12:00:00Z")), true);
  assert.equal(isSaleLive(deal, at("2026-11-01T23:59:59-08:00")), true, "last second of Nov 1 Pacific");
  assert.equal(isSaleLive(deal, at("2026-11-02T07:59:59Z")), true);
  assert.equal(isSaleLive(deal, at("2026-11-02T08:00:00Z")), false);
});

test("the code note renders before the end with a tracked, sponsored Redodo link and no prices", () => {
  const html = render("2026-10-30T12:00:00Z");
  assert.match(html, /Redodo sale: extra 10% off with code AW10, through Nov 1\./);
  assert.match(html, /Shop Redodo/);
  assert.match(html, /href="https:\/\/www\.awin1\.com\/cread\.php\?awinmid=97969&amp;awinaffid=3125360&amp;ued=https%3A%2F%2Fwww\.redodopower\.com%2F"/);
  assert.match(html, /rel="sponsored nofollow noopener"/);
  assert.match(html, /We may earn a commission/);
  assert.doesNotMatch(html, /\$\d/);
});

test("the code note renders nothing after the end", () => {
  assert.equal(render("2026-11-02T08:00:00Z"), "");
  assert.equal(render("2027-01-01T00:00:00Z"), "");
});

test("the code note is decided per request, not frozen at build time", () => {
  const src = readFileSync("src/components/RedodoDeal.tsx", "utf8");
  assert.match(src, /await connection\(\)/);
  assert.match(src, /<Suspense/);
  assert.match(src, /now=\{requestTimeMs\(\)\}/);
});
