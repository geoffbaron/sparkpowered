"use client";

import { useState } from "react";

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

interface QuizState {
  step: number;
  budget: string;
  bodyType: string;
  dailyMiles: string;
  priority: string;
  passengers: string;
}

const steps = [
  { key: "budget", question: "What's your budget?", options: [
    { value: "under35", label: "Under $35,000", icon: "💰" },
    { value: "35to50", label: "$35,000 - $50,000", icon: "💵" },
    { value: "50to80", label: "$50,000 - $80,000", icon: "💎" },
    { value: "over80", label: "$80,000+", icon: "👑" },
  ]},
  { key: "bodyType", question: "What type of vehicle?", options: [
    { value: "sedan", label: "Sedan", icon: "🚗" },
    { value: "suv", label: "SUV / Crossover", icon: "🚙" },
    { value: "truck", label: "Truck", icon: "🛻" },
    { value: "hatchback", label: "Hatchback / City Car", icon: "🏙️" },
  ]},
  { key: "dailyMiles", question: "How far do you drive daily?", options: [
    { value: "under30", label: "Under 30 miles", icon: "🏘️" },
    { value: "30to60", label: "30 - 60 miles", icon: "🛣️" },
    { value: "60to100", label: "60 - 100 miles", icon: "🗺️" },
    { value: "over100", label: "100+ miles", icon: "✈️" },
  ]},
  { key: "priority", question: "What matters most to you?", options: [
    { value: "value", label: "Best Value", icon: "⚡" },
    { value: "range", label: "Maximum Range", icon: "🔋" },
    { value: "performance", label: "Performance", icon: "🏎️" },
    { value: "space", label: "Cargo & Space", icon: "📦" },
  ]},
  { key: "passengers", question: "How many passengers typically?", options: [
    { value: "1to2", label: "Just me or 1-2", icon: "👤" },
    { value: "3to4", label: "3-4 people", icon: "👥" },
    { value: "5plus", label: "5+ people", icon: "👨‍👩‍👧‍👦" },
  ]},
];

function getRecommendations(state: QuizState): EVResult[] {
  let results = [...evDatabase];

  // Filter by body type
  const typeMap: Record<string, string> = {
    sedan: "Sedan",
    suv: "SUV",
    truck: "Truck",
    hatchback: "Hatchback",
  };
  if (state.bodyType) {
    results = results.filter((ev) => ev.type === typeMap[state.bodyType]);
  }

  // Filter by budget
  const priceNum = (ev: EVResult) => parseInt(ev.price.replace(/[$,]/g, ""));
  if (state.budget === "under35") results = results.filter((ev) => priceNum(ev) < 35000);
  else if (state.budget === "35to50") results = results.filter((ev) => priceNum(ev) >= 35000 && priceNum(ev) <= 50000);
  else if (state.budget === "50to80") results = results.filter((ev) => priceNum(ev) >= 50000 && priceNum(ev) <= 80000);
  else if (state.budget === "over80") results = results.filter((ev) => priceNum(ev) >= 80000);

  // Filter by passenger needs
  if (state.passengers === "5plus") results = results.filter((ev) => ev.seats >= 7);

  // Filter by daily miles (need adequate range)
  if (state.dailyMiles === "over100") results = results.filter((ev) => ev.range >= 300);
  else if (state.dailyMiles === "60to100") results = results.filter((ev) => ev.range >= 200);

  // Sort by priority
  if (state.priority === "range") results.sort((a, b) => b.range - a.range);
  else if (state.priority === "value") results.sort((a, b) => priceNum(a) - priceNum(b));
  else if (state.priority === "performance") results.sort((a, b) => priceNum(b) - priceNum(a));
  else if (state.priority === "space") results.sort((a, b) => {
    const sizeOrder: Record<string, number> = { "Truck Bed": 5, "Extra Large": 4, "Large": 3, "Medium": 2, "Small": 1 };
    return (sizeOrder[b.cargo] || 0) - (sizeOrder[a.cargo] || 0);
  });

  return results.slice(0, 5);
}

export default function CalculatorPage() {
  const [quiz, setQuiz] = useState<QuizState>({
    step: 0,
    budget: "",
    bodyType: "",
    dailyMiles: "",
    priority: "",
    passengers: "",
  });
  const [showResults, setShowResults] = useState(false);

  const currentStep = steps[quiz.step];
  const progress = ((quiz.step) / steps.length) * 100;

  function selectOption(value: string) {
    const key = currentStep.key as keyof QuizState;
    const newQuiz = { ...quiz, [key]: value };

    if (quiz.step < steps.length - 1) {
      newQuiz.step = quiz.step + 1;
      setQuiz(newQuiz);
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
    if (quiz.step > 0) {
      setQuiz({ ...quiz, step: quiz.step - 1 });
    }
  }

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

        {results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No exact matches</h2>
            <p className="text-muted mb-6">
              Try adjusting your preferences for more results. The EV market is
              growing fast — new models launch every month!
            </p>
            <button
              onClick={reset}
              className="spark-btn px-8 py-3 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-background font-bold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {results.map((ev, i) => (
                <div
                  key={ev.name}
                  className="card-glow bg-surface rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row gap-6"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-spark-yellow/20 to-spark-orange/20 text-3xl font-bold text-spark-yellow shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{ev.name}</h3>
                    <p className="text-spark-yellow text-sm font-medium mb-3">
                      {ev.highlight}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <span className="text-green-energy font-semibold">{ev.range} mi</span> range
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-electric-blue font-semibold">{ev.price}</span> MSRP
                      </span>
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
                className="px-8 py-3 rounded-xl border border-white/10 font-bold hover:bg-surface hover:border-spark-yellow/30 transition-all"
              >
                Start Over
              </button>
            </div>

            <div className="mt-12 bg-surface rounded-2xl p-8 border border-white/5">
              <h3 className="text-lg font-bold mb-2">💡 Did you know?</h3>
              <p className="text-muted text-sm leading-relaxed">
                The federal EV tax credit can save you up to $7,500, and many
                states offer additional incentives. Most EV owners spend just $30-50
                per month on electricity to charge — compared to $150-250 on
                gasoline. That&apos;s thousands saved every year!
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-spark-yellow/10 border border-spark-yellow/20 text-spark-yellow text-sm font-medium">
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
      <div className="w-full h-2 bg-surface rounded-full mb-12 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-spark-yellow to-spark-orange rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold text-center mb-8">
        {currentStep.question}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentStep.options.map((option) => (
          <button
            key={option.value}
            onClick={() => selectOption(option.value)}
            className="card-glow bg-surface rounded-2xl p-6 border border-white/5 text-left hover:border-spark-yellow/30 transition-all group"
          >
            <div className="text-3xl mb-3">{option.icon}</div>
            <div className="text-lg font-bold group-hover:text-spark-yellow transition-colors">
              {option.label}
            </div>
          </button>
        ))}
      </div>

      {quiz.step > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={goBack}
            className="text-muted hover:text-spark-yellow text-sm transition-colors"
          >
            &larr; Go back
          </button>
        </div>
      )}
    </div>
  );
}
