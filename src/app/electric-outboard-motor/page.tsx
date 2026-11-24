import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import { BigStat, HubHero, PhotoCredit } from "@/components/ui";
import {
  ELECTRIC_OUTBOARDS,
  ELECTRIC_PONTOON,
  FUEL_PRICES,
  GAS_OUTBOARDS,
  SPIRIT_RUNTIME,
} from "@/data/boating";
import { BATTERIES } from "@/data/batteries";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import { ELECTRIC_HOUR_USD, GAS_HOUR_USD, chargeCostUsd, seasonFuel } from "@/lib/boating";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { productList, reviewedProduct } from "@/lib/structured-data";

const PATH = "/electric-outboard-motor";
const TITLE = "Electric Outboard Motors (2026): Range and Running Cost vs Gas";
const DESCRIPTION =
  "ePropulsion, Mercury Avator and Torqeedo electric outboards compared: power, battery, how far they go on a charge, and what an hour on the water costs next to a small gas outboard.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const cents = (n: number) => (n < 1 ? `${Math.round(n * 100)}¢` : money(Math.round(n * 100) / 100));

export default function ElectricOutboardPage() {
  const spirit = ELECTRIC_OUTBOARDS.find((o) => o.id === "epropulsion-spirit-1-evo")!;
  const travel = ELECTRIC_OUTBOARDS.find((o) => o.id === "torqeedo-travel-s")!;
  const avator = ELECTRIC_OUTBOARDS.find((o) => o.id === "mercury-avator-7-5e")!;
  const honda = GAS_OUTBOARDS.hondaBf23;
  const seasons = [50, 100, 150].map((h) => ({ h, ...seasonFuel(h) }));
  const s100 = seasonFuel(100);
  const spiritCharge = chargeCostUsd(spirit.batteryWh);
  const redodo48 = BATTERIES.find((b) => b.id === "redodo-48v-100ah")!;

  const faqs = [
    {
      q: "Which electric outboard should I buy for a small boat?",
      a: "For a dinghy, jon boat or small fishing boat, a 3 hp-class motor with its own battery: the Torqeedo Travel S or the ePropulsion Spirit 1.0 Evo. Both split into motor and battery for carrying. If you want a dealer network behind it, look at the Mercury Avator 7.5e. Up front, an electric costs more than a small gas outboard; check today's prices on the makers' and dealers' sites, then weigh them against the running costs below.",
    },
    {
      q: "How far can an electric outboard go on one charge?",
      a: `At a slow cruise, a long way: ePropulsion says its Spirit 1.0 goes 35 miles in 10 hours at 3.5 mph on a 12 ft aluminum boat, and Mercury says the Avator 7.5e goes 34 miles at 25% throttle. Flat out it is about an hour (7.8 miles for the Spirit, 5 miles for the 7.5e). Range falls fast with speed, so these suit fishing, trolling and getting around a lake, not long runs at full throttle.`,
    },
    {
      q: "Is an electric outboard cheaper to run than gas?",
      a: `Yes. A full charge of the Spirit's 1,276 Wh battery costs about ${cents(spiritCharge)} at the US average power price. An hour at full throttle costs about ${cents(ELECTRIC_HOUR_USD)} on a 1 kW electric outboard against about ${cents(GAS_HOUR_USD)} in fuel for Honda's 2.3 hp gas outboard. Over 100 hours that is about ${money(Math.round(s100.saved))} saved on fuel alone, before oil changes, spark plugs and winterizing.`,
    },
    {
      q: "Are electric outboard motors any good?",
      a: "For small boats at modest speeds, very good: they start instantly, run silently (fish don't spook and you can talk), need no fuel or oil, and lift off the boat in two pieces. They are not for planing a heavy boat across a big lake all day; for that, look at the larger Avator 35e or ePropulsion Navy 6.0 with big batteries, or stay with gas.",
    },
    {
      q: "Can I charge an electric outboard battery with solar?",
      a: "Often, yes. A full charge is small, about 1 to 1.3 kWh for the portable 3 hp-class motors, so a portable solar panel can refill one over a sunny day or two. Use the charger or solar input the motor maker approves and check its limits before connecting a panel.",
    },
  ];

  return (
    <article>
      <JsonLd
        data={productList(
          PATH,
          "Electric outboard motors",
          ELECTRIC_OUTBOARDS.map((o) =>
            reviewedProduct({
              name: o.name,
              brand: o.maker,
              url: o.url,
              pagePath: PATH,
              description: `${o.name} is a ${o.watts.toLocaleString("en-US")} W electric outboard that ${o.maker} compares to a ${o.gasHpClaim} gas motor.`,
            }),
          ),
        )}
      />
      <HubHero
        image="power-station"
        crumbs={[
          { name: "Boating", path: "/boating" },
          { name: "Electric outboard motors", path: PATH },
        ]}
        eyebrow="Electric outboard motors"
        title={<>No gas, no oil, no pull cord. <span className="text-amber-300">About {cents(spiritCharge)} a charge.</span></>}
        sub={
          <>
            A 3 hp-class electric outboard runs for hours at trolling speed and costs pennies an hour to run. Here are the specs, the
            makers&apos; range claims and the running costs next to gas.
          </>
        }
      >
        <a href="#compare" className="btn btn-primary">Compare motors</a>
        <a href="#cost" className="btn btn-light">Cost vs gas</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Small boats, dinghies and jon boats:</strong> the{" "}
            <PlainLink href={travel.url}>Torqeedo Travel S</PlainLink> or the{" "}
            <PlainLink href={spirit.url}>ePropulsion Spirit 1.0 Evo</PlainLink>. Both are rated as 3 hp equivalents and split into motor
            and battery for carrying.
          </p>
          <p>
            <strong>Want a dealer network behind it:</strong> the <PlainLink href={avator.url}>Mercury Avator 7.5e</PlainLink> or the
            Avator 20e and 35e for 5 and 9.9 hp-class power.
          </p>
          <p className="text-sm">
            None of these makers pays us anything; these are plain links to their sites, where you can see today&apos;s price.
          </p>
        </QuickAnswer>

        <section aria-label="Electric vs gas" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat tone="leaf" value={cents(ELECTRIC_HOUR_USD)} label="An hour at full throttle" note="1 kW electric at 18.31¢ a kWh" />
          <BigStat value={cents(GAS_HOUR_USD)} label="An hour on a 2.3 hp gas outboard" note={`Honda's figures, gas at ${money(FUEL_PRICES.gasUsdPerGal)}/gal`} />
          <BigStat tone="orange" value={`${money(Math.round(s100.saved))}`} label="Fuel saved over 100 hours" note="Plus no oil changes or winterizing" />
        </section>

        <Section title="Electric outboards compared" id="compare">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[52rem]">
              <caption className="sr-only">Electric outboard power, battery and range</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Motor</th>
                  <th scope="col" className="p-3 font-semibold">Like a gas</th>
                  <th scope="col" className="p-3 font-semibold text-right">Battery</th>
                  <th scope="col" className="p-3 font-semibold">Maker&apos;s range claim</th>
                  <th scope="col" className="p-3 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {ELECTRIC_OUTBOARDS.map((o) => (
                  <tr key={o.id} className="border-t border-black/6 align-top">
                    <th scope="row" className="p-3 font-medium">{o.name}</th>
                    <td className="p-3">{o.gasHpClaim}</td>
                    <td className="p-3 text-right tabular-nums">{o.batteryWh.toLocaleString("en-US")} Wh</td>
                    <td className="p-3">{o.rangeClaim}</td>
                    <td className="p-3"><PlainLink href={o.url}>Today&apos;s price at {o.maker}</PlainLink></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Specs and ranges from each maker&apos;s US site and brochures. We don&apos;t list prices: they change often, and some makers
            only sell through dealers, so each link opens the maker&apos;s page.
          </p>
        </Section>

        <Section title="What it costs to run, season by season" id="cost">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[32rem]">
              <caption className="sr-only">Fuel cost per season, electric vs gas</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Hours a season (full throttle)</th>
                  <th scope="col" className="p-3 font-semibold text-right">Electric, 1 kW</th>
                  <th scope="col" className="p-3 font-semibold text-right">Gas, 2.3 hp</th>
                  <th scope="col" className="p-3 font-semibold text-right">You keep</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((s) => (
                  <tr key={s.h} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{s.h} hours</th>
                    <td className="p-3 text-right tabular-nums">{money(Math.round(s.electric))}</td>
                    <td className="p-3 text-right tabular-nums">{money(Math.round(s.gas))}</td>
                    <td className="p-3 text-right tabular-nums font-bold text-leaf">{money(Math.round(s.saved))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Electric: one hour at 1 kW (the Spirit 1.0&apos;s full power) at {FUEL_PRICES.electricCentsPerKwh}¢ a kWh, the US average residential price
            for {FUEL_PRICES.electricMonth} (EIA), before charger losses. Gas: Honda says its BF2.3&apos;s {honda.tankGal} gallon tank lasts up to an
            hour at full throttle; regular gas at {money(FUEL_PRICES.gasUsdPerGal)} a gallon (EIA, week of {formatDate(FUEL_PRICES.gasWeek)}). The gas
            motor here is smaller than the 3 hp-class electrics, so the real gap is likely wider. Most fishing is done well below full throttle,
            where an electric uses far less: ePropulsion&apos;s table has the Spirit at {SPIRIT_RUNTIME[0].watts} W for {SPIRIT_RUNTIME[0].mph} mph.
          </p>
          <p className="mt-4 max-w-3xl">
            The bigger savings are the things you stop doing: no fuel stabilizer, no oil or gear-lube changes, no carburetor cleaning after a
            winter, no spare gas can in the car. The honest cost is up front: a 3 hp-class electric with its battery costs more to buy than a
            small gas outboard, so compare today&apos;s prices for both before you decide.
          </p>
        </Section>

        <Section title="Electric pontoons and bigger boats" id="pontoon">
          <p className="max-w-3xl">
            Electric pontoons are here. Vision Marine&apos;s{" "}
            <PlainLink href={ELECTRIC_PONTOON.url}>V17 electric pontoon</PlainLink> has a {ELECTRIC_PONTOON.note}.
            To convert a small pontoon you already own, the Mercury Avator 35e is comparable to a 9.9 hp four-stroke, which Mercury says runs
            up to 18 hours on two batteries. Mercury also makes the larger Avator 75e and 110e for bigger boats.
          </p>
          <p className="max-w-3xl mt-3">
            Building your own 48 V battery bank for a bigger electric motor? Redodo&apos;s{" "}
            <PartnerLink brand="redodo" productId={redodo48.id} productUrl={redodo48.url}>48V 100Ah</PartnerLink> ({redodo48.energyWh.toLocaleString("en-US")} Wh,{" "}
            <PartnerLink brand="redodo" productId={redodo48.id} productUrl={redodo48.url}>see today&apos;s price at Redodo</PartnerLink>) is a solar and home battery, so check your motor maker approves third-party batteries
            first; most portable outboards only take their own.
          </p>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;Electric outboards can&apos;t handle real water.&quot;</strong> The portable ones are built for dinghies, jon boats and
              small fishing boats, and they hold a steady 3 to 5 mph for hours. The larger ones are a different class: ePropulsion says its Navy 6.0
              reaches 15 mph and Mercury rates the Avator 35e like a 9.9 hp four-stroke. Match the motor to the boat, as you would with gas.
            </Callout>
            <Callout>
              <strong>&quot;You&apos;ll be stranded when the battery dies.&quot;</strong> At a slow troll the makers quote 10 hours or more on one battery;
              flat out it is about an hour. Plan the trip the way you would a small fuel tank, and carry a paddle, as you should with gas. Wear the kill-switch lanyard, carry a life jacket for everyone aboard, and register the boat: most states count an electric motor as a motor under their boating laws.
            </Callout>
            <Callout>
              <strong>&quot;They cost too much.&quot;</strong> Up front, an electric costs more than a small gas motor. Fuel and upkeep claw some of
              that back every season, and the quiet is worth something on a fishing trip.
            </Callout>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Specifications come from the makers&apos; US websites and change from time to time. We don&apos;t list prices; check today&apos;s on the maker&apos;s site. Ranges are the
          makers&apos; own claims in calm water. Fuel costs use US averages; yours will differ. The Redodo link is sponsored; all others are plain.
        </Disclaimer>
        <Sources
          items={[
            ...ELECTRIC_OUTBOARDS.map((o) => ({ name: `${o.name}: maker specs`, url: o.url, detail: `checked ${formatDate(o.retrieved)}` })),
            { name: "ePropulsion Spirit 1.0 specs and runtime table", url: spirit.url },
            { name: "Mercury Avator brochure (specs, ranges)", url: avator.url },
            { name: "Honda BF2.3 specifications", url: honda.url, detail: "0.29 gal tank, up to 60 minutes at full throttle" },
            { name: "EIA gasoline prices", url: FUEL_PRICES.gasUrl, detail: `regular, week of ${formatDate(FUEL_PRICES.gasWeek)}` },
            { name: "EIA average residential electricity price", url: FUEL_PRICES.electricUrl, detail: FUEL_PRICES.electricMonth },
            { name: ELECTRIC_PONTOON.name, url: ELECTRIC_PONTOON.url },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/boating", label: "Electric boating and fishing", desc: "Every guide in one place" },
            { href: "/charge-lithium-battery-on-boat", label: "Charging a lithium battery on a boat", desc: "Chargers, alternators and solar" },
            { href: "/trolling-motor-battery-life", label: "Trolling motor runtime calculator", desc: "Hours for your motor and battery" },
            { href: "/ev-charging-cost", label: "EV charging cost", desc: "The same savings, on the road" },
          ]}
        />
        <p className="text-sm text-muted mt-6">
          Power prices vary a lot by state; see yours on its <Link href="/states" className="underline">state page</Link>.
        </p>
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
