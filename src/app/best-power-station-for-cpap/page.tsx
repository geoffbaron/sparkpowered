import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { PlainLink, QuickAnswer } from "@/components/guide-ui";
import { AFFILIATES } from "@/data/affiliates";
import { CpapPicker, type RuntimeOption } from "@/components/RuntimePicker";
import { BigStat, HubHero, OurPick, PhotoCredit } from "@/components/ui";
import { CPAP_PACK } from "@/data/buyer-guides";
import type { Product } from "@/data/products";
import { formatDate } from "@/lib/energy";
import { CPAP_NO_HUMIDIFIER_W, LOADS, USABLE_FRACTION } from "@/lib/everyday";
import { fullName, money, productById } from "@/lib/products";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { productList, reviewedProduct } from "@/lib/structured-data";
import { productJson } from "@/components/products";

const PATH = "/best-power-station-for-cpap";
const TITLE = "Best Power Station for CPAP (2026): Nights of Sleep per Dollar";
const DESCRIPTION =
  "How many nights each battery runs a CPAP, with and without the humidifier, from $289. Bluetti, EcoFlow, Jackery and Anker picks with dated prices, plus a picker for your outage.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const nights = (wh: number, w: number) => (wh * USABLE_FRACTION) / (w * LOADS.cpapNightHours);
const n1 = (x: number) => (Math.floor(x * 10) / 10).toString();

const IDS = ["bluetti-elite-30-v2", "bluetti-elite-100-v2", "bluetti-ac180", "bluetti-elite-200-v2", "ecoflow-river-3-plus", "jackery-explorer-1000-v2", "anker-solix-c1000-gen-2"];

function opt(p: Product): RuntimeOption {
  return { id: p.id, name: fullName(p), brand: AFFILIATES[p.brand].tracked ? p.brand : null, capacityWh: p.capacityWh, priceUsd: p.priceUsd!, url: p.url };
}

