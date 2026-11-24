import type { Metadata } from "next";
import Link from "next/link";
import Byline from "@/components/Byline";
import { AffiliateDisclosure } from "@/components/affiliate";
import { HomeBackupLinks, WhatWeChecked, type CheckedSource } from "@/components/home-backup";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { HubHero, OurPick, PhotoCredit } from "@/components/ui";
import { AFFILIATES } from "@/data/affiliates";
import type { Product } from "@/data/products";
import { hoursText, loadPageProducts, usableWh } from "@/lib/can-it-run";
import { formatDate } from "@/lib/energy";
import { OFFGRID_SOURCES, USABLE_FRACTION } from "@/lib/offgrid";
import { fullName } from "@/lib/products";
import { JsonLd, pageMetadata, url, AUTHOR_REF, pageUpdated } from "@/lib/seo";

const PATH = "/home-backup/pellet-stove";
const UPDATED = "2026-11-14";
const TITLE = "Power Station for a Pellet Stove: Watts and Hours";
const DESCRIPTION =
  "What a pellet stove draws while the igniter is on and once it is burning, from US Stove, Harman and PelPro manuals; hours of heat from each power station; pure sine wave and UPS switchover time.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const READ = "2026-11-14";

/** Electrical ratings as printed in each owner's manual. Where a manual gives amps, watts = volts × amps (US DOE). */
interface Stove {
  id: string;
  maker: string;
  model: string;
  volts: number;
  igniterW: number;
  runW: number;
  printed: string;
  doc: CheckedSource;
}

const amps = (volts: number, a: number) => Math.round(volts * a);

const STOVES: Stove[] = [
  {
    id: "usstove-5660",
    maker: "US Stove",
    model: "5660",
    volts: 120,
    igniterW: 346,
    runW: 180,
    printed: "115-120 V, 60 Hz, 3.0 A; 180 W operational, 346 W igniter running",
    doc: { name: "US Stove 5660 owner's manual (851901T-0503J)", url: "https://www.usstove.com/wp-content/uploads/2023/05/5660-Owners-Manual.pdf", read: READ, what: "electrical rating; surge protector required; no heat in an outage" },
  },
  {
    id: "usstove-5522",
    maker: "US Stove",
    model: "US5522-W",
    volts: 120,
    igniterW: 332,
    runW: 162,
    printed: "110-120 V AC, 60 Hz, 3.0 A; about 162 W operational, about 332 W igniter running",
    doc: { name: "US Stove US5522-W owner's manual (854002-0606M)", url: "https://www.usstove.com/wp-content/uploads/2023/08/854002-US5522-W-EN_FR.pdf", read: READ, what: "electrical rating" },
  },
  {
    id: "harman-p43",
    maker: "Harman",
    model: "P43, P61 and P68",
    volts: 120,
    igniterW: amps(120, 4.2),
    runW: amps(120, 2.8),
    printed: "120 V AC, 60 Hz, start 4.2 A, run 2.8 A",
    doc: {
      name: "Harman P-Series owner's manual (8390-044C)",
      url: "https://assets.pellet-stove-parts-4less.com/website/manufacturers/harman/pellet/models/p43-c/harman-p43-c-owners-manual_mod_01.pdf",
      read: READ,
      what: "electrical rating; approved battery back-ups only; power failure stops the combustion blower; copy hosted by a parts store; Harman's own download server would not load for us",
    },
  },
  {
    id: "pelpro-pp130",
    maker: "PelPro",
    model: "PP130",
    volts: 120,
    igniterW: amps(120, 2.6),
    runW: amps(120, 2.3),
    printed: "120 V AC, 60 Hz, start 2.6 A, run 2.3 A (on high)",
    doc: {
      name: "PelPro PP130 owner's manual (7086-171I, May 2015)",
      url: "https://assets.pellet-stove-parts-4less.com/website/manufacturers/pelpro/pellet/models/pp130/pelpro-pp130-owners-manual_mod_01.pdf",
      read: READ,
      what: "electrical rating; surge protector recommended; copy hosted by a parts store",
    },
  },
];

