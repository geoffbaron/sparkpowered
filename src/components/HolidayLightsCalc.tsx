"use client";

import { useMemo, useState } from "react";
import LocalNote from "@/components/LocalNote";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import { NATIONAL_CHOICE } from "@/lib/visitor-state";
import { HOURS_PER_NIGHT, LIGHT_PRESETS, SEASON_DAYS, lightsCost, stringWatts } from "@/lib/holiday";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Counts = Record<string, number>;

/**
 * State + strings of lights + hours -> what the display costs for the season,
 * and what the same display would cost in LEDs.
 */
export default function HolidayLightsCalc({
  states,
  usCents,
}: {
  states: { abbr: string; name: string; cents: number }[];
  usCents: number;
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
  const [counts, setCounts] = useState<Counts>({ "led-mini": 10, "inc-mini": 0, "led-c9": 2, "inc-c9": 0 });
  const [extraWatts, setExtraWatts] = useState(0);
  const [hours, setHours] = useState(HOURS_PER_NIGHT);
  const [days, setDays] = useState(SEASON_DAYS);

  const st = states.find((s) => s.abbr === abbr);
  const cents = st?.cents ?? usCents;
  const watts = LIGHT_PRESETS.reduce((w, p) => w + (counts[p.id] ?? 0) * stringWatts(p), 0) + extraWatts;
  const allLedWatts =
    LIGHT_PRESETS.reduce((w, p) => {
      const led = p.id.startsWith("inc-") ? LIGHT_PRESETS.find((q) => q.id === p.id.replace("inc-", "led-"))! : p;
      return w + (counts[p.id] ?? 0) * stringWatts(led);
    }, 0) + extraWatts;
  const season = lightsCost(watts, cents, hours, days);
  const ledSeason = lightsCost(allLedWatts, cents, hours, days);
  const hasOld = LIGHT_PRESETS.some((p) => p.id.startsWith("inc-") && (counts[p.id] ?? 0) > 0);
  const num = (v: string) => Math.max(0, Math.min(10000, Number(v) || 0));

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="lights-calc">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-5">
        <label className="block">
          <span className="font-bold text-ink">1. Your state</span>
          <select
            id="lights-state"
            value={abbr}
            onChange={(e) => setAbbr(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 bg-white"
          >
            <option value="">US average</option>
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>{s.name}</option>
            ))}
          </select>
          <LocalNote name={st?.name ?? null} local selectId="lights-state" />
        </label>
        <fieldset>
          <legend className="font-bold text-ink mb-2">2. How many strings of each?</legend>
          <ul className="grid gap-2 text-sm">
            {LIGHT_PRESETS.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <span>
                  {p.label} <span className="text-muted">({stringWatts(p).toFixed(stringWatts(p) < 10 ? 1 : 0)} W each)</span>
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  aria-label={`Strings of ${p.label}`}
                  value={counts[p.id] ?? 0}
                  onChange={(e) => setCounts({ ...counts, [p.id]: num(e.target.value) })}
                  className="w-20 rounded-lg border border-black/20 px-2 py-1.5 text-right tabular-nums"
                />
              </li>
            ))}
            <li className="flex items-center justify-between gap-3">
              <span>
                Anything else, in watts <span className="text-muted">(inflatables, projectors: read the label)</span>
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                aria-label="Other decorations in watts"
                value={extraWatts}
                onChange={(e) => setExtraWatts(num(e.target.value))}
                className="w-20 rounded-lg border border-black/20 px-2 py-1.5 text-right tabular-nums"
              />
            </li>
          </ul>
        </fieldset>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="block">
            <span className="font-bold text-ink">3. Hours a night</span>
            <input
              type="number"
              min={1}
              max={24}
              value={hours}
              onChange={(e) => setHours(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
              className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 tabular-nums"
            />
          </label>
          <label className="block">
            <span className="font-bold text-ink">4. Nights</span>
            <input
              type="number"
              min={1}
              max={120}
              value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
              className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 tabular-nums"
            />
          </label>
        </div>
      </div>
      <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Your display, whole season</p>
        <p className="text-3xl sm:text-4xl font-extrabold text-ink mt-1 tabular-nums" data-testid="lights-total">
          {money(season.usd)}
        </p>
        <ul className="mt-3 space-y-1 text-sm text-stone-800">
          <li>Power draw: <strong>{Math.round(watts).toLocaleString("en-US")} W</strong></li>
          <li>Electricity: <strong>{Math.round(season.kwh).toLocaleString("en-US")} kWh</strong> at {cents.toFixed(1)}¢ per kWh ({st ? st.name : "US"} average)</li>
          <li>Per night: <strong>{money(season.usd / days)}</strong></li>
        </ul>
        {hasOld && (
          <p className="mt-4 rounded-xl bg-white/70 border border-amber-200 p-3 text-sm text-stone-800" data-testid="lights-led-swap">
            The same display in LEDs: <strong>{money(ledSeason.usd)}</strong>. Swapping saves about{" "}
            <strong>{money(season.usd - ledSeason.usd)}</strong> this season.
          </p>
        )}
        <p className="text-xs text-muted mt-3">
          Wattages are typical figures. The exact one is printed on the box or the tag near the plug. A timer that switches the lights off
          at bedtime is the cheapest saving there is.
        </p>
      </div>
    </div>
  );
}
