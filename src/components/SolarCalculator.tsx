"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CalcState } from "@/lib/calculator-data";

interface Props {
  states: CalcState[];
  us: { centsPerKwh: number };
}

const fmt = (n: number, d = 0) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: d, maximumFractionDigits: d });

export function SolarCalculatorFromParams(props: Props) {
  const params = useSearchParams();
  const initial = params.get("state")?.toUpperCase() ?? "CA";
  return <SolarCalculator key={initial} {...props} initialState={initial} />;
}

export default function SolarCalculator({ states, initialState = "CA" }: Props & { initialState?: string }) {
  const start = states.find((s) => s.abbr === initialState) ?? states.find((s) => s.abbr === "CA")!;
  const [abbr, setAbbr] = useState(start.abbr);
  const [mode, setMode] = useState<"kwh" | "bill">("kwh");
  const [kwh, setKwh] = useState(Math.round(start.avgMonthlyKwh));
  const [bill, setBill] = useState(150);
  const [offset, setOffset] = useState(100);
  const [panelW, setPanelW] = useState(400);
  const [pricePerW, setPricePerW] = useState("");

  const st = states.find((s) => s.abbr === abbr)!;
  const rate = st.centsPerKwh / 100;
  const monthlyKwh = mode === "kwh" ? kwh : bill / rate;
  const annualKwh = monthlyKwh * 12 * (offset / 100);
  const systemKw = annualKwh / st.kwhPerKwYear;
  const panels = Math.ceil((systemKw * 1000) / Math.max(100, panelW));
  const annualValue = annualKwh * rate;
  const price = parseFloat(pricePerW);
  const cost = Number.isFinite(price) && price > 0 ? price * systemKw * 1000 : null;
  const payback = cost && annualValue > 0 ? cost / annualValue : null;

  function changeState(next: string) {
    setAbbr(next);
    const s = states.find((x) => x.abbr === next);
    if (s) setKwh(Math.round(s.avgMonthlyKwh));
  }

  const field = "w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-amber-400";

  return (
    <div className="bg-surface rounded-2xl border border-black/8 shadow-sm p-5 sm:p-7">
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="block text-sm font-semibold mb-1.5">Your state</span>
          <select className={field} value={abbr} onChange={(e) => changeState(e.target.value)}>
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="block text-sm font-semibold mb-1.5">Your usage</legend>
          <div className="flex gap-2">
            <select
              aria-label="Usage type"
              className={`${field} w-auto`}
              value={mode}
              onChange={(e) => setMode(e.target.value as "kwh" | "bill")}
            >
              <option value="kwh">kWh / month</option>
              <option value="bill">$ bill / month</option>
            </select>
            {mode === "kwh" ? (
              <input
                aria-label="Monthly electricity use in kWh"
                className={field}
                type="number"
                inputMode="numeric"
                min={0}
                value={kwh}
                onChange={(e) => setKwh(Math.max(0, Number(e.target.value) || 0))}
              />
            ) : (
              <input
                aria-label="Monthly electricity bill in dollars"
                className={field}
                type="number"
                inputMode="numeric"
                min={0}
                value={bill}
                onChange={(e) => setBill(Math.max(0, Number(e.target.value) || 0))}
              />
            )}
          </div>
        </fieldset>
        <label className="block">
          <span className="block text-sm font-semibold mb-1.5">Share of use to cover: {offset}%</span>
          <input
            className="w-full accent-amber-500"
            type="range"
            min={25}
            max={150}
            step={5}
            value={offset}
            onChange={(e) => setOffset(Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1.5">Panel size (watts)</span>
          <input
            className={field}
            type="number"
            min={100}
            step={10}
            value={panelW}
            onChange={(e) => setPanelW(Number(e.target.value) || 400)}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-sm font-semibold mb-1.5">
            Quoted price per watt, $ <span className="font-normal text-muted">(optional, from an installer quote)</span>
          </span>
          <input
            className={`${field} sm:max-w-xs`}
            type="number"
            inputMode="decimal"
            min={0}
            step={0.05}
            placeholder="e.g. 3.00"
            value={pricePerW}
            onChange={(e) => setPricePerW(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-7 grid sm:grid-cols-3 gap-3" aria-live="polite">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="text-xs font-medium text-amber-900">System size</div>
          <div className="text-3xl font-extrabold mt-1">{systemKw.toFixed(1)} kW</div>
          <div className="text-xs text-stone-600 mt-1">
            about {panels} panels of {panelW} W
          </div>
        </div>
        <div className="rounded-xl bg-stone-50 border border-black/10 p-4">
          <div className="text-xs font-medium text-stone-700">Expected output</div>
          <div className="text-3xl font-extrabold mt-1">{Math.round(annualKwh).toLocaleString()} kWh</div>
          <div className="text-xs text-stone-600 mt-1">
            per year at {Math.round(st.kwhPerKwYear).toLocaleString()} kWh per kW in {st.name}
          </div>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="text-xs font-medium text-green-900">
            {payback ? "Simple payback (best case)" : "Value at your average rate"}
          </div>
          <div className="text-3xl font-extrabold mt-1">
            {payback ? `${payback.toFixed(1)} yrs` : `${fmt(annualValue)}/yr`}
          </div>
          <div className="text-xs text-stone-600 mt-1">
            {payback && cost
              ? `${fmt(cost)} system, ${fmt(annualValue)}/yr at ${st.centsPerKwh.toFixed(1)}¢`
              : `if every kWh offsets one bought at ${st.centsPerKwh.toFixed(1)}¢`}
          </div>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50/60 p-4 text-sm text-stone-700">
        <strong>Plug-in solar in {st.name}:</strong> a small 800 W kit that plugs into an outlet would make about{" "}
        {Math.round(st.pluginKwhPerKwYear * 0.8).toLocaleString()} kWh a year on a south-facing stand, worth up to{" "}
        {fmt(st.pluginKwhPerKwYear * 0.8 * rate)} a year if you use it all at home.{" "}
        {st.pluginLaw === "law"
          ? `${st.name} has a plug-in solar law (${st.pluginBill}).`
          : st.pluginLaw === "pending"
            ? `A plug-in solar bill (${st.pluginBill}) is pending in ${st.name}; until it passes, check with your utility.`
            : `${st.name} has no plug-in solar law yet, so check with your utility before connecting one.`}{" "}
        <Link href={`/plug-in-solar#state-${st.abbr.toLowerCase()}`} className="font-semibold text-spark-orange underline underline-offset-2">
          Plug-in solar guide
        </Link>
      </div>
      <p className="mt-4 text-xs text-muted">
        {mode === "bill" &&
          `A $${bill} bill at ${st.centsPerKwh.toFixed(1)}¢ is treated as ${Math.round(monthlyKwh)} kWh; fixed monthly fees make the real figure somewhat lower. `}
        Output assumes south-facing panels at a 20° tilt with no shading (PVWatts). Payback assumes full
        retail-rate credit for every kWh and no rebates; it ignores financing, maintenance and rate changes.
      </p>
    </div>
  );
}
