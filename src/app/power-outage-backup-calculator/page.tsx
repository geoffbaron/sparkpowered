import type { Metadata } from "next";
import Link from "next/link";
import OutageCalc from "@/components/offgrid/OutageCalc";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { BigStat, HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PriceFootnote } from "@/components/products";
import { AFFILIATES } from "@/data/affiliates";
import { DATA_UPDATED, STATES, formatDate } from "@/lib/energy";
import { CPAP_NO_HUMIDIFIER_W, LOADS } from "@/lib/everyday";
import {
  ESSENTIALS,
  RECHARGE_PANELS_W,
  USABLE_FRACTION,
  dailyWh,
  decemberPerKwDay,
  fmtKwh,
  fmtW,
  fmtWh,
  matchStations,
  offGridStates,
  outageBatteryWh,
  peakWatts,
  relatedFor,
  solarWhPerDay,
  sourcesFor,
  stationOptions,
  typicalWinterState,
  type LoadPick,
} from "@/lib/offgrid";
import { money, productById } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/power-outage-backup-calculator";
const TITLE = "Power Outage Backup Calculator: Fridge, CPAP, Well Pump";
const DESCRIPTION =
  "How big a power station or battery you need to keep the fridge, freezer, CPAP, well pump, furnace blower, Wi-Fi and lights on through an outage, and how much winter solar recharges it in your state.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function OutageBackupPage() {
  const stations = stationOptions();
  const typical = typicalWinterState();
  const essWh = dailyWh(ESSENTIALS);
  const ess2 = outageBatteryWh(essWh, 2);
  const essPeak = peakWatts(ESSENTIALS);
  const essMatch = matchStations(stations.filter((o) => (o.surgeW ?? o.acOutputW) >= essPeak.peak), ess2, { runningW: essPeak.running, limit: 1 })[0];
  const winter: LoadPick[] = [...ESSENTIALS, { id: "well", count: 1, hours: 1 }, { id: "furnace", count: 1, hours: 6 }];
  const winterWh = dailyWh(winter);
  const winterPeak = peakWatts(winter);
  const cpapNight = dailyWh([{ id: "cpap", count: 1 }]);
  const panel = RECHARGE_PANELS_W[1];
  const recharge = STATES.map((s) => ({ s, wh: solarWhPerDay(panel, decemberPerKwDay(s)) })).sort((a, b) => b.wh - a.wh);
  const typicalRecharge = solarWhPerDay(panel, decemberPerKwDay(typical));
  const usable = Math.round(USABLE_FRACTION * 100);
  const products = stations.map((o) => productById(o.id));

  const faqs = [
    {
      q: "What size power station do I need for a power outage?",
      a: `Add up what you need a day, multiply by the days, and divide by ${usable}% for the share you can use. A fridge, Wi-Fi, four LED bulbs and two phone charges use about ${fmtWh(essWh)} a day, so two days takes about ${fmtKwh(ess2)}. Add a well pump and a furnace blower and it rises to about ${fmtWh(winterWh)} a day.`,
    },
    {
      q: "Can a power station run a well pump or a furnace?",
      a: `Often, if it is big enough. A 1/3 HP well pump runs at about 1,000 W and needs about 2,000 W more for a moment to start; a 1/3 HP furnace blower runs at about 700 W (EWEB generator sizing sheet). With the essentials too, the station must put out about ${fmtW(winterPeak.running)} and handle about ${fmtW(winterPeak.peak)} at start-up. If they are wired into the house, power them only through a transfer switch installed by an electrician (NFPA).`,
    },
    {
      q: "How long will food last in the fridge without power?",
      a: "About 4 hours in a closed fridge and about 48 hours in a full freezer (Ready.gov, FoodSafety.gov). Ready.gov says to throw away food that has been at 40°F or higher for two hours or more. Keep the doors shut, and you can run the fridge in shifts from a power station to stretch the battery.",
    },
    {
      q: "Can solar panels recharge a power station in winter?",
      a: `Yes, but less than in summer. In December, ${panel} W of panels makes about ${fmtWh(typicalRecharge)} a day in ${typical.name} in the PVWatts model: ${Math.round((typicalRecharge / essWh) * 100)}% of an essentials day. In ${recharge[0].s.name} it is about ${fmtWh(recharge[0].wh)}, in ${recharge[recharge.length - 1].s.name} about ${fmtWh(recharge[recharge.length - 1].wh)}.`,
    },
    {
      q: "How much battery does a CPAP need in an outage?",
      a: `About ${fmtWh(cpapNight)} a night with the heated humidifier on (28 W for 8 hours, ResMed), about ${fmtWh(CPAP_NO_HUMIDIFIER_W * LOADS.cpapNightHours)} a night (11 W) without it. See our guide to the best power station for a CPAP for nights per dollar.`,
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Power Outage Backup Calculator",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          browserRequirements: "Requires JavaScript",
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          dateModified: DATA_UPDATED,
        }}
      />
      <HubHero
        image="outage"
        crumbs={[{ name: "Power outage backup calculator", path: PATH }]}
        eyebrow="Outage backup"
        title={<>Lights out on the street. <span className="text-amber-300">Not in your kitchen.</span></>}
        sub={
          <>
            Two days of fridge, Wi-Fi, lights and phones take about <strong className="text-amber-300">{fmtKwh(ess2)}</strong> of battery. Add a
            well pump, furnace blower, freezer or CPAP and see what size you need, and what winter sun adds back.
          </>
        }
      >
        <a href="#calculator" className="btn btn-primary">Size my backup</a>
        <a href="#recharge" className="btn btn-light">Winter solar by state</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />
        <QuickAnswer>
          <p>
            <strong>Essentials for two days:</strong> about {fmtKwh(ess2)} ({fmtWh(essWh)} a day ÷ {usable}% usable × 2).
            {essMatch && (
              <>
                {" "}The cheapest power station we track that covers it is the{" "}
                <PartnerLink brand={essMatch.option.brand} productId={essMatch.option.id} productUrl={essMatch.option.url}>
                  {essMatch.option.name}
                </PartnerLink>{" "}
                ({money(essMatch.totalUsd)} when we checked).
              </>
            )}
          </p>
          <p>
            <strong>With a well pump and furnace blower:</strong> about {fmtWh(winterWh)} a day, and the station must handle about{" "}
            {fmtW(winterPeak.peak)} when the pump starts.
          </p>
        </QuickAnswer>

        <section aria-label="Key numbers" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat value={fmtWh(essWh)} label="An essentials day" note="Fridge, Wi-Fi, 4 LED bulbs, 2 phone charges" />
          <BigStat tone="orange" value="4 hours" label="Food safe in a closed fridge" note="48 hours in a full freezer (Ready.gov)" />
          <BigStat tone="leaf" value={fmtWh(typicalRecharge)} label={`From ${panel} W of panels, December`} note={`${typical.name}, PVWatts model`} />
        </section>

        <h2 id="calculator" className="text-2xl font-extrabold text-ink mt-12 mb-4 scroll-mt-24">What you need to keep running</h2>
        <OutageCalc states={offGridStates()} stations={stations} fallbackAbbr={typical.abbr} />
        <PriceFootnote products={products} />

        <Section title="How the calculation works" id="how">
          <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
            <p>
              <strong>Daily use = watts × hours a day</strong> for each load (the US Department of Energy method). Fridges and freezers use the
              EIA&apos;s average yearly use divided by 365, because they cycle on and off.
            </p>
            <p>
              <strong>Battery = daily use × days ÷ {usable}%.</strong> We count {usable}% of a power station&apos;s rated capacity as usable after
              inverter losses, the same figure we use across the site.
            </p>
            <p>
              <strong>Output = running watts of everything at once + the biggest motor start</strong>, the method in EWEB&apos;s generator sizing
              sheet. We match stations on continuous output and, where the maker gives one, surge rating.
            </p>
            <Callout tone="warn">
              If your well pump or furnace blower is wired into the house, power it only through a properly rated transfer switch installed
              by an electrician.
            </Callout>
            <p>
              Just the fridge? See <Link href="/power-station-for-refrigerator" className="underline">power stations for a refrigerator</Link>. A
              CPAP? See <Link href="/best-power-station-for-cpap" className="underline">power stations for a CPAP</Link>. The whole house? See{" "}
              <Link href="/home-battery-backup" className="underline">home battery backup</Link>.
            </p>
          </div>
        </Section>

        <Section title={`Winter solar recharge by state (${panel} W of panels)`} id="recharge">
          <p className="text-stone-700 max-w-3xl mb-4">
            What {panel} W of panels adds a day in December, the darkest month, against an essentials day of {fmtWh(essWh)}. Most sun first.
          </p>
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">December solar recharge from {panel} watts of panels by state</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">State</th>
                  <th scope="col" className="p-3 font-semibold text-right">A December day</th>
                  <th scope="col" className="p-3 font-semibold text-right">Share of essentials</th>
                </tr>
              </thead>
              <tbody>
                {recharge.map(({ s, wh }) => (
                  <tr key={s.abbr} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">
                      <Link href={`/off-grid-solar-calculator/${s.slug}`} className="text-spark-orange hover:underline">{s.name}</Link>
                    </th>
                    <td className="p-3 text-right tabular-nums">{fmtWh(wh)}</td>
                    <td className="p-3 text-right tabular-nums">{Math.round((wh / essWh) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2">
            PVWatts model for 1 kW of south-facing panels at a 20 degree tilt near one city per state, scaled to {panel} W. Portable panels laid
            flat or shaded make less.
          </p>
        </Section>

        <Section title="Running a generator instead?" id="generator">
          <p className="text-stone-700 leading-relaxed max-w-3xl">
            A generator covers long outages and big loads, but it must run outdoors, at least 20 feet from the house (Ready.gov, CDC). See how much
            fuel to store with the <Link href="/generator-runtime-calculator" className="underline">generator runtime calculator</Link>.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Estimates only. Real use depends on your appliances, the weather and how often doors open. Prices and specifications are copied from
          makers&apos; US websites on the dates shown and change often.
        </Disclaimer>
        <Sources
          items={[
            ...sourcesFor(["doeFormula", "recsFridge", "recsAppliances", "eweb", "resmed", "doeLed", "router", "phone", "readyOutage", "foodsafety", "pvwatts", "nfpa", "cdcCo"]),
            ...products.map((p) => ({ name: `${AFFILIATES[p.brand].name} ${p.model} product page`, url: p.sourceUrl, detail: `checked ${formatDate(p.retrieved)}` })),
          ]}
        />
        <RelatedLinks links={relatedFor(PATH)} />
        <PhotoCredit name="outage" />
      </div>
    </div>
  );
}
