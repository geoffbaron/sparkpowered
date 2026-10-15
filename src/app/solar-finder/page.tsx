import type { Metadata } from "next";
import Link from "next/link";
import SolarFinder from "@/components/SolarFinder";
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
import { INSTALLERS_REVIEWED } from "@/data/installers";
import { CALC_STATES } from "@/lib/calculator-data";
import { DATA_UPDATED, PANEL_WATTS, SOURCES, formatDate } from "@/lib/energy";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/solar-finder";
const TITLE = "Find Solar Installers by ZIP Code and Check Your Quote";
const DESCRIPTION =
  "Enter your ZIP code to see solar installers serving your state, how big a system your home needs and what solar is worth there, so you can judge quotes.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const faqs = [
  {
    q: "How do I choose a solar installer?",
    a: "Get at least three written quotes. Compare the price per watt (total price divided by system size in watts), the panel and inverter brands, the workmanship warranty, and who will actually do the installation. Check the company's license with your state, and look for installers with NABCEP-certified staff.",
  },
  {
    q: "What is a fair price per watt for solar?",
    a: "It varies by state, roof and equipment, so compare quotes against each other and against what solar is worth where you live. Each state page on Spark Powered shows the price per watt at which a system would pay for itself in 10 or 20 years if every kWh offset one bought at the average rate.",
  },
  {
    q: "Should I lease or buy solar panels?",
    a: "Buying usually saves the most over the system's life if you can pay cash or get a low-rate loan. Leases and power purchase agreements need little or no money up front, but the provider keeps the system and any tax benefits, and the contract can complicate selling your home. Read the escalator clause and transfer terms carefully.",
  },
  {
    q: "Does this tool send my details to installers?",
    a: "No. We do not collect your name, email or phone number. The ZIP code is used only to look up your state, and you contact any installer yourself through their website.",
  },
];

export default function SolarFinderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Solar Finder",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          description: DESCRIPTION,
          areaServed: { "@type": "Country", name: "United States" },
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <Breadcrumbs items={[{ name: "Solar Finder", path: PATH }]} />
      <PageIntro
        eyebrow="Free tool"
        title="Find solar installers near you"
        lede="Enter your ZIP code to see installers that list service in your state, plus how much solar your home needs there — so you can tell a fair quote from an oversized or overpriced one. We don't ask for your contact details."
      />

      <SolarFinder states={CALC_STATES} panelWatts={PANEL_WATTS} />

      <Section title="How to use your results" id="how">
        <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
          <p>
            The system size comes from your state&apos;s modeled solar output (PVWatts, for a south-facing roof
            at a 20° tilt) and either your bill or the state&apos;s average household use from EIA. If a quote
            is far larger than your use needs, ask why; if it is much smaller, ask what share of your bill it
            is meant to cover.
          </p>
          <p>
            Then check the price. Divide the quote by the system size in watts to get a price per watt and
            compare it with the break-even figures on your{" "}
            <Link href="/states" className="underline text-spark-orange">
              state&apos;s page
            </Link>{" "}
            or in the{" "}
            <Link href="/solar-calculator" className="underline text-spark-orange">
              solar panel calculator
            </Link>
            .
          </p>
          <Callout tone="warn">
            The 30% federal Residential Clean Energy Credit is not allowed for expenditures made after 31
            December 2025, according to the IRS. Be wary of any quote that still subtracts it.{" "}
            <Link href="/incentives" className="underline font-semibold">
              What&apos;s still available
            </Link>
            .
          </Callout>
        </div>
      </Section>

      <Section title="About this list" id="about-list">
        <p className="text-stone-700 leading-relaxed max-w-3xl">
          We list a small number of companies that sell residential solar in many states and had working
          websites when we last reviewed the list on {formatDate(INSTALLERS_REVIEWED)}. We removed companies
          that have left the residential solar business or gone through bankruptcy. Nobody pays to appear
          here today; if that changes, paid listings will be marked &quot;Sponsored&quot;.
        </p>
      </Section>

      <Faq items={faqs} path={PATH} />
      <Disclaimer />
      <Sources
        items={[
          { name: SOURCES.solar.name, url: SOURCES.solar.url, detail: SOURCES.solar.assumptions },
          { name: SOURCES.usage.name, url: SOURCES.usage.url, detail: SOURCES.usage.period },
          { name: SOURCES.electricityPrice.name, url: SOURCES.electricityPrice.url, detail: SOURCES.electricityPrice.period },
          { name: "NABCEP Professional Directory", url: "https://directories.nabcep.org/", detail: "certified solar professionals" },
        ]}
      />
      <p className="text-xs text-muted mt-3">State data updated {formatDate(DATA_UPDATED)}.</p>
      <RelatedLinks
        links={[
          { href: "/solar-calculator", label: "Solar panel calculator", desc: "Size a system and test a quote's price per watt" },
          { href: "/battery-calculator", label: "Home battery sizer", desc: "Add backup power to your solar" },
        ]}
      />
    </div>
  );
}
