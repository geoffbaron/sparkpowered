"use client";

import { useState } from "react";
import { pillClass } from "@/components/guide-ui";
import { FUELS, generatorPlan, loadPercent, type Fuel } from "@/lib/offgrid";

const n1 = (n: number) => (n >= 100 ? Math.round(n).toLocaleString("en-US") : (Math.round(n * 10) / 10).toLocaleString("en-US"));

function Num({ id, label, value, onChange, step = 1, max = 100000, hint }: { id: string; label: string; value: number; onChange: (n: number) => void; step?: number; max?: number; hint?: string }) {
  return (
    <label className="block">
      <span className="font-bold text-ink text-sm">{label}</span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
        className="mt-1 block w-36 rounded-lg border border-black/20 px-3 py-2 tabular-nums"
      />
      {hint && <span className="block text-xs text-muted mt-1">{hint}</span>}
    </label>
  );
}

/**
 * Generator spec-sheet runtime + tank size + how long you run it -> fuel to
 * store. The visitor enters the maker's figures; we never assume a fuel rate.
 */
export default function GeneratorCalc() {
  const [fuel, setFuel] = useState<Fuel>("gasoline");
  const [ratedW, setRatedW] = useState(0);
  const [loadW, setLoadW] = useState(0);
  const [tank, setTank] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [hoursPerDay, setHoursPerDay] = useState(12);
  const [days, setDays] = useState(3);

  const f = FUELS[fuel];
  const pct = loadPercent(loadW, ratedW);
  const plan = generatorPlan({ tankSize: tank, runtimeHours: runtime, hoursPerDay, days });
  const ready = tank > 0 && runtime > 0;
  const row = pct <= 0 ? null : pct <= 30 ? "25%" : pct <= 60 ? "50%" : pct <= 85 ? "75%" : "100% (rated)";

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="generator-calc">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-4">
        <fieldset>
          <legend className="font-bold text-ink mb-2">1. Fuel</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FUELS) as Fuel[]).map((k) => (
              <button key={k} type="button" aria-pressed={fuel === k} onClick={() => setFuel(k)} className={pillClass(fuel === k)}>
                {FUELS[k].label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid sm:grid-cols-2 gap-4">
          <Num id="gen-rated" label="2. Generator running watts" value={ratedW} onChange={setRatedW} step={100} hint="The rated (not starting) watts on the spec sheet." />
          <Num id="gen-load" label="3. Watts you will run" value={loadW} onChange={setLoadW} step={50} hint="Add up the running watts of what you plug in." />
        </div>
        <p className="text-sm text-stone-800 min-h-[1.25rem]" data-testid="gen-load-pct">
          {row ? (
            <>
              That is about <strong>{Math.round(pct)}%</strong> of the generator&apos;s rating. Use the spec sheet&apos;s runtime at{" "}
              <strong>{row}</strong> load{pct > 100 ? " (it is over its rating: run less at once)" : ""}.
            </>
          ) : (
            "Enter both to see which runtime figure on the spec sheet to use."
          )}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Num id="gen-tank" label={`4. Tank size (${f.unit})`} value={tank} onChange={setTank} step={0.1} max={1000} hint={fuel === "propane" ? "If the spec sheet gives runtime on a 20 lb cylinder, enter 20." : "Fuel tank capacity on the spec sheet."} />
          <Num id="gen-runtime" label="5. Runtime on that tank (hours)" value={runtime} onChange={setRuntime} step={0.5} max={200} hint="From the spec sheet, at the load in step 3." />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Num id="gen-hours" label="6. Hours a day you run it" value={hoursPerDay} onChange={(n) => setHoursPerDay(Math.min(24, n))} max={24} />
          <Num id="gen-days" label="7. Days to plan for" value={days} onChange={(n) => setDays(Math.min(30, n))} max={30} />
        </div>
      </div>
      <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
        {ready ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Fuel to store</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-ink mt-1 tabular-nums" data-testid="gen-fuel">
              {n1(plan.fuel)} {f.unit}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-stone-800">
              <li>Burns about <strong>{n1(plan.perHour)} {f.unitShort}</strong> an hour at your load</li>
              <li>About <strong>{n1(plan.perDay)} {f.unitShort}</strong> a day at {hoursPerDay} hours</li>
              <li>One tank lasts <strong>{n1(runtime)} hours</strong>; you need <strong>{plan.tanks}</strong> {plan.tanks === 1 ? "tankful" : "tankfuls"} for {n1(plan.hours)} hours of running</li>
            </ul>
            <p className="text-xs text-muted mt-4">
              Fuel use is the maker&apos;s figure, divided out: tank ÷ runtime = fuel an hour. Real use varies with load and conditions, so keep a
              margin.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Fuel to store</p>
            <p className="text-stone-800 mt-2" data-testid="gen-fuel">
              Enter the tank size and the runtime from your generator&apos;s spec sheet. Makers list runtime per tank at a stated load, such as 25% or
              50%. We do not guess a fuel rate, because it varies a lot from one generator to the next.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
