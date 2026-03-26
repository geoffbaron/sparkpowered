"use client";

import { useState, useMemo } from "react";
import NewsImage from "@/components/NewsImage";
import type { RSSArticle } from "@/lib/rss";

const TESLA_TERMS = /\btesla\b|\belon\b|\bmusk\b|\btsla\b/i;

function isTesla(article: RSSArticle) {
  return TESLA_TERMS.test(article.title) || TESLA_TERMS.test(article.description ?? "");
}

const categoryConfig = {
  ev:      { label: "EV",      color: "bg-blue-50 text-blue-600 border-blue-200",   active: "bg-blue-600 text-white border-blue-600" },
  solar:   { label: "Solar",   color: "bg-amber-50 text-amber-600 border-amber-200", active: "bg-amber-500 text-white border-amber-500" },
  battery: { label: "Battery", color: "bg-green-50 text-green-600 border-green-200", active: "bg-green-600 text-white border-green-600" },
};

type Category = keyof typeof categoryConfig;

export default function NewsClient({ news }: { news: RSSArticle[] }) {
  const [noTesla, setNoTesla] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    let items = news;
    if (activeCategory) items = items.filter((a) => a.category === activeCategory);
    if (noTesla) items = items.filter((a) => !isTesla(a));
    return items;
  }, [news, activeCategory, noTesla]);

  return (
    <>
      {/* Filters row */}
      <div className="flex flex-wrap gap-3 justify-center mb-10 items-center">
        {/* Category filters */}
        {(Object.entries(categoryConfig) as [Category, typeof categoryConfig[Category]][]).map(([cat, config]) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer
              ${activeCategory === cat ? config.active : config.color + " hover:opacity-80"}`}
          >
            {config.label}
          </button>
        ))}

        {/* Divider */}
        <span className="w-px h-5 bg-black/10" aria-hidden="true" />

        {/* No Tesla toggle */}
        <button
          onClick={() => setNoTesla(!noTesla)}
          title={noTesla ? "Show Tesla articles" : "Hide all Tesla / Elon / Musk articles"}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer
            ${noTesla
              ? "bg-red-50 text-red-600 border-red-400 hover:bg-red-100"
              : "bg-surface text-muted border-black/10 hover:border-black/20 hover:text-foreground"
            }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
            {noTesla ? "block" : "electric_car"}
          </span>
          {noTesla ? "No Tesla (on)" : "No Tesla"}
        </button>
      </div>

      {/* Result count */}
      {(activeCategory || noTesla) && (
        <p className="text-center text-sm text-muted mb-6">
          Showing {filtered.length} of {news.length} articles
          {activeCategory && <> in <strong>{categoryConfig[activeCategory].label}</strong></>}
          {noTesla && <> · Tesla articles hidden</>}
          {" "}—{" "}
          <button
            onClick={() => { setActiveCategory(null); setNoTesla(false); }}
            className="text-spark-orange hover:underline font-medium"
          >
            Clear filters
          </button>
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-muted">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-muted)" }}>search_off</span>
          <p className="text-lg font-medium mt-4">No articles match your filters.</p>
          <button
            onClick={() => { setActiveCategory(null); setNoTesla(false); }}
            className="mt-3 text-spark-orange hover:underline text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => {
            const config = categoryConfig[item.category];
            return (
              <article
                key={i}
                className="bg-surface rounded-2xl border border-black/6 flex flex-col overflow-hidden group hover:shadow-md transition-shadow"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden aspect-[16/9] bg-surface-light"
                >
                  <NewsImage src={item.thumbnail} alt={item.title} />
                </a>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => setActiveCategory(activeCategory === item.category ? null : item.category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer
                        ${activeCategory === item.category ? config.active : config.color + " hover:opacity-80"}`}
                    >
                      {config.label}
                    </button>
                    <span className="text-xs text-muted">
                      {item.publishedAt.replace(
                        /^(\d{4})-(\d{2})-(\d{2})$/,
                        (_, y, m, d) => `${m}/${d}/${y.slice(2)}`
                      )}
                    </span>
                  </div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="group/title">
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
                        <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
