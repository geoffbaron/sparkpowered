import type { Metadata } from "next";
import Link from "next/link";
import Byline from "@/components/Byline";
import { Breadcrumbs, Disclaimer, PageIntro, RelatedLinks, Sources } from "@/components/content";
import { STATE_INCENTIVES, STATE_INCENTIVES_READ } from "@/data/state-incentives";
import { DATA_UPDATED, NATIONAL, SOURCES, STATES, cents, formatDate, num, usd, ytdWindow } from "@/lib/energy";
import { AUTHOR_REF, JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/states";
const TITLE = "Electricity Prices and Battery Rebates by State";
const DESCRIPTION =
  "Average home electricity price, daily use and monthly bill for all 50 states and DC (EIA), for sizing backup batteries, plus the state home battery rebates that are open.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const DSIRE = "https://programs.dsireusa.org/system/program";

/** State programs that pay for a home battery (not solar-only). */
const BATTERY_PROGRAMS = Object.entries(STATE_INCENTIVES).flatMap(([abbr, s]) =>
  s.programs
    .filter((p) => p.kind === "solar-battery" && /batter|storage/i.test(`${p.name} ${p.amount}`) && p.status !== "closed")
    .map((p) => ({ abbr, ...p })),
);

export default function StatesIndex() {
  const rows = [...STATES].sort((a, b) => a.name.localeCompare(b.name));
  const byRate = [...STATES].sort((a, b) => a.electricity.residentialCentsPerKwhYtd - b.electricity.residentialCentsPerKwhYtd);
  const byUse = [...STATES].sort((a, b) => a.usage.avgMonthlyKwh - b.usage.avgMonthlyKwh);
  const perDay = (monthly: number) => monthly / (365 / 12);
  const stateName = (abbr: string) => STATES.find((s) => s.abbr === abbr)?.name ?? abbr;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          "@id": `${url(PATH)}#dataset`,
          name: "US state electricity prices and household use",
          description: DESCRIPTION,
          url: url(PATH),
          creator: AUTHOR_REF,
          dateModified: `${DATA_UPDATED}T12:00:00+00:00`,
          isBasedOn: [SOURCES.electricityPrice.url, SOURCES.usage.url],
          spatialCoverage: { "@type": "Place", name: "United States" },
          variableMeasured: [
            "Average residential electricity price (cents per kWh)",
            "Average monthly residential electricity use (kWh)",
            "Average monthly residential bill (USD)",
          ],
        }}
      />
      <Breadcrumbs items={[{ name: "States", path: PATH }]} />
      <PageIntro
        eyebrow="State-by-state data"
        title="Electricity prices and home battery rebates by state"
        lede={
          <>
            The average US home uses about {num(perDay(NATIONAL.avgMonthlyKwh))} kWh a day, which is the number to start from when you size a
            whole-home battery; most people back up far less. Use ranges from {num(perDay(byUse[0].usage.avgMonthlyKwh))} kWh a day in{" "}
            {byUse[0].name} to {num(perDay(byUse[byUse.length - 1].usage.avgMonthlyKwh))} in {byUse[byUse.length - 1].name}. Prices ran from{" "}
            {cents(byRate[0].electricity.residentialCentsPerKwhYtd)} per kWh in {byRate[0].name} to{" "}
            {cents(byRate[byRate.length - 1].electricity.residentialCentsPerKwhYtd)} in {byRate[byRate.length - 1].name} in {ytdWindow()}.
          </>
        }
        updated={DATA_UPDATED}
      />
      <Byline path={PATH} />

      <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
        <table className="w-full text-sm">
          <caption className="sr-only">Electricity price and household use for every US state and DC</caption>
          <thead className="bg-surface-light text-left">
            <tr>
              <th scope="col" className="p-3 font-semibold">State</th>
              <th scope="col" className="p-3 font-semibold text-right">Home price (¢/kWh)</th>
              <th scope="col" className="p-3 font-semibold text-right">Avg use (kWh/day)</th>
              <th scope="col" className="p-3 font-semibold text-right">Avg use (kWh/month)</th>
              <th scope="col" className="p-3 font-semibold text-right">Avg bill (month)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.abbr} id={s.slug} className="border-t border-black/6">
                <th scope="row" className="p-3 font-medium">{s.name}</th>
                <td className="p-3 text-right tabular-nums">{s.electricity.residentialCentsPerKwhYtd.toFixed(1)}</td>
                <td className="p-3 text-right tabular-nums">{num(perDay(s.usage.avgMonthlyKwh))}</td>
                <td className="p-3 text-right tabular-nums">{num(s.usage.avgMonthlyKwh)}</td>
                <td className="p-3 text-right tabular-nums">{usd(s.usage.avgMonthlyBillUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted mt-3">
        Daily use is the EIA monthly average divided by 30.4 days. <Link href="/methodology" className="underline">Methodology</Link>.
      </p>

      <section aria-labelledby="rebates-heading" className="mt-12 max-w-3xl">
        <h2 id="rebates-heading" className="text-2xl font-bold mb-3">Home battery rebates</h2>
        <p className="text-stone-700 leading-relaxed">
          The 30% federal credit for homeowners (section 25D) does not apply to batteries bought after December 31, 2025, per the IRS. A few
          states and utilities still pay toward a home battery. These are the programs I found open or waitlisted on their official pages,
          read {formatDate(STATE_INCENTIVES_READ)}; for every other state, search{" "}
          <a href={DSIRE} className="underline text-spark-orange" rel="noopener">DSIRE</a>, the national database of state programs.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-stone-700">
          {BATTERY_PROGRAMS.map((p) => (
            <li key={p.name} className="rounded-xl border border-black/8 bg-surface p-4">
              <a href={p.url} className="font-semibold underline underline-offset-2" rel="noopener">{p.name}</a> ({stateName(p.abbr)})
              <span className="block mt-1">{p.amount}. {p.who}. {p.ends}.</span>
            </li>
          ))}
        </ul>
      </section>

      <Disclaimer />
      <RelatedLinks
        links={[
          { href: "/battery-calculator", label: "Home battery sizer", desc: "How many kWh your home needs" },
          { href: "/power-outage-backup-calculator", label: "Outage backup calculator", desc: "Just the things you need to keep running" },
        ]}
      />
      <Sources
        checked={DATA_UPDATED}
        items={[
          { name: SOURCES.electricityPrice.name, url: SOURCES.electricityPrice.url, detail: SOURCES.electricityPrice.period },
          { name: SOURCES.usage.name, url: SOURCES.usage.url, detail: SOURCES.usage.period },
          ...BATTERY_PROGRAMS.map((p) => ({ name: p.name, url: p.url, detail: `read ${formatDate(p.read)}` })),
          { name: "DSIRE, Database of State Incentives for Renewables & Efficiency", url: DSIRE },
        ]}
      />
    </div>
  );
}
