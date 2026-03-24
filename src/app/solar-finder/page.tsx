"use client";

import { useState } from "react";

interface Provider {
  name: string;
  rating: number;
  reviews: number;
  yearsInBusiness: number;
  services: string[];
  certifications: string[];
  description: string;
  phone: string;
  badge?: string;
}

interface FormState {
  zip: string;
  homeOwner: string;
  roofAge: string;
  monthlyBill: string;
  interest: string[];
}

// Simulated provider database keyed by region (first digit of zip)
// In production this would call an API like EnergySage, Google Places, or a proprietary installer DB
function getProviders(zip: string): Provider[] {
  const region = zip[0];
  const seed = parseInt(zip.slice(-2)) || 42;

  const providerPool: Provider[] = [
    {
      name: "SunRise Solar Solutions",
      rating: 4.9,
      reviews: 312,
      yearsInBusiness: 14,
      services: ["Solar Panels", "Home Batteries", "EV Chargers"],
      certifications: ["NABCEP Certified", "Tesla Powerwall Partner"],
      description: "Family-owned installer specializing in full home electrification packages. Transparent pricing and no high-pressure sales.",
      phone: "(800) 555-0101",
      badge: "Top Rated",
    },
    {
      name: "Volt & Ray Energy",
      rating: 4.8,
      reviews: 189,
      yearsInBusiness: 9,
      services: ["Solar Panels", "Home Batteries", "Roof Assessment"],
      certifications: ["NABCEP Certified", "Enphase Platinum Installer"],
      description: "Experts in difficult roof configurations and shading solutions. Microinverter specialists for maximum output.",
      phone: "(800) 555-0102",
    },
    {
      name: "Bright Path Solar",
      rating: 4.7,
      reviews: 427,
      yearsInBusiness: 17,
      services: ["Solar Panels", "Community Solar", "Commercial Solar"],
      certifications: ["SEIA Member", "BBB A+ Rating"],
      description: "One of the region's largest solar installers with competitive pricing and same-week site assessments available.",
      phone: "(800) 555-0103",
    },
    {
      name: "GridFree Home Energy",
      rating: 4.9,
      reviews: 98,
      yearsInBusiness: 6,
      services: ["Solar Panels", "Home Batteries", "EV Chargers", "Smart Home"],
      certifications: ["NABCEP Certified", "Certified Energy Auditor"],
      description: "Boutique installer focused on premium whole-home energy systems. Every install includes a custom energy monitoring dashboard.",
      phone: "(800) 555-0104",
      badge: "Best for Batteries",
    },
    {
      name: "Apex Solar Group",
      rating: 4.6,
      reviews: 560,
      yearsInBusiness: 12,
      services: ["Solar Panels", "Roof Replacement", "Home Batteries"],
      certifications: ["SEIA Member", "GAF Roofing Partner"],
      description: "One-stop shop for solar + roof replacement. Ideal if your roof needs work before installation.",
      phone: "(800) 555-0105",
    },
  ];

  // Shuffle deterministically based on zip so results feel location-specific
  const shuffled = [...providerPool].sort(
    (a, b) => ((a.name.charCodeAt(0) + seed + parseInt(region || "0")) % 5) - ((b.name.charCodeAt(0) + seed) % 5)
  );

  return shuffled.slice(0, 4);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill={i <= Math.round(rating) ? "#fbbf24" : "none"}
          stroke="#fbbf24"
          strokeWidth="1"
        >
          <path d="M7 1l1.5 3.5L12 5l-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5L7 1z" />
        </svg>
      ))}
      <span className="text-spark-yellow font-semibold text-sm ml-1">{rating}</span>
    </span>
  );
}

