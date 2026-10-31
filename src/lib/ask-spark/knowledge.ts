/**
 * Ask Spark's knowledge pack: a compact text copy of Spark Powered's own
 * fact-checked pages, built from the same typed data the pages render, so the
 * chat can only say what the site says. Also the fixed product list (partner
 * brands with tracked links only, never Amazon) and the list of site pages a
 * reply may link to.
 *
 * Everything here is deterministic, computed once per server start from data
 * committed in the repo; nothing is fetched.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AFFILIATES, partnerUrl, type BrandId } from "@/data/affiliates";
import { BATTERIES, LITIME_RV, OTHER_LITHIUM } from "@/data/batteries";
import { HOME_CHARGERS } from "@/data/chargers";
import { COMPARISONS } from "@/data/comparisons";
import { ENDED_CREDITS } from "@/data/incentives";
import { MYTHS } from "@/data/myths";
import { PRODUCTS } from "@/data/products";
import { ALL_QUESTIONS, TOPICS, questionPath, type Block } from "@/data/questions";
import { EIA_LATEST, LOCAL_CHECKED, STATE_LOCAL } from "@/data/state-local";
import { DATA_UPDATED, NATIONAL, STATES } from "@/lib/energy";
import { money } from "@/lib/products";
import { ROUTES } from "@/lib/seo";
import { CALCULATORS } from "./config";

export const SITE = "https://sparkpowered.com";

// ---------------------------------------------------------------- products

export interface CatalogProduct {
  id: string;
  name: string;
  brand: BrandId;
  /** One line of facts for the model (capacity, output, use). */
  facts: string;
  /** Price exactly as the site shows it, with the date it was read; null = show no price. */
  priceText: string | null;
  /** Tracked partner link (rel="sponsored"). */
  href: string;
  /** Spark Powered page that covers it. */
  page: string;
}

const checked = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};
const priceText = (usd: number | null | undefined, brand: BrandId, iso: string) =>
  usd ? `${money(usd)} on ${AFFILIATES[brand].name}'s US site (checked ${checked(iso)})` : null;

/** Only brands whose links carry our affiliate tracking: the commission note is then true. */
const isTracked = (brand: BrandId | undefined): brand is BrandId => !!brand && AFFILIATES[brand].tracked;

function link(brand: BrandId, productId: string, productUrl: string) {
  const l = partnerUrl(brand, { productId, productUrl });
  return l.tracked ? l.href : null;
}

