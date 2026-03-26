import { Suspense } from "react";
import { Metadata } from "next";
import { getDailyBatteries } from "@/lib/llm-content";
import BatteryQuiz from "@/components/BatteryQuiz";

export const metadata: Metadata = {
  title: "Battery Calculator - Spark Powered",
  description: "Find the right home battery system for your energy needs and budget.",
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
            🔋 Researching battery systems…
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
    <Suspense fallback={<QuizSkeleton />}>
      <BatteryQuizLoader />
    </Suspense>
  );
}