export default function CpapPage() {
  const products = IDS.map(productById);
  const e30 = productById("bluetti-elite-30-v2");
  const e100 = productById("bluetti-elite-100-v2");
  const river = productById("ecoflow-river-3-plus");
  const options: RuntimeOption[] = [
    ...products.map(opt),
    { id: CPAP_PACK.id, name: CPAP_PACK.name, brand: "bluetti", capacityWh: CPAP_PACK.capacityWh, priceUsd: CPAP_PACK.priceUsd, url: CPAP_PACK.url },
  ];
  const H = LOADS.cpapW;
  const D = CPAP_NO_HUMIDIFIER_W;

  const rows = [...options].sort((a, b) => a.priceUsd - b.priceUsd);
  const productFor = (id: string) => products.find((p) => p.id === id);

  const faqs = [
    {
      q: "How long will a power station run a CPAP?",
      a: `Divide the station's watt-hours by your CPAP's watts times hours of sleep, then take off about 15% for losses. A ResMed AirSense 10 draws about ${H} W with the heated humidifier on and ${D} W without, per ResMed's battery guide. So a 1,024 Wh station like the Bluetti Elite 100 V2 runs it about ${n1(nights(1024, H))} nights with the humidifier and ${n1(nights(1024, D))} nights without, at ${LOADS.cpapNightHours} hours a night.`,
    },
    {
      q: "What is the best power station for a CPAP?",
      a: `For most people the Bluetti Elite 100 V2 (${money(e100.priceUsd!)} when we checked): about ${n1(nights(e100.capacityWh, H))} nights with the humidifier, a 10 ms switchover so the CPAP keeps running if the power blinks, and enough left over for a phone and a lamp. For travel or one night, the Bluetti Elite 30 V2 (${money(e30.priceUsd!)}, ${e30.weightLb} lb) gives about one night with the humidifier and ${n1(nights(e30.capacityWh, D))} without.`,
    },
    {
      q: "Should I turn off the CPAP humidifier on battery?",
      a: `If you can sleep comfortably without it, yes: it more than doubles your nights. ResMed's figures are about ${H} W with the heated humidifier and ${D} W without, so the same battery lasts about ${(H / D).toFixed(1)} times longer. Ask your doctor or equipment supplier if you rely on humidity.`,
    },
    {
      q: "Can I take a power station on a plane for my CPAP?",
      a: "Not these. The FAA forbids lithium-ion batteries over 160 Wh in both carry-on and checked bags, and every station and pack here is larger. For flights, use your CPAP maker's own small battery or the airline's medical-device rules.",
    },
    {
      q: "Do I need a pure sine wave inverter for a CPAP?",
      a: "Every station on this page has a pure sine wave inverter, which is what CPAP makers recommend for their AC power supplies. You can also skip the inverter by running the CPAP from a DC cable, which wastes less power; the Bluetti X60 is built around DC outputs and comes with CPAP cables.",
    },
    {
      q: "Can I leave my CPAP plugged into a power station every night?",
      a: "Yes, that is the point of a UPS-style station: plug the station into the wall and the CPAP into the station. When the power cuts out, it takes over. Look for a stated switchover time; the Bluetti Elite 30 V2, Elite 100 V2 and EcoFlow RIVER 3 Plus list 10 ms.",
    },
  ];

  return (
    <article>
      <JsonLd
        data={productList(PATH, "Power stations for a CPAP", [
          ...[...products]
            .sort((a, b) => a.priceUsd! - b.priceUsd!)
            .map((p) => productJson(p, PATH)),
          reviewedProduct({
            name: CPAP_PACK.name,
            brand: "Bluetti",
            url: CPAP_PACK.url,
            pagePath: PATH,
            description: CPAP_PACK.notes[0],
            priceUsd: CPAP_PACK.priceUsd,
          }),
        ])}
      />
      <HubHero
        image="outage"
        crumbs={[
          { name: "Best portable power stations", path: "/best-portable-power-stations" },
          { name: "CPAP", path: PATH },
        ]}
        eyebrow="Power for your CPAP"
        title={<>Sleep through the outage. <span className="text-amber-300">Nearly four nights of CPAP for $499.</span></>}
        sub={
          <>
            A battery the size of a lunchbox keeps your CPAP running when the power goes out or you camp off-grid. Here is how many
            nights each one gives, and which to buy.
          </>
        }
      >
        <a href="#picker" className="btn btn-primary">How many nights do I need?</a>
        <a href="#picks" className="btn btn-light">See our picks</a>
      </HubHero>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AffiliateDisclosure className="mb-8" />

        <QuickAnswer>
          <p>
            <strong>Most people: the{" "}
            <PartnerLink brand="bluetti" productId={e100.id} productUrl={e100.url}>Bluetti Elite 100 V2</PartnerLink></strong>{" "}
            ({money(e100.priceUsd!)} when we checked). About {n1(nights(e100.capacityWh, H))} nights of CPAP with the heated
            humidifier, {n1(nights(e100.capacityWh, D))} without, and it takes over in 10 ms if the power cuts out mid-sleep.
          </p>
          <p>
            <strong>Travel and single nights:</strong> the{" "}
            <PartnerLink brand="bluetti" productId={e30.id} productUrl={e30.url}>Bluetti Elite 30 V2</PartnerLink> ({money(e30.priceUsd!)},{" "}
            {e30.weightLb} lb). Want one you can add a battery to later? The{" "}
            <PlainLink href={river.url}>EcoFlow RIVER 3 Plus</PlainLink> ({money(river.priceUsd!)}) is the same size and expands to 858 Wh.
          </p>
        </QuickAnswer>

        <section aria-label="What it means" className="grid sm:grid-cols-3 gap-3 mt-8">
          <BigStat tone="leaf" value={`${n1(nights(e100.capacityWh, H))} nights`} label="Of CPAP with humidifier" note={`Bluetti Elite 100 V2, ${money(e100.priceUsd!)}`} />
          <BigStat value={`${(H / D).toFixed(1)}x`} label="Longer with the humidifier off" note={`${H} W vs ${D} W (ResMed)`} />
          <BigStat tone="orange" value={money(e30.priceUsd!)} label="For one night anywhere" note={`Bluetti Elite 30 V2, ${e30.weightLb} lb`} />
        </section>

        <section id="picker" className="mt-12 scroll-mt-24" aria-labelledby="picker-heading">
          <h2 id="picker-heading" className="text-2xl font-extrabold text-ink mb-2">How many nights do you need?</h2>
          <p className="text-stone-700 mb-4 max-w-3xl">Pick your settings. We show the cheapest battery that covers it, and how every option compares.</p>
          <CpapPicker options={options} />
        </section>

        <section id="picks" className="mt-12 grid gap-4 scroll-mt-24" aria-labelledby="picks-heading">
          <h2 id="picks-heading" className="text-2xl font-extrabold text-ink">Our picks</h2>
          <OurPick
            label="Best for most CPAP users"
            name={fullName(e100)}
            why="Nearly four nights with the humidifier for $499, and it doubles as a UPS: leave the CPAP plugged into it at home and you won't wake up when the power goes. 25 lb, 5-year warranty, and fast solar charging if the outage drags on."
            life={[`CPAP with humidifier: ${n1(nights(e100.capacityWh, H))} nights`, `Without humidifier: ${n1(nights(e100.capacityWh, D))} nights`]}
            priceUsd={e100.priceUsd}
            brand="bluetti"
            productId={e100.id}
            productUrl={e100.url}
            category="battery"
            icon="battery"
          />
          <OurPick
            label="Best for travel and camping"
            name={fullName(e30)}
            why="Under 10 lb and rated under 30 dB, quiet enough for a tent or a bedside table. One night with the humidifier, nearly three without."
            life={[`CPAP with humidifier: ${n1(nights(e30.capacityWh, H))} nights`, `Without humidifier: ${n1(nights(e30.capacityWh, D))} nights`]}
            priceUsd={e30.priceUsd}
            brand="bluetti"
            productId={e30.id}
            productUrl={e30.url}
            category="battery"
            icon="quiet"
          />
          <OurPick
            label="A CPAP-only kit"
            name={CPAP_PACK.name}
            why={`Comes with seven CPAP cables and runs your machine on DC, skipping inverter losses. Be honest with yourself, though: at the same ${money(CPAP_PACK.priceUsd)} the Elite 100 V2 holds more, has regular outlets and a 5-year warranty against the X60's 1 year. Buy the X60 only if you want the simplest CPAP-only box.`}
            life={[`CPAP with humidifier: ${n1(nights(CPAP_PACK.capacityWh, H))} nights`, `${CPAP_PACK.weightLb} lb`]}
            priceUsd={CPAP_PACK.priceUsd}
            brand="bluetti"
            productId={CPAP_PACK.id}
            productUrl={CPAP_PACK.url}
            category="battery"
          />
          <p className="text-xs text-muted">*Prices on the makers&apos; US sites on {formatDate(e100.retrieved)}; Bluetti, Jackery and Anker run frequent sales.</p>
        </section>

        <Section title="Every option, side by side" id="compare">
          <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm min-w-[46rem]">
              <caption className="sr-only">CPAP nights by power station</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Battery</th>
                  <th scope="col" className="p-3 font-semibold text-right">Price*</th>
                  <th scope="col" className="p-3 font-semibold text-right">Nights, humidifier on</th>
                  <th scope="col" className="p-3 font-semibold text-right">Nights, humidifier off</th>
                  <th scope="col" className="p-3 font-semibold text-right">Weight</th>
                  <th scope="col" className="p-3 font-semibold text-right">Switchover</th>
                  <th scope="col" className="p-3 font-semibold text-right">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const p = productFor(o.id);
                  return (
                    <tr key={o.id} className="border-t border-black/6">
                      <th scope="row" className="p-3 font-medium">
                        {o.brand ? (
                          <PartnerLink brand={o.brand} productId={o.id} productUrl={o.url}>{o.name}</PartnerLink>
                        ) : (
                          <PlainLink href={o.url}>{o.name}</PlainLink>
                        )}
                      </th>
                      <td className="p-3 text-right tabular-nums">{money(o.priceUsd)}</td>
                      <td className="p-3 text-right tabular-nums font-semibold">{n1(nights(o.capacityWh, H))}</td>
                      <td className="p-3 text-right tabular-nums">{n1(nights(o.capacityWh, D))}</td>
                      <td className="p-3 text-right tabular-nums">{p ? (p.weightLb ? `${p.weightLb} lb` : "Not stated") : `${CPAP_PACK.weightLb} lb`}</td>
                      <td className="p-3 text-right tabular-nums">{p?.upsMs ? `${p.upsMs} ms` : p ? "Not stated" : "No outlets"}</td>
                      <td className="p-3 text-right tabular-nums">{o.capacityWh.toLocaleString("en-US")} Wh</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2 max-w-3xl">
            *Prices and specs from each maker&apos;s US product page on {formatDate(e100.retrieved)} (EcoFlow, Jackery and Anker on{" "}
            {formatDate(river.retrieved)}). Nights assume {LOADS.cpapNightHours} hours at {H} W or {D} W and {Math.round(USABLE_FRACTION * 100)}%
            usable capacity. Bluetti and Anker links are sponsored; others are plain links.
          </p>
        </Section>

        <Section title="Myths, answered" id="myths">
          <div className="grid gap-3">
            <Callout>
              <strong>&quot;You need a huge, expensive battery for a CPAP.&quot;</strong> No. A CPAP is one of the lightest loads in
              the house: about {H} W with the humidifier, less than a single old light bulb. A {money(e30.priceUsd!)} battery covers a
              night; {money(e100.priceUsd!)} covers a long weekend.
            </Callout>
            <Callout>
              <strong>&quot;A car battery or a cheap jump starter will do.&quot;</strong> Risky. A car battery isn&apos;t built to be
              run flat night after night, and jump starters hold little energy. The stations here use LFP cells rated for thousands of
              full cycles.
            </Callout>
            <Callout>
              <strong>&quot;Power stations are a fire risk in the bedroom.&quot;</strong> Every model here uses lithium iron phosphate
              (LFP), the most heat-stable lithium chemistry, with a built-in management system. Keep it ventilated and off the carpet,
              like any electrical device.
            </Callout>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          This is not medical advice. CPAP power draw depends on your machine, pressure, humidifier and tubing settings; check your
          machine&apos;s manual or ask your equipment supplier. Prices and specifications are copied from makers&apos; US websites on
          the dates shown and change often.
        </Disclaimer>
        <Sources
          items={[
            { name: "ResMed battery guide (AirSense 10 power draw)", url: "https://document.resmed.com/documents/products/serviceandsupport/battery-guide/battery-guide_glo_eng.pdf", detail: `about ${H} W with heated humidifier, ${D} W without, at pressure 10` },
            { name: "FAA PackSafe: lithium batteries", url: "https://www.faa.gov/hazmat/packsafe/lithium-batteries", detail: "batteries over 160 Wh forbidden on passenger aircraft" },
            ...products.map((p) => ({ name: `${fullName(p)} product page`, url: p.sourceUrl, detail: `checked ${formatDate(p.retrieved)}` })),
            { name: `${CPAP_PACK.name} product page`, url: CPAP_PACK.url, detail: `checked ${formatDate(CPAP_PACK.retrieved)}` },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Picks for outages, camping, RVs and apartments" },
            { href: "/power-station-for-refrigerator", label: "Power station for a fridge", desc: "How long each one keeps the food cold" },
            { href: "/compare/bluetti-ac180-vs-elite-100-v2", label: "Bluetti AC180 vs Elite 100 V2", desc: "Which 1 kWh Bluetti to buy" },
            { href: "/battery-calculator", label: "Home battery sizer", desc: "Size backup for the whole house" },
            { href: "/lithium-rv-battery", label: "Lithium RV batteries", desc: "Run a CPAP from the RV house battery" },
          ]}
        />
        <p className="text-sm text-muted mt-6">
          More on outages in your state: <Link href="/states" className="underline">energy data by state</Link>.
        </p>
        <PhotoCredit name="outage" />
      </div>
    </article>
  );
}
