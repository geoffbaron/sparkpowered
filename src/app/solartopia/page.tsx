import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, RelatedLinks } from "@/components/content";
import Launcher from "@/components/solartopia/Launcher";
import { DrivePick, OutagePick } from "@/components/solartopia/PickCards";
import { ARTICLE, ARTICLE_FACT_ORDER, FACTS, PAGE } from "@/data/solartopia";
import { formatDate } from "@/lib/energy";
import { JsonLd, SITE_NAME, pageMetadata, url } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: PAGE.title, description: PAGE.description, path: PAGE.path, type: "website" });

export default function SolartopiaPage() {
  const app = {
    "@context": "https://schema.org",
    "@type": ["VideoGame", "WebApplication"],
    "@id": `${url(PAGE.path)}#game`,
    name: "Solartopia",
    url: url(PAGE.path),
    description: PAGE.description,
    applicationCategory: "GameApplication",
    genre: "Simulation",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires a modern web browser with JavaScript",
    inLanguage: "en-US",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: url("/") },
    dateModified: PAGE.updated,
  };
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={app} />
      <Breadcrumbs items={[{ name: "Solartopia", path: PAGE.path }]} />
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-2">Free game · about 5 minutes</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">{PAGE.h1}</h1>
        <p className="text-lg text-stone-600 leading-relaxed">
          Light a dark village with solar panels and batteries, then a town, then a city. Each day you choose when to run the water pump, the fields and the buses, so
          the sun covers the day and the battery covers the night.
        </p>
      </header>

      <Launcher picks={{ outage: <OutagePick />, drive: <DrivePick /> }} />

      <div className="mt-10 space-y-2 text-stone-700 leading-relaxed" data-testid="solartopia-article">
        {ARTICLE.map((s) => (
          <section key={s.id} id={s.id} className="mt-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-3">{s.heading}</h2>
            <div className="space-y-3">
              {s.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.id === "home" && (
                <p>
                  Start with <Link href="/states" className="underline font-semibold">your state&apos;s energy page</Link>, then try the{" "}
                  <Link href="/plug-in-solar" className="underline font-semibold">plug-in solar guide</Link>, the{" "}
                  <Link href="/solar-calculator" className="underline font-semibold">solar calculator</Link>, the{" "}
                  <Link href="/battery-calculator" className="underline font-semibold">battery sizer</Link> or the{" "}
                  <Link href="/go-electric" className="underline font-semibold">go-electric planner</Link>. The 30% federal tax credit for home solar and batteries has
                  ended; <Link href="/incentives" className="underline font-semibold">see what is still available</Link>.
                </p>
              )}
            </div>
            {s.facts && (
              <ul className="mt-3 space-y-2 border-l-4 border-amber-300 pl-4 text-sm">
                {s.facts.map((f) => (
                  <li key={f}>
                    {FACTS[f].text}{" "}
                    <a href={FACTS[f].url} className="underline underline-offset-2 hover:text-spark-orange" rel="noopener">
                      {FACTS[f].short}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section id="sources" className="mt-12 border-t border-black/8 pt-8">
          <h2 className="text-xl font-bold mb-3">Sources</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-stone-700">
            {ARTICLE_FACT_ORDER.map((id) => {
              const f = FACTS[id];
              return (
                <li key={id}>
                  <a href={f.url} className="underline underline-offset-2 hover:text-spark-orange" rel="noopener">
                    {f.source}
                  </a>
                  <span className="text-muted">
                    , published <time dateTime={f.published}>{formatDate(f.published)}</time>, checked <time dateTime={f.retrieved}>{formatDate(f.retrieved)}</time>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
        <RelatedLinks
          links={[
            { href: "/plug-in-solar", label: "Plug-in solar", desc: "Is it legal where you live?" },
            { href: "/myths", label: "Myths, answered", desc: "Battery life, cold weather, cost and more" },
            { href: "/states", label: "Your state's energy data", desc: "Rates, sun and rules" },
            { href: "/incentives", label: "2026 incentives", desc: "What federal help remains" },
          ]}
        />
      </div>
    </article>
  );
}
