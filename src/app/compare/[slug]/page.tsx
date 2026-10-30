import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Breadcrumbs, Disclaimer, PageIntro, RelatedLinks, Section, Sources } from "@/components/content";
import { PriceCell, PriceFootnote, productJson } from "@/components/products";
import { COMPARISONS, comparisonBySlug } from "@/data/comparisons";
import type { Product } from "@/data/products";
import { formatDate } from "@/lib/energy";
import { fullName, kwh, money, perKwh, productById, watts } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = comparisonBySlug(slug);
  if (!c) return {};
  return pageMetadata({ title: c.title, description: c.description, path: `/compare/${c.slug}`, type: "article" });
}

type Row = { label: string; get: (p: Product) => string | number | null; better?: "high" | "low" };

const ROWS: Row[] = [
  { label: "Capacity", get: (p) => p.capacityWh, better: "high" },
  { label: "Continuous AC output", get: (p) => p.acOutputW, better: "high" },
  { label: "Surge / peak", get: (p) => p.surgeW, better: "high" },
  { label: "Battery chemistry", get: (p) => p.chemistry },
  // Shown with the end point (makers rate to 70% or 80%), so not ranked.
  { label: "Rated cycles", get: (p) => (p.cycles ? `${p.cycles.toLocaleString("en-US")}${p.cyclesTo ? ` to ${p.cyclesTo}%` : ""}` : null) },
  { label: "Weight (lb)", get: (p) => p.weightLb, better: "low" },
  { label: "Expands to", get: (p) => p.maxCapacityWh ?? (p.notExpandable ? "No" : null), better: "high" },
  { label: "Max solar input", get: (p) => p.solarInputW, better: "high" },
  { label: "AC outlets", get: (p) => p.acOutlets, better: "high" },
  { label: "UPS switchover", get: (p) => p.upsMs, better: "low" },
  { label: "Voltage", get: (p) => p.volts },
  { label: "Warranty (years)", get: (p) => p.warrantyYears, better: "high" },
  { label: "Price on maker's site*", get: (p) => p.priceUsd, better: "low" },
  { label: "Price per kWh", get: (p) => (perKwh(p) ? Math.round(perKwh(p)!) : null), better: "low" },
];

function show(label: string, v: string | number | null): string {
  if (v == null) return "Not stated";
  if (typeof v === "string") return v;
  if (label === "Capacity" || label === "Expands to") return kwh(v);
  if (label.includes("output") || label.includes("Surge") || label.includes("solar")) return watts(v);
  if (label.startsWith("Price")) return money(v);
  if (label === "UPS switchover") return `${v} ms`;
  return v.toLocaleString("en-US");
}

