import Link from "next/link";
import { formatDate } from "@/lib/energy";
import { AUTHOR, AUTHOR_REF, JsonLd, pageUpdated, url } from "@/lib/seo";

/**
 * "By Geoff Baron · Last updated <date>" under an article's title. The date is
 * the page's content date from ROUTES (src/lib/seo.tsx), so it only moves when
 * the content really changes. Pages that have no Article markup of their own
 * pass `article` and get one here, credited to Geoff.
 */
export default function Byline({
  path,
  updated,
  className = "mb-6",
  tone = "light",
  article,
}: {
  path: string;
  updated?: string;
  className?: string;
  tone?: "light" | "dark";
  article?: { headline: string; description: string };
}) {
  const date = updated ?? pageUpdated(path);
  const dark = tone === "dark";
  return (
    <div className={`flex items-center gap-3 text-sm ${dark ? "text-white/85" : "text-stone-600"} ${className}`} data-testid="byline">
      {article && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            "@id": `${url(path)}#article`,
            headline: article.headline,
            description: article.description,
            url: url(path),
            dateModified: `${date}T12:00:00+00:00`,
            author: AUTHOR_REF,
            publisher: { "@id": url("/#organization") },
            isPartOf: { "@id": url("/#website") },
            mainEntityOfPage: url(path),
          }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={AUTHOR.photo} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" loading="lazy" decoding="async" />
      <p>
        By{" "}
        <Link
          href="/about"
          rel="author"
          className={`font-semibold underline underline-offset-2 ${dark ? "text-white hover:text-amber-300" : "text-foreground hover:text-spark-orange"}`}
        >
          {AUTHOR.name}
        </Link>
        <span aria-hidden="true"> · </span>
        <br className="sm:hidden" />
        Last updated <time dateTime={date}>{formatDate(date)}</time>
      </p>
    </div>
  );
}
