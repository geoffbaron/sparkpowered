import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure } from "@/components/affiliate";
import { HomeBackupLinks, WhatWeChecked, type CheckedSource } from "@/components/home-backup";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { HubHero, OurPick, PhotoCredit } from "@/components/ui";
import { whatItRunsPath } from "@/lib/can-it-run";
import { formatDate } from "@/lib/energy";
import { NEC_COLD_FACTORS, OFFGRID_SOURCES, coldVoc, pvLayout, type PvInput, type PvPanel } from "@/lib/offgrid";
import { fullName, money, productById } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/home-backup/bluetti-elite-200-v2-solar-panels";
const UPDATED = "2026-11-14";
const TITLE = "Bluetti Elite 200 V2 Solar Panels: Which Fit, Series or Parallel, and the Cold-Weather Voltage Check";
const DESCRIPTION =
  "The Elite 200 V2's solar input limits from Bluetti's manual (12-60 V, 20 A, 1,000 W, XT60), which Bluetti panels fit in series or parallel, the open-circuit voltage math with a cold-weather margin, and what a third-party panel needs.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const READ = "2026-11-14";
const MANUAL = "https://s4.bluettipower.com/bluetti_lgf/support/2025/05/2e595f43-44bf-471a-8eff-da42abfbbcca.pdf";

/** Elite 200 V2 solar input, from Bluetti's user manual V1.0 (specifications and Solar Charging pages). */
const INPUT: PvInput = { minV: 12, maxV: 60, maxA: 20, maxW: 1000 };
/** Manual: in the app's default (non-advanced) setting, 11-30 V input is held to 8.2 A. */
const LOW_V_BAND = { upToV: 30, maxA: 8.2 };

interface BluettiPanel extends PvPanel {
  id: string;
  name: string;
  connector: "MC4" | "DC5521";
  url: string;
  note?: string;
}

/** Specs from each panel's page on Bluetti's US site. */
const PANELS: BluettiPanel[] = [
  { id: "sora-500", name: "SORA 500 (500 W)", watts: 500, vocV: 49.1, iscA: 13.31, connector: "MC4", url: "https://www.bluettipower.com/products/500w-portable-solar-panel" },
  {
    id: "pv350",
    name: "350W Solar Panel",
    watts: 350,
    vocV: 44,
    iscA: 11.4,
    connector: "MC4",
    url: "https://www.bluettipower.com/products/350w-solar-panel",
    note: "The spec table says 44 V Voc; a line higher on the same page says 33 V, which can't be right next to its 37 V working voltage. We use 44 V.",
  },
  { id: "sp200l", name: "SP200L (200 W)", watts: 200, vocV: 24.6, iscA: 10.8, connector: "MC4", url: "https://www.bluettipower.com/products/bluetti-sp200l-solar-panel-200w" },
  { id: "sp100l", name: "SP100L (100 W)", watts: 100, vocV: 24.62, iscA: 5.13, connector: "MC4", url: "https://www.bluettipower.com/products/foldable-solar-panel-sp100l" },
  { id: "pv100fx", name: "PV100 FX flexible (100 W)", watts: 100, vocV: 41.4, iscA: 3.05, connector: "MC4", url: "https://www.bluettipower.com/products/pv100fx-flexible-solar-panel" },
  { id: "sora-60", name: "SORA 60 (60 W)", watts: 60, vocV: 27.5, iscA: 2.76, connector: "DC5521", url: "https://www.bluettipower.com/products/bluetti-sora-60-solar-panel-60w" },
];

/** Layouts the included cable takes without extra parts: one or two strings (its two MC4 pairs), up to four panels. */
const LAYOUTS: [number, number][] = [
  [1, 1],
  [2, 1],
  [3, 1],
  [1, 2],
  [2, 2],
];