function PairTable({ a, b, label }: { a: Product; b: Product; label?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
      <table className="w-full text-sm">
        <caption className="sr-only">
          {fullName(a)} versus {fullName(b)} specifications{label ? `, ${label}` : ""}
        </caption>
        <thead className="bg-surface-light text-left">
          <tr>
            <th scope="col" className="p-3 font-semibold w-1/3">Spec</th>
            <th scope="col" className="p-3 font-semibold">{fullName(a)}</th>
            <th scope="col" className="p-3 font-semibold">{fullName(b)}</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => {
            const va = r.get(a);
            const vb = r.get(b);
            const win =
              r.better && typeof va === "number" && typeof vb === "number" && va !== vb
                ? (r.better === "high" ? va > vb : va < vb)
                  ? "a"
                  : "b"
                : null;
            return (
              <tr key={r.label} className="border-t border-black/6">
                <th scope="row" className="p-3 font-medium text-stone-700">{r.label}</th>
                <td className={`p-3 tabular-nums ${win === "a" ? "font-bold text-green-800" : ""}`}>
                  {r.label.startsWith("Price on") ? <PriceCell p={a} /> : show(r.label, va)}
                </td>
                <td className={`p-3 tabular-nums ${win === "b" ? "font-bold text-green-800" : ""}`}>
                  {r.label.startsWith("Price on") ? <PriceCell p={b} /> : show(r.label, vb)}
                </td>
              </tr>
            );
          })}
          <tr className="border-t border-black/6">
            <th scope="row" className="p-3 font-medium text-stone-700">Where to buy</th>
            {[a, b].map((p) => (
              <td key={p.id} className="p-3">
                <PartnerLink brand={p.brand} productId={p.id} productUrl={p.url} category="battery">
                  {fullName(p)} at {fullName(p).split(" ")[0]}
                </PartnerLink>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const c = comparisonBySlug(slug);
  if (!c) notFound();
  const path = `/compare/${c.slug}`;
  const pairs = c.pairs.map(([x, y]) => [productById(x), productById(y)] as const);
  const all = pairs.flat();
  const others = COMPARISONS.filter((o) => o.slug !== c.slug);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${url(path)}#article`,
          headline: c.title,
          description: c.description,
          url: url(path),
          dateModified: c.updated,
          author: { "@id": url("/about#editor") },
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          about: all.map((p) => productJson(p, path, c.updated)),
        }}
      />
      <Breadcrumbs items={[{ name: "Comparisons", path: "/compare" }, { name: c.title, path }]} />
      <PageIntro eyebrow="Head to head" title={c.title} lede={c.intro} />
      <p className="text-sm text-muted -mt-6 mb-6">
        Specs and prices from the manufacturers&apos; US sites, checked <time dateTime={c.updated}>{formatDate(c.updated)}</time>.
      </p>
      <AffiliateDisclosure className="mb-8" />

      <section aria-labelledby="verdict" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <h2 id="verdict" className="text-xl font-bold mb-2">The short answer</h2>
        <p className="text-stone-800 leading-relaxed">{c.verdict}</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
          <p className="bg-white/70 rounded-xl p-4 border border-black/6">{c.chooseA}</p>
          <p className="bg-white/70 rounded-xl p-4 border border-black/6">{c.chooseB}</p>
        </div>
        {c.see && (
          <p className="mt-4 text-sm">
            <Link href={`/compare/${c.see.slug}`} className="underline underline-offset-2 text-spark-orange font-medium">{c.see.label}</Link>
          </p>
        )}
      </section>

      {pairs.map(([a, b], i) => (
        <Section
          key={a.id + b.id}
          title={c.pairLabels?.[i] ? `${c.pairLabels[i]}: ${fullName(a)} vs ${fullName(b)}` : "Specs side by side"}
        >
          <PairTable a={a} b={b} label={c.pairLabels?.[i]} />
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {[a, b].map((p) => (
              <div key={p.id} className="bg-surface rounded-xl border border-black/8 p-4">
                <h3 className="font-semibold mb-2">{fullName(p)}: worth knowing</h3>
                <ul className="list-disc pl-5 text-sm text-stone-700 space-y-1">
                  {p.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      ))}
      <p className="text-xs text-muted mt-3">Bold green marks the better figure where higher or lower is clearly better.</p>
      <PriceFootnote products={all} />

      <Section title="How we compared">
        <p className="text-stone-700 leading-relaxed max-w-3xl">
          We compare only figures the manufacturers publish for their US models, and we link each one below. We have
          not lab-tested these units. Capacity is the rated battery capacity; usable AC energy is lower, typically by
          10 to 20 percent, because of inverter losses. Cycle ratings are each maker&apos;s claim to its own
          end point. See{" "}
          <Link href="/best-portable-power-stations#how-we-chose" className="underline underline-offset-2">
            how we choose products
          </Link>
          .
        </p>
      </Section>

      <Disclaimer>
        Specifications and prices are copied from manufacturer websites on the date shown and change often. Confirm
        them with the seller before buying.
      </Disclaimer>
      <Sources
        items={all
          .filter((p, i) => all.findIndex((x) => x.id === p.id) === i)
          .map((p) => ({ name: `${fullName(p)} product page`, url: p.sourceUrl, detail: `checked ${formatDate(p.retrieved)}` }))}
      />
      <RelatedLinks
        links={[
          { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Every model we track, in one table" },
          { href: "/battery-calculator", label: "Battery sizer", desc: "Work out how many kWh you actually need" },
          ...others.slice(0, 4).map((o) => ({ href: `/compare/${o.slug}`, label: o.title, desc: o.pairs.length > 1 ? "Brand line-ups compared size for size" : "Specs, prices and a verdict" })),
        ]}
      />
    </article>
  );
}
