"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PartnerLink } from "@/components/affiliate";
import { pillClass } from "@/components/guide-ui";
import {
  DEFAULT_INPUT,
  METHOD_LABEL,
  PICKER_LOADS,
  pick,
  type Budget,
  type HookupData,
  type HookupInput,
  type Match,
  type Method,
  type PickerLoadId,
} from "@/lib/hookup-picker";
import { AFFILIATES } from "@/data/affiliates";
import { USABLE_FRACTION, fmtW, fmtWh } from "@/lib/offgrid";

/** Anonymous counts only: which step, which answer category. No personal data. */
function track(name: string, data?: Record<string, string | number>) {
  try {
    const w = window as unknown as {
      lastlap?: { track?: (n: string, d?: Record<string, string | number>) => void };
      umami?: { track?: (n: string, d?: Record<string, string | number>) => void };
    };
    w.lastlap?.track?.(name, data);
    w.umami?.track?.(name, data);
  } catch {}
}

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const r10 = (n: number, up = false) => (n < 100 ? (up ? Math.ceil(n) : Math.floor(n)) : up ? Math.ceil(n / 10) * 10 : Math.floor(n / 10) * 10);
const range = ([lo, hi]: [number, number]) => `${money(r10(lo))} to ${money(r10(hi, true))}`;
const shortDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const runFor = (h: number) => (h === Infinity ? "" : h < 36 ? `about ${Math.round(h)} hours` : `about ${Math.round((h / 24) * 2) / 2} days`);

const LOAD_LABEL: Record<PickerLoadId, string> = {
  fridge: "Fridge",
  freezer: "Freezer",
  router: "Wi-Fi router",
  led: "A few LED lights",
  phone: "Phone charging",
  cpap: "CPAP",
  laptop: "Laptop",
  tv: "TV",
  microwave: "Microwave",
  furnace: "Gas furnace blower",
  well: "Well pump",
};

const BUDGETS: { v: Budget; label: string }[] = [
  { v: "1500", label: "Under $1,500" },
  { v: "3000", label: "Up to $3,000" },
  { v: "5000", label: "Up to $5,000" },
  { v: "any", label: "Whatever it takes" },
];

const METHOD_WHY: Record<Method, string> = {
  cords: "Plug each appliance straight into the battery, or into a heavy-duty outdoor cord running to it. Nothing touches the house wiring.",
  interlock: "An inlet box outside takes a cord from the battery, and an interlock on your panel makes it impossible to have the utility and the battery on at once. You pick circuits by flipping breakers.",
  switch: "A small panel next to your main panel with a switch for each chosen circuit. You flip those circuits from utility to battery; the rest of the house stays off, so you can't overload it by accident.",
  panel: "The maker's own panel kit, wired in by an electrician, switches your chosen circuits to the battery and shows use in the app.",
};

const STEPS = ["What must stay on", "120 V or 240 V", "Own or rent", "Budget", "An electrician", "Your setup"];

