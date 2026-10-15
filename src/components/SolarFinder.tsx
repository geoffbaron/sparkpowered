"use client";

import { useState } from "react";
import Link from "next/link";
import type { Installer } from "@/data/installers";
import type { CalcState } from "@/lib/calculator-data";

interface Result {
  installers: Installer[];
  state: string | null;
  stateName: string | null;
  zip: string;
}

const slug = (name: string) => name.toLowerCase().replace(/ /g, "-");

export default function SolarFinder({ states, panelWatts }: { states: CalcState[]; panelWatts: number }) {
  const [zip, setZip] = useState("");
  const [bill, setBill] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{5}$/.test(zip)) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/solar-installers?zip=${zip}`);
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Something went wrong. Please try again.");
      else setResult(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const st = result?.state ? states.find((s) => s.abbr === result.state) : undefined;
  const billNum = parseFloat(bill);
  const monthlyKwh = st ? (Number.isFinite(billNum) && billNum > 0 ? billNum / (st.centsPerKwh / 100) : st.avgMonthlyKwh) : 0;
  const systemKw = st ? (monthlyKwh * 12) / st.kwhPerKwYear : 0;
  const panels = Math.ceil((systemKw * 1000) / panelWatts);

  const field =
    "w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-amber-400";

  return (
    <div>
      <form onSubmit={search} className="bg-surface rounded-2xl border border-black/8 shadow-sm p-5 sm:p-7">
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <label className="block">
            <span className="block text-sm font-semibold mb-1.5">ZIP code</span>
            <input
              className={field}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              placeholder="e.g. 85004"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1.5">
              Monthly electric bill, $ <span className="font-normal text-muted">(optional)</span>
            </span>
            <input
              className={field}
              inputMode="numeric"
              placeholder="e.g. 150"
              value={bill}
              onChange={(e) => setBill(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="h-[46px] px-6 rounded-lg bg-gradient-to-r from-spark-yellow to-spark-orange text-white font-bold shadow disabled:opacity-60"
          >
            {loading ? "Searching…" : "Find installers"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </form>

      {result && (
        <div className="mt-8 space-y-6" aria-live="polite">
          {st ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-lg font-bold mb-2">Solar in {st.name} at a glance</h2>
              <p className="text-sm text-stone-700 leading-relaxed">
                Average home electricity price: <strong>{st.centsPerKwh.toFixed(1)}¢/kWh</strong>. Each kW of
                south-facing panels makes about <strong>{Math.round(st.kwhPerKwYear).toLocaleString()} kWh</strong>{" "}
                a year here. To cover {bill ? `a $${bill} monthly bill` : "an average home's use"} (about{" "}
                {Math.round(monthlyKwh).toLocaleString()} kWh a month) you would need roughly{" "}
                <strong>{systemKw.toFixed(1)} kW, or {panels} panels</strong>. Use these numbers to check that
                quotes you receive are the right size.
              </p>
              <p className="text-sm mt-3">
                <Link href={`/states/${slug(st.name)}#solar`} className="underline text-spark-orange font-medium">
                  Full {st.name} solar and energy data
                </Link>{" "}
                ·{" "}
                <a
                  href={`https://programs.dsireusa.org/system/program?state=${st.abbr}`}
                  className="underline text-spark-orange font-medium"
                  rel="noopener"
                >
                  {st.name} solar incentives (DSIRE)
                </a>
              </p>
            </div>
          ) : (
            <p className="text-sm text-stone-700">
              We couldn&apos;t match ZIP {result.zip} to a state, so here are installers that say they work
              nationwide.
            </p>
          )}

          <div>
            <h2 className="text-xl font-bold mb-1">
              Installers that list service {result.stateName ? `in ${result.stateName}` : "nationwide"}
            </h2>
            <p className="text-sm text-muted mb-4">
              Listed alphabetically. We have not inspected their work, and a listing is not an endorsement.
              Service areas change, so confirm coverage on each company&apos;s site.
            </p>
            <ul className="space-y-3">
              {result.installers.map((i) => (
                <li key={i.id} className="bg-surface rounded-xl border border-black/8 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {i.name}
                        {i.tier === "featured" && (
                          <span className="ml-2 align-middle text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 border border-stone-300">
                            Sponsored
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted mb-2">
                        Based in {i.headquarters} · {i.nationwide ? "Operates in many states" : `Lists ${i.states.length} states`}
                      </p>
                      <p className="text-sm text-stone-700">{i.description}</p>
                      <p className="text-xs text-muted mt-2">{i.services.join(" · ")}</p>
                    </div>
                    <a
                      href={i.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-lg border-2 border-amber-300 text-sm font-semibold bg-white hover:bg-amber-50"
                    >
                      Visit {i.name}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-black/8 bg-surface p-5 text-sm text-stone-700 leading-relaxed">
            <h2 className="font-bold text-base mb-2">Want local installers too?</h2>
            Local companies often beat national ones on price. Search certified professionals in the{" "}
            <a href="https://directories.nabcep.org/" className="underline text-spark-orange" rel="noopener">
              NABCEP directory
            </a>
            , or compare several quotes on{" "}
            <a href="https://www.energysage.com" className="underline text-spark-orange" rel="noopener">
              EnergySage
            </a>
            . Get at least three quotes and compare price per watt.
          </div>
        </div>
      )}
    </div>
  );
}
