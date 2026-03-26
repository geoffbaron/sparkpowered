"use client";

import { useState } from "react";
import Link from "next/link";
import type { BatteryProduct } from "@/lib/llm-content";

// ── Estimation logic ──────────────────────────────────────────────────────────

type Goal = "backup" | "savings" | "solar" | "all";
type Coverage = "essentials" | "major" | "whole";
type Duration = "hours4" | "hours12" | "day1" | "days3";
type SolarStatus = "have" | "planning" | "none";
type MonthlyBill = "under100" | "100to200" | "200to300" | "over300";

interface QuizState {
  goal: Goal | null;
  coverage: Coverage | null;
  duration: Duration | null;
  solar: SolarStatus | null;
  bill: MonthlyBill | null;
}

const DAILY_KWH: Record<Coverage, number> = {
  essentials: 5,
  major: 15,
  whole: 30,
};

const DURATION_DAYS: Record<Duration, number> = {
  hours4: 0.167,
  hours12: 0.5,
  day1: 1,
  days3: 3,
};

function calcNeededKwh(coverage: Coverage, duration: Duration): number {
  const daily = DAILY_KWH[coverage];
  const days = DURATION_DAYS[duration];
  return Math.max(5, Math.ceil((daily * days) / 0.85));
}

function getMatches(quiz: QuizState, batteries: BatteryProduct[]): BatteryProduct[] {
  const needed = calcNeededKwh(quiz.coverage!, quiz.duration!);
  return batteries
    .filter((b) => {
      const maxCapacity = b.maxKwh ?? b.kwh;
      if (maxCapacity < needed && !b.scalable) return false;
      if (b.kwh < needed && !b.scalable) return false;
      if (quiz.goal === "solar" && !b.solar_compatible) return false;
      return true;
    })
    .sort((a, b) => {
      const aFits = a.kwh >= needed ? 1 : 0;
      const bFits = b.kwh >= needed ? 1 : 0;
      if (aFits !== bFits) return bFits - aFits;
      return a.price_low - b.price_low;
    })
    .slice(0, 4);
}

