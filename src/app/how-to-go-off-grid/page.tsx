import type { Metadata } from "next";
import Link from "next/link";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { INSTALLED_BATTERY_COST, ROOFTOP_SOLAR_COST } from "@/data/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";
import { DATA_UPDATED, formatDate, usd } from "@/lib/energy";
import {
  CABIN_TIERS,
  CAMPER_VOLTS_URL,
  DEFAULT_AUTONOMY_DAYS,
  LINE_EXTENSION,
  dailyWh,
  decemberPerKwDay,
  fmtKwh,
  fmtW,
  fmtWh,
  installedEstimate,
  lineExtensionCost,
  relatedFor,
  sizeOffGrid,
  sourcesFor,
  typicalWinterState,
} from "@/lib/offgrid";

const PATH = "/how-to-go-off-grid";
const UPDATED = "2026-10-26";
const TITLE = "How to Go Off Grid: Power Line Cost vs Solar and Battery";
const DESCRIPTION =
  "How to take a home or cabin off grid: what a power line extension costs per mile, what solar and batteries cost for the same home, how to size for winter, and the permits, well and septic to plan for.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const round100 = (n: number) => Math.round(n / 100) * 100;

export default function HowToGoOffGridPage() {
  const typical = typicalWinterState();
  const dec = decemberPerKwDay(typical);
  const tiers = CABIN_TIERS.filter((t) => t.id !== "weekend").map((t) => {
    const size = sizeOffGrid({ whPerDay: dailyWh(t.picks), perKwDay: dec });
    return { t, size, cost: installedEstimate(size.panelW, size.batteryWh) };
  });
  const [part, full] = tiers;
  const miles = [0.25, 0.5, 1, 2];
  const oneMile = lineExtensionCost(1);
  const fullCost = round100(full.cost.total);
  const breakEvenLow = fullCost / LINE_EXTENSION.highPerMile;
  const breakEvenHigh = fullCost / LINE_EXTENSION.lowPerMile;

  const faqs = [
    {
      q: "How much does it cost to go off grid?",
      a: `For a full-time home in ${typical.name} using about ${fmtWh(full.size.whPerDay)} a day, sized for December with ${DEFAULT_AUTONOMY_DAYS} days of battery, about ${fmtW(full.size.panelW)} of panels and ${fmtKwh(full.size.batteryWh)} of battery. At EnergySage's national installed averages ($${ROOFTOP_SOLAR_COST.perWatt.toFixed(2)} a watt for solar, $${INSTALLED_BATTERY_COST.medianPerKwh.toLocaleString("en-US")} per kWh for batteries) that is roughly ${usd(fullCost)}, before a backup generator. Those averages are for grid-tied systems, so get off-grid quotes.`,
    },
    {
      q: "Is it cheaper to go off grid or run a power line?",
      a: `It depends on the distance. The US Department of Energy says extending a power line can cost $15,000 to $50,000 per mile. On our full-time home estimate of about ${usd(fullCost)}, solar and batteries come out cheaper once the line is longer than roughly ${breakEvenLow.toFixed(1)} to ${breakEvenHigh.toFixed(1)} miles. Ask your utility for a written line extension quote; it is the number that decides it.`,
    },
    {
      q: "What is the first step to going off grid?",
      a: "Write down everything you will run and for how long each day, then add up the watt-hours. That number sets the size of everything else. Cutting it, with LED lights, an efficient fridge and propane or wood for heat and cooking, is the cheapest way to shrink the system.",
    },
    {
      q: "Do I need a generator if I go off grid?",
      a: "It is wise. The US Department of Energy recommends sizing batteries for cloudy weather and using a backup generator for the slumps. A generator lets you buy a smaller battery bank and covers long stormy spells.",
    },
    {
      q: "Do I need a permit to go off grid?",
      a: "Usually some. Rules are local: check with your county building department about electrical and building permits, and your county or state health department about a well and a septic system, before you buy land or equipment.",
    },
  ];

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${url(PATH)}#article`,
          headline: TITLE,
          description: DESCRIPTION,
          url: url(PATH),
          datePublished: UPDATED,
          dateModified: UPDATED,
          author: { "@id": url("/#organization") },
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          mainEntityOfPage: url(PATH),
        }}
      />
      <HubHero
        image="home-battery"
        crumbs={[{ name: "How to go off grid", path: PATH }]}
        eyebrow="Off-grid guide"
        title={<>Off grid, on purpose. <span className="text-amber-300">Know the numbers first.</span></>}
        sub={
          <>
            A power line can cost <strong className="text-amber-300">$15,000 to $50,000 a mile</strong> (US DOE). A full-time off-grid home runs
            about {usd(fullCost)} installed at national averages. Here is how to tell which wins, and what else to plan.
          </>
        }
      >
        <a href="#compare" className="btn btn-primary">Line vs solar</a>
        <a href="#steps" className="btn btn-light">The steps</a>
      </HubHero>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Updated <time dateTime={UPDATED}>{formatDate(UPDATED)}</time> · Solar data from {formatDate(DATA_UPDATED)}
        </p>
        <QuickAnswer>
          <p>
            Going off grid makes money sense when the power line is long. At $15,000 to $50,000 a mile, one mile of line costs{" "}
            {usd(oneMile.low)} to {usd(oneMile.high)}. A part-time cabin with a fridge needs about {fmtW(part.size.panelW)} of panels and{" "}
            {fmtKwh(part.size.batteryWh)} of battery in {typical.name}; a full-time home about {fmtW(full.size.panelW)} and{" "}
            {fmtKwh(full.size.batteryWh)}. Size for December, keep a generator, and check permits before you buy.
          </p>
        </QuickAnswer>

        <Section title="Power line or solar and battery?" id="compare">
          <p className="text-stone-700 leading-relaxed mb-4">
            The US Department of Energy puts a power line extension at $15,000 to $50,000 per mile. Your utility&apos;s quote is the real number.
          </p>
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Power line extension cost by distance</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Distance to the grid</th>
                  <th scope="col" className="p-3 font-semibold text-right">Line extension cost</th>
                </tr>
              </thead>
              <tbody>
                {miles.map((m) => {
                  const c = lineExtensionCost(m);
                  return (
                    <tr key={m} className="border-t border-black/6">
                      <th scope="row" className="p-3 font-medium">{m} {m === 1 ? "mile" : "miles"}</th>
                      <td className="p-3 text-right tabular-nums">{usd(c.low)} to {usd(c.high)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface mt-4">
            <table className="w-full text-sm">
              <caption className="sr-only">Off-grid solar and battery size and installed cost estimate in {typical.name}</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Off grid in {typical.name}</th>
                  <th scope="col" className="p-3 font-semibold text-right">Panels</th>
                  <th scope="col" className="p-3 font-semibold text-right">Battery</th>
                  <th scope="col" className="p-3 font-semibold text-right">Installed estimate</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map(({ t, size, cost }) => (
                  <tr key={t.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">
                      {t.label}
                      <span className="block text-xs text-muted font-normal">{fmtWh(size.whPerDay)} a day</span>
                    </th>
                    <td className="p-3 text-right tabular-nums">{fmtW(size.panelW)}</td>
                    <td className="p-3 text-right tabular-nums">{fmtKwh(size.batteryWh)}</td>
                    <td className="p-3 text-right tabular-nums">{usd(round100(cost.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2">
            Estimate = panel watts × ${ROOFTOP_SOLAR_COST.perWatt.toFixed(2)} a watt + battery kWh × $
            {INSTALLED_BATTERY_COST.medianPerKwh.toLocaleString("en-US")} per kWh: EnergySage&apos;s national installed averages for grid-tied
            systems. Off-grid quotes differ, and a backup generator is extra. {typical.name} is the state with the middle December sun in our
            model; sunnier states need fewer panels.
          </p>
          <Callout>
            Smaller needs cost far less. A weekend cabin can run on one portable power station and a few panels. See{" "}
            <Link href="/off-grid-cabin-solar-kit" className="underline">what size cabin kit you need</Link>.
          </Callout>
        </Section>

        <Section title="How to go off grid, step by step" id="steps">
          <ol className="list-decimal pl-5 space-y-4 text-stone-700 leading-relaxed">
            <li>
              <strong>List your loads.</strong> Watts × hours a day for everything you will run, added up. In our example full-time home, the fridge,
              freezer, well pump and furnace blower are most of the total. Our <Link href="/off-grid-solar-calculator" className="underline">off-grid solar calculator</Link>{" "}
              has typical figures.
            </li>
            <li>
              <strong>Shrink them.</strong> Every watt-hour you cut saves panels and battery. Propane or wood for heat, hot water and cooking keeps
              the biggest loads off the system.
            </li>
            <li>
              <strong>Size for December.</strong> Off grid there is no utility to cover a dark month. Use your state&apos;s winter solar output, not
              the yearly average.
            </li>
            <li>
              <strong>Pick days of storage, and a backup.</strong> The US Department of Energy advises sizing batteries for cloudy weather and
              keeping a backup generator. See the <Link href="/generator-runtime-calculator" className="underline">generator fuel calculator</Link>.
            </li>
            <li>
              <strong>Get the line quote.</strong> Ask the utility what it would charge to connect. Compare it with your solar and battery quotes.
            </li>
            <li>
              <strong>Check permits.</strong> Ask your county building department about electrical and building permits, and zoning, before you
              buy equipment.
            </li>
            <li>
              <strong>Plan water and waste.</strong> A well needs a pump, and the pump needs power: about 1,000 W while it runs for a 1/3 HP pump
              (EWEB). Private well water is not regulated under the federal Safe Drinking Water Act, so testing is up to you (EPA). For a septic system,
              check with your county or state health department.
            </li>
          </ol>
          <p className="text-sm text-stone-700 mt-6">
            For vans and RVs, see <a href={CAMPER_VOLTS_URL} className="underline" rel="noopener">Camper Volts</a>.
          </p>
        </Section>

        <Section title="Before you cut the cord" id="before">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <p>
              If the grid is already at your door, you can keep the connection and add a battery for outages
              instead. See the <Link href="/power-outage-backup-calculator" className="underline">power outage backup calculator</Link> and{" "}
              <Link href="/home-battery-backup" className="underline">home battery backup</Link>.
            </p>
            <p>
              Off grid also means planning water, food and communication for storms. Start with the{" "}
              <Link href="/emergency-kit-checklist" className="underline">emergency kit checklist</Link> and{" "}
              <Link href="/emergency-water-storage-calculator" className="underline">water storage calculator</Link>.
            </p>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Estimates only. Costs depend on your site, distance, local labor and equipment. Get written quotes from your utility and installers.
          This is general information, not financial or legal advice.
        </Disclaimer>
        <Sources items={sourcesFor(["doeStandAlone", "doeBos", "solarCost", "batteryCost", "pvwatts", "doeFormula", "recsFridge", "recsAppliances", "eweb", "doeLed", "router", "phone", "epaWells", "epaSeptic"])} />
        <RelatedLinks links={relatedFor(PATH)} />
        <PhotoCredit name="home-battery" />
      </div>
    </article>
  );
}
