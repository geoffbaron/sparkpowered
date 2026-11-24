import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure } from "@/components/affiliate";
import { Breadcrumbs, Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import HookupPicker from "@/components/HookupPicker";
import { HOMEGUIDE_SWITCH, INTERLOCK_INSTALLED_USD, IRON_FORGE_CORDS, MODEL_HOOKUPS, PARTS } from "@/data/hookup";
import { formatDate } from "@/lib/energy";
import { DEFAULT_INPUT, METHOD_LABEL, partsFor, pick, type Method } from "@/lib/hookup-picker";
import { hookupData } from "@/lib/hookup-picker-data";
import { USABLE_FRACTION, fmtWh, sourcesFor } from "@/lib/offgrid";
import { fullName, money, productById } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/home-backup/hookup-picker";
const TITLE = "How to Connect a Power Station to Your House: 5-Question Hookup Picker";
const DESCRIPTION =
  "Five questions (what must stay on, 120 or 240 V, own or rent, budget, electrician) give the safe way to connect a portable battery to your home, the battery size, in-stock models that fit and a parts list with sourced cost ranges.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const CPSC = { name: "U.S. Consumer Product Safety Commission: Portable generator hazards safety alert (PDF)", url: "https://www.cpsc.gov/s3fs-public/5123_SafetyAlert_PortableGenerators_102021_0.pdf?VersionId=PK4zcSnKUJE8ovzbCGV09MM5.RBIG_E5" };
const OSHA = { name: "OSHA: Using portable generators safely (PDF)", url: "https://www.osha.gov/sites/default/files/publications/OSHA3286.pdf" };

const r10 = (n: number, up = false) => (n < 100 ? (up ? Math.ceil(n) : Math.floor(n)) : up ? Math.ceil(n / 10) * 10 : Math.floor(n / 10) * 10);
const range = ([lo, hi]: [number, number]) => `${money(r10(lo))} to ${money(r10(hi, true))}`;
const total = (m: Method, circuits = 6): [number, number] => {
  const ps = partsFor(m, circuits);
  return [ps.reduce((t, p) => t + p.usd[0], 0), ps.reduce((t, p) => t + p.usd[1], 0)];
};

export default function HookupPickerPage() {
  const data = hookupData();
  const essentials = pick(DEFAULT_INPUT, data);
  const well240 = pick({ ...DEFAULT_INPUT, loads: ["fridge", "well"], volts: "240", budget: "5000" }, data);
  const kits = MODEL_HOOKUPS.filter((h) => h.smartPanel);
  const inStockKits = kits.filter((h) => !productById(h.productId).soldOut);
  const pairs = MODEL_HOOKUPS.filter((h) => h.pair240 && !productById(h.productId).soldOut);
  const checked = formatDate(HOMEGUIDE_SWITCH.retrieved);
  const pct = Math.round(USABLE_FRACTION * 100);

  const rows: { m: Method; powers: string; cost: string; electrician: string; who: string }[] = [
    { m: "cords", powers: "Only appliances you can unplug and move", cost: range(total("cords")), electrician: "No", who: "Renters, small lists, anyone not hiring an electrician" },
    { m: "interlock", powers: "Any circuit you switch on, up to the battery's output", cost: `${range(total("interlock"))} plus the battery`, electrician: "Yes, with a permit", who: "Owners on a tight budget, where the inspector accepts interlocks" },
    { m: "switch", powers: "6 or 10 chosen circuits, including wired-in pumps and furnaces", cost: `${range(total("switch", 6))} (6 circuits) plus the battery`, electrician: "Yes, with a permit", who: "Most owners with a well pump, furnace or 240 V load" },
    {
      m: "panel",
      powers: "Chosen circuits, switched and shown in the maker's app",
      cost: `The maker's kit (${inStockKits.map((h) => productById(h.productId).model).join(", ") || "see the maker"}; today's price on its site) plus labor ${range(PARTS.switchLabor.usd)} and permit`,
      electrician: "Yes, with a permit",
      who: "Owners buying a model the maker sells a panel kit for",
    },
  ];

  const faqs = [
    {
      q: "Can I plug a power station into a wall outlet to power my house?",
      a: "No. That is backfeeding: the CPSC says it can electrocute utility workers and neighbors on the same transformer, and it bypasses your home's circuit protection. The same goes for a dryer outlet and any double-ended (male-to-male) cord. The safe ways are cords from the battery to each appliance, or transfer equipment at the panel installed by a licensed electrician.",
    },
    {
      q: "What does it cost to connect a power station to a house panel?",
      a: `HomeGuide puts an interlock kit at ${range(PARTS.interlock.usd)} and an installed interlock at ${range(INTERLOCK_INSTALLED_USD)}. Add the outside inlet box, the cord to the battery and a permit, and our parts list comes to about ${range(total("interlock"))}; a 6-circuit manual transfer switch job comes to about ${range(total("switch", 6))}. That is before the battery. HomeGuide dates those figures ${formatDate(HOMEGUIDE_SWITCH.published!)} (read ${checked}), so expect quotes at or above them; your electrician's quote is the real number.`,
    },
    {
      q: "Do I need 240 volts for a well pump?",
      a: `Many well pumps are 240 V; the nameplate says. A 240 V pump needs a 120/240 V power station or two 120 V units joined by the maker's own hub (${pairs.map((h) => `${h.pair240!.name} for the ${productById(h.productId).model}`).join("; ")}), connected through a transfer switch by a licensed electrician. For a 1/3 HP pump plus a fridge, the picker's top fit today is the ${well240.matches[0] ? well240.matches[0].c.name : "none of our partners' models"}.`,
    },
    {
      q: "I rent. Can I still use a power station in an outage?",
      a: "Yes, with cords only: plug each appliance straight into the battery or into a heavy-duty outdoor-rated extension cord running to it, three-prong and rated for the load. Nothing gets connected to the building's wiring. A wired-in well pump or furnace can't be run this way; that needs the owner and a licensed electrician.",
    },
    {
      q: "How big a battery do I need for a fridge, Wi-Fi and lights?",
      a: `About ${fmtWh(essentials.dailyWh)} a day for an average fridge (EIA), a Wi-Fi router, four LED bulbs for 5 hours and two phone charges, so about ${fmtWh(essentials.needWh)} of rated capacity for one day, since power stations deliver about ${pct}% of their rating.`,
    },
  ];

  const productSources = [...new Set(data.candidates.map((c) => c.productId))].map((id) => {
    const p = productById(id);
    return { name: `${fullName(p)} product page`, url: p.sourceUrl, detail: `specs checked ${formatDate(p.retrieved)}` };
  });
  const kitSources = MODEL_HOOKUPS.flatMap((h) => [
    ...(h.smartPanel ? [{ name: `${h.smartPanel.name} (maker's store)`, url: h.smartPanel.url, detail: `checked ${formatDate(h.smartPanel.retrieved)}` }] : []),
    ...(h.pair240 ? [{ name: `${h.pair240.name} (maker's store)`, url: h.pair240.url, detail: `${h.pair240.outputW.toLocaleString("en-US")} W from two units, checked ${formatDate(h.pair240.retrieved)}` }] : []),
  ]);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Home backup hookup picker",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          browserRequirements: "Requires JavaScript",
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          dateModified: HOMEGUIDE_SWITCH.retrieved,
        }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-10">
        <Breadcrumbs
          items={[
            { name: "Home backup", path: "/home-backup" },
            { name: "Hookup picker", path: PATH },
          ]}
        />
        <p className="text-spark-amber font-bold uppercase tracking-wide text-xs mt-4">Home backup hookup picker</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink leading-tight mt-1">How to connect a power station to your house</h1>

        <QuickAnswer>
          <p>
            There are four safe ways: extension cords from the battery to each appliance, an inlet box with an interlock kit, a manual transfer
            switch, or the maker&apos;s own home panel kit. Anything at your electrical panel is installed by a licensed electrician, with a
            permit. Never plug a power station into a wall or dryer outlet. Answer five questions below for your method, battery size, in-stock
            models and a parts list with costs.
          </p>
        </QuickAnswer>

        <AffiliateDisclosure className="mt-5 mb-5" />

        <HookupPicker data={data} />

        <Section title="The four ways, side by side" id="methods">
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-2 pr-3">Way</th>
                  <th className="py-2 pr-3">What it powers</th>
                  <th className="py-2 pr-3">Rough cost</th>
                  <th className="py-2 pr-3">Electrician</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.m} className="border-t border-black/8 align-top">
                    <td className="py-2 pr-3 font-semibold text-ink">
                      {METHOD_LABEL[r.m]}
                      <span className="block text-xs font-normal text-muted">{r.who}</span>
                    </td>
                    <td className="py-2 pr-3">{r.powers}</td>
                    <td className="py-2 pr-3">{r.cost}</td>
                    <td className="py-2 pr-3">{r.electrician}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2">
            Part and labor ranges from HomeGuide (its page is titled 2026 but dates its figures {formatDate(HOMEGUIDE_SWITCH.published!)}, so
            expect higher quotes) and Iron Forge Cable; panel kits and hubs from the makers&apos; US stores. All read {checked}.
          </p>
        </Section>

        <div className="mt-8">
          <Callout tone="warn">
            <strong>Safety, in plain words.</strong> Never connect a power station to house wiring through a wall outlet, a dryer outlet or a
            double-ended cord: that backfeeds the grid and can kill utility workers and neighbors (CPSC). OSHA says to connect to a building only
            through a properly installed transfer switch. Interlocks, transfer switches and panel kits are installed by a licensed electrician
            with a permit and inspection where required. With cords, use heavy-duty outdoor-rated three-prong cords rated for the load, one per
            appliance, with no power strips in between.
          </Callout>
        </div>

        <Section title="How the picker decides" id="how">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <p>
              <strong>Battery size:</strong> each item&apos;s daily use comes from the same figures as our{" "}
              <Link href="/power-outage-backup-calculator" className="underline underline-offset-2 text-spark-orange">
                outage backup calculator
              </Link>{" "}
              (EIA&apos;s average fridge and freezer use, EWEB&apos;s generator sizing sheet for pumps and blowers), times the days you pick,
              divided by {pct}% because power stations deliver about that much of their rating.
            </p>
            <p>
              <strong>Starting motors:</strong> a fridge, pump or blower needs a burst of extra watts to start. We add the biggest start to
              everything running and check it against the maker&apos;s surge rating; when the maker gives none, or says its surge is for heating
              loads only, we don&apos;t count it.
            </p>
            <p>
              <strong>Method:</strong> renters and anyone not hiring an electrician get cords only. Wired-in loads (well pump, furnace) and 240 V
              loads need a transfer switch, an interlock or the maker&apos;s panel kit. A short list of plug-in items stays on cords even for
              owners. A transfer switch is our default for panel work: it is what OSHA and the CPSC name, and you can&apos;t overload it by
              switching on the wrong breaker.
            </p>
            <p>
              <strong>Models:</strong> only models in stock on the maker&apos;s US site at our last check, from brands we partner with (Anker
              SOLIX, Bluetti, Growatt and ALLPOWERS). Panel methods only show models whose 30 A or larger outlet we read on the maker&apos;s page.
              For 240 V we show 120/240 V models, or two 120 V units on the maker&apos;s own hub. We have not tested these units ourselves; every
              spec is from the maker&apos;s US store on the date shown, and each link goes there for today&apos;s price.
            </p>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          General information, not electrical advice. Part and labor costs are published averages, not quotes, and vary by panel, area and
          store. We don&apos;t list product prices; the links go to each maker for today&apos;s price.
        </Disclaimer>
        <Sources
          items={[
            { name: HOMEGUIDE_SWITCH.name, url: HOMEGUIDE_SWITCH.url, detail: `interlock kit, inlet box, cord, supplies, labor, 6- and 10-circuit switches, permits; figures dated ${formatDate(HOMEGUIDE_SWITCH.published!)}, read ${checked}` },
            { name: IRON_FORGE_CORDS.name, url: IRON_FORGE_CORDS.url, detail: `25 ft 12-gauge 2-pack and 50 ft 12/3 locking-end cord; checked ${formatDate(IRON_FORGE_CORDS.retrieved)}` },
            CPSC,
            OSHA,
            ...sourcesFor(["recsFridge", "recsAppliances", "eweb", "resmed", "doeLed", "router", "phone", "nfpa"]),
            ...kitSources,
            ...productSources,
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/home-backup", label: "Run your house from a portable battery", desc: "The four ways to connect one, in detail" },
            { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "Size a battery for your own list and days" },
            { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Every model we track, by spec" },
            { href: "/home-battery-backup", label: "Home battery backup", desc: "Installed whole-home batteries vs portable" },
          ]}
        />
      </div>
    </article>
  );
}
