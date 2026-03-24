"use client";

import { useState } from "react";

// ── EV Database ───────────────────────────────────────────────────────────────

interface EVResult {
  name: string;
  range: number;
  price: string;
  type: string;
  highlight: string;
  seats: number;
  cargo: string;
}

const evDatabase: EVResult[] = [
  { name: "Chevrolet Equinox EV", range: 319, price: "$33,900", type: "SUV", highlight: "Best value family SUV with incredible range", seats: 5, cargo: "Large" },
  { name: "Tesla Model 3", range: 358, price: "$38,990", type: "Sedan", highlight: "Best-selling EV with great range and tech", seats: 5, cargo: "Medium" },
  { name: "Tesla Model Y", range: 310, price: "$44,990", type: "SUV", highlight: "Versatile crossover with massive cargo space", seats: 5, cargo: "Large" },
  { name: "Hyundai Ioniq 5", range: 303, price: "$41,800", type: "SUV", highlight: "Ultra-fast charging and retro-futuristic design", seats: 5, cargo: "Large" },
  { name: "Hyundai Ioniq 6", range: 361, price: "$42,450", type: "Sedan", highlight: "Aerodynamic design delivers outstanding range", seats: 5, cargo: "Medium" },
  { name: "Ford Mustang Mach-E", range: 312, price: "$42,995", type: "SUV", highlight: "Sporty handling with family-friendly space", seats: 5, cargo: "Large" },
  { name: "Kia EV6", range: 310, price: "$42,600", type: "SUV", highlight: "Fun to drive with V2L power sharing", seats: 5, cargo: "Large" },
  { name: "Kia EV9", range: 304, price: "$54,900", type: "SUV", highlight: "Three-row electric SUV for large families", seats: 7, cargo: "Extra Large" },
  { name: "Rivian R1S", range: 321, price: "$75,900", type: "SUV", highlight: "Adventure-ready with incredible off-road capability", seats: 7, cargo: "Extra Large" },
  { name: "Ford F-150 Lightning", range: 320, price: "$49,995", type: "Truck", highlight: "Work-ready electric truck with Pro Power Onboard", seats: 5, cargo: "Truck Bed" },
  { name: "Rivian R1T", range: 328, price: "$69,900", type: "Truck", highlight: "Adventure truck with built-in camp kitchen", seats: 5, cargo: "Truck Bed" },
  { name: "Chevrolet Silverado EV", range: 450, price: "$57,095", type: "Truck", highlight: "Massive range and available Midgate", seats: 5, cargo: "Truck Bed" },
  { name: "Nissan Leaf", range: 212, price: "$28,140", type: "Hatchback", highlight: "Affordable and proven EV for city driving", seats: 5, cargo: "Medium" },
  { name: "Chevrolet Bolt EUV", range: 247, price: "$27,800", type: "Hatchback", highlight: "Most affordable EV with Super Cruise available", seats: 5, cargo: "Medium" },
  { name: "Mini Cooper SE", range: 114, price: "$30,900", type: "Hatchback", highlight: "Fun city car with iconic style", seats: 4, cargo: "Small" },
  { name: "BMW iX", range: 324, price: "$87,100", type: "SUV", highlight: "Luxury electric SUV with cutting-edge tech", seats: 5, cargo: "Large" },
  { name: "Mercedes EQS Sedan", range: 350, price: "$104,400", type: "Sedan", highlight: "Ultra-luxury electric flagship with Hyperscreen", seats: 5, cargo: "Medium" },
  { name: "Porsche Taycan", range: 246, price: "$92,250", type: "Sedan", highlight: "Performance EV with legendary Porsche handling", seats: 5, cargo: "Medium" },
  { name: "Volkswagen ID.4", range: 275, price: "$39,735", type: "SUV", highlight: "Spacious and practical with solid value", seats: 5, cargo: "Large" },
  { name: "Toyota bZ4X", range: 252, price: "$42,000", type: "SUV", highlight: "Toyota reliability meets electric efficiency", seats: 5, cargo: "Large" },
];

// ── Scoring ───────────────────────────────────────────────────────────────────

