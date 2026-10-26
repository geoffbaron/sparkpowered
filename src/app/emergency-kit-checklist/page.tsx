import type { Metadata } from "next";
import Link from "next/link";
import KitChecklist from "@/components/KitChecklist";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { HubHero, PhotoCredit } from "@/components/ui";
import { RADIO_PRODUCTS } from "@/data/prep-products";
import { formatDate } from "@/lib/energy";
import { GALLONS_PER_PERSON_DAY, GOAL_DAYS, MIN_DAYS, PREP_CHECKED, PREP_SOURCES as S, READY_KIT, prepLinksFor } from "@/lib/prep";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/emergency-kit-checklist";
const TITLE = "Emergency Kit Checklist: 72-Hour and 2-Week Home Kit";
const DESCRIPTION =
  "A printable home emergency kit checklist from the Ready.gov list, scaled to your household for 72 hours or two weeks, with water amounts from CDC.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function EmergencyKitChecklistPage() {
  const basicCount = READY_KIT.filter((i) => i.group === "basic").length;
  const wr120 = RADIO_PRODUCTS.find((p) => p.id === "midland-wr120")!;

  const faqs = [
    {
      q: "What should be in a 72-hour emergency kit?",
      a: `Ready.gov's basic kit has ${basicCount} items: water (${GALLONS_PER_PERSON_DAY} gallon per person per day), non-perishable food, a battery or hand-crank radio and a NOAA Weather Radio with tone alert, a flashlight, a first aid kit, extra batteries, a whistle, a dust mask, plastic sheeting with scissors and duct tape, moist towelettes with garbage bags and plastic ties, a wrench or pliers for utilities, a manual can opener, local maps, and a phone with chargers and a backup battery.`,
    },
    {
      q: "How is a 2-week kit different from a 72-hour kit?",
      a: `Mostly more water and food. CDC sets ${MIN_DAYS} days of water as the minimum and asks you to try for a 2-week supply; FEMA suggests two weeks of food as well. For a family of four, water goes from ${4 * MIN_DAYS} gallons to ${4 * GOAL_DAYS} gallons. The rest of the list stays the same.`,
    },
    {
      q: "How many days does Ready.gov say a kit should last?",
      a: "Ready.gov does not give a fixed number; it says to have water and food for several days. We use CDC's 3-day minimum and 2-week goal for water so you can choose.",
    },
    {
      q: "How often should I check my emergency kit?",
      a: "Ready.gov says to replace expired items as needed and rethink your needs every year as your family changes. Replace water you bottled yourself every 6 months (CDC).",
    },
    {
      q: "Where should I keep my emergency kit?",
      a: "Ready.gov says to keep the home kit in a set place, ready to grab if you have to leave quickly. It also suggests a kit at work, enough to shelter there for at least 24 hours, and one in the car in case you are stranded.",
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Emergency Kit Checklist Builder",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          dateModified: PREP_CHECKED,
        }}
      />
      <HubHero
        image="outage"
        crumbs={[{ name: "Emergency kit checklist", path: PATH }]}
        eyebrow="Emergency prep"
        title={<>One list, packed once. <span className="text-amber-300">Your home emergency kit, sized to your family.</span></>}
        sub={
          <>
            The Ready.gov kit list with quantities for your household, for {MIN_DAYS} days or two weeks. Tick it off as you pack, then print
            it for the cupboard door.
          </>
        }
      >
        <a href="#checklist" className="btn btn-primary">Build my checklist</a>
        <a href="#gear" className="btn btn-light">Gear we would start with</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          List checked <time dateTime={PREP_CHECKED}>{formatDate(PREP_CHECKED)}</time> against Ready.gov and CDC.
        </p>
        <QuickAnswer>
          <p>
            Start with water ({GALLONS_PER_PERSON_DAY} gallon per person per day), food that needs no fridge, a NOAA Weather Radio, a
            flashlight, a first aid kit and spare batteries. Then add medicines, documents, cash and anything a baby or pet needs. Aim
            for {MIN_DAYS} days first, then build to two weeks.
          </p>
        </QuickAnswer>

        <section id="checklist" className="mt-10 scroll-mt-24" aria-label="Checklist builder">
          <KitChecklist />
        </section>

        <Section title="Before you buy anything" id="before">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              Most of this list is already in your home. FEMA suggests using the canned goods and staples on your shelves and rotating
              them, first in, first out. Buy only what is missing.
            </p>
            <Callout>
              Work out the big items properly: <Link href="/emergency-water-storage-calculator" className="underline">how much water</Link>,{" "}
              <Link href="/emergency-food-calculator" className="underline">how many calories of food</Link> and{" "}
              <Link href="/power-outage-backup-calculator" className="underline">how much backup power</Link> your household needs.
            </Callout>
          </div>
        </Section>

        <Section title="Gear we would start with" id="gear">
          <AffiliateDisclosure className="mb-4" />
          <ul className="space-y-3 text-stone-700 max-w-3xl">
            <li>
              <strong>Weather radio:</strong> the <PartnerLink brand="midland" productUrl={wr120.url}>{wr120.name}</PartnerLink>. Midland lists
              it as Public Alert certified with SAME county alerts. More in our <Link href="/noaa-weather-radio" className="underline">NOAA Weather Radio guide</Link>.
            </li>
            <li>
              <strong>First aid kit:</strong> a ready-made kit from <PartnerLink brand="mymedic">MyMedic</PartnerLink> or{" "}
              <PartnerLink brand="amk">Adventure Medical Kits</PartnerLink>, sized for your household. Add each person&apos;s own medicines.
            </li>
            <li>
              <strong>Backup water treatment:</strong> a gravity purifier for a household, such as from{" "}
              <PartnerLink brand="msr" productUrl="https://cascadedesigns.com/products/guardian-gravity-purifier">MSR</PartnerLink>, or a
              press bottle from <PartnerLink brand="grayl" productUrl="https://grayl.com/products/24oz-geopress-filter-purifier-water-bottle-nature-edition">Grayl</PartnerLink>.
              Read <Link href="/best-emergency-water-filters" className="underline">what each one can actually prove</Link>.
            </li>
            <li>
              <strong>Long-life food:</strong> <PartnerLink brand="valleyfood">Valley Food Storage</PartnerLink> or{" "}
              <PartnerLink brand="readywise">ReadyWise</PartnerLink>. Compare kits on total calories, not servings, with our{" "}
              <Link href="/emergency-food-calculator" className="underline">food calculator</Link>.
            </li>
          </ul>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          General information for home emergency planning. Follow instructions from local emergency officials. Brand links are
          suggestions to start from, not tested picks.
        </Disclaimer>
        <Sources
          items={[
            { ...S.readyKit, detail: "basic kit and additional supplies; home, work and car kits; replace expired items; rethink needs yearly" },
            { ...S.cdcWaterStorage, detail: "1 gallon per person per day; 3-day minimum, 2-week goal; replace every 6 months" },
            { ...S.femaFoodWater, detail: "two-week food supply; use pantry staples, first in, first out" },
            { name: `${wr120.name} product page`, url: wr120.sourceUrl, detail: `checked ${formatDate(wr120.checked)}` },
          ]}
        />
        <RelatedLinks links={prepLinksFor(PATH)} />
        <PhotoCredit name="outage" />
      </div>
    </div>
  );
}
