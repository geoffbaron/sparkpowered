"use client";

import { useMemo, useState } from "react";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import { NATIONAL_CHOICE } from "@/lib/visitor-state";
import { nwrCountyUrl, nwrStationsUrl } from "@/lib/prep";

/** State -> the official NWS transmitter list and county SAME code list for that state. */
export default function NwrFinder({ states }: { states: { abbr: string; name: string }[] }) {
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid, true);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const abbr = picked ?? located.abbr ?? "";
  const st = states.find((s) => s.abbr === abbr);

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="nwr-finder">
      <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8">
        <label className="block">
          <span className="font-bold text-ink">Your state</span>
          <select
            id="nwr-state"
            value={abbr}
            onChange={(e) => {
              setPicked(e.target.value);
              choose(e.target.value || NATIONAL_CHOICE);
            }}
            className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 bg-white"
          >
            <option value="">Choose a state</option>
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>{s.name}</option>
            ))}
          </select>
        </label>
        <p className="text-sm text-stone-700 mt-4">
          The National Weather Service keeps the only up-to-date list of transmitters and county codes. We link straight to it rather
          than copy it, so you always get the current frequency.
        </p>
      </div>
      <div className="p-5 sm:p-6 bg-gradient-to-br from-sky-50 to-amber-50" aria-live="polite">
        {st ? (
          <ol className="space-y-4 text-stone-800">
            <li>
              <p className="font-bold text-ink">1. Find your county&apos;s SAME code and station</p>
              <a
                href={nwrCountyUrl(st.abbr)}
                target="_blank"
                rel="noopener"
                className="btn btn-primary mt-2"
                data-testid="nwr-county-link"
              >
                {st.name} counties and SAME codes
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <p className="text-xs text-muted mt-1">Lists each county&apos;s 6-digit SAME code, the station that covers it and its frequency.</p>
            </li>
            <li>
              <p className="font-bold text-ink">2. Check the transmitter list</p>
              <a href={nwrStationsUrl(st.abbr)} target="_blank" rel="noopener" className="btn btn-light border border-black/15 mt-2">
                {st.name} NOAA Weather Radio stations
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <p className="font-bold text-ink">3. Program the radio</p>
              <p className="text-sm">Enter the SAME code and tune to that station&apos;s frequency, following your radio&apos;s manual.</p>
            </li>
          </ol>
        ) : (
          <p className="text-stone-800">Pick your state to get the official NWS county and station lists.</p>
        )}
      </div>
    </div>
  );
}
