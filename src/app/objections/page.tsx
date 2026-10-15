import { Metadata } from "next";
import Link from "next/link";
import { JsonLd, pageMetadata, url } from "@/lib/seo";
import { Breadcrumbs, Sources } from "@/components/content";
import {
  DATA_UPDATED,
  MONTHLY_MILES,
  NATIONAL,
  STATES,
  cents,
  evCostPer100,
  formatDate,
  gasCostPer100,
  nationalRateUsd,
  num,
  referenceEv,
  usd,
  ytdWindow,
} from "@/lib/energy";

const TITLE = "EV Myths & Objections, Answered With Data";
const DESCRIPTION =
  "Straight, sourced answers to the 15 questions people ask before going electric — range, charging time, apartment charging, price, electricity cost, battery life, mining, the grid, cold weather, reliability and solar.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/objections",
  type: "article",
});

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const ports = STATES.reduce((n, s) => n + s.charging.ports, 0);
const dcFast = STATES.reduce((n, s) => n + s.charging.dcFast, 0);
const locations = STATES.reduce((n, s) => n + s.charging.locations, 0);
const typical = referenceEv("typical");
const evMonthly = (evCostPer100(nationalRateUsd(), typical.kwhPer100mi) * MONTHLY_MILES) / 100;
const gasMonthly = (gasCostPer100(NATIONAL.gasolineUsdPerGallon) * MONTHLY_MILES) / 100;

