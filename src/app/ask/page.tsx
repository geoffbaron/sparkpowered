import type { Metadata } from "next";
import Link from "next/link";
import AskSpark from "@/components/AskSpark";
import { Breadcrumbs, PageIntro } from "@/components/content";
import { AI_LABEL, PRIVACY_NOTE } from "@/lib/ask-spark/config";
import { pageMetadata } from "@/lib/seo";

const PATH = "/ask";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Ask Spark: Questions About Going Electric",
    description: "Ask about solar, backup power, EV charging at home, heat pumps, electric boats and incentives. Answers come from Spark Powered's fact-checked pages, with links.",
    path: PATH,
  }),
  // A chat box is not content for search results.
  robots: { index: false, follow: true },
};

export default function AskPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ name: "Ask Spark", path: PATH }]} />
      <PageIntro
        title="Ask Spark"
        lede="Questions about going electric in the US: solar, plug-in solar, power stations and backup, EV charging at home, heat pumps, electric boating, incentives and bills. Answers come only from our fact-checked pages, with a link to each one."
      />
      <p className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm font-medium text-amber-900">{AI_LABEL}</p>
      <AskSpark />
      <div className="mt-8 space-y-3 text-sm text-stone-600 leading-relaxed">
        <p>
          <strong>What it won&apos;t do.</strong> Ask Spark does not give wiring, installation or electrical-panel advice: that work needs a
          licensed electrician. It gives general information, not tax or financial advice; check with a tax pro about credits. If our pages
          don&apos;t cover something, it says so.
        </p>
        <p>
          <strong>Products and commissions.</strong> When it suggests a product, it is one we already cover on the site, linked to the
          maker&apos;s own store. We earn a commission if you buy through those links; it never changes what we recommend.
        </p>
        <p>
          <strong>Privacy.</strong> {PRIVACY_NOTE}{" "}
          <Link href="/privacy#ask-spark" className="underline">
            Privacy policy
          </Link>
        </p>
      </div>
    </article>
  );
}
