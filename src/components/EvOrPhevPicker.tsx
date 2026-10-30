"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import LocalNote from "@/components/LocalNote";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import {
  DC_FAST,
  decide,
  evYear,
  gasCarYear,
  phevYear,
  winterRetention,
  type Charging,
  type PickerEv,
  type PickerPhev,
  type PickerState,
} from "@/lib/ev-or-phev";

interface Props {
  states: PickerState[];
  us: PickerState;
  evs: PickerEv[];
  phevs: PickerPhev[];
  defaultEvId: number;
  defaultPhevId: number;
  gasCarMpg: number;
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const pct = (n: number) => `${Math.round(n * 100)}%`;

const CHARGING: { id: Charging; label: string; hint: string }[] = [
  { id: "home", label: "At home, every night", hint: "Driveway or garage outlet" },
  { id: "work", label: "At work only", hint: "Workdays, not weekends" },
  { id: "rarely", label: "Rarely or never", hint: "Street parking, no charger" },
];

/** Reads ?state=XX so state pages can deep-link into a pre-filled picker. */
export function EvOrPhevPickerFromParams(props: Props) {
  const params = useSearchParams();
  const q = params.get("state")?.toUpperCase();
  const fromUrl = !!q && props.states.some((s) => s.abbr === q);
  const initial = fromUrl ? q : "US";
  return <EvOrPhevPicker key={initial} {...props} initialState={initial} autoLocate={!fromUrl} />;
}

function CarSelect<T extends { id: number; make: string; model: string }>({
  legend,
  cars,
  value,
  onChange,
  detail,
  field,
}: {
  legend: string;
  cars: T[];
  value: number;
  onChange: (id: number) => void;
  detail: (c: T) => string;
  field: string;
}) {
  const makes = useMemo(() => [...new Set(cars.map((c) => c.make))], [cars]);
  const current = cars.find((c) => c.id === value) ?? cars[0];
  return (
    <fieldset className="block">
      <legend className="block text-sm font-semibold mb-1.5">{legend}</legend>
      <div className="grid grid-cols-[2fr_3fr] gap-2">
        <select
          aria-label={`${legend}: make`}
          className={field}
          value={current.make}
          onChange={(e) => {
            const first = cars.find((c) => c.make === e.target.value);
            if (first) onChange(first.id);
          }}
        >
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select aria-label={`${legend}: model`} className={field} value={current.id} onChange={(e) => onChange(Number(e.target.value))}>
          {cars
            .filter((c) => c.make === current.make)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.model} ({detail(c)})
              </option>
            ))}
        </select>
      </div>
    </fieldset>
  );
}

