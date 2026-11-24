import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Breadcrumbs, Callout, Disclaimer, Faq, RelatedLinks, Section } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { ElectricianRule, HomeBackupLinks, WhatWeChecked } from "@/components/home-backup";
import { PriceFootnote } from "@/components/products";
import { HOME_BACKUP_HUB } from "@/data/home-backup";
import { HOOKUP_COSTS, HOOKUP_PARTS, HOOKUP_SAFETY_SOURCES, range } from "@/data/hookup";
import { formatDate } from "@/lib/energy";
import { fullName, kwh, productById, watts } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/home-backup/bluetti-apex-300-hookup";
const UPDATED = "2026-11-14";
const TITLE = "Bluetti Apex 300 Transfer Switch Options: AT1, Interlock or Manual Switch";
const DESCRIPTION =
  "How to connect a Bluetti Apex 300 to your house: Bluetti's AT1 panel, an inlet box with an interlock, or a manual transfer switch. What its 50 A outlet really delivers on battery, the neutral question, costs and the electrician rule.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const MANUAL = {
  name: "Bluetti Apex 300 user manual V3.1 (PDF)",
  url: "https://s4.bluettipower.com/bluetti/purchasePageBiz/2025/12/Apex%20300%20User%20%20Manual%20US%20EN-FR-1764555919287-cde9.pdf",
};
const HOOKUP_GUIDE = {
  name: "Bluetti, How to hook up a generator to the house (Bluetti Team, Oct 29 2026)",
  url: "https://www.bluettipower.com/blogs/articles/how-to-hook-up-a-generator-to-the-house-safely-and-efficiently",
};

/** From the manual's spec table: the 14-50R on battery alone at the 240 V setting. */
const BATTERY_240V_AMPS = 16;

