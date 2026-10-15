import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageIntro, RelatedLinks } from "@/components/content";
import { COMPARISONS } from "@/data/comparisons";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/compare";
const TITLE = "Portable Power Station & Home Battery Comparisons";
const DESCRIPTION =
  "Side-by-side comparisons of EcoFlow, Anker SOLIX, Jackery and Bluetti power stations and home batteries, using the makers' published specs and current prices.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function CompareIndex() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${url(PATH)}#page`,
          name: TITLE,
          description: DESCRIPTION,
          url: url(PATH),
          isPartOf: { "@id": url("/#website") },
          hasPart: COMPARISONS.map((c) => ({ "@type": "Article", headline: c.title, url: url(`/compare/${c.slug}`) })),
        }}
      />
      <Breadcrumbs items={[{ name: "Comparisons", path: PATH }]} />
      <PageIntro
        eyebrow="Comparisons"
        title="Power station and home battery comparisons"
        lede="The match-ups people search for most, compared on the specs that matter: capacity, output, battery chemistry, expansion, solar input, warranty and price per kWh."
      />
      <ul className="grid sm:grid-cols-2 gap-3">
        {COMPARISONS.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/compare/${c.slug}`}
              className="block h-full bg-surface rounded-xl border border-black/8 p-5 hover:border-amber-300 hover:shadow-sm transition"
            >
              <span className="font-semibold text-foreground">{c.title}</span>
              <span className="block text-sm text-muted mt-1">{c.description}</span>
            </Link>
          </li>
        ))}
      </ul>
      <RelatedLinks
        links={[
          { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Full spec table and picks by use" },
          { href: "/home-battery-backup", label: "Home battery backup", desc: "Whole-home vs portable, real costs" },
          { href: "/plug-in-solar", label: "Plug-in solar", desc: "Balcony solar kits and state rules" },
          { href: "/battery-calculator", label: "Battery sizer", desc: "How many kWh you need" },
        ]}
      />
    </div>
  );
}
