import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/content";
import { AUTHOR, JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/contact";
export const metadata: Metadata = pageMetadata({
  title: "Contact Spark Powered",
  description: "Email Geoff Baron, who writes Spark Powered, with corrections, questions or anything a page got wrong.",
  path: PATH,
});

export default function ContactPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "@id": `${url(PATH)}#webpage`,
          url: url(PATH),
          name: "Contact Spark Powered",
          isPartOf: { "@id": url("/#website") },
          mainEntity: { "@id": url("/about#editor") },
        }}
      />
      <Breadcrumbs items={[{ name: "Contact", path: PATH }]} />
      <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">Contact</h1>
      <p className="text-lg text-stone-700 leading-relaxed">
        Email me, Geoff Baron, at{" "}
        <a className="font-semibold underline text-spark-orange" href={`mailto:${AUTHOR.email}`}>
          {AUTHOR.email}
        </a>
        .
      </p>
      <p className="text-stone-700 leading-relaxed mt-4">
        Corrections are the most useful thing you can send: tell me the page and what is wrong, and if you can, where the right figure comes
        from (a manual page, a spec sheet, a code section). I fix the page and change its date. I can&apos;t give advice on your own wiring;
        for that, please ask a licensed electrician.
      </p>
      <p className="text-stone-700 mt-4">
        <Link href="/about" className="underline">About me and how the site is checked</Link>
      </p>
    </article>
  );
}
