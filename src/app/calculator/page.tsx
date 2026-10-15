import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure } from "@/components/affiliate";
import { ChargerPick } from "@/components/chargers";
import { getDailyEVs } from "@/lib/llm-content";
import EVQuiz from "@/components/EVQuiz";
import { Breadcrumbs, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { matchEpa } from "@/lib/epa-match";
import { SOURCES, referenceEv } from "@/lib/energy";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/calculator";
const TITLE = "EV Finder — Which Electric Car Is Right for You?";
const DESCRIPTION =
  "Answer five quick questions about budget, body style, miles and passengers to get matched to electric cars on sale in the US, with official EPA range.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

async function EVQuizLoader() {
  const evs = await getDailyEVs();
  return <EVQuiz initialEVs={evs.map((ev) => ({ ...ev, epa: matchEpa(ev.name) }))} />;
}

function QuizSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <p className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-sm font-semibold">
          Loading current EVs…
        </p>
        <p className="text-4xl sm:text-5xl font-extrabold mb-4" aria-hidden="true">What EV is right for you?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-2xl p-6 border border-black/8 h-32 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

const faqs = [
  {
    q: "How does the EV Finder choose cars?",
    a: "It scores each electric model currently on sale against your answers: body style carries the most weight, then budget, then whether the range comfortably covers your daily driving, then seating, then your top priority. The five highest scores are shown, best match first.",
  },
  {
    q: "Where do the prices and ranges come from?",
    a: "The model list and starting prices are refreshed by automated research and are approximate. Range and efficiency are shown from official EPA ratings on fueleconomy.gov wherever we can match the model, as a range across trims.",
  },
  {
    q: "How much range do I really need?",
    a: "Enough to cover your longest regular day with a comfortable margin for cold weather and battery aging. fueleconomy.gov reports that at 20°F with the cabin heater on, EV range can drop by about 41% compared with mild weather, so a winter commute needs more headroom than a summer one.",
  },
  {
    q: "Is there still a federal tax credit for buying an EV?",
    a: "No. The IRS says the new clean vehicle credit is not allowed for vehicles acquired after 30 September 2025. Interest on a loan for a new vehicle assembled in the US can be deductible up to $10,000 a year for 2025 to 2028, subject to income limits.",
  },
];

export default function CalculatorPage() {
  const typical = referenceEv("typical");
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "EV Finder",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          browserRequirements: "Requires JavaScript",
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ name: "EV Finder", path: PATH }]} />
      </div>
      <Suspense fallback={<QuizSkeleton />}>
        <EVQuizLoader />
      </Suspense>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <Section title="How to pick an electric car" id="guide">
          <div className="text-stone-700 leading-relaxed space-y-4">
            <p>
              <strong>Start with where you will charge.</strong> The Department of Energy says about 80% of EV
              charging happens at home. If you can plug in overnight, almost any modern EV covers daily
              driving; if you rely on public chargers, favor a car with longer range and fast DC charging.
            </p>
            <p>
              <strong>Check efficiency, not just range.</strong> Two cars with similar range can cost very
              different amounts to run. A {typical.year} {typical.make} {typical.model} uses{" "}
              {typical.kwhPer100mi} kWh per 100 miles; big trucks and SUVs can use half as much again. See what
              that means where you live in the{" "}
              <Link href="/ev-charging-cost" className="underline text-spark-orange">
                EV charging cost calculator
              </Link>
              .
            </p>
            <p>
              <strong>Budget for the whole picture.</strong> Federal purchase credits have ended, but some states
              and utilities still offer rebates — see{" "}
              <Link href="/incentives" className="underline text-spark-orange">
                2026 incentives
              </Link>
              . Answers to common worries about battery life, cold weather and resale are on our{" "}
              <Link href="/myths" className="underline text-spark-orange">
                myths page
              </Link>
              .
            </p>
          </div>
        </Section>
        <Section title="Already decided? Charge at home" id="home-charger">
          <p className="text-stone-700 leading-relaxed max-w-3xl mb-4">
            Home charging is where an EV saves you money, and a 240-volt charger means you wake up full every day.{" "}
            <Link href="/ev-charging-cost#home-charger" className="underline text-spark-orange">What a home charger costs and saves</Link>.
          </p>
          <AffiliateDisclosure className="mb-4" />
          <ChargerPick compact />
        </Section>
        <Faq items={faqs} path={PATH} />
        <Disclaimer />
        <Sources
          items={[
            { name: SOURCES.vehicles.name, url: SOURCES.vehicles.url, detail: SOURCES.vehicles.period },
            { name: "U.S. Department of Energy: National EV Charging Network", url: "https://www.energy.gov/topics/national-ev-charging-network", detail: "\"About 80 percent of charging happens at home\"" },
            { name: "fueleconomy.gov: Fuel Economy in Cold Weather", url: "https://fueleconomy.gov/feg/coldweather.shtml", detail: "cites AAA 2019 range testing" },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/ev-charging-cost", label: "EV charging cost calculator", desc: "What your chosen EV costs to run in your state" },
            { href: "/myths", label: "Myths, answered", desc: "Straight answers with sources" },
          ]}
        />
      </div>
    </>
  );
}
