import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { RedodoSaleCallout } from "@/components/SaleCallout";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import TrollingPicker from "@/components/TrollingPicker";
import { BigStat, HubHero, OurPick, PhotoCredit } from "@/components/ui";
import { BATTERIES, BATTERY_FACTS, LEAD_ACID_REF, OTHER_LITHIUM, TROLLING_EXTRA, type DeepCycleBattery } from "@/data/batteries";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import { lifetimeCost } from "@/lib/rv-battery";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { batteryProduct, productList } from "@/lib/structured-data";

const PATH = "/best-trolling-motor-battery";
const TITLE = "Best Trolling Motor Battery (2026): Lithium That Lasts All Day";
const DESCRIPTION =
  "The best 12 V, 24 V and 36 V trolling motor batteries, with what lithium saves over AGM in dollars and pounds. Redodo, LiTime and Battle Born compared with dated prices, plus a picker for your motor.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

/** Piscifun rod and reel combos (Awin partner), prices from piscifun.com. */
const PISCIFUN_CHECKED = "2026-10-20";
const PF = "https://www.piscifun.com/products/";
const PISCIFUN = {
  spinning: { name: "Torrent Lite spinning combo", priceUsd: 89.99, url: `${PF}torrent-lite-twin-tip-spinning-rod-and-reel-combo` },
  baitcasting: { name: "Torrent Lite baitcasting combo", priceUsd: 94.99, url: `${PF}torrent-lite-twin-tip-baitcasting-rod-and-reel-combo` },
};

