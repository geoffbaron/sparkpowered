"use client";

import { useMemo, useState } from "react";
import { PartnerLink } from "@/components/affiliate";
import { RV_LOADS, daysOn, recommend } from "@/lib/rv-battery";

const DAY_OPTIONS = [1, 2, 3, 4, 7];
const SOLAR_OPTIONS = [0, 200, 400, 800];

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: n % 1 ? 2 : 0 });

function daysText(d: number) {
  if (!Number.isFinite(d)) return "indefinitely";
  if (d < 1) return `about ${Math.max(1, Math.round(d * 24))} hours`;
  const r = d < 10 ? Math.round(d * 2) / 2 : Math.round(d);
  return `about ${r} day${r === 1 ? "" : "s"}`;
}

/**
 * "What do you run, and for how long?" -> the Redodo 12 V battery that covers
 * it, in everyday terms. `solarWhPerKwDay` is the US median daily output of
 * 1 kW of panels (PVWatts), passed in from the server.
 */
export default function RvBatteryPicker({ solarWhPerKwDay }: { solarWhPerKwDay: number }) {
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(RV_LOADS.map((l) => [l.id, !!l.defaultOn])),
  );
  const [days, setDays] = useState(2);
  const [solarW, setSolarW] = useState(0);

  const whDay = RV_LOADS.reduce((s, l) => s + (on[l.id] ? l.whDay : 0), 0);
  const rec = useMemo(() => recommend(Math.max(whDay, 1), days), [whDay, days]);
  const solarWh = (solarW / 1000) * solarWhPerKwDay;
  const lasts = daysOn(rec.totalWh, whDay);
  const name = `${rec.count > 1 ? `${rec.count} x ` : ""}Redodo ${rec.battery.short}`;
  const maxedOut = rec.totalWh * 0.9 < whDay * days;

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden" data-testid="rv-picker">
      <div className="grid lg:grid-cols-[1fr_1fr]">
        <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8">
          <fieldset>
            <legend className="font-bold text-ink mb-2">1. What do you run off the battery?</legend>
            <ul className="grid gap-1.5">
              {RV_LOADS.map((l) => (
                <li key={l.id}>
                  <label className="flex items-start gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 accent-orange-600"
                      checked={!!on[l.id]}
                      onChange={(e) => setOn({ ...on, [l.id]: e.target.checked })}
                    />
                    <span>
                      <span className="font-medium text-ink">{l.label}</span>{" "}
                      <span className="text-muted">({l.whDay.toLocaleString("en-US")} Wh a day: {l.basis})</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
          <fieldset className="mt-5">
            <legend className="font-bold text-ink mb-2">2. How long between hookups or charges?</legend>
            <div className="flex flex-wrap gap-2">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={days === d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${days === d ? "bg-spark-orange text-white border-spark-orange" : "bg-white border-black/15 text-ink"}`}
                >
                  {d === 7 ? "A week" : `${d} day${d > 1 ? "s" : ""}`}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-5">
            <legend className="font-bold text-ink mb-2">3. Solar panels on the roof?</legend>
            <div className="flex flex-wrap gap-2">
              {SOLAR_OPTIONS.map((w) => (
                <button
                  key={w}
                  type="button"
                  aria-pressed={solarW === w}
                  onClick={() => setSolarW(w)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${solarW === w ? "bg-spark-orange text-white border-spark-orange" : "bg-white border-black/15 text-ink"}`}
                >
                  {w === 0 ? "None" : `${w} W`}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Your battery</p>
          {whDay === 0 ? (
            <p className="mt-2 text-stone-700">Tick at least one thing you run.</p>
          ) : (
            <>
              <p className="text-2xl sm:text-3xl font-extrabold text-ink mt-1" data-testid="rv-pick">{name}</p>
              <p className="text-stone-800 mt-2">
                Runs what you ticked for <strong>{daysText(lasts)}</strong> on one charge, using about{" "}
                {whDay.toLocaleString("en-US")} Wh a day.
              </p>
              {maxedOut && (
                <p className="text-sm text-stone-700 mt-2">
                  That is the most we&apos;d put in one RV. For longer, add solar or cut the big loads.
                </p>
              )}
              <ul className="mt-3 space-y-1 text-sm text-stone-800">
                <li>
                  <strong>{usd(rec.totalUsd)}</strong> on Redodo&apos;s site when we checked
                </li>
                <li>
                  <strong>{rec.totalLb} lb</strong>, versus about {rec.leadAcidLb} lb for the {rec.leadAcidCount} lead-acid (AGM)
                  batteries it would take to match it
                </li>
                {solarW > 0 && (
                  <li>
                    {solarW} W of panels put back about <strong>{Math.round(solarWh).toLocaleString("en-US")} Wh</strong> on an
                    average day ({Math.round(Math.min(1, solarWh / whDay) * 100)}% of what you use), so you can stay out{" "}
                    {solarWh >= whDay ? "as long as the sun cooperates" : "longer"}.
                  </li>
                )}
              </ul>
              <div className="mt-4">
                <PartnerLink brand="redodo" productId={rec.battery.id} productUrl={rec.battery.url} variant="button" className="btn btn-primary">
                  Check price on Redodo
                </PartnerLink>
              </div>
              <p className="text-xs text-muted mt-3">
                We keep 10% in reserve. Solar is the US median from PVWatts for fixed panels; flat RV roofs and winter make less.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
