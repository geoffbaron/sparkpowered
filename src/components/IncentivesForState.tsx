"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import LocalNote from "@/components/LocalNote";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";

export interface IncentiveLinks {
  abbr: string;
  name: string;
  slug: string;
  afdc: string;
  dsire: string;
}

/** "Your state" shortcut above the 50-state list, pre-set to the visitor's state when we can tell. */
export default function IncentivesForState({ states }: { states: IncentiveLinks[] }) {
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const abbr = picked ?? located.abbr ?? "";
  const st = states.find((s) => s.abbr === abbr);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 mb-6 max-w-3xl">
      <label htmlFor="incentive-state" className="block text-sm font-bold text-ink mb-2">
        Your state
      </label>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-h-[2.75rem]">
        <select
          id="incentive-state"
          value={abbr}
          onChange={(e) => {
            setPicked(e.target.value);
            if (e.target.value) choose(e.target.value);
          }}
          className="rounded-lg border border-black/20 bg-white px-3 py-2 sm:w-56"
        >
          <option value="">Choose your state</option>
          {states.map((s) => (
            <option key={s.abbr} value={s.abbr}>
              {s.name}
            </option>
          ))}
        </select>
        {st ? (
          <p className="text-sm">
            <a href={st.afdc} className="underline text-spark-orange font-medium" rel="noopener">
              {st.name} EV rebates (AFDC)
            </a>{" "}
            ·{" "}
            <a href={st.dsire} className="underline text-spark-orange font-medium" rel="noopener">
              solar &amp; battery rebates (DSIRE)
            </a>{" "}
            ·{" "}
            <Link href={`/states/${st.slug}`} className="underline text-spark-orange font-medium">
              {st.name} prices
            </Link>
          </p>
        ) : (
          <p className="text-sm text-muted">Pick a state to see where its rebates are listed.</p>
        )}
      </div>
      <div className="min-h-[1.25rem]">{st && <LocalNote name={st.name} local selectId="incentive-state" />}</div>
    </div>
  );
}
