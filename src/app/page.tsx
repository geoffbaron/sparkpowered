import Link from "next/link";
import type { Metadata } from "next";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Sources } from "@/components/content";
import Byline from "@/components/Byline";
import AskSparkCta from "@/components/AskSparkCta";
import { AFFILIATES } from "@/data/affiliates";
import { HOOKUP_SAFETY_SOURCES } from "@/data/hookup";
import { formatDate } from "@/lib/energy";
import { lifeSummary } from "@/lib/everyday";
import { fullName, kwh, productById, watts } from "@/lib/products";
import { AUTHOR_REF, JsonLd, pageMetadata, pageUpdated, url } from "@/lib/seo";

const TITLE = "Home Backup Power in an Outage, Explained";
const DESCRIPTION =
  "How to keep a US home running in a power outage with a portable power station or home battery: what size you need, how to connect it to the house, and what it will run.";

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/" }),
  title: { absolute: `${TITLE} | Spark Powered` },
};

/** Units the guides cover, by job. Paid and unpaid makers side by side; the link note says which is which. */
const BY_JOB: { job: string; ids: string[]; guide?: { href: string; label: string } }[] = [
  {
    job: "Fridge, Wi-Fi, lights and phones (about 1 kWh)",
    ids: ["anker-solix-c1000-gen-2", "ecoflow-delta-3-plus", "jackery-explorer-1000-v2"],
    guide: { href: "/power-stations/anker-solix-c1000-gen-2/what-it-runs", label: "What a C1000 Gen 2 runs" },
  },
  {
    job: "A day of essentials, or a CPAP for several nights (about 2 kWh)",
    ids: ["bluetti-elite-200-v2", "ecoflow-delta-3-max", "jackery-explorer-2000-v2"],
    guide: { href: "/power-stations/bluetti-elite-200-v2/what-it-runs", label: "What an Elite 200 V2 runs" },
  },
  {
    job: "240 V circuits through an inlet box or transfer switch (well pump, whole panel)",
    ids: ["anker-solix-f3800-plus", "bluetti-apex-300", "ecoflow-delta-pro-3", "jackery-explorer-5000-plus"],
    guide: { href: "/home-backup", label: "The four ways to connect a battery" },
  },
];

