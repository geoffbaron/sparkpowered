/**
 * Matching a sized off-grid or outage system to ready-to-buy kits, and the
 * honest coverage figures shown on each kit card. Plain values and functions
 * only, so server pages, client components and tests share one set of rules.
 */

import { cartUrl, partnerUrl, type CartItem, type ResolvedLink } from "@/data/affiliates";
import { KITS, type Kit } from "@/data/kits";
import { USABLE_FRACTION } from "@/lib/everyday";

/** What the calculator says the reader needs. */
export interface KitNeed {
  /** Rated battery Wh the calculator asked for. */
  batteryWh: number;
  /** Panel watts that replace a day's use in December (0 when not sized, e.g. outages). */
  panelW: number;
  /** Running watts if everything listed is on at once (0 when unknown). */
  runningW: number;
  /** Wh a day, for "days of battery". */
  whPerDay: number;
  /** Usable share of rated battery capacity (lithium by default). */
  usable?: number;
}

/** A kit with the reader's chosen extra batteries and panels. */
export interface KitConfig {
  kit: Kit;
  extraBatteries: number;
  extraPanels: number;
}

export interface KitTotals {
  batteryWh: number;
  panelW: number;
  priceUsd: number;
  itemCount: number;
  /** Cart lines, extras included. */
  items: (CartItem & { label: string; unitPriceUsd: number; url: string })[];
}

const clampInt = (n: number, max: number) => Math.max(0, Math.min(max, Math.floor(Number.isFinite(n) ? n : 0)));

/** Totals and cart lines for a kit plus extras (extras are clamped to what the brand allows). */
export function configTotals({ kit, extraBatteries, extraPanels }: KitConfig): KitTotals {
  const b = clampInt(extraBatteries, kit.addBattery?.max ?? 0);
  const p = clampInt(extraPanels, kit.addPanel?.max ?? 0);
  const items: KitTotals["items"] = kit.lines.map((l) => ({ variantId: l.variantId, qty: l.qty, label: l.label, unitPriceUsd: l.unitPriceUsd, url: l.url }));
  const add = (x: NonNullable<Kit["addBattery"]>, qty: number) => {
    if (qty <= 0) return;
    const same = items.find((i) => i.variantId === x.variantId);
    if (same) same.qty += qty;
    else items.push({ variantId: x.variantId, qty, label: x.label, unitPriceUsd: x.unitPriceUsd, url: x.url });
  };
  if (kit.addBattery) add(kit.addBattery, b);
  if (kit.addPanel) add(kit.addPanel, p);
  const r = (n: number) => Math.round(n * 100) / 100;
  return {
    batteryWh: r(kit.batteryWh + b * (kit.addBattery?.wh ?? 0)),
    panelW: kit.panelW + p * (kit.addPanel?.panelW ?? 0),
    priceUsd: r(kit.priceUsd + b * (kit.addBattery?.unitPriceUsd ?? 0) + p * (kit.addPanel?.unitPriceUsd ?? 0)),
    itemCount: items.reduce((t, i) => t + i.qty, 0),
    items,
  };
}

export interface Coverage {
  /** Days the battery runs the daily load from full, no sun (null when no load). */
  batteryDays: number | null;
  /** Battery Wh short of the need (0 if covered). */
  batteryShortWh: number;
  coversBattery: boolean;
  /** Panel watts the station can actually use: min(panels, solar input). */
  usablePanelW: number;
  /** % of the December panel need the panels cover (null when no panel need). */
  panelPct: number | null;
  /** True when the station's solar input is below the December panel need, so no number of panels gets there. */
  inputCapped: boolean;
  /** null when the running watts are unknown. */
  runsAll: boolean | null;
  /** True when it holds the energy and (if known) runs everything at once. */
  covers: boolean;
}

