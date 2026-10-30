import type { Metadata } from "next";
import Link from "next/link";
import { LOCAL_CHECKED, STATE_LOCAL } from "@/data/state-local";
import {
  Breadcrumbs,
  Callout,
  Disclaimer,
  Faq,
  PageIntro,
  RelatedLinks,
  Section,
  Sources,
} from "@/components/content";
import IncentivesForState from "@/components/IncentivesForState";
import { STATES, formatDate } from "@/lib/energy";
import { stateSources } from "@/lib/state-sources";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/incentives";
const REVIEWED = "2026-10-15";
const TITLE = "EV & Solar Tax Credits in 2026: What Ended, What's Left";
const DESCRIPTION =
  "The $7,500 EV credit, used-EV credit, charger credit and 30% solar and battery credit have ended. Exact IRS end dates, what remains, and where to find state rebates.";

const IRS_FAQ =
  "https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-act-obbb";
const IRS_CAR_LOAN =
  "https://www.irs.gov/newsroom/working-families-tax-cuts-tax-deductions-for-working-americans-and-seniors";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const ENDED = [
  { credit: "New clean vehicle credit (up to $7,500)", section: "30D", end: "Not allowed for vehicles acquired after 30 September 2025" },
  { credit: "Used clean vehicle credit (up to $4,000)", section: "25E", end: "Not allowed for vehicles acquired after 30 September 2025" },
  { credit: "Commercial clean vehicle credit (includes many EV leases)", section: "45W", end: "Not allowed for vehicles acquired after 30 September 2025" },
  { credit: "EV charger / refueling property credit", section: "30C", end: "Not allowed for property placed in service after 30 June 2026" },
  { credit: "Residential Clean Energy Credit, 30% (solar, batteries, geothermal)", section: "25D", end: "Not allowed for expenditures made after 31 December 2025" },
  { credit: "Energy Efficient Home Improvement Credit (heat pumps, insulation, windows)", section: "25C", end: "Not allowed for property placed in service after 31 December 2025" },
];

