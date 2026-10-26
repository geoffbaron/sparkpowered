"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import LocalNote from "@/components/LocalNote";
import LoadList from "@/components/offgrid/LoadList";
import { pillClass } from "@/components/guide-ui";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import { NATIONAL_CHOICE } from "@/lib/visitor-state";
import {
  BATTERY_TYPES,
  DEFAULT_AUTONOMY_DAYS,
  OFFGRID_START,
  PANEL_WATTS,
  dailyWh,
  fmtKwh,
  fmtW,
  fmtWh,
  sizeOffGrid,
  type BatteryType,
  type LoadPick,
} from "@/lib/offgrid";

export interface OffGridState {
  abbr: string;
  name: string;
  slug: string;
  city: string;
  /** December kWh a day per kW of panels. */
  dec: number;
}

/**
 * Daily loads + state -> panel watts and battery size, sized on the state's
 * December solar output.
 */
export default function OffGridCalc({ states, fixedAbbr, fallbackAbbr }: { states: OffGridState[]; fixedAbbr?: string; fallbackAbbr: string }) {
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid, !fixedAbbr);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const abbr = picked ?? fixedAbbr ?? located.abbr ?? fallbackAbbr;
  const local = picked != null || fixedAbbr != null || located.abbr != null;
  const setAbbr = (a: string) => {
    setPicked(a);
    choose(a || NATIONAL_CHOICE);
  };
  const st = states.find((s) => s.abbr === abbr) ?? states[0];

  const [mode, setMode] = useState<"pick" | "enter">("pick");
  const [picks, setPicks] = useState<LoadPick[]>(OFFGRID_START);
  const [entered, setEntered] = useState(3000);
  const [days, setDays] = useState(DEFAULT_AUTONOMY_DAYS);
  const [battery, setBattery] = useState<BatteryType>("lithium");

  const whPerDay = mode === "pick" ? dailyWh(picks) : entered;
  const size = sizeOffGrid({ whPerDay, perKwDay: st.dec, days, usable: BATTERY_TYPES[battery].usable });

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-[3fr_2fr]" data-testid="offgrid-calc">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-5">
        <label className="block">
          <span className="font-bold text-ink">1. Where is the place?</span>
          <select
            id="offgrid-state"
            value={st.abbr}
            onChange={(e) => setAbbr(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 bg-white"
          >
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>{s.name}</option>
            ))}
          </select>
          <LocalNote name={st.name} local={local} selectId="offgrid-state" />
        </label>

        <fieldset>
          <legend className="font-bold text-ink mb-2">2. What you run each day</legend>
          <div className="flex flex-wrap gap-2 mb-3">
            <button type="button" aria-pressed={mode === "pick"} onClick={() => setMode("pick")} className={pillClass(mode === "pick")}>Pick appliances</button>
            <button type="button" aria-pressed={mode === "enter"} onClick={() => setMode("enter")} className={pillClass(mode === "enter")}>I know my Wh a day</button>
          </div>
          {mode === "pick" ? (
            <>
              <LoadList picks={picks} onChange={setPicks} idPrefix="og" />
              <p className="text-xs text-muted mt-2">
                Hours are example settings. Change them to how you live. Watts × hours a day = watt-hours (Wh) a day.
              </p>
            </>
          ) : (
            <label className="block">
              <span className="text-sm text-stone-700">Watt-hours a day</span>
              <input
                id="offgrid-wh"
                type="number"
                min={0}
                max={100000}
                step={100}
                value={entered}
                onChange={(e) => setEntered(Math.max(0, Math.min(100000, Number(e.target.value) || 0)))}
                className="mt-1 block w-40 rounded-lg border border-black/20 px-3 py-2 tabular-nums"
              />
              <span className="block text-xs text-muted mt-1">1 kWh = 1,000 Wh. A utility bill shows kWh a month; divide by 30 for a day.</span>
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend className="font-bold text-ink mb-2">3. Days the battery must last with little sun</legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 7].map((d) => (
              <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)} className={pillClass(days === d)}>
                {d} {d === 1 ? "day" : "days"}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-bold text-ink mb-2">4. Battery type</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(BATTERY_TYPES) as BatteryType[]).map((b) => (
              <button key={b} type="button" aria-pressed={battery === b} onClick={() => setBattery(b)} className={pillClass(battery === b)}>
                {BATTERY_TYPES[b].label} · use {Math.round(BATTERY_TYPES[b].usable * 100)}%
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Your use</p>
        <p className="text-2xl font-extrabold text-ink tabular-nums" data-testid="offgrid-wh">{fmtWh(size.whPerDay)} a day</p>

        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber mt-5">Solar panels</p>
        <p className="text-3xl sm:text-4xl font-extrabold text-ink mt-1 tabular-nums" data-testid="offgrid-panels">{fmtW(size.panelW)}</p>
        <p className="text-sm text-stone-800">
          About {size.panels} × {PANEL_WATTS} W {size.panels === 1 ? "panel" : "panels"}. In December, 1 kW of panels in {st.city} makes about{" "}
          {st.dec.toFixed(2)} kWh a day.
        </p>

        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber mt-5">Battery bank</p>
        <p className="text-3xl sm:text-4xl font-extrabold text-ink mt-1 tabular-nums" data-testid="offgrid-battery">{fmtKwh(size.batteryWh)}</p>
        <p className="text-sm text-stone-800">
          {fmtWh(size.whPerDay)} × {days} {days === 1 ? "day" : "days"} ÷ {Math.round(BATTERY_TYPES[battery].usable * 100)}% usable.
        </p>
        <p className="text-xs text-muted mt-4">
          Sized for December, the darkest month. The rest of the year you will have spare power. The US Department of Energy also advises a
          backup generator for long cloudy spells.
        </p>
        {!fixedAbbr && (
          <p className="text-sm mt-3">
            <Link href={`/off-grid-solar-calculator/${st.slug}`} className="underline text-spark-orange">Off-grid solar in {st.name}</Link>
          </p>
        )}
      </div>
    </div>
  );
}
