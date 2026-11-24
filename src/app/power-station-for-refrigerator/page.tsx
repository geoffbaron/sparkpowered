import type { Metadata } from "next";
import Link from "next/link";
import Byline from "@/components/Byline";
import WhatItRunsLinks from "@/components/WhatItRunsLinks";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PriceCell, PriceFootnote, ProductListJsonLd } from "@/components/products";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import { AFFILIATES } from "@/data/affiliates";
import { FridgePicker, type RuntimeOption } from "@/components/RuntimePicker";
import { BigStat, HubHero, OurPick, PhotoCredit } from "@/components/ui";
import type { Product } from "@/data/products";
import { formatDate } from "@/lib/energy";
import { FRIDGE_AVG_W, FRIDGE_KWH_YEAR, USABLE_FRACTION } from "@/lib/everyday";
import { fullName, productById } from "@/lib/products";
import { pageMetadata, pageUpdated } from "@/lib/seo";

const PATH = "/power-station-for-refrigerator";
const TITLE = "Power Station for a Refrigerator: How Long It Runs";
const DESCRIPTION =
  "How many hours each portable power station keeps a kitchen fridge cold in an outage. Bluetti, EcoFlow, Jackery and Anker compared on hours, output and weight, plus a calculator for your fridge.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const IDS = [
  "bluetti-ac180",
  "bluetti-elite-100-v2",
  "bluetti-elite-200-v2",
  "bluetti-elite-300",
  "bluetti-elite-400",
  "anker-solix-c1000-gen-2",
  "ecoflow-delta-3-max",
  "jackery-explorer-2000-v2",
  "growatt-infinity-2000-pro",
];

const hours = (wh: number) => (wh * USABLE_FRACTION) / FRIDGE_AVG_W;
const hText = (h: number) => (h < 36 ? `${Math.round(h)} hours` : `${Math.round((h / 24) * 2) / 2} days`);
const preorder = (p: Product) => p.notes.some((n) => /pre-order/i.test(n));
const outOfStock = (p: Product) => p.notes.some((n) => /out of stock/i.test(n) && !/back in stock|after being out/i.test(n));

function opt(p: Product): RuntimeOption {
  return { id: p.id, name: fullName(p), brand: AFFILIATES[p.brand].tracked ? p.brand : null, capacityWh: p.capacityWh, url: p.url };
}

