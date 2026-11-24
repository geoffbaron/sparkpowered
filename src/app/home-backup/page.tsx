import type { Metadata } from "next";
import Link from "next/link";
import Byline from "@/components/Byline";
import { ArticleJsonLd } from "@/components/article-jsonld";
import { HookupMethodsDiagram, NeutralDiagram } from "@/components/backup-diagrams";
import { Breadcrumbs, Callout, Disclaimer, Faq, RelatedLinks, Section } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { ElectricianRule, HomeBackupLinks, WhatWeChecked } from "@/components/home-backup";
import { sources } from "@/data/backup-sources";
import { HOME_BACKUP_HUB } from "@/data/home-backup";
import { FRIDGE_RECS } from "@/lib/backup-math";
import { LOADS, USABLE_FRACTION } from "@/lib/everyday";
import { pageMetadata, pageUpdated } from "@/lib/seo";

const PATH = HOME_BACKUP_HUB.path;
const TITLE = "Connect a Power Station to Your House Safely";
const DESCRIPTION =
  "Cords, an inlet box with an interlock, a manual transfer switch, or the maker's panel: what each one powers, what the NEC asks for, the bonded-neutral trap, and which jobs need a licensed electrician.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const link = "text-spark-orange underline underline-offset-2";

export default function HomeBackupHub() {
  const updated = pageUpdated(PATH);
  // Worked example: one kitchen fridge (EIA), Wi-Fi all day, 4 LED bulbs for 5 hours, 2 phone charges.
  const fridgeWh = FRIDGE_RECS.mostUsedWhDay;
  const routerWh = LOADS.routerW * 24;
  const ledWh = 4 * LOADS.ledW * 5;
  const phoneWh = 2 * LOADS.phoneChargeWh;
  const dayWh = fridgeWh + routerWh + ledWh + phoneWh;
  const usable = 3840 * USABLE_FRACTION;
  const hours = Math.round((usable / dayWh) * 24);
  const n = (x: number) => Math.round(x).toLocaleString("en-US");

  const faqs = [
    {
      q: "Can I connect a portable power station to my house?",
      a: "Yes, through equipment that keeps it off the utility lines: an inlet box with an interlock kit, a manual transfer switch, or the maker's own smart panel. A licensed electrician installs any of them, with a permit. The station also needs a 30 A or 50 A outlet (L14-30R, 14-50R or TT-30R) or the maker's panel port. Without that, run appliances on extension cords plugged straight into the station.",
    },
    {
      q: "Can I plug a power station into a wall outlet to power my house?",
      a: "No. That is backfeeding, and a two-plug cord into a dryer or range outlet is the same thing. CPSC says never to power house wiring that way: power can flow out to the utility lines and endanger line workers and neighbors, and it bypasses your home's circuit protection.",
    },
    {
      q: "Do I need a transfer switch for a portable power station?",
      a: "For anything wired into the house, you need transfer equipment: a transfer switch, a listed interlock where your inspector accepts one, or the maker's panel. NEC 702.5 requires it so the battery and the grid can never be connected at the same time. For a fridge or a lamp on a cord, you don't.",
    },
    {
      q: "Interlock kit or transfer switch: which is better?",
      a: "An interlock lets you run any breaker in your panel, but you have to keep the total under what the station can deliver. A manual transfer switch limits you to the 6 or 10 circuits wired to it, which makes it hard to overload. Ask your electrician which your inspector accepts before you buy parts.",
    },
    {
      q: "Is a generator interlock kit legal?",
      a: "In many places, yes, if it is made for your exact panel and installed with a permit. Square D says its kits are listed as part of the panel's own UL 67 listing and are not listed in another brand's panel. The 2026 NEC draft names an \"interlocking device\" alongside transfer equipment in 702.5. Your local inspector has the final word.",
    },
    {
      q: "Can I use my generator's inlet box and transfer switch with a power station?",
      a: "Often, yes. Anker says the F3800 works with a home transfer switch or inlet box, as long as the neutral and ground wires are properly connected. Check two things first: that the station's outlet matches the inlet (30 A L14-30 or 50 A), and whether the station's neutral is bonded or floating, because many switches don't switch the neutral.",
    },
    {
      q: "Is there an automatic transfer switch for a portable power station?",
      a: "Yes, from the makers: Anker's Home Power Panel for the F3800 Plus and Bluetti's AT1 for the Apex 300 switch over by themselves when the grid fails. Each needs a licensed electrician.",
    },
  ];

  return (
    <article>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} published="2026-11-14" modified={updated} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[HOME_BACKUP_HUB]} />
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-2">Home backup</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">How to connect a power station to your house, safely</h1>
        <Byline path={PATH} />

        <QuickAnswer>
          <p>
            <strong>There are four safe ways.</strong> Plug appliances into the station with extension cords (no electrician). Or have a
            licensed electrician install, with a permit, one of three: an <strong>inlet box with an interlock</strong> on your panel, a{" "}
            <strong>manual transfer switch</strong>, or the <strong>maker&apos;s smart panel</strong>.
          </p>
          <p>
            <strong>One way is never safe:</strong> a two-plug cord into a wall or dryer outlet. That is backfeeding (CPSC). Before you pick,
            check two things: whether your station has a 30 A or 50 A outlet, and whether its neutral is bonded or floating.
          </p>
        </QuickAnswer>

        <HookupMethodsDiagram />

        <ElectricianRule className="mt-2" />

        <Section title="The four ways, side by side" id="options">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[46rem]">
              <caption className="sr-only">Extension cords, inlet box with interlock, manual transfer switch and smart panel compared</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold w-1/5"></th>
                  <th scope="col" className="p-3 font-semibold">Cords</th>
                  <th scope="col" className="p-3 font-semibold">Inlet box + interlock</th>
                  <th scope="col" className="p-3 font-semibold">Manual transfer switch</th>
                  <th scope="col" className="p-3 font-semibold">Maker&apos;s smart panel</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">What it powers</th>
                  <td className="p-3">Plug-in appliances only</td>
                  <td className="p-3">Any breaker you turn on</td>
                  <td className="p-3">The 6 or 10 circuits wired to it</td>
                  <td className="p-3">Circuits moved to its subpanel</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Furnace, well pump</th>
                  <td className="p-3">No (they are wired in)</td>
                  <td className="p-3">Yes</td>
                  <td className="p-3">Yes, if on the switch</td>
                  <td className="p-3">Yes, if on the subpanel</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Switching</th>
                  <td className="p-3">Unplug, replug</td>
                  <td className="p-3">By hand: main off, plate over, backup breaker on</td>
                  <td className="p-3">By hand, one switch per circuit</td>
                  <td className="p-3">Automatic</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Overload risk</th>
                  <td className="p-3">Low</td>
                  <td className="p-3">Highest: you manage the load</td>
                  <td className="p-3">Low</td>
                  <td className="p-3">Low</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Listing to ask for</th>
                  <td className="p-3">Outdoor cords rated for the load (OSHA, CPSC)</td>
                  <td className="p-3">A kit made for your panel model (UL 67)</td>
                  <td className="p-3">UL 1008</td>
                  <td className="p-3">The maker&apos;s own</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium text-stone-700">Electrician + permit</th>
                  <td className="p-3">No</td>
                  <td className="p-3"><strong>Yes</strong></td>
                  <td className="p-3"><strong>Yes</strong></td>
                  <td className="p-3"><strong>Yes</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-stone-700 mt-3 max-w-3xl">
            Not sure which fits? The <Link href="/home-backup/hookup-picker" className={link}>hookup picker</Link> asks five questions and names
            the method and parts. We don&apos;t list prices; your electrician&apos;s quote is the number that counts.
          </p>
        </Section>

        <Section title="What the electrical code asks for" id="code">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              A backup source you choose to add is an <strong>optional standby system</strong> in the National Electrical Code (NEC), Article
              702. Three rules matter for a power station:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>702.5, transfer equipment.</strong> Connecting a standby source to house wiring needs listed transfer or interconnection
                equipment, installed so the grid and the battery can never be connected at once (Mike Holt&apos;s summary in EC&amp;M). The 2026
                draft adds &quot;interlocking device&quot; to that list by name, which is part of why inspectors have differed on interlocks.
              </li>
              <li>
                <strong>702.4, load.</strong> With manual transfer equipment, &quot;the user of the optional standby system shall be permitted to
                select the load&quot; (2023 draft text). That is what lets a battery smaller than your house sit on an interlock: you decide what runs.
              </li>
              <li>
                <strong>The inlet sign.</strong> The code asks for a warning sign at a power inlet saying which kind of source may plug in: one with a
                bonded neutral or one with a floating neutral (702.7 in the 2014 edition). Article 445 asks generator makers to mark which kind theirs is.
              </li>
            </ul>
            <p>
              These articles were written for generators and don&apos;t name power stations. Your inspector decides how they apply, so ask before
              buying parts. OSHA&apos;s rule is plainer: a transfer switch installed by a qualified electrician.
            </p>
          </div>
        </Section>

        <Section title="The neutral question" id="neutral">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              Your house bonds neutral to ground once, in the main panel. Some batteries and generators bond them inside the unit too. Many
              manual transfer switches don&apos;t switch the neutral, so a bonded unit gives you two bonds. Generac says that loop induces a small
              current a GFCI picks up, and its manual switch needs a Switched Neutral Kit for a bonded generator with a GFCI-protected 240 V outlet.
            </p>
          </div>
          <NeutralDiagram />
          <Callout>
            <strong>Owners have hit this.</strong> On DIY Solar Forum, F3800 Plus owners report Anker support first telling them the unit was
            bonded and to leave the ground wire off, and later saying all units ship floating. Get the maker&apos;s answer for your unit in
            writing and hand it to your electrician. Our{" "}
            <Link href="/home-backup/anker-solix-f3800-plus-hookup" className="underline underline-offset-2">F3800 Plus</Link> and{" "}
            <Link href="/home-backup/bluetti-apex-300-hookup" className="underline underline-offset-2">Apex 300</Link> pages cover each one.
          </Callout>
        </Section>

        <Section title="Which outlet feeds which inlet" id="plugs">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[40rem]">
              <caption className="sr-only">Station outlets and the inlet boxes they feed</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Station outlet</th>
                  <th scope="col" className="p-3 font-semibold">Voltage</th>
                  <th scope="col" className="p-3 font-semibold">Feeds</th>
                  <th scope="col" className="p-3 font-semibold">Example</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">L14-30R (30 A)</th>
                  <td className="p-3">120/240 V</td>
                  <td className="p-3">A 30 A, L14-30 inlet box (such as Reliance PB30) or a 30 A transfer switch</td>
                  <td className="p-3">Anker F3800 Plus: 25 A, up to 6,000 W on this outlet (manual)</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">14-50R (50 A)</th>
                  <td className="p-3">120/240 V</td>
                  <td className="p-3">A 50 A inlet; Reliance says its PB50 must be used with a transfer switch</td>
                  <td className="p-3">Bluetti Apex 300: 16 A at 240 V on battery (manual)</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">TT-30R (30 A)</th>
                  <td className="p-3">120 V only</td>
                  <td className="p-3">120 V circuits only: no 240 V well pump or dryer</td>
                  <td className="p-3">F3800 Plus (3,000 W); Apex 300 (30 A at its 120 V setting)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-stone-700 mt-3 max-w-3xl">
            A bigger outlet doesn&apos;t mean more power. The Apex 300&apos;s 50 A outlet gives 16 A at 240 V from the battery; the 50 A applies
            only when grid or generator power passes through it. Never use a homemade adapter cord to make a plug fit.
          </p>
        </Section>

        <Section title="How long will it last? A worked example" id="example">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>A 3,840 Wh station (the F3800 Plus size) running the essentials:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Kitchen fridge: {n(fridgeWh)} Wh a day (EIA&apos;s average for a home&apos;s main fridge, {FRIDGE_RECS.mostUsedKwhYear} kWh a year)</li>
              <li>Wi-Fi router, all day: {n(routerWh)} Wh ({LOADS.routerW} W × 24 hours)</li>
              <li>Four 9 W LED bulbs for 5 hours: {n(ledWh)} Wh</li>
              <li>Two phone charges: {n(phoneWh)} Wh</li>
            </ul>
            <p>
              <strong>Total: about {n(dayWh)} Wh a day.</strong> Count on about {Math.round(USABLE_FRACTION * 100)}% of the rated capacity after
              inverter losses, {n(usable)} Wh. That is about <strong>{hours} hours</strong>. For scale, EIA says US customers averaged 11 hours
              without power in 2024, nearly 9 of them from major storms and other big events.
            </p>
            <p>
              Your list is different. Put it in the <Link href="/power-outage-backup-calculator" className={link}>power outage backup calculator</Link>;
              it adds the furnace blower, well pump and freezer, and checks starting watts too.
            </p>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />

        <HomeBackupLinks exclude={PATH} />
        <RelatedLinks
          links={[
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "How big a battery your outage needs" },
            { href: "/home-backup/hookup-picker", label: "Hookup picker", desc: "Five questions to the method and parts" },
            { href: "/home-backup/well-pump", label: "Well pump on a battery", desc: "Starting watts from your pump's motor" },
            { href: "/power-station-for-refrigerator", label: "Fridge and freezer through an outage", desc: "How long, and how to stretch it" },
          ]}
        />
        <Disclaimer>General information, not electrical advice. Codes and what inspectors accept differ by city and county.</Disclaimer>
        <WhatWeChecked
          className="mt-14"
          untested="any of these hookups"
          items={sources(
            "cpsc",
            "osha",
            "holtEcm",
            "nfpa2023Draft",
            "nfpa2026Draft",
            "holt2014",
            "squareDListing",
            "squareDOtherBrand",
            "interlockKit",
            "relianceProTran",
            "reliancePb30",
            "reliancePb50",
            "generacMts",
            "generacGfci",
            "generacBonded",
            "ankerManual",
            "ankerSameSwitch",
            "apexManual",
            "bluettiAt1",
            "forumF3800Unsafe",
            "forumF3800Bonding",
            "eiaRecs53b",
            "eiaOutages",
          )}
        />
      </div>
    </article>
  );
}
