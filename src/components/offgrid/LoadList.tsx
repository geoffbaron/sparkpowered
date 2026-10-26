"use client";

import { fmtWh, lineWh, loadDef, type LoadPick } from "@/lib/offgrid";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));

/** Editable list of loads: how many of each, and hours a day for the ones that depend on use. */
export default function LoadList({ picks, onChange, idPrefix }: { picks: LoadPick[]; onChange: (p: LoadPick[]) => void; idPrefix: string }) {
  const set = (i: number, patch: Partial<LoadPick>) => onChange(picks.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  return (
    <ul className="divide-y divide-black/8 rounded-2xl border border-black/10 bg-white text-sm">
      {picks.map((p, i) => {
        const d = loadDef(p.id);
        const wh = lineWh(p);
        return (
          <li key={p.id} className="p-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className={`flex-1 min-w-[10rem] font-medium ${p.count > 0 ? "text-ink" : "text-muted"}`}>{d.label}</span>
            <label className="flex items-center gap-1.5">
              <span className="sr-only">How many: {d.label}</span>
              <input
                id={`${idPrefix}-${p.id}-n`}
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                value={p.count}
                onChange={(e) => set(i, { count: clamp(Math.round(Number(e.target.value)), 0, 20) })}
                className="w-16 rounded-lg border border-black/20 px-2 py-1 tabular-nums"
              />
              <span className="text-muted">{d.kind === "daily" && d.id === "phone" ? "a day" : "×"}</span>
            </label>
            {d.kind === "hourly" && (
              <label className="flex items-center gap-1.5">
                <input
                  id={`${idPrefix}-${p.id}-h`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={24}
                  step={0.5}
                  value={p.hours ?? d.hours ?? 0}
                  onChange={(e) => set(i, { hours: clamp(Number(e.target.value), 0, 24) })}
                  className="w-16 rounded-lg border border-black/20 px-2 py-1 tabular-nums"
                />
                <span className="text-muted">hours a day</span>
              </label>
            )}
            <span className="w-20 text-right tabular-nums text-stone-700">{wh > 0 ? fmtWh(wh) : "—"}</span>
          </li>
        );
      })}
    </ul>
  );
}