export function coverage(c: KitConfig, need: KitNeed): Coverage {
  const t = configTotals(c);
  const usable = need.usable ?? USABLE_FRACTION;
  const batteryDays = need.whPerDay > 0 ? (t.batteryWh * usable) / need.whPerDay : null;
  const coversBattery = t.batteryWh + 0.5 >= need.batteryWh;
  const usablePanelW = Math.min(t.panelW, c.kit.solarInputW);
  const panelPct = need.panelW > 0 ? Math.round((usablePanelW / need.panelW) * 100) : null;
  const runsAll = need.runningW > 0 ? c.kit.acOutputW >= need.runningW : null;
  return {
    batteryDays,
    batteryShortWh: Math.max(0, need.batteryWh - t.batteryWh),
    coversBattery,
    usablePanelW,
    panelPct,
    inputCapped: need.panelW > 0 && c.kit.solarInputW < need.panelW,
    runsAll,
    covers: coversBattery && runsAll !== false,
  };
}

/**
 * The cheapest way to make one kit fit: fewest extra batteries that reach the
 * battery need (or all it allows), then fewest extra panels that reach the
 * December panel need (or all it allows).
 */
export function fitKit(kit: Kit, need: KitNeed): KitConfig {
  const maxB = kit.addBattery?.max ?? 0;
  const maxP = kit.addPanel?.max ?? 0;
  let b = 0;
  while (b < maxB && !coverage({ kit, extraBatteries: b, extraPanels: 0 }, need).coversBattery) b++;
  let p = 0;
  const panelsShort = (n: number) => need.panelW > 0 && Math.min(configTotals({ kit, extraBatteries: b, extraPanels: n }).panelW, kit.solarInputW) < need.panelW;
  while (p < maxP && panelsShort(p)) p++;
  return { kit, extraBatteries: b, extraPanels: p };
}

export type PickRole = "least" | "value" | "grow" | "brand" | "short" | "closest";

export const PICK_LABELS: Record<PickRole, string> = {
  least: "Covers it for the least",
  value: "Best value per kWh",
  grow: "Room to grow",
  brand: "Another brand that covers it",
  short: "Close, but a little short",
  closest: "Closest plug-and-play kit",
};

export interface KitPick {
  role: PickRole;
  label: string;
  config: KitConfig;
  totals: KitTotals;
  coverage: Coverage;
}

export interface KitMatch {
  picks: KitPick[];
  /** True when no kit holds the energy and runs the load: point to a component system. */
  tooBig: boolean;
}

/** Most battery a kit can reach with every allowed extra. */
const maxWh = (k: Kit) => k.batteryWh + (k.addBattery?.max ?? 0) * (k.addBattery?.wh ?? 0);

/**
 * Up to three kits for a need:
 *   1. "Covers it for the least": the cheapest kit (with extras) that holds the
 *      energy and runs everything at once.
 *   2. "Best value per kWh": the lowest price per kWh among the other covering
 *      kits no more than 3x the size needed; failing that, "Room to grow": the
 *      covering kit that can expand furthest.
 *   3. The cheapest covering kit from each brand not already shown.
 * Short of three, the nearest kit from each other brand, marked as short.
 * If nothing covers it, the biggest kit from each brand with its shortfall, and
 * `tooBig` so the page can point to a component system instead.
 */
