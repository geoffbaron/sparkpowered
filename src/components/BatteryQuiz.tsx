"use client";

import { useState } from "react";
import Link from "next/link";
import { useNoTesla } from "@/hooks/useNoTesla";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { INSTALLED_BATTERY_COST } from "@/data/products";
import { fullName, kwh, money, sizerMatches, watts } from "@/lib/products";

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

export default function BatteryQuiz() {
  const [step, setStep] = useState(0);
  const [quiz, setQuiz] = useState<QuizState>({
    goal: null, coverage: null, duration: null, solar: null, budget: null,
  });
  const [showResults, setShowResults] = useState(false);
  const [noTesla, setNoTesla] = useNoTesla();

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

  // ── Results ──

  if (showResults && quiz.coverage && quiz.duration && quiz.budget) {
    const needed = calcNeededKwh(quiz.coverage, quiz.duration);
    const budgetMax = BUDGET_MAX[quiz.budget];
    const matches = sizerMatches(needed, { excludeBrands: noTesla ? ["tesla"] : [] });
    const fits = (cost: number) => cost <= budgetMax;
    const anyFits = matches.some((m) => fits(m.cost));
    const costText = (m: (typeof matches)[number]) =>
      m.config.equipmentUsd != null
        ? money(m.config.equipmentUsd)
        : m.config.installedUsd
          ? `about ${money(m.config.installedUsd)}`
          : "Price by quote";
    const configText = (m: (typeof matches)[number]) => {
      const p = m.product;
      if (p.install === "professional") return `${m.config.units} × ${p.model} = ${kwh(m.config.totalWh)}`;
      if (m.config.addOns > 0 && p.addOn)
        return `${p.model} + ${m.config.addOns} × ${p.addOn.model} = ${kwh(m.config.totalWh)}`;
      return `1 × ${p.model} = ${kwh(m.config.totalWh)}`;
    };

    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-sky-50 via-amber-50/40 to-orange-50 border-b border-black/6 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-black/8 rounded-full px-4 py-1.5 text-sm font-medium text-muted mb-4">
              <span aria-hidden="true" translate="no" className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>battery_charging_full</span>Your Battery Recommendation
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              You need about{" "}
              <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
                {needed} kWh
              </span>{" "}
              of storage
            </h1>
            <p className="text-muted text-lg">
              Here are {matches.length} real systems that reach that size, cheapest first.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <AffiliateDisclosure />

          {/* ITC note */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            <strong>The 30% federal credit has ended for homeowners:</strong> the Residential Clean
            Energy Credit (25D) covered 30% of a home battery, but the IRS says it is not allowed for
            expenditures made after 31 December 2025, so prices shown here are what a cash buyer pays.
            Some states and utilities run their own storage rebates.{" "}
            <Link href="/incentives" className="underline font-semibold">See what is still available</Link>.
          </div>

          {!anyFits && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-sm text-sky-800">
              <strong>Heads up:</strong> none of these reaches {needed} kWh within your{" "}
              {budgetMax === Infinity ? "budget" : `${money(budgetMax)} budget`}. Backing up fewer circuits or
              for a shorter time shrinks the battery quickly; try the sizer again with &quot;Essentials only&quot;.
            </div>
          )}

          {/* Product cards */}
          <div>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
              <h2 className="text-xl font-bold">Systems that reach {needed} kWh</h2>
              <button
                onClick={() => setNoTesla(!noTesla)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  noTesla
                    ? "bg-red-50 text-red-600 border-red-300"
                    : "bg-surface-light text-muted border-black/8 hover:border-black/16"
                }`}
              >
                <span aria-hidden="true" translate="no" className="material-symbols-outlined" style={{ fontSize: 13 }}>
                  {noTesla ? "block" : "electric_car"}
                </span>
                {noTesla ? "No Tesla (on)" : "No Tesla"}
              </button>
            </div>
            <div className="space-y-4">
              {matches.map((m, i) => {
                const p = m.product;
                const inBudget = fits(m.cost);
                return (
                  <div
                    key={p.id}
                    className={`bg-surface border rounded-2xl p-5 sm:p-6 shadow-sm ${
                      i === 0 ? "border-amber-300 ring-1 ring-amber-200" : "border-black/8"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center bg-surface-light border border-black/8 text-xs font-semibold px-3 py-1 rounded-full">
                        {p.install === "professional" ? "Professionally installed" : "Plug in yourself"}
                      </span>
                      {inBudget && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1 rounded-full">
                          <span aria-hidden="true" translate="no" className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span> Within your budget
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{fullName(p)}</h3>
                        <p className="text-sm font-medium text-amber-800 mt-1">{configText(m)}</p>
                        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-stone-700">
                          <li>{watts(p.acOutputW)} continuous output</li>
                          {p.chemistry && <li>{p.chemistry} battery</li>}
                          <li>{p.volts}</li>
                          {p.warrantyYears && <li>{p.warrantyYears}-year warranty</li>}
                          {p.maxCapacityWh && <li>Expands to {kwh(p.maxCapacityWh)}</li>}
                          {p.solarInputW && <li>{watts(p.solarInputW)} solar input</li>}
                        </ul>
                        {p.notes[0] && <p className="mt-3 text-sm text-muted">{p.notes[0]}</p>}
                      </div>
                      <div className="sm:text-right shrink-0 flex flex-col gap-2 sm:max-w-[14rem]">
                        <div>
                          <div className="text-sm text-muted">
                            {m.config.equipmentUsd != null ? "Listed price, this setup" : "Typical installed cost"}
                          </div>
                          <div className="text-xl font-bold">{costText(m)}</div>
                        </div>
                        <PartnerLink brand={p.brand} productId={p.id} productUrl={p.url} category="battery" variant="button">
                          {p.install === "professional" ? `See ${p.model}` : `Check price`}
                        </PartnerLink>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Solar upsell */}
          {quiz.solar === "none" && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <div className="mb-2"><span aria-hidden="true" translate="no" className="material-symbols-outlined" style={{ fontSize: 32, color: "#f59e0b" }}>wb_sunny</span></div>
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
            Prices for plug-in systems are each maker&apos;s listed US price for the setup shown, checked on the
            date on our{" "}
            <Link href="/best-portable-power-stations" className="underline">power station guide</Link>; add-on
            batteries are the maker&apos;s own. Installed costs multiply the kWh by EnergySage&apos;s average installed price
            per kWh for that brand in the first half of 2026 (or {INSTALLED_BATTERY_COST.source}) and vary
            with your home and installer, so get several quotes. Storage needed assumes about 85% of a
            battery&apos;s rated capacity is usable in practice.
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
            <span aria-hidden="true" translate="no" className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>battery_charging_full</span>Home Battery Calculator
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
                  <span aria-hidden="true" translate="no" className="material-symbols-outlined text-muted group-hover:text-spark-orange transition-colors" style={{ fontSize: 28 }}>{option.icon}</span>
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
