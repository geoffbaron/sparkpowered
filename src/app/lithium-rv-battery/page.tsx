import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { BeforeAfter, BigStat, HubHero, OurPick, PhotoCredit } from "@/components/ui";
import RvBatteryPicker from "@/components/RvBatteryPicker";
import { BATTERIES, BATTERY_FACTS, LEAD_ACID_REF, LITIME_RV, OTHER_LITHIUM, type DeepCycleBattery } from "@/data/batteries";
import { SOURCES, STATES, formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import { leadAcidUsableWh, lifetimeCost, lifetimeKwh } from "@/lib/rv-battery";
import { HowToVideo, SOLAR_TO_BATTERY_VIDEO } from "@/components/HowToVideo";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { productList, reviewedProduct } from "@/lib/structured-data";
import { RedodoDeal } from "@/components/RedodoDeal";

const PATH = "/lithium-rv-battery";
const TITLE = "Lithium RV Battery: What Switching From Lead-Acid Saves (2026)";
const DESCRIPTION =
  "Swap your RV, van or boat battery for lithium: what it saves in dollars per year versus AGM, what size you need for your fridge, lights and CPAP, and Redodo LiFePO4 picks with today's prices.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const byId = (id: string) => {
  const b = BATTERIES.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown battery ${id}`);
  return b;
};

const fullName = (b: DeepCycleBattery) => `Redodo ${b.model}`;

function SpecsTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
      <table className="w-full text-sm min-w-[52rem]">
        <caption className="sr-only">Redodo lithium battery specifications</caption>
        <thead className="bg-surface-light text-left">
          <tr>
            <th scope="col" className="p-3 font-semibold">Battery</th>
            <th scope="col" className="p-3 font-semibold text-right">Price*</th>
            <th scope="col" className="p-3 font-semibold text-right">Energy</th>
            <th scope="col" className="p-3 font-semibold text-right">Continuous</th>
            <th scope="col" className="p-3 font-semibold text-right">Weight</th>
            <th scope="col" className="p-3 font-semibold text-right">Rated cycles</th>
            <th scope="col" className="p-3 font-semibold">Cold weather</th>
            <th scope="col" className="p-3 font-semibold">App</th>
            <th scope="col" className="p-3 font-semibold text-right">Warranty</th>
          </tr>
        </thead>
        <tbody>
          {BATTERIES.map((b) => (
            <tr key={b.id} className="border-t border-black/6 align-top">
              <th scope="row" className="p-3 font-medium">
                <PartnerLink brand={b.brand} productId={b.id} productUrl={b.url}>{fullName(b)}</PartnerLink>
              </th>
              <td className="p-3 text-right tabular-nums">
                {money(b.priceUsd)}
                {b.listPriceUsd && b.listPriceUsd > b.priceUsd && (
                  <span className="block text-xs text-muted line-through">{money(b.listPriceUsd)}</span>
                )}
              </td>
              <td className="p-3 text-right tabular-nums">{b.energyWh.toLocaleString("en-US")} Wh ({b.nominalV} V, {b.ampHours} Ah)</td>
              <td className="p-3 text-right tabular-nums">{b.continuousA} A</td>
              <td className="p-3 text-right tabular-nums">{b.weightLb} lb</td>
              <td className="p-3 text-right tabular-nums">{b.cycles.toLocaleString("en-US")}</td>
              <td className="p-3">{b.selfHeating ? "Self-heating" : b.lowTempCutoff ? "Low-temp cutoff" : "Not stated"}</td>
              <td className="p-3">{b.bluetooth ? "Bluetooth" : "No"}</td>
              <td className="p-3 text-right tabular-nums">{b.warrantyYears ? `${b.warrantyYears} yr` : "Not stated"}</td>
            </tr>
          ))}
          <tr className="border-t border-black/6 align-top bg-stone-50">
            <th scope="row" className="p-3 font-medium">
              For comparison: {LEAD_ACID_REF.name}
            </th>
            <td className="p-3 text-right tabular-nums">{money(LEAD_ACID_REF.priceUsd)}</td>
            <td className="p-3 text-right tabular-nums">{leadAcidUsableWh()} Wh usable (12 V, 100 Ah at 50%)</td>
            <td className="p-3 text-right">Not stated</td>
            <td className="p-3 text-right tabular-nums">{LEAD_ACID_REF.weightLb} lb</td>
            <td className="p-3 text-right tabular-nums">{LEAD_ACID_REF.cycles} (at 50%)</td>
            <td className="p-3">—</td>
            <td className="p-3">No</td>
            <td className="p-3 text-right">{LEAD_ACID_REF.warrantyNote}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function LithiumRvBatteryPage() {
  const li = byId("redodo-12v-100ah");
  const heated = byId("redodo-12v-100ah-self-heating");
  const big = byId("redodo-12v-300ah");
  const plus = byId("redodo-12v-200ah-plus");
  const litimeStd = OTHER_LITHIUM.find((o) => o.id === "litime-12v-100ah")!;
  const troll = byId("redodo-24v-50ah-trolling");
  const home48 = byId("redodo-48v-100ah");
  const bt = byId("redodo-12v-100ah-group31-bluetooth");

  const laUsable = leadAcidUsableWh();
  const weekend = lifetimeCost(100);
  const rows = [50, 100, 200, 365].map(lifetimeCost);
  const life = lifetimeKwh();
  const agmPairLb = Math.round(weekend.leadAcid.units * LEAD_ACID_REF.weightLb);

  const sorted = STATES.map((s) => s.solar.kwhPerKwYear).sort((a, b) => a - b);
  const medianKwhPerKwYear = sorted[Math.floor(sorted.length / 2)];
  const solarWhPerKwDay = Math.round((medianKwhPerKwYear * 1000) / 365);

  const faqs = [
    {
      q: "Is a lithium RV battery worth the money?",
      a: `Usually, yes. A ${li.short} lithium battery cost ${money(li.priceUsd)} on Redodo's site on ${formatDate(li.retrieved)} and gives ${li.energyWh.toLocaleString("en-US")} Wh you can use. To get that from AGM lead-acid you need two 100 Ah batteries (${money(weekend.leadAcid.usd)}, ${agmPairLb} lb) because AGM should only be run down halfway. Counting cycles alone, for 100 nights a year the lithium works out to about ${money(Math.round(weekend.lithium.perYear))} a year versus ${money(Math.round(weekend.leadAcid.perYear))} for AGM, and it weighs ${li.weightLb} lb.`,
    },
    {
      q: "What size lithium battery do I need for my RV?",
      a: `Add up what you run in a day. A 12 V compressor fridge, LED lights, phones and a water pump come to roughly 600 Wh a day, so one 12V 100Ah lithium battery (${li.energyWh.toLocaleString("en-US")} Wh) covers about two days. Add a CPAP, laptop or furnace fan and a 200 Ah or 300 Ah battery makes more sense. Use the picker on this page for your own answer.`,
    },
    {
      q: "Can I charge a lithium battery in freezing weather?",
      a: `Not without help. Battery University says lithium-ion cannot be charged below 32°F (0°C) without damaging it, though it can discharge in much colder weather. Batteries with a low-temperature cutoff simply refuse to charge until they warm up. Self-heating batteries, such as Redodo's 12V 100Ah Self-Heating (${money(heated.priceUsd)} when we checked), warm themselves first so they can charge on cold mornings.`,
    },
    {
      q: "Do I need a new charger or converter for a lithium battery?",
      a: "Often not a new one, but it needs the right setting. Redodo lists a charge voltage of 14.4 V (plus or minus 0.2 V) for its 12 V batteries. Many recent RV converters, solar charge controllers and chargers have a lithium or LiFePO4 mode; an older lead-acid-only charger may undercharge it, and any equalize or desulfation mode must be off. Check your converter's manual before you swap.",
    },
    {
      q: "Are lithium RV batteries a fire risk?",
      a: "The kind sold for RVs and boats, lithium iron phosphate (LiFePO4 or LFP), is the most heat-stable lithium chemistry: Battery University calls LFP one of the safest lithium-ion types, with good thermal stability and tolerance if abused. No battery is risk-free, so use the right cable size, a fuse close to the battery, and a battery with a built-in management system (all the Redodo models here have one).",
    },
    {
      q: "Can a lithium battery start my engine?",
      a: "Not these. Redodo says its deep-cycle batteries in this guide are not for engine starting. They replace the house or trolling-motor battery, not the starter battery.",
    },
  ];

  return (
    <article>
      <JsonLd
        data={productList(
          PATH,
          "Lithium RV, van and boat batteries",
          BATTERIES.map((b) =>
            reviewedProduct({
              name: fullName(b),
              brand: "Redodo",
              model: b.model,
              url: b.url,
              pagePath: PATH,
              description: `${b.volts}V ${b.ampHours}Ah LiFePO4 deep-cycle battery from Redodo, rated at ${b.energyWh.toLocaleString("en-US")} Wh and ${b.cycles.toLocaleString("en-US")} cycles.`,
              priceUsd: b.priceUsd,
              extra: {
                category: "Deep-cycle LiFePO4 battery",
                additionalProperty: [
                  { "@type": "PropertyValue", name: "Energy", value: b.energyWh, unitCode: "WHR" },
                  { "@type": "PropertyValue", name: "Nominal voltage", value: b.nominalV, unitCode: "VLT" },
                  { "@type": "PropertyValue", name: "Weight", value: b.weightLb, unitCode: "LBR" },
                  { "@type": "PropertyValue", name: "Rated cycles", value: b.cycles },
                ],
              },
            }),
          ),
        )}
      />
      <HubHero
        image="power-station"
        crumbs={[{ name: "Lithium RV battery", path: PATH }]}
        eyebrow="RV, van and boat batteries"
        title={<>Swap the lead-acid. <span className="text-amber-300">Keep the fridge cold all weekend.</span></>}
        sub={
          <>
            A {money(li.priceUsd)} lithium battery runs your RV fridge, lights and phones for about two days, weighs a third
            of what a lead-acid battery does, and lasts about 10 years of trips. Here is what it saves, what size you need,
            and which one to buy.
          </>
        }
      >
        <a href="#size" className="btn btn-primary">Find my size</a>
        <a href="#picks" className="btn btn-light">See our picks</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <section aria-labelledby="saves-heading">
          <h2 id="saves-heading" className="text-2xl font-extrabold text-ink mb-4">What switching saves</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <BigStat
              tone="leaf"
              value={`${money(Math.round(weekend.leadAcid.perYear - weekend.lithium.perYear))}/yr`}
              label="less than AGM at 100 nights a year"
              note={`${money(Math.round(weekend.lithium.perYear))} vs ${money(Math.round(weekend.leadAcid.perYear))} a year for about the same usable power`}
            />
            <BigStat
              tone="orange"
              value={`${Math.round(agmPairLb - li.weightLb)} lb`}
              label="lighter for about the same power"
              note={`${li.weightLb} lb vs ${agmPairLb} lb for two AGM batteries`}
            />
            <BigStat value="2x" label="the power you can actually use" note={`${li.energyWh.toLocaleString("en-US")} Wh vs ${laUsable} Wh from a 100 Ah AGM run to half`} />
            <BigStat value={`${Math.round(life.lithium / life.leadAcid)}x`} label="more energy over its life" note={`${li.cycles.toLocaleString("en-US")} full cycles vs ${LEAD_ACID_REF.cycles} half cycles`} />
          </div>
          <div className="mt-6 max-w-xl">
            <BeforeAfter
              before={weekend.leadAcid.perYear}
              after={weekend.lithium.perYear}
              beforeLabel={`Two AGM batteries (${money(weekend.leadAcid.usd)})`}
              afterLabel={`Redodo ${li.short} lithium (${money(li.priceUsd)})`}
              unit="/yr"
            />
          </div>
          <p className="text-xs text-muted mt-3 max-w-3xl">
            Prices on {formatDate(li.retrieved)}: Redodo&apos;s US site and Renogy&apos;s US site. Assumes one full use per
            night away, 100 nights a year. Lithium life is capped at Redodo&apos;s stated 10 years. AGM life counts cycles
            only, which flatters it, since lead-acid also ages on the shelf.
          </p>
        </section>

        <section id="size" className="mt-12 scroll-mt-24" aria-labelledby="size-heading">
          <h2 id="size-heading" className="text-2xl font-extrabold text-ink mb-2">What size do you need?</h2>
          <p className="text-stone-700 mb-4 max-w-3xl">
            Tick what you run and how long you stay off hookups. We pick the smallest Redodo 12 V battery that covers it.
          </p>
          <RvBatteryPicker solarWhPerKwDay={solarWhPerKwDay} />
        </section>

        <section id="picks" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="picks-heading">
          <h2 id="picks-heading" className="text-2xl font-extrabold text-ink">Our Redodo picks</h2>
          <RedodoDeal />
          <OurPick
            label="Best value for most RVs and vans"
            name={fullName(li)}
            why="Drops into a Group 31 battery space and doubles the power you can use. Enough for a weekend of fridge, lights and phones."
            life={["Fridge, lights, phones: about 2 days", `${li.weightLb} lb, one-hand lift`]}
            priceUsd={li.priceUsd}
            brand="redodo"
            productId={li.id}
            productUrl={li.url}
            category="battery"
          />
          <OurPick
            label="Best for cold-weather camping"
            name={fullName(heated)}
            icon="heat"
            why="Warms itself before charging below freezing, so solar or your alternator can still top it up on a frosty morning."
            life={["Charges below 32°F", "Same 1,280 Wh as the standard 100 Ah"]}
            priceUsd={heated.priceUsd}
            brand="redodo"
            productId={heated.id}
            productUrl={heated.url}
            category="battery"
          />
          <OurPick
            label="Best for boondocking and big loads"
            name={fullName(big)}
            icon="sun"
            why={`Three days of fridge, lights, CPAP and laptop in one box, and 2,560 W continuous for a coffee maker or microwave through an inverter. Want it lighter? The ${plus.short} (${money(plus.priceUsd)}) has the same power output and two-thirds the energy.`}
            life={["Fridge, lights, CPAP, laptop: about 3 days", `${big.weightLb} lb vs six AGMs`]}
            priceUsd={big.priceUsd}
            brand="redodo"
            productId={big.id}
            productUrl={big.url}
            category="battery"
          />
          <OurPick
            label="Best for a 24 V trolling motor"
            name={fullName(troll)}
            icon="water"
            why="One battery in place of two 12 V lead-acid batteries wired together, for motors up to 100 lb thrust. The app shows how much is left before you head back."
            life={[`${troll.weightLb} lb in total`, "Bluetooth charge gauge"]}
            priceUsd={troll.priceUsd}
            brand="redodo"
            productId={troll.id}
            productUrl={troll.url}
            category="battery"
          />
          <OurPick
            label="For off-grid cabins and home solar"
            name={fullName(home48)}
            icon="home"
            why="A 48 V building block for solar systems with a 48 V inverter. Four together store 20 kWh, with Bluetooth monitoring on each."
            life={["5,120 Wh per battery", "Up to 4 in parallel"]}
            priceUsd={home48.priceUsd}
            brand="redodo"
            productId={home48.id}
            productUrl={home48.url}
            category="battery"
          />
          <p className="text-xs text-muted">
            *Single-battery prices on Redodo&apos;s US site when we checked on {formatDate(li.retrieved)}; Redodo runs frequent
            sales. Want an app gauge on a 12 V battery? The {fullName(bt)} was {money(bt.priceUsd)}.
          </p>
          <p className="text-xs text-muted">
            Comparing brands? On {formatDate(LITIME_RV.retrieved)} LiTime&apos;s{" "}
            <PartnerLink brand="litime" productId={LITIME_RV.id} productUrl={LITIME_RV.url}>{LITIME_RV.name}</PartnerLink> was{" "}
            {money(LITIME_RV.priceUsd)} ({LITIME_RV.energyWh.toLocaleString("en-US")} Wh, {LITIME_RV.continuousA} A continuous,{" "}
            {LITIME_RV.weightLb} lb, per LiTime), and its{" "}
            <PartnerLink brand="litime" productId={litimeStd.id} productUrl={litimeStd.url}>12V 100Ah</PartnerLink> was{" "}
            {money(litimeStd.priceUsd)}. LiTime links are sponsored too.
          </p>
        </section>

        <Section title="Lithium vs lead-acid, year by year" id="cost">
          <p className="text-stone-700 leading-relaxed max-w-3xl mb-4">
            Cost per year for about the same usable power: one Redodo {li.short} ({li.energyWh.toLocaleString("en-US")} Wh) versus
            two {LEAD_ACID_REF.name} batteries run to half, the most Renogy advises.
          </p>
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[36rem]">
              <caption className="sr-only">Lithium versus AGM cost per year</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Nights away a year</th>
                  <th scope="col" className="p-3 font-semibold text-right">AGM lasts</th>
                  <th scope="col" className="p-3 font-semibold text-right">AGM per year</th>
                  <th scope="col" className="p-3 font-semibold text-right">Lithium lasts</th>
                  <th scope="col" className="p-3 font-semibold text-right">Lithium per year</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.nightsPerYear} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{r.nightsPerYear === 365 ? "365 (full-time)" : r.nightsPerYear}</th>
                    <td className="p-3 text-right tabular-nums">{r.leadAcid.years >= 10 ? "10+ yr" : `${r.leadAcid.years.toFixed(1)} yr`}</td>
                    <td className="p-3 text-right tabular-nums">{money(Math.round(r.leadAcid.perYear))}</td>
                    <td className="p-3 text-right tabular-nums">{r.lithium.years.toFixed(0)} yr</td>
                    <td className="p-3 text-right tabular-nums font-semibold text-leaf">{money(Math.round(r.lithium.perYear))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            One full use per night. AGM: {money(LEAD_ACID_REF.priceUsd)} each, {LEAD_ACID_REF.cycles} cycles at 50% depth of
            discharge, {LEAD_ACID_REF.weightLb} lb, {LEAD_ACID_REF.warrantyNote} warranty (Renogy). Lithium: {li.cycles.toLocaleString("en-US")} cycles
            at 100%, {li.lifeYears}-year life and {li.warrantyYears}-year warranty (Redodo). Both are the makers&apos; own ratings.
          </p>
        </Section>

        <Section title="Pair it with solar" id="solar">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              A battery sets how long you can stay; solar sets whether you have to leave. In the median US state, PVWatts
              puts the output of 1 kW of fixed panels at about {(solarWhPerKwDay / 1000).toFixed(1)} kWh a day across the
              year, so a 200 W roof panel puts back about {Math.round(solarWhPerKwDay * 0.2).toLocaleString("en-US")} Wh a
              day and 400 W about {Math.round(solarWhPerKwDay * 0.4).toLocaleString("en-US")} Wh, roughly a day of fridge,
              lights and phones. Flat RV roofs, shade and winter make less.
            </p>
            <p>
              Lithium suits solar better than lead-acid: it takes a charge faster, doesn&apos;t mind sitting part-charged, and
              you can use nearly all of it. Use a solar charge controller with a lithium setting.
            </p>
            <p>
              Wiring it yourself? Panels charge the battery through the controller, never straight. Connect the battery side
              first and the panels last, with a fuse on each positive cable:
            </p>
            <HowToVideo video={SOLAR_TO_BATTERY_VIDEO} />
            <p>
              At home, the same idea scales up: see{" "}
              <Link href="/plug-in-solar" className="text-spark-orange underline underline-offset-2">plug-in solar</Link>{" "}
              for panels that plug into an outlet, and{" "}
              <Link href="/home-battery-backup" className="text-spark-orange underline underline-offset-2">home battery backup</Link>{" "}
              for outage power. Prefer one box with outlets built in and nothing to wire? A{" "}
              <Link href="/best-portable-power-stations" className="text-spark-orange underline underline-offset-2">portable power station</Link>{" "}
              does the job without an inverter or charger.
            </p>
            <p>
              Doing the whole conversion yourself? Our sister site CamperVolts has a free{" "}
              <a href="https://campervolts.com/planner" className="text-spark-orange underline underline-offset-2">van and RV electrical planner</a>{" "}
              that sizes the battery, solar, inverter and wire, and a{" "}
              <a href="https://campervolts.com/lithium-conversion" className="text-spark-orange underline underline-offset-2">lithium conversion guide</a>{" "}
              covering the charger settings and what the swap really costs.
            </p>
          </div>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;Lithium doesn&apos;t work in the cold.&quot;</strong> Half true. It runs fine in the cold, but no
              lithium battery should be charged below 32°F (
              <a href={BATTERY_FACTS.coldCharging.url} className="underline" rel="noopener">Battery University</a>). A
              low-temperature cutoff protects it by pausing charging; a self-heating battery like the{" "}
              <PartnerLink brand="redodo" productId={heated.id} productUrl={heated.url}>Redodo 12V 100Ah Self-Heating</PartnerLink>{" "}
              warms itself and then charges.
            </Callout>
            <Callout>
              <strong>&quot;You need an expensive special charger.&quot;</strong> Usually not. You need a charger, converter or
              solar controller with a lithium (LiFePO4) setting; Redodo specifies 14.4 V. Many recent RV converters and
              controllers already have one. Turn off any equalize or desulfation mode.
            </Callout>
            <Callout>
              <strong>&quot;Lithium batteries catch fire.&quot;</strong> RV and marine lithium batteries use lithium iron
              phosphate (LFP), which Battery University calls one of the safest lithium-ion types, with good thermal
              stability (
              <a href={BATTERY_FACTS.lfpSafety.url} className="underline" rel="noopener">source</a>). Install it with the right
              cable and a fuse, like any battery.
            </Callout>
            <Callout>
              <strong>&quot;It costs too much.&quot;</strong> Up front, a little: {money(li.priceUsd)} against{" "}
              {money(LEAD_ACID_REF.priceUsd)} for one AGM. But one lithium does the work of two AGMs and lasts several times as
              many cycles, so it costs less per year of use (table above).
            </Callout>
          </div>
        </Section>

        <Section title="Specs" id="specs">
          <SpecsTable />
          <p className="text-xs text-muted mt-2 max-w-3xl">
            *Price and specs from each product page on Redodo&apos;s US site, checked {formatDate(li.retrieved)}. Cycle ratings
            are the makers&apos; own figures at their stated depth of discharge.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Prices and specifications are copied from the makers&apos; US websites on the dates shown and change often. Daily
          use figures are typical values; your appliances may use more or less. Have a qualified technician check your
          converter, alternator charging and wiring when you change battery type.
        </Disclaimer>
        <Sources
          items={[
            ...BATTERIES.map((b) => ({ name: `${fullName(b)} product page`, url: b.sourceUrl, detail: `checked ${formatDate(b.retrieved)}` })),
            { name: `${LITIME_RV.name} product page`, url: LITIME_RV.url, detail: `checked ${formatDate(LITIME_RV.retrieved)}` },
            { name: `${litimeStd.name} product page`, url: litimeStd.url, detail: `checked ${formatDate(litimeStd.retrieved)}` },
            { name: `${LEAD_ACID_REF.name} product page`, url: LEAD_ACID_REF.url, detail: `checked ${formatDate(LEAD_ACID_REF.retrieved)}` },
            { name: BATTERY_FACTS.coldCharging.name, url: BATTERY_FACTS.coldCharging.url, detail: "No charging below 32°F (0°C)" },
            { name: BATTERY_FACTS.lfpSafety.name, url: BATTERY_FACTS.lfpSafety.url, detail: "LFP thermal stability and cycle life" },
            { name: BATTERY_FACTS.fridge.name, url: BATTERY_FACTS.fridge.url, detail: BATTERY_FACTS.fridge.detail },
            { name: SOURCES.solar.name, url: SOURCES.solar.url, detail: SOURCES.solar.period },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "All-in-one boxes with outlets, for camping and outages" },
            { href: "/battery-calculator", label: "Home battery sizer", desc: "How much storage a house needs" },
            { href: "/plug-in-solar", label: "Plug-in solar", desc: "Small solar that plugs into an outlet" },
            { href: "/home-battery-backup", label: "Home battery backup", desc: "Whole-home and plug-in systems with real costs" },
            { href: "/best-trolling-motor-battery", label: "Best trolling motor battery", desc: "12 V, 24 V and 36 V lithium for your boat" },
            { href: "/lithium-vs-agm-battery", label: "100Ah lithium vs AGM", desc: "Cost per year, worked out for how you use it" },
          ]}
        />
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
