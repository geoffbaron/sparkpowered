import { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { fetchAllNews } from "@/lib/rss";
import type { RSSArticle } from "@/lib/rss";
import NewsImage from "@/components/NewsImage";

export const metadata: Metadata = {
  title: "Spark Powered — EV, Solar & Clean Energy News",
  description:
    "The latest news on electric vehicles, solar power, and home batteries — refreshed every hour from Electrek, CleanTechnica, InsideEVs, and more.",
};

const categoryConfig = {
  ev:      { label: "EV",      color: "bg-blue-50 text-blue-600 border-blue-200" },
  solar:   { label: "Solar",   color: "bg-amber-50 text-amber-600 border-amber-200" },
  battery: { label: "Battery", color: "bg-green-50 text-green-600 border-green-200" },
};

function NewsGrid({ news }: { news: RSSArticle[] }) {
  if (news.length === 0) {
    return (
      <div className="text-center py-24 text-muted">
        <div className="mb-4">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-muted)" }}>wifi_off</span>
        </div>
        <p className="text-lg font-medium">Couldn&apos;t reach the news feeds right now.</p>
        <p className="text-sm mt-2">Check back in a few minutes.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item, i) => {
        const config = categoryConfig[item.category];
        return (
          <article
            key={i}
            className="bg-surface rounded-2xl border border-black/6 flex flex-col overflow-hidden group hover:shadow-md transition-shadow"
          >
            {/* Thumbnail */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden aspect-[16/9] bg-surface-light"
            >
              <NewsImage
                src={item.thumbnail}
                alt={item.title}
                category={item.category}
                articleUrl={item.url}
              />
            </a>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs text-muted">
                  {item.publishedAt.replace(
                    /^(\d{4})-(\d{2})-(\d{2})$/,
                    (_, y, m, d) => `${m}/${d}/${y.slice(2)}`
                  )}
                </span>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/title"
              >
                <h2 className="text-lg font-bold mb-2 leading-snug group-hover/title:text-spark-orange transition-colors line-clamp-3">
                  {item.title}
                </h2>
              </a>

              <p className="text-sm text-muted leading-relaxed mb-4 flex-1 line-clamp-3">
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
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-surface rounded-2xl border border-black/6 overflow-hidden animate-pulse">
          <div className="aspect-[16/9] bg-surface-light" />
          <div className="p-6 space-y-3">
            <div className="flex gap-2">
              <div className="h-5 w-14 bg-surface-light rounded-full" />
              <div className="h-5 w-16 bg-surface-light rounded-full" />
            </div>
            <div className="h-5 bg-surface-light rounded w-full" />
            <div className="h-5 bg-surface-light rounded w-4/5" />
            <div className="h-4 bg-surface-light rounded w-full" />
            <div className="h-4 bg-surface-light rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function NewsLoader() {
  const news = await fetchAllNews();
  return <NewsGrid news={news} />;
}

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-sm font-semibold">
          <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }}>wb_sunny</span>Live from Electrek, CleanTechnica & more
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Clean Energy{" "}
          <span className="bg-gradient-to-r from-spark-yellow to-spark-orange bg-clip-text text-transparent">
            News
          </span>
        </h1>
        <p className="text-muted max-w-2xl mx-auto text-lg">
          The latest on electric vehicles, solar power, and battery technology —
          pulled fresh from the web every hour.
        </p>
      </div>

      {/* Category legend */}
      <div className="flex flex-wrap gap-3 justify-center mb-10">
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
      <Suspense fallback={<NewsSkeleton />}>
        <NewsLoader />
      </Suspense>

      {/* Tools strip */}
      <div className="mt-16 grid sm:grid-cols-3 gap-4">
        {[
          { href: "/calculator",         icon: "electric_car",          label: "EV Finder",      desc: "Find the right EV for your budget" },
          { href: "/solar-finder",        icon: "wb_sunny",              label: "Solar Finder",   desc: "Get free quotes from local installers" },
          { href: "/battery-calculator",  icon: "battery_charging_full", label: "Battery Sizer",  desc: "Right-size a home battery system" },
        ].map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex items-center gap-4 bg-surface border border-black/6 rounded-2xl p-5 hover:border-amber-300 hover:shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-muted group-hover:text-spark-orange transition-colors" style={{ fontSize: 32 }}>
              {tool.icon}
            </span>
            <div>
              <div className="font-bold group-hover:text-spark-orange transition-colors">{tool.label}</div>
              <div className="text-xs text-muted">{tool.desc}</div>
            </div>
            <span className="material-symbols-outlined text-muted group-hover:text-spark-orange transition-colors ml-auto" style={{ fontSize: 20 }}>arrow_forward</span>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-12 bg-surface rounded-2xl p-8 border border-black/6 text-center shadow-sm">
        <h3 className="text-xl font-bold mb-2">About Our News Feed</h3>
        <p className="text-muted max-w-2xl mx-auto text-sm leading-relaxed">
          Spark Powered pulls live RSS feeds from Electrek, CleanTechnica, InsideEVs, and Solar
          Power World — refreshed every hour. Articles link directly to their original source.
        </p>
      </div>
    </div>
  );
}
