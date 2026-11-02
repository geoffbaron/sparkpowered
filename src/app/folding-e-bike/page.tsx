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
import { EBIKE_SOURCES } from "@/lib/ebikes";

const PATH = "/folding-e-bike";
const TITLE = "Folding E-Bike for Apartments and RVs (2026): Folded Sizes and Weights";
const DESCRIPTION =
  "Folding e-bikes for small apartments, RVs and car trunks: folded size, real weight, max load and today's prices from $699, plus when a lighter bike is the better pick.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function FoldingEbikePage() {
  const literider = ebikeById("kingbull-literider-2-0");
  const verve = ebikeById("kingbull-verve");
  const l20 = ebikeById("engwe-l20-2-0");
  const ep2 = ebikeById("engwe-ep-2-3-0");
  const alt = EBIKE_ALTERNATIVES.folding;
  const bikes = [l20, literider, verve, ep2, ebikeById("engwe-l20-3-0")].sort((a, b) => a.price - b.price);
  const weights = bikes.map((b) => b.weightLb ?? 0);

  const faqs = [
    {
      q: "How heavy is a folding e-bike?",
      a: `The folding bikes we link to weigh ${Math.min(...weights)} to ${Math.max(...weights)} lb, according to their makers. That's because they carry 4-inch or 3-inch tires and large batteries. Folding makes them smaller, not light, so plan to roll them rather than carry them.`,
    },
    {
      q: "Will a folding e-bike fit in an RV or car trunk?",
      a: `Measure first. Kingbull lists the Literider 2.0 and Verve at ${literider.foldedDims?.split(" (")[0]} folded; ENGWE lists the L20 2.0 at ${l20.foldedDims?.split(" (")[0]}. Compare those with your storage bay or trunk opening, and remember the weight if you have to lift it in.`,
    },
    {
      q: "Can I keep a folding e-bike in my apartment?",
      a: "Check your building's rules, and follow the Consumer Product Safety Commission's charging advice: be present while it charges, never charge it while you sleep or are out, and use only the maker's charger. Look for UL 2849 certification of the bike's electrical system; New York City requires it for e-bikes sold there.",
    },
    {
      q: "Do folding e-bikes ride worse than full-size ones?",
      a: "Smaller 20-inch wheels make a folding bike nimble but a little less steady at speed, and fat tires make up for some of that. On paper, the folders here share the same 750 W motor ratings as full-size bikes from the same makers.",
    },
  ];

  return (
    <article>
      <HubHero
        image="ebike"
        crumbs={[
          { name: "E-bikes", path: "/e-bikes" },
          { name: "Folding e-bikes", path: PATH },
        ]}
        eyebrow="Folding e-bikes"
        title={<>Folds for the closet or the RV. <span className="text-amber-300">Know the weight first.</span></>}
        sub={<>Folded size, real weight and max load for each folding bike we link to, from the makers&apos; own pages, and when a lighter bike suits you better.</>}
      >
        <a href="#picks" className="btn btn-primary">See the bikes</a>
        <a href="#compare" className="btn btn-light">Compare folded sizes</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Smallest fold:</strong> the <PartnerLink brand="kingbull" productUrl={literider.url}>{ebikeName(literider)}</PartnerLink> ({money(literider.price)}) folds
            to {literider.foldedDims?.split(" (")[0]} and is rated for {literider.payloadLb} lb.
          </p>
          <p>
            <strong>Lightest and cheapest:</strong> the <PartnerLink brand="engwe" productUrl={l20.url}>{ebikeName(l20)}</PartnerLink> ({money(l20.price)}) weighs{" "}
            {l20.weightLb} lb. Every folder here is over 65 lb, so if you climb stairs with it, read the note at the bottom first.
          </p>
        </QuickAnswer>

        <section id="picks" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="picks-heading">
          <h2 id="picks-heading" className="text-2xl font-extrabold text-ink">Folding bikes that fit</h2>
          <OurPick
            label="Smallest fold for the price"
            name={ebikeName(literider)}
            icon="bike"
            why={`Folds to ${literider.foldedDims?.split(" (")[0]}, the most compact on this page, with a rear rack, lights and a ${literider.payloadLb} lb max load. It uses a cadence sensor, which gives steady help rather than help that follows your effort.`}
            life={[`${literider.weightLb} lb`, `${literider.batteryWh} Wh battery`, `Up to ${literider.rangeMiles} mi (Kingbull)`, "UL 2849"]}
            priceUsd={literider.price}
            brand="kingbull"
            productUrl={literider.url}
            category="home"
          />
          <OurPick
            label="Same fold, more battery and load"
            name={ebikeName(verve)}
            icon="battery"
            why={`The same folded size as the Literider with a ${verve.batteryWh} Wh battery, a torque sensor, ${verve.torqueNm} Nm and a ${verve.payloadLb} lb max load, the highest of any folder here. It is also the heaviest at ${verve.weightLb} lb.`}
            life={[`${verve.payloadLb} lb max load`, `${verve.batteryWh} Wh battery`, "Torque sensor", "UL 2849"]}
            priceUsd={verve.price}
            brand="kingbull"
            productUrl={verve.url}
            category="home"
          />
          <OurPick
            label="Folds and commutes"
            name={ebikeName(ep2)}
            icon="bike"
            why="Fenders, a rear rack and lights come in the box, so it works as a daily commuter that folds away at home. It has a torque sensor and UL 2849 certification."
            life={[`${ep2.weightLb} lb`, `${ep2.batteryWh} Wh battery`, `${ep2.payloadLb} lb max load`, "Fenders, rack, lights"]}
            priceUsd={ep2.price}
            brand="engwe"
            productUrl={ep2.url}
            category="home"
          />
        </section>

        <Section title="Folded size and weight, compared" id="compare">
          <EbikeTable bikes={bikes} columns={["price", "folded", "weight", "payload", "battery", "sensor"]} caption="Folding e-bikes by folded size and weight" />
          <p className="text-sm text-stone-700 mt-3 max-w-3xl">Himiway doesn&apos;t sell a folding e-bike right now.</p>
        </Section>

        <Section title="RV or apartment: what to check" id="tips">
          <div className="grid gap-3">
            <Callout>
              <strong>RV:</strong> measure the storage bay or hitch rack, and check the rack&apos;s weight rating against the bike&apos;s weight.
            </Callout>
            <Callout>
              <strong>Apartment:</strong> roll it in the lift instead of carrying it, keep the battery away from exits, and charge it only while
              you&apos;re home and awake (CPSC advice).
            </Callout>
          </div>
        </Section>

        <div className="mt-10">
          <EbikeAlternativeNote alt={alt} />
        </div>

        <p className="mt-10 max-w-3xl">
          Running the RV&apos;s electrics too? See our <Link href="/lithium-rv-battery" className="underline">RV battery guide</Link>, or the{" "}
          <Link href="/e-bikes" className="underline">e-bike guide</Link> for class rules and rebates.
        </p>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          We compare makers&apos; stated specs; we have not ridden these bikes. Prices are from the makers&apos; US websites on {formatDate(EBIKES_CHECKED)},
          several during sales, and change often. Kingbull and ENGWE links may earn us a commission; {alt.brand} is a plain link.
        </Disclaimer>
        <Sources
          items={[
            ...ebikeSources(bikes, [alt]),
            EBIKE_SOURCES.cpscAdvice,
            EBIKE_SOURCES.nycLaw,
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/e-bikes", label: "E-bike guide", desc: "How to choose, cost per mile, rebates" },
            { href: "/commuter-e-bike-under-1500", label: "Commuter e-bike under $1,500", desc: "Ready for daily rides" },
            { href: "/e-bike-for-heavy-riders", label: "E-bike for heavy riders", desc: "400 to 450 lb rated bikes" },
            { href: "/e-bike-for-hills", label: "E-bike for hills", desc: "Torque and mid-drive motors" },
          ]}
        />
        <PhotoCredit name="ebike" />
      </div>
    </article>
  );
}
