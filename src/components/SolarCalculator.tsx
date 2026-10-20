"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CalcState } from "@/lib/calculator-data";
import LocalNote from "@/components/LocalNote";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";

interface Props {
  states: CalcState[];
  us: { centsPerKwh: number };
  /** National average installed price per watt (EnergySage), used until the reader enters a quote. */
  avgPerWatt?: number;
}

const fmt = (n: number, d = 0) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: d, maximumFractionDigits: d });

export function SolarCalculatorFromParams(props: Props) {
  const params = useSearchParams();
  const q = params.get("state")?.toUpperCase();
  const fromUrl = !!q && props.states.some((s) => s.abbr === q);
  const initial = fromUrl ? q : "CA";
  return <SolarCalculator key={initial} {...props} initialState={initial} fromUrl={fromUrl} autoLocate={!fromUrl} />;
}

export default function SolarCalculator({
  states,
  initialState = "CA",
  avgPerWatt = 2.6,
  fromUrl = false,
  autoLocate = false,
}: Props & { initialState?: string; fromUrl?: boolean; autoLocate?: boolean }) {
  const start = states.find((s) => s.abbr === initialState) ?? states.find((s) => s.abbr === "CA")!;
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid, autoLocate);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const abbr = picked ?? located.abbr ?? start.abbr;
  const [mode, setMode] = useState<"kwh" | "bill">("bill");
  // null = the typical home in the state showing; a number once the visitor types their own.
  const [kwhIn, setKwh] = useState<number | null>(null);
  const [billIn, setBill] = useState<number | null>(null);
  const [offset, setOffset] = useState(100);
  const [panelW, setPanelW] = useState(400);
  const [pricePerW, setPricePerW] = useState("");

  const st = states.find((s) => s.abbr === abbr) ?? start;
  const kwh = kwhIn ?? Math.round(st.avgMonthlyKwh);
  const bill = billIn ?? Math.round((st.avgMonthlyKwh * st.centsPerKwh) / 100);
  const rate = st.centsPerKwh / 100;
  const monthlyKwh = mode === "kwh" ? kwh : bill / rate;
  const annualKwh = monthlyKwh * 12 * (offset / 100);
  const systemKw = annualKwh / st.kwhPerKwYear;
  const panels = Math.ceil((systemKw * 1000) / Math.max(100, panelW));
  const annualValue = annualKwh * rate;
  const price = parseFloat(pricePerW);
  const quoted = Number.isFinite(price) && price > 0;
  const cost = (quoted ? price : avgPerWatt) * systemKw * 1000;
  const payback = cost && annualValue > 0 ? cost / annualValue : null;

  function changeState(next: string) {
    setPicked(next);
    choose(next);
    setKwh(null);
    setBill(null);
  }

  const field = "w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-amber-400";

  return (
    <div className="bg-surface rounded-2xl border border-black/8 shadow-sm p-5 sm:p-7">
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="block text-sm font-semibold mb-1.5">Your state</span>
          <select id="solar-state" className={field} value={abbr} onChange={(e) => changeState(e.target.value)}>
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.name}
              </option>
            ))}
          </select>
          <LocalNote name={st.name} local={fromUrl || picked !== null || located.abbr !== null} selectId="solar-state" />
        </label>
        <fieldset>
          <legend className="block text-sm font-semibold mb-1.5">Your monthly electric bill</legend>
          <div className="flex gap-2">
            <select
              aria-label="Usage type"
              className={`${field} w-auto`}
              value={mode}
              onChange={(e) => setMode(e.target.value as "kwh" | "bill")}
            >
              <option value="bill">$ bill / month</option>
              <option value="kwh">kWh / month</option>
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
          <span className="block text-sm font-semibold mb-1.5">How much of your bill to cover: {offset}%</span>
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
          <span className="block text-sm font-semibold mb-1.5">
            Got an installer quote? <span className="font-normal text-muted">(optional, $ per watt)</span>
          </span>
          <input
            className={field}
            type="number"
            inputMode="decimal"
            min={0}
            step={0.05}
            placeholder={`${avgPerWatt.toFixed(2)} (US average)`}
            value={pricePerW}
            onChange={(e) => setPricePerW(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-7 rounded-2xl bg-ink text-white p-5 sm:p-6" aria-live="polite">
        <p className="text-sm text-amber-300 font-semibold">Solar in {st.name}</p>
        <p className="text-4xl sm:text-5xl font-extrabold mt-1 tabular-nums">
          Up to {fmt(annualValue / 12)}<span className="text-2xl font-bold text-white/80"> a month</span>
        </p>
        <p className="text-white/85 mt-2">
          off your bill ({fmt(annualValue)} a year).{" "}
          {payback ? (
            <>
              Pays for itself in about <strong className="text-amber-300">{Math.round(payback)} years</strong>, then it&apos;s
              savings for the rest of its 25+ year life.
            </>
          ) : null}
        </p>
        <p className="text-sm text-white/75 mt-3">
          About {panels} panels ({systemKw.toFixed(1)} kW) for about {fmt(cost)} before incentives
          {quoted ? " at your quoted price" : ` at the US average of $${avgPerWatt.toFixed(2)} a watt`}.
        </p>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-medium text-stone-700">Panel size and output details</summary>
        <label className="block mt-3 max-w-xs">
          <span className="block text-sm mb-1.5">Panel size (watts)</span>
          <input
            className={field}
            type="number"
            min={100}
            step={10}
            value={panelW}
            onChange={(e) => setPanelW(Number(e.target.value) || 400)}
          />
        </label>
        <p className="mt-2 text-stone-600">
          Makes about {Math.round(annualKwh).toLocaleString()} kWh a year, at {Math.round(st.kwhPerKwYear).toLocaleString()} kWh per kW of panels in {st.name} (PVWatts).
        </p>
      </details>
      <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50/60 p-4 text-sm text-stone-700">
        <strong>Renting, or not ready for a full system?</strong> A small plug-in solar kit that plugs into an outlet could take up
        to {fmt(st.pluginKwhPerKwYear * 0.8 * rate)} a year off your bill in {st.name}, if you use what it makes.{" "}
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
        Output assumes south-facing panels at a 20° tilt with no shading (PVWatts). Savings and payback assume your
        utility credits all the power the panels make at the full retail price, with no rebates; they ignore financing,
        maintenance and rate changes. Where exports earn less, savings are lower.
      </p>
    </div>
  );
}
