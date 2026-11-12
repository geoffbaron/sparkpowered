import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { EbikeAlternativeNote, EbikeTable, ebikeName, ebikeSources } from "@/components/ebikes";
import { HubHero, OurPick, PhotoCredit } from "@/components/ui";
import { EBIKES_CHECKED, EBIKE_ALTERNATIVES, ebikeById } from "@/data/ebikes";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

const PATH = "/e-bike-for-heavy-riders";
const TITLE = "E-Bike for Heavy Riders (2026): 400 to 450 lb Rated Bikes Compared";
const DESCRIPTION =
  "E-bikes rated for 400 to 450 lb of rider and cargo, from $1,199: what max load really means, which makers state a rider limit, and today's prices and specs.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function HeavyRiderEbikePage() {
  const trekker = ebikeById("kingbull-trekker");
  const dualVoyager = ebikeById("kingbull-dual-battery-voyager-2-0");
  const d5st = ebikeById("himiway-d5-2-0-st-ebike");
  const alt = EBIKE_ALTERNATIVES.heavy;
  const bikes = [
    trekker,
    ebikeById("kingbull-voyager-2-0"),
    ebikeById("kingbull-verve"),
    ebikeById("kingbull-jumper-go"),
    dualVoyager,
    ebikeById("kingbull-ex-titan"),
    ebikeById("himiway-c3-cargo-ebike"),
    ebikeById("engwe-e26-3-0"),
    d5st,
    ebikeById("himiway-d5-2-0-ebike"),
  ].sort((a, b) => a.price - b.price);

  const faqs = [
    {
      q: "What is the weight limit on an e-bike?",
      a: "Most makers state a maximum load, which is rider plus anything you carry. The bikes on this page are rated 400 to 450 lb by their makers. A few makers also state a separate rider limit, and it can be much lower: Himiway's D5 2.0 20-inch lists 440 lb of load but a 265 lb rider. Read both numbers on the product page before you buy.",
    },
    {
      q: "Can a 300 lb person ride an e-bike?",
      a: `Yes, on a bike whose maker rates it for that. Kingbull rates the ${trekker.model.replace("Kingbull ", "")} and several others for ${trekker.payloadLb} lb of rider and cargo, but its pages don't state a separate rider limit, so ask Kingbull to confirm for your weight. ${alt.brand}'s ${alt.model} states a 330 lb rider limit outright.`,
    },
    {
      q: "Does rider weight change the range?",
      a: "Yes. Makers usually quote range with a light rider on flat ground at the lowest assist level; ENGWE's E26 3.0 page, for example, says its figures were measured with a 165 lb rider on flat concrete. A heavier rider, hills and higher assist all use more battery, so expect less than the headline figure and pick a bigger battery if you ride far.",
    },
    {
      q: "Should a heavy rider pick fat tires?",
      a: "All of the bikes here use 3 to 4 inch tires, which spread load and soften bumps. Keep them inflated to the pressure printed on the tire sidewall; under-inflated tires wear faster and roll slower, especially under more weight.",
    },
  ];

  return (
    <article>
      <HubHero
        image="ebike"
        crumbs={[
          { name: "E-bikes", path: "/e-bikes" },
          { name: "For heavy riders", path: PATH },
        ]}
        eyebrow="E-bikes for heavy riders"
        title={<>Rated for 450 lb. <span className="text-amber-300">From {money(trekker.price)}.</span></>}
        sub={<>The number that matters is the maker&apos;s maximum load, and whether they also state a rider limit. Here is what each bike is rated for, straight from the makers&apos; pages.</>}
      >
        <a href="#picks" className="btn btn-primary">See the bikes</a>
        <a href="#rider-limit" className="btn btn-light">Load vs rider limit</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Most riders:</strong> the <PartnerLink brand="kingbull" productUrl={trekker.url}>{ebikeName(trekker)}</PartnerLink> ({money(trekker.price)}) is
            rated for {trekker.payloadLb} lb of rider and cargo, with a step-thru frame, a {trekker.batteryWh} Wh battery and a torque sensor.
          </p>
          <p>
            <strong>Over 300 lb:</strong> Kingbull doesn&apos;t state a separate rider limit, so confirm with them first. If you want a stated limit
            in writing, the {alt.brand} {alt.model} lists 330 lb (more below).
          </p>
        </QuickAnswer>

        <section id="picks" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="picks-heading">
          <h2 id="picks-heading" className="text-2xl font-extrabold text-ink">Bikes that fit</h2>
          <OurPick
            label="Best value at 450 lb"
            name={ebikeName(trekker)}
            icon="bike"
            why={`Kingbull rates it for ${trekker.payloadLb} lb of rider and cargo. The step-thru frame is easier to mount, the torque sensor adds power as you push, and the ${trekker.batteryWh} Wh battery is bigger than most at this price.`}
            life={[`${trekker.payloadLb} lb max load`, `${trekker.torqueNm} Nm, ${trekker.peakW} W peak`, `${trekker.batteryWh} Wh battery`, `${trekker.weightLb} lb bike`]}
            priceUsd={trekker.price}
            brand="kingbull"
            productUrl={trekker.url}
            category="home"
          />
          <OurPick
            label="Most battery, for long rides"
            name={ebikeName(dualVoyager)}
            icon="battery"
            why={`Two batteries for ${dualVoyager.batteryWh?.toLocaleString("en-US")} Wh, the most here, plus a ${dualVoyager.rearRackLb} lb rear rack. It is also the only bike on this page whose maker names its class (${dualVoyager.class}).`}
            life={[`${dualVoyager.payloadLb} lb max load`, `${dualVoyager.batteryWh?.toLocaleString("en-US")} Wh`, `${dualVoyager.rearRackLb} lb rack`, "Step-thru"]}
            priceUsd={dualVoyager.price}
            brand="kingbull"
            productUrl={dualVoyager.url}
            category="home"
          />
          <OurPick
            label="Full suspension on rough roads"
            name={ebikeName(d5st)}
            icon="bike"
            why={`Front and rear suspension (100 mm fork, 130 mm rear travel) and 4-inch Maxxis tires take the sting out of rough roads, with ${d5st.torqueNm} Nm and a step-through frame. Himiway rates it for ${d5st.payloadLb} lb.`}
            life={[`${d5st.payloadLb} lb max load`, `${d5st.torqueNm} Nm`, "Class 1, 2 or 3 (selectable)", `${d5st.weightLb} lb bike`]}
            priceUsd={d5st.price}
            brand="himiway"
            productUrl={d5st.url}
            category="home"
          />
        </section>

        <Section title="Every bike rated 400 lb or more" id="compare">
          <EbikeTable bikes={bikes} columns={["price", "payload", "motor", "torque", "battery", "weight"]} caption="E-bikes rated for 400 lb or more of rider and cargo" />
        </Section>

        <Section title="Max load is not the same as rider limit" id="rider-limit">
          <p className="max-w-3xl">
            Makers quote a maximum load: you plus your bag, groceries or child seat. Some also quote a lower limit for the rider alone, and that
            is the number to check. Himiway&apos;s D5 2.0 20-inch, for example, lists 440 lb of load but a 265 lb rider, which is why it isn&apos;t on
            this page. Kingbull and ENGWE pages state only the maximum load. If you weigh over 300 lb, email the maker before you buy and ask for
            the rider limit in writing; it protects your warranty too.
          </p>
          <Callout>
            <strong>Rack limits are separate again.</strong> The rear rack has its own rating ({trekker.rearRackLb} lb on the Trekker,{" "}
            {dualVoyager.rearRackLb} lb on the Dual Battery Voyager 2.0). Your weight plus everything on the rack still has to fit under the
            bike&apos;s maximum load.
          </Callout>
        </Section>

        <div className="mt-10">
          <EbikeAlternativeNote alt={alt} />
        </div>

        <p className="mt-10 max-w-3xl">
          Wondering what an e-bike would save you against driving?{" "}
          <Link href="/e-bikes" className="underline">Our e-bike guide</Link> works out the cost per mile, the class rules and the state rebates.
        </p>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          We compare makers&apos; stated specs; we have not ridden these bikes. Look for UL 2849 certification of the whole electrical system, charge only with the maker&apos;s charger while you&apos;re awake and
          nearby, and wear a helmet. Prices are from the makers&apos; US websites on {formatDate(EBIKES_CHECKED)},
          several during sales, and change often. Kingbull, Himiway and ENGWE links may earn us a commission; {alt.brand} is a plain link.
        </Disclaimer>
        <Sources items={ebikeSources(bikes, [alt])} />
        <RelatedLinks
          links={[
            { href: "/e-bikes", label: "E-bike guide", desc: "How to choose, cost per mile, rebates" },
            { href: "/e-bike-for-hills", label: "E-bike for hills", desc: "Torque and mid-drive motors" },
            { href: "/commuter-e-bike-under-1500", label: "Commuter e-bike under $1,500", desc: "Ready for daily rides" },
            { href: "/folding-e-bike", label: "Folding e-bike", desc: "For apartments and RVs" },
          ]}
        />
        <PhotoCredit name="ebike" />
      </div>
    </article>
  );
}
