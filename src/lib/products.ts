/**
 * Queries and formatting over the product dataset (src/data/products.ts).
 * Pages and the Battery Sizer go through these helpers so a spec is always
 * shown the same way and filtered by the same rules.
 */

import { AFFILIATES } from "@/data/affiliates";
import { INSTALLED_BATTERY_COST, PRODUCTS, type Product } from "@/data/products";

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

/** Dollars per kWh of capacity at the listed price. */
export const perKwh = (p: Product) => (p.priceUsd ? p.priceUsd / (p.capacityWh / 1000) : null);

/** Largest capacity the system can reach with the maker's own add-on batteries. */
export const maxWh = (p: Product) => p.maxCapacityWh ?? p.capacityWh;

export interface SizerConfig {
  /** Identical units (installed home batteries stack whole units). */
  units: number;
  /** The maker's add-on batteries for plug-in systems. */
  addOns: number;
  totalWh: number;
  /** Equipment total at listed prices, if every part has a listed price. */
  equipmentUsd: number | null;
  /** Typical installed cost for professionally installed systems (EnergySage $/kWh × kWh). */
  installedUsd: number | null;
}

/** Installed $/kWh for a professionally installed product. */
export const installedPerKwh = (p: Product) => p.installedPerKwh?.usd ?? INSTALLED_BATTERY_COST.medianPerKwh;

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
      equipmentUsd: null,
      installedUsd: Math.round(((totalWh / 1000) * installedPerKwh(p)) / 100) * 100,
    };
  }
  let addOns = 0;
  if (p.capacityWh < need && p.addOn) {
    addOns = Math.min(p.addOn.maxUnits, Math.ceil((need - p.capacityWh) / p.addOn.capacityWh));
  }
  const totalWh = p.capacityWh + addOns * (p.addOn?.capacityWh ?? 0);
  const addOnCost = addOns === 0 ? 0 : p.addOn?.priceUsd != null ? addOns * p.addOn.priceUsd : null;
  return {
    units: 1,
    addOns,
    totalWh,
    equipmentUsd: p.priceUsd != null && addOnCost != null ? p.priceUsd + addOnCost : null,
    installedUsd: null,
  };
}

/** Cost figure used to rank and budget-check a configuration. */
export function configCost(c: SizerConfig) {
  return c.equipmentUsd ?? c.installedUsd ?? Infinity;
}

/**
 * 2-4 products for the Battery Sizer: every DIY or installed system that can
 * reach `neededKwh`, cheapest configuration first, one per brand, always
 * including at least one installed whole-home option when the need is large
 * enough that a portable stack is unusual (over 15 kWh).
 */
export function sizerMatches(
  neededKwh: number,
  opts: { excludeBrands?: string[]; limit?: number; budgetUsd?: number } = {},
) {
  const limit = opts.limit ?? 4;
  const pool = PRODUCTS.filter(
    (p) =>
      (p.category === "portable" || p.category === "home") &&
      !(opts.excludeBrands ?? []).includes(p.brand) &&
      // Plug-in systems qualify only if they reach the size with their own add-ons.
      (p.install === "professional" || maxWh(p) >= neededKwh * 1000) &&
      // A single portable must be at least 1 kWh to count as home backup.
      p.capacityWh >= 1000,
  );
  const scored = pool
    .map((product) => {
      const config = sizerConfig(product, neededKwh);
      return { product, config, cost: configCost(config) };
    })
    .filter(
      (x) =>
        x.config.totalWh >= neededKwh * 1000 &&
        x.cost < Infinity &&
        // Installed systems: stay within the maker's stated maximum, or 4 units if none is stated.
        (x.product.install === "diy" || x.config.totalWh <= (x.product.maxCapacityWh ?? x.product.capacityWh * 4)),
    );
  scored.sort((a, b) => a.cost - b.cost || a.config.totalWh - b.config.totalWh);

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
  return out.sort((a, b) => a.cost - b.cost);
}
