"use client";

import { useState } from "react";
import { PartnerLink } from "@/components/affiliate";
import { BeforeAfter } from "@/components/ui";
import { lifetimeCost } from "@/lib/rv-battery";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Uses a year -> cost per year of one 12V 100Ah lithium vs the AGMs that match it. */
export default function LithiumAgmCalc({ productId, productUrl }: { productId: string; productUrl: string }) {
  const [uses, setUses] = useState(100);
  const c = lifetimeCost(uses);
  const saved = c.leadAcid.perYear - c.lithium.perYear;
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
      <div className="mt-5 grid md:grid-cols-2 gap-5 items-center" aria-live="polite">
        <BeforeAfter
          before={c.leadAcid.perYear}
          after={c.lithium.perYear}
          beforeLabel={`${c.leadAcid.units} AGM batteries (${money(c.leadAcid.usd)})`}
          afterLabel={`One lithium (${money(c.lithium.usd)})`}
          unit="/yr"
        />
        <div>
          <p className="text-3xl font-extrabold text-leaf tabular-nums" data-testid="agm-saving">{money(saved)} a year</p>
          <p className="text-stone-700 text-sm mt-1">
            saved with lithium. The AGMs last about {c.leadAcid.years >= 10 ? "10+" : c.leadAcid.years.toFixed(1)} years at this use;
            the lithium about {c.lithium.years.toFixed(0)}.
          </p>
          <div className="mt-3">
            <PartnerLink brand="redodo" productId={productId} productUrl={productUrl} className="btn btn-primary btn-sm">
              Check the lithium price
            </PartnerLink>
          </div>
        </div>
      </div>
    </div>
  );
}
