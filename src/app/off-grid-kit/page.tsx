import type { Metadata } from "next";
import Link from "next/link";
import KitPresetCards from "@/components/offgrid/KitPresetCards";
import OffGridKitBuilder from "@/components/offgrid/OffGridKitBuilder";
import { AffiliateDisclosure } from "@/components/affiliate";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PriceFootnote } from "@/components/products";
import { AFFILIATES } from "@/data/affiliates";
import { SOLAR_PANELS } from "@/data/products";
import { DATA_UPDATED, STATES, formatDate } from "@/lib/energy";
import { decemberPerKwDay, fmtKwh, fmtWh, offGridStates, relatedFor, sourcesFor, typicalWinterState } from "@/lib/offgrid";
import { EXAMPLE_GENERATOR, KIT_BATTERY_DAYS, KIT_DAYS, buildKit, homePreset, kitProductIds, presetKits } from "@/lib/offgrid-kit";
import { GOAL_DAYS, PREP_SOURCES as P } from "@/lib/prep";
import { money, productById } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/off-grid-kit";
const TITLE = "Off-Grid Kit for 90 Days: Packages by Home Size";
const DESCRIPTION =
  "Everything a household needs to go 90 days off grid, by home size and state: a power station, batteries and solar panels sized on December sun with dated prices, generator fuel for dark stretches, water, food and the rest of the kit.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const n0 = (n: number) => Math.round(n).toLocaleString("en-US");

