import type { Metadata } from "next";
import Link from "next/link";
import FilterChecker from "@/components/FilterChecker";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import { HubHero, PhotoCredit } from "@/components/ui";
import { EVIDENCE_LABEL, EVIDENCE_RANK, NSF_P231_LISTING, WATER_PRODUCTS, type PrepProduct } from "@/data/prep-products";
import { formatDate } from "@/lib/energy";
import { CAMPER_VOLTS_URL, PREP_CHECKED, PREP_SOURCES as S, PURIFIER_LOG, STANDARDS, logToPercent, prepLinksFor } from "@/lib/prep";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/best-emergency-water-filters";
const TITLE = "Best Emergency Water Filters, Ranked by Certification";
const DESCRIPTION =
  "Emergency water filters and purifiers ranked by what is actually certified, not marketing. Filter vs purifier, which NSF standard you need, and how to check a listing.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const pct = (log: number) => `${logToPercent(log).toFixed(log >= 4 ? 4 : 1).replace(/0+$/, "").replace(/\.$/, "")}%`;

function BuyLink({ p, children, className }: { p: PrepProduct; children: React.ReactNode; className?: string }) {
  return p.brand ? (
    <PartnerLink brand={p.brand} productUrl={p.url} className={className}>{children}</PartnerLink>
  ) : (
    <PlainLink href={p.url} className={className}>{children}</PlainLink>
  );
}

