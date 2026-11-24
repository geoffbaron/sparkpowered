"use client";

import { useState } from "react";
import { PartnerLink } from "@/components/affiliate";
import { lifetimeCompare } from "@/lib/rv-battery";

const yrs = (n: number) => (n >= 10 ? "10+" : n.toFixed(1));

/** Uses a year -> how long one 12V 100Ah lithium lasts vs the AGMs that match it (no prices). */
export default function LithiumAgmCalc({ productId, productUrl }: { productId: string; productUrl: string }) {
  const [uses, setUses] = useState(100);
  const c = lifetimeCompare(uses);
  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm p-5 sm:p-6" data-testid="agm-calc">
      <label htmlFor="uses" className="font-bold text-ink block">
        How many days a year do you run the battery down? <span className="text-spark-orange">{uses}</span>
      </label>
      <input
        id="uses"
        type="range"
        min={10}
        max={365}
        step={5}
        value={uses}
        onChange={(e) => setUses(Number(e.target.value))}
        className="w-full mt-3 accent-orange-600"
      />
      <div className="flex justify-between text-xs text-muted">
        <span>Weekend boater (10)</span>
        <span>Full-time RV (365)</span>
      </div>
      <div className="mt-5" aria-live="polite">
        <p className="text-3xl font-extrabold text-leaf tabular-nums" data-testid="agm-saving">
          {c.leadAcid.sets === 1 ? "1 set" : `${c.leadAcid.sets} sets`} of {c.leadAcid.units} AGMs
        </p>
        <p className="text-stone-700 text-sm mt-1">
          wear out over the life of one lithium battery at this use. The AGMs last about {yrs(c.leadAcid.years)} years; the lithium about{" "}
          {c.lithium.years.toFixed(0)}. Compare today&apos;s prices with that in mind.
        </p>
        <div className="mt-3">
          <PartnerLink brand="redodo" productId={productId} productUrl={productUrl} className="btn btn-primary btn-sm">
            See today&apos;s price at Redodo
          </PartnerLink>
        </div>
      </div>
    </div>
  );
}
