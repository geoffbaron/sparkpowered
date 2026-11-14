/**
 * EV charger safety pages (Nov 14 2026): GFCI tripping and extension cords.
 * Store links only to hardwired chargers, only on the page whose answer is
 * "hardwire", with the disclosure above the first one; no bypass advice.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import GfciPage from "../src/app/ev-charger-tripping-gfci/page";
import CordPage from "../src/app/ev-charger-extension-cord/page";
import { LINK_DISCLOSURE } from "../src/components/affiliate";
import { HOME_CHARGERS } from "../src/data/chargers";
import { ROUTES } from "../src/lib/seo";

const partnerLinks = (html: string) => [...html.matchAll(/<a [^>]*data-partner="([a-z]+)"[^>]*>[\s\S]*?<\/a>/g)];
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;|&apos;/g, "'").replace(/\s+/g, " ");

test("GFCI page: disclosure first, only hardwired chargers, commission note beside each link", () => {
  const html = renderToStaticMarkup(GfciPage());
  const links = partnerLinks(html);
  assert.ok(links.length >= 3, `only ${links.length} store links`);
  const disclosure = html.indexOf('data-testid="affiliate-disclosure"');
  assert.ok(disclosure > -1 && disclosure < links[0].index!, "AffiliateDisclosure must come before the first store link");
  const hardwired = HOME_CHARGERS.filter((c) => /hardwired/i.test(c.outlet) && !/plug-in/i.test(c.outlet));
  for (const m of links) {
    assert.ok(["eviqo", "autel"].includes(m[1]), `unexpected brand ${m[1]}`);
    const href = decodeURIComponent(m[0].match(/href="([^"]+)"/)![1].replace(/&amp;/g, "&"));
    assert.ok(hardwired.some((c) => href.includes(c.url)), `link is not to a hardwired charger: ${href}`);
    const after = html.slice(m.index! + m[0].length, m.index! + m[0].length + 200);
    assert.ok(after.includes(LINK_DISCLOSURE), "commission note missing beside a store link");
  }
});

test("GFCI page: names the code section, tells people to call an electrician, never to bypass", () => {
  const t = text(renderToStaticMarkup(GfciPage()));
  assert.match(t, /625\.54/);
  assert.match(t, /licensed electrician/i);
  assert.match(t, /Never: swap the GFCI breaker for a standard one yourself/);
  assert.doesNotMatch(t, /\b(you can|simply|just) (swap|replace|change) (the|your) (GFCI )?breaker/i);
});

test("Extension cord page: no store links, says no, names at least three makers", () => {
  const html = renderToStaticMarkup(CordPage());
  assert.equal(partnerLinks(html).filter((m) => m[1] !== "none").length, 0, "this page's answer is not 'hardwire': no store links");
  assert.doesNotMatch(html, /awin1\.com|[?&]ref=|rfsn=/, "no tracked links at all, citations included");
  const t = text(html);
  for (const maker of ["Tesla", "Lectron", "Autel", "EVIQO"]) assert.match(t, new RegExp(maker));
  assert.match(t, /licensed electrician/i);
  assert.match(t, /Don't use a household extension cord/);
});

test("Both pages are in ROUTES", () => {
  const paths = ROUTES.map((r) => r.path);
  assert.ok(paths.includes("/ev-charger-tripping-gfci"));
  assert.ok(paths.includes("/ev-charger-extension-cord"));
});