const ALL: DeepCycleBattery[] = [...BATTERIES, ...TROLLING_EXTRA];
const byId = (id: string) => {
  const b = ALL.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown battery ${id}`);
  return b;
};

export default function TrollingPage() {
  const b12 = byId("redodo-12v-100ah");
  const g24 = byId("redodo-12v-120ah-group24-trolling");
  const b24 = byId("redodo-24v-50ah-trolling");
  const b24big = byId("redodo-24v-125ah-trolling-self-heating");
  const b36 = byId("redodo-36v-50ah-trolling");
  const list = [b12, g24, b24, b24big, b36];
  const [litime, battleBorn] = OTHER_LITHIUM;
  const agmPairLb = Math.round(2 * LEAD_ACID_REF.weightLb);
  const season = lifetimeCost(60);

  const faqs = [
    {
      q: "What is the best battery for a trolling motor?",
      a: `A lithium iron phosphate (LiFePO4) battery matched to your motor's voltage. For a 24 V motor (70 to 100 lb thrust), the Redodo 24V 50Ah (${money(b24.priceUsd)} when we checked) replaces two lead-acid batteries at ${b24.weightLb} lb in total; for long days or cold mornings, the Redodo 24V 125Ah Self-Heating (${money(b24big.priceUsd)}). For a 12 V motor, the Redodo 12V 100Ah (${money(b12.priceUsd)}) or the 12V 120Ah Group 24 (${money(g24.priceUsd)}).`,
    },
    {
      q: "Is lithium worth it for a trolling motor?",
      a: `For most anglers, yes. A ${b12.short} lithium gives ${b12.energyWh.toLocaleString("en-US")} Wh you can use, about double a 100 Ah AGM you should only run to half, at ${b12.weightLb} lb against ${LEAD_ACID_REF.weightLb} lb. Counting cycles, fishing 60 days a year it costs about ${money(Math.round(season.lithium.perYear))} a year against ${money(Math.round(season.leadAcid.perYear))} for the two AGMs it replaces. It also holds full power to the end of the day instead of slowing as it drains.`,
    },
    {
      q: "How long will a lithium battery run my trolling motor?",
      a: "It depends on thrust, speed, wind and how much you use features like spot-lock. Redodo's own figures: its 12V 120Ah runs a 55 lb thrust motor up to 19.2 hours at 1/8 power, and its 24V 125Ah up to 18 hours at a 7 A trolling draw. At full throttle any battery lasts only a few hours.",
    },
    {
      q: "Can I use a 12V lithium battery with my 24V trolling motor?",
      a: "Yes, by wiring two identical 12 V lithium batteries in series, or buy a single 24 V battery, which is simpler, lighter and keeps the cells balanced. Never mix lithium and lead-acid, or old and new batteries, in one string.",
    },
    {
      q: "Do I need a special charger for a lithium trolling battery?",
      a: "Yes: use a charger with a LiFePO4 (lithium) setting at the right voltage, such as 14.4 V for a 12 V battery or 28.8 V for 24 V (Redodo's figures). Many on-board marine chargers have a lithium mode; older lead-acid-only chargers can undercharge it, and desulfation modes must be off.",
    },
  ];

  return (
    <article>
      <JsonLd
        data={productList(
          PATH,
          "Trolling motor batteries",
          list.map((b) => batteryProduct({ ...b, name: `Redodo ${b.model}`, maker: "Redodo" }, PATH)),
        )}
      />
      <HubHero
        image="power-station"
        crumbs={[
          { name: "Lithium RV battery", path: "/lithium-rv-battery" },
          { name: "Trolling motor battery", path: PATH },
        ]}
        eyebrow="Trolling motor batteries"
        title={<>Fish till dark. <span className="text-amber-300">Lift 100 lb less.</span></>}
        sub={
          <>
            A {money(b24.priceUsd)} lithium battery runs a 24 V trolling motor in place of two lead-acid batteries, weighs {b24.weightLb} lb
            instead of about {agmPairLb}, and keeps full speed until it&apos;s empty. Here is which one fits your motor.
          </>
        }
      >
        <a href="#picker" className="btn btn-primary">Find my battery</a>
        <a href="#picks" className="btn btn-light">See our picks</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>24 V motor (most bass boats):</strong>{" "}
            <PartnerLink brand="redodo" productId={b24.id} productUrl={b24.url}>Redodo 24V 50Ah</PartnerLink> ({money(b24.priceUsd)}) for
            half days, or the <PartnerLink brand="redodo" productId={b24big.id} productUrl={b24big.url}>24V 125Ah Self-Heating</PartnerLink>{" "}
            ({money(b24big.priceUsd)}) for all day, wind and cold mornings.
          </p>
          <p>
            <strong>12 V motor (kayaks, jon boats):</strong>{" "}
            <PartnerLink brand="redodo" productId={b12.id} productUrl={b12.url}>Redodo 12V 100Ah</PartnerLink> ({money(b12.priceUsd)}), or the{" "}
            <PartnerLink brand="redodo" productId={g24.id} productUrl={g24.url}>12V 120Ah Group 24</PartnerLink> ({money(g24.priceUsd)}) if
            your tray is Group 24. <strong>36 V:</strong> the{" "}
            <PartnerLink brand="redodo" productId={b36.id} productUrl={b36.url}>Redodo 36V 50Ah</PartnerLink> ({money(b36.priceUsd)}).
          </p>
          <p className="text-sm">
            Want a 10-year warranty and US assembly? <PlainLink href={battleBorn.url}>Battle Born</PlainLink> offers both, at about three times
            the price for the same energy.
          </p>
        </QuickAnswer>

        <RedodoSaleCallout className="mt-4" />

        <section aria-label="What switching saves" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat tone="leaf" value={`${Math.round(agmPairLb - b24.weightLb)} lb`} label="Lighter on a 24 V boat" note={`${b24.weightLb} lb vs two AGMs at ${agmPairLb} lb`} />
          <BigStat value="2x" label="The power you can actually use" note="Lithium runs to empty; AGM should stop at half" />
          <BigStat
            tone="orange"
            value={`${money(Math.round(season.leadAcid.perYear - season.lithium.perYear))}/yr`}
            label="Less than AGM, 60 days a year"
            note={`12 V: ${money(Math.round(season.lithium.perYear))} vs ${money(Math.round(season.leadAcid.perYear))} a year, counting cycles`}
          />
        </section>

        <section id="picker" className="mt-12 scroll-mt-24" aria-labelledby="picker-heading">
          <h2 id="picker-heading" className="text-2xl font-extrabold text-ink mb-2">Which battery fits your motor?</h2>
          <TrollingPicker batteries={ALL} />
        </section>

        <section id="picks" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="picks-heading">
          <h2 id="picks-heading" className="text-2xl font-extrabold text-ink">Our picks</h2>
          <OurPick
            label="Best for 24 V motors"
            name={`Redodo ${b24.short}`}
            icon="water"
            why="One battery instead of two lead-acid batteries wired together, for motors up to 100 lb thrust. The app shows how much is left before you head back."
            life={[`${b24.weightLb} lb in total`, "Bluetooth charge gauge"]}
            priceUsd={b24.priceUsd}
            brand="redodo"
            productId={b24.id}
            productUrl={b24.url}
            category="battery"
          />
          <OurPick
            label="Best for all-day fishing and cold water"
            name={`Redodo ${b24big.short}`}
            icon="heat"
            why={`Two and a half times the energy of the 24V 50Ah, and it warms itself to charge on frosty mornings. Redodo says it replaces two Group 31 AGMs that weigh about 134 lb together; it weighs ${b24big.weightLb} lb.`}
            life={["Up to 18 hours at a 7 A troll (Redodo)", "IP67 water resistance"]}
            priceUsd={b24big.priceUsd}
            brand="redodo"
            productId={b24big.id}
            productUrl={b24big.url}
            category="battery"
          />
          <OurPick
            label="Best value for 12 V motors"
            name={`Redodo ${b12.short}`}
            icon="dollar"
            why={`The cheapest well-known 12V 100Ah lithium we found: ${money(litime.priceUsd - b12.priceUsd)} less than LiTime's equivalent with the same 4,000-cycle rating and 5-year warranty. Redodo rates it for 30 to 70 lb thrust motors.`}
            life={[`${b12.weightLb} lb`, `${b12.energyWh.toLocaleString("en-US")} Wh usable`]}
            priceUsd={b12.priceUsd}
            brand="redodo"
            productId={b12.id}
            productUrl={b12.url}
            category="battery"
          />
          <OurPick
            label="Best for 36 V motors"
            name={`Redodo ${b36.short}`}
            icon="bolt"
            why="Replaces three lead-acid batteries for 100 to 120 lb thrust motors, at 32.8 lb, with a low-temperature charging cutoff."
            life={[`${b36.weightLb} lb vs about ${Math.round(3 * LEAD_ACID_REF.weightLb)} lb of AGM`, `${b36.energyWh.toLocaleString("en-US")} Wh`]}
            priceUsd={b36.priceUsd}
            brand="redodo"
            productId={b36.id}
            productUrl={b36.url}
            category="battery"
          />
        </section>

        <Section title="Every option, side by side" id="compare">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[50rem]">
              <caption className="sr-only">Trolling motor batteries compared</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Battery</th>
                  <th scope="col" className="p-3 font-semibold text-right">Price*</th>
                  <th scope="col" className="p-3 font-semibold text-right">Volts</th>
                  <th scope="col" className="p-3 font-semibold text-right">Usable energy</th>
                  <th scope="col" className="p-3 font-semibold text-right">Weight</th>
                  <th scope="col" className="p-3 font-semibold">Cold weather</th>
                  <th scope="col" className="p-3 font-semibold text-right">Warranty</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">
                      <PartnerLink brand="redodo" productId={b.id} productUrl={b.url}>Redodo {b.short}</PartnerLink>
                    </th>
                    <td className="p-3 text-right tabular-nums">{money(b.priceUsd)}</td>
                    <td className="p-3 text-right tabular-nums">{b.volts} V</td>
                    <td className="p-3 text-right tabular-nums">{b.energyWh.toLocaleString("en-US")} Wh</td>
                    <td className="p-3 text-right tabular-nums">{b.weightLb} lb</td>
                    <td className="p-3">{b.selfHeating ? "Self-heating" : b.lowTempCutoff ? "Low-temp cutoff" : "Not stated"}</td>
                    <td className="p-3 text-right tabular-nums">{b.warrantyYears} yr</td>
                  </tr>
                ))}
                {OTHER_LITHIUM.map((o) => (
                  <tr key={o.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium"><PlainLink href={o.url}>{o.name}</PlainLink></th>
                    <td className="p-3 text-right tabular-nums">{money(o.priceUsd)}</td>
                    <td className="p-3 text-right tabular-nums">12 V</td>
                    <td className="p-3 text-right tabular-nums">{o.energyWh.toLocaleString("en-US")} Wh</td>
                    <td className="p-3 text-right tabular-nums">{o.weightLb ? `${o.weightLb} lb` : "Not stated"}</td>
                    <td className="p-3">See maker</td>
                    <td className="p-3 text-right tabular-nums">{o.warrantyYears} yr</td>
                  </tr>
                ))}
                <tr className="border-t border-black/6 bg-stone-50">
                  <th scope="row" className="p-3 font-medium">For comparison: {LEAD_ACID_REF.name}</th>
                  <td className="p-3 text-right tabular-nums">{money(LEAD_ACID_REF.priceUsd)}</td>
                  <td className="p-3 text-right tabular-nums">12 V</td>
                  <td className="p-3 text-right tabular-nums">600 Wh (run to half)</td>
                  <td className="p-3 text-right tabular-nums">{LEAD_ACID_REF.weightLb} lb</td>
                  <td className="p-3">—</td>
                  <td className="p-3 text-right">{LEAD_ACID_REF.warrantyNote}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            *Prices and specs from each maker&apos;s US product page, checked {formatDate(b24big.retrieved)} (Redodo 12V 100Ah, 24V 50Ah and
            the Renogy AGM on {formatDate(b12.retrieved)}). Redodo and LiTime links are sponsored; Battle Born is a plain link.{" "}
            <PartnerLink brand="litime" productId={litime.id} productUrl={litime.url}>{litime.name}</PartnerLink>:{" "}
            {money(litime.priceUsd)} on {formatDate(litime.retrieved)}. {litime.note} {battleBorn.note}
          </p>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;Lithium is too expensive for a fishing boat.&quot;</strong> Up front it costs more per battery, but one
              lithium does the work of two AGMs and lasts several times as many cycles, so it costs less per season (see the 60-day figure
              above). It is also lighter, which helps a small boat plane and a kayak paddle.
            </Callout>
            <Callout>
              <strong>&quot;It won&apos;t work with my Minn Kota or MotorGuide.&quot;</strong> A trolling motor only cares about voltage.
              Match 12, 24 or 36 V and it works; Redodo lists compatibility with Minn Kota, MotorGuide, Garmin and Lowrance motors for its
              24V 125Ah.
            </Callout>
            <Callout>
              <strong>&quot;Lithium dies in cold water.&quot;</strong> It runs in the cold but shouldn&apos;t be charged below 32°F (
              <a href={BATTERY_FACTS.coldCharging.url} className="underline" rel="noopener">Battery University</a>). A low-temperature
              cutoff pauses charging to protect it; a self-heating battery warms up and then charges.
            </Callout>
          </div>
        </Section>

        <Section title="Rounding out the boat" id="gear">
          <p className="max-w-3xl">
            With the battery sorted, the rest of the money can go on fishing. If your rod and reel are due for an upgrade,
            Piscifun&apos;s Torrent Lite combos are good value: the{" "}
            <PartnerLink brand="piscifun" productUrl={PISCIFUN.spinning.url}>{PISCIFUN.spinning.name}</PartnerLink>{" "}
            ({money(PISCIFUN.spinning.priceUsd)}) suits kayaks and lighter lures, and the{" "}
            <PartnerLink brand="piscifun" productUrl={PISCIFUN.baitcasting.url}>{PISCIFUN.baitcasting.name}</PartnerLink>{" "}
            ({money(PISCIFUN.baitcasting.priceUsd)}) is built for bass. Both come with a spare rod tip, which is handy when rods ride
            loose in a boat.
          </p>
          <p className="text-xs text-muted mt-2">
            Prices from piscifun.com, checked {formatDate(PISCIFUN_CHECKED)}. Piscifun links are sponsored.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Runtimes depend on thrust setting, wind, current and boat weight. Prices and specifications are copied from makers&apos; US
          websites on the dates shown and change often. Follow your motor&apos;s wiring and fuse instructions.
        </Disclaimer>
        <Sources
          items={[
            ...list.map((b) => ({ name: `Redodo ${b.model} product page`, url: b.sourceUrl, detail: `checked ${formatDate(b.retrieved)}` })),
            ...OTHER_LITHIUM.map((o) => ({ name: `${o.name} product page`, url: o.url, detail: `checked ${formatDate(o.retrieved)}` })),
            { name: `${LEAD_ACID_REF.name} product page`, url: LEAD_ACID_REF.url, detail: `checked ${formatDate(LEAD_ACID_REF.retrieved)}` },
            { name: BATTERY_FACTS.coldCharging.name, url: BATTERY_FACTS.coldCharging.url, detail: "No charging below 32°F (0°C)" },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/trolling-motor-battery-life", label: "How long will it last?", desc: "Runtime calculator for your motor" },
            { href: "/boating", label: "Electric boating and fishing", desc: "Every boating guide in one place" },
            { href: "/lithium-vs-agm-battery", label: "100Ah lithium vs AGM", desc: "The cost per year, worked out" },
            { href: "/lithium-rv-battery", label: "Lithium RV and boat house batteries", desc: "Size a battery for the fridge, lights and CPAP" },
            { href: "/best-portable-power-stations", label: "Portable power stations", desc: "All-in-one batteries with outlets" },
            { href: "/myths", label: "Myths, answered", desc: "Batteries, EVs and solar doubts" },
          ]}
        />
        <p className="text-sm text-muted mt-6">
          Charging from solar at the dock? See how much sun your state gets on its <Link href="/states" className="underline">state page</Link>.
        </p>
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
