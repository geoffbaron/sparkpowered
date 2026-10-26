import type { Metadata } from "next";
import Link from "next/link";
import GeneratorCalc from "@/components/offgrid/GeneratorCalc";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { LOAD_DEFS, relatedFor, sourcesFor } from "@/lib/offgrid";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/generator-runtime-calculator";
const UPDATED = "2026-10-26";
const TITLE = "Generator Runtime Calculator: Hours per Tank and Fuel to Store";
const DESCRIPTION =
  "How long your generator runs on a tank and how much gasoline, propane or diesel to store for an outage, worked out from your generator's own spec sheet, with the carbon monoxide rules that keep you safe.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

/** Running and starting watts from the EWEB generator sizing sheet, for the "watts you will run" step. */
const WATTS_ROWS = ["well", "furnace", "fridge", "microwave", "laptop", "phone"].map((id) => LOAD_DEFS.find((d) => d.id === id)!);

export default function GeneratorRuntimePage() {
  const faqs = [
    {
      q: "How long will a generator run on a tank of gas?",
      a: "Check the spec sheet. Makers publish runtime per tank at a stated load, such as 25% or 50% of rated output, and it varies a lot between models. The lighter the load, the longer it runs. Enter that runtime and the tank size in our calculator to get fuel an hour, a day and for the whole outage.",
    },
    {
      q: "How much fuel should I store for a generator?",
      a: "Fuel an hour × hours a day you will run it × days. Fuel an hour is the tank size divided by the maker's runtime on that tank at your load. Running it in shifts, for example a few hours morning and evening to cool the fridge and pump water, cuts the fuel you need a lot.",
    },
    {
      q: "How far from the house should a generator be?",
      a: "At least 20 feet from windows, doors and attached garages, outdoors (Ready.gov, CDC), with the exhaust pointed away from the house (NFPA). Never run one indoors (Ready.gov), and never in an attached garage, even with the door open (NFPA). Put battery-backed carbon monoxide alarms on every level.",
    },
    {
      q: "Do new generators shut off automatically if carbon monoxide builds up?",
      a: "Some do, but it is not required by law. The UL 2201 and ANSI/PGMA G300 standards include carbon monoxide shutoff or reduced emissions, and both are voluntary. The Consumer Product Safety Commission's rule is still a proposal. Look for those standards on the label, and keep the 20-foot rule either way.",
    },
    {
      q: "How do I connect a generator to my house?",
      a: "Only through a transfer switch or interlock installed by a qualified electrician (NFPA). Otherwise, plug appliances straight into the generator, or use heavy-duty outdoor-rated extension cords with all three prongs.",
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Generator Runtime and Fuel Calculator",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          browserRequirements: "Requires JavaScript",
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          dateModified: UPDATED,
        }}
      />
      <HubHero
        image="outage"
        crumbs={[{ name: "Generator runtime calculator", path: PATH }]}
        eyebrow="Generators"
        title={<>Enough fuel for the outage. <span className="text-amber-300">Far enough from the house.</span></>}
        sub={
          <>
            Put in your generator&apos;s tank size and its rated runtime, and see how much gasoline, propane or diesel to store. Then run it at least{" "}
            <strong className="text-amber-300">20 feet from the house</strong>.
          </>
        }
      >
        <a href="#calculator" className="btn btn-primary">Work out my fuel</a>
        <a href="#safety" className="btn btn-light">Safety first</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <QuickAnswer>
          <p>
            <strong>Fuel an hour = tank size ÷ the maker&apos;s runtime on that tank</strong> at the load you will run. Fuel to store = fuel an hour ×
            hours a day × days. Generators differ too much for a rule of thumb, so we use your generator&apos;s own spec sheet.
          </p>
        </QuickAnswer>

        <section id="safety" aria-labelledby="safety-heading" className="mt-8 scroll-mt-24">
          <Callout tone="warn">
            <h2 id="safety-heading" className="text-lg font-bold mb-2">Carbon monoxide: the rules that matter</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Run it outdoors, at least <strong>20 feet</strong> from windows, doors and attached garages (Ready.gov, CDC).</li>
              <li>Never indoors (Ready.gov), and never in an attached garage, even with the door open (NFPA).</li>
              <li>Put <strong>carbon monoxide alarms</strong> with battery backup on every level of the home (Ready.gov).</li>
              <li>Turn it off and let it cool before refueling. Store fuel in labeled containers made for it, outside living areas (NFPA).</li>
              <li>
                Generators caused an average of <strong>74 carbon monoxide deaths</strong> and about 4,314 medically treated poisonings a year
                in 2004-2021 (CPSC).
              </li>
              <li>
                CO shutoff features (UL 2201, ANSI/PGMA G300) are voluntary standards, not a legal requirement. They help; they do not replace
                the 20-foot rule.
              </li>
            </ul>
          </Callout>
        </section>

        <h2 id="calculator" className="text-2xl font-extrabold text-ink mt-10 mb-4 scroll-mt-24">Your generator, your outage</h2>
        <GeneratorCalc />

        <Section title="Watts you will run" id="watts">
          <p className="text-stone-700 max-w-3xl mb-4">
            Add the running watts of what you will plug in at once. Make sure the generator also covers the biggest starting load. Typical
            figures from the Eugene Water &amp; Electric Board&apos;s generator sizing sheet; your appliance&apos;s label is better.
          </p>
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface max-w-2xl">
            <table className="w-full text-sm">
              <caption className="sr-only">Typical running and starting watts for common household loads</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Load</th>
                  <th scope="col" className="p-3 font-semibold text-right">Running watts</th>
                  <th scope="col" className="p-3 font-semibold text-right">Extra to start</th>
                </tr>
              </thead>
              <tbody>
                {WATTS_ROWS.map((d) => (
                  <tr key={d.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{d.id === "fridge" ? "Refrigerator or freezer" : d.id === "phone" ? "Phone charger" : d.label.replace(/ \(.*\)$/, "")}{d.id === "well" || d.id === "furnace" ? " (1/3 HP)" : ""}</th>
                    <td className="p-3 text-right tabular-nums">{d.runW.toLocaleString("en-US")} W</td>
                    <td className="p-3 text-right tabular-nums">{d.startW ? `${d.startW.toLocaleString("en-US")} W` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-stone-700 mt-3 max-w-3xl">
            To work out a whole outage day, use the <Link href="/power-outage-backup-calculator" className="underline">power outage backup calculator</Link>.
          </p>
        </Section>

        <Section title="A battery instead?" id="battery">
          <p className="text-stone-700 leading-relaxed max-w-3xl">
            A portable power station makes no fumes, so it can sit next to the fridge or the CPAP indoors. It holds far less energy than a tank of
            fuel, but solar panels can top it up. For the fridge and essentials it is often enough; see{" "}
            <Link href="/power-station-for-refrigerator" className="underline">power stations for a refrigerator</Link> and{" "}
            <Link href="/best-portable-power-stations" className="underline">the best portable power stations</Link>.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Estimates only. Fuel use depends on your generator, its load and conditions; the maker&apos;s spec sheet and manual come first.
          Follow the manufacturer&apos;s instructions and local codes.
        </Disclaimer>
        <Sources items={sourcesFor(["readyGenerators", "readyOutage", "cdcCo", "cpscCo", "cpscStandards", "nfpa", "eweb"])} />
        <RelatedLinks links={relatedFor(PATH)} />
        <PhotoCredit name="outage" />
      </div>
    </div>
  );
}