const HARMAN_BACKUP: CheckedSource = {
  name: "Harman, Battery Backup Options (HAR-0040U-0718)",
  url: "https://hearth.com/talk/attachments/har-battery-back-up-options-pdf.231401",
  read: READ,
  what: "pure sine wave back-ups need no stove setting change; others need Continue Operation set; copy posted on the Hearth.com forum; we found no Harman-hosted copy",
};

const ENGLANDER: CheckedSource = {
  name: "Englander 25-PDVC installation and operation manual (46313A)",
  url: "https://cdn.shopify.com/s/files/1/0782/2077/files/25PVD.pdf",
  read: READ,
  what: "after a power cut the stove restarts or stays off; no electrical rating printed; a Shopify-hosted copy; we could not confirm whose store",
};

const DOCS: CheckedSource[] = [...STOVES.map((s) => s.doc), HARMAN_BACKUP, ENGLANDER, { name: OFFGRID_SOURCES.doeFormula.name, url: OFFGRID_SOURCES.doeFormula.url, read: READ, what: "watts = volts × amps" }];

const switchText = (p: Product) => (p.upsMs != null ? `${p.upsMs} ms` : "Not stated");

export default function PelletStovePage() {
  const products = loadPageProducts().sort((a, b) => a.capacityWh - b.capacityWh);
  const lo = STOVES.reduce((a, b) => (b.runW < a.runW ? b : a));
  const hi = STOVES.reduce((a, b) => (b.runW > a.runW ? b : a));
  const peak = STOVES.reduce((a, b) => (b.igniterW > a.igniterW ? b : a));
  const smallest = products.filter((p) => p.acOutputW >= peak.igniterW).sort((a, b) => a.acOutputW - b.acOutputW)[0];

  // The page's pick: the smallest in-stock station from makers we work with that states a UPS
  // switchover time and runs the bigger stove through a 12-hour night. No prices (we link out).
  const fits = products.filter((p) => AFFILIATES[p.brand].tracked && p.upsMs != null);
  const pick = fits.find((p) => usableWh(p) / hi.runW >= 12) ?? fits[fits.length - 1];
  const ms = products.map((p) => p.upsMs).filter((x): x is number => x != null);
  const msLo = Math.min(...ms);
  const msHi = Math.max(...ms);
  const h = (p: Product, w: number) => hoursText(usableWh(p) / w);
  /** Rated kWh for 12 hours at the bigger stove's running watts. */
  const nightKwh = ((hi.runW * 12) / USABLE_FRACTION / 1000).toFixed(1);

  const faqs = [
    {
      q: "How many watts does a pellet stove use?",
      a: `Two numbers matter. While the igniter heats up, the stoves we checked draw about ${Math.min(...STOVES.map((s) => s.igniterW))} to ${peak.igniterW} W; once the fire is lit they settle to about ${lo.runW} to ${hi.runW} W for the blowers and auger. Those come from the electrical ratings in US Stove, Harman and PelPro manuals. Your stove's own manual or label gives its figures.`,
    },
    {
      q: "What size power station do I need for a pellet stove?",
      a: `Output is easy: any station that delivers at least ${peak.igniterW} W covers the igniter of every stove we checked. Capacity sets the hours. At ${hi.runW} W (a Harman P-Series on its maximum rating), a 2 kWh station gives about ${hoursText((2000 * USABLE_FRACTION) / hi.runW).replace("about ", "")} of heat; at ${lo.runW} W (US Stove US5522-W) about ${hoursText((2000 * USABLE_FRACTION) / lo.runW).replace("about ", "")}. For a 12-hour night on the bigger stove, look at about ${nightKwh} kWh, or recharge between burns.`,
    },
    {
      q: "Does a pellet stove need a pure sine wave power station?",
      a: "Use one. Harman's battery back-up sheet says a pure sine wave unit needs no change to the stove, while non-sine units need a dealer to set the stove to Continue Operation, or it shuts down when it senses the power. Check that the station's spec sheet says pure sine wave; the one we pick below does.",
    },
    {
      q: "Will the stove keep running when the power goes out?",
      a: "Only if the station switches over fast enough and the stove accepts it, and no stove maker we read says that a switchover of ${msLo} to ${msHi} ms is fine. Harman's manual says a power failure stops the combustion blower, which can let exhaust into the room, and that a plain UPS gives a safe shutdown only. Englander's manual says a stove that loses power for under about three minutes goes back to start-up. The safe way to use a station is to plug the stove into it and run it from the battery as its own supply.",
    },
    {
      q: "Can I plug the stove into the power station with an extension cord?",
      a: "Plug it straight into the station's outlet, through the surge protector your stove's manual calls for (US Stove requires one; Harman and PelPro recommend one), and skip the extension cord: move the station next to the stove instead, outside the stove's clearances. Never feed the station's output into a wall outlet or the house wiring; charging it from the wall is fine.",
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
          author: AUTHOR_REF,
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          mainEntityOfPage: url(PATH),
        }}
      />
      <HubHero
        byline={<Byline path={PATH} tone="dark" />}
        image="power-station"
        crumbs={[
          { name: "Home backup", path: "/home-backup" },
          { name: "Pellet stove", path: PATH },
        ]}
        eyebrow="Pellet stove backup"
        title={<>No power, no pellet heat. <span className="text-amber-300">A battery fixes that.</span></>}
        sub={<>A pellet stove needs a few hundred watts to light and less to keep burning. Here is how many hours each power station buys you.</>}
      >
        <a href="#hours" className="btn btn-primary">Hours of heat</a>
        <a href="#switchover" className="btn btn-light">Switchover and sine wave</a>
      </HubHero>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-4">
          Updated <time dateTime={UPDATED}>{formatDate(UPDATED)}</time>
        </p>

        <QuickAnswer>
          <p>
            Pellet stoves draw the most while the igniter is on, up to {peak.igniterW} W on the stoves we checked, then about {lo.runW} to{" "}
            {hi.runW} W once burning. So output is rarely the problem; capacity is. A 3 kWh station runs a bigger stove about {hoursText((3000 * USABLE_FRACTION) / hi.runW).replace("about ", "")}; a full
            12-hour night on it takes about {nightKwh} kWh. Use a pure sine wave station, plug the stove straight into it, and don&apos;t count on it taking over mid-burn: no stove
            maker we read approves that.
          </p>
        </QuickAnswer>


        <Section title="Igniter watts vs running watts, from the manuals" id="watts">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[38rem]">
              <caption className="sr-only">Igniter and running watts for four pellet stoves, from their owner&apos;s manuals</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Stove</th>
                  <th scope="col" className="p-3 font-semibold text-right">Igniter on</th>
                  <th scope="col" className="p-3 font-semibold text-right">Running</th>
                  <th scope="col" className="p-3 font-semibold">As printed in the manual</th>
                </tr>
              </thead>
              <tbody>
                {STOVES.map((s) => (
                  <tr key={s.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{s.maker} {s.model}</th>
                    <td className="p-3 text-right tabular-nums">{s.igniterW} W</td>
                    <td className="p-3 text-right tabular-nums font-semibold">{s.runW} W</td>
                    <td className="p-3 text-stone-700">{s.printed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Harman and PelPro print amps; we multiplied by 120 V (watts = volts × amps, US Department of Energy). Amps on a rating plate are a
            ceiling, so a stove on a low setting usually draws less. Harman and PelPro are both Hearth &amp; Home Technologies brands.
          </p>
          <p className="text-stone-700 mt-4 max-w-3xl">
            The igniter only runs while the stove is lighting, then the stove drops to its running draw: combustion blower,
            room fan and auger. That is why the running figure sets how long a battery lasts, and the igniter figure only sets the smallest
            output you can use. Here the smallest station on our list that covers every igniter is the {fullName(smallest)} ({smallest.acOutputW.toLocaleString("en-US")} W).
          </p>
        </Section>

        <Section title="Hours of heat from each power station" id="hours">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[40rem]">
              <caption className="sr-only">Hours each in-stock power station runs a pellet stove, and its UPS switchover time</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Power station</th>
                  <th scope="col" className="p-3 font-semibold text-right">At {lo.runW} W ({lo.maker} {lo.model})</th>
                  <th scope="col" className="p-3 font-semibold text-right">At {hi.runW} W ({hi.maker} {hi.model.split(",")[0]})</th>
                  <th scope="col" className="p-3 font-semibold text-right">UPS switchover</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{fullName(p)}</th>
                    <td className="p-3 text-right tabular-nums">{h(p, lo.runW)}</td>
                    <td className="p-3 text-right tabular-nums">{h(p, hi.runW)}</td>
                    <td className="p-3 text-right tabular-nums">{switchText(p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Hours = usable watt-hours ({Math.round(USABLE_FRACTION * 100)}% of the rated capacity) ÷ the stove&apos;s running watts, the same formula as our{" "}
            <Link href="/power-outage-backup-calculator" className="underline underline-offset-2">outage calculator</Link>. Switchover times
            are each maker&apos;s published figure. In-stock stations only, from each maker&apos;s US site; dates are in our product data.
          </p>
        </Section>

        <Section title="Switchover time and pure sine wave" id="switchover">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              Most stations can sit between the wall and the stove and take over when the power cuts out, in the {msLo} to {msHi} thousandths of a
              second shown above. Whether a stove rides through that gap is up to its control board, and none of the manuals we read says it
              will. Englander&apos;s says a stove that loses power for less than about three minutes goes back into its start-up cycle; one off
              for longer stays off until you restart it.
            </p>
            <p>
              Harman is the one maker that addresses back-ups directly. Its manual says to use only Harman-approved battery back-ups and that
              some generator or battery systems may not suit the stove&apos;s electronics. Its back-up sheet says a pure sine wave unit needs no
              change to the stove, while non-sine units need a dealer to set Continue Operation. A power station is not on Harman&apos;s list, so
              ask your dealer before relying on one.
            </p>
            <p>
              What that means in practice: when an outage starts, let the stove finish its shutdown or restart it on the station, then leave it
              running from the battery. Recharge the station from solar or a generator between nights.
            </p>
          </div>
        </Section>

        <Section title="Safety" id="safety">
          <Callout tone="warn">
            <p>
              <strong>A pellet stove that loses power can push smoke into the room.</strong> Harman says a power failure stops the combustion
              blower; US Stove says to check for smoke and open a window; Englander says not to open the hopper or door if smoke comes out.
              Keep working carbon monoxide alarms on every level of the home (Ready.gov).
            </p>
            <p className="mt-2">
              Plug the stove straight into the power station, through the surge protector its manual calls for, and keep the station away
              from the stove&apos;s heat and its clearances. Charging the station from a wall outlet is fine; feeding its output back into the house wiring, through a
              wall or dryer outlet or a cord with plugs on both ends is illegal and can kill utility lineworkers. Hard-wiring a station
              to the house needs a transfer switch installed by a licensed electrician with a permit.
            </p>
          </Callout>
        </Section>

        <section className="mt-12" aria-labelledby="pick-heading">
          <h2 id="pick-heading" className="text-2xl font-bold mb-4">Smallest that heats a full night</h2>
          <AffiliateDisclosure className="mt-12 mb-4" />
          <OurPick
            label="Smallest that heats a 12-hour night, with a stated switchover"
            name={fullName(pick)}
            why={`Of the in-stock stations from makers we work with that publish a switchover time, it is the smallest that runs the bigger stove through a 12-hour night: ${h(pick, hi.runW)} on the bigger stove's rating and ${h(pick, lo.runW)} on the smaller one. Pure sine wave, ${pick.acOutputW.toLocaleString("en-US")} W output and a ${pick.upsMs} ms switchover, per its maker.`}
            life={[`Big stove: ${h(pick, hi.runW)}`, `Small stove: ${h(pick, lo.runW)}`]}
            brand={pick.brand}
            productId={pick.id}
            productUrl={pick.url}
            category="battery"
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
            { href: "/home-backup/well-pump", label: "Power station for a well pump", desc: "Starting watts from the pump's nameplate" },
          ]}
        />
        <Sources title="More sources" id="more-sources-heading" checked={pageUpdated(PATH)} items={[...DOCS.map((d) => ({ name: d.name, url: d.url, detail: d.what })), OFFGRID_SOURCES.readyOutage]} />
        <WhatWeChecked items={DOCS} untested="a pellet stove on any power station" className="mt-14" />
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
