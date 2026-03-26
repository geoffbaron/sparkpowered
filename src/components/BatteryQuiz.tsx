"use client";

import { useState } from "react";
import Link from "next/link";
import type { BatteryProduct } from "@/lib/llm-content";

// ── Estimation logic ──────────────────────────────────────────────────────────

type Goal = "backup" | "savings" | "solar" | "all";
type Coverage = "essentials" | "major" | "whole";
type Duration = "hours4" | "hours12" | "day1" | "days3";
type SolarStatus = "have" | "planning" | "none";
type Budget = "under5k" | "5kto10k" | "10kto20k" | "over20k";

const BUDGET_MAX: Record<Budget, number> = {
  under5k:  5000,
  "5kto10k":  10000,
  "10kto20k": 20000,
  over20k:  Infinity,
};

interface QuizState {
  goal: Goal | null;
  coverage: Coverage | null;
  duration: Duration | null;
  solar: SolarStatus | null;
  budget: Budget | null;
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
  const budgetMax = BUDGET_MAX[quiz.budget!];

  // Score each battery: capacity fit + budget fit
  const scored = batteries.map((b) => {
    const units = Math.ceil(needed / b.kwh);
    const totalLow = b.price_low * units;
    const maxCapacity = b.maxKwh ?? b.kwh;
    const canScale = b.scalable || b.kwh >= needed;
    const capacityFit = canScale && maxCapacity >= needed;
    const budgetFit = totalLow <= budgetMax;
    // solar goal requires solar_compatible; "store solar" also needs grid_tied
    const solarOk = quiz.goal !== "solar" || (b.solar_compatible && b.grid_tied);

    return { battery: b, units, totalLow, capacityFit, budgetFit, solarOk };
  });

  // Prefer: solar OK + capacity fits + budget fits → then relax budget → then relax capacity
  const ideal = scored.filter((s) => s.solarOk && s.capacityFit && s.budgetFit);
  const withoutBudget = scored.filter((s) => s.solarOk && s.capacityFit && !s.budgetFit);
  const pool = ideal.length >= 2 ? ideal : [...ideal, ...withoutBudget];

