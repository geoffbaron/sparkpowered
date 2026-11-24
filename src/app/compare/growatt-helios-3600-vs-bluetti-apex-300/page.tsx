import type { Metadata } from "next";
import Link from "next/link";
import Byline from "@/components/Byline";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Breadcrumbs, Callout, Disclaimer, Faq, RelatedLinks, Section } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { HomeBackupLinks, WhatWeChecked } from "@/components/home-backup";
import { PriceCell, PriceFootnote, productJson } from "@/components/products";
import { HOME_BACKUP_HUB } from "@/data/home-backup";
import { HOOKUP_PARTS, modelHookup } from "@/data/hookup";
import type { Product } from "@/data/products";
import { formatDate } from "@/lib/energy";
import { fullName, kwh, productById, watts } from "@/lib/products";
import { JsonLd, pageMetadata, url, AUTHOR_REF } from "@/lib/seo";

const PATH = "/compare/growatt-helios-3600-vs-bluetti-apex-300";
const UPDATED = "2026-11-14";
const TITLE = "Growatt HELIOS 3600 vs Bluetti Apex 300 for 240 V";
const DESCRIPTION =
  "The Bluetti Apex 300 gives 120/240 V from one unit; the Growatt HELIOS 3600 needs two units and Growatt's hub for 240 V. Capacity, output, expansion and hookup, from both makers' US stores.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

/** From the Apex 300 manual V3.1 spec table: the 14-50R on battery alone at the 240 V setting. */
const APEX_240V_BATTERY_AMPS = 16;

const yes = (v: number | null | undefined, f: (x: number) => string) => (v == null ? "Not stated" : f(v));

