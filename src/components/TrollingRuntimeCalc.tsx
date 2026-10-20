"use client";

import { useState } from "react";
import { PartnerLink } from "@/components/affiliate";
import { pillClass } from "@/components/guide-ui";
import { FISHING_DAY_HOURS, MOTORS, SPEEDS, batteriesFor, hoursLabel, runtimeHours } from "@/lib/boating";

/**
 * Trolling motor runtime calculator: motor, speed and battery in, hours on the
 * water out. All numbers come from src/lib/boating.ts (shared with the server
 * page) so the page and the calculator always agree.
 */
export default function TrollingRuntimeCalc() {
  const [motorId, setMotorId] = useState(MOTORS[2].id);
  const [speedId, setSpeedId] = useState(SPEEDS[1].id);
  const motor = MOTORS.find((m) => m.id === motorId) ?? MOTORS[0];
  const speed = SPEEDS.find((s) => s.id === speedId) ?? SPEEDS[0];
  const options = batteriesFor(motor.volts);
  const [batteryIdx, setBatteryIdx] = useState(1);
  const battery = options[Math.min(batteryIdx, options.length - 1)];
  const hours = runtimeHours(motor, speed.share, battery.usableAh);
  const amps = motor.maxAmps * speed.share;
  const fullDay = options.find((o) => !o.leadAcid && runtimeHours(motor, speed.share, o.usableAh) >= FISHING_DAY_HOURS);

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="runtime-calc">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-5">
        <fieldset>
          <legend className="font-bold text-ink mb-2">1. Your trolling motor</legend>
          <div className="flex flex-wrap gap-2">
            {MOTORS.map((m) => (
              <button key={m.id} type="button" aria-pressed={m.id === motorId} onClick={() => { setMotorId(m.id); setBatteryIdx(1); }} className={pillClass(m.id === motorId)}>
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-bold text-ink mb-2">2. How hard you run it</legend>
          <div className="flex flex-wrap gap-2">
            {SPEEDS.map((s) => (
              <button key={s.id} type="button" aria-pressed={s.id === speedId} onClick={() => setSpeedId(s.id)} className={pillClass(s.id === speedId)}>
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">{speed.hint}</p>
        </fieldset>
        <fieldset>
          <legend className="font-bold text-ink mb-2">3. Your battery ({motor.volts} V)</legend>
          <div className="flex flex-wrap gap-2">
            {options.map((o, i) => (
              <button key={o.id} type="button" aria-pressed={o.id === battery.id} onClick={() => setBatteryIdx(i)} className={pillClass(o.id === battery.id)}>
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Time on the water</p>
        <p className="text-4xl sm:text-5xl font-extrabold text-ink mt-1 tabular-nums" data-testid="runtime-hours">{hoursLabel(hours)}</p>
        <p className="text-stone-700 mt-2 text-sm">
          {hours >= FISHING_DAY_HOURS ? "A full day of fishing, with some left over." : `Short of a ${FISHING_DAY_HOURS}-hour fishing day at this pace.`}{" "}
          The motor draws about {Math.round(amps)} A here from {battery.leadAcid ? "an AGM you should stop at half" : "a lithium you can run to empty"}.
        </p>
        <ul className="mt-4 space-y-1 text-sm text-stone-800">
          <li><strong>{battery.usableAh} Ah</strong> you can use from this battery{battery.leadAcid ? " (half its rating)" : " (all of it)"}</li>
          {battery.weightLb != null && <li><strong>{Math.round(battery.weightLb)} lb</strong> to carry to the boat</li>}
          {battery.priceUsd != null && <li><strong>${battery.priceUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> when we checked</li>}
        </ul>
        {fullDay && fullDay.id !== battery.id && (
          <p className="text-sm text-stone-800 mt-4">
            For a full {FISHING_DAY_HOURS}-hour day at this pace: <strong>{fullDay.label}</strong> ({hoursLabel(runtimeHours(motor, speed.share, fullDay.usableAh))}).
          </p>
        )}
        {!battery.leadAcid && battery.url && (
          <div className="mt-4">
            <PartnerLink brand="redodo" productId={battery.id} productUrl={battery.url} className="btn btn-primary">
              Check price on Redodo
            </PartnerLink>
          </div>
        )}
        {fullDay && fullDay.id !== battery.id && fullDay.url && (
          <div className="mt-3">
            <PartnerLink brand="redodo" productId={fullDay.id} productUrl={fullDay.url}>See the full-day battery</PartnerLink>
          </div>
        )}
        <p className="text-xs text-muted mt-4">
          Draw at full speed is {motor.source}. Wind, current, boat weight and spot-lock change it; treat this as a calm-day guide.
        </p>
      </div>
    </div>
  );
}
