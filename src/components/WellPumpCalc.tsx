"use client";

import { useState } from "react";
import { pillClass } from "@/components/guide-ui";
import { hoursText } from "@/lib/can-it-run";
import { PUMP_MOTORS, fmtW, pumpFit, pumpLoad, type MotorStation, type PumpFit } from "@/lib/offgrid";

const FIT_TEXT: Record<PumpFit, string> = {
  runs: "Runs it, and its motor surge covers the full start",
  "start-unconfirmed": "Runs it once started; its specs don't cover the start",
  "too-big": "Too small to run it",
  "needs-240v": "No 240 V output",
};
const FIT_ORDER: PumpFit[] = ["runs", "start-unconfirmed", "too-big", "needs-240v"];
const FIT_CLASS: Record<PumpFit, string> = {
  runs: "text-leaf font-semibold",
  "start-unconfirmed": "text-amber-800 font-semibold",
  "too-big": "text-stone-500",
  "needs-240v": "text-stone-500",
};

/** Well pump nameplate -> running and starting watts -> which in-stock stations can run and start it. */
export default function WellPumpCalc({ stations }: { stations: MotorStation[] }) {
  const [volts, setVolts] = useState<115 | 230>(230);
  const [wires, setWires] = useState<2 | 3>(3);
  const motors = PUMP_MOTORS.filter((m) => m.volts === volts && m.wires === wires);
  const [hp, setHp] = useState("1/2");
  const m = motors.find((x) => x.hp === hp) ?? motors[0];
  const [ampsText, setAmpsText] = useState("");
  const amps = Number.parseFloat(ampsText);
  const load = pumpLoad(m, Number.isFinite(amps) && amps > 0 && amps < 100 ? amps : null);

  const all = stations
    .map((s) => ({ s, fit: pumpFit(load, s), hours: s.usableWh / load.runW }))
    .sort((a, b) => FIT_ORDER.indexOf(a.fit) - FIT_ORDER.indexOf(b.fit) || b.s.motorSurgeW - a.s.motorSurgeW);
  const rows = all.filter((r) => r.fit !== "needs-240v");
  const no240 = all.length - rows.length;

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-[2fr_3fr]" data-testid="well-pump-calc">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-5">
        <fieldset>
          <legend className="font-bold text-ink mb-2">1. Volts on the pump&apos;s nameplate</legend>
          <div className="flex flex-wrap gap-2">
            {([230, 115] as const).map((v) => (
              <button key={v} type="button" aria-pressed={volts === v} onClick={() => { setVolts(v); if (v === 115) setHp("1/2"); }} className={pillClass(volts === v)}>
                {v === 230 ? "230 or 240 V" : "115 or 120 V"}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-bold text-ink mb-2">2. 2-wire or 3-wire</legend>
          <div className="flex flex-wrap gap-2">
            {([3, 2] as const).map((w) => (
              <button key={w} type="button" aria-pressed={wires === w} onClick={() => setWires(w)} className={pillClass(wires === w)}>
                {w}-wire
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">A 3-wire pump has a separate control box on the wall, usually near the pressure tank. A 2-wire pump has none.</p>
        </fieldset>
        <fieldset>
          <legend className="font-bold text-ink mb-2">3. Horsepower</legend>
          <div className="flex flex-wrap gap-2">
            {motors.map((x) => (
              <button key={x.id} type="button" aria-pressed={m.id === x.id} onClick={() => setHp(x.hp)} className={pillClass(m.id === x.id)}>
                {x.hp} HP
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="font-bold text-ink">4. Max amps from the nameplate (optional)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            value={ampsText}
            onChange={(e) => setAmpsText(e.target.value)}
            placeholder={`Franklin's figure: ${m.maxAmps} A`}
            className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 bg-white"
          />
          <span className="block text-xs text-muted mt-1">On the motor label or the control box, often marked &quot;Max amps&quot; or &quot;SF amps&quot;.</span>
        </label>
      </div>
      <div className="p-5 sm:p-6 bg-surface-light" aria-live="polite">
        <dl className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-black/8 p-4">
            <dt className="text-xs font-medium text-muted">Running</dt>
            <dd className="text-2xl font-extrabold mt-1 tabular-nums" data-testid="pump-run">{fmtW(load.runW)}</dd>
            <dd className="text-xs text-muted mt-1">
              {load.basis === "nameplate" ? `${m.volts} V × ${amps} A` : `Franklin's maximum load for ${m.hp} HP, ${m.volts} V`}
            </dd>
          </div>
          <div className="bg-white rounded-xl border border-black/8 p-4">
            <dt className="text-xs font-medium text-muted">Starting, for an instant</dt>
            <dd className="text-2xl font-extrabold mt-1 tabular-nums" data-testid="pump-start">{fmtW(load.startTotalW)}</dd>
            <dd className="text-xs text-muted mt-1">{m.volts} V × {m.lockedRotorA} locked rotor amps</dd>
          </div>
        </dl>
        <h3 className="font-bold text-ink mt-5">In-stock power stations</h3>
        <ul className="mt-2 divide-y divide-black/8 text-sm bg-white rounded-2xl border border-black/8" data-testid="pump-stations">
          {rows.map(({ s, fit, hours }) => (
            <li key={s.id} className="p-3 flex flex-wrap justify-between gap-x-3 gap-y-1">
              <span className="font-medium text-ink">{s.name}</span>
              <span className={FIT_CLASS[fit]} data-fit={fit}>{FIT_TEXT[fit]}</span>
              {(fit === "runs" || fit === "start-unconfirmed") && (
                <span className="w-full text-xs text-muted">
                  {fmtW(s.acOutputW)} output, {fmtW(s.motorSurgeW)} for motor starts; {hoursText(hours)} of pumping on a full charge
                </span>
              )}
            </li>
          ))}
        </ul>
        {no240 > 0 && (
          <p className="text-sm text-stone-700 mt-2" data-testid="pump-no-240">
            {no240} other in-stock {no240 === 1 ? "station has" : "stations have"} no 240 V output, so {no240 === 1 ? "it can't" : "they can't"} run this pump.
          </p>
        )}
        <p className="text-xs text-muted mt-3">
          Hours are time the pump is actually running, not hours of outage: a pump runs only while water is drawn or the pressure tank refills.
        </p>
      </div>
    </div>
  );
}
