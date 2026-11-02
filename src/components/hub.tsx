import Link from "next/link";
import { Prose, Section } from "@/components/content";
import { HubHero, PhotoCredit } from "@/components/ui";
import { HUBS, type Hub } from "@/data/hubs";
import { TOPICS } from "@/data/questions";
import { JsonLd, url } from "@/lib/seo";

/** Opening of a short answer, for a teaser that sends the reader to the full one. A clipped "No." says too little, so take a second sentence then. */
function firstSentence(text: string) {
  const sentences = text.match(/.+?[.!?](?=\s+[A-Z0-9]|$)/g) ?? [text];
  const first = sentences[0].trim();
  return first.length < 60 && sentences[1] ? `${first} ${sentences[1].trim()}` : first;
}

function hubQuestions(hub: Hub) {
  const skip = new Set(hub.skipQuestions ?? []);
  return (hub.questionTopics ?? []).flatMap((slug) => {
    const topic = TOPICS.find((t) => t.slug === slug);
    if (!topic) throw new Error(`Unknown question topic ${slug}`);
    return topic.questions
      .filter((q) => !skip.has(q.id))
      .map((q) => ({ q: q.q, teaser: firstSentence(q.a), href: `${topic.path}#${q.id}` }));
  });
}

/** Landing page for one main nav section: start here, every guide grouped by goal, common questions. */
export function HubLanding({ hub }: { hub: Hub }) {
  const questions = hubQuestions(hub);
  const others = HUBS.filter((h) => h.id !== hub.id);
  const allLinks = hub.groups.flatMap((g) => g.links);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${url(hub.path)}#page`,
          url: url(hub.path),
          name: hub.title,
          description: hub.description,
          dateModified: hub.updated,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: allLinks.map((l, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: l.title,
              url: url(l.href),
            })),
          },
        }}
      />
      <HubHero
        image={hub.image}
        crumbs={[{ name: hub.name, path: hub.path }]}
        eyebrow={hub.eyebrow}
        title={<>{hub.h1} <span className="text-amber-300">{hub.h1Accent}</span></>}
        sub={hub.sub}
      >
        <Link href={hub.start.href} className="btn btn-primary" data-umami-event="hub_start" data-umami-event-hub={hub.id}>
          {hub.start.label}
        </Link>
        <a href="#guides" className="btn btn-light">See every guide</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href={hub.start.href}
          className="block rounded-2xl border-2 border-spark-orange/40 bg-amber-50 p-6 hover:border-spark-orange transition-colors"
          data-umami-event="hub_start_card"
          data-umami-event-hub={hub.id}
        >
          <span className="text-xs font-bold uppercase tracking-wide text-spark-orange">Start here</span>
          <span className="block text-xl font-extrabold text-ink mt-1">{hub.start.label}</span>
          <span className="block text-stone-700 mt-1 max-w-3xl">{hub.start.why}</span>
        </Link>

        <div className="mt-10">
          <Prose>
            {hub.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </Prose>
        </div>

        <div id="guides" className="scroll-mt-24">
          {hub.groups.map((g) => (
            <Section key={g.heading} title={g.heading}>
              {g.blurb && <p className="text-stone-600 -mt-2 mb-4 max-w-3xl">{g.blurb}</p>}
              <ul className="grid sm:grid-cols-2 gap-4">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex h-full flex-col rounded-2xl bg-white border border-black/8 p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <span className="text-xs font-semibold text-muted">{l.kind}</span>
                      <span className="font-extrabold text-ink mt-0.5">{l.title}</span>
                      <span className="text-sm text-stone-600 mt-1">{l.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ))}
        </div>

        {(questions.length > 0 || hub.pageQuestions?.length) && (
          <Section title="Questions people ask" id="questions">
            <ul className="divide-y divide-black/8 rounded-2xl border border-black/8 bg-white">
              {questions.map((q) => (
                <li key={q.href} className="p-5">
                  <Link href={q.href} className="font-bold text-ink hover:text-spark-orange">{q.q}</Link>
                  <p className="text-sm text-stone-600 mt-1">
                    {q.teaser}{" "}
                    <Link href={q.href} className="underline underline-offset-2 hover:text-spark-orange">Full answer</Link>
                  </p>
                </li>
              ))}
              {hub.pageQuestions?.map((q) => (
                <li key={q.q} className="p-5">
                  <Link href={q.href} className="font-bold text-ink hover:text-spark-orange">{q.q}</Link>
                  <p className="text-sm text-stone-600 mt-1">Answered in: {q.answeredBy}</p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="More from Spark Powered">
          <ul className="grid sm:grid-cols-2 gap-4">
            {others.map((h) => (
              <li key={h.id}>
                <Link href={h.path} className="block h-full rounded-2xl bg-surface-light border border-black/8 p-5 hover:border-spark-orange transition-colors">
                  <span className="block font-extrabold text-ink">{h.name}</span>
                  <span className="block text-sm text-stone-600 mt-1">{h.sub}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <PhotoCredit name={hub.image} />
      </div>
    </article>
  );
}
