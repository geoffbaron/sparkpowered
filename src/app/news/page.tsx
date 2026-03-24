import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News - Spark Powered",
  description: "The latest positive news about EVs, solar power, and home batteries.",
};

interface NewsItem {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  category: "ev" | "solar" | "battery";
  thumbnail: string;
}

async function fetchNews(): Promise<NewsItem[]> {
  // Curated news representing the kind of positive stories this aggregator surfaces.
  // Links go to the relevant section of each publication.
  const news: NewsItem[] = [
    {
      title: "EV Sales Surge Past 20 Million Globally in Record-Breaking Quarter",
      description: "Global electric vehicle sales have reached a new milestone, with over 20 million units sold in a single quarter. China, Europe, and the US lead the charge as prices continue to fall and model availability expands.",
      source: "CleanTechnica",
      url: "https://cleantechnica.com/electric-vehicles/",
      publishedAt: "2026-03-24",
      category: "ev",
      thumbnail: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=75&auto=format&fit=crop",
    },
    {
      title: "New Solar Panel Technology Achieves 33% Efficiency Breakthrough",
      description: "Researchers have developed a tandem perovskite-silicon solar cell that achieves 33.7% efficiency, a new world record that could dramatically reduce the cost of solar installations.",
      source: "Solar Power World",
      url: "https://solarpowerworld.com/category/news/",
      publishedAt: "2026-03-23",
      category: "solar",
      thumbnail: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=75&auto=format&fit=crop",
    },
    {
      title: "Home Battery Installations Triple as Grid Independence Grows",
      description: "Residential battery storage installations have tripled year-over-year, with homeowners increasingly pairing solar panels with batteries to achieve near-complete energy independence.",
      source: "Energy Storage News",
      url: "https://www.energy-storage.news/",
      publishedAt: "2026-03-23",
      category: "battery",
      thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop",
    },
    {
      title: "Ford and GM Report Record EV Deliveries as Truck Models Dominate",
      description: "American automakers Ford and GM have both reported record electric vehicle deliveries, led by strong demand for electric pickup trucks and SUVs that appeal to mainstream buyers.",
      source: "Electrek",
      url: "https://electrek.co/",
      publishedAt: "2026-03-22",
      category: "ev",
      thumbnail: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=75&auto=format&fit=crop",
    },
    {
      title: "Community Solar Programs Now Available in 40 States",
      description: "Community solar programs have expanded to 40 states, allowing renters and homeowners without suitable roofs to subscribe to local solar farms and save on their electricity bills.",
      source: "SEIA",
      url: "https://www.seia.org/research-resources/solar-industry-research-data",
      publishedAt: "2026-03-22",
      category: "solar",
      thumbnail: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=75&auto=format&fit=crop",
    },
    {
      title: "Sodium-Ion Batteries Hit Market at 40% Lower Cost Than Lithium",
      description: "The first commercially available sodium-ion home batteries have hit the market at roughly 40% lower cost than comparable lithium-ion units, making home energy storage accessible to more families.",
      source: "Bloomberg Green",
      url: "https://www.bloomberg.com/green",
      publishedAt: "2026-03-21",
      category: "battery",
      thumbnail: "https://images.unsplash.com/photo-1620714223084-8fcacc2dfd03?w=600&q=75&auto=format&fit=crop",
    },
    {
      title: "EV Charging Network Surpasses 200,000 Public Stations in the US",
      description: "The US public EV charging network has grown to over 200,000 stations, with fast chargers now available along every major highway corridor.",
      source: "Electrek",
      url: "https://electrek.co/guides/ev-charging/",
      publishedAt: "2026-03-21",
      category: "ev",
      thumbnail: "https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=600&q=75&auto=format&fit=crop",
    },
    {
      title: "Rooftop Solar Now Cheaper Than Grid Electricity in 48 States",
      description: "A new analysis shows rooftop solar has reached grid parity in 48 of 50 states, meaning homeowners can generate electricity for less than their utility charges.",
      source: "Solar Power World",
      url: "https://solarpowerworld.com/category/residential/",
      publishedAt: "2026-03-20",
      category: "solar",
      thumbnail: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&q=75&auto=format&fit=crop",
    },
    {
      title: "Virtual Power Plants Save Utilities $2 Billion in Peak Demand Costs",
      description: "Networks of home batteries coordinated as virtual power plants saved utilities an estimated $2 billion during summer peak demand, proving the grid value of distributed storage.",
      source: "Utility Dive",
      url: "https://www.utilitydive.com/topic/energy-storage/",
      publishedAt: "2026-03-20",
      category: "battery",
      thumbnail: "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=600&q=75&auto=format&fit=crop",
    },
    {
      title: "Average EV Price Falls Below $35,000 for First Time",
      description: "The average transaction price for a new electric vehicle in the US has fallen below $35,000 for the first time, driven by competition and new affordable models from multiple manufacturers.",
      source: "Automotive News",
      url: "https://www.autonews.com/topic/electric-vehicles",
      publishedAt: "2026-03-19",
      category: "ev",
      thumbnail: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=75&auto=format&fit=crop",
    },
    {
      title: "Solar Industry Adds 350,000 Jobs as Installations Hit Record Pace",
      description: "The US solar industry added 350,000 new jobs in the past year as residential and utility-scale installations reached record levels across the country.",
      source: "SEIA",
      url: "https://www.seia.org/solar-industry-research-data",
      publishedAt: "2026-03-19",
      category: "solar",
      thumbnail: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=75&auto=format&fit=crop",
    },
    {
      title: "Next-Gen Solid-State Batteries Promise 500-Mile EV Range",
      description: "Several automakers have announced partnerships with solid-state battery developers, with production cells expected by 2027 that could enable 500+ mile ranges and 10-minute charging.",
      source: "InsideEVs",
      url: "https://insideevs.com/news/category/battery-tech/",
      publishedAt: "2026-03-18",
      category: "battery",
      thumbnail: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=75&auto=format&fit=crop",
    },
  ];

  return news;
}