function buildCatalog(): CatalogProduct[] {
  const out: CatalogProduct[] = [];
  const push = (p: CatalogProduct | null) => p && out.push(p);

  for (const p of PRODUCTS) {
    if (!isTracked(p.brand)) continue;
    if (p.notes.some((n) => /^out of stock/i.test(n))) continue; // the unit itself was unavailable
    const href = link(p.brand, p.id, p.url);
    if (!href) continue;
    push({
      id: p.id,
      name: `${AFFILIATES[p.brand].name} ${p.model}`,
      brand: p.brand,
      facts: `${p.category === "home" ? "whole-home battery" : "portable power station"}, ${p.capacityWh.toLocaleString("en-US")} Wh, ${p.acOutputW.toLocaleString("en-US")} W AC output${p.maxCapacityWh ? `, expandable to ${p.maxCapacityWh.toLocaleString("en-US")} Wh` : ""}${p.chemistry ? `, ${p.chemistry}` : ""}${p.weightLb ? `, ${p.weightLb} lb` : ""}`,
      priceText: priceText(p.priceUsd, p.brand, p.retrieved),
      href,
      page: p.category === "home" ? "/home-battery-backup" : "/best-portable-power-stations",
    });
  }

  for (const c of HOME_CHARGERS) {
    if (!isTracked(c.brand)) continue;
    const href = link(c.brand, c.id, c.url);
    if (!href) continue;
    push({
      id: c.id,
      name: `${AFFILIATES[c.brand].name} ${c.name}`,
      brand: c.brand,
      facts: `home EV charger, ${c.level}, ${c.plug} plug, ${c.amps} A, ${c.outlet}${c.milesPerHour ? `, up to ${c.milesPerHour} miles of range an hour (maker's figure)` : ""}`,
      priceText: priceText(c.priceUsd, c.brand, c.retrieved),
      href,
      page: "/best-home-ev-charger",
    });
  }

  for (const b of BATTERIES) {
    if (!isTracked(b.brand)) continue;
    const href = link(b.brand, b.id, b.url);
    if (!href) continue;
    push({
      id: b.id,
      name: `${AFFILIATES[b.brand].name} ${b.short}`,
      brand: b.brand,
      facts: `${b.volts} V LiFePO4 battery, ${b.ampHours} Ah (${b.energyWh.toLocaleString("en-US")} Wh), ${b.weightLb} lb, uses: ${b.uses.join(", ")}${b.selfHeating ? ", self-heating" : ""}`,
      priceText: priceText(b.priceUsd, b.brand, b.retrieved),
      href,
      page: b.uses.includes("trolling") ? "/best-trolling-motor-battery" : "/lithium-rv-battery",
    });
  }

  for (const o of [...OTHER_LITHIUM, { ...LITIME_RV, note: "", cycles: null, warrantyYears: null }]) {
    if (!isTracked(o.brand)) continue;
    const href = link(o.brand, o.id, o.url);
    if (!href) continue;
    push({
      id: o.id,
      name: o.name,
      brand: o.brand,
      facts: `12 V LiFePO4 battery, ${o.energyWh.toLocaleString("en-US")} Wh${o.weightLb ? `, ${o.weightLb} lb` : ""}`,
      priceText: priceText(o.priceUsd, o.brand, o.retrieved),
      href,
      page: "/lithium-rv-battery",
    });
  }
  return out;
}

export const CATALOG: CatalogProduct[] = buildCatalog();
export const catalogById = (id: string) => CATALOG.find((p) => p.id === id);

// ---------------------------------------------------------------- pages a reply may link to

function buildPages(): Set<string> {
  const pages = new Set<string>(["/ask"]);
  for (const r of ROUTES) pages.add(r.path);
  for (const s of STATES) pages.add(`/states/${s.slug}`);
  for (const { topic, question } of ALL_QUESTIONS) pages.add(questionPath(topic, question));
  for (const c of COMPARISONS) pages.add(`/compare/${c.slug}`);
  return pages;
}

export const SITE_PAGES: Set<string> = buildPages();

// ---------------------------------------------------------------- the pack

function blockText(b: Block): string {
  if ("p" in b) return b.p;
  if ("ul" in b) return b.ul.map((x) => `- ${x}`).join("\n");
  const t = b.table;
  return [`Table: ${t.caption}`, t.head.join(" | "), ...t.rows.map((r) => r.join(" | "))].join("\n");
}

function llmsTxt(): string {
  try {
    return readFileSync(join(process.cwd(), "public", "llms.txt"), "utf8")
      .replace(/^## Not for indexing[\s\S]*$/m, "")
      .trim();
  } catch {
    return "";
  }
}

function buildPack(): string {
  const parts: string[] = [];

  parts.push(`# SITE INDEX (pages and what each covers)\n${llmsTxt()}`);

  parts.push(
    [
      "# FEDERAL TAX CREDITS (from /incentives; source: IRS fact sheet FS-2025-05 on Public Law 119-21)",
      "Most federal clean-energy credits for households have ended:",
      ...ENDED_CREDITS.map((c) => `- ${c.credit} (section ${c.section}): ${c.end}.`),
      "So: the 30% home solar and battery credit (25D) ended for expenditures after 31 December 2025; the heat pump credit (25C) ended for property placed in service after 31 December 2025; the home EV charger credit (30C) ended for property placed in service after 30 June 2026.",
      "What remains: a car loan interest deduction (tax years 2025-2028, up to $10,000 a year of interest, new vehicle with US final assembly, phases out above $100,000 MAGI / $200,000 joint; not limited to EVs). Leases and power purchase agreements for solar may reflect business-side credits; ask the provider. State and utility rebates: AFDC (EVs) and DSIRE (solar, storage, efficiency), linked per state on /incentives and each /states page.",
      "Always add: tax rules have exceptions; check with a tax pro.",
    ].join("\n"),
  );

  parts.push(
    [
      `# ELECTRICITY AND SOLAR BY STATE (EIA year-to-date average residential price; EIA average monthly use and bill; PVWatts output per kW of panels; data updated ${DATA_UPDATED})`,
      `US average: ${NATIONAL.residentialCentsPerKwhYtd} cents/kWh, ${Math.round(NATIONAL.avgMonthlyKwh)} kWh a month.`,
      "State | page | cents/kWh | avg kWh/month | avg bill/month | solar kWh per kW per year",
      ...STATES.map(
        (s) =>
          `${s.name} | /states/${s.slug} | ${s.electricity.residentialCentsPerKwhYtd} | ${Math.round(s.usage.avgMonthlyKwh)} | ${money(s.usage.avgMonthlyBillUsd)} | ${Math.round(s.solar.kwhPerKwYear)}`,
      ),
      `Latest month (${EIA_LATEST.month}): US average ${EIA_LATEST.us[0]} cents/kWh vs ${EIA_LATEST.us[1]} in ${EIA_LATEST.prevMonth}.`,
    ].join("\n"),
  );

  parts.push(
    [
      `# CHECKED LOCAL FACTS FOR SOME STATES (read on official pages ${LOCAL_CHECKED})`,
      ...Object.entries(STATE_LOCAL).flatMap(([abbr, l]) => {
        const s = STATES.find((x) => x.abbr === abbr);
        return l.facts.map((f) => `- ${s?.name ?? abbr} (/states/${s?.slug ?? ""}): ${f.label}: ${f.text}`);
      }),
    ].join("\n"),
  );

  for (const t of TOPICS) {
    const qs = t.questions.map((q) => {
      const lines = [`## Q: ${q.q}`, `Page: ${questionPath(t, q)}`, `Answer: ${q.a}`, ...q.detail.map(blockText)];
      if (q.example) lines.push(`Worked example: ${q.example.text} (calculator: ${q.example.tool.href})`);
      if (q.tools?.length) lines.push(`Calculators/tools: ${q.tools.map((x) => x.href).join(", ")}`);
      return lines.join("\n");
    });
    parts.push(`# QUESTIONS ANSWERED: ${t.nav} (hub ${t.path})${t.wiring ? " [touches home wiring: always send to a licensed electrician]" : ""}\n${qs.join("\n\n")}`);
  }

  parts.push(
    [
      "# MYTHS ANSWERED (page /myths)",
      ...MYTHS.map((m) => `- "${m.myth}" -> ${m.verdict}. ${m.short}`),
    ].join("\n"),
  );

  parts.push(
    [
      "# PRODUCTS YOU MAY RECOMMEND (the only ones; write the token exactly, e.g. {{product:ID}})",
      ...CATALOG.map((p) => `- {{product:${p.id}}} ${p.name}: ${p.facts}. Covered on ${p.page}.`),
    ].join("\n"),
  );

  parts.push(
    [
      "# CALCULATORS TO POINT PEOPLE TO",
      ...CALCULATORS.map((c) => `- ${c.label}: ${c.href}`),
      "- Off-grid solar calculator: /off-grid-solar-calculator",
      "- EV or plug-in hybrid picker: /ev-or-plug-in-hybrid",
      "- Space heater cost calculator: /space-heater-cost",
    ].join("\n"),
  );

  return parts.join("\n\n");
}

export const KNOWLEDGE_PACK: string = buildPack();
