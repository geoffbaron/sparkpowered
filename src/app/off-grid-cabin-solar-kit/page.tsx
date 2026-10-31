import type { Metadata } from "next";
import Link from "next/link";
import CabinKitPicker from "@/components/offgrid/CabinKitPicker";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PriceFootnote } from "@/components/products";
import { AFFILIATES, type BrandId } from "@/data/affiliates";
import { DATA_UPDATED, STATES, formatDate } from "@/lib/energy";
import {
  CABIN_TIERS,
  CAMPER_VOLTS_URL,
  DEFAULT_AUTONOMY_DAYS,
  USABLE_FRACTION,
  dailyWh,
  decemberPerKwDay,
  fmtKwh,
  fmtW,
  fmtWh,
  matchStations,
  offGridStates,
  relatedFor,
  sizeOffGrid,
  sourcesFor,
  stationOptions,
  typicalWinterState,
} from "@/lib/offgrid";
import { money, productById } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/off-grid-cabin-solar-kit";
const TITLE = "Off-Grid Cabin Solar Kit: What Size You Need, by State";
const DESCRIPTION =
  "What size solar kit an off-grid cabin needs for weekend, part-time or full-time use, sized on your state's December sun, with the power stations that can carry it and dated prices.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

/**
 * Off-grid kit makers we link without a price (their kits vary too much to list one).
 * Each link lands on the maker's own off-grid kit range, never its bare home page;
 * every URL was opened and checked on Oct 31 2026.
 */
const KIT_BRANDS: { brand: BrandId; what: string; url: string }[] = [
  { brand: "sungold", what: "Cabin and tiny-home solar kits, inverters and batteries", url: "https://sungoldpower.com/collections/cabine-tiny-home-kits" },
  { brand: "signaturesolar", what: "Off-grid solar kits and components", url: "https://signaturesolar.com/kits-bundles/off-grid-solar-kits/" },
  { brand: "renogy", what: "Off-grid solar kits: panels, charge controllers, inverters and batteries", url: "https://www.renogy.com/collections/off-grid" },
  { brand: "goalzero", what: "Off-grid solar generators: power stations paired with solar panels", url: "https://goalzero.com/collections/off-grid-solar-systems-power" },
];

