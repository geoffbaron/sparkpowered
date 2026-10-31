"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PartnerLink } from "@/components/affiliate";
import { pillClass } from "@/components/guide-ui";
import { brandName } from "@/data/chargers";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import { NATIONAL_CHOICE } from "@/lib/visitor-state";
import {
  DEFAULT_INPUT,
  MILES_CHOICES,
  OVERNIGHT_HOURS,
  pick,
  type CarAnswer,
  type MountAnswer,
  type PickerData,
  type PickerInput,
  type PlugAnswer,
  type PowerAnswer,
} from "@/lib/ev-charger-picker";

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

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 ? 2 : 0, minimumFractionDigits: n % 1 ? 2 : 0 });
const shortDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const hrs = (h: number) => (h < 1 ? "under an hour" : `about ${Math.round(h * 2) / 2} hour${Math.round(h * 2) / 2 === 1 ? "" : "s"}`);

const PLUGS: { v: PlugAnswer; label: string }[] = [
  { v: "tesla", label: "A Tesla" },
  { v: "nacs", label: "Another EV with a Tesla-style (NACS) port" },
  { v: "j1772", label: "An EV or plug-in hybrid with a round J1772 / CCS1 port" },
  { v: "unsure", label: "Not sure" },
];
const POWER: { v: PowerAnswer; label: string; hint: string }[] = [
  { v: "outlet1450", label: "A NEMA 14-50 outlet (RV / range type) where I park", hint: "Four holes, 50-amp breaker" },
  { v: "dryer", label: "Only a dryer outlet nearby", hint: "Usually a 30-amp breaker" },
  { v: "new50", label: "Nothing yet, but the panel has room for a new 50-amp circuit", hint: "Most homes" },
  { v: "big", label: "Room for a 60-amp or bigger circuit", hint: "Newer 200-amp panels often do" },
  { v: "tight", label: "The panel is nearly full or old (100-amp)", hint: "We'll size around it" },
  { v: "unsure", label: "Not sure", hint: "We'll assume a new 50-amp circuit" },
];
const MOUNT: { v: MountAnswer; label: string }[] = [
  { v: "either", label: "No preference" },
  { v: "plugin", label: "Plug-in (unplug and take it with me)" },
  { v: "hardwired", label: "Hardwired to the wall" },
  { v: "move", label: "I rent or move a lot: portable" },
];

const STEPS = ["Your car's plug", "How far you drive", "Power where you park", "How it's mounted", "Cheaper overnight rates?", "Your charger"];

