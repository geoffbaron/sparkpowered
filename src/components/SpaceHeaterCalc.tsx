"use client";

import { useMemo, useState } from "react";
import LocalNote from "@/components/LocalNote";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import { NATIONAL_CHOICE } from "@/lib/visitor-state";
import { HEATER_HOURS_PER_DAY, HEATER_WATTS, heatCostPerHour } from "@/lib/holiday";
import { pillClass } from "@/components/guide-ui";

const money = (n: number, d = 2) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: d, maximumFractionDigits: d });

/**
 * State + heater setting + hours -> what a space heater costs a day and a
 * month, next to the same heat from a gas furnace and a heat pump.
 */
export default function SpaceHeaterCalc({
  states,
  us,
}: {
  states: { abbr: string; name: string; cents: number; gasPerMcf: number }[];
  us: { cents: number; gasPerMcf: number };
}) {
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid, true);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const abbr = picked ?? located.abbr ?? "";
  const setAbbr = (a: string) => {
    setPicked(a);
    choose(a || NATIONAL_CHOICE);
  };
  const [watts, setWatts] = useState(HEATER_WATTS);
  const [hours, setHours] = useState(HEATER_HOURS_PER_DAY);

  const st = states.find((s) => s.abbr === abbr);
  const cents = st?.cents ?? us.cents;
  const gas = st?.gasPerMcf ?? us.gasPerMcf;
  const h = heatCostPerHour(cents, gas, watts);
  const month = (perHour: number) => perHour * hours * 30;

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="heater-calc">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-5">
        <label className="block">
          <span className="font-bold text-ink">1. Your state</span>
          <select
            id="heater-state"
            value={abbr}
            onChange={(e) => setAbbr(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 bg-white"
          >
            <option value="">US average</option>
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>{s.name}</option>
            ))}
          </select>
          <LocalNote name={st?.name ?? null} local selectId="heater-state" />
        </label>
        <fieldset>
          <legend className="font-bold text-ink mb-2">2. Heater setting</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { w: 1500, label: "High (1,500 W)" },
              { w: 750, label: "Low (750 W)" },
            ].map((o) => (
              <button key={o.w} type="button" aria-pressed={watts === o.w} onClick={() => setWatts(o.w)} className={pillClass(watts === o.w)}>
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="font-bold text-ink">3. Hours a day it actually runs</span>
          <input
            type="number"
            min={1}
            max={24}
            value={hours}
            onChange={(e) => setHours(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
            className="mt-2 block w-32 rounded-lg border border-black/20 px-3 py-2 tabular-nums"
          />
          <span className="block text-xs text-muted mt-1">
            A heater with a thermostat switches itself off once the room is warm, so it runs fewer hours than it is switched on.
          </span>
        </label>
      </div>
      <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Space heater, per month</p>
        <p className="text-3xl sm:text-4xl font-extrabold text-ink mt-1 tabular-nums" data-testid="heater-month">
          {money(month(h.heater), 0)}
        </p>
        <ul className="mt-3 space-y-1 text-sm text-stone-800">
          <li>Per hour: <strong>{money(h.heater)}</strong> at {cents.toFixed(1)}¢ per kWh ({st ? st.name : "US"} average)</li>
          <li>Per day: <strong>{money(h.heater * hours)}</strong></li>
        </ul>
        <p className="mt-4 text-sm font-bold text-ink">The same heat for a month from</p>
        <ul className="mt-1 space-y-1 text-sm text-stone-800" data-testid="heater-compare">
          <li>A gas furnace: <strong>{money(month(h.furnace), 0)}</strong></li>
          <li>A heat pump: <strong>{money(month(h.heatPump), 0)}</strong></li>
        </ul>
        <p className="text-xs text-muted mt-3">
          A space heater only saves money when it lets you turn the whole-house thermostat down and heat just the room you are in.
        </p>
      </div>
    </div>
  );
}
