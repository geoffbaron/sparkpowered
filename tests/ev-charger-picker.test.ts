import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { circuitFor, DEFAULT_INPUT, pick, type PickerInput } from "../src/lib/ev-charger-picker";
import { pickerData } from "../src/lib/ev-charger-picker-data";
import { HOME_CHARGERS } from "../src/data/chargers";
import { INSTALL_COST } from "../src/data/buyer-guides";
import { AFFILIATES } from "../src/data/affiliates";

const data = pickerData();
const run = (o: Partial<PickerInput>) => pick({ ...DEFAULT_INPUT, ...o }, data);
const ids = (r: ReturnType<typeof run>) => r.products.map((p) => p.charger.id);

test("125% rule: breaker sizes", () => {
  assert.deepEqual([24, 32, 40, 48].map(circuitFor), [30, 40, 50, 60]);
});

test("Tesla with an existing 14-50: 40 A plug-in NACS, Lectron, $0 install", () => {
  const r = run({ plug: "tesla", power: "outlet1450", dailyMiles: 40 });
  assert.equal(r.connector, "NACS");
  assert.equal(r.amps, 40);
  assert.equal(r.circuitAmps, 50);
  assert.equal(r.connection, "plug-in");
  assert.deepEqual(ids(r), ["lectron-nexus-nacs"]);
  assert.equal(r.install.zero, true);
  assert.equal(r.install.low, 0);
});

test("J1772, new 50 A circuit, wants off-peak scheduling: Autel first, state install average", () => {
  const r = run({ plug: "j1772", power: "new50", smart: true, state: "CA" });
  assert.equal(r.amps, 40);
  assert.deepEqual(ids(r), ["autel-elite-home-40a", "lectron-nexus-j1772"]);
  assert.equal(r.install.low, INSTALL_COST.byState.CA);
  assert.equal(r.newCircuit, true);
});

test("No scheduling wanted: cheaper Lectron first", () => {
  assert.deepEqual(ids(run({ plug: "j1772", power: "new50", smart: false })), ["lectron-nexus-j1772", "autel-elite-home-40a"]);
});

test("Most drivers need 32-40 A, even a pickup at 150 miles", () => {
  assert.equal(run({ dailyMiles: 40, car: "typical", power: "new50" }).neededAmps, 32);
  const big = run({ dailyMiles: 150, car: "large", power: "big" });
  assert.ok(big.neededAmps <= 40, `needed ${big.neededAmps}`);
  assert.ok(big.hours.byAmps[40] <= 8);
  assert.equal(run({ dailyMiles: 20, car: "efficient" }).level1Enough, true);
  assert.equal(run({ dailyMiles: 100, car: "typical" }).level1Enough, false);
});

test("Dryer outlet: 24 A, no product linked, spec to look for", () => {
  const r = run({ power: "dryer", dailyMiles: 40 });
  assert.equal(r.amps, 24);
  assert.equal(r.products.length, 0);
  assert.match(r.noMatch ?? "", /24 amps/);
  assert.equal(r.install.zero, true);
});

test("Tight panel: 32 A on a 40 A circuit, adjustable charger set to 32, upgrade range shown", () => {
  const r = run({ plug: "j1772", power: "tight" });
  assert.equal(r.amps, 32);
  assert.equal(r.circuitAmps, 40);
  assert.deepEqual(ids(r), ["autel-elite-home-40a"]);
  assert.equal(r.products[0].setTo, 32);
  assert.equal(r.install.high, INSTALL_COST.usAverage + INSTALL_COST.serviceUpgrade[1]);
  const n = run({ plug: "tesla", power: "tight" });
  assert.deepEqual(ids(n), ["lectron-portable-nacs"]);
});

test("Hardwired: Autel 50 A for J1772; spec only for NACS", () => {
  const j = run({ plug: "j1772", mount: "hardwired", power: "new50" });
  assert.equal(j.connection, "hardwired");
  assert.deepEqual(ids(j), ["autel-elite-home-50a"]);
  assert.equal(j.products[0].setTo, 40);
  const n = run({ plug: "nacs", mount: "hardwired", power: "new50" });
  assert.equal(n.products.length, 0);
  assert.match(n.noMatch ?? "", /hardwired NACS/);
});

test("Parking outside with no preference leans hardwired", () => {
  const r = run({ plug: "j1772", spot: "outside", mount: "either", power: "new50" });
  assert.equal(r.connection, "hardwired");
  assert.ok(r.notes.some((n) => /Autel recommends hardwiring/.test(n)));
});

test("Renter with a NACS car gets the portable charger", () => {
  assert.equal(ids(run({ plug: "tesla", mount: "move", power: "outlet1450" }))[0], "lectron-portable-nacs");
});

test("Every combination: only approved brands, max 2, products or a spec, prices from the data file", () => {
  const plugs = ["tesla", "nacs", "j1772", "unsure"] as const;
  const powers = ["outlet1450", "dryer", "new50", "big", "tight", "unsure"] as const;
  const mounts = ["plugin", "hardwired", "move", "either"] as const;
  for (const plug of plugs)
    for (const power of powers)
      for (const mount of mounts)
        for (const spot of ["garage", "outside"] as const)
          for (const smart of [true, false])
            for (const dailyMiles of [20, 60, 150])
              for (const car of ["efficient", "typical", "large"] as const) {
                const r = run({ plug, power, mount, spot, smart, dailyMiles, car });
                const tag = JSON.stringify({ plug, power, mount, spot, smart, dailyMiles, car });
                assert.ok(r.products.length <= 2, tag);
                assert.ok(r.products.length > 0 || r.noMatch, tag);
                assert.ok(r.amps >= 24 && r.amps <= 48, tag);
                for (const p of r.products) {
                  assert.ok(["lectron", "autel"].includes(p.charger.brand), tag);
                  assert.ok(AFFILIATES[p.charger.brand].tracked, tag);
                  assert.ok(HOME_CHARGERS.includes(p.charger), tag);
                  // Connector must match the car.
                  assert.equal(p.charger.plug, r.connector, tag);
                  // Plug-in chargers never recommended above 40 A or on a hardwired-only result.
                  if (r.connection === "hardwired") assert.match(p.charger.outlet, /Hardwired/, tag);
                }
                assert.ok(Number.isFinite(r.install.low) && r.install.high >= r.install.low, tag);
              }
});

test("Picker shows the per-product disclosure next to every partner link", () => {
  const src = readFileSync(new URL("../src/components/EvChargerPicker.tsx", import.meta.url), "utf8");
  const block = src.slice(src.indexOf("<PartnerLink"), src.indexOf("</ul>", src.indexOf("<PartnerLink")));
  assert.match(block, /We earn a commission if you buy through this link\./);
  assert.equal((src.match(/<PartnerLink/g) ?? []).length, 1);
  assert.match(src, /Use a licensed electrician; permits are often required\./);
  assert.match(src, /June 30, 2026/);
  const page = readFileSync(new URL("../src/app/ev-charger-picker/page.tsx", import.meta.url), "utf8");
  assert.match(page, /<AffiliateDisclosure/);
});
