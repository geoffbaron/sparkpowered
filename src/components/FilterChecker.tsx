"use client";

import { useState } from "react";
import { pillClass } from "@/components/guide-ui";
import { STANDARDS, WATER_SOURCES, type WaterSourceId } from "@/lib/prep";

/** Pick a water source -> what kind of treatment and which standard to look for. */
export default function FilterChecker() {
  const [id, setId] = useState<WaterSourceId>("outdoor");
  const src = WATER_SOURCES.find((s) => s.id === id) ?? WATER_SOURCES[0];
  const stds = STANDARDS.filter((s) => src.standards.includes(s.id));

  return (
    <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="filter-checker">
      <fieldset className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8">
        <legend className="sr-only">Where will your water come from?</legend>
        <p className="font-bold text-ink mb-3" aria-hidden="true">Where will your water come from?</p>
        <div className="flex flex-col items-start gap-2">
          {WATER_SOURCES.map((s) => (
            <button key={s.id} type="button" aria-pressed={id === s.id} onClick={() => setId(s.id)} className={`${pillClass(id === s.id)} text-left`}>
              {s.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="p-5 sm:p-6 bg-gradient-to-br from-sky-50 to-amber-50" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">You need</p>
        <p className="text-2xl font-extrabold text-ink mt-1" data-testid="filter-need">{src.need}</p>
        <p className="text-sm text-stone-800 mt-2 leading-relaxed">{src.detail}</p>
        {stds.length > 0 && (
          <>
            <p className="mt-4 text-sm font-bold text-ink">Look for certification to</p>
            <ul className="mt-1 space-y-2 text-sm">
              {stds.map((s) => (
                <li key={s.id} className="rounded-xl bg-white/80 border border-black/8 px-3 py-2">
                  <strong>{s.name}</strong>: <span className="text-stone-700">{s.covers}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