const faqs: FAQ[] = [
  {
    category: "Range & Charging",
    question: "What if I run out of charge on a road trip?",
    answer: `The Department of Energy lists ${num(ports)} public charging ports at ${num(locations)} US locations, including ${num(dcFast)} DC fast-charging ports (Alternative Fuels Data Center, ${formatDate(DATA_UPDATED)}). Most new EVs are rated for well over 250 miles — the median EPA range across 2026 model-year configurations is 295 miles — and route planners such as PlugShare and A Better Route Planner show chargers along the way. Plan charging stops on long trips the way you would plan fuel stops, especially in rural areas where fast chargers are farther apart.`,
  },
  {
    category: "Range & Charging",
    question: "How long does it take to charge?",
    answer: "Most charging happens at home while you sleep — the Department of Energy says about 80% of EV charging happens at home — so you start most days with the range you need. On a road trip, a DC fast charger can add a large share of the battery in well under an hour; how fast depends on the car, the charger and the temperature. Charging speed slows as the battery gets close to full, so short stops at 10–80% are usually quickest.",
  },
  {
    category: "Range & Charging",
    question: "What about apartment dwellers who can't charge at home?",
    answer: "It is harder, and worth planning before you buy. Options include workplace charging, Level 2 chargers at shopping centers and libraries, curbside programs in some cities, and fast chargers used like a weekly gas station visit, which costs more per mile than home charging. Some states have 'right to charge' laws for renters and condo owners; check your state's page on the AFDC incentives database.",
  },
  {
    category: "Cost",
    question: "EVs are too expensive.",
    answer: "Prices have come down at the low end, but EVs still cost more on average. Kelley Blue Book reports the average new EV sold for $55,879 in September 2026, versus $50,562 for the average new vehicle. Lower-priced models include the 2026 Nissan Leaf S+ from $29,990 MSRP before destination and the 2027 Chevrolet Bolt, which launched at $29,990 including destination. The $7,500 federal purchase credit ended for vehicles acquired after 30 September 2025; interest on a loan for a new US-assembled vehicle can be deductible up to $10,000 a year through 2028, and some states and utilities still offer rebates.",
  },
  {
    category: "Cost",
    question: "What about the cost of electricity?",
    answer: `At the US average residential price of ${cents(NATIONAL.residentialCentsPerKwhYtd)} per kWh (${ytdWindow()}, EIA), a ${typical.year} ${typical.make} ${typical.model} costs about ${usd(evMonthly)} to charge at home for ${num(MONTHLY_MILES)} miles, compared with about ${usd(gasMonthly)} of regular gasoline at ${usd(NATIONAL.gasolineUsdPerGallon, 2)} a gallon in a 25.5 mpg car. Prices vary widely by state, and public fast charging costs more than home charging.`,
  },
  {
    category: "Cost",
    question: "What about battery replacement costs?",
    answer: "Most EV batteries are covered by a manufacturer warranty, commonly 8 years or 100,000 miles, according to the Department of Energy. Batteries lose capacity gradually rather than failing outright, and replacements outside warranty are uncommon but expensive, so check the warranty terms and, for a used EV, the battery's health report before you buy.",
  },
  {
    category: "Environment",
    question: "Aren't EV batteries bad for the environment?",
    answer: "Building the battery does add emissions up front, but over a car's life an EV comes out well ahead. The International Council on Clean Transportation found that a medium-size EV registered in the US in 2021 produces 60–68% less lifecycle greenhouse gas than a comparable gasoline car. Batteries are also recyclable: Redwood Materials says it recovers more than 95% of critical materials such as lithium, nickel, cobalt and copper.",
  },
  {
    category: "Environment",
    question: "What about mining for battery materials?",
    answer: "Mining lithium, nickel and cobalt has real environmental and human-rights impacts, and supply chains still need scrutiny. Two differences from oil: battery materials are mined once and can be recycled at the end of the battery's life, while gasoline is burned and has to be extracted again for every mile. Newer chemistries such as lithium iron phosphate avoid cobalt and nickel altogether.",
  },
  {
    category: "Environment",
    question: "The grid isn't clean enough for EVs to matter.",
    answer: "Even on today's grid, the Union of Concerned Scientists finds that wherever you plug in across the US, the average EV produces fewer global-warming emissions than the average new gasoline car. The advantage grows as more of the grid's power comes from low-carbon sources. You can check the estimate for your ZIP code with the Beyond Tailpipe calculator on fueleconomy.gov.",
  },
  {
    category: "Performance & Reliability",
    question: "EVs aren't as fun to drive.",
    answer: "Electric motors deliver full torque from a standstill, so most EVs accelerate briskly, and the heavy battery sits low in the floor, which helps handling. Whether that is 'fun' is personal — the best test is a test drive.",
  },
  {
    category: "Performance & Reliability",
    question: "What about cold weather performance?",
    answer: "Cold weather does cut range. fueleconomy.gov, citing AAA testing, reports that at 20°F EV range can drop by about 41% with the cabin heater on and about 12% with it off, compared with 75°F. Preheating the car while it is still plugged in, using seat heaters, and choosing a model with a heat pump all help. Cold-climate countries still adopt EVs: 95.9% of new cars registered in Norway in 2025 were fully electric.",
  },
  {
    category: "Performance & Reliability",
    question: "Are EVs reliable?",
    answer: "Mixed. EVs have far fewer moving parts and lower scheduled maintenance — Argonne National Laboratory estimates 6.1 cents per mile for a battery-electric car versus 10.1 cents for a gasoline car. But Consumer Reports' 2025 reliability survey found EVs and plug-in hybrids had about 80% more problems on average than gas-only cars, often with software, electronics and charging hardware. Reliability varies a lot by brand and model, so check model-specific ratings.",
  },
  {
    category: "Solar & Batteries",
    question: "Is solar worth it if my roof doesn't get much sun?",
    answer: "Panels still work in cloudy climates; they just produce less. The PVWatts solar model shows that 1 kW of panels makes far more power in the Southwest than in the Pacific Northwest, so payback depends on your state, your electricity price and how your utility credits exported power — our state pages show all three. If your roof isn't suitable, community solar lets you subscribe to a shared array; 24 states and DC had policies enabling it as of February 2025 (National Laboratory of the Rockies).",
  },
  {
    category: "Solar & Batteries",
    question: "Do I need a home battery with solar?",
    answer: "Not necessarily. Without a battery, extra solar power goes to the grid, usually for a bill credit. A battery stores it for the evening and keeps power on during outages, which matters more if your utility credits exports at a low rate, uses time-of-use pricing, or has frequent outages. Our battery sizer shows how much storage you would need.",
  },
  {
    category: "Solar & Batteries",
    question: "How long do solar panels last?",
    answer: "Research from the National Renewable Energy Laboratory (now the National Laboratory of the Rockies) found panels lose a median of about 0.5% of output per year. Panels are typically warranted for 20 to 25 years, and the Department of Energy says most systems keep at least 80% of their original output for at least 25 years. Inverters usually need replacing sooner than panels.",
  },
];