export default function EvOrPhevPicker({
  states,
  us,
  evs,
  phevs,
  defaultEvId,
  defaultPhevId,
  gasCarMpg,
  initialState = "US",
  autoLocate = false,
}: Props & { initialState?: string; autoLocate?: boolean }) {
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid, autoLocate);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const stateAbbr = picked ?? located.abbr ?? (valid.includes(initialState) ? initialState : "US");
  const setStateAbbr = (a: string) => {
    setPicked(a);
    choose(a);
  };
  const [daily, setDaily] = useState(30);
  const [charging, setCharging] = useState<Charging>("home");
  const [trips, setTrips] = useState(4);
  const [tripMiles, setTripMiles] = useState(200);
  const [tows, setTows] = useState(false);
  const [evId, setEvId] = useState(defaultEvId);
  const [phevId, setPhevId] = useState(defaultPhevId);

  const st = states.find((s) => s.abbr === stateAbbr) ?? null;
  const place = st ?? us;
  const ev = evs.find((e) => e.id === evId) ?? evs[0];
  const phev = phevs.find((p) => p.id === phevId) ?? phevs[0];

  const r = useMemo(() => {
    const a = { dailyMiles: daily, charging, tripsPerYear: trips, tripMiles, tows };
    const p = { centsPerKwh: place.centsPerKwh, gasUsd: place.gasUsd, gasCarMpg, winterTempF: place.winterTempF };
    return { verdict: decide(ev, phev, a, p), ev: evYear(ev, a, p), phev: phevYear(phev, a, p), gas: gasCarYear(a, p) };
  }, [daily, charging, trips, tripMiles, tows, place, gasCarMpg, ev, phev]);
  const ret = winterRetention(place.winterTempF);

  const field = "w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-amber-400";
  const numberInput = (value: number, set: (n: number) => void, max: number, step = 1) => (
    <input
      className={field}
      type="number"
      inputMode="numeric"
      min={0}
      max={max}
      step={step}
      value={value}
      onChange={(e) => set(Math.min(max, Math.max(0, Number(e.target.value) || 0)))}
    />
  );

  return (
    <div className="bg-surface rounded-2xl border border-black/8 shadow-sm p-5 sm:p-7">
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="block text-sm font-semibold mb-1.5">Your state</span>
          <select id="phev-state" className={field} value={stateAbbr} onChange={(e) => setStateAbbr(e.target.value)}>
            <option value="US">US average</option>
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.name}
              </option>
            ))}
          </select>
          <LocalNote name={st?.name ?? null} local selectId="phev-state" />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1.5">Miles you drive on a usual day</span>
          {numberInput(daily, setDaily, 500, 5)}
          <span className="block text-xs text-muted mt-1">30 a day is about 11,000 a year.</span>
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="block text-sm font-semibold mb-1.5">Where could you plug in?</legend>
        <div className="grid sm:grid-cols-3 gap-2">
          {CHARGING.map((c) => (
            <label
              key={c.id}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 cursor-pointer ${charging === c.id ? "border-amber-400 bg-amber-50" : "border-black/15 bg-white"}`}
            >
              <input type="radio" name="phev-charging" className="mt-1 accent-amber-500" checked={charging === c.id} onChange={() => setCharging(c.id)} />
              <span>
                <span className="block text-sm font-medium">{c.label}</span>
                <span className="block text-xs text-muted">{c.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-5">
        <label className="block">
          <span className="block text-sm font-semibold mb-1.5">Road trips a year</span>
          {numberInput(trips, setTrips, 100)}
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1.5">Trip length, one way</span>
          {numberInput(tripMiles, setTripMiles, 3000, 25)}
          <span className="block text-xs text-muted mt-1">Miles</span>
        </label>
        <fieldset className="col-span-2 sm:col-span-1">
          <legend className="block text-sm font-semibold mb-1.5">Tow a trailer or camper?</legend>
          <div className="grid grid-cols-2 gap-2">
            {[false, true].map((v) => (
              <label
                key={String(v)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer text-sm font-medium ${tows === v ? "border-amber-400 bg-amber-50" : "border-black/15 bg-white"}`}
              >
                <input type="radio" name="phev-tow" className="accent-amber-500" checked={tows === v} onChange={() => setTows(v)} />
                {v ? "Yes" : "No"}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <details className="mt-5 text-sm">
        <summary className="cursor-pointer font-medium text-stone-700">Compare specific cars (optional)</summary>
        <div className="mt-3 grid sm:grid-cols-2 gap-5">
          <CarSelect legend="Plug-in hybrid" cars={phevs} value={phev.id} onChange={setPhevId} field={field} detail={(c) => `${c.electricRangeMiles} mi electric`} />
          <CarSelect legend="Electric car" cars={evs} value={ev.id} onChange={setEvId} field={field} detail={(c) => `${c.rangeMiles} mi range`} />
        </div>
      </details>

      <div className="mt-7 rounded-2xl bg-ink text-white p-5 sm:p-6" aria-live="polite">
        <p className="text-sm text-amber-300 font-semibold">Our pick for how you drive</p>
        <p className="text-3xl sm:text-4xl font-extrabold mt-1" data-verdict={r.verdict.kind}>
          {r.verdict.headline}
        </p>
        <ul className="mt-3 space-y-2 text-white/85 list-disc pl-5">
          {r.verdict.reasons.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="text-xs font-medium text-green-900">Electric car, fuel per year</div>
          <div className="text-3xl font-extrabold mt-1 tabular-nums">{fmt(r.ev.totalUsd)}</div>
          <div className="text-xs text-stone-600 mt-1">
            {ev.label}, {ev.kwhPer100mi} kWh/100 mi. {pct(r.ev.fastChargeShare)} of miles on fast chargers.
          </div>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="text-xs font-medium text-amber-900">Plug-in hybrid, fuel per year</div>
          <div className="text-3xl font-extrabold mt-1 tabular-nums">{fmt(r.phev.totalUsd)}</div>
          <div className="text-xs text-stone-600 mt-1">
            {phev.label}: <strong>{pct(r.phev.electricShare)} of miles on electricity</strong> ({fmt(r.phev.electricUsd)} power + {fmt(r.phev.gasUsd)} gas at {phev.gasMpg} mpg).
          </div>
        </div>
        <div className="rounded-xl bg-stone-50 border border-black/10 p-4">
          <div className="text-xs font-medium text-stone-700">Average gas car, fuel per year</div>
          <div className="text-3xl font-extrabold mt-1 tabular-nums">{fmt(r.gas.totalUsd)}</div>
          <div className="text-xs text-stone-600 mt-1">
            {Math.round(r.gas.miles).toLocaleString("en-US")} miles at {gasCarMpg} mpg and ${place.gasUsd.toFixed(2)}/gal
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted space-y-1.5">
        <p>
          Electricity at {place.centsPerKwh.toFixed(1)}¢ per kWh ({st ? `${st.name} average` : "US average"}){charging === "work" ? ", the same price assumed at work" : ""};
          road trips{charging === "rarely" ? " and everyday miles" : ""} on public fast chargers at ${DC_FAST.usdPerKwh.toFixed(2)} per kWh.
          {ret < 1 && ` ${place.name} winters average ${place.winterTempF}°F, so December to February we count ${pct(ret)} of normal electric range.`}
        </p>
        <p>
          The EPA label for the {phev.label} assumes {pct(phev.labelElectricShare)}{" "}of its miles are electric; real owners often
          plug in less (see below).{phev.premium && " This model calls for premium gasoline; we price regular, so its gas cost here is low."}
        </p>
      </div>
    </div>
  );
}
