import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { HubHero, MythCallout, OurPick, PhotoCredit } from "@/components/ui";
import { lite } from "@/data/myths";
import { lifeSummary } from "@/lib/everyday";
import { PriceFootnote, ProductListJsonLd, SpecTable } from "@/components/products";
import { INSTALLED_BATTERY_COST, PRODUCTS, type Product } from "@/data/products";
import { NATIONAL, POWERWALL_3_KWH, SOURCES, formatDate, num } from "@/lib/energy";
import { fullName, installedPerKwh, kwh, maxWh, money, productById, watts } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

const PATH = "/home-battery-backup";
const TITLE = "Home Battery Backup: Whole-Home vs Portable, Real Costs (2026)";
const DESCRIPTION =
  "Whole-home batteries like Powerwall 3 and Enphase vs plug-in systems like EcoFlow DELTA Pro Ultra and portable power stations: real specs, 2026 prices and installed costs, and how to size one.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const ES_COST_URL = "https://www.energysage.com/energy-storage/how-much-do-batteries-cost/";

function InstalledTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
      <table className="w-full text-sm min-w-[46rem]">
        <caption className="sr-only">Professionally installed home batteries</caption>
        <thead className="bg-surface-light text-left">
          <tr>
            <th scope="col" className="p-3 font-semibold">Battery</th>
            <th scope="col" className="p-3 font-semibold text-right">Usable capacity</th>
            <th scope="col" className="p-3 font-semibold text-right">Continuous power</th>
            <th scope="col" className="p-3 font-semibold">Chemistry</th>
            <th scope="col" className="p-3 font-semibold text-right">Warranty</th>
            <th scope="col" className="p-3 font-semibold text-right">Avg installed $/kWh†</th>
            <th scope="col" className="p-3 font-semibold text-right">One unit, installed†</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-black/6 align-top">
              <th scope="row" className="p-3 font-medium">
                <PartnerLink brand={p.brand} productId={p.id} productUrl={p.url} category="battery">{fullName(p)}</PartnerLink>
              </th>
              <td className="p-3 text-right tabular-nums">{kwh(p.capacityWh)}</td>
              <td className="p-3 text-right tabular-nums">{watts(p.acOutputW)}</td>
              <td className="p-3">{p.chemistry ?? "Not stated"}</td>
              <td className="p-3 text-right tabular-nums">{p.warrantyYears ? `${p.warrantyYears} yr` : "—"}</td>
              <td className="p-3 text-right tabular-nums">{money(installedPerKwh(p))}</td>
              <td className="p-3 text-right tabular-nums">about {money(Math.round((installedPerKwh(p) * p.capacityWh) / 1000 / 100) * 100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HomeBatteryBackupPage() {
  const installed = PRODUCTS.filter((p) => p.install === "professional");
  const plugInHome = PRODUCTS.filter((p) => p.install === "diy" && (p.category === "home" || p.capacityWh >= 3000))
    .sort((a, b) => b.capacityWh - a.capacityWh);
  const portable = PRODUCTS.filter((p) => p.category === "portable" && p.capacityWh < 3000 && p.capacityWh >= 1000)
    .sort((a, b) => (a.priceUsd ?? 0) - (b.priceUsd ?? 0));
  const usDaily = NATIONAL.avgMonthlyKwh / (365 / 12);
  const cheapestPortable = portable[0];
  const priced = [...plugInHome, ...portable];
  const essentials = productById("ecoflow-delta-3-max");
  const wholeHome = productById("anker-solix-f3800-plus");
  const installedPick = productById("tesla-powerwall-3");
  const tiers = [
    { label: "2 kWh power station", life: lifeSummary(2048), note: `Like the ${fullName(essentials)}. No install, about ${money(essentials.priceUsd!)}.` },
    { label: `${kwh(wholeHome.capacityWh)} home system`, life: lifeSummary(wholeHome.capacityWh), note: "Plug-in system plus an electrician for home circuits." },
    { label: `${POWERWALL_3_KWH} kWh installed battery`, life: lifeSummary(POWERWALL_3_KWH * 1000 / 0.85), note: "Usable capacity of one Powerwall 3; automatic, whole-home." },
  ];

  const faqs = [
    {
      q: "How much does a whole-home battery backup cost in 2026?",
      a: `Installed home batteries averaged about ${money(INSTALLED_BATTERY_COST.medianPerKwh)} per kWh of capacity in EnergySage's marketplace in the first half of 2026, before incentives, so one ${POWERWALL_3_KWH} kWh battery runs roughly $13,000 to $16,000 installed depending on brand. Backing up a whole home for longer outages often takes two or more units. Plug-in systems cost less per kWh at listed prices but need an electrician to connect them to your home's circuits.`,
    },
    {
      q: "Can a portable power station back up my house?",
      a: "It can back up the things you plug into it: a fridge, CPAP, router, lights or a sump pump on a cord. Larger models with 240-volt output and a transfer switch or smart panel, installed by an electrician, can run selected home circuits. They don't switch over automatically for hard-wired loads unless connected through such a panel.",
    },
    {
      q: "How big a battery do I need to keep the fridge and essentials running?",
      a: `Our sizer assumes essentials (fridge, lights, internet, phone charging) use about 5 kWh a day, so 12 hours needs about 3 kWh of battery and a full day about 6 kWh. The average US home uses ${usDaily.toFixed(1)} kWh a day, so whole-home backup for a day takes roughly ${Math.ceil(usDaily / 0.85)} kWh. Use the battery sizer for your own answer.`,
    },
    {
      q: "Is there still a tax credit for home batteries?",
      a: "Not for homeowners who buy one: the IRS says the 30% Residential Clean Energy Credit (25D) does not apply to expenditures after 31 December 2025. Some states and utilities offer storage rebates or pay for battery capacity during grid emergencies; check DSIRE for your state.",
    },
    {
      q: "Whole-home battery or generator?",
      a: "A standby generator runs as long as it has fuel and handles big loads, but needs maintenance, fuel and an outdoor install, and makes noise and fumes. A battery is silent, needs no fuel and can recharge from solar, but runs out unless solar refills it. Many people back up essentials with a battery and accept that central air or electric heat won't run in a long outage.",
    },
  ];

  return (
    <article>
      <ProductListJsonLd products={[...installed, ...plugInHome]} path={PATH} name="Home battery backup systems" />
      <HubHero
        image="home-battery"
        crumbs={[{ name: "Home battery backup", path: PATH }]}
        eyebrow="Home battery backup"
        title={<>Storm outside. <span className="text-amber-300">Lights on inside.</span></>}
        sub={
          <>
            A home battery switches on by itself when the grid goes down. The fridge stays cold, the Wi-Fi stays up and the
            house stays quiet: no generator to start, no fuel to store, no fumes. Start with a $900 battery for the
            essentials or go whole-home.
          </>
        }
      >
        <a href="#picks" className="btn btn-primary">See our picks</a>
        <Link href="/battery-calculator" className="btn btn-light">Find the right size</Link>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AffiliateDisclosure className="mb-8" />

      <section aria-labelledby="keeps-heading">
        <h2 id="keeps-heading" className="text-2xl font-extrabold text-ink mb-4">What each size keeps running</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {tiers.map((t) => (
            <div key={t.label} className="rounded-2xl bg-white border border-black/8 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">{t.label}</p>
              <p className="text-3xl font-extrabold text-leaf mt-1">{t.life.essentials}</p>
              <p className="font-semibold text-ink">of fridge, Wi-Fi, lights and phones</p>
              <p className="text-sm text-muted mt-2">{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="picks" className="mt-10 grid gap-4 scroll-mt-24" aria-label="Our picks">
        <OurPick
          label="Our pick to keep the essentials on"
          name={fullName(essentials)}
          why="Plug the fridge, router and a lamp into it and leave them there. When the power cuts out it takes over in about a hundredth of a second. No electrician needed."
          life={[`Fridge alone: ${lifeSummary(essentials.capacityWh).fridge}`, `CPAP: ${lifeSummary(essentials.capacityWh).cpap}`]}
          priceUsd={essentials.priceUsd}
          brand={essentials.brand}
          productId={essentials.id}
          productUrl={essentials.url}
          category="battery"
        />
        <OurPick
          label="Our pick for whole-home backup you can buy online"
          name={fullName(wholeHome)}
          why="240-volt power for a well pump or home circuits, room to grow into days of backup, and lots of solar input. An electrician connects it through a transfer switch or smart panel."
          life={[`Fridge, Wi-Fi and lights: ${lifeSummary(wholeHome.capacityWh).essentials}`, `Expands to ${lifeSummary(maxWh(wholeHome)).essentials}`]}
          priceUsd={wholeHome.priceUsd}
          brand={wholeHome.brand}
          productId={wholeHome.id}
          productUrl={wholeHome.url}
          category="battery"
        />
        <OurPick
          label="Our pick for an installed battery"
          name={fullName(installedPick)}
          icon="home"
          why="One box that handles both solar and storage, switches over automatically, and is covered for 10 years. Sold through Tesla and certified installers."
          life={[`Whole-home: ${Math.round((POWERWALL_3_KWH / usDaily) * 24)} hours of average use`, `Essentials: ${lifeSummary(installedPick.capacityWh).essentials}`]}
          priceNote={`About ${money(Math.round((installedPerKwh(installedPick) * installedPick.capacityWh) / 1000 / 100) * 100)} installed (EnergySage average)`}
          brand={installedPick.brand}
          productId={installedPick.id}
          productUrl={installedPick.url}
          category="battery"
          cta="See Powerwall"
        />
        <p className="text-xs text-muted">*Prices on the makers&apos; US sites when we checked on {formatDate(essentials.retrieved)}; prices change often.</p>
      </section>

      <MythCallout m={lite("battery-without-solar")} className="mt-8" />

      <Section title="The three options at a glance" id="options">
        <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
          <table className="w-full text-sm min-w-[40rem]">
            <caption className="sr-only">Home backup options compared</caption>
            <thead className="bg-surface-light text-left">
              <tr>
                <th scope="col" className="p-3 font-semibold"></th>
                <th scope="col" className="p-3 font-semibold">Portable power station</th>
                <th scope="col" className="p-3 font-semibold">Plug-in whole-home system</th>
                <th scope="col" className="p-3 font-semibold">Installed home battery</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-t border-black/6">
                <th scope="row" className="p-3 font-medium">What it powers</th>
                <td className="p-3">Whatever you plug into it</td>
                <td className="p-3">Selected circuits through a transfer switch or smart panel</td>
                <td className="p-3">Selected circuits or the whole home, switching automatically</td>
              </tr>
              <tr className="border-t border-black/6">
                <th scope="row" className="p-3 font-medium">Typical capacity</th>
                <td className="p-3">1 to 3 kWh</td>
                <td className="p-3">3 to 6 kWh per unit, expandable</td>
                <td className="p-3">5 to 15 kWh per unit, stackable</td>
              </tr>
              <tr className="border-t border-black/6">
                <th scope="row" className="p-3 font-medium">Installation</th>
                <td className="p-3">None</td>
                <td className="p-3">Electrician for the panel or switch</td>
                <td className="p-3">Certified installer, permit</td>
              </tr>
              <tr className="border-t border-black/6">
                <th scope="row" className="p-3 font-medium">Cost (examples below)</th>
                <td className="p-3">{cheapestPortable?.priceUsd ? `From ${money(cheapestPortable.priceUsd)}` : "—"} for 1 kWh+</td>
                <td className="p-3">From {money(Math.min(...plugInHome.filter((p) => p.priceUsd).map((p) => p.priceUsd!)))} plus electrician</td>
                <td className="p-3">About {money(INSTALLED_BATTERY_COST.medianPerKwh)} per kWh installed†</td>
              </tr>
              <tr className="border-t border-black/6">
                <th scope="row" className="p-3 font-medium">Takes solar?</th>
                <td className="p-3">Portable panels</td>
                <td className="p-3">Portable or roof panels</td>
                <td className="p-3">Roof solar (often sold together)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-stone-700 mt-4 max-w-3xl">
          Not sure how much you need?{" "}
          <Link href="/battery-calculator" className="text-spark-orange font-semibold underline underline-offset-2">
            Use the battery sizer
          </Link>
          : five questions, then real systems that reach your size with their prices.
        </p>
      </Section>

      <Section title="Installed whole-home batteries" id="installed">
        <p className="text-stone-700 leading-relaxed max-w-3xl mb-4">
          These are sold through installers, so makers don&apos;t publish a price. The cost column uses EnergySage&apos;s
          average installed price per kWh for each brand from its first-half 2026 marketplace quotes, before
          incentives. Expect a quote to differ with your electrical panel, permits and whether solar is installed at
          the same time.
        </p>
        <InstalledTable products={installed} />
        <p className="text-xs text-muted mt-2 max-w-3xl">
          †EnergySage brand averages, first half of 2026 (
          <a href={ES_COST_URL} className="underline" rel="noopener">source</a>); for brands without one we use
          EnergySage&apos;s overall median of {money(INSTALLED_BATTERY_COST.medianPerKwh)}/kWh. EnergySage says
          whole-home backup with several batteries can run $34,000 or more. Specs are from each maker&apos;s US
          datasheet, checked {formatDate(installed[0].retrieved)}.
        </p>
      </Section>

      <Section title="Plug-in whole-home and large portable systems" id="plug-in">
        <p className="text-stone-700 leading-relaxed max-w-3xl mb-4">
          Big power stations and modular home batteries you can buy online. They run appliances straight away from
          their outlets; to back up hard-wired circuits, an electrician connects them through the maker&apos;s smart
          panel or a transfer switch. Most offer 120/240-volt output for well pumps and other 240 V loads.
        </p>
        <SpecTable products={plugInHome} caption="Plug-in whole-home and large portable battery systems" />
      </Section>

      <Section title="Portable power stations for essentials" id="portable">
        <p className="text-stone-700 leading-relaxed max-w-3xl mb-4">
          For a fridge, CPAP, router and phones through a short outage, a 1 to 2 kWh power station is often enough
          and costs a fraction of an installed battery.{" "}
          <Link href="/best-portable-power-stations" className="text-spark-orange underline underline-offset-2">
            See our full power station guide and picks
          </Link>
          .
        </p>
        <SpecTable products={portable} caption="Portable power stations of 1 to 3 kWh" />
        <PriceFootnote products={priced} />
      </Section>

      <Section title="Before you buy" id="tips">
        <div className="text-stone-700 leading-relaxed space-y-3 max-w-3xl">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Power, not just capacity.</strong> kWh sets how long it lasts; continuous watts set what can
              run at once. Well pumps and central air need a high surge rating and often 240 V.
            </li>
            <li>
              <strong>LFP lasts longer.</strong> Lithium iron phosphate (LFP) batteries are rated for thousands of
              cycles and are less prone to overheating than older NMC packs.
            </li>
            <li>
              <strong>Solar recharging</strong> is what turns hours of backup into days. Check each model&apos;s solar
              input watts.
            </li>
            <li>
              <strong>Building your own off-grid or cabin system?</strong> 48 V and 12 V lithium batteries paired with
              an inverter cost far less per kWh than a finished home battery; see{" "}
              <Link href="/lithium-rv-battery" className="underline">lithium RV, boat and off-grid batteries</Link>.
            </li>
            <li>
              <strong>Incentives:</strong> the 30% federal credit for homeowners ended after 2025, but some utilities
              pay battery owners to share power at peak times. See{" "}
              <Link href="/incentives" className="underline">2026 incentives</Link>.
            </li>
          </ul>
          <Callout>
            The average US home uses about {num(NATIONAL.avgMonthlyKwh)} kWh a month ({usDaily.toFixed(1)} kWh a day),
            so one {POWERWALL_3_KWH} kWh battery covers roughly {Math.round((POWERWALL_3_KWH / usDaily) * 24)} hours of
            normal use, and far longer if you run only essentials. Your state&apos;s average is on its{" "}
            <Link href="/states" className="underline">state page</Link>.
          </Callout>
        </div>
      </Section>

      <Faq items={faqs} path={PATH} />
      <Disclaimer>
        Specifications and prices are copied from manufacturers&apos; US websites on the dates shown; installed costs
        are marketplace averages. Batteries connected to home wiring must be installed by a licensed electrician under
        local codes.
      </Disclaimer>
      <Sources
        items={[
          { name: "EnergySage: how much do home batteries cost", url: ES_COST_URL, detail: "Installed cost by brand, first half of 2026" },
          { name: "EnergySage: home energy market, first half 2026", url: INSTALLED_BATTERY_COST.url, detail: `Median ${money(INSTALLED_BATTERY_COST.medianPerKwh)}/kWh` },
          { name: SOURCES.usage.name, url: SOURCES.usage.url, detail: SOURCES.usage.period },
          ...[...installed, ...priced].map((p) => ({ name: `${fullName(p)} specifications`, url: p.sourceUrl, detail: `checked ${formatDate(p.retrieved)}` })),
          {
            name: "IRS: FAQs on the modification of sections 25C, 25D and others (FS-2025-05)",
            url: "https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-act-obbb",
            detail: "25D ends for expenditures after 31 December 2025",
          },
        ]}
      />
      <RelatedLinks
        links={[
          { href: "/battery-calculator", label: "Battery sizer", desc: "How many kWh you need, with matching systems" },
          { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Picks for camping, CPAP, RVs and apartments" },
          { href: "/compare", label: "Head-to-head comparisons", desc: "EcoFlow vs Anker vs Jackery vs Bluetti" },
          { href: "/plug-in-solar", label: "Plug-in solar", desc: "Small solar that plugs into an outlet" },
          { href: "/lithium-rv-battery", label: "Lithium RV and boat batteries", desc: "12 V, 24 V and 48 V batteries that replace lead-acid" },
        ]}
      />
      <PhotoCredit name="home-battery" />
      </div>
    </article>
  );
}

