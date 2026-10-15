import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { BigStat, HubHero, MythCallout, OurPick, PhotoCredit } from "@/components/ui";
import { lite } from "@/data/myths";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import MonthlyBars from "@/components/MonthlyBars";
import { LAW_REVIEWED, STANDARDS, STATE_LAWS, lawFor } from "@/data/plugin-solar-law";
import { PLUGIN_KITS, ROOFTOP_SOLAR_COST, type PluginKit } from "@/data/products";
import { NATIONAL, SOURCES, STATES, formatDate, num, stateByAbbr, usd } from "@/lib/energy";
import { MOUNTING_LABEL, REFERENCE_KIT_W, pluginFigures, pluginModel } from "@/lib/plugin-solar";
import { AFFILIATES } from "@/data/affiliates";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/plug-in-solar";
const TITLE = "Plug-In Solar (Balcony Solar) in the US: State Laws, Kits & Payback";
const DESCRIPTION =
  "Is plug-in balcony solar legal in your state? A state-by-state table of 2025-2026 laws, how much an 800 W kit really makes in every state, safety rules, and real US kits with prices.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const perWatt = (k: PluginKit) => (k.panelW > 0 ? k.priceUsd / k.panelW : null);
const kitName = (k: PluginKit) => `${AFFILIATES[k.brand].name} ${k.name}`;

/** A real 800 W kit used as the payback example everywhere on this page. */
const EXAMPLE_KIT = PLUGIN_KITS.find((k) => k.id === "pluggedsolar-800w-kit")!;
const BUDGET_KIT = PLUGIN_KITS.find((k) => k.id === "brightsaver-360w-kit")!;

/** Average plug-in output per kW across the states, valued at the US average price: a "typical US home" figure for kit cards. */
const US_PLUGIN_KWH_PER_KW = STATES.reduce((n, s) => n + pluginModel(s.abbr).tilted.kwhPerKwYear, 0) / STATES.length;
const usValue = (k: PluginKit) => ((US_PLUGIN_KWH_PER_KW * k.panelW) / 1000) * (NATIONAL.residentialCentsPerKwhYtd / 100);

