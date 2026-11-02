"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Goal = { href: string; label: string; hint?: string };

// The homepage's few big choices. Each opens a section page whose own picker
// branches into that section's tools, so no list is ever long.
// Lists are always in the HTML (only hidden), so crawlers see every link.
const TOP_GOALS: Goal[] = [
  { href: "/go-electric", label: "save money going electric", hint: "Every switch priced for your state" },
  { href: "/electric-vehicles", label: "drive electric", hint: "Pick a car, a charger, see charging costs" },
  { href: "/e-bikes", label: "ride an e-bike", hint: "Commuting, hills, heavier riders, folding" },
  { href: "/home-energy", label: "go solar or add a battery", hint: "Rooftop, balcony solar, home batteries" },
  { href: "/power-outage-backup-calculator", label: "keep the power on in an outage", hint: "Size backup for the fridge, CPAP, well pump" },
  { href: "/off-grid", label: "go off grid or get prepared", hint: "Off-grid solar, water, food, emergency kit" },
  { href: "/outdoor-power", label: "power my RV, boat or campsite", hint: "Lithium batteries, trolling motors, CPAP" },
];

/**
 * The "I want to..." picker. With no `goals` it shows the homepage's big choices; a section page
 * passes its own next steps, and `more` adds a way back to the big choices.
 */
export default function IWantTo({ goals = TOP_GOALS, more = false }: { goals?: Goal[]; more?: boolean }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    wrap.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative mt-6 max-w-2xl">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="i-want-to-list"
        onClick={() => setOpen((o) => !o)}
        data-umami-event="i_want_to_open"
        data-testid="i-want-to"
        className="flex w-full items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 sm:px-7 sm:py-5 text-left text-ink shadow-xl shadow-black/20 hover:ring-4 hover:ring-amber-300/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
      >
        <span className="text-2xl sm:text-4xl font-extrabold leading-tight">
          I want to <span className="text-spark-orange underline decoration-amber-300 decoration-4 underline-offset-4">choose one</span>
        </span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-8 w-8 shrink-0 text-spark-orange transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        id="i-want-to-list"
        hidden={!open}
        className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl bg-white p-2 sm:p-3 text-ink shadow-2xl shadow-black/30"
      >
        <ul>
          {goals.map((goal) => (
            <li key={goal.href + goal.label}>
              <Link
                href={goal.href}
                onClick={() => setOpen(false)}
                data-umami-event="i_want_to_pick"
                data-umami-event-goal={goal.label}
                className="group flex items-center justify-between gap-3 rounded-xl px-4 py-3 hover:bg-amber-50 focus-visible:bg-amber-50 focus-visible:outline-none"
              >
                <span>
                  <span className="block text-lg sm:text-xl font-bold text-stone-800 group-hover:text-spark-orange group-focus-visible:text-spark-orange">
                    &hellip;{goal.label}
                  </span>
                  {goal.hint && <span className="block text-sm text-muted mt-0.5">{goal.hint}</span>}
                </span>
                <span aria-hidden="true" className="text-spark-orange text-xl opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">&rarr;</span>
              </Link>
            </li>
          ))}
        </ul>
        {more && (
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="mt-1 block border-t border-black/8 px-4 pt-3 pb-2 text-sm font-semibold text-muted hover:text-spark-orange"
          >
            Something else? See every choice
          </Link>
        )}
      </div>
    </div>
  );
}
