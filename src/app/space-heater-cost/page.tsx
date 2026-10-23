import type { Metadata } from "next";
import Link from "next/link";
import SpaceHeaterCalc from "@/components/SpaceHeaterCalc";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import home from "@/data/home-energy.json";
import { DATA_UPDATED, NATIONAL, SOURCES, STATES, cents, formatDate, usd, ytdWindow } from "@/lib/energy";
import { ASSUMPTIONS } from "@/lib/go-electric";
import { HEATER_HOURS_PER_DAY, HEATER_WATTS, gasUsdPerMcf, heatCostPerHour, heaterByState } from "@/lib/holiday";
import { UseThisData } from "@/components/UseThisData";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/space-heater-cost";
const TITLE = "How Much Does a Space Heater Cost to Run? By State (2026)";
const DESCRIPTION =
  "What a 1,500-watt space heater costs per hour, day and month in your state at 2026 electricity prices, and whether it beats your gas furnace or a heat pump.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function SpaceHeaterCostPage() {
  const usCents = NATIONAL.residentialCentsPerKwhYtd;
  const usGas = home.national.gasUsdPerMcf;
  const us = heatCostPerHour(usCents, usGas);
  const month = (perHour: number) => perHour * HEATER_HOURS_PER_DAY * 30;
  const rows = heaterByState();
  const priciest = rows[0];
  const cheapest = rows[rows.length - 1];
  const beatsFurnace = rows.filter((r) => r.h.heater < r.h.furnace).length;
  const props = {
    states: STATES.map((s) => ({ abbr: s.abbr, name: s.name, cents: s.electricity.residentialCentsPerKwhYtd, gasPerMcf: gasUsdPerMcf(s.abbr) })),
    us: { cents: usCents, gasPerMcf: usGas },
  };

  const faqs = [
    {
      q: "How much does it cost to run a space heater?",
      a: `A standard 1,500-watt space heater on high uses 1.5 kWh an hour. At the US average residential electricity price of ${cents(usCents)} per kWh (${ytdWindow()}, EIA), that is about ${usd(us.heater, 2)} an hour, ${usd(us.heater * HEATER_HOURS_PER_DAY, 2)} for ${HEATER_HOURS_PER_DAY} hours, or about ${usd(month(us.heater))} a month at ${HEATER_HOURS_PER_DAY} hours a day.`,
    },
    {
      q: "Is a space heater cheaper than central heat?",
      a: `Per unit of heat, usually not. The same heat from a gas furnace at the federal minimum 80% efficiency costs about ${usd(us.furnace, 2)} an hour on the US average gas price, and from a heat pump about ${usd(us.heatPump, 2)}. A space heater saves money only when it lets you turn the whole-house thermostat down and heat one room instead of the whole home. ${beatsFurnace === 0 ? "On 2026 prices, furnace heat is cheaper than space heater heat in every state." : `Space heater heat beats furnace heat in ${beatsFurnace} of ${rows.length} states.`}`,
    },
    {
      q: "Where is a space heater most expensive to run?",
      a: `${priciest.s.name}, at ${cents(priciest.c)} per kWh: about ${usd(priciest.h.heater, 2)} an hour on high. The cheapest is ${cheapest.s.name} at ${cents(cheapest.c)} per kWh, about ${usd(cheapest.h.heater, 2)} an hour.`,
    },
    {
      q: "Do some space heaters use less electricity than others?",
      a: "Not for the same heat. Every electric resistance heater, whether ceramic, oil-filled, infrared or a fan heater, turns each kWh into the same amount of heat. A heater rated 1,500 watts on high puts out the same heat as any other 1,500-watt heater. What differs is how the heat reaches you and how well the thermostat holds the room temperature. Only a heat pump gets more heat from the same electricity.",
    },
    {
      q: "Is it safe to leave a space heater on?",
      a: "Plug it straight into a wall outlet, never an extension cord or power strip. Keep it at least 3 feet from anything that can burn, such as bedding, curtains and furniture, and turn it off when you leave the room or go to sleep. Pick one with tip-over and overheat shutoff.",
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Space Heater Cost Calculator",
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
      <HubHero
        image="heat-pump"
        crumbs={[{ name: "Space heater cost", path: PATH }]}
        eyebrow="Winter heating"
        title={<>Warm room, fair bill. <span className="text-amber-300">Know what that heater costs.</span></>}
        sub={
          <>
            A 1,500-watt space heater costs about <strong className="text-amber-300">{usd(us.heater, 2)} an hour</strong> at the US average
            electricity price, or about {usd(month(us.heater))} a month at {HEATER_HOURS_PER_DAY} hours a day. See your state, and whether your
            furnace does it cheaper.
          </>
        }
      >
        <a href="#calculator" className="btn btn-primary">Price my heater</a>
        <a href="#by-state" className="btn btn-light">Every state</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Prices updated <time dateTime={DATA_UPDATED}>{formatDate(DATA_UPDATED)}</time> ·{" "}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-spark-orange">How we calculate this</Link>
        </p>
        <QuickAnswer>
          <p>
            About {usd(us.heater, 2)} an hour on high in an average state. A space heater is a good deal for warming one room while the
            rest of the house stays cool. It is an expensive way to heat a whole home: a heat pump gives the same heat for about{" "}
            {Math.round((1 - 1 / ASSUMPTIONS.heatPumpCop.value) * 100)}% less electricity.
          </p>
        </QuickAnswer>

        <h2 id="calculator" className="text-2xl font-extrabold text-ink mt-10 mb-4 scroll-mt-24">Your heater, your state</h2>
        <SpaceHeaterCalc {...props} />

        <Section title="How the calculation works" id="how">
          <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
            <p>
              <strong>Cost per hour = watts ÷ 1,000 × price per kWh.</strong> Plug-in heaters top out at {HEATER_WATTS.toLocaleString("en-US")} watts
              on high because that is the most a standard household outlet can supply continuously; most have a 750-watt low setting.
              Electricity prices are each state&apos;s average residential price for {ytdWindow()} from the US Energy Information
              Administration.
            </p>
            <p>
              The furnace comparison delivers the same heat from natural gas at your state&apos;s {home.sources.gasPrice.period} residential
              gas price (EIA), burned at {Math.round(ASSUMPTIONS.furnaceAfue.value * 100)}% efficiency, the federal minimum. The heat
              pump comparison uses the federal minimum seasonal rating for new heat pumps, about {ASSUMPTIONS.heatPumpCop.value.toFixed(1)}{" "}
              units of heat per unit of electricity.
            </p>
            <Callout>
              A heater with a thermostat cycles on and off once the room is warm, so put in the hours it actually runs, not the hours it
              is switched on. Our {HEATER_HOURS_PER_DAY}-hour default is a cold evening and night in one room.
            </Callout>
          </div>
        </Section>

        <Section title="Space heater cost in every state" id="by-state">
          <p className="text-stone-700 max-w-3xl mb-4">
            A 1,500-watt heater on high, {HEATER_HOURS_PER_DAY} hours a day for 30 days, next to the same heat from a gas furnace and a heat
            pump. Most expensive first.
          </p>
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Space heater running cost by state, compared with a gas furnace and a heat pump</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">#</th>
                  <th scope="col" className="p-3 font-semibold">State</th>
                  <th scope="col" className="p-3 font-semibold text-right">Per hour</th>
                  <th scope="col" className="p-3 font-semibold text-right">Per month</th>
                  <th scope="col" className="p-3 font-semibold text-right">Gas furnace</th>
                  <th scope="col" className="p-3 font-semibold text-right">Heat pump</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ s, h }, i) => (
                  <tr key={s.abbr} className="border-t border-black/6">
                    <td className="p-3 text-muted tabular-nums">{i + 1}</td>
                    <th scope="row" className="p-3 font-medium">
                      <Link href={`/states/${s.slug}`} className="text-spark-orange hover:underline">{s.name}</Link>
                    </th>
                    <td className="p-3 text-right tabular-nums">{usd(h.heater, 2)}</td>
                    <td className="p-3 text-right tabular-nums">{usd(month(h.heater))}</td>
                    <td className="p-3 text-right tabular-nums">{usd(month(h.furnace))}</td>
                    <td className="p-3 text-right tabular-nums">{usd(month(h.heatPump))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="When the power goes out" id="outage">
          <p className="text-stone-700 leading-relaxed max-w-3xl">
            A space heater is the one thing a portable power station cannot run for long: 1,500 watts empties a 1,000 Wh unit in well under
            an hour. In a winter outage, use a power station for the furnace blower, lights, phones and the fridge, and keep warm with
            layers in one closed-off room. See <Link href="/best-portable-power-stations" className="underline">backup power for outages</Link>.
          </p>
        </Section>

        <UseThisData path={PATH} title="Space heater cost by state" csv={`${PATH}/data.csv`} />

        <Faq items={faqs} path={PATH} />
        <Disclaimer />
        <Sources
          items={[
            { name: SOURCES.electricityPrice.name, url: SOURCES.electricityPrice.url, detail: SOURCES.electricityPrice.period },
            { name: home.sources.gasPrice.name, url: home.sources.gasPrice.url, detail: home.sources.gasPrice.period },
            { name: ASSUMPTIONS.furnaceAfue.source.label, url: ASSUMPTIONS.furnaceAfue.source.url, detail: "furnace and heat pump minimum efficiency" },
            { name: "US Consumer Product Safety Commission, Portable heater safety", url: "https://www.cpsc.gov/Safety-Education/Safety-Guides/Home/Portable-Heaters" },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/go-electric", label: "Go Electric planner", desc: "What a heat pump would save in your home" },
            { href: "/christmas-lights-cost", label: "Christmas lights cost", desc: "What your display costs to run this season" },
            { href: "/best-portable-power-stations", label: "Portable power stations", desc: "Keep the lights and fridge on in an outage" },
            { href: "/home-battery-backup", label: "Home battery backup", desc: "Whole-home backup sizing" },
            { href: "/states", label: "Energy data by state", desc: "Electricity and gas prices for every state" },
          ]}
        />
        <PhotoCredit name="heat-pump" />
      </div>
    </div>
  );
}
