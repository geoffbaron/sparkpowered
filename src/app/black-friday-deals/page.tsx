import type { Metadata } from "next";
import Link from "next/link";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Faq, RelatedLinks, Section } from "@/components/content";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import type { BrandId } from "@/data/affiliates";
import { JsonLd, pageMetadata, url } from "@/lib/seo";
import { formatDate } from "@/lib/energy";

const PATH = "/black-friday-deals";
const UPDATED = "2026-11-24";
const TITLE = "Black Friday 2026: Each Maker's Own Power Station and E-Bike Sale Page";
const DESCRIPTION =
  "Links to the Black Friday sale pages of Anker SOLIX, Bluetti and Himiway, straight from each maker's US store. We don't list prices; check them on the maker's page, then size your battery with our free tools.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

/** Each maker's own sale page. No prices and no dates here: both live on the maker's site. */
const SALE_PAGES: { brand: BrandId; name: string; what: string; url: string }[] = [
  { brand: "anker", name: "Anker SOLIX", what: "Portable power stations and home backup (C1000, C2000, F3000, F3800 Plus)", url: "https://www.ankersolix.com/black-friday-pps" },
  { brand: "bluetti", name: "Bluetti", what: "Portable power stations and home backup (Elite series, Apex 300)", url: "https://www.bluettipower.com/pages/black-friday" },
  { brand: "himiway", name: "Himiway", what: "Electric bikes (A7 Pro, D5, D5 ST)", url: "https://himiwaybike.com/pages/black-friday" },
];

export default function BlackFridayDealsPage() {
  const faqs = [
    {
      q: "Are Black Friday power station deals real?",
      a: "Some are. Makers often show a crossed-out \"was\" price that is higher than what they charged in recent weeks. Compare the sale price with what the same store charged a month earlier before you count it as a saving.",
    },
    {
      q: "Why don't you list the prices?",
      a: "Prices change daily during sales, and an out-of-date price is worse than none. Each link goes to the maker's own page, where the price is current.",
    },
    {
      q: "Which power station should I get for outages?",
      a: "Start with what you need to run. Our power outage backup calculator adds up your fridge, Wi-Fi, CPAP or sump pump and tells you the battery size; buy the smallest unit that covers it. A sale doesn't change our picks.",
    },
  ];

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${url(PATH)}#article`,
          headline: TITLE,
          description: DESCRIPTION,
          url: url(PATH),
          datePublished: "2026-11-14",
          dateModified: UPDATED,
          author: { "@id": url("/#organization") },
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          mainEntityOfPage: url(PATH),
        }}
      />
      <HubHero
        image="power-station"
        crumbs={[{ name: "Black Friday deals", path: PATH }]}
        eyebrow="Black Friday 2026"
        title={<>Black Friday sales, <span className="text-amber-300">straight from each maker.</span></>}
        sub={<>The makers&apos; own sale pages, in one place. Pick the right size first, then check the price on the maker&apos;s site.</>}
      >
        <a href="#sale-pages" className="btn btn-primary">Sale pages</a>
        <Link href="/power-outage-backup-calculator" className="btn btn-light">Size your battery</Link>
      </HubHero>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Updated <time dateTime={UPDATED}>{formatDate(UPDATED)}</time>
        </p>
        <QuickAnswer>
          <p>
            Anker SOLIX, Bluetti and Himiway each run a Black Friday page on their US store. We link to them below. We don&apos;t list prices:
            they change daily during sales, so check them on the maker&apos;s page.
          </p>
        </QuickAnswer>
        <AffiliateDisclosure className="mt-6" />

        <Section title="Each maker's sale page" id="sale-pages">
          <ul className="grid gap-4 sm:grid-cols-3">
            {SALE_PAGES.map((s) => (
              <li key={s.brand} className="rounded-2xl border border-black/8 bg-surface p-5" data-sale={s.brand}>
                <h3 className="text-lg font-bold text-ink">{s.name}</h3>
                <p className="text-sm text-stone-600 mt-1">{s.what}</p>
                <div className="mt-3">
                  <PartnerLink brand={s.brand} productUrl={s.url} variant="button" disclose>
                    See {s.name}&apos;s sale
                  </PartnerLink>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Before you buy" id="method">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <p>
              Size it first. The <Link href="/power-outage-backup-calculator" className="underline">power outage backup calculator</Link> and{" "}
              <Link href="/best-portable-power-stations" className="underline">our power station guide</Link> show what each unit can run. A
              sale never moves a product into our picks.
            </p>
            <p>We earn a commission from these brands when you buy through our links. It costs you nothing extra.</p>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <RelatedLinks
          links={[
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "What size battery your fridge, Wi-Fi and medical devices need" },
            { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Picks by use and a full spec table" },
            { href: "/e-bikes", label: "E-bikes", desc: "Range, weight and motor compared" },
            { href: "/home-battery-backup", label: "Home battery backup", desc: "When a portable unit is enough and when it isn't" },
          ]}
        />
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
