import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { BigStat, HubHero, OurPick, PhotoCredit } from "@/components/ui";
import { BATTERIES, BATTERY_FACTS } from "@/data/batteries";
import { BLUETTI_BOAT, BOATING_CHECKED, BOAT_CHARGERS } from "@/data/boating";
import { formatDate } from "@/lib/energy";
import { USABLE_FRACTION } from "@/lib/everyday";
import { money, productById } from "@/lib/products";
import { chargeCostUsd } from "@/lib/boating";
import { pageMetadata } from "@/lib/seo";
import { RedodoDeal } from "@/components/RedodoDeal";

const PATH = "/charge-lithium-battery-on-boat";
const TITLE = "How to Charge a Lithium Battery on a Boat: Chargers, Alternator and Solar";
const DESCRIPTION =
  "Three ways to keep a lithium trolling or house battery full on a boat: a lithium plug-in charger, a DC-to-DC charger off the engine, and solar. What each costs, and what not to do.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function ChargeOnBoatPage() {
  const dcdc = BOAT_CHARGERS.find((c) => c.id === "redodo-12v-40a-dc-dc-mppt")!;
  const c12 = BOAT_CHARGERS.find((c) => c.id === "redodo-14-6v-10a-charger")!;
  const c24 = BOAT_CHARGERS.find((c) => c.id === "redodo-29-2v-20a-charger")!;
  const c36 = BOAT_CHARGERS.find((c) => c.id === "redodo-43-8v-25a-charger")!;
  const d40 = BLUETTI_BOAT.d40;
  const b100 = BATTERIES.find((b) => b.id === "redodo-12v-100ah")!;
  const elite100 = productById("bluetti-elite-100-v2");
  const fullCharge = chargeCostUsd(b100.energyWh);
  const stationShare = Math.round(((elite100.capacityWh * USABLE_FRACTION) / b100.energyWh) * 100);
  // A 40 A DC-DC charger at 12.8 V puts in about 512 W, so a flat 1,280 Wh battery takes about 2.5 hours of engine running.
  const dcdcHours = b100.energyWh / (40 * 12.8);

  const faqs = [
    {
      q: "Can you charge a lithium battery with a regular battery charger?",
      a: "Only if it has a lithium (LiFePO4) setting. A charger made for lead-acid can stop short and leave the battery partly empty, and its desulfation or equalize mode can push the voltage too high. Redodo's figures for full charge are 14.4 V for 12 V batteries and 28.8 V for 24 V.",
    },
    {
      q: "Can you charge a lithium battery with the boat's alternator?",
      a: `Yes, through a DC-to-DC charger. A lithium battery will pull as much current as the alternator can give, which can overheat a small outboard's charging system. A DC-to-DC charger limits the current and charges at the right voltage: Redodo's 12V 40A unit (${money(dcdc.priceUsd)}) refills a flat 12V 100Ah lithium in about ${dcdcHours.toFixed(1)} hours of running.`,
    },
    {
      q: "Can you charge a lithium battery with a solar panel on a boat?",
      a: "Yes, with a solar charge controller set for lithium, or a DC-to-DC charger with a solar input such as Redodo's 40A with MPPT. A panel on a T-top or bimini can keep an electronics battery topped up between trips.",
    },
    {
      q: "How much does it cost to charge a trolling motor battery?",
      a: `Very little. Filling a flat 12V 100Ah lithium (${b100.energyWh.toLocaleString("en-US")} Wh) takes about ${money(Math.round(fullCharge * 100) / 100)} of electricity at the US average price. A whole season of weekend trips costs less than one tank of gas.`,
    },
    {
      q: "Can I charge a lithium battery in the cold?",
      a: "Not below 32°F (Battery University). Many lithium batteries, including most Redodo trolling batteries, pause charging below freezing and resume at 41°F; self-heating models warm up first and then charge.",
    },
  ];

  return (
    <article>
      <HubHero
        image="power-station"
        crumbs={[
          { name: "Boating", path: "/boating" },
          { name: "Charging lithium on a boat", path: PATH },
        ]}
        eyebrow="Charging lithium on a boat"
        title={<>Full battery every trip, <span className="text-amber-300">for about {money(Math.round(fullCharge * 100) / 100)} a charge.</span></>}
        sub={
          <>
            A lithium charger at home, a DC-to-DC charger off the engine, or a solar panel: here is which one you need, what it costs, and the
            one mistake that shortens a lithium battery&apos;s life.
          </>
        }
      >
        <a href="#ways" className="btn btn-primary">The three ways</a>
        <a href="#mistakes" className="btn btn-light">What not to do</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>At home or the dock:</strong> a plug-in lithium charger for your voltage, from{" "}
            <PartnerLink brand="redodo" productId={c12.id} productUrl={c12.url}>{money(c12.priceUsd)} for 12 V</PartnerLink>.
          </p>
          <p>
            <strong>While the engine runs:</strong> a DC-to-DC charger, such as the{" "}
            <PartnerLink brand="redodo" productId={dcdc.id} productUrl={dcdc.url}>Redodo 12V 40A with MPPT</PartnerLink> ({money(dcdc.priceUsd)}),
            which also takes a solar panel. Never wire a lithium battery straight to the alternator.
          </p>
        </QuickAnswer>

        <RedodoDeal className="mt-4" />

        <section aria-label="Charging at a glance" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat tone="leaf" value={money(Math.round(fullCharge * 100) / 100)} label="To fill a 12V 100Ah lithium" note="At 18.31¢ a kWh, the US average" />
          <BigStat value={`${dcdcHours.toFixed(1)} hr`} label="Engine time to refill it" note="Through a 40 A DC-to-DC charger" />
          <BigStat tone="orange" value="32°F" label="Never charge below this" note="Battery University" />
        </section>

        <section id="ways" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="ways-heading">
          <h2 id="ways-heading" className="text-2xl font-extrabold text-ink">Three ways to charge</h2>
          <OurPick
            label="1. Plug-in charger at home or the dock"
            name="A lithium charger matched to your voltage"
            icon="plug"
            why={`The simplest and cheapest way. Redodo sells one for each trolling voltage: 12 V (${money(c12.priceUsd)}), 24 V (${money(c24.priceUsd)}) and 36 V (${money(c36.priceUsd)}). ${c12.note}`}
            life={["Charges overnight", "Lithium voltage built in"]}
            priceUsd={c12.priceUsd}
            brand="redodo"
            productId={c12.id}
            productUrl={c12.url}
            category="battery"
            cta="See the 12 V charger"
          />
          <OurPick
            label="2. DC-to-DC charger off the engine"
            name={dcdc.name}
            icon="bolt"
            why={`${dcdc.note} It protects a small alternator from a lithium battery's appetite, and charges at the right voltage for lithium, AGM or gel.`}
            life={[`Flat 12V 100Ah: about ${dcdcHours.toFixed(1)} hours of running`, "Solar input built in"]}
            priceUsd={dcdc.priceUsd}
            brand="redodo"
            productId={dcdc.id}
            productUrl={dcdc.url}
            category="battery"
          />
          <OurPick
            label="Also good: Bluetti D40"
            name={d40.name}
            icon="bolt"
            why={`${d40.note} A good fit if you already own a Bluetti power station.`}
            life={["Up to 30 A", "Lithium, AGM and lead-acid"]}
            priceUsd={d40.priceUsd}
            brand="bluetti"
            productUrl={d40.url}
            category="battery"
          />
          <OurPick
            label="3. Away from shore power"
            name={`Bluetti ${elite100.model} power station`}
            icon="sun"
            why={`Camping at the lake with no hookup? A ${elite100.capacityWh.toLocaleString("en-US")} Wh power station can run a plug-in lithium charger and put back about ${stationShare}% of a 12V 100Ah battery, then recharge itself from solar panels during the day.`}
            life={[`About ${stationShare}% of a 12V 100Ah`, `${elite100.weightLb} lb`]}
            priceUsd={elite100.priceUsd}
            brand="bluetti"
            productId={elite100.id}
            productUrl={elite100.url}
            category="battery"
          />
        </section>

        <Section title="Mistakes that shorten a lithium battery's life" id="mistakes">
          <div className="grid gap-3">
            <Callout>
              <strong>Using a lead-acid charger with desulfation or equalize on.</strong> Those modes push the voltage high on purpose. Use a lithium
              setting, or a charger made for LiFePO4.
            </Callout>
            <Callout>
              <strong>Charging below freezing.</strong> Lithium must not be charged below 32°F (
              <a href={BATTERY_FACTS.coldCharging.url} className="underline" rel="noopener">Battery University</a>). Bring it inside, or buy one that
              pauses charging or heats itself.
            </Callout>
            <Callout>
              <strong>Wiring it straight to the outboard&apos;s charging lead.</strong> Put a DC-to-DC charger in between so the alternator isn&apos;t
              run flat out for hours. Our sister site CamperVolts shows{" "}
              <a href="https://campervolts.com/dc-dc-charger-sizing" className="underline">what size DC-to-DC charger</a> you need and how to set up a{" "}
              <a href="https://campervolts.com/boat-house-battery" className="underline">boat house battery</a>.
            </Callout>
          </div>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;Lithium needs babysitting.&quot;</strong> Less than lead-acid. There&apos;s no water to top up, it doesn&apos;t need a full
              charge after every trip to stay healthy, and the battery&apos;s own management system stops it overcharging.
            </Callout>
            <Callout>
              <strong>&quot;Charging gear makes lithium too expensive.&quot;</strong> A lithium charger starts at {money(c12.priceUsd)}. Many marine
              on-board chargers already have a lithium mode; check yours before buying anything.
            </Callout>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Follow your battery, charger and engine makers&apos; wiring instructions and fuse every connection. Prices are copied from makers&apos; US
          websites on {formatDate(BOATING_CHECKED)} and change often. Redodo and Bluetti links are sponsored.
        </Disclaimer>
        <Sources
          items={[
            ...[dcdc, c12, c24, c36].map((c) => ({ name: c.name, url: c.url, detail: `checked ${formatDate(c.retrieved)}` })),
            { name: d40.name, url: d40.url, detail: `checked ${formatDate(BLUETTI_BOAT.retrieved)}` },
            { name: `Bluetti ${elite100.model}`, url: elite100.url, detail: `checked ${formatDate(elite100.retrieved)}` },
            { name: BATTERY_FACTS.coldCharging.name, url: BATTERY_FACTS.coldCharging.url },
            { name: "EIA average residential electricity price", url: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a", detail: "July 2026" },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/boating", label: "Electric boating and fishing", desc: "Every guide in one place" },
            { href: "/best-trolling-motor-battery", label: "Best trolling motor battery", desc: "Our picks for 12, 24 and 36 V" },
            { href: "/electric-outboard-motor", label: "Electric outboard motors", desc: "Prices, range and cost vs gas" },
            { href: "/lithium-vs-agm-battery", label: "Lithium vs AGM", desc: "The cost per year, worked out" },
          ]}
        />
        <p className="text-sm text-muted mt-6">
          Want to charge from the sun at home? See <Link href="/plug-in-solar" className="underline">plug-in solar</Link>.
        </p>
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
