import type { Metadata } from "next";
import Link from "next/link";
import { DealsStrip } from "@/components/DealsStrip";
import { AffiliateDisclosure } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import IWantTo from "@/components/IWantTo";
import { Icon } from "@/components/icons";
import { BigStat, HubHero, PhotoCredit } from "@/components/ui";
import { EBIKES, EBIKES_CHECKED } from "@/data/ebikes";
import { EBIKE_GOALS } from "@/data/hubs";
import { NATIONAL, formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import {
  AAA_CENTS_PER_MILE,
  AAA_FUEL_CENTS_PER_MILE,
  EBIKE_CENTS_PER_MILE,
  EBIKE_FACTS_CHECKED,
  EBIKE_KWH_PER_100MI,
  EBIKE_PROGRAMS,
  EBIKE_SOURCES,
  SHORT_TRIP_SHARE,
} from "@/lib/ebikes";
import { pageMetadata } from "@/lib/seo";

const PATH = "/e-bikes";
const TITLE = "E-Bikes: How to Choose One, What It Costs to Ride, and 2026 Rebates";
const DESCRIPTION =
  "How to choose an e-bike: range, motor, weight limit and class 1, 2 or 3 rules. What a mile costs against a car, which state rebates are open in 2026, and battery safety.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const GUIDES = [
  { href: "/commuter-e-bike-under-1500", title: "Commuter e-bike under $1,500", desc: "Racks, lights and fenders in the box", icon: "bike" },
  { href: "/e-bike-for-hills", title: "E-bike for hills", desc: "Torque, mid-drives and torque sensors", icon: "bolt" },
  { href: "/e-bike-for-heavy-riders", title: "E-bike for heavy riders", desc: "400 to 450 lb rated bikes", icon: "check" },
  { href: "/folding-e-bike", title: "Folding e-bike", desc: "For apartments, RVs and trunks", icon: "home" },
];

