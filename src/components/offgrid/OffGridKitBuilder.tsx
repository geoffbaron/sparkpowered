"use client";

import { useEffect, useMemo, useState } from "react";
import LocalNote from "@/components/LocalNote";
import KitNotes from "@/components/offgrid/KitNotes";
import KitPackageList from "@/components/offgrid/KitPackageList";
import { pillClass } from "@/components/guide-ui";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import { NATIONAL_CHOICE } from "@/lib/visitor-state";
import type { OffGridState } from "@/components/offgrid/OffGridCalc";
import {
  DARK_DAY_CHOICES,
  DEFAULT_DARK_DAYS,
  EXAMPLE_GENERATOR,
  HOME_PRESETS,
  KIT_DAYS,
  KIT_LOADS,
  buildKit,
  homePreset,
  type HomeSize,
  type KitLoad,
} from "@/lib/offgrid-kit";
import { fmtWh } from "@/lib/offgrid";

function Num({ id, label, value, onChange, step, max }: { id: string; label: string; value: number; onChange: (n: number) => void; step: number; max: number }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-ink">{label}</span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
        className="mt-1 block w-28 rounded-lg border border-black/20 px-3 py-2 tabular-nums bg-white"
      />
    </label>
  );
}

const isHome = (v: string | null): v is HomeSize => v === "small" || v === "medium" || v === "large";

/** Home size + state + loads -> one complete 90-day package. */
export default function OffGridKitBuilder({ states, fallbackAbbr }: { states: OffGridState[]; fallbackAbbr: string }) {
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid, true);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const abbr = picked ?? located.abbr ?? fallbackAbbr;
  const local = picked != null || located.abbr != null;
  const st = states.find((s) => s.abbr === abbr) ?? states[0];

  const [home, setHome] = useState<HomeSize>("medium");
  const [loads, setLoads] = useState<KitLoad[]>(homePreset("medium").loads);
  const [well240, setWell240] = useState(homePreset("medium").well240);
  const [darkDays, setDarkDays] = useState<number>(DEFAULT_DARK_DAYS);
  const [gen, setGen] = useState({ ratedW: EXAMPLE_GENERATOR.ratedW, tankGal: EXAMPLE_GENERATOR.tankGal, runtimeHours: EXAMPLE_GENERATOR.runtimeHours });

  const pickHome = (id: HomeSize) => {
    const h = homePreset(id);
    setHome(id);
    setLoads(h.loads);
    setWell240(h.well240);
  };

  // Preset cards link here with ?home=small|medium|large.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("home");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isHome(v)) pickHome(v);
  }, []);

  const toggle = (id: KitLoad) => setLoads((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
  const k = buildKit({ home, loads, perKwDay: st.dec, well240, darkDays, generator: gen });
  const h = homePreset(home);

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-5" data-testid="kit-builder">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-5 lg:col-span-2">
        <fieldset>
          <legend className="font-bold text-ink mb-2">1. Your home</legend>
          <div className="flex flex-wrap gap-2">
            {HOME_PRESETS.map((p) => (
              <button key={p.id} type="button" aria-pressed={home === p.id} onClick={() => pickHome(p.id)} className={pillClass(home === p.id)}>
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-stone-700 mt-2">{h.blurb}. Food and water are for {h.people.length} people.</p>
        </fieldset>
        <label className="block">
          <span className="font-bold text-ink">2. Your state</span>
          <select
            id="kit-state"
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
          <LocalNote name={st.name} local={local} selectId="kit-state" />
        </label>
        <fieldset>
          <legend className="font-bold text-ink mb-2">3. What has to keep running</legend>
          <div className="space-y-2">
            {KIT_LOADS.map((l) => (
              <label key={l.id} className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={loads.includes(l.id)} onChange={() => toggle(l.id)} className="mt-1 h-4 w-4 accent-orange-600" />
                <span>
                  <span className="font-semibold text-ink">{l.label}</span>
                  <span className="block text-xs text-muted">{l.hint}</span>
                </span>
              </label>
            ))}
          </div>
          {loads.includes("well") && (
            <label className="flex items-start gap-2 text-sm cursor-pointer mt-3 rounded-lg bg-amber-50 p-2">
              <input type="checkbox" checked={well240} onChange={(e) => setWell240(e.target.checked)} className="mt-1 h-4 w-4 accent-orange-600" />
              <span>
                <span className="font-semibold text-ink">My well pump is 240 V (or I am not sure)</span>
                <span className="block text-xs text-muted">The pump&apos;s label or breaker tells you. A double breaker means 240 V.</span>
              </span>
            </label>
          )}
        </fieldset>
        <fieldset>
          <legend className="font-bold text-ink mb-2">4. Storm days with no useful sun</legend>
          <div className="flex flex-wrap gap-2">
            {DARK_DAY_CHOICES.map((d) => (
              <button key={d} type="button" aria-pressed={darkDays === d} onClick={() => setDarkDays(d)} className={pillClass(darkDays === d)}>
                {d} days
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">Our example is {DEFAULT_DARK_DAYS}. The generator carries the whole house on these days.</p>
        </fieldset>
        <details className="text-sm">
          <summary className="font-bold text-ink cursor-pointer">5. Your generator (optional)</summary>
          <p className="text-xs text-muted mt-2">
            We start with Honda&apos;s published {EXAMPLE_GENERATOR.name} figures. Put in your own from its spec sheet: the runtime at rated load.
          </p>
          <div className="flex flex-wrap gap-4 mt-3">
            <Num id="kit-gen-w" label="Rated watts" value={gen.ratedW} step={100} max={20000} onChange={(n) => setGen({ ...gen, ratedW: n })} />
            <Num id="kit-gen-tank" label="Tank (gal)" value={gen.tankGal} step={0.1} max={100} onChange={(n) => setGen({ ...gen, tankGal: n })} />
            <Num id="kit-gen-hrs" label="Hours a tank" value={gen.runtimeHours} step={0.1} max={200} onChange={(n) => setGen({ ...gen, runtimeHours: n })} />
          </div>
        </details>
        <p className="text-xs text-muted">
          About {fmtWh(k.whPerDay)} a day. Sized as if all {KIT_DAYS} days were December in {st.city} ({st.dec.toFixed(2)} kWh a day per kW of
          panels), the worst case.
        </p>
      </div>
      <div className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 lg:col-span-3" aria-live="polite">
        <h3 className="text-lg font-extrabold text-ink mb-3">
          Your {KIT_DAYS}-day package: {h.label.toLowerCase()} in {st.name}
        </h3>
        <KitPackageList k={k} stateName={st.name} />
        <KitNotes k={k} stateName={st.name} />
      </div>
    </div>
  );
}
