import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure } from "@/components/affiliate";
import { Breadcrumbs, Callout, Disclaimer, Faq, PageIntro, RelatedLinks, Section, Sources } from "@/components/content";
import { PickCard, PriceFootnote, ProductListJsonLd, SpecTable } from "@/components/products";
import { COMPARISONS } from "@/data/comparisons";
import { PRODUCTS } from "@/data/products";
import { formatDate } from "@/lib/energy";
import { fullName, productById } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

const PATH = "/best-portable-power-stations";
const TITLE = "Best Portable Power Stations of 2026 (Solar Generators Compared)";
const DESCRIPTION =
  "The best portable power stations and solar generators for camping, CPAP, fridge backup, RVs and apartments, picked from a spec table of EcoFlow, Anker SOLIX, Jackery, Bluetti and DJI models with current prices.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const PICKS: { id: string; label: string; why: string }[] = [
  {
    id: "anker-solix-c1000-gen-2",
    label: "Best value at 1 kWh · apartments",
    why: "The cheapest 1 kWh unit we list that was in stock, with 2,000 W of continuous output and a 49-minute wall recharge by Anker's figure. Anker rates it at about 20 dB under light loads, which suits a bedroom or small apartment. It cannot take extra batteries, and Anker's US page does not state its chemistry or warranty.",
  },
  {
    id: "ecoflow-delta-3-plus",
    label: "Best 1 kWh that can grow",
    why: "Same 1 kWh LFP battery and 1,800 W output as the DELTA 3, but with two solar inputs totaling 1,000 W, so a couple of portable panels can refill it in a day. It accepts EcoFlow's extra batteries up to 5 kWh and switches over in under 10 ms, fast enough to protect a computer or router as a UPS. 5-year warranty.",
  },
  {
    id: "jackery-explorer-1000-v2",
    label: "Best for camping",
    why: "The lightest 1 kWh unit in our table at 23.8 lb, with LFP cells and a 5-year warranty (3 years plus 2 on registration). Three AC outlets and 400 W of solar input are enough for a campsite. Note Jackery's 4,000-cycle rating is to 70% capacity, a lower bar than rivals' 80%.",
  },
  {
    id: "ecoflow-river-3-plus",
    label: "Best for CPAP and small loads",
    why: "286 Wh in a 10.4 lb box for $299, with a sub-10 ms UPS switchover so a CPAP keeps running if the power blips. A CPAP drawing 40 W (check your machine's rating) would run roughly 6 hours on 85% of its capacity; an EcoFlow extra battery takes it to 858 Wh.",
  },
  {
    id: "ecoflow-delta-3-max",
    label: "Best for a fridge and essentials",
    why: "2 kWh and 2,400 W for $899 when we checked, the lowest price per kWh of any in-stock unit we list. That is enough to run a typical fridge, lights, internet and phones through an overnight outage, and its 10 ms switchover means the fridge can stay plugged into it full time.",
  },
  {
    id: "anker-solix-f3000",
    label: "Best for RVs and vans",
    why: "A TT-30 RV outlet that delivers the full 3,600 W, 3 kWh of LFP storage, and 2,400 W of solar input across two ports. It expands to 12.3 kWh with BP3000 batteries. At 91.5 lb it rolls rather than carries, and it is 120 V only unless you pair two.",
  },
  {
    id: "anker-solix-f3800-plus",
    label: "Best for home circuits (120/240 V)",
    why: "6,000 W of 120/240-volt output for a well pump or a transfer switch, 3,200 W of solar input and expansion to 26.9 kWh. It was $199 cheaper than the EcoFlow DELTA Pro 3 with more output; the Jackery Explorer 5000 Plus is the pick if you want more capacity in one box.",
  },
];

