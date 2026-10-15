import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumbs,
  Callout,
  Disclaimer,
  Faq,
  PageIntro,
  RelatedLinks,
  Section,
  Sources,
  StatGrid,
} from "@/components/content";
import MonthlyBars from "@/components/MonthlyBars";
import {
  DATA_UPDATED,
  NATIONAL,
  POWERWALL_3_KWH,
  PANEL_WATTS,
  SOURCES,
  STATES,
  MONTHLY_MILES,
  batteryFigures,
  cents,
  chargingFigures,
  formatDate,
  nationalRateUsd,
  num,
  ordinal,
  rankBy,
  solarFigures,
  stateBySlug,
  usd,
  ytdWindow,
  evCostPer100,
  gasCostPer100,
  referenceEv,
  type StateEnergy,
} from "@/lib/energy";
import { JsonLd, pageMetadata, url } from "@/lib/seo";
import { stateSources } from "@/lib/state-sources";

export function generateStaticParams() {
  return STATES.map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = stateBySlug(slug);
  if (!s) return {};
  const c = chargingFigures(s);
  return pageMetadata({
    title: `${s.name} Electricity Rates, EV Charging & Solar (2026)`,
    description: `${s.name} homes paid ${cents(s.electricity.residentialCentsPerKwhYtd)}/kWh in ${ytdWindow()} (EIA). Charging an EV costs about ${usd(c.evPer100, 2)} per 100 miles; 1 kW of solar makes ${num(s.solar.kwhPerKwYear)} kWh a year.`,
    path: `/states/${s.slug}`,
  });
}

function pct(a: number, b: number) {
  return Math.round(((a - b) / b) * 100);
}

function compareWord(diff: number, more = "higher", less = "lower") {
  if (Math.abs(diff) < 2) return "about the same as";
  return `${Math.abs(diff)}% ${diff > 0 ? more : less} than`;
}

