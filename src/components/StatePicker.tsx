"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import LocalNote from "@/components/LocalNote";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";

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
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const abbr = picked ?? located.abbr ?? initial;
  const setAbbr = (a: string) => {
    setPicked(a);
    choose(a);
  };
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
      </div>
      <LocalNote name={name} local={picked !== null || located.abbr !== null} selectId="hero-state" />
      <p className="mt-3 text-stone-700" aria-live="polite">
        A typical {name} home could save about{" "}
        <strong className="text-leaf text-xl tabular-nums">${total.toLocaleString("en-US")} a year</strong> by going
        electric. Yours depends on your home and car.
      </p>
      <Link href={`/go-electric?state=${abbr}`} className="btn btn-primary w-full mt-4" data-testid="hero-cta" data-umami-event="home_hero_cta">
        Show my savings, switch by switch
      </Link>
    </div>
  );
}
