import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { offPeakYearSaving, milesPerHourAt } from "@/components/chargers";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import PlugPicker, { type Car, type PlugRec } from "@/components/PlugPicker";
import { BigStat, HubHero, OurPick, PhotoCredit } from "@/components/ui";
import { INSTALL_COST, OTHER_CHARGERS } from "@/data/buyer-guides";
import { HOME_CHARGERS, chargerById, type HomeCharger } from "@/data/chargers";
import { MONTHLY_MILES, NATIONAL, evCostPer100, formatDate, gasCostPer100, nationalRateUsd, referenceEv } from "@/lib/energy";
import { money } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/best-home-ev-charger";
const TITLE = "Best Home EV Charger (2026): Level 2 Chargers Compared, With Prices";
const DESCRIPTION =
  "The best Level 2 home EV chargers for Teslas and every other EV: Lectron, Autel, Grizzl-E, Emporia, ChargePoint and Tesla compared on price, speed, plug (NACS or J1772) and app scheduling, with dated prices.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const otherById = (id: string) => OTHER_CHARGERS.find((c) => c.id === id)!;
const kwFor = (amps: number) => (amps * 240) / 1000;

function partnerRec(c: HomeCharger, why: string): PlugRec {
  return { name: `${c.brand === "lectron" ? "Lectron" : "Autel"} ${c.name}`, priceUsd: c.priceUsd, why, brand: c.brand, id: c.id, url: c.url };
}

