import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import NewsClient from "@/components/NewsClient";
import { Breadcrumbs } from "@/components/content";
import { FEEDS, fetchAllNews } from "@/lib/rss";
import { pageMetadata } from "@/lib/seo";

/**
 * Third-party headlines. Kept out of the index on purpose: the reporting
 * belongs to the publishers, and a page of other sites' headlines adds nothing
 * a search engine should rank us for. "follow" still lets crawlers reach the
 * publishers and the rest of our site through the links.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Latest EV, Solar and Battery Headlines",
    description:
      "Recent electric vehicle, solar and home battery headlines from Electrek, CleanTechnica, InsideEVs and Solar Power World, linking to the original articles.",
    path: "/news",
  }),
  robots: { index: false, follow: true },
};

async function Headlines() {
  const news = await fetchAllNews(30);
  return <NewsClient news={news} />;
}

export default function NewsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ name: "Headlines", path: "/news" }]} />
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Latest headlines</h1>
      <p className="text-stone-700 max-w-3xl mb-8">
        Recent stories from{" "}
        {FEEDS.map((f, i) => (
          <span key={f.source}>
            <a href={f.home} className="underline" rel="noopener">
              {f.source}
            </a>
            {i < FEEDS.length - 2 ? ", " : i === FEEDS.length - 2 ? " and " : ""}
          </span>
        ))}
        , taken from their public RSS feeds and refreshed about once an hour. Every headline links to the
        original article; the reporting belongs to those publishers.{" "}
        <Link href="/about" className="underline">
          Our news policy
        </Link>
        .
      </p>
      <Suspense fallback={<p className="text-stone-600">Loading headlines…</p>}>
        <Headlines />
      </Suspense>
    </div>
  );
}
