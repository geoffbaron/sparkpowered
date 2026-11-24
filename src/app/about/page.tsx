import type { Metadata } from "next";
import Link from "next/link";
import { IMAGES } from "@/data/images";
import { ABOUT_TEXT } from "@/data/about";
import { Breadcrumbs, Section } from "@/components/content";
import { AUTHOR, JsonLd, pageMetadata, pageUpdated, url } from "@/lib/seo";
import { formatDate } from "@/lib/energy";

const PATH = "/about";
export const metadata: Metadata = pageMetadata({
  title: "About Geoff Baron and Spark Powered",
  description:
    "Who writes Spark Powered, how each answer is researched from makers' manuals and official sources, how mistakes get fixed, and how the site earns money.",
  path: PATH,
});

export default function AboutPage() {
  const updated = pageUpdated(PATH);
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${url(PATH)}#webpage`,
          url: url(PATH),
          name: "About Geoff Baron and Spark Powered",
          dateModified: `${updated}T12:00:00+00:00`,
          isPartOf: { "@id": url("/#website") },
          about: { "@id": url("/#organization") },
          mainEntity: { "@id": url("/about#editor") },
        }}
      />
      <Breadcrumbs items={[{ name: "About", path: PATH }]} />

      <header className="mb-10 flex flex-col sm:flex-row gap-6 sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AUTHOR.photoLarge}
          alt="Geoff Baron"
          width={160}
          height={160}
          className="h-40 w-40 rounded-full object-cover shrink-0"
          decoding="async"
        />
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">About Spark Powered</h1>
          <p className="text-sm text-muted mt-2">
            Last updated <time dateTime={updated}>{formatDate(updated)}</time>
          </p>
        </div>
      </header>

      <p className="text-lg text-stone-700 leading-relaxed" data-testid="about-text">
        {ABOUT_TEXT}
      </p>
      <p className="text-stone-700 mt-4">
        Email: <a className="underline text-spark-orange" href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a> ·{" "}
        <Link href="/contact" className="underline">Contact</Link>
      </p>

      <Section title="What the site covers">
        <p className="text-stone-700 leading-relaxed">
          One thing: keeping a US home running in a power outage with a portable power station or home battery. That means how to connect
          one to the house, what it will run and for how long, and which unit fits which job.
        </p>
      </Section>

      <Section title="How each page is checked">
        <ul className="text-stone-700 leading-relaxed list-disc pl-5 space-y-2">
          <li>Specs, outlets and limits come from the maker&apos;s manual, spec sheet or support pages, with the date I read them.</li>
          <li>
            Safety and wiring rules come from official sources: the National Electrical Code, OSHA, the Consumer Product Safety Commission,
            the Department of Energy and utilities.
          </li>
          <li>Where a manual is silent, I may cite owners&apos; own reports on forums, and the page says that is what it is.</li>
          <li>Every page ends with a dated list of its sources. If I couldn&apos;t back an answer, I left it out.</li>
          <li>
            The calculators&apos; formulas and assumptions are on the{" "}
            <Link href="/methodology" className="underline text-spark-orange">methodology page</Link>.
          </li>
        </ul>
      </Section>

      <Section title="Ask Spark">
        <p className="text-stone-700 leading-relaxed">
          The Ask Spark button answers questions with an AI model that works from this site&apos;s pages and links back to them. It can be
          wrong; the pages and their sources are the record.
        </p>
      </Section>

      <Section title="How the site earns money">
        <p className="text-stone-700 leading-relaxed">
          Some product links are affiliate links: if you buy through one, I may earn a commission at no cost to you. They are marked, they sit
          below the answer, and they never decide what a calculator returns. I also name good products from makers that don&apos;t pay me.
          Read the{" "}
          <Link href="/disclaimer#affiliate-disclosure" className="underline">
            full affiliate disclosure
          </Link>
          .
        </p>
      </Section>

      <Section title="Corrections">
        <p className="text-stone-700 leading-relaxed">
          Spotted a number that is wrong or out of date? Email{" "}
          <a className="underline" href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a>. I correct the page itself and its &ldquo;Last
          updated&rdquo; date changes.
        </p>
      </Section>

      <Section title="Photo credits">
        <div id="photo-credits" className="scroll-mt-24">
          <p className="text-stone-700 mb-3">
            Apart from my own photo, photos are from Unsplash, used under the Unsplash License. They are illustrations, not pictures of my gear.
          </p>
          <ul className="text-sm text-stone-700 space-y-1 list-disc pl-5">
            {Object.entries(IMAGES).map(([k, img]) => (
              <li key={k}>
                {img!.alt}:{" "}
                <a href={img!.pageUrl} className="underline" rel="noopener">{img!.credit}</a>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </article>
  );
}
