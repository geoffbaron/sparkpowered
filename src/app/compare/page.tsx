import type { Metadata } from "next";
import Link from "next/link";
import Byline from "@/components/Byline";
import { Breadcrumbs, PageIntro, RelatedLinks } from "@/components/content";
import { COMPARISONS } from "@/data/comparisons";
import { liveHomeBackupPages } from "@/data/home-backup";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/compare";
const TITLE = "Home Backup Power Station Comparisons";
const DESCRIPTION =
  "Side-by-side comparisons of EcoFlow, Anker SOLIX, Jackery and Bluetti power stations and home batteries, using the makers' published specs, with links to each maker's page for today's price.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function CompareIndex() {
  // Hand-built home-backup comparisons (their own routes, not the [slug] template).
  const extra = liveHomeBackupPages().filter((p) => p.kind === "compare").map((p) => ({ slug: p.href.replace("/compare/", ""), title: p.title, description: p.desc }));
  const all = [...COMPARISONS.map((c) => ({ slug: c.slug, title: c.title, description: c.description })), ...extra];
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
          hasPart: all.map((c) => ({ "@type": "Article", headline: c.title, url: url(`/compare/${c.slug}`) })),
        }}
      />
      <Breadcrumbs items={[{ name: "Comparisons", path: PATH }]} />
      <PageIntro
        eyebrow="Comparisons"
        title="Power station and home battery comparisons"
        lede="The match-ups people search for most, compared on the specs that matter: capacity, output, battery chemistry, expansion, solar input, warranty and price per kWh."
      />
      <Byline path={PATH} />
      <ul className="grid sm:grid-cols-2 gap-3">
        {all.map((c) => (
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
          { href: "/home-battery-backup", label: "Home battery backup", desc: "Whole-home vs portable, real costs" },
          { href: "/battery-calculator", label: "Battery sizer", desc: "How many kWh you need" },
        ]}
      />
    </div>
  );
}
