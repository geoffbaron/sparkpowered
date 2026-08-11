import { Suspense } from "react";
import { Metadata } from "next";
import { getDailyBatteries } from "@/lib/llm-content";
import BatteryQuiz from "@/components/BatteryQuiz";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const TITLE = "Home Battery Sizer — What kWh Battery Do You Need?";
const DESCRIPTION =
  "Work out how much home battery storage you actually need. Answer a few questions about your home, outage tolerance and budget, and see matching systems with current prices — Tesla Powerwall, Enphase, EG4, FranklinWH and more.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/battery-calculator",
});

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": url("/battery-calculator#app"),
  name: "Home Battery Sizer",
  url: url("/battery-calculator"),
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript",
  description: DESCRIPTION,
  isPartOf: { "@id": url("/#website") },
  publisher: { "@id": url("/#organization") },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

async function BatteryQuizLoader() {
  const batteries = await getDailyBatteries();
  return <BatteryQuiz initialBatteries={batteries} />;
}

function QuizSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-sky-50 via-amber-50/40 to-orange-50 border-b border-black/6 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-black/8 rounded-full px-4 py-1.5 text-sm font-medium text-muted mb-4 animate-pulse">
            <span aria-hidden="true" translate="no" className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>battery_charging_full</span>Researching battery systems…
          </div>
          <div className="h-10 bg-black/5 rounded-xl max-w-md mx-auto mb-3 animate-pulse" />
          <div className="h-6 bg-black/5 rounded-lg max-w-sm mx-auto animate-pulse" />
        </div>
      </div>

      {/* Quiz skeleton */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-2 bg-amber-100 rounded-full mb-8 animate-pulse" />
        <div className="h-8 bg-black/5 rounded-lg max-w-xs mb-6 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-20 bg-surface rounded-2xl border border-black/8 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BatteryCalculatorPage() {
  return (
    <>
      <JsonLd data={schema} />
      <Suspense fallback={<QuizSkeleton />}>
        <BatteryQuizLoader />
      </Suspense>
    </>
  );
}
