import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import LithiumAgmCalc from "@/components/LithiumAgmCalc";
import { BigStat, HubHero, PhotoCredit } from "@/components/ui";
import { BATTERIES, BATTERY_FACTS, LEAD_ACID_REF, OTHER_LITHIUM } from "@/data/batteries";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import { leadAcidUsableWh, lifetimeCost, lifetimeKwh } from "@/lib/rv-battery";
import { pageMetadata } from "@/lib/seo";

const PATH = "/lithium-vs-agm-battery";
const TITLE = "100Ah Lithium vs AGM: Which Costs Less per Year? (2026 Prices)";
const DESCRIPTION =
  "A 100Ah lithium battery gives as much usable power as 200Ah of AGM, at a third of the weight. What each costs per year of use, with today's prices and a calculator for how often you camp, fish or boondock.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function LithiumVsAgmPage() {
  const li = BATTERIES.find((b) => b.id === "redodo-12v-100ah")!;
  const la = LEAD_ACID_REF;
  const laUsable = leadAcidUsableWh();
  const life = lifetimeKwh();
  const at100 = lifetimeCost(100);
  const [litime, battleBorn] = OTHER_LITHIUM;

  const rows: [string, string, string][] = [
    ["Price when we checked", money(li.priceUsd), money(la.priceUsd)],
    ["Power you can use", `${li.energyWh.toLocaleString("en-US")} Wh (all of it)`, `${laUsable} Wh (run to 50%)`],
    ["Weight", `${li.weightLb} lb`, `${la.weightLb} lb`],
    ["Rated cycles", `${li.cycles.toLocaleString("en-US")} at 100% depth`, `${la.cycles} at 50% depth`],
    ["Energy over its life", `${Math.round(life.lithium).toLocaleString("en-US")} kWh`, `${Math.round(life.leadAcid).toLocaleString("en-US")} kWh`],
    ["Cost per kWh delivered over its life", `${((li.priceUsd / life.lithium) * 100).toFixed(0)}¢`, `${((la.priceUsd / life.leadAcid) * 100).toFixed(0)}¢`],
    ["Warranty", `${li.warrantyYears} years`, la.warrantyNote],
    ["Charging below freezing", "Not without a self-heating model", "Yes, slowly"],
    ["Engine starting", "No (deep-cycle only)", "Some AGMs are dual-purpose"],
  ];

  const faqs = [
    {
      q: "Is a 100Ah lithium battery the same as a 200Ah AGM?",
      a: `In usable power, roughly yes. You can use nearly all of a lithium battery's ${li.energyWh.toLocaleString("en-US")} Wh, but Renogy advises not running its AGM below 50%, so a 100Ah AGM gives about ${laUsable} Wh. Two 100Ah AGMs (${laUsable * 2} Wh usable, ${Math.round(la.weightLb * 2)} lb) match one 100Ah lithium (${li.weightLb} lb).`,
    },
    {
      q: "Is lithium worth the extra cost over AGM?",
      a: `If you use the battery regularly, yes. One Redodo 12V 100Ah cost ${money(li.priceUsd)} and two Renogy 100Ah AGMs ${money(la.priceUsd * 2)} when we checked. At 100 uses a year the lithium works out to about ${money(Math.round(at100.lithium.perYear))} a year and the AGMs ${money(Math.round(at100.leadAcid.perYear))}, because the lithium is rated for 4,000 full cycles against 500 half cycles. If half of one AGM's capacity is all you ever need, a single AGM is about ${money(Math.round(li.priceUsd - la.priceUsd))} cheaper up front.`,
    },
    {
      q: "Can I replace my AGM battery with lithium?",
      a: "Usually, for house, trolling and solar batteries. Check that your charger, converter or solar controller has a lithium (LiFePO4) setting, and turn off any equalize or desulfation mode. Don't use these deep-cycle lithium batteries to start an engine.",
    },
    {
      q: "Why are some lithium batteries so much more expensive?",
      a: `Brand, warranty and where they are built. Battle Born's 100Ah (${money(battleBorn.priceUsd)}) is assembled in the USA with a 10-year warranty; LiTime's (${money(litime.priceUsd)}) and Redodo's (${money(li.priceUsd)}) carry 5-year warranties and the same 4,000-cycle rating where stated. Energy per battery is the same 1,280 Wh.`,
    },
    {
      q: "Does lithium work in cold weather?",
      a: "It discharges in the cold but must not be charged below 32°F, per Battery University. Buy a self-heating model if you charge on frosty mornings; AGM tolerates cold charging but loses capacity in the cold too.",
    },
  ];

  return (
    <article>
      <HubHero
        image="power-station"
        crumbs={[
          { name: "Lithium RV battery", path: "/lithium-rv-battery" },
          { name: "Lithium vs AGM", path: PATH },
        ]}
        eyebrow="Lithium vs AGM"
        title={<>One lithium battery. <span className="text-amber-300">The work of two AGMs, for less per year.</span></>}
        sub={
          <>
            A {money(li.priceUsd)} 100Ah lithium gives the usable power of two {money(la.priceUsd)} AGM batteries, weighs{" "}
            {Math.round(la.weightLb * 2 - li.weightLb)} lb less than the pair, and lasts years longer. Here is the math for how you use it.
          </>
        }
      >
        <a href="#calc" className="btn btn-primary">Work out my cost</a>
        <a href="#table" className="btn btn-light">Side by side</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Use the battery more than a few weekends a year? Lithium.</strong> A{" "}
            <PartnerLink brand="redodo" productId={li.id} productUrl={li.url}>Redodo 12V 100Ah</PartnerLink> ({money(li.priceUsd)} when we
            checked) costs about {money(Math.round(at100.lithium.perYear))} a year at 100 uses, against{" "}
            {money(Math.round(at100.leadAcid.perYear))} for the two AGMs that match it, and weighs {li.weightLb} lb instead of{" "}
            {Math.round(la.weightLb * 2)}.
          </p>
          <p>
            <strong>Need only a little power, or charge below freezing without a heater?</strong> A single AGM is{" "}
            {money(li.priceUsd - la.priceUsd)} cheaper up front and charges in the cold, if half of its 100Ah is enough for you.
          </p>
        </QuickAnswer>

        <section aria-label="Key numbers" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat tone="leaf" value="2x" label="The power you can use" note={`${li.energyWh.toLocaleString("en-US")} Wh vs ${laUsable} Wh`} />
          <BigStat value={`${Math.round(life.lithium / life.leadAcid)}x`} label="More energy over its life" note={`${li.cycles.toLocaleString("en-US")} full vs ${la.cycles} half cycles`} />
          <BigStat tone="orange" value={`${Math.round(la.weightLb - li.weightLb)} lb`} label="Lighter, battery for battery" note={`${li.weightLb} lb vs ${la.weightLb} lb`} />
        </section>

        <section id="calc" className="mt-12 scroll-mt-24" aria-labelledby="calc-heading">
          <h2 id="calc-heading" className="text-2xl font-extrabold text-ink mb-2">What it costs you per year</h2>
          <p className="text-stone-700 mb-4 max-w-3xl">
            Move the slider to how many days a year you run the battery down (a night in the RV, a day on the water).
          </p>
          <LithiumAgmCalc productId={li.id} productUrl={li.url} />
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Compares one Redodo 12V 100Ah lithium with two Renogy 12V 100Ah AGMs (same usable power), one full use per day. Lithium
            life is capped at Redodo&apos;s stated 10 years; AGM life counts cycles only, which flatters it, because lead-acid also
            ages on the shelf.
          </p>
        </section>

        <Section title="100Ah lithium vs 100Ah AGM, side by side" id="table">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[36rem]">
              <caption className="sr-only">100Ah lithium versus 100Ah AGM</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold"></th>
                  <th scope="col" className="p-3 font-semibold">
                    <PartnerLink brand="redodo" productId={li.id} productUrl={li.url}>Redodo 12V 100Ah lithium</PartnerLink>
                  </th>
                  <th scope="col" className="p-3 font-semibold"><PlainLink href={la.url}>{la.name}</PlainLink></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([k, a, b]) => (
                  <tr key={k} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{k}</th>
                    <td className="p-3">{a}</td>
                    <td className="p-3">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Prices and specs from Redodo&apos;s and Renogy&apos;s US product pages, checked {formatDate(li.retrieved)}. Redodo links are
            sponsored; Renogy is a plain link. Other 100Ah lithium batteries:{" "}
            <PartnerLink brand="litime" productId={litime.id} productUrl={litime.url}>{litime.name}</PartnerLink> {money(litime.priceUsd)} (checked{" "}
            {formatDate(litime.retrieved)}, sponsored link),{" "}
            <PlainLink href={battleBorn.url}>{battleBorn.name}</PlainLink> {money(battleBorn.priceUsd)} (checked {formatDate(battleBorn.retrieved)}).
          </p>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;Amp-hours are amp-hours.&quot;</strong> Not between chemistries. You can use nearly all of a lithium
              battery&apos;s amp-hours, but only about half of an AGM&apos;s if you want it to last, so a 100Ah lithium does the job of a
              200Ah AGM bank.
            </Callout>
            <Callout>
              <strong>&quot;Lithium batteries catch fire.&quot;</strong> RV and marine lithium batteries use lithium iron phosphate, which
              Battery University calls one of the safest lithium-ion types (
              <a href={BATTERY_FACTS.lfpSafety.url} className="underline" rel="noopener">source</a>). Fuse it near the battery, like any
              battery.
            </Callout>
            <Callout>
              <strong>&quot;You need all new charging gear.&quot;</strong> Usually just the right setting. Many recent converters, solar
              controllers and chargers have a LiFePO4 mode; Redodo specifies 14.4 V for its 12 V batteries.
            </Callout>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Cycle ratings are the makers&apos; own figures and real life depends on heat, charging and depth of use. Prices change often.
          Have a qualified technician check your charging system when you change battery type.
        </Disclaimer>
        <Sources
          items={[
            { name: `Redodo ${li.model} product page`, url: li.sourceUrl, detail: `checked ${formatDate(li.retrieved)}` },
            { name: `${la.name} product page`, url: la.url, detail: `checked ${formatDate(la.retrieved)}` },
            ...OTHER_LITHIUM.map((o) => ({ name: `${o.name} product page`, url: o.url, detail: `checked ${formatDate(o.retrieved)}` })),
            { name: BATTERY_FACTS.coldCharging.name, url: BATTERY_FACTS.coldCharging.url, detail: "No charging below 32°F (0°C)" },
            { name: BATTERY_FACTS.lfpSafety.name, url: BATTERY_FACTS.lfpSafety.url, detail: "LFP thermal stability and cycle life" },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/lithium-rv-battery", label: "Lithium RV battery guide", desc: "What size you need, with a picker" },
            { href: "/best-trolling-motor-battery", label: "Best trolling motor battery", desc: "12 V, 24 V and 36 V picks" },
            { href: "/boating", label: "Electric boating and fishing", desc: "Trolling, kayak and outboard guides" },
            { href: "/best-portable-power-stations", label: "Portable power stations", desc: "Batteries with outlets built in" },
            { href: "/home-battery-backup", label: "Home battery backup", desc: "Whole-home and plug-in systems" },
          ]}
        />
        <p className="text-sm text-muted mt-6">
          Pairing it with solar? See panel output for your area on your <Link href="/states" className="underline">state page</Link>.
        </p>
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
