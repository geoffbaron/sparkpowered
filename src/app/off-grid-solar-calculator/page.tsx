import type { Metadata } from "next";
import Link from "next/link";
import OffGridCalc from "@/components/offgrid/OffGridCalc";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { DATA_UPDATED, STATES, formatDate } from "@/lib/energy";
import { FRIDGE_KWH_YEAR } from "@/lib/everyday";
import {
  BATTERY_TYPES,
  CAMPER_VOLTS_URL,
  DEFAULT_AUTONOMY_DAYS,
  ESSENTIALS,
  PANEL_WATTS,
  USABLE_FRACTION,
  bestMonth,
  dailyWh,
  decemberPerKwDay,
  fmtKwh,
  fmtW,
  fmtWh,
  kwhPerKwDay,
  loadDef,
  offGridByState,
  offGridStates,
  relatedFor,
  sizeOffGrid,
  sourcesFor,
  typicalWinterState,
} from "@/lib/offgrid";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/off-grid-solar-calculator";
const TITLE = "Off-Grid Solar Calculator: Panels and Battery by State";
const DESCRIPTION =
  "Size an off-grid solar system for your state's darkest month. Pick your appliances, get panel watts and battery kWh from December PVWatts output for all 50 states and DC.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function OffGridSolarCalculatorPage() {
  const essentialsWh = dailyWh(ESSENTIALS);
  const rows = offGridByState(essentialsWh);
  const darkest = rows[0];
  const brightest = rows[rows.length - 1];
  const typical = typicalWinterState();
  const typicalSize = sizeOffGrid({ whPerDay: essentialsWh, perKwDay: decemberPerKwDay(typical) });
  const decIsWorst = STATES.filter((s) => [...Array(12).keys()].every((m) => kwhPerKwDay(s, m) >= decemberPerKwDay(s) - 1e-9)).length;
  const tBest = bestMonth(typical);
  const pctOfBest = Math.round((decemberPerKwDay(typical) / tBest.perKwDay) * 100);
  const usable = Math.round(USABLE_FRACTION * 100);
  const fridgeWh = loadDef("fridge").whPerDay!;

  const faqs = [
    {
      q: "How do I size an off-grid solar system?",
      a: `Add up the watt-hours you use in a day (watts × hours for each appliance, the US Department of Energy method). Divide by what 1 kW of panels makes in a December day where you live to get panel watts. Then multiply the daily use by the days you want to ride through with little sun and divide by the share of the battery you can use (${usable}% for lithium) to get battery size. Our calculator does all three with PVWatts output for your state.`,
    },
    {
      q: "Why size for December instead of the yearly average?",
      a: `An off-grid system has no grid to fall back on, so it must keep up in the darkest month. December is the lowest-output month in our PVWatts model in ${decIsWorst === STATES.length ? "all 50 states and DC" : `${decIsWorst} of the 50 states and DC`} (in West Virginia January ties it). In ${typical.name}, 1 kW of panels makes about ${decemberPerKwDay(typical).toFixed(2)} kWh a day in December, only ${pctOfBest}% of what it makes in ${tBest.name}. Size for the yearly average and the batteries run flat every winter.`,
    },
    {
      q: "How many solar panels do I need to run a fridge off grid?",
      a: `A typical US fridge uses about ${fmtWh(fridgeWh)} a day (EIA: ${FRIDGE_KWH_YEAR} kWh a year). In ${typical.name} in December that takes about ${fmtW(fridgeWh / decemberPerKwDay(typical))} of panels, or ${Math.ceil(fridgeWh / decemberPerKwDay(typical) / PANEL_WATTS)} panels of ${PANEL_WATTS} W. In ${darkest.s.name}, with the weakest December sun, it takes about ${fmtW(fridgeWh / darkest.perKwDay)}.`,
    },
    {
      q: "How many days of battery storage do I need off grid?",
      a: `There is no single rule. The US Department of Energy advises sizing batteries for cloudy stretches and keeping a backup generator. We start at ${DEFAULT_AUTONOMY_DAYS} days. Pick more if your winters bring long runs of cloud, fewer if you have a generator you are happy to run.`,
    },
    {
      q: "Can I use lead-acid batteries off grid?",
      a: `Yes, but you need a bigger bank. Renogy rates its AGM deep-cycle battery at 50% depth of discharge, against the ${usable}% of rated capacity we count as usable for lithium. So the same days of storage take about ${(USABLE_FRACTION / BATTERY_TYPES.agm.usable).toFixed(1)} times the rated capacity in AGM.`,
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Off-Grid Solar Calculator",
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
        image="solar-roof"
        crumbs={[{ name: "Off-grid solar calculator", path: PATH }]}
        eyebrow="Off-grid solar"
        title={<>Size it for December. <span className="text-amber-300">Then it works all year.</span></>}
        sub={
          <>
            An off-grid fridge, Wi-Fi, lights and phones need about <strong className="text-amber-300">{fmtW(typicalSize.panelW)} of panels</strong>{" "}
            and a {fmtKwh(typicalSize.batteryWh)} battery in {typical.name}. Your state&apos;s winter sun changes that a lot. Work out yours.
          </>
        }
      >
        <a href="#calculator" className="btn btn-primary">Size my system</a>
        <a href="#by-state" className="btn btn-light">Every state</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Solar data updated <time dateTime={DATA_UPDATED}>{formatDate(DATA_UPDATED)}</time> ·{" "}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-spark-orange">How we calculate this</Link>
        </p>
        <QuickAnswer>
          <p>
            Panel watts = watt-hours you use a day ÷ what 1 kW of panels makes on a December day where you live. Battery = daily use × days
            with little sun ÷ the share of the battery you can use. For the essentials ({fmtWh(essentialsWh)} a day) and {DEFAULT_AUTONOMY_DAYS}{" "}
            days of lithium storage, that runs from {fmtW(brightest.size.panelW)} of panels in {brightest.s.name} to {fmtW(darkest.size.panelW)}{" "}
            in {darkest.s.name}, with a {fmtKwh(typicalSize.batteryWh)} battery.
          </p>
        </QuickAnswer>

        <h2 id="calculator" className="text-2xl font-extrabold text-ink mt-10 mb-4 scroll-mt-24">Your loads, your state</h2>
        <OffGridCalc states={offGridStates()} fallbackAbbr={typical.abbr} />

        <Section title="How the calculation works" id="how">
          <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
            <p>
              <strong>Daily use (Wh) = watts × hours a day</strong>, added up for everything you run. That is the US Department of Energy&apos;s
              method. For fridges, freezers, TVs and microwaves we use the average yearly use from the EIA&apos;s 2020 household survey,
              divided by 365, because they cycle on and off.
            </p>
            <p>
              <strong>Panel watts = daily use ÷ December kWh per kW per day.</strong> The December figure is the PVWatts model&apos;s output for
              1 kW of south-facing panels at a 20 degree tilt near the city shown for each state, already net of 14% system losses and 96%
              inverter efficiency. We divide the December total by 31 days.
            </p>
            <p>
              <strong>Battery = daily use × days with little sun ÷ usable share.</strong> We count {usable}% of a lithium battery&apos;s rated
              capacity as usable (the same figure we use across the site for power stations) and 50% for lead-acid AGM, the depth Renogy rates
              its AGM battery at.
            </p>
            <Callout>
              Panels on a steeper tilt, which suits snowy places, catch more low winter sun than our 20 degree model. Shade from trees or hills
              cuts output, and short winter days hit hardest. If you can, check your exact site in the free PVWatts calculator.
            </Callout>
            <p className="text-sm">
              For vans and RVs, see <a href={CAMPER_VOLTS_URL} className="underline" rel="noopener">Camper Volts</a>.
            </p>
          </div>
        </Section>

        <Section title="Off-grid solar size in every state" id="by-state">
          <p className="text-stone-700 max-w-3xl mb-4">
            The essentials ({fmtWh(essentialsWh)} a day: a fridge, Wi-Fi, four LED bulbs for 5 hours and two phone charges), sized for December
            with {DEFAULT_AUTONOMY_DAYS} days of lithium storage. Weakest winter sun first.
          </p>
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Off-grid solar panel and battery size by state for an essentials load in December</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">State</th>
                  <th scope="col" className="p-3 font-semibold">Modeled near</th>
                  <th scope="col" className="p-3 font-semibold text-right">December kWh per kW a day</th>
                  <th scope="col" className="p-3 font-semibold text-right">Panels</th>
                  <th scope="col" className="p-3 font-semibold text-right">Battery</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ s, perKwDay, size }) => (
                  <tr key={s.abbr} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">
                      <Link href={`${PATH}/${s.slug}`} className="text-spark-orange hover:underline">{s.name}</Link>
                    </th>
                    <td className="p-3 text-stone-700">{s.solar.city}</td>
                    <td className="p-3 text-right tabular-nums">{perKwDay.toFixed(2)}</td>
                    <td className="p-3 text-right tabular-nums">{fmtW(size.panelW)}</td>
                    <td className="p-3 text-right tabular-nums">{fmtKwh(size.batteryWh)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="What to do with the numbers" id="next">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              Under about 1,000 W of panels and a few kWh of battery, an all-in-one portable power station with solar input can do the job. See{" "}
              <Link href="/off-grid-cabin-solar-kit" className="underline">what size cabin solar kit you need</Link>. Bigger than that, you are
              looking at a component system with a separate inverter and battery bank, plus a backup generator, as the US Department of Energy
              advises.
            </p>
            <p>
              Comparing that with the cost of bringing in a power line? See <Link href="/how-to-go-off-grid" className="underline">how to go off grid</Link>.
            </p>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Estimates only. Real output depends on your exact site, panel angle, shade, snow and equipment. Size a real system with an installer
          or an off-grid supplier before you buy.
        </Disclaimer>
        <Sources items={sourcesFor(["pvwatts", "pvwattsApi", "doeFormula", "doeBos", "recsFridge", "recsAppliances", "eweb", "doeLed", "router", "phone", "resmed", "cooler", "agm"])} />
        <RelatedLinks links={relatedFor(PATH)} />
        <PhotoCredit name="solar-roof" />
      </div>
    </div>
  );
}
