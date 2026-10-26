import type { Metadata } from "next";
import Link from "next/link";
import PurifyCalc from "@/components/PurifyCalc";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { HubHero, PhotoCredit } from "@/components/ui";
import { formatDate } from "@/lib/energy";
import {
  BLEACH_MAX_AGE_YEARS,
  BLEACH_REDOSE_WAIT_MIN,
  BLEACH_WAIT_MIN,
  CDC_1PCT_DROPS_PER_GAL,
  CDC_BLEACH_5GAL_DROPS,
  CDC_BOIL_ALT_FT,
  EPA_BLEACH_TABLE,
  EPA_BOIL_ALT_FT,
  IODINE_DROPS_PER_QUART,
  PREP_CHECKED,
  PREP_SOURCES as S,
  prepLinksFor,
} from "@/lib/prep";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/how-to-purify-water";
const TITLE = "How to Purify Water in an Emergency: Bleach, Boil, Filter";
const DESCRIPTION =
  "How many drops of bleach per gallon (6% vs 8.25%), how long to boil water at your elevation, and what boiling, bleach and filters cannot fix. From EPA and CDC.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const gal = EPA_BLEACH_TABLE.find((r) => r.id === "1gal")!;

export default function HowToPurifyWaterPage() {
  const faqs = [
    {
      q: "How much bleach do I add to a gallon of water?",
      a: `It depends on the strength on the label. EPA: ${gal.dose["6"]} of 6% bleach or ${gal.dose["8.25"]} of 8.25% bleach per gallon, using regular unscented bleach. Double it if the water is cloudy, colored or very cold. Stir, wait ${BLEACH_WAIT_MIN} minutes, and check for a slight chlorine smell.`,
    },
    {
      q: "How long do you boil water to make it safe?",
      a: `Bring it to a rolling boil for 1 minute. CDC says 3 minutes above ${CDC_BOIL_ALT_FT.toLocaleString("en-US")} feet; EPA says 3 minutes above ${EPA_BOIL_ALT_FT.toLocaleString("en-US")} feet. If you live between the two, boiling for 3 minutes satisfies both.`,
    },
    {
      q: "Does boiling or bleach remove chemicals?",
      a: "No. EPA says boiling or disinfection will not destroy heavy metals, salts and most other chemicals. CDC says water containing fuel, toxic chemicals or radioactive material cannot be made safe by boiling or disinfecting. Use stored or bottled water instead and contact your health department.",
    },
    {
      q: "Can I use scented or color-safe bleach?",
      a: `No. EPA says to use only regular, unscented chlorine bleach suitable for disinfection, and not scented, color-safe bleach or bleach with added cleaners. Use bleach stored at room temperature for less than ${BLEACH_MAX_AGE_YEARS} year.`,
    },
    {
      q: "Is a water filter enough on its own?",
      a: "Not for water of unknown quality. CDC says most portable filters remove parasites but not viruses or bacteria, and recommends adding a chemical disinfectant after filtering. To remove bacteria a filter needs a pore size of 0.3 micron or smaller; for parasites, 1 micron or smaller. A purifier made to the EPA purifier standard is designed to handle viruses too.",
    },
    {
      q: "What about iodine or purification tablets?",
      a: `EPA: ${IODINE_DROPS_PER_QUART} drops of 2% tincture of iodine per quart, 10 if cloudy, then wait ${BLEACH_WAIT_MIN} minutes. For tablets, follow the label. CDC says iodine and chlorine do not kill Cryptosporidium (chlorine dioxide does), and that pregnant people and people with thyroid problems should not drink iodine-treated water.`,
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Emergency Water Purification Calculator",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          dateModified: PREP_CHECKED,
        }}
      />
      <HubHero
        image="outage"
        crumbs={[{ name: "How to purify water", path: PATH }]}
        eyebrow="Emergency prep"
        title={<>Safe water, step by step. <span className="text-amber-300">Bleach drops and boil times that match the EPA.</span></>}
        sub={
          <>
            Check the strength on your bleach bottle, then add <strong className="text-amber-300">{gal.dose["8.25"]} of 8.25% bleach</strong>{" "}
            or {gal.dose["6"]} of 6% per gallon and wait {BLEACH_WAIT_MIN} minutes. Or boil it for 1 minute.
          </>
        }
      >
        <a href="#calculator" className="btn btn-primary">Bleach and boil calculator</a>
        <a href="#limits" className="btn btn-light">What it can&apos;t fix</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Figures checked <time dateTime={PREP_CHECKED}>{formatDate(PREP_CHECKED)}</time> against EPA and CDC.
        </p>
        <QuickAnswer>
          <p>
            <strong>Best:</strong> use water you stored or bottled water. <strong>Next:</strong> boil clear water at a rolling boil for 1
            minute (3 minutes at high elevation). <strong>If you can&apos;t boil:</strong> add regular unscented bleach, {gal.dose["6"]} of
            6% or {gal.dose["8.25"]} of 8.25% per gallon, double for cloudy or cold water, and wait {BLEACH_WAIT_MIN} minutes. None of
            these remove fuel or chemicals.
          </p>
        </QuickAnswer>

        <h2 id="calculator" className="text-2xl font-extrabold text-ink mt-10 mb-4 scroll-mt-24">Bleach and boil calculator</h2>
        <PurifyCalc />

        <Section title="EPA bleach table" id="table">
          <p className="text-stone-700 max-w-3xl mb-4">
            Regular, unscented chlorine bleach. Read the label: it should list 6% or 8.25% sodium hypochlorite. Copied from the EPA
            page, updated February 24, 2026.
          </p>
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">EPA bleach doses for disinfecting drinking water by volume and bleach strength</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Water</th>
                  <th scope="col" className="p-3 font-semibold">6% bleach</th>
                  <th scope="col" className="p-3 font-semibold">8.25% bleach</th>
                </tr>
              </thead>
              <tbody>
                {EPA_BLEACH_TABLE.map((r) => (
                  <tr key={r.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{r.label}</th>
                    <td className="p-3">{r.dose["6"]}</td>
                    <td className="p-3">{r.dose["8.25"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ol className="list-decimal pl-5 space-y-2 text-stone-700 max-w-3xl mt-4">
            <li>If the water is cloudy, let it settle, then pour it through a clean cloth, paper towel or coffee filter.</li>
            <li>Add the dose from the table. Double it for cloudy, colored or very cold water.</li>
            <li>Stir and let it stand {BLEACH_WAIT_MIN} minutes.</li>
            <li>It should smell slightly of chlorine. If not, repeat the dose and wait {BLEACH_REDOSE_WAIT_MIN} more minutes.</li>
            <li>Store it in clean containers with covers.</li>
          </ol>
          <p className="text-xs text-muted mt-3 max-w-3xl">
            CDC uses one figure for all bleach between 5% and 9%: 8 drops per gallon, {CDC_BLEACH_5GAL_DROPS} drops for 5 gallons. For
            1% bleach, CDC says {CDC_1PCT_DROPS_PER_GAL} drops per gallon. Where the two differ for 8.25% bleach, we show EPA&apos;s
            strength-specific figure.
          </p>
        </Section>

        <Section title="What boiling, bleach and filters can and cannot do" id="limits">
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[36rem]">
              <caption className="sr-only">What each water treatment method handles</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Method</th>
                  <th scope="col" className="p-3 font-semibold">Handles</th>
                  <th scope="col" className="p-3 font-semibold">Does not handle</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">Boiling</th>
                  <td className="p-3">Germs: CDC calls it the best way to kill germs in water</td>
                  <td className="p-3">Heavy metals, salts, most chemicals, fuel</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">Bleach</th>
                  <td className="p-3">Viruses and bacteria (CDC)</td>
                  <td className="p-3">May not kill parasites such as Cryptosporidium (CDC); chemicals, fuel</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">Chlorine dioxide tablets</th>
                  <td className="p-3">Germs including Cryptosporidium, when used as directed (CDC)</td>
                  <td className="p-3">Chemicals, fuel</td>
                </tr>
                <tr className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">Filter</th>
                  <td className="p-3">Most remove parasites; parasites need 1 micron or smaller, bacteria 0.3 micron or smaller (CDC)</td>
                  <td className="p-3">Viruses, and bacteria for most filters (CDC); chemicals unless certified for them</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Callout tone="warn">
            <strong>Floodwater and anything that smells of fuel:</strong> do not drink it. CDC says you cannot make water containing fuel,
            toxic chemicals or radioactive material safe by boiling or disinfecting it. Use stored or bottled water and call your
            health department.
          </Callout>
          <p className="text-stone-700 leading-relaxed max-w-3xl mt-4">
            Buying a filter? A purifier is built for water of unknown quality and handles viruses too. See{" "}
            <Link href="/best-emergency-water-filters" className="underline">emergency water filters ranked by certification</Link>,
            and plan how much to keep on hand with the{" "}
            <Link href="/emergency-water-storage-calculator" className="underline">water storage calculator</Link>.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          General information, not medical advice. If your utility issues a boil-water notice or other instructions, follow them.
        </Disclaimer>
        <Sources
          items={[
            { ...S.epaDisinfection, detail: "bleach table by strength, double for cloudy or cold, 30 + 15 minutes, iodine, 3 minutes above 5,000 ft; updated Feb 24 2026" },
            { ...S.cdcMakeSafe, detail: "1 minute rolling boil, 3 minutes above 6,500 ft; 5-9% and 1% bleach; filters and viruses; chemicals cannot be removed" },
            { ...S.cdcFilters, detail: "pore sizes and NSF 53 or 58 cyst reduction" },
          ]}
        />
        <RelatedLinks links={prepLinksFor(PATH)} />
        <PhotoCredit name="outage" />
      </div>
    </div>
  );
}
