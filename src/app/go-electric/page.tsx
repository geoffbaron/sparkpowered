import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import GoElectricPlanner, { GoElectricPlannerFromParams } from "@/components/GoElectricPlanner";
import { AffiliateDisclosure } from "@/components/affiliate";
import { Breadcrumbs, Disclaimer, Faq } from "@/components/content";
import { Photo } from "@/components/ui";
import { solarQuotesUrl } from "@/data/affiliates";
import { lite } from "@/data/myths";
import { chargerById } from "@/data/chargers";
import { DATA_UPDATED, SOURCES, formatDate } from "@/lib/energy";
import { lifeSummary } from "@/lib/everyday";
import { ASSUMPTIONS } from "@/lib/go-electric";
import { PLANNER_COSTS, PLANNER_KIT, PLANNER_STATES, TYPICAL_TOTALS, typicalPlan } from "@/lib/planner-data";
import { fullName, productById } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";
import { AFFILIATES } from "@/data/affiliates";
import homeEnergy from "@/data/home-energy.json";

const PATH = "/go-electric";
const TITLE = "Go Electric Savings Calculator: What Each Switch Saves in Your State";
const DESCRIPTION =
  "See what going electric saves your household in a year: an EV instead of gas, a heat pump, a heat pump water heater, induction, rooftop or plug-in solar, and backup power. Built on EIA and EPA data for your state.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function GoElectricPage() {
  const outage = productById("ecoflow-delta-3-max");
  const charger = chargerById("lectron-nexus-j1772");
  const life = lifeSummary(outage.capacityWh);
  const oh = typicalPlan("OH");
  const totals = Object.values(TYPICAL_TOTALS);
  const sorted = Object.entries(TYPICAL_TOTALS).sort((a, b) => b[1] - a[1]);
  const nameOf = (a: string) => PLANNER_STATES.find((s) => s.abbr === a)!.name;
  const sources = [
    { label: `${SOURCES.electricityPrice.name} (${SOURCES.electricityPrice.period})`, url: SOURCES.electricityPrice.url },
    { label: `${SOURCES.gasoline.name}`, url: SOURCES.gasoline.url },
    { label: `${homeEnergy.sources.gasPrice.name} (${homeEnergy.sources.gasPrice.period})`, url: homeEnergy.sources.gasPrice.url },
    { label: homeEnergy.sources.recs.name, url: homeEnergy.sources.recs.url },
    { label: SOURCES.vehicles.name, url: SOURCES.vehicles.url },
    { label: SOURCES.solar.name, url: SOURCES.solar.url },
    ASSUMPTIONS.maintenance.source,
    ASSUMPTIONS.heatPumpCop.source,
    ASSUMPTIONS.furnaceAfue.source,
    ASSUMPTIONS.gasWaterHeaterUef.source,
    ASSUMPTIONS.heatPumpWaterHeaterUef.source,
    ASSUMPTIONS.gasCooktopEfficiency.source,
    { label: "EnergySage, solar panel cost (national average)", url: "https://www.energysage.com/local-data/solar-panel-cost/" },
  ].filter((s, i, a) => a.findIndex((x) => x.url === s.url) === i);

  const plannerProps = {
    states: PLANNER_STATES,
    costs: PLANNER_COSTS,
    outagePick: {
            id: outage.id,
            brand: outage.brand,
            name: fullName(outage),
            url: outage.url,
            priceUsd: outage.priceUsd!,
            life: `Keeps a fridge, Wi-Fi, lights and phones going for ${life.essentials}, or a fridge alone for ${life.fridge}.`,
          },
    pluginPick: {
            id: PLANNER_KIT.id,
            brand: PLANNER_KIT.brand,
            name: `${AFFILIATES[PLANNER_KIT.brand].name} ${PLANNER_KIT.name}`,
            url: PLANNER_KIT.url,
            priceUsd: PLANNER_KIT.priceUsd,
            life: "",
          },
    chargerPick: {
            id: charger.id,
            brand: charger.brand,
            name: `Lectron ${charger.name}`,
            url: charger.url,
            priceUsd: charger.priceUsd,
            life: "",
          },
    solarQuotes: solarQuotesUrl(),
    myths: {
            ev: lite("ev-battery-life"),
            solar: lite("solar-cloudy"),
            plugin: lite("need-whole-system"),
            heatpump: lite("heat-pumps-cold"),
            induction: lite("induction-pans"),
            battery: lite("battery-without-solar"),
          },
    sources: sources,
  };

  const faqs = [
    {
      q: "How much can I save by going electric?",
      a: `It depends most on how much you drive and what your home runs on. For a typical household that drives 12,000 miles a year and heats with gas, our estimate ranges from about $${Math.min(...totals).toLocaleString("en-US")} to $${Math.max(...totals).toLocaleString("en-US")} a year depending on the state, with ${nameOf(sorted[0][0])} at the top. In most states the biggest single saving is switching from a gas car to an EV charged at home, followed by solar for homeowners.`,
    },
    {
      q: "What should I switch first?",
      a: "Start with what you replace anyway. If your car is due, an EV usually saves the most. If your furnace, AC or water heater is near the end of its life, a heat pump version costs far less to add then than as an early swap. A plug-in solar kit or a power station is the cheapest way to start today, and works for renters.",
    },
    {
      q: "Does a heat pump always save money over gas?",
      a: "No. Where gas is cheap and electricity is expensive, a heat pump can cost a little more to run than a gas furnace, and we show that honestly. It still replaces your air conditioner too, and against electric baseboard, propane or oil it usually saves a lot. Cold-climate models do better than the conservative efficiency we assume.",
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Go Electric savings calculator",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          dateModified: DATA_UPDATED,
        }}
      />
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Photo name="hero" priority className="absolute inset-0 -z-10 h-full w-full object-cover" sizes="(max-width: 767px) 360px, 100vw" />
        <div className="absolute inset-0 -z-10 hero-shade" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Breadcrumbs items={[{ name: "Go electric", path: PATH }]} tone="dark" />
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.05] max-w-3xl">
            What would going electric save <span className="text-amber-300">you</span>?
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl">
            Pick your state and tell us a little about your home. We&apos;ll show what each switch saves a year, what it
            costs to start, and where to begin. In Ohio, a typical family that drives and heats with gas could save about{" "}
            <strong className="text-amber-300">${(Math.round(oh.total / 10) * 10).toLocaleString("en-US")} a year</strong>.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />
        <Suspense fallback={<GoElectricPlanner {...plannerProps} />}>
          <GoElectricPlannerFromParams {...plannerProps} />
        </Suspense>

        <section className="mt-14 grid md:grid-cols-3 gap-4" aria-label="Why people switch">
          {[
            { t: "Lower bills, every month", d: "Electricity is a cheaper way to move a car, heat water and, in many states, heat a home. The savings repeat every month." },
            { t: "Off the gas price rollercoaster", d: "Charge at home and you stop watching the price signs. Add solar and you lock in a share of your power for decades." },
            { t: "Quieter, cleaner home", d: "No engine idling in the garage, no flame in the kitchen, and backup power that runs silently when the grid is down." },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl bg-surface-light border border-black/8 p-5">
              <h2 className="font-extrabold text-ink text-lg">{x.t}</h2>
              <p className="text-stone-700 mt-1 text-sm leading-relaxed">{x.d}</p>
            </div>
          ))}
        </section>

        <Faq items={faqs} path={PATH} />
        <p className="text-sm text-muted mt-8">
          Data updated <time dateTime={DATA_UPDATED}>{formatDate(DATA_UPDATED)}</time>.{" "}
          <Link href="/methodology" className="underline underline-offset-2">Methodology</Link> ·{" "}
          <Link href="/myths" className="underline underline-offset-2">Myths, answered</Link>
        </p>
        <Disclaimer>
          Estimates for a typical household using state averages. Your savings depend on your rate plan, your home, how you
          drive and what equipment you buy. Upfront costs are before incentives. Not financial advice.
        </Disclaimer>
      </div>
    </div>
  );
}
