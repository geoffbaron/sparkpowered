import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Objections & FAQs - Spark Powered",
  description: "Common objections about EVs answered with facts and data.",
};

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    category: "Range & Charging",
    question: "What if I run out of charge on a road trip?",
    answer:
      "The US now has over 200,000 public charging stations, with fast chargers along every major highway. Modern EVs have 250-350+ miles of range, and apps like PlugShare and A Better Route Planner make it easy to plan stops. Most road trips just need 1-2 quick charging breaks — perfect for stretching your legs and grabbing coffee. For daily driving, 95% of Americans drive less than 100 miles per day, well within any modern EV's range.",
  },
  {
    category: "Range & Charging",
    question: "How long does it take to charge?",
    answer:
      "Most EV owners charge at home overnight — just plug in when you get home, wake up to a full battery. It's like charging your phone. For road trips, DC fast chargers can add 200+ miles in 20-30 minutes. The average American spends 5-10 minutes at a gas station per fill-up, and you'll never need to do even that for your daily driving since you start every morning 'full'.",
  },
  {
    category: "Range & Charging",
    question: "What about apartment dwellers who can't charge at home?",
    answer:
      "Workplace charging, public chargers at shopping centers, and dedicated EV charging hubs are expanding rapidly. Many apartment complexes are adding chargers — it's becoming a selling point for landlords. Some cities offer curbside charging programs too. You can also use fast chargers once a week like a gas station visit, though it's more expensive than home charging.",
  },
  {
    category: "Cost",
    question: "EVs are too expensive.",
    answer:
      "The average new EV price has fallen below $35,000, with models like the Chevrolet Bolt EUV starting around $27,800. Factor in the federal tax credit (up to $7,500), state incentives, and dramatically lower fuel and maintenance costs, and many EVs are cheaper to own than comparable gas cars over 5 years. No oil changes, no transmission repairs, no exhaust system issues, and brake pads last 2-3x longer thanks to regenerative braking.",
  },
  {
    category: "Cost",
    question: "What about the cost of electricity?",
    answer:
      "Charging an EV costs about $30-50 per month for the average driver — compared to $150-250 per month in gasoline. That's $1,200-2,400 saved per year on fuel alone. If you have solar panels, your driving fuel is essentially free. Many utilities offer special EV charging rates for off-peak hours, making it even cheaper to charge overnight.",
  },
  {
    category: "Cost",
    question: "What about battery replacement costs?",
    answer:
      "Modern EV batteries are designed to last 200,000-300,000+ miles. Most manufacturers warranty them for 8 years/100,000 miles. Data from high-mileage EVs shows most batteries retain 85-90% capacity after 200,000 miles. Battery replacement costs are also dropping rapidly — and when it does eventually need replacing, you've saved tens of thousands on fuel and maintenance by then.",
  },
  {
    category: "Environment",
    question: "Aren't EV batteries bad for the environment?",
    answer:
      "Over its lifetime, an EV produces 50-70% less CO2 than a gas car, even accounting for battery manufacturing and electricity generation. As the grid gets cleaner (more solar and wind), this advantage grows every year. EV batteries are also recyclable — companies like Redwood Materials recover 95%+ of critical minerals. Used EV batteries get a second life as stationary energy storage before recycling.",
  },
  {
    category: "Environment",
    question: "What about mining for battery materials?",
    answer:
      "Mining for battery minerals has real impacts, but context matters: oil extraction causes massive environmental damage through drilling, spills, refining, and transportation — continuously, forever. Battery minerals are mined once per vehicle and are recyclable. The industry is also rapidly shifting to more sustainable sources, and new battery chemistries (like sodium-ion and iron-air) reduce reliance on scarce minerals.",
  },
  {
    category: "Environment",
    question: "The grid isn't clean enough for EVs to matter.",
    answer:
      "Even on today's grid, EVs are cleaner than gas cars in every US state. The grid is getting cleaner every year as solar, wind, and storage grow exponentially. An EV bought today will get cleaner every year it's driven. A gas car's emissions are locked in forever. Plus, you can pair an EV with rooftop solar for nearly zero-emission driving from day one.",
  },
  {
    category: "Performance & Reliability",
    question: "EVs aren't as fun to drive.",
    answer:
      "Instant torque from electric motors means EVs are incredibly quick off the line — many beat sports cars in 0-60 times. The low center of gravity (battery is in the floor) gives EVs go-kart-like handling. EV owners consistently rate driving enjoyment higher than their previous gas cars. Test drive one and you'll see why 90% of EV owners say they'd never go back.",
  },
  {
    category: "Performance & Reliability",
    question: "What about cold weather performance?",
    answer:
      "Cold weather does reduce EV range by 10-30%, similar to how gas cars get worse MPG in winter. However, EVs have advantages too: instant cabin heat, pre-conditioning while plugged in (warm car, full range), no cold starts, and no frozen fuel lines. Norway — one of the coldest countries — leads the world in EV adoption at over 90% of new car sales. They seem to manage just fine!",
  },
  {
    category: "Performance & Reliability",
    question: "Are EVs reliable?",
    answer:
      "EVs have far fewer moving parts than gas cars — no engine, transmission, exhaust system, or fuel system to fail. Electric motors are incredibly reliable with virtually no maintenance. Consumer Reports data shows EVs generally have fewer problems than gas cars, and maintenance costs are 30-50% lower. The main maintenance items are tires, windshield wipers, and cabin air filters.",
  },
  {
    category: "Solar & Batteries",
    question: "Is solar worth it if my roof doesn't get much sun?",
    answer:
      "Solar panels work even on cloudy days — they just produce less. Modern panels are much more efficient than even 5 years ago. If your roof isn't ideal, community solar programs (now available in 40 states) let you subscribe to a local solar farm and save 10-20% on your bill without any installation. Your utility bill drops either way.",
  },
  {
    category: "Solar & Batteries",
    question: "Do I need a home battery with solar?",
    answer:
      "Not necessarily, but they're increasingly valuable. Without a battery, excess solar goes to the grid (usually for credits on your bill). With a battery, you store that energy for evening use and have backup power during outages. As time-of-use electricity pricing spreads, batteries let you avoid expensive peak rates. They're especially valuable if your area has frequent power outages.",
  },
  {
    category: "Solar & Batteries",
    question: "How long do solar panels last?",
    answer:
      "Solar panels are warrantied for 25-30 years and often produce power for 35-40+ years. They have no moving parts, require almost no maintenance, and degradation is minimal — typically less than 0.5% per year. A system installed today will still be producing 87%+ of its original output in 25 years. It's one of the most durable investments you can make for your home.",
  },
];

