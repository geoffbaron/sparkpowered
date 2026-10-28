import type { Metadata } from "next";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import { BigStat, HubHero, OurPick, PhotoCredit } from "@/components/ui";
import { BATTERY_FACTS } from "@/data/batteries";
import { BOATING_CHECKED, BOAT_BATTERIES } from "@/data/boating";
import { formatDate } from "@/lib/energy";
import { USABLE_FRACTION } from "@/lib/everyday";
import { money, productById } from "@/lib/products";
import { ELECTRONICS, electronicsById, electronicsHours, hoursLabel } from "@/lib/boating";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { batteryProduct, productList } from "@/lib/structured-data";
import { RedodoDeal } from "@/components/RedodoDeal";

const PATH = "/fish-finder-battery";
const TITLE = "Best Fish Finder Battery (2026): What Size, and How Long It Lasts";
const DESCRIPTION =
  "How long a fish finder and live sonar run on 10Ah, 30Ah and 50Ah lithium batteries, from Garmin, Humminbird and Lowrance's own power figures. Picks for kayaks, boats and ice fishing.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const DAKOTA_10AH = {
  name: "Dakota Lithium 12V 10Ah Mini",
  priceUsd: 85,
  energyWh: 128,
  url: "https://dakotalithium.com/product/12v-10ah-mini-deep-cycle-lifepo4-battery/",
};

