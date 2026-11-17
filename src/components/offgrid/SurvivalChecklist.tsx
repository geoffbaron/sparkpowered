"use client";

import { fmtKwh, fmtW } from "@/lib/offgrid";
import { KIT_DAYS, type KitPackage } from "@/lib/offgrid-kit";
import { LIGHT_COMMS, MEDICAL_HYGIENE } from "@/lib/survival-kit";

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #survival-print, #survival-print * { visibility: visible !important; }
  #survival-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 0 !important; background: #fff !important; }
  #survival-print .survival-noprint { display: none !important; }
  #survival-print li { break-inside: avoid; }
  #survival-print section { break-inside: avoid-page; }
}`;

const n0 = (n: number) => Math.round(n).toLocaleString("en-US");
const n1 = (n: number) => (n >= 100 ? n0(n) : (Math.round(n * 10) / 10).toLocaleString("en-US"));
const range = (a: number, b: number) => (a === b ? n0(a) : `${n0(a)} to ${n0(b)}`);

function Group({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-4">
      <h4 className="font-bold text-ink text-sm uppercase tracking-wide">{title}</h4>
      <ul className="mt-1 space-y-1">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2 text-sm text-stone-800">
            <span aria-hidden="true" className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border border-black/40" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The whole package as one tick-box list for the cupboard door. Amounts follow the builder's home size and state. */
export default function SurvivalChecklist({ k, stateName }: { k: KitPackage; stateName: string }) {
  const { staples, cooking, bleach, garden } = k.supplies;
  const p = k.power;
  const g = k.generator;

  const power: string[] = p
    ? [
        `${p.match.option.name}${p.match.addOns ? ` + ${p.match.addOns} expansion batteries` : ""} (${fmtKwh(p.match.totalWh)})`,
        `${p.panels} × ${p.panel.watts} W solar panels (${fmtW(p.panelW)})`,
        `Generator and about ${n1(g.gallons)} gallons of gasoline in approved containers`,
      ]
    : [`Generator and about ${n1(g.gallons)} gallons of gasoline in approved containers`];

  const food = staples.map((s) =>
    s.cans != null
      ? `${s.staple.label}: ${n0(s.cans)} cans`
      : s.gallons != null
        ? `${s.staple.label}: ${n0(s.pounds)} lb (about ${n1(s.gallons)} gallons)`
        : `${s.staple.label}: ${n0(s.pounds)} lb`,
  );
  food.push("Manual can opener, salt and spices", `Or freeze-dried meals with ${n0(k.food.total)} calories in all (count calories, not servings)`);

  const water = [
    `${n0(k.water.storeGallons)} gallons stored (${k.water.storeDays} days)`,
    "Certified water filter or purifier",
    `A source for the other ${n0(k.water.treatGallons)} gallons: well, rain barrel, stream or lake`,
    `Bleach to treat it: about ${n1(bleach.flOz)} fl oz of 6% unscented bleach (double for cloudy water)`,
  ];

  const cook = [
    "Camp stove, used outdoors only",
    `${n0(cooking.cylinders)} one-pound propane cylinders, or ${cooking.bulkTanks} × 20-lb tanks and an adapter hose made for the stove`,
    "Lighter and matches in a waterproof container",
    "Warm clothes and a sleeping bag or blankets for each person",
  ];

  const seeds = garden.lines.map(
    (l) => `${l.crop.label}: ${range(l.amount[0], l.amount[1])} ${l.crop.unit === "ft" ? "ft of row" : l.crop.unit}`,
  );
  seeds.push("Hand tools, hose or watering can, row cover or a cold frame");

  return (
    <div id="survival-print" className="mt-6 rounded-3xl border border-black/10 bg-white p-5 sm:p-6" data-testid="survival-checklist">
      <style>{PRINT_CSS}</style>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-ink">
            {KIT_DAYS}-day checklist: {k.home.label.toLowerCase()}, {k.food.people} people, {stateName}
          </h3>
          <p className="text-xs text-muted mt-1">From sparkpowered.com/off-grid-kit. Amounts are estimates; see the page for sources.</p>
        </div>
        <button type="button" onClick={() => window.print()} className="survival-noprint btn btn-primary" data-testid="survival-print-button">
          Print this checklist
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-x-8">
        <div>
          <Group title="Power" items={power} />
          <Group title="Water" items={water} />
          <Group title="Food" items={food} />
          <Group title="Cooking and heat" items={cook} />
        </div>
        <div>
          <Group title="Seeds and garden (for going past 90 days)" items={seeds} />
          <Group title="Medical and hygiene" items={MEDICAL_HYGIENE.map((i) => i.text)} />
          <Group title="Light, radio and safety" items={LIGHT_COMMS.map((i) => i.text)} />
        </div>
      </div>
    </div>
  );
}
