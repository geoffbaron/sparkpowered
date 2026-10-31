import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import { BigStat, HubHero, OurPick, PhotoCredit } from "@/components/ui";
import { BATTERIES, BATTERY_FACTS, LEAD_ACID_REF } from "@/data/batteries";
import { BLUETTI_BOAT, BOATING_CHECKED, BOAT_BATTERIES, PISCIFUN_GEAR } from "@/data/boating";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import { MINN_KOTA_MANUAL, NEWPORT_RUNTIME_GUIDE, hoursLabel, motorById, runtimeHours } from "@/lib/boating";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { batteryProduct, productList, reviewedProduct } from "@/lib/structured-data";
import { RedodoDeal } from "@/components/RedodoDeal";

const PATH = "/kayak-trolling-motor-battery";
const TITLE = "Best Kayak Trolling Motor Battery (2026): Light Lithium for All-Day Fishing";
const DESCRIPTION =
  "The best battery for a kayak trolling motor weighs 11 to 20 lb, not 64. What size you need for a 30, 45 or 55 lb motor, hours on the water for each, and today's prices.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

/** Dakota Lithium (no affiliate program with us): the small battery many kayakers carry for electronics only. */
const DAKOTA_10AH = {
  name: "Dakota Lithium 12V 10Ah Mini",
  priceUsd: 85,
  url: "https://dakotalithium.com/product/12v-10ah-mini-deep-cycle-lifepo4-battery/",
};