export default function BestHomeEvChargerPage() {
  const lj = chargerById("lectron-nexus-j1772");
  const ln = chargerById("lectron-nexus-nacs");
  const lp = chargerById("lectron-portable-nacs");
  const a40 = chargerById("autel-elite-home-40a");
  const a50 = chargerById("autel-elite-home-50a");
  const grizzle = otherById("grizzle-classic-40a");
  const emporia = otherById("emporia-classic");
  const cp = otherById("chargepoint-home-flex");
  const tesla = otherById("tesla-wall-connector");

  const typical = referenceEv("typical");
  const yearSaving = ((gasCostPer100(NATIONAL.gasolineUsdPerGallon) - evCostPer100(nationalRateUsd(), typical.kwhPer100mi)) * MONTHLY_MILES * 12) / 100;
  const level1Mph = Math.round(milesPerHourAt(0.12 * 12));

  const recs: Record<Car, PlugRec[]> = {
    tesla: [
      partnerRec(ln, `Tesla plug, 40 amps, up to ${ln.milesPerHour} miles of range an hour, plugs into a 240-volt NEMA 14-50 outlet. ${money(tesla.priceUsd - ln.priceUsd)} less than Tesla's own.`),
      { name: tesla.name, priceUsd: tesla.priceUsd, why: "Faster (48 amps, up to 44 miles an hour) and a 4-year warranty, but it must be hardwired and Tesla said ownership was required while supplies were limited.", brand: null, id: tesla.id, url: tesla.url },
    ],
    nacs: [
      partnerRec(ln, `Same NACS plug as a Tesla, 40 amps, plugs into a NEMA 14-50 outlet. ETL listed and ENERGY STAR.`),
      partnerRec(lp, "Renting, or not ready to wire? This portable one works from an ordinary outlet or a 240-volt one and moves with you."),
    ],
    j1772: [
      partnerRec(lj, `Up to ${lj.milesPerHour} miles of range an hour from a NEMA 14-50 outlet, weatherproof, ${lj.warrantyYears}-year warranty.`),
      partnerRec(a40, `Adds app scheduling for cheaper overnight rates: every 5 cents a kWh off saves about ${money(Math.round(offPeakYearSaving()))} a year on 12,000 miles.`),
      { name: grizzle.name, priceUsd: grizzle.priceUsd, why: "The cheapest UL-listed 40-amp charger we found. No app.", brand: null, id: grizzle.id, url: grizzle.url },
    ],
  };
  const notes: Record<Car, string> = {
    tesla: "Teslas use the NACS plug (standardized as SAE J3400). A NACS charger plugs straight in; a J1772 charger works too with an adapter, which Lectron and others sell.",
    nacs: "More automakers now build cars with the NACS port. Check the port on your car or its manual: if it looks like a Tesla's, buy a NACS charger.",
    j1772: "J1772 is the round five-pin plug used by nearly every non-Tesla EV and plug-in hybrid sold in the US until recently. If you might switch to a NACS car later, an adapter bridges the gap.",
  };

  type Row = { name: string; brand: HomeCharger["brand"] | null; id: string; url: string; price: number; plug: string; amps: number; mph: string; app: string; cable: string; warranty: string };
  const partnerRows: Row[] = HOME_CHARGERS.filter((c) => c.level === "Level 2").map((c) => ({
    name: `${c.brand === "lectron" ? "Lectron" : "Autel"} ${c.name}`,
    brand: c.brand,
    id: c.id,
    url: c.url,
    price: c.priceUsd,
    plug: c.plug,
    amps: c.amps,
    mph: c.milesPerHour ? `${c.milesPerHour}` : `about ${Math.round(milesPerHourAt(c.maxKw ?? kwFor(c.amps)))}`,
    app: c.scheduling ? "Yes" : "Not stated",
    cable: c.cableFt ? `${c.cableFt} ft` : "Not stated",
    warranty: c.warrantyYears ? `${c.warrantyYears} yr` : "Not stated",
  }));
  const otherRows: Row[] = OTHER_CHARGERS.map((c) => ({
    name: c.name,
    brand: null,
    id: c.id,
    url: c.url,
    price: c.priceUsd,
    plug: c.plugs.join(" or "),
    amps: c.amps,
    mph: c.milesPerHour ? `${c.milesPerHour}` : `about ${Math.round(milesPerHourAt(kwFor(c.amps)))}`,
    app: c.wifi ? "Yes" : "No",
    cable: c.cableFt ? `${c.cableFt} ft` : "Not stated",
    warranty: c.warrantyYears ? `${c.warrantyYears} yr` : "Not stated",
  }));
  const rows = [...partnerRows, ...otherRows].sort((a, b) => a.price - b.price);

  const faqs = [
    {
      q: "What is the best Level 2 home EV charger?",
      a: `For most homes, the Lectron NEXUS (${money(lj.priceUsd)} when we checked): 40 amps, up to ${lj.milesPerHour} miles of range an hour, ETL listed to UL standards and ENERGY STAR, in J1772 or Tesla (NACS) versions at the same price. If your utility has cheaper overnight rates, the Autel MaxiCharger AC Elite Home 40A (${money(a40.priceUsd)}) adds app scheduling. On a tight budget, the Grizzl-E Classic (${money(grizzle.priceUsd)}) is the cheapest listed charger we found.`,
    },
    {
      q: "NACS or J1772: which home charger should I buy?",
      a: "Match the port on your car. Teslas and a growing number of newer EVs have the NACS (Tesla-style) port; most other EVs and plug-in hybrids have J1772. The charging speed is the same at home. If you might switch, buy for the car you have and keep an adapter for the other plug.",
    },
    {
      q: "Do I need a 48-amp or a 40-amp charger?",
      a: `A 40-amp charger adds roughly 30 to 40 miles of range an hour, which refills a typical day's driving in an hour or two overnight. A 48 or 50-amp charger must be hardwired on a 60 or 70-amp circuit and only helps cars that accept more than 9.6 kW. Most people never notice the difference.`,
    },
    {
      q: "Plug-in or hardwired?",
      a: `A plug-in charger uses a 240-volt NEMA 14-50 outlet (the kind for electric ranges and RVs), so you can take it with you when you move. Hardwired allows higher power and is often recommended outdoors. EnergySage puts the price difference in installation at about ${money(INSTALL_COST.hardwireVsPlug[0])} to ${money(INSTALL_COST.hardwireVsPlug[1])}.`,
    },
    {
      q: "Do I need a Level 2 charger at all?",
      a: `Not always. An ordinary 120-volt outlet adds about ${level1Mph} miles of range an hour, roughly ${level1Mph * 10} miles overnight, which covers many commutes. Level 2 refills even a long day's driving overnight.`,
    },
  ];

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${url(PATH)}#products`,
          name: "Home EV chargers",
          numberOfItems: rows.length,
          itemListElement: rows.map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: { "@type": "Product", name: r.name, url: r.url, offers: { "@type": "Offer", price: r.price, priceCurrency: "USD", url: r.url } },
          })),
        }}
      />
      <HubHero
        image="ev"
        crumbs={[
          { name: "EV charging cost", path: "/ev-charging-cost" },
          { name: "Best home EV charger", path: PATH },
        ]}
        eyebrow="Home EV chargers"
        title={<>Wake up full. <span className="text-amber-300">Save about {money(Math.round(yearSaving / 10) * 10)} a year over gas.</span></>}
        sub={
          <>
            A {money(lj.priceUsd)} Level 2 charger adds up to {lj.milesPerHour} miles of range an hour in your driveway, so you never
            stop for gas or hunt for a public charger again. Here is which one to buy for your car.
          </>
        }
      >
        <a href="#picker" className="btn btn-primary">Which one fits my car?</a>
        <a href="#compare" className="btn btn-light">Compare all</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Best for most homes:</strong>{" "}
            <PartnerLink brand="lectron" productId={lj.id} productUrl={lj.url}>Lectron NEXUS</PartnerLink> ({money(lj.priceUsd)}), 40 amps,
            ETL listed, ENERGY STAR, in{" "}
            <PartnerLink brand="lectron" productId={lj.id} productUrl={lj.url}>J1772</PartnerLink> or{" "}
            <PartnerLink brand="lectron" productId={ln.id} productUrl={ln.url}>Tesla (NACS)</PartnerLink> versions.
          </p>
          <p>
            <strong>Best smart charger:</strong>{" "}
            <PartnerLink brand="autel" productId={a40.id} productUrl={a40.url}>Autel MaxiCharger AC Elite Home 40A</PartnerLink> ({money(a40.priceUsd)}):
            schedules charging for cheap overnight rates.
          </p>
          <p className="text-sm">
            <strong>Cheapest:</strong> <PlainLink href={grizzle.url}>Grizzl-E Classic</PlainLink> ({money(grizzle.priceUsd)}, no app).{" "}
            <strong>Fastest for a Tesla:</strong> <PlainLink href={tesla.url}>Tesla Wall Connector</PlainLink> ({money(tesla.priceUsd)}, hardwired).
          </p>
        </QuickAnswer>

        <section aria-label="What it means" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat tone="leaf" value={`${money(Math.round(yearSaving))}/yr`} label="Saved vs gas, charging at home" note={`${typical.make} ${typical.model}, 12,000 miles, US average prices`} />
          <BigStat value={`${lj.milesPerHour} mi/hr`} label="Of range from a 40-amp charger" note={`vs about ${level1Mph} from a wall outlet`} />
          <BigStat tone="orange" value={money(Math.round(offPeakYearSaving()))} label="More a year with overnight rates" note="Per 5¢/kWh off-peak discount, with app scheduling" />
        </section>

        <section id="picker" className="mt-12 scroll-mt-24" aria-labelledby="picker-heading">
          <h2 id="picker-heading" className="text-2xl font-extrabold text-ink mb-2">NACS or J1772? Pick by your car</h2>
          <PlugPicker recs={recs} notes={notes} />
        </section>

        <section id="picks" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="picks-heading">
          <h2 id="picks-heading" className="text-2xl font-extrabold text-ink">Our picks</h2>
          <OurPick
            label="Best for most homes"
            name={`Lectron ${lj.name.replace(" (J1772)", "")}`}
            icon="plug"
            why={`Plugs into a 240-volt outlet, weatherproof for the driveway, listed to UL safety standards and ENERGY STAR certified, with a 23-foot cable. Same ${money(lj.priceUsd)} for the J1772 or Tesla (NACS) plug.`}
            life={[`Up to ${lj.milesPerHour} miles of range an hour`, `${lj.warrantyYears}-year warranty`]}
            priceUsd={lj.priceUsd}
            brand="lectron"
            productId={lj.id}
            productUrl={lj.url}
            category="home"
            cta="Check price: J1772"
          />
          <OurPick
            label="Best smart charger"
            name={`Autel ${a40.name}`}
            icon="chart"
            why={`The Autel Charge app starts, stops and schedules charging, so the car only charges in your utility's cheaper overnight hours. The hardwired 50-amp version (${money(a50.priceUsd)}) charges about a quarter faster for cars that can take it.`}
            life={[`About ${Math.round(milesPerHourAt(a40.maxKw!))} miles of range an hour`, `${a40.cableFt}-foot cable, ${a40.warrantyYears}-year warranty`]}
            priceUsd={a40.priceUsd}
            brand="autel"
            productId={a40.id}
            productUrl={a40.url}
            category="home"
          />
          <OurPick
            label="Best for renters and second homes"
            name={`Lectron ${lp.name}`}
            icon="car"
            why="Works from an ordinary outlet or a 240-volt one, adjustable from 8 to 40 amps, and goes with you when you move. Tesla (NACS) plug."
            life={["No installation if you have the outlet", "Ordinary or 240-volt outlet"]}
            priceUsd={lp.priceUsd}
            brand="lectron"
            productId={lp.id}
            productUrl={lp.url}
            category="home"
          />
        </section>

        <Section title="Every charger compared" id="compare">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[52rem]">
              <caption className="sr-only">Home EV chargers compared</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Charger</th>
                  <th scope="col" className="p-3 font-semibold text-right">Price*</th>
                  <th scope="col" className="p-3 font-semibold">Plug</th>
                  <th scope="col" className="p-3 font-semibold text-right">Amps</th>
                  <th scope="col" className="p-3 font-semibold text-right">Miles of range/hr</th>
                  <th scope="col" className="p-3 font-semibold">App</th>
                  <th scope="col" className="p-3 font-semibold text-right">Cable</th>
                  <th scope="col" className="p-3 font-semibold text-right">Warranty</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">
                      {r.brand ? <PartnerLink brand={r.brand} productId={r.id} productUrl={r.url}>{r.name}</PartnerLink> : <PlainLink href={r.url}>{r.name}</PlainLink>}
                    </th>
                    <td className="p-3 text-right tabular-nums">{money(r.price)}</td>
                    <td className="p-3">{r.plug}</td>
                    <td className="p-3 text-right tabular-nums">{r.amps}</td>
                    <td className="p-3 text-right tabular-nums">{r.mph}</td>
                    <td className="p-3">{r.app}</td>
                    <td className="p-3 text-right tabular-nums">{r.cable}</td>
                    <td className="p-3 text-right tabular-nums">{r.warranty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            *Prices and specs from each maker&apos;s US site: Lectron on {formatDate(lj.retrieved)}, Autel and the others on{" "}
            {formatDate(a40.retrieved)}. Miles per hour is the maker&apos;s figure where stated; &quot;about&quot; figures are our
            arithmetic for a {typical.kwhPer100mi} kWh/100 mi EV at the charger&apos;s full power. Your car may charge slower. Lectron
            and Autel links are sponsored; the others are plain links. Notes: {grizzle.note} {emporia.note} {cp.note}
          </p>
        </Section>

        <Section title="NACS vs J1772, in plain English" id="nacs-vs-j1772">
          <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
            <p>
              They are two shapes of plug, not two speeds. At home both deliver the same power for the same amps. <strong>NACS</strong>{" "}
              (the Tesla plug, standardized as SAE J3400) is on every Tesla and a growing number of newer EVs. <strong>J1772</strong> is
              the round plug on nearly every other EV and plug-in hybrid in the US.
            </p>
            <p>
              Buy the plug that matches your car today. Lectron sells the NEXUS in both at the same {money(lj.priceUsd)}, and adapters
              cover the other plug if your next car is different. Only buy Tesla&apos;s own Wall Connector if you want the extra speed and
              will hardwire it.
            </p>
          </div>
        </Section>

        <Section title="What installation costs" id="install">
          <p className="text-stone-700 leading-relaxed max-w-3xl">
            Installation usually costs more than the charger. Qmerit&apos;s 2026 data, published by EnergySage, puts the US average at{" "}
            {money(INSTALL_COST.usAverage)} for labor and materials, from {money(INSTALL_COST.byState.OR)} in Oregon to{" "}
            {money(INSTALL_COST.byState.MS)} in Mississippi. A plug-in charger next to an existing 240-volt outlet costs nothing to install.{" "}
            <Link href="/ev-charger-installation-cost" className="text-spark-orange font-semibold underline underline-offset-2">
              Estimate your installation cost by state
            </Link>
            .
          </p>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;You need the charger made by your car&apos;s brand.&quot;</strong> No. Any charger with the right plug works
              with any EV; the car controls how fast it charges.
            </Callout>
            <Callout>
              <strong>&quot;Cheap chargers are a fire risk.&quot;</strong> Unlisted ones can be. Buy a charger listed by a recognized lab
              (look for a UL or ETL mark), and have a licensed electrician install the circuit.
            </Callout>
            <Callout>
              <strong>&quot;Faster is always better.&quot;</strong> Many cars accept 7 to 11 kW at home. Past that, a bigger charger
              costs more to wire and does nothing; a 40-amp unit already refills a typical day overnight.
            </Callout>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Prices and specifications are copied from makers&apos; US websites on the dates shown and change often. Charging speed depends
          on your car. Have a licensed electrician install the circuit and check local permit rules. Savings use the US average electricity and gasoline
          prices on our methodology page; your rates differ.
        </Disclaimer>
        <Sources
          items={[
            ...HOME_CHARGERS.map((c) => ({ name: `${c.brand === "lectron" ? "Lectron" : "Autel"} ${c.name} product page`, url: c.sourceUrl, detail: `checked ${formatDate(c.retrieved)}` })),
            ...OTHER_CHARGERS.map((c) => ({ name: `${c.name} product page`, url: c.url, detail: `checked ${formatDate(c.retrieved)}` })),
            { name: INSTALL_COST.source, url: INSTALL_COST.url, detail: `checked ${formatDate(INSTALL_COST.retrieved)}` },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/ev-charger-installation-cost", label: "EV charger installation cost", desc: "Average price in your state, and what adds to it" },
            { href: "/ev-charging-cost", label: "EV charging cost calculator", desc: "What charging costs in your state vs gas" },
            { href: "/go-electric", label: "Go Electric savings", desc: "Add up an EV, solar and heat pump" },
            { href: "/states", label: "Your state's numbers", desc: "Electricity prices and charging costs by state" },
          ]}
        />
        <PhotoCredit name="ev" />
      </div>
    </article>
  );
}
