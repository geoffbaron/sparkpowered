import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { RedodoSaleCallout } from "@/components/SaleCallout";
import { Callout, Faq, Section } from "@/components/content";
import { Icon } from "@/components/icons";
import { BigStat, HubHero, PhotoCredit } from "@/components/ui";
import { LEAD_ACID_REF } from "@/data/batteries";
import { BOATING_CHECKED, ELECTRIC_OUTBOARDS, PISCIFUN_GEAR } from "@/data/boating";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import { ELECTRIC_HOUR_USD, GAS_HOUR_USD, RUNTIME_BATTERIES, hoursLabel, runtimeFor, seasonFuel } from "@/lib/boating";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/boating";
const TITLE = "Electric Boating and Fishing: Fish Longer, Spend Less";
const DESCRIPTION =
  "Lithium trolling motor batteries, electric outboards and fish finder batteries, with real prices and hours on the water. How electric power saves anglers and boaters money every season.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const GUIDES = [
  { href: "/trolling-motor-battery-life", icon: "chart", title: "How long will my trolling motor battery last?", desc: "A calculator: pick your motor, speed and battery, get hours on the water." },
  { href: "/best-trolling-motor-battery", icon: "battery", title: "Best trolling motor battery", desc: "12, 24 and 36 V lithium picks, with what they save over AGM." },
  { href: "/kayak-trolling-motor-battery", icon: "water", title: "Kayak trolling motor battery", desc: "An 11 lb battery for a whole morning of fishing." },
  { href: "/electric-outboard-motor", icon: "quiet", title: "Electric outboard motors", desc: "ePropulsion, Mercury Avator and Torqeedo prices, range and cost vs gas." },
  { href: "/fish-finder-battery", icon: "bolt", title: "Fish finder battery", desc: "How long your screens and live sonar run on each size." },
  { href: "/24v-vs-36v-trolling-motor", icon: "arrow", title: "24V vs 36V trolling motor", desc: "More push, or one less battery to buy and carry." },
  { href: "/charge-lithium-battery-on-boat", icon: "plug", title: "Charging lithium on a boat", desc: "Plug-in, alternator and solar, and the mistakes to avoid." },
  { href: "/lithium-vs-agm-battery", icon: "dollar", title: "Lithium vs AGM", desc: "Which costs less per year, worked out with today's prices." },
];