export default function EbikesHubPage() {
  const cheapest = Math.min(...EBIKES.map((b) => b.price));
  const tenMileDay = (EBIKE_CENTS_PER_MILE * 10 * 250) / 100;
  const gasTenMileDay = (AAA_FUEL_CENTS_PER_MILE * 10 * 250) / 100;
  const whs = EBIKES.map((b) => b.batteryWh).filter((x): x is number => x != null);
  const lbs = EBIKES.map((b) => b.weightLb).filter((x): x is number => x != null);
  const open = EBIKE_PROGRAMS.filter((p) => p.open);
  const closed = EBIKE_PROGRAMS.filter((p) => !p.open);

  const faqs = [
    {
      q: "How much does it cost to charge an e-bike?",
      a: `About ${EBIKE_CENTS_PER_MILE.toFixed(1)} cents a mile at the US average home electricity price of ${NATIONAL.residentialCentsPerKwhYtd.toFixed(1)} cents per kWh, using Efficiency Vermont's measured average of ${EBIKE_KWH_PER_100MI} kWh per 100 miles. A 10-mile round trip costs about 2 cents. Faster riding uses more, and a charger left plugged in all the time adds standby use.`,
    },
    {
      q: "Is there a federal tax credit for e-bikes?",
      a: "No. The E-BIKE Act, which would have given a 30% credit up to $1,500, was introduced in 2021 and 2023 and never passed. Savings now come from state and city programs, such as Colorado's $225 discount at the register and Washington's $300 to $1,200 rebate.",
    },
    {
      q: "What is the difference between class 1, 2 and 3 e-bikes?",
      a: "Class 1 helps only while you pedal and stops at 20 mph. Class 2 has a throttle that can move the bike without pedaling, also up to 20 mph. Class 3 helps only while you pedal, up to 28 mph. All three have a motor of no more than 750 W under the federal definition. States set where each class can ride, so check yours.",
    },
    {
      q: "How far can an e-bike go on a charge?",
      a: "Makers quote 35 to 100 miles for the bikes we link to, usually at the lowest assist level with a light rider on flat ground. Hills, wind, a heavier load and higher assist all shorten it. Compare battery size in watt-hours (Wh) for a fairer picture: more Wh means more range on the same bike.",
    },
    {
      q: "Are e-bike batteries safe?",
      a: "Charging is the risky time: in the CPSC's 2017 to 2024 data, 62 of 106 e-bike fire incidents it looked at began while the bike was charging. Buy a bike whose electrical system is certified to UL 2849, use only the maker's charger, and be home and awake while it charges.",
    },
  ];

  return (
    <article>
      <HubHero
        image="ebike"
        crumbs={[{ name: "E-bikes", path: PATH }]}
        eyebrow="E-bikes"
        title={<>Half of car trips are under 6 miles. <span className="text-amber-300">An e-bike does them for pennies.</span></>}
        sub={<>How to pick one that fits your ride, what it costs per mile against a car, and which rebates are open where you live.</>}
        after={
          <IWantTo
            more
            goals={EBIKE_GOALS.map((g) => (g.href === "/e-bikes#rebates" ? { ...g, href: "#rebates" } : g))}
          />
        }
      />
      <DealsStrip />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <section aria-label="E-bike vs car" className="grid sm:grid-cols-3 gap-3">
          <BigStat tone="leaf" value={`${EBIKE_CENTS_PER_MILE.toFixed(1)}¢`} label="Electricity per e-bike mile" note={`At the US average ${NATIONAL.residentialCentsPerKwhYtd.toFixed(1)}¢ per kWh (our estimate)`} />
          <BigStat value={`${AAA_FUEL_CENTS_PER_MILE}¢`} label="Gas per car mile" note={`AAA 2026; ${AAA_CENTS_PER_MILE}¢ a mile counting everything`} />
          <BigStat tone="orange" value={`${SHORT_TRIP_SHARE}%`} label="Of US car trips are under 6 miles" note="2022 National Household Travel Survey" />
        </section>

        <QuickAnswer title="Does an e-bike make sense for you?">
          <p>
            If many of your trips are short, almost certainly. Riding 10 miles a workday for a year takes about{" "}
            {money(Math.round(tenMileDay))} of electricity; the same miles in a car burn about {money(Math.round(gasTenMileDay))} of gas at AAA&apos;s
            2026 fuel cost per mile, before wear, parking and tolls. An e-bike won&apos;t replace a car for everyone, but it can take over most short
            drives, and for some households the second car.
          </p>
          <p>
            Bikes from the brands we link to start at {money(cheapest)} when we checked. Pick by the job:{" "}
            <Link href="#guides" className="underline">commuting, hills, a heavier rider or folding</Link>.
          </p>
        </QuickAnswer>

        <Section title="Find the right e-bike for your ride" id="guides">
          <ul className="grid sm:grid-cols-2 gap-4">
            {GUIDES.map((g) => (
              <li key={g.href}>
                <Link href={g.href} className="group flex items-start gap-3 h-full rounded-2xl bg-white border border-black/8 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-spark-orange mt-0.5"><Icon name={g.icon} size={24} /></span>
                  <span>
                    <span className="block font-extrabold text-ink">{g.title}</span>
                    <span className="block text-sm text-stone-600 mt-0.5">{g.desc}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted mt-3 max-w-3xl">
            Each guide compares only bikes whose specs we read on the maker&apos;s own site on {formatDate(EBIKES_CHECKED)}, and names a bike from
            another brand when it is the better pick. We have not ridden these bikes.
          </p>
        </Section>

        <Section title="How to choose" id="choose">
          <div className="grid gap-3">
            <Callout>
              <strong>Range: look at the battery in Wh.</strong> Makers&apos; mileage claims are best-case. Watt-hours (volts × amp-hours) let you
              compare like with like; the bikes we link to carry {Math.min(...whs).toLocaleString("en-US")} to {Math.max(...whs).toLocaleString("en-US")} Wh.
            </Callout>
            <Callout>
              <strong>Motor: torque matters more than watts.</strong> Torque (Nm) is the push that gets you up hills and away from stops. A torque
              sensor adds help in proportion to how hard you pedal, which feels more natural than a cadence sensor.{" "}
              <Link href="/e-bike-for-hills" className="underline">More on hills</Link>.
            </Callout>
            <Callout>
              <strong>Weight limit: read both numbers.</strong> Makers state a maximum load (rider plus cargo); some also state a lower rider limit.{" "}
              <Link href="/e-bike-for-heavy-riders" className="underline">More for heavier riders</Link>.
            </Callout>
            <Callout>
              <strong>Bike weight: e-bikes are heavy.</strong> The bikes we link to weigh {Math.min(...lbs)} to {Math.max(...lbs)} lb. If you carry it upstairs, weight
              matters more than features.
            </Callout>
          </div>
        </Section>

        <Section title="Class 1, 2 and 3: where you can ride" id="classes">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[32rem]">
              <caption className="sr-only">E-bike classes</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Class</th>
                  <th scope="col" className="p-3 font-semibold">Motor helps</th>
                  <th scope="col" className="p-3 font-semibold">Stops helping at</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-black/6"><th scope="row" className="p-3">Class 1</th><td className="p-3">Only while you pedal</td><td className="p-3">20 mph</td></tr>
                <tr className="border-t border-black/6"><th scope="row" className="p-3">Class 2</th><td className="p-3">Throttle, with or without pedaling</td><td className="p-3">20 mph</td></tr>
                <tr className="border-t border-black/6"><th scope="row" className="p-3">Class 3</th><td className="p-3">Only while you pedal</td><td className="p-3">28 mph</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-3xl">
            All three have a motor of no more than 750 W under the federal definition. More than 40 states use this three-class system
            (PeopleForBikes counted 43 in 2024), and each state decides where each class may ride. Class 3 often has extra rules: in California, for
            example, riders must be 16 or older and wear a helmet, and many local multi-use trails don&apos;t allow class 3. Many bikes let you set
            the top speed, so you can match your local rules. Check your state and city before you buy. Wear a bike helmet on every ride; the CPSC recommends one for all e-bike riders. Look for UL 2849 certification of the whole electrical system, and charge only with the maker&apos;s charger, while you&apos;re awake and nearby.
          </p>
        </Section>

        <Section title="E-bike rebates in 2026" id="rebates">
          <p className="max-w-3xl">
            <strong>There is no federal e-bike tax credit.</strong> The E-BIKE Act (a 30% credit up to $1,500) never passed. These state and city
            programs are what&apos;s left, with their status as their official pages showed it on {formatDate(EBIKE_FACTS_CHECKED)}:
          </p>
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface mt-4">
            <table className="w-full text-sm min-w-[40rem]">
              <caption className="sr-only">State and city e-bike programs, 2026</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Where</th>
                  <th scope="col" className="p-3 font-semibold">Amount</th>
                  <th scope="col" className="p-3 font-semibold">Who qualifies</th>
                  <th scope="col" className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...open, ...closed].map((p) => (
                  <tr key={p.place} className="border-t border-black/6 align-top">
                    <th scope="row" className="p-3 font-medium">
                      <a href={p.url} rel="noopener" target="_blank" className="underline underline-offset-2">{p.place}</a>
                      <span className="block text-xs font-normal text-muted">{p.name}</span>
                    </th>
                    <td className="p-3">{p.amount}</td>
                    <td className="p-3">{p.who}</td>
                    <td className={`p-3 ${p.open ? "text-leaf font-medium" : "text-muted"}`}>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted mt-2 max-w-3xl">
            Programs change and run out of funds. Confirm on the program&apos;s own page before you buy; several pay only at participating shops.
            Your utility may run its own; <Link href="/incentives" className="underline">our incentives page</Link> links every state&apos;s energy programs.
          </p>
        </Section>

        <Section title="Battery safety" id="safety">
          <div className="grid gap-3">
            <Callout>
              <strong>Look for UL 2849.</strong> It certifies the bike&apos;s whole electrical system (battery, charger, motor and controls together);
              UL 2271 covers the battery pack alone. New York City has required UL 2849 for e-bikes sold there since September 2023.
            </Callout>
            <Callout>
              <strong>Charge with care.</strong> The CPSC says be present while charging, never charge while you sleep or are away, and use only the
              maker&apos;s charger and approved batteries. In its 2017 to 2024 data, 62 of 106 e-bike fire incidents started while charging. A
              mandatory federal battery standard was proposed in June 2026 and is not final.
            </Callout>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Cost per mile is our arithmetic from the sources below. Bike specs and prices are from makers&apos; US websites on {formatDate(EBIKES_CHECKED)};
          we have not ridden these bikes. Some bike links on the guides earn us a commission.
        </Disclaimer>
        <Sources items={[...Object.values(EBIKE_SOURCES), ...EBIKE_PROGRAMS.map((p) => ({ name: `${p.place}: ${p.name}`, url: p.url }))]} />
        <RelatedLinks
          links={[
            { href: "/go-electric", label: "Go Electric planner", desc: "What every switch saves in your state" },
            { href: "/ev-charging-cost", label: "EV charging cost", desc: "For the trips a bike can't do" },
            { href: "/incentives", label: "2026 incentives", desc: "State energy programs" },
          ]}
        />
        <PhotoCredit name="ebike" />
      </div>
    </article>
  );
}
