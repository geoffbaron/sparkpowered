import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchAllNews } from "@/lib/rss";
import NewsClient from "@/components/NewsClient";
import { JsonLd, pageMetadata, url } from "@/lib/seo";
import {
  DATA_UPDATED,
  NATIONAL,
  STATES,
  cents,
  chargingFigures,
  evCostPer100,
  formatDate,
  gasCostPer100,
  nationalRateUsd,
  num,
  referenceEv,
  usd,
  ytdWindow,
} from "@/lib/energy";

const TITLE = "EV Charging Cost, Solar & Battery Calculators by State";
const DESCRIPTION =
  "Free calculators built on government data: what it costs to charge an EV in your state, how many solar panels you need, and how big a home battery to buy.";

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/" }),
  title: { absolute: `${TITLE} | Spark Powered` },
};

const TOOLS = [
  { href: "/ev-charging-cost", icon: "ev_station", label: "EV charging cost calculator", desc: "Your state, your car, your miles — versus gasoline." },
  { href: "/solar-calculator", icon: "wb_sunny", label: "Solar panel calculator", desc: "How many panels your home needs and what they're worth." },
  { href: "/battery-calculator", icon: "battery_charging_full", label: "Home battery sizer", desc: "How many kWh of backup you need, with matching systems." },
  { href: "/calculator", icon: "electric_car", label: "EV Finder", desc: "Match an electric car to your budget, range and family." },
  { href: "/solar-finder", icon: "location_on", label: "Solar Finder", desc: "Installers serving your ZIP code, and how to judge a quote." },
  { href: "/incentives", icon: "receipt_long", label: "2026 incentives", desc: "Which federal credits ended, and where state rebates live." },
  { href: "/plug-in-solar", icon: "wb_sunny", label: "Plug-in solar", desc: "Balcony solar laws by state, real kits and what they make." },
  { href: "/best-portable-power-stations", icon: "bolt", label: "Best power stations", desc: "Picks for camping, CPAP, fridge backup and RVs." },
  { href: "/home-battery-backup", icon: "battery_charging_full", label: "Home battery backup", desc: "Whole-home vs portable, with real 2026 costs." },
];

async function LatestHeadlines() {
  const news = await fetchAllNews(6);
  if (news.length === 0) return <p className="text-sm text-stone-600">Headlines are unavailable right now.</p>;
  return <NewsClient news={news} compact />;
}

