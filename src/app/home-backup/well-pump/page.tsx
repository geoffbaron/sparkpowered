import type { Metadata } from "next";
import Link from "next/link";
import Byline from "@/components/Byline";
import WellPumpCalc from "@/components/WellPumpCalc";
import { AffiliateDisclosure } from "@/components/affiliate";
import { ElectricianRule, HomeBackupLinks, WhatWeChecked, type CheckedSource } from "@/components/home-backup";
import { Breadcrumbs, Callout, Disclaimer, Faq, RelatedLinks, Section } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { OurPick } from "@/components/ui";
import { MotorStartDiagram } from "@/components/backup-diagrams";
import { SRC } from "@/data/backup-sources";
import { CAN_IT_RUN_IDS, hoursText, loadPageProducts, motorStation, whatItRunsPath } from "@/lib/can-it-run";
import { formatDate } from "@/lib/energy";
import { OFFGRID_SOURCES, PUMP_MOTORS, fmtW, pumpFit, pumpLoad, pumpMotor, type MotorStation } from "@/lib/offgrid";
import { fullName, productById } from "@/lib/products";
import { JsonLd, pageMetadata, url, AUTHOR_REF, pageUpdated } from "@/lib/seo";

const PATH = "/home-backup/well-pump";
const PUBLISHED = "2026-11-14";
const TITLE = "Power Station for a Well Pump: Starting Watts";
const DESCRIPTION =
  "Will a power station run your well pump? Running and starting watts from Franklin Electric's motor tables, which stations can start a 230 V pump, soft starters, owner reports, and the transfer switch a licensed electrician installs.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const READ = "2026-11-14";

const DOCS: CheckedSource[] = [
  SRC.franklinAim,
  { name: OFFGRID_SOURCES.doeFormula.name, url: OFFGRID_SOURCES.doeFormula.url, read: READ, what: "watts = volts × amps when a label gives amps" },
  SRC.eweb,
  SRC.softStartTips,
  SRC.microAir,
  SRC.ankerManual,
  SRC.apexManual,
  SRC.forumDeltaProWell,
  SRC.forumDeltaPro240,
  SRC.wsc,
  SRC.privateWell,
  SRC.epaWater,
  SRC.osha,
  SRC.cpsc,
];

/** Franklin Electric AIM manual (2026), printed page 7: generator minimum rating, kW. */
const FRANKLIN_GEN_KW: { hp: string; twoWire: number | null; threeWire: number }[] = [
  { hp: "1/2", twoWire: 3, threeWire: 2 },
  { hp: "3/4", twoWire: 4.5, threeWire: 3 },
  { hp: "1", twoWire: 6, threeWire: 4 },
  { hp: "1.5", twoWire: 7.5, threeWire: 5 },
  { hp: "2", twoWire: null, threeWire: 7.5 },
];

const STATUS: Record<string, string> = {
  runs: "Runs and starts it",
  "start-unconfirmed": "Runs it; start not covered",
  "too-big": "Too small",
  "needs-240v": "No 240 V",
};