export function matchKits(need: KitNeed, kits: Kit[] = KITS): KitMatch {
  const pick = (role: PickRole, config: KitConfig): KitPick => ({
    role,
    label: PICK_LABELS[role],
    config,
    totals: configTotals(config),
    coverage: coverage(config, need),
  });
  const fits = kits.map((k) => fitKit(k, need)).map((c) => ({ c, t: configTotals(c), cov: coverage(c, need) }));
  const covering = fits.filter((f) => f.cov.covers).sort((a, b) => a.t.priceUsd - b.t.priceUsd || (b.cov.panelPct ?? 0) - (a.cov.panelPct ?? 0));

  if (covering.length === 0) {
    const byBrand = new Map<string, (typeof fits)[number]>();
    for (const f of [...fits].sort((a, b) => b.t.batteryWh - a.t.batteryWh || Number(b.cov.runsAll) - Number(a.cov.runsAll) || a.t.priceUsd - b.t.priceUsd)) {
      if (!byBrand.has(f.c.kit.brand)) byBrand.set(f.c.kit.brand, f);
    }
    return { picks: [...byBrand.values()].slice(0, 3).map((f) => pick("closest", f.c)), tooBig: true };
  }

  const picks: KitPick[] = [pick("least", covering[0].c)];
  const rest = covering.slice(1);
  const perKwh = (f: (typeof fits)[number]) => f.t.priceUsd / (f.t.batteryWh / 1000);
  const value = rest
    .filter((f) => f.t.batteryWh <= Math.max(need.batteryWh, 1) * 3 && perKwh(f) < perKwh(covering[0]))
    .sort((a, b) => perKwh(a) - perKwh(b))[0];
  if (value) picks.push(pick("value", value.c));
  else {
    const grow = rest.filter((f) => maxWh(f.c.kit) > maxWh(covering[0].c.kit)).sort((a, b) => maxWh(b.c.kit) - maxWh(a.c.kit) || a.t.priceUsd - b.t.priceUsd)[0];
    if (grow) picks.push(pick("grow", grow.c));
  }
  const used = new Set(picks.map((p) => p.config.kit.brand));
  for (const f of rest) {
    if (picks.length >= 3) break;
    if (used.has(f.c.kit.brand) || picks.some((p) => p.config.kit.id === f.c.kit.id)) continue;
    used.add(f.c.kit.brand);
    picks.push(pick("brand", f.c));
  }
  // Fewer than three that cover it: show the nearest kit from each other brand
  // (at least 75% of the battery need), clearly marked as short.
  if (picks.length < 3) {
    const shown = new Set(picks.map((p) => p.config.kit.brand));
    const near = fits
      .filter((f) => !f.cov.covers && !shown.has(f.c.kit.brand) && f.t.batteryWh >= need.batteryWh * 0.75 && f.cov.runsAll !== false)
      .sort((a, b) => b.t.batteryWh - a.t.batteryWh || a.t.priceUsd - b.t.priceUsd);
    for (const f of near) {
      if (picks.length >= 3 || shown.has(f.c.kit.brand)) continue;
      shown.add(f.c.kit.brand);
      picks.push(pick("short", f.c));
    }
  }
  return { picks, tooBig: false };
}

/** The outbound "add this kit to your cart" link (tracked when the brand is approved). */
export function kitCartLink(c: KitConfig): ResolvedLink {
  return cartUrl(c.kit.brand, configTotals(c).items);
}

/** Where to send a reader whose load is too big for any plug-and-play kit. */
export function componentSystemLink(): ResolvedLink {
  return partnerUrl("shopsolar");
}

/** Plain-text shopping list for the clipboard. */
export function shoppingListText(c: KitConfig, brandName: string, checkedLabel: string): string {
  const t = configTotals(c);
  const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const lines = t.items.map((i) => `- ${i.qty} x ${i.label}: ${usd(i.unitPriceUsd * i.qty)}\n  ${i.url}`);
  return [
    `${c.kit.name} (from ${brandName})`,
    ...lines,
    `Total: ${usd(t.priceUsd)} (prices on ${brandName}'s site, checked ${checkedLabel}; they change)`,
    `Add all ${t.itemCount} items to the cart at ${brandName}: ${kitCartLink(c).href}`,
  ].join("\n");
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-26" -> "Oct 26, 2026" (no time zone involved). */
export function checkedLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`;
}

/** Stable key for a need, so the picker can reset the reader's extras when the need changes. */
export const needKey = (n: KitNeed) => [n.batteryWh, n.panelW, n.runningW, n.whPerDay].map((x) => Math.round(x)).join("|");
