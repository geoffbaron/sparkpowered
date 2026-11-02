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
import { EBIKE_CENTS_PER_MILE, AAA_CENTS_PER_MILE } from "@/lib/ebikes";

const PATH = "/commuter-e-bike-under-1500";
const TITLE = "Best Commuter E-Bike Under $1,500 (2026): Racks, Lights and Fenders Included";
const DESCRIPTION =
  "Commuter e-bikes under $1,500 that come ready for daily rides: what's in the box, stated range and weight, class settings, and today's prices from $699.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function CommuterEbikePage() {
  const ep2 = ebikeById("engwe-ep-2-3-0");
  const discoverSt = ebikeById("kingbull-discover-st-2-0");
  const dualVoyager = ebikeById("kingbull-dual-battery-voyager-2-0");
  const l20 = ebikeById("engwe-l20-2-0");
  const alt = EBIKE_ALTERNATIVES.commuter;
  const bikes = [l20, discoverSt, ebikeById("kingbull-discover-2-0"), ebikeById("kingbull-trekker"), dualVoyager, ep2].sort((a, b) => a.price - b.price);

  const faqs = [
    {
      q: "Is an e-bike cheaper than driving to work?",
      a: `By a wide margin. At the US average home electricity price, an e-bike's electricity costs about ${EBIKE_CENTS_PER_MILE.toFixed(1)} cents a mile (our estimate from Efficiency Vermont's measured average). AAA puts the full cost of a new car at ${AAA_CENTS_PER_MILE} cents a mile in 2026, counting fuel, insurance, depreciation and upkeep. Tires, brake pads and an eventual new battery add to the e-bike's cost, but not by that much.`,
    },
    {
      q: "What class of e-bike is best for commuting?",
      a: "It depends on your route. Class 3 bikes assist up to 28 mph, which helps on longer road commutes, but many places restrict them on bike paths. Class 1 and 2 bikes stop assisting at 20 mph and are allowed in more places. Several bikes here let you set the speed limit, so you can match your local rules.",
    },
    {
      q: "What should a commuter e-bike come with?",
      a: "Fenders for wet roads, a rear rack for a bag, and front and rear lights. The ENGWE EP-2 3.0 and L20 2.0 include all three, according to ENGWE. The Kingbull Discover 2.0 models include a rack and lights; Kingbull's page doesn't list fenders.",
    },
    {
      q: "Can I bring a commuter e-bike on the train or into an office?",
      a: "Check the weight first. These bikes weigh 68 to 84 lb, so carrying one up stairs is hard. A folding model like the EP-2 3.0 takes less floor space; see our folding e-bike guide for sizes.",
    },
  ];

  return (
    <article>
      <HubHero
        image="ebike"
        crumbs={[
          { name: "E-bikes", path: "/e-bikes" },
          { name: "Commuter under $1,500", path: PATH },
        ]}
        eyebrow="Commuter e-bikes under $1,500"
        title={<>Skip the gas and parking. <span className="text-amber-300">Ride to work.</span></>}
        sub={<>Bikes under $1,500 that come with what a daily commute needs. All prices and specs straight from the makers&apos; own sites.</>}
      >
        <a href="#picks" className="btn btn-primary">See the bikes</a>
        <a href="#compare" className="btn btn-light">Compare specs</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Ready to ride out of the box:</strong> the <PartnerLink brand="engwe" productUrl={ep2.url}>{ebikeName(ep2)}</PartnerLink> ({money(ep2.price)})
            comes with fenders, a rear rack and lights, a torque sensor, UL 2849 certification, and it folds.
          </p>
          <p>
            <strong>Tight budget:</strong> the <PartnerLink brand="engwe" productUrl={l20.url}>{ebikeName(l20)}</PartnerLink> ({money(l20.price)}) also comes with a light,
            rack and fenders, with simpler brakes and a {l20.payloadLb} lb limit.
          </p>
        </QuickAnswer>

        <section id="picks" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="picks-heading">
          <h2 id="picks-heading" className="text-2xl font-extrabold text-ink">Bikes ready to commute</h2>
          <OurPick
            label="Best equipped under $1,500"
            name={ebikeName(ep2)}
            icon="bike"
            why={`Fenders, a rear rack, a front light and a brake light come in the box. It has a torque sensor and a ${ep2.batteryWh} Wh battery, is certified to UL 2849 for its electrical system, and folds to about 38 x 21 x 32 inches.`}
            life={[`Up to ${ep2.rangeMiles} mi (ENGWE, lowest assist)`, `${ep2.weightLb} lb`, `${ep2.payloadLb} lb max load`, "Folds"]}
            priceUsd={ep2.price}
            brand="engwe"
            productUrl={ep2.url}
            category="home"
          />
          <OurPick
            label="Easy step-through, lower price"
            name={ebikeName(discoverSt)}
            icon="bike"
            why={`A step-through frame with a torque sensor, rear rack, head and tail lights, and UL 2849 certification. It ships set to 20 mph and you can raise the limit to 28 mph where that's allowed. Kingbull's page doesn't list fenders.`}
            life={[`${discoverSt.batteryWh} Wh battery`, `${discoverSt.rearRackLb} lb rear rack`, `${discoverSt.payloadLb} lb max load`, "26 x 4 in tires"]}
            priceUsd={discoverSt.price}
            brand="kingbull"
            productUrl={discoverSt.url}
            category="home"
          />
          <OurPick
            label="Longest range"
            name={ebikeName(dualVoyager)}
            icon="battery"
            why={`Two batteries totaling ${dualVoyager.batteryWh?.toLocaleString("en-US")} Wh, the only bike here whose maker names its class (${dualVoyager.class}), and a ${dualVoyager.rearRackLb} lb rack for panniers or a child seat.`}
            life={[`Up to ${dualVoyager.rangeMiles} mi (Kingbull)`, `${dualVoyager.weightLb} lb`, "Step-thru", "UL 2849"]}
            priceUsd={dualVoyager.price}
            brand="kingbull"
            productUrl={dualVoyager.url}
            category="home"
          />
        </section>

        <Section title="Every bike under $1,500, compared" id="compare">
          <EbikeTable bikes={bikes} columns={["price", "range", "battery", "sensor", "weight", "payload"]} caption="Commuter e-bikes under $1,500" />
          <p className="text-sm text-stone-700 mt-3 max-w-3xl">
            Not here: Himiway&apos;s commuter bikes (A7 and A7 Pro) were {money(1999)} when we checked, over this page&apos;s budget, and ENGWE&apos;s
            M20 3.0 has a 40 mph off-road mode that takes it outside the e-bike classes.
          </p>
        </Section>

        <Section title="Before you buy" id="tips">
          <div className="grid gap-3">
            <Callout>
              <strong>Fat tires or road tires.</strong> Most bikes here use 3 to 4 inch tires: comfortable and stable, but heavier and slower
              rolling on smooth pavement than the narrow tires on a road-focused commuter.
            </Callout>
            <Callout>
              <strong>Where you&apos;ll park it.</strong> Secure, dry storage protects the battery. If it lives in an apartment, a folding bike
              or a removable battery you can charge indoors makes life easier.
            </Callout>
          </div>
        </Section>

        <div className="mt-10">
          <EbikeAlternativeNote alt={alt} />
        </div>

        <p className="mt-10 max-w-3xl">
          See what it saves against driving, and which rebates are open in your state, in <Link href="/e-bikes" className="underline">our e-bike guide</Link>.
        </p>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          We compare makers&apos; stated specs; we have not ridden these bikes. Prices are from the makers&apos; US websites on {formatDate(EBIKES_CHECKED)},
          several during sales, and change often. Kingbull and ENGWE links may earn us a commission; {alt.brand} is a plain link.
        </Disclaimer>
        <Sources items={ebikeSources(bikes, [alt])} />
        <RelatedLinks
          links={[
            { href: "/e-bikes", label: "E-bike guide", desc: "How to choose, cost per mile, rebates" },
            { href: "/folding-e-bike", label: "Folding e-bike", desc: "For apartments and RVs" },
            { href: "/e-bike-for-hills", label: "E-bike for hills", desc: "Torque and mid-drive motors" },
            { href: "/e-bike-for-heavy-riders", label: "E-bike for heavy riders", desc: "400 to 450 lb rated bikes" },
          ]}
        />
        <PhotoCredit name="ebike" />
      </div>
    </article>
  );
}
