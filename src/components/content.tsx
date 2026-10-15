/**
 * Building blocks for the explainer, data and guide pages. Each one emits the
 * visible markup and, where it applies, the matching structured data, so a page
 * can never show an FAQ or breadcrumb trail that search engines don't also see.
 */

import Link from "next/link";
import { JsonLd, url } from "@/lib/seo";
import { formatDate } from "@/lib/energy";

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: url(c.path),
          })),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted mb-6">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((c, i) => (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page" className="text-foreground">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="hover:text-spark-orange underline-offset-2 hover:underline">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export function PageIntro({
  eyebrow,
  title,
  lede,
  updated,
}: {
  eyebrow?: string;
  title: string;
  lede: React.ReactNode;
  updated?: string;
}) {
  return (
    <header className="mb-10">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-3">{eyebrow}</p>
      )}
      <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">{title}</h1>
      <div className="text-lg text-stone-600 leading-relaxed max-w-3xl">{lede}</div>
      {updated && (
        <p className="text-sm text-muted mt-4">
          Data updated <time dateTime={updated}>{formatDate(updated)}</time> ·{" "}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-spark-orange">
            How we calculate this
          </Link>
        </p>
      )}
    </header>
  );
}

export interface FaqItem {
  q: string;
  /** Plain-text answer. Also published verbatim as FAQPage structured data. */
  a: string;
}

export function Faq({
  items,
  path,
  id = "faq",
  heading = "Frequently asked questions",
}: {
  items: FaqItem[];
  /** Site path of the page the FAQ sits on, for the structured-data @id. */
  path: string;
  id?: string;
  heading?: string;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="mt-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url(path)}#${id}`,
          mainEntity: items.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <h2 id={`${id}-heading`} className="text-2xl font-bold mb-5">
        {heading}
      </h2>
      <div className="space-y-3">
        {items.map((f) => (
          <details key={f.q} className="group bg-surface rounded-xl border border-black/8">
            <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none">
              <h3 className="font-semibold text-base">{f.q}</h3>
              <span
                aria-hidden="true"
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-amber-100 text-spark-orange font-bold group-open:rotate-45 transition-transform"
              >
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-stone-700 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export interface SourceRef {
  name: string;
  url: string;
  detail?: string;
}

export function Sources({ items }: { items: SourceRef[] }) {
  return (
    <section aria-labelledby="sources-heading" className="mt-14 border-t border-black/8 pt-8">
      <h2 id="sources-heading" className="text-lg font-bold mb-3">
        Sources
      </h2>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-stone-700">
        {items.map((s) => (
          <li key={s.url + s.name}>
            <a href={s.url} className="underline underline-offset-2 hover:text-spark-orange" rel="noopener">
              {s.name}
            </a>
            {s.detail && <span className="text-muted"> — {s.detail}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose-sp text-stone-700 leading-relaxed space-y-4 max-w-3xl">{children}</div>
  );
}

export function Section({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </section>
  );
}

export function Callout({
  tone = "note",
  children,
}: {
  tone?: "note" | "warn";
  children: React.ReactNode;
}) {
  const cls =
    tone === "warn"
      ? "bg-amber-50 border-amber-300 text-amber-950"
      : "bg-sky-50 border-sky-200 text-sky-950";
  return <div className={`rounded-xl border p-5 text-sm leading-relaxed ${cls}`}>{children}</div>;
}

export function StatGrid({ stats }: { stats: { label: string; value: string; note?: string }[] }) {
  return (
    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface rounded-xl border border-black/8 p-4">
          <dt className="text-xs font-medium text-muted">{s.label}</dt>
          <dd className="text-2xl font-extrabold mt-1">{s.value}</dd>
          {s.note && <dd className="text-xs text-muted mt-1">{s.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function RelatedLinks({ links }: { links: { href: string; label: string; desc: string }[] }) {
  return (
    <section aria-labelledby="related-heading" className="mt-14">
      <h2 id="related-heading" className="text-xl font-bold mb-4">
        Keep going
      </h2>
      <ul className="grid sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block h-full bg-surface rounded-xl border border-black/8 p-4 hover:border-amber-300 hover:shadow-sm transition"
            >
              <span className="font-semibold text-foreground">{l.label}</span>
              <span className="block text-sm text-muted mt-1">{l.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Disclaimer({ children }: { children?: React.ReactNode }) {
  return (
    <p className="mt-10 text-xs text-muted leading-relaxed max-w-3xl">
      {children ??
        "Estimates only. Your actual costs depend on your utility's rate plan, how and when you charge or use power, and local prices. This is general information, not financial, tax or legal advice."}{" "}
      See our{" "}
      <Link href="/disclaimer" className="underline underline-offset-2">
        disclaimer
      </Link>
      .
    </p>
  );
}