export default function KayakBatteryPage() {
  const k50 = BOAT_BATTERIES.find((b) => b.id === "redodo-12v-50ah-bluetooth-trolling")!;
  const mini = BOAT_BATTERIES.find((b) => b.id === "redodo-12v-100ah-ultra-mini")!;
  const b100 = BATTERIES.find((b) => b.id === "redodo-12v-100ah")!;
  const b1210 = BLUETTI_BOAT.b1210;
  const m30 = motorById("30-12");
  const m45 = motorById("45-12");
  const m55 = motorById("55-12");
  const hrs = (m: typeof m30, share: number, ah: number) => hoursLabel(runtimeHours(m, share, ah));
  const agmUsableAh = LEAD_ACID_REF.ampHours * LEAD_ACID_REF.depthOfDischarge;

  const sizes = [
    { motor: m30, ah: 50, b: k50 },
    { motor: m45, ah: 50, b: k50 },
    { motor: m45, ah: 100, b: mini },
    { motor: m55, ah: 100, b: mini },
  ];

  const faqs = [
    {
      q: "What size battery do I need for a kayak trolling motor?",
      a: `For most kayaks, a 12V 50Ah lithium: it runs a 30 lb motor ${hrs(m30, 0.5, 50)} at half speed and ${hrs(m30, 0.25, 50)} at a slow troll, and weighs about 11 lb. If you run a 45 to 55 lb motor or fish long days in wind, step up to a 12V 100Ah lithium (about 20 lb in a compact case).`,
    },
    {
      q: "How long will a trolling motor battery last on a kayak?",
      a: `A 45 lb motor on a 12V 50Ah lithium lasts ${hrs(m45, 0.5, 50)} at half speed and ${hrs(m45, 0.25, 50)} at a slow troll. On a 100Ah lithium, double it. Kayakers usually troll slowly and paddle part of the way, so a 50Ah lithium covers a typical morning or evening session.`,
    },
    {
      q: "What kind of battery is best for a kayak trolling motor?",
      a: `Lithium iron phosphate (LiFePO4). A 100Ah AGM weighs ${LEAD_ACID_REF.weightLb} lb and gives only about ${agmUsableAh} Ah you should use; a 12V 50Ah lithium gives the same ${agmUsableAh} Ah at ${k50.weightLb} lb. On a kayak, that weight is the difference between carrying it to the water in one trip or two, and riding level instead of nose-down.`,
    },
    {
      q: "Can I run my fish finder off the trolling motor battery?",
      a: "Yes, with an inline fuse on the fish finder lead. A fish finder draws about 1 A, which barely dents a 50Ah lithium. Some anglers prefer a separate small battery so motor noise doesn't show on the sonar screen.",
    },
    {
      q: "Where should the battery go in a kayak?",
      a: "Low and near the middle, usually in the tank well or a hatch behind the seat, in a battery box or dry bag, with a fuse close to the battery. Keep weight balanced side to side, and follow your kayak and motor makers' mounting instructions.",
    },
  ];

  return (
    <article>
      <JsonLd
        data={productList(PATH, "Kayak trolling motor batteries", [
          ...[k50, mini].map((b) => batteryProduct(b, PATH)),
          reviewedProduct({
            name: b1210.name,
            brand: "Bluetti",
            url: b1210.url,
            pagePath: PATH,
            description: b1210.note,
            priceUsd: b1210.priceUsd,
          }),
        ])}
      />
      <HubHero
        image="power-station"
        crumbs={[
          { name: "Boating", path: "/boating" },
          { name: "Kayak trolling motor battery", path: PATH },
        ]}
        eyebrow="Kayak trolling motor batteries"
        title={<>An 11 lb battery. <span className="text-amber-300">A whole morning on the water.</span></>}
        sub={
          <>
            A {money(k50.priceUsd)} lithium gives a kayak motor the same usable power as a {LEAD_ACID_REF.weightLb} lb lead-acid battery, at a
            sixth of the weight. Here is what size fits your motor and how long it lasts.
          </>
        }
      >
        <a href="#picks" className="btn btn-primary">See our picks</a>
        <a href="#sizes" className="btn btn-light">What size do I need?</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Most kayaks (30 to 45 lb motor):</strong>{" "}
            <PartnerLink brand="redodo" productId={k50.id} productUrl={k50.url}>Redodo 12V 50Ah Bluetooth</PartnerLink> ({money(k50.priceUsd)},{" "}
            {k50.weightLb} lb). About {hrs(m30, 0.5, 50).replace("about ", "")} at half speed on a 30 lb motor.
          </p>
          <p>
            <strong>Bigger motor or all-day trips:</strong>{" "}
            <PartnerLink brand="redodo" productId={mini.id} productUrl={mini.url}>Redodo 12V 100Ah Ultra-Mini</PartnerLink> ({money(mini.priceUsd)},{" "}
            {mini.weightLb} lb), twice the hours in a case small enough for a tank well.
          </p>
        </QuickAnswer>

        <RedodoDeal className="mt-4" product={{ name: "Redodo 12V 50Ah Bluetooth", url: k50.url }} />

        <section aria-label="What lithium changes" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat tone="leaf" value={`${Math.round(LEAD_ACID_REF.weightLb - (k50.weightLb ?? 0))} lb`} label="Lighter than a 100Ah AGM" note={`Same usable power: ${k50.weightLb} lb vs ${LEAD_ACID_REF.weightLb} lb`} />
          <BigStat value={hrs(m30, 0.25, 50).replace("about ", "")} label="30 lb motor, slow troll" note="On a 12V 50Ah lithium" />
          <BigStat tone="orange" value={money(k50.priceUsd)} label="For a full morning of fishing" note="Redodo 12V 50Ah, when we checked" />
        </section>

        <section id="picks" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="picks-heading">
          <h2 id="picks-heading" className="text-2xl font-extrabold text-ink">Our picks</h2>
          <OurPick
            label="Best for most kayaks"
            name={`Redodo ${k50.short}`}
            icon="water"
            why={`Light enough to carry in one hand, rated by Redodo for motors up to ${k50.maxThrustLb} lb thrust, and the phone app tells you how much is left before you turn for the launch.`}
            life={[`30 lb motor: ${hrs(m30, 0.5, 50)} at half speed`, `${k50.weightLb} lb`, "Charging pauses below 32°F", "Bluetooth charge gauge"]}
            priceUsd={k50.priceUsd}
            brand="redodo"
            productId={k50.id}
            productUrl={k50.url}
            category="battery"
          />
          <OurPick
            label="Best for 55 lb motors and long days"
            name={`Redodo ${mini.short}`}
            icon="bolt"
            why={`A full 100 Ah in a small Group 22NF case at ${mini.weightLb} lb, with IP65 water resistance and Bluetooth. That's ${hrs(m55, 0.5, 100)} at half speed on a 55 lb motor.`}
            life={[`55 lb motor: ${hrs(m55, 0.25, 100)} at a slow troll`, `${mini.weightLb} lb`, "5-year warranty"]}
            priceUsd={mini.priceUsd}
            brand="redodo"
            productId={mini.id}
            productUrl={mini.url}
            category="battery"
            moreHref="/trolling-motor-battery-life"
            moreLabel="Work out your hours"
          />
          <OurPick
            label="Best for cold-water and early-season trips"
            name="Bluetti B1210 12V 100Ah"
            icon="heat"
            why="A 12V 100Ah lithium with built-in self-heating and IP65, which Bluetti sells for trolling motors. It warms itself so you can charge on frosty mornings."
            life={["1,280 Wh", "Self-heating", "IP65"]}
            priceUsd={b1210.priceUsd}
            brand="bluetti"
            productUrl={b1210.url}
            category="battery"
          />
        </section>

        <Section title="What size do I need?" id="sizes">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[36rem]">
              <caption className="sr-only">Kayak battery size by motor</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Motor</th>
                  <th scope="col" className="p-3 font-semibold">Lithium battery</th>
                  <th scope="col" className="p-3 font-semibold">Slow troll</th>
                  <th scope="col" className="p-3 font-semibold">Half speed</th>
                  <th scope="col" className="p-3 font-semibold text-right">Weight</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map(({ motor, ah, b }) => (
                  <tr key={`${motor.id}-${ah}`} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{motor.thrustLb} lb ({motor.maxAmps} A max)</th>
                    <td className="p-3"><PartnerLink brand="redodo" productId={b.id} productUrl={b.url}>12V {ah}Ah</PartnerLink></td>
                    <td className="p-3">{hrs(motor, 0.25, ah)}</td>
                    <td className="p-3">{hrs(motor, 0.5, ah)}</td>
                    <td className="p-3 text-right tabular-nums">{b.weightLb} lb</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Max draw from Minn Kota&apos;s manual; hours are amp-hours divided by amps, with half speed at half the max draw (Newport&apos;s rule of
            thumb) and a slow troll at a quarter (our estimate). Calm water. Prices checked {formatDate(BOATING_CHECKED)}.
          </p>
          <p className="mt-4 max-w-3xl">
            Only running a fish finder, no motor? A small battery is enough: the{" "}
            <PlainLink href={DAKOTA_10AH.url}>{DAKOTA_10AH.name}</PlainLink> was {money(DAKOTA_10AH.priceUsd)}, or see our{" "}
            <Link href="/fish-finder-battery" className="underline">fish finder battery guide</Link>.
          </p>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;Lithium is too expensive for a kayak.&quot;</strong> Not at this size. A 12V 50Ah lithium was {money(k50.priceUsd)} when
              we checked; the 100Ah AGM that gives the same usable power was {money(LEAD_ACID_REF.priceUsd)}. You pay about{" "}
              {money(Math.round(k50.priceUsd - LEAD_ACID_REF.priceUsd))} more and carry {Math.round(LEAD_ACID_REF.weightLb - (k50.weightLb ?? 0))} lb less,
              with a battery rated for 4,000 full cycles against the AGM&apos;s {LEAD_ACID_REF.cycles} half cycles.
            </Callout>
            <Callout>
              <strong>&quot;A small battery means a short day.&quot;</strong> Kayak motors draw little at a slow troll. A 30 lb motor at a quarter of
              its 30 A maximum runs {hrs(m30, 0.25, 50)} on 50 Ah, and you can always paddle part of the way.
            </Callout>
            <Callout>
              <strong>&quot;Lithium isn&apos;t safe on the water.&quot;</strong> These are lithium iron phosphate (LiFePO4) batteries, the most
              stable lithium chemistry (
              <a href={BATTERY_FACTS.lfpSafety.url} className="underline" rel="noopener">Battery University</a>), with a battery management system
              that cuts off on short circuits and overcharging. Fuse the main lead, as with any battery.
            </Callout>
          </div>
        </Section>

        <Section title="Rounding out the kayak" id="gear">
          <p className="max-w-3xl">
            Saved some weight and money on the battery? The{" "}
            <PartnerLink brand="piscifun" productUrl={PISCIFUN_GEAR.spinningCombo.url}>{PISCIFUN_GEAR.spinningCombo.name}</PartnerLink> (
            {money(PISCIFUN_GEAR.spinningCombo.priceUsd)}) comes with a spare rod tip, handy when rods ride in a crate behind you.
          </p>
          <p className="text-xs text-muted mt-2">Piscifun price checked {formatDate(PISCIFUN_GEAR.spinningCombo.retrieved)}.</p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Runtimes are calm-water estimates. Prices and specs are copied from makers&apos; US websites on the dates shown and change often.
          Redodo, Bluetti and Piscifun links are sponsored; Dakota Lithium is a plain link.
        </Disclaimer>
        <Sources
          items={[
            ...[k50, mini].map((b) => ({ name: `${b.name} product page`, url: b.url, detail: `checked ${formatDate(b.retrieved)}` })),
            { name: "Bluetti LiFePO4 batteries (B1210)", url: b1210.url, detail: `checked ${formatDate(BLUETTI_BOAT.retrieved)}` },
            { name: `${DAKOTA_10AH.name} product page`, url: DAKOTA_10AH.url, detail: `checked ${formatDate(BOATING_CHECKED)}` },
            { name: `Redodo ${b100.model}`, url: b100.url, detail: "4,000 cycles at full depth" },
            { name: `${LEAD_ACID_REF.name} product page`, url: LEAD_ACID_REF.url },
            { name: MINN_KOTA_MANUAL.name, url: MINN_KOTA_MANUAL.url },
            { name: NEWPORT_RUNTIME_GUIDE.name, url: NEWPORT_RUNTIME_GUIDE.url },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/boating", label: "Electric boating and fishing", desc: "Every guide in one place" },
            { href: "/trolling-motor-battery-life", label: "Trolling motor runtime calculator", desc: "Hours for your motor and battery" },
            { href: "/fish-finder-battery", label: "Fish finder battery", desc: "How long electronics run" },
            { href: "/best-trolling-motor-battery", label: "Best trolling motor battery", desc: "Bass boats and 24 V motors" },
          ]}
        />
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
