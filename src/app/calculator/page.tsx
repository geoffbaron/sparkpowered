"use client";

import React, { useState } from "react";

// ── EV Database ───────────────────────────────────────────────────────────────

interface EVResult {
  name: string;
  range: number;
  price: string;
  type: string;
  highlight: string;
  seats: number;
  cargo: string;
  url: string;
}

const evDatabase: EVResult[] = [
  { name: "Chevrolet Equinox EV", range: 319, price: "$33,900", type: "SUV", highlight: "Best value family SUV with incredible range", seats: 5, cargo: "Large", url: "https://www.chevrolet.com/electric/equinox-ev" },
  { name: "Tesla Model 3", range: 358, price: "$38,990", type: "Sedan", highlight: "Best-selling EV with great range and tech", seats: 5, cargo: "Medium", url: "https://www.tesla.com/model3" },
  { name: "Tesla Model Y", range: 310, price: "$44,990", type: "SUV", highlight: "Versatile crossover with massive cargo space", seats: 5, cargo: "Large", url: "https://www.tesla.com/modely" },
  { name: "Hyundai Ioniq 5", range: 303, price: "$41,800", type: "SUV", highlight: "Ultra-fast charging and retro-futuristic design", seats: 5, cargo: "Large", url: "https://www.hyundaiusa.com/us/en/vehicles/ioniq-5" },
  { name: "Hyundai Ioniq 6", range: 361, price: "$42,450", type: "Sedan", highlight: "Aerodynamic design delivers outstanding range", seats: 5, cargo: "Medium", url: "https://www.hyundaiusa.com/us/en/vehicles/ioniq-6" },
  { name: "Ford Mustang Mach-E", range: 312, price: "$42,995", type: "SUV", highlight: "Sporty handling with family-friendly space", seats: 5, cargo: "Large", url: "https://www.ford.com/electric-vehicles/mach-e/" },
  { name: "Kia EV6", range: 310, price: "$42,600", type: "SUV", highlight: "Fun to drive with V2L power sharing", seats: 5, cargo: "Large", url: "https://www.kia.com/us/en/ev6" },
  { name: "Kia EV9", range: 304, price: "$54,900", type: "SUV", highlight: "Three-row electric SUV for large families", seats: 7, cargo: "Extra Large", url: "https://www.kia.com/us/en/ev9" },
  { name: "Rivian R1S", range: 321, price: "$75,900", type: "SUV", highlight: "Adventure-ready with incredible off-road capability", seats: 7, cargo: "Extra Large", url: "https://rivian.com/r1s" },
  { name: "Ford F-150 Lightning", range: 320, price: "$49,995", type: "Truck", highlight: "Work-ready electric truck with Pro Power Onboard", seats: 5, cargo: "Truck Bed", url: "https://www.ford.com/electric-vehicles/f-150-lightning/" },
  { name: "Rivian R1T", range: 328, price: "$69,900", type: "Truck", highlight: "Adventure truck with built-in camp kitchen", seats: 5, cargo: "Truck Bed", url: "https://rivian.com/r1t" },
  { name: "Chevrolet Silverado EV", range: 450, price: "$57,095", type: "Truck", highlight: "Massive range and available Midgate", seats: 5, cargo: "Truck Bed", url: "https://www.chevrolet.com/electric/silverado-ev" },
  { name: "Nissan Leaf", range: 212, price: "$28,140", type: "Hatchback", highlight: "Affordable and proven EV for city driving", seats: 5, cargo: "Medium", url: "https://www.nissanusa.com/vehicles/electric-cars/leaf.html" },
  { name: "Chevrolet Bolt EUV", range: 247, price: "$27,800", type: "Hatchback", highlight: "Most affordable EV with Super Cruise available", seats: 5, cargo: "Medium", url: "https://www.chevrolet.com/electric/bolt-ev" },
  { name: "Mini Cooper SE", range: 114, price: "$30,900", type: "Hatchback", highlight: "Fun city car with iconic style", seats: 4, cargo: "Small", url: "https://www.miniusa.com/model/electric-vehicles.html" },
  { name: "BMW iX", range: 324, price: "$87,100", type: "SUV", highlight: "Luxury electric SUV with cutting-edge tech", seats: 5, cargo: "Large", url: "https://www.bmwusa.com/vehicles/bmw-i-series/ix/bmw-ix.html" },
  { name: "Mercedes EQS Sedan", range: 350, price: "$104,400", type: "Sedan", highlight: "Ultra-luxury electric flagship with Hyperscreen", seats: 5, cargo: "Medium", url: "https://www.mbusa.com/en/vehicles/class/eqs/sedan" },
  { name: "Porsche Taycan", range: 246, price: "$92,250", type: "Sedan", highlight: "Performance EV with legendary Porsche handling", seats: 5, cargo: "Medium", url: "https://www.porsche.com/usa/models/taycan/" },
  { name: "Volkswagen ID.4", range: 275, price: "$39,735", type: "SUV", highlight: "Spacious and practical with solid value", seats: 5, cargo: "Large", url: "https://www.vw.com/en/models/id-4.html" },
  { name: "Toyota bZ4X", range: 252, price: "$42,000", type: "SUV", highlight: "Toyota reliability meets electric efficiency", seats: 5, cargo: "Large", url: "https://www.toyota.com/bz4x/section/levels/" },
];

