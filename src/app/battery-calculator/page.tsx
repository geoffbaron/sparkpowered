"use client";

import { useState } from "react";
import Link from "next/link";

// ── Battery product database ──────────────────────────────────────────────────

interface BatteryProduct {
  id: string;
  name: string;
  brand: string;
  kwh: number;
  maxKwh?: number; // for scalable systems
  scalable: boolean;
  power_kw: number; // continuous output
  warranty_years: number;
  price_low: number;
  price_high: number;
  solar_compatible: boolean;
  grid_tied: boolean;
  highlights: string[];
}

const BATTERIES: BatteryProduct[] = [
  {
    id: "tesla-powerwall-3",
    name: "Powerwall 3",
    brand: "Tesla Energy",
    kwh: 13.5,
    scalable: true,
    maxKwh: 27,
    power_kw: 11.5,
    warranty_years: 10,
    price_low: 9200,
    price_high: 12000,
    solar_compatible: true,
    grid_tied: true,
    highlights: [
      "Built-in 7.68 kW solar inverter",
      "Stack up to 2 units",
      "Storm Watch automatic backup",
    ],
  },
  {
    id: "enphase-iq10t",
    name: "IQ Battery 10T",
    brand: "Enphase",
    kwh: 10.08,
    scalable: true,
    maxKwh: 40.32,
    power_kw: 3.84,
    warranty_years: 15,
    price_low: 7000,
    price_high: 9500,
    solar_compatible: true,
    grid_tied: true,
    highlights: [
      "Industry-best 15-year warranty",
      "Microinverter-based (very reliable)",
      "Stack 4+ units easily",
    ],
  },
  {
    id: "enphase-iq5p",
    name: "IQ Battery 5P",
    brand: "Enphase",
    kwh: 5.0,
    scalable: true,
    maxKwh: 30,
    power_kw: 3.84,
    warranty_years: 15,
    price_low: 4000,
    price_high: 6000,
    solar_compatible: true,
    grid_tied: true,
    highlights: [
      "Compact modular design",
      "Great entry-level option",
      "15-year warranty",
    ],
  },
  {
    id: "franklin-wh",
    name: "aGate",
    brand: "Franklin WH",
    kwh: 13.6,
    scalable: true,
    maxKwh: 136,
    power_kw: 5.0,
    warranty_years: 12,
    price_low: 8500,
    price_high: 11500,
    solar_compatible: true,
    grid_tied: true,
    highlights: [
      "Massively scalable up to 136 kWh",
      "Outdoor & indoor rated",
      "Competitive pricing",
    ],
  },
  {
    id: "generac-pwrcell",
    name: "PWRcell",
    brand: "Generac",
    kwh: 9,
    maxKwh: 18,
    scalable: true,
    power_kw: 9,
    warranty_years: 10,
    price_low: 9000,
    price_high: 13000,
    solar_compatible: true,
    grid_tied: true,
    highlights: [
      "Highest continuous power output",
      "Scalable from 9–18 kWh",
      "Whole-home backup capable",
    ],
  },
  {
    id: "lg-resu16",
    name: "RESU Prime 16H",
    brand: "LG Energy Solution",
    kwh: 16,
    scalable: false,
    power_kw: 7,
    warranty_years: 10,
    price_low: 8000,
    price_high: 11000,
    solar_compatible: true,
    grid_tied: true,
    highlights: [
      "Large 16 kWh single unit",
      "High power output",
      "Proven LG reliability",
    ],
  },
  {
    id: "sonnen-eco",
    name: "sonnenCore+",
    brand: "Sonnen",
    kwh: 10,
    maxKwh: 20,
    scalable: true,
    power_kw: 4.8,
    warranty_years: 10,
    price_low: 9500,
    price_high: 14000,
    solar_compatible: true,
    grid_tied: true,
    highlights: [
      "German engineering & reliability",
      "10,000 cycle warranty",
      "Peer-to-peer energy sharing (VPP)",
    ],
  },
  {
    id: "panasonic-evervolt",
    name: "EverVolt",
    brand: "Panasonic",
    kwh: 11.4,
    scalable: true,
    maxKwh: 34.2,
    power_kw: 5.5,
    warranty_years: 10,
    price_low: 8000,
    price_high: 11000,
    solar_compatible: true,
    grid_tied: true,
    highlights: [
      "Pairs with Panasonic solar panels",
      "Stackable up to 3 units",
      "Trusted brand heritage",
    ],
  },
];

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

