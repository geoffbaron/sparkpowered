import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SolarCalculator, { SolarCalculatorFromParams } from "@/components/SolarCalculator";
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
import { CALC_STATES, CALC_US } from "@/lib/calculator-data";
import { SolarQuotesCta } from "@/components/affiliate";
import {
  DATA_UPDATED,
  NATIONAL,
  PANEL_WATTS,
  SOURCES,
  STATES,
  cents,
  num,
  solarFigures,
  stateByAbbr,
  usd,
} from "@/lib/energy";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/solar-calculator";
const TITLE = "How Many Solar Panels Do I Need? Calculator by State";
const DESCRIPTION =
  "How many solar panels your home needs, from your bill or kWh and modeled solar output for your state. See system size, yearly output, value and break-even price per watt.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function SolarCalculatorPage() {
  const az = stateByAbbr("AZ")!;
  const wa = stateByAbbr("WA")!;
  const azF = solarFigures(az, 1000);
  const waF = solarFigures(wa, 1000);
  const bySun = [...STATES].sort((a, b) => b.solar.kwhPerKwYear - a.solar.kwhPerKwYear);
  const usAvgKwh = NATIONAL.avgMonthlyKwh;
  const usKwLow = (usAvgKwh * 12) / bySun[0].solar.kwhPerKwYear;
  const usKwHigh = (usAvgKwh * 12) / bySun[bySun.length - 1].solar.kwhPerKwYear;
  const panelsFor = (kw: number) => Math.ceil((kw * 1000) / PANEL_WATTS);

  const faqs = [
    {
      q: "How many solar panels do I need?",
      a: `Divide your yearly electricity use by how much 1 kW of panels produces where you live, then divide by the panel size. For example, a home using 1,000 kWh a month (12,000 kWh a year) in Arizona, where our PVWatts model estimates ${num(az.solar.kwhPerKwYear)} kWh per kW a year, needs about ${azF.systemKw.toFixed(1)} kW — ${azF.panels} panels of ${PANEL_WATTS} W. The same home in Washington, at ${num(wa.solar.kwhPerKwYear)} kWh per kW, needs about ${waF.systemKw.toFixed(1)} kW or ${waF.panels} panels.`,
    },
    {
      q: "How many solar panels does the average US home need?",
      a: `The average US home used ${num(usAvgKwh)} kWh a month in 2024 (EIA). Covering that takes from about ${usKwLow.toFixed(1)} kW (${panelsFor(usKwLow)} panels of ${PANEL_WATTS} W) in ${bySun[0].name} to about ${usKwHigh.toFixed(1)} kW (${panelsFor(usKwHigh)} panels) in ${bySun[bySun.length - 1].name}, because the same panel produces far more in sunny states.`,
    },
    {
      q: "How much electricity does one solar panel produce?",
      a: `A ${PANEL_WATTS} W panel is 0.4 kW, so it produces 0.4 times the state's kWh-per-kW figure. In ${bySun[0].name} that is about ${num(bySun[0].solar.kwhPerKwYear * 0.4)} kWh a year; in ${bySun[bySun.length - 1].name} about ${num(bySun[bySun.length - 1].solar.kwhPerKwYear * 0.4)} kWh.`,
    },
    {
      q: "Is solar worth it without the federal tax credit?",
      a: "It depends on three numbers: your installed price per watt, your electricity rate, and how your utility credits power you export. The 30% homeowner credit (25D) ended for expenditures after 31 December 2025, so compare a quote's price per watt with the break-even figures on your state's page. High-rate, sunny states pay back fastest.",
    },
    {
      q: "Why does my installer quote a different size?",
      a: "Installers model your actual roof: its direction, tilt, shading and space, plus your past 12 months of bills. This calculator assumes an unshaded south-facing roof at a 20 degree tilt, so treat it as a starting point and a way to sanity-check quotes.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Solar Panel Calculator",
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
      <Breadcrumbs items={[{ name: "Solar panel calculator", path: PATH }]} />
      <PageIntro
        eyebrow="Free calculator"
        title="How many solar panels do I need?"
        lede={
          <>
            Enter your state and your monthly use or bill. We size the system from modeled solar output for
            your state (the PVWatts model on ten years of NASA weather data) and value it at your state&apos;s average electricity price (EIA).
          </>
        }
        updated={DATA_UPDATED}
      />

      <Suspense fallback={<SolarCalculator states={CALC_STATES} us={CALC_US} />}>
        <SolarCalculatorFromParams states={CALC_STATES} us={CALC_US} />
      </Suspense>

      <div className="mt-8">
        <SolarQuotesCta />
      </div>

      <Section title="The formula" id="how">
        <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
          <p>
            <strong>System size (kW) = yearly use (kWh) ÷ yearly output per kW.</strong> Then{" "}
            <strong>panels = system size × 1,000 ÷ panel watts</strong>.
          </p>
          <p>
            Output per kW comes from PVWatts, the solar model published by the National Laboratory of the Rockies
            (formerly NREL), run on 2015–2024 hourly NASA weather data for a large city in each state, a south-facing roof at a 20°
            tilt and its default 14% system losses. Worked example for Arizona: 12,000 kWh ÷{" "}
            {num(az.solar.kwhPerKwYear)} kWh per kW = <strong>{azF.systemKw.toFixed(2)} kW</strong>, and{" "}
            {azF.systemKw.toFixed(2)} × 1,000 ÷ {PANEL_WATTS} = <strong>{azF.panels} panels</strong>.
          </p>
          <p>
            The value figure multiplies the output by your state&apos;s average residential price, currently{" "}
            {cents(az.electricity.residentialCentsPerKwhYtd)} in Arizona — {usd(azF.valuePerKwYear)} per kW per
            year. That is the most the panels could save if every kWh replaced one you would otherwise buy.
          </p>
          <Callout tone="warn">
            Many utilities pay less than the retail rate for power you send to the grid, and some add fixed
            charges for solar customers. Check your utility&apos;s net metering or net billing tariff before
            relying on any payback figure, including ours.
          </Callout>
        </div>
      </Section>

      <Section title="Solar output and system size by state" id="by-state">
        <p className="text-stone-700 max-w-3xl mb-4">
          Sorted by output per kW. System size is what it takes to cover that state&apos;s average household
          use.
        </p>
        <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
          <table className="w-full text-sm">
            <caption className="sr-only">Solar output and typical system size by state</caption>
            <thead className="bg-surface-light text-left">
              <tr>
                <th scope="col" className="p-3 font-semibold">State</th>
                <th scope="col" className="p-3 font-semibold text-right">kWh per kW/yr</th>
                <th scope="col" className="p-3 font-semibold text-right">Avg use kWh/mo</th>
                <th scope="col" className="p-3 font-semibold text-right">System size</th>
                <th scope="col" className="p-3 font-semibold text-right">Panels</th>
                <th scope="col" className="p-3 font-semibold text-right">Value per kW/yr</th>
              </tr>
            </thead>
            <tbody>
              {bySun.map((s) => {
                const f = solarFigures(s);
                return (
                  <tr key={s.abbr} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">
                      <Link href={`/states/${s.slug}#solar`} className="text-spark-orange hover:underline">
                        {s.name}
                      </Link>
                    </th>
                    <td className="p-3 text-right tabular-nums">{num(s.solar.kwhPerKwYear)}</td>
                    <td className="p-3 text-right tabular-nums">{num(s.usage.avgMonthlyKwh)}</td>
                    <td className="p-3 text-right tabular-nums">{f.systemKw.toFixed(1)} kW</td>
                    <td className="p-3 text-right tabular-nums">{f.panels}</td>
                    <td className="p-3 text-right tabular-nums">{usd(f.valuePerKwYear)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Faq items={faqs} path={PATH} />
      <Disclaimer />
      <Sources
        items={[
          { name: SOURCES.solar.name, url: SOURCES.solar.url, detail: SOURCES.solar.assumptions },
          { name: SOURCES.usage.name, url: SOURCES.usage.url, detail: SOURCES.usage.period },
          { name: SOURCES.electricityPrice.name, url: SOURCES.electricityPrice.url, detail: SOURCES.electricityPrice.period },
          {
            name: "IRS: FAQs on the modification of sections 25C, 25D, 25E, 30C, 30D, 45L, 45W and 179D under Public Law 119-21",
            url: "https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-act-obbb",
            detail: "Fact sheet FS-2025-05, August 2025",
          },
        ]}
      />
      <RelatedLinks
        links={[
          { href: "/plug-in-solar", label: "Plug-in solar guide", desc: "Balcony solar kits, state rules and real payback" },
          { href: "/solar-finder", label: "Find solar installers", desc: "Installers that list service in your state" },
          { href: "/battery-calculator", label: "Home battery sizer", desc: "Pair panels with backup storage" },
          { href: "/states", label: "Energy data by state", desc: "Prices, solar output and charging by state" },
          { href: "/incentives", label: "Solar incentives in 2026", desc: "What changed and where to check state rebates" },
        ]}
      />
    </div>
  );
}
