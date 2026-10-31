"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/icons";
import LocalNote from "@/components/LocalNote";
import { useChooseState, useVisitorState } from "@/hooks/useVisitorState";
import { PartnerLink, PARTNER_REL } from "@/components/affiliate";
import { ASSUMPTIONS, GAS_CARS, MMBTU_PER_MCF, homeFigures, plan, type Costs, type PlannerInputs, type PlannerState, type SwitchId, type SwitchResult } from "@/lib/go-electric";
import type { BrandId } from "@/data/affiliates";
import type { MythLite } from "@/data/myths";

export interface PlannerProduct {
  id: string;
  brand: BrandId;
  name: string;
  url: string;
  priceUsd: number;
  /** Plain-life line, e.g. "Keeps a fridge, Wi-Fi and lights on for about 14 hours". */
  life: string;
}

interface Props {
  states: PlannerState[];
  costs: Costs;
  outagePick: PlannerProduct;
  pluginPick: PlannerProduct;
  chargerPick: PlannerProduct;
  smartChargerPick: PlannerProduct;
  solarQuotes: { href: string; tracked: boolean };
  myths: Partial<Record<SwitchId | "battery", MythLite>>;
  sources: { label: string; url: string }[];
}

const META: Record<SwitchId, { title: string; icon: string; tool?: { href: string; label: string } }> = {
  ev: { title: "Drive electric", icon: "car", tool: { href: "/ev-charging-cost", label: "See your charging cost" } },
  solar: { title: "Rooftop solar", icon: "sun", tool: { href: "/solar-calculator", label: "Size your solar" } },
  plugin: { title: "Plug-in solar", icon: "plug", tool: { href: "/plug-in-solar", label: "Is it legal in your state?" } },
  heatpump: { title: "Heat pump for heating and cooling", icon: "heat", tool: { href: "/myths#heat-pumps-cold", label: "Do they work in the cold?" } },
  hpwh: { title: "Heat pump water heater", icon: "water" },
  induction: { title: "Induction cooking", icon: "pot", tool: { href: "/myths#induction-pans", label: "Do I need new pans?" } },
  ebike: { title: "E-bike for short trips", icon: "bike" },
};

const ENERGY_STAR: Partial<Record<SwitchId, string>> = {
  heatpump: "https://www.energystar.gov/productfinder/product/certified-heat-pumps/results",
  hpwh: "https://www.energystar.gov/productfinder/product/certified-heat-pump-water-heaters/results",
  induction: "https://www.energystar.gov/productfinder/product/certified-residential-induction-cooking-tops/results",
};

