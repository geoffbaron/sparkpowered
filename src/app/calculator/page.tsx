import { Suspense } from "react";
import { Metadata } from "next";
import { getDailyEVs } from "@/lib/llm-content";
import EVQuiz from "@/components/EVQuiz";

export const metadata: Metadata = {
  title: "EV Finder - Spark Powered",
  description: "Find the perfect electric vehicle for your lifestyle and budget.",
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
    <Suspense fallback={<QuizSkeleton />}>
      <EVQuizLoader />
    </Suspense>
  );
}
