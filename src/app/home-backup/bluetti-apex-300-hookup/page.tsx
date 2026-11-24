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
import { FRIDGE_RECS, apexHours } from "@/lib/backup-math";
import { LOADS } from "@/lib/everyday";
import { pumpLoad, pumpMotor } from "@/lib/offgrid";
import { productById } from "@/lib/products";
import { pageMetadata, pageUpdated } from "@/lib/seo";

const PATH = "/home-backup/bluetti-apex-300-hookup";
const TITLE = "Bluetti Apex 300 Hookup: AT1, Interlock or Switch";
const DESCRIPTION =
  "How to connect a Bluetti Apex 300 to your house: the AT1 panel, Bluetti's integration kit, an inlet with an interlock, or a manual transfer switch. Why its 50 A outlet gives 16 A on battery, what it can start, and the neutral question, from Bluetti's manual.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

/** BLUETTI Apex 300 user manual (US EN): pages 16, 18, 19, 22, 26 and 28. */
const A = { wh: 2764.8, maxWh: 19353.6, outW: 3840, liftW: 7680, amps240: 16, amps120: 32, bypassA: 50, tt30A: 30 };

const link = "text-spark-orange underline underline-offset-2";

export default function Apex300Hookup() {
  const updated = pageUpdated(PATH);
  const a = productById("bluetti-apex-300");
  const n = (x: number) => Math.round(x).toLocaleString("en-US");

  // Worked example with Bluetti's own run-time formula (manual page 28).
  const dayWh = FRIDGE_RECS.mostUsedWhDay + LOADS.routerW * 24 + 4 * LOADS.ledW * 5 + 2 * LOADS.phoneChargeWh;
  const avgW = dayWh / 24;
  const oneUnit = apexHours(A.wh, avgW);
  const withOne = apexHours(A.wh * 2, avgW);

  // A 1/2 HP, 230 V well pump against the 3,840 W limit (no motor surge figure published).
  const pump = pumpMotor("1-2hp-230v-3w");
  const pumpL = pumpLoad(pump);

  const faqs = [
    {
      q: "Does the Bluetti Apex 300 need the AT1 to connect to a house?",
      a: "No. Its 50 A NEMA 14-50R outlet can feed an inlet box with an interlock, a manual transfer switch, or Bluetti's Home Integration Kit, which pairs a Reliance subpanel and a 50 A inlet. The AT1 is Bluetti's automatic option, for up to three Apex 300 units. Every one of them is a job for a licensed electrician, with a permit.",
    },
    {
      q: "Does the Apex 300's 50 A outlet really give 50 amps?",
      a: `Only when grid or generator power is passing through it (bypass mode). On battery alone, Bluetti's manual rates the 14-50R at ${A.amps240} A at the 240 V setting and ${A.amps120} A at the 120 V setting. Both work out to its ${n(A.outW)} W limit. An owner on DIY Solar Forum measured no more than 16 A on either leg in 240 V mode.`,
    },
    {
      q: "Can one Apex 300 run a 240 V well pump?",
      a: `It can run a small one, but its spec doesn't confirm the start. A ${pump.hp} HP, 230 V pump draws up to ${n(pumpL.runW)} W running and about ${n(pumpL.startTotalW)} W for an instant at start (Franklin Electric). Bluetti publishes no motor surge figure: its ${n(A.liftW)} W \"Power Lifting\" is for heating loads only, and its FAQ warns motors may start at 2 to 4 times their rated power. Plan on a soft starter and confirm with Bluetti.`,
    },
    {
      q: "Is the Apex 300 neutral bonded or floating?",
      a: "Bluetti's manual doesn't say. Its own hookup guide says neutral bonding \"matters most\": some sources bond the neutral and others expect transfer equipment that switches it. Ask Bluetti support in writing and give the answer to your electrician before parts are bought.",
    },
    {
      q: "Can I use a 30 A inlet or transfer switch with the Apex 300?",
      a: "Its 240 V outlet is a 50 A 14-50R, while many generator switches use a 30 A L14-30 inlet. Bluetti's own kit uses a 50 A inlet and a 14-50 cord. Because the battery only delivers 16 A at 240 V, at least one owner on DIY Solar Forum feeds a 30 A switch, but the cord and inlet are your electrician's call. Never use a homemade adapter.",
    },
    {
      q: "Does the Apex 300 work as a whole-house UPS?",
      a: "Not by itself. Bluetti's manual gives 0 ms switchover only at the 240 V setting with the grid connected through its 15 A AC input, on specific outlets, and 20 ms otherwise. For house circuits that switch over by themselves, Bluetti sells the AT1 panel.",
    },
  ];

  return (
    <article>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} published="2026-11-14" modified={updated} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[HOME_BACKUP_HUB, { name: "Bluetti Apex 300 hookup", path: PATH }]} />
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-2">Home backup</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">Bluetti Apex 300: connecting it to your house</h1>
        <Byline path={PATH} />

        <QuickAnswer>
          <p>
            <strong>Feed the house from its 14-50R outlet</strong> through one of four things a licensed electrician installs with a permit:
            Bluetti&apos;s AT1 panel (automatic), Bluetti&apos;s Home Integration Kit (a Reliance subpanel with a 50 A inlet), an inlet box with an
            interlock, or a manual transfer switch.
          </p>
          <p>
            <strong>Size everything to 16 A at 240 V, not 50 A.</strong> That is what the outlet gives on battery ({n(A.outW)} W), per
            Bluetti&apos;s manual. The 50 A only applies when grid or generator power passes through.
          </p>
        </QuickAnswer>

        <ElectricianRule className="mt-6" />

        <Section title="What the outlets really give" id="outlets">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[38rem]">
              <caption className="sr-only">Apex 300 outlet limits on battery and in bypass mode, from its manual</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Outlet</th>
                  <th scope="col" className="p-3 font-semibold">Voltage setting 240 V</th>
                  <th scope="col" className="p-3 font-semibold">Voltage setting 120 V</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">14-50R, on battery</th>
                  <td className="p-3"><strong>120/240 V, {A.amps240} A</strong></td>
                  <td className="p-3">120 V, {A.amps120} A</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">14-50R, bypass (grid or generator in)</th>
                  <td className="p-3">120/240 V, {A.bypassA} A</td>
                  <td className="p-3">120 V, {A.bypassA} A</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">TT-30R</th>
                  <td className="p-3">120 V, 16 A</td>
                  <td className="p-3">120 V, {A.tt30A} A</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">Four 5-20R</th>
                  <td className="p-3">120 V, 16 A each, 1,920 W per pair</td>
                  <td className="p-3">120 V, 20 A each</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">All outlets together</th>
                  <td className="p-3" colSpan={2}>{n(A.outW)} W max</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            BLUETTI Apex 300 user manual, pages 16 and 26. Capacity {n(A.wh)} Wh, up to {n(A.maxWh)} Wh with six B300K batteries (page 22).
            Switchover 0 ms at the 240 V setting with the grid through the 15 A input on specific outlets, otherwise 20 ms (page 19).
          </p>
        </Section>

        <Section title="Four ways to wire it in" id="options">
          <div className="grid gap-3">
            <Callout>
              <strong>Bluetti AT1.</strong> An automatic transfer panel: it switches over by itself when the grid fails. Bluetti lists it as compatible with Apex 300 systems, up to three units through its Hub A1.
            </Callout>
            <Callout>
              <strong>Bluetti Home Integration Kit.</strong> A Reliance subpanel with a 50 A SS2-50 inlet, a 50 A outlet box and a 14-50 cord,
              listed for the Apex 300. Manual switchover.
            </Callout>
            <Callout>
              <strong>Inlet box + interlock.</strong> Cheapest way to reach any breaker, but you hold the total under 16 A per leg yourself. The
              interlock has to be made for your panel; Square D says its kits are not listed in other brands&apos; panels.
            </Callout>
            <Callout>
              <strong>Manual transfer switch.</strong> A fixed set of circuits, each with its own switch; look for UL 1008. Hard to overload,
              which suits a 3,840 W source.
            </Callout>
          </div>
          <p className="text-stone-700 mt-4 max-w-3xl">
            An owner on DIY Solar Forum feeds a Reliance 6-circuit switch from the 14-50R. In 240 V mode he measured no more than 16 A on either
            leg, which matches the manual.
          </p>
        </Section>

        <Section title="The neutral question" id="neutral">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              Bluetti&apos;s manual says the unit must be grounded when connected to the grid, but it says nothing about whether the output neutral
              is bonded to ground. Bluetti&apos;s own October 2026 hookup guide says &quot;neutral bonding matters most&quot;: some sources bond the
              neutral, and others expect transfer equipment that switches it.
            </p>
            <p>
              <strong>What to do:</strong> ask Bluetti support in writing which kind the Apex 300 is, and give the answer to your electrician before
              anything is bought. The <Link href="/home-backup#neutral" className={link}>home backup guide</Link> shows why it matters.
            </p>
          </div>
        </Section>

        <Section title="What it can start, and how long it lasts" id="runtime">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              <strong>Motors are the limit.</strong> Bluetti publishes no motor surge figure. The {n(A.liftW)} W &quot;Power Lifting&quot; number is
              for resistive loads such as kettles and heaters only (manual page 18), and Bluetti&apos;s FAQ warns that motors and compressors
              &quot;may start at 2-4 times their rated power.&quot; A {pump.hp} HP, 230 V well pump draws about {n(pumpL.startTotalW)} W for an
              instant at start (Franklin Electric&apos;s locked rotor figure), above the {n(A.outW)} W the specs cover.
            </p>
          </div>
          <MotorStartDiagram runW={pumpL.runW} startW={pumpL.startTotalW} limitW={A.outW} limitLabel="Apex 300 rated output" />
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              That doesn&apos;t mean it can&apos;t start the pump; it means the spec doesn&apos;t promise it. A soft starter lowers the start; see the{" "}
              <Link href="/home-backup/well-pump" className={link}>well pump page</Link>.
            </p>
            <p>
              <strong>Worked example, using Bluetti&apos;s own formula</strong> (manual page 28: capacity × 95% × 90% ÷ (load + 20 W)): a kitchen
              fridge, Wi-Fi, four LED bulbs for 5 hours and two phone charges average about {Math.round(avgW)} W across a day ({n(dayWh)} Wh,
              fridge figure from EIA). One Apex 300 runs that for about <strong>{Math.round(oneUnit)} hours</strong>; with one B300K battery added,
              about {Math.round(withOne)} hours.
            </p>
            <p>
              Your list will differ. Use the <Link href="/power-outage-backup-calculator" className={link}>power outage backup calculator</Link>.
            </p>
          </div>
        </Section>

        <Section title="Where to check stock" id="buy">
          <AffiliateDisclosure className="mb-4" />
          <p className="text-stone-700 max-w-3xl">
            Bluetti&apos;s product page has today&apos;s price and stock:{" "}
            <PartnerLink brand="bluetti" productId={a.id} productUrl={a.url} disclose>
              BLUETTI Apex 300
            </PartnerLink>
            . Budget for the electrician and permit too.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />

        <HomeBackupLinks exclude={PATH} />
        <RelatedLinks
          links={[
            { href: HOME_BACKUP_HUB.path, label: "Connect a power station safely", desc: "Cords, interlock, transfer switch or smart panel" },
            { href: "/home-backup/anker-solix-f3800-plus-hookup", label: "Anker F3800 Plus hookup", desc: "The 6,000 W, L14-30R alternative" },
            { href: "/compare/growatt-helios-3600-vs-bluetti-apex-300", label: "Growatt HELIOS 3600 vs Apex 300", desc: "Built on the 240 V question" },
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "How much battery your outage needs" },
          ]}
        />
        <Disclaimer>
          General information, not electrical advice. Codes and what inspectors accept differ by city and county. Specifications are from
          Bluetti&apos;s manual and product pages on the dates shown.
        </Disclaimer>
        <WhatWeChecked
          className="mt-14"
          untested="the Apex 300, the AT1 or the integration kit"
          items={sources(
            "apexManual",
            "apexManualV31",
            "bluettiAt1",
            "bluettiKit",
            "bluettiBlog",
            "forumApexUps",
            "forumApexLaunch",
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
