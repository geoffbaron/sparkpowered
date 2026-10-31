import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import BestHomeEvChargerPage from "../src/app/best-home-ev-charger/page";
import InstallCostPage from "../src/app/ev-charger-installation-cost/page";
import { ChargerPick, HomeChargerGuide } from "../src/components/chargers";
import { LINK_DISCLOSURE } from "../src/components/affiliate";

/** Every partner link (<a data-partner=...>) must be followed right away by the commission note. */
function checkEveryLink(html: string, where: string) {
  const re = /<a [^>]*data-partner="([a-z]+)"[^>]*>[\s\S]*?<\/a>/g;
  let n = 0;
  let eviqo = 0;
  for (const m of html.matchAll(re)) {
    if (m[1] === "energysage" || m[1] === "none") continue; // EnergySage box has its own disclosure; "none" = plain link
    n++;
    if (m[1] === "eviqo") {
      eviqo++;
      assert.match(m[0], /href="https:\/\/eviqo\.io\/products\/[^"?]+\?ref=zycwdczj"/, `${where}: EVIQO link carries the ref code`);
    }
    const after = html.slice(m.index! + m[0].length, m.index! + m[0].length + 200);
    assert.ok(after.includes(LINK_DISCLOSURE), `${where}: no commission note right after ${m[0].slice(0, 160)}`);
  }
  return { n, eviqo };
}

test("Best home charger guide: EVIQO is in, and every product link has the commission note beside it", () => {
  const html = renderToStaticMarkup(BestHomeEvChargerPage());
  const { n, eviqo } = checkEveryLink(html, "/best-home-ev-charger");
  assert.ok(n >= 10, `only ${n} partner links`);
  assert.ok(eviqo >= 5, `only ${eviqo} EVIQO links`);
  assert.match(html, /Best for most homes \(J1772 plug\)/);
});

test("Installation cost page and shared charger blocks: commission note beside every product link", () => {
  checkEveryLink(renderToStaticMarkup(InstallCostPage()), "/ev-charger-installation-cost");
  const pick = renderToStaticMarkup(ChargerPick({}));
  assert.ok(checkEveryLink(pick, "ChargerPick").eviqo >= 1);
  checkEveryLink(renderToStaticMarkup(HomeChargerGuide({})), "HomeChargerGuide");
});
