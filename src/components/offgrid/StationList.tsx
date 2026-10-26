"use client";

import { PartnerLink } from "@/components/affiliate";
import { fmtKwh, type StationMatch } from "@/lib/offgrid";
import { money } from "@/lib/products";

/** Matching power stations, cheapest first, each linked through PartnerLink. */
export default function StationList({ matches, empty }: { matches: StationMatch[]; empty: React.ReactNode }) {
  if (matches.length === 0) return <p className="text-sm text-stone-800 mt-2" data-testid="station-none">{empty}</p>;
  return (
    <ul className="mt-2 divide-y divide-black/8 text-sm bg-white rounded-2xl border border-black/8" data-testid="station-matches">
      {matches.map((m) => (
        <li key={m.option.id} className="p-3">
          <PartnerLink brand={m.option.brand} productId={m.option.id} productUrl={m.option.url}>
            {m.option.name}
          </PartnerLink>
          {m.addOns > 0 && <span className="text-stone-700"> + {m.addOns} add-on {m.addOns === 1 ? "battery" : "batteries"}</span>}
          <span className="block text-stone-700">
            {fmtKwh(m.totalWh)}, {m.option.acOutputW.toLocaleString("en-US")} W output
            {m.option.solarInputW ? `, up to ${m.option.solarInputW.toLocaleString("en-US")} W of solar` : ""} ·{" "}
            <strong>{money(m.totalUsd)}</strong> when we checked
          </span>
        </li>
      ))}
    </ul>
  );
}
