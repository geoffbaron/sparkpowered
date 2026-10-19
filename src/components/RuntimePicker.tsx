"use client";

import { useState } from "react";
import { PartnerLink } from "@/components/affiliate";
import { PlainLink, pillClass } from "@/components/guide-ui";
import type { BrandId } from "@/data/affiliates";
import { FRIDGE_KWH_YEAR, LOADS, USABLE_FRACTION } from "@/lib/everyday";

export interface RuntimeOption {
  id: string;
  name: string;
  /** Partner brand id when the link should be tracked; null for a plain link. */
  brand: BrandId | null;
  capacityWh: number;
  priceUsd: number;
  url: string;
  note?: string;
}

/** CPAP with no heated humidifier: about 11 W (ResMed battery guide, AirSense 10 at pressure 10). */
export const CPAP_NO_HUMIDIFIER_W = 11;
/** A 12 V compressor cooler: 0.98 Ah an hour at 12 V on a 90°F day (Dometic CFX3 35 spec). */
export const COOLER_WH_DAY = Math.round(0.98 * 12 * 24);

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: n % 1 ? 2 : 0 });

function hoursText(h: number) {
  if (h < 36) return `${Math.round(h)} hours`;
  const d = h / 24;
  return `${d < 10 ? Math.round(d * 2) / 2 : Math.round(d)} days`;
}

function BuyLink({ o }: { o: RuntimeOption }) {
  return o.brand ? (
    <PartnerLink brand={o.brand} productId={o.id} productUrl={o.url} className="btn btn-primary btn-sm">
      Check price
    </PartnerLink>
  ) : (
    <PlainLink href={o.url} className="btn btn-outline btn-sm">
      See it
    </PlainLink>
  );
}

