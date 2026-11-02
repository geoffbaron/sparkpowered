"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Goal = { href: string; label: string };

// Every goal a visitor can come with, each sent to the one tool that answers it.
// The list is always in the HTML (only hidden), so crawlers see every link.
const GOALS: { group: string; goals: Goal[] }[] = [
  {
    group: "Save money",
    goals: [
      { href: "/go-electric", label: "save money going electric" },
      { href: "/solar-calculator", label: "see if solar pays off" },
      { href: "/plug-in-solar", label: "try plug-in balcony solar" },
      { href: "/space-heater-cost", label: "see what a space heater costs" },
    ],
  },
  {
    group: "Drive electric",
    goals: [
      { href: "/calculator", label: "pick an electric car" },
      { href: "/ev-or-plug-in-hybrid", label: "choose EV or plug-in hybrid" },
      { href: "/ev-charger-picker", label: "pick a home EV charger" },
      { href: "/ev-charging-cost", label: "know what charging costs" },
      { href: "/e-bikes", label: "pick an e-bike" },
    ],
  },
  {
    group: "Backup power",
    goals: [
      { href: "/power-outage-backup-calculator", label: "keep the power on in an outage" },
      { href: "/battery-calculator", label: "pick a home battery" },
      { href: "/best-portable-power-stations", label: "pick a portable power station" },
      { href: "/best-power-station-for-cpap", label: "power my CPAP" },
    ],
  },
  {
    group: "Off grid and prep",
    goals: [
      { href: "/off-grid-solar-calculator", label: "go off grid" },
      { href: "/off-grid-cabin-solar-kit", label: "power a cabin" },
      { href: "/emergency-kit-checklist", label: "get ready for an emergency" },
      { href: "/emergency-water-storage-calculator", label: "store emergency water" },
    ],
  },
  {
    group: "RV, boat and camping",
    goals: [
      { href: "/lithium-rv-battery", label: "upgrade my RV battery" },
      { href: "/trolling-motor-battery-life", label: "fish all day on one battery" },
      { href: "/electric-outboard-motor", label: "go electric on my boat" },
    ],
  },
];

function rank(group: string, first: string[]) {
  const i = first.indexOf(group);
  return i === -1 ? first.length : i;
}

/**
 * `first` lists group names to show before the rest, so a section page leads with its own goals.
 * `lead` is a page's own group, shown at the top; a goal it repeats, or one that links to `here`, is dropped from the rest.
 */
export default function IWantTo({ first = [], lead, here }: { first?: string[]; lead?: { group: string; goals: Goal[] }; here?: string }) {
  const own = new Set([...(lead?.goals.map((g) => g.href) ?? []), ...(here ? [here] : [])]);
  const rest = [...GOALS]
    .sort((a, b) => rank(a.group, first) - rank(b.group, first))
    .map((g) => ({ ...g, goals: g.goals.filter((x) => !own.has(x.href)) }))
    .filter((g) => g.goals.length > 0);
  const groups = lead ? [lead, ...rest] : rest;
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
    <div ref={wrap} className="relative mt-6 max-w-3xl">
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
        className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 text-ink shadow-2xl shadow-black/30"
      >
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.group}>
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">{g.group}</p>
              <ul>
                {g.goals.map((goal) => (
                  <li key={goal.href + goal.label}>
                    <Link
                      href={goal.href}
                      onClick={() => setOpen(false)}
                      data-umami-event="i_want_to_pick"
                      data-umami-event-goal={goal.label}
                      className="block rounded-lg px-2 py-2 text-[17px] font-semibold text-stone-800 hover:bg-amber-50 hover:text-spark-orange focus-visible:bg-amber-50 focus-visible:text-spark-orange focus-visible:outline-none"
                    >
                      &hellip;{goal.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
