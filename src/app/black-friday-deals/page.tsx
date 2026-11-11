import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Faq, RelatedLinks, Section } from "@/components/content";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { BLACK_FRIDAY_2026, dealVerdict, liveDeals, type Deal } from "@/data/deals";
import { ebikeById } from "@/data/ebikes";
import { requestTimeMs } from "@/data/sales";
import { JsonLd, pageMetadata, url } from "@/lib/seo";
import { formatDate } from "@/lib/energy";
import { kwh, money, productById, watts } from "@/lib/products";

const PATH = "/black-friday-deals";
const UPDATED = "2026-11-11";
const TITLE = "Black Friday 2026 Power Station and E-Bike Deals, Checked Against Our Price Log";
const DESCRIPTION =
  "Black Friday power station and e-bike deals from Anker SOLIX, Bluetti, Growatt and Himiway, read on each maker's store and compared with the prices we logged in October. See which deals are real and which were cheaper last month.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

function specLine(d: Deal): string {
  if (d.kind === "power-station") {
    const p = productById(d.productId);
    const parts = [kwh(p.capacityWh), `${watts(p.acOutputW)} output`, p.volts === "120/240V" ? "120/240 V" : "120 V"];
    if (p.chemistry) parts.push(p.chemistry);
    if (p.warrantyYears) parts.push(`${p.warrantyYears}-year warranty`);
    return parts.join(" · ");
  }
  const b = ebikeById(d.productId);
  const parts = [b.batteryWh ? `${b.batteryWh.toLocaleString("en-US")} Wh battery` : null, b.motorW ? `${b.motorW} W motor` : null, b.rangeMiles ? `${b.rangeMiles} mi claimed range` : null, b.class ? `Class ${b.class}` : null];
  return parts.filter(Boolean).join(" · ");
}

function Verdict({ d }: { d: Deal }) {
  const v = dealVerdict(d);
  if (v.kind === "lowest")
    return <p className="text-sm font-semibold text-emerald-800">Lowest price in our log (we last saw {money(d.log[d.log.length - 1].usd)} on {formatDate(d.log[d.log.length - 1].date)}).</p>;
  if (v.kind === "matches")
    return <p className="text-sm font-semibold text-stone-800">Same as the lowest price we&apos;ve logged ({formatDate(v.lowDate!)}). Fine to buy, but not a new low.</p>;
  if (v.kind === "higher")
    return <p className="text-sm font-semibold text-amber-900">Not the best price: we logged {money(v.lowUsd!)} on {formatDate(v.lowDate!)}. Worth waiting to see if it drops again.</p>;
  return <p className="text-sm text-stone-700">First time we&apos;ve logged this one, so we can&apos;t say how it compares.</p>;
}

function DealCard({ d }: { d: Deal }) {
  return (
    <li className="rounded-2xl border border-black/8 bg-surface p-5" data-deal={d.id}>
      <h3 className="text-lg font-bold text-ink">{d.name}</h3>
      <p className="text-sm text-stone-600 mt-0.5">{specLine(d)}</p>
      <p className="mt-3 text-2xl font-extrabold text-ink tabular-nums">
        {money(d.salePriceUsd)}
        {d.makerWasUsd && <span className="ml-2 text-sm font-normal text-stone-600">maker&apos;s &quot;was&quot; price {money(d.makerWasUsd)}</span>}
      </p>
      <div className="mt-1">
        <Verdict d={d} />
      </div>
      {d.howNote && <p className="text-sm text-stone-700 mt-2">{d.howNote}</p>}
      <p className="text-xs text-muted mt-2">
        {d.saleName}, {d.datesLabel}. Price read on the maker&apos;s US store on {formatDate(d.checked)}; it can change.
      </p>
      <div className="mt-3">
        <PartnerLink brand={d.brand} productUrl={d.url} variant="button" disclose>
          See it on the maker&apos;s site
        </PartnerLink>
      </div>
    </li>
  );
}

