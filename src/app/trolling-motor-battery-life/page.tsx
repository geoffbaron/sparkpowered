import type { Metadata } from "next";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { RedodoSaleCallout } from "@/components/SaleCallout";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import TrollingRuntimeCalc from "@/components/TrollingRuntimeCalc";
import { BigStat, HubHero, PhotoCredit } from "@/components/ui";
import { BATTERY_FACTS, LEAD_ACID_REF } from "@/data/batteries";
import { BOATING_CHECKED } from "@/data/boating";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import {
  FISHING_DAY_HOURS,
  MINN_KOTA_MANUAL,
  MOTORS,
  NEWPORT_RUNTIME_GUIDE,
  RUNTIME_BATTERIES,
  SPEEDS,
  hoursLabel,
  runtimeFor,
} from "@/lib/boating";
import { JsonLd, pageMetadata, url } from "@/lib/seo";
import { RedodoDeal } from "@/components/RedodoDeal";

const PATH = "/trolling-motor-battery-life";
const TITLE = "How Long Will a Trolling Motor Battery Last? Runtime Calculator";
const DESCRIPTION =
  "Hours on the water for 30 to 112 lb trolling motors on lithium and AGM batteries, from the makers' own amp-draw figures. Pick your motor, speed and battery and see if it lasts a full day.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function TrollingRuntimePage() {
  const b12 = RUNTIME_BATTERIES[12];
  const [agm12, li50, li100, li120] = b12;
  const h = (m: string, s: string, b: string) => runtimeFor(m, s, b);
  const agmHalf = h("55-12", "half", agm12.id);
  const liHalf = h("55-12", "half", li100.id);

  const rows = MOTORS.map((m) => {
    const list = RUNTIME_BATTERIES[m.volts];
    return { m, agm: list[0], li: list.find((b) => b.usableAh >= 100) ?? list[list.length - 1] };
  });

  const faqs = [
    {
      q: "How long will a trolling motor battery last?",
      a: `On a calm day, a 55 lb motor on a 12V 100Ah lithium battery runs ${hoursLabel(liHalf)} at half speed and ${hoursLabel(h("55-12", "slow", li100.id))} at a slow troll. The same motor on a 100Ah AGM, which you should only run to half, gets ${hoursLabel(agmHalf)} at half speed. At full speed any 100Ah battery is done in about ${hoursLabel(h("55-12", "full", li100.id)).replace("about ", "")} on lithium. Wind, current and spot-lock shorten it.`,
    },
    {
      q: "How long will a 100Ah lithium battery run a trolling motor?",
      a: `Divide the amp-hours by the amps the motor draws. A 55 lb Minn Kota draws up to 50 A at full speed, so 100 Ah lasts about 2 hours flat out, about 4 at half speed and about 8 at a slow troll. A 30 lb motor (30 A max) gets about ${hoursLabel(h("30-12", "half", li100.id))} at half speed.`,
    },
    {
      q: "How long will a 12V battery run a trolling motor?",
      a: `It depends on the battery's usable amp-hours. A 12V 50Ah lithium (${money(li50.priceUsd ?? 0)} when we checked) runs a 45 lb motor ${hoursLabel(h("45-12", "half", li50.id))} at half speed; a 12V 120Ah lithium (${money(li120.priceUsd ?? 0)}) runs it ${hoursLabel(h("45-12", "half", li120.id))}.`,
    },
    {
      q: "How long does a trolling motor battery take to charge?",
      a: "Divide the amp-hours you used by the charger's amps and add a little. A 10 A lithium charger refills 50 Ah in about five hours; Redodo says its 10 A charger takes a 12V 50Ah battery to half in 2.5 hours. Lithium charges at full speed almost to the top, while AGM slows down for the last part.",
    },
    {
      q: "Why does my battery run out faster than the calculator says?",
      a: "Full-speed runs into wind, current, a heavy boat, spot-lock holding against waves and an older lead-acid battery all add draw. Minn Kota says its maximum amp figures are peaks, so steady cruising usually draws less, but bad weather draws more.",
    },
  ];

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#calculator`,
          name: "Trolling motor battery runtime calculator",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
        }}
      />
      <HubHero
        image="power-station"
        crumbs={[
          { name: "Boating", path: "/boating" },
          { name: "Trolling motor battery life", path: PATH },
        ]}
        eyebrow="Trolling motor runtime calculator"
        title={<>How many hours <span className="text-amber-300">before you paddle home?</span></>}
        sub={
          <>
            Pick your motor, your speed and your battery. On the same 100Ah size, lithium gives you about twice the time on the water
            of AGM, because you can use all of it.
          </>
        }
      >
        <a href="#calc" className="btn btn-primary">Work out my hours</a>
        <a href="#table" className="btn btn-light">See the table</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>A 55 lb motor on a 12V 100Ah lithium battery: {hoursLabel(liHalf)} at half speed, {hoursLabel(h("55-12", "slow", li100.id))} at a slow troll.</strong>{" "}
            On a 100Ah AGM it is half that, because AGM should stop at 50%.
          </p>
          <p>
            For a full {FISHING_DAY_HOURS}-hour day on a 12 V motor, a{" "}
            <PartnerLink brand="redodo" productId={li120.id} productUrl={li120.url ?? undefined}>Redodo 12V 120Ah</PartnerLink> (
            {money(li120.priceUsd ?? 0)}) covers most calm days at a mix of slow and half speed. For 24 V, see the calculator below.
          </p>
        </QuickAnswer>

        <RedodoSaleCallout className="mt-4" />
        <RedodoDeal className="mt-3" />

        <section aria-label="Lithium vs AGM on the water" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat tone="leaf" value="2x" label="The hours of a same-size AGM" note="Lithium runs to empty; AGM should stop at half" />
          <BigStat value={hoursLabel(liHalf).replace("about ", "")} label="55 lb motor, half speed" note={`12V 100Ah lithium, ${money(li100.priceUsd ?? 0)}`} />
          <BigStat
            tone="orange"
            value={`${Math.round((agm12.weightLb ?? 0) - (li100.weightLb ?? 0))} lb`}
            label="Less to haul to the boat"
            note={`${li100.weightLb} lb lithium vs ${LEAD_ACID_REF.weightLb} lb AGM`}
          />
        </section>

        <section id="calc" className="mt-12 scroll-mt-24" aria-labelledby="calc-heading">
          <h2 id="calc-heading" className="text-2xl font-extrabold text-ink mb-2">Your hours on the water</h2>
          <TrollingRuntimeCalc />
        </section>

        <Section title="Hours at a glance" id="table">
          <p className="max-w-3xl mb-4">
            Half speed, calm water, with the usual lead-acid setup and a 100Ah-class lithium for each motor voltage.
          </p>
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[40rem]">
              <caption className="sr-only">Trolling motor runtime by motor and battery</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Motor</th>
                  <th scope="col" className="p-3 font-semibold text-right">Max draw</th>
                  <th scope="col" className="p-3 font-semibold">AGM (run to half)</th>
                  <th scope="col" className="p-3 font-semibold">Lithium</th>
                  <th scope="col" className="p-3 font-semibold">Lithium, slow troll</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ m, agm, li }) => (
                  <tr key={m.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{m.label}</th>
                    <td className="p-3 text-right tabular-nums">{m.maxAmps} A</td>
                    <td className="p-3">{agm.label}: {hoursLabel(h(m.id, "half", agm.id))}</td>
                    <td className="p-3">{li.label}: <strong>{hoursLabel(h(m.id, "half", li.id))}</strong></td>
                    <td className="p-3">{hoursLabel(h(m.id, "slow", li.id))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Max draw from Minn Kota&apos;s Endura C2 manual. Runtime is usable amp-hours divided by amps, Newport Vessels&apos; formula.
            Battery prices from Redodo and Renogy, checked {formatDate(BOATING_CHECKED)}.
          </p>
        </Section>

        <Section title="How we work it out" id="method">
          <div className="grid gap-3">
            <Callout>
              <strong>Hours = usable amp-hours / amps.</strong> A lithium battery gives you all of its rating; Renogy advises running its AGM no
              lower than half. Batteries wired in series for 24 or 36 V keep the same amp-hours, so the sum works the same way.
            </Callout>
            <Callout>
              <strong>Speeds.</strong> {SPEEDS.map((s) => `${s.label}: ${s.hint}`).join(" ")}
            </Callout>
          </div>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;A bigger AGM is just as good.&quot;</strong> A 100Ah AGM gives about 50 Ah you should use, at {LEAD_ACID_REF.weightLb} lb.
              A 12V 50Ah lithium gives the same 50 Ah at {li50.weightLb} lb, and keeps the motor at full strength until it is empty instead of
              fading through the afternoon.
            </Callout>
            <Callout>
              <strong>&quot;Lithium dies in the cold.&quot;</strong> It runs fine on a cold morning; it just shouldn&apos;t be charged below 32°F (
              <a href={BATTERY_FACTS.coldCharging.url} className="underline" rel="noopener">Battery University</a>). Every Redodo pick here
              except the base 12V 100Ah pauses charging in the cold to protect itself.
            </Callout>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          A calm-water guide. Real runtime depends on wind, current, boat weight, battery age and how you fish. Prices change often; the
          dates are shown. Redodo links are sponsored.
        </Disclaimer>
        <Sources
          items={[
            { name: MINN_KOTA_MANUAL.name, url: MINN_KOTA_MANUAL.url, detail: "max amp draw by thrust and voltage" },
            { name: NEWPORT_RUNTIME_GUIDE.name, url: NEWPORT_RUNTIME_GUIDE.url, detail: "runtime = amp-hours / amps; halve max draw for lower speeds" },
            { name: `${LEAD_ACID_REF.name} product page`, url: LEAD_ACID_REF.url, detail: "run to 50% as Renogy advises" },
            { name: BATTERY_FACTS.coldCharging.name, url: BATTERY_FACTS.coldCharging.url },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/boating", label: "Electric boating and fishing", desc: "Every guide in one place" },
            { href: "/best-trolling-motor-battery", label: "Best trolling motor battery", desc: "Our picks for 12, 24 and 36 V" },
            { href: "/kayak-trolling-motor-battery", label: "Kayak trolling motor battery", desc: "Light batteries that last the day" },
            { href: "/24v-vs-36v-trolling-motor", label: "24V vs 36V trolling motor", desc: "Which system to buy" },
          ]}
        />
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