export default function BestEmergencyWaterFiltersPage() {
  const ranked = [...WATER_PRODUCTS].sort(
    (a, b) => (a.kind === b.kind ? 0 : a.kind === "purifier" ? -1 : 1) || EVIDENCE_RANK[a.evidence] - EVIDENCE_RANK[b.evidence],
  );
  const purifiers = ranked.filter((p) => p.kind === "purifier");
  const tap = ranked.filter((p) => p.kind === "tap-filter");
  const msr = WATER_PRODUCTS.find((p) => p.id === "msr-guardian-gravity")!;
  const lsFamily = WATER_PRODUCTS.find((p) => p.id === "lifestraw-family")!;
  const listedCount = WATER_PRODUCTS.filter((p) => p.evidence === "listed").length;

  const faqs = [
    {
      q: "What is the difference between a water filter and a water purifier?",
      a: `A purifier is tested to remove viruses as well as bacteria and parasites, so it can treat water of unknown quality. The line comes from the EPA's 1987 Guide Standard: ${PURIFIER_LOG.bacteria}-log (${pct(PURIFIER_LOG.bacteria)}) of bacteria, ${PURIFIER_LOG.viruses}-log (${pct(PURIFIER_LOG.viruses)}) of viruses and ${PURIFIER_LOG.cysts}-log (${pct(PURIFIER_LOG.cysts)}) of cysts. CDC says most portable filters remove parasites but not viruses or bacteria.`,
    },
    {
      q: "What NSF certification should an emergency water filter have?",
      a: "For water of unknown quality, such as a creek, rain barrel or tap water under a boil notice, look for a microbiological purifier claim: NSF P231 or P248, both built on the EPA Guide Standard. For safe tap water with a specific problem such as lead, look for NSF/ANSI 53 or 58 for that contaminant. NSF/ANSI 42 covers taste and odor only.",
    },
    {
      q: "How do I check if a filter is really NSF certified?",
      a: "Search the maker's name in NSF's public listings at info.nsf.org/Certified/DWTU, pick the standard, and look for the exact model and the claims listed for it. Some products are certified by IAPMO or WQA instead; both have their own search. \"Tested to\" or \"meets\" a standard is the maker's claim. \"Certified to\" should come with a listing you can find.",
    },
    {
      q: "What about Berkey?",
      a: "We do not list Berkey. On May 8, 2023 the EPA ordered Berkey International LLC to stop selling Black Berkey filters and the Berkey systems sold with them, including the Big, Travel, Royal, Imperial and Crown (order FIFRA-08-2023-0038). The EPA said the labels and websites claimed the filters removed viruses and bacteria, and that silver self-sterilized them, which makes them pesticides under federal law, and that none were registered with the EPA. That is a registration and labeling ruling, not a test of the water. Berkey sued the EPA in federal court in Puerto Rico in March 2024 to challenge the order. We have not confirmed where that case stands now.",
    },
    {
      q: "Do I need a filter if I store water?",
      a: `Stored water comes first. A purifier is the backup for when stored water runs out. For a household, a gravity purifier such as the ${msr.name} or the ${lsFamily.name} treats water in batches without pumping.`,
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
          datePublished: PREP_CHECKED,
          dateModified: PREP_CHECKED,
          author: { "@id": url("/about#editor") },
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          citation: [S.nsfListings.url, S.cdcMakeSafe.url, S.berkeyOrder.url],
        }}
      />
      <HubHero
        image="outage"
        crumbs={[{ name: "Best emergency water filters", path: PATH }]}
        eyebrow="Emergency prep"
        title={<>Certified beats claimed. <span className="text-amber-300">Water filters ranked on proof.</span></>}
        sub={
          <>
            Most emergency filters are not purifiers, and most purifier claims are the maker&apos;s own. When we checked NSF&apos;s
            public purifier listing, it held just two makers. Here is what each product can show.
          </>
        }
      >
        <a href="#checker" className="btn btn-primary">What do I need?</a>
        <a href="#ranked" className="btn btn-light">See the list</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />
        <QuickAnswer>
          <p>
            <strong>For a household, a gravity purifier:</strong> the{" "}
            <BuyLink p={msr}>{msr.name}</BuyLink> (maker says it meets NSF P248) or the <BuyLink p={lsFamily}>{lsFamily.name}</BuyLink>{" "}
            (maker says it meets NSF P231). Both treat batches of creek or rain water without power. Neither appears in NSF&apos;s public
            listing, so these are the makers&apos; claims.
          </p>
          <p>
            <strong>Stored water first.</strong> No filter replaces{" "}
            <Link href="/emergency-water-storage-calculator" className="underline">a stored supply</Link>.
          </p>
        </QuickAnswer>

        <section id="checker" className="mt-12 scroll-mt-24" aria-labelledby="checker-heading">
          <h2 id="checker-heading" className="text-2xl font-extrabold text-ink mb-2">Filter or purifier? Check your water source</h2>
          <p className="text-stone-700 mb-4 max-w-3xl">Pick where your water will come from. We show what treatment it needs and which standard to look for.</p>
          <FilterChecker />
        </section>

        <Section title="How we rank" id="method">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>We rank on evidence, not features or reviews. Strongest first:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li><strong>{EVIDENCE_LABEL.listed}.</strong> You can find the model under that standard yourself.</li>
              <li><strong>{EVIDENCE_LABEL["maker-certified"]}.</strong> The maker says a certifier such as IAPMO certified it.</li>
              <li><strong>{EVIDENCE_LABEL["maker-meets"]}.</strong> The maker says it &quot;meets&quot; or was &quot;tested to&quot; a standard.</li>
            </ol>
            <p>
              A product is on this page only if we could read its standards claim on the maker&apos;s page or a certifier&apos;s listing.
              We checked every claim on {formatDate(PREP_CHECKED)}. We list no prices.
            </p>
          </div>
        </Section>

        <section id="ranked" className="mt-12 scroll-mt-24" aria-labelledby="ranked-heading">
          <h2 id="ranked-heading" className="text-2xl font-extrabold text-ink mb-2">Purifiers: for water of unknown quality</h2>
          <p className="text-stone-700 mb-4 max-w-3xl">
            {listedCount === 1 ? "Only one" : listedCount} of these {listedCount === 1 ? "is" : "are"} in a certifier&apos;s listing. The
            rest are worth considering, but read the claim for what it is.
          </p>
          <ProductTable items={purifiers} />

          <h2 className="text-2xl font-extrabold text-ink mt-10 mb-2">Tap water filters: for water that is already treated</h2>
          <p className="text-stone-700 mb-4 max-w-3xl">
            These improve tap water you already trust. They are not purifiers, and neither works as a substitute for boiling during a
            boil-water notice.
          </p>
          <ProductTable items={tap} />
          <p className="text-xs text-muted mt-2">Plain links to brands we have no deal with; other links may earn us a commission.</p>
        </section>

        <Section title="Standards, in plain English" id="standards">
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Water filter standards and what each covers</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Standard</th>
                  <th scope="col" className="p-3 font-semibold">What it covers</th>
                </tr>
              </thead>
              <tbody>
                {STANDARDS.map((s) => (
                  <tr key={s.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium whitespace-nowrap">{s.name}</th>
                    <td className="p-3">{s.covers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-stone-700 mt-4 max-w-3xl">
            CDC adds: to remove parasites such as Cryptosporidium, look for NSF 53 or 58 with &quot;cyst reduction&quot; or an absolute
            pore size of 1 micron or smaller.
          </p>
        </Section>

        <Section title="How to look a product up yourself" id="lookup">
          <ol className="list-decimal pl-5 space-y-2 text-stone-700 max-w-3xl">
            <li>
              Open <PlainLink href={S.nsfListings.url}>NSF&apos;s certified water treatment listings</PlainLink>.
            </li>
            <li>Type the maker&apos;s name, or pick a standard such as Microbiological Water Purifiers (NSF P231).</li>
            <li>Find the exact model. Read the claims listed beside it: a listing can cover materials only, or one contaminant only.</li>
            <li>
              Not there? Try <PlainLink href="https://pld.iapmo.org/">IAPMO&apos;s listings</PlainLink> or{" "}
              <PlainLink href="https://www.wqa.org/find-products">WQA&apos;s product search</PlainLink>. If it is in none of them, the claim is the
              maker&apos;s own.
            </li>
          </ol>
          <Callout>
            When we searched the P231 purifier listing on {formatDate(PREP_CHECKED)}, it held{" "}
            <PlainLink href={NSF_P231_LISTING}>four products from two makers</PlainLink>, all home units on a tap. None of the portable or
            gravity brands sold for emergencies were in it.
          </Callout>
        </Section>

        <Section title="Left off this list" id="excluded">
          <ul className="list-disc pl-5 space-y-2 text-stone-700 max-w-3xl">
            <li>
              <strong>Berkey.</strong> Named in a 2023 EPA stop-sale order. See the FAQ below.
            </li>
            <li>
              <strong>Alexapure.</strong> Publishes no certifications we could find.
            </li>
            <li>
              <strong>Squeeze and straw filters whose pages name no standard.</strong> The Sawyer Squeeze page,
              for example, cites its own lab report for bacteria and protozoa and says nothing about viruses or any standard. That is a
              filter, not a purifier.
            </li>
          </ul>
          <p className="text-sm text-muted mt-4">
            For tank filters in vans and RVs, see <a href={CAMPER_VOLTS_URL} className="underline" rel="noopener">Camper Volts</a>.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          We are not a testing lab. Every claim here is quoted from the source linked beside it, on the date shown. Makers change
          products and pages; check the listing before you buy. Not medical advice.
        </Disclaimer>
        <Sources
          items={[
            { ...S.nsfListings, detail: "search by maker or standard" },
            { ...S.nsfP231, detail: `2 makers, 4 products when checked ${formatDate(PREP_CHECKED)}` },
            { ...S.cdcMakeSafe, detail: "most filters remove parasites but not viruses or bacteria; pore sizes" },
            { ...S.cdcFilters, detail: "NSF 53 or 58 cyst reduction; absolute 1 micron" },
            { ...S.berkeyOrder, detail: "May 8, 2023: Black Berkey filters and systems; virus and bacteria claims; not registered" },
            { ...S.berkeyPuertoRico },
            ...WATER_PRODUCTS.map((p) => ({ name: `${p.name}: ${p.evidence === "listed" ? "NSF listing" : "maker's page"}`, url: p.sourceUrl, detail: `checked ${formatDate(p.checked)}` })),
            { name: "Sawyer Squeeze product page", url: "https://www.sawyer.com/product/squeeze-water-filter-system", detail: `checked ${formatDate(PREP_CHECKED)}` },
          ]}
        />
        <RelatedLinks links={prepLinksFor(PATH)} />
        <PhotoCredit name="outage" />
      </div>
    </article>
  );
}

function ProductTable({ items }: { items: PrepProduct[] }) {
  return (
    <div className="grid gap-3">
      {items.map((p, i) => (
        <article key={p.id} className="rounded-2xl bg-white border border-black/10 p-5" data-testid="prep-product">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-extrabold text-ink">
              <span className="text-muted tabular-nums mr-1">{i + 1}.</span> {p.name}
            </h3>
            <span
              className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                p.evidence === "listed" ? "bg-emerald-100 text-emerald-900" : p.evidence === "maker-certified" ? "bg-sky-100 text-sky-900" : "bg-amber-100 text-amber-900"
              }`}
            >
              {EVIDENCE_LABEL[p.evidence]}
            </span>
          </div>
          <p className="text-sm text-muted mt-1">{p.use}</p>
          <p className="text-stone-800 mt-2 leading-relaxed">{p.claim}</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-stone-700 space-y-1">
            {p.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="text-xs text-muted mt-3">
            Claim read on{" "}
            <a href={p.sourceUrl} rel="noopener" className="underline">
              {p.evidence === "listed" ? "NSF's listing" : "the maker's page"}
            </a>{" "}
            on {formatDate(p.checked)}
            {p.verifyUrl && (
              <>
                {" "}·{" "}
                <a href={p.verifyUrl} rel="noopener" className="underline">check the listing</a>
              </>
            )}
            {" "}·{" "}
            <BuyLink p={p}>See it at {p.maker}</BuyLink>
          </p>
        </article>
      ))}
    </div>
  );
}