  return pool
    .sort((a, b) => {
      // Budget fits first
      if (a.budgetFit !== b.budgetFit) return a.budgetFit ? -1 : 1;
      // Then cheapest total
      return a.totalLow - b.totalLow;
    })
    .map((s) => s.battery)
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
      { value: "backup",  label: "Power outage backup",       icon: "flashlight_on",          desc: "Keep the lights on when the grid goes down" },
      { value: "savings", label: "Reduce electricity bills",  icon: "savings",                desc: "Store cheap off-peak power, use it at peak times" },
      { value: "solar",   label: "Store solar energy",        icon: "wb_sunny",               desc: "Maximize self-consumption from your solar panels" },
      { value: "all",     label: "All of the above",          icon: "bolt",                   desc: "Full energy independence and resilience" },
    ],
  },
  {
    id: "coverage",
    question: "What do you want to keep running?",
    subtitle: "More coverage = more capacity needed.",
    options: [
      { value: "essentials", label: "Essentials only",    icon: "lightbulb",   desc: "Lights, fridge, Wi-Fi, phone charging (~5 kWh/day)" },
      { value: "major",      label: "Major appliances",   icon: "home",        desc: "Essentials + HVAC and TV (~15 kWh/day)" },
      { value: "whole",      label: "Whole home",         icon: "cottage",     desc: "Everything running as normal (~30 kWh/day)" },
    ],
  },
  {
    id: "duration",
    question: "How long do you want backup power?",
    subtitle: "Longer backup = larger battery system.",
    options: [
      { value: "hours4",  label: "4 hours",    icon: "timer",         desc: "Short outages, storm events" },
      { value: "hours12", label: "12 hours",   icon: "bedtime",       desc: "Overnight coverage" },
      { value: "day1",    label: "1 full day", icon: "calendar_today",desc: "One-day outage protection" },
      { value: "days3",   label: "3+ days",    icon: "thunderstorm",  desc: "Extended outage resilience" },
    ],
  },
  {
    id: "solar",
    question: "Do you have solar panels?",
    subtitle: "Solar + battery is the most powerful combo.",
    options: [
      { value: "have",     label: "Yes, I have solar",      icon: "wb_sunny",  desc: "Already generating clean energy at home" },
      { value: "planning", label: "Planning to add solar",  icon: "handyman",  desc: "Looking to bundle solar + battery" },
      { value: "none",     label: "No solar (yet!)",        icon: "power",     desc: "Grid-only or want to explore options" },
    ],
  },
  {
    id: "budget",
    question: "What's your installation budget?",
    subtitle: "Includes equipment and professional installation.",
    options: [
      { value: "under5k",   label: "Under $5,000",    icon: "eco",          desc: "Entry-level backup for essentials" },
      { value: "5kto10k",   label: "$5,000–$10,000",  icon: "savings",      desc: "Most popular range for a single unit" },
      { value: "10kto20k",  label: "$10,000–$20,000", icon: "trending_up",  desc: "Room for a multi-battery system" },
      { value: "over20k",   label: "$20,000+",        icon: "home",         desc: "Full whole-home backup & expansion" },
    ],
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// ── Component ─────────────────────────────────────────────────────────────────

export default function BatteryQuiz({ initialBatteries }: { initialBatteries: BatteryProduct[] }) {
  const [step, setStep] = useState(0);
  const [quiz, setQuiz] = useState<QuizState>({
    goal: null, coverage: null, duration: null, solar: null, budget: null,
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
    setQuiz({ goal: null, coverage: null, duration: null, solar: null, budget: null });
    setStep(0);
    setShowResults(false);
  }

  // Estimate annual savings based on coverage + solar status (no bill question needed)
  function annualSavings(): { low: number; high: number } {
    const base: Record<Coverage, [number, number]> = {
      essentials: [300,  600],
      major:      [600,  1100],
      whole:      [900,  1800],
    };
    const [low, high] = base[quiz.coverage ?? "major"];
    const solarBoost = quiz.solar === "have" ? 1.4 : quiz.solar === "planning" ? 1.2 : 1;
    return { low: Math.round(low * solarBoost), high: Math.round(high * solarBoost) };
  }

  // ── Results ──

  if (showResults && quiz.coverage && quiz.duration && quiz.budget) {
    const needed = calcNeededKwh(quiz.coverage, quiz.duration);
    const matches = getMatches(quiz, initialBatteries);
    const savings = annualSavings();
    const budgetMax = BUDGET_MAX[quiz.budget];
    const bestUnits = Math.ceil(needed / matches[0].kwh);
    const bestTotal = matches[0].price_low * bestUnits;
    const overBudget = bestTotal > budgetMax;
    const avgPayback = Math.round(
      ((matches[0].price_low + matches[0].price_high) / 2 * bestUnits / savings.high) * 0.7
    );

    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-sky-50 via-amber-50/40 to-orange-50 border-b border-black/6 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-black/8 rounded-full px-4 py-1.5 text-sm font-medium text-muted mb-4">
              <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>battery_charging_full</span>Your Battery Recommendation
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
              { label: "Storage needed", value: `${needed} kWh`, icon: "bolt" },
              { label: "Est. annual savings", value: `$${savings.low.toLocaleString()}–$${savings.high.toLocaleString()}`, icon: "savings" },
              { label: "Approx. payback (w/ 30% ITC)", value: `${avgPayback} years`, icon: "calendar_today" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface border border-black/8 rounded-2xl p-5 text-center shadow-sm">
                <div className="mb-1"><span className="material-symbols-outlined" style={{ fontSize: 28, color: "#f59e0b" }}>{stat.icon}</span></div>
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

          {/* Over-budget notice */}
          {overBudget && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-sm text-sky-800">
              <strong>Heads up:</strong> The storage capacity you need ({needed} kWh) is typically
              installed for ${bestTotal.toLocaleString()}–${(matches[0].price_high * bestUnits).toLocaleString()} —
              above your ${budgetMax === Infinity ? "20K+" : `$${budgetMax.toLocaleString()}`} budget.
              We've shown the closest options; consider a smaller coverage area, shorter backup time,
              or getting quotes — installers sometimes have financing or bundle discounts.
            </div>
          )}

          {/* Product cards */}
          <div>
            <h2 className="text-xl font-bold mb-4">Top Matches for You</h2>
            <div className="space-y-4">
              {matches.map((product, i) => {
                const units = unitsNeeded(product, needed);
                const totalLow = product.price_low * units;
                const totalHigh = product.price_high * units;
                const afterCredit = Math.round(totalLow * 0.7);
                const fitsUserBudget = totalLow <= budgetMax;
                return (
                  <div
                    key={product.id}
                    className={`bg-surface border rounded-2xl p-6 shadow-sm transition-shadow hover:shadow-md ${
                      i === 0 ? "border-amber-300 ring-1 ring-amber-200" : "border-black/8"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      {i === 0 && (
                        <div className="inline-flex items-center gap-1 bg-gradient-to-r from-spark-yellow to-spark-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>star</span> Best Match
                        </div>
                      )}
                      {fitsUserBudget && (
                        <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1 rounded-full">
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span> Within Your Budget
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-muted uppercase tracking-wider mb-1">{product.brand}</div>
                        <h3 className="text-lg font-bold">{product.name}</h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted">
                          <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>battery_charging_full</span>{product.kwh} kWh{product.scalable && product.maxKwh ? ` (up to ${product.maxKwh} kWh)` : ""}</span>
                          <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>{product.power_kw} kW output</span>
                          <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>{product.warranty_years}-yr warranty</span>
                        </div>
                        {units > 1 && (
                          <div className="mt-2 text-sm font-medium text-amber-700 bg-amber-50 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg">
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>{units} units recommended for {needed} kWh
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
              <div className="mb-2"><span className="material-symbols-outlined" style={{ fontSize: 32, color: "#f59e0b" }}>wb_sunny</span></div>
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
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>battery_charging_full</span>Home Battery Calculator
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
                className={`group w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200"
                    : "border-black/8 bg-surface hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-muted group-hover:text-spark-orange transition-colors" style={{ fontSize: 28 }}>{option.icon}</span>
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