const categories = Array.from(new Set(faqs.map((f) => f.category)));

export default function ObjectionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-spark-yellow/10 border border-spark-yellow/20 text-spark-yellow text-sm font-medium">
          Facts over fear
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
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {categories.map((cat) => (
          <a
            key={cat}
            href={`#${cat.toLowerCase().replace(/\s+/g, "-")}`}
            className="px-4 py-1.5 rounded-full text-sm font-medium border border-white/10 text-muted hover:text-spark-yellow hover:border-spark-yellow/30 transition-colors"
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
                  className="group bg-surface rounded-2xl border border-white/5 overflow-hidden card-glow"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="text-lg font-semibold pr-4 group-hover:text-spark-yellow transition-colors">
                      {faq.question}
                    </h3>
                    <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-surface-light text-spark-yellow group-open:rotate-45 transition-transform">
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
      <div className="mt-16 bg-gradient-to-br from-surface to-surface-light rounded-2xl p-8 border border-white/5 text-center">
        <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
        <p className="text-muted mb-6 max-w-lg mx-auto">
          The best way to experience the electric difference is to test drive
          one. Most dealerships offer no-pressure EV test drives — and most
          people are sold after their first ride.
        </p>
        <a
          href="/calculator"
          className="spark-btn inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-background font-bold hover:shadow-lg hover:shadow-spark-yellow/20 transition-all"
        >
          Find Your Perfect EV
        </a>
      </div>
    </div>
  );
}
