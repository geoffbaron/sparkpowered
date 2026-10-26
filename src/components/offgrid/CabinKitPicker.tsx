"use client";

import { useMemo, useState } from "react";
import LocalNote from "@/components/LocalNote";
import StationList from "@/components/offgrid/StationList";
import { pillClass } from "@/components/guide-ui";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import { NATIONAL_CHOICE } from "@/lib/visitor-state";
import type { OffGridState } from "@/components/offgrid/OffGridCalc";
import {
  CABIN_TIERS,
  DEFAULT_AUTONOMY_DAYS,
  PANEL_WATTS,
  USABLE_FRACTION,
  dailyWh,
  fmtKwh,
  fmtW,
  fmtWh,
  matchStations,
  sizeOffGrid,
  type CabinTier,
  type StationOption,
} from "@/lib/offgrid";

/** State + cabin tier -> panel watts, battery size and the power stations that can carry it. */
export default function CabinKitPicker({ states, stations, fallbackAbbr }: { states: OffGridState[]; stations: StationOption[]; fallbackAbbr: string }) {
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid, true);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const abbr = picked ?? located.abbr ?? fallbackAbbr;
  const local = picked != null || located.abbr != null;
  const st = states.find((s) => s.abbr === abbr) ?? states[0];
  const [tierId, setTierId] = useState<CabinTier["id"]>("parttime");
  const tier = CABIN_TIERS.find((t) => t.id === tierId)!;

  const size = sizeOffGrid({ whPerDay: dailyWh(tier.picks), perKwDay: st.dec, days: DEFAULT_AUTONOMY_DAYS });
  const matches = matchStations(stations, size.batteryWh, { panelW: size.panelW });

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="cabin-picker">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-5">
        <label className="block">
          <span className="font-bold text-ink">1. Where is the cabin?</span>
          <select
            id="cabin-state"
            value={st.abbr}
            onChange={(e) => {
              setPicked(e.target.value);
              choose(e.target.value || NATIONAL_CHOICE);
            }}
            className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 bg-white"
          >
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>{s.name}</option>
            ))}
          </select>
          <LocalNote name={st.name} local={local} selectId="cabin-state" />
        </label>
        <fieldset>
          <legend className="font-bold text-ink mb-2">2. How you use it</legend>
          <div className="flex flex-wrap gap-2">
            {CABIN_TIERS.map((t) => (
              <button key={t.id} type="button" aria-pressed={tierId === t.id} onClick={() => setTierId(t.id)} className={pillClass(tierId === t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-stone-700 mt-2">{tier.blurb}: about {fmtWh(size.whPerDay)} a day.</p>
        </fieldset>
        <p className="text-xs text-muted">
          Sized for December sun in {st.city} ({st.dec.toFixed(2)} kWh a day per kW of panels) and {DEFAULT_AUTONOMY_DAYS} days of battery with
          little sun, using lithium at {Math.round(USABLE_FRACTION * 100)}% usable.
        </p>
      </div>
      <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Panels</p>
            <p className="text-3xl font-extrabold text-ink tabular-nums" data-testid="cabin-panels">{fmtW(size.panelW)}</p>
            <p className="text-xs text-stone-700">{size.panels} × {PANEL_WATTS} W</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Battery</p>
            <p className="text-3xl font-extrabold text-ink tabular-nums" data-testid="cabin-battery">{fmtKwh(size.batteryWh)}</p>
            <p className="text-xs text-stone-700">{DEFAULT_AUTONOMY_DAYS} days of use</p>
          </div>
        </div>
        <p className="text-sm font-bold text-ink mt-5">All-in-one stations that can carry it</p>
        <StationList
          matches={matches}
          empty={
            <>
              No portable power station we track takes {fmtW(size.panelW)} of solar and holds {fmtKwh(size.batteryWh)}. This is a job for a
              component system: separate panels, charge controller, inverter and battery bank. See the off-grid kit makers below.
            </>
          }
        />
        <p className="text-xs text-muted mt-3">Prices are for the station and add-on batteries only. Panels are extra.</p>
      </div>
    </div>
  );
}
