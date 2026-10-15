import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure } from "@/components/affiliate";
import { Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { BigStat, HubHero, MythCallout, PhotoCredit } from "@/components/ui";
import { lite } from "@/data/myths";
import { lifeSummary } from "@/lib/everyday";
import { PickCard, PriceFootnote, ProductListJsonLd, SpecTable } from "@/components/products";
import { COMPARISONS } from "@/data/comparisons";
import { PRODUCTS } from "@/data/products";
import { formatDate } from "@/lib/energy";
import { fullName, money, productById } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

const PATH = "/best-portable-power-stations";
const TITLE = "Best Portable Power Stations of 2026 (Solar Generators Compared)";
const DESCRIPTION =
  "The best portable power stations and solar generators for camping, CPAP, fridge backup, RVs and apartments, picked from a spec table of EcoFlow, Anker SOLIX, Jackery, Bluetti and DJI models with current prices.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const PICKS: { id: string; label: string; why: string }[] = [
  {
    id: "ecoflow-delta-3-max",
    label: "Our pick for outage backup",
    why: "The most battery for the money of any in-stock model we list. Leave the fridge plugged into it all the time: when the power cuts out it takes over in about a hundredth of a second, so the food stays cold and you may not even notice.",
  },
  {
    id: "anker-solix-c1000-gen-2",
    label: "Best value · apartments",
    why: "The cheapest full-size unit we found in stock. It refills from the wall in under an hour by Anker's figure and runs whisper-quiet (about 20 dB under light loads), so it suits a bedroom or small apartment. It can't take extra batteries later.",
  },
  {
    id: "ecoflow-delta-3-plus",
    label: "Best one that can grow",
    why: "Start small and add EcoFlow's extra batteries later (up to five times the capacity). Two solar inputs mean a couple of portable panels can refill it in a day, and it switches over fast enough to keep a computer or router running. 5-year warranty.",
  },
  {
    id: "jackery-explorer-1000-v2",
    label: "Best for camping",
    why: "The lightest full-size unit in our table, at 23.8 lb, with long-life LFP cells and up to a 5-year warranty (3 years plus 2 on registration). Enough outlets and solar input for a campsite. Jackery rates its cycles to 70% capacity, a lower bar than rivals' 80%.",
  },
  {
    id: "ecoflow-river-3-plus",
    label: "Best for CPAP and small loads",
    why: "A 10.4 lb box for $299 that switches over in about 10 ms, so a CPAP keeps running if the power blips. Add EcoFlow's extra battery to triple it. Check your own machine: our CPAP nights assume about 28 W with a heated humidifier, from ResMed's battery guide.",
  },
  {
    id: "anker-solix-f3000",
    label: "Best for RVs and vans",
    why: "Plugs straight into an RV with a TT-30 outlet that delivers its full output, takes a lot of solar, and grows to four times the capacity with Anker's batteries. At 91.5 lb it rolls rather than carries.",
  },
  {
    id: "anker-solix-f3800-plus",
    label: "Best for running home circuits",
    why: "240-volt power for a well pump or a transfer switch, lots of solar input, and room to grow into whole-home backup. It was $199 cheaper than the EcoFlow DELTA Pro 3 with more output when we checked.",
  },
];

export default function BestPowerStationsPage() {
  const all = PRODUCTS.filter((p) => p.category === "portable").sort((a, b) => a.capacityWh - b.capacityWh);
  const picks = PICKS.map((x) => ({ ...x, p: productById(x.id) }));
  const top = lifeSummary(picks[0].p.capacityWh);
  const cheapest = all.filter((p) => p.priceUsd != null).sort((a, b) => a.priceUsd! - b.priceUsd!)[0];

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
    <article>
      <ProductListJsonLd products={picks.map((x) => x.p)} path={PATH} name="Best portable power stations" />
      <HubHero
        image="power-station"
        crumbs={[{ name: "Best portable power stations", path: PATH }]}
        eyebrow="Backup power"
        title={<>The power goes out. <span className="text-amber-300">Your life doesn&apos;t.</span></>}
        sub={
          <>
            A portable power station is a big, quiet battery with ordinary outlets. Plug in the fridge, the Wi-Fi, a CPAP or a
            lamp, and keep going through a storm, a heat wave or a weekend off-grid. No gas, no fumes, no pull cord.
          </>
        }
      >
        <a href="#picks" className="btn btn-primary">See our picks</a>
        <Link href="/battery-calculator" className="btn btn-light">Find the right size for you</Link>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="text-sm text-muted mb-6">
        {all.length} models from EcoFlow, Anker SOLIX, Jackery, Bluetti and DJI. Prices and specs checked on the makers&apos; US
        sites on <time dateTime={all[0].retrieved}>{formatDate(all[0].retrieved)}</time>.
      </p>
      <AffiliateDisclosure className="mb-8" />

      <section aria-label="What a 2 kWh station runs" className="grid sm:grid-cols-3 gap-3">
        <BigStat tone="leaf" value={top.essentials} label="Fridge, Wi-Fi and lights" note={`On our top pick, the ${fullName(picks[0].p)}`} />
        <BigStat value={top.cpap} label="Of CPAP" note="8 hours a night, with a heated humidifier (ResMed figure)" />
        <BigStat tone="orange" value={`From ${money(cheapest.priceUsd!)}`} label="To get started" note={`The ${fullName(cheapest)}, when we checked`} />
      </section>

      <div className="mt-8 grid gap-3">
        <MythCallout m={lite("battery-without-solar")} />
      </div>

      <nav aria-label="Picks" className="mt-8">
        <h2 className="text-lg font-bold mb-3">Jump to a pick</h2>
        <ol className="grid sm:grid-cols-2 gap-2 text-sm">
          {picks.map((x) => (
            <li key={x.id}>
              <a href={`#pick-${x.id}`} className="block rounded-xl border border-black/8 bg-surface px-3 py-2 hover:border-amber-300">
                <span className="font-semibold">{x.label}:</span> {fullName(x.p)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Section title="Our picks, by what you need" id="picks">
        <div className="space-y-5">
          {picks.map((x) => (
            <PickCard key={x.id} p={x.p} label={x.label} why={x.why} />
          ))}
        </div>
        <PriceFootnote products={picks.map((x) => x.p)} />
      </Section>

      <Section title="Every model compared (full specs)" id="table">
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
      <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
