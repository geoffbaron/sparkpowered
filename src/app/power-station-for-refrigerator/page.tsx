import type { Metadata } from "next";
import Link from "next/link";
import Byline from "@/components/Byline";
import WhatItRunsLinks from "@/components/WhatItRunsLinks";
import { ArticleJsonLd } from "@/components/article-jsonld";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { FridgeCycleDiagram } from "@/components/backup-diagrams";
import { Breadcrumbs, Callout, Disclaimer, Faq, RelatedLinks, Section } from "@/components/content";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import { HomeBackupLinks, WhatWeChecked } from "@/components/home-backup";
import { FridgePicker, type RuntimeOption } from "@/components/RuntimePicker";
import { AFFILIATES } from "@/data/affiliates";
import { sources } from "@/data/backup-sources";
import type { Product } from "@/data/products";
import { FRIDGE_RECS } from "@/lib/backup-math";
import { motorSurgeW } from "@/lib/can-it-run";
import { USABLE_FRACTION } from "@/lib/everyday";
import { fullName, productById } from "@/lib/products";
import { pageMetadata, pageUpdated } from "@/lib/seo";

const PATH = "/power-station-for-refrigerator";
const TITLE = "Power Station for a Fridge and Freezer in an Outage";
const DESCRIPTION =
  "How long a power station keeps a fridge and freezer cold in an outage, worked out from EIA's appliance data: running vs starting watts, how to stretch the battery with the CDC's 4-hour and 48-hour rules, and a calculator for your fridge.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const IDS = [
  "bluetti-ac180",
  "bluetti-elite-100-v2",
  "bluetti-elite-200-v2",
  "bluetti-elite-300",
  "bluetti-elite-400",
  "anker-solix-c1000-gen-2",
  "ecoflow-delta-3-max",
  "jackery-explorer-2000-v2",
  "growatt-infinity-2000-pro",
];

const link = "text-spark-orange underline underline-offset-2";
const FRIDGE_WH = FRIDGE_RECS.mostUsedWhDay;
const FREEZER_WH = FRIDGE_RECS.freezerWhDay;
/** Hours a station runs a daily load, at the site's usable fraction. */
const hoursFor = (capacityWh: number, whPerDay: number) => ((capacityWh * USABLE_FRACTION) / whPerDay) * 24;
const hText = (h: number) => (h < 36 ? `${Math.round(h)} hours` : `${Math.round((h / 24) * 2) / 2} days`);
/** EWEB's generator sheet: refrigerator/freezer 700 W running plus 2,200 W more to start. */
const EWEB_START_W = 700 + 2200;

function opt(p: Product): RuntimeOption {
  return { id: p.id, name: fullName(p), brand: AFFILIATES[p.brand].tracked ? p.brand : null, capacityWh: p.capacityWh, url: p.url };
}