export default function IncentivesPage() {
  const faqs = [
    {
      q: "Is the $7,500 federal EV tax credit still available?",
      a: "No. The IRS says the new clean vehicle credit (section 30D) is not allowed for any vehicle acquired after 30 September 2025. The used clean vehicle credit (25E) and commercial clean vehicle credit (45W) ended on the same date.",
    },
    {
      q: "Can I still get a federal tax credit for solar panels or a home battery?",
      a: "Not as a homeowner buying the system. The IRS says the 30% Residential Clean Energy Credit (25D) is not allowed for expenditures made after 31 December 2025. Companies that own systems and lease them to homeowners claim different, business-side credits, so a lease or power purchase agreement price may still reflect federal support; ask the provider.",
    },
    {
      q: "Is there a federal credit for installing a home EV charger?",
      a: "Not for chargers placed in service after 30 June 2026, according to the IRS. Some utilities and states still offer charger rebates; check the AFDC and DSIRE links for your state on this page.",
    },
    {
      q: "What federal help is left for buying an EV?",
      a: "For tax years 2025 through 2028 you can deduct up to $10,000 a year of interest on a loan for a new vehicle whose final assembly was in the United States, whether or not you itemize. The deduction phases out above $100,000 of modified adjusted gross income ($200,000 for joint filers), the loan must be taken out after 31 December 2024 and secured by the vehicle, and you must report the VIN. It applies to gasoline vehicles too, not just EVs.",
    },
    {
      q: "Where can I find state EV and solar rebates?",
      a: "The Department of Energy's Alternative Fuels Data Center lists state laws and incentives for electric vehicles, and the DSIRE database run by the NC Clean Energy Technology Center lists solar, storage and efficiency programs. Both are linked for every state below.",
    },
  ];

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${url(PATH)}#article`,
          headline: "EV, solar and home battery tax credits in 2026: what ended and what's left",
          description: DESCRIPTION,
          url: url(PATH),
          datePublished: REVIEWED,
          dateModified: REVIEWED,
          author: { "@id": url("/about#editor") },
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          citation: [IRS_FAQ, IRS_CAR_LOAN],
        }}
      />
      <Breadcrumbs items={[{ name: "Incentives", path: PATH }]} />
      <PageIntro
        eyebrow="Federal and state incentives"
        title="EV, solar and battery tax credits in 2026: what ended and what's left"
        lede={
          <>
            Most federal clean-energy credits for households have ended. If a website, dealer or installer
            still quotes a price &quot;after the 30% tax credit&quot; or &quot;after $7,500 back&quot;, check
            the dates below. Every date on this page comes from the IRS.
          </>
        }
      />
      <p className="text-sm text-muted -mt-6 mb-8">
        Last reviewed <time dateTime={REVIEWED}>15 October 2026</time> by the Spark Powered editor.
      </p>

      <Section title="Federal credits that have ended" id="ended">
        <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
          <table className="w-full text-sm">
            <caption className="sr-only">Federal clean energy credits and when they ended</caption>
            <thead className="bg-surface-light text-left">
              <tr>
                <th scope="col" className="p-3 font-semibold">Credit</th>
                <th scope="col" className="p-3 font-semibold">Tax code</th>
                <th scope="col" className="p-3 font-semibold">IRS end rule</th>
              </tr>
            </thead>
            <tbody>
              {ENDED.map((r) => (
                <tr key={r.section} className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">{r.credit}</th>
                  <td className="p-3">§{r.section}</td>
                  <td className="p-3">{r.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-stone-600 mt-3">
          Source: IRS fact sheet FS-2025-05 on Public Law 119-21 (signed 4 July 2025).
        </p>
      </Section>

      <Section title="What federal help remains" id="remaining">
        <div className="text-stone-700 leading-relaxed space-y-4">
          <p>
            <strong>Car loan interest deduction.</strong> For tax years 2025 to 2028 you can deduct up to
            $10,000 a year of interest on a loan for a new car, SUV, van, pickup or motorcycle whose final
            assembly happened in the United States. It works whether you itemize or not, phases out above
            $100,000 of modified adjusted gross income ($200,000 joint), and requires the VIN on your return. It
            is not limited to EVs, and used vehicles do not qualify.
          </p>
          <p>
            <strong>Leases and power purchase agreements for solar and storage.</strong> The homeowner credit
            ended, but companies that own the equipment claim separate business credits under different rules
            and deadlines. Whether any of that reaches you depends on the contract — ask the provider to show
            it in the price, and compare against buying outright.
          </p>
          <Callout tone="warn">
            Tax rules have exceptions, transition dates and income limits that this summary cannot cover. Check
            with a tax professional before making a purchase decision based on a credit or deduction.
          </Callout>
        </div>
      </Section>

      <Section title="State programs open now: three examples" id="state-examples">
        <p className="text-stone-700 leading-relaxed mb-4">
          With the federal credits gone, state money is the main help left. Three we checked on the official pages on{" "}
          <time dateTime={LOCAL_CHECKED}>{formatDate(LOCAL_CHECKED)}</time>:
        </p>
        <ul className="space-y-3 text-stone-700 leading-relaxed">
          {[
            { slug: "illinois", name: "Illinois", f: STATE_LOCAL.IL.facts.find((x) => x.label === "EV rebate")! },
            { slug: "hawaii", name: "Hawaii", f: STATE_LOCAL.HI.facts.find((x) => x.label === "Solar tax credit")! },
            { slug: "colorado", name: "Colorado", f: STATE_LOCAL.CO.facts.find((x) => x.label === "EV tax credit")! },
          ].map(({ slug, name, f }) => (
            <li key={slug}>
              <strong className="text-ink">{name}: </strong>
              {f.text}{" "}
              <a href={f.source.url} className="underline text-sm text-muted" rel="noopener">Source</a>
              {" · "}
              <Link href={`/states/${slug}#local`} className="underline text-sm text-spark-orange">{name} energy data</Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="State and utility incentives" id="states">
        <p className="text-stone-700 leading-relaxed mb-4">
          States and utilities still run rebates for EVs, chargers, heat pumps, solar and batteries, and they
          change often. Rather than copy program details that may go stale, we link to the two official
          databases for each state. Each state&apos;s{" "}
          <Link href="/states" className="underline text-spark-orange">
            energy data page
          </Link>{" "}
          also lists them.
        </p>
        <IncentivesForState
          states={[...STATES]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((s) => {
              const [afdc, dsire] = stateSources(s);
              return { abbr: s.abbr, name: s.name, slug: s.slug, afdc: afdc.url, dsire: dsire.url };
            })}
        />
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[...STATES]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((s) => {
              const [afdc, dsire] = stateSources(s);
              return (
                <li key={s.abbr} className="flex flex-wrap gap-x-2">
                  <Link href={`/states/${s.slug}`} className="font-medium hover:text-spark-orange">
                    {s.name}
                  </Link>
                  <span className="text-muted">
                    <a href={afdc.url} className="underline" rel="noopener">
                      EV (AFDC)
                    </a>{" "}
                    ·{" "}
                    <a href={dsire.url} className="underline" rel="noopener">
                      solar &amp; storage (DSIRE)
                    </a>
                  </span>
                </li>
              );
            })}
        </ul>
      </Section>

      <Faq items={faqs} path={PATH} />
      <Disclaimer>
        This page summarizes official guidance for general information. It is not tax, legal or financial
        advice.
      </Disclaimer>
      <Sources
        items={[
          { name: "IRS: FAQs for modification of sections 25C, 25D, 25E, 30C, 30D, 45L, 45W and 179D (FS-2025-05)", url: IRS_FAQ, detail: "21 August 2025" },
          { name: "IRS: Working Families Tax Cuts — tax deductions for working Americans and seniors", url: IRS_CAR_LOAN, detail: "car loan interest deduction rules" },
          { name: "U.S. Department of Energy, Alternative Fuels Data Center: State Laws and Incentives", url: "https://afdc.energy.gov/laws/state", detail: "state EV programs" },
          { name: "DSIRE, NC Clean Energy Technology Center", url: "https://programs.dsireusa.org/system/program", detail: "state solar, storage and efficiency programs" },
        ]}
      />
      <RelatedLinks
        links={[
          { href: "/ev-charging-cost", label: "EV charging cost calculator", desc: "What charging costs in your state" },
          { href: "/questions/costs-and-incentives", label: "Tax credit and heat pump questions", desc: "Sourced answers on 2026 credits, prices and heat pumps" },
          { href: "/solar-calculator", label: "Solar panel calculator", desc: "Size a system and test a quote's price" },
        ]}
      />
    </article>
  );
}
