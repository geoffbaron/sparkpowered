import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ChargingCalculator, { ChargingCalculatorFromParams } from "@/components/ChargingCalculator";
import {
  Breadcrumbs,
  Callout,
  Disclaimer,
  Faq,
  PageIntro,
  RelatedLinks,
  Section,
  Sources,
} from "@/components/content";
import { CALC_EVS, CALC_STATES, CALC_US, DEFAULT_EV_ID } from "@/lib/calculator-data";
import {
  DATA_UPDATED,
  MONTHLY_MILES,
  NATIONAL,
  SOURCES,
  STATES,
  cents,
  chargingFigures,
  evCostPer100,
  gasCostPer100,
  nationalRateUsd,
  num,
  referenceEv,
  usd,
  ytdWindow,
} from "@/lib/energy";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/ev-charging-cost";
const TITLE = "EV Charging Cost Calculator by State (2026 Rates)";
const DESCRIPTION =
  "What it costs to charge an electric car at home in your state, from EIA electricity prices and EPA ratings for every 2026 EV, compared with gasoline. All 50 states.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function EvChargingCostPage() {
  const typical = referenceEv("typical");
  const efficient = referenceEv("efficient");
  const large = referenceEv("large");
  const rows = STATES.map((s) => ({ s, c: chargingFigures(s) })).sort((a, b) => a.c.evPer100 - b.c.evPer100);
  const cheapest = rows[0];
  const priciest = rows[rows.length - 1];
  const usEv = evCostPer100(nationalRateUsd(), typical.kwhPer100mi);
  const usGas = gasCostPer100(NATIONAL.gasolineUsdPerGallon);
  const props = { states: CALC_STATES, evs: CALC_EVS, us: CALC_US, defaultEvId: DEFAULT_EV_ID };

  const faqs = [
    {
      q: "How much does it cost to charge an electric car at home?",
      a: `At the US average residential price of ${cents(NATIONAL.residentialCentsPerKwhYtd)} per kWh (${ytdWindow()}, EIA), a ${typical.year} ${typical.make} ${typical.model} rated at ${typical.kwhPer100mi} kWh per 100 miles costs about ${usd(usEv, 2)} per 100 miles, or about ${usd((usEv * MONTHLY_MILES) / 100)} for ${num(MONTHLY_MILES)} miles a month. State averages range from ${usd(cheapest.c.evPer100, 2)} per 100 miles in ${cheapest.s.name} to ${usd(priciest.c.evPer100, 2)} in ${priciest.s.name}.`,
    },
    {
      q: "How do you calculate EV charging cost?",
      a: "Multiply the car's energy use in kWh per 100 miles by your electricity price in dollars per kWh. That gives the cost per 100 miles. EPA kWh-per-100-mile ratings are measured at the wall outlet, so they already include charging losses.",
    },
    {
      q: "Is charging an EV cheaper than buying gas?",
      a: `On national averages, yes. Regular gasoline averaged ${usd(NATIONAL.gasolineUsdPerGallon, 2)} a gallon in the week of ${SOURCES.gasoline.period?.replace("week of ", "")} (EIA), so a 25.5 mpg car costs about ${usd(usGas, 2)} per 100 miles, versus about ${usd(usEv, 2)} for a compact electric SUV charged at home. Relying on public DC fast charging, which usually costs more per kWh than home electricity, narrows or can erase that gap.`,
    },
    {
      q: "How much does it cost to fully charge an EV?",
      a: "Multiply the energy you add by your price per kWh, then allow a little extra because some energy is lost as heat while charging. For example, adding 75 kWh at 18 cents per kWh costs $13.50 before those losses. Most drivers top up from partly full, so a typical night's charge costs less. For per-mile costs, use the calculator above: EPA ratings already include charging losses.",
    },
    {
      q: "Does charging at night save money?",
      a: "Only if your utility offers a time-of-use or EV rate plan with cheaper overnight prices. On a flat-rate plan the price is the same at any hour. Many utilities offer such plans; check your utility's website or the state incentive links on our state pages.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "EV Charging Cost Calculator",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          dateModified: DATA_UPDATED,
        }}
      />
      <Breadcrumbs items={[{ name: "EV charging cost", path: PATH }]} />
      <PageIntro
        eyebrow="Free calculator"
        title="EV charging cost calculator"
        lede={
          <>
            Charging an electric car at home costs about <strong>{usd(usEv, 2)} per 100 miles</strong> at
            the US average electricity price — versus {usd(usGas, 2)} for gasoline in a 25.5 mpg car. Your
            number depends on where you live and what you drive. Pick both below.
          </>
        }
        updated={DATA_UPDATED}
      />

      <Suspense fallback={<ChargingCalculator {...props} />}>
        <ChargingCalculatorFromParams {...props} />
      </Suspense>

      <Section title="How the calculation works" id="how">
        <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
          <p>
            <strong>Cost per 100 miles = kWh per 100 miles × price per kWh.</strong> We take each car&apos;s
            combined energy use from the EPA ratings on fueleconomy.gov, which are measured at the wall and so
            include the energy lost while charging. Electricity prices are each state&apos;s average
            residential price for {ytdWindow()} from the US Energy Information Administration.
          </p>
          <p>
            Worked example: a {efficient.year} {efficient.make} {efficient.model} uses {efficient.kwhPer100mi}{" "}
            kWh per 100 miles. At the US average of {cents(NATIONAL.residentialCentsPerKwhYtd)}, that is{" "}
            {efficient.kwhPer100mi} × ${nationalRateUsd().toFixed(4)} ={" "}
            <strong>{usd(evCostPer100(nationalRateUsd(), efficient.kwhPer100mi), 2)} per 100 miles</strong>. A{" "}
            {large.year} {large.make} {large.model} pickup at {large.kwhPer100mi} kWh per 100 miles costs{" "}
            {usd(evCostPer100(nationalRateUsd(), large.kwhPer100mi), 2)} for the same distance.
          </p>
          <p>
            The gasoline comparison uses 25.5 mpg, the EPA&apos;s average real-world fuel economy for new
            model-year 2024 vehicles excluding electric and plug-in hybrid models, and each state&apos;s
            latest weekly regular gasoline price from EIA (or its regional average where EIA does not
            publish a state figure).
          </p>
          <Callout>
            Average prices include fixed monthly charges spread across every kWh, so the extra cost of adding
            an EV to your bill can be a little lower than shown. Time-of-use and EV rate plans can lower it
            further. Read the full{" "}
            <Link href="/methodology" className="underline">
              methodology
            </Link>
            .
          </Callout>
        </div>
      </Section>

      <Section title="EV charging cost in every state" id="by-state">
        <p className="text-stone-700 max-w-3xl mb-4">
          Sorted from cheapest to most expensive for a {typical.year} {typical.make} {typical.model} (
          {typical.kwhPer100mi} kWh/100 mi) charged at home, {num(MONTHLY_MILES)} miles a month.
        </p>
        <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
          <table className="w-full text-sm">
            <caption className="sr-only">Home EV charging cost and gasoline cost by state</caption>
            <thead className="bg-surface-light text-left">
              <tr>
                <th scope="col" className="p-3 font-semibold">#</th>
                <th scope="col" className="p-3 font-semibold">State</th>
                <th scope="col" className="p-3 font-semibold text-right">¢/kWh</th>
                <th scope="col" className="p-3 font-semibold text-right">EV per 100 mi</th>
                <th scope="col" className="p-3 font-semibold text-right">EV per month</th>
                <th scope="col" className="p-3 font-semibold text-right">Gas per month</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ s, c }, i) => (
                <tr key={s.abbr} className="border-t border-black/6">
                  <td className="p-3 text-muted tabular-nums">{i + 1}</td>
                  <th scope="row" className="p-3 font-medium">
                    <Link href={`/states/${s.slug}`} className="text-spark-orange hover:underline">
                      {s.name}
                    </Link>
                  </th>
                  <td className="p-3 text-right tabular-nums">{s.electricity.residentialCentsPerKwhYtd.toFixed(1)}</td>
                  <td className="p-3 text-right tabular-nums">{usd(c.evPer100, 2)}</td>
                  <td className="p-3 text-right tabular-nums">{usd(c.evMonthly)}</td>
                  <td className="p-3 text-right tabular-nums">{usd(c.gasMonthly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Faq items={faqs} path={PATH} />
      <Disclaimer />
      <Sources
        items={[
          { name: SOURCES.electricityPrice.name, url: SOURCES.electricityPrice.url, detail: SOURCES.electricityPrice.period },
          { name: SOURCES.vehicles.name, url: SOURCES.vehicles.url, detail: SOURCES.vehicles.period },
          { name: SOURCES.gasoline.name, url: SOURCES.gasoline.url, detail: SOURCES.gasoline.period },
          { name: SOURCES.gasMpg.name, url: SOURCES.gasMpg.url, detail: SOURCES.gasMpg.note },
        ]}
      />
      <RelatedLinks
        links={[
          { href: "/calculator", label: "EV Finder", desc: "Match an electric car to your budget and driving" },
          { href: "/states", label: "Energy data by state", desc: "Prices, chargers and solar output for every state" },
          { href: "/incentives", label: "EV incentives in 2026", desc: "What federal help is left, and where to find state rebates" },
          { href: "/objections", label: "EV questions, answered", desc: "Range, battery life, cold weather and more" },
        ]}
      />
    </div>
  );
}