function ProviderCard({ provider, rank }: { provider: Provider; rank: number }) {
  return (
    <div className="card-glow bg-surface rounded-2xl border border-black/6 overflow-hidden">
      <div className="flex items-start gap-4 p-6">
        {/* Rank / Logo placeholder */}
        <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-spark-orange font-bold text-lg">
          #{rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-lg font-bold">{provider.name}</h3>
            {provider.badge && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-energy/20 text-green-energy border border-green-energy/30">
                {provider.badge}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-3">
            <StarRating rating={provider.rating} />
            <span className="text-xs text-muted">{provider.reviews.toLocaleString()} reviews</span>
            <span className="text-xs text-muted">{provider.yearsInBusiness} yrs in business</span>
          </div>

          <p className="text-sm text-muted leading-relaxed mb-4">{provider.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {provider.services.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                {s}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {provider.certifications.map((c) => (
              <span key={c} className="px-2.5 py-1 rounded-full text-xs bg-amber-50 text-spark-amber border border-amber-200">
                ✓ {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-black/6 bg-amber-50/40 px-6 py-4 flex flex-col sm:flex-row items-center gap-3">
        <a
          href={`tel:${provider.phone}`}
          className="spark-btn w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white font-semibold text-sm shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300 transition-all"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
          </svg>
          Get a Free Quote
        </a>
        <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 border-amber-200 text-sm font-semibold bg-white hover:bg-amber-50 hover:border-amber-300 transition-all">
          Learn More
        </button>
      </div>
    </div>
  );
}

const interestOptions = [
  { value: "solar", label: "Solar Panels", icon: "☀️" },
  { value: "battery", label: "Home Battery", icon: "🔋" },
  { value: "ev-charger", label: "EV Charger", icon: "⚡" },
  { value: "community", label: "Community Solar", icon: "🏘️" },
];

export default function SolarFinderPage() {
  const [form, setForm] = useState<FormState>({
    zip: "",
    homeOwner: "",
    roofAge: "",
    monthlyBill: "",
    interest: ["solar"],
  });
  const [results, setResults] = useState<Provider[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [zipError, setZipError] = useState("");

  function toggleInterest(value: string) {
    setForm((f) => ({
      ...f,
      interest: f.interest.includes(value)
        ? f.interest.filter((v) => v !== value)
        : [...f.interest, value],
    }));
  }

  function handleSearch() {
    if (!/^\d{5}$/.test(form.zip)) {
      setZipError("Please enter a valid 5-digit ZIP code.");
      return;
    }
    setZipError("");
    setLoading(true);
    // Simulate async API call
    setTimeout(() => {
      setResults(getProviders(form.zip));
      setLoading(false);
    }, 900);
  }

  function reset() {
    setForm({ zip: "", homeOwner: "", roofAge: "", monthlyBill: "", interest: ["solar"] });
    setResults(null);
  }

  if (results) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-spark-amber text-sm font-semibold">
            ☀️ {results.length} providers near {form.zip}
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            Top Solar Installers{" "}
            <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
              Near You
            </span>
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            These highly-rated local installers offer free site assessments and no-obligation quotes.
          </p>
        </div>

        <div className="space-y-6 mb-10">
          {results.map((provider, i) => (
            <ProviderCard key={provider.name} provider={provider} rank={i + 1} />
          ))}
        </div>

        {/* Savings callout */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 grid sm:grid-cols-3 gap-6 text-center mb-10">
          <div>
            <div className="text-2xl font-bold text-spark-yellow mb-1">$1,400/yr</div>
            <div className="text-xs text-muted">Average electricity savings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-spark-yellow mb-1">30%</div>
            <div className="text-xs text-muted">Federal tax credit (ITC)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-spark-yellow mb-1">7–10 yrs</div>
            <div className="text-xs text-muted">Typical payback period</div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={reset}
            className="px-8 py-3 rounded-xl border-2 border-amber-200 font-semibold text-sm bg-white hover:bg-amber-50 hover:border-amber-300 transition-all"
          >
            Search a different ZIP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-spark-amber text-sm font-semibold">
          ☀️ Free quotes, no pressure
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Find Local{" "}
          <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
            Solar Installers
          </span>
        </h1>
        <p className="text-muted max-w-xl mx-auto text-lg">
          Answer a few quick questions and we&apos;ll match you with top-rated solar
          providers in your area — all vetted, certified, and ready to help.
        </p>
      </div>

      <div className="bg-surface rounded-2xl border border-black/6 p-8 space-y-8 shadow-sm">
        {/* ZIP */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Your ZIP code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="e.g. 90210"
            value={form.zip}
            onChange={(e) => {
              setForm({ ...form, zip: e.target.value.replace(/\D/g, "") });
              setZipError("");
            }}
            className="w-full bg-surface-light border border-black/10 rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors"
          />
          {zipError && <p className="mt-1.5 text-sm text-red-400">{zipError}</p>}
        </div>

        {/* What are you interested in? */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            What are you interested in? <span className="text-muted font-normal">(select all that apply)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {interestOptions.map((opt) => {
              const selected = form.interest.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleInterest(opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    selected
                      ? "border-amber-400 bg-amber-50 text-spark-amber font-semibold"
                      : "border-black/10 hover:border-amber-300 text-muted bg-white"
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Home owner */}
        <div>
          <label className="block text-sm font-semibold mb-3">Do you own your home?</label>
          <div className="flex gap-3">
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm({ ...form, homeOwner: opt })}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  form.homeOwner === opt
                    ? "border-amber-400 bg-amber-50 text-spark-amber font-semibold"
                    : "border-black/10 hover:border-amber-300 text-muted bg-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {form.homeOwner === "No" && (
            <p className="mt-2 text-xs text-muted">
              No problem — ask us about community solar programs that let renters save 10–20% on electricity.
            </p>
          )}
        </div>

        {/* Roof age */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            How old is your roof?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: "new", label: "Under 5 yrs" },
              { value: "mid", label: "5–15 yrs" },
              { value: "older", label: "15–25 yrs" },
              { value: "unknown", label: "Not sure" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, roofAge: opt.value })}
                className={`py-3 rounded-xl border text-xs font-medium transition-all ${
                  form.roofAge === opt.value
                    ? "border-amber-400 bg-amber-50 text-spark-amber font-semibold"
                    : "border-black/10 hover:border-amber-300 text-muted bg-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {form.roofAge === "older" && (
            <p className="mt-2 text-xs text-muted">
              Roofs over 15 years old may benefit from replacement before solar installation. Some installers offer solar + roof bundles.
            </p>
          )}
        </div>

        {/* Monthly bill */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Average monthly electricity bill
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: "low", label: "Under $100" },
              { value: "mid", label: "$100–$200" },
              { value: "high", label: "$200–$400" },
              { value: "vhigh", label: "$400+" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, monthlyBill: opt.value })}
                className={`py-3 rounded-xl border text-xs font-medium transition-all ${
                  form.monthlyBill === opt.value
                    ? "border-amber-400 bg-amber-50 text-spark-amber font-semibold"
                    : "border-black/10 hover:border-amber-300 text-muted bg-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="spark-btn w-full py-4 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Finding providers near you...
            </>
          ) : (
            "Find Solar Installers"
          )}
        </button>

        <p className="text-center text-xs text-muted">
          Your information is never shared without your permission. No spam, no obligation.
        </p>
      </div>
    </div>
  );
}
