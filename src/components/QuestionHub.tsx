import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Breadcrumbs, Callout, Disclaimer, RelatedLinks } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { RedodoDeal } from "@/components/RedodoDeal";
import { TOPICS, questionPath, type Block, type Question, type Topic } from "@/data/questions";
import { formatDate } from "@/lib/energy";
import { JsonLd, QUESTIONS_UPDATED, QUESTIONS_UPDATED_AT, url } from "@/lib/seo";

export function DetailBlock({ b }: { b: Block }) {
  if ("p" in b) return <p>{b.p}</p>;
  if ("ul" in b)
    return (
      <ul className="list-disc pl-5 space-y-1">
        {b.ul.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    );
  return (
    <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
      <table className="w-full text-sm min-w-[32rem]">
        <caption className="text-left text-xs text-muted px-3 pt-3 pb-1">{b.table.caption}</caption>
        <thead className="bg-surface-light text-left">
          <tr>
            {b.table.head.map((h) => (
              <th key={h} scope="col" className="p-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {b.table.rows.map((r) => (
            <tr key={r.join("|")} className="border-t border-black/6">
              {r.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="p-3 font-medium">
                    {cell}
                  </th>
                ) : (
                  <td key={i} className="p-3">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ToolLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith("/"))
    return (
      <Link href={href} className="underline underline-offset-2 text-spark-orange hover:text-spark-amber">
        {label}
      </Link>
    );
  return (
    <a href={href} target="_blank" rel="noopener" className="underline underline-offset-2 text-spark-orange hover:text-spark-amber">
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/**
 * Everything under a question's heading: short answer, detail, partner picks,
 * tools and sources. Shared by the hub and the single-question page so the two
 * always show the same fact-checked text, links and rel attributes.
 */
export function QuestionAnswer({ q, redodo }: { q: Question; redodo: boolean }) {
  return (
    <>
      <QuickAnswer>
        <p>{q.a}</p>
      </QuickAnswer>
      <div className="prose-sp text-stone-700 leading-relaxed space-y-4 mt-5">
        {q.detail.map((b, i) => (
          <DetailBlock key={i} b={b} />
        ))}
      </div>
      {q.example && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed">
          <p className="font-semibold text-ink mb-1">Worked example</p>
          <p className="text-stone-800">{q.example.text}</p>
          <p className="mt-2 text-muted">
            Source:{" "}
            <a href={q.example.source.url} rel="noopener" target="_blank" className="underline underline-offset-2 hover:text-spark-orange">
              {q.example.source.name}
            </a>
            {" · "}
            <ToolLink href={q.example.tool.href} label={q.example.tool.label} />
          </p>
        </div>
      )}
      {redodo && <RedodoDeal className="mt-5" />}
      {q.picks && q.picks.length > 0 && (
        <ul className="mt-5 grid sm:grid-cols-2 gap-3">
          {q.picks.map((p) => (
            <li key={p.label} className="rounded-xl border border-black/8 bg-surface p-4">
              <PartnerLink brand={p.brand} productId={p.productId} productUrl={p.url} className="font-semibold underline underline-offset-2 text-spark-orange hover:text-spark-amber">
                {p.label}
              </PartnerLink>
              <span className="block text-sm text-muted mt-1">{p.note}</span>
            </li>
          ))}
        </ul>
      )}
      {q.tools && q.tools.length > 0 && (
        <p className="mt-5 text-sm">
          <strong>Run your own numbers:</strong>{" "}
          {q.tools.map((t, i) => (
            <span key={t.href}>
              {i > 0 && " · "}
              <ToolLink href={t.href} label={t.label} />
            </span>
          ))}
        </p>
      )}
      <div className="mt-4 text-sm">
        <p className="font-semibold mb-1">Sources</p>
        <ul className="list-disc pl-5 space-y-1 text-stone-600">
          {q.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} rel="noopener" target="_blank" className="underline underline-offset-2 hover:text-spark-orange">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function QuestionHub({ topic }: { topic: Topic }) {
  const hasPicks = topic.questions.some((q) => q.picks?.length);
  // The Redodo code note goes with the first answer that picks a Redodo product.
  const redodoQ = topic.questions.find((q) => q.picks?.some((p) => p.brand === "redodo"))?.id;
  const others = TOPICS.filter((t) => t.slug !== topic.slug);
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url(topic.path)}#faq`,
          name: topic.title,
          url: url(topic.path),
          dateModified: QUESTIONS_UPDATED_AT,
          inLanguage: "en-US",
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          mainEntity: topic.questions.map((q) => ({
            "@type": "Question",
            name: q.q,
            url: `${url(topic.path)}#${q.id}`,
            acceptedAnswer: { "@type": "Answer", text: q.a },
          })),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Questions", path: "/questions" },
          { name: topic.nav, path: topic.path },
        ]}
      />
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-3">Questions answered</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">{topic.h1}</h1>
        <p className="text-lg text-stone-600 leading-relaxed max-w-3xl">{topic.intro}</p>
        <p className="text-sm text-muted mt-4">
          Updated <time dateTime={QUESTIONS_UPDATED}>{formatDate(QUESTIONS_UPDATED)}</time>. Every answer lists the sources we read it from. If we
          couldn&apos;t back an answer, we left the question out.
        </p>
      </header>

      <nav aria-label="On this page" className="rounded-xl border border-black/8 bg-surface p-5">
        <p className="font-semibold mb-2">On this page</p>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm">
          {topic.questions.map((q) => (
            <li key={q.id}>
              <a href={`#${q.id}`} className="underline underline-offset-2 hover:text-spark-orange">
                {q.q}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {hasPicks && <AffiliateDisclosure className="mt-6" />}
      {topic.wiring && (
        <div className="mt-6">
          <Callout tone="warn">
            <strong>Home wiring is a job for a licensed electrician.</strong> New circuits, outlets, transfer switches and battery
            connections must meet the National Electrical Code and your local rules, and many need a permit and inspection.
          </Callout>
        </div>
      )}

      {topic.questions.map((q) => (
        <section key={q.id} aria-labelledby={q.id} className="mt-12">
          <h2 id={q.id} className="text-2xl font-bold mb-4 scroll-mt-24">
            <Link href={questionPath(topic, q)} className="hover:text-spark-orange">
              {q.q}
            </Link>
          </h2>
          <QuestionAnswer q={q} redodo={q.id === redodoQ} />
        </section>
      ))}

      <section aria-labelledby="more-questions" className="mt-14">
        <h2 id="more-questions" className="text-xl font-bold mb-3">
          More questions answered
        </h2>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {others.map((t) => (
            <li key={t.slug}>
              <Link href={t.path} className="underline underline-offset-2 hover:text-spark-orange">
                {t.nav}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/questions" className="underline underline-offset-2 hover:text-spark-orange">
              All questions
            </Link>
          </li>
        </ul>
      </section>
      <RelatedLinks links={topic.related} />
      <Disclaimer />
    </article>
  );
}