const typeMap: Record<string, string> = {
  sedan: "Sedan",
  suv: "SUV",
  truck: "Truck",
  hatchback: "Hatchback",
};

const budgetRanges: Record<string, [number, number]> = {
  under35:  [0,      35000],
  "35to50": [35000,  50000],
  "50to80": [50000,  80000],
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

  // Body type — strong preference (35 pts), but not eliminated if wrong type
  if (quiz.bodyType && ev.type === typeMap[quiz.bodyType]) score += 35;
  else score -= 5;

  // Budget — reward being in range (25 pts), penalize being way over
  if (quiz.budget) {
    const [lo, hi] = budgetRanges[quiz.budget];
    const p = priceNum(ev);
    if (p >= lo && p <= hi) {
      score += 25;
    } else if (p < lo) {
      // Under budget is fine, slight penalty for being much cheaper (might miss features)
      score += 15;
    } else {
      // Over budget: penalize proportionally
      const pct = (p - hi) / hi;
      score += Math.max(-25, -Math.round(pct * 40));
    }
  }

  // Range vs. daily miles (20 pts)
  if (quiz.dailyMiles) {
    const minRange = { under30: 100, "30to60": 150, "60to100": 200, over100: 300 }[quiz.dailyMiles] ?? 0;
    if (ev.range >= minRange * 2) score += 20;       // very comfortable
    else if (ev.range >= minRange * 1.5) score += 15;
    else if (ev.range >= minRange) score += 10;
    else score -= 10; // range anxiety risk
  }

  // Passengers (15 pts)
  if (quiz.passengers) {
    if (quiz.passengers === "5plus") {
      if (ev.seats >= 7) score += 15;
      else score += 5; // 5-seaters aren't eliminated, just ranked lower
    } else if (quiz.passengers === "3to4") {
      if (ev.seats >= 5) score += 15;
    } else {
      score += 15; // any car works for 1-2
    }
  }

  // Priority tiebreaker (up to 10 pts)
  if (quiz.priority === "range") {
    score += Math.min(10, Math.floor(ev.range / 40));
  } else if (quiz.priority === "value") {
    const p = priceNum(ev);
    score += Math.min(10, Math.floor((80000 - p) / 7000));
  } else if (quiz.priority === "performance") {
    // Proxy: higher price tends to mean more performance
    score += Math.min(10, Math.floor(priceNum(ev) / 12000));
  } else if (quiz.priority === "space") {
    score += (cargoOrder[ev.cargo] || 0) * 2;
  }

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

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function IconBudgetLow() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="14" />
      <path d="M18 11v14M14 14.5c0-1.933 1.791-3.5 4-3.5s4 1.567 4 3.5c0 4-8 3-8 7 0 1.933 1.791 3.5 4 3.5s4-1.567 4-3.5" />
    </svg>
  );
}

function IconBudgetMid() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="28" height="18" rx="3" />
      <path d="M4 16h28" />
      <circle cx="18" cy="23" r="2.5" />
      <path d="M9 13h.01M27 13h.01" />
    </svg>
  );
}

function IconBudgetPremium() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 5l3.5 7.5L30 13.5l-6 5.8 1.4 8.2L18 23.5l-7.4 4 1.4-8.2L6 13.5l8.5-1L18 5z" />
    </svg>
  );
}

function IconBudgetLuxury() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 26l4-10 6 6 6-12 4 16" />
      <path d="M5 26h26" />
    </svg>
  );
}

function IconSedan() {
  return (
    <svg width="44" height="36" viewBox="0 0 44 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h40v-2l-4-8-8-4H14L8 12l-6 4v4z" />
      <path d="M14 6h16l6 10H8L14 6z" />
      <circle cx="11" cy="22" r="3.5" />
      <circle cx="33" cy="22" r="3.5" />
      <path d="M7.5 22H2M36.5 22H42" />
    </svg>
  );
}

