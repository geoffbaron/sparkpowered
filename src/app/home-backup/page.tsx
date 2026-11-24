import type { Metadata } from "next";
import Link from "next/link";
import Byline from "@/components/Byline";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Breadcrumbs, Callout, Disclaimer, Faq, RelatedLinks, Section } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { ElectricianRule, WhatWeChecked } from "@/components/home-backup";
import { PriceFootnote } from "@/components/products";
import { HOME_BACKUP_HUB, liveHomeBackupPages } from "@/data/home-backup";
import { HOOKUP_COSTS, HOOKUP_PARTS, HOOKUP_SAFETY_SOURCES, MODEL_HOOKUPS, PARTS, range, type ModelHookup } from "@/data/hookup";
import type { Product } from "@/data/products";
import { formatDate } from "@/lib/energy";
import { fullName, money, productById } from "@/lib/products";
import { JsonLd, pageMetadata, url, AUTHOR_REF } from "@/lib/seo";

const PATH = HOME_BACKUP_HUB.path;
const UPDATED = "2026-11-14";
const TITLE = "Run Your House From a Battery: 4 Ways to Connect";
const DESCRIPTION =
  "Extension cords, an inlet box with an interlock, a manual transfer switch, or the maker's smart panel: what each one powers, what the parts cost, when you need an electrician, and which big batteries support it.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const stock = (p: Product) => (p.soldOut ? " (sold out when we checked)" : "");

/** How one model reaches the panel, from the picker's model list (src/data/hookup.ts). */
function hookupLine(m: ModelHookup) {
  if (m.pair240) return `${m.outlet}; 240 V only from two units on the ${m.pair240.name}`;
  if (!m.outlet.includes("240")) return `${m.outlet}: 120 V circuits only`;
  return m.outlet;
}

const usd = ([lo, hi]: readonly [number, number]) => `${money(lo)} to ${money(hi)}`;