export default function WellPumpPage() {
  const products = loadPageProducts();
  const stations: MotorStation[] = products.map(motorStation);
  const m230 = PUMP_MOTORS.filter((m) => m.volts === 230);
  const example = pumpMotor("1-2hp-230v-3w");
  const exLoad = pumpLoad(example);
  const ex115 = pumpMotor("1-2hp-115v-3w");
  const ex115Load = pumpLoad(ex115);

  // The page's pick: the tracked station that runs the most 240 V pumps in Franklin's
  // table, then starts the most, then the cheaper one.
  const score = (s: MotorStation) => {
    const fits = m230.map((m) => pumpFit(pumpLoad(m), s));
    return { s, running: fits.filter((f) => f === "runs" || f === "start-unconfirmed").length, starts: fits.filter((f) => f === "runs").length };
  };
  const ranked = stations
    .filter((s) => s.tracked)
    .map(score)
    .sort((a, b) => b.running - a.running || b.starts - a.starts || a.s.usableWh - b.s.usableWh);
  const pick = productById(ranked[0].s.id);
  const pickStation = ranked[0].s;
  const pickFit = pumpFit(exLoad, pickStation);
  const has240 = stations.filter((s) => s.volts === "120/240V");
  const starts240 = has240.filter((s) => pumpFit(exLoad, s) === "runs");
  const starts115 = stations.filter((s) => pumpFit(ex115Load, s) === "runs");
  const pickHours = pickStation.usableWh / exLoad.runW;
  const names = (xs: MotorStation[]) => (xs.length ? xs.map((s) => s.name).join(", ") : "none");

  const f3800Lra = 80; // Anker F3800 Plus manual, PDF page 6: "The LRA (Locked Rotor Amps) ... is 80A."
  const f3800Starts = PUMP_MOTORS.filter((m) => m.volts === 230 && m.lockedRotorA <= f3800Lra);
  const biggestF3800 = f3800Starts[f3800Starts.length - 1];

  const faqs = [
    {
      q: "Can a portable power station run a 240 V well pump?",
      a: `Only one with 240 V output. Running it is the easy part: a ${example.hp} HP, 230 V pump draws up to ${fmtW(exLoad.runW)}. Starting it is the hard part: for an instant it pulls about ${fmtW(exLoad.startTotalW)} (230 V × ${example.lockedRotorA} locked rotor amps, Franklin Electric). Of the in-stock stations we list, ${has240.length ? names(has240) : "none"} ${has240.length === 1 ? "has" : "have"} 240 V; ${starts240.length ? `${names(starts240)} lists a motor surge that covers the start.` : "none lists a motor surge that covers the start, so plan on a soft starter."} The pump is wired in, so a licensed electrician connects the station through a transfer switch.`,
    },
    {
      q: "How many watts does a well pump need to start?",
      a: "Multiply the motor's volts by its locked rotor amps (LRA): that is the current it draws for the split second it starts. Franklin Electric's AIM manual lists LRA for every standard 4-inch submersible motor, from 23 A for a 1/2 HP 230 V 3-wire motor to 83.4 A for a 3 HP. Running watts are volts × the nameplate's maximum amps, or the maximum load watts in Franklin's table.",
    },
    {
      q: "Can an Anker F3800 Plus run a well pump?",
      a: `On paper, a 230 V pump up to ${biggestF3800.hp} HP (${biggestF3800.wires}-wire): Anker's manual gives the F3800 Plus a locked rotor limit of ${f3800Lra} A on its 240 V outlet, and Franklin lists ${biggestF3800.lockedRotorA} A for that motor. A 3 HP motor (83.4 A) is over it. Anker says to add a soft starter when a motor needs more. The F3800 Plus was sold out on Anker's US store when we checked on Nov 14 2026.`,
    },
    {
      q: "What about a 120 V well pump?",
      a: `Smaller and shallower pumps are often 115 V, which any station can supply. A ${ex115.hp} HP, 115 V 3-wire pump runs at up to ${fmtW(ex115Load.runW)} but starts at about ${fmtW(ex115Load.startTotalW)}. In stock, ${names(starts115)} ${starts115.length === 1 ? "lists" : "list"} a motor surge that covers it. An owner on DIY Solar Forum reported a 110 V, 1/2 HP pump shutting off an original EcoFlow Delta Pro at start-up.`,
    },
    {
      q: "Will a soft starter let a power station start my well pump?",
      a: "Often it is the fix, if your pump can take one. SoftStartUSA says its well pump unit works on 115 V and 230 V single-phase submersibles from 0.5 to 3.5 HP and cuts the start surge by about 40%, not the running current. Micro-Air says fully submersible pumps can't use its EasyStart unless the pump has a capacitor above ground. Franklin says its own motors on a drive must use its constant-pressure controllers. A licensed electrician or pump installer fits it.",
    },
    {
      q: "How long will a power station run a well pump?",
      a: `Count hours of pumping, not hours of outage: the pump runs only while water is drawn or the pressure tank refills. At ${fmtW(exLoad.runW)}, the ${fullName(pick)} gives about ${hoursText(pickHours).replace("about ", "")} of pumping from a full charge. EPA says the average family uses over 300 gallons a day at home; short showers, full washer loads only and no watering stretch the battery.`,
    },
  ];

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${url(PATH)}#article`,
          headline: TITLE,
          description: DESCRIPTION,
          url: url(PATH),
          datePublished: `${PUBLISHED}T12:00:00+00:00`,
          dateModified: `${pageUpdated(PATH)}T12:00:00+00:00`,
          author: AUTHOR_REF,
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          mainEntityOfPage: url(PATH),
        }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ name: "Home backup", path: "/home-backup" }, { name: "Well pump", path: PATH }]} />
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-2">Well pump backup</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">Running a well pump on a power station: starting watts decide it</h1>
        <Byline path={PATH} />

        <QuickAnswer>
          <p>
            <strong>Running it is easy; starting it is the test.</strong> A common {example.hp} HP, 230 V well pump runs at up to{" "}
            {fmtW(exLoad.runW)} but pulls about {fmtW(exLoad.startTotalW)} for an instant as it starts (Franklin Electric&apos;s motor table).
            You need a station with 240 V output whose motor rating covers that start, or a soft starter on the pump.
          </p>
          <p>
            The pump is wired in, so it never plugs into the station. <strong>A licensed electrician connects it through a transfer switch or an
            inlet and interlock, with a permit.</strong>
          </p>
        </QuickAnswer>

        <MotorStartDiagram runW={exLoad.runW} startW={exLoad.startTotalW} limitW={3840} limitLabel="A 3,840 W station, no motor rating" />

        <Section title="Your pump: running and starting watts" id="calc">
          <p className="text-stone-700 mb-4 max-w-3xl">
            Read the label on the pump control box or the motor paperwork for volts and horsepower. Most deep-well pumps are 230 V. If the
            label gives maximum amps, add them for a closer running figure.
          </p>
          <WellPumpCalc stations={stations} />
        </Section>

        <Section title="How we work it out" id="formula">
          <ol className="list-decimal pl-5 space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <li>
              <strong>Running watts = volts × amps.</strong> That is the US Department of Energy&apos;s rule for a label that lists amps. With
              no amps, we use the maximum load watts in Franklin Electric&apos;s motor table for your horsepower and voltage.
            </li>
            <li>
              <strong>Starting watts = volts × locked rotor amps.</strong> Franklin&apos;s manual says a motor&apos;s current goes from zero to
              locked rotor amps, then drops to running amps once it is at full speed. We treat that figure as watts against the
              station&apos;s surge rating, the worst case.
            </li>
            <li>
              <strong>The fit check</strong> is the one our{" "}
              <Link href="/power-outage-backup-calculator" className="text-spark-orange underline underline-offset-2">outage calculator</Link>{" "}
              uses: running watts under the continuous output, and the full start under the surge the maker gives for motors. Bluetti&apos;s
              higher &quot;Power Lifting&quot; figures are for heaters and kettles only, so for those models we count the continuous output.
            </li>
          </ol>
        </Section>

        <Section title="Every common pump size against the in-stock stations" id="table">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[40rem]">
              <caption className="sr-only">Running and starting watts for Franklin Electric 4-inch single-phase motors, and which in-stock stations start them</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Motor</th>
                  <th scope="col" className="p-3 font-semibold text-right">Running</th>
                  <th scope="col" className="p-3 font-semibold text-right">Starting</th>
                  <th scope="col" className="p-3 font-semibold">Stations whose specs cover the start</th>
                </tr>
              </thead>
              <tbody>
                {PUMP_MOTORS.map((m) => {
                  const l = pumpLoad(m);
                  const ok = stations.filter((s) => pumpFit(l, s) === "runs");
                  const runOnly = stations.filter((s) => pumpFit(l, s) === "start-unconfirmed");
                  return (
                    <tr key={m.id} className="border-t border-black/6">
                      <th scope="row" className="p-3 font-medium">{m.hp} HP, {m.volts} V, {m.wires}-wire</th>
                      <td className="p-3 text-right tabular-nums">{fmtW(l.runW)}</td>
                      <td className="p-3 text-right tabular-nums">{fmtW(l.startTotalW)}</td>
                      <td className="p-3">
                        {ok.length ? names(ok) : "None"}
                        {!ok.length && runOnly.length > 0 && <span className="block text-xs text-muted">Runs on {runOnly.length > 3 ? `${runOnly.length} in-stock stations` : names(runOnly)} once started</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Motor figures: Franklin Electric AIM manual, 2026 edition, 4-inch single-phase table (3-wire rows use the standard control box).
            Other pump brands are close but not identical; your own nameplate wins. {STATUS.runs} means the maker&apos;s motor surge figure is
            at least the full start; it is still the maker&apos;s rating, not a test.
          </p>
        </Section>

        <Section title="A cross-check: Franklin's generator sizes" id="generator-table">
          <p className="text-stone-700 mb-4 max-w-3xl">
            Franklin Electric&apos;s manual also gives the smallest generator for each motor, because a generator must hold at least 65% of the
            motor&apos;s voltage while it starts. A power station isn&apos;t a generator, but the gap between these figures and a pump&apos;s
            running watts shows how big the start is. 3-wire motors (with a control box) need less than 2-wire ones.
          </p>
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface max-w-xl">
            <table className="w-full text-sm">
              <caption className="sr-only">Franklin Electric minimum generator rating by motor size</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Motor</th>
                  <th scope="col" className="p-3 font-semibold text-right">2-wire</th>
                  <th scope="col" className="p-3 font-semibold text-right">3-wire</th>
                </tr>
              </thead>
              <tbody>
                {FRANKLIN_GEN_KW.map((r) => (
                  <tr key={r.hp} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{r.hp} HP</th>
                    <td className="p-3 text-right tabular-nums">{r.twoWire ? `${r.twoWire} kW` : "Not listed"}</td>
                    <td className="p-3 text-right tabular-nums">{r.threeWire} kW</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">Franklin Electric AIM manual, 2026 edition, printed page 7 (Generator Minimum Rating).</p>
        </Section>

        <Section title="The soft-start option" id="soft-start">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              When no station covers the start, the usual fix is to lower the start rather than buy a bigger battery. A soft starter ramps the
              motor up instead of hitting it with the full locked rotor current.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>SoftStartUSA</strong> says its well pump unit works with 115 V and 230 V single-phase submersibles from 0.5 to 3.5 HP,
                puts a pump&apos;s inrush at 5 to 7 times its running amps, and cuts that inrush by about 40%. It does nothing to running current.
              </li>
              <li>
                <strong>Micro-Air</strong> says fully contained submersible pumps can&apos;t take its EasyStart; only pumps with a capacitor above
                ground can be adapted.
              </li>
              <li>
                <strong>Franklin Electric</strong> says its single-phase submersible motors may only go on a drive with its own constant-pressure
                controllers, and warns against a reduced-voltage starter on a minimum-sized generator.
              </li>
            </ul>
            <p>
              So ask the pump&apos;s maker or your well installer which device suits your motor, and have them or a licensed electrician fit it.
            </p>
          </div>
        </Section>

        <Section title="What owners report" id="owners">
          <ul className="list-disc pl-5 space-y-2 text-stone-700 leading-relaxed max-w-3xl">
            <li>
              A 110 V, 1/2 HP pump shut off an original EcoFlow Delta Pro &quot;only at start up.&quot; Suggestions in the thread were a soft
              starter or a bigger inverter; no fix was confirmed (DIY Solar Forum, 2023).
            </li>
            <li>
              Another member measured his pump&apos;s starting surge at 4 times its running amps, and a third reported running a 240 V well on two
              Delta Pros joined for 240 V (DIY Solar Forum, 2022).
            </li>
            <li>We found no owner report yet of an Anker F3800 Plus or Bluetti Apex 300 starting a well pump.</li>
          </ul>
          <p className="text-xs text-muted mt-2 max-w-3xl">Owner posts are their own reports, not tests.</p>
        </Section>

        <Section title="Make the water last" id="water">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              The pressure tank holds some water you can use with the pump off (PrivateWellClass), so the pump only needs to run when the tank
              runs down. EPA says the average family uses more than 300 gallons a day at home. In an outage,
              cutting that is what stretches the battery. The Water Systems Council suggests a generator for the pump, or a hand pump on the
              well as a backup that needs no power at all.
            </p>
          </div>
        </Section>

        <Section title="Connecting it safely" id="safety">
          <Callout tone="warn">
            <p>
              <strong>A well pump is wired into your panel, so it never plugs into a power station directly.</strong> A licensed electrician
              installs a transfer switch or an inlet with an interlock, with a permit, so the pump circuit is cut off from the grid before the
              battery feeds it. Franklin Electric&apos;s manual says the same for generators: a transfer switch must be used any time one backs
              up a pump on the power lines.
            </p>
            <p className="mt-2">Don&apos;t open the pump control box yourself; it carries 240 V.</p>
          </Callout>
          <ElectricianRule className="mt-3" />
          <p className="text-sm text-stone-700 mt-3 max-w-3xl">
            The four ways to connect a battery to a house, and which need an electrician, are on our{" "}
            <Link href="/home-backup" className="text-spark-orange underline underline-offset-2">home backup guide</Link>.
          </p>
        </Section>

        <section className="mt-12" aria-labelledby="pick-heading">
          <h2 id="pick-heading" className="text-2xl font-bold mb-4">The best fit in stock for a 240 V pump</h2>
          <AffiliateDisclosure className="mt-12 mb-4" />
          <OurPick
            label="Runs the most 240 V pump sizes"
            name={fullName(pick)}
            icon="home"
            why={`Of the in-stock stations from makers we work with, it runs the most of Franklin's 230 V motor sizes, up to ${fmtW(pickStation.acOutputW)} continuously. ${
              pickFit === "runs"
                ? `Its motor surge covers the start of a ${example.hp} HP pump.`
                : `Its specs don't cover the full start of a ${example.hp} HP pump (${fmtW(exLoad.startTotalW)}), so ask its maker and your pump installer about a soft starter before you rely on it.`
            } About ${hoursText(pickHours).replace("about ", "")} of pumping on a full charge.`}
            life={[`${pick.volts} output`, `${(pick.capacityWh / 1000).toFixed(1)} kWh`]}
            brand={pick.brand}
            productId={pick.id}
            productUrl={pick.url}
            category="home"
            disclose
          />
          <p className="text-xs text-muted mt-2">Specs checked on {formatDate(pick.retrieved)}. The button goes to the maker&apos;s page for today&apos;s price.</p>
        </section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer />
        <HomeBackupLinks exclude={PATH} />
        <RelatedLinks
          links={[
            { href: "/home-backup", label: "Home backup: the four ways to connect", desc: "Cords, inlet and interlock, transfer switch, smart panel" },
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "Fridge, CPAP, well pump and furnace through an outage" },
            ...(CAN_IT_RUN_IDS.includes(pick.id as (typeof CAN_IT_RUN_IDS)[number])
              ? [{ href: whatItRunsPath(pick.id), label: `What the ${fullName(pick)} runs`, desc: "Run times for 15 household loads" }]
              : []),
          ]}
        />
        <WhatWeChecked items={DOCS} untested="any power station on a well pump" className="mt-14" />
      </div>
    </article>
  );
}