export default function FridgePage() {
  const updated = pageUpdated(PATH);
  const products = IDS.map(productById).sort((a, b) => a.capacityWh - b.capacityWh);
  const n = (x: number) => Math.round(x).toLocaleString("en-US");
  const both = FRIDGE_WH + FREEZER_WH;
  const ex = 2048; // a 2 kWh station, worked example

  const faqs = [
    {
      q: "How long will a power station run a refrigerator?",
      a: `Divide the usable watt-hours by what the fridge uses. EIA puts a home's main fridge at about ${FRIDGE_RECS.mostUsedKwhYear} kWh a year, or ${n(FRIDGE_WH)} Wh a day. With about ${Math.round(USABLE_FRACTION * 100)}% of a station's capacity usable, a 1 kWh station runs it about ${hText(hoursFor(1024, FRIDGE_WH))}, a 2 kWh station about ${hText(hoursFor(2048, FRIDGE_WH))} and a 3.8 kWh station about ${hText(hoursFor(3840, FRIDGE_WH))}. Use the kWh a year on your own fridge's yellow EnergyGuide label for a closer figure.`,
    },
    {
      q: "What size power station do I need for a refrigerator?",
      a: `Two numbers. Capacity sets how long: about 2 kWh for a full day. Output sets whether it starts: the compressor spikes for a moment, and an owner on DIY Solar Forum measured 2,510 W at start on a fridge that ran at 79 W. EWEB's generator guide budgets ${n(EWEB_START_W)} W for a fridge start. Look for a motor surge rating at least that big, not a heating-only \"lifting\" figure.`,
    },
    {
      q: "Can a 1000W power station run a refrigerator?",
      a: "Often, yes: a fridge runs at well under 1,000 W once started. Whether it starts depends on the station's surge rating against your compressor's spike, which some owners measure at 1,000 W and others at 2,500 W. Capacity is the other limit: a 1 kWh station gives about half a day.",
    },
    {
      q: "How long will a power station run a chest freezer?",
      a: `EIA puts a separate freezer at about ${FRIDGE_RECS.freezerKwhYear} kWh a year, ${n(FREEZER_WH)} Wh a day. A 2 kWh station runs one about ${hText(hoursFor(2048, FREEZER_WH))}. But a full freezer kept closed holds food for 48 hours without power (CDC), so in a short outage you may not need to power it at all.`,
    },
    {
      q: "Do I have to run the fridge all the time in an outage?",
      a: "No. The CDC says food lasts 4 hours in a closed fridge without power, 48 hours in a full freezer and 24 in a half-full one. Run the fridge for a few hours, then rest it with the door shut, and check an appliance thermometer: 40°F or below in the fridge, 0°F or below in the freezer.",
    },
    {
      q: "Can a power station damage my fridge?",
      a: "Not if it has enough output. Frigidaire's manual warns that running a fridge on insufficient power can damage the compressor and asks for a dedicated 115 V outlet. Plug the fridge straight into the station with a heavy-duty cord rated for the load, and keep the station away from the back of the fridge, where Frigidaire says portable power supplies should not sit. GE says the sudden start when power returns won't harm a refrigerator.",
    },
    {
      q: "Can I run a fridge and a freezer on one power station?",
      a: `Yes, if its output covers one compressor start while the other is running. Together they use about ${n(both)} Wh a day, so a 2 kWh station runs both about ${hText(hoursFor(ex, both))}. Running them in shifts, or leaving a full freezer closed, stretches that.`,
    },
  ];

  return (
    <article>
      <ArticleJsonLd path={PATH} headline={TITLE} description={DESCRIPTION} published="2026-10-19" modified={updated} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ name: "Fridge and freezer", path: PATH }]} />
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-2">Outage essentials</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">Keeping a fridge and freezer cold on a power station</h1>
        <Byline path={PATH} />

        <QuickAnswer>
          <p>
            <strong>A home&apos;s main fridge uses about {n(FRIDGE_WH)} Wh a day</strong> and a separate freezer about {n(FREEZER_WH)} Wh (EIA).
            So a 1 kWh station runs the fridge about {hText(hoursFor(1024, FRIDGE_WH))}, a 2 kWh station about {hText(hoursFor(2048, FRIDGE_WH))}
            , and a 3.8 kWh one nearly {hText(hoursFor(3840, FRIDGE_WH))}.
          </p>
          <p>
            The station also has to <strong>start the compressor</strong>: an owner measured 2,510 W at start on a fridge that ran at 79 W. And you
            don&apos;t have to run it non-stop: the CDC says a closed fridge keeps food 4 hours and a full freezer 48 hours without power.
          </p>
        </QuickAnswer>

        <Section title="Running watts and starting watts" id="watts">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              A fridge doesn&apos;t draw steady power. The compressor switches on, spikes for a moment, runs, then rests. The average over the day
              sets how long the battery lasts; the spike sets how big the station&apos;s inverter must be.
            </p>
          </div>
          <FridgeCycleDiagram />
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[36rem]">
              <caption className="sr-only">Refrigerator starting and running watts from three sources</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Source</th>
                  <th scope="col" className="p-3 font-semibold text-right">Start</th>
                  <th scope="col" className="p-3 font-semibold text-right">Running</th>
                  <th scope="col" className="p-3 font-semibold">How measured</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">EWEB generator sizing guide</th>
                  <td className="p-3 text-right tabular-nums">{n(EWEB_START_W)} W</td>
                  <td className="p-3 text-right tabular-nums">700 W</td>
                  <td className="p-3">A utility&apos;s planning figure for a fridge or freezer; deliberately on the high side</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">Owner, clamp meter (2021)</th>
                  <td className="p-3 text-right tabular-nums">2,510 W</td>
                  <td className="p-3 text-right tabular-nums">79 W</td>
                  <td className="p-3">Inrush mode on a clamp meter: 20.92 A × 120 V</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">Owner, plug-in meter (2020)</th>
                  <td className="p-3 text-right tabular-nums">1,000-1,100 W</td>
                  <td className="p-3 text-right tabular-nums">80-100 W</td>
                  <td className="p-3">A plug-in watt meter; replies note these can miss the true spike</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-stone-700 mt-3 max-w-3xl">
            Two more things from the same threads and manuals: a defrost heater can pull a few hundred watts to about 1 kW while it runs, and
            newer variable-speed fridges run almost all the time at low power (Frigidaire&apos;s manual says its variable-speed compressor runs
            nearly 100% of the time). Your fridge&apos;s yellow EnergyGuide label gives its kWh a year, which already counts all of that.
          </p>
        </Section>

        <Section title="A worked example: one outage, one 2 kWh station" id="example">
          <div className="space-y-3 text-stone-700 leading-relaxed max-w-3xl">
            <p>
              Say the power goes out at 6 pm with a 2,048 Wh station, a fridge and a full chest freezer. Usable energy: about{" "}
              {n(ex * USABLE_FRACTION)} Wh.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Run both, all the time:</strong> {n(both)} Wh a day, so about {hText(hoursFor(ex, both))}.
              </li>
              <li>
                <strong>Run only the fridge, leave the full freezer shut:</strong> the CDC gives a full freezer 48 hours closed. The fridge alone
                gets about {hText(hoursFor(ex, FRIDGE_WH))}.
              </li>
              <li>
                <strong>Then shifts:</strong> the CDC gives a closed fridge 4 hours. Running it half the time makes the same battery last about twice as long, as long as
                the thermometer stays at 40°F or below.
              </li>
            </ul>
            <p>
              Plan your own with the <Link href="/power-outage-backup-calculator" className={link}>power outage backup calculator</Link>, which adds
              Wi-Fi, lights, a CPAP or a well pump, or put your fridge&apos;s label in the calculator below.
            </p>
          </div>
        </Section>

        <section id="picker" className="mt-12 scroll-mt-24" aria-labelledby="picker-heading">
          <h2 id="picker-heading" className="text-2xl font-extrabold text-ink mb-2">How long for your fridge?</h2>
          <p className="text-stone-700 mb-4 max-w-3xl">
            Pick a station and use the kWh per year on your fridge&apos;s yellow EnergyGuide label. The default uses EIA&apos;s figure for all the
            fridges in an average home, which is higher than one kitchen fridge.
          </p>
          <FridgePicker options={products.map(opt)} />
        </section>

        <Section title="Plugging it in safely" id="safety">
          <div className="grid gap-3">
            <Callout>
              <strong>Straight into the station.</strong> Frigidaire&apos;s manual asks for a dedicated 115 V outlet and warns that insufficient
              power can damage the compressor. One heavy-duty, three-prong cord rated for the load; no power strips (OSHA, CPSC).
            </Callout>
            <Callout>
              <strong>Not behind the fridge.</strong> Frigidaire says not to put portable power supplies at the rear of the appliance. Give the
              station its own space.
            </Callout>
            <Callout tone="warn">
              <strong>Never into a wall outlet.</strong> Feeding a station&apos;s output into a household outlet to power the kitchen circuit is
              backfeeding (CPSC). To power the fridge&apos;s own circuit, see the{" "}
              <Link href="/home-backup" className="underline underline-offset-2">safe ways to connect</Link>.
            </Callout>
          </div>
        </Section>

        <Section title="How long each station runs a fridge" id="compare">
          <AffiliateDisclosure className="mb-4" />
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[42rem]">
              <caption className="sr-only">Hours each power station runs a typical fridge, and a fridge plus freezer, with each maker&apos;s output and motor surge figures</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Power station</th>
                  <th scope="col" className="p-3 font-semibold text-right">Capacity</th>
                  <th scope="col" className="p-3 font-semibold text-right">Fridge</th>
                  <th scope="col" className="p-3 font-semibold text-right">Fridge + freezer</th>
                  <th scope="col" className="p-3 font-semibold text-right">Motor surge in specs</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">
                      {AFFILIATES[p.brand].tracked ? (
                        <PartnerLink brand={p.brand} productId={p.id} productUrl={p.url}>{fullName(p)}</PartnerLink>
                      ) : (
                        <PlainLink href={p.url}>{fullName(p)}</PlainLink>
                      )}
                    </th>
                    <td className="p-3 text-right tabular-nums">{n(p.capacityWh)} Wh</td>
                    <td className="p-3 text-right tabular-nums font-semibold">{hText(hoursFor(p.capacityWh, FRIDGE_WH))}</td>
                    <td className="p-3 text-right tabular-nums">{hText(hoursFor(p.capacityWh, both))}</td>
                    <td className="p-3 text-right tabular-nums">{n(motorSurgeW(p))} W</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Capacity and output from each maker&apos;s US product page. Where a maker&apos;s higher surge figure is for heating loads only (Bluetti&apos;s
            &quot;Power Lifting&quot;), we show the continuous output instead. Bluetti and Anker links are sponsored; the others are plain links. We
            don&apos;t list prices.
          </p>
        </Section>

        <WhatItRunsLinks />
        <Faq items={faqs} path={PATH} />
        <HomeBackupLinks exclude={PATH} />
        <RelatedLinks
          links={[
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "Fridge, freezer, CPAP, well pump and furnace" },
            { href: "/home-backup", label: "Connect a power station safely", desc: "When you want the kitchen circuit, not a cord" },
          ]}
        />
        <Disclaimer>
          Fridge use varies with size, age, the room&apos;s temperature and how often the door opens. Our figures use EIA averages and assume{" "}
          {Math.round(USABLE_FRACTION * 100)}% of rated capacity is usable.
        </Disclaimer>
        <WhatWeChecked
          className="mt-14"
          untested="any power station on a fridge or freezer"
          items={[
            ...sources("eiaRecs53b", "cdcFood", "eweb", "forumFridgeClamp", "forumFridgeKillAWatt", "frigidaire", "geOutage", "whirlpoolOutage", "cpsc", "osha", "eiaOutages"),
            ...products.map((p) => ({ name: `${fullName(p)} product page`, url: p.sourceUrl, read: p.retrieved, what: "capacity, output and surge figures" })),
          ]}
        />
      </div>
    </article>
  );
}
