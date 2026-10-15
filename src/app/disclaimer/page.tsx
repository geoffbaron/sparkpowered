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
          Lists in the EV Finder and Home Battery Sizer are gathered by automated research and may be
          incomplete or out of date. Confirm details with the manufacturer or dealer.
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
    </article>
  );
}
