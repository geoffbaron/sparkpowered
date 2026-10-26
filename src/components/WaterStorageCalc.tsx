"use client";

import { useState, useSyncExternalStore } from "react";
import { pillClass } from "@/components/guide-ui";
import {
  GOAL_DAYS,
  HOT_MULTIPLIER,
  MIN_DAYS,
  REFRESH_MONTHS,
  WATER_CONTAINERS,
  addMonths,
  containersFor,
  waterNeeded,
} from "@/lib/prep";

const noop = () => () => {};
const todayIso = () => new Date().toISOString().slice(0, 10);
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const longDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
};

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
  id,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  hint?: string;
  id: string;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="font-bold text-ink">{label}</span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min);
        }}
        className="mt-2 block w-32 rounded-lg border border-black/20 px-3 py-2 tabular-nums bg-white"
      />
      {hint && <span className="block text-xs text-muted mt-1">{hint}</span>}
    </label>
  );
}

/** People, days and extras -> gallons, containers and a refresh date (CDC, Ready.gov, FEMA). */
export default function WaterStorageCalc() {
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(GOAL_DAYS);
  const [hot, setHot] = useState(false);
  const [extra, setExtra] = useState(0);
  const [pets, setPets] = useState(0);
  const [filled, setFilled] = useState<string | null>(null);
  // Today's date only exists in the browser; the server render shows the rule instead.
  const today = useSyncExternalStore(noop, todayIso, () => null);
  const fillDate = filled ?? today;

  const w = waterNeeded({ people, days, hot, extraGallonsPerDay: extra, petGallonsPerDay: pets });

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="water-calc">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-5">
        <NumberField id="water-people" label="1. People in your home" value={people} onChange={setPeople} min={1} max={50} />
        <fieldset>
          <legend className="font-bold text-ink mb-2">2. How many days</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { d: MIN_DAYS, label: `${MIN_DAYS} days (minimum)` },
              { d: GOAL_DAYS, label: `${GOAL_DAYS} days (goal)` },
            ].map((o) => (
              <button key={o.d} type="button" aria-pressed={days === o.d} onClick={() => setDays(o.d)} className={pillClass(days === o.d)}>
                {o.label}
              </button>
            ))}
          </div>
          <label className="block mt-3 text-sm" htmlFor="water-days">
            Or type a number of days:{" "}
            <input
              id="water-days"
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(365, Math.round(Number(e.target.value)) || 1)))}
              className="ml-1 w-20 rounded-lg border border-black/20 px-2 py-1 tabular-nums"
            />
          </label>
        </fieldset>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={hot} onChange={(e) => setHot(e.target.checked)} className="mt-1 h-4 w-4" />
          <span>
            <span className="font-bold text-ink">3. Very hot weather</span>
            <span className="block text-xs text-muted">Ready.gov: in very hot temperatures, water needs can double. We double the per-person amount.</span>
          </span>
        </label>
        <NumberField
          id="water-extra"
          label="4. Extra for pregnant, nursing or sick people (gallons a day)"
          value={extra}
          onChange={setExtra}
          min={0}
          max={20}
          step={0.25}
          hint="CDC and FEMA say to store more for them but give no amount. Add what you judge right; we add nothing by default."
        />
        <NumberField
          id="water-pets"
          label="5. Water for all your pets (gallons a day)"
          value={pets}
          onChange={setPets}
          min={0}
          max={20}
          step={0.25}
          hint="No government agency gives a figure for pets. Ask your vet, or measure what your pets drink in a day."
        />
      </div>

      <div className="p-5 sm:p-6 bg-gradient-to-br from-sky-50 to-amber-50" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Water to store</p>
        <p className="text-3xl sm:text-4xl font-extrabold text-ink mt-1 tabular-nums" data-testid="water-total">
          {fmt(w.total)} gallons
        </p>
        <ul className="mt-3 space-y-1 text-sm text-stone-800">
          <li>
            People: <strong>{fmt(w.peopleGallons)} gal</strong> ({w.people} x {w.perPersonDay} gal x {w.days} days
            {hot ? `, doubled x${HOT_MULTIPLIER} for heat` : ""})
          </li>
          {w.extraGallons > 0 && <li>Extra for pregnancy or illness: <strong>{fmt(w.extraGallons)} gal</strong></li>}
          {w.petGallons > 0 && <li>Pets: <strong>{fmt(w.petGallons)} gal</strong></li>}
        </ul>

        <p className="mt-5 text-sm font-bold text-ink">That fills about</p>
        <ul className="mt-1 grid grid-cols-2 gap-2 text-sm" data-testid="water-containers">
          {WATER_CONTAINERS.map((c) => (
            <li key={c.id} className="rounded-xl bg-white/80 border border-black/8 px-3 py-2">
              <strong className="text-lg tabular-nums">{containersFor(w.total, c.gallons)}</strong>{" "}
              <span className="text-stone-700">{c.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-xl bg-white/80 border border-black/8 p-4 text-sm">
          <p className="font-bold text-ink">Refresh date</p>
          <label className="block mt-1 text-stone-700" htmlFor="water-filled">
            Date you fill the containers:{" "}
            <input
              id="water-filled"
              type="date"
              value={fillDate ?? ""}
              onChange={(e) => setFilled(e.target.value || null)}
              className="ml-1 rounded-lg border border-black/20 px-2 py-1"
            />
          </label>
          <p className="mt-2 text-stone-800" data-testid="water-refresh">
            {fillDate && /^\d{4}-\d{2}-\d{2}$/.test(fillDate) ? (
              <>Empty and refill by <strong>{longDate(addMonths(fillDate, REFRESH_MONTHS))}</strong>.</>
            ) : (
              <>Empty and refill water you bottled yourself every {REFRESH_MONTHS} months.</>
            )}
          </p>
          <p className="text-xs text-muted mt-1">
            The {REFRESH_MONTHS}-month rule is for water you bottle yourself. Keep store-bought water sealed in its original bottles.
          </p>
        </div>
      </div>
    </div>
  );
}