// Daily usage by coverage level (kWh)
const DAILY_KWH: Record<Coverage, number> = {
  essentials: 5,   // lights, fridge, phone charging, wifi
  major: 15,       // essentials + HVAC + TV
  whole: 30,       // full home average
};

// Duration multipliers (days)
const DURATION_DAYS: Record<Duration, number> = {
  hours4: 0.167,
  hours12: 0.5,
  day1: 1,
  days3: 3,
};

function calcNeededKwh(coverage: Coverage, duration: Duration): number {
  const daily = DAILY_KWH[coverage];
  const days = DURATION_DAYS[duration];
  // Divide by 0.85 usable capacity factor; minimum practical battery is 5 kWh
  return Math.max(5, Math.ceil((daily * days) / 0.85));
}

function getMatches(quiz: QuizState): BatteryProduct[] {
  const needed = calcNeededKwh(quiz.coverage!, quiz.duration!);

  return BATTERIES
    .filter((b) => {
      const maxCapacity = b.maxKwh ?? b.kwh;
      // Must be able to meet the need (either directly or by stacking)
      if (maxCapacity < needed && !b.scalable) return false;
      if (b.kwh < needed && !b.scalable) return false;
      // Solar-only mode: must support solar
      if (quiz.goal === "solar" && !b.solar_compatible) return false;
      return true;
    })
    .sort((a, b) => {
      // Prefer units that meet need without stacking
      const aFits = a.kwh >= needed ? 1 : 0;
      const bFits = b.kwh >= needed ? 1 : 0;
      if (aFits !== bFits) return bFits - aFits;
      // Then sort by price ascending
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
      { value: "backup", label: "Power outage backup", emoji: "🔦", desc: "Keep the lights on when the grid goes down" },
      { value: "savings", label: "Reduce electricity bills", emoji: "💰", desc: "Store cheap off-peak power, use it at peak times" },
      { value: "solar", label: "Store solar energy", emoji: "☀️", desc: "Maximize self-consumption from your solar panels" },
      { value: "all", label: "All of the above", emoji: "⚡", desc: "Full energy independence and resilience" },
    ],
  },
  {
    id: "coverage",
    question: "What do you want to keep running?",
    subtitle: "More coverage = more capacity needed.",
    options: [
      { value: "essentials", label: "Essentials only", emoji: "💡", desc: "Lights, fridge, Wi-Fi, phone charging (~5 kWh/day)" },
      { value: "major", label: "Major appliances", emoji: "🏠", desc: "Essentials + HVAC and TV (~15 kWh/day)" },
      { value: "whole", label: "Whole home", emoji: "🏡", desc: "Everything running as normal (~30 kWh/day)" },
    ],
  },
  {
    id: "duration",
    question: "How long do you want backup power?",
    subtitle: "Longer backup = larger battery system.",
    options: [
      { value: "hours4", label: "4 hours", emoji: "⏱️", desc: "Short outages, storm events" },
      { value: "hours12", label: "12 hours", emoji: "🌙", desc: "Overnight coverage" },
      { value: "day1", label: "1 full day", emoji: "📅", desc: "One-day outage protection" },
      { value: "days3", label: "3+ days", emoji: "🌩️", desc: "Extended outage resilience" },
    ],
  },
  {
    id: "solar",
    question: "Do you have solar panels?",
    subtitle: "Solar + battery is the most powerful combo.",
    options: [
      { value: "have", label: "Yes, I have solar", emoji: "☀️", desc: "Already generating clean energy at home" },
      { value: "planning", label: "Planning to add solar", emoji: "🔧", desc: "Looking to bundle solar + battery" },
      { value: "none", label: "No solar (yet!)", emoji: "🔌", desc: "Grid-only or want to explore options" },
    ],
  },
  {
    id: "bill",
    question: "What's your average monthly electricity bill?",
    subtitle: "Helps estimate your potential savings.",
    options: [
      { value: "under100", label: "Under $100", emoji: "💚", desc: "Very efficient home" },
      { value: "100to200", label: "$100–$200", emoji: "📊", desc: "Typical single-family home" },
      { value: "200to300", label: "$200–$300", emoji: "📈", desc: "Larger home or EV charging" },
      { value: "over300", label: "$300+", emoji: "🔥", desc: "High usage or high-rate area" },
    ],
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// ── Component ─────────────────────────────────────────────────────────────────

export default function BatteryCalculatorPage() {
  const [step, setStep] = useState(0);
  const [quiz, setQuiz] = useState<QuizState>({
    goal: null,
    coverage: null,
    duration: null,
    solar: null,
    bill: null,
  });
  const [showResults, setShowResults] = useState(false);

  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

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

  // Estimate annual savings based on bill
  function annualSavings(): { low: number; high: number } {
    const factors: Record<MonthlyBill, [number, number]> = {
      under100: [300, 500],
      "100to200": [600, 900],
      "200to300": [900, 1400],
      over300: [1200, 2000],
    };
    return { low: factors[quiz.bill!][0], high: factors[quiz.bill!][1] };
  }

  if (showResults && quiz.coverage && quiz.duration) {
    const needed = calcNeededKwh(quiz.coverage, quiz.duration);
    const matches = getMatches(quiz);
    const savings = annualSavings();
    const avgPayback = Math.round(
      ((matches[0].price_low + matches[0].price_high) / 2 / savings.high) * 0.7 // 30% ITC
    );

    return (
      <div className="min-h-screen bg-background">
        {/* Hero */}
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
          {/* Savings summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Storage needed", value: `${needed} kWh`, icon: "⚡" },
              {
                label: "Est. annual savings",
                value: `$${savings.low.toLocaleString()}–$${savings.high.toLocaleString()}`,
                icon: "💰",
              },
              {
                label: "Approx. payback (w/ 30% ITC)",
                value: `${avgPayback} years`,
                icon: "📅",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface border border-black/8 rounded-2xl p-5 text-center shadow-sm"
              >
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
                      i === 0
                        ? "border-amber-300 ring-1 ring-amber-200"
                        : "border-black/8"
                    }`}
                  >
                    {i === 0 && (
                      <div className="inline-flex items-center gap-1 bg-gradient-to-r from-spark-yellow to-spark-orange text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                        ⭐ Best Match
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
                          {product.brand}
                        </div>
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
                      <div className="sm:text-right shrink-0">
                        <div className="text-sm text-muted">Installed cost est.</div>
                        <div className="text-xl font-bold">
                          ${totalLow.toLocaleString()}–${totalHigh.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          ~${afterCredit.toLocaleString()} after 30% ITC
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Solar upsell if no solar */}
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

          {/* Disclaimer */}
          <p className="text-xs text-muted text-center pb-2">
            Prices are estimates based on national averages and vary by installer, location, and
            home configuration. Savings estimates assume time-of-use rates. Always get multiple
            quotes. Tax credit eligibility depends on your tax situation.
          </p>

          {/* Restart */}
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
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

      {/* Quiz */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Progress */}
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

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">{currentStep.question}</h2>
          <p className="text-muted">{currentStep.subtitle}</p>
        </div>

        {/* Options */}
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
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Back */}
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