export default function HomeBackupHub() {
  const apex = productById("bluetti-apex-300");
  const helios = productById("growatt-helios-3600");
  const panelReady = MODEL_HOOKUPS.map((m) => ({ m, p: productById(m.productId) }));
  const smartPanels = MODEL_HOOKUPS.filter((m) => m.smartPanel);
  const ultra = productById("ecoflow-delta-pro-ultra");
  const cluster = liveHomeBackupPages();
  const compareLive = cluster.find((c) => c.href === "/compare/growatt-helios-3600-vs-bluetti-apex-300");
  const C = HOOKUP_COSTS;
  const P = HOOKUP_PARTS;

  const faqs = [
    {
      q: "Can I connect a portable power station to my house?",
      a: "Yes, but only through equipment that keeps it from feeding the utility lines: an inlet box with an interlock kit, a transfer switch, or the maker's own smart panel, installed by a licensed electrician with a permit. The battery also needs a 30 A or 50 A outlet (or the maker's panel port). Without any of that, plug appliances straight into the battery with extension cords.",
    },
    {
      q: "Can I plug a power station into a wall outlet to power the house?",
      a: "No. That is backfeeding. The CPSC says it can electrocute utility workers and neighbors served by the same transformer and bypasses your home's circuit protection, and it is illegal. A double-ended cord into a dryer or range outlet is the same thing. Use one of the four methods on this page instead.",
    },
    {
      q: "What is the difference between an interlock kit and a transfer switch?",
      a: "An interlock is a sliding plate on your existing main panel that stops the main breaker and a backup breaker being on at the same time; you then pick which circuits to run by flipping breakers. A manual transfer switch is a separate small box wired to a fixed set of circuits (often 6 or 10), each with its own grid-or-battery switch. Interlocks cost less; transfer switches are harder to overload. Bluetti's own guide calls for listed transfer equipment or an approved interlock, and local rules decide which is accepted.",
    },
    {
      q: "Do I need a 240 V power station?",
      a: `Only for 240 V loads such as a well pump or an electric dryer. A fridge, lights, Wi-Fi and most furnace blowers run on 120 V. Some batteries give 240 V from one unit (the ${fullName(apex)} does); the ${fullName(helios)} needs two units and Growatt's hub.`,
    },
    {
      q: "How much does it cost to hook a battery up to a house?",
      a: `Cords: ${usd(PARTS.cords.usd)} for one to three 12-gauge outdoor cords. An interlock kit installed: ${range(C.interlock)}. A manual transfer switch installed: ${range(C.manualSwitch)}, plus a permit (${range(C.permit)}). Those are HomeGuide's ranges, last updated ${formatDate(C.interlock.sourceUpdated)}. The makers' smart panels cost more; see each maker's page for today's price.`,
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
        }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[HOME_BACKUP_HUB]} />
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-2">Home backup</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">Run your house from a portable battery: the four ways to connect one</h1>
        <Byline path={PATH} />

        <QuickAnswer>
          <p>
            <strong>Four ways, cheapest first:</strong> (1) extension cords from the battery straight to appliances; (2) an outdoor inlet
            box plus an interlock kit on your main panel; (3) a manual transfer switch for chosen circuits; (4) the maker&apos;s smart
            panel, which switches over by itself.
          </p>
          <p>
            Only the first needs no electrician. <strong>Options 2 to 4 touch your breaker panel: licensed electrician and permit, every
            time.</strong> They also need a battery with a 30 A or 50 A outlet, or the maker&apos;s panel port.
          </p>
        </QuickAnswer>

        <ElectricianRule className="mt-6" />

        <Section title="The four ways, side by side" id="methods">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[52rem]">
              <caption className="sr-only">Four ways to connect a portable battery to a house</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Method</th>
                  <th scope="col" className="p-3 font-semibold">What it powers</th>
                  <th scope="col" className="p-3 font-semibold">Rough cost*</th>
                  <th scope="col" className="p-3 font-semibold">Electrician and permit</th>
                  <th scope="col" className="p-3 font-semibold">Our models that support it</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-semibold">1. Extension cords</th>
                  <td className="p-3">Only what you plug in: fridge, lights, router, CPAP. Nothing wired in (furnace, well pump).</td>
                  <td className="p-3">{usd(PARTS.cords.usd)} for one to three 12-gauge outdoor cords</td>
                  <td className="p-3">No</td>
                  <td className="p-3">Every power station (<Link href="/compare" className="underline">comparisons</Link>)</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-semibold">2. Inlet box + interlock kit</th>
                  <td className="p-3">Any circuit in your main panel, chosen by flipping breakers. You keep the total under the battery&apos;s output.</td>
                  <td className="p-3">Inlet box {range(C.inletBox)}; interlock installed {range(C.interlock)}; permit {range(C.permit)}</td>
                  <td className="p-3"><strong>Yes, always.</strong> The interlock must be one made for your panel model, and your inspector has the final say.</td>
                  <td className="p-3" rowSpan={2}>
                    <ul className="space-y-1">
                      {panelReady.map(({ m, p }) => (
                        <li key={p.id}>
                          {fullName(p)}: {hookupLine(m)}
                          {stock(p)}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-semibold">3. Manual transfer switch</th>
                  <td className="p-3">A fixed set of circuits (often 6 or 10) wired to the switch, each flipped to grid or battery.</td>
                  <td className="p-3">
                    Installed {range(C.manualSwitch)}, plus permit. Anker also sells a 10-circuit switch; see its page for
                    today&apos;s price.
                  </td>
                  <td className="p-3"><strong>Yes, always.</strong></td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-semibold">4. The maker&apos;s smart panel</th>
                  <td className="p-3">A backed-up subpanel that switches over automatically when the grid fails; some also manage solar and a generator.</td>
                  <td className="p-3">
                    The maker&apos;s price (right) plus installation; Anker also sells its own install service, permit not included
                  </td>
                  <td className="p-3"><strong>Yes, always.</strong> Anker says a licensed electrician is required.</td>
                  <td className="p-3">
                    <ul className="space-y-1">
                      {smartPanels.map((m) => (
                        <li key={m.productId}>
                          {fullName(productById(m.productId))}
                          {stock(productById(m.productId))}: {m.smartPanel!.name}
                        </li>
                      ))}
                      <li>{fullName(apex)}: {P.bluettiAt1.name}, automatic</li>
                      <li>{fullName(ultra)}{stock(ultra)}: EcoFlow Smart Home Panel 2</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            *Installed ranges are HomeGuide&apos;s (figures last updated {formatDate(C.interlock.sourceUpdated)}, read {formatDate(C.interlock.retrieved)});
            your electrician&apos;s quote is the real number. Maker parts checked on each maker&apos;s US store on{" "}
            {formatDate(P.ankerHpp.retrieved)}; we don&apos;t list their prices.
          </p>
        </Section>

        <Section title="Which one fits your house" id="which">
          <div className="grid gap-3">
            <Callout>
              <strong>Renting, or only the fridge and a few lights?</strong> Cords. Use grounded (3-prong) cords rated above the total watts
              of what is plugged in, never frayed or damaged ones (OSHA, CPSC). Plug a space heater straight into the battery, never through
              a cord or power strip.
            </Callout>
            <Callout>
              <strong>A furnace blower, well pump or other wired-in load?</strong> Cords cannot reach those. You need method 2, 3 or 4. An
              interlock is the cheapest way to reach every circuit; a transfer switch costs more but limits you to circuits the battery can
              carry, which makes it harder to overload.
            </Callout>
            <Callout>
              <strong>Want it to happen by itself when the power cuts out?</strong> Only the makers&apos; smart panels switch automatically.
              They cost the most and tie you to one brand of battery.
            </Callout>
            <Callout>
              <strong>Need 240 V (well pump, dryer)?</strong> The battery must give 120/240 V. The {fullName(apex)} does from one unit; the{" "}
              {fullName(helios)} needs two.{" "}
              {compareLive && (
                <Link href={compareLive.href} className="underline underline-offset-2">
                  {compareLive.title}
                </Link>
              )}
            </Callout>
          </div>
          <p className="text-stone-700 mt-4 max-w-3xl">
            Before any of this, size the battery: the{" "}
            <Link href="/power-outage-backup-calculator" className="text-spark-orange underline underline-offset-2">power outage backup calculator</Link>{" "}
            adds up your appliances and outage length.
          </p>
        </Section>

        <Section title="One thing to settle with your electrician: the neutral" id="neutral">
          <p className="text-stone-700 leading-relaxed max-w-3xl">
            Some batteries and generators bond neutral to ground inside the unit; others leave it floating and rely on the bond in your main
            panel. Which one you have decides whether the transfer equipment must switch the neutral too. Bluetti&apos;s own hookup guide puts it
            plainly: neutral bonding matters most. Anker warns that a missing neutral or ground wire at the inlet box or transfer switch can damage
            appliances. Ask the battery maker which kind yours is before the electrician buys parts.
          </p>
        </Section>

        {cluster.length > 0 && (
          <Section title="Hookup guides by model and appliance" id="guides">
            <ul className="grid sm:grid-cols-2 gap-3">
              {cluster.map((c) => (
                <li key={c.href} className="rounded-xl border border-black/8 bg-surface p-4">
                  <Link href={c.href} className="font-semibold text-ink underline underline-offset-2 hover:text-spark-orange">
                    {c.title}
                  </Link>
                  <span className="block text-sm text-stone-700">{c.desc}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="A 240 V battery in stock" id="buy">
          <AffiliateDisclosure className="mb-4" />
          <p className="text-stone-700 max-w-3xl">
            The{" "}
            <PartnerLink brand="bluetti" productId={apex.id} productUrl={apex.url} disclose>
              {fullName(apex)}
            </PartnerLink>{" "}
            (checked on Bluetti&apos;s US site on {formatDate(apex.retrieved)}) gives 120/240 V from one unit through a 50 A outlet
            and works with Bluetti&apos;s AT1 panel. See the{" "}
            <Link href="/home-backup/bluetti-apex-300-hookup" className="underline underline-offset-2">Apex 300 hookup guide</Link> first.
          </p>
          <PriceFootnote products={[apex]} />
        </Section>

        <Faq items={faqs} path={PATH} />


        <Disclaimer>
          General information, not electrical advice. Codes and what inspectors accept differ by city and county. Specifications are
          copied from makers&apos; US websites on the dates shown. We don&apos;t list product prices; the links go to each maker for today&apos;s price.
        </Disclaimer>
        <RelatedLinks
          links={[
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "How big a battery your outage needs" },
            { href: "/home-battery-backup", label: "Home battery backup", desc: "Installed whole-home batteries instead" },
            { href: "/generator-runtime-calculator", label: "Generator runtime calculator", desc: "If you add a gas generator for long outages" },
          ]}
        />
        <WhatWeChecked className="mt-14"
          untested="any of these batteries or hookup parts"
          items={[
            { ...HOOKUP_SAFETY_SOURCES.cpsc, read: "2026-11-14", what: "backfeeding warning; cord ratings" },
            { ...HOOKUP_SAFETY_SOURCES.osha, read: "2026-11-14", what: "transfer switch by a qualified electrician; cord condition and rating" },
            { name: "HomeGuide, Generator transfer switch installation cost", url: C.interlock.url, read: C.interlock.retrieved, what: `installed-cost ranges (figures dated ${formatDate(C.interlock.sourceUpdated)})` },
            { name: "Anker SOLIX support, F3800 & F3800 Plus: your top questions answered", url: "https://support.ankersolix.com/s/article/F3800-F3800-Plus-Your-Top-Questions-Answered", read: "2026-11-14", what: "Home Power Panel backs up 25 A with one unit, 50 A with two" },
            { name: "Anker SOLIX support, Can I connect the F3800 to my generator's transfer switch or inlet box?", url: "https://support.ankersolix.com/s/article/Can-I-connect-Anker-SOLIX-F3800-to-the-same-transfer-switch-inlet-box-I-used-for-my-gas-generator-to-back-up-my-home", read: "2026-11-14", what: "neutral and ground must be connected" },
            { name: P.ankerHpp.name, url: P.ankerHpp.url, read: P.ankerHpp.retrieved, what: "licensed electrician required" },
            { name: P.ankerMts30.name, url: P.ankerMts30.url, read: P.ankerMts30.retrieved, what: "UL 1008 listed" },
            { name: P.bluettiAt1.name, url: P.bluettiAt1.url, read: P.bluettiAt1.retrieved, what: "compatible with Apex 300" },
            { name: "Bluetti, How to hook up a generator to the house (Oct 29 2026)", url: "https://www.bluettipower.com/blogs/articles/how-to-hook-up-a-generator-to-the-house-safely-and-efficiently", read: "2026-11-14", what: "listed transfer equipment or an approved interlock; neutral bonding" },
            { name: "Bluetti Apex 300 user manual V3.1 (PDF)", url: "https://s4.bluettipower.com/bluetti/purchasePageBiz/2025/12/Apex%20300%20User%20%20Manual%20US%20EN-FR-1764555919287-cde9.pdf", read: "2026-11-14", what: "14-50R and TT-30R outlet ratings" },
            { name: `${P.growattHub.name} product page`, url: P.growattHub.url, read: P.growattHub.retrieved, what: "two HELIOS 3600 units for 240 V" },
            { name: PARTS.cords.source.name, url: PARTS.cords.source.url, read: PARTS.cords.source.retrieved, what: "12-gauge outdoor cord prices" },
            ...panelReady.map(({ p }) => ({ name: `${fullName(p)} product page`, url: p.sourceUrl, read: p.retrieved })),
          ]}
        />
      </div>
    </article>
  );
}
