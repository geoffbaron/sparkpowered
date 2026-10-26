"use client";

import { useMemo, useState } from "react";
import LocalNote from "@/components/LocalNote";
import LoadList from "@/components/offgrid/LoadList";
import KitPicker from "@/components/offgrid/KitPicker";
import StationList from "@/components/offgrid/StationList";
import { pillClass } from "@/components/guide-ui";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import { NATIONAL_CHOICE } from "@/lib/visitor-state";
import type { OffGridState } from "@/components/offgrid/OffGridCalc";
import {
  OUTAGE_START,
  RECHARGE_PANELS_W,
  USABLE_FRACTION,
  dailyWh,
  fmtKwh,
  fmtW,
  fmtWh,
  matchStations,
  outageBatteryWh,
  peakWatts,
  solarWhPerDay,
  type LoadPick,
  type StationOption,
} from "@/lib/offgrid";

/** Outage essentials -> kWh a day, power station size for N days, and winter solar top-up by state. */
export default function OutageCalc({ states, stations, fallbackAbbr }: { states: OffGridState[]; stations: StationOption[]; fallbackAbbr: string }) {
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid, true);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const abbr = picked ?? located.abbr ?? fallbackAbbr;
  const local = picked != null || located.abbr != null;
  const st = states.find((s) => s.abbr === abbr) ?? states[0];

  const [picks, setPicks] = useState<LoadPick[]>(OUTAGE_START);
  const [days, setDays] = useState(2);
  const [panelW, setPanelW] = useState(RECHARGE_PANELS_W[1]);

  const whPerDay = dailyWh(picks);
  const needWh = outageBatteryWh(whPerDay, days);
  const peak = peakWatts(picks);
  // Match on stored energy and steady output. Motor start figures are generator-sizing
  // worst cases, so they are shown as a check, not used to rule stations out.
  const matches = matchStations(stations, needWh, { runningW: peak.running });
  const solar = solarWhPerDay(panelW, st.dec);
  const share = whPerDay > 0 ? Math.min(100, Math.round((solar / whPerDay) * 100)) : 0;
  const fullPanels = st.dec > 0 ? whPerDay / st.dec : 0;

  return (
    <>
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-[3fr_2fr]" data-testid="outage-calc">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-5">
        <fieldset>
          <legend className="font-bold text-ink mb-2">1. What must keep running</legend>
          <LoadList picks={picks} onChange={setPicks} idPrefix="out" />
          <p className="text-xs text-muted mt-2">Hours are example settings. A furnace blower runs more on cold days; a well pump runs while you use water.</p>
        </fieldset>
        <fieldset>
          <legend className="font-bold text-ink mb-2">2. How long is the outage?</legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 5, 7].map((d) => (
              <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)} className={pillClass(days === d)}>
                {d} {d === 1 ? "day" : "days"}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="font-bold text-ink">3. Your state, for winter solar recharging</span>
          <select
            id="outage-state"
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
          <LocalNote name={st.name} local={local} selectId="outage-state" />
        </label>
        <fieldset>
          <legend className="font-bold text-ink mb-2">4. Solar panels to recharge with</legend>
          <div className="flex flex-wrap gap-2">
            {RECHARGE_PANELS_W.map((w) => (
              <button key={w} type="button" aria-pressed={panelW === w} onClick={() => setPanelW(w)} className={pillClass(panelW === w)}>
                {w} W
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">You use</p>
        <p className="text-2xl font-extrabold text-ink tabular-nums" data-testid="outage-wh">{fmtWh(whPerDay)} a day</p>
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber mt-4">Battery for {days} {days === 1 ? "day" : "days"}, no recharging</p>
        <p className="text-3xl sm:text-4xl font-extrabold text-ink tabular-nums" data-testid="outage-battery">{fmtKwh(needWh)}</p>
        <p className="text-sm text-stone-800">
          {fmtWh(whPerDay)} × {days} ÷ {Math.round(USABLE_FRACTION * 100)}% usable. It must also put out at least{" "}
          <strong>{fmtW(peak.running)}</strong> at once
          {peak.start > 0 ? <>, and up to <strong>{fmtW(peak.peak)}</strong> for a moment when a motor starts (a generator-sizing worst case; check the station&apos;s surge rating)</> : null}.
        </p>

        <p className="text-sm font-bold text-ink mt-5">Cheapest power stations that cover it</p>
        <StationList
          matches={matches}
          empty={<>None of the power stations we track covers this on one charge. Cut the list, plan to recharge, or look at a home battery or a generator.</>}
        />

        <p className="text-sm font-bold text-ink mt-5">Recharging from {panelW} W of solar in December</p>
        <p className="text-sm text-stone-800" data-testid="outage-solar">
          About {fmtWh(solar)} a day in {st.name}: {share}% of what you use. Covering all of it takes about {fmtW(fullPanels)} of panels.
        </p>
      </div>
    </div>
    <KitPicker
      idPrefix="outage"
      heading={`Kits you can buy for a ${days}-day outage`}
      need={{ batteryWh: needWh, panelW: 0, runningW: peak.running, whPerDay }}
    />
    </>
  );
}
