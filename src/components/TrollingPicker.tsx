"use client";

import { useState } from "react";
import { PartnerLink } from "@/components/affiliate";
import { pillClass } from "@/components/guide-ui";
import { LEAD_ACID_REF, type DeepCycleBattery } from "@/data/batteries";
import { TROLLING_CHOICE, leadAcidFor, type Volts } from "@/lib/trolling";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: n % 1 ? 2 : 0 });

export default function TrollingPicker({ batteries }: { batteries: DeepCycleBattery[] }) {
  const [volts, setVolts] = useState<Volts>(24);
  const [long, setLong] = useState(false);
  const id = long ? TROLLING_CHOICE[volts].long : TROLLING_CHOICE[volts].short;
  const b = batteries.find((x) => x.id === id)!;
  const agm = leadAcidFor(volts);
  const agmLb = Math.round(agm * LEAD_ACID_REF.weightLb);
  // One string of 100 Ah AGMs (the usual lead-acid setup), run to half.
  const agmUsableWh = agm * 12 * LEAD_ACID_REF.ampHours * LEAD_ACID_REF.depthOfDischarge;
  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="trolling-picker">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8">
        <fieldset>
          <legend className="font-bold text-ink mb-2">1. What voltage is your trolling motor?</legend>
          <div className="flex flex-wrap gap-2">
            {([12, 24, 36] as Volts[]).map((v) => (
              <button key={v} type="button" aria-pressed={volts === v} onClick={() => setVolts(v)} className={pillClass(volts === v)}>
                {v} V ({TROLLING_CHOICE[v].thrust})
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="font-bold text-ink mb-2">2. How do you fish?</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!long} onClick={() => setLong(false)} className={pillClass(!long)}>Half days, charge after</button>
            <button type="button" aria-pressed={long} onClick={() => setLong(true)} className={pillClass(long)}>All day, wind, or cold mornings</button>
          </div>
        </fieldset>
        <p className="text-xs text-muted mt-5 leading-relaxed">
          Thrust ranges are Redodo&apos;s guidance. Check the voltage on your motor&apos;s label: 12 V motors use one battery, 24 V two
          and 36 V three when they are lead-acid.
        </p>
      </div>
      <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Your battery</p>
        <p className="text-2xl font-extrabold text-ink mt-1" data-testid="trolling-pick">Redodo {b.short}</p>
        <ul className="mt-3 space-y-1 text-sm text-stone-800">
          <li><strong>{money(b.priceUsd)}</strong> on Redodo&apos;s site when we checked</li>
          <li>
            <strong>{b.weightLb} lb</strong> in place of {agm} lead-acid batter{agm > 1 ? "ies" : "y"} at about {agmLb} lb
            {agm > 1 ? " wired together" : ""}
          </li>
          <li>
            <strong>{b.energyWh.toLocaleString("en-US")} Wh</strong> you can use, versus about {agmUsableWh.toLocaleString("en-US")} Wh
            from {agm > 1 ? "those" : "a"} 100 Ah AGM{agm > 1 ? "s" : ""} run to half
          </li>
          {b.selfHeating && <li>Warms itself so it can charge below freezing</li>}
          {b.bluetooth && <li>Phone app shows how much is left before you head back</li>}
        </ul>
        <div className="mt-4">
          <PartnerLink brand="redodo" productId={b.id} productUrl={b.url} className="btn btn-primary">
            Check price on Redodo
          </PartnerLink>
        </div>
        <p className="text-xs text-muted mt-3">AGM figures: Renogy 12V 100Ah AGM, {LEAD_ACID_REF.weightLb} lb, run to 50% as Renogy advises.</p>
      </div>
    </div>
  );
}
