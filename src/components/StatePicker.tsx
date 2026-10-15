"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Home-page hero picker: choose a state, see the typical household's yearly
 * saving from going electric, then open the full planner for that state.
 */
export default function StatePicker({
  states,
  totals,
  initial = "OH",
}: {
  states: { abbr: string; name: string }[];
  totals: Record<string, number>;
  initial?: string;
}) {
  const [abbr, setAbbr] = useState(initial);
  const name = states.find((s) => s.abbr === abbr)?.name ?? "";
  const total = totals[abbr] ?? 0;
  return (
    <div className="mt-8 rounded-3xl bg-white/95 text-foreground p-5 sm:p-6 shadow-2xl max-w-xl">
      <label htmlFor="hero-state" className="block text-sm font-bold text-ink mb-2">
        Where do you live?
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          id="hero-state"
          value={abbr}
          onChange={(e) => setAbbr(e.target.value)}
          className="flex-1 rounded-full border border-black/15 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {states.map((s) => (
            <option key={s.abbr} value={s.abbr}>
              {s.name}
            </option>
          ))}
        </select>
        <Link href={`/go-electric?state=${abbr}`} className="btn btn-primary">
          See what you&apos;d save
        </Link>
      </div>
      <p className="mt-3 text-stone-700" aria-live="polite">
        A typical {name} home could save about{" "}
        <strong className="text-leaf text-xl tabular-nums">${total.toLocaleString("en-US")} a year</strong> by going
        electric.
      </p>
    </div>
  );
}
