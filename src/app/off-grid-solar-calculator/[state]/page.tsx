import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MonthlyBars from "@/components/MonthlyBars";
import OffGridCalc from "@/components/offgrid/OffGridCalc";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { DATA_UPDATED, STATES, formatDate, ordinal, stateBySlug } from "@/lib/energy";
import {
  CABIN_TIERS,
  CAMPER_VOLTS_URL,
  DEFAULT_AUTONOMY_DAYS,
  ESSENTIALS,
  PANEL_WATTS,
  USABLE_FRACTION,
  bestMonth,
  dailyWh,
  decemberPerKwDay,
  fmtKwh,
  fmtW,
  fmtWh,
  medianDecember,
  offGridStates,
  sizeOffGrid,
  sourcesFor,
} from "@/lib/offgrid";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const HUB = "/off-grid-solar-calculator";

export function generateStaticParams() {
  return STATES.map((s) => ({ state: s.slug }));
}

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const s = stateBySlug(state);
  if (!s) return {};
  const size = sizeOffGrid({ whPerDay: dailyWh(ESSENTIALS), perKwDay: decemberPerKwDay(s) });
  return pageMetadata({
    title: `${s.name} Off-Grid Solar Calculator: Winter Sizing`,
    description: `Off-grid solar in ${s.name}: 1 kW of panels makes about ${decemberPerKwDay(s).toFixed(2)} kWh a day in December. Essentials need about ${fmtW(size.panelW)} of panels and a ${fmtKwh(size.batteryWh)} battery.`,
    path: `${HUB}/${s.slug}`,
  });
}

/** States with the closest December output, for internal links. */
function peers(abbr: string, dec: number) {
  return STATES.filter((x) => x.abbr !== abbr)
    .sort((a, b) => Math.abs(decemberPerKwDay(a) - dec) - Math.abs(decemberPerKwDay(b) - dec))
    .slice(0, 4);
}

