import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure } from "@/components/affiliate";
import { Breadcrumbs, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import EvChargerPicker from "@/components/EvChargerPicker";
import { INSTALL_COST } from "@/data/buyer-guides";
import { HOME_CHARGERS, brandName, chargerById } from "@/data/chargers";
import { formatDate, referenceEv } from "@/lib/energy";
import { circuitFor, kwAt, LEVEL1_KW, milesPerHour, OVERNIGHT_HOURS } from "@/lib/ev-charger-picker";
import { pickerData } from "@/lib/ev-charger-picker-data";
import { money } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

const PATH = "/ev-charger-picker";
const TITLE = "Which Home EV Charger Do I Need? A 1-Minute Charger Picker";
const DESCRIPTION =
  "Answer five quick questions (your car's plug, daily miles, your panel, plug-in or hardwired, off-peak rates) and get the charger spec you actually need, matching picks with prices, and your state's installation cost. No sign-up.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const IRS_FAQ_URL =
  "https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-act-obbb";

export default function EvChargerPickerPage() {
  const data = pickerData();
  const typical = referenceEv("typical");
  const day = 40;
  const kwhDay = (day * typical.kwhPer100mi) / 100;
  const h32 = kwhDay / kwAt(32);
  const h40 = kwhDay / kwAt(40);
  const l1 = kwhDay / LEVEL1_KW;
  const mph40 = Math.round(milesPerHour(kwAt(40), typical.kwhPer100mi));
  const lj = chargerById("lectron-nexus-j1772");
  const a40 = chargerById("autel-elite-home-40a");
  const ej = chargerById("eviqo-l2-j1772");
  const en = chargerById("eviqo-nacs-40a");

  const faqs = [
    {
      q: "How many amps does my home EV charger need?",
      a: `Fewer than most people think. A ${typical.make} ${typical.model} driven ${day} miles uses about ${Math.round(kwhDay)} kWh (EPA's ${typical.kwhPer100mi} kWh per 100 miles), which a 32-amp charger puts back in about ${Math.round(h32 * 2) / 2} hours and a 40-amp one in about ${Math.round(h40 * 2) / 2}. Even 150 miles a day in a full-size electric pickup refills overnight at 40 amps. A 48-amp charger mainly helps cars that accept more than 9.6 kW.`,
    },
    {
      q: "What size breaker do I need for a 32, 40 or 48-amp charger?",
      a: `EV charging is a continuous load, so the circuit must be rated 125% of what the charger draws: ${circuitFor(32)} amps for a 32-amp charger, ${circuitFor(40)} for 40 and ${circuitFor(48)} for 48. A NEMA 14-50 outlet on a 50-amp circuit therefore tops out at 40 amps; anything faster is hardwired.`,
    },
    {
      q: "Can I use my dryer outlet?",
      a: "Only slowly. A 30-amp dryer circuit allows 24 amps of charging under the 125% rule, about 18 miles of range an hour by ChargePoint's estimate, and only with a charger you can set that low and a plug that matches the outlet. Have an electrician check the circuit first.",
    },
    {
      q: "Do I need a permit, and can I install it myself?",
      a: `If you already have a suitable 240-volt outlet, a plug-in charger just plugs in. A new outlet or circuit is electrician's work, and the Department of Energy says installs must meet local codes and may need permits. EnergySage puts permits at about ${money(INSTALL_COST.permit[0])} to ${money(INSTALL_COST.permit[1])}.`,
    },
    {
      q: "Is there still a federal tax credit for a home charger?",
      a: "No. The IRS says the charger credit (30C) is not allowed for property placed in service after June 30, 2026. Many utilities and states still offer charger or installation rebates, sometimes only for smart chargers; check your utility and our incentives page.",
    },
  ];

  return (
    <article>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-10">
        <Breadcrumbs
          items={[
            { name: "Best home EV charger", path: "/best-home-ev-charger" },
            { name: "Charger picker", path: PATH },
          ]}
        />
        <p className="text-spark-amber font-bold uppercase tracking-wide text-xs mt-4">Home EV charger picker</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink leading-tight mt-1">Which home charger do you actually need?</h1>
        <p className="text-stone-700 mt-3 leading-relaxed">
          Five quick taps, no sign-up. You get the amps, the plug and plug-in or hardwired, matching chargers, and what installing one costs in
          your state. Most people need far less than they&apos;re sold: 32 to 40 amps refills a normal day overnight.
        </p>

        <AffiliateDisclosure className="mt-5 mb-5" />

        <EvChargerPicker data={data} />

        <Section title="How the picker decides" id="how">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <p>
              <strong>Speed you need:</strong> your miles times your car&apos;s EPA energy use, put back within an {OVERNIGHT_HOURS}-hour night.
              For {day} miles in a {typical.make} {typical.model}, that&apos;s about {Math.round(kwhDay)} kWh: about {Math.round(l1)} hours on an
              ordinary outlet (12 amps at 120 volts), {Math.round(h40 * 2) / 2} hours at 40 amps (about {mph40} miles of range an hour).
            </p>
            <p>
              <strong>What your wiring allows:</strong> the circuit must be 125% of the charger&apos;s draw, so a NEMA 14-50 outlet (50-amp
              circuit) allows 40 amps, a 40-amp circuit 32 amps, and a 30-amp dryer circuit 24 amps. Above 40 amps, chargers are hardwired.
            </p>
            <p>
              <strong>Which charger:</strong> we only link chargers from brands we have checked and partner with ({HOME_CHARGERS.length} models
              from Lectron, Autel and EVIQO, prices read from their US sites on {formatDate(lj.retrieved)}). When none of them fits your answers, the
              picker tells you the spec to look for and links nothing. For more brands, including Grizzl-E, Emporia, ChargePoint and Tesla, see
              the <Link href="/best-home-ev-charger#compare" className="underline underline-offset-2 text-spark-orange">full comparison</Link>.
            </p>
            <p>
              <strong>Smart scheduling:</strong> EVIQO&apos;s chargers (J1772 {money(ej.priceUsd)}, Tesla / NACS {money(en.priceUsd)}) and the
              Autel ({money(a40.priceUsd)}) have an app that charges only in your utility&apos;s cheaper hours. We rank them by price and
              spec; which brand pays us more never changes the order. <Link href="/ev-charging-cost" className="underline underline-offset-2 text-spark-orange">See what home charging costs in your state</Link>.
            </p>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          General information, not electrical advice. Charging speed depends on your car&apos;s built-in charger. Use a licensed electrician
          and check local permit rules. Prices change often and are from the makers&apos; US sites on the dates shown; installation figures
          are averages, not quotes.
        </Disclaimer>
        <Sources
          items={[
            { name: "U.S. EPA and DOE: fueleconomy.gov vehicle data (kWh per 100 miles)", url: "https://www.fueleconomy.gov/feg/download.shtml" },
            { name: "ChargePoint: Home Flex installation FAQ (circuit and amperage table)", url: "https://www.chargepoint.com/drivers/home/installation/flex" },
            { name: "U.S. Department of Energy, Alternative Fuels Data Center: Charging electric vehicles at home", url: "https://afdc.energy.gov/fuels/electricity-charging-home" },
            { name: "U.S. Department of Energy, Alternative Fuels Data Center: Charging levels (Level 1 adds about 40 miles in 8 hours)", url: "https://afdc.energy.gov/fuels/electricity-stations" },
            { name: "Joint Office of Energy and Transportation: J3400 (NACS) charging connector", url: "https://driveelectric.gov/charging-connector" },
            { name: INSTALL_COST.source, url: INSTALL_COST.url, detail: `checked ${formatDate(INSTALL_COST.retrieved)}` },
            { name: "IRS: FAQs on modification of sections 25C, 25D, 25E, 30C, 30D, 45L, 45W and 179D (Public Law 119-21)", url: IRS_FAQ_URL, detail: "30C not allowed for property placed in service after June 30, 2026" },
            ...HOME_CHARGERS.map((c) => ({ name: `${brandName(c)} ${c.name} product page`, url: c.sourceUrl, detail: `checked ${formatDate(c.retrieved)}` })),
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/ev-charger-installation-cost", label: "EV charger installation cost", desc: "Your state's average and what adds to it" },
            { href: "/best-home-ev-charger", label: "Best home EV charger", desc: "Every charger compared on price and speed" },
            { href: "/ev-charging-cost", label: "EV charging cost calculator", desc: "What charging costs in your state vs gas" },
            { href: "/questions/ev-charging", label: "Home charging questions", desc: "Breakers, dryer outlets, permits, Level 1 vs 2" },
          ]}
        />
      </div>
    </article>
  );
}
