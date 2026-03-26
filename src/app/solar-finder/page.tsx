"use client";

import { useState } from "react";
import type { Installer } from "@/data/installers";

// ── Types ───────────────────────────────────────────────────────────────────

interface PrefsForm {
  zip: string;
  homeOwner: string;
  roofAge: string;
  monthlyBill: string;
  interest: string[];
}

interface LeadForm {
  name: string;
  email: string;
  phone: string;
}

type Step = "prefs" | "results" | "contact" | "done";

// ── Constants ────────────────────────────────────────────────────────────────

const interestOptions = [
  { value: "solar", label: "Solar Panels", icon: "wb_sunny" },
  { value: "battery", label: "Home Battery", icon: "battery_charging_full" },
  { value: "ev-charger", label: "EV Charger", icon: "ev_station" },
  { value: "community", label: "Community Solar", icon: "location_city" },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
          stroke="#f59e0b"
          strokeWidth="1"
        >
          <path d="M7 1l1.5 3.5L12 5l-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5L7 1z" />
        </svg>
      ))}
      <span className="text-spark-amber font-semibold text-sm ml-1">{rating}</span>
    </span>
  );
}

function InstallerCard({
  installer,
  rank,
  onSelect,
}: {
  installer: Installer;
  rank: number;
  onSelect: () => void;
}) {
  return (
    <div className="card-glow bg-surface rounded-2xl border border-black/6 overflow-hidden">
      <div className="flex items-start gap-4 p-6">
        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base ${
          installer.tier === "featured"
            ? "bg-gradient-to-br from-spark-yellow to-spark-orange text-white"
            : "bg-gradient-to-br from-amber-100 to-orange-100 text-spark-orange"
        }`}>
          #{rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-lg font-bold truncate">{installer.name}</h3>
            {installer.tier === "featured" && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-energy/15 text-green-energy border border-green-energy/25">
                Featured
              </span>
            )}
          </div>

          <p className="text-xs text-muted mb-3">
            {installer.city}{installer.founded ? ` · Est. ${installer.founded}` : ""}
            {installer.nationwide ? " · Serves all 50 states" : ` · Serves ${installer.states.length} states`}
          </p>

          <p className="text-sm text-muted leading-relaxed mb-3">{installer.description}</p>

          <div className="flex flex-wrap gap-2 mb-2">
            {installer.services.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                {s}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {installer.certifications.map((c) => (
              <span key={c} className="px-2.5 py-1 rounded-full text-xs bg-amber-50 text-spark-amber border border-amber-200">
                ✓ {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-black/6 bg-amber-50/40 px-6 py-4 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onSelect}
          className="spark-btn flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white font-semibold text-sm shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300 transition-all"
        >
          Get a Free Quote
        </button>
        <a
          href={installer.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-6 py-2.5 rounded-xl border-2 border-amber-200 text-sm font-semibold bg-white hover:bg-amber-50 hover:border-amber-300 transition-all"
        >
          Visit Website
        </a>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function SolarFinderPage() {
  const [step, setStep] = useState<Step>("prefs");
  const [loading, setLoading] = useState(false);
  const [zipError, setZipError] = useState("");
  const [apiError, setApiError] = useState("");
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [selectedInstaller, setSelectedInstaller] = useState<Installer | null>(null);

  const [prefs, setPrefs] = useState<PrefsForm>({
    zip: "",
    homeOwner: "",
    roofAge: "",
    monthlyBill: "",
    interest: ["solar"],
  });

  const [lead, setLead] = useState<LeadForm>({ name: "", email: "", phone: "" });
  const [leadErrors, setLeadErrors] = useState<Partial<LeadForm>>({});

  function toggleInterest(value: string) {
    setPrefs((f) => ({
      ...f,
      interest: f.interest.includes(value)
        ? f.interest.filter((v) => v !== value)
        : [...f.interest, value],
    }));
  }

  async function handlePrefsSubmit() {
    if (!/^\d{5}$/.test(prefs.zip)) {
      setZipError("Please enter a valid 5-digit ZIP code.");
      return;
    }
    setZipError("");
    setApiError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/solar-installers?zip=${prefs.zip}`);
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setInstallers(data.installers);
      setStep("results");
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectInstaller(installer: Installer | null) {
    setSelectedInstaller(installer);
    setStep("contact");
  }

  function validateLead(): boolean {
    const errors: Partial<LeadForm> = {};
    if (!lead.name.trim()) errors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email))
      errors.email = "Please enter a valid email.";
    if (lead.phone && !/^[\d\s\-()+]{7,}$/.test(lead.phone))
      errors.phone = "Please enter a valid phone number.";
    setLeadErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLeadSubmit() {
    if (!validateLead()) return;
    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          zip: prefs.zip,
          homeOwner: prefs.homeOwner,
          roofAge: prefs.roofAge,
          monthlyBill: prefs.monthlyBill,
          interest: prefs.interest,
          installerId: selectedInstaller?.id ?? "",
          installerName: selectedInstaller?.name ?? "",
        }),
      });
    } catch {
      // Fail silently — don't block the user if storage has an issue
    }
    setLoading(false);
    setStep("done");
  }

  function restart() {
    setStep("prefs");
    setPrefs({ zip: "", homeOwner: "", roofAge: "", monthlyBill: "", interest: ["solar"] });
    setLead({ name: "", email: "", phone: "" });
    setLeadErrors({});
    setInstallers([]);
    setSelectedInstaller(null);
    setApiError("");
  }

  // ── Step: Done ─────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="mb-6"><span className="material-symbols-outlined" style={{ fontSize: 64, color: "#f59e0b" }}>celebration</span></div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">You&apos;re all set!</h1>
        <p className="text-muted text-lg mb-8 leading-relaxed">
          {selectedInstaller ? (
            <>
              Your request has been sent to <strong>{selectedInstaller.name}</strong>. They&apos;ll reach out with a free, no-obligation quote.
            </>
          ) : (
            <>
              Your request has been sent to local installers near <strong>{prefs.zip}</strong>. Expect to hear back within 1 business day.
            </>
          )}
        </p>

        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 mb-8 text-left space-y-3">
          <h2 className="font-bold text-base mb-1">What happens next</h2>
          {[
            "They review your project details and confirm they serve your area.",
            "They contact you to schedule a free, no-pressure site assessment.",
            "You compare quotes and choose — or walk away. No obligation, ever.",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-muted">
              <span className="text-spark-orange font-bold mt-0.5">{i + 1}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted mb-8">
          Want more quotes?{" "}
          <a
            href="https://www.energysage.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-spark-orange font-semibold hover:underline"
          >
            EnergySage.com
          </a>{" "}
          lets you compare verified installers side-by-side instantly.
        </p>

        <button
          onClick={restart}
          className="px-8 py-3 rounded-xl border-2 border-amber-200 font-semibold text-sm bg-white hover:bg-amber-50 hover:border-amber-300 transition-all"
        >
          Start a new search
        </button>
      </div>
    );
  }

  // ── Step: Contact ──────────────────────────────────────────────────────────
  if (step === "contact") {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-spark-amber text-sm font-semibold">
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>wb_sunny</span>Almost there
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            How should{" "}
            <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
              {selectedInstaller ? selectedInstaller.name : "installers"}
            </span>{" "}
            reach you?
          </h1>
          <p className="text-muted">
            Leave your details and they&apos;ll contact you with a free quote — no pressure.
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-black/6 p-8 space-y-6 shadow-sm">
          {[
            { key: "name", label: "Your name", type: "text", placeholder: "Jane Smith" },
            { key: "email", label: "Email address", type: "email", placeholder: "jane@example.com" },
            { key: "phone", label: "Phone number", type: "tel", placeholder: "(555) 000-0000", optional: true },
          ].map(({ key, label, type, placeholder, optional }) => (
            <div key={key}>
              <label className="block text-sm font-semibold mb-2">
                {label}{" "}
                {optional && <span className="text-muted font-normal">(optional)</span>}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={lead[key as keyof LeadForm]}
                onChange={(e) => setLead({ ...lead, [key]: e.target.value })}
                className="w-full bg-surface-light border border-black/10 rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors"
              />
              {leadErrors[key as keyof LeadForm] && (
                <p className="mt-1.5 text-sm text-red-500">{leadErrors[key as keyof LeadForm]}</p>
              )}
            </div>
          ))}

          <button
            onClick={handleLeadSubmit}
            disabled={loading}
            className="spark-btn w-full py-4 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Submitting...
              </>
            ) : (
              "Send My Request"
            )}
          </button>

          <p className="text-center text-xs text-muted">
            Only shared with the installer you selected. No spam, ever.
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setStep("results")}
            className="text-sm text-muted hover:text-spark-orange transition-colors"
          >
            &larr; Back to results
          </button>
        </div>
      </div>
    );
  }

  // ── Step: Results ──────────────────────────────────────────────────────────
  if (step === "results") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-spark-amber text-sm font-semibold">
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>wb_sunny</span>{installers.length} installer{installers.length !== 1 ? "s" : ""} near {prefs.zip}
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            Solar Installers{" "}
            <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
              Near You
            </span>
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Vetted national installers, sorted by best match for your area. Click{" "}
            <strong>Get a Free Quote</strong> to send your project details directly to an installer.
          </p>
        </div>

        {installers.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-2xl border border-black/6 shadow-sm">
            <div className="mb-4"><span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-muted)" }}>search_off</span></div>
            <h2 className="text-xl font-bold mb-2">No results for {prefs.zip}</h2>
            <p className="text-muted mb-6 max-w-sm mx-auto text-sm">
              No installers found for that ZIP. Try a nearby city ZIP, or browse{" "}
              <a href="https://www.energysage.com" target="_blank" rel="noopener noreferrer" className="text-spark-orange font-semibold hover:underline">
                EnergySage.com
              </a>{" "}
              for a nationwide directory.
            </p>
            <button
              onClick={() => setStep("prefs")}
              className="px-6 py-2.5 rounded-xl border-2 border-amber-200 font-semibold text-sm bg-white hover:bg-amber-50 transition-all"
            >
              Try a different ZIP
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-10">
              {installers.map((installer, i) => (
                <InstallerCard
                  key={installer.id}
                  installer={installer}
                  rank={i + 1}
                  onSelect={() => handleSelectInstaller(installer)}
                />
              ))}
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 grid sm:grid-cols-3 gap-6 text-center mb-8">
              {[
                { value: "$1,400/yr", label: "Avg. electricity savings" },
                { value: "30%", label: "Federal tax credit (ITC)" },
                { value: "7–10 yrs", label: "Typical payback period" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-spark-amber mb-1">{value}</div>
                  <div className="text-xs text-muted">{label}</div>
                </div>
              ))}
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted">
                Want even more options?{" "}
                <a
                  href="https://www.energysage.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-spark-orange font-semibold hover:underline"
                >
                  EnergySage.com
                </a>{" "}
                has a nationwide verified installer directory.
              </p>
              <button
                onClick={() => setStep("prefs")}
                className="px-8 py-3 rounded-xl border-2 border-amber-200 font-semibold text-sm bg-white hover:bg-amber-50 hover:border-amber-300 transition-all"
              >
                Search a different ZIP
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Step: Prefs ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-spark-amber text-sm font-semibold">
          <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>wb_sunny</span>Free quotes, no pressure
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Find Local{" "}
          <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
            Solar Installers
          </span>
        </h1>
        <p className="text-muted max-w-xl mx-auto text-lg">
          We match you with vetted solar installers that serve your area — then help you request a free quote in seconds.
        </p>
      </div>

      <div className="bg-surface rounded-2xl border border-black/6 p-8 space-y-8 shadow-sm">
        {/* ZIP */}
        <div>
          <label className="block text-sm font-semibold mb-2">Your ZIP code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="e.g. 90210"
            value={prefs.zip}
            onChange={(e) => {
              setPrefs({ ...prefs, zip: e.target.value.replace(/\D/g, "") });
              setZipError("");
              setApiError("");
            }}
            className="w-full bg-surface-light border border-black/10 rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors"
          />
          {zipError && <p className="mt-1.5 text-sm text-red-500">{zipError}</p>}
          {apiError && <p className="mt-1.5 text-sm text-red-500">{apiError}</p>}
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            What are you interested in?{" "}
            <span className="text-muted font-normal">(select all that apply)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {interestOptions.map((opt) => {
              const selected = prefs.interest.includes(opt.value);
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
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{opt.icon}</span>
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
                onClick={() => setPrefs({ ...prefs, homeOwner: opt })}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  prefs.homeOwner === opt
                    ? "border-amber-400 bg-amber-50 text-spark-amber font-semibold"
                    : "border-black/10 hover:border-amber-300 text-muted bg-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {prefs.homeOwner === "No" && (
            <p className="mt-2 text-xs text-muted">
              Community solar lets renters save 10–20% on their bill with no installation needed.
            </p>
          )}
        </div>

        {/* Roof age */}
        <div>
          <label className="block text-sm font-semibold mb-3">How old is your roof?</label>
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
                onClick={() => setPrefs({ ...prefs, roofAge: opt.value })}
                className={`py-3 rounded-xl border text-xs font-medium transition-all ${
                  prefs.roofAge === opt.value
                    ? "border-amber-400 bg-amber-50 text-spark-amber font-semibold"
                    : "border-black/10 hover:border-amber-300 text-muted bg-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {prefs.roofAge === "older" && (
            <p className="mt-2 text-xs text-muted">
              Some installers offer solar + roof bundle deals — worth asking about.
            </p>
          )}
        </div>

        {/* Monthly bill */}
        <div>
          <label className="block text-sm font-semibold mb-3">Average monthly electricity bill</label>
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
                onClick={() => setPrefs({ ...prefs, monthlyBill: opt.value })}
                className={`py-3 rounded-xl border text-xs font-medium transition-all ${
                  prefs.monthlyBill === opt.value
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
          onClick={handlePrefsSubmit}
          disabled={loading}
          className="spark-btn w-full py-4 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Searching...
            </>
          ) : (
            "Find Solar Installers →"
          )}
        </button>

        <p className="text-center text-xs text-muted">
          Your info is never shared without your permission.
        </p>
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Want to browse now?{" "}
        <a
          href="https://www.energysage.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-spark-orange font-semibold hover:underline"
        >
          EnergySage.com
        </a>{" "}
        has verified reviews and instant quotes nationwide.
      </p>
    </div>
  );
}