export default function EvChargerPicker({ data }: { data: PickerData }) {
  const [step, setStep] = useState(0);
  const [inp, setInp] = useState<PickerInput>(DEFAULT_INPUT);
  const started = useRef(false);
  const finished = useRef(false);
  const top = useRef<HTMLDivElement>(null);

  const valid = useMemo(() => data.states.map((s) => s.abbr), [data.states]);
  const located = useVisitorState(valid, true);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const state = picked ?? located.abbr ?? "";

  const res = useMemo(() => pick({ ...inp, state }, data), [inp, state, data]);
  const last = STEPS.length - 1;

  const set = <K extends keyof PickerInput>(k: K, v: PickerInput[K]) => {
    setInp((p) => ({ ...p, [k]: v }));
    if (!started.current) {
      started.current = true;
      track("ev_picker_start");
    }
  };
  const go = (n: number) => {
    setStep(n);
    top.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  const next = () => go(Math.min(step + 1, last));

  useEffect(() => {
    if (step === last && !finished.current) {
      finished.current = true;
      track("ev_picker_finish", { plug: res.connector, amps: res.amps, connection: res.connection, power: inp.power, products: res.products.length });
    }
  }, [step, last, res, inp.power]);

  const ev = data.evs[inp.car];
  const stateName = data.states.find((s) => s.abbr === state)?.name;

  return (
    <div ref={top} className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden scroll-mt-24" data-testid="ev-picker">
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
          <fieldset>
            <legend className="text-lg font-extrabold text-ink mb-3">What plug does your car take?</legend>
            <div className="grid gap-2">
              {PLUGS.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  data-answer={`plug-${o.v}`}
                  aria-pressed={inp.plug === o.v}
                  onClick={() => {
                    set("plug", o.v);
                    next();
                  }}
                  className={`${pillClass(inp.plug === o.v)} text-left !rounded-xl !py-3`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-stone-600 mt-3">
              Not sure? Look at the charge port or the manual. Most automakers committed to the Tesla-style NACS port on new cars from 2025,
              so check your car rather than going by the brand.
            </p>
          </fieldset>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <fieldset>
              <legend className="text-lg font-extrabold text-ink mb-3">Miles on a typical day</legend>
              <div className="flex flex-wrap gap-2">
                {MILES_CHOICES.map((m) => (
                  <button key={m} type="button" data-answer={`miles-${m}`} aria-pressed={inp.dailyMiles === m} onClick={() => set("dailyMiles", m)} className={pillClass(inp.dailyMiles === m)}>
                    {m === 150 ? "150+" : m}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-bold text-ink mb-2">Closest to your car</legend>
              <div className="grid gap-2">
                {(Object.keys(data.evs) as CarAnswer[]).map((k) => (
                  <button key={k} type="button" data-answer={`car-${k}`} aria-pressed={inp.car === k} onClick={() => set("car", k)} className={`${pillClass(inp.car === k)} text-left !rounded-xl`}>
                    {k === "efficient" ? "Efficient sedan" : k === "typical" ? "Compact SUV" : "Full-size pickup"}{" "}
                    <span className="font-normal opacity-80">
                      (like a {data.evs[k].make} {data.evs[k].model}, {data.evs[k].kwhPer100mi} kWh/100 mi)
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="text-sm text-stone-700 rounded-xl bg-surface-light px-4 py-3" data-testid="need-line">
              That&apos;s about <strong>{Math.round(res.kwhPerDay)} kWh a day</strong>. A 40-amp charger puts it back in{" "}
              <strong>{hrs(res.hours.byAmps[40])}</strong>; an ordinary wall outlet takes {hrs(res.hours.level1)}.
              {res.level1Enough ? " An ordinary outlet could keep up overnight; Level 2 just makes it effortless." : ""}
            </p>
            <button type="button" onClick={next} className="btn btn-primary">Next</button>
          </div>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="text-lg font-extrabold text-ink mb-3">What power is there where you park?</legend>
            <div className="grid gap-2">
              {POWER.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  data-answer={`power-${o.v}`}
                  aria-pressed={inp.power === o.v}
                  onClick={() => {
                    set("power", o.v);
                    next();
                  }}
                  className={`${pillClass(inp.power === o.v)} text-left !rounded-xl !py-3`}
                >
                  {o.label} <span className="block text-xs font-normal opacity-80">{o.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <fieldset>
              <legend className="text-lg font-extrabold text-ink mb-3">Plug-in or hardwired?</legend>
              <div className="grid gap-2">
                {MOUNT.map((o) => (
                  <button key={o.v} type="button" data-answer={`mount-${o.v}`} aria-pressed={inp.mount === o.v} onClick={() => set("mount", o.v)} className={`${pillClass(inp.mount === o.v)} text-left !rounded-xl`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-bold text-ink mb-2">Where do you park?</legend>
              <div className="flex flex-wrap gap-2">
                <button type="button" data-answer="spot-garage" aria-pressed={inp.spot === "garage"} onClick={() => set("spot", "garage")} className={pillClass(inp.spot === "garage")}>Garage</button>
                <button type="button" data-answer="spot-outside" aria-pressed={inp.spot === "outside"} onClick={() => set("spot", "outside")} className={pillClass(inp.spot === "outside")}>Driveway or outside</button>
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-bold text-ink mb-2">Distance from the wall to your car&apos;s charge port</legend>
              <div className="flex flex-wrap gap-2">
                <button type="button" data-answer="reach-short" aria-pressed={inp.reach === "short"} onClick={() => set("reach", "short")} className={pillClass(inp.reach === "short")}>Under 20 feet</button>
                <button type="button" data-answer="reach-long" aria-pressed={inp.reach === "long"} onClick={() => set("reach", "long")} className={pillClass(inp.reach === "long")}>Farther</button>
              </div>
            </fieldset>
            <button type="button" onClick={next} className="btn btn-primary">Next</button>
          </div>
        )}

        {step === 4 && (
          <fieldset>
            <legend className="text-lg font-extrabold text-ink mb-2">Does your utility sell cheaper power overnight?</legend>
            <p className="text-sm text-stone-600 mb-3">
              Many offer a time-of-use or EV plan. A charger with an app can wait for the cheap hours.{" "}
              <Link href="/ev-charging-cost" className="underline underline-offset-2 text-spark-orange">What off-peak saves</Link>
            </p>
            <div className="grid gap-2">
              {[
                { v: true, label: "Yes, or I want app scheduling" },
                { v: false, label: "No, or I don't know" },
              ].map((o) => (
                <button
                  key={String(o.v)}
                  type="button"
                  data-answer={`smart-${o.v ? "yes" : "no"}`}
                  aria-pressed={inp.smart === o.v}
                  onClick={() => {
                    set("smart", o.v);
                    next();
                  }}
                  className={`${pillClass(inp.smart === o.v)} text-left !rounded-xl !py-3`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === last && (
          <div data-testid="ev-picker-result">
            <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">What to buy</p>
            <p className="text-xl sm:text-2xl font-extrabold text-ink mt-1" data-testid="ev-picker-spec">{res.spec}</p>
            <p className="text-sm text-stone-700 mt-2">
              At {res.amps} amps a car like the {ev.make} {ev.model} gets about {Math.round(res.milesPerHour)} miles of range an hour, so your{" "}
              {inp.dailyMiles === 150 ? "150+" : inp.dailyMiles} miles go back in {hrs(res.hours.byAmps[res.amps])}
              {res.hours.byAmps[res.amps] <= OVERNIGHT_HOURS ? ", well inside one night" : ""}. Your car&apos;s own charger can limit the speed.
            </p>

            {res.products.length > 0 && (
              <ul className="mt-5 grid gap-3" data-testid="ev-picker-products">
                {res.products.map(({ charger: c, why, setTo }, i) => (
                  <li key={c.id} className={`rounded-2xl border p-4 ${i === 0 ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50" : "border-black/10"}`}>
                    <p className="font-extrabold text-ink">
                      {brandName(c)} {c.name}{" "}
                      <span className="text-sm font-semibold text-muted whitespace-nowrap">{money(c.priceUsd)} on {brandName(c)}&apos;s site, {shortDate(c.retrieved)}</span>
                    </p>
                    <p className="text-sm text-stone-700 mt-1">{why}</p>
                    {setTo && <p className="text-sm text-stone-700 mt-1">Have the electrician set it to {setTo} amps.</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span onClick={() => track("ev_picker_product_click", { product: c.id })}>
                        <PartnerLink brand={c.brand} productId={c.id} productUrl={c.url} className={i === 0 ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}>
                          Check price at {brandName(c)}
                        </PartnerLink>
                      </span>
                      <span className="text-xs text-muted" data-testid="product-disclosure">We earn a commission if you buy through this link.</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {res.noMatch && (
              <p className="mt-5 rounded-2xl border border-black/10 bg-surface-light p-4 text-sm text-stone-800" data-testid="ev-picker-nomatch">
                <strong>What to look for:</strong> {res.noMatch}
              </p>
            )}

            {res.notes.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm text-stone-700 list-disc pl-5">
                {res.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}

            <div className="mt-6 rounded-2xl border border-black/10 p-4">
              <label className="block">
                <span className="font-bold text-ink">Next: what installing it costs in</span>
                <select
                  value={state}
                  onChange={(e) => {
                    setPicked(e.target.value);
                    choose(e.target.value || NATIONAL_CHOICE);
                  }}
                  className="mt-2 block w-full rounded-lg border border-black/20 px-3 py-2 bg-white"
                >
                  <option value="">US average</option>
                  {data.states.map((s) => (
                    <option key={s.abbr} value={s.abbr}>{s.name}</option>
                  ))}
                </select>
              </label>
              <p className="text-2xl font-extrabold text-ink mt-3 tabular-nums" data-testid="ev-picker-install">
                {res.install.zero ? "$0" : res.install.low === res.install.high ? `About ${money(res.install.low)}` : `${money(res.install.low)} to ${money(res.install.high)}`}
              </p>
              <p className="text-sm text-stone-700 mt-1">
                {res.install.zero
                  ? "You already have the outlet, so the charger plugs straight in. Pay an electrician to check it."
                  : `${stateName ? `${stateName} average` : "US average"} for a home charger installation, labor and materials, before the charger (Qmerit 2026 data via EnergySage).`}
              </p>
              {res.install.extras.length > 0 && (
                <ul className="mt-2 text-sm text-stone-700 list-disc pl-5 space-y-1">
                  {res.install.extras.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
              <p className="text-sm font-semibold text-ink mt-3">Use a licensed electrician; permits are often required.</p>
              <p className="text-sm text-stone-700 mt-1">
                The federal charger credit (30C) is not allowed for property placed in service after June 30, 2026. Utilities and states still
                run their own charger rebates: <Link href="/incentives" className="underline underline-offset-2 text-spark-orange">check incentives</Link>.{" "}
                <Link href="/ev-charger-installation-cost" className="underline underline-offset-2 text-spark-orange">Full installation estimate</Link>
              </p>
            </div>

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
