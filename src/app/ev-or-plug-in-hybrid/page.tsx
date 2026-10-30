import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import EvOrPhevPicker, { EvOrPhevPickerFromParams } from "@/components/EvOrPhevPicker";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { HubHero, MythCallout, PhotoCredit } from "@/components/ui";
import { lite } from "@/data/myths";
import { CALC_EVS, DEFAULT_EV_ID } from "@/lib/calculator-data";
import { COLD, DC_FAST, ICCT_PHEV, RULES, WINTER_MONTHS, decide, evYear, gasCarYear, phevYear, type Answers } from "@/lib/ev-or-phev";
import {
  DEFAULT_PHEV_ID,
  PHEV_SOURCE,
  PICKER_PHEVS,
  PICKER_STATES,
  PICKER_US,
  WINTER_SOURCE,
} from "@/lib/ev-or-phev-data";
import { NATIONAL, SOURCES, cents, formatDate, num, usd, ytdWindow } from "@/lib/energy";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/ev-or-plug-in-hybrid";
const TITLE = "EV or Plug-In Hybrid? Find Which Fits How You Drive";
const DESCRIPTION =
  "Answer five questions about your daily miles, where you can charge, road trips and towing to see whether an electric car, a plug-in hybrid or a regular hybrid fits, with yearly fuel costs for your state from EPA and EIA data.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const IRS_FAQ =
  "https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-act-obbb";

