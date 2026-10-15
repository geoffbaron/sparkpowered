import type { Metadata } from "next";
import { Breadcrumbs, PageIntro } from "@/components/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "What Spark Powered collects when you use the site, and what it does not.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ name: "Privacy", path: "/privacy" }]} />
      <PageIntro title="Privacy policy" lede="Short version: we do not ask for your name, email or phone number, and we do not sell data." />
      <div className="text-stone-700 leading-relaxed space-y-4">
        <p>
          <strong>Analytics.</strong> We use Umami and a page-view analytics script to count visits, see which
          pages are used and spot errors. These tools record information such as the page viewed, referring
          site, browser type, device type and approximate country. We use it only to improve the site.
        </p>
        <p>
          <strong>Calculators.</strong> Numbers you type into our calculators stay in your browser. The Solar
          Finder sends the ZIP code you enter to our server to look up your state; we do not store it.
        </p>
        <p>
          <strong>Preferences.</strong> If you turn on the &quot;No Tesla&quot; filter, that choice is saved in
          your browser&apos;s local storage so it persists between pages. You can clear it at any time in your
          browser settings.
        </p>
        <p>
          <strong>Links to other sites.</strong> When you follow a link to a publisher, manufacturer or
          installer, their privacy policy applies.
        </p>
        <p>
          <strong>Changes.</strong> If we start collecting anything else, such as an email address for a
          newsletter, we will update this page first and ask for your consent where required.
        </p>
        <p className="text-sm text-muted">Last updated 15 October 2026.</p>
      </div>
    </article>
  );
}