/** The three or four states with the closest residential rate, for internal links. */
function peers(s: StateEnergy) {
  return [...STATES]
    .filter((x) => x.abbr !== s.abbr)
    .sort(
      (a, b) =>
        Math.abs(a.electricity.residentialCentsPerKwhYtd - s.electricity.residentialCentsPerKwhYtd) -
        Math.abs(b.electricity.residentialCentsPerKwhYtd - s.electricity.residentialCentsPerKwhYtd),
    )
    .slice(0, 4);
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const s = stateBySlug(slug);
  if (!s) notFound();

  const path = `/states/${s.slug}`;
  const c = chargingFigures(s);
  const sol = solarFigures(s);
  const bat = batteryFigures(s);
  const typical = referenceEv("typical");
  const rate = s.electricity.residentialCentsPerKwhYtd;
  const rateRank = rankBy((x) => x.electricity.residentialCentsPerKwhYtd, s);
  const solarRank = rankBy((x) => x.solar.kwhPerKwYear, s);
  const vsNational = pct(rate, NATIONAL.residentialCentsPerKwhYtd);
  const yoy = pct(rate, s.electricity.residentialCentsPerKwhYtdPrevYear);
  const nationalEvPer100 = evCostPer100(nationalRateUsd(), typical.kwhPer100mi);
  const customersPerPort = s.usage.customers / Math.max(1, s.charging.ports);
  const gasLabel =
    s.gasoline.level === "state" ? `${s.name} average` : `${s.gasoline.area} regional average`;
  const n = STATES.length;
  const links = stateSources(s);

  const faqs = [
    {
      q: `How much does it cost to charge an electric car at home in ${s.name}?`,
      a: `At ${s.name}'s average residential price of ${cents(rate)} per kWh (${ytdWindow()}, EIA), a ${typical.year} ${typical.make} ${typical.model} rated at ${typical.kwhPer100mi} kWh per 100 miles costs about ${usd(c.evPer100, 2)} per 100 miles, or about ${usd(c.evMonthly)} for ${num(MONTHLY_MILES)} miles. Your own cost depends on your utility's rate plan and when you charge.`,
    },
    {
      q: `Is it cheaper to drive an EV than a gas car in ${s.name}?`,
      a: `On average prices, yes for most drivers. With regular gasoline at ${usd(s.gasoline.usdPerGallon, 2)} a gallon (${gasLabel}, EIA) and a 25.5 mpg car, fuel costs about ${usd(c.gasPer100, 2)} per 100 miles, versus about ${usd(c.evPer100, 2)} for the compact electric SUV above charged at home. Public fast charging usually costs more than home charging and narrows the gap.`,
    },
    {
      q: `How many solar panels does an average ${s.name} home need?`,
      a: `The average ${s.name} household used ${num(s.usage.avgMonthlyKwh)} kWh a month in 2024 (EIA). Our PVWatts model estimates 1 kW of south-facing panels near ${s.solar.city} produces about ${num(s.solar.kwhPerKwYear)} kWh a year, so covering all of that use takes about ${sol.systemKw.toFixed(1)} kW — roughly ${sol.panels} panels of ${PANEL_WATTS} watts. Shading, roof direction and your own usage change the answer.`,
    },
    {
      q: `How big a home battery would an average ${s.name} home need?`,
      a: `An average ${s.name} home uses about ${bat.dailyKwh.toFixed(1)} kWh a day. One ${POWERWALL_3_KWH} kWh battery such as a Tesla Powerwall 3 would cover about ${Math.round(bat.hoursPerPowerwall)} hours of average use, and longer if you only back up essential circuits.`,
    },
  ];

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url(path)}#webpage`,
    url: url(path),
    name: `Electricity, EV charging and solar in ${s.name}`,
    isPartOf: { "@id": url("/#website") },
    publisher: { "@id": url("/#organization") },
    dateModified: DATA_UPDATED,
    about: { "@type": "State", name: s.name, containedInPlace: { "@type": "Country", name: "United States" } },
    mainEntity: {
      "@type": "Dataset",
      name: `${s.name} residential electricity, EV charging and solar figures`,
      description: `Average residential electricity price, household usage, gasoline price, public charging counts and modeled solar output for ${s.name}, with derived EV charging and solar sizing estimates.`,
      creator: { "@id": url("/#organization") },
      dateModified: DATA_UPDATED,
      isBasedOn: [
        SOURCES.electricityPrice.url,
        SOURCES.usage.url,
        SOURCES.gasoline.url,
        SOURCES.charging.url,
        SOURCES.solar.url,
        SOURCES.vehicles.url,
      ],
      spatialCoverage: { "@type": "Place", name: `${s.name}, United States` },
    },
  };

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={datasetSchema} />
      <Breadcrumbs items={[{ name: "States", path: "/states" }, { name: s.name, path }]} />
      <PageIntro
        eyebrow={`${s.name} energy data`}
        title={`Electricity, EV charging and solar in ${s.name}`}
        lede={
          <>
            {s.name} homes paid an average of <strong>{cents(rate)} per kWh</strong> for electricity in{" "}
            {ytdWindow()} — {compareWord(vsNational)} the US average of{" "}
            {cents(NATIONAL.residentialCentsPerKwhYtd)} and the {ordinal(rateRank)} highest of {n} states
            and DC. Here is what that means for charging an EV, sizing solar panels and backing up a
            home with a battery.
          </>
        }
        updated={DATA_UPDATED}
      />

      <StatGrid
        stats={[
          {
            label: "Average home electricity price",
            value: cents(rate),
            note: `per kWh, ${ytdWindow()}; ${yoy >= 0 ? "up" : "down"} ${Math.abs(yoy)}% on a year earlier`,
          },
          {
            label: "Average home use",
            value: `${num(s.usage.avgMonthlyKwh)} kWh`,
            note: `per month in 2024; average bill ${usd(s.usage.avgMonthlyBillUsd)}`,
          },
          {
            label: "EV charging at home",
            value: usd(c.evPer100, 2),
            note: `per 100 miles in a compact electric SUV`,
          },
          {
            label: "Solar output",
            value: `${num(s.solar.kwhPerKwYear)} kWh`,
            note: `per kW of panels per year near ${s.solar.city} (${ordinal(solarRank)} of ${n})`,
          },
        ]}
      />

      <Section title={`What it costs to charge an EV in ${s.name}`} id="ev-charging">
        <p className="text-stone-700 leading-relaxed max-w-3xl mb-5">
          Home charging cost is simply the electricity price times how much energy the car uses. The
          table uses EPA ratings, which already include the energy lost while charging. At{" "}
          {cents(rate)}/kWh, charging in {s.name} costs {compareWord(pct(c.evPer100, nationalEvPer100), "more", "less")}{" "}
          the national average.
        </p>
        <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Home charging cost in {s.name} for three EVs compared with a gasoline car
            </caption>
            <thead className="bg-surface-light text-left">
              <tr>
                <th scope="col" className="p-3 font-semibold">Vehicle (EPA rating)</th>
                <th scope="col" className="p-3 font-semibold text-right">Per 100 miles</th>
                <th scope="col" className="p-3 font-semibold text-right">{num(MONTHLY_MILES)} miles a month</th>
              </tr>
            </thead>
            <tbody>
              {c.byVehicle.map(({ ev, per100, monthly }) => (
                <tr key={ev.key} className="border-t border-black/6">
                  <th scope="row" className="p-3 font-normal">
                    <span className="font-medium">
                      {ev.year} {ev.make} {ev.model}
                    </span>
                    <span className="block text-xs text-muted">
                      {ev.label}, {ev.kwhPer100mi} kWh/100 mi
                    </span>
                  </th>
                  <td className="p-3 text-right tabular-nums">{usd(per100, 2)}</td>
                  <td className="p-3 text-right tabular-nums">{usd(monthly)}</td>
                </tr>
              ))}
              <tr className="border-t border-black/6 bg-stone-50">
                <th scope="row" className="p-3 font-normal">
                  <span className="font-medium">Gasoline car, 25.5 mpg</span>
                  <span className="block text-xs text-muted">
                    regular at {usd(s.gasoline.usdPerGallon, 2)}/gal ({gasLabel})
                  </span>
                </th>
                <td className="p-3 text-right tabular-nums">{usd(c.gasPer100, 2)}</td>
                <td className="p-3 text-right tabular-nums">{usd(c.gasMonthly)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-stone-600 mt-4 max-w-3xl">
          {c.savingMonthly > 0 ? (
            <>
              On these averages, a compact electric SUV charged at home saves about{" "}
              <strong>{usd(c.savingMonthly)} a month</strong> in fuel over a {MONTHLY_MILES.toLocaleString()}-mile
              month compared with a 25.5 mpg gasoline car.
            </>
          ) : (
            <>
              On these averages, home charging costs about the same as or more than gasoline in{" "}
              {s.name}, so a time-of-use or EV rate plan matters a lot here.
            </>
          )}{" "}
          Many utilities offer cheaper overnight EV rates that can cut these figures substantially. Try your
          own numbers in the{" "}
          <Link href={`/ev-charging-cost?state=${s.abbr}`} className="underline underline-offset-2 text-spark-orange">
            EV charging cost calculator
          </Link>
          .
        </p>
      </Section>

      <Section title={`Public charging in ${s.name}`} id="public-charging">
        <p className="text-stone-700 leading-relaxed max-w-3xl">
          The Department of Energy lists <strong>{num(s.charging.ports)} public charging ports</strong> at{" "}
          {num(s.charging.locations)} locations in {s.name}, including{" "}
          <strong>{num(s.charging.dcFast)} DC fast-charging ports</strong> and {num(s.charging.level2)} Level 2
          ports. That is roughly one public port for every {num(customersPerPort)} residential electricity
          customers. Find live locations on the{" "}
          <a href="https://afdc.energy.gov/stations" className="underline underline-offset-2" rel="noopener">
            AFDC station locator
          </a>
          .
        </p>
      </Section>

      <Section title={`How much solar a typical ${s.name} home needs`} id="solar">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="text-stone-700 leading-relaxed space-y-4">
            <p>
              The PVWatts solar model from the National Laboratory of the Rockies (formerly NREL), run on ten years of NASA hourly weather data for {s.solar.city}, estimates each kilowatt of
              south-facing panels at a 20° tilt produces <strong>{num(s.solar.kwhPerKwYear)} kWh a year</strong>.
              To cover the average {s.name} household&apos;s {num(sol.annualKwh)} kWh a year you would need
              about <strong>{sol.systemKw.toFixed(1)} kW</strong>, or roughly{" "}
              <strong>{sol.panels} panels</strong> at {PANEL_WATTS} watts each.
            </p>
            <p>
              If every kilowatt-hour from the panels replaced one bought at {cents(rate)}, each kilowatt of
              panels would be worth about <strong>{usd(sol.valuePerKwYear)} a year</strong>. Under that
              best case, a system installed for {usd(sol.breakEvenPerWatt(10), 2)} per watt would pay for
              itself in 10 years, and one at {usd(sol.breakEvenPerWatt(20), 2)} per watt in 20 years.
            </p>
            <Callout tone="warn">
              That is an upper bound. Many utilities credit exported solar at less than the retail rate, so
              the value depends heavily on your utility&apos;s net metering or net billing rules and how much
              power you use while the sun is up. Compare any installer quote&apos;s price per watt against
              these break-even figures.
            </Callout>
            <p>
              <Link href={`/solar-calculator?state=${s.abbr}`} className="underline underline-offset-2 text-spark-orange font-medium">
                Size a system for your own usage
              </Link>{" "}
              or{" "}
              <Link href="/solar-finder" className="underline underline-offset-2 text-spark-orange font-medium">
                find installers serving {s.name}
              </Link>
              .
            </p>
          </div>
          <MonthlyBars
            title={`Monthly output of 1 kW of panels near ${s.solar.city} (kWh)`}
            values={s.solar.monthlyKwhPerKw}
          />
        </div>
      </Section>

      <Section title={`Home battery backup in ${s.name}`} id="battery">
        <p className="text-stone-700 leading-relaxed max-w-3xl">
          The average {s.name} home uses about <strong>{bat.dailyKwh.toFixed(1)} kWh a day</strong>. A single{" "}
          {POWERWALL_3_KWH} kWh battery (the capacity of a Tesla Powerwall 3) would run that average load for
          about {Math.round(bat.hoursPerPowerwall)} hours; backing up only essentials such as the fridge,
          lights, internet and a furnace fan stretches that much further. Covering a full day of average use
          would take about {bat.powerwallsForFullDay.toFixed(1)} batteries of that size.{" "}
          <Link href="/battery-calculator" className="underline underline-offset-2 text-spark-orange">
            Size a battery for your home
          </Link>
          .
        </p>
      </Section>

      <Section title={`Incentives in ${s.name}`} id="incentives">
        <p className="text-stone-700 leading-relaxed max-w-3xl">
          The federal $7,500 new-EV and $4,000 used-EV tax credits ended for vehicles acquired after 30
          September 2025, and the 30% homeowner credit for solar and batteries ended for expenditures after
          31 December 2025.{" "}
          <Link href="/incentives" className="underline underline-offset-2 text-spark-orange">
            See what federal help remains
          </Link>
          . State and utility programs change often, so check the official lists for {s.name}:
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {links.map((l) => (
            <li key={l.url}>
              <a href={l.url} className="underline underline-offset-2 hover:text-spark-orange" rel="noopener">
                {l.name}
              </a>
              <span className="text-muted"> — {l.detail}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Faq items={faqs} path={path} />

      <Disclaimer />

      <Sources
        items={[
          {
            name: SOURCES.electricityPrice.name,
            url: SOURCES.electricityPrice.url,
            detail: `${SOURCES.electricityPrice.period}. ${SOURCES.electricityPrice.note}`,
          },
          { name: SOURCES.usage.name, url: SOURCES.usage.url, detail: SOURCES.usage.period },
          { name: SOURCES.gasoline.name, url: SOURCES.gasoline.url, detail: `${gasLabel}, ${SOURCES.gasoline.period}` },
          { name: SOURCES.charging.name, url: SOURCES.charging.url, detail: SOURCES.charging.period },
          {
            name: SOURCES.solar.name,
            url: SOURCES.solar.url,
            detail: `${s.solar.city}; ${SOURCES.solar.assumptions}`,
          },
          { name: SOURCES.vehicles.name, url: SOURCES.vehicles.url, detail: SOURCES.vehicles.period },
          { name: SOURCES.gasMpg.name, url: SOURCES.gasMpg.url, detail: SOURCES.gasMpg.note },
        ]}
      />
      <p className="text-xs text-muted mt-4">
        Figures retrieved {formatDate(DATA_UPDATED)}. US comparison: {cents(NATIONAL.residentialCentsPerKwhYtd)}/kWh;
        gasoline {usd(NATIONAL.gasolineUsdPerGallon, 2)}/gal; a 25.5 mpg car costs{" "}
        {usd(gasCostPer100(NATIONAL.gasolineUsdPerGallon), 2)} per 100 miles nationally.
      </p>

      <RelatedLinks
        links={[
          ...peers(s).map((p) => ({
            href: `/states/${p.slug}`,
            label: p.name,
            desc: `${cents(p.electricity.residentialCentsPerKwhYtd)}/kWh · ${num(p.solar.kwhPerKwYear)} kWh per kW of solar`,
          })),
          { href: "/ev-charging-cost", label: "EV charging cost in every state", desc: "Compare all 50 states and DC side by side" },
          { href: "/states", label: "All state data", desc: "Electricity prices, solar output and charging by state" },
        ]}
      />
    </article>
  );
}