export default function Apex300Hookup() {
  const a = productById("bluetti-apex-300");
  const P = HOOKUP_PARTS;
  const C = HOOKUP_COSTS;
  const crumbs = [HOME_BACKUP_HUB, { name: "Bluetti Apex 300 hookup", path: PATH }];

  const faqs = [
    {
      q: "Does the Bluetti Apex 300 need the AT1 to connect to a house?",
      a: `No. The Apex 300's 50 A NEMA 14-50R outlet can feed an inlet box with an interlock kit, or a manual transfer switch, installed by a licensed electrician with a permit. The AT1 is Bluetti's automatic option: it switches over by itself and also manages a generator and rooftop solar.`,
    },
    {
      q: "Does the Apex 300's 50 A outlet give 50 amps?",
      a: `Only when grid or generator power is passing through it. Bluetti's manual rates the 14-50R at 50 A in bypass mode, but on battery alone at the 240 V setting it gives ${BATTERY_240V_AMPS} A, which is its ${watts(a.acOutputW)} limit. Size what is on the backed-up circuits to that.`,
    },
    {
      q: "Does a transfer switch for the Apex 300 have to switch the neutral?",
      a: "It depends on whether the unit's output neutral is bonded to ground, and the Apex 300 manual does not say. Bluetti's own hookup guide says neutral bonding matters most: some sources bond the neutral and others expect transfer equipment that switches it. Ask Bluetti support which kind the Apex 300 is, in writing, and give the answer to your electrician before parts are bought.",
    },
    {
      q: "Can one Apex 300 give 240 V?",
      a: "Yes. Set its voltage selector to 240 V and the 14-50R outlet gives 120/240 V split-phase from a single unit, per Bluetti's manual. At that setting the TT-30R and the 20 A outlets stay at 120 V with lower limits.",
    },
    {
      q: "How much does an Apex 300 home hookup cost?",
      a: `Beyond the battery: an interlock kit installed runs ${range(C.interlock)} and a manual transfer switch installed ${range(C.manualSwitch)}, plus a permit (${range(C.permit)}), by HomeGuide's ranges. Bluetti's AT1 costs extra, before installation; see Bluetti's page for today's price.`,
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
          author: { "@id": url("/#organization") },
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          mainEntityOfPage: url(PATH),
        }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={crumbs} />
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-2">Home backup</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">Bluetti Apex 300: AT1, interlock or manual transfer switch</h1>

        <QuickAnswer>
          <p>
            <strong>Three ways, all through a licensed electrician with a permit:</strong> Bluetti&apos;s AT1 panel (automatic, the most
            expensive), an inlet box with an interlock kit (cheapest, you flip breakers), or a manual transfer switch (fixed circuits). The
            Apex 300 feeds the last two from its 50 A 14-50R outlet, 120/240 V from one unit.
          </p>
          <p>
            Two catches: on battery alone that outlet gives {BATTERY_240V_AMPS} A at 240 V, not 50 A, and{" "}
            <strong>the neutral question must be settled first</strong> (below).
          </p>
        </QuickAnswer>

        <ElectricianRule className="mt-6" />

        <Section title="AT1 vs interlock vs manual transfer switch" id="options">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[48rem]">
              <caption className="sr-only">Three ways to connect a Bluetti Apex 300 to a house</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold w-1/5"></th>
                  <th scope="col" className="p-3 font-semibold">Bluetti AT1</th>
                  <th scope="col" className="p-3 font-semibold">Inlet box + interlock</th>
                  <th scope="col" className="p-3 font-semibold">Manual transfer switch</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Switching</th>
                  <td className="p-3">Automatic (Bluetti)</td>
                  <td className="p-3">By hand: main breaker off, interlock over, backup breaker on</td>
                  <td className="p-3">By hand, one switch per circuit</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">What it ties in</th>
                  <td className="p-3">Grid, generator, rooftop solar inverter and Bluetti batteries; up to three Apex 300s through Bluetti&apos;s Hub A1</td>
                  <td className="p-3">Any circuit in your main panel</td>
                  <td className="p-3">The circuits wired to the switch</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Overload risk</th>
                  <td className="p-3">Managed by the panel</td>
                  <td className="p-3">Highest: you keep the total under {watts(a.acOutputW)}</td>
                  <td className="p-3">Lower: only the chosen circuits</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Rough cost</th>
                  <td className="p-3">The AT1 (see Bluetti&apos;s price) plus installation</td>
                  <td className="p-3">Inlet box {range(C.inletBox)}; interlock installed {range(C.interlock)}</td>
                  <td className="p-3">Installed {range(C.manualSwitch)}</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Electrician and permit</th>
                  <td className="p-3"><strong>Yes</strong></td>
                  <td className="p-3"><strong>Yes</strong>; Bluetti&apos;s guide calls for listed transfer equipment or an approved interlock</td>
                  <td className="p-3"><strong>Yes</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            AT1 checked on Bluetti&apos;s US store on {formatDate(P.bluettiAt1.retrieved)}. Installed ranges are HomeGuide&apos;s (figures dated{" "}
            {formatDate(C.interlock.sourceUpdated)}); permits add {range(C.permit)}. Your electrician&apos;s quote is the real number. Bluetti also
            sells an Apex 300 Home Integration Kit; its listing says only that it ties the unit into home
            circuits, so ask Bluetti what is in it before you count on it.
          </p>
        </Section>

        <Section title="The neutral question, plainly" id="neutral">
          <Callout tone="warn">
            <p>
              <strong>Whether your transfer switch or interlock setup must switch the neutral depends on whether the Apex 300 bonds neutral to
              ground inside the unit, and Bluetti&apos;s Apex 300 manual does not say.</strong>
            </p>
            <p className="mt-2">
              Bluetti&apos;s own hookup guide ({formatDate("2026-10-29")}) says neutral bonding matters most: some sources bond the neutral, and
              others expect transfer equipment that switches it. Get the answer from Bluetti support in writing and hand it to your electrician
              before anything is bought.
            </p>
          </Callout>
        </Section>

        <Section title="What the 50 A outlet really delivers" id="outlet">
          <p className="text-stone-700 leading-relaxed max-w-3xl">
            Bluetti&apos;s manual rates the 14-50R at 50 A only in bypass mode, when grid or generator power passes through the unit. On battery
            alone, with the voltage selector at 240 V, it gives 120/240 V at {BATTERY_240V_AMPS} A: the unit&apos;s {watts(a.acOutputW)} limit. So a
            50 A inlet or switch is the right size for the plug, but the circuits you back up must add up to no more than {watts(a.acOutputW)}{" "}
            running. At the 240 V setting the TT-30R drops to 16 A at 120 V. One Apex 300 holds {kwh(a.capacityWh)} and grows to{" "}
            {kwh(a.maxCapacityWh!)} with Bluetti&apos;s B300K batteries. Check your loads with the{" "}
            <Link href="/power-outage-backup-calculator" className="text-spark-orange underline underline-offset-2">power outage backup calculator</Link>.
          </p>
        </Section>

        <Section title="Buying one" id="buy">
          <AffiliateDisclosure className="mb-4" />
          <p className="text-stone-700 max-w-3xl">
            In stock on Bluetti&apos;s US site on {formatDate(a.retrieved)}:{" "}
            <PartnerLink brand="bluetti" productId={a.id} productUrl={a.url} disclose>
              {fullName(a)}
            </PartnerLink>
          </p>
          <p className="text-stone-700 max-w-3xl mt-2">
            Weighing it against a 120 V unit? A 120 V-only unit cannot feed 240 V circuits on its own; see{" "}
            <Link href="/home-backup" className="underline underline-offset-2">the four ways to connect a battery</Link>.
          </p>
          <PriceFootnote products={[a]} />
        </Section>

        <Faq items={faqs} path={PATH} />

        <WhatWeChecked
          untested="the Apex 300, the AT1 or any transfer switch with it"
          items={[
            { ...MANUAL, read: "2026-11-14", what: "14-50R: 50 A bypass, 16 A at 240 V on battery; TT-30R limits; voltage selector; no statement on neutral bonding" },
            { ...HOOKUP_GUIDE, read: "2026-11-14", what: "neutral bonding matters most; listed transfer equipment or an approved interlock; electrician, permits, never backfeed" },
            { name: `${P.bluettiAt1.name} product page`, url: P.bluettiAt1.url, read: P.bluettiAt1.retrieved, what: "automatic transfer; compatible with Apex 300 systems (up to three via Hub A1)" },
            { name: `${P.bluettiApexKit.name} product page`, url: P.bluettiApexKit.url, read: P.bluettiApexKit.retrieved, what: "one-line description" },
            { name: `${fullName(a)} product page`, url: a.sourceUrl, read: a.retrieved, what: "stock, outlets" },
            { name: "HomeGuide, Generator transfer switch installation cost", url: C.interlock.url, read: C.interlock.retrieved, what: `installed-cost ranges (figures dated ${formatDate(C.interlock.sourceUpdated)})` },
            { ...HOOKUP_SAFETY_SOURCES.cpsc, read: "2026-11-14", what: "backfeeding warning" },
            { ...HOOKUP_SAFETY_SOURCES.osha, read: "2026-11-14", what: "transfer switch by a qualified electrician" },
          ]}
        />

        <HomeBackupLinks exclude={PATH} />

        <Disclaimer>
          General information, not electrical advice. Codes and what inspectors accept differ by city and county. Stock and specifications
          are copied from Bluetti&apos;s US website and manual on the dates shown. We don&apos;t list product prices; the links go to Bluetti for today&apos;s price.
        </Disclaimer>
        <RelatedLinks
          links={[
            { href: HOME_BACKUP_HUB.path, label: "The four ways to connect a battery", desc: "Cords, interlock, transfer switch or smart panel" },
            { href: "/home-backup/anker-solix-f3800-plus-hookup", label: "Anker SOLIX F3800 Plus hookup", desc: "Home Power Panel or Anker's transfer switch" },
            { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Every model compared by spec" },
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "How much battery your outage needs" },
          ]}
        />
      </div>
    </article>
  );
}