export default function HookupPicker({ data }: { data: HookupData }) {
  const [step, setStep] = useState(0);
  const [inp, setInp] = useState<HookupInput>(DEFAULT_INPUT);
  const started = useRef(false);
  const finished = useRef(false);
  const top = useRef<HTMLDivElement>(null);
  const res = useMemo(() => pick(inp, data), [inp, data]);
  const last = STEPS.length - 1;

  const set = <K extends keyof HookupInput>(k: K, v: HookupInput[K]) => {
    setInp((p) => ({ ...p, [k]: v }));
    if (!started.current) {
      started.current = true;
      track("hookup_picker_start");
    }
  };
  const toggle = (id: PickerLoadId) => set("loads", inp.loads.includes(id) ? inp.loads.filter((x) => x !== id) : [...inp.loads, id]);
  const go = (n: number) => {
    setStep(n);
    top.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  const next = () => go(Math.min(step + 1, last));

  useEffect(() => {
    if (step === last && !finished.current) {
      finished.current = true;
      track("hookup_picker_finish", {
        method: res.method,
        volts: inp.volts,
        tenure: inp.tenure,
        budget: inp.budget,
        electrician: inp.electrician ? "yes" : "no",
        loads: inp.loads.length,
        products: res.matches.length,
      });
    }
  }, [step, last, res, inp]);

  const hasWiredIn = inp.loads.some((id) => id === "well" || id === "furnace");

  return (
    <div ref={top} className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden scroll-mt-24" data-testid="hookup-picker">
      <div className="px-5 sm:px-6 pt-5">
        <div className="flex items-center justify-between text-xs font-semibold text-muted">
          <span>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </span>
          {step > 0 && (
            <button type="button" onClick={() => go(step - 1)} className="underline underline-offset-2 hover:text-spark-orange">
              Back
            </button>
          )}
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-black/5" aria-hidden="true">
          <div className="h-1.5 rounded-full bg-spark-orange transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div className="p-5 sm:p-6" aria-live="polite">
        {step === 0 && (
          <div className="space-y-5">
            <fieldset>
              <legend className="text-lg font-extrabold text-ink mb-1">What must stay on in an outage?</legend>
              <p className="text-sm text-stone-600 mb-3">Tap all that apply.</p>
              <div className="flex flex-wrap gap-2">
                {PICKER_LOADS.map((id) => (
                  <button key={id} type="button" data-answer={`load-${id}`} aria-pressed={inp.loads.includes(id)} onClick={() => toggle(id)} className={pillClass(inp.loads.includes(id))}>
                    {LOAD_LABEL[id]}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-bold text-ink mb-2">For how long without recharging?</legend>
              <div className="flex flex-wrap gap-2">
                {([1, 2, 3] as const).map((d) => (
                  <button key={d} type="button" data-answer={`days-${d}`} aria-pressed={inp.days === d} onClick={() => set("days", d)} className={pillClass(inp.days === d)}>
                    {d} day{d > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="text-sm text-stone-700 rounded-xl bg-surface-light px-4 py-3" data-testid="need-line">
              {inp.loads.length === 0 ? (
                "Pick at least one thing to keep on."
              ) : (
                <>
                  That&apos;s about <strong>{fmtWh(res.dailyWh)} a day</strong>
                  {res.notCovered.length === 0 ? "" : " for the plug-in items"}, so a battery of about <strong>{fmtWh(res.needWh)}</strong> covers{" "}
                  {inp.days === 1 ? "a day" : `${inp.days} days`} (power stations deliver about {Math.round(USABLE_FRACTION * 100)}% of their rating).
                </>
              )}
            </p>
            <button type="button" onClick={next} disabled={inp.loads.length === 0} className="btn btn-primary disabled:opacity-50">
              Next
            </button>
          </div>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="text-lg font-extrabold text-ink mb-2">Any 240-volt loads?</legend>
            <p className="text-sm text-stone-600 mb-3">
              Most well pumps, electric dryers and some bigger pumps run on 240 V: a double-wide breaker in your panel or a pump nameplate that says
              230 V or 240 V. Fridges, lights and outlets are 120 V.
            </p>
            <div className="grid gap-2">
              {[
                { v: "120" as const, label: "No, 120 V only" },
                { v: "240" as const, label: "Yes, something on 240 V (well pump, dryer)" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  data-answer={`volts-${o.v}`}
                  aria-pressed={inp.volts === o.v}
                  onClick={() => {
                    set("volts", o.v);
                    next();
                  }}
                  className={`${pillClass(inp.volts === o.v)} text-left !rounded-xl !py-3`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="text-lg font-extrabold text-ink mb-3">Do you own or rent?</legend>
            <div className="grid gap-2">
              {[
                { v: "own" as const, label: "I own the home" },
                { v: "rent" as const, label: "I rent" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  data-answer={`tenure-${o.v}`}
                  aria-pressed={inp.tenure === o.v}
                  onClick={() => {
                    set("tenure", o.v);
                    next();
                  }}
                  className={`${pillClass(inp.tenure === o.v)} text-left !rounded-xl !py-3`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend className="text-lg font-extrabold text-ink mb-3">Budget for the hookup: parts, electrician and permit</legend>
            <div className="grid gap-2">
              {BUDGETS.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  data-answer={`budget-${o.v}`}
                  aria-pressed={inp.budget === o.v}
                  onClick={() => {
                    set("budget", o.v);
                    next();
                  }}
                  className={`${pillClass(inp.budget === o.v)} text-left !rounded-xl !py-3`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 4 && (
          <fieldset>
            <legend className="text-lg font-extrabold text-ink mb-2">Are you OK hiring a licensed electrician?</legend>
            <p className="text-sm text-stone-600 mb-3">
              Anything connected to your electrical panel is a job for a licensed electrician, usually with a permit.
              {hasWiredIn ? " A wired-in well pump or furnace can only be powered that way." : ""}
            </p>
            <div className="grid gap-2">
              {[
                { v: true, label: "Yes, I'll hire one" },
                { v: false, label: "No, keep it plug-in only" },
              ].map((o) => (
                <button
                  key={String(o.v)}
                  type="button"
                  data-answer={`electrician-${o.v ? "yes" : "no"}`}
                  aria-pressed={inp.electrician === o.v}
                  onClick={() => {
                    set("electrician", o.v);
                    next();
                  }}
                  className={`${pillClass(inp.electrician === o.v)} text-left !rounded-xl !py-3`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === last && (
          <div data-testid="hookup-picker-result">
            <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">How to connect it</p>
            <p className="text-xl sm:text-2xl font-extrabold text-ink mt-1" data-testid="hookup-method">
              {METHOD_LABEL[res.method]}
            </p>
            <p className="text-sm text-stone-700 mt-2">{METHOD_WHY[res.method]}</p>
            {res.electrician && (
              <p className="text-sm font-semibold text-ink mt-2" data-testid="hookup-electrician">
                A licensed electrician installs this, with a permit. Never wire it yourself.
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Stat label="Battery size" value={fmtWh(res.needWh)} note={`${inp.days} day${inp.days > 1 ? "s" : ""} of ${fmtWh(res.dailyWh)}`} />
              <Stat label="Running at once" value={fmtW(res.runningW)} note="if all on together" />
              <Stat label="Peak to start a motor" value={fmtW(res.peakW)} note="running + biggest start" />
            </div>
            {res.notCovered.length > 0 && (
              <p className="text-sm text-stone-700 mt-3">
                Sized without: {res.notCovered.join(" and ")}. See the note below.
              </p>
            )}

            <h3 className="font-extrabold text-ink mt-6">Models that fit</h3>
            {res.matches.length === 0 ? (
              <p className="mt-2 rounded-2xl border border-black/10 bg-surface-light p-4 text-sm text-stone-800" data-testid="hookup-nomatch">
                None of the in-stock models from the brands we partner with fits these answers. Look for a 120/240 V power station with at least{" "}
                {fmtWh(res.needWh)} and {fmtW(res.peakW)} of surge, or see{" "}
                <Link href="/best-portable-power-stations" className="underline underline-offset-2 text-spark-orange">
                  every model we track
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-3 grid gap-3" data-testid="hookup-products">
                {res.matches.map((m, i) => (
                  <MatchCard key={m.c.key} m={m} first={i === 0} method={res.method} />
                ))}
              </ul>
            )}

            <h3 className="font-extrabold text-ink mt-6">Parts and rough costs</h3>
            <table className="mt-2 w-full text-sm" data-testid="hookup-parts">
              <tbody>
                {res.parts.map((p) => (
                  <tr key={p.id} className="border-t border-black/8 align-top">
                    <td className="py-2 pr-3 text-stone-800">
                      {p.label}
                      {p.note && <span className="block text-xs text-muted">{p.note}</span>}
                    </td>
                    <td className="py-2 text-right tabular-nums whitespace-nowrap">{range(p.usd)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-black/15 font-bold">
                  <td className="py-2 pr-3">Hookup total, before the battery</td>
                  <td className="py-2 text-right tabular-nums whitespace-nowrap">{range(res.partsUsd)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-muted mt-1">
              Ranges from{" "}
              {[...new Set(res.parts.map((p) => p.source))]
                .map((s) => `${s.name}${s.published ? ` (its figures dated ${shortDate(s.published)})` : ""}`)
                .join(" and ")}
              , checked {shortDate(res.parts[0].source.retrieved)}. Prices have likely risen since; your electrician&apos;s quote is the real number.
            </p>

            {res.notes.length > 0 && (
              <ul className="mt-5 space-y-1.5 text-sm text-stone-700 list-disc pl-5" data-testid="hookup-notes">
                {res.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}

            {res.alternatives.length > 0 && (
              <p className="text-sm text-stone-700 mt-4">
                <strong>Also works:</strong> {res.alternatives.map((m) => METHOD_LABEL[m].toLowerCase()).join("; ")}.{" "}
                <Link href="/home-backup" className="underline underline-offset-2 text-spark-orange">
                  Compare all four ways
                </Link>
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                finished.current = false;
                go(0);
              }}
              className="mt-5 text-sm font-semibold underline underline-offset-2 text-muted hover:text-spark-orange"
            >
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-black/8 bg-surface-light p-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="text-xl font-extrabold text-ink tabular-nums">{value}</p>
      <p className="text-xs text-muted">{note}</p>
    </div>
  );
}

function MatchCard({ m, first, method }: { m: Match; first: boolean; method: Method }) {
  const { c } = m;
  return (
    <li className={`rounded-2xl border p-4 ${first ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50" : "border-black/10"}`}>
      <p className="font-extrabold text-ink">
        {c.name}
      </p>
      <p className="text-sm text-stone-700 mt-1">
        {fmtWh(m.totalWh)}
        {m.addOns > 0 && c.addOn ? ` with ${m.addOns} ${c.addOn.model}` : ""}, {fmtW(c.acOutputW)} output
        {c.has240 ? ", 120/240 V" : ", 120 V"}
        {method !== "cords" && c.outlet ? `, connects through its ${c.outlet} outlet` : ""}. Runs your list {runFor(m.hours)}.
      </p>
      {c.hub && (
        <p className="text-sm text-stone-700 mt-1">
          240 V comes from two units joined by the{" "}
          <PartnerLink brand={c.brand} productUrl={c.hub.url}>
            {c.hub.name}
          </PartnerLink>
          , the maker&apos;s own way to do it.
        </p>
      )}
      {method === "panel" && c.smartPanel && (
        <p className="text-sm text-stone-700 mt-1">
          Panel kit:{" "}
          <PartnerLink brand={c.brand} productUrl={c.smartPanel.url}>
            {c.smartPanel.name}
          </PartnerLink>
          . {c.smartPanel.note}
        </p>
      )}
      {(!m.reachesNeed || !m.startOk) && (
        <p className="text-sm text-amber-900 mt-1">
          {[!m.reachesNeed && (c.addOn ? "Short of the size you need, even with every add-on battery" : "Short of the size you need; no add-on battery is in stock for this setup"), !m.startOk && "Start not confirmed by the maker's specs"]
            .filter(Boolean)
            .join(". ")}
          .
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span onClick={() => track("hookup_picker_product_click", { product: c.key, method })}>
          <PartnerLink brand={c.brand} productId={c.productId} productUrl={c.url} variant="button">
            See today&apos;s price at {AFFILIATES[c.brand].name}
          </PartnerLink>
        </span>
        <span className="text-xs text-muted" data-testid="product-disclosure">
          We earn a commission if you buy through this link.
        </span>
      </div>
    </li>
  );
}

