import type { Metadata } from "next";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { RedodoSaleCallout } from "@/components/SaleCallout";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { BigStat, HubHero, PhotoCredit } from "@/components/ui";
import { LEAD_ACID_REF } from "@/data/batteries";
import { BOATING_CHECKED } from "@/data/boating";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import {
  MINN_KOTA_MANUAL,
  NEWPORT_RUNTIME_GUIDE,
  RUNTIME_BATTERIES,
  hoursLabel,
  hoursPrecise,
  lithiumCostPhrase,
  minutesApart,
  motorById,
  runtimeHours,
} from "@/lib/boating";
import { TROLLING_CHOICE } from "@/lib/trolling";
import { pageMetadata } from "@/lib/seo";
import { RedodoDeal } from "@/components/RedodoDeal";

const PATH = "/24v-vs-36v-trolling-motor";
const TITLE = "24V vs 36V Trolling Motor: Run Time, Cost and Which to Buy";
const DESCRIPTION =
  "A 36 V trolling motor pushes harder in wind, and a 24 V system costs less and weighs less. Thrust, run time and battery cost side by side, from Minn Kota's figures and today's prices.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function VoltageComparePage() {
  const m80 = motorById("80-24");
  const m112 = motorById("112-36");
  const [agm24, li24_50, li24_100] = RUNTIME_BATTERIES[24];
  const [agm36, li36_50, li36_100] = RUNTIME_BATTERIES[36];
  const hrs = (m: typeof m80, share: number, ah: number) => hoursLabel(runtimeHours(m, share, ah));
  const w80 = m80.maxAmps * 24;
  const w112 = m112.maxAmps * 36;
  const h24 = runtimeHours(m80, 0.5, 100);
  const h36 = runtimeHours(m112, 0.5, 100);
  const gapMin = minutesApart(h36, h24);
  const longer = h36 >= h24 ? "36 V" : "24 V";
  const weightGap = Math.round((agm36.weightLb ?? 0) - (li36_50.weightLb ?? 0));

  const rows: [string, string, string][] = [
    ["Thrust (Minn Kota)", `${m80.thrustLb} lb`, `${m112.thrustLb} lb`],
    ["Max draw", `${m80.maxAmps} A (about ${w80.toLocaleString("en-US")} W)`, `${m112.maxAmps} A (about ${w112.toLocaleString("en-US")} W)`],
    ["Motors Redodo sizes its batteries for", TROLLING_CHOICE[24].thrust, TROLLING_CHOICE[36].thrust],
    ["Lead-acid batteries needed", "2", "3"],
    ["Weight of those AGMs", `${Math.round(2 * LEAD_ACID_REF.weightLb)} lb`, `${Math.round(3 * LEAD_ACID_REF.weightLb)} lb`],
    ["Single lithium instead", `${li24_50.label}: ${money(li24_50.priceUsd ?? 0)}, ${li24_50.weightLb} lb`, `${li36_50.label}: ${money(li36_50.priceUsd ?? 0)}, ${li36_50.weightLb} lb`],
    ["Half speed on 50Ah lithium", hrs(m80, 0.5, 50), hrs(m112, 0.5, 50)],
    ["Half speed on 100Ah lithium", hrs(m80, 0.5, 100), hrs(m112, 0.5, 100)],
  ];

  const faqs = [
    {
      q: "Is a 36V trolling motor better than 24V?",
      a: `It is stronger, not automatically better. Minn Kota's 112 lb, 36 V motor draws up to ${m112.maxAmps} A (about ${w112.toLocaleString("en-US")} W) against ${m80.maxAmps} A (about ${w80.toLocaleString("en-US")} W) for its 80 lb, 24 V motor, so it holds a heavy boat in wind and current far better. For boats that don't need that push, 24 V saves a battery's worth of money and weight.`,
    },
    {
      q: "Does a 36V trolling motor run longer than 24V?",
      a: `On the same amp-hours, a little: the 112 lb motor's maximum draw (${m112.maxAmps} A) is slightly lower than the 80 lb motor's (${m80.maxAmps} A) because the higher voltage does more of the work. At half speed on 100 Ah of lithium, that's ${hoursPrecise(h36)} for 36 V against ${hoursPrecise(h24)} for 24 V, ${gapMin > 0 ? `so ${longer} gets about ${gapMin} more minutes on the water` : "about the same"}. Both round to ${hoursLabel(h36)}. The 36 V bank also holds 50% more energy (three 12 V batteries' worth instead of two), and that extra battery is what you pay for.`,
    },
    {
      q: "Can you run a 36V trolling motor on 24V?",
      a: "It will turn, but slowly and weakly, and that is not how it is designed to run. Use the voltage on the motor's label. Running a 24 V motor on 36 V can damage it.",
    },
    {
      q: "How many batteries does a 36V trolling motor need?",
      a: `Three 12 V lead-acid batteries wired in series (about ${Math.round(3 * LEAD_ACID_REF.weightLb)} lb of AGM), or one 36 V lithium. Redodo's 36V 50Ah was ${money(li36_50.priceUsd ?? 0)} and weighs ${li36_50.weightLb} lb. For all-day running you can also wire three 12V 100Ah lithium batteries in series (${money(li36_100.priceUsd ?? 0)} for three).`,
    },
  ];

  return (
    <article>
      <HubHero
        image="power-station"
        crumbs={[
          { name: "Boating", path: "/boating" },
          { name: "24V vs 36V trolling motor", path: PATH },
        ]}
        eyebrow="24V vs 36V trolling motors"
        title={<>More push, or one less battery? <span className="text-amber-300">Here&apos;s the trade.</span></>}
        sub={
          <>
            A 36 V motor holds a big boat in the wind. A 24 V system costs less and carries one fewer lead-acid battery, about{" "}
            {Math.round(LEAD_ACID_REF.weightLb)} lb. With lithium, either one gets lighter still.
          </>
        }
      >
        <a href="#compare" className="btn btn-primary">See the comparison</a>
        <a href="#batteries" className="btn btn-light">Battery costs</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Motors of {TROLLING_CHOICE[24].thrust}, calmer water: 24 V.</strong> One{" "}
            <PartnerLink brand="redodo" productId={li24_50.id} productUrl={li24_50.url ?? undefined}>Redodo 24V 50Ah</PartnerLink> (
            {money(li24_50.priceUsd ?? 0)}) or{" "}
            <PartnerLink brand="redodo" productId={li24_100.id} productUrl={li24_100.url ?? undefined}>24V 100Ah</PartnerLink> (
            {money(li24_100.priceUsd ?? 0)}) does it.
          </p>
          <p>
            <strong>Heavy boats, big water, wind and current ({TROLLING_CHOICE[36].thrust}): 36 V.</strong> One{" "}
            <PartnerLink brand="redodo" productId={li36_50.id} productUrl={li36_50.url ?? undefined}>Redodo 36V 50Ah</PartnerLink> (
            {money(li36_50.priceUsd ?? 0)}) replaces three lead-acid batteries.
          </p>
        </QuickAnswer>

        <RedodoSaleCallout className="mt-4" />
        <RedodoDeal className="mt-3" />

        <section aria-label="24V vs 36V at a glance" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat value={`+${m112.thrustLb - m80.thrustLb} lb`} label="More thrust at 36 V" note={`${m112.thrustLb} lb vs ${m80.thrustLb} lb (Minn Kota)`} />
          <BigStat tone="leaf" value={`${Math.round(LEAD_ACID_REF.weightLb)} lb`} label="Less battery at 24 V" note="Two AGMs instead of three" />
          <BigStat
            tone="orange"
            value={`${Math.round((agm36.weightLb ?? 0) - (li36_50.weightLb ?? 0))} lb`}
            label="Saved going lithium at 36 V"
            note={`${li36_50.weightLb} lb vs ${Math.round(agm36.weightLb ?? 0)} lb of AGM`}
          />
        </section>

        <Section title="Side by side" id="compare">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[36rem]">
              <caption className="sr-only">24 V vs 36 V trolling motor</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold"></th>
                  <th scope="col" className="p-3 font-semibold">24 V (80 lb)</th>
                  <th scope="col" className="p-3 font-semibold">36 V (112 lb)</th>
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
            Thrust and max draw from Minn Kota&apos;s Endura C2 manual. Run time is amp-hours divided by amps with half speed at half the max
            draw (Newport&apos;s rule of thumb); calm water. Prices from Redodo and Renogy, checked {formatDate(BOATING_CHECKED)}.
          </p>
        </Section>

        <Section title="What the batteries cost" id="batteries">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[36rem]">
              <caption className="sr-only">Battery cost by system voltage</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Setup</th>
                  <th scope="col" className="p-3 font-semibold text-right">Price*</th>
                  <th scope="col" className="p-3 font-semibold text-right">Weight</th>
                  <th scope="col" className="p-3 font-semibold">Half speed</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { b: agm24, m: m80 },
                  { b: li24_50, m: m80 },
                  { b: li24_100, m: m80 },
                  { b: agm36, m: m112 },
                  { b: li36_50, m: m112 },
                  { b: li36_100, m: m112 },
                ].map(({ b, m }) => (
                  <tr key={`${b.id}-${m.id}`} className={`border-t border-black/6 ${b.leadAcid ? "bg-stone-50" : ""}`}>
                    <th scope="row" className="p-3 font-medium">
                      {m.volts} V: {b.url ? <PartnerLink brand="redodo" productId={b.id} productUrl={b.url}>{b.label}</PartnerLink> : `${b.label} (Renogy)`}
                    </th>
                    <td className="p-3 text-right tabular-nums">{money(b.priceUsd ?? 0)}</td>
                    <td className="p-3 text-right tabular-nums">{b.weightLb} lb</td>
                    <td className="p-3">{hoursLabel(runtimeHours(m, 0.5, b.usableAh))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            *Checked {formatDate(BOATING_CHECKED)}. AGM rows use the Renogy 12V 100Ah AGM run to half, as Renogy advises. Redodo links are sponsored.
          </p>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;36 V always means more time on the water.&quot;</strong> Only if you size the batteries for it. On 50 Ah, both systems run
              about the same at half speed; the 36 V motor simply has more in reserve when the wind picks up.
            </Callout>
            <Callout>
              <strong>&quot;Lithium for 36 V costs a fortune.&quot;</strong> One Redodo 36V 50Ah was {money(li36_50.priceUsd ?? 0)}; three Renogy AGMs were{" "}
              {money(agm36.priceUsd ?? 0)} and weigh {Math.round(agm36.weightLb ?? 0)} lb. You {lithiumCostPhrase(li36_50.priceUsd ?? 0, agm36.priceUsd ?? 0, money)} here
              {weightGap > 0 ? `, and lift about ${weightGap} lb less.` : "."}
            </Callout>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Thrust needs depend on boat weight, hull, wind and current. Follow your motor maker&apos;s battery and wiring instructions. Prices change
          often; the dates are shown.
        </Disclaimer>
        <Sources
          items={[
            { name: MINN_KOTA_MANUAL.name, url: MINN_KOTA_MANUAL.url, detail: "thrust and max amp draw by voltage" },
            { name: NEWPORT_RUNTIME_GUIDE.name, url: NEWPORT_RUNTIME_GUIDE.url },
            ...[li24_50, li24_100, li36_50].map((b) => ({ name: `Redodo ${b.label}`, url: b.url ?? "", detail: `checked ${formatDate(BOATING_CHECKED)}` })),
            { name: `${LEAD_ACID_REF.name} product page`, url: LEAD_ACID_REF.url },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/boating", label: "Electric boating and fishing", desc: "Every guide in one place" },
            { href: "/trolling-motor-battery-life", label: "Trolling motor runtime calculator", desc: "Hours for your motor and battery" },
            { href: "/best-trolling-motor-battery", label: "Best trolling motor battery", desc: "Our picks for 12, 24 and 36 V" },
            { href: "/lithium-vs-agm-battery", label: "Lithium vs AGM", desc: "The cost per year, worked out" },
          ]}
        />
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
