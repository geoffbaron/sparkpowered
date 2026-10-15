import type { Metadata } from "next";
import { Breadcrumbs, PageIntro } from "@/components/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Disclaimer",
  description: "The limits of Spark Powered's calculators, data and information. Estimates only; not financial, tax or legal advice.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ name: "Disclaimer", path: "/disclaimer" }]} />
      <PageIntro title="Disclaimer" lede="Please read this before relying on anything on Spark Powered." />
      <div className="text-stone-700 leading-relaxed space-y-4">
        <p>
          <strong>Estimates, not quotes.</strong> Our calculators and state pages use averages from public
          data. Your real costs and savings depend on your utility rate plan, how and when you use power,
          your vehicle, your roof, local prices and many other factors. Always get written quotes before you
          buy.
        </p>
        <p>
          <strong>Not advice.</strong> Nothing on this site is financial, investment, tax, legal or
          engineering advice. Tax credits and rebates have eligibility rules and deadlines; check with the IRS,
          your state, your utility or a qualified professional.
        </p>
        <p>
          <strong>Product information.</strong> Vehicle and battery prices and specifications change often.
          Battery, power station and plug-in solar specifications and prices on our guides are copied from the
          manufacturer&apos;s own US product pages and dated; the EV Finder list is gathered by automated research.
          Prices move daily, so confirm details with the manufacturer or dealer before you buy.
        </p>
        <p>
          <strong>Installer listings.</strong> The Solar Finder lists companies that say they serve your state.
          We have not inspected their work, and a listing is not an endorsement. Check licenses, reviews and
          certifications yourself.
        </p>
        <p>
          <strong>Third-party news.</strong> Headlines on our news page belong to their publishers. We link to
          their articles and are not responsible for their content.
        </p>
        <p>
          <strong>Electrical work.</strong> Chargers, solar panels and batteries must be installed by licensed
          professionals under local codes and permits.
        </p>
      </div>

      <section id="affiliate-disclosure" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-bold mb-4">Affiliate disclosure: how we make money</h2>
        <div className="text-stone-700 leading-relaxed space-y-4">
          <p>
            Spark Powered is free to use. Some links to products and services, such as portable power stations,
            home batteries, plug-in solar kits and solar quote marketplaces, are affiliate links. If you buy or sign
            up through one, the seller may pay us a commission. You pay the same price.
          </p>
          <p>
            <strong>Commissions never change our recommendations.</strong> We choose products from their published
            specifications, prices and warranties, using the method described on each guide. We list products from
            brands that pay us nothing alongside those that do, and a brand cannot pay to be included, ranked higher
            or described more kindly.
          </p>
          <p>
            Affiliate links are marked as sponsored for search engines and open in a new tab. Pages that contain them
            say so near the top. Our calculators and state data do not depend on any partner.
          </p>
          <p>
            We do not publish star ratings or customer reviews, and we have not bench-tested every product we list;
            where we compare products, we say exactly which published figures we compared.
          </p>
        </div>
      </section>
    </article>
  );
}