// ── Scoring ───────────────────────────────────────────────────────────────────

const typeMap: Record<string, string> = {
  sedan: "Sedan", suv: "SUV", truck: "Truck", hatchback: "Hatchback",
};

const budgetRanges: Record<string, [number, number]> = {
  under35:  [0, 35000],
  "35to50": [35000, 50000],
  "50to80": [50000, 80000],
  over80:   [80000, Infinity],
};

const cargoOrder: Record<string, number> = {
  "Truck Bed": 5, "Extra Large": 4, "Large": 3, "Medium": 2, "Small": 1,
};

function priceNum(ev: EVResult) {
  return parseInt(ev.price.replace(/[$,]/g, ""));
}

function scoreEV(ev: EVResult, quiz: QuizState): number {
  let score = 0;

  if (quiz.bodyType && ev.type === typeMap[quiz.bodyType]) score += 35;
  else score -= 5;

  if (quiz.budget) {
    const [lo, hi] = budgetRanges[quiz.budget];
    const p = priceNum(ev);
    if (p >= lo && p <= hi) score += 25;
    else if (p < lo) score += 15;
    else score += Math.max(-25, -Math.round(((p - hi) / hi) * 40));
  }

  if (quiz.dailyMiles) {
    const minRange = { under30: 100, "30to60": 150, "60to100": 200, over100: 300 }[quiz.dailyMiles] ?? 0;
    if (ev.range >= minRange * 2) score += 20;
    else if (ev.range >= minRange * 1.5) score += 15;
    else if (ev.range >= minRange) score += 10;
    else score -= 10;
  }

  if (quiz.passengers) {
    if (quiz.passengers === "5plus") score += ev.seats >= 7 ? 15 : 5;
    else if (quiz.passengers === "3to4") score += ev.seats >= 5 ? 15 : 0;
    else score += 15;
  }

  if (quiz.priority === "range") score += Math.min(10, Math.floor(ev.range / 40));
  else if (quiz.priority === "value") score += Math.min(10, Math.floor((80000 - priceNum(ev)) / 7000));
  else if (quiz.priority === "performance") score += Math.min(10, Math.floor(priceNum(ev) / 12000));
  else if (quiz.priority === "space") score += (cargoOrder[ev.cargo] || 0) * 2;

  return score;
}

function getRecommendations(quiz: QuizState): EVResult[] {
  return [...evDatabase]
    .map((ev) => ({ ev, score: scoreEV(ev, quiz) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ ev }) => ev);
}

