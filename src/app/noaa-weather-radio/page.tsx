import type { Metadata } from "next";
import Link from "next/link";
import NwrFinder from "@/components/NwrFinder";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import { HubHero, PhotoCredit } from "@/components/ui";
import { RADIO_PRODUCTS } from "@/data/prep-products";
import { STATES, formatDate } from "@/lib/energy";
import { NWR_FREQUENCIES_MHZ, NWR_SAME_PHONE, NWR_TRANSMITTERS, PREP_CHECKED, PREP_SOURCES as S, prepLinksFor } from "@/lib/prep";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/noaa-weather-radio";
const TITLE = "NOAA Weather Radio: Find Your Station, Frequency and SAME Code";
const DESCRIPTION =
  "What NOAA Weather Radio is, the seven frequencies, how to find your local station and county SAME code from the National Weather Service, and what to look for in a radio.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function NoaaWeatherRadioPage() {
  const states = STATES.map((s) => ({ abbr: s.abbr, name: s.name }));
  const wr120 = RADIO_PRODUCTS.find((p) => p.id === "midland-wr120")!;
  const er310 = RADIO_PRODUCTS.find((p) => p.id === "midland-er310")!;
  const freqList = `${NWR_FREQUENCIES_MHZ.slice(0, -1).join(", ")} and ${NWR_FREQUENCIES_MHZ[NWR_FREQUENCIES_MHZ.length - 1]} MHz`;

  const faqs = [
    {
      q: "What frequency is NOAA Weather Radio?",
      a: `NOAA Weather Radio broadcasts on seven frequencies: ${freqList}. Which one you need depends on your nearest transmitter; the National Weather Service lists them by state and by county.`,
    },
    {
      q: "What is a SAME code?",
      a: `SAME (Specific Area Message Encoding) is a 6-digit code for your county. Program it into a SAME radio and it sounds an alert only for the areas you choose. A first digit of 0 means the whole county; the next two digits are the state and the last three the county. Look yours up on the NWS county list, or call ${NWR_SAME_PHONE}.`,
    },
    {
      q: "Do I need a special radio for NOAA weather alerts?",
      a: "Yes. The National Weather Service says NOAA Weather Radio needs a special receiver or scanner that can pick up the signal. Ready.gov lists a NOAA Weather Radio with tone alert in its basic emergency kit.",
    },
    {
      q: "What should I look for in a weather radio?",
      a: "The National Weather Service recommends the Public Alert or NOAA Weather Radio All Hazards logo, a tone alarm that sounds even with the volume off, SAME county programming, and battery backup for power cuts. Some radios also have an external antenna jack or a jack for strobe lights or bed shakers.",
    },
    {
      q: "Does NOAA Weather Radio cover more than weather?",
      a: "Yes. It is an all-hazards network: alongside National Weather Service warnings, watches and forecasts, it carries non-weather emergencies such as earthquakes, chemical releases and AMBER alerts, 24 hours a day.",
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
          citation: [S.nwr.url, S.nwrReceivers.url, S.nwrSame.url],
        }}
      />
      <HubHero
        image="outage"
        crumbs={[{ name: "NOAA Weather Radio", path: PATH }]}
        eyebrow="Emergency prep"
        title={<>The alert that works with no power. <span className="text-amber-300">Set up NOAA Weather Radio.</span></>}
        sub={
          <>
            More than {NWR_TRANSMITTERS.toLocaleString("en-US")} transmitters broadcast National Weather Service warnings around the
            clock. Find your station and county code, then pick a radio that wakes you for alerts.
          </>
        }
      >
        <a href="#finder" className="btn btn-primary">Find my station</a>
        <a href="#radios" className="btn btn-light">What to buy</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />
        <QuickAnswer>
          <p>
            Buy a radio with the Public Alert logo, SAME and battery backup. Program it with your county&apos;s 6-digit SAME code and
            your local station from the National Weather Service lists below. It will then sound only for warnings in your area,
            even if the power is out.
          </p>
        </QuickAnswer>

        <section id="finder" className="mt-10 scroll-mt-24" aria-labelledby="finder-heading">
          <h2 id="finder-heading" className="text-2xl font-extrabold text-ink mb-2">Find your station and SAME code</h2>
          <NwrFinder states={states} />
          <p className="text-sm text-muted mt-3">
            Territories and the full list: <PlainLink href={S.nwrStations.url}>NWS station listing</PlainLink> ·{" "}
            <PlainLink href={S.nwrCounties.url}>NWS county listing</PlainLink>. Prefer the phone? Call {NWR_SAME_PHONE}.
          </p>
        </section>

        <Section title="What NOAA Weather Radio is" id="what">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              NOAA Weather Radio All Hazards is the National Weather Service&apos;s own broadcast network. More than{" "}
              {NWR_TRANSMITTERS.toLocaleString("en-US")} transmitters cover all 50 states, coastal waters, Puerto Rico, the US Virgin
              Islands and the US Pacific Territories. It carries warnings, watches and forecasts 24 hours a day, plus non-weather
              emergencies such as chemical releases and AMBER alerts.
            </p>
            <p>It uses seven frequencies. NWS says you need a special receiver or scanner to pick them up.</p>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="NOAA Weather Radio frequencies">
            {NWR_FREQUENCIES_MHZ.map((f) => (
              <li key={f} className="rounded-full bg-surface border border-black/10 px-3 py-1 text-sm font-semibold tabular-nums">{f} MHz</li>
            ))}
          </ul>
        </Section>

        <Section title="SAME codes, in plain English" id="same">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              A plain weather radio sounds for every alert its transmitter sends, which can cover many counties. A SAME radio lets you
              enter your county&apos;s 6-digit code so it sounds only for warnings that include you.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>First digit: 0 for the whole county; another number for part of a county.</li>
              <li>Next two digits: your state or territory.</li>
              <li>Last three digits: your county, parish or independent city.</li>
            </ul>
            <Callout>
              NWS warns: do not program a louder or clearer station unless it is designated for your county, or you may miss alerts. Program
              the station the county list gives you.
            </Callout>
          </div>
        </Section>

        <Section title="What to look for in a radio" id="radios">
          <ul className="list-disc pl-5 space-y-2 text-stone-700 max-w-3xl">
            <li>
              <strong>Public Alert or NOAA Weather Radio All Hazards logo.</strong> NWS recommends it. The Public Alert standard
              (CTA-2009) requires the tone alarm, SAME and battery backup below.
            </li>
            <li><strong>Tone alarm.</strong> NWS sends a 1050 Hz tone before most warnings and many watches; it sets off the alarm even with the volume off.</li>
            <li><strong>SAME.</strong> So it sounds only for your county.</li>
            <li><strong>Battery backup.</strong> NWS calls it crucial during power outages.</li>
            <li><strong>Optional:</strong> an external antenna jack for weak signals, or a jack for strobe lights and bed shakers.</li>
          </ul>
          <p className="text-stone-700 mt-4 max-w-3xl">
            A hand-crank radio is a good second radio for an outage, but many lack SAME and the Public Alert logo, so they cannot wake
            you for a warning in your county only. Ready.gov&apos;s kit list has both: a battery or hand-crank radio and a NOAA Weather
            Radio with tone alert.
          </p>

          <div className="grid gap-3 mt-6">
            {[wr120, er310].map((p) => (
              <article key={p.id} className="rounded-2xl bg-white border border-black/10 p-5" data-testid="prep-product">
                <h3 className="text-lg font-extrabold text-ink">{p.name}</h3>
                <p className="text-sm text-muted mt-1">{p.use}</p>
                <p className="text-stone-800 mt-2">{p.claim}</p>
                <ul className="mt-2 list-disc pl-5 text-sm text-stone-700 space-y-1">
                  {p.caveats.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm">
                  {p.brand && (
                    <PartnerLink brand={p.brand} productUrl={p.url}>See it at {p.maker}</PartnerLink>
                  )}
                  <span className="text-xs text-muted"> · Claim read on the maker&apos;s page on {formatDate(p.checked)}</span>
                </p>
              </article>
            ))}
          </div>
          <p className="text-sm text-stone-700 mt-4 max-w-3xl">
            <PlainLink href="https://etoncorp.com/">Eton</PlainLink> also makes hand-crank NOAA radios. Check a model&apos;s page for SAME
            and the Public Alert logo before you buy.
          </p>
        </Section>

        <p className="text-sm text-muted mt-8">
          Put the radio on your <Link href="/emergency-kit-checklist" className="underline">emergency kit checklist</Link>, and keep spare
          batteries for it.
        </p>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Station and county details change. Always use the current National Weather Service lists linked above.
        </Disclaimer>
        <Sources
          items={[
            { ...S.nwr, detail: "more than 1000 transmitters; coverage; all-hazards broadcasts; seven frequencies" },
            { ...S.nwrStations, detail: "transmitters by state" },
            { ...S.nwrCounties, detail: "SAME codes and stations by county" },
            { ...S.nwrSame, detail: "6-digit code structure; 1-888-NWR-SAME; programming advice" },
            { ...S.nwrReceivers, detail: "Public Alert (CTA-2009-C), 1050 Hz tone, SAME, battery backup, accessory jacks" },
            { ...S.readyKit, detail: "battery or hand-crank radio and a NOAA Weather Radio with tone alert" },
            ...[wr120, er310].map((p) => ({ name: `${p.name} product page`, url: p.sourceUrl, detail: `checked ${formatDate(p.checked)}` })),
          ]}
        />
        <RelatedLinks links={prepLinksFor(PATH)} />
        <PhotoCredit name="outage" />
      </div>
    </article>
  );
}
