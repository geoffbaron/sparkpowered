import type { Metadata } from "next";
import Link from "next/link";
import WaterStorageCalc from "@/components/WaterStorageCalc";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { HubHero, PhotoCredit } from "@/components/ui";
import { formatDate } from "@/lib/energy";
import {
  CAMPER_VOLTS_URL,
  GALLONS_PER_PERSON_DAY,
  GOAL_DAYS,
  MIN_DAYS,
  PREP_CHECKED,
  PREP_SOURCES as S,
  REFRESH_MONTHS,
  SANITIZE_TSP_PER_QUART,
  STORE_TEMP_F,
  WATER_CONTAINERS,
  containersFor,
  prepLinksFor,
  waterNeeded,
} from "@/lib/prep";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/emergency-water-storage-calculator";
const TITLE = "Emergency Water Storage Calculator: How Much to Store";
const DESCRIPTION =
  "How many gallons of emergency water your household needs for 3 days or 2 weeks, how many jugs that fills, and when to refresh it. Based on CDC, FEMA and Ready.gov.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function EmergencyWaterStoragePage() {
  const family = waterNeeded({ people: 4, days: GOAL_DAYS });
  const family3 = waterNeeded({ people: 4, days: MIN_DAYS });
  const jug5 = WATER_CONTAINERS.find((c) => c.id === "jug-5")!;

  const faqs = [
    {
      q: "How much water should I store per person for an emergency?",
      a: `At least ${GALLONS_PER_PERSON_DAY} gallon per person per day, for drinking and sanitation. CDC says to store at least ${MIN_DAYS} days' worth and to try for a 2-week supply. For one person that is ${MIN_DAYS} gallons at minimum and ${GOAL_DAYS} gallons for two weeks.`,
    },
    {
      q: "How much water does a family of four need for two weeks?",
      a: `${family.total} gallons: 4 people x ${GALLONS_PER_PERSON_DAY} gallon x ${GOAL_DAYS} days. That is ${containersFor(family.total, jug5.gallons)} five-gallon jugs. The ${MIN_DAYS}-day minimum is ${family3.total} gallons. Store more in very hot weather (Ready.gov says needs can double) and for anyone pregnant, nursing or sick.`,
    },
    {
      q: "How often should I replace stored water?",
      a: `Replace water you bottled yourself every ${REFRESH_MONTHS} months (CDC, Ready.gov). Keep store-bought water sealed in its original bottles and use it by the date on the label (CDC, FEMA). Store all of it somewhere cool, ${STORE_TEMP_F.low} to ${STORE_TEMP_F.high} F, out of direct sunlight.`,
    },
    {
      q: "How much water do pets need in an emergency?",
      a: "CDC lists pets among those who need extra water, but no government agency gives an amount. Ask your vet, or measure what your pets drink on a normal day, and enter that in the calculator.",
    },
    {
      q: "What containers can I use to store water?",
      a: `Food-grade water storage containers are best. CDC says otherwise use a durable, unbreakable container (not glass) with a tight cap, ideally with a narrow opening, and never one that held chemicals such as bleach or pesticides. To sanitize a container, CDC says to use a solution of ${SANITIZE_TSP_PER_QUART} teaspoon of unscented bleach in 1 quart of water.`,
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Emergency Water Storage Calculator",
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
        crumbs={[{ name: "Emergency water storage calculator", path: PATH }]}
        eyebrow="Emergency prep"
        title={<>Water first. <span className="text-amber-300">Know how much to keep at home.</span></>}
        sub={
          <>
            Plan on <strong className="text-amber-300">{GALLONS_PER_PERSON_DAY} gallon per person per day</strong>: {MIN_DAYS} days at
            minimum, {GOAL_DAYS} days if you can. Enter your household to get gallons, containers and a date to refresh it.
          </>
        }
      >
        <a href="#calculator" className="btn btn-primary">Work out my water</a>
        <a href="#storing" className="btn btn-light">How to store it</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Figures checked <time dateTime={PREP_CHECKED}>{formatDate(PREP_CHECKED)}</time> against CDC, FEMA and Ready.gov.
        </p>
        <QuickAnswer>
          <p>
            Store at least {GALLONS_PER_PERSON_DAY} gallon of water per person per day. A family of four needs {family3.total} gallons
            for {MIN_DAYS} days, or {family.total} gallons for two weeks, about {containersFor(family.total, jug5.gallons)} five-gallon jugs.
            Refresh water you bottle yourself every {REFRESH_MONTHS} months.
          </p>
        </QuickAnswer>

        <h2 id="calculator" className="text-2xl font-extrabold text-ink mt-10 mb-4 scroll-mt-24">Your household, your water</h2>
        <WaterStorageCalc />

        <Section title="Where the numbers come from" id="how">
          <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
            <p>
              <strong>Gallons = people x {GALLONS_PER_PERSON_DAY} gallon x days.</strong> CDC, FEMA and Ready.gov all use{" "}
              {GALLONS_PER_PERSON_DAY} gallon per person per day. That covers drinking plus some cooking and washing: FEMA says a
              normally active person needs to drink at least half a gallon a day, and the rest goes to food and hygiene.
            </p>
            <p>
              CDC sets the minimum at {MIN_DAYS} days and asks you to try for a 2-week supply; FEMA says to consider at least two weeks.
              Ready.gov says water needs can double in very hot temperatures, so the hot-weather box doubles the per-person figure.
            </p>
            <Callout>
              No agency gives an amount for pregnant, nursing or sick people, or for pets. They only say to store more. So the
              calculator adds nothing for them unless you type a number in. That is on purpose: we would rather you choose than trust
              a figure we made up.
            </Callout>
          </div>
        </Section>

        <Section title="How to store it" id="storing">
          <ul className="list-disc pl-5 space-y-2 text-stone-700 max-w-3xl">
            <li>Use food-grade water storage containers. Never use a container that held bleach, pesticides or other chemicals (CDC).</li>
            <li>
              Sanitize containers first with a solution of {SANITIZE_TSP_PER_QUART} teaspoon of unscented bleach in 1 quart of
              water (CDC).
            </li>
            <li>Keep water somewhere cool, {STORE_TEMP_F.low} to {STORE_TEMP_F.high} F, out of direct sunlight (CDC).</li>
            <li>Label each container with the date you filled it, and replace it every {REFRESH_MONTHS} months.</li>
            <li>
              If supplies run low, FEMA says never ration water: drink what you need today and look for more tomorrow. Make stored
              water safe again with our <Link href="/how-to-purify-water" className="underline">bleach and boiling guide</Link>.
            </li>
          </ul>
        </Section>

        <Section title="Treat what you collect" id="gear">
          <AffiliateDisclosure className="mb-4" />
          <p className="text-stone-700 leading-relaxed max-w-3xl">
            Stored water is the plan. A purifier is the backup for when it runs out and you must use rain, creek or well water of
            unknown quality. Look for a purifier claim, not just a filter: see{" "}
            <Link href="/best-emergency-water-filters" className="underline">emergency water filters ranked by certification</Link>.
            Gravity purifiers we cover come from{" "}
            <PartnerLink brand="msr" productUrl="https://cascadedesigns.com/products/guardian-gravity-purifier">MSR</PartnerLink> and{" "}
            <PartnerLink brand="lifestraw" productUrl="https://lifestraw.com/products/lifestraw-peak-series-gravity-purifier">LifeStraw</PartnerLink>,
            and a one-person press bottle from{" "}
            <PartnerLink brand="grayl" productUrl="https://grayl.com/products/24oz-geopress-filter-purifier-water-bottle-nature-edition">Grayl</PartnerLink>.
          </p>
          <p className="text-sm text-muted mt-4">
            For vans and RVs, see <a href={CAMPER_VOLTS_URL} className="underline" rel="noopener">Camper Volts</a>.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          General information for home emergency planning, not medical advice. Follow instructions from your local health department
          and emergency officials.
        </Disclaimer>
        <Sources
          items={[
            { ...S.cdcWaterStorage, detail: "1 gallon per person per day for 3 days; try for 2 weeks; sanitize, store at 50-70 F, replace every 6 months" },
            { ...S.femaFoodWater, detail: "drink at least half a gallon a day; store 1 gallon per person per day; consider at least two weeks; never ration" },
            { ...S.readyWater, detail: "in very hot temperatures water needs can double; replace non-commercial water every six months" },
          ]}
        />
        <RelatedLinks links={prepLinksFor(PATH)} />
        <PhotoCredit name="outage" />
      </div>
    </div>
  );
}