function IconSUV() {
  return (
    <svg width="44" height="36" viewBox="0 0 46 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22h42v-4l-4-10H10L4 14l-2 4v4z" />
      <path d="M10 8h24l6 10H4L10 8z" />
      <circle cx="12" cy="24" r="3.5" />
      <circle cx="34" cy="24" r="3.5" />
      <path d="M2 18h42" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="48" height="36" viewBox="0 0 50 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22h46v-4L44 8H28V22" />
      <rect x="2" y="8" width="26" height="14" rx="1.5" />
      <circle cx="10" cy="24" r="3.5" />
      <circle cx="38" cy="24" r="3.5" />
      <path d="M28 8v10" />
    </svg>
  );
}

function IconHatchback() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h36v-2l-4-8H10L4 14l-2 4v2z" />
      <path d="M10 10h16l6 8H4l6-8z" />
      <circle cx="10" cy="22" r="3" />
      <circle cx="30" cy="22" r="3" />
    </svg>
  );
}

function IconCityDrive() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="8" width="8" height="20" rx="1" />
      <rect x="20" y="14" width="8" height="14" rx="1" />
      <path d="M4 28h28" />
      <path d="M10 12h8M10 16h8M10 20h8" strokeWidth="1" />
      <path d="M20 18h8M20 22h8" strokeWidth="1" />
    </svg>
  );
}

function IconCommute() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 28h28" />
      <path d="M4 28c0-8 5-16 14-16s14 8 14 16" />
      <path d="M18 12V8" />
      <path d="M18 20l4-4" />
    </svg>
  );
}

function IconRoadTrip() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 28h28" />
      <path d="M4 28Q8 14 18 14Q28 14 32 28" />
      <path d="M13 28Q15 20 18 20Q21 20 23 28" />
      <circle cx="18" cy="9" r="3" />
      <path d="M18 12v2" />
    </svg>
  );
}

function IconHighMileage() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 28a12 12 0 0 1 24 0" />
      <path d="M18 16v-4M9.5 19.5l-2.8-2.8M26.5 19.5l2.8-2.8" />
      <path d="M18 28l-4-8" strokeWidth="2" />
      <circle cx="18" cy="28" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconValue() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l24 24M26 6H10a4 4 0 0 0-4 4v6l14 14 10-10L16 6" />
      <circle cx="13" cy="13" r="2.5" />
    </svg>
  );
}

function IconRange() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="12" width="22" height="12" rx="2" />
      <path d="M27 16v4a2 2 0 0 1 0-4z" />
      <rect x="8" y="15" width="5" height="6" rx="1" fill="currentColor" stroke="none" />
      <rect x="15" y="15" width="5" height="6" rx="1" fill="currentColor" stroke="none" />
      <path d="M18 6l3 3-3 3" />
      <path d="M11 6l-3 3 3 3" />
      <path d="M15 6h3" />
    </svg>
  );
}

function IconPerformance() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8l-4 10h8L16 28" strokeWidth="2" />
    </svg>
  );
}

function IconSpace() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 28V12l10-6 10 6v16H8z" />
      <path d="M8 12l10 6 10-6" />
      <path d="M18 18v10" />
      <path d="M13 15l-5 3M23 15l5 3" />
    </svg>
  );
}

function IconPerson1() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="12" r="5" />
      <path d="M8 30c0-5.523 4.477-10 10-10s10 4.477 10 10" />
    </svg>
  );
}

function IconPerson2() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="12" r="4.5" />
      <path d="M4 30c0-5 4-9 10-9" />
      <circle cx="24" cy="12" r="4.5" />
      <path d="M32 30c0-5-4-9-10-9" />
      <path d="M14 21c1.3-.3 2.6-.5 4-.5h2" />
    </svg>
  );
}

function IconFamily() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="4" />
      <path d="M2 28c0-4.4 3.6-8 8-8s8 3.6 8 28" />
      <circle cx="26" cy="10" r="4" />
      <path d="M34 28c0-4.4-3.6-8-8-8" />
      <circle cx="18" cy="14" r="3" />
      <path d="M11 28c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </svg>
  );
}

// ── Steps definition ──────────────────────────────────────────────────────────

type StepKey = "budget" | "bodyType" | "dailyMiles" | "priority" | "passengers";

