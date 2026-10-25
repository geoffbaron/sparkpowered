import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageIntro } from "@/components/content";
import { QUESTION_COUNT, TOPICS } from "@/data/questions";
import { JsonLd, QUESTIONS_UPDATED, pageMetadata, url } from "@/lib/seo";

const PATH = "/questions";
const TITLE = "Going Electric at Home: Questions Answered With Sources";
const DESCRIPTION =
  "Straight, sourced answers to the questions people search most about saving money going electric: home solar, home batteries and power stations, EV charging at home, trolling motors and electric boats, heat pumps and 2026 tax credits.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function QuestionsIndex() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${url(PATH)}#page`,
          name: TITLE,
          description: DESCRIPTION,
          url: url(PATH),
          dateModified: QUESTIONS_UPDATED,
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          hasPart: TOPICS.map((t) => ({ "@type": "WebPage", name: t.title, url: url(t.path) })),
        }}
      />
      <Breadcrumbs items={[{ name: "Questions", path: PATH }]} />
      <PageIntro
        eyebrow="Questions answered"
        title="Going electric at home: your questions, answered"
        lede={
          <>
            We read the search boxes and the forums, picked the {QUESTION_COUNT} questions that come up again and again, and answered
            each one from the people who should know: the IRS, the Department of Energy, EIA price data, NREL&apos;s solar model, and
            the makers&apos; own manuals and spec sheets. Short answer first, then the numbers, then the sources. If we couldn&apos;t
            back an answer, we left the question out.
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <section key={t.slug} className="rounded-xl border border-black/8 bg-surface p-5">
            <h2 className="font-bold text-lg mb-2">
              <Link href={t.path} className="hover:text-spark-orange">
                {t.nav}
              </Link>
            </h2>
            <ul className="space-y-1.5 text-sm">
              {t.questions.map((q) => (
                <li key={q.id}>
                  <Link href={`${t.path}#${q.id}`} className="underline underline-offset-2 hover:text-spark-orange">
                    {q.q}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-8 text-sm text-stone-600">
        Want your own numbers? The{" "}
        <Link href="/go-electric" className="underline underline-offset-2 hover:text-spark-orange">
          Go Electric planner
        </Link>{" "}
        works out what each switch saves in your state. Wiring a van, RV or boat instead? Our sister site{" "}
        <a href="https://campervolts.com/questions" className="underline underline-offset-2 hover:text-spark-orange">
          CamperVolts answers camper electrical questions
        </a>
        .
      </p>
    </div>
  );
}
