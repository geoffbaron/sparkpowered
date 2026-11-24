import type { Metadata } from "next";
import Link from "next/link";
import Byline from "@/components/Byline";
import { ArticleJsonLd } from "@/components/article-jsonld";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { MotorStartDiagram } from "@/components/backup-diagrams";
import { Breadcrumbs, Callout, Disclaimer, Faq, RelatedLinks, Section } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { ElectricianRule, HomeBackupLinks, WhatWeChecked } from "@/components/home-backup";
import { sources } from "@/data/backup-sources";
import { HOME_BACKUP_HUB } from "@/data/home-backup";
import { FRIDGE_RECS } from "@/lib/backup-math";
import { LOADS, USABLE_FRACTION } from "@/lib/everyday";
import { pumpLoad, pumpMotor } from "@/lib/offgrid";
import { productById } from "@/lib/products";
import { pageMetadata, pageUpdated } from "@/lib/seo";

const PATH = "/home-backup/anker-solix-f3800-plus-hookup";
const TITLE = "Anker F3800 Plus Home Hookup: Switch, Inlet or Panel";
const DESCRIPTION =
  "How to connect an Anker SOLIX F3800 Plus to your house: its L14-30R outlet, which Anker transfer switch fits one unit, an inlet box and interlock, the Home Power Panel, the bonded-neutral question and what it will run, from Anker's manual.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

/** Anker F3800 Plus user manual A1790P (May 2025), PDF pages 6, 14 and 15. */
const F = { wh: 3840, l1430W: 6000, l1430A: 25, tt30W: 3000, group520W: 2400, lra: 80, upsMs: 20, acInW: 1800, solarW: 3200, gen240W: 3300 };

const link = "text-spark-orange underline underline-offset-2";

