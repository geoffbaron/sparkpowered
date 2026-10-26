"use client";

import { useState } from "react";
import { pillClass } from "@/components/guide-ui";
import {
  BLEACH_REDOSE_WAIT_MIN,
  BLEACH_WAIT_MIN,
  CDC_BOIL_ALT_FT,
  EPA_BLEACH_TABLE,
  EPA_BOIL_ALT_FT,
  bleachDose,
  boilMinutes,
  type BleachStrength,
} from "@/lib/prep";

/** Bleach drops (EPA table) and boil time by elevation (CDC, with EPA noted). */
export default function PurifyCalc() {
  const [strength, setStrength] = useState<BleachStrength>("8.25");
  const [rowId, setRowId] = useState("1gal");
  const [cloudy, setCloudy] = useState(false);
  const [elev, setElev] = useState(0);

  const b = bleachDose(rowId, strength, cloudy);
  const boil = boilMinutes(elev);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden" data-testid="bleach-calc">
        <div className="p-5 sm:p-6 space-y-4">
          <h3 className="text-lg font-extrabold text-ink">Bleach: how many drops</h3>
          <fieldset>
            <legend className="font-bold text-ink mb-2">1. Strength on the bottle (sodium hypochlorite)</legend>
            <div className="flex flex-wrap gap-2">
              {(["6", "8.25"] as BleachStrength[]).map((s) => (
                <button key={s} type="button" aria-pressed={strength === s} onClick={() => setStrength(s)} className={pillClass(strength === s)}>
                  {s}%
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block" htmlFor="bleach-volume">
            <span className="font-bold text-ink">2. Amount of water</span>
            <select
              id="bleach-volume"
              value={rowId}
              onChange={(e) => setRowId(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 bg-white"
            >
              {EPA_BLEACH_TABLE.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={cloudy} onChange={(e) => setCloudy(e.target.checked)} className="mt-1 h-4 w-4" />
            <span>
              <span className="font-bold text-ink">3. Water is cloudy, colored or very cold</span>
              <span className="block text-xs text-muted">EPA: double the bleach. Let cloudy water settle and pour it through a clean cloth or coffee filter first.</span>
            </span>
          </label>
        </div>
        <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-t border-black/8" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Add to {b.row.label.toLowerCase()}</p>
          <p className="text-3xl font-extrabold text-ink mt-1" data-testid="bleach-dose">{b.dose}</p>
          <p className="text-sm text-stone-800 mt-1">of regular, unscented {strength}% bleach{b.doubled ? " (doubled)" : ""}.</p>
          <p className="text-sm text-stone-800 mt-3">
            Stir and wait <strong>{BLEACH_WAIT_MIN} minutes</strong>. It should smell slightly of chlorine. If not, add the same dose again
            and wait {BLEACH_REDOSE_WAIT_MIN} more minutes.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden" data-testid="boil-calc">
        <div className="p-5 sm:p-6 space-y-4">
          <h3 className="text-lg font-extrabold text-ink">Boiling: how long</h3>
          <label className="block" htmlFor="boil-elev">
            <span className="font-bold text-ink">Your elevation (feet)</span>
            <input
              id="boil-elev"
              type="number"
              min={-300}
              max={15000}
              step={100}
              value={elev}
              onChange={(e) => setElev(Math.max(-300, Math.min(15000, Number(e.target.value) || 0)))}
              className="mt-2 block w-36 rounded-lg border border-black/20 px-3 py-2 tabular-nums bg-white"
            />
            <span className="block text-xs text-muted mt-1">Not sure? Many phone compass and map apps show your elevation.</span>
          </label>
        </div>
        <div className="p-5 sm:p-6 bg-gradient-to-br from-sky-50 to-amber-50 border-t border-black/8" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Rolling boil for</p>
          <p className="text-3xl font-extrabold text-ink mt-1" data-testid="boil-minutes">
            {Math.max(boil.cdc, boil.epa)} {Math.max(boil.cdc, boil.epa) === 1 ? "minute" : "minutes"}
          </p>
          <p className="text-sm text-stone-800 mt-2">
            {boil.agree ? (
              <>CDC and EPA agree at this elevation.</>
            ) : (
              <>
                CDC says 1 minute up to {CDC_BOIL_ALT_FT.toLocaleString("en-US")} feet; EPA says 3 minutes above{" "}
                {EPA_BOIL_ALT_FT.toLocaleString("en-US")} feet. Boiling 3 minutes meets both.
              </>
            )}
          </p>
          <p className="text-xs text-muted mt-2">Let it cool on its own, then store it in clean, covered containers.</p>
        </div>
      </div>
    </div>
  );
}
