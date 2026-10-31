"use client";

import { useMemo, useState } from "react";
import { PartnerLink } from "@/components/affiliate";
import LocalNote from "@/components/LocalNote";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import { NATIONAL_CHOICE } from "@/lib/visitor-state";
import { pillClass } from "@/components/guide-ui";
import type { BrandId } from "@/data/affiliates";

export interface ChargerChoice {
  id: string;
  label: string;
  priceUsd: number;
  brand: BrandId | null;
  url: string;
}

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type Extra = "longRun" | "subpanel" | "serviceUpgrade";

/**
 * State + setup -> what a home charger costs, installed. The state figure is
 * Qmerit's 2026 average installation price (EnergySage); extras are
 * EnergySage's published ranges.
 */
export default function InstallCostCalc({
  states,
  usAverage,
  extras,
  chargers,
  initialState = "",
  autoLocate = true,
}: {
  states: { abbr: string; name: string; avg: number }[];
  usAverage: number;
  extras: Record<Extra, { label: string; range: [number, number] }>;
  chargers: ChargerChoice[];
  initialState?: string;
  autoLocate?: boolean;
}) {
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid, autoLocate);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const abbr = picked ?? located.abbr ?? initialState;
  const setAbbr = (a: string) => {
    setPicked(a);
    choose(a || NATIONAL_CHOICE);
  };
  const [hasOutlet, setHasOutlet] = useState(false);
  const [chargerId, setChargerId] = useState(chargers[0]?.id ?? "");
  const [on, setOn] = useState<Record<Extra, boolean>>({ longRun: false, subpanel: false, serviceUpgrade: false });

  const st = states.find((s) => s.abbr === abbr);
  const install = hasOutlet ? 0 : st?.avg ?? usAverage;
  const charger = chargers.find((c) => c.id === chargerId)!;
  const keys = (Object.keys(extras) as Extra[]).filter((k) => !hasOutlet && on[k]);
  const extraLow = keys.reduce((s, k) => s + extras[k].range[0], 0);
  const extraHigh = keys.reduce((s, k) => s + extras[k].range[1], 0);
  const low = charger.priceUsd + install + extraLow;
  const high = charger.priceUsd + install + extraHigh;

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="install-calc">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-5">
        <label className="block">
          <span className="font-bold text-ink">1. Your state</span>
          <select
            id="install-state"
            value={abbr}
            onChange={(e) => setAbbr(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 bg-white"
          >
            <option value="">US average</option>
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>{s.name}</option>
            ))}
          </select>
          <LocalNote name={states.find((s) => s.abbr === abbr)?.name ?? null} local selectId="install-state" />
        </label>
        <fieldset>
          <legend className="font-bold text-ink mb-2">2. Is there already a 240-volt outlet (dryer or RV type) where you park?</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={hasOutlet} onClick={() => setHasOutlet(true)} className={pillClass(hasOutlet)}>Yes</button>
            <button type="button" aria-pressed={!hasOutlet} onClick={() => setHasOutlet(false)} className={pillClass(!hasOutlet)}>No</button>
          </div>
        </fieldset>
        {!hasOutlet && (
          <fieldset>
            <legend className="font-bold text-ink mb-2">3. Anything that makes it harder?</legend>
            <ul className="grid gap-1.5 text-sm">
              {(Object.keys(extras) as Extra[]).map((k) => (
                <li key={k}>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="mt-1 accent-orange-600" checked={on[k]} onChange={(e) => setOn({ ...on, [k]: e.target.checked })} />
                    <span>
                      {extras[k].label} <span className="text-muted">(+{money(extras[k].range[0])} to {money(extras[k].range[1])})</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}
        <label className="block">
          <span className="font-bold text-ink">{hasOutlet ? "3" : "4"}. Which charger?</span>
          <select
            value={chargerId}
            onChange={(e) => setChargerId(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 bg-white"
          >
            {chargers.map((c) => (
              <option key={c.id} value={c.id}>{c.label} ({money(c.priceUsd)})</option>
            ))}
          </select>
        </label>
      </div>
      <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Your estimate, installed</p>
        <p className="text-3xl sm:text-4xl font-extrabold text-ink mt-1 tabular-nums" data-testid="install-total">
          {low === high ? money(low) : `${money(low)} to ${money(high)}`}
        </p>
        <ul className="mt-3 space-y-1 text-sm text-stone-800">
          <li>Charger: <strong>{money(charger.priceUsd)}</strong></li>
          <li>
            Installation: <strong>{money(install)}</strong>{" "}
            {hasOutlet ? "(plug it into the outlet you have)" : `(${st ? st.name : "US"} average, labor and materials)`}
          </li>
          {keys.length > 0 && (
            <li>Extra work: <strong>{money(extraLow)} to {money(extraHigh)}</strong></li>
          )}
        </ul>
        {charger.brand && (
          <div className="mt-4">
            <PartnerLink brand={charger.brand} productId={charger.id} productUrl={charger.url} className="btn btn-primary btn-sm" disclose>
              Check the charger price
            </PartnerLink>
          </div>
        )}
        <p className="text-xs text-muted mt-3">
          State averages are Qmerit&apos;s 2026 figures as published by EnergySage and may already include some extra work. Get two or
          three quotes; ask whether the permit is included.
        </p>
      </div>
    </div>
  );
}