function unitsNeeded(product: BatteryProduct, neededKwh: number): number {
  return Math.ceil(neededKwh / product.kwh);
}

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "goal",
    question: "What's your main goal?",
    subtitle: "This helps us focus on what matters most to you.",
    options: [
      { value: "backup",  label: "Power outage backup",       emoji: "🔦", desc: "Keep the lights on when the grid goes down" },
      { value: "savings", label: "Reduce electricity bills",  emoji: "💰", desc: "Store cheap off-peak power, use it at peak times" },
      { value: "solar",   label: "Store solar energy",        emoji: "☀️", desc: "Maximize self-consumption from your solar panels" },
      { value: "all",     label: "All of the above",          emoji: "⚡", desc: "Full energy independence and resilience" },
    ],
  },
  {
    id: "coverage",
    question: "What do you want to keep running?",
    subtitle: "More coverage = more capacity needed.",
    options: [
      { value: "essentials", label: "Essentials only",    emoji: "💡", desc: "Lights, fridge, Wi-Fi, phone charging (~5 kWh/day)" },
      { value: "major",      label: "Major appliances",   emoji: "🏠", desc: "Essentials + HVAC and TV (~15 kWh/day)" },
      { value: "whole",      label: "Whole home",         emoji: "🏡", desc: "Everything running as normal (~30 kWh/day)" },
    ],
  },
  {
    id: "duration",
    question: "How long do you want backup power?",
    subtitle: "Longer backup = larger battery system.",
    options: [
      { value: "hours4",  label: "4 hours",    emoji: "⏱️", desc: "Short outages, storm events" },
      { value: "hours12", label: "12 hours",   emoji: "🌙", desc: "Overnight coverage" },
      { value: "day1",    label: "1 full day", emoji: "📅", desc: "One-day outage protection" },
      { value: "days3",   label: "3+ days",    emoji: "🌩️", desc: "Extended outage resilience" },
    ],
  },
  {
    id: "solar",
    question: "Do you have solar panels?",
    subtitle: "Solar + battery is the most powerful combo.",
    options: [
      { value: "have",     label: "Yes, I have solar",      emoji: "☀️", desc: "Already generating clean energy at home" },
      { value: "planning", label: "Planning to add solar",  emoji: "🔧", desc: "Looking to bundle solar + battery" },
      { value: "none",     label: "No solar (yet!)",        emoji: "🔌", desc: "Grid-only or want to explore options" },
    ],
  },
  {
    id: "bill",
    question: "What's your average monthly electricity bill?",
    subtitle: "Helps estimate your potential savings.",
    options: [
      { value: "under100",  label: "Under $100",  emoji: "💚", desc: "Very efficient home" },
      { value: "100to200",  label: "$100–$200",   emoji: "📊", desc: "Typical single-family home" },
      { value: "200to300",  label: "$200–$300",   emoji: "📈", desc: "Larger home or EV charging" },
      { value: "over300",   label: "$300+",        emoji: "🔥", desc: "High usage or high-rate area" },
    ],
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// ── Component ─────────────────────────────────────────────────────────────────

export default function BatteryQuiz({ initialBatteries }: { initialBatteries: BatteryProduct[] }) {
  const [step, setStep] = useState(0);
  const [quiz, setQuiz] = useState<QuizState>({
    goal: null, coverage: null, duration: null, solar: null, bill: null,
  });
  const [showResults, setShowResults] = useState(false);

  const currentStep = STEPS[step];
  const progress = (step / STEPS.length) * 100;

  function select(field: StepId, value: string) {
    const updated = { ...quiz, [field]: value as never };
    setQuiz(updated);
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      setTimeout(() => setShowResults(true), 200);
    }
  }

  function restart() {
    setQuiz({ goal: null, coverage: null, duration: null, solar: null, bill: null });
    setStep(0);
    setShowResults(false);
  }

  function annualSavings(): { low: number; high: number } {
    const factors: Record<MonthlyBill, [number, number]> = {
      under100:  [300, 500],
      "100to200": [600, 900],
      "200to300": [900, 1400],
      over300:   [1200, 2000],
    };
    return { low: factors[quiz.bill!][0], high: factors[quiz.bill!][1] };
  }

  // ── Results ──

  if (showResults && quiz.coverage && quiz.duration) {
    const needed = calcNeededKwh(quiz.coverage, quiz.duration);
    const matches = getMatches(quiz, initialBatteries);
    const savings = annualSavings();
    const avgPayback = Math.round(
      ((matches[0].price_low + matches[0].price_high) / 2 / savings.high) * 0.7
    );

    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-sky-50 via-amber-50/40 to-orange-50 border-b border-black/6 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-black/8 rounded-full px-4 py-1.5 text-sm font-medium text-muted mb-4">
              🔋 Your Battery Recommendation
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              You need about{" "}
              <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
                {needed} kWh
              </span>{" "}
              of storage
            </h1>
            <p className="text-muted text-lg">
              Based on your answers, here are the best battery systems for your home.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Storage needed", value: `${needed} kWh`, icon: "⚡" },
              { label: "Est. annual savings", value: `$${savings.low.toLocaleString()}–$${savings.high.toLocaleString()}`, icon: "💰" },
              { label: "Approx. payback (w/ 30% ITC)", value: `${avgPayback} years`, icon: "📅" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface border border-black/8 rounded-2xl p-5 text-center shadow-sm">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ITC note */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            <strong>30% Federal Tax Credit (ITC):</strong> The Inflation Reduction Act gives you a
            30% tax credit on battery installations through at least 2032. A $10,000 system
            effectively costs ~$7,000 after the credit.
          </div>

          {/* Product cards */}
          <div>
            <h2 className="text-xl font-bold mb-4">Top Matches for You</h2>
            <div className="space-y-4">
              {matches.map((product, i) => {
                const units = unitsNeeded(product, needed);
                const totalLow = product.price_low * units;
                const totalHigh = product.price_high * units;
                const afterCredit = Math.round(totalLow * 0.7);
                return (
                  <div
                    key={product.id}
                    className={`bg-surface border rounded-2xl p-6 shadow-sm transition-shadow hover:shadow-md ${
                      i === 0 ? "border-amber-300 ring-1 ring-amber-200" : "border-black/8"
                    }`}
                  >
                    {i === 0 && (
                      <div className="inline-flex items-center gap-1 bg-gradient-to-r from-spark-yellow to-spark-orange text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                        ⭐ Best Match
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-muted uppercase tracking-wider mb-1">{product.brand}</div>
                        <h3 className="text-lg font-bold">{product.name}</h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted">
                          <span>🔋 {product.kwh} kWh{product.scalable && product.maxKwh ? ` (up to ${product.maxKwh} kWh)` : ""}</span>
                          <span>⚡ {product.power_kw} kW output</span>
                          <span>🛡️ {product.warranty_years}-yr warranty</span>
                        </div>
                        {units > 1 && (
                          <div className="mt-2 text-sm font-medium text-amber-700 bg-amber-50 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg">
                            ℹ️ {units} units recommended for {needed} kWh
                          </div>
                        )}
                        <ul className="mt-3 space-y-1">
                          {product.highlights.map((h) => (
                            <li key={h} className="text-sm text-muted flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">✓</span>
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="sm:text-right shrink-0 flex flex-col gap-2">
                        <div>
                          <div className="text-sm text-muted">Installed cost est.</div>
                          <div className="text-xl font-bold">${totalLow.toLocaleString()}–${totalHigh.toLocaleString()}</div>
                          <div className="text-sm text-green-600 font-medium">~${afterCredit.toLocaleString()} after 30% ITC</div>
                        </div>
                        <a
                          href={product.learnMoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white text-sm font-bold shadow hover:shadow-md transition-shadow"
                        >
                          Learn More
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EnergySage CTA */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Ready to get real quotes?</h3>
                <p className="text-muted text-sm">
                  EnergySage lets you compare certified installers side-by-side — for free. Most
                  homeowners save 20–30% compared to a single quote.
                </p>
              </div>
              <a
                href="https://www.energysage.com/shop/home-battery-storage/"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow transition-colors text-sm whitespace-nowrap"
              >
                Compare Quotes on EnergySage
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Solar upsell */}
          {quiz.solar === "none" && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <div className="text-2xl mb-2">☀️</div>
              <h3 className="font-bold text-lg mb-1">Add solar and maximize your savings</h3>
              <p className="text-muted text-sm mb-4">
                A battery alone can shift energy use and provide backup. But pairing with solar lets
                you generate free electricity and potentially eliminate your bill entirely.
              </p>
              <Link
                href="/solar-finder"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-spark-yellow to-spark-orange text-white font-bold px-5 py-2.5 rounded-xl shadow hover:shadow-lg transition-shadow text-sm"
              >
                Find Solar Installers Near You →
              </Link>
            </div>
          )}

          <p className="text-xs text-muted text-center pb-2">
            Prices are estimates based on national averages and vary by installer, location, and
            home configuration. Savings estimates assume time-of-use rates. Always get multiple
            quotes. Tax credit eligibility depends on your tax situation.
          </p>

          <div className="text-center">
            <button
              onClick={restart}
              className="px-6 py-2.5 rounded-xl border border-black/12 text-sm font-medium text-muted hover:bg-surface-light hover:text-foreground transition-colors"
            >
              ← Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ──

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-sky-50 via-amber-50/40 to-orange-50 border-b border-black/6 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-black/8 rounded-full px-4 py-1.5 text-sm font-medium text-muted mb-4">
            🔋 Home Battery Calculator
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Right-size your{" "}
            <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
              home battery
            </span>
          </h1>
          <p className="text-muted text-lg">
            Answer 5 quick questions and we&apos;ll match you with the best battery systems for your
            home and goals.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>Question {step + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-surface-light rounded-full overflow-hidden border border-black/6">
            <div
              className="h-full bg-gradient-to-r from-spark-yellow to-spark-orange rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">{currentStep.question}</h2>
          <p className="text-muted">{currentStep.subtitle}</p>
        </div>

        <div className="space-y-3">
          {currentStep.options.map((option) => {
            const isSelected = quiz[currentStep.id as keyof QuizState] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => select(currentStep.id as StepId, option.value)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200"
                    : "border-black/8 bg-surface hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{option.emoji}</span>
                  <div>
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-muted">{option.desc}</div>
                  </div>
                  {isSelected && (
                    <div className="ml-auto text-amber-500">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-6 text-sm text-muted hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
