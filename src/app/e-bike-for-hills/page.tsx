import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { EbikeAlternativeNote, EbikeTable, ebikeName, ebikeSources } from "@/components/ebikes";
import { HubHero, OurPick, PhotoCredit } from "@/components/ui";
import { EBIKES_CHECKED, EBIKE_ALTERNATIVES, ebikeById, ebikeSaleNote } from "@/data/ebikes";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

const PATH = "/e-bike-for-hills";
const TITLE = "Best E-Bike for Hills (2026): Torque, Mid-Drives and Torque Sensors";
const DESCRIPTION =
  "What makes an e-bike good on steep hills: torque in Nm, mid-drive vs hub motors and torque sensors, with stated specs and today's prices from $1,199.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function HillsEbikePage() {
  const a7pro = ebikeById("himiway-a7-pro-commuter-ebike");
  const jumper = ebikeById("kingbull-jumper-go");
  const e26 = ebikeById("engwe-e26-3-0");
  const alt = EBIKE_ALTERNATIVES.hills;
  const bikes = [
    ebikeById("kingbull-trekker"),
    jumper,
    ebikeById("engwe-ep-2-3-0"),
    ebikeById("engwe-l20-3-0"),
    ebikeById("kingbull-ex-titan"),
    e26,
    ebikeById("himiway-d5-2-0-st-ebike"),
    a7pro,
  ].sort((a, b) => (b.torqueNm ?? 0) - (a.torqueNm ?? 0) || a.price - b.price);

  const faqs = [
    {
      q: "How much torque does an e-bike need for hills?",
      a: `Torque, in newton-metres (Nm), is the twisting force that gets you up a grade. Most hub-motor e-bikes here are rated 90 Nm; the ${ebikeName(a7pro)}'s mid-drive is rated ${a7pro.torqueNm} Nm and the ${ebikeName(e26)}'s two motors ${e26.torqueNm} Nm combined. More torque helps most on steep, short climbs and starting from a stop on a slope; your own pedaling, gearing and weight still matter.`,
    },
    {
      q: "Is a mid-drive or hub motor better for hills?",
      a: "A mid-drive motor sits at the pedals and drives through the bike's gears, so on a long climb you can shift down and let the motor work in its efficient range, the way you would on a regular bike. A hub motor sits in the wheel and is simpler and usually cheaper. Both climb; mid-drives tend to suit long, steep grades.",
    },
    {
      q: "What is a torque sensor and does it help on hills?",
      a: "A torque sensor measures how hard you press the pedals and adds power in proportion, so pushing harder up a hill brings more help right away. A cadence sensor only detects that the pedals are turning. Most bikes on this page use a torque sensor, according to their makers.",
    },
    {
      q: "Will hills drain the battery faster?",
      a: "Yes. Climbing takes more energy, and makers quote range on flat ground at low assist. If your rides are hilly, plan on less than the headline range or pick a bigger battery.",
    },
  ];

  return (
    <article>
      <HubHero
        image="ebike"
        crumbs={[
          { name: "E-bikes", path: "/e-bikes" },
          { name: "For hills", path: PATH },
        ]}
        eyebrow="E-bikes for hills"
        title={<>Steep street? <span className="text-amber-300">Look at the torque.</span></>}
        sub={<>Torque, the motor type and the pedal sensor decide how an e-bike climbs. Here are the stated numbers for the bikes we link to, and when a different bike suits you better.</>}
      >
        <a href="#picks" className="btn btn-primary">See the bikes</a>
        <a href="#what-matters" className="btn btn-light">What matters on hills</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Hilly town on a budget:</strong> the <PartnerLink brand="kingbull" productUrl={jumper.url}>{ebikeName(jumper)}</PartnerLink> ({money(jumper.price)}) pairs a{" "}
            {jumper.torqueNm} Nm hub motor ({jumper.peakW} W peak) with a torque sensor and full suspension.
          </p>
          <p>
            <strong>Long, steep climbs:</strong> the <PartnerLink brand="himiway" productUrl={a7pro.url}>{ebikeName(a7pro)}</PartnerLink> ({money(a7pro.price)}{ebikeSaleNote(a7pro) && `, ${ebikeSaleNote(a7pro)}`}) has a
            mid-drive rated {a7pro.torqueNm} Nm with a torque sensor, the most torque of any single-motor bike here.
          </p>
        </QuickAnswer>

        <section id="picks" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="picks-heading">
          <h2 id="picks-heading" className="text-2xl font-extrabold text-ink">Bikes that climb</h2>
          <OurPick
            label="Best value for hilly towns"
            name={ebikeName(jumper)}
            icon="bike"
            why={`${jumper.torqueNm} Nm and ${jumper.peakW} W peak from a Bafang hub motor, a torque sensor and full suspension on compact 20-inch wheels, for ${money(jumper.price)}. Kingbull rates it for ${jumper.payloadLb} lb.`}
            life={[`${jumper.torqueNm} Nm`, "Torque sensor", `${jumper.batteryWh} Wh battery`, "Full suspension"]}
            priceUsd={jumper.price}
            brand="kingbull"
            productUrl={jumper.url}
            category="home"
          />
          <OurPick
            label="Most torque from one motor"
            name={ebikeName(a7pro)}
            icon="bike"
            why={`A ${a7pro.motorType} rated ${a7pro.torqueNm} Nm, driving through the gears, with a torque sensor and full suspension. Himiway rates it for ${a7pro.payloadLb} lb of rider and cargo, lower than the fat-tire bikes, and its spec table doesn't list a throttle.`}
            life={[`${a7pro.torqueNm} Nm mid-drive`, "Torque sensor", `${a7pro.batteryWh} Wh battery`, `${a7pro.weightLb} lb bike`, ...(ebikeSaleNote(a7pro) ? [ebikeSaleNote(a7pro)] : [])]}
            priceUsd={a7pro.price}
            brand="himiway"
            productUrl={a7pro.url}
            category="home"
          />
          <OurPick
            label="Most raw power, for off-road climbs"
            name={ebikeName(e26)}
            icon="bolt"
            why={`Two hub motors rated ${e26.motorW?.toLocaleString("en-US")} W together (${e26.peakW?.toLocaleString("en-US")} W peak) and ${e26.torqueNm} Nm combined. That rating is above the 750 W in the federal e-bike definition, so check your state's rules before riding it on roads and paths, and expect the shortest range here in dual-motor mode.`}
            life={[`${e26.torqueNm} Nm combined`, `${e26.batteryWh} Wh battery`, "Full suspension", `${e26.weightLb} lb bike`]}
            priceUsd={e26.price}
            brand="engwe"
            productUrl={e26.url}
            category="home"
          />
        </section>

        <Section title="Stated torque, most first" id="compare">
          <EbikeTable bikes={bikes} columns={["price", "torque", "motor", "sensor", "battery", "weight"]} caption="E-bikes for hills by stated torque" />
        </Section>

        <Section title="What matters on hills" id="what-matters">
          <div className="grid gap-3">
            <Callout>
              <strong>Torque over watts.</strong> Watts describe power at speed; torque describes push at low speed, which is what a climb needs.
              Two bikes with the same 750 W rating can climb very differently.
            </Callout>
            <Callout>
              <strong>Gears still count.</strong> A mid-drive uses the bike&apos;s gears, so shifting down on a long climb keeps the motor in its
              efficient range. On a hub-motor bike, shifting down still makes your own pedaling easier.
            </Callout>
            <Callout>
              <strong>Battery for the climb.</strong> Hills use more energy than the flat rides makers quote range on. A bigger battery gives
              you margin on the way home.
            </Callout>
          </div>
        </Section>

        <div className="mt-10">
          <EbikeAlternativeNote alt={alt} />
        </div>

        <p className="mt-10 max-w-3xl">
          New to e-bikes? <Link href="/e-bikes" className="underline">Our e-bike guide</Link> covers class rules, cost per mile and rebates.
        </p>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          We compare makers&apos; stated specs; we have not ridden these bikes. Prices are from the makers&apos; US websites on {formatDate(EBIKES_CHECKED)},
          several during sales, and change often. Kingbull, Himiway and ENGWE links may earn us a commission; {alt.brand} is a plain link.
        </Disclaimer>
        <Sources items={ebikeSources(bikes, [alt])} />
        <RelatedLinks
          links={[
            { href: "/e-bikes", label: "E-bike guide", desc: "How to choose, cost per mile, rebates" },
            { href: "/e-bike-for-heavy-riders", label: "E-bike for heavy riders", desc: "400 to 450 lb rated bikes" },
            { href: "/commuter-e-bike-under-1500", label: "Commuter e-bike under $1,500", desc: "Ready for daily rides" },
            { href: "/folding-e-bike", label: "Folding e-bike", desc: "For apartments and RVs" },
          ]}
        />
        <PhotoCredit name="ebike" />
      </div>
    </article>
  );
}
