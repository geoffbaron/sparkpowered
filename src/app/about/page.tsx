import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageIntro, Section } from "@/components/content";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/about";
export const metadata: Metadata = pageMetadata({
  title: "About Spark Powered & Our Editorial Standards",
  description:
    "Who runs Spark Powered, how we choose and check the numbers in our EV, solar and home battery tools, how we handle news from other publishers, and how the site is funded.",
  path: PATH,
});

export default function AboutPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${url(PATH)}#webpage`,
          url: url(PATH),
          name: "About Spark Powered",
          isPartOf: { "@id": url("/#website") },
          about: { "@id": url("/#organization") },
          mainEntity: {
            "@type": "Person",
            "@id": url("/about#editor"),
            name: "Geoff Baron",
            jobTitle: "Owner and editor",
            worksFor: { "@id": url("/#organization") },
          },
        }}
      />
      <Breadcrumbs items={[{ name: "About", path: PATH }]} />
      <PageIntro
        eyebrow="About us"
        title="About Spark Powered"
        lede="Spark Powered helps US households work out whether an electric car, solar panels or a home battery makes sense for them, using free calculators built on public government data."
      />

      <Section title="Who runs the site">
        <p className="text-stone-700 leading-relaxed">
          Spark Powered is an independent site owned and edited by <strong>Geoff Baron</strong>. It is not
          owned by, or paid by, any carmaker, solar installer, battery maker or utility. The editor decides
          what the tools calculate and is responsible for everything published here.
        </p>
      </Section>

      <Section title="Where our numbers come from">
        <div className="text-stone-700 leading-relaxed space-y-3">
          <p>
            Our calculators and state pages use public data from the US Energy Information Administration
            (electricity and gasoline prices, household usage), the Department of Energy&apos;s Alternative
            Fuels Data Center (charging stations), the PVWatts model from the National Laboratory of the
            Rockies (solar output) and EPA ratings on fueleconomy.gov (vehicle efficiency and range). Tax
            rules come from the IRS. Every page lists its sources and the date the data was retrieved.
          </p>
          <p>
            Read exactly how each figure is calculated, and what it leaves out, on our{" "}
            <Link href="/methodology" className="underline text-spark-orange">
              methodology page
            </Link>
            .
          </p>
        </div>
      </Section>

      <Section title="How we use automation and AI">
        <p className="text-stone-700 leading-relaxed">
          The vehicle list in the EV Finder and the product list in the Home Battery Sizer are refreshed by an
          automated research step that uses an AI model with web search to collect current prices and
          specifications. Those lists can contain errors or go out of date, so we label prices as indicative,
          show EPA-rated range alongside the EV results where we can match a model, and tell you to confirm
          details with the manufacturer. Our state data pages and calculators do not use AI-generated numbers;
          they are computed directly from the government datasets above.
        </p>
      </Section>

      <Section title="How we handle news from other publishers">
        <p className="text-stone-700 leading-relaxed">
          Our{" "}
          <Link href="/news" className="underline text-spark-orange">
            headlines page
          </Link>{" "}
          lists recent articles from Electrek, CleanTechnica, InsideEVs and Solar Power World, taken from the
          RSS feeds those publishers provide. We show only the headline, the publisher&apos;s name and the date,
          and link straight to the original article. We do not copy articles or images, and we do not present
          their reporting as our own. That page is kept out of search results because the reporting belongs to
          those publishers.
        </p>
      </Section>

      <Section title="How the site is funded">
        <p className="text-stone-700 leading-relaxed">
          Spark Powered does not currently earn money from the links on this site. If we add affiliate or
          referral links in future, we will label them clearly on the page where they appear, and they will
          never change what a calculator returns.
        </p>
      </Section>

      <Section title="Corrections">
        <p className="text-stone-700 leading-relaxed">
          If you spot a number that is wrong or out of date, we want to fix it. Each data page shows when its
          figures were last updated; corrections are made on the page itself and the update date changes.
        </p>
      </Section>
    </article>
  );
}