export default function CabinSolarKitPage() {
  const stations = stationOptions();
  const typical = typicalWinterState();
  const tDec = decemberPerKwDay(typical);
  const decs = STATES.map(decemberPerKwDay);
  const lo = Math.min(...decs);
  const hi = Math.max(...decs);
  const tiers = CABIN_TIERS.map((t) => {
    const wh = dailyWh(t.picks);
    const here = sizeOffGrid({ whPerDay: wh, perKwDay: tDec });
    return {
      t,
      wh,
      here,
      sunny: sizeOffGrid({ whPerDay: wh, perKwDay: hi }),
      dark: sizeOffGrid({ whPerDay: wh, perKwDay: lo }),
      match: matchStations(stations, here.batteryWh, { panelW: here.panelW, limit: 1 })[0],
    };
  });
  const [weekend, parttime, fulltime] = tiers;

  // Every station the picker can show, for the price dates and sources.
  const shown = new Set<string>();
  for (const s of STATES)
    for (const t of CABIN_TIERS) {
      const z = sizeOffGrid({ whPerDay: dailyWh(t.picks), perKwDay: decemberPerKwDay(s) });
      for (const m of matchStations(stations, z.batteryWh, { panelW: z.panelW })) shown.add(m.option.id);
    }
  const shownProducts = [...shown].map(productById);
  const usable = Math.round(USABLE_FRACTION * 100);

  const faqs = [
    {
      q: "What size solar kit do I need for an off-grid cabin?",
      a: `It depends on what you run and where. In ${typical.name}, a weekend cabin with LED lights, phone charging and a 12 V compressor cooler (about ${fmtWh(weekend.wh)} a day) needs about ${fmtW(weekend.here.panelW)} of panels and a ${fmtKwh(weekend.here.batteryWh)} battery. A part-time cabin with a full-size fridge and Wi-Fi (about ${fmtWh(parttime.wh)} a day) needs about ${fmtW(parttime.here.panelW)} and ${fmtKwh(parttime.here.batteryWh)}. Both are sized for December sun with ${DEFAULT_AUTONOMY_DAYS} days of storage.`,
    },
    {
      q: "Can a portable power station run an off-grid cabin?",
      a: `For a weekend or part-time cabin, often yes, if it takes enough solar input. ${weekend.match ? `The cheapest one we track for a weekend cabin in ${typical.name} is the ${weekend.match.option.name} at ${money(weekend.match.totalUsd)} when we checked.` : ""} A full-time home (about ${fmtWh(fulltime.wh)} a day) is beyond any power station we track: it needs about ${fmtW(fulltime.here.panelW)} of panels and ${fmtKwh(fulltime.here.batteryWh)} of battery, which means a component system.`,
    },
    {
      q: "Is a fridge or a 12 V cooler better for an off-grid cabin?",
      a: `For weekends, a 12 V compressor cooler uses far less power: about ${fmtWh(dailyWh([{ id: "cooler", count: 1 }]))} a day on a hot day (Dometic CFX3 35 spec) against about ${fmtWh(dailyWh([{ id: "fridge", count: 1 }]))} for an average kitchen fridge (EIA). If you live there or need the space, a full-size fridge is fine, but it sets the size of the whole system.`,
    },
    {
      q: "Do the kit prices include solar panels?",
      a: "No. The prices we show are for the power station and any add-on batteries from the maker's own US site on the date we checked. Panels, mounts and cables are extra, and prices change often.",
    },
    {
      q: "Why does the same cabin need a bigger kit in some states?",
      a: `Winter sun. In December, 1 kW of panels makes about ${hi.toFixed(2)} kWh a day in the sunniest state in our model and ${lo.toFixed(2)} kWh in the darkest, so the panel size for the same cabin varies by about ${Math.round(hi / lo)} times. Battery size depends only on use and days of storage.`,
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Cabin Solar Kit Sizer",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          browserRequirements: "Requires JavaScript",
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          dateModified: DATA_UPDATED,
        }}
      />
      <HubHero
        image="power-station"
        crumbs={[
          { name: "Off-grid solar calculator", path: "/off-grid-solar-calculator" },
          { name: "Cabin solar kit", path: PATH },
        ]}
        eyebrow="Off-grid cabins"
        title={<>The right kit for the cabin. <span className="text-amber-300">Not the biggest one.</span></>}
        sub={
          <>
            A weekend cabin needs about <strong className="text-amber-300">{fmtW(weekend.here.panelW)} of panels</strong> and a{" "}
            {fmtKwh(weekend.here.batteryWh)} battery in {typical.name}. A full-time home needs about {fmtW(fulltime.here.panelW)}. Pick your state
            and how you use the place.
          </>
        }
      >
        <a href="#picker" className="btn btn-primary">Size my cabin kit</a>
        <a href="#tiers" className="btn btn-light">The three sizes</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />
        <QuickAnswer>
          <p>
            <strong>Weekend cabin:</strong> about {fmtW(weekend.here.panelW)} of panels and {fmtKwh(weekend.here.batteryWh)} of battery in{" "}
            {typical.name}.
            {weekend.match && (
              <>
                {" "}The{" "}
                <PartnerLink brand={weekend.match.option.brand} productId={weekend.match.option.id} productUrl={weekend.match.option.url}>
                  {weekend.match.option.name}
                </PartnerLink>{" "}
                ({money(weekend.match.totalUsd)}) covers it.
              </>
            )}
          </p>
          <p>
            <strong>Part-time cabin with a fridge:</strong> about {fmtW(parttime.here.panelW)} and {fmtKwh(parttime.here.batteryWh)}.
            {parttime.match && (
              <>
                {" "}The cheapest station we track that carries it is the{" "}
                <PartnerLink brand={parttime.match.option.brand} productId={parttime.match.option.id} productUrl={parttime.match.option.url}>
                  {parttime.match.option.name}
                </PartnerLink>
                {parttime.match.addOns > 0 ? ` with ${parttime.match.addOns} add-on batteries` : ""} ({money(parttime.match.totalUsd)}).
              </>
            )}
          </p>
          <p>
            <strong>Full-time home:</strong> about {fmtW(fulltime.here.panelW)} and {fmtKwh(fulltime.here.batteryWh)}. That is a component system,
            not a power station.
          </p>
        </QuickAnswer>

        <h2 id="picker" className="text-2xl font-extrabold text-ink mt-10 mb-4 scroll-mt-24">Your cabin, your state</h2>
        <CabinKitPicker states={offGridStates()} stations={stations} fallbackAbbr={typical.abbr} />
        <PriceFootnote products={shownProducts} />

        <Section title="The three sizes" id="tiers">
          <p className="text-stone-700 max-w-3xl mb-4">
            Example load lists, sized for December with {DEFAULT_AUTONOMY_DAYS} days of lithium storage ({usable}% usable). Panel size runs from the
            sunniest December in our model to the darkest. For your own list, use the{" "}
            <Link href="/off-grid-solar-calculator" className="underline">off-grid solar calculator</Link>.
          </p>
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Off-grid cabin solar kit sizes for weekend, part-time and full-time use</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Use</th>
                  <th scope="col" className="p-3 font-semibold text-right">A day</th>
                  <th scope="col" className="p-3 font-semibold text-right">Panels in {typical.name}</th>
                  <th scope="col" className="p-3 font-semibold text-right">Panels, sunniest to darkest state</th>
                  <th scope="col" className="p-3 font-semibold text-right">Battery</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map(({ t, wh, here, sunny, dark }) => (
                  <tr key={t.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">
                      {t.label}
                      <span className="block text-xs text-muted font-normal">{t.blurb}</span>
                    </th>
                    <td className="p-3 text-right tabular-nums">{fmtWh(wh)}</td>
                    <td className="p-3 text-right tabular-nums">{fmtW(here.panelW)}</td>
                    <td className="p-3 text-right tabular-nums">{fmtW(sunny.panelW)} to {fmtW(dark.panelW)}</td>
                    <td className="p-3 text-right tabular-nums">{fmtKwh(here.batteryWh)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="All-in-one station or component system?" id="type">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              <strong>All-in-one power station.</strong> Battery, inverter and solar charge controller in one box. Plug the panels in and go. It
              suits a weekend or part-time cabin, and you can take it home in an outage. The limit is how many watts of solar it accepts.
            </p>
            <p>
              <strong>Component system.</strong> Separate panels, charge controller, inverter and battery bank. It scales to a full-time home. Check with your county about permits before you buy. The US Department of Energy notes that the
              equipment besides the panels, such as batteries, controllers and inverters, could be half the cost of a stand-alone system.
            </p>
            <Callout>
              Our sizes assume you use the cabin in December. A summer-only cabin needs fewer panels; the battery size stays the same, because
              it depends on use, not sun.
            </Callout>
          </div>
        </Section>

        <Section title="Off-grid kit makers" id="makers">
          <p className="text-stone-700 max-w-3xl mb-3">
            For component systems. Kits and prices vary too much to list one; take your panel and battery numbers to them.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3">
            {KIT_BRANDS.map((k) => (
              <li key={k.brand} className="bg-surface rounded-xl border border-black/8 p-4">
                <PartnerLink brand={k.brand} productUrl={k.url}>{AFFILIATES[k.brand].name}</PartnerLink>
                <span className="block text-sm text-muted mt-1">{k.what}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-stone-700 mt-4">
            For vans and RVs, see <a href={CAMPER_VOLTS_URL} className="underline" rel="noopener">Camper Volts</a>.
          </p>
        </Section>

        <p className="text-sm text-muted mt-10">
          Solar data updated <time dateTime={DATA_UPDATED}>{formatDate(DATA_UPDATED)}</time>.
        </p>
        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Estimates only. Real needs depend on your appliances, site, shade and snow. Prices and specifications are copied from makers&apos; US
          websites on the dates shown and change often.
        </Disclaimer>
        <Sources
          items={[
            ...sourcesFor(["pvwatts", "doeFormula", "doeBos", "recsFridge", "recsAppliances", "eweb", "doeLed", "router", "phone", "cooler"]),
            ...shownProducts.map((p) => ({ name: `${AFFILIATES[p.brand].name} ${p.model} product page`, url: p.sourceUrl, detail: `checked ${formatDate(p.retrieved)}` })),
          ]}
        />
        <RelatedLinks links={relatedFor(PATH)} />
        <PhotoCredit name="power-station" />
      </div>
    </div>
  );
}