// ── Quiz state ────────────────────────────────────────────────────────────────

interface QuizState {
  step: number;
  budget: string;
  bodyType: string;
  dailyMiles: string;
  priority: string;
  passengers: string;
}

// ── Steps ─────────────────────────────────────────────────────────────────────

const steps = [
  {
    key: "budget",
    question: "What's your budget?",
    options: [
      { value: "under35",  label: "Under $35,000", sublabel: "Affordable",  icon: "savings" },
      { value: "35to50",   label: "$35,000–$50,000", sublabel: "Mid-range", icon: "credit_card" },
      { value: "50to80",   label: "$50,000–$80,000", sublabel: "Premium",   icon: "diamond" },
      { value: "over80",   label: "$80,000+",         sublabel: "Luxury",   icon: "workspace_premium" },
    ],
  },
  {
    key: "bodyType",
    question: "What type of vehicle?",
    options: [
      { value: "sedan",     label: "Sedan",                sublabel: "Sleek & efficient",   icon: "directions_car" },
      { value: "suv",       label: "SUV / Crossover",      sublabel: "Versatile & popular", icon: "airport_shuttle" },
      { value: "truck",     label: "Truck",                sublabel: "Work & adventure",    icon: "local_shipping" },
      { value: "hatchback", label: "Hatchback / City Car", sublabel: "Compact & nimble",    icon: "electric_car" },
    ],
  },
  {
    key: "dailyMiles",
    question: "How far do you drive daily?",
    options: [
      { value: "under30",  label: "Under 30 miles", sublabel: "Around town",    icon: "location_city" },
      { value: "30to60",   label: "30–60 miles",    sublabel: "Daily commute",  icon: "commute" },
      { value: "60to100",  label: "60–100 miles",   sublabel: "Longer commute", icon: "map" },
      { value: "over100",  label: "100+ miles",     sublabel: "High mileage",   icon: "speed" },
    ],
  },
  {
    key: "priority",
    question: "What matters most to you?",
    options: [
      { value: "value",       label: "Best Value",    sublabel: "Most car for the money",  icon: "local_offer" },
      { value: "range",       label: "Max Range",     sublabel: "Never worry about range", icon: "battery_charging_full" },
      { value: "performance", label: "Performance",   sublabel: "Thrilling acceleration",  icon: "speed" },
      { value: "space",       label: "Cargo & Space", sublabel: "Maximize room inside",    icon: "inventory_2" },
    ],
  },
  {
    key: "passengers",
    question: "How many people ride regularly?",
    options: [
      { value: "1to2", label: "Just me or 1–2", sublabel: "Solo or couple", icon: "person" },
      { value: "3to4", label: "3–4 people",     sublabel: "Small family",   icon: "group" },
      { value: "5plus",label: "5+ people",      sublabel: "Large family",   icon: "groups" },
    ],
  },
] as const;

type StepKey = (typeof steps)[number]["key"];