export default function BoatingHub() {
  const [agm12, , li100] = RUNTIME_BATTERIES[12];
  const agmHalf = runtimeFor("55-12", "half", agm12.id);
  const liHalf = runtimeFor("55-12", "half", li100.id);
  const s100 = seasonFuel(100);
  const spirit = ELECTRIC_OUTBOARDS.find((o) => o.id === "epropulsion-spirit-1-evo")!;
  const reel = PISCIFUN_GEAR.electricReel;

  const faqs = [
    {
      q: "Is it worth switching a fishing boat to lithium?",
      a: `For most anglers who fish more than a handful of days a year, yes. A 12V 100Ah lithium runs a 55 lb motor ${hoursLabel(liHalf)} at half speed against ${hoursLabel(agmHalf)} for a 100Ah AGM, weighs ${li100.weightLb} lb against ${LEAD_ACID_REF.weightLb}, and is rated for many times the cycles, so it costs less per season.`,
    },
    {
      q: "Is an electric outboard cheaper to run than gas?",
      a: `Yes, by a wide margin per hour: about ${Math.round(ELECTRIC_HOUR_USD * 100)}¢ an hour at full throttle on a 1 kW electric against about ${money(Math.round(GAS_HOUR_USD * 100) / 100)} in fuel for a 2.3 hp gas outboard, at US average prices. The catch is the purchase price, about $1,200 to $1,600 more for a small motor.`,
    },
    {
      q: "What size battery do I need for a trolling motor?",
      a: "Match the motor's voltage first (12, 24 or 36 V), then pick the amp-hours for the hours you fish. Our runtime calculator shows the hours for each motor and battery.",
    },
  ];

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${url(PATH)}#page`,
          name: TITLE,
          url: url(PATH),
          hasPart: GUIDES.map((g) => ({ "@type": "WebPage", name: g.title, url: url(g.href) })),
        }}
      />
      <HubHero
        image="power-station"
        eyebrow="Electric boating and fishing"
        title={<>Fish longer. <span className="text-amber-300">Spend less on every trip.</span></>}
        sub={
          <>
            Lithium batteries give you twice the hours of lead-acid at a third of the weight, and electric outboards run for pennies an hour.
            Here is the money side of going electric on the water, with real prices.
          </>
        }
      >
        <Link href="/trolling-motor-battery-life" className="btn btn-primary">How long will my battery last?</Link>
        <a href="#guides" className="btn btn-light">All boating guides</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <section aria-label="What electric power saves on the water" className="grid sm:grid-cols-3 gap-3">
          <BigStat tone="leaf" value={`${hoursLabel(liHalf).replace("about ", "")}`} label="Of fishing on one lithium" note={`55 lb motor, half speed: 100Ah lithium vs AGM (${hoursLabel(agmHalf).replace("about ", "")})`} />
          <BigStat value={`${Math.round(LEAD_ACID_REF.weightLb - (li100.weightLb ?? 0))} lb`} label="Less to lift into the boat" note={`${li100.weightLb} lb lithium vs ${LEAD_ACID_REF.weightLb} lb AGM`} />
          <BigStat tone="orange" value={money(Math.round(s100.saved))} label="Fuel saved per 100 hours" note="Small electric outboard vs 2.3 hp gas" />
        </section>

        <section id="guides" className="mt-12 scroll-mt-24" aria-labelledby="guides-heading">
          <h2 id="guides-heading" className="text-2xl font-extrabold text-ink mb-4">Boating and fishing guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {GUIDES.map((g) => (
              <Link
                key={g.href}
                href={g.href}
                className="group rounded-2xl bg-white border border-black/10 p-5 shadow-sm hover:border-spark-orange transition-colors flex gap-4"
              >
                <span className="text-spark-orange shrink-0" aria-hidden="true"><Icon name={g.icon} size={32} /></span>
                <span>
                  <span className="block font-extrabold text-ink group-hover:text-spark-orange">{g.title}</span>
                  <span className="block text-sm text-stone-700 mt-1">{g.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <Section title="Where the money goes, and where it stays" id="money">
          <div className="grid gap-3">
            <Callout>
              <strong>Batteries.</strong> One 12V 100Ah lithium ({money(li100.priceUsd ?? 0)} when we checked) gives the usable power of two 100Ah AGMs
              ({money(2 * LEAD_ACID_REF.priceUsd)}) and is rated for 4,000 full cycles against the AGM&apos;s {LEAD_ACID_REF.cycles} half cycles.
              See the <Link href="/lithium-vs-agm-battery" className="underline">year-by-year cost</Link>.
            </Callout>
            <RedodoSaleCallout />
            <Callout>
              <strong>Motors.</strong> A small electric outboard such as the ePropulsion Spirit 1.0 ({money(spirit.packagePriceUsd ?? 0)} with battery)
              costs more than a gas motor up front, then about {Math.round(ELECTRIC_HOUR_USD * 100)}¢ an hour to run, with no oil, plugs or winterizing.
              See <Link href="/electric-outboard-motor" className="underline">electric outboard prices and running costs</Link>.
            </Callout>
            <Callout>
              <strong>Charging.</strong> Filling a 12V 100Ah lithium costs about a quarter at the US average power price.{" "}
              <Link href="/charge-lithium-battery-on-boat" className="underline">How to charge on the boat</Link>.
            </Callout>
            <Callout>
              <strong>House battery.</strong> Running a fridge, lights and electronics off a cabin battery bank? Our sister site CamperVolts sizes a{" "}
              <a href="https://campervolts.com/boat-house-battery" className="underline">boat house battery</a> and what it costs.
            </Callout>
          </div>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;Lithium is too expensive.&quot;</strong> Per battery, yes. Per season, no: one lithium does the work of two AGMs and lasts
              far more cycles. For a kayak, a 12V 50Ah lithium costs about the same as the 100Ah AGM it replaces.
            </Callout>
            <Callout>
              <strong>&quot;Electric outboards can&apos;t handle real water.&quot;</strong> Small ones are made for dinghies and jon boats at 3 to 5 mph
              for hours; bigger ones such as the Mercury Avator 35e are rated like a 9.9 hp four-stroke. Pick the size for your boat, as with gas.
            </Callout>
            <Callout>
              <strong>&quot;Lithium and water don&apos;t mix.&quot;</strong> Marine lithium batteries use lithium iron phosphate, the most stable lithium
              chemistry, in sealed cases; several of our picks are rated IP65 or IP67 against spray and rain.
            </Callout>
          </div>
        </Section>

        <Section title="Electric on the line, too" id="reel">
          <p className="max-w-3xl">
            Electric power isn&apos;t only for the motor. Piscifun&apos;s{" "}
            <PartnerLink brand="piscifun" productUrl={reel.url}>AtlantiX 1500 electric reel</PartnerLink> ({money(reel.priceUsd)}) weighs 17 oz and
            runs on its own rechargeable battery; Piscifun says a charge is good for up to 180 drops to 165 ft with a 14 oz lure, which saves
            your arm on a long day of deep jigging.
          </p>
          <p className="text-xs text-muted mt-2">Piscifun price checked {formatDate(reel.retrieved)}. Piscifun links are sponsored.</p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <p className="text-xs text-muted mt-6">
          Figures checked {formatDate(BOATING_CHECKED)}; sources are listed on each guide.
        </p>
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