interface StepOption {
  value: string;
  label: string;
  sublabel?: string;
  Icon: () => JSX.Element;
}

interface Step {
  key: StepKey;
  question: string;
  options: StepOption[];
}

const steps: Step[] = [
  {
    key: "budget",
    question: "What's your budget?",
    options: [
      { value: "under35",  label: "Under $35,000", sublabel: "Affordable", Icon: IconBudgetLow },
      { value: "35to50",   label: "$35,000–$50,000", sublabel: "Mid-range",  Icon: IconBudgetMid },
      { value: "50to80",   label: "$50,000–$80,000", sublabel: "Premium",   Icon: IconBudgetPremium },
      { value: "over80",   label: "$80,000+",         sublabel: "Luxury",    Icon: IconBudgetLuxury },
    ],
  },
  {
    key: "bodyType",
    question: "What type of vehicle?",
    options: [
      { value: "sedan",    label: "Sedan",               sublabel: "Sleek & efficient", Icon: IconSedan },
      { value: "suv",      label: "SUV / Crossover",     sublabel: "Versatile & popular", Icon: IconSUV },
      { value: "truck",    label: "Truck",               sublabel: "Work & adventure", Icon: IconTruck },
      { value: "hatchback",label: "Hatchback / City Car",sublabel: "Compact & nimble", Icon: IconHatchback },
    ],
  },
  {
    key: "dailyMiles",
    question: "How far do you drive daily?",
    options: [
      { value: "under30",  label: "Under 30 miles",  sublabel: "Around town",     Icon: IconCityDrive },
      { value: "30to60",   label: "30–60 miles",     sublabel: "Daily commute",   Icon: IconCommute },
      { value: "60to100",  label: "60–100 miles",    sublabel: "Longer commute",  Icon: IconRoadTrip },
      { value: "over100",  label: "100+ miles",      sublabel: "High mileage",    Icon: IconHighMileage },
    ],
  },
  {
    key: "priority",
    question: "What matters most to you?",
    options: [
      { value: "value",       label: "Best Value",       sublabel: "Most car for the money",  Icon: IconValue },
      { value: "range",       label: "Maximum Range",    sublabel: "Never worry about range",  Icon: IconRange },
      { value: "performance", label: "Performance",      sublabel: "Thrilling acceleration",   Icon: IconPerformance },
      { value: "space",       label: "Cargo & Space",    sublabel: "Maximize room inside",     Icon: IconSpace },
    ],
  },
  {
    key: "passengers",
    question: "How many people ride regularly?",
    options: [
      { value: "1to2", label: "Just me or 1–2", sublabel: "Solo or couple",  Icon: IconPerson1 },
      { value: "3to4", label: "3–4 people",     sublabel: "Small family",    Icon: IconPerson2 },
      { value: "5plus",label: "5+ people",      sublabel: "Large family",    Icon: IconFamily },
    ],
  },
];

// ── Page component ────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [quiz, setQuiz] = useState<QuizState>({
    step: 0, budget: "", bodyType: "", dailyMiles: "", priority: "", passengers: "",
  });
  const [showResults, setShowResults] = useState(false);

  const currentStep = steps[quiz.step];
  const progress = (quiz.step / steps.length) * 100;

  function selectOption(value: string) {
    const newQuiz = { ...quiz, [currentStep.key]: value };
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
          <p className="text-muted text-lg">
            Based on your preferences, here are our top recommendations.
          </p>
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
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
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
            <div className="text-muted group-hover:text-spark-orange transition-colors mb-4">
              <option.Icon />
            </div>
            <div className="text-lg font-bold group-hover:text-spark-orange transition-colors leading-tight">
              {option.label}
            </div>
            {option.sublabel && (
              <div className="text-sm text-muted mt-1">{option.sublabel}</div>
            )}
          </button>
        ))}
      </div>

      {quiz.step > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={goBack}
            className="text-muted hover:text-spark-orange text-sm transition-colors"
          >
            ← Go back
          </button>
        </div>
      )}
    </div>
  );
}
