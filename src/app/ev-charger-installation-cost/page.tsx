import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import InstallCostCalc, { type ChargerChoice } from "@/components/InstallCostCalc";
import { BigStat, HubHero, PhotoCredit } from "@/components/ui";
import { INSTALL_COST, OTHER_CHARGERS } from "@/data/buyer-guides";
import { brandName, chargerById } from "@/data/chargers";
import { MONTHLY_MILES, NATIONAL, STATES, evCostPer100, formatDate, gasCostPer100, nationalRateUsd, referenceEv } from "@/lib/energy";
import { money } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

const PATH = "/ev-charger-installation-cost";
const TITLE = "How Much Does It Cost to Install a Home EV Charger? (2026, by State)";
const DESCRIPTION =
  "Home EV charger installation costs $2,442 on average in 2026 (Qmerit data), from $1,834 in Oregon to $3,680 in Mississippi. See your state, what adds to the bill, and an all-in estimate with the charger.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

export default function InstallCostPage() {
  const c = INSTALL_COST;
  const lj = chargerById("lectron-nexus-j1772");
  const ln = chargerById("lectron-nexus-nacs");
  const a40 = chargerById("autel-elite-home-40a");
  // Our pick: the lowest-priced charger we found (see /best-home-ev-charger).
  const ej = chargerById("eviqo-l2-j1772");
  const en = chargerById("eviqo-nacs-40a");
  const grizzle = OTHER_CHARGERS.find((x) => x.id === "grizzle-classic-40a")!;
  const tesla = OTHER_CHARGERS.find((x) => x.id === "tesla-wall-connector")!;

  const states = STATES.filter((s) => c.byState[s.abbr]).map((s) => ({ abbr: s.abbr, name: s.name, slug: s.slug, avg: c.byState[s.abbr] }));
  const sorted = [...states].sort((a, b) => a.avg - b.avg);
  const cheapest = sorted[0];
  const dearest = sorted[sorted.length - 1];

  const typical = referenceEv("typical");
  const yearSaving = ((gasCostPer100(NATIONAL.gasolineUsdPerGallon) - evCostPer100(nationalRateUsd(), typical.kwhPer100mi)) * MONTHLY_MILES * 12) / 100;
  const allIn = c.usAverage + ej.priceUsd;
  const cheapestCharger = Math.min(ej.priceUsd, grizzle.priceUsd);
  const payback = allIn / yearSaving;

  const chargers: ChargerChoice[] = [
    { id: ej.id, label: "EVIQO Level 2 40A plug-in / 48A hardwired (J1772), app scheduling", priceUsd: ej.priceUsd, brand: "eviqo", url: ej.url },
    { id: lj.id, label: "Lectron NEXUS 40A (J1772)", priceUsd: lj.priceUsd, brand: "lectron", url: lj.url },
    { id: ln.id, label: "Lectron NEXUS 40A (Tesla / NACS)", priceUsd: ln.priceUsd, brand: "lectron", url: ln.url },
    { id: en.id, label: "EVIQO NACS 40A (Tesla / NACS), app scheduling", priceUsd: en.priceUsd, brand: "eviqo", url: en.url },
    { id: a40.id, label: "Autel MaxiCharger 40A, app scheduling", priceUsd: a40.priceUsd, brand: "autel", url: a40.url },
    { id: grizzle.id, label: "Grizzl-E Classic 40A, no app", priceUsd: grizzle.priceUsd, brand: null, url: grizzle.url },
    { id: tesla.id, label: "Tesla Wall Connector 48A", priceUsd: tesla.priceUsd, brand: null, url: tesla.url },
  ];

  const faqs = [
    {
      q: "How much does it cost to install a home EV charger?",
      a: `Qmerit's 2026 data, published by EnergySage, puts the US average installation price at ${money(c.usAverage)} for labor and materials, not counting the charger, and the typical range at ${money(c.typicalRange[0])} to ${money(c.typicalRange[1])}. Add ${money(cheapestCharger)} to about ${money(tesla.priceUsd)} for a Level 2 charger. If you already have a 240-volt outlet where you park, a plug-in charger costs nothing to install.`,
    },
    {
      q: "What makes EV charger installation expensive?",
      a: `Mostly your electrical panel and the distance. EnergySage's ranges: a long 60 to 80-foot wire run adds ${money(c.longRun[0])} to ${money(c.longRun[1])}, a subpanel ${money(c.subpanel[0])} to ${money(c.subpanel[1])}, and a full service upgrade ${money(c.serviceUpgrade[0])} to ${money(c.serviceUpgrade[1])} or more. Permits run ${money(c.permit[0])} to ${money(c.permit[1])} depending on where you live.`,
    },
    {
      q: "Can I avoid a panel upgrade?",
      a: "Often. Ask the electrician for a load calculation first. A lower-amp circuit (32 instead of 40 or 48 amps) still refills a typical day's driving overnight, and chargers with load management, such as the Emporia Pro, slow down when the house is using a lot so you can stay within your panel's limit.",
    },
    {
      q: "Is there a tax credit for installing an EV charger in 2026?",
      a: "The federal charger credit (30C) is not allowed for property placed in service after June 30, 2026, per the IRS. Many utilities and states still offer rebates for chargers or installation, sometimes only for smart chargers that can schedule charging; check your utility's website and our incentives page.",
    },
    {
      q: "Plug-in or hardwired: which is cheaper to install?",
      a: `Plug-in is usually a little cheaper and lets you take the charger with you; EnergySage puts the difference at about ${money(c.hardwireVsPlug[0])} to ${money(c.hardwireVsPlug[1])}. Hardwiring is needed above 40 amps and is often recommended outdoors.`,
    },
  ];

  return (
    <article>
      <HubHero
        image="ev"
        crumbs={[
          { name: "Best home EV charger", path: "/best-home-ev-charger" },
          { name: "Installation cost", path: PATH },
        ]}
        eyebrow="Home charger installation"
        title={<>About {money(allIn)} all in. <span className="text-amber-300">Paid back in about {Math.round(payback * 2) / 2} years of skipped gas.</span></>}
        sub={
          <>
            The average home charger installation costs {money(c.usAverage)} in 2026, plus about {money(ej.priceUsd)} for the charger.
            Charging at home instead of buying gas saves about {money(Math.round(yearSaving))} a year. Here is your state&apos;s number.
          </>
        }
      >
        <a href="#calc" className="btn btn-primary">Estimate my cost</a>
        <a href="#states" className="btn btn-light">Cost by state</a>
        <Link href="/ev-charger-picker" className="btn btn-light">Which charger do I need?</Link>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Average: {money(c.usAverage)} to install</strong> (labor and materials, Qmerit 2026 via EnergySage), from{" "}
            {money(cheapest.avg)} in {cheapest.name} to {money(dearest.avg)} in {dearest.name}. Plus the charger: our pick, the{" "}
            <PartnerLink brand="eviqo" productId={ej.id} productUrl={ej.url} disclose>EVIQO Level 2</PartnerLink>, was {money(ej.priceUsd)}{" "}
            when we checked. For a Tesla, the{" "}
            <PartnerLink brand="lectron" productId={ln.id} productUrl={ln.url} disclose>Lectron NEXUS NACS</PartnerLink> was {money(ln.priceUsd)}.
          </p>
          <p>
            <strong>Already have a 240-volt outlet in the garage?</strong> A plug-in charger installs for $0.{" "}
            <strong>Older 100-amp panel?</strong> Budget {money(c.serviceUpgrade[0])} to {money(c.serviceUpgrade[1])} more for an upgrade,
            or ask about a lower-amp circuit or load management first.
          </p>
        </QuickAnswer>

        <section aria-label="Key numbers" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat value={money(c.usAverage)} label="Average installation, 2026" note="Qmerit data via EnergySage, charger not included" />
          <BigStat tone="leaf" value={`${money(Math.round(yearSaving))}/yr`} label="Saved vs gas by charging at home" note={`${typical.make} ${typical.model}, 12,000 miles, US average prices`} />
          <BigStat tone="orange" value="$0" label="If you already have the outlet" note="Plug-in chargers use a NEMA 14-50" />
        </section>

        <section id="calc" className="mt-12 scroll-mt-24" aria-labelledby="calc-heading">
          <h2 id="calc-heading" className="text-2xl font-extrabold text-ink mb-2">Estimate your all-in cost</h2>
          <InstallCostCalc
            states={states.map(({ abbr, name, avg }) => ({ abbr, name, avg }))}
            usAverage={c.usAverage}
            chargers={chargers}
            extras={{
              longRun: { label: "Parking spot is far from the panel (60 to 80 ft of wire)", range: c.longRun },
              subpanel: { label: "Panel is full and needs a subpanel", range: c.subpanel },
              serviceUpgrade: { label: "Old or small panel needs a service upgrade", range: c.serviceUpgrade },
            }}
          />
        </section>

        <Section title="What goes into the price" id="breakdown">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface max-w-3xl">
            <table className="w-full text-sm">
              <caption className="sr-only">EV charger installation cost items</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Item</th>
                  <th scope="col" className="p-3 font-semibold text-right">Typical cost</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Level 2 charger", `${money(cheapestCharger)} to ${money(tesla.priceUsd)} (our table)`],
                  ["Installation, standard job", `${money(c.typicalRange[0])} to ${money(c.typicalRange[1])}`],
                  ["New 240-volt circuit (parts)", `${money(c.newCircuit[0])} to ${money(c.newCircuit[1])}`],
                  ["Permit", `${money(c.permit[0])} to ${money(c.permit[1])}`],
                  ["Long wire run (60 to 80 ft)", `+${money(c.longRun[0])} to ${money(c.longRun[1])}`],
                  ["Subpanel", `+${money(c.subpanel[0])} to ${money(c.subpanel[1])}`],
                  ["Service (panel) upgrade", `+${money(c.serviceUpgrade[0])} to ${money(c.serviceUpgrade[1])}+`],
                ].map(([k, v]) => (
                  <tr key={k} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{k}</th>
                    <td className="p-3 text-right tabular-nums">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            Ranges from EnergySage (updated June 22, 2026), checked {formatDate(c.retrieved)}; the standard-job range is Qmerit&apos;s.
            Charger prices from the makers&apos; US sites.
          </p>
        </Section>

        <Section title="Average installation cost in every state" id="states">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Average home EV charger installation cost by state, 2026</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">State</th>
                  <th scope="col" className="p-3 font-semibold text-right">Average installation</th>
                  <th scope="col" className="p-3 font-semibold text-right">With a {money(ej.priceUsd)} charger</th>
                </tr>
              </thead>
              <tbody>
                {states.map((s) => (
                  <tr key={s.abbr} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">
                      <Link href={`/states/${s.slug}`} className="underline underline-offset-2 hover:text-spark-orange">{s.name}</Link>
                    </th>
                    <td className="p-3 text-right tabular-nums">{money(s.avg)}</td>
                    <td className="p-3 text-right tabular-nums">{money(s.avg + ej.priceUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2">
            Qmerit 2026 data as published by EnergySage; labor and materials, charger not included. State names link to each state&apos;s
            electricity prices and EV charging costs.
          </p>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;Every EV owner needs a $5,000 electrical upgrade.&quot;</strong> No. The average installation is{" "}
              {money(c.usAverage)}, and a plug-in charger next to an existing 240-volt outlet costs nothing to install. Panel upgrades
              are the exception, and load management can often avoid them.
            </Callout>
            <Callout>
              <strong>&quot;I can just use an extension cord.&quot;</strong> Don&apos;t. Charging draws high current for hours; charger makers
              generally warn against extension cords. Use the outlet directly or have a circuit installed.
            </Callout>
            <Callout>
              <strong>&quot;A Level 2 charger is required.&quot;</strong> Not always: an ordinary outlet adds roughly 45 miles
              overnight, enough for many commutes. See{" "}
              <Link href="/ev-charging-cost#home-charger" className="underline">do you need one?</Link>
            </Callout>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          Averages are not quotes. Your price depends on your panel, the distance, local labor rates and permits. Always use a licensed
          electrician and pull a permit where required. Charger prices are from makers&apos; US sites on the dates shown.
        </Disclaimer>
        <Sources
          items={[
            { name: c.source, url: c.url, detail: `checked ${formatDate(c.retrieved)}` },
            { name: "IRS: FAQs on modification of sections 25C, 25D, 25E, 30C, 30D, 45L, 45W and 179D (Public Law 119-21)", url: "https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-act-obbb", detail: "not allowed for property placed in service after June 30, 2026" },
            ...[ej, en, lj, ln].map((x) => ({ name: `${brandName(x)} ${x.name} product page`, url: x.sourceUrl, detail: `checked ${formatDate(x.retrieved)}` })),
            { name: `Autel ${a40.name} product page`, url: a40.sourceUrl, detail: `checked ${formatDate(a40.retrieved)}` },
            { name: `${grizzle.name} product page`, url: grizzle.url, detail: `checked ${formatDate(grizzle.retrieved)}` },
            { name: `${tesla.name} product page`, url: tesla.url, detail: `checked ${formatDate(tesla.retrieved)}` },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/best-home-ev-charger", label: "Best home EV charger", desc: "EVIQO, Lectron, Autel, Tesla and more compared" },
            { href: "/ev-charging-cost", label: "EV charging cost calculator", desc: "What charging costs in your state vs gas" },
            { href: "/incentives", label: "2026 incentives", desc: "What federal help is left and where to find rebates" },
            { href: "/states", label: "All state data", desc: "Electricity prices and charging costs by state" },
          ]}
        />
        <p className="text-sm text-muted mt-4">
          Comparing smart chargers for utility rebates? See the <PlainLink href={OTHER_CHARGERS[1].url}>Emporia</PlainLink> and our picks on the{" "}
          <Link href="/best-home-ev-charger" className="underline">charger guide</Link>.
        </p>
        <PhotoCredit name="ev" />
      </div>
    </article>
  );
}
