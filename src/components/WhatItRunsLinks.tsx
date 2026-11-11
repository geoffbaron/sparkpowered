import Link from "next/link";
import { appliance, canItRunProducts, runText, whatItRunsPath } from "@/lib/can-it-run";
import { fullName, kwh, money } from "@/lib/products";

/** Links to the single-model "what it runs" pages, with each model's fridge and CPAP figure. */
export default function WhatItRunsLinks({ className = "mt-12" }: { className?: string }) {
  const fridge = appliance("fridge");
  const cpap = appliance("cpap");
  return (
    <section aria-labelledby="what-it-runs-heading" className={className}>
      <h2 id="what-it-runs-heading" className="text-2xl font-extrabold text-ink mb-2">What will one model run?</h2>
      <p className="text-stone-700 mb-4 max-w-3xl">
        Run times for 15 appliances, from a fridge and CPAP to a sump pump and space heater, and what each one cannot run.
      </p>
      <ul className="grid sm:grid-cols-2 gap-3">
        {canItRunProducts().map((p) => (
          <li key={p.id} className="rounded-xl border border-black/8 bg-surface p-4">
            <Link href={whatItRunsPath(p.id)} className="font-semibold text-ink underline underline-offset-2 hover:text-spark-orange">
              What the {fullName(p)} runs
            </Link>
            <span className="block text-sm text-stone-700">
              {kwh(p.capacityWh)}, {money(p.priceUsd!)}: a fridge {runText(p, fridge)}, CPAP {runText(p, cpap)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