export default function HeliosVsApex() {
  const h = productById("growatt-helios-3600");
  const a = productById("bluetti-apex-300");
  const pair = HOOKUP_PARTS.growattPair;
  const hub = HOOKUP_PARTS.growattHub;
  const hHook = modelHookup(h.id);
  const crumbs = [HOME_BACKUP_HUB, { name: "HELIOS 3600 vs Apex 300", path: PATH }];

  const rows: { label: string; a: string; h: string }[] = [
    { label: "240 V from one unit", a: `Yes: 120/240 V from the 14-50R`, h: "No: 120 V only; 240 V needs two units and Growatt's Double Voltage Power Hub" },
    { label: "Capacity", a: kwh(a.capacityWh), h: kwh(h.capacityWh) },
    { label: "Continuous AC output", a: watts(a.acOutputW), h: `${watts(h.acOutputW)} (one unit); ${watts(h.acOutputW * 2)} from two on the hub` },
    { label: "240 V output on battery", a: `${APEX_240V_BATTERY_AMPS} A (${watts(a.acOutputW)}), per Bluetti's manual`, h: `${watts(h.acOutputW * 2)} from two units (Growatt)` },
    { label: "Big outlets", a: "NEMA 14-50R (50 A, 120/240 V) and TT-30R (30 A, 120 V)", h: hHook ? `${hHook.outlet}; the hub adds two L14-30 and one 6-20` : "Not stated" },
    { label: "Expands to", a: `${kwh(a.maxCapacityWh!)} (${a.expansion})`, h: `${kwh(h.maxCapacityWh!)} (${h.expansion})` },
    { label: "Add-on battery", a: a.addOn ? `${a.addOn.model}${a.addOn.soldOut ? ", sold out" : ""}` : "Not stated", h: h.addOn ? `${h.addOn.model}${h.addOn.soldOut ? ", sold out when we checked" : ""}` : "Not stated" },
    { label: "Max solar input", a: yes(a.solarInputW, watts), h: yes(h.solarInputW, watts) },
    { label: "Rated cycles", a: a.cycles ? `${a.cycles.toLocaleString("en-US")}${a.cyclesTo ? ` to ${a.cyclesTo}%` : ""}` : "Not stated", h: h.cycles ? h.cycles.toLocaleString("en-US") : "Not stated" },
    { label: "UPS switchover", a: "0 ms in online UPS mode on some outlets, 20 ms otherwise (Bluetti)", h: h.upsMs ? `${h.upsMs} ms (Growatt also says 15 ms)` : "Not stated" },
    { label: "Weight", a: yes(a.weightLb, (x: number) => `${x} lb`), h: yes(h.weightLb, (x: number) => `${x} lb`) },
    { label: "Warranty", a: yes(a.warrantyYears, (x: number) => `${x} years`), h: yes(h.warrantyYears, (x: number) => `${x} years`) },
  ];

  const faqs = [
    {
      q: "Can one Growatt HELIOS 3600 give 240 V?",
      a: `No. Growatt's own page says it supports 240 V whole-home power "when parallel two HELIOS 3600s", joined with its Double Voltage Power Hub, which gives ${watts(h.acOutputW * 2)} with two L14-30 outlets. One unit is 120 V only.`,
    },
    {
      q: "Which is simpler for 240 V, the HELIOS 3600 or the Apex 300?",
      a: `The Apex 300: one unit gives 120/240 V. Growatt needs its two-unit bundle with the hub (checked ${formatDate(pair.retrieved)}). The Growatt pair gives far more: about ${kwh(h.capacityWh * 2)} and ${watts(h.acOutputW * 2)}, against ${kwh(a.capacityWh)} and ${watts(a.acOutputW)}.`,
    },
    {
      q: "Which holds more energy?",
      a: `One HELIOS 3600 holds ${kwh(h.capacityWh)}, one Apex 300 ${kwh(a.capacityWh)}. Fully expanded with each maker's batteries the Apex 300 reaches ${kwh(a.maxCapacityWh!)} and the HELIOS ${kwh(h.maxCapacityWh!)}, but Growatt's extra battery was sold out when we checked on ${formatDate(h.retrieved)}.`,
    },
    {
      q: "Can either one run a well pump?",
      a: `A 240 V well pump needs 240 V: the Apex 300 from one unit (up to ${watts(a.acOutputW)} on battery at 240 V), the HELIOS only as a pair on the hub. Whether either starts your pump depends on its starting watts; check the pump's nameplate with our power outage backup calculator. Wiring a pump to either one goes through a transfer switch installed by a licensed electrician with a permit.`,
    },
    {
      q: "Have you tested them?",
      a: "No. Every figure here comes from Growatt's and Bluetti's US stores and Bluetti's manual, on the dates shown.",
    },
  ];

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${url(PATH)}#article`,
          headline: TITLE,
          description: DESCRIPTION,
          url: url(PATH),
          datePublished: UPDATED,
          dateModified: UPDATED,
          author: AUTHOR_REF,
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          mainEntityOfPage: url(PATH),
          about: [a, h].map((p) => productJson(p, PATH, UPDATED)),
        }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={crumbs} />
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-2">Head to head</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">Growatt HELIOS 3600 vs Bluetti Apex 300: the 240 V question</h1>
        <Byline path={PATH} />

        <QuickAnswer>
          <p>
            <strong>Need 240 V (well pump, dryer, a 240 V transfer switch)?</strong> The Bluetti Apex 300 gives 120/240 V from one unit. The
            Growatt HELIOS 3600 does not: Growatt says 240 V needs two units joined with its hub.
          </p>
          <p>
            <strong>120 V only?</strong> One HELIOS 3600 holds more ({kwh(h.capacityWh)} vs {kwh(a.capacityWh)}). For 240 V, one Apex 300 costs
            far less than Growatt&apos;s two-unit bundle, but the pair gives much more power and capacity.
          </p>
        </QuickAnswer>

        <Section title="Side by side" id="specs">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[40rem]">
              <caption className="sr-only">{fullName(h)} versus {fullName(a)}</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold w-1/4">Spec</th>
                  <th scope="col" className="p-3 font-semibold">{fullName(a)}</th>
                  <th scope="col" className="p-3 font-semibold">{fullName(h)}</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {rows.map((r) => (
                  <tr key={r.label} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium text-stone-700">{r.label}</th>
                    <td className="p-3">{r.a}</td>
                    <td className="p-3">{r.h}</td>
                  </tr>
                ))}
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Today&apos;s price</th>
                  <td className="p-3"><PriceCell p={a} /></td>
                  <td className="p-3"><PriceCell p={h} /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <PriceFootnote products={[a, h]} />
        </Section>

        <Section title="The 240 V question" id="240v">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-black/8 bg-surface p-5">
              <h3 className="font-bold">One {fullName(a)}</h3>
              <p className="text-sm text-stone-700 mt-2">
                120/240 V, {kwh(a.capacityWh)}, {watts(a.acOutputW)}. At 240 V on battery the 14-50R gives {APEX_240V_BATTERY_AMPS} A; its 50 A
                rating applies only when grid or generator power passes through (Bluetti manual).
              </p>
            </div>
            <div className="rounded-xl border border-black/8 bg-surface p-5">
              <h3 className="font-bold">Two {fullName(h)} units + hub</h3>
              <p className="text-sm text-stone-700 mt-2">
                120/240 V, {kwh(h.capacityWh * 2)}, {watts(h.acOutputW * 2)}, with two L14-30 outlets on the hub. Two batteries to charge and move
                ({h.weightLb} lb each).
              </p>
            </div>
          </div>
          <p className="text-stone-700 mt-4 max-w-3xl">
            Either way, getting that 240 V into house circuits means an inlet box with an interlock, a transfer switch or the maker&apos;s panel,
            installed by a licensed electrician with a permit. See{" "}
            <Link href={HOME_BACKUP_HUB.path} className="text-spark-orange underline underline-offset-2">the four ways to connect a battery</Link> and
            the <Link href="/home-backup/bluetti-apex-300-hookup" className="text-spark-orange underline underline-offset-2">Apex 300 hookup guide</Link>.
          </p>
        </Section>

        <Section title="Buying one" id="buy">
          <AffiliateDisclosure className="mb-4" />
          <div className="grid gap-3">
            <Callout>
              <strong>For 240 V from one box:</strong>{" "}
              <PartnerLink brand="bluetti" productId={a.id} productUrl={a.url} disclose>
                {fullName(a)}
              </PartnerLink>
            </Callout>
            <Callout>
              <strong>For the most capacity at 120 V, or a pair for 240 V:</strong>{" "}
              <PartnerLink brand="growatt" productId={h.id} productUrl={h.url} disclose>
                {fullName(h)}
              </PartnerLink>
            </Callout>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />


        <HomeBackupLinks exclude={PATH} />

        <Disclaimer>
          Specifications are copied from Growatt&apos;s and Bluetti&apos;s US websites on the dates shown. Confirm them with the seller before you
          buy. We don&apos;t list prices; the links go to each maker&apos;s page for today&apos;s price.
        </Disclaimer>
        <RelatedLinks
          links={[
            { href: "/home-backup/bluetti-apex-300-hookup", label: "Bluetti Apex 300 hookup", desc: "AT1, interlock or manual transfer switch" },
            { href: HOME_BACKUP_HUB.path, label: "The four ways to connect a battery", desc: "Cords, interlock, transfer switch or smart panel" },
            { href: "/compare", label: "All comparisons", desc: "Every head-to-head we have" },
          ]}
        />
        <WhatWeChecked className="mt-14"
          untested="either unit"
          items={[
            { name: `${fullName(h)} product page`, url: h.sourceUrl, read: h.retrieved, what: "stock, two-unit bundle; \"Support 240V whole-home power when parallel two HELIOS 3600s\"" },
            { name: `${hub.name} product page`, url: hub.url, read: hub.retrieved, what: "7,200 W from two units; one 6-20 and two L14-30 outlets" },
            { name: `${fullName(a)} product page`, url: a.sourceUrl, read: a.retrieved, what: "stock, outlets" },
            { name: "Bluetti Apex 300 user manual V3.1 (PDF)", url: "https://s4.bluettipower.com/bluetti/purchasePageBiz/2025/12/Apex%20300%20User%20%20Manual%20US%20EN-FR-1764555919287-cde9.pdf", read: "2026-11-14", what: "14-50R: 50 A bypass, 16 A at 240 V on battery" },
          ]}
        />
      </div>
    </article>
  );
}