export default function FridgePage() {
  const products = IDS.map(productById);
  const e200 = productById("bluetti-elite-200-v2");
  const e300 = productById("bluetti-elite-300");
  const e400 = productById("bluetti-elite-400");
  const ac180 = productById("bluetti-ac180");
  const delta = productById("ecoflow-delta-3-max");
  const fridgeWhDay = Math.round(FRIDGE_AVG_W * 24);

  const faqs = [
    {
      q: "How long will a power station run a refrigerator?",
      a: `Divide the usable watt-hours by what your fridge uses an hour. The average US home's fridges use ${FRIDGE_KWH_YEAR} kWh a year (EIA), about ${Math.round(FRIDGE_AVG_W)} W averaged over the day as the compressor cycles. So a 1 kWh station runs it about ${Math.round(hours(1024))} hours, a 2 kWh station about ${Math.round(hours(2048))} hours and a 3 kWh station about a day. A newer, smaller fridge does better: use the kWh figure on its yellow EnergyGuide label in our calculator.`,
    },
    {
      q: "What size power station do I need for a fridge?",
      a: `For a fridge through one night, about 1 kWh. To keep it cold for a full day without recharging, about 2.5 to 3 kWh, such as the Bluetti Elite 300 (${hText(hours(e300.capacityWh))}). Output matters too: the station's continuous watts must cover the fridge (usually a few hundred watts running) and its surge must cover the compressor start. A worst-case start (EWEB's generator-sizing figure) is about 2,900 W in all; the Bluetti AC180 and Elite 200 V2 list surge figures for heating-type loads only, so their specs don't confirm they start every fridge. Our what-it-runs pages show each model's limits.`,
    },
    {
      q: "Can a 1000 W power station run a refrigerator?",
      a: "Usually yes. A kitchen fridge runs at roughly 100 to 200 W while the compressor is on and spikes for a moment at start-up, which a 1,000 W-plus inverter with a motor surge rating handles. The limit is capacity (watt-hours), not output: a 1 kWh station gives you about half a day.",
    },
    {
      q: "Do I have to run the fridge all the time in an outage?",
      a: "No. FoodSafety.gov says a closed refrigerator keeps food safe for about 4 hours and a full freezer about 48 hours. Running the fridge a few hours on, a few hours off, with the door shut, stretches any battery much further than our continuous figures. Keep an appliance thermometer in the fridge: it must stay at 40°F or below, and food that has been above 40°F for two hours or more goes in the trash. When in doubt, throw it out.",
    },
    {
      q: "Is a power station better than a gas generator for a fridge?",
      a: "For a fridge and essentials, often yes: it is silent, needs no fuel and makes no fumes, so it can be used indoors next to the fridge. A gas generator suits long, whole-house outages but must run outdoors because of carbon monoxide. Add solar panels and a station can keep going for days.",
    },
  ];

  return (
    <article>
      <ProductListJsonLd products={products} path={PATH} name="Power stations for a refrigerator" />
      <HubHero
        image="outage"
        crumbs={[
          { name: "For a refrigerator", path: PATH },
        ]}
        byline={<Byline path={PATH} tone="dark" article={{ headline: TITLE, description: DESCRIPTION }} />}
        eyebrow="Fridge backup"
        title="How long a power station runs a refrigerator"
        sub={
          <>
            A 2 kWh battery runs a typical kitchen fridge for about {hText(hours(e200.capacityWh))}, worked out from EIA&apos;s
            average fridge use and each maker&apos;s published capacity.
          </>
        }
      >
        <a href="#picker" className="btn btn-primary">How long for my fridge?</a>
        
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <QuickAnswer>
          <p>
            <strong>A typical kitchen fridge uses about {fridgeWhDay.toLocaleString("en-US")} Wh a day</strong> ({FRIDGE_KWH_YEAR} kWh a year,
            EIA). So about 1 kWh of battery gets it through a night, and about 2.5 to 3 kWh through a full day without recharging.
          </p>
          <p>
            The station&apos;s continuous watts must cover the fridge while it runs, and its motor surge rating must cover the compressor
            start. With the door shut, food stays safe for about 4 hours without power (FoodSafety.gov), so running the fridge in shifts
            stretches any battery.
          </p>
        </QuickAnswer>

        <section aria-label="What it means" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat tone="leaf" value={hText(hours(e300.capacityWh))} label="Of fridge from about 3 kWh" note="For example, a Bluetti Elite 300" />
          <BigStat value={`${fridgeWhDay.toLocaleString("en-US")} Wh`} label="What a typical fridge uses a day" note={`${FRIDGE_KWH_YEAR} kWh a year (EIA)`} />
          <BigStat tone="orange" value="4 hours" label="Food stays safe with the door shut" note="FoodSafety.gov; keep it at 40°F or below" />
        </section>

        <section id="picker" className="mt-12 scroll-mt-24" aria-labelledby="picker-heading">
          <h2 id="picker-heading" className="text-2xl font-extrabold text-ink mb-2">How long will it keep your fridge cold?</h2>
          <p className="text-stone-700 mb-4 max-w-3xl">
            Pick your fridge and the outage length. For the most accurate answer, use the kWh per year on your fridge&apos;s yellow
            EnergyGuide label.
          </p>
          <FridgePicker options={products.map(opt)} />
        </section>


        <Section title="Hours of fridge, side by side" id="compare">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[46rem]">
              <caption className="sr-only">Hours each power station runs a typical refrigerator</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Power station</th>
                  <th scope="col" className="p-3 font-semibold text-right">Typical fridge</th>
                  <th scope="col" className="p-3 font-semibold text-right">Output</th>
                  <th scope="col" className="p-3 font-semibold text-right">Weight</th>
                  <th scope="col" className="p-3 font-semibold">Stock</th>
                  <th scope="col" className="p-3 font-semibold text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {[...products].sort((a, b) => a.capacityWh - b.capacityWh).map((p) => (
                  <tr key={p.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">
                      {AFFILIATES[p.brand].tracked ? (
                        <PartnerLink brand={p.brand} productId={p.id} productUrl={p.url}>{fullName(p)}</PartnerLink>
                      ) : (
                        <PlainLink href={p.url}>{fullName(p)}</PlainLink>
                      )}
                    </th>
                    <td className="p-3 text-right tabular-nums font-semibold">{hText(hours(p.capacityWh))}</td>
                    <td className="p-3 text-right tabular-nums">{p.acOutputW.toLocaleString("en-US")} W</td>
                    <td className="p-3 text-right tabular-nums">{p.weightLb ? `${p.weightLb} lb` : "Not stated"}</td>
                    <td className="p-3">{preorder(p) ? "Pre-order" : outOfStock(p) ? "Out of stock" : "Listed for sale"}</td>
                    <td className="p-3 text-right"><PriceCell p={p} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PriceFootnote products={products} />
          <p className="text-xs text-muted mt-1">Bluetti and Anker links are sponsored; EcoFlow and Jackery are plain links.</p>
        </Section>

        <section id="picks" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="picks-heading">
          <h2 id="picks-heading" className="text-2xl font-extrabold text-ink">Picks, if you are buying</h2>
          <AffiliateDisclosure />
          <OurPick
            label="Best for overnight outages (in stock)"
            name={fullName(e200)}
            why="Keeps a typical fridge running through the night with room for the Wi-Fi and phones, and is rated for 6,000 cycles, the most of any 2 kWh unit we list. Plug it in once and forget it until the lights go out."
            life={[`Fridge: ${hText(hours(e200.capacityWh))}`, `${e200.weightLb} lb, 5-year warranty`]}
            brand="bluetti"
            productId={e200.id}
            productUrl={e200.url}
            category="battery"
          />
          <OurPick
            label="Best for a full day"
            name={fullName(e300)}
            icon="home"
            why={`About a day of fridge, about half again what the Elite 200 V2 holds. Add a couple of solar panels and it can keep up for days. Pre-order when we checked.`}
            life={[`Fridge: ${hText(hours(e300.capacityWh))}`, "RV (TT-30) outlet too"]}
            brand="bluetti"
            productId={e300.id}
            productUrl={e300.url}
            category="battery"
            moreHref="/power-stations/bluetti-elite-300/what-it-runs"
            moreLabel="What the Elite 300 runs"
          />
          <OurPick
            label="Best for two-day outages"
            name={fullName(e400)}
            icon="shield"
            why="Nearly 4 kWh on wheels. About a day and a half of fridge on its own, or two days if you run the fridge in shifts. Pre-order when we checked."
            life={[`Fridge: ${hText(hours(e400.capacityWh))}`, `${e400.weightLb} lb, rolls on wheels`]}
            brand="bluetti"
            productId={e400.id}
            productUrl={e400.url}
            category="battery"
          />
          <OurPick
            label="Smallest that runs a fridge"
            name={fullName(ac180)}
            icon="battery"
            why="Half a day of fridge: enough for most short outages, and light enough to take camping afterwards."
            life={[`Fridge: ${hText(hours(ac180.capacityWh))}`, "1,800 W output"]}
            brand="bluetti"
            productId={ac180.id}
            productUrl={ac180.url}
            category="battery"
            moreHref="/power-stations/bluetti-ac180/what-it-runs"
            moreLabel="What the AC180 runs"
          />
          <OurPick
            label="Alternative from a maker that doesn't pay us"
            name={fullName(delta)}
            icon="battery"
            why="About the same capacity as the Elite 200 V2, with a 10 ms switchover. EcoFlow doesn't publish a cycle rating for it."
            life={[`Fridge: ${hText(hours(delta.capacityWh))}`, `${delta.weightLb} lb`]}
            brand={delta.brand}
            productId={delta.id}
            productUrl={delta.url}
            category="battery"
          />
        </section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;A battery can&apos;t start a fridge compressor.&quot;</strong> It can if the inverter is big enough. A fridge
              runs at a few hundred watts and spikes briefly when the compressor starts. Pick a station whose motor surge rating covers that
              spike: some makers&apos; surge figures (Bluetti&apos;s Power Lifting on the AC180 and Elite 200 V2) apply to heaters and kettles
              only.
            </Callout>
            <Callout>
              <strong>&quot;You need a gas generator for real outages.&quot;</strong> For the whole house, maybe. For the fridge, Wi-Fi
              and lights, a station is quieter, needs no fuel and can sit in the kitchen. Generators must run outdoors because of
              carbon monoxide.
            </Callout>
            <Callout>
              <strong>&quot;It has to run the fridge non-stop.&quot;</strong> No: a closed fridge keeps food safe about 4 hours. Run it
              in shifts and a 2 kWh station can cover a much longer outage. Keep an appliance thermometer in the fridge: it must stay at 40°F or below, and food that has been above 40°F for two hours or more goes in the trash. When in doubt, throw it out.
            </Callout>
          </div>
          <p className="text-sm text-stone-700 mt-4 max-w-3xl">
            Want the whole house, not just the fridge? Size it with the{" "}
            <Link href="/battery-calculator" className="text-spark-orange underline underline-offset-2">home battery sizer</Link>, or
            see what backup lasts in your area on your <Link href="/states" className="text-spark-orange underline underline-offset-2">state page</Link>.
          </p>
        </Section>

        <WhatItRunsLinks />

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Fridge use varies with size, age, the room&apos;s temperature and how often the door opens. Our figures use the EIA US
          average and assume {Math.round(USABLE_FRACTION * 100)}% of rated capacity is usable. Specifications are copied
          from makers&apos; US websites on the dates shown.
        </Disclaimer>
        <RelatedLinks
          links={[
            { href: "/home-battery-backup", label: "Home battery backup", desc: "When you need the whole house, not just the fridge" },
          ]}
        />
        <Sources checked={pageUpdated(PATH)}
          items={[
            { name: "EIA Residential Energy Consumption Survey 2020 (refrigerator electricity use)", url: "https://www.eia.gov/consumption/residential/data/2020/", detail: `${FRIDGE_KWH_YEAR} kWh a year per household` },
            { name: "FoodSafety.gov: Food safety during power outages", url: "https://www.foodsafety.gov/food-safety-charts/food-safety-during-power-outage", detail: "about 4 hours in a closed refrigerator, 48 in a full freezer" },
            ...products.map((p) => ({ name: `${fullName(p)} product page`, url: p.sourceUrl, detail: `checked ${formatDate(p.retrieved)}` })),
          ]}
        />
        <PhotoCredit name="outage" />
      </div>
    </article>
  );
}
