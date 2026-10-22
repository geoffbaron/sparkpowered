import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, Disclaimer } from "@/components/content";
import { Icon } from "@/components/icons";
import { MYTHS, MYTHS_REVIEWED, TOPIC_LABEL, type MythTopic } from "@/data/myths";
import { formatDate } from "@/lib/energy";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/myths";
const TITLE = "EV, Solar & Heat Pump Myths, Answered With Facts";
const DESCRIPTION =
  "Do EV batteries die fast? Do heat pumps work in the cold? Does solar pay off where it's cloudy? Plain-English answers to the biggest going-electric myths, with sources, and honest about the parts that are true.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const VERDICT_STYLE: Record<string, string> = {
  Myth: "bg-green-100 text-green-900",
  "Mostly myth": "bg-sky-100 text-sky-900",
  "Partly true": "bg-amber-100 text-amber-900",
};

export default function MythsPage() {
  const topics = [...new Set(MYTHS.map((m) => m.topic))] as MythTopic[];
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url(PATH)}#faq`,
          name: TITLE,
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          inLanguage: "en-US",
          dateModified: MYTHS_REVIEWED,
          mainEntity: MYTHS.map((m) => ({
            "@type": "Question",
            name: m.myth,
            acceptedAnswer: { "@type": "Answer", text: `${m.short} ${m.answer}` },
          })),
        }}
      />
      <Breadcrumbs items={[{ name: "Myths, answered", path: PATH }]} />
      <header className="mb-10">
        <p className="text-sm font-bold uppercase tracking-wide text-spark-amber mb-3">Facts over fear</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-ink">
          &ldquo;But I heard...&rdquo; <span className="text-spark-orange">The going-electric myths, answered.</span>
        </h1>
        <p className="text-lg text-stone-700 mt-4 max-w-3xl leading-relaxed">
          Heard that EV batteries die in five years, heat pumps quit in the cold, or solar only pays off in Arizona? Here is
          what the data says, in plain English, with a source for every number. Where a worry is partly true, we say so.
        </p>
        <p className="text-sm text-muted mt-4">
          Figures checked <time dateTime={MYTHS_REVIEWED}>{formatDate(MYTHS_REVIEWED)}</time>.
        </p>
      </header>

      <nav aria-label="Topics" className="flex flex-wrap gap-2 mb-10">
        {topics.map((t) => (
          <a key={t} href={`#topic-${t}`} className="px-4 py-2 rounded-full text-sm font-semibold border border-black/10 bg-white hover:border-amber-300 hover:text-spark-orange">
            {TOPIC_LABEL[t]}
          </a>
        ))}
      </nav>

      {topics.map((t) => (
        <section key={t} id={`topic-${t}`} className="mb-12 scroll-mt-24" aria-labelledby={`h-${t}`}>
          <h2 id={`h-${t}`} className="text-2xl font-extrabold text-ink mb-4">{TOPIC_LABEL[t]}</h2>
          <div className="space-y-4">
            {MYTHS.filter((m) => m.topic === t).map((m) => (
              <article key={m.id} id={m.id} className="rounded-3xl bg-white border border-black/10 p-5 sm:p-6 shadow-sm scroll-mt-24 target:ring-2 target:ring-amber-400">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${VERDICT_STYLE[m.verdict]}`}>{m.verdict}</span>
                </div>
                <h3 className="text-xl font-extrabold text-ink flex gap-2">
                  <span className="text-spark-orange shrink-0 mt-0.5"><Icon name="question" /></span>
                  &ldquo;{m.myth}&rdquo;
                </h3>
                <p className="text-lg font-semibold text-stone-800 mt-3">{m.short}</p>
                <p className="text-stone-700 mt-2 leading-relaxed">{m.answer}</p>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-semibold text-spark-orange">Sources ({m.sources.length})</summary>
                  <ul className="mt-2 space-y-1 list-disc pl-5 text-stone-700">
                    {m.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} rel="noopener" className="underline underline-offset-2 hover:text-spark-orange">{s.label}</a>
                      </li>
                    ))}
                  </ul>
                </details>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-3xl bg-ink text-white p-6 sm:p-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Convinced? See what it&apos;s worth to you.</h2>
        <p className="text-white/85 mt-2">Pick your state and we&apos;ll rank every switch by what it saves you a year.</p>
        <Link href="/go-electric" className="btn btn-primary mt-5">See what you&apos;d save</Link>
        <p className="mt-5 text-sm text-white/80">
          Prefer to play? <Link href="/solartopia" className="underline font-semibold">Solartopia</Link> is a free five-minute solar game.
        </p>
      </section>
      <Disclaimer />
    </div>
  );
}