export default function FishFinderBatteryPage() {
  const ff = BOAT_BATTERIES.find((b) => b.id === "redodo-16v-30ah-fish-finder")!;
  const k50 = BOAT_BATTERIES.find((b) => b.id === "redodo-12v-50ah-bluetooth-trolling")!;
  const elite30 = productById("bluetti-elite-30-v2");
  const helix10 = electronicsById("helix-10");
  const mega = electronicsById("mega-live");
  const helix7 = electronicsById("helix-7");
  const striker = electronicsById("striker");
  const livescope = electronicsById("livescope-plus");
  const proAmps = helix10.amps + mega.amps;
  const garminProAmps = electronicsById("echomap-7").amps + livescope.amps;

  const batteries = [
    { label: DAKOTA_10AH.name, wh: DAKOTA_10AH.energyWh, price: DAKOTA_10AH.priceUsd },
    { label: `Redodo ${ff.short}`, wh: ff.energyWh, price: ff.priceUsd },
    { label: `Redodo ${k50.short}`, wh: k50.energyWh, price: k50.priceUsd },
  ];

  const faqs = [
    {
      q: "What size battery do I need for a fish finder?",
      a: `Most fish finders draw about 1 A, so a 10Ah lithium runs one about ${Math.floor(electronicsHours(DAKOTA_10AH.energyWh, striker.amps))} hours, more than a long day. Add live sonar or a 10-inch screen and step up: a ${helix10.name} with MEGA Live draws about ${proAmps.toFixed(1)} A together, which a ${ff.short} battery runs for ${hoursLabel(electronicsHours(ff.energyWh, proAmps))}.`,
    },
    {
      q: "How long will a fish finder run on a battery?",
      a: "Divide the battery's watt-hours by the unit's watts (amps x 12). A 12V 10Ah lithium holds 128 Wh; a 1 A fish finder uses about 12 W, so about 10 hours. Check your unit's manual for its current draw; we list common ones on this page.",
    },
    {
      q: "Can I run my fish finder off my trolling motor battery?",
      a: "You can, with a fuse, and on a kayak it saves weight. Many bass anglers use a separate electronics battery so motor noise doesn't show up on the sonar and a long day on the trolling motor never shuts off the screens.",
    },
    {
      q: "Is a 16V battery OK for a fish finder?",
      a: "Many units are built for it. Garmin lists 10 to 20 V for its STRIKER series, Humminbird 10 to 20 V for MEGA Live, and LiveScope Plus takes 10 to 32 V. Check your unit's input range before buying, and use a charger with a 16 V lithium setting.",
    },
    {
      q: "What battery is best for ice fishing electronics?",
      a: "A lithium with low-temperature charge protection. It runs fine in the cold but must not be charged below 32°F, so charge it indoors or in the truck. Redodo's 16V 30Ah pauses charging below 32°F and keeps running down to -4°F.",
    },
  ];

  return (
    <article>
      <JsonLd data={productList(PATH, "Fish finder batteries", [ff, k50].map((b) => batteryProduct(b, PATH)))} />
      <HubHero
        image="power-station"
        crumbs={[
          { name: "Boating", path: "/boating" },
          { name: "Fish finder battery", path: PATH },
        ]}
        eyebrow="Fish finder batteries"
        title={<>Screens on from first light <span className="text-amber-300">to the last cast.</span></>}
        sub={
          <>
            A {money(ff.priceUsd)} lithium runs a 10-inch fish finder and live sonar for {hoursLabel(electronicsHours(ff.energyWh, proAmps))}, at{" "}
            {ff.weightLb} lb. Here is how long your electronics last on each size, from the makers&apos; own power figures.
          </>
        }
      >
        <a href="#hours" className="btn btn-primary">How long will mine last?</a>
        <a href="#picks" className="btn btn-light">See our picks</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Live sonar or big screens:</strong>{" "}
            <PartnerLink brand="redodo" productId={ff.id} productUrl={ff.url}>Redodo 16V 30Ah Fish Finder Battery</PartnerLink> ({money(ff.priceUsd)}).
            Made for MEGA Live, LiveScope and ActiveTarget setups, with a Bluetooth gauge and cold-charging protection.
          </p>
          <p>
            <strong>One basic fish finder on a kayak:</strong> a 10Ah lithium is plenty, such as the{" "}
            <PlainLink href={DAKOTA_10AH.url}>{DAKOTA_10AH.name}</PlainLink> ({money(DAKOTA_10AH.priceUsd)}).{" "}
            <strong>Fish finder plus trolling motor on one battery:</strong>{" "}
            <PartnerLink brand="redodo" productId={k50.id} productUrl={k50.url}>Redodo 12V 50Ah</PartnerLink> ({money(k50.priceUsd)}).
          </p>
        </QuickAnswer>

        <RedodoDeal className="mt-4" />

        <section aria-label="Fish finder battery at a glance" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat tone="leaf" value={hoursLabel(electronicsHours(DAKOTA_10AH.energyWh, striker.amps)).replace("about ", "")} label="A 1 A fish finder on 10Ah" note="Garmin STRIKER rated current" />
          <BigStat value={hoursLabel(electronicsHours(ff.energyWh, proAmps)).replace("about ", "")} label="HELIX 10 + MEGA Live" note={`On Redodo's ${ff.short}`} />
          <BigStat tone="orange" value={`${ff.weightLb} lb`} label="For a full live-sonar day" note={`${money(ff.priceUsd)} when we checked`} />
        </section>

        <Section title="How long your electronics run" id="hours">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[44rem]">
              <caption className="sr-only">Fish finder runtime by battery</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Unit (maker&apos;s draw)</th>
                  {batteries.map((b) => (
                    <th key={b.label} scope="col" className="p-3 font-semibold">{b.label} ({money(b.price)})</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ELECTRONICS.map((e) => (
                  <tr key={e.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium"><PlainLink href={e.url}>{e.name}</PlainLink> <span className="text-muted">({e.amps} A)</span></th>
                    {batteries.map((b) => (
                      <td key={b.label} className="p-3">{hoursLabel(electronicsHours(b.wh, e.amps))}</td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-black/6 bg-amber-50">
                  <th scope="row" className="p-3 font-medium">HELIX 10 + MEGA Live ({proAmps.toFixed(2)} A)</th>
                  {batteries.map((b) => (
                    <td key={b.label} className="p-3 font-semibold">{hoursLabel(electronicsHours(b.wh, proAmps))}</td>
                  ))}
                </tr>
                <tr className="border-t border-black/6 bg-amber-50">
                  <th scope="row" className="p-3 font-medium">ECHOMAP UHD2 7x + LiveScope Plus ({garminProAmps.toFixed(2)} A)</th>
                  {batteries.map((b) => (
                    <td key={b.label} className="p-3 font-semibold">{hoursLabel(electronicsHours(b.wh, garminProAmps))}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Draws from each maker&apos;s manual or spec sheet (Lowrance from its spec sheet as posted by a dealer); LiveScope Plus is its 21 W typical
            figure divided by 12 V. Hours are the battery&apos;s rated watt-hours divided by watts at 12 V. Screen brightness and transducer settings
            change the draw. Prices checked {formatDate(BOATING_CHECKED)}.
          </p>
        </Section>

        <section id="picks" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="picks-heading">
          <h2 id="picks-heading" className="text-2xl font-extrabold text-ink">Our picks</h2>
          <OurPick
            label="Best for live sonar and bass boats"
            name={`Redodo ${ff.short}`}
            icon="chart"
            why="A dedicated electronics battery at 16 V, which Redodo says gives a brighter screen, in a case small enough to tuck under a console. It keeps your sonar on even after a long day drains the trolling batteries."
            life={[`HELIX 10 + MEGA Live: ${hoursLabel(electronicsHours(ff.energyWh, proAmps))}`, `${ff.weightLb} lb`, "Bluetooth gauge", "Charging pauses below 32°F"]}
            priceUsd={ff.priceUsd}
            brand="redodo"
            productId={ff.id}
            productUrl={ff.url}
            category="battery"
          />
          <OurPick
            label="Best for a kayak: one battery for motor and screen"
            name={`Redodo ${k50.short}`}
            icon="water"
            why={`Runs a trolling motor up to ${k50.maxThrustLb} lb thrust and a fish finder from one ${k50.weightLb} lb battery. A HELIX 7 alone would run for ${hoursLabel(electronicsHours(k50.energyWh, helix7.amps))} on it.`}
            life={[`${k50.energyWh} Wh`, `${k50.weightLb} lb`]}
            priceUsd={k50.priceUsd}
            brand="redodo"
            productId={k50.id}
            productUrl={k50.url}
            category="battery"
            moreHref="/kayak-trolling-motor-battery"
            moreLabel="Kayak battery guide"
          />
          <OurPick
            label="Best for the ice shelter"
            name={`Bluetti ${elite30.model}`}
            icon="heat"
            why={`A ${elite30.capacityWh} Wh power station with a 12 V car outlet for the fish finder, plus USB and wall-style outlets for phones, lights and a camera. It sits on the ice, not on your sled seat.`}
            life={[`1 A fish finder: ${hoursLabel(electronicsHours(elite30.capacityWh * USABLE_FRACTION, 1))}`, `${elite30.capacityWh} Wh`]}
            priceUsd={elite30.priceUsd}
            brand="bluetti"
            productId={elite30.id}
            productUrl={elite30.url}
            category="battery"
          />
        </section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;Any old car battery will do.&quot;</strong> A car battery is built for short bursts to start an engine, not to be run down
              all day, and it weighs several times as much as a small lithium. A deep-cycle lithium gives you all of its power and tells you how
              much is left.
            </Callout>
            <Callout>
              <strong>&quot;Lithium won&apos;t work for ice fishing.&quot;</strong> It discharges in the cold; it just must not be charged below 32°F (
              <a href={BATTERY_FACTS.coldCharging.url} className="underline" rel="noopener">Battery University</a>). Pick one that pauses charging in the
              cold, and charge it at home.
            </Callout>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Runtimes are estimates from published current draw. Prices and specs are copied from makers&apos; US websites on the dates shown and
          change often. Redodo and Bluetti links are sponsored; Dakota Lithium and the fish finder makers are plain links.
        </Disclaimer>
        <Sources
          items={[
            { name: `${ff.name} product page`, url: ff.url, detail: `checked ${formatDate(ff.retrieved)}` },
            { name: `${k50.name} product page`, url: k50.url, detail: `checked ${formatDate(k50.retrieved)}` },
            { name: `${DAKOTA_10AH.name} product page`, url: DAKOTA_10AH.url, detail: `checked ${formatDate(BOATING_CHECKED)}` },
            { name: `Bluetti ${elite30.model} product page`, url: elite30.url, detail: `checked ${formatDate(elite30.retrieved)}` },
            ...ELECTRONICS.map((e) => ({ name: e.name, url: e.url, detail: `${e.amps} A, ${e.basis}` })),
            { name: BATTERY_FACTS.coldCharging.name, url: BATTERY_FACTS.coldCharging.url },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/boating", label: "Electric boating and fishing", desc: "Every guide in one place" },
            { href: "/kayak-trolling-motor-battery", label: "Kayak trolling motor battery", desc: "Light batteries that last the day" },
            { href: "/charge-lithium-battery-on-boat", label: "Charging on the boat", desc: "Keep the electronics battery topped up" },
            { href: "/best-power-station-for-cpap", label: "Power stations", desc: "For camp, cabin and the ice shelter" },
          ]}
        />
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