export default function HomePage() {
  const twoKwh = lifeSummary(2048);
  const oneKwh = lifeSummary(1024);
  const updated = pageUpdated("/");

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${url("/")}#webpage`,
          url: url("/"),
          name: TITLE,
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          about: { "@id": url("/#organization") },
          author: AUTHOR_REF,
          dateModified: `${updated}T12:00:00+00:00`,
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-spark-amber mb-2">Home backup power</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">Keeping your home running in a power outage</h1>
        <Byline path="/" className="mt-4 mb-8" />

        <section aria-labelledby="answer-heading" className="rounded-2xl border border-black/8 bg-surface p-5 sm:p-6">
          <h2 id="answer-heading" className="text-xl font-bold mb-3">The short answer</h2>
          <div className="space-y-3 text-stone-800 leading-relaxed">
            <p>
              <strong>Start with what you need to run, not with a product.</strong> A fridge, Wi-Fi, a few lights and phone charging are the
              usual list. A battery of about 1 kWh keeps them going for {oneKwh.essentials}; about 2 kWh, for {twoKwh.essentials}. The{" "}
              <Link href="/power-outage-backup-calculator" className="text-spark-orange underline underline-offset-2">outage backup calculator</Link>{" "}
              adds up your own list.
            </p>
            <p>
              <strong>Plug-in loads need nothing but the battery.</strong> Run an extension cord from the power station to the fridge. To power
              circuits in the walls (a well pump, a furnace, the whole kitchen) the battery has to feed the house through an inlet box with an
              interlock, a transfer switch or a smart panel, and <strong>that is a job for a licensed electrician, usually with a permit</strong>.
              Never plug a battery or generator into a wall outlet to backfeed the house: the Consumer Product Safety Commission warns it can kill
              utility workers and neighbors.
            </p>
            <p>
              <strong>240 V loads need a 240 V unit.</strong> Most well pumps and some furnaces run on 240 V; most portable power stations only
              give 120 V. The{" "}
              <Link href="/home-backup/hookup-picker" className="text-spark-orange underline underline-offset-2">hookup picker</Link> asks five
              questions and tells you which way to connect and what size.
            </p>
          </div>
        </section>

        <section aria-labelledby="guides-heading" className="mt-12">
          <h2 id="guides-heading" className="text-2xl font-extrabold mb-4">Guides</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {[
              ["/home-backup", "Connecting a battery to your house", "Cords, interlock, transfer switch or smart panel, and when you need an electrician"],
              ["/home-backup/anker-solix-f3800-plus-hookup", "Anker SOLIX F3800 Plus hookup", "Inlet box, Anker's transfer switch or the Home Power Panel"],
              ["/home-backup/bluetti-apex-300-hookup", "Bluetti Apex 300 hookup", "AT1, interlock or manual transfer switch, and the neutral question"],
              ["/home-backup/well-pump", "Power station for a well pump", "Starting and running watts from the pump's nameplate"],
              ["/home-backup/pellet-stove", "Power station for a pellet stove", "Igniter watts and switchover time"],
              ["/power-station-for-refrigerator", "Power station for a refrigerator", "How long a fridge runs on a battery"],
              ["/home-battery-backup", "Whole-home vs portable backup", "Powerwall-type batteries against power stations"],
              ["/questions/home-batteries-backup", "Backup questions, answered", "Short answers with their sources"],
            ].map(([href, t, d]) => (
              <li key={href}>
                <Link href={href} className="block h-full rounded-xl border border-black/8 bg-surface p-4 hover:border-amber-300">
                  <span className="font-semibold">{t}</span>
                  <span className="block text-sm text-stone-600 mt-1">{d}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="units-heading" className="mt-12">
          <h2 id="units-heading" className="text-2xl font-extrabold mb-2">Units the guides cover, by job</h2>
          <p className="text-stone-700 mb-4 max-w-3xl">
            Specs are from each maker&apos;s US site. I haven&apos;t tested these units myself; I list good options whether or not the maker pays me.
          </p>
          <AffiliateDisclosure className="mb-4" />
          <div className="space-y-4">
            {BY_JOB.map((row) => (
              <div key={row.job} className="rounded-xl border border-black/8 bg-surface p-4">
                <h3 className="font-bold">{row.job}</h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {row.ids.map((id) => {
                    const p = productById(id);
                    return (
                      <li key={id}>
                        <PartnerLink brand={p.brand} productId={p.id} productUrl={p.url}>
                          {fullName(p)}
                        </PartnerLink>{" "}
                        <span className="text-stone-600">
                          {kwh(p.capacityWh)}, {watts(p.acOutputW)} at {p.volts}
                          {AFFILIATES[p.brand].tracked ? " · may earn a commission" : " · no commission"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {row.guide && (
                  <p className="text-sm mt-2">
                    <Link href={row.guide.href} className="font-semibold text-spark-orange underline underline-offset-2">{row.guide.label}</Link>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <AskSparkCta className="mt-12" />

        <section className="mt-12">
          <Sources
            items={[
              { ...HOOKUP_SAFETY_SOURCES.cpsc, detail: "Backfeeding warning; read Nov 14, 2026" },
              { ...HOOKUP_SAFETY_SOURCES.osha, detail: "Transfer switch installed by a qualified electrician; read Nov 14, 2026" },
              ...BY_JOB.flatMap((r) => r.ids).map((id) => {
                const p = productById(id);
                return { name: `${fullName(p)} product page`, url: p.sourceUrl, detail: `Capacity and output; read ${formatDate(p.retrieved)}` };
              }),
            ]}
          />
          <p className="text-xs text-muted mt-3">
            Runtimes assume 85% of the battery is usable and typical loads; see the{" "}
            <Link href="/methodology" className="underline">methodology</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