async function LiveDeals() {
  await connection();
  const now = requestTimeMs();
  const live = liveDeals(now);
  if (live.length === 0)
    return (
      <Callout>
        None of the sales we checked are on right now. We add deals here only when the maker publishes an end date and we&apos;ve read the price
        ourselves. Meanwhile, <Link href="/best-portable-power-stations" className="underline">our power station picks</Link> show current
        prices.
      </Callout>
    );
  const order = { lowest: 0, matches: 1, new: 2, higher: 3 } as const;
  const sorted = (kind: Deal["kind"]) => live.filter((d) => d.kind === kind).sort((a, b) => order[dealVerdict(a).kind] - order[dealVerdict(b).kind]);
  const lows = live.filter((d) => dealVerdict(d).kind === "lowest");
  const higher = live.filter((d) => dealVerdict(d).kind === "higher");
  const stations = sorted("power-station");
  const bikes = sorted("ebike");
  return (
    <>
      <QuickAnswer>
        <p>
          {lows.length > 0 ? (
            <>
              Real lows right now:{" "}
              {lows.map((d, i) => (
                <span key={d.id}>
                  {i > 0 && (i === lows.length - 1 ? " and " : ", ")}
                  the {d.name} at {money(d.salePriceUsd)} (through {d.endsLabel})
                </span>
              ))}
              .{" "}
            </>
          ) : (
            <>No deal here beats the lowest price we&apos;ve logged for it. </>
          )}
          {higher.length > 0 && (
            <>
              {higher.length === 1 ? "One deal is" : `${higher.length} deals are`} priced above what the same store charged earlier, so check our
              verdict before you buy.
            </>
          )}
        </p>
      </QuickAnswer>
      <AffiliateDisclosure className="mt-6" />
      {stations.length > 0 && (
        <Section title="Power stations" id="power-stations">
          <ul className="grid gap-4 sm:grid-cols-2">{stations.map((d) => <DealCard key={d.id} d={d} />)}</ul>
        </Section>
      )}
      {bikes.length > 0 && (
        <Section title="E-bikes" id="e-bikes">
          <ul className="grid gap-4 sm:grid-cols-2">{bikes.map((d) => <DealCard key={d.id} d={d} />)}</ul>
        </Section>
      )}
    </>
  );
}

export default function BlackFridayDealsPage() {
  const brands = [...new Set(BLACK_FRIDAY_2026.map((d) => d.saleName))];
  const faqs = [
    {
      q: "Are Black Friday power station deals real?",
      a: "Some are. Makers show a crossed-out \"was\" price that is often higher than what they charged in recent weeks. We compare each sale price with the prices we read on the same store in October and early November. When we checked on Nov 11, Bluetti's Apex 300 and Growatt's HELIOS 3600 were at or below the lowest prices we'd logged, while Anker's C1000 Gen 2, C2000 Gen 2 and F3000 had been cheaper on Oct 26 than in Anker's early Black Friday sale.",
    },
    {
      q: "When do these Black Friday sales end?",
      a: "Anker SOLIX lists Nov 10-18, Bluetti Nov 5-18 (11:59 PM Pacific), Growatt Nov 10-30 and Himiway Nov 1-15. Each deal leaves this page when its maker's sale ends.",
    },
    {
      q: "Which power station should I get for outages?",
      a: "Start with what you need to run. Our power outage backup calculator adds up your fridge, Wi-Fi, CPAP or sump pump and tells you the battery size; buy the smallest unit that covers it. Prices on this page don't change our picks.",
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
          datePublished: UPDATED,
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
        title={<>Black Friday deals, <span className="text-amber-300">checked against what they cost last month.</span></>}
        sub={<>A crossed-out price says nothing. We read these prices on each maker&apos;s own store and compare them with the prices we logged before the sales began.</>}
      >
        <a href="#power-stations" className="btn btn-primary">Power stations</a>
        <a href="#e-bikes" className="btn btn-light">E-bikes</a>
      </HubHero>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Updated <time dateTime={UPDATED}>{formatDate(UPDATED)}</time>
        </p>
        <Suspense fallback={<p className="mt-6 text-sm text-stone-600">Loading today&apos;s deals...</p>}>
          <LiveDeals />
        </Suspense>

        <Section title="How we check a deal" id="method">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <p>
              We list a deal only when the maker publishes the sale&apos;s dates and we have read the price on its US store ourselves. The
              &quot;was&quot; price is the maker&apos;s; our verdict compares the sale price with the lowest price we recorded for that model in our
              earlier checks. Brands that show a crossed-out price all year with no sale dates aren&apos;t listed.
            </p>
            <p>
              We earn a commission from these brands, and only list brands we earn from: {brands.join(", ")}. A deal never moves a product
              into our picks; those are chosen by what a unit can run, on <Link href="/best-portable-power-stations" className="underline">our power station guide</Link>.
            </p>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <RelatedLinks
          links={[
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "What size battery your fridge, Wi-Fi and medical devices need" },
            { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Picks by use and a full spec table" },
            { href: "/e-bikes", label: "E-bikes", desc: "Range, weight and price compared" },
            { href: "/home-battery-backup", label: "Home battery backup", desc: "When a portable unit is enough and when it isn't" },
          ]}
        />
        <PhotoCredit name="power-station" />
      </div>
    </article>
  );
}