function KitCard({ k }: { k: PluginKit }) {
  const pw = perWatt(k);
  const value = usValue(k);
  return (
    <article className="bg-surface rounded-3xl border border-black/8 p-5 sm:p-6 shadow-sm" id={`kit-${k.id}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-spark-amber mb-1">{AFFILIATES[k.brand].name}</p>
      <h3 className="text-lg font-extrabold text-ink">{k.name}</h3>
      <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-end mt-2">
        <div>
          {value > 0 && (
            <p className="text-stone-800">
              <strong className="text-leaf text-lg">Up to {usd(value)} a year</strong> off a typical US bill
              {value > 0 ? `, paying for itself in about ${Math.round(k.priceUsd / value)} years` : ""}.
            </p>
          )}
          <ul className="list-disc pl-5 mt-2 text-sm text-stone-700 space-y-1">
            {k.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-semibold text-spark-orange">Specs</summary>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 mt-2">
              <dt className="text-muted">Panels included</dt>
              <dd className="font-medium">{k.panelW ? `${num(k.panelW)} W` : "None"}</dd>
              <dt className="text-muted">Inverter output</dt>
              <dd className="font-medium">{num(k.inverterW)} W</dd>
              <dt className="text-muted">Battery</dt>
              <dd className="font-medium">{k.batteryWh ? `${num(k.batteryWh)} Wh` : "None"}</dd>
              <dt className="text-muted">Certifications stated</dt>
              <dd className="font-medium">{k.certifications.join(", ")}</dd>
              {pw && (
                <>
                  <dt className="text-muted">Price per watt</dt>
                  <dd className="font-medium">{usd(pw, 2)}</dd>
                </>
              )}
              {k.states && (
                <>
                  <dt className="text-muted">Sold for</dt>
                  <dd className="font-medium">{k.states.join(", ")} only</dd>
                </>
              )}
            </dl>
          </details>
        </div>
        <div className="sm:text-right">
          <div className="text-2xl font-extrabold text-ink">
            {usd(k.priceUsd, k.priceUsd % 1 ? 2 : 0)}
            {k.listPriceUsd && (
              <span className="block text-xs font-normal text-muted">
                list <s>{usd(k.listPriceUsd)}</s>
              </span>
            )}
          </div>
          <div className="text-xs text-muted mb-2">when we checked*</div>
          <PartnerLink brand={k.brand} productId={k.id} productUrl={k.url} category="solar" className="btn btn-primary btn-sm">
            Check price
          </PartnerLink>
        </div>
      </div>
    </article>
  );
}

export default function PluginSolarPage() {
  const laws = STATE_LAWS.filter((l) => l.status === "law");
  const inEffect = laws.filter((l) => !l.effective || l.effective <= LAW_REVIEWED);
  const upcoming = laws.filter((l) => l.effective && l.effective > LAW_REVIEWED);
  const pending = STATE_LAWS.filter((l) => l.status === "pending");
  const ut = stateByAbbr("UT")!;
  const utF = pluginFigures(ut, REFERENCE_KIT_W, "tilted", EXAMPLE_KIT.priceUsd);
  const rows = [...STATES]
    .map((s) => ({
      s,
      law: lawFor(s.abbr),
      tilted: pluginFigures(s, REFERENCE_KIT_W, "tilted", EXAMPLE_KIT.priceUsd),
      railing: pluginFigures(s, REFERENCE_KIT_W, "vertical_s"),
      ew: pluginFigures(s, REFERENCE_KIT_W, "vertical_ew"),
    }))
    .sort((a, b) => a.s.name.localeCompare(b.s.name));
  const byPayback = [...rows].sort((a, b) => a.tilted.paybackYears! - b.tilted.paybackYears!);
  const best = byPayback[0];
  const worst = byPayback[byPayback.length - 1];
  const nameOf = (abbr: string) => stateByAbbr(abbr)!.name;
  const medianRow = byPayback[Math.floor(byPayback.length / 2)];
  const list = (xs: { abbr: string }[]) => xs.map((x) => nameOf(x.abbr)).join(", ");

  const faqs = [
    {
      q: "Is plug-in solar legal in the US?",
      a: `It depends on the state. As of ${formatDate(LAW_REVIEWED)}, ${laws.length} states have passed laws that let small plug-in solar kits connect without a utility interconnection agreement: ${list(inEffect)} (in effect) and ${list(upcoming)} (taking effect in 2027). ${pending.length ? `${list(pending)} has passed a bill that is not yet signed. ` : ""}Everywhere else, connecting any panel that feeds your home's wiring normally needs your utility's approval, so check with your utility first.`,
    },
    {
      q: "How much electricity does an 800 W plug-in solar kit produce?",
      a: `Between about ${num(Math.min(...rows.map((r) => r.tilted.kwhYear)))} and ${num(Math.max(...rows.map((r) => r.tilted.kwhYear)))} kWh a year on a south-facing stand, depending on the state, in our PVWatts model on ten years of NASA weather. Hung flat on a south-facing railing it makes roughly a third less, and on an east- or west-facing railing about half as much. The average US home uses about ${num(NATIONAL.avgMonthlyKwh * 12)} kWh a year, so a kit covers a small slice of the bill.`,
    },
    {
      q: "How long does plug-in solar take to pay for itself?",
      a: `For an 800 W kit costing ${usd(EXAMPLE_KIT.priceUsd)}, simple payback ranges from about ${best.tilted.paybackYears!.toFixed(0)} years in ${best.s.name} to about ${worst.tilted.paybackYears!.toFixed(0)} years in ${worst.s.name} at average electricity prices, and only if you use every kWh it makes at the moment it makes it. Power your home doesn't use flows to the grid, usually for no credit, so real payback is longer unless your daytime use is steady or the kit has a battery.`,
    },
    {
      q: "Can I plug a solar panel into any outlet?",
      a: "Only a kit built for it: a listed microinverter that shuts off instantly when the grid goes down, plugged straight into a wall outlet (not a power strip or extension cord), ideally a GFCI-protected one on a circuit with little else running. Most state laws cap kits at 1,200 W because a standard 15-amp circuit is rated for 1,800 W and the solar adds to what the wiring carries. Never use a homemade 'suicide cord' setup.",
    },
    {
      q: "Do I need to tell my utility?",
      a: "In some law states, yes: Virginia requires a notice form before you install, Maryland requires notice and a safety certification, Maine requires notice within 30 days above 420 W, and Colorado, New Hampshire and California let the utility ask for a simple notice or registration. Utah's law requires no notice. In states without a law, ask your utility before connecting anything.",
    },
    {
      q: "Is a portable power station with solar panels the same thing?",
      a: "No. A power station charges from its own panels and you plug appliances into it; nothing feeds back into your home's wiring, so no utility approval is needed in any state. It also gives you backup in an outage, which a plug-in kit without a battery cannot, because a grid-tied kit shuts off when the grid does.",
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
          dateModified: LAW_REVIEWED,
          author: { "@id": url("/about#editor") },
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${url(PATH)}#kits`,
          name: "Plug-in solar kits sold in the US",
          itemListElement: PLUGIN_KITS.map((k, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: kitName(k),
              brand: { "@type": "Brand", name: AFFILIATES[k.brand].name },
              url: k.url,
              offers: { "@type": "Offer", price: k.priceUsd, priceCurrency: "USD", url: k.url },
            },
          })),
        }}
      />
      <HubHero
        image="plugin-solar"
        crumbs={[{ name: "Plug-in solar", path: PATH }]}
        eyebrow="Plug-in solar"
        title={<>Solar for everyone. <span className="text-amber-300">Just plug it in.</span></>}
        sub={
          <>
            A small set of panels plugs into an ordinary outdoor outlet and powers your fridge, Wi-Fi and TV while the sun
            is up. No roof, no installer, no loan, and you can take it with you when you move. {laws.length} states now
            allow it without utility paperwork.
          </>
        }
      >
        <a href="#kits" className="btn btn-primary">See the kits we&apos;d buy</a>
        <a href="#laws" className="btn btn-light">Is it legal in my state?</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="text-sm text-muted mb-6">
        Laws checked against state legislature sites on <time dateTime={LAW_REVIEWED}>{formatDate(LAW_REVIEWED)}</time>.
      </p>
      <AffiliateDisclosure className="mb-8" />

      <section aria-label="What you get" className="grid sm:grid-cols-3 gap-3">
        <BigStat tone="leaf" value={`${usd(medianRow.tilted.valueYear)}/yr`} label="Off your bill, typical state" note={`An 800 W kit on a stand in ${medianRow.s.name}, if you use what it makes`} />
        <BigStat value={`${Math.round(medianRow.tilted.paybackYears!)} years`} label="To pay for itself" note={`The ${usd(EXAMPLE_KIT.priceUsd)} kit below; ${Math.round(best.tilted.paybackYears!)} years in ${best.s.name}`} />
        <BigStat tone="orange" value={`From ${usd(Math.min(...PLUGIN_KITS.map((k) => k.priceUsd)))}`} label="To get started" note="Smallest kit we list, at the seller's price" />
      </section>

      <h2 className="sr-only">Our picks</h2>
      <div className="mt-8 grid gap-4">
        <OurPick
          label="Our pick for most people"
          name={kitName(EXAMPLE_KIT)}
          icon="sun"
          why={`800 W fits under every state's cap, the seller lists the UL 3700 plug-in safety standard, and the app shows what you're making. In a sunny state it can knock ${usd(utF.valueYear)} a year off your bill.`}
          life={[`Up to ${usd(utF.valueYear)} a year in Utah`, `Covers your fridge and Wi-Fi in daylight`, "Moves with you", "No installer"]}
          priceUsd={EXAMPLE_KIT.priceUsd}
          brand={EXAMPLE_KIT.brand}
          productId={EXAMPLE_KIT.id}
          productUrl={EXAMPLE_KIT.url}
          category="solar"
        />
        <OurPick
          label="Our pick on a budget"
          name={kitName(BUDGET_KIT)}
          icon="plug"
          why="The cheapest way in, from the nonprofit behind many of the state plug-in solar laws. It only ships to states with a law, so you know it's allowed where it lands."
          priceUsd={BUDGET_KIT.priceUsd}
          brand={BUDGET_KIT.brand}
          productId={BUDGET_KIT.id}
          productUrl={BUDGET_KIT.url}
          category="solar"
          moreHref="#kits"
          moreLabel="Compare every kit"
        />
      </div>
      <p className="text-xs text-muted mt-2">*Price on the seller&apos;s site when we checked on {formatDate(EXAMPLE_KIT.retrieved)}.</p>

      <div className="mt-8 grid gap-3">
        <MythCallout m={lite("need-whole-system")} />
        <MythCallout m={lite("solar-cloudy")} />
      </div>

      <Callout>
        <strong>The short version:</strong> legal without utility approval in {list(inEffect)} today, and in{" "}
        {list(upcoming)} from 2027. It suits renters and anyone without a roof for full solar. A kit without a battery
        switches off in a blackout; for backup, pair panels with a <Link href="/best-portable-power-stations" className="underline">power station</Link>.
      </Callout>
      <div className="mt-8" />

      <nav aria-label="On this page" className="mt-8 text-sm">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {[
            ["#what", "What it is"],
            ["#output", "Output by state"],
            ["#cost", "Cost and payback"],
            ["#safety", "Safety"],
            ["#laws", "State laws"],
            ["#kits", "Kits you can buy"],
            ["#battery", "With a battery"],
          ].map(([h, l]) => (
            <li key={h}>
              <a href={h} className="text-spark-orange underline underline-offset-2">{l}</a>
            </li>
          ))}
        </ul>
      </nav>

      <Section title="How it works, in plain English" id="what">
        <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
          <p>
            A plug-in kit is one to four solar panels, usually 400 to 1,200 watts in total, wired to a{" "}
            <strong>microinverter</strong> that turns the panels&apos; direct current into household alternating
            current in step with the grid. You plug it into an outdoor or balcony outlet. Its power flows into that
            circuit and is used first by whatever is running in your home: the fridge, router, TV and other
            appliances that are always on. You buy less from the utility while the sun is up.
          </p>
          <p>
            The inverter is the safety-critical part. A listed one stops sending power within moments if the grid
            goes down, so the plug&apos;s pins are never live when unplugged and it cannot feed lines a utility
            worker is repairing. That also means a kit with no battery gives <strong>no backup power</strong> during
            an outage.
          </p>
          <p>
            Germany has made these kits common, but in the US connecting any generator to your home&apos;s wiring has
            traditionally needed a utility interconnection agreement. The new state laws exempt small kits from that
            process.
          </p>
        </div>
      </Section>

      <Section title="What it's worth where you live" id="output">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="text-stone-700 leading-relaxed space-y-4">
            <p>
              We ran the PVWatts solar model from the National Laboratory of the Rockies (formerly NREL) on ten years
              of hourly NASA weather for a large city in every state, for an {num(REFERENCE_KIT_W)} W kit mounted
              three ways:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>{MOUNTING_LABEL.tilted}</strong>: the best case, like a ground stand or flat roof.</li>
              <li><strong>{MOUNTING_LABEL.vertical_s}</strong>: a typical balcony.</li>
              <li><strong>{MOUNTING_LABEL.vertical_ew}</strong>: the average of east and west.</li>
            </ul>
            <p>
              In Utah, the first state with a law, an {num(REFERENCE_KIT_W)} W kit on a stand makes about{" "}
              <strong>{num(utF.kwhYear)} kWh a year</strong> ({num(utF.kwhMonthAvg)} a month on average), against an
              average Utah home&apos;s {num(ut.usage.avgMonthlyKwh)} kWh a month. Shade from railings, trees or the
              floor above can cut output sharply; the model assumes none.
            </p>
          </div>
          <MonthlyBars
            title={`Monthly output of an ${num(REFERENCE_KIT_W)} W kit on a south-facing stand near ${pluginModel("UT").city} (kWh)`}
            values={utF.monthlyKwh}
          />
        </div>
        <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface mt-6 max-h-[32rem]">
          <table className="w-full text-sm min-w-[40rem]">
            <caption className="sr-only">Yearly output, value and payback of an 800 W plug-in solar kit by state</caption>
            <thead className="bg-surface-light text-left sticky top-0">
              <tr>
                <th scope="col" className="p-3 font-semibold">State</th>
                <th scope="col" className="p-3 font-semibold text-right">kWh/yr, stand</th>
                <th scope="col" className="p-3 font-semibold text-right">kWh/yr, south railing</th>
                <th scope="col" className="p-3 font-semibold text-right">kWh/yr, east/west railing</th>
                <th scope="col" className="p-3 font-semibold text-right">Value/yr (stand)</th>
                <th scope="col" className="p-3 font-semibold text-right">Payback at {usd(EXAMPLE_KIT.priceUsd)}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ s, tilted, railing, ew }) => (
                <tr key={s.abbr} className="border-t border-black/6">
                  <th scope="row" className="p-3 font-medium">
                    <Link href={`/states/${s.slug}#solar`} className="text-spark-orange hover:underline">{s.name}</Link>
                  </th>
                  <td className="p-3 text-right tabular-nums">{num(tilted.kwhYear)}</td>
                  <td className="p-3 text-right tabular-nums">{num(railing.kwhYear)}</td>
                  <td className="p-3 text-right tabular-nums">{num(ew.kwhYear)}</td>
                  <td className="p-3 text-right tabular-nums">{usd(tilted.valueYear)}</td>
                  <td className="p-3 text-right tabular-nums">{tilted.paybackYears!.toFixed(1)} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-2 max-w-3xl">
          Value multiplies output by each state&apos;s average residential price ({SOURCES.electricityPrice.period}). It
          is an upper bound: it assumes every kWh replaces one you would have bought. Payback uses the{" "}
          {kitName(EXAMPLE_KIT)} at {usd(EXAMPLE_KIT.priceUsd)} and ignores mounts, shipping and any rate changes.
        </p>
      </Section>

      <Section title="What it costs, and how fast it pays you back" id="cost">
        <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
          <p>
            Kits we found on US sellers&apos; sites cost from{" "}
            {usd(Math.min(...PLUGIN_KITS.map((k) => perWatt(k)!)), 2)} to{" "}
            {usd(Math.max(...PLUGIN_KITS.map((k) => perWatt(k)!)), 2)} per watt of panels. Installed rooftop solar
            averages {usd(ROOFTOP_SOLAR_COST.perWatt, 2)} per watt nationally ({ROOFTOP_SOLAR_COST.source},{" "}
            {ROOFTOP_SOLAR_COST.typicalSystem}), with no 30% federal credit for homeowners since the end of 2025. So
            per watt, plug-in solar is similar or cheaper, but it is a small system: it trims a bill rather than
            replacing it.
          </p>
          <p>
            <strong>The catch is self-consumption.</strong> A kit only saves money on power you use while it is
            producing. Most homes draw a few hundred watts around the clock (fridge, freezer, router, standby loads),
            so a 400 W kit is mostly used at home, but at midday an 800 to 1,200 W kit can out-produce that base load.
            The surplus flows to the grid. Vermont&apos;s law says it is not paid for, Versant Power in Maine says the same, and in
            Connecticut it can even be billed as usage on meters that cannot net meter. A zero-export controller (some
            kits include one) or a battery fixes that by holding back or storing the surplus.
          </p>
          <p>
            <strong>Rule of thumb:</strong> size the kit to your daytime base load. Check it on your smart meter or
            utility app at midday when nobody is cooking or running the dryer.
          </p>
        </div>
      </Section>

      <Section title="Safe by design: what to look for" id="safety">
        <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Stay at or under 1,200 W</strong> (1,920 W in Colorado). A standard 15-amp, 120-volt circuit is
              rated for 1,800 W. Solar entering at an outlet can let appliances on that circuit draw more than the
              breaker sees, so the caps keep the wiring within its rating. Maine requires a dedicated circuit above 420 W.
            </li>
            <li>
              <strong>One kit, one wall outlet.</strong> Plug straight into a wall outlet, ideally a GFCI-protected
              outdoor one. No power strips, extension cords or adapters.
            </li>
            <li>
              <strong>A listed inverter with anti-islanding</strong> (it must shut off in a power cut). Look for the
              certifications below on the product, not just the website.
            </li>
            <li>
              <strong>Secure mounting.</strong> Panels on a balcony act like sails; use the maker&apos;s brackets and
              check your lease or HOA rules (several new laws limit bans but allow reasonable rules).
            </li>
          </ul>
          <dl className="space-y-3">
            {STANDARDS.map((s) => (
              <div key={s.name} className="bg-surface rounded-xl border border-black/8 p-4">
                <dt className="font-semibold">{s.name}</dt>
                <dd className="text-sm mt-1">
                  {s.summary}{" "}
                  <a href={s.url} className="underline underline-offset-2" rel="noopener">Source</a>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section title={`Plug-in solar laws by state (as of ${formatDate(LAW_REVIEWED)})`} id="laws">
        <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl mb-5">
          <p>
            Utah went first, in 2025. In 2026, {laws.length - 1} more states followed. Each law works the same way: it
            exempts small kits from the utility interconnection rules that otherwise apply to anything that sends power
            into your home&apos;s wiring. The details differ: wattage caps, whether you must notify the utility, which
            certification counts, and when it takes effect. Rules for leases, HOAs and local permits vary too.
          </p>
          <p>
            <strong>No law in your state?</strong> Then the normal rule applies: ask your utility before connecting
            anything. Bills have been introduced in other states; we list only bills we could confirm on a legislature
            website. Laws are summarized, not quoted; read the linked text and check with your utility.
          </p>
        </div>
        <ul className="grid md:grid-cols-2 gap-3">
          {rows
            .filter((r) => r.law)
            .map(({ s, law }) => {
              const future = law!.effective && law!.effective > LAW_REVIEWED;
              return (
                <li
                  key={s.abbr}
                  id={`state-${s.abbr.toLowerCase()}`}
                  className="bg-surface rounded-xl border border-black/8 p-4 scroll-mt-24 target:ring-2 target:ring-amber-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <Link href={`/states/${s.slug}`} className="font-bold text-spark-orange hover:underline">{s.name}</Link>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${law!.status === "pending" ? "bg-amber-100 text-amber-900" : future ? "bg-sky-100 text-sky-800" : "bg-green-100 text-green-800"}`}
                    >
                      {law!.status === "pending" ? "Bill pending" : future ? `Law from ${formatDate(law!.effective!)}` : "Law in effect"}
                      {law!.maxWatts ? ` · ${num(law!.maxWatts)} W max` : ""}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700">{law!.summary.charAt(0).toUpperCase() + law!.summary.slice(1)}</p>
                  <p className="text-xs text-muted mt-2">
                    <a href={law!.url} className="underline underline-offset-2" rel="noopener">{law!.bill}</a>. {law!.statusText}.
                  </p>
                </li>
              );
            })}
        </ul>
        <div className="mt-5 bg-surface-light rounded-xl border border-black/8 p-4">
          <h3 className="font-semibold mb-2">No plug-in solar law yet: check with your utility</h3>
          <p className="text-sm text-stone-700 leading-7">
            {rows
              .filter((r) => !r.law)
              .map(({ s }, i, arr) => (
                <span key={s.abbr} id={`state-${s.abbr.toLowerCase()}`} className="scroll-mt-24 target:bg-amber-200 target:rounded">
                  <Link href={`/states/${s.slug}`} className="hover:text-spark-orange hover:underline">{s.name}</Link>
                  {i < arr.length - 1 ? ", " : ""}
                </span>
              ))}
          </p>
        </div>
      </Section>

      <Section title="The kits you can buy in the US" id="kits">
        <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl mb-5">
          <p>
            These are 120-volt kits listed for sale to US addresses on the seller&apos;s own website, with prices
            checked on {formatDate(PLUGIN_KITS[0].retrieved)}. We list what each seller states about certification;
            check that a kit meets the standard your state&apos;s law names before you buy (for example UL 3700 in Maine
            and Vermont).
          </p>
        </div>
        <div className="space-y-4">
          {[...PLUGIN_KITS].sort((a, b) => a.priceUsd - b.priceUsd).map((k) => (
            <KitCard key={k.id} k={k} />
          ))}
        </div>
        <p className="text-xs text-muted mt-3 max-w-3xl">
          *Prices from each seller&apos;s US website on {formatDate(PLUGIN_KITS[0].retrieved)}; they change often.
          Bright Saver&apos;s price is its member price. Not listed: Anker&apos;s Solarbank, Bluetti&apos;s Balco,
          Jackery&apos;s balcony systems and Zendure&apos;s SolarFlow 800 and 2400, which are sold in Europe but not in
          US stores; Zendure&apos;s US SolarFlow kit was sold out.
        </p>
      </Section>

      <Section title="Want power in a blackout too? Add a battery" id="battery">
        <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
          <p>
            A battery stores midday surplus for the evening, which is where most of the extra savings come from. In
            Europe, all-in-one balcony batteries are common; in the US the choice is thin right now. EcoFlow&apos;s US
            store lists the STREAM microinverter, but its STREAM Ultra battery page was not available when we checked;
            Zendure&apos;s US SolarFlow kit was sold out; and CraftStrom&apos;s 2 kW + 3 kWh set ({usd(8199)}) has more
            panel power than any state&apos;s cap allows.
          </p>
          <p>
            <strong>The option that is legal everywhere:</strong> a portable power station with its own solar panels.
            It doesn&apos;t feed your home&apos;s wiring, so no utility approval is needed. You plug the fridge or a home
            office into it, it charges from the sun, and unlike a grid-tied kit it keeps working in a blackout.{" "}
            <Link href="/best-portable-power-stations" className="text-spark-orange underline underline-offset-2">
              Compare portable power stations
            </Link>{" "}
            or{" "}
            <Link href="/home-battery-backup" className="text-spark-orange underline underline-offset-2">
              see whole-home battery options
            </Link>
            .
          </p>
        </div>
      </Section>

      <Faq items={faqs} path={PATH} />
      <Disclaimer>
        This is a summary of state laws and seller claims, not legal or electrical advice. Laws, utility rules and
        prices change; read the linked law, ask your utility, and follow the kit maker&apos;s instructions.
      </Disclaimer>
      <Sources
        items={[
          ...STATE_LAWS.map((l) => ({ name: `${nameOf(l.abbr)} ${l.bill}`, url: l.url, detail: l.statusText })),
          ...STANDARDS.map((s) => ({ name: s.name, url: s.url })),
          { name: "Versant Power (Maine): balcony solar guidance", url: "https://www.versantpower.com/energy-solutions/clean-energy/balcony-solar", detail: "No bill credit for exported power" },
          { name: SOURCES.solar.name, url: SOURCES.solar.url, detail: "Same model, run for plug-in mounting positions (scripts/plugin_solar_model.py)" },
          { name: SOURCES.electricityPrice.name, url: SOURCES.electricityPrice.url, detail: SOURCES.electricityPrice.period },
          { name: "EnergySage: solar panel cost", url: ROOFTOP_SOLAR_COST.url, detail: `${usd(ROOFTOP_SOLAR_COST.perWatt, 2)}/W national average` },
          ...PLUGIN_KITS.map((k) => ({ name: `${kitName(k)} product page`, url: k.sourceUrl, detail: `checked ${formatDate(k.retrieved)}` })),
        ]}
      />
      <RelatedLinks
        links={[
          { href: "/solar-calculator", label: "Rooftop solar calculator", desc: "Size a full system for your bill" },
          { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Backup power that works in any state" },
          { href: "/states", label: "Your state's energy data", desc: "Electricity prices and solar output" },
          { href: "/incentives", label: "2026 incentives", desc: "What federal help remains" },
        ]}
      />
      <PhotoCredit name="plugin-solar" />
      </div>
    </article>
  );
}

