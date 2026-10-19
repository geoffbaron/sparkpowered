import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { COOLER_WH_DAY, CPAP_NO_HUMIDIFIER_W, LOADS, USABLE_FRACTION } from "../src/lib/everyday";
import { CPAP_PACK } from "../src/data/buyer-guides";
import { productById } from "../src/lib/products";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(p) ? [p] : [];
  });
}

// A server page that imports a plain value (number, string, object) from a
// "use client" file gets a client reference, not the value. It renders as NaN
// or as raw error text (the CPAP page bug, October 2026). Client files may
// export only components, hooks and types.
test("client modules export only components, hooks and types", () => {
  for (const f of files("src")) {
    const src = readFileSync(f, "utf8");
    if (!/^\s*["']use client["']/.test(src)) continue;
    for (const m of src.matchAll(/^export\s+(?:default\s+)?(const|let|var|function|class|enum)\s+(\w+)/gm)) {
      const [, kind, name] = m;
      const ok = kind === "function" && (/^[A-Z]/.test(name) || /^use[A-Z]/.test(name));
      assert.ok(ok, `${f} exports ${kind} ${name}; move plain values to a shared non-client module`);
    }
  }
});

test("CPAP and cooler figures are real numbers on every buyer-guide pick", () => {
  assert.ok(Number.isFinite(CPAP_NO_HUMIDIFIER_W) && CPAP_NO_HUMIDIFIER_W > 0 && CPAP_NO_HUMIDIFIER_W < LOADS.cpapW);
  assert.ok(Number.isFinite(COOLER_WH_DAY) && COOLER_WH_DAY > 100);
  const nights = (wh: number, w: number) => (wh * USABLE_FRACTION) / (w * LOADS.cpapNightHours);
  const ids = ["bluetti-elite-30-v2", "bluetti-elite-100-v2", "bluetti-ac180", "bluetti-elite-200-v2", "ecoflow-river-3-plus", "jackery-explorer-1000-v2", "anker-solix-c1000-gen-2"];
  const caps = [...ids.map((id) => productById(id).capacityWh), CPAP_PACK.capacityWh];
  for (const wh of caps) {
    for (const w of [LOADS.cpapW, CPAP_NO_HUMIDIFIER_W]) {
      const n = nights(wh, w);
      assert.ok(Number.isFinite(n) && n > 0 && n < 100, `${wh} Wh at ${w} W gave ${n}`);
      assert.doesNotMatch(String(n), /NaN|undefined|Infinity/);
    }
  }
  assert.equal((LOADS.cpapW / CPAP_NO_HUMIDIFIER_W).toFixed(1), "2.5");
});