export default function EvOrPhevPage() {
  const ev = CALC_EVS.find((e) => e.id === DEFAULT_EV_ID)!;
  const phev = PICKER_PHEVS.find((p) => p.id === DEFAULT_PHEV_ID)!;
  const usPrices = { centsPerKwh: PICKER_US.centsPerKwh, gasUsd: PICKER_US.gasUsd, gasCarMpg: NATIONAL.gasMpg, winterTempF: null };
  const typical: Answers = { dailyMiles: 30, charging: "home", tripsPerYear: 4, tripMiles: 200, tows: false };
  const t = { ev: evYear(ev, typical, usPrices), phev: phevYear(phev, typical, usPrices), gas: gasCarYear(typical, usPrices) };
  const noPlug = phevYear(phev, { ...typical, charging: "rarely" }, usPrices);
  const work = phevYear(phev, { ...typical, charging: "work" }, usPrices);
  const longDay: Answers = { ...typical, dailyMiles: 70 };
  const ld = phevYear(phev, longDay, usPrices);
  const verdictTypical = decide(ev, phev, typical, usPrices);
  const ranges = PICKER_PHEVS.map((p) => p.electricRangeMiles).sort((a, b) => a - b);
  const medianRange = ranges[Math.floor(ranges.length / 2)];
  const coldStates = PICKER_STATES.filter((s) => s.winterTempF != null && s.winterTempF <= 32).length;
  const props = {
    states: PICKER_STATES,
    us: PICKER_US,
    evs: CALC_EVS,
    phevs: PICKER_PHEVS,
    defaultEvId: DEFAULT_EV_ID,
    defaultPhevId: DEFAULT_PHEV_ID,
    gasCarMpg: NATIONAL.gasMpg,
  };
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  const faqs = [
    {
      q: "Is a plug-in hybrid or an electric car better?",
      a: `It depends on where you can plug in and how far you drive. If you can charge at home and your usual day is within an EV's range, an electric car is usually cheapest to run: for 30 miles a day plus four 200-mile trips at US average prices, a ${ev.label} costs about ${usd(t.ev.totalUsd)} a year in electricity, a ${phev.label} about ${usd(t.phev.totalUsd)}, and an average 25.5 mpg gas car about ${usd(t.gas.totalUsd)}. A plug-in hybrid makes more sense if you tow or take frequent long trips, and neither pays off well if you cannot plug in regularly.`,
    },
    {
      q: "Is a plug-in hybrid worth it if I can't charge at home?",
      a: `Usually not. A plug-in hybrid that is never plugged in runs on gasoline, so you carry a battery you rarely use: in our model the ${phev.label} then runs ${pct(1 - noPlug.electricShare)} of its miles on gas. Charging only at work on weekdays still gives about ${pct(work.electricShare)} electric miles for a 30-mile day. With no charging at all, a regular hybrid is the simpler choice.`,
    },
    {
      q: "How far can a plug-in hybrid go on electricity?",
      a: `EPA electric ranges for ${PHEV_SOURCE.period} plug-in hybrids with at least 15 miles of range run from ${ranges[0]} to ${ranges[ranges.length - 1]} miles, with a middle value of ${medianRange} miles (fueleconomy.gov). Cold weather cuts that: real-world EV data shows about ${pct(COLD.at32F)} of normal range at 32°F and ${pct(COLD.at20F)} at 20°F (Recurrent).`,
    },
    {
      q: "Do plug-in hybrids really drive as many electric miles as the label says?",
      a: `Often not. An ICCT study of US data, including ${num(ICCT_PHEV.vehicles)} PHEVs measured automatically in California, found drivers use ${ICCT_PHEV.moreGasMin}%–${ICCT_PHEV.moreGasMax}% more gasoline and drive ${ICCT_PHEV.lessElectricMin}%–${ICCT_PHEV.lessElectricMax}% less on electricity than EPA labels assume, mostly because people plug in less than the label expects. A PHEV only saves what you plug it in for.`,
    },
    {
      q: "How much does fast charging cost on a road trip?",
      a: `Public DC fast charging averaged $${DC_FAST.usdPerKwh.toFixed(2)} per kWh across the US in the third quarter of 2026, excluding free chargers (Paren). That is several times the US average home price of ${cents(NATIONAL.residentialCentsPerKwhYtd)} per kWh (${ytdWindow()}, EIA), so an EV's road-trip miles cost more than its everyday miles.`,
    },
    {
      q: "Is there a federal tax credit for an EV or a plug-in hybrid?",
      a: "No. The IRS says the new clean vehicle credit (30D), the used clean vehicle credit (25E) and the commercial clean vehicle credit (45W) are not allowed for vehicles acquired after 30 September 2025. Some states and utilities still offer rebates.",
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "EV or Plug-In Hybrid Picker",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          dateModified: PHEV_SOURCE.retrieved,
        }}
      />
      <HubHero
        image="ev"
        crumbs={[{ name: "EV or plug-in hybrid?", path: PATH }]}
        eyebrow="Electric cars"
        title={<>EV or plug-in hybrid? <span className="text-amber-300">Pick the one that fits how you drive.</span></>}
        sub={
          <>
            A plug-in hybrid is only as electric as you plug it in. Tell us where you park, how far you drive and how
            often you take long trips, and we&apos;ll give you a straight answer with your state&apos;s prices.
          </>
        }
      >
        <a href="#picker" className="btn btn-primary">Find my fit</a>
        <Link href="/ev-charging-cost" className="btn btn-light">EV charging cost</Link>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Data updated <time dateTime={PHEV_SOURCE.retrieved}>{formatDate(PHEV_SOURCE.retrieved)}</time> ·{" "}
          <a href="#how" className="underline underline-offset-2 hover:text-spark-orange">How we decide</a>
        </p>
        <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl mb-8">
          <p>
            An <strong>electric car</strong> runs only on its battery: cheapest when you charge at home, but long trips
            mean fast-charging stops. A <strong>plug-in hybrid</strong> (PHEV) has a smaller battery, {ranges[0]} to {ranges[ranges.length - 1]}{" "}
            miles of EPA electric range on today&apos;s models, and a gas engine for
            everything past that. The right one depends less on the car than on your parking spot and your calendar.
          </p>
        </div>

        <h2 id="picker" className="text-2xl font-extrabold text-ink mb-4 scroll-mt-24">Five questions, one answer</h2>
        <Suspense fallback={<EvOrPhevPicker {...props} />}>
          <EvOrPhevPickerFromParams {...props} />
        </Suspense>

        <Section title="How we decide" id="how">
          <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
            <p>We check five rules in order. The first one that fits your answers decides:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>You can rarely or never plug in → a regular hybrid, or wait.</strong> A plug-in hybrid you
                can&apos;t charge runs on gasoline, and an EV would live on public fast chargers at about $
                {DC_FAST.usdPerKwh.toFixed(2)} per kWh.
              </li>
              <li>
                <strong>You tow a trailer or camper → a plug-in hybrid.</strong> Towing takes far more energy than normal
                driving, so an EV&apos;s range drops sharply. Check any model&apos;s tow rating.
              </li>
              <li>
                <strong>Your usual day is more than {RULES.dailyOverRange} times the PHEV&apos;s electric range → an EV.</strong>{" "}
                The plug-in hybrid would burn gas every day. At 70 miles a day the {phev.label} ({phev.electricRangeMiles}{" "}
                electric miles) runs only {pct(ld.dailyElectricShare)} of its everyday miles on electricity.
              </li>
              <li>
                <strong>You take {RULES.frequentTrips} or more road trips a year longer than the EV goes on a charge → a plug-in hybrid.</strong>{" "}
                We count a trip as needing a charging stop when one leg is longer than {pct(RULES.tripBuffer)}{" "}of the
                EV&apos;s EPA range, so you arrive with some charge to spare.
              </li>
              <li>
                <strong>Otherwise → an electric car.</strong> For 30 miles a day charged at home and four 200-mile trips
                a year, our answer is &quot;{verdictTypical.headline.toLowerCase()}&quot;.
              </li>
            </ol>
            <p>
              <strong>The costs.</strong> Each day a plug-in hybrid covers the smaller of your daily miles and its EPA
              electric range, on the days you plug in: every day for home charging, five days in seven for work
              charging, never for &quot;rarely&quot;. The rest of the day and all road-trip miles run on gas at the
              model&apos;s EPA gas-only mpg. An EV&apos;s everyday miles are charged at your state&apos;s average home
              price (we use the same price for work charging, though many workplaces charge less or nothing); its
              road-trip miles, and all its miles if you can&apos;t plug in, are at the public fast-charging average.
              The gas car is the EPA&apos;s {NATIONAL.gasMpg}{" "}mpg real-world average for new non-plug-in vehicles. All
              EPA ratings are measured at the wall, so they include charging losses. Prices are your state&apos;s
              average residential electricity price for {ytdWindow()} and latest weekly regular gasoline price (EIA).
            </p>
            <p>
              <strong>Cold winters.</strong> Where a state&apos;s normal December–February average temperature (NOAA,
              1991–2020) is at or below 32°F, we count {pct(COLD.at32F)} of normal electric range for those{" "}
              {WINTER_MONTHS} months, and {pct(COLD.at20F)}{" "}where it is at or below 20°F, from Recurrent&apos;s
              real-world data on 30,000+ EVs; each winter electric mile also takes that much more energy. That covers{" "}
              {coldStates}{" "}states. We apply the same figures to a PHEV&apos;s battery; some PHEVs also start the engine
              for cabin heat in the cold, so their real winter electric share can be lower.
            </p>
            <Callout tone="warn">
              <strong>Labels are optimistic about plug-in hybrids.</strong> The EPA label assumes the {phev.label} drives{" "}
              {pct(phev.labelElectricShare)}{" "}of its miles on electricity. ICCT&apos;s study of US data found real
              drivers go {ICCT_PHEV.lessElectricMin}%–{ICCT_PHEV.lessElectricMax}% less on electricity and use{" "}
              {ICCT_PHEV.moreGasMin}%–{ICCT_PHEV.moreGasMax}% more gasoline than labels assume, largely because they
              plug in less often. Our numbers assume you plug in as often as you told us; be honest with yourself about
              that answer.
            </Callout>
            <p className="text-sm text-muted">
              Fuel costs only: purchase price, insurance and maintenance are not included. Some PHEVs call for premium
              gasoline; we price regular and flag those models. Federal clean vehicle credits ended for vehicles acquired after 30
              September 2025 (IRS); see{" "}
              <Link href="/incentives" className="underline">
                2026 incentives
              </Link>{" "}
              for what is left.
            </p>
          </div>
        </Section>

        <div className="mt-8 grid gap-3">
          <MythCallout m={lite("cold-range")} />
          <MythCallout m={lite("chargers")} />
        </div>

        <Faq items={faqs} path={PATH} />
        <Disclaimer />
        <Sources
          items={[
            { name: PHEV_SOURCE.name, url: PHEV_SOURCE.url, detail: `${PHEV_SOURCE.period}; retrieved ${formatDate(PHEV_SOURCE.retrieved)}` },
            { name: SOURCES.vehicles.name, url: SOURCES.vehicles.url, detail: `electric cars, ${SOURCES.vehicles.period}` },
            { name: SOURCES.electricityPrice.name, url: SOURCES.electricityPrice.url, detail: SOURCES.electricityPrice.period },
            { name: SOURCES.gasoline.name, url: SOURCES.gasoline.url, detail: SOURCES.gasoline.period },
            { name: SOURCES.gasMpg.name, url: SOURCES.gasMpg.url, detail: SOURCES.gasMpg.note },
            { name: DC_FAST.label, url: DC_FAST.url, detail: `${DC_FAST.note} Read ${formatDate(DC_FAST.retrieved)}.` },
            { name: COLD.label, url: COLD.url, detail: `${pct(COLD.at32F)} of range at 32°F, ${pct(COLD.at20F)} at 20°F. Read ${formatDate(COLD.retrieved)}.` },
            { name: WINTER_SOURCE.name, url: WINTER_SOURCE.url, detail: `${WINTER_SOURCE.period}. ${WINTER_SOURCE.note}` },
            { name: ICCT_PHEV.label, url: ICCT_PHEV.url, detail: `Read ${formatDate(ICCT_PHEV.retrieved)}.` },
            { name: "IRS fact sheet FS-2025-05: clean vehicle credit end dates", url: IRS_FAQ, detail: "21 August 2025" },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/ev-charging-cost", label: "EV charging cost calculator", desc: "What any EV costs to charge at home in your state" },
            { href: "/best-home-ev-charger", label: "Best home EV charger", desc: "Lectron, Autel, Tesla and more compared" },
            { href: "/calculator", label: "EV Finder", desc: "Match an electric car to your budget and driving" },
            { href: "/myths", label: "EV questions, answered", desc: "Range, battery life, cold weather and more" },
            { href: "/incentives", label: "EV incentives in 2026", desc: "What federal help is left, and where to find state rebates" },
          ]}
        />
        <PhotoCredit name="ev" />
      </div>
    </div>
  );
}