export default function F3800PlusHookup() {
  const updated = pageUpdated(PATH);
  const f = productById("anker-solix-f3800-plus");
  const n = (x: number) => Math.round(x).toLocaleString("en-US");

  // Worked example: the essentials day plus an hour of a 1/2 HP, 230 V well pump.
  const pump = pumpMotor("1-2hp-230v-3w");
  const pumpL = pumpLoad(pump);
  const essentialsWh = FRIDGE_RECS.mostUsedWhDay + LOADS.routerW * 24 + 4 * LOADS.ledW * 5 + 2 * LOADS.phoneChargeWh;
  const pumpWh = pumpL.runW * 1;
  const dayWh = essentialsWh + pumpWh;
  const usable = F.wh * USABLE_FRACTION;
  const hours = Math.round((usable / dayWh) * 24);

  const faqs = [
    {
      q: "Can I connect an Anker F3800 Plus to a transfer switch without the Home Power Panel?",
      a: `Yes. Anker's manual says to connect the F3800 Plus to your inlet box or transfer switch through its L14-30R outlet (120/240 V, up to ${n(F.l1430W)} W), and that the neutral and ground wires of the inlet box or switch must be properly connected. A licensed electrician installs the inlet or switch, with a permit.`,
    },
    {
      q: "Which Anker transfer switch fits one F3800 Plus?",
      a: "The 30 A version of Anker's 10-circuit manual transfer switch: its option list reads \"For F3800 Plus & 2x F3000\" and it comes with a 30 A cable. The 50 A version says \"Not Suitable for Single F3800 Plus\"; it is for the original F3800 or two Plus units on Anker's hub. Both are a Pro/Tran 2 switch listed to UL 1008, and Anker says its switch is for indoor use only.",
    },
    {
      q: "Is the F3800 Plus neutral bonded or floating?",
      a: "Anker's manual doesn't say. Owners on DIY Solar Forum quote Anker support saying in April 2025 that the Plus was bonded and to leave the ground wire off, then in July 2025 that all units are configured floating by default, with early units built bonded. Ask Anker in writing about your serial number and give the answer to your electrician before any wiring.",
    },
    {
      q: "Can an Anker F3800 Plus run a central air conditioner?",
      a: `Only a small one, and only if its start is within the station's limit. Anker's manual gives the F3800 Plus a locked rotor amps (LRA) limit of ${F.lra} A and says you will need a soft starter if your air conditioner needs more. Find the LRA on the condenser's nameplate. Running watts must also stay under ${n(F.l1430W)} W along with everything else on.`,
    },
    {
      q: "Can I charge the F3800 Plus while it powers my house?",
      a: `Not from a 120 V wall outlet: Anker's manual says that while it charges from 120 V, only its three 120 V UPS outlets work, not the 240 V outlet. It can keep its L14-30R and TT-30R live while charging from a 240 V generator through Anker's adapter (up to ${n(F.gen240W)} W), or from solar (up to ${n(F.solarW)} W across two inputs).`,
    },
    {
      q: "Does the F3800 Plus switch over automatically in an outage?",
      a: `Only with Anker's Home Power Panel, which switches by itself and backs up its subpanel circuits at 25 A with one unit. With an inlet box and interlock or a manual transfer switch, you flip it over by hand. The ${F.upsMs} ms UPS figure in the manual applies to devices plugged into the station's own outlets.`,
    },
  ];

  return (
    <article>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} published="2026-11-14" modified={updated} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[HOME_BACKUP_HUB, { name: "Anker SOLIX F3800 Plus hookup", path: PATH }]} />
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-2">Home backup</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">Anker SOLIX F3800 Plus: connecting it to your house</h1>
        <Byline path={PATH} />

        <QuickAnswer>
          <p>
            <strong>Use its L14-30R outlet</strong> (120/240 V, {F.l1430A} A, up to {n(F.l1430W)} W) into one of three things a licensed
            electrician installs with a permit: a 30 A inlet box with an interlock on your panel, <strong>the 30 A version</strong> of
            Anker&apos;s 10-circuit transfer switch (the 50 A one is labeled not for a single Plus), or Anker&apos;s Home Power Panel, the only
            one that switches over by itself.
          </p>
          <p>
            Before any wiring, get Anker&apos;s written answer on whether <strong>your</strong> unit&apos;s neutral is bonded or floating. Owners
            report Anker has given both answers.
          </p>
        </QuickAnswer>

        <ElectricianRule className="mt-6" />

        <Section title="The numbers from Anker's manual" id="specs">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[36rem]">
              <caption className="sr-only">Anker SOLIX F3800 Plus outlets and limits from its user manual</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">What</th>
                  <th scope="col" className="p-3 font-semibold">Manual says</th>
                  <th scope="col" className="p-3 font-semibold">Why it matters</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">L14-30R outlet</th>
                  <td className="p-3">120/240 V, {F.l1430A} A, {n(F.l1430W)} W max</td>
                  <td className="p-3">The only outlet for an inlet box or transfer switch; 240 V for a well pump</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">TT-30R outlet</th>
                  <td className="p-3">120 V, {F.l1430A} A, {n(F.tt30W)} W max</td>
                  <td className="p-3">RV-style plug; 120 V circuits only</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">5-20R outlets</th>
                  <td className="p-3">Two groups of three, {n(F.group520W)} W per group</td>
                  <td className="p-3">For cords straight to the fridge or lamps</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">Total output</th>
                  <td className="p-3">{n(F.l1430W)} W</td>
                  <td className="p-3">Everything on at once must stay under this</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">Motor start (LRA)</th>
                  <td className="p-3">{F.lra} A</td>
                  <td className="p-3">Compare with the locked rotor amps on a pump or AC nameplate</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">Capacity</th>
                  <td className="p-3">{n(F.wh)} Wh</td>
                  <td className="p-3">Sets how long it lasts; expands with Anker&apos;s add-on batteries</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">Recharging in an outage</th>
                  <td className="p-3">Solar {n(F.solarW)} W; 240 V generator {n(F.gen240W)} W</td>
                  <td className="p-3">From 120 V the 240 V outlet is off while charging</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Anker SOLIX F3800 Plus user manual A1790P (May 2025), PDF pages 6, 7, 14 and 15. Anker doesn&apos;t publish a separate surge figure;
            the LRA limit is the one it gives for motors.
          </p>
        </Section>

        <Section title="Three ways to wire it in" id="options">
          <div className="grid gap-3">
            <Callout>
              <strong>Inlet box + interlock.</strong> A 30 A L14-30 inlet outside, cord from the L14-30R, and an interlock kit made for your
              panel. You can reach any breaker, so you keep the total under {n(F.l1430W)} W yourself. Square D says its kits are listed only in
              its own panels.
            </Callout>
            <Callout>
              <strong>Anker&apos;s 10-circuit manual transfer switch, 30 A.</strong> A Pro/Tran 2 switch, UL 1008. Ten circuits wired to it, one
              switch each, so it&apos;s hard to overload. Don&apos;t buy the 50 A version for one Plus: Anker labels it &quot;Not Suitable for
              Single F3800 Plus.&quot; Anker says its switch is for indoor use only.
            </Callout>
            <Callout>
              <strong>Anker Home Power Panel.</strong> Switches over by itself and backs up its subpanel at 25 A with one unit, 50 A with two.
              It is the only option here that ties in rooftop solar. Anker says a licensed electrician is required and the panel suits 120/240 V
              split-phase homes only, not 120/208 V.
            </Callout>
          </div>
          <p className="text-stone-700 mt-4 max-w-3xl">
            Already have a generator inlet and switch? Anker says the F3800 works with them, provided the neutral and ground at the inlet or switch
            are properly connected. The plug has to match: the Plus has an L14-30R, not a 14-50R.
          </p>
        </Section>

        <Section title="The neutral question, from owners" id="neutral">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              This is where F3800 Plus owners have had trouble. On DIY Solar Forum, an owner with an F3800 and an F3800 Plus on Anker&apos;s hub
              found both outputs bonded neutral-to-ground, and quoted Anker support telling him to leave the ground wire off. In a second thread,
              Anker later told owners all Plus units are configured floating by default, with early units built bonded. Anker&apos;s May 2025 manual
              doesn&apos;t mention bonding at all.
            </p>
            <p>
              Why it matters: the owner quotes Anker support calling its own switch &quot;the Floating TS type&quot;, built for a station with a
              floating neutral. A bonded station on a switch that doesn&apos;t switch the neutral gives the house two neutral-to-ground bonds, and
              Generac says that loop is what makes GFCIs trip. The{" "}
              <Link href="/home-backup#neutral" className={link}>home backup guide</Link> explains it with a diagram.
            </p>
            <p>
              <strong>What to do:</strong> email Anker support with your serial number, ask &quot;is the L14-30R output neutral bonded to ground or
              floating?&quot;, and give the written answer to your electrician. Don&apos;t remove a ground wire on a forum post&apos;s advice.
            </p>
          </div>
        </Section>

        <Section title="What it will run, and for how long" id="runtime">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              <strong>A 240 V well pump:</strong> a common {pump.hp} HP, 230 V 3-wire submersible draws up to {n(pumpL.runW)} W running and{" "}
              {pump.lockedRotorA} locked rotor amps starting (Franklin Electric&apos;s motor table). That is well inside the {F.lra} A limit in
              Anker&apos;s manual. Bigger pumps are on our <Link href="/home-backup/well-pump" className={link}>well pump page</Link>.
            </p>
          </div>
          <MotorStartDiagram runW={pumpL.runW} startW={pumpL.startTotalW} limitW={F.lra * 240} limitLabel={`F3800 Plus limit (${F.lra} A × 240 V)`} />
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              <strong>Worked example, one day:</strong> a kitchen fridge ({n(FRIDGE_RECS.mostUsedWhDay)} Wh, EIA), Wi-Fi all day, four LED bulbs
              for 5 hours and two phone charges come to about {n(essentialsWh)} Wh. Add one hour of that well pump ({n(pumpWh)} Wh) and the day is
              about {n(dayWh)} Wh. With about {Math.round(USABLE_FRACTION * 100)}% of {n(F.wh)} Wh usable ({n(usable)} Wh), one F3800 Plus lasts about{" "}
              <strong>{hours} hours</strong> before it needs solar, a generator or the grid.
            </p>
            <p>
              Try your own list in the{" "}
              <Link href="/power-outage-backup-calculator" className={link}>power outage backup calculator</Link>.
            </p>
          </div>
        </Section>

        <Section title="Where to check stock" id="buy">
          <AffiliateDisclosure className="mb-4" />
          <p className="text-stone-700 max-w-3xl">
            Anker&apos;s product page has today&apos;s price and stock:{" "}
            <PartnerLink brand="anker" productId={f.id} productUrl={f.url} disclose>
              Anker SOLIX F3800 Plus
            </PartnerLink>
            . Budget for the electrician and permit too.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />

        <HomeBackupLinks exclude={PATH} />
        <RelatedLinks
          links={[
            { href: HOME_BACKUP_HUB.path, label: "Connect a power station safely", desc: "Cords, interlock, transfer switch or smart panel" },
            { href: "/home-backup/bluetti-apex-300-hookup", label: "Bluetti Apex 300 hookup", desc: "The other 240 V unit: 16 A on battery" },
            { href: "/home-backup/well-pump", label: "Well pump on a battery", desc: "Starting watts from your pump's motor" },
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "How much battery your outage needs" },
          ]}
        />
        <Disclaimer>
          General information, not electrical advice. Codes and what inspectors accept differ by city and county. Specifications are from
          Anker&apos;s manual and support pages on the dates shown.
        </Disclaimer>
        <WhatWeChecked
          className="mt-14"
          untested="the F3800 Plus, the Home Power Panel or Anker's transfer switch"
          items={sources(
            "ankerManual",
            "ankerTopQs",
            "ankerSameSwitch",
            "ankerWeatherproof",
            "ankerMts30",
            "ankerMts50",
            "ankerHpp",
            "forumF3800Unsafe",
            "forumF3800Bonding",
            "forumF3800Hpp",
            "generacGfci",
            "squareDOtherBrand",
            "franklinAim",
            "eiaRecs53b",
            "cpsc",
            "osha",
          )}
        />
      </div>
    </article>
  );
}