const money = (n: number) => `$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
const round10 = (n: number) => Math.round(n / 10) * 10;

function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400";

/** Reads ?state=XX so the home page picker and state pages can deep-link in. */
export function GoElectricPlannerFromParams(props: Props) {
  const q = useSearchParams().get("state")?.toUpperCase();
  const fromUrl = !!q && props.states.some((s) => s.abbr === q);
  const initial = fromUrl ? q : "OH";
  return <GoElectricPlanner key={initial} {...props} initialState={initial} fromUrl={fromUrl} autoLocate={!fromUrl} />;
}

export default function GoElectricPlanner({ states, costs, outagePick, pluginPick, chargerPick, smartChargerPick, solarQuotes, myths, sources, initialState = "OH", fromUrl = false, autoLocate = false }: Props & { initialState?: string; fromUrl?: boolean; autoLocate?: boolean }) {
  const valid = useMemo(() => states.map((s) => s.abbr), [states]);
  const located = useVisitorState(valid, autoLocate);
  const choose = useChooseState();
  const [picked, setPicked] = useState<string | null>(null);
  const abbr = picked ?? located.abbr ?? initialState;
  const st = states.find((s) => s.abbr === abbr) ?? states[0];
  const [inputs, setInputs] = useState<PlannerInputs>({
    car: "average",
    milesPerWeek: 230,
    monthlyBillUsd: st.avgMonthlyBillUsd,
    heat: "gas",
    water: "gas",
    stove: "gas",
    home: "own",
  });
  const [billTouched, setBillTouched] = useState(false);

  const set = <K extends keyof PlannerInputs>(k: K, v: PlannerInputs[K]) => setInputs((x) => ({ ...x, [k]: v }));
  const onState = (a: string) => {
    setPicked(a);
    choose(a);
    const url = new URL(window.location.href);
    url.searchParams.set("state", a);
    window.history.replaceState(null, "", url);
  };

  // Until the visitor types a bill, use the typical bill for whichever state is showing.
  const bill = billTouched ? inputs.monthlyBillUsd : st.avgMonthlyBillUsd;
  const safeInputs = { ...inputs, monthlyBillUsd: Math.max(10, bill || st.avgMonthlyBillUsd), milesPerWeek: Math.max(0, inputs.milesPerWeek || 0) };
  const result = plan(st, safeInputs, costs);

  // Monthly spend on energy today vs after, for the before/after bars.
  const h = homeFigures(st.abbr);
  const car = GAS_CARS.find((c) => c.key === inputs.car);
  const gasolineMonth = car ? ((safeInputs.milesPerWeek * 52) / car.mpg) * st.gasolineUsd / 12 : 0;
  const gasPerMmbtu = h.gasUsdPerMcf / MMBTU_PER_MCF;
  const gasMonth =
    ((inputs.heat === "gas" ? h.gasSpaceHeatMmbtu : 0) + (inputs.water === "gas" ? h.gasWaterHeatMmbtu : 0) + (inputs.stove === "gas" ? h.gasCookingMmbtu : 0)) *
    gasPerMmbtu /
    12;
  const before = safeInputs.monthlyBillUsd + gasMonth + gasolineMonth;
  const after = Math.max(0, before - result.total / 12);
  const total = round10(result.total);

  const skipped = result.all.filter((x) => x.skip);
  const ranked = result.ranked;

  return (
    <div className="grid lg:grid-cols-[22rem_1fr] gap-8 items-start">
      {/* Inputs */}
      <form
        className="lg:sticky lg:top-24 bg-white rounded-3xl border border-black/10 shadow-sm p-5 sm:p-6 space-y-4"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Your home"
      >
        <h2 className="text-lg font-extrabold text-ink">Tell us about your home</h2>
        <p className="text-sm text-muted -mt-2">Everything is optional. We start with your state&apos;s typical home.</p>
        <Field label="Your state" htmlFor="ge-state">
          <select id="ge-state" className={inputCls} value={abbr} onChange={(e) => onState(e.target.value)}>
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.name}
              </option>
            ))}
          </select>
          <LocalNote name={st.name} local={fromUrl || picked !== null || located.abbr !== null} selectId="ge-state" />
        </Field>
        <fieldset>
          <legend className="block text-sm font-semibold text-ink mb-1.5">Your home</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["own", "rent"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={inputs.home === v}
                onClick={() => set("home", v)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${inputs.home === v ? "bg-ink text-white border-ink" : "bg-white border-black/15 text-foreground"}`}
              >
                {v === "own" ? "I own" : "I rent"}
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Monthly electric bill" htmlFor="ge-bill" hint={`Typical in ${st.name}: ${money(st.avgMonthlyBillUsd)}`}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
            <input
              id="ge-bill"
              type="number"
              inputMode="numeric"
              min={10}
              max={2000}
              className={`${inputCls} pl-7`}
              value={bill || ""}
              onChange={(e) => {
                setBillTouched(true);
                set("monthlyBillUsd", Number(e.target.value));
              }}
            />
          </div>
        </Field>
        <Field label="What do you drive?" htmlFor="ge-car">
          <select id="ge-car" className={inputCls} value={inputs.car} onChange={(e) => set("car", e.target.value as PlannerInputs["car"])}>
            {GAS_CARS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
            <option value="none">I don&apos;t drive</option>
          </select>
        </Field>
        {inputs.car !== "none" && (
          <Field label="Miles a week" htmlFor="ge-miles" hint="230 a week is about 12,000 a year.">
            <input
              id="ge-miles"
              type="number"
              inputMode="numeric"
              min={0}
              max={3000}
              className={inputCls}
              value={inputs.milesPerWeek || ""}
              onChange={(e) => set("milesPerWeek", Number(e.target.value))}
            />
          </Field>
        )}
        <Field label="How do you heat your home?" htmlFor="ge-heat">
          <select id="ge-heat" className={inputCls} value={inputs.heat} onChange={(e) => set("heat", e.target.value as PlannerInputs["heat"])}>
            <option value="gas">Gas furnace or boiler</option>
            <option value="electric">Electric baseboard or electric furnace</option>
            <option value="heatpump">Already a heat pump</option>
            <option value="other">Propane, oil or not sure</option>
          </select>
        </Field>
        <Field label="Water heater" htmlFor="ge-water">
          <select id="ge-water" className={inputCls} value={inputs.water} onChange={(e) => set("water", e.target.value as PlannerInputs["water"])}>
            <option value="gas">Gas</option>
            <option value="electric">Electric</option>
            <option value="heatpump">Already a heat pump water heater</option>
            <option value="other">Propane, oil or not sure</option>
          </select>
        </Field>
        <Field label="Stove" htmlFor="ge-stove">
          <select id="ge-stove" className={inputCls} value={inputs.stove} onChange={(e) => set("stove", e.target.value as PlannerInputs["stove"])}>
            <option value="gas">Gas</option>
            <option value="electric">Electric</option>
          </select>
        </Field>
      </form>

      {/* Results */}
      <div aria-live="polite" className="space-y-6 min-w-0">
        <section className="rounded-3xl bg-ink text-white p-6 sm:p-8 overflow-hidden relative" aria-labelledby="ge-total">
          <p className="text-amber-300 font-semibold text-sm uppercase tracking-wide">Your electric life in {st.name}</p>
          <h2 id="ge-total" className="text-3xl sm:text-5xl font-extrabold mt-2 leading-tight">
            Save about <span className="text-amber-300">{money(total)}</span> a year
          </h2>
          <p className="text-lg text-white/85 mt-2">That&apos;s about {money(total / 12)} a month back in your pocket.</p>
          <div className="mt-6 space-y-3" role="img" aria-label={`Monthly energy spending: about ${money(before)} today, about ${money(after)} after switching.`}>
            {[
              { label: "Today: bills + gas + gasoline", v: before, cls: "bg-white/30" },
              { label: "Electric life", v: after, cls: "bg-amber-400" },
            ].map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-sm text-white/85 mb-1">
                  <span>{b.label}</span>
                  <span className="font-bold text-white tabular-nums">{money(b.v)}/mo</span>
                </div>
                <div className="h-4 rounded-full bg-white/10">
                  <div className={`h-4 rounded-full ${b.cls}`} style={{ width: `${Math.max(4, (b.v / Math.max(before, 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/70 mt-4">
            Adds up the switches with a saving below{result.counted.includes("solar") ? "; solar assumes your utility credits every kWh it makes" : ""}. E-bike savings are shown but not added in.
          </p>
        </section>

        <section aria-labelledby="ge-start">
          <h2 id="ge-start" className="text-2xl font-extrabold text-ink mb-1">Where to start</h2>
          <p className="text-muted mb-4">Biggest yearly savings first.</p>
          <ol className="space-y-4">
            {ranked.map((r, i) => (
              <SwitchCard key={r.id} r={r} rank={i + 1} myth={myths[r.id]} pluginPick={pluginPick} chargerPick={chargerPick} smartChargerPick={smartChargerPick} solarQuotes={solarQuotes} />
            ))}
          </ol>
        </section>

        <section className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-5 sm:p-6" aria-labelledby="ge-backup">
          <div className="flex items-start gap-3">
            <span className="shrink-0 rounded-2xl bg-amber-400 text-ink p-2.5">
              <Icon name="battery" />
            </span>
            <div>
              <h2 id="ge-backup" className="text-xl font-extrabold text-ink">Never sit in the dark again</h2>
              <p className="text-stone-700 mt-1">
                Backup power doesn&apos;t lower your bill, it keeps life going when the grid goes down. Our pick for outage
                backup, the {outagePick.name}, {outagePick.life.charAt(0).toLowerCase() + outagePick.life.slice(1)}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <PartnerLink brand={outagePick.brand} productId={outagePick.id} productUrl={outagePick.url} category="battery" className="btn btn-primary btn-sm">
                  Check price ({money(outagePick.priceUsd)} when we checked)
                </PartnerLink>
                <Link href="/battery-calculator" className="font-semibold text-spark-orange underline underline-offset-2">
                  Find the right battery for you
                </Link>
              </div>
              {myths.battery && <MythLine m={myths.battery} />}
            </div>
          </div>
        </section>

        {skipped.length > 0 && (
          <section aria-labelledby="ge-skip" className="text-sm text-muted">
            <h2 id="ge-skip" className="font-semibold text-foreground">Not counted for your home</h2>
            <ul className="mt-1 space-y-1">
              {skipped.map((s) => (
                <li key={s.id}>
                  <strong className="text-foreground">{META[s.id].title}:</strong> {s.skip}
                </li>
              ))}
            </ul>
          </section>
        )}

        <details className="rounded-2xl border border-black/10 bg-white p-5 group">
          <summary className="cursor-pointer font-bold text-ink list-none flex justify-between items-center">
            How we calculated this
            <span aria-hidden="true" className="text-spark-orange text-xl group-open:rotate-45 transition-transform">+</span>
          </summary>
          <div className="mt-4 text-sm text-stone-700 space-y-3 leading-relaxed">
            <p>
              Prices are {st.name}&apos;s averages: electricity {st.centsPerKwh.toFixed(1)}¢ per kWh (EIA, this year so far),
              gasoline {`$${st.gasolineUsd.toFixed(2)}`} a gallon (EIA weekly), natural gas {`$${h.gasUsdPerMcf.toFixed(2)}`} per
              thousand cubic feet (EIA). How much gas a home uses for heat, hot water and cooking is the {st.name} average from
              EIA&apos;s Residential Energy Consumption Survey. We compare the same heat, hot water and cooking delivered by
              each appliance, so only efficiency and price change.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Car: {car ? car.note : "not included"}; EV is the matching EPA-rated model. Charging at home at the average price. {ASSUMPTIONS.maintenance.text}.</li>
              <li>{ASSUMPTIONS.heatPumpCop.text} {ASSUMPTIONS.furnaceAfue.text}.</li>
              <li>
                {ASSUMPTIONS.heatPumpWaterHeaterUef.text}; {ASSUMPTIONS.gasWaterHeaterUef.text.toLowerCase()}; {ASSUMPTIONS.electricWaterHeaterUef.text.toLowerCase()}.
              </li>
              <li>{ASSUMPTIONS.gasCooktopEfficiency.text}.</li>
              <li>
                Rooftop solar: sized to cover your bill using the PVWatts model for {st.name}, at {`$${costs.rooftopPerWatt.toFixed(2)}`} per
                watt installed (EnergySage national average, before incentives). Savings assume your utility credits every kWh at
                full price (net metering); where it pays less for power you send back, savings are lower.
              </li>
              <li>
                Plug-in solar: an 800 W kit at {money(costs.pluginKitUsd)} on a south-facing stand, valued at your electricity price,
                assuming you use what it makes as it makes it.
              </li>
              <li>E-bike: gasoline for a 10-mile round trip in your car. Electricity to charge an e-bike is pennies and not subtracted.</li>
              <li>Upfront costs and incentives vary a lot, so we show a price only where we have a sourced national figure.</li>
            </ul>
            <p className="font-semibold text-foreground">Sources</p>
            <ul className="space-y-1">
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener" className="underline underline-offset-2 hover:text-spark-orange">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}

function MythLine({ m }: { m: MythLite }) {
  return (
    <p className="mt-3 text-sm rounded-xl bg-white/70 border border-black/8 px-3 py-2">
      <span className="font-semibold text-ink">&ldquo;{m.myth}&rdquo;</span> {m.short}{" "}
      <Link href={`/myths#${m.id}`} className="text-spark-orange font-semibold underline underline-offset-2 whitespace-nowrap">
        The facts
      </Link>
    </p>
  );
}

function SwitchCard({
  r,
  rank,
  myth,
  pluginPick,
  chargerPick,
  smartChargerPick,
  solarQuotes,
}: {
  r: SwitchResult;
  rank: number;
  myth?: MythLite;
  pluginPick: PlannerProduct;
  chargerPick: PlannerProduct;
  smartChargerPick: PlannerProduct;
  solarQuotes: { href: string; tracked: boolean };
}) {
  const m = META[r.id];
  const y = r.yearly ?? 0;
  const positive = y > 20;
  return (
    <li className="rounded-3xl bg-white border border-black/10 shadow-sm p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="shrink-0 rounded-2xl bg-amber-100 text-spark-orange p-2.5 relative">
          <Icon name={m.icon} />
          <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center">{rank}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-lg font-extrabold text-ink">{m.title}</h3>
            <p className={`text-xl font-extrabold tabular-nums ${positive ? "text-leaf" : "text-stone-600"}`}>
              {positive ? `${money(y)}/yr` : y < -20 ? `costs ${money(y)}/yr more` : "about even"}
            </p>
          </div>
          <p className="text-stone-800 mt-1 font-medium">{r.headline}</p>
          <ul className="mt-2 text-sm text-stone-600 space-y-0.5">
            {r.proof.map((p) => (
              <li key={p}>{p}</li>
            ))}
            {r.upfront != null && r.paybackYears != null && (
              <li>
                Upfront about {money(r.upfront)}; pays for itself in about {Math.max(1, Math.round(r.paybackYears))} years.
              </li>
            )}
          </ul>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {r.id === "plugin" && (
              <PartnerLink brand={pluginPick.brand} productId={pluginPick.id} productUrl={pluginPick.url} category="solar" className="btn btn-primary btn-sm">
                See the 800 W kit ({money(pluginPick.priceUsd)})
              </PartnerLink>
            )}
            {r.id === "solar" && (
              <a href={solarQuotes.href} target="_blank" rel={PARTNER_REL} data-partner="energysage" data-tracked={solarQuotes.tracked ? "1" : "0"} className="btn btn-primary btn-sm">
                Get solar quotes<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {r.id === "ev" && (
              <>
                <Link href="/calculator" className="btn btn-primary btn-sm">
                  Find an EV that fits
                </Link>
                <PartnerLink brand={chargerPick.brand} productId={chargerPick.id} productUrl={chargerPick.url} className="btn btn-outline btn-sm">
                  Home charger, {money(chargerPick.priceUsd)} (sponsored)
                </PartnerLink>
                <PartnerLink brand={smartChargerPick.brand} productId={smartChargerPick.id} productUrl={smartChargerPick.url} className="btn btn-outline btn-sm">
                  Smart charger for off-peak rates, {money(smartChargerPick.priceUsd)} (sponsored)
                </PartnerLink>
                <Link href="/ev-charger-picker" className="font-semibold text-spark-orange underline underline-offset-2">
                  Which charger do I need?
                </Link>
              </>
            )}
            {ENERGY_STAR[r.id] && (
              <a href={ENERGY_STAR[r.id]} rel="noopener" target="_blank" className="btn btn-outline btn-sm">
                ENERGY STAR models<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {m.tool && (
              <Link href={m.tool.href} className="font-semibold text-spark-orange underline underline-offset-2">
                {m.tool.label}
              </Link>
            )}
          </div>
          {myth && <MythLine m={myth} />}
        </div>
      </div>
    </li>
  );
}
