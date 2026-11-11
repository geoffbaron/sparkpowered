import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Breadcrumbs, Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PriceFootnote, productJson } from "@/components/products";
import { QuickAnswer } from "@/components/guide-ui";
import { BigStat } from "@/components/ui";
import type { Product } from "@/data/products";
import {
  APPLIANCE_SOURCES,
  CAN_IT_RUN_CHECKED,
  CAN_IT_RUN_IDS,
  WATER_HEATER_W,
  appliance,
  canItRunProducts,
  fitFor,
  motorSurgeW,
  runTable,
  runText,
  surgeIsHeatingOnly,
  usableWh,
  whatItRunsPath,
  type Fit,
} from "@/lib/can-it-run";
import { formatDate } from "@/lib/energy";
import { OFFGRID_SOURCES } from "@/lib/offgrid";
import { fullName, kwh, maxWh, money, productById, watts } from "@/lib/products";
import { JsonLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return CAN_IT_RUN_IDS.map((id) => ({ id }));
}

type Props = { params: Promise<{ id: string }> };

const isModel = (id: string): id is (typeof CAN_IT_RUN_IDS)[number] => (CAN_IT_RUN_IDS as readonly string[]).includes(id);

/** Model-specific framing. Every fact here is from the product's own record in src/data/products.ts. */
const ANGLE: Record<(typeof CAN_IT_RUN_IDS)[number], { short: string; who: string }> = {
  "anker-solix-c1000-gen-2": {
    short: "C1000 Gen 2",
    who: "A 1 kWh unit with a real 3,000 W surge, so it starts every motor on our list that fits its 2,000 W output. Its limit is the battery: it is not expandable.",
  },
  "bluetti-ac180": {
    short: "AC180",
    who: "The cheapest station here, with a bit more battery than the 1 kWh units. Its limit is starting motors: the 2,700 W figure is Bluetti's Power Lifting mode for heaters and kettles, not a motor surge.",
  },
  "bluetti-elite-200-v2": {
    short: "Elite 200 V2",
    who: "2 kWh rated for 6,000 cycles. Like the AC180, its surge figure is for heating-type loads only, so motor starts must fit under its 2,600 W continuous output.",
  },
  "anker-solix-c2000-gen-2": {
    short: "C2000 Gen 2",
    who: "2 kWh with a 4,000 W surge that covers every motor start on our list, and the only one here that doubles its battery with an add-on (BP2000).",
  },
  "bluetti-elite-300": {
    short: "Elite 300",
    who: "3 kWh, the biggest battery here: about a day of fridge, and a 4,800 W surge for pump and fridge starts.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isModel(id)) return {};
  const p = productById(id);
  const fridge = runText(p, appliance("fridge"));
  const cpap = runText(p, appliance("cpap"));
  return pageMetadata({
    title: `What Can the ${fullName(p)} Run? Fridge, CPAP, Space Heater Run Times`,
    description: `${fullName(p)} (${kwh(p.capacityWh)}, ${watts(p.acOutputW)}): runs a typical fridge ${fridge}, a CPAP ${cpap}. Run times for 15 appliances, what it cannot run, and the price checked ${formatDate(p.retrieved)}.`,
    path: whatItRunsPath(id),
    type: "article",
  });
}

const FIT_LABEL: Record<Fit, string> = {
  runs: "Runs it",
  "start-unconfirmed": "Start not confirmed",
  "too-big": "Too big",
};
const FIT_CLASS: Record<Fit, string> = {
  runs: "text-leaf font-semibold",
  "start-unconfirmed": "text-spark-amber font-semibold",
  "too-big": "text-red-700 font-semibold",
};

const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function startNote(p: Product, id: string) {
  const a = appliance(id);
  const need = a.runW + a.startW;
  return `EWEB's generator-sizing sheet puts a ${lower(a.label.replace(/ \(.*\)$/, ""))} at ${watts(a.runW)} running plus ${watts(a.startW)} to start, ${watts(need)} in all, and the ${fullName(p)} can give a motor ${watts(motorSurgeW(p))}${surgeIsHeatingOnly(p) ? ` (its ${watts(p.surgeW!)} surge is for heating-type loads only)` : ""}`;
}

export default async function WhatItRunsPage({ params }: Props) {
  const { id } = await params;
  if (!isModel(id)) notFound();
  const p = productById(id);
  const path = whatItRunsPath(id);
  const angle = ANGLE[id];
  const rows = runTable(p);
  const name = fullName(p);
  const price = p.priceUsd!;
  const checked = formatDate(p.retrieved);
  const usable = Math.round(usableWh(p));

  const fridge = appliance("fridge");
  const cpap = appliance("cpap");
  const heater = appliance("heater");
  const sump = appliance("sump");
  const ac = appliance("window-ac");
  const tooBig = rows.filter((r) => r.fit === "too-big");
  const unconfirmed = rows.filter((r) => r.fit === "start-unconfirmed");

  const others = canItRunProducts().filter((x) => x.id !== id).sort((a, b) => a.capacityWh - b.capacityWh);
  const bigger = others.find((x) => x.capacityWh > p.capacityWh * 1.2);
  const smaller = [...others].reverse().find((x) => x.capacityWh < p.capacityWh / 1.2);
  const expanded = p.addOn && !p.addOn.soldOut && p.maxCapacityWh ? maxWh(p) : null;
  const sibling = others.find((x) => Math.abs(x.capacityWh - p.capacityWh) <= p.capacityWh * 0.2) ?? null;
  // The Elite 100 V2 has no page of its own: same 1,024 Wh, so it is covered here.
  const sameSize = id === "anker-solix-c1000-gen-2" ? productById("bluetti-elite-100-v2") : sibling;
  const sameSizeHasPage = !!sameSize && (CAN_IT_RUN_IDS as readonly string[]).includes(sameSize.id);

  const fitSentence = (a: ReturnType<typeof appliance>) => {
    const f = fitFor(p, a);
    if (f === "too-big") return `No. It needs ${watts(a.runW)} running and the ${name} puts out ${watts(p.acOutputW)} continuous.`;
    if (f === "start-unconfirmed") return `It can carry the running load for ${runText(p, a)}, but the start is not confirmed by the specs: ${startNote(p, a.id)}. Test yours before you rely on it.`;
    return `Yes, for ${runText(p, a)}.`;
  };

  const faqs = [
    {
      q: `How long will the ${name} run a refrigerator?`,
      a: `About ${runText(p, fridge).replace(/^about /, "")} for a typical US kitchen fridge, which uses ${Math.round(fridge.avgW)} W averaged over the day (839 kWh a year, EIA). That is ${usable.toLocaleString("en-US")} usable Wh (${kwh(p.capacityWh)} x 85%) divided by ${Math.round(fridge.avgW)} W. ${fitFor(p, fridge) === "runs" ? `Start-up is covered: ${startNote(p, "fridge")}.` : `Start-up is the open question: ${startNote(p, "fridge")}. Plug your fridge in and test it before an outage.`} A closed fridge keeps food safe about 4 hours without power (FoodSafety.gov), so running it in shifts stretches the battery further.`,
    },
    {
      q: `Can the ${name} run a space heater?`,
      a: `Yes, a 1,500 W heater on high is within its ${watts(p.acOutputW)} output, but only for ${runText(p, heater)}. At 1,500 W it is the biggest steady load in the table above that the ${name} can run, so the battery is for taking the chill off, not heating a room through the night. On a thermostat that cycles, it lasts longer.`,
    },
    {
      q: `Can the ${name} run a CPAP, and for how many nights?`,
      a: `${runText(p, cpap)} with the heated humidifier on (${cpap.avgW} W, ResMed's AirSense 10 figure) and ${runText(p, appliance("cpap-dry"))} with it off, at 8 hours a night.${p.upsMs ? ` It switches to battery in ${p.upsMs} ms when the power drops, per ${p.brand === "anker" ? "Anker" : "Bluetti"}.` : ""} Check your own machine's watts in its manual.`,
    },
    {
      q: `Can the ${name} run a sump pump?`,
      a: `${fitSentence(sump)} That is hours of actual pumping for a 1/3 HP pump (800 W running, EWEB). A sump pump runs only when the pit fills, so in a light rain it can last much longer; in a storm it may run often.`,
    },
    {
      q: `Can the ${name} run a window air conditioner?`,
      a: `Not a 12,000 BTU unit at EWEB's ${watts(ac.runW)} running figure: that is more than its ${watts(p.acOutputW)} output. A smaller unit draws less; find the watts on its label. If they are under ${watts(p.acOutputW)}, divide ${usable.toLocaleString("en-US")} Wh by those watts for the hours it would run with the compressor on nonstop.`,
    },
    {
      q: `How can I make the ${name} last longer?`,
      a: `${expanded ? `Add the ${p.addOn!.model} (${money(p.addOn!.priceUsd!)} when checked) to reach ${kwh(expanded)}, which runs a typical fridge ${runText(p, fridge, expanded)}. ` : p.notExpandable ? "It is not expandable, so the only way is to recharge it. " : ""}${p.solarInputW ? `It takes up to ${watts(p.solarInputW)} of solar, so panels can refill it during the day. ` : ""}Run only what you need, and switch the fridge on and off in shifts.`,
    },
  ];

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{ "@context": "https://schema.org", ...productJson(p, path) }} />
      <Breadcrumbs
        items={[
          { name: "Best portable power stations", path: "/best-portable-power-stations" },
          { name: `${name}: what it runs`, path },
        ]}
      />
      <header className="mt-6 mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-3">Can it run it?</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">What can the {name} run, and for how long?</h1>
        <p className="text-lg text-stone-600 leading-relaxed max-w-3xl">
          {kwh(p.capacityWh)} of battery, {watts(p.acOutputW)} continuous output. {angle.who}
        </p>
      </header>

      <AffiliateDisclosure className="mb-8" />

      <QuickAnswer>
        <p>
          The {name} runs a typical kitchen fridge <strong>{runText(p, fridge)}</strong>, a CPAP with the heated humidifier{" "}
          <strong>{runText(p, cpap)}</strong>, and a 1,500 W space heater on high <strong>{runText(p, heater)}</strong>.
        </p>
        <p>
          <strong>It cannot run:</strong> {list(tooBig.map((r) => lower(r.a.label)))}, an electric water heater ({watts(WATER_HEATER_W)}, EWEB)
          {p.volts === "120V" ? ", or anything that needs 240 V (it has 120 V outlets only)" : ""}.
          {unconfirmed.length > 0 && (
            <> Its specs do not confirm it can start a {list(unconfirmed.map((r) => lower(r.a.label.replace(/ \(.*\)$/, ""))))}.</>
          )}
        </p>
        <p>
          {money(price)} on {p.brand === "anker" ? "Anker's" : "Bluetti's"} US site when we checked on {checked}.{" "}
          <PartnerLink brand={p.brand} productId={p.id} productUrl={p.url} category="battery" disclose>
            Check today&apos;s price
          </PartnerLink>
        </p>
      </QuickAnswer>

      <section aria-label="Key numbers" className="grid sm:grid-cols-3 gap-3 mt-8">
        <BigStat tone="leaf" value={runText(p, fridge).replace(/^about /, "")} label="Of a typical fridge" note={`${Math.round(fridge.avgW)} W average, EIA`} />
        <BigStat value={runText(p, cpap)} label="Of CPAP with humidifier" note={`${cpap.avgW} W, 8-hour nights, ResMed`} />
        <BigStat tone="orange" value={`${usable.toLocaleString("en-US")} Wh`} label="Usable energy" note={`${kwh(p.capacityWh)} rated x 85%`} />
      </section>

      <Section title={`${name} run times for 15 appliances`} id="table">
        <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
          <table className="w-full text-sm">
            <caption className="sr-only">How long the {name} runs common appliances on one full charge</caption>
            <thead className="bg-surface-light text-left">
              <tr>
                <th scope="col" className="p-3 font-semibold">Appliance</th>
                <th scope="col" className="p-3 font-semibold">Watts</th>
                <th scope="col" className="p-3 font-semibold">On one charge</th>
                <th scope="col" className="p-3 font-semibold">Can it?</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.a.id} className="border-t border-black/8 align-top">
                  <th scope="row" className="p-3 font-medium text-left">
                    {r.a.label}
                    <span className="block text-xs text-muted font-normal">{r.a.basis}</span>
                  </th>
                  <td className="p-3 whitespace-nowrap">
                    {r.a.avgW !== r.a.runW && r.a.unit === "hours" ? `${Math.round(r.a.avgW)} W avg` : watts(r.a.runW)}
                    {r.a.avgW !== r.a.runW && r.a.unit === "hours" && r.a.runW > 0 && (
                      <span className="block text-xs text-muted">{watts(r.a.runW)} running</span>
                    )}
                    {r.a.startW > 0 && <span className="block text-xs text-muted">+{watts(r.a.startW)} to start</span>}
                  </td>
                  <td className="p-3 whitespace-nowrap">{r.fit === "too-big" ? "Cannot run" : r.text}</td>
                  <td className={`p-3 ${FIT_CLASS[r.fit]}`}>{FIT_LABEL[r.fit]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3 max-w-3xl">
          One appliance at a time from a full charge. Run time = {kwh(p.capacityWh)} x 85% usable ({usable.toLocaleString("en-US")} Wh) divided by
          the appliance&apos;s watts, the same formula our{" "}
          <Link href="/power-outage-backup-calculator" className="underline">outage calculator</Link> uses. &quot;Start not confirmed&quot; means the
          running watts fit but EWEB&apos;s worst-case starting watts are above the surge the station can give a motor. Watts are typical figures from
          the sources below; your appliance&apos;s label is the better number.
        </p>
      </Section>

      <Section title={`What the ${name} cannot run`} id="limits">
        <ul className="space-y-3 max-w-3xl text-stone-700 leading-relaxed list-disc pl-5">
          {tooBig.map((r) => (
            <li key={r.a.id}>
              <strong className="text-ink">{r.a.label}.</strong> Needs {watts(r.a.runW)} running; the {name} gives {watts(p.acOutputW)}.
            </li>
          ))}
          <li>
            <strong className="text-ink">An electric water heater.</strong> About {watts(WATER_HEATER_W)} (EWEB), more than twice what the {name} puts out.
            {p.volts === "120V" ? ` Nor anything that needs 240 V: the ${name} has 120 V outlets only.` : ""}
          </li>
          {unconfirmed.map((r) => (
            <li key={r.a.id}>
              <strong className="text-ink">Starting a {lower(r.a.label.replace(/ \(.*\)$/, ""))} is not confirmed.</strong> {startNote(p, r.a.id)}. Test your own before an outage.
            </li>
          ))}
          <li>
            <strong className="text-ink">Several big loads at once.</strong> Add up the running watts of everything switched on: it must stay under{" "}
            {watts(p.acOutputW)}. A space heater ({watts(heater.runW)}) plus a microwave (1,000 W) is already over.
          </li>
        </ul>
      </Section>

      <Section title="How it compares" id="compare">
        <ul className="space-y-3 max-w-3xl text-stone-700 leading-relaxed list-disc pl-5">
          {sameSize && (
            <li>
              About the same size: the{" "}
              {sameSizeHasPage ? (
                <Link href={whatItRunsPath(sameSize.id)} className="underline text-spark-orange">{fullName(sameSize)}</Link>
              ) : (
                <PartnerLink brand={sameSize.brand} productId={sameSize.id} productUrl={sameSize.url} category="battery">
                  {fullName(sameSize)}
                </PartnerLink>
              )}{" "}
              ({money(sameSize.priceUsd!)}, checked {formatDate(sameSize.retrieved)}) has {kwh(sameSize.capacityWh)}
              {sameSize.capacityWh === p.capacityWh ? ", so every run time above is the same" : `: a fridge ${runText(sameSize, fridge)}`}. It has{" "}
              {watts(sameSize.acOutputW)} of output to the {name}&apos;s {watts(p.acOutputW)}, a {watts(sameSize.surgeW!)} surge
              {surgeIsHeatingOnly(sameSize) ? " for heating-type loads only" : ""} to the {name}&apos;s {watts(p.surgeW!)}
              {surgeIsHeatingOnly(p) ? " (heating-type only)" : ""}, and {watts(sameSize.solarInputW!)} of solar input to {watts(p.solarInputW!)}.
              {fitFor(sameSize, fridge) !== fitFor(p, fridge) &&
                (fitFor(sameSize, fridge) === "runs"
                  ? ` Its specs cover a fridge start; the ${name}'s do not.`
                  : ` The ${name}'s specs cover a fridge start; the ${fullName(sameSize)}'s do not.`)}
            </li>
          )}
          {smaller && (
            <li>
              Smaller: the <Link href={whatItRunsPath(smaller.id)} className="underline text-spark-orange">{fullName(smaller)}</Link> ({money(smaller.priceUsd!)})
              runs a fridge {runText(smaller, fridge)}{fitFor(smaller, fridge) !== fitFor(p, fridge) ? (fitFor(smaller, fridge) === "runs" ? " and its specs do cover the fridge start" : ", but its specs do not confirm the fridge start") : ""}.
            </li>
          )}
          {bigger && (
            <li>
              Bigger: for {money(bigger.priceUsd! - price)} more, the{" "}
              <Link href={whatItRunsPath(bigger.id)} className="underline text-spark-orange">{fullName(bigger)}</Link> runs a fridge {runText(bigger, fridge)}{" "}
              and a CPAP {runText(bigger, cpap)}{fitFor(bigger, sump) === "runs" && fitFor(p, sump) !== "runs" ? ", and its specs cover a sump pump start" : ""}.
            </li>
          )}
          {expanded && (
            <li>
              Expanded: with the {p.addOn!.model} ({money(p.addOn!.priceUsd!)} when checked) it reaches {kwh(expanded)}: a fridge{" "}
              {runText(p, fridge, expanded)}, a CPAP {runText(p, cpap, expanded)}.
            </li>
          )}
          <li>
            Need a different size? The <Link href="/battery-calculator" className="underline text-spark-orange">home battery sizer</Link> and the{" "}
            <Link href="/power-outage-backup-calculator" className="underline text-spark-orange">outage backup calculator</Link> work it out from your own
            list of appliances.
          </li>
        </ul>
      </Section>

      <Section title={`${name} specs and price`} id="specs">
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2 max-w-3xl text-sm">
          {[
            ["Capacity", kwh(p.capacityWh)],
            ["Continuous AC output", watts(p.acOutputW)],
            ["Surge", p.surgeW ? `${watts(p.surgeW)}${surgeIsHeatingOnly(p) ? " (heating-type loads only)" : ""}` : "Not stated"],
            ["Expands to", p.maxCapacityWh ? kwh(p.maxCapacityWh) : p.notExpandable ? "Not expandable" : "Not stated"],
            ["Solar input", p.solarInputW ? watts(p.solarInputW) : "Not stated"],
            ["UPS switchover", p.upsMs ? `${p.upsMs} ms` : "Not stated"],
            ["Weight", p.weightLb ? `${p.weightLb} lb` : "Not stated"],
            ["Price", `${money(price)} on ${checked}${p.listPriceUsd ? ` (regular ${money(p.listPriceUsd)})` : ""}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-black/8 py-1.5">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium text-ink text-right">{v}</dd>
            </div>
          ))}
        </dl>
        {p.notes.length > 0 && (
          <ul className="mt-4 text-sm text-stone-700 list-disc pl-5 max-w-3xl space-y-1">
            {p.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        <div className="mt-5">
          <PartnerLink brand={p.brand} productId={p.id} productUrl={p.url} category="battery" variant="button">
            See the {name} on {p.brand === "anker" ? "Anker SOLIX" : "Bluetti"}
          </PartnerLink>
        </div>
        <PriceFootnote products={sameSize ? [p, sameSize] : [p]} />
      </Section>

      <Callout>
        <strong>Safe to run indoors.</strong> A battery power station makes no exhaust, so unlike a gas generator it can sit next to the fridge or the bed. Gas generators must run outdoors,
        at least 20 ft from windows and doors (Ready.gov).
      </Callout>

      <Faq items={faqs} path={path} />

      <Disclaimer />

      <Sources
        items={[
          { name: `${name} product page`, url: p.sourceUrl, detail: `specs and price, checked ${checked}` },
          ...(sameSize ? [{ name: `${fullName(sameSize)} product page`, url: sameSize.sourceUrl, detail: `checked ${formatDate(sameSize.retrieved)}` }] : []),
          ...APPLIANCE_SOURCES.map((s) => ({ name: s.name, url: s.url, detail: s.detail })),
          OFFGRID_SOURCES.foodsafety,
          OFFGRID_SOURCES.readyGenerators,
          OFFGRID_SOURCES.nfpa,
        ]}
      />
      <p className="text-xs text-muted mt-4">Appliance figures checked {formatDate(CAN_IT_RUN_CHECKED)}.</p>

      <RelatedLinks
        links={[
          ...others.map((o) => ({ href: whatItRunsPath(o.id), label: `What the ${fullName(o)} runs`, desc: `${kwh(o.capacityWh)}, ${money(o.priceUsd!)}: a fridge ${runText(o, fridge)}` })),
          { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "Your own appliances, your outage length" },
          { href: "/power-station-for-refrigerator", label: "Power station for a refrigerator", desc: "Hours of fridge for every model we list" },
          { href: "/best-power-station-for-cpap", label: "Best power station for CPAP", desc: "Nights of CPAP, humidifier on and off" },
          { href: "/space-heater-cost", label: "Space heater cost by state", desc: "What 1,500 W costs an hour where you live" },
          { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Every model compared, with dated prices" },
        ]}
      />
    </article>
  );
}
