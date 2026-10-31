"use client";

import { useState } from "react";
import { PartnerLink } from "@/components/affiliate";
import { PlainLink, pillClass } from "@/components/guide-ui";
import type { BrandId } from "@/data/affiliates";

export interface PlugRec {
  name: string;
  priceUsd: number;
  why: string;
  brand: BrandId | null;
  id: string;
  url: string;
}

export type Car = "tesla" | "nacs" | "j1772";

const LABELS: Record<Car, string> = {
  tesla: "A Tesla",
  nacs: "Another EV with a Tesla-style (NACS) port",
  j1772: "Most other EVs and plug-in hybrids (J1772 port)",
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: n % 1 ? 2 : 0 });

/** "What do you drive?" -> which plug, and which charger to buy. */
export default function PlugPicker({ recs, notes }: { recs: Record<Car, PlugRec[]>; notes: Record<Car, string> }) {
  const [car, setCar] = useState<Car>("j1772");
  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="plug-picker">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8">
        <fieldset>
          <legend className="font-bold text-ink mb-2">What do you drive (or plan to)?</legend>
          <div className="flex flex-col items-start gap-2">
            {(Object.keys(LABELS) as Car[]).map((c) => (
              <button key={c} type="button" aria-pressed={car === c} onClick={() => setCar(c)} className={pillClass(car === c)}>
                {LABELS[c]}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="text-sm text-stone-700 mt-5 leading-relaxed">{notes[car]}</p>
      </div>
      <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Buy this</p>
        <ul className="mt-2 space-y-4">
          {recs[car].map((r, i) => (
            <li key={r.id}>
              <p className={i === 0 ? "text-xl font-extrabold text-ink" : "font-bold text-ink"} data-testid={i === 0 ? "plug-pick" : undefined}>
                {r.name} <span className="text-sm font-semibold text-muted">{money(r.priceUsd)}</span>
              </p>
              <p className="text-sm text-stone-700">{r.why}</p>
              <div className="mt-2">
                {r.brand ? (
                  <PartnerLink brand={r.brand} productId={r.id} productUrl={r.url} className={i === 0 ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} disclose>
                    Check price
                  </PartnerLink>
                ) : (
                  <PlainLink href={r.url} className="btn btn-outline btn-sm">See it</PlainLink>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