function Results({
  options,
  covers,
  value,
  label,
}: {
  options: RuntimeOption[];
  covers: (o: RuntimeOption) => boolean;
  value: (o: RuntimeOption) => string;
  label: string;
}) {
  const sorted = [...options].sort((a, b) => a.priceUsd - b.priceUsd);
  const best = sorted.find(covers);
  return (
    <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
      <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Cheapest that covers it</p>
      {best ? (
        <>
          <p className="text-2xl font-extrabold text-ink mt-1" data-testid="runtime-pick">{best.name}</p>
          <p className="text-stone-800 mt-1">
            {label} <strong>{value(best)}</strong> for {money(best.priceUsd)} when we checked.
          </p>
          <div className="mt-3"><BuyLink o={best} /></div>
        </>
      ) : (
        <p className="text-stone-800 mt-1" data-testid="runtime-pick">
          None of these covers that on one charge. Pick the biggest and recharge it from solar or a car, or see{" "}
          <a href="/home-battery-backup" className="underline">home battery backup</a>.
        </p>
      )}
      <ul className="mt-5 divide-y divide-black/8 text-sm bg-white rounded-2xl border border-black/8">
        {sorted.map((o) => (
          <li key={o.id} className="flex items-center justify-between gap-3 p-3">
            <span>
              <span className="font-semibold text-ink">{o.name}</span>{" "}
              <span className="text-muted">{money(o.priceUsd)}</span>
              <span className="block text-stone-700">
                {label} {value(o)} {covers(o) ? <span className="text-leaf font-semibold">· covers it</span> : null}
              </span>
            </span>
            <BuyLink o={o} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "How many nights of CPAP do you need?" -> nights each option gives. */
export function CpapPicker({ options }: { options: RuntimeOption[] }) {
  const [humid, setHumid] = useState(true);
  const [nights, setNights] = useState(2);
  const watts = humid ? LOADS.cpapW : CPAP_NO_HUMIDIFIER_W;
  const nightsOf = (o: RuntimeOption) => (o.capacityWh * USABLE_FRACTION) / (watts * LOADS.cpapNightHours);
  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="cpap-picker">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8">
        <fieldset>
          <legend className="font-bold text-ink mb-2">1. Do you use the heated humidifier?</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={humid} onClick={() => setHumid(true)} className={pillClass(humid)}>Yes ({LOADS.cpapW} W)</button>
            <button type="button" aria-pressed={!humid} onClick={() => setHumid(false)} className={pillClass(!humid)}>No ({CPAP_NO_HUMIDIFIER_W} W)</button>
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="font-bold text-ink mb-2">2. How many nights without power?</legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 5, 7].map((n) => (
              <button key={n} type="button" aria-pressed={nights === n} onClick={() => setNights(n)} className={pillClass(nights === n)}>
                {n === 7 ? "A week" : `${n} night${n > 1 ? "s" : ""}`}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="text-xs text-muted mt-5 leading-relaxed">
          ResMed&apos;s battery guide: an AirSense 10 at pressure 10 draws about {LOADS.cpapW} W with the heated humidifier on
          setting 4 and about {CPAP_NO_HUMIDIFIER_W} W without it. We assume {LOADS.cpapNightHours} hours a night and that you can
          use {Math.round(USABLE_FRACTION * 100)}% of the rated capacity. Your machine and pressure may differ: check its manual.
        </p>
      </div>
      <Results
        options={options}
        covers={(o) => nightsOf(o) >= nights}
        value={(o) => `${Math.floor(nightsOf(o) * 10) / 10} nights`}
        label="Runs your CPAP about"
      />
    </div>
  );
}

/** "How long do you need to keep the fridge cold?" -> hours each option gives. */
export function FridgePicker({ options }: { options: RuntimeOption[] }) {
  const [kind, setKind] = useState<"home" | "label" | "cooler">("home");
  const [labelKwh, setLabelKwh] = useState(600);
  const [hours, setHours] = useState(24);
  const whDay = kind === "home" ? (FRIDGE_KWH_YEAR * 1000) / 365 : kind === "label" ? (Math.max(50, labelKwh) * 1000) / 365 : COOLER_WH_DAY;
  const hoursOf = (o: RuntimeOption) => ((o.capacityWh * USABLE_FRACTION) / whDay) * 24;
  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="fridge-picker">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8">
        <fieldset>
          <legend className="font-bold text-ink mb-2">1. Which fridge?</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={kind === "home"} onClick={() => setKind("home")} className={pillClass(kind === "home")}>Kitchen fridge (US average)</button>
            <button type="button" aria-pressed={kind === "label"} onClick={() => setKind("label")} className={pillClass(kind === "label")}>Use my EnergyGuide label</button>
            <button type="button" aria-pressed={kind === "cooler"} onClick={() => setKind("cooler")} className={pillClass(kind === "cooler")}>12 V camping fridge</button>
          </div>
          {kind === "label" && (
            <label className="block mt-3 text-sm">
              <span className="font-medium text-ink">kWh per year on the yellow label</span>
              <input
                type="number"
                min={50}
                max={2000}
                step={10}
                value={labelKwh}
                onChange={(e) => setLabelKwh(Number(e.target.value) || 0)}
                className="mt-1 block w-32 rounded-lg border border-black/20 px-3 py-1.5"
              />
            </label>
          )}
        </fieldset>
        <fieldset className="mt-5">
          <legend className="font-bold text-ink mb-2">2. How long is the outage?</legend>
          <div className="flex flex-wrap gap-2">
            {[12, 24, 48, 72].map((h) => (
              <button key={h} type="button" aria-pressed={hours === h} onClick={() => setHours(h)} className={pillClass(hours === h)}>
                {h < 24 ? `${h} hours` : `${h / 24} day${h > 24 ? "s" : ""}`}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="text-xs text-muted mt-5 leading-relaxed">
          Your fridge uses about {Math.round(whDay).toLocaleString("en-US")} Wh a day. The US average is {FRIDGE_KWH_YEAR} kWh a year
          per home (EIA, 2020 household survey); the camping fridge is Dometic&apos;s figure for a CFX3 35 on a 90°F day. We assume{" "}
          {Math.round(USABLE_FRACTION * 100)}% of rated capacity is usable. Keep the door shut and it does better.
        </p>
      </div>
      <Results
        options={options}
        covers={(o) => hoursOf(o) >= hours}
        value={(o) => hoursText(hoursOf(o))}
        label="Keeps it cold about"
      />
    </div>
  );
}
