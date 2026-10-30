import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "@/components/affiliate";
import { Breadcrumbs, Callout, Disclaimer } from "@/components/content";
import { QuestionAnswer } from "@/components/QuestionHub";
import LocalStateLinks from "@/components/LocalStateLinks";
import { ALL_QUESTIONS, guideFor, questionDescription, questionPath, relatedQuestions } from "@/data/questions";
import { formatDate } from "@/lib/energy";
import { JsonLd, QUESTIONS_UPDATED, QUESTIONS_UPDATED_AT, pageMetadata, url } from "@/lib/seo";

/** One page per answered question, at /questions/<hub>/<anchor id>. Unknown ids 404 via notFound(). */
export function generateStaticParams() {
  return ALL_QUESTIONS.map(({ topic, question }) => ({ topic: topic.slug, question: question.id }));
}

type Props = { params: Promise<{ topic: string; question: string }> };

function find(topic: string, question: string) {
  return ALL_QUESTIONS.find((x) => x.topic.slug === topic && x.question.id === question);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic, question } = await params;
  const hit = find(topic, question);
  if (!hit) return {};
  return pageMetadata({
    title: hit.question.q,
    description: questionDescription(hit.question),
    path: questionPath(hit.topic, hit.question),
    type: "article",
  });
}

export default async function QuestionPage({ params }: Props) {
  const { topic: topicSlug, question: questionId } = await params;
  const hit = find(topicSlug, questionId);
  if (!hit) notFound();
  const { topic, question: q } = hit;
  const path = questionPath(topic, q);
  const related = relatedQuestions(topic, q);
  const guide = guideFor(topic, q);
  const hasPicks = Boolean(q.picks?.length);
  // Questions whose answer depends on the state: link the state pages with checked local details.
  const stateBound = topic.slug === "costs-and-incentives" || Boolean(q.tools?.some((t) => t.href.startsWith("/states") || t.href === "/incentives" || t.href.startsWith("/solar-calculator") || t.href.startsWith("/ev-charging-cost")));
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url(path)}#faq`,
          name: q.q,
          url: url(path),
          dateModified: QUESTIONS_UPDATED_AT,
          inLanguage: "en-US",
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          mainEntity: [
            {
              "@type": "Question",
              name: q.q,
              url: url(path),
              acceptedAnswer: { "@type": "Answer", text: q.a, url: url(path) },
            },
          ],
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Questions", path: "/questions" },
          { name: topic.nav, path: topic.path },
          { name: q.q, path },
        ]}
      />
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-3">
          <Link href={topic.path} className="hover:text-spark-orange">
            Questions answered: {topic.nav}
          </Link>
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">{q.q}</h1>
        <p className="text-sm text-muted">
          Updated <time dateTime={QUESTIONS_UPDATED}>{formatDate(QUESTIONS_UPDATED)}</time>. Every answer lists the sources we read it from. If we
          couldn&apos;t back an answer, we left the question out.
        </p>
      </header>

      {hasPicks && <AffiliateDisclosure className="mb-6" />}
      {topic.wiring && (
        <div className="mb-6">
          <Callout tone="warn">
            <strong>Home wiring is a job for a licensed electrician.</strong> New circuits, outlets, transfer switches and battery
            connections must meet the National Electrical Code and your local rules, and many need a permit and inspection.
          </Callout>
        </div>
      )}

      <QuestionAnswer q={q} redodo={Boolean(q.picks?.some((p) => p.brand === "redodo"))} />

      {stateBound && <LocalStateLinks />}

      <section aria-labelledby="related-questions" className="mt-14">
        <h2 id="related-questions" className="text-xl font-bold mb-3">
          Related questions
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm">
          {related.map((r) => (
            <li key={r.id}>
              <Link href={questionPath(topic, r)} className="underline underline-offset-2 hover:text-spark-orange">
                {r.q}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href={topic.path} className="underline underline-offset-2 hover:text-spark-orange">
            All {topic.questions.length} questions on {topic.nav.toLowerCase()}
          </Link>
          {" · "}
          <Link href="/questions" className="underline underline-offset-2 hover:text-spark-orange">
            Every question we answer
          </Link>
        </p>
      </section>

      <section aria-labelledby="related-heading" className="mt-14">
        <h2 id="related-heading" className="text-xl font-bold mb-4">
          Keep going
        </h2>
        <Link
          href={guide.href}
          className="block bg-surface rounded-xl border border-black/8 p-4 hover:border-amber-300 hover:shadow-sm transition max-w-md"
        >
          <span className="font-semibold text-foreground">{guide.label}</span>
          {guide.desc && <span className="block text-sm text-muted mt-1">{guide.desc}</span>}
        </Link>
      </section>
      <Disclaimer />
    </article>
  );
}