export default function OffGridKitPage() {
  const typical = typicalWinterState();
  const dec = decemberPerKwDay(typical);
  const kits = presetKits(dec);
  const [small, medium, large] = kits;

  // Every station the builder can show for a preset in any state, for price dates and sources.
  const ids = new Set<string>();
  for (const s of STATES)
    for (const k of presetKits(decemberPerKwDay(s))) for (const id of kitProductIds(k)) ids.add(id);
  for (const k of kits) for (const id of kitProductIds(k)) ids.add(id);
  const shown = [...ids].map(productById);

  // The same medium home in the sunniest and darkest December, for the fuel contrast.
  const decs = STATES.map((s) => ({ s, d: decemberPerKwDay(s) })).sort((a, b) => a.d - b.d);
  const dark = decs[0];
  const sunny = decs[decs.length - 1];
  const medDark = buildKit({ home: "medium", loads: homePreset("medium").loads, perKwDay: dark.d });
  const medSunny = buildKit({ home: "medium", loads: homePreset("medium").loads, perKwDay: sunny.d });

  const pkgLine = (k: (typeof kits)[number]) =>
    k.power
      ? `${k.power.match.option.name}${k.power.match.addOns ? ` with ${k.power.match.addOns} expansion batteries` : ""} (${fmtKwh(k.power.match.totalWh)}) and ${k.power.panels} × ${k.power.panel.watts} W panels, ${money(k.power.priceUsd)} for the power items, plus about ${n0(k.generator.gallons)} gallons of generator fuel`
      : "no power station we track";

  const faqs = [
    {
      q: "What do I need to go off grid for 90 days?",
      a: `Power for the essentials, a way to recharge it in winter, water, food and heat. For a family of 4 in ${typical.name}, our example is the ${pkgLine(medium)}; ${n0(medium.water.storeGallons)} gallons of stored water with a certified filter and a source for the rest; and about ${n0(medium.food.total)} calories of food.`,
    },
    {
      q: "Can a power station run my whole house for 90 days?",
      a: "No. A portable power station package runs essentials: the fridge, a freezer, lights, internet, a CPAP, a furnace blower and, with the right station, a well pump. It will not run central air conditioning, electric heat, an electric range or an electric dryer. For a whole house you need a permanent off-grid or home battery system designed and installed by professionals.",
    },
    {
      q: "Is solar enough to get through a winter off grid?",
      a: `In most states, not on its own. We size for December, the darkest month. A medium home in ${sunny.s.name} needs about ${n0(medSunny.generator.gallons)} gallons of generator fuel over ${KIT_DAYS} days with our example of a week of storms; in ${dark.s.name} about ${n0(medDark.generator.gallons)}. That is why every package carries a generator and fuel.`,
    },
    {
      q: "Can I store 90 days of water?",
      a: `Not practically for most homes: at 1 gallon a person a day, a family of 4 needs ${n0(medium.water.totalGallons)} gallons for ${KIT_DAYS} days. CDC and FEMA ask for a 2-week supply. Store that (${n0(medium.water.storeGallons)} gallons for 4 people), then treat water from a well, rain barrel or other source with a certified filter or purifier.`,
    },
    {
      q: "How much food does a family need for 90 days?",
      a: `Count calories, not servings. Using the federal Dietary Guidelines' estimates for moderately active people, our family of 4 (two adults, children of 12 and 8) needs about ${n0(medium.food.daily)} calories a day, or ${n0(medium.food.total)} for ${KIT_DAYS} days.`,
    },
    {
      q: "Can a power station run a 240 V well pump?",
      a: "Only one with 240 V output, so the large-home package uses a 120/240 V station. Starting the pump is the hard part; if the station's specs do not cover the start, a soft starter fitted by a licensed electrician or pump installer is the usual fix. The pump is wired in, so a licensed electrician connects the station through a transfer switch.",
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "90-Day Off-Grid Kit Builder",
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
        crumbs={[
          { name: "Off grid", path: "/off-grid" },
          { name: "90-day off-grid kit", path: PATH },
        ]}
        eyebrow="Off-grid kit"
        title={<>{KIT_DAYS} days off grid. <span className="text-amber-300">Everything on one list.</span></>}
        sub={
          <>
            Pick your home size and state. Get the power station, batteries, panels, generator fuel, water and food for {KIT_DAYS} days, sized on
            your December sun.
          </>
        }
      >
        <a href="#builder" className="btn btn-primary">Build my kit</a>
        <a href="#packages" className="btn btn-light">The three packages</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />
        <QuickAnswer>
          <p>
            <strong>Small home or cabin, 1 to 2 people:</strong> {pkgLine(small)}.
          </p>
          <p>
            <strong>Family of 4:</strong> {pkgLine(medium)}.
          </p>
          <p>
            <strong>Large home on a well:</strong> {pkgLine(large)}.
          </p>
          <p>
            Example for {typical.name}. Each package runs essentials, not central air, electric heat, an electric range or a dryer. Water and food
            come on top: {GOAL_DAYS} days of stored water plus a filter, and {KIT_DAYS} days of calories.
          </p>
        </QuickAnswer>

        <Section title={`The three ${KIT_DAYS}-day packages`} id="packages">
          <KitPresetCards kits={kits} stateName={typical.name} />
        </Section>

        <h2 id="builder" className="text-2xl font-extrabold text-ink mt-10 mb-4 scroll-mt-24">Build your kit</h2>
        <OffGridKitBuilder states={offGridStates()} fallbackAbbr={typical.abbr} />
        <PriceFootnote products={shown} />
        <p className="text-xs text-muted mt-1">
          Panels: {SOLAR_PANELS.map((s) => `${AFFILIATES[s.brand].name} ${s.model} on ${formatDate(s.retrieved)}`).join("; ")}.
        </p>

        <Section title="How we size it" id="method">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              <strong>Power.</strong> We add up the loads you tick with the same figures as our{" "}
              <Link href="/off-grid-solar-calculator" className="underline">off-grid solar calculator</Link> (EIA for fridges and freezers, the
              Eugene Water &amp; Electric Board&apos;s sheet for motors). The battery holds {KIT_BATTERY_DAYS} days of that with no sun; the panels
              are sized to replace a day&apos;s use in December, the darkest month, from NREL&apos;s PVWatts model for your state, up to what the
              station accepts. We then pick the cheapest in-stock station from a brand we link to that holds the battery size and runs everything
              you ticked at once.
            </p>
            <p>
              <strong>Generator.</strong> Whatever the panels miss on an average December day, plus the storm days you choose, comes from a
              generator. Fuel uses its own spec sheet: tank size divided by hours a tank, times the hours it runs. Our starting figures are
              Honda&apos;s {EXAMPLE_GENERATOR.name}: {EXAMPLE_GENERATOR.ratedW.toLocaleString("en-US")} W rated, {EXAMPLE_GENERATOR.tankGal} gallon
              tank, {EXAMPLE_GENERATOR.runtimeHours} hours at rated load. Charging also loses some energy, so keep some fuel spare.
            </p>
            <p>
              <strong>Water and food.</strong> 1 gallon a person a day, {GOAL_DAYS} days stored (CDC, FEMA), and calories from the Dietary
              Guidelines&apos; table for moderately active people. Our households: two adults; two adults and children of 12 and 8; two adults
              and children of 15, 11 and 6.
            </p>
            <Callout>
              A {KIT_DAYS}-day package is a big buy. Most of it is useful in a 3-day outage too: start with the power station and {GOAL_DAYS} days
              of water, then add panels, batteries and fuel. For a cabin you visit, the{" "}
              <Link href="/off-grid-cabin-solar-kit" className="underline">cabin solar kit sizer</Link> is the better fit.
            </Callout>
          </div>
        </Section>

        <Section title="Water for 90 days" id="water">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              Storing {KIT_DAYS} days of water is not practical for most homes: our family of 4 would need {n0(medium.water.totalGallons)}{" "}
              gallons. Store {GOAL_DAYS} days, as CDC and FEMA advise, and plan a source for the rest: a well (which is why the pump matters), a
              rain barrel, or a stream or lake, treated with a certified purifier, a filter plus disinfection, or boiling.
            </p>
            <p>
              Which filters remove what, by certification: <Link href="/best-emergency-water-filters" className="underline">emergency water filters</Link>.
              Bleach drops and boiling times: <Link href="/how-to-purify-water" className="underline">how to purify water</Link>. Containers and
              refresh dates: <Link href="/emergency-water-storage-calculator" className="underline">water storage calculator</Link>.
            </p>
          </div>
        </Section>

        <Section title="Heat and the rest of the kit" id="rest">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              A furnace blower lets a gas or oil furnace run; a pellet stove needs even less power. Electric heat is out of reach for a power
              station package. For the stove&apos;s numbers see <Link href="/home-backup/pellet-stove" className="underline">power for a pellet stove</Link>;
              to connect a 240 V station to your house, start with the <Link href="/home-backup/hookup-picker" className="underline">hookup picker</Link>.
            </p>
            <p>
              Flashlights, a radio, first aid, medicines, sanitation and documents are on the{" "}
              <Link href="/emergency-kit-checklist" className="underline">emergency kit checklist</Link>; alerts come over{" "}
              <Link href="/noaa-weather-radio" className="underline">NOAA Weather Radio</Link>.
            </p>
          </div>
        </Section>

        <p className="text-sm text-muted mt-10">
          Solar data updated <time dateTime={DATA_UPDATED}>{formatDate(DATA_UPDATED)}</time>. Battery for {KIT_BATTERY_DAYS} days in{" "}
          {typical.name} for a medium home: {fmtKwh(medium.size.batteryWh)} at {fmtWh(medium.whPerDay)} a day.
        </p>
        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Estimates only. Real needs depend on your appliances, home, site, shade, snow and weather. Prices and specifications are copied from
          makers&apos; US websites on the dates shown and change often. Wired-in loads such as a well pump need a transfer switch installed by a
          licensed electrician.
        </Disclaimer>
        <Sources
          items={[
            ...sourcesFor(["pvwatts", "doeFormula", "recsFridge", "recsAppliances", "eweb", "doeLed", "router", "phone", "resmed", "franklinAim", "readyGenerators", "cdcCo", "nfpa"]),
            { name: `Honda ${EXAMPLE_GENERATOR.name} specifications`, url: EXAMPLE_GENERATOR.url, detail: `${EXAMPLE_GENERATOR.ratedW.toLocaleString("en-US")} W rated, ${EXAMPLE_GENERATOR.tankGal} gal tank, ${EXAMPLE_GENERATOR.runtimeHours} hours a tank at rated load; read ${formatDate(EXAMPLE_GENERATOR.read)}` },
            { ...P.cdcWaterStorage },
            { ...P.femaFoodWater },
            { ...P.dga2020 },
            ...shown.map((p) => ({ name: `${AFFILIATES[p.brand].name} ${p.model} product page`, url: p.sourceUrl, detail: `checked ${formatDate(p.retrieved)}` })),
            ...SOLAR_PANELS.map((s) => ({ name: `${AFFILIATES[s.brand].name} ${s.model} product page`, url: s.sourceUrl, detail: `checked ${formatDate(s.retrieved)}` })),
          ]}
        />
        <RelatedLinks links={[{ href: "/off-grid", label: "Off grid and emergency prep", desc: "Every off-grid and prep tool" }, ...relatedFor(PATH)]} />
        <PhotoCredit name="outage" />
      </div>
    </div>
  );
}