export default async function OffGridStatePage({ params }: Props) {
  const { state } = await params;
  const s = stateBySlug(state);
  if (!s) notFound();

  const path = `${HUB}/${s.slug}`;
  const dec = decemberPerKwDay(s);
  const best = bestMonth(s);
  const pctOfBest = Math.round((dec / best.perKwDay) * 100);
  const median = medianDecember();
  const vsMedian = Math.round(((dec - median) / median) * 100);
  const rank = [...STATES].sort((a, b) => decemberPerKwDay(b) - decemberPerKwDay(a)).findIndex((x) => x.abbr === s.abbr) + 1;
  const essentialsWh = dailyWh(ESSENTIALS);
  const ess = sizeOffGrid({ whPerDay: essentialsWh, perKwDay: dec });
  const summerPanelW = essentialsWh / best.perKwDay;
  const tiers = CABIN_TIERS.map((t) => ({ t, size: sizeOffGrid({ whPerDay: dailyWh(t.picks), perKwDay: dec }) }));
  const near = peers(s.abbr, dec);
  const usable = Math.round(USABLE_FRACTION * 100);
  const compare =
    Math.abs(vsMedian) < 3
      ? "about the same as the middle state"
      : `${Math.abs(vsMedian)}% ${vsMedian > 0 ? "more" : "less"} than the middle state`;

  const faqs = [
    {
      q: `How much solar do I need to live off grid in ${s.name}?`,
      a: `Size for December. Near ${s.solar.city}, 1 kW of panels makes about ${dec.toFixed(2)} kWh a day in December in the PVWatts model. A fridge, Wi-Fi, four LED bulbs and two phone charges (${fmtWh(essentialsWh)} a day) need about ${fmtW(ess.panelW)} of panels and a ${fmtKwh(ess.batteryWh)} lithium battery for ${DEFAULT_AUTONOMY_DAYS} days with little sun. A full-time home with a freezer, well pump and furnace blower needs about ${fmtW(tiers[2].size.panelW)} and ${fmtKwh(tiers[2].size.batteryWh)}.`,
    },
    {
      q: `Is ${s.name} good for off-grid solar in winter?`,
      a: `${s.name} ranks ${ordinal(rank)} of ${STATES.length} states and DC for December solar output in our model, ${compare}. December output is ${pctOfBest}% of ${best.name}, the best month here, so a system sized for winter has plenty of spare power in summer.`,
    },
    {
      q: `How big a battery bank do I need off grid in ${s.name}?`,
      a: `Battery size depends on use, not on sun: daily watt-hours × days of storage ÷ the usable share (${usable}% for lithium). For ${fmtWh(essentialsWh)} a day and ${DEFAULT_AUTONOMY_DAYS} days, that is ${fmtKwh(ess.batteryWh)}. The US Department of Energy advises sizing for cloudy stretches and keeping a backup generator.`,
    },
    {
      q: `Why does winter matter so much for off-grid solar in ${s.name}?`,
      a: `Short days and low sun. To cover the same ${fmtWh(essentialsWh)} a day, panels near ${s.solar.city} would need only about ${fmtW(summerPanelW)} in ${best.name} but ${fmtW(ess.panelW)} in December. Off grid, there is no utility to cover the gap, so the winter number is the one to buy.`,
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(path)}#app`,
          name: `${s.name} Off-Grid Solar Calculator`,
          url: url(path),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          browserRequirements: "Requires JavaScript",
          description: `Off-grid solar panel and battery sizing for ${s.name}, from December PVWatts output.`,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          dateModified: DATA_UPDATED,
          about: { "@type": "State", name: s.name, containedInPlace: { "@type": "Country", name: "United States" } },
        }}
      />
      <HubHero
        image="solar-roof"
        crumbs={[
          { name: "Off-grid solar calculator", path: HUB },
          { name: s.name, path },
        ]}
        eyebrow={`Off-grid solar in ${s.name}`}
        title={<>{s.name} off grid: <span className="text-amber-300">size for December.</span></>}
        sub={
          <>
            Near {s.solar.city}, 1 kW of panels makes about <strong className="text-amber-300">{dec.toFixed(2)} kWh a day</strong> in December,{" "}
            {pctOfBest}% of what it makes in {best.name}. The essentials need about {fmtW(ess.panelW)} of panels and a {fmtKwh(ess.batteryWh)} battery.
          </>
        }
      >
        <a href="#calculator" className="btn btn-primary">Size my system</a>
        <a href="#tiers" className="btn btn-light">Cabin and home sizes</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Solar data updated <time dateTime={DATA_UPDATED}>{formatDate(DATA_UPDATED)}</time> ·{" "}
          <Link href={HUB} className="underline underline-offset-2 hover:text-spark-orange">All states</Link>
        </p>
        <QuickAnswer>
          <p>
            {s.name} ranks <strong>{ordinal(rank)} of {STATES.length}</strong> for December sun, {compare}. For a fridge, Wi-Fi, four LED bulbs
            and two phone charges ({fmtWh(essentialsWh)} a day), plan on about <strong>{fmtW(ess.panelW)} of panels</strong> ({ess.panels} ×{" "}
            {PANEL_WATTS} W) and a <strong>{fmtKwh(ess.batteryWh)}</strong> lithium battery for {DEFAULT_AUTONOMY_DAYS} days with little sun.
          </p>
        </QuickAnswer>

        <h2 id="calculator" className="text-2xl font-extrabold text-ink mt-10 mb-4 scroll-mt-24">Size an off-grid system in {s.name}</h2>
        <OffGridCalc states={offGridStates()} fixedAbbr={s.abbr} fallbackAbbr={s.abbr} />

        <Section title={`Solar output through the year near ${s.solar.city}`} id="monthly">
          <MonthlyBars title={`kWh per month from 1 kW of panels near ${s.solar.city}, ${s.name}`} values={s.solar.monthlyKwhPerKw} />
          <p className="text-sm text-stone-700 mt-3 max-w-3xl">
            December gives {Math.round(s.solar.monthlyKwhPerKw[11])} kWh per kW for the month; {best.name} gives{" "}
            {Math.round(s.solar.monthlyKwhPerKw[best.month])}. A system sized for {best.name} would fall short every winter.
          </p>
        </Section>

        <Section title={`Cabin and home sizes in ${s.name}`} id="tiers">
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Off-grid solar and battery size in {s.name} for three example cabins and homes</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Use</th>
                  <th scope="col" className="p-3 font-semibold text-right">A day</th>
                  <th scope="col" className="p-3 font-semibold text-right">Panels</th>
                  <th scope="col" className="p-3 font-semibold text-right">Battery ({DEFAULT_AUTONOMY_DAYS} days)</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map(({ t, size }) => (
                  <tr key={t.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">
                      {t.label}
                      <span className="block text-xs text-muted font-normal">{t.blurb}</span>
                    </th>
                    <td className="p-3 text-right tabular-nums">{fmtWh(size.whPerDay)}</td>
                    <td className="p-3 text-right tabular-nums">{fmtW(size.panelW)}</td>
                    <td className="p-3 text-right tabular-nums">{fmtKwh(size.batteryWh)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-stone-700 mt-3 max-w-3xl">
            See <Link href="/off-grid-cabin-solar-kit" className="underline">which kits fit each size</Link>, or{" "}
            <Link href="/how-to-go-off-grid" className="underline">what going off grid costs</Link>.
          </p>
          <p className="text-sm text-stone-700 mt-3 max-w-3xl">
            These sizes assume panels at a 20 degree tilt. A steeper tilt, which also sheds snow, catches more low winter sun, and many
            off-grid homes in the far north run a generator for the darkest weeks rather than buying panels for December alone.
          </p>
          <Callout>
            For vans and RVs, see <a href={CAMPER_VOLTS_URL} className="underline" rel="noopener">Camper Volts</a>.
          </Callout>
        </Section>

        <Section title="Similar winter sun" id="similar">
          <ul className="flex flex-wrap gap-2">
            {near.map((x) => (
              <li key={x.abbr}>
                <Link href={`${HUB}/${x.slug}`} className="inline-block rounded-full border border-black/15 bg-white px-3 py-1.5 text-sm hover:border-amber-300">
                  {x.name}: {decemberPerKwDay(x).toFixed(2)} kWh per kW a day
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Faq items={faqs} path={path} />
        <Disclaimer>
          Estimates only. Output is modeled near {s.solar.city}; mountains, coast, shade and snow change it. Size a real system with an installer
          or an off-grid supplier before you buy.
        </Disclaimer>
        <Sources items={sourcesFor(["pvwatts", "pvwattsApi", "doeFormula", "doeBos", "recsFridge", "recsAppliances", "eweb", "doeLed", "router", "phone", "resmed", "cooler", "agm"])} />
        <RelatedLinks
          links={[
            { href: HUB, label: "Off-grid solar calculator", desc: "All 50 states and DC compared" },
            { href: "/off-grid-cabin-solar-kit", label: "Cabin solar kit size", desc: "Weekend, part-time or full-time" },
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "Keep the essentials on through an outage" },
            { href: "/generator-runtime-calculator", label: "Generator runtime and fuel", desc: "Backup for the darkest weeks" },
            { href: `/states/${s.slug}`, label: `${s.name} energy data`, desc: "Electricity prices and grid-tied solar" },
            { href: "/emergency-water-storage-calculator", label: "Emergency water storage", desc: "Gallons to store for your household" },
          ]}
        />
        <PhotoCredit name="solar-roof" />
      </div>
    </div>
  );
}
