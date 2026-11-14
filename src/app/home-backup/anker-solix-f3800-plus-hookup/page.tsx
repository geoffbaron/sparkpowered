import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Breadcrumbs, Callout, Disclaimer, Faq, RelatedLinks, Section } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { ElectricianRule, HomeBackupLinks, WhatWeChecked } from "@/components/home-backup";
import { HOME_BACKUP_HUB } from "@/data/home-backup";
import { HOOKUP_COSTS, HOOKUP_PARTS, HOOKUP_SAFETY_SOURCES, range } from "@/data/hookup-parts";
import { formatDate } from "@/lib/energy";
import { fullName, kwh, money, productById, watts } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/home-backup/anker-solix-f3800-plus-hookup";
const UPDATED = "2026-11-14";
const TITLE = "Anker SOLIX F3800 Plus Home Hookup: Transfer Switch, Inlet Box or Home Power Panel";
const DESCRIPTION =
  "How to connect an Anker SOLIX F3800 Plus to your house without the Home Power Panel, and when the panel is worth it: inlet box and interlock, Anker's 10-circuit manual transfer switch, circuits, 120/240 V, costs and stock.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const S = {
  topQs: { name: "Anker SOLIX support, F3800 & F3800 Plus: your top questions answered", url: "https://support.ankersolix.com/s/article/F3800-F3800-Plus-Your-Top-Questions-Answered" },
  sameSwitch: {
    name: "Anker SOLIX support, Can I connect the F3800 to the same transfer switch or inlet box I used for my gas generator?",
    url: "https://support.ankersolix.com/s/article/Can-I-connect-Anker-SOLIX-F3800-to-the-same-transfer-switch-inlet-box-I-used-for-my-gas-generator-to-back-up-my-home",
  },
};