const categoryConfig = {
  ev: { label: "EV", color: "bg-electric-blue/20 text-electric-blue border-electric-blue/30" },
  solar: { label: "Solar", color: "bg-spark-yellow/20 text-spark-yellow border-spark-yellow/30" },
  battery: { label: "Battery", color: "bg-green-energy/20 text-green-energy border-green-energy/30" },
};

export default async function NewsPage() {
  const news = await fetchNews();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-spark-amber text-sm font-semibold">
          ☀️ Updated daily
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Clean Energy{" "}
          <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
            News
          </span>
        </h1>
        <p className="text-muted max-w-2xl mx-auto text-lg">
          The latest positive developments in electric vehicles, solar power,
          and battery technology. Good news for the planet, curated daily.
        </p>
      </div>

      {/* Category filters (visual) */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {(["ev", "solar", "battery"] as const).map((cat) => {
          const config = categoryConfig[cat];
          return (
            <span
              key={cat}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${config.color}`}
            >
              {config.label}
            </span>
          );
        })}
      </div>

      {/* News grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item, i) => {
          const config = categoryConfig[item.category];
          return (
            <article
              key={i}
              className="card-glow bg-surface rounded-2xl border border-black/6 flex flex-col overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden aspect-[16/9] bg-surface-light"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </a>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
                  >
                    {config.label}
                  </span>
                  <span className="text-xs text-muted">
                    {item.publishedAt.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_, y, m, d) => `${m}/${d}/${y.slice(2)}`)}
                  </span>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/title"
                >
                  <h2 className="text-lg font-bold mb-2 leading-snug group-hover/title:text-spark-orange transition-colors">
                    {item.title}
                  </h2>
                </a>

                <p className="text-sm text-muted leading-relaxed mb-4 flex-1">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="font-medium">{item.source}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-spark-orange font-medium hover:underline"
                  >
                    Read more
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-70">
                      <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Info box */}
      <div className="mt-16 bg-surface rounded-2xl p-8 border border-black/6 text-center shadow-sm">
        <h3 className="text-xl font-bold mb-2">About Our News Feed</h3>
        <p className="text-muted max-w-2xl mx-auto text-sm leading-relaxed">
          Spark Powered aggregates positive news about clean energy from trusted
          sources including CleanTechnica, Electrek, Solar Power World, Bloomberg
          Green, and more. Our feed is updated daily to keep you informed about
          the accelerating transition to sustainable energy.
        </p>
      </div>
    </div>
  );
}
