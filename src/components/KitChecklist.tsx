"use client";

import { useState } from "react";
import { pillClass } from "@/components/guide-ui";
import { KIT_DAYS, buildKit, type KitLength } from "@/lib/prep";

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #kit-print, #kit-print * { visibility: visible !important; }
  #kit-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 0 !important; }
  #kit-print .kit-noprint { display: none !important; }
  #kit-print li { break-inside: avoid; }
}`;

/** Ready.gov kit list scaled to a household, with tick boxes and a print button. */
export default function KitChecklist() {
  const [people, setPeople] = useState(2);
  const [length, setLength] = useState<KitLength>("72h");
  const [infant, setInfant] = useState(false);
  const [pet, setPet] = useState(false);
  const [meds, setMeds] = useState(true);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const lines = buildKit({ people, infant, pet, meds }, length);
  const basic = lines.filter((l) => l.group === "basic");
  const extra = lines.filter((l) => l.group === "additional");
  const ticked = lines.filter((l) => done[l.id]).length;

  const list = (items: typeof lines, title: string) => (
    <section key={title}>
      <h3 className="font-extrabold text-ink mt-4 mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((l) => (
          <li key={l.id}>
            <label className="flex items-start gap-3 text-sm text-stone-800">
              <input
                type="checkbox"
                checked={!!done[l.id]}
                onChange={(e) => setDone((d) => ({ ...d, [l.id]: e.target.checked }))}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>
                {l.text}
                {l.qty && <strong className="ml-1 whitespace-nowrap">: {l.qty}</strong>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden" id="kit-print" data-testid="kit-checklist">
      <style>{PRINT_CSS}</style>
      <div className="kit-noprint p-5 sm:p-6 border-b border-black/8 grid sm:grid-cols-2 gap-5">
        <label className="block" htmlFor="kit-people">
          <span className="font-bold text-ink">1. People in your home</span>
          <input
            id="kit-people"
            type="number"
            min={1}
            max={50}
            value={people}
            onChange={(e) => setPeople(Math.max(1, Math.min(50, Math.round(Number(e.target.value)) || 1)))}
            className="mt-2 block w-28 rounded-lg border border-black/20 px-3 py-2 tabular-nums bg-white"
          />
        </label>
        <fieldset>
          <legend className="font-bold text-ink mb-2">2. Kit length</legend>
          <div className="flex flex-wrap gap-2">
            {(["72h", "2wk"] as KitLength[]).map((k) => (
              <button key={k} type="button" aria-pressed={length === k} onClick={() => setLength(k)} className={pillClass(length === k)}>
                {k === "72h" ? `72 hours (${KIT_DAYS[k]} days)` : `2 weeks (${KIT_DAYS[k]} days)`}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="sm:col-span-2">
          <legend className="font-bold text-ink mb-2">3. Your household has</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {[
              { v: meds, set: setMeds, label: "Someone on prescription medicine" },
              { v: infant, set: setInfant, label: "A baby" },
              { v: pet, set: setPet, label: "Pets" },
            ].map((o) => (
              <label key={o.label} className="flex items-center gap-2">
                <input type="checkbox" checked={o.v} onChange={(e) => o.set(e.target.checked)} className="h-4 w-4" />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-ink">
            {length === "72h" ? "72-hour" : "2-week"} home emergency kit for {people} {people === 1 ? "person" : "people"}
          </h2>
          <button type="button" onClick={() => window.print()} className="kit-noprint btn btn-primary" data-testid="kit-print-button">
            Print checklist
          </button>
        </div>
        <p className="kit-noprint text-sm text-muted mt-1" aria-live="polite">
          {ticked} of {lines.length} packed. Ticks stay on this page only; nothing is saved or sent.
        </p>
        {list(basic, "Basic kit (Ready.gov)")}
        {list(extra, "Also consider (Ready.gov)")}
        <p className="text-xs text-muted mt-5">
          From the Ready.gov Build a Kit list. Water at 1 gallon per person per day (CDC). Replace expired items and rethink the kit
          every year. sparkpowered.com/emergency-kit-checklist
        </p>
      </div>
    </div>
  );
}
