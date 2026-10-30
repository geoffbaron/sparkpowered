import type { Metadata } from "next";
import LocalStateLinks from "@/components/LocalStateLinks";
import Link from "next/link";
import { Breadcrumbs, Disclaimer, PageIntro, RelatedLinks, Sources } from "@/components/content";
import {
  DATA_UPDATED,
  NATIONAL,
  SOURCES,
  STATES,
  cents,
  chargingFigures,
  num,
  solarFigures,
  usd,
  ytdWindow,
} from "@/lib/energy";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const TITLE = "Electricity Prices, EV Charging & Solar by State (2026)";
const DESCRIPTION = "Home electricity prices, average use, EV charging cost, public chargers and solar output for all 50 states and DC, from EIA, DOE, EPA and NASA data.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/states" });

export default function StatesIndex() {
  const rows = [...STATES].sort((a, b) => a.name.localeCompare(b.name));
  const byRate = [...STATES].sort(
    (a, b) => a.electricity.residentialCentsPerKwhYtd - b.electricity.residentialCentsPerKwhYtd,
  );
  const bySun = [...STATES].sort((a, b) => b.solar.kwhPerKwYear - a.solar.kwhPerKwYear);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          "@id": `${url("/states")}#dataset`,
          name: "US state electricity, EV charging and solar figures",
          description: DESCRIPTION,
          url: url("/states"),
          creator: { "@id": url("/#organization") },
          dateModified: DATA_UPDATED,
          isBasedOn: Object.values(SOURCES).map((s) => s.url),
          spatialCoverage: { "@type": "Place", name: "United States" },
          variableMeasured: [
            "Average residential electricity price (cents per kWh)",
            "Average monthly residential electricity use (kWh)",
            "Home EV charging cost per 100 miles (USD)",
            "Public EV charging ports",
            "Annual solar output per kW of panels (kWh)",
          ],
        }}
      />
      <Breadcrumbs items={[{ name: "States", path: "/states" }]} />
      <PageIntro
        eyebrow="State-by-state data"
        title="Electricity, EV charging and solar by state"
        lede={
          <>
            The US average home electricity price was {cents(NATIONAL.residentialCentsPerKwhYtd)} per kWh
            in {ytdWindow()}, but it ranges from {cents(byRate[0].electricity.residentialCentsPerKwhYtd)} in{" "}
            {byRate[0].name} to {cents(byRate[byRate.length - 1].electricity.residentialCentsPerKwhYtd)} in{" "}
            {byRate[byRate.length - 1].name}. Solar output per panel varies by a similar margin, from{" "}
            {num(bySun[0].solar.kwhPerKwYear)} kWh per kW a year in {bySun[0].name} to{" "}
            {num(bySun[bySun.length - 1].solar.kwhPerKwYear)} in {bySun[bySun.length - 1].name}. Pick a
            state for the full breakdown.
          </>
        }
        updated={DATA_UPDATED}
      />

      <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
        <table className="w-full text-sm">
          <caption className="sr-only">Energy figures for every US state and DC</caption>
          <thead className="bg-surface-light text-left">
            <tr>
              <th scope="col" className="p-3 font-semibold">State</th>
              <th scope="col" className="p-3 font-semibold text-right">Home price (¢/kWh)</th>
              <th scope="col" className="p-3 font-semibold text-right">Avg use (kWh/mo)</th>
              <th scope="col" className="p-3 font-semibold text-right">EV cost per 100 mi</th>
              <th scope="col" className="p-3 font-semibold text-right">Public ports</th>
              <th scope="col" className="p-3 font-semibold text-right">Solar kWh per kW/yr</th>
              <th scope="col" className="p-3 font-semibold text-right">Panels for avg home</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.abbr} className="border-t border-black/6">
                <th scope="row" className="p-3 font-medium">
                  <Link href={`/states/${s.slug}`} className="text-spark-orange hover:underline">
                    {s.name}
                  </Link>
                </th>
                <td className="p-3 text-right tabular-nums">{s.electricity.residentialCentsPerKwhYtd.toFixed(1)}</td>
                <td className="p-3 text-right tabular-nums">{num(s.usage.avgMonthlyKwh)}</td>
                <td className="p-3 text-right tabular-nums">{usd(chargingFigures(s).evPer100, 2)}</td>
                <td className="p-3 text-right tabular-nums">{num(s.charging.ports)}</td>
                <td className="p-3 text-right tabular-nums">{num(s.solar.kwhPerKwYear)}</td>
                <td className="p-3 text-right tabular-nums">{solarFigures(s).panels}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted mt-3">
        EV cost assumes a 2026 Chevrolet Equinox EV FWD (31.1 kWh/100 mi, EPA) charged at home at the state
        average price. Panels assume 400 W each sized to cover average annual use.{" "}
        <Link href="/methodology" className="underline">Methodology</Link>.
      </p>

      <Disclaimer />
      <Sources
        items={[
          { name: SOURCES.electricityPrice.name, url: SOURCES.electricityPrice.url, detail: SOURCES.electricityPrice.period },
          { name: SOURCES.usage.name, url: SOURCES.usage.url, detail: SOURCES.usage.period },
          { name: SOURCES.charging.name, url: SOURCES.charging.url, detail: SOURCES.charging.period },
          { name: SOURCES.solar.name, url: SOURCES.solar.url, detail: SOURCES.solar.assumptions },
          { name: SOURCES.vehicles.name, url: SOURCES.vehicles.url, detail: SOURCES.vehicles.period },
        ]}
      />
      <LocalStateLinks heading="States with local utility, price and program details" />
      <RelatedLinks
        links={[
          { href: "/ev-charging-cost", label: "EV charging cost calculator", desc: "Your car, your state, your miles" },
          { href: "/solar-calculator", label: "Solar panel calculator", desc: "How many panels your home needs" },
        ]}
      />
    </div>
  );
}
