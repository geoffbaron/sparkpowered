import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumbs,
  Callout,
  Disclaimer,
  Faq,
  RelatedLinks,
  Section,
  Sources,
  StatGrid,
} from "@/components/content";
import MonthlyBars from "@/components/MonthlyBars";
import PluginSolarBox from "@/components/PluginSolarBox";
import { AffiliateDisclosure, SolarQuotesCta } from "@/components/affiliate";
import { ChargerPick } from "@/components/chargers";
import { BigStat, MythCallout } from "@/components/ui";
import { lite } from "@/data/myths";
import { typicalPlan } from "@/lib/planner-data";
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
  const solarRank = rankBy((x) => x.solar.kwhPerKwYear, s);
  const yoy = pct(rate, s.electricity.residentialCentsPerKwhYtdPrevYear);
  const nationalEvPer100 = evCostPer100(nationalRateUsd(), typical.kwhPer100mi);
  const customersPerPort = s.usage.customers / Math.max(1, s.charging.ports);
  const gasLabel =
    s.gasoline.level === "state" ? `${s.name} average` : `${s.gasoline.area} regional average`;
  const n = STATES.length;
  const links = stateSources(s);
  const plan = typicalPlan(s.abbr);
  const evRow = plan.all.find((x) => x.id === "ev");
  const solarRow = plan.all.find((x) => x.id === "solar");
  const eGallon = (typical.kwhPer100mi / 100) * (rate / 100) * NATIONAL.gasMpg;

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
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-spark-amber mb-3">Going electric in {s.name}</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight text-ink mb-4">{`Electricity, EV charging and solar in ${s.name}`}</h1>
        <p className="text-lg sm:text-xl text-stone-700 leading-relaxed max-w-3xl">
          A typical {s.name} household could keep about{" "}
          <strong className="text-leaf">{usd(Math.round(plan.total / 10) * 10)} a year</strong> by going electric. Charging a car at
          home here is like paying <strong>{usd(eGallon, 2)} a gallon</strong> instead of {usd(s.gasoline.usdPerGallon, 2)}
          {solarRow?.yearly ? <>, and solar panels sized for an average home could cover up to {usd(solarRow.yearly / 12)} of the monthly bill</> : null}.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href={`/go-electric?state=${s.abbr}`} className="btn btn-primary">See what you&apos;d save</Link>
          <a href="#solar" className="btn btn-outline">Solar in {s.name}</a>
        </div>
        <p className="text-sm text-muted mt-4">
          Data updated <time dateTime={DATA_UPDATED}>{formatDate(DATA_UPDATED)}</time> ·{" "}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-spark-orange">How we calculate this</Link>
        </p>
      </header>

      <section aria-label={`Going electric in ${s.name} at a glance`} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <BigStat tone="leaf" value={`${usd(Math.round(plan.total / 10) * 10)}`} label="Saved a year, typical home" note="EV, solar and electric heat, hot water and cooking" />
        <BigStat value={`${usd(eGallon, 2)}/gal`} label="What charging feels like" note={`vs ${usd(s.gasoline.usdPerGallon, 2)} for gas (${gasLabel})`} />
        <BigStat tone="leaf" value={evRow?.yearly ? `${usd(evRow.yearly)}/yr` : "—"} label="EV vs gas car" note="Fuel plus maintenance, 12,000 miles" />
        <BigStat value={`${usd(s.usage.avgMonthlyBillUsd)}/mo`} label="Average electric bill" note={`${s.name}, 2024 (EIA)`} />
      </section>

      <h2 className="text-lg font-bold text-ink mb-3">The numbers behind it</h2>
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
        <div className="mt-6 grid gap-3">
          <MythCallout m={lite("ev-battery-life")} />
        </div>
        <AffiliateDisclosure className="mt-6 mb-4" />
        <ChargerPick compact />
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
        <MythCallout m={lite("solar-cloudy")} className="mt-8" />
        <div className="grid lg:grid-cols-2 gap-5 mt-8">
          <PluginSolarBox s={s} />
          <SolarQuotesCta context={`in ${s.name}`} />
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
          , compare{" "}
          <Link href="/home-battery-backup" className="underline underline-offset-2 text-spark-orange">
            whole-home and portable backup
          </Link>{" "}
          or see the{" "}
          <Link href="/best-portable-power-stations" className="underline underline-offset-2 text-spark-orange">
            best portable power stations
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
          { href: "/ev-charger-installation-cost", label: `Charger installation cost in ${s.name}`, desc: "Average 2026 price to install a home charger, by state" },
          { href: "/states", label: "All state data", desc: "Electricity prices, solar output and charging by state" },
        ]}
      />
    </article>
  );
}