const DOCS: CheckedSource[] = [
  { name: "BLUETTI Elite 200 V2 user manual V1.0", url: MANUAL, read: READ, what: "solar input 12-60 V, 20 A, 1,000 W; XT60 input; MC4-to-XT60 cable; series and parallel rules; 8.2 A low-voltage limit" },
  { name: "BLUETTI Elite 200 V2 product page (specifications)", url: "https://www.bluettipower.com/products/elite-200-v2-portable-power-station", read: READ, what: "solar input 1,000 W, 12 V to 60 V, 20 A; price and stock" },
  ...PANELS.map((p) => ({ name: `BLUETTI ${p.name} product page`, url: p.url, read: READ, what: `Voc ${p.vocV} V, Isc ${p.iscA} A, ${p.connector} connector` })),
  { name: OFFGRID_SOURCES.iaeiPv.name, url: OFFGRID_SOURCES.iaeiPv.url, read: READ, what: "the temperature-coefficient method and NEC Table 690.7(A) factors" },
];

const v = (n: number) => `${n.toFixed(1)} V`;
const a = (n: number) => `${n.toFixed(1)} A`;

export default function EliteSolarPage() {
  const e200 = productById("bluetti-elite-200-v2");
  const [mild, deep] = NEC_COLD_FACTORS;
  const sp200 = PANELS.find((p) => p.id === "sp200l")!;
  const pv350 = PANELS.find((p) => p.id === "pv350")!;
  const sora500 = PANELS.find((p) => p.id === "sora-500")!;
  const ex1 = pvLayout(sp200, 2, 1, INPUT);
  const ex2 = pvLayout(pv350, 1, 2, INPUT);
  const ex3 = pvLayout(sora500, 1, 1, INPUT);
  // A made-up third-party panel to show the coefficient method; not a real product.
  const third = { voc: 22.5, coeff: -0.3, lowC: -20, series: 2 };
  const thirdCold = coldVoc(third.voc * third.series, third.coeff, third.lowC);

  const rows = PANELS.filter((p) => p.connector === "MC4").flatMap((p) =>
    LAYOUTS.map(([s, par]) => ({ p, l: pvLayout(p, s, par, INPUT) })).filter(({ l }) => l.voltsOk),
  );
  const verdict = (l: ReturnType<typeof pvLayout>) => {
    if (!l.cold[0].ok) return { text: "Over 60 V in a hard frost", cls: "text-red-700 font-semibold" };
    if (!l.currentOk) return { text: `Short-circuit current over ${INPUT.maxA} A: ask Bluetti`, cls: "text-amber-800 font-semibold" };
    if (!l.cold[1].ok) return { text: `Fits down to about ${mild.tempF}°F; can pass 60 V near ${deep.tempF}°F`, cls: "text-amber-800 font-semibold" };
    if (l.voc <= LOW_V_BAND.upToV) return { text: `Fits; set PV mode in the app for more than ${LOW_V_BAND.maxA} A`, cls: "text-leaf font-semibold" };
    return { text: "Fits", cls: "text-leaf font-semibold" };
  };

  const faqs = [
    {
      q: "What solar panels are compatible with the Bluetti Elite 200 V2?",
      a: `Any panel or string of panels with an open-circuit voltage (Voc) of 12 to 60 V and MC4 connectors, up to ${INPUT.maxA} A and ${INPUT.maxW.toLocaleString("en-US")} W, per Bluetti's manual. Bluetti's own SORA 500, 350W, SP200L, SP100L and PV100 FX panels all have MC4 connectors and fit on their own. The SORA 60 has a DC5521 plug instead, so it needs an adapter.`,
    },
    {
      q: "Can I put two Bluetti SP200L panels in series on the Elite 200 V2?",
      a: `Yes, and Bluetti's manual uses that layout as its example. Two in series add up to ${v(ex1.voc)} Voc. Panels make more voltage in the cold: using the National Electrical Code's correction factor of ${mild.factor} for about ${mild.tempF}°F, that is ${v(ex1.cold[0].voc)}, under the 60 V limit. At the code's factor for ${deep.tempF}°F it would be ${v(ex1.cold[1].voc)}, so in very cold places check the panels' temperature coefficient first.`,
    },
    {
      q: "Series or parallel: which is better for the Elite 200 V2?",
      a: `Series raises voltage, parallel raises current. The Elite 200 V2 limits current to ${INPUT.maxA} A and, in the app's default setting, holds input of ${LOW_V_BAND.upToV} V or less to ${LOW_V_BAND.maxA} A. So low-voltage panels (around 20 to 25 V Voc) do better in series, or in parallel only after you set the DC input to PV in the app's advanced mode. Higher-voltage panels like the 350W or SORA 500 go in parallel, never in series.`,
    },
    {
      q: "Can I use third-party solar panels with the Elite 200 V2?",
      a: "Yes. Bluetti's manual says third-party panels work if their open-circuit voltage is 12 to 60 V and they have MC4 connectors, and to avoid mixing different panels. Check the Voc on the panel's label, correct it for your coldest morning with the panel's temperature coefficient, and keep the total under 60 V.",
    },
    {
      q: "How long does the Elite 200 V2 take to charge from solar?",
      a: "Bluetti says about 2.4 hours at a steady 1,000 W of solar input. Real panels rarely give their full rating, so expect longer, and much longer in winter.",
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
        image="solar-roof"
        crumbs={[
          { name: "Home backup", path: "/home-backup" },
          { name: "Elite 200 V2 solar panels", path: PATH },
        ]}
        eyebrow="Elite 200 V2 solar"
        title={<>60 volts is the line. <span className="text-amber-300">Cold mornings move it.</span></>}
        sub={<>Which panels fit the Bluetti Elite 200 V2, how to wire them, and the voltage check most guides skip.</>}
      >
        <a href="#fit" className="btn btn-primary">Which panels fit</a>
        <a href="#cold" className="btn btn-light">The cold check</a>
      </HubHero>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-4">
          Updated <time dateTime={UPDATED}>{formatDate(UPDATED)}</time>
        </p>
        <AffiliateDisclosure className="mb-6" />

        <QuickAnswer>
          <p>
            The Elite 200 V2 takes {INPUT.minV} to {INPUT.maxV} V open-circuit, up to {INPUT.maxA} A and {INPUT.maxW.toLocaleString("en-US")} W,
            through an XT60 port with Bluetti&apos;s MC4 cable. Any Bluetti MC4 panel fits alone. Two 20-something-volt panels (SP200L, SP100L)
            go in series; the 350W and SORA 500 go in parallel, never series. Add margin for cold: panel voltage rises as it gets colder, so
            keep the cold-corrected total under 60 V.
          </p>
        </QuickAnswer>

        <WhatWeChecked items={DOCS} untested="the Elite 200 V2 or any of these panels" className="mt-8" />

        <Section title="The input limits, from Bluetti's manual" id="limits">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ["Voltage (Voc)", `${INPUT.minV} to ${INPUT.maxV} V`, "Open-circuit, per string"],
              ["Current", `${INPUT.maxA} A max`, `${LOW_V_BAND.maxA} A at ${LOW_V_BAND.upToV} V or less in the default setting`],
              ["Power", `${INPUT.maxW.toLocaleString("en-US")} W max`, "Extra panel watts are not used"],
              ["Connector", "XT60", "MC4-to-XT60 cable in the box, two MC4 pairs"],
            ].map(([k, val, note]) => (
              <div key={k} className="bg-surface rounded-xl border border-black/8 p-4">
                <dt className="text-xs font-medium text-muted">{k}</dt>
                <dd className="text-xl font-extrabold mt-1">{val}</dd>
                <dd className="text-xs text-muted mt-1">{note}</dd>
              </div>
            ))}
          </dl>
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl mt-4">
            <p>
              The included cable has two pairs of MC4 plugs joined in parallel. Bluetti says to use the same type and number of panels on
              both pairs: its example is two 200 W panels in series on each side.
            </p>
            <p>
              The current limit has a catch the spec sheet doesn&apos;t show. In the BLUETTI app&apos;s default setting, input at {LOW_V_BAND.upToV} V
              or less is held to {LOW_V_BAND.maxA} A. Bluetti&apos;s manual describes its 200 W panels as 20 V and 10 A, so one SP200L on its own would charge at roughly {Math.round(20 * LOW_V_BAND.maxA)} W until you set
              the DC input source to &quot;PV&quot; in the app&apos;s advanced mode, which allows {INPUT.maxA} A above 16 V. Wiring two low-voltage
              panels in series avoids the question.
            </p>
          </div>
        </Section>

        <Section title="Which Bluetti panels fit, and how to wire them" id="fit">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[42rem]">
              <caption className="sr-only">Bluetti panel layouts on the Elite 200 V2 with open-circuit voltage, cold-weather voltage and current</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Layout</th>
                  <th scope="col" className="p-3 font-semibold text-right">Voc</th>
                  <th scope="col" className="p-3 font-semibold text-right">Voc at {mild.tempF}°F</th>
                  <th scope="col" className="p-3 font-semibold text-right">Short-circuit current</th>
                  <th scope="col" className="p-3 font-semibold text-right">Panel watts</th>
                  <th scope="col" className="p-3 font-semibold">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ p, l }) => {
                  const vd = verdict(l);
                  return (
                    <tr key={`${p.id}-${l.series}-${l.parallel}`} className="border-t border-black/6">
                      <th scope="row" className="p-3 font-medium">
                        {l.series * l.parallel} × {p.name}
                        <span className="block text-xs text-muted font-normal">
                          {[l.series > 1 ? `${l.series} in series` : "", l.parallel > 1 ? `${l.parallel} strings in parallel` : ""].filter(Boolean).join(", ") || "single"}
                        </span>
                      </th>
                      <td className="p-3 text-right tabular-nums">{v(l.voc)}</td>
                      <td className="p-3 text-right tabular-nums">{v(l.cold[0].voc)}</td>
                      <td className="p-3 text-right tabular-nums">{a(l.isc)}</td>
                      <td className="p-3 text-right tabular-nums">
                        {l.watts.toLocaleString("en-US")} W{l.capped && <span className="block text-xs text-muted">only {INPUT.maxW.toLocaleString("en-US")} W used</span>}
                      </td>
                      <td className={`p-3 ${vd.cls}`}>{vd.text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Layouts over 60 V before any cold correction (for example two 350W panels in series) are left out. Panel figures are from each
            panel&apos;s page on Bluetti&apos;s US site. {pv350.note} The SORA 60 uses a DC5521 plug, not MC4, so it needs an adapter to use this
            cable. A short-circuit current over {INPUT.maxA} A is above the manual&apos;s listed current; Bluetti&apos;s own parallel example uses
            panels working at about 10 A each, so ask Bluetti before relying on a layout we flag.
          </p>
        </Section>

        <Section title="The cold-weather voltage check, worked through" id="cold">
          <div className="space-y-4 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              A panel&apos;s Voc is measured at 25°C (77°F). It rises as the panel gets colder, and it peaks on a bright, freezing morning
              before the panel warms up. The method electrical inspectors use (IAEI, from the National Electrical Code section 690.7) is:
            </p>
            <p className="rounded-xl bg-surface border border-black/8 p-4 font-mono text-sm">
              Voc(cold) = Voc × (1 + coefficient ÷ 100 × (lowest temperature in °C − 25))
            </p>
            <p>
              The coefficient is on the panel&apos;s datasheet as a negative %/°C. Bluetti doesn&apos;t publish one for these panels, so we use the
              code&apos;s fallback for silicon panels, NEC Table 690.7(A): a factor of {mild.factor} at about {mild.tempC}°C ({mild.tempF}°F) and{" "}
              {deep.factor} at {deep.tempC}°C ({deep.tempF}°F).
            </p>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <strong>Two SP200L in series:</strong> {sp200.vocV} + {sp200.vocV} = {v(ex1.voc)}. × {mild.factor} = {v(ex1.cold[0].voc)}, under
                60 V. × {deep.factor} = {v(ex1.cold[1].voc)}, over. Fine down to about {mild.tempF}°F; somewhere colder, use the
                panel&apos;s real coefficient or wire them in parallel with the app in PV mode.
              </li>
              <li>
                <strong>One SORA 500:</strong> {v(ex3.voc)} alone. × {mild.factor} = {v(ex3.cold[0].voc)}; × {deep.factor} = {v(ex3.cold[1].voc)}.
                Even a single panel this close to 60 V crosses it in deep cold. Two can only ever go in parallel.
              </li>
              <li>
                <strong>Two 350W in parallel:</strong> voltage stays {v(ex2.voc)} ({v(ex2.cold[1].voc)} at {deep.tempF}°F, fine), but the
                short-circuit currents add to {a(ex2.isc)}, above the {INPUT.maxA} A in the manual.
              </li>
              <li>
                <strong>A third-party panel, with its coefficient:</strong> an example panel (not a real product) rated {third.voc} V Voc and{" "}
                {third.coeff}%/°C, two in series, coldest morning {third.lowC}°C: {third.voc * third.series} × (1 + {third.coeff} ÷ 100 × ({third.lowC} − 25)) ={" "}
                {v(thirdCold)}. Under 60 V, so it fits.
              </li>
            </ol>
          </div>
        </Section>

        <Section title="What a third-party panel needs" id="third-party">
          <ul className="list-disc pl-5 space-y-2 text-stone-700 leading-relaxed max-w-3xl">
            <li>MC4 connectors, to use the MC4-to-XT60 cable that comes with the Elite 200 V2.</li>
            <li>Voc of at least {INPUT.minV} V, and no more than 60 V for the whole string after the cold correction above.</li>
            <li>Short-circuit current of {INPUT.maxA} A or less across everything in parallel.</li>
            <li>Matching panels: Bluetti says not to mix types, and to put the same panels on both MC4 pairs.</li>
            <li>No more than about {INPUT.maxW.toLocaleString("en-US")} W in total; beyond that you pay for panels the station won&apos;t use.</li>
          </ul>
        </Section>

        <Section title="Safety" id="safety">
          <Callout tone="warn">
            <p>
              <strong>Above 60 V the Elite 200 V2 shows a PV overvoltage error</strong> (E033 in Bluetti&apos;s manual), and Bluetti tells you not
              to use panels over 60 V Voc. Do the cold check before you wire a string.
            </p>
            <p className="mt-2">
              Bluetti&apos;s manual says the unit is for off-grid use and its AC output must never be connected to the grid. Never feed its output
              into a wall outlet, a dryer outlet or the house wiring with a cord that has plugs on both ends: that backfeeding is illegal and can kill utility lineworkers. To run house
              circuits, a licensed electrician installs a transfer switch with a permit; see our{" "}
              <Link href="/home-backup" className="underline underline-offset-2">home backup guide</Link>.
            </p>
          </Callout>
        </Section>

        <section className="mt-12" aria-labelledby="pick-heading">
          <h2 id="pick-heading" className="text-2xl font-bold mb-4">The station this page is about</h2>
          <OurPick
            label="Our homepage pick"
            name={fullName(e200)}
            why={`About 2 kWh of LFP battery with a ${INPUT.maxW.toLocaleString("en-US")} W solar input, which Bluetti says refills it in about 2.4 hours of steady full sun. It can't take extra batteries, so solar is how you stretch it through a long outage.`}
            life={[`${INPUT.minV}-${INPUT.maxV} V, ${INPUT.maxA} A solar input`, `${e200.upsMs} ms switchover`]}
            priceUsd={e200.priceUsd}
            brand={e200.brand}
            productId={e200.id}
            productUrl={e200.url}
            category="battery"
            moreHref={whatItRunsPath(e200.id)}
            moreLabel="What it runs"
            disclose
          />
          <p className="text-xs text-muted mt-2">*Price on Bluetti&apos;s US site when we checked on {formatDate(e200.retrieved)} ({money(e200.priceUsd!)}); prices change often.</p>
        </section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer />
        <Sources items={DOCS.map((d) => ({ name: d.name, url: d.url, detail: d.what }))} />
        <HomeBackupLinks exclude={PATH} />
        <RelatedLinks
          links={[
            { href: "/home-backup", label: "Home backup: the four ways to connect", desc: "Cords, inlet and interlock, transfer switch, smart panel" },
            { href: whatItRunsPath(e200.id), label: "What the Elite 200 V2 runs", desc: "Run times for 15 household loads" },
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "How much solar keeps it topped up in winter, by state" },
            { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Every model we list, with dated prices" },
          ]}
        />
        <PhotoCredit name="solar-roof" />
      </div>
    </article>
  );
}