export default function HomePage() {
  const typical = referenceEv("typical");
  const rows = STATES.map((s) => ({ s, c: chargingFigures(s) })).sort((a, b) => a.c.evPer100 - b.c.evPer100);
  const cheapest = rows.slice(0, 3);
  const priciest = rows.slice(-3).reverse();
  const sunniest = [...STATES].sort((a, b) => b.solar.kwhPerKwYear - a.solar.kwhPerKwYear).slice(0, 3);
  const usEv = evCostPer100(nationalRateUsd(), typical.kwhPer100mi);
  const usGas = gasCostPer100(NATIONAL.gasolineUsdPerGallon);
  const states = [...STATES].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${url("/")}#webpage`,
          url: url("/"),
          name: TITLE,
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          about: { "@id": url("/#organization") },
          dateModified: DATA_UPDATED,
        }}
      />
      <section className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
          Going electric? Run the numbers for{" "}
          <span className="bg-gradient-to-r from-spark-amber to-spark-orange bg-clip-text text-transparent">your state</span>.
        </h1>
        <p className="text-lg text-stone-700 leading-relaxed">
          Free calculators for EVs, solar panels and home batteries, built on government data rather than sales
          pitches. Right now, charging an electric SUV at home costs about <strong>{usd(usEv, 2)} per 100 miles</strong>{" "}
          at the US average electricity price, versus <strong>{usd(usGas, 2)}</strong> for gasoline.
        </p>
      </section>

      <section aria-labelledby="tools-heading" className="mt-10">
        <h2 id="tools-heading" className="sr-only">
          Tools
        </h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="group flex h-full gap-4 bg-surface border border-black/8 rounded-2xl p-5 hover:border-amber-300 hover:shadow-sm transition"
              >
                <span aria-hidden="true" translate="no" className="material-symbols-outlined text-spark-orange" style={{ fontSize: 30 }}>
                  {t.icon}
                </span>
                <span>
                  <span className="block font-bold group-hover:text-spark-orange">{t.label}</span>
                  <span className="block text-sm text-stone-600 mt-1">{t.desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="data-heading" className="mt-14">
        <h2 id="data-heading" className="text-2xl font-bold mb-2">
          This month&apos;s numbers
        </h2>
        <p className="text-sm text-stone-600 mb-5">
          Average residential electricity prices for {ytdWindow()} (EIA), EPA vehicle ratings and PVWatts solar
          output. Updated {formatDate(DATA_UPDATED)}.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-surface rounded-2xl border border-black/8 p-5">
            <h3 className="font-bold mb-3">Cheapest states to charge an EV</h3>
            <ol className="space-y-2 text-sm">
              {cheapest.map(({ s, c }) => (
                <li key={s.abbr} className="flex justify-between gap-2">
                  <Link href={`/states/${s.slug}`} className="hover:text-spark-orange underline-offset-2 hover:underline">{s.name}</Link>
                  <span className="tabular-nums">{usd(c.evPer100, 2)}/100 mi</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-surface rounded-2xl border border-black/8 p-5">
            <h3 className="font-bold mb-3">Most expensive states to charge</h3>
            <ol className="space-y-2 text-sm">
              {priciest.map(({ s, c }) => (
                <li key={s.abbr} className="flex justify-between gap-2">
                  <Link href={`/states/${s.slug}`} className="hover:text-spark-orange underline-offset-2 hover:underline">{s.name}</Link>
                  <span className="tabular-nums">{usd(c.evPer100, 2)}/100 mi</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-surface rounded-2xl border border-black/8 p-5">
            <h3 className="font-bold mb-3">Most solar output per panel</h3>
            <ol className="space-y-2 text-sm">
              {sunniest.map((s) => (
                <li key={s.abbr} className="flex justify-between gap-2">
                  <Link href={`/states/${s.slug}#solar`} className="hover:text-spark-orange underline-offset-2 hover:underline">{s.name}</Link>
                  <span className="tabular-nums">{num(s.solar.kwhPerKwYear)} kWh/kW</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="text-xs text-stone-600 mt-3">
          EV cost is for a {typical.year} {typical.make} {typical.model} ({typical.kwhPer100mi} kWh/100 mi) charged at
          home. US average electricity price: {cents(NATIONAL.residentialCentsPerKwhYtd)}/kWh.
        </p>
      </section>

      <section aria-labelledby="states-heading" className="mt-14">
        <h2 id="states-heading" className="text-2xl font-bold mb-4">
          Electricity, EV charging and solar by state
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-1.5 text-sm">
          {states.map((s) => (
            <li key={s.abbr}>
              <Link href={`/states/${s.slug}`} className="hover:text-spark-orange hover:underline underline-offset-2">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14 grid lg:grid-cols-[2fr_1fr] gap-10">
        <section aria-labelledby="news-heading">
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <h2 id="news-heading" className="text-2xl font-bold">
              Latest headlines
            </h2>
            <Link href="/news" className="text-sm text-spark-orange underline underline-offset-2">
              More headlines
            </Link>
          </div>
          <p className="text-xs text-stone-600 mb-2">
            From Electrek, CleanTechnica, InsideEVs and Solar Power World. Links open the original article.
          </p>
          <Suspense fallback={<p className="text-sm text-stone-600">Loading headlines…</p>}>
            <LatestHeadlines />
          </Suspense>
        </section>
        <aside aria-labelledby="guides-heading">
          <h2 id="guides-heading" className="text-2xl font-bold mb-3">
            Straight answers
          </h2>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/plug-in-solar" className="font-semibold hover:text-spark-orange">Is plug-in balcony solar legal in your state?</Link>
              <span className="block text-stone-600">The 2025-2026 state laws, with links to each one.</span>
            </li>
            <li>
              <Link href="/compare" className="font-semibold hover:text-spark-orange">EcoFlow vs Anker vs Jackery vs Bluetti</Link>
              <span className="block text-stone-600">Power stations compared size for size.</span>
            </li>
            <li>
              <Link href="/objections" className="font-semibold hover:text-spark-orange">EV myths and objections, answered with data</Link>
              <span className="block text-stone-600">Range, battery life, cold weather, cost and more.</span>
            </li>
            <li>
              <Link href="/incentives" className="font-semibold hover:text-spark-orange">What happened to the EV and solar tax credits?</Link>
              <span className="block text-stone-600">Exact end dates from the IRS, and what is left.</span>
            </li>
            <li>
              <Link href="/methodology" className="font-semibold hover:text-spark-orange">How we calculate our numbers</Link>
              <span className="block text-stone-600">Sources, formulas and what they leave out.</span>
            </li>
            <li>
              <Link href="/about" className="font-semibold hover:text-spark-orange">About Spark Powered</Link>
              <span className="block text-stone-600">Independent; how we earn money is disclosed.</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
