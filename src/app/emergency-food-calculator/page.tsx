import type { Metadata } from "next";
import Link from "next/link";
import FoodCalc from "@/components/FoodCalc";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { HubHero, PhotoCredit } from "@/components/ui";
import { formatDate } from "@/lib/energy";
import { GOAL_DAYS, MIN_DAYS, PREGNANCY_EXTRA, PREP_CHECKED, PREP_SOURCES as S, caloriesPerDay, foodNeeded, prepLinksFor } from "@/lib/prep";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/emergency-food-calculator";
const TITLE = "Emergency Food Calculator: Calories, Not Servings";
const DESCRIPTION =
  "How many calories of emergency food your household needs for 3 days or 2 weeks, from the USDA Dietary Guidelines calorie table, and how to compare kits on real calories.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const n0 = (n: number) => n.toLocaleString("en-US");

export default function EmergencyFoodCalculatorPage() {
  const man = caloriesPerDay(40, "male", "moderate");
  const woman = caloriesPerDay(40, "female", "moderate");
  const couple = foodNeeded(
    [
      { age: 40, sex: "male" },
      { age: 40, sex: "female" },
    ],
    GOAL_DAYS,
    "moderate",
  );
  const family = foodNeeded(
    [
      { age: 40, sex: "male" },
      { age: 40, sex: "female" },
      { age: 10, sex: "male" },
      { age: 7, sex: "female" },
    ],
    GOAL_DAYS,
    "moderate",
  );

  const faqs = [
    {
      q: "How many calories a day do I need in an emergency?",
      a: `The Dietary Guidelines estimate adult needs at 1,600 to 2,400 calories a day for women and 2,000 to 3,000 for men, depending on age and activity. A moderately active 40-year-old man needs about ${n0(man)}, and a woman about ${n0(woman)}. Children need less; teenage boys can need more.`,
    },
    {
      q: "How much food do I need for two weeks?",
      a: `Count calories, not meals. A moderately active couple aged 40 needs about ${n0(couple.daily)} calories a day, or ${n0(couple.total)} for ${GOAL_DAYS} days. A family of four with children aged 10 and 7 needs about ${n0(family.total)}. FEMA suggests keeping a two-week supply.`,
    },
    {
      q: "Why not count servings or days of food on the box?",
      a: "Because a \"serving\" can be any size and a \"day\" can mean fewer calories than you need. In 2023 the National Advertising Division, the ad industry's watchdog, found that many of one emergency food seller's \"2,000+ calories per day\" claims lacked a clear disclosure and recommended adding one. Add up the calories on the Nutrition Facts panels instead.",
    },
    {
      q: "Do pregnant or breastfeeding women need more emergency food?",
      a: `Yes. The Dietary Guidelines add about ${PREGNANCY_EXTRA["trimester-2"]} calories a day in the second trimester, ${PREGNANCY_EXTRA["trimester-3"]} in the third, and ${PREGNANCY_EXTRA["lactation-1"]} to ${PREGNANCY_EXTRA["lactation-2"]} while breastfeeding, for a healthy pre-pregnancy weight. Nothing extra is needed in the first trimester. Follow your own provider's advice.`,
    },
    {
      q: "What food is best for an emergency supply?",
      a: "FEMA suggests foods your family already eats that need no refrigeration, water, special preparation or cooking, and that are high in calories and nutrition. Canned goods and pantry staples count. Rotate them, first in, first out, and keep a manual can opener.",
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Emergency Food Calculator",
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
        crumbs={[{ name: "Emergency food calculator", path: PATH }]}
        eyebrow="Emergency prep"
        title={<>Count calories, not servings. <span className="text-amber-300">Know how much food your family needs.</span></>}
        sub={
          <>
            A moderately active couple needs about <strong className="text-amber-300">{n0(couple.total)} calories</strong> for two
            weeks. Enter your household to get your number, then check any food kit against it.
          </>
        }
      >
        <a href="#calculator" className="btn btn-primary">Work out my food</a>
        <a href="#kits" className="btn btn-light">How to compare kits</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Figures checked <time dateTime={PREP_CHECKED}>{formatDate(PREP_CHECKED)}</time> against the USDA Dietary Guidelines and FEMA.
        </p>
        <QuickAnswer>
          <p>
            Multiply each person&apos;s daily calories by the days you want to cover. A moderately active adult needs roughly{" "}
            {n0(woman)} to {n0(man)} calories a day. For a couple that is about {n0(couple.daily)} a day: {n0(couple.daily * MIN_DAYS)}{" "}
            for {MIN_DAYS} days, {n0(couple.total)} for {GOAL_DAYS} days. Judge a food kit by its total calories, not its servings.
          </p>
        </QuickAnswer>

        <h2 id="calculator" className="text-2xl font-extrabold text-ink mt-10 mb-4 scroll-mt-24">Your household, your calories</h2>
        <FoodCalc />

        <Section title="Where the numbers come from" id="how">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              Calories per person come from the Dietary Guidelines for Americans 2020-2025, Appendix 2, which lists estimated needs by
              age, sex and activity level for ages 2 and up. The estimates assume average height and a healthy weight. The newer
              2025-2030 Guidelines say calorie needs depend on age, sex, height, weight and activity but print no table, so the
              2020-2025 table is the latest one published.
            </p>
            <p>
              Days: CDC and FEMA use {MIN_DAYS} days as a minimum for water and two weeks as the goal, and FEMA suggests a two-week food
              supply too. Ready.gov says at least a several-day supply.
            </p>
          </div>
        </Section>

        <Section title="How to compare food kits honestly" id="kits">
          <AffiliateDisclosure className="mb-4" />
          <ol className="list-decimal pl-5 space-y-2 text-stone-700 max-w-3xl">
            <li>Ignore &quot;servings&quot;, &quot;meals&quot; and &quot;days of food&quot; on the front of the box.</li>
            <li>Find the Nutrition Facts for each pouch or can: calories per serving x servings per container.</li>
            <li>Add up every item in the kit for its total calories.</li>
            <li>Enter that total and the price in the checker above to see how many days it feeds your household and the cost per 1,000 calories.</li>
          </ol>
          <Callout>
            Why we insist: in May 2023 the National Advertising Division found that many of one seller&apos;s &quot;2,000+ calories per
            day&quot; claims for its long-term food kits had no clear disclosure, and recommended adding one. We do not repeat any
            brand&apos;s days or servings figures, and we list no calorie counts we could not check.
          </Callout>
          <p className="text-stone-700 leading-relaxed max-w-3xl mt-4">
            Freeze-dried kits are one option, not a requirement. If you want one, brands to compare include{" "}
            <PartnerLink brand="valleyfood">Valley Food Storage</PartnerLink>, <PartnerLink brand="readywise">ReadyWise</PartnerLink> and{" "}
            <PartnerLink brand="mountainhouse">Mountain House</PartnerLink>. Most need water to prepare, so add that to your{" "}
            <Link href="/emergency-water-storage-calculator" className="underline">water storage</Link>.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Calorie needs are estimates for healthy people of average size, not medical or dietary advice. Babies, people with medical
          conditions and special diets need a plan from their own doctor.
        </Disclaimer>
        <Sources
          items={[
            { ...S.dga2020, detail: "Table A2-2 estimated calorie needs by age, sex and activity; Table A2-3 pregnancy and lactation" },
            { ...S.dga2025, detail: "calorie needs depend on age, sex, height, weight and activity" },
            { ...S.femaFoodWater, detail: "two-week food supply; foods needing no refrigeration, water or cooking; first in, first out" },
            { ...S.readyFood, detail: "at least a several-day supply of non-perishable food" },
            { ...S.nadMps, detail: "many \"2,000+ calories per day\" claims lacked a clear disclosure" },
          ]}
        />
        <RelatedLinks links={prepLinksFor(PATH)} />
        <PhotoCredit name="outage" />
      </div>
    </div>
  );
}