// ── Page component ────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [quiz, setQuiz] = useState<QuizState>({
    step: 0, budget: "", bodyType: "", dailyMiles: "", priority: "", passengers: "",
  });
  const [showResults, setShowResults] = useState(false);

  const currentStep = steps[quiz.step];
  const progress = (quiz.step / steps.length) * 100;

  function selectOption(value: string) {
    const newQuiz = { ...quiz, [currentStep.key as StepKey]: value };
    if (quiz.step < steps.length - 1) {
      setQuiz({ ...newQuiz, step: quiz.step + 1 });
    } else {
      setQuiz(newQuiz);
      setShowResults(true);
    }
  }

  function reset() {
    setQuiz({ step: 0, budget: "", bodyType: "", dailyMiles: "", priority: "", passengers: "" });
    setShowResults(false);
  }

  function goBack() {
    if (quiz.step > 0) setQuiz({ ...quiz, step: quiz.step - 1 });
  }

  // ── Results ──

  if (showResults) {
    const results = getRecommendations(quiz);
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4">
            Your{" "}
            <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
              Perfect EVs
            </span>
          </h1>
          <p className="text-muted text-lg">Based on your preferences, here are our top recommendations.</p>
        </div>

        <div className="space-y-6">
          {results.map((ev, i) => (
            <div
              key={ev.name}
              className={`bg-surface rounded-2xl p-6 border flex flex-col sm:flex-row gap-6 transition-shadow hover:shadow-md ${
                i === 0 ? "border-amber-300 ring-1 ring-amber-200" : "border-black/6"
              }`}
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-2xl font-bold text-spark-orange shrink-0">
                #{i + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{ev.name}</h3>
                <p className="text-spark-orange text-sm font-medium mb-3">{ev.highlight}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted">
                  <span><span className="text-green-600 font-semibold">{ev.range} mi</span> range</span>
                  <span><span className="text-blue-600 font-semibold">{ev.price}</span> MSRP</span>
                  <span>{ev.type}</span>
                  <span>{ev.seats} seats</span>
                  <span>{ev.cargo} cargo</span>
                </div>
              </div>
              <div className="shrink-0 flex items-center">
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white text-sm font-bold shadow hover:shadow-md transition-shadow whitespace-nowrap"
                >
                  Explore
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Edmunds CTA */}
        <div className="mt-8 bg-gradient-to-r from-sky-50 to-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Ready to get a real price?</h3>
              <p className="text-muted text-sm">
                Edmunds lets you compare dealer prices, check inventory, and get upfront pricing —
                no haggling required.
              </p>
            </div>
            <a
              href="https://www.edmunds.com/electric-car/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow transition-colors text-sm whitespace-nowrap"
            >
              Browse Deals on Edmunds
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={reset}
            className="px-8 py-3 rounded-xl border border-black/12 font-semibold text-muted hover:bg-surface-light hover:text-foreground transition-all"
          >
            ← Start Over
          </button>
        </div>

        <div className="mt-12 bg-amber-50 rounded-2xl p-8 border border-amber-100">
          <h3 className="text-lg font-bold mb-2">Did you know?</h3>
          <p className="text-muted text-sm leading-relaxed">
            The federal EV tax credit can save you up to $7,500, and many states offer additional
            incentives. Most EV owners spend just $30–50 per month on electricity to charge —
            compared to $150–250 on gasoline. That&apos;s thousands saved every year!
          </p>
        </div>
      </div>
    );
  }

  // ── Quiz ──

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-sm font-semibold">
          Step {quiz.step + 1} of {steps.length}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          What EV is{" "}
          <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
            Right for You?
          </span>
        </h1>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-amber-100 rounded-full mb-12 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-spark-yellow to-spark-orange rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="text-2xl font-bold text-center mb-8">{currentStep.question}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentStep.options.map((option) => (
          <button
            key={option.value}
            onClick={() => selectOption(option.value)}
            className="bg-surface rounded-2xl p-6 border border-black/8 text-left hover:border-amber-400 hover:bg-amber-50/40 hover:shadow-sm transition-all group"
          >
            <span
              className="material-symbols-outlined text-muted group-hover:text-spark-orange transition-colors mb-4 block"
              style={{ fontSize: 36 }}
            >
              {option.icon}
            </span>
            <div className="text-lg font-bold group-hover:text-spark-orange transition-colors leading-tight">
              {option.label}
            </div>
            <div className="text-sm text-muted mt-1">{option.sublabel}</div>
          </button>
        ))}
      </div>

      {quiz.step > 0 && (
        <div className="mt-8 text-center">
          <button onClick={goBack} className="text-muted hover:text-spark-orange text-sm transition-colors">
            ← Go back
          </button>
        </div>
      )}
    </div>
  );
}
