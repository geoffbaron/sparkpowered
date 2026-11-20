import type { Metadata } from "next";
import Link from "next/link";
import KitPresetCards from "@/components/offgrid/KitPresetCards";
import OffGridKitBuilder from "@/components/offgrid/OffGridKitBuilder";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PriceFootnote } from "@/components/products";
import { AFFILIATES } from "@/data/affiliates";
import { OFFGRID_SYSTEMS, SOLAR_PANELS } from "@/data/products";
import { DATA_UPDATED, STATES, formatDate } from "@/lib/energy";
import { decemberPerKwDay, fmtKwh, fmtWh, offGridStates, relatedFor, sourcesFor, typicalWinterState } from "@/lib/offgrid";
import { EXAMPLE_GENERATOR, KIT_BATTERY_DAYS, KIT_DAYS, buildKit, homePreset, kitProductIds, kitSystemIds, presetKits } from "@/lib/offgrid-kit";
import { GOAL_DAYS, PREP_SOURCES as P } from "@/lib/prep";
import { COOK_MINUTES_PER_PERSON, EXAMPLE_STOVE, FIRST_AID_KITS, LIGHT_COMMS, MEDICAL_HYGIENE, STAPLES, SURVIVAL_READ, SURVIVAL_SOURCES as SV, fdcUrl } from "@/lib/survival-kit";
import { money, productById } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/off-grid-kit";
const TITLE = "90-Day Survival Kit: Power, Water, Food and Garden by Home Size";
const DESCRIPTION =
  "A complete 90-day household survival kit by home size and state: power sized on December sun with dated prices, generator and stove fuel, water and bleach, pounds of rice, beans and oats, a seed list with honest harvest times, a cold frame or greenhouse, first aid and a printable checklist.";

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
  const sysIds = new Set<string>();
  for (const s of STATES) for (const k of presetKits(decemberPerKwDay(s))) for (const id of kitSystemIds(k)) sysIds.add(id);
  const systems = OFFGRID_SYSTEMS.filter((s) => sysIds.has(s.id));

  // The same medium home in the sunniest and darkest December, for the fuel contrast.
  const decs = STATES.map((s) => ({ s, d: decemberPerKwDay(s) })).sort((a, b) => a.d - b.d);
  const dark = decs[0];
  const sunny = decs[decs.length - 1];
  const medDark = buildKit({ home: "medium", loads: homePreset("medium").loads, perKwDay: dark.d });
  const medSunny = buildKit({ home: "medium", loads: homePreset("medium").loads, perKwDay: sunny.d });

  const pkgLine = (k: (typeof kits)[number]) =>
    k.power
      ? `${k.power.match.option.name}${k.power.match.addOns ? ` with ${k.power.match.addOns} ${k.power.system ? "extra" : "expansion"} batter${k.power.match.addOns === 1 ? "y" : "ies"}` : ""} (${fmtKwh(k.power.match.totalWh)}) and ${k.power.panels} × ${k.power.panelWatts} W panels${k.power.system ? " in the box" : ""}, ${money(k.power.priceUsd)} for the power items, plus about ${n0(k.generator.gallons)} gallons of generator fuel`
      : "no power station we track";

  const ms = medium.supplies;
  const rng = (a: number, b: number) => `${n0(a)} to ${n0(b)}`;
  const staplesLine = (k: (typeof kits)[number]) =>
    k.supplies.staples.map((l) => `${l.cans != null ? `${n0(l.cans)} cans of` : `${n0(l.pounds)} lb of`} ${l.staple.label.replace(" (16-oz cans)", "").toLowerCase()}`).join(", ");

  const faqs = [
    {
      q: "What goes in a 90-day survival kit for a family?",
      a: `For a family of 4 in ${typical.name}: the ${pkgLine(medium)}; ${n0(medium.water.storeGallons)} gallons of stored water, a certified filter and a source for the rest; about ${n0(medium.food.total)} calories of food (${staplesLine(medium)}); ${n0(ms.cooking.cylinders)} one-pound propane cylinders for an outdoor camp stove; first aid, ${KIT_DAYS} days of prescriptions, a toilet without water, a NOAA Weather Radio, lights and batteries; and seed for a garden if you need to go longer.`,
    },
    {
      q: "Can a power station run my whole house for 90 days?",
      a: "No. A portable power station package runs essentials: the fridge, a freezer, lights, internet, a CPAP, a furnace blower and, with the right station, a well pump. When a family's essentials need more battery than the biggest power station we track, our package moves up to a complete off-grid system (an inverter, a 48 V battery rack and panels), which a licensed electrician wires into the house, usually with a permit. Neither is sized for central air conditioning, electric heat, an electric range or an electric dryer.",
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
      a: `Count calories, not servings. Using the federal Dietary Guidelines' estimates for moderately active people, our family of 4 (two adults, children of 12 and 8) needs about ${n0(medium.food.daily)} calories a day, or ${n0(medium.food.total)} for ${KIT_DAYS} days. With USDA's calories per pound, our example mix is ${staplesLine(medium)}.`,
    },
    {
      q: "Can a garden or greenhouse feed us in 90 days?",
      a: `Not much of it. In Texas A&M's extension table, radishes take 25 to 40 days, bush beans 45 to 60, carrots 70 to 80 and potatoes 75 to 100, and that is in the growing season. Started on day 1, a garden adds a little fresh food near the end of ${KIT_DAYS} days; it matters if you need to go longer. A cold frame or low tunnel keeps hardy greens like spinach going into winter, but Iowa State Extension says crops must be full-sized by early November to last: in a cold state the cover holds food, it does not grow much new.`,
    },
    {
      q: "How much propane do I need to cook for 90 days?",
      a: `Coleman rates its Classic 2-burner stove at up to 1 hour with both burners on high per ${EXAMPLE_STOVE.cylinderOz}-oz cylinder. At our example of ${COOK_MINUTES_PER_PERSON} minutes a person a day, a family of 4 needs about ${n0(ms.cooking.cylinders)} cylinders, or ${ms.cooking.bulkTanks} × 20-lb tanks. Cook outdoors only: CDC says never use a portable gas camp stove indoors.`,
    },
    {
      q: "Can a power station run a 240 V well pump?",
      a: "Only one with 240 V output, so the large-home package uses a station or system the maker rates for 120/240 V. Starting the pump is the hard part; if the specs do not cover the start, a soft starter fitted by a licensed electrician or pump installer is the usual fix. The pump is wired in, so a licensed electrician makes the connection through a transfer switch.",
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
        eyebrow="90-day survival kit"
        title={<>{KIT_DAYS} days on your own. <span className="text-amber-300">Power, water, food and garden on one list.</span></>}
        sub={
          <>
            Pick your home size and state. Get the power, fuel, water, food, stove, seeds, first aid and the rest for {KIT_DAYS} days, with a
            checklist to print.
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
            Example for {typical.name}. Each package runs essentials, not central air, electric heat, an electric range or a dryer. On top:{" "}
            {GOAL_DAYS} days of stored water plus a filter, {KIT_DAYS} days of food as staples (a family of 4: {staplesLine(medium)}), stove fuel,
            seeds, first aid and sanitation. A garden will not feed you inside {KIT_DAYS} days; it is for going longer.
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
          {systems.length > 0 && <> Off-grid systems and their extra batteries: {systems.map((s) => `${AFFILIATES[s.brand].name} ${s.model} (${s.variant}) on ${formatDate(s.retrieved)}`).join("; ")}.</>}
        </p>

        <Section title="How we size it" id="method">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              <strong>Power.</strong> We add up the loads you tick with the same figures as our{" "}
              <Link href="/off-grid-solar-calculator" className="underline">off-grid solar calculator</Link> (EIA for fridges and freezers, the
              Eugene Water &amp; Electric Board&apos;s sheet for motors). The battery holds {KIT_BATTERY_DAYS} days of that with no sun; the panels
              are sized to replace a day&apos;s use in December, the darkest month, from NREL&apos;s PVWatts model for your state, up to what the
              station accepts. We then pick the cheapest in-stock station from a brand we link to that holds the battery size and runs everything
              you ticked at once. When no power station we track holds it, we pick the cheapest complete off-grid system that does, adding the
              maker&apos;s own extra battery modules, with the panels that come in its box. A system like that is installed by a licensed
              electrician; its cost is not in our total.
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
              <strong>Rain barrels.</strong> CDC says rainwater is not necessarily safe to drink without first removing germs and chemicals, even
              when it looks clean. Treat it like any outdoor water, and check your state and local rules before you collect it.
            </p>
            <p>
              <strong>Bleach.</strong> At EPA&apos;s dose of {ms.bleach.dropsPerGallon} drops of 6% unscented bleach a gallon, treating the other{" "}
              {n0(medium.water.treatGallons)} gallons for a family of 4 takes about {Math.round(ms.bleach.flOz)} fluid ounces, twice that for cloudy
              or very cold water. EPA says to use bleach less than a year old, so buy it fresh each year. Drops and wait times:{" "}
              <Link href="/how-to-purify-water" className="underline">how to purify water</Link>. Which filters remove what, by certification:{" "}
              <Link href="/best-emergency-water-filters" className="underline">emergency water filters</Link>. Containers and refresh dates:{" "}
              <Link href="/emergency-water-storage-calculator" className="underline">water storage calculator</Link>.
            </p>
          </div>
        </Section>

        <Section title="Food for 90 days: staples or freeze-dried" id="food">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              We turn the household&apos;s calories into pounds with USDA FoodData Central&apos;s calories per 100 grams. The split between foods
              is our example, not a diet plan: rice 35% of calories, dry beans 15%, oats 15%, oil 10%, peanut butter 10% and canned goods 15%.
              Canned goods are counted as 16-oz cans of baked beans (about {Math.round((STAPLES[5].kcalPer100g * 454) / 100)} calories a can);
              canned vegetables and fruit have far fewer calories, so count them as extras.
            </p>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse min-w-[520px]" data-testid="staples-table">
              <thead>
                <tr className="text-left border-b border-black/10">
                  <th className="py-2 pr-3">Staple</th>
                  <th className="py-2 pr-3">Calories per 100 g (USDA)</th>
                  {kits.map((k) => (
                    <th key={k.home.id} className="py-2 pr-3">{k.home.label} ({k.food.people})</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAPLES.map((st, i) => (
                  <tr key={st.id} className="border-b border-black/5">
                    <td className="py-2 pr-3 font-semibold text-ink">{st.label}</td>
                    <td className="py-2 pr-3">
                      <a href={fdcUrl(st.fdcId)} className="underline" rel="noopener">{st.kcalPer100g}</a>
                    </td>
                    {kits.map((k) => {
                      const l = k.supplies.staples[i];
                      return (
                        <td key={k.home.id} className="py-2 pr-3 tabular-nums">
                          {l.cans != null ? `${n0(l.cans)} cans` : `${n0(l.pounds)} lb`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-semibold text-ink">Total calories</td>
                  <td />
                  {kits.map((k) => (
                    <td key={k.home.id} className="py-2 pr-3 tabular-nums">{n0(k.food.total)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl mt-4">
            <p>
              Rice and dry beans need water and a long simmer, so they lean on the stove fuel below. Store them sealed, cool and dry, and eat what
              you store so it turns over. Infants, allergies and special diets need their own plan with your doctor.
            </p>
            <p>
              <strong>Freeze-dried instead.</strong> The same {n0(medium.food.total)} calories for a family of 4 can come from freeze-dried storage
              food such as <PartnerLink brand="valleyfood">Valley Food Storage</PartnerLink>,{" "}
              <PartnerLink brand="readywise">ReadyWise</PartnerLink> or <PartnerLink brand="mountainhouse">Mountain House</PartnerLink> (plain
              links; we do not earn from these). Compare kits on total calories, not servings or &ldquo;days&rdquo;, in the{" "}
              <Link href="/emergency-food-calculator" className="underline">emergency food calculator</Link>. Most need hot water to prepare.
            </p>
          </div>
        </Section>

        <Section title="Cooking and heat" id="cooking">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              <strong>Cooking without power.</strong> A two-burner propane camp stove, used outdoors. Coleman rates its Classic stove (
              {EXAMPLE_STOVE.totalBtu.toLocaleString("en-US")} BTU) at up to {EXAMPLE_STOVE.hoursPerCylinder} hour with both burners on high per{" "}
              {EXAMPLE_STOVE.cylinderOz}-oz cylinder. We assume {COOK_MINUTES_PER_PERSON} minutes a person a day on high; change it in the builder.
              Fuel uses the same formula as the generator: cylinders ÷ hours a cylinder × hours run. Over {KIT_DAYS} days:{" "}
              {kits.map((k, i) => (
                <span key={k.home.id}>
                  {i > 0 ? "; " : ""}
                  {k.home.label.toLowerCase()} {n0(k.supplies.cooking.cylinders)} cylinders ({k.supplies.cooking.bulkTanks} × 20-lb tanks)
                </span>
              ))}
              .
            </p>
            <Callout>
              CDC: never use a portable gas camp stove indoors, never heat your house with a gas oven, and never burn charcoal indoors. Store
              propane outside, and keep a battery carbon monoxide alarm inside.
            </Callout>
            <p>
              <strong>Heat.</strong> A furnace blower lets a gas or oil furnace run; a pellet stove needs even less power. Electric heat is out of
              reach for a power station package. For the stove&apos;s numbers see{" "}
              <Link href="/home-backup/pellet-stove" className="underline">power for a pellet stove</Link>; to connect a 240 V station to your house,
              start with the <Link href="/home-backup/hookup-picker" className="underline">hookup picker</Link>. Warm clothes and a sleeping bag or
              blankets for each person are on the checklist.
            </p>
          </div>
        </Section>

        <Section title="Seeds and garden: what 90 days can and cannot grow" id="garden">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              Most vegetables take 50 to 100 days or more to a first harvest, counted from planting in the growing season. A garden started on day
              1 adds a little fresh food near the end of {KIT_DAYS} days. It matters if you need to go longer, so the kit carries seed, and the
              stored food carries the {KIT_DAYS} days. Amounts are Texas A&amp;M AgriLife Extension&apos;s planting per person for fresh eating,
              times your household.
            </p>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse min-w-[520px]" data-testid="garden-table">
              <thead>
                <tr className="text-left border-b border-black/10">
                  <th className="py-2 pr-3">Crop</th>
                  <th className="py-2 pr-3">Days to harvest</th>
                  {kits.map((k) => (
                    <th key={k.home.id} className="py-2 pr-3">{k.home.label} ({k.food.people})</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {medium.supplies.garden.lines.map((l, i) => (
                  <tr key={l.crop.id} className="border-b border-black/5">
                    <td className="py-2 pr-3 font-semibold text-ink">{l.crop.label}</td>
                    <td className="py-2 pr-3 tabular-nums">
                      {l.crop.days[0]} to {l.crop.days[1]}
                      {l.daysToEat === 0 ? <span className="block text-xs text-muted">not ready inside {KIT_DAYS} days</span> : null}
                    </td>
                    {kits.map((k) => {
                      const x = k.supplies.garden.lines[i];
                      return (
                        <td key={k.home.id} className="py-2 pr-3 tabular-nums">
                          {rng(x.amount[0], x.amount[1])} {x.crop.unit === "ft" ? "ft" : x.crop.unit}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl mt-4">
            <p>
              Planting dates depend on your last spring frost, which varies within a state, so we do not guess it. Look up your area on NOAA&apos;s{" "}
              <a href={SV.noaaFreeze.url} className="underline" rel="noopener">last spring freeze map</a> or ask your county extension office, which
              also knows the varieties that do well where you live. A garden needs water too: plan it on top of the drinking water.
            </p>
          </div>
        </Section>

        <Section title="Greenhouse, cold frame or low tunnel" id="greenhouse">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              <strong>Low tunnel or row cover.</strong> Hoops with plastic or fabric over a bed. NC State Extension puts the frost protection at
              4 to 5°F. Iowa State Extension says hardy greens can be carried into January under low tunnels, and spinach and cilantro reliably
              through the whole winter, but crops must be full-sized by early November, cannot be harvested while frozen, and the tunnels must be
              vented on sunny days above 40°F.
            </p>
            <p>
              <strong>Cold frame.</strong> A bottomless box with a clear lid. NC State: cold frames rely on the sun as their only heat, and depending
              on the winter they can keep greens, herbs and root crops coming. Vent them on clear days so they do not cook the plants.
            </p>
            <p>
              <strong>Small greenhouse.</strong> Unheated, it behaves like a bigger cold frame. To grow warm-season crops like tomatoes in a
              cold-state winter it needs heat sized to the plants (NC State), which means fuel or power this kit does not carry. In cold states,
              think of winter covers as a way to hold and slowly pick hardy greens planted in late summer, not as a way to start food in December.
            </p>
            <p>We have not priced these; build or buy what suits your space.</p>
          </div>
        </Section>

        <Section title="Medical, hygiene, light and radio" id="rest">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              From Ready.gov&apos;s kit list and CDC. For prescriptions, CDC&apos;s advice is to talk to your doctor or pharmacist about how to
              build an emergency supply and to keep a written list of each medicine, dose and allergy. We give no medical advice beyond that.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {[...MEDICAL_HYGIENE, ...LIGHT_COMMS].map((i) => (
                <li key={i.id}>{i.text}</li>
              ))}
            </ul>
            <p>
              <strong>A ready-made first aid kit.</strong> For a household, the{" "}
              <PartnerLink brand="survivex" productUrl={FIRST_AID_KITS.household.url}>{FIRST_AID_KITS.household.name}</PartnerLink>{" "}
              has {FIRST_AID_KITS.household.supplies} supplies, including wound-closure strips, for {money(FIRST_AID_KITS.household.priceUsd)} on
              SurviveX&apos;s site ({formatDate(FIRST_AID_KITS.checked)}; list {money(FIRST_AID_KITS.household.listUsd)}). For 1-2 people, their{" "}
              <PartnerLink brand="survivex" productUrl={FIRST_AID_KITS.small.url}>{FIRST_AID_KITS.small.name}</PartnerLink>{" "}
              has {FIRST_AID_KITS.small.supplies} supplies for {money(FIRST_AID_KITS.small.priceUsd)}. A kit only helps if someone knows how to
              use it: a first aid class from the Red Cross or a local hospital is worth more than any extra item, and add each person&apos;s own
              medicines and anything their doctor recommends.
            </p>
            <p>
              Alerts come over <Link href="/noaa-weather-radio" className="underline">NOAA Weather Radio</Link>; find your station and county code
              there. The {KIT_DAYS}-day package&apos;s power station runs LED lights and charges phones and batteries. The 72-hour and 2-week basics
              are on the <Link href="/emergency-kit-checklist" className="underline">emergency kit checklist</Link>.
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
          licensed electrician. Food, medicine and sanitation notes follow USDA, CDC, EPA and Ready.gov guidance and are not medical advice.
        </Disclaimer>
        <Sources
          items={[
            ...sourcesFor(["pvwatts", "doeFormula", "recsFridge", "recsAppliances", "eweb", "doeLed", "router", "phone", "resmed", "franklinAim", "readyGenerators", "cdcCo", "nfpa"]),
            { name: `Honda ${EXAMPLE_GENERATOR.name} specifications`, url: EXAMPLE_GENERATOR.url, detail: `${EXAMPLE_GENERATOR.ratedW.toLocaleString("en-US")} W rated, ${EXAMPLE_GENERATOR.tankGal} gal tank, ${EXAMPLE_GENERATOR.runtimeHours} hours a tank at rated load; read ${formatDate(EXAMPLE_GENERATOR.read)}` },
            { ...P.cdcWaterStorage },
            { ...P.femaFoodWater },
            { ...P.dga2020 },
            ...STAPLES.map((st) => ({ name: `USDA FoodData Central, ${st.fdcName} (FDC ${st.fdcId})`, url: fdcUrl(st.fdcId), detail: `${st.kcalPer100g} kcal per 100 g; read ${formatDate(SURVIVAL_READ)}` })),
            { ...SV.coleman, detail: `${SV.coleman.detail}; read ${formatDate(SURVIVAL_READ)}` },
            { ...SV.cdcCoBasics },
            { ...P.epaDisinfection },
            { ...SV.cdcRain },
            { ...P.readyKit },
            { ...SV.cdcRx },
            { ...SV.tamu },
            { ...SV.isuTunnels },
            { ...SV.ncsuExtenders },
            { ...SV.noaaFreeze },
            ...shown.map((p) => ({ name: `${AFFILIATES[p.brand].name} ${p.model} product page`, url: p.sourceUrl, detail: `checked ${formatDate(p.retrieved)}` })),
            ...SOLAR_PANELS.map((s) => ({ name: `${AFFILIATES[s.brand].name} ${s.model} product page`, url: s.sourceUrl, detail: `checked ${formatDate(s.retrieved)}` })),
            ...systems.flatMap((s) => [
              { name: `${AFFILIATES[s.brand].name} ${s.model} product page`, url: s.sourceUrl, detail: `${s.variant}; checked ${formatDate(s.retrieved)}` },
              { name: `${AFFILIATES[s.brand].name} ${s.inverter.model} product page`, url: s.inverter.url, detail: `inverter specifications; checked ${formatDate(s.retrieved)}` },
              { name: `${AFFILIATES[s.brand].name} ${s.addOn.model} product page`, url: s.addOn.url, detail: `checked ${formatDate(s.retrieved)}` },
            ]),
          ]}
        />
        <RelatedLinks links={[{ href: "/off-grid", label: "Off grid and emergency prep", desc: "Every off-grid and prep tool" }, ...relatedFor(PATH)]} />
        <PhotoCredit name="outage" />
      </div>
    </div>
  );
}
