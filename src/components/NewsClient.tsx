"use client";

import { useMemo, useState } from "react";
import type { RSSArticle } from "@/lib/rss";
import { useNoTesla } from "@/hooks/useNoTesla";

const TESLA_TERMS = /\btesla\b|\belon\b|\bmusk\b|\btsla\b/i;

function isTesla(article: RSSArticle) {
  return TESLA_TERMS.test(article.title) || TESLA_TERMS.test(article.description ?? "");
}

const categoryConfig = {
  ev:      { label: "EV",      color: "bg-blue-50 text-blue-800 border-blue-200",    active: "bg-blue-700 text-white border-blue-700" },
  solar:   { label: "Solar",   color: "bg-amber-50 text-amber-900 border-amber-300", active: "bg-amber-700 text-white border-amber-700" },
  battery: { label: "Battery", color: "bg-green-50 text-green-800 border-green-200", active: "bg-green-700 text-white border-green-700" },
};

type Category = keyof typeof categoryConfig;

function shortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/**
 * Headline list linking out to the original publisher. Headline, source and
 * date only — no article text or images are republished.
 */
export default function NewsClient({ news, compact = false }: { news: RSSArticle[]; compact?: boolean }) {
  const [noTesla, setNoTesla] = useNoTesla();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    let items = news;
    if (activeCategory) items = items.filter((a) => a.category === activeCategory);
    if (noTesla) items = items.filter((a) => !isTesla(a));
    return items;
  }, [news, activeCategory, noTesla]);

  return (
    <>
      {!compact && (
        <div className="flex flex-wrap gap-2 mb-6 items-center" role="group" aria-label="Filter headlines">
          {(Object.entries(categoryConfig) as [Category, (typeof categoryConfig)[Category]][]).map(([cat, config]) => (
            <button
              key={cat}
              type="button"
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat ? config.active : config.color
              }`}
            >
              {config.label}
            </button>
          ))}
          <span className="w-px h-5 bg-black/10" aria-hidden="true" />
          <button
            type="button"
            aria-pressed={noTesla}
            onClick={() => setNoTesla(!noTesla)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              noTesla ? "bg-red-50 text-red-800 border-red-400" : "bg-surface text-stone-700 border-black/15"
            }`}
          >
            {noTesla ? "No Tesla (on)" : "Hide Tesla stories"}
          </button>
          {(activeCategory || noTesla) && (
            <span className="text-sm text-stone-600 ml-1">
              {filtered.length} of {news.length} ·{" "}
              <button
                type="button"
                onClick={() => {
                  setActiveCategory(null);
                  setNoTesla(false);
                }}
                className="text-spark-orange underline"
              >
                Clear
              </button>
            </span>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-10 text-stone-600">No headlines match your filters.</p>
      ) : (
        <ul className={compact ? "divide-y divide-black/8" : "grid md:grid-cols-2 gap-x-8 divide-y md:divide-y-0 divide-black/8"}>
          {filtered.map((item) => (
            <li key={item.url} className={compact ? "py-3" : "py-4 md:border-b md:border-black/8"}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener"
                className="font-semibold leading-snug hover:text-spark-orange hover:underline underline-offset-2"
              >
                {item.title}
                <span className="sr-only"> (opens {item.source} in a new tab)</span>
              </a>
              <div className="text-xs text-stone-600 mt-1 flex gap-2">
                <span className="font-medium">{item.source}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={item.publishedAt}>{shortDate(item.publishedAt)}</time>
                <span aria-hidden="true">·</span>
                <span>{categoryConfig[item.category].label}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
