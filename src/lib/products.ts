/**
 * Queries and formatting over the product dataset (src/data/products.ts).
 * Pages and the Battery Sizer go through these helpers so a spec is always
 * shown the same way and filtered by the same rules.
 */

import { AFFILIATES } from "@/data/affiliates";
import { PRODUCTS, type Product } from "@/data/products";

export function productById(id: string): Product {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown product ${id}`);
  return p;
}

export const byCategory = (c: Product["category"]) => PRODUCTS.filter((p) => p.category === c);

export const brandName = (p: Pick<Product, "brand">) => AFFILIATES[p.brand].name;

export const fullName = (p: Product) => `${brandName(p)} ${p.model}`;

export const kwh = (wh: number) => `${(wh / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })} kWh`;
export const watts = (n: number) => `${n.toLocaleString("en-US")} W`;
export const money = (n: number) => {
  const cents = Math.abs(n % 1) > 0.001 && n < 10_000;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
};

/** Largest capacity the system can reach with the maker's own add-on batteries. */
export const maxWh = (p: Product) => p.maxCapacityWh ?? p.capacityWh;

export interface SizerConfig {
  /** Identical units (installed home batteries stack whole units). */
  units: number;
  /** The maker's add-on batteries for plug-in systems. */
  addOns: number;
  totalWh: number;
}

/** Smallest configuration of a product that reaches `neededKwh`. */
export function sizerConfig(p: Product, neededKwh: number): SizerConfig {
  const need = neededKwh * 1000;
  if (p.install === "professional") {
    const units = Math.max(1, Math.ceil(need / p.capacityWh));
    const totalWh = units * p.capacityWh;
    return {
      units,
      addOns: 0,
      totalWh,
    };
  }
  let addOns = 0;
  if (p.capacityWh < need && p.addOn) {
    addOns = Math.min(p.addOn.maxUnits, Math.ceil((need - p.capacityWh) / p.addOn.capacityWh));
  }
  const totalWh = p.capacityWh + addOns * (p.addOn?.capacityWh ?? 0);
  return { units: 1, addOns, totalWh };
}

/** Spare capacity beyond the need, used to rank configurations (closest fit first). */
const spareWh = (c: SizerConfig, neededKwh: number) => c.totalWh - neededKwh * 1000;

/**
 * 2-4 products for the Battery Sizer: every DIY or installed system that can
 * reach `neededKwh`, closest fit first (least spare capacity), one per brand, always
 * including at least one installed whole-home option when the need is large
 * enough that a portable stack is unusual (over 15 kWh).
 */
export function sizerMatches(
  neededKwh: number,
  opts: { excludeBrands?: string[]; limit?: number } = {},
) {
  const limit = opts.limit ?? 4;
  const pool = PRODUCTS.filter(
    (p) =>
      (p.category === "portable" || p.category === "home") &&
      !p.soldOut &&
      !(opts.excludeBrands ?? []).includes(p.brand) &&
      // Plug-in systems qualify only if they reach the size with their own add-ons.
      (p.install === "professional" || maxWh(p) >= neededKwh * 1000) &&
      // A single portable must be at least 1 kWh to count as home backup.
      p.capacityWh >= 1000,
  );
  const scored = pool
    .map((product) => {
      const config = sizerConfig(product, neededKwh);
      return { product, config, spare: spareWh(config, neededKwh) };
    })
    .filter(
      (x) =>
        x.config.totalWh >= neededKwh * 1000 &&
        // Installed systems: stay within the maker's stated maximum, or 4 units if none is stated.
        (x.product.install === "diy" || x.config.totalWh <= (x.product.maxCapacityWh ?? x.product.capacityWh * 4)),
    );
  scored.sort((a, b) => a.spare - b.spare || a.config.addOns - b.config.addOns);

  const out: typeof scored = [];
  const seen = new Set<string>();
  const add = (x: (typeof scored)[number]) => {
    if (out.length < limit && !seen.has(x.product.brand)) {
      out.push(x);
      seen.add(x.product.brand);
    }
  };
  // Up to 3 plug-in systems (2 for large needs), then installed options, then anything left.
  for (const x of scored.filter((x) => x.product.install === "diy")) {
    if (out.length >= (neededKwh > 15 ? 2 : 3)) break;
    add(x);
  }
  for (const x of scored.filter((x) => x.product.install === "professional")) add(x);
  for (const x of scored) add(x);
  return out.sort((a, b) => a.spare - b.spare);
}