const categories = Array.from(new Set(faqs.map((f) => f.category)));

/**
 * Several answers cite prices and incentives that move. Stamping the review
 * date gives both readers and answer engines something to age the figures
 * against — bump this whenever the numbers are checked.
 */
const LAST_REVIEWED = "2026-10-15";
const LAST_REVIEWED_LABEL = "15 October 2026";

/**
 * FAQPage schema — this is the page most likely to be quoted by an answer
 * engine, so every question/answer pair is published as structured data rather
 * than left for a crawler to scrape out of <details> elements.
 */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": url("/objections#faq"),
  name: TITLE,
  description: DESCRIPTION,
  isPartOf: { "@id": url("/#website") },
  publisher: { "@id": url("/#organization") },
  inLanguage: "en-US",
  dateModified: LAST_REVIEWED,
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    answerCount: 1,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function ObjectionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={faqSchema} />
      <Breadcrumbs items={[{ name: "EV objections", path: "/objections" }]} />
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-spark-amber text-sm font-semibold">
          <span aria-hidden="true" translate="no" className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>lightbulb</span>Facts over fear
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Common{" "}
          <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
            Objections
          </span>{" "}
          Answered
        </h1>
        <p className="text-muted max-w-2xl mx-auto text-lg">
          Heard something that made you hesitate about going electric? Let&apos;s
          look at what the data actually says.
        </p>
        <p className="text-sm text-stone-600 mt-5">
          Prices and incentives last reviewed{" "}
          <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED_LABEL}</time>
        </p>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {categories.map((cat) => (
          <a
            key={cat}
            href={`#${cat.toLowerCase().replace(/\s+/g, "-")}`}
            className="px-4 py-1.5 rounded-full text-sm font-medium border border-black/10 text-muted hover:text-spark-orange hover:border-amber-300 bg-white hover:bg-amber-50 transition-colors"
          >
            {cat}
          </a>
        ))}
      </div>

      {/* FAQ sections */}
      {categories.map((category) => (
        <section key={category} className="mb-12">
          <h2
            id={category.toLowerCase().replace(/\s+/g, "-")}
            className="text-2xl font-bold mb-6 scroll-mt-24"
          >
            {category}
          </h2>
          <div className="space-y-4">
            {faqs
              .filter((f) => f.category === category)
              .map((faq, i) => (
                <details
                  key={i}
                  className="group bg-surface rounded-2xl border border-black/6 overflow-hidden card-glow"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="text-lg font-semibold pr-4 group-hover:text-spark-orange transition-colors">
                      {faq.question}
                    </h3>
                    <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 text-spark-orange font-bold group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-muted leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
          </div>
        </section>
      ))}

      {/* Bottom CTA */}
      <div className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100 text-center">
        <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
        <p className="text-muted mb-6 max-w-lg mx-auto">
          Run your own numbers: see what an EV would cost to charge where you
          live, or find models that fit your budget and driving.
        </p>
        <Link
          href="/calculator"
          className="spark-btn inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all"
        >
          Find Your Perfect EV
        </Link>
        <Link
          href="/ev-charging-cost"
          className="ml-0 sm:ml-3 mt-3 sm:mt-0 inline-flex items-center justify-center px-8 py-3 rounded-xl border-2 border-amber-300 bg-white font-bold hover:bg-amber-50"
        >
          Charging cost calculator
        </Link>
      </div>
      <Sources
        items={[
          { name: "U.S. DOE Alternative Fuels Data Center: station counts by state", url: "https://afdc.energy.gov/stations/states", detail: `retrieved ${DATA_UPDATED}` },
          { name: "fueleconomy.gov vehicle data", url: "https://www.fueleconomy.gov/feg/download.shtml", detail: "EPA range and efficiency, model years 2026–2027" },
          { name: "U.S. DOE: National EV Charging Network", url: "https://www.energy.gov/topics/national-ev-charging-network", detail: "about 80% of charging happens at home" },
          { name: "Cox Automotive / Kelley Blue Book: September 2026 ATP report", url: "https://www.coxautoinc.com/insights/sept-2026-atp-report/", detail: "13 October 2026" },
          { name: "Nissan: 2026 Nissan Leaf pricing", url: "https://usa.nissannews.com/en-US/releases/more-features-more-range-still-under-30k-all-new-2026-nissan-leaf-priced-from-29990-msrp", detail: "19 August 2025" },
          { name: "GM: 2027 Chevrolet Bolt", url: "https://news.gm.com/home.detail.html/Pages/news/us/en/2025/oct/1009-2027-Chevrolet-Bolt.html", detail: "9 October 2025" },
          { name: "IRS fact sheet FS-2025-05", url: "https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-act-obbb", detail: "credit end dates" },
          { name: "EIA Electric Power Monthly and weekly gasoline prices", url: "https://www.eia.gov/electricity/monthly/", detail: ytdWindow() },
          { name: "U.S. DOE AFDC: Maintenance and Safety of Electric Vehicles", url: "https://afdc.energy.gov/vehicles/electric-maintenance", detail: "battery warranties" },
          { name: "ICCT: Global comparison of life-cycle GHG emissions of combustion engine and electric cars", url: "https://theicct.org/publication/a-global-comparison-of-the-life-cycle-greenhouse-gas-emissions-of-combustion-engine-and-electric-passenger-cars/", detail: "July 2021" },
          { name: "Redwood Materials", url: "https://www.redwoodmaterials.com/materials/", detail: "recovery rate claim" },
          { name: "Union of Concerned Scientists blog, 3 August 2026", url: "https://blog.ucs.org/dave-reichmuth/epa-stopped-updating-the-data-behind-electric-vehicle-emissions-the-numbers-still-show-evs-are-winners/", detail: "EV vs gasoline emissions by grid region" },
          { name: "fueleconomy.gov: Fuel Economy in Cold Weather", url: "https://fueleconomy.gov/feg/coldweather.shtml", detail: "cites AAA testing" },
          { name: "OFV (Norwegian Road Federation) 2025 registrations", url: "https://ofv.no/", detail: "95.9% fully electric in 2025" },
          { name: "U.S. DOE Fact of the Week #1190", url: "https://www.energy.gov/eere/vehicles/articles/fotw-1190-june-14-2021-battery-electric-vehicles-have-lower-scheduled", detail: "Argonne maintenance cost per mile" },
          { name: "Consumer Reports: car reliability survey", url: "https://www.consumerreports.org/cars/car-reliability-owner-satisfaction/electric-vehicles-are-less-reliable-than-conventional-cars-a1047214174/", detail: "updated 4 December 2025" },
          { name: "National Laboratory of the Rockies: community solar", url: "https://www.nlr.gov/state-local-tribal/community-solar", detail: "data as of February 2025" },
          { name: "Jordan & Kurtz, Photovoltaic Degradation Rates — An Analytical Review (2013)", url: "https://www.osti.gov/biblio/1045052", detail: "median 0.5% per year" },
          { name: "U.S. DOE: Should I replace my rooftop solar system?", url: "https://www.energy.gov/cmei/systems/articles/should-i-replace-my-rooftop-solar-system", detail: "25 June 2024" },
        ]}
      />
    </div>
  );
}