export default function F3800PlusHookup() {
  const f = productById("anker-solix-f3800-plus");
  const P = HOOKUP_PARTS;
  const C = HOOKUP_COSTS;
  const kit = P.f3800PlusHppKit;
  const crumbs = [HOME_BACKUP_HUB, { name: "Anker SOLIX F3800 Plus hookup", path: PATH }];

  const faqs = [
    {
      q: "Can I connect an Anker F3800 Plus to a transfer switch without the Home Power Panel?",
      a: "Yes. Anker says the F3800 works with a home transfer switch or inlet box: connect the right cable from its 240 V outlet, and make sure the neutral and ground wires of the inlet box or switch are properly connected, because a missing neutral or ground can damage appliances. The F3800 Plus has one 240 V outlet, a 30 A NEMA L14-30R. A licensed electrician installs the switch or inlet, with a permit.",
    },
    {
      q: "Which Anker transfer switch fits one F3800 Plus?",
      a: `The 30 A version of Anker's 10-circuit manual transfer switch (a Reliance Pro/Tran 2, regular price ${money(P.ankerMts30.listPriceUsd)} on ${formatDate(P.ankerMts30.retrieved)}). Anker's 50 A version is for an F3800 or two linked F3800 Plus units; its page says it is not suitable for a single F3800 Plus.`,
    },
    {
      q: "Does the F3800 Plus switch over automatically in an outage?",
      a: "Only with Anker's Home Power Panel. Anker says that when the grid goes down the panel switches by itself and powers the circuits on its subpanel, up to 25 A with one unit or 50 A with two. With an inlet box and interlock, or a manual transfer switch, you flip it over yourself.",
    },
    {
      q: "How many circuits can one F3800 Plus run?",
      a: `It depends on what is on them, not how many there are. One unit gives ${watts(f.acOutputW)} at 120/240 V (25 A, per Anker). A manual transfer switch caps you at the circuits wired to it (10 on Anker's switch); an interlock lets you reach any breaker, so you must keep the total under the unit's output yourself.`,
    },
    {
      q: "Is the Anker F3800 Plus in stock?",
      a: `Not on its own when we checked: it was sold out on Anker's US site on Nov 6 and again on ${formatDate(f.retrieved)}. Anker had it in stock as the F3800 Plus + Smart Home Power Kit bundle on ${formatDate(kit.retrieved)}.`,
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
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">Anker SOLIX F3800 Plus: connecting it to your house</h1>

        <QuickAnswer>
          <p>
            <strong>Without the Home Power Panel you have two ways:</strong> an outdoor inlet box with an interlock kit on your main panel, or
            a manual transfer switch. Both are fed from the F3800 Plus&apos;s 30 A L14-30R outlet at 120/240 V. Anker sells a 10-circuit switch
            for one unit (the 30 A version; the 50 A one is for two units).
          </p>
          <p>
            The Home Power Panel costs more but switches over by itself. <strong>All three need a licensed electrician and a permit.</strong>
          </p>
        </QuickAnswer>

        <div className="mt-4">
        <Callout tone="warn">
          <strong>Stock:</strong> the F3800 Plus on its own was sold out on Anker&apos;s US site on {formatDate(f.retrieved)} (and on Nov 6). Anker
          was selling it in stock as a bundle with the Home Power Panel kit.
        </Callout>
        </div>

        <ElectricianRule className="mt-6" />

        <Section title="The three options for an F3800 Plus" id="options">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[48rem]">
              <caption className="sr-only">Inlet box and interlock, Anker manual transfer switch and Home Power Panel for one F3800 Plus</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold w-1/5"></th>
                  <th scope="col" className="p-3 font-semibold">Inlet box + interlock</th>
                  <th scope="col" className="p-3 font-semibold">Anker 10-circuit manual transfer switch</th>
                  <th scope="col" className="p-3 font-semibold">Anker Home Power Panel</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Switching</th>
                  <td className="p-3">By hand: main breaker off, interlock slid over, backup breaker on</td>
                  <td className="p-3">By hand, one switch per circuit</td>
                  <td className="p-3">Automatic when the grid fails (Anker)</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Circuits</th>
                  <td className="p-3">Any in your main panel; you manage the load</td>
                  <td className="p-3">The 10 wired to the switch</td>
                  <td className="p-3">Those moved to its subpanel: up to 25 A with one unit, 50 A with two (Anker)</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">120/240 V</th>
                  <td className="p-3">Yes, through the L14-30R</td>
                  <td className="p-3">Yes (120/240 V switch)</td>
                  <td className="p-3">120/240 V split-phase homes only, not 120/208 V (Anker)</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Solar and generator</th>
                  <td className="p-3">No</td>
                  <td className="p-3">No</td>
                  <td className="p-3">Works with grid-tied solar up to 100 A, and a 240 V generator can connect at the same time as the F3800 Plus (Anker)</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Rough cost</th>
                  <td className="p-3">Inlet box {range(C.inletBox)}; interlock installed {range(C.interlock)}; permit {range(C.permit)}</td>
                  <td className="p-3">
                    {money(P.ankerMts30.listPriceUsd)} regular, plus labor ({range(C.labor)}) and permit
                  </td>
                  <td className="p-3">
                    Kit {money(P.ankerHpp.listPriceUsd)} regular plus a 100 A breaker; Anker&apos;s own install service {money(P.ankerHppInstall.listPriceUsd)}, permit not included
                  </td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Electrician and permit</th>
                  <td className="p-3"><strong>Yes</strong></td>
                  <td className="p-3"><strong>Yes</strong> (UL 1008 listed switch)</td>
                  <td className="p-3"><strong>Yes</strong>; Anker says a licensed electrician is required</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Anker prices are the regular prices on its US store on {formatDate(P.ankerHpp.retrieved)}, before its timed discount codes. Installed
            ranges are HomeGuide&apos;s (figures dated {formatDate(C.interlock.sourceUpdated)}); your electrician&apos;s quote is the real number.
          </p>
        </Section>

        <Section title="Which one to pick" id="pick">
          <div className="grid gap-3">
            <Callout>
              <strong>Lowest cost, every circuit reachable:</strong> inlet box and interlock. You are the load manager: turn off what the F3800
              Plus cannot carry before you turn it on.
            </Callout>
            <Callout>
              <strong>Fixed circuits, hard to overload:</strong> the 30 A version of Anker&apos;s 10-circuit switch. Do not buy the 50 A version
              for one unit; Anker labels it for an F3800 or two F3800 Plus units.
            </Callout>
            <Callout>
              <strong>Want it automatic, or plan to add solar or a second unit:</strong> the Home Power Panel. It is the only option here that
              switches over by itself and the only one that ties in rooftop solar. Anker notes that grid-tied solar shuts off in an outage, so it
              cannot recharge the battery until the grid is back.
            </Callout>
          </div>
          <p className="text-stone-700 mt-4 max-w-3xl">
            Before the electrician wires anything, settle the neutral: Anker warns that a missing neutral or ground at the inlet box or switch
            can damage appliances on the circuit. Size the outage first with the{" "}
            <Link href="/power-outage-backup-calculator" className="text-spark-orange underline underline-offset-2">power outage backup calculator</Link>:
            one F3800 Plus holds {kwh(f.capacityWh)} and expands to {kwh(f.maxCapacityWh!)} with Anker&apos;s expansion batteries.
          </p>
        </Section>

        <Section title="Buying one" id="buy">
          <AffiliateDisclosure className="mb-4" />
          <p className="text-stone-700 max-w-3xl">
            The F3800 Plus alone was sold out (last shown at {money(f.priceUsd!)} after Anker&apos;s code). The bundle that was in stock on{" "}
            {formatDate(kit.retrieved)}:{" "}
            <PartnerLink brand="anker" productUrl={kit.url} disclose>
              {kit.name}
            </PartnerLink>{" "}
            ({money(kit.listPriceUsd)} regular; Anker showed {money(kit.priceUsd)} with its auto-applied code that day). It includes the Home
            Power Panel, so budget for the electrician too.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />

        <WhatWeChecked
          untested="the F3800 Plus, the Home Power Panel or Anker's transfer switch"
          items={[
            { ...S.topQs, read: "2026-11-14", what: "25 A / 50 A subpanel backup; 120/240 V at 25 A per unit; solar and generator with the panel; L14-30R and TT-30R outlets" },
            { ...S.sameSwitch, read: "2026-11-14", what: "works with a home transfer switch or inlet box; neutral and ground warning" },
            { name: `${P.ankerMts30.name} product page`, url: P.ankerMts30.url, read: P.ankerMts30.retrieved, what: "price; option labeled for one F3800 Plus" },
            { name: `${P.ankerMts50.name} product page`, url: P.ankerMts50.url, read: P.ankerMts50.retrieved, what: "not suitable for a single F3800 Plus; UL 1008; 120/240 V split-phase only for the Home Power Panel" },
            { name: `${P.ankerHpp.name} product page`, url: P.ankerHpp.url, read: P.ankerHpp.retrieved, what: "price; licensed electrician required; 100 A breaker sold separately; install service" },
            { name: `${kit.name} product page`, url: kit.url, read: kit.retrieved, what: "in stock, price" },
            { name: `${fullName(f)} product page`, url: f.sourceUrl, read: f.retrieved, what: "sold out; specs" },
            { name: "HomeGuide, Generator transfer switch installation cost", url: C.interlock.url, read: C.interlock.retrieved, what: `installed-cost ranges (figures dated ${formatDate(C.interlock.sourceUpdated)})` },
            { ...HOOKUP_SAFETY_SOURCES.cpsc, read: "2026-11-14", what: "backfeeding warning" },
            { ...HOOKUP_SAFETY_SOURCES.osha, read: "2026-11-14", what: "transfer switch by a qualified electrician" },
          ]}
        />

        <HomeBackupLinks exclude={PATH} />

        <Disclaimer>
          General information, not electrical advice. Codes and what inspectors accept differ by city and county. Prices, stock and specifications
          are copied from Anker&apos;s US website on the dates shown and change often.
        </Disclaimer>
        <RelatedLinks
          links={[
            { href: HOME_BACKUP_HUB.path, label: "The four ways to connect a battery", desc: "Cords, interlock, transfer switch or smart panel" },
            { href: "/home-backup/bluetti-apex-300-hookup", label: "Bluetti Apex 300 hookup", desc: "The other 240 V unit: AT1, interlock or transfer switch" },
            { href: "/compare/anker-solix-vs-ecoflow", label: "EcoFlow vs Anker SOLIX", desc: "The F3800 Plus against the DELTA Pro 3" },
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "How much battery your outage needs" },
          ]}
        />
      </div>
    </article>
  );
}