export default function BestPowerStationsPage() {
  const all = PRODUCTS.filter((p) => p.category === "portable").sort((a, b) => a.capacityWh - b.capacityWh);
  const picks = PICKS.map((x) => ({ ...x, p: productById(x.id) }));

  const faqs = [
    {
      q: "What size portable power station do I need?",
      a: "Add up the watts of what you'll run and the hours you'll run it, then allow about 15 to 20 percent for inverter losses. A 1 kWh station runs 100 W of devices for roughly 8 to 9 hours. For a fridge and essentials through a night, 2 kWh is a comfortable size; to back up home circuits for a day, look at 4 kWh and up with 120/240 V output, or use our battery sizer.",
    },
    {
      q: "What is the difference between a portable power station and a solar generator?",
      a: "Mostly marketing. A solar generator is a portable power station sold with solar panels. The station is a battery with an inverter and outlets; the panels recharge it. Any station with a solar input can be a solar generator if you add compatible panels.",
    },
    {
      q: "LFP or NMC: which battery chemistry is better?",
      a: "LFP (lithium iron phosphate) is now standard on nearly every new model we list. It is rated for thousands of cycles and is more thermally stable than the NMC cells older models used, at the cost of some extra weight. Check that the cycle rating is to 80% capacity; some makers rate to 70%.",
    },
    {
      q: "Can a portable power station run a refrigerator?",
      a: "Yes, if its continuous output covers the fridge's running watts and its surge rating covers the compressor's start-up. Every 1 kWh-plus model in our table has at least 1,500 W continuous and 2,700 W surge or more where stated, which covers a typical household fridge. Capacity sets how long: check your fridge's yearly kWh on its EnergyGuide label and divide by 365 for a daily figure.",
    },
    {
      q: "Can I use a portable power station as a UPS?",
      a: "Many can. Look for a stated switchover time: models at 10 ms or less, such as the EcoFlow DELTA 3 series and the Anker C1000 Gen 2, are quick enough for most computers and routers. Jackery lists 20 ms for its v2 models.",
    },
  ];

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ProductListJsonLd products={picks.map((x) => x.p)} path={PATH} name="Best portable power stations" />
      <Breadcrumbs items={[{ name: "Best portable power stations", path: PATH }]} />
      <PageIntro
        eyebrow="Buying guide"
        title="The best portable power stations of 2026"
        lede={
          <>
            Picks for camping, CPAP, fridge backup, RVs and apartments, chosen from the published specs and current US
            prices of {all.length} power stations from EcoFlow, Anker SOLIX, Jackery, Bluetti and DJI.
          </>
        }
      />
      <p className="text-sm text-muted -mt-6 mb-6">
        Prices and specs checked on the makers&apos; US sites on <time dateTime={all[0].retrieved}>{formatDate(all[0].retrieved)}</time>.
      </p>
      <AffiliateDisclosure className="mb-8" />

      <Callout>
        <strong>Quick answer:</strong> for most homes, a 2 kWh LFP station such as the {fullName(productById("ecoflow-delta-3-max"))}{" "}
        covers a fridge and essentials overnight, and it had the lowest price per kWh of any in-stock model we list. For
        camping, a 1 kWh unit around 24 lb is the sweet spot.
      </Callout>

      <nav aria-label="Picks" className="mt-8">
        <h2 className="text-lg font-bold mb-3">Our picks</h2>
        <ol className="grid sm:grid-cols-2 gap-2 text-sm">
          {picks.map((x) => (
            <li key={x.id}>
              <a href={`#pick-${x.id}`} className="block rounded-lg border border-black/8 bg-surface px-3 py-2 hover:border-amber-300">
                <span className="font-semibold">{x.label}:</span> {fullName(x.p)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Section title="Best portable power stations by use" id="picks">
        <div className="space-y-5">
          {picks.map((x) => (
            <PickCard key={x.id} p={x.p} label={x.label} why={x.why} />
          ))}
        </div>
        <PriceFootnote products={picks.map((x) => x.p)} />
      </Section>

      <Section title="Every model compared" id="table">
        <p className="text-stone-700 leading-relaxed max-w-3xl mb-4">
          Sorted by capacity. Swipe sideways on a phone. &quot;Expands to&quot; uses the maker&apos;s own add-on batteries on
          one unit. A dash means the maker does not publish the figure on its US page.
        </p>
        <SpecTable products={all} caption="Portable power stations compared by published specs and price" />
        <PriceFootnote products={all} />
        <p className="text-sm text-stone-700 mt-4">
          Bigger whole-home systems such as the EcoFlow DELTA Pro Ultra, Bluetti Apex 300 and installed batteries are on
          our{" "}
          <Link href="/home-battery-backup" className="text-spark-orange underline underline-offset-2">home battery backup</Link>{" "}
          guide.
        </p>
      </Section>

      <Section title="Head-to-head comparisons" id="compare">
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {COMPARISONS.map((c) => (
            <li key={c.slug}>
              <Link href={`/compare/${c.slug}`} className="text-spark-orange underline underline-offset-2">{c.title}</Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="How we chose" id="how-we-chose">
        <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
          <p>
            We started from the current US line-ups of the five brands that dominate searches for power stations, kept
            models that were listed for sale on the maker&apos;s US site, and copied their specifications and prices from
            those pages on the date shown. We have not lab-tested these units, and we publish no star ratings.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Price per kWh</strong> at the listed price, because sale prices swing widely.</li>
            <li><strong>LFP chemistry</strong> and a cycle rating stated to 80% capacity.</li>
            <li><strong>Continuous and surge output</strong> high enough for the use (a fridge compressor, an RV air conditioner, a well pump).</li>
            <li><strong>Solar input</strong>, which decides how fast it refills off-grid.</li>
            <li><strong>Expansion</strong>, UPS switchover time and warranty, where stated.</li>
            <li><strong>Availability:</strong> we avoid picking models that were out of stock, and say so when we list them.</li>
          </ul>
          <p>
            Commissions play no part: some brands pay us when you buy through our links and others do not, and the
            picks would be the same either way. See our{" "}
            <Link href="/disclaimer#affiliate-disclosure" className="underline">affiliate disclosure</Link>.
          </p>
        </div>
      </Section>

      <Faq items={faqs} path={PATH} />
      <Disclaimer>
        Specifications and prices are copied from manufacturers&apos; US websites on the date shown and change often,
        especially during sales. Confirm them with the seller before you buy.
      </Disclaimer>
      <Sources items={all.map((p) => ({ name: `${fullName(p)} product page`, url: p.sourceUrl, detail: `checked ${formatDate(p.retrieved)}` }))} />
      <RelatedLinks
        links={[
          { href: "/battery-calculator", label: "Battery sizer", desc: "How many kWh you need for your outage" },
          { href: "/home-battery-backup", label: "Home battery backup", desc: "Whole-home vs portable, with real costs" },
          { href: "/plug-in-solar", label: "Plug-in solar", desc: "Small solar kits that plug into an outlet" },
          { href: "/compare", label: "All comparisons", desc: "EcoFlow, Anker, Jackery and Bluetti head to head" },
        ]}
      />
    </article>
  );
}
