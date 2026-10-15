import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getDailyBatteries } from "@/lib/llm-content";
import BatteryQuiz from "@/components/BatteryQuiz";
import { Breadcrumbs, Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { NATIONAL, POWERWALL_3_KWH, SOURCES, STATES, batteryFigures, num } from "@/lib/energy";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/battery-calculator";
const TITLE = "Home Battery Size Calculator: How Many kWh Do You Need?";
const DESCRIPTION =
  "How many kWh of home battery storage you need, based on what you want to keep running and for how long. Formula, worked examples and daily use by state.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

async function BatteryQuizLoader() {
  const batteries = await getDailyBatteries();
  return <BatteryQuiz initialBatteries={batteries} />;
}

function QuizSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <p className="text-sm font-medium text-stone-600 mb-4">Loading battery systems…</p>
      <p className="text-3xl sm:text-4xl font-bold mb-3" aria-hidden="true">Right-size your home battery</p>
      <div className="mt-8 space-y-3" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full h-20 bg-surface rounded-2xl border border-black/8 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function BatteryCalculatorPage() {
  const usDaily = NATIONAL.avgMonthlyKwh / (365 / 12);
  const byUse = [...STATES].sort((a, b) => b.usage.avgMonthlyKwh - a.usage.avgMonthlyKwh);
  const hi = byUse[0];
  const lo = byUse[byUse.length - 1];

  const faqs = [
    {
      q: "How many kWh battery do I need to power my house?",
      a: `Multiply the power you want to back up per day by the number of days, then divide by about 0.85 because not all of a battery's rated capacity is usable in practice. The average US home used about ${usDaily.toFixed(1)} kWh a day in 2024 (EIA), so a full day of normal use needs roughly ${Math.ceil(usDaily / 0.85)} kWh of battery. Backing up only essentials such as the fridge, lights and internet takes far less.`,
    },
    {
      q: "How long will a 13.5 kWh battery power a house?",
      a: `A 13.5 kWh battery, the capacity of one Tesla Powerwall 3, covers about ${Math.round((POWERWALL_3_KWH / usDaily) * 24)} hours of average US household use. Turning off big loads like central air conditioning, electric heat, an electric dryer or EV charging stretches it much further.`,
    },
    {
      q: "Do I need solar to have a home battery?",
      a: "No. A battery can charge from the grid and supply backup during outages, or shift power from cheap to expensive hours on a time-of-use rate. With solar, it can also store daytime output and recharge during a long outage, which a grid-only battery cannot.",
    },
    {
      q: "Is there a tax credit for home batteries in 2026?",
      a: "Not for homeowners buying one. The IRS says the 30% Residential Clean Energy Credit is not allowed for expenditures made after 31 December 2025. Some states and utilities offer storage rebates or pay batteries to support the grid; check DSIRE for your state.",
    },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Home Battery Sizer",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          browserRequirements: "Requires JavaScript",
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ name: "Home battery sizer", path: PATH }]} />
      </div>
      <Suspense fallback={<QuizSkeleton />}>
        <BatteryQuizLoader />
      </Suspense>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <Section title="How to size a home battery" id="formula">
          <div className="text-stone-700 leading-relaxed space-y-4">
            <p>
              <strong>Battery size (kWh) = daily energy to back up × days of backup ÷ 0.85.</strong> The 0.85
              allows for the share of rated capacity you cannot or should not use, and for losses converting
              stored power back to household current.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Essentials for 12 hours</strong> (fridge, lights, internet, phone charging, about 5 kWh a
                day): 5 × 0.5 ÷ 0.85 ≈ <strong>3 kWh</strong>. Our sizer rounds anything under 5 kWh up to 5,
                the smallest practical home system.
              </li>
              <li>
                <strong>Essentials plus heating or cooling for a day</strong> (about 15 kWh): 15 × 1 ÷ 0.85 ≈{" "}
                <strong>18 kWh</strong>, or two 13.5 kWh batteries.
              </li>
              <li>
                <strong>Whole home for three days</strong> (about 30 kWh a day, close to the US average of{" "}
                {usDaily.toFixed(1)} kWh): 30 × 3 ÷ 0.85 ≈ <strong>106 kWh</strong> — usually only practical
                with solar to recharge during the outage.
              </li>
            </ul>
            <Callout>
              Check your own daily use on your utility bill: divide the month&apos;s kWh by the days in the
              billing period. Average use ranges from {num(lo.usage.avgMonthlyKwh)} kWh a month in {lo.name} to{" "}
              {num(hi.usage.avgMonthlyKwh)} kWh in {hi.name}; see{" "}
              <Link href="/states" className="underline">
                your state&apos;s figures
              </Link>
              .
            </Callout>
            <p>
              <strong>Power matters as well as energy.</strong> Capacity (kWh) decides how long a battery lasts;
              its continuous power rating (kW) decides how many appliances can run at once. A central air
              conditioner or well pump can need more power than a single battery supplies, so ask the installer
              to check motor starting loads.
            </p>
          </div>
        </Section>

        <Section title="Average daily electricity use by state" id="by-state">
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface max-h-[28rem]">
            <table className="w-full text-sm">
              <caption className="sr-only">Average household daily electricity use and Powerwall hours by state</caption>
              <thead className="bg-surface-light text-left sticky top-0">
                <tr>
                  <th scope="col" className="p-3 font-semibold">State</th>
                  <th scope="col" className="p-3 font-semibold text-right">kWh per day</th>
                  <th scope="col" className="p-3 font-semibold text-right">Hours per 13.5 kWh</th>
                </tr>
              </thead>
              <tbody>
                {byUse.map((s) => {
                  const b = batteryFigures(s);
                  return (
                    <tr key={s.abbr} className="border-t border-black/6">
                      <th scope="row" className="p-3 font-medium">
                        <Link href={`/states/${s.slug}#battery`} className="text-spark-orange hover:underline">
                          {s.name}
                        </Link>
                      </th>
                      <td className="p-3 text-right tabular-nums">{b.dailyKwh.toFixed(1)}</td>
                      <td className="p-3 text-right tabular-nums">{Math.round(b.hoursPerPowerwall)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Product prices and specifications in the sizer come from automated research and are indicative only;
          confirm them with the manufacturer and installer.
        </Disclaimer>
        <Sources
          items={[
            { name: SOURCES.usage.name, url: SOURCES.usage.url, detail: SOURCES.usage.period },
            {
              name: "Tesla Powerwall 3 datasheet",
              url: "https://energylibrary.tesla.com/docs/Public/EnergyStorage/Powerwall/3/Datasheet/en-us/Powerwall-3-Datasheet.pdf",
              detail: "13.5 kWh energy capacity, 11.5 kW continuous power",
            },
            {
              name: "IRS: FAQs on the modification of sections 25C, 25D and others (FS-2025-05)",
              url: "https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-act-obbb",
              detail: "25D ends for expenditures after 31 December 2025",
            },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/solar-calculator", label: "Solar panel calculator", desc: "Pair your battery with the right-size array" },
            { href: "/solar-finder", label: "Find installers", desc: "Companies serving your state" },
          ]}
        />
      </div>
    </>
  );
}
