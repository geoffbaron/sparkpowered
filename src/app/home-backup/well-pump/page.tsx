import type { Metadata } from "next";
import Link from "next/link";
import WellPumpCalc from "@/components/WellPumpCalc";
import { AffiliateDisclosure } from "@/components/affiliate";
import { ElectricianRule, HomeBackupLinks, WhatWeChecked, type CheckedSource } from "@/components/home-backup";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { HubHero, OurPick, PhotoCredit } from "@/components/ui";
import { CAN_IT_RUN_IDS, hoursText, loadPageProducts, motorStation, whatItRunsPath } from "@/lib/can-it-run";
import { formatDate } from "@/lib/energy";
import { OFFGRID_SOURCES, PUMP_MOTORS, fmtW, pumpFit, pumpLoad, pumpMotor, type MotorStation } from "@/lib/offgrid";
import { fullName, productById } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/home-backup/well-pump";
const UPDATED = "2026-11-14";
const TITLE = "Power Station for a Well Pump (240 V): Starting Watts From the Nameplate";
const DESCRIPTION =
  "Enter your well pump's volts, horsepower and amps: running and starting watts from Franklin Electric's motor tables, which in-stock power stations can run and start it, and the soft-start option.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const READ = "2026-11-14";

const DOCS: CheckedSource[] = [
  { name: OFFGRID_SOURCES.franklinAim.name, url: OFFGRID_SOURCES.franklinAim.url, read: READ, what: "running watts, maximum amps and locked rotor amps for each 4-inch single-phase motor; generator and transfer switch rules" },
  { name: OFFGRID_SOURCES.doeFormula.name, url: OFFGRID_SOURCES.doeFormula.url, read: READ, what: "watts = volts × amps when a label gives amps" },
  { name: OFFGRID_SOURCES.eweb.name, url: OFFGRID_SOURCES.eweb.url, read: READ, what: "the starting-watts method: running watts plus the biggest motor's extra starting watts" },
  { name: "BLUETTI Apex 300 user manual", url: "https://cdn.shopify.com/s/files/1/0550/5620/3836/files/Apex_300_User_Manual_US_EN.pdf", read: READ, what: "section 5.3: the 7,680 W figure is Power Lifting for heating loads, not a motor surge" },
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

  const faqs = [
    {
      q: "Can a portable power station run a 240 V well pump?",
      a: `Only one with 240 V output. Of the stations we list that were in stock when we checked, that is ${names(has240)}. Running the pump is the easy part: a ${example.hp} HP, 230 V pump draws up to ${fmtW(exLoad.runW)}. Starting it is the hard part: for an instant it pulls about ${fmtW(exLoad.startTotalW)} (230 V × ${example.lockedRotorA} locked rotor amps, Franklin Electric). ${starts240.length ? `${names(starts240)} lists a motor surge that covers that.` : "None of the in-stock 240 V stations lists a motor surge that covers that, so a start is not guaranteed."} The pump is wired in, so a licensed electrician has to connect the station through a transfer switch.`,
    },
    {
      q: "How do I work out a well pump's starting watts?",
      a: "Multiply the motor's volts by its locked rotor amps: that is the current it draws for the split second it starts. Franklin Electric's AIM manual lists locked rotor amps for every standard submersible motor; some nameplates show it too. Running watts are volts × the nameplate's maximum amps (the US Department of Energy's method), or the maximum load watts in Franklin's table.",
    },
    {
      q: "What about a 120 V well pump?",
      a: `Smaller and shallower pumps are often 115 V, which any station can supply. A ${ex115.hp} HP, 115 V 3-wire pump runs at up to ${fmtW(ex115Load.runW)} but starts at about ${fmtW(ex115Load.startTotalW)}. In stock, ${names(starts115)} ${starts115.length === 1 ? "lists" : "list"} a motor surge that covers it.`,
    },
    {
      q: "Will a soft starter help?",
      a: "Usually it is the fix. A soft starter or a constant-pressure drive brings the motor up to speed gradually instead of hitting it with the full locked rotor current, so a smaller inverter can start it. Fitting one is a job for a licensed electrician or pump installer, and it must suit your motor: Franklin Electric says its single-phase submersible motors can only be used with its own constant-pressure controllers when a drive is used.",
    },
    {
      q: "How long will a power station run a well pump?",
      a: `Count hours of pumping, not hours of outage: a pump runs only while water is drawn or the pressure tank refills. At ${fmtW(exLoad.runW)}, the ${fullName(pick)} gives about ${hoursText(pickHours).replace("about ", "")} of pumping from a full charge. Short showers, full loads only in the washer, and no watering stretch it.`,
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
          datePublished: UPDATED,
          dateModified: UPDATED,
          author: { "@id": url("/#organization") },
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          mainEntityOfPage: url(PATH),
        }}
      />
      <HubHero
        image="outage"
        crumbs={[
          { name: "Home backup", path: "/home-backup" },
          { name: "Well pump", path: PATH },
        ]}
        eyebrow="Well pump backup"
        title={<>Running it is easy. <span className="text-amber-300">Starting it is the test.</span></>}
        sub={<>Your pump&apos;s nameplate tells you both numbers. Put them in and see which power stations can actually start it.</>}
      >
        <a href="#calc" className="btn btn-primary">Check my pump</a>
        <a href="#soft-start" className="btn btn-light">The soft-start fix</a>
      </HubHero>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-4">
          Updated <time dateTime={UPDATED}>{formatDate(UPDATED)}</time>
        </p>
        <AffiliateDisclosure className="mb-6" />

        <QuickAnswer>
          <p>
            A typical {example.hp} HP, 230 V well pump runs at up to {fmtW(exLoad.runW)} but pulls about {fmtW(exLoad.startTotalW)} for an
            instant as it starts (Franklin Electric&apos;s motor table). You need a station with 240 V output; in stock that is {names(has240)}.{" "}
            {starts240.length ? `${names(starts240)} covers the start on paper.` : "None lists a motor surge that covers the start, so plan on a soft starter."}{" "}
            A licensed electrician connects it through a transfer switch.
          </p>
        </QuickAnswer>

        <WhatWeChecked items={DOCS} untested="any power station on a well pump" className="mt-8" />

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

        <Section title="The soft-start option" id="soft-start">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              When no station covers the start, the usual fix is to lower the start rather than buy a bigger battery. A soft starter, or a
              constant-pressure drive in place of the standard control box, ramps the motor up over a second or more, so the inrush is a
              fraction of the locked rotor current.
            </p>
            <p>
              Two cautions from Franklin Electric&apos;s manual: its single-phase submersible motors may only be used with Franklin&apos;s own
              constant-pressure controllers when a drive is used, and some soft starters are not compatible with its SubMonitor protection.
              So ask the pump&apos;s maker or your well installer which device suits your motor, and have them or a licensed electrician fit it.
              We don&apos;t quote a percentage cut: the makers&apos; claims vary and we haven&apos;t measured one.
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
        <Sources items={[OFFGRID_SOURCES.franklinAim, OFFGRID_SOURCES.doeFormula, OFFGRID_SOURCES.eweb, { name: "BLUETTI Apex 300 user manual (section 5.3, Power Lifting Mode)", url: DOCS[3].url }]} />
        <HomeBackupLinks exclude={PATH} />
        <RelatedLinks
          links={[
            { href: "/home-backup", label: "Home backup: the four ways to connect", desc: "Cords, inlet and interlock, transfer switch, smart panel" },
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "Fridge, CPAP, well pump and furnace through an outage" },
            ...(CAN_IT_RUN_IDS.includes(pick.id as (typeof CAN_IT_RUN_IDS)[number])
              ? [{ href: whatItRunsPath(pick.id), label: `What the ${fullName(pick)} runs`, desc: "Run times for 15 household loads" }]
              : []),
            { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Every model we list, by spec" },
          ]}
        />
        <PhotoCredit name="outage" />
      </div>
    </article>
  );
}
