import { Suspense } from "react";
import { Metadata } from "next";
import { getDailyEVs } from "@/lib/llm-content";
import EVQuiz from "@/components/EVQuiz";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const TITLE = "EV Finder — Which Electric Car Is Right for You?";
const DESCRIPTION =
  "Answer four questions about your budget, driving range, household and charging setup, and get matched to the electric vehicles that actually fit. Model list refreshed daily with current US prices and range figures.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/calculator",
});

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": url("/calculator#app"),
  name: "EV Finder",
  url: url("/calculator"),
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript",
  description: DESCRIPTION,
  isPartOf: { "@id": url("/#website") },
  publisher: { "@id": url("/#organization") },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

async function EVQuizLoader() {
  const evs = await getDailyEVs();
  return <EVQuiz initialEVs={evs} />;
}

function QuizSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-sm font-semibold animate-pulse">
          Researching current EVs…
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-foreground/30">
          What EV is Right for You?
        </h1>
      </div>
      <div className="w-full h-2 bg-amber-100 rounded-full mb-12" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-2xl p-6 border border-black/8 h-32 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <>
      <JsonLd data={schema} />
      <Suspense fallback={<QuizSkeleton />}>
        <EVQuizLoader />
      </Suspense>
    </>
  );
}
