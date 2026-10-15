"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CalcEv, CalcState } from "@/lib/calculator-data";

interface Props {
  states: CalcState[];
  evs: CalcEv[];
  us: { centsPerKwh: number; gasUsd: number; gasMpg: number };
  defaultEvId: number;
}

const fmt = (n: number, d = 0) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: d, maximumFractionDigits: d });

/** Reads ?state=XX so state pages can deep-link into a pre-filled calculator. */
export function ChargingCalculatorFromParams(props: Props) {
  const params = useSearchParams();
  const initial = params.get("state")?.toUpperCase() ?? "US";
  return <ChargingCalculator key={initial} {...props} initialState={initial} />;
}

export default function ChargingCalculator({
  states,
  evs,
  us,
  defaultEvId,
  initialState = "US",
}: Props & { initialState?: string }) {
  const [stateAbbr, setStateAbbr] = useState(
    states.some((s) => s.abbr === initialState) ? initialState : "US",
  );
  const [evId, setEvId] = useState(defaultEvId);
  const makes = useMemo(() => [...new Set(evs.map((e) => e.make))], [evs]);
  const [make, setMake] = useState(evs.find((e) => e.id === defaultEvId)?.make ?? makes[0]);
  const models = evs.filter((e) => e.make === make);
  const [weekly, setWeekly] = useState(230);
  const miles = (weekly * 52) / 12;
  const [customRate, setCustomRate] = useState("");
  const [mpg, setMpg] = useState(us.gasMpg);

  const st = states.find((s) => s.abbr === stateAbbr);
  const ev = evs.find((e) => e.id === evId) ?? evs[0];
  const avgCents = st ? st.centsPerKwh : us.centsPerKwh;
  const parsedCustom = parseFloat(customRate);
  const cents = Number.isFinite(parsedCustom) && parsedCustom > 0 ? parsedCustom : avgCents;
  const gasUsd = st ? st.gasUsd : us.gasUsd;

  const r = useMemo(() => {
    const kwh = (ev.kwhPer100mi * miles) / 100;
    const evMonthly = (kwh * cents) / 100;
    const gasMonthly = (miles / Math.max(1, mpg)) * gasUsd;
    return {
      kwh,
      evMonthly,
      evPer100: (ev.kwhPer100mi * cents) / 100,
      evYearly: evMonthly * 12,
      gasMonthly,
      gasYearly: gasMonthly * 12,
      saving: (gasMonthly - evMonthly) * 12,
      eGallon: (ev.kwhPer100mi / 100) * (cents / 100) * mpg,
    };
  }, [ev, miles, cents, mpg, gasUsd]);

  const field = "w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-amber-400";

  return (
    <div className="bg-surface rounded-2xl border border-black/8 shadow-sm p-5 sm:p-7">
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="block text-sm font-semibold mb-1.5">Your state</span>
          <select className={field} value={stateAbbr} onChange={(e) => setStateAbbr(e.target.value)}>
            <option value="US">US average</option>
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="block">
          <legend className="block text-sm font-semibold mb-1.5">Your EV (EPA rating)</legend>
          <div className="grid grid-cols-[2fr_3fr] gap-2">
            <select
              aria-label="Make"
              className={field}
              value={make}
              onChange={(e) => {
                setMake(e.target.value);
                const first = evs.find((v) => v.make === e.target.value);
                if (first) setEvId(first.id);
              }}
            >
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select aria-label="Model" className={field} value={evId} onChange={(e) => setEvId(Number(e.target.value))}>
              {models.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.model} ({v.rangeMiles} mi range)
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <label className="block">
          <span className="block text-sm font-semibold mb-1.5">Miles you drive a week</span>
          <input
            className={field}
            type="number"
            inputMode="numeric"
            min={0}
            step={10}
            value={weekly}
            onChange={(e) => setWeekly(Math.max(0, Number(e.target.value) || 0))}
          />
          <span className="block text-xs text-muted mt-1">230 a week is about 12,000 a year.</span>
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1.5">Your gas car&apos;s mpg</span>
          <input
            className={field}
            type="number"
            inputMode="decimal"
            min={5}
            step={0.5}
            value={mpg}
            onChange={(e) => setMpg(Math.max(5, Number(e.target.value) || us.gasMpg))}
          />
          <span className="block text-xs text-muted mt-1">{us.gasMpg} is the average new car (EPA).</span>
        </label>
      </div>

      <div className="mt-7 rounded-2xl bg-ink text-white p-5 sm:p-6" aria-live="polite">
        <p className="text-sm text-amber-300 font-semibold">{r.saving >= 0 ? "You'd save on fuel" : "Charging would cost more"}</p>
        <p className="text-4xl sm:text-5xl font-extrabold mt-1 tabular-nums">
          {fmt(Math.abs(r.saving))}<span className="text-2xl font-bold text-white/80"> a year</span>
        </p>
        <p className="text-white/85 mt-2">
          Charging at home is like paying <strong className="text-amber-300">{fmt(r.eGallon, 2)} a gallon</strong> instead of{" "}
          {fmt(gasUsd, 2)}.
        </p>
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="text-xs font-medium text-amber-900">Charging at home, per month</div>
          <div className="text-3xl font-extrabold mt-1">{fmt(r.evMonthly)}</div>
          <div className="text-xs text-stone-600 mt-1">{fmt(r.evPer100, 2)} per 100 miles</div>
        </div>
        <div className="rounded-xl bg-stone-50 border border-black/10 p-4">
          <div className="text-xs font-medium text-stone-700">Gasoline for the same miles</div>
          <div className="text-3xl font-extrabold mt-1">{fmt(r.gasMonthly)}</div>
          <div className="text-xs text-stone-600 mt-1">
            at {fmt(gasUsd, 2)}/gal ({st ? st.gasArea : "US"} average) and {mpg} mpg
          </div>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="text-xs font-medium text-green-900">{r.saving >= 0 ? "Fuel saved per year" : "Extra cost per year"}</div>
          <div className="text-3xl font-extrabold mt-1">{fmt(Math.abs(r.saving))}</div>
          <div className="text-xs text-stone-600 mt-1">
            {fmt(r.evYearly)} electricity vs {fmt(r.gasYearly)} gasoline
          </div>
        </div>
      </div>

      <details className="mt-5 text-sm">
        <summary className="cursor-pointer font-medium text-stone-700">Know your electricity rate? (optional)</summary>
        <label className="block mt-3 max-w-xs">
          <span className="block text-sm mb-1.5">Price per kWh, in cents (from your bill)</span>
          <input
            className={field}
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            placeholder={`${avgCents.toFixed(1)} (${st ? st.name : "US"} average)`}
            value={customRate}
            onChange={(e) => setCustomRate(e.target.value)}
          />
        </label>
        <p className="text-xs text-muted mt-2">
          Uses {Math.round(r.kwh)} kWh a month at {cents.toFixed(1)}¢; {ev.label} is rated {ev.kwhPer100mi} kWh per 100 miles by the EPA.
        </p>
      </details>
      <p className="mt-4 text-xs text-muted">
        {ev.label}: EPA range {ev.rangeMiles} miles. Home charging only; public fast charging typically costs
        more per kWh.
      </p>
    </div>
  );
}
