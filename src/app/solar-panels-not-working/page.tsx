import type { Metadata } from "next";
import Link from "next/link";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { JsonLd, pageMetadata, url } from "@/lib/seo";
import { formatDate } from "@/lib/energy";

const PATH = "/solar-panels-not-working";
const UPDATED = "2026-11-09";
const TITLE = "Solar Panels Stopped Working? What to Check and Who Can Fix Them";
const DESCRIPTION =
  "Solar panels not producing, or you bought a house with solar and the installer is gone? Five safe checks, who repairs systems they didn't install, what repairs cost, and the paperwork new owners need.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const S = {
  esRepair: { name: "EnergySage, When solar panel repair is needed (updated Aug 28, 2025)", url: "https://www.energysage.com/solar/solar-panel-repair/" },
  esInverter: { name: "EnergySage, What happens if your solar inverter fails?", url: "https://www.energysage.com/solar/what-happens-if-your-solar-inverter-fails/" },
  esRapid: { name: "EnergySage, Rapid shutdown for solar", url: "https://www.energysage.com/solar/rapid-shutdown-overview/" },
  esBankrupt: { name: "EnergySage, What happens to your warranty if your solar company goes out of business (updated Jan 7, 2026)", url: "https://www.energysage.com/solar/solar-company-warranty-bankruptcy" },
  esSunpower: { name: "EnergySage, SunPower is bankrupt: what now? (updated Apr 16, 2026)", url: "https://www.energysage.com/solar/sunpower-is-bankrupt-what-now" },
  doeHouse: { name: "US Department of Energy, A Consumer's Guide to Buying a House with Solar Panels", url: "https://www.energy.gov/cmei/systems/consumers-guide-buying-house-solar-panels" },
  doeHomeowner: { name: "US Department of Energy, Homeowner's Guide to Going Solar", url: "https://www.energy.gov/cmei/systems/homeowners-guide-solar" },
  fixr: { name: "Fixr, Solar panel repair cost (updated Jan 31, 2025)", url: "https://www.fixr.com/costs/solar-panel-repair" },
  enphaseWarranty: { name: "Enphase, US limited warranty for IQ microinverters (effective May 1, 2026)", url: "https://enphase.com/download/wrty-00136united-states-eniq-microinverter0pdf" },
  enphaseTransfer: { name: "Enphase support, How do I transfer ownership of an Enphase system?", url: "https://support.enphase.com/s/article/How-do-I-transfer-ownership-of-an-Enphase-system" },
  enphaseLocator: { name: "Enphase installer locator", url: "https://enphase.com/installer-locator" },
  solaredge: { name: "SolarEdge, site ownership transfer", url: "https://www.solaredge.com/site-transfer" },
  sunpower: { name: "SunPower, update for legacy SunPower customers", url: "https://us.sunpower.com/update" },
  nabcep: { name: "NABCEP professional directory", url: "https://directories.nabcep.org/" },
  sun: { name: "Solar United Neighbors, Having problems with your solar installer? (May 6, 2024)", url: "https://www.solarunitedneighbors.org/go-solar/having-problems-with-your-solar-installer/" },
  ngrid: { name: "National Grid, Moving? Transferring your solar system (Massachusetts)", url: "https://www.nationalgridus.com/solar-hub/Moving" },
  ofgem: { name: "Ofgem, Feed-in Tariffs: guidance for generators", url: "https://www.ofgem.gov.uk/environmental-and-social-schemes/feed-tariffs-fit/generators" },
  mcs: { name: "MCS, Request an MCS certificate", url: "https://mcscertified.com/consumers/mcs-certificate-queries/request-an-mcs-certificate/" },
};

const COSTS: [string, string][] = [
  ["Diagnostic visit", "$150 to $300"],
  ["Average repair", "$750 ($400 to $1,000)"],
  ["Inverter repair", "$500 to $3,000"],
  ["Inverter replacement", "$1,000 to $3,000"],
  ["Labor", "About $100 an hour, usually a 1-hour minimum"],
  ["Remove panels", "$300 to $500"],
];

export default function SolarPanelsNotWorkingPage() {
  const faqs = [
    {
      q: "Why did my solar panels stop working?",
      a: "Usually it is the inverter, not the panels. EnergySage says the inverter is the part most likely to cause problems and that panels rarely fail. Often the system is still making power and only the monitoring has dropped off Wi-Fi. A tripped breaker or a rapid shutdown switch left off can also stop it.",
    },
    {
      q: "Who repairs solar panels if the installer went out of business?",
      a: "Any licensed solar company or electrician who takes service work on systems they didn't install. Start with the inverter maker: Enphase, for example, lists certified installers by ZIP code. Then check NABCEP's directory and your state's contractor license lookup. Using a certified installer helps keep the equipment warranty intact.",
    },
    {
      q: "How much does solar panel repair cost?",
      a: "Fixr puts a diagnostic visit at $150 to $300, the average repair at about $750, and a replacement inverter at $1,000 to $3,000. If the part is still under the maker's warranty you may pay only for labor; Enphase's warranty, for example, covers the microinverter but not the labor to swap it.",
    },
    {
      q: "Do solar panel warranties transfer when you buy a house?",
      a: "Often, but you may have to act. Enphase's US warranty carries over only if the new owner files its change of ownership form and pays a transfer fee within 30 days. SolarEdge has an online site transfer. Panel production warranties typically run about 25 years. Ask the seller for every warranty and the monitoring login.",
    },
    {
      q: "How do I find out who installed my solar panels?",
      a: "Look for a sticker on the inverter or junction box and check the house paperwork for contracts and warranties. The inverter brand is printed on the unit. On an Enphase system, the Enphase app shows your installer under Support, then Contact us.",
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
          datePublished: UPDATED,
          dateModified: UPDATED,
          author: { "@id": url("/#organization") },
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          mainEntityOfPage: url(PATH),
        }}
      />
      <HubHero
        image="solar-roof"
        crumbs={[{ name: "Solar panels not working", path: PATH }]}
        eyebrow="Solar repair guide"
        title={<>Panels gone quiet? <span className="text-amber-300">It&apos;s usually the inverter.</span></>}
        sub={
          <>
            Five safe checks you can do today, who fixes a system when the installer is gone, what repairs cost, and the paperwork if you
            bought a house that came with solar.
          </>
        }
      >
        <a href="#checks" className="btn btn-primary">What to check</a>
        <a href="#who" className="btn btn-light">Who can fix it</a>
      </HubHero>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Updated <time dateTime={UPDATED}>{formatDate(UPDATED)}</time>
        </p>
        <QuickAnswer>
          <p>
            Most dead systems are an inverter problem, a tripped breaker or a monitoring app that lost Wi-Fi; the panels themselves rarely fail.
            Check the app, the inverter&apos;s lights, the solar breaker and the rapid shutdown switch. If that doesn&apos;t fix it, find the
            inverter&apos;s brand and call one of that maker&apos;s certified installers: any licensed solar company can service a system it
            didn&apos;t install. Expect $150 to $300 for a diagnostic visit.
          </p>
        </QuickAnswer>

        <Section title="Five safe checks before you call anyone" id="checks">
          <ol className="list-decimal pl-5 space-y-4 text-stone-700 leading-relaxed">
            <li>
              <strong>Open the monitoring app.</strong> It shows live production. If it shows nothing at all, the system may still be running and
              only the inverter&apos;s internet connection has dropped, which EnergySage calls one of the most common &quot;failures&quot;. Check
              your Wi-Fi name and password haven&apos;t changed. New owner without a login? See{" "}
              <a href="#paperwork" className="underline">the paperwork section</a>.
            </li>
            <li>
              <strong>Look at the inverter.</strong> It is usually on a wall near the electric meter or in the garage. Note any lights and error
              codes and photograph them: a repair firm will ask. On a microinverter system the inverters sit under the panels on the roof; leave
              those to a pro.
            </li>
            <li>
              <strong>Check the breakers.</strong> In the main panel, look for a breaker labeled Solar, PV or Inverter, and check the AC disconnect
              switch next to the inverter is on. Reset a tripped breaker once. If it trips again, stop and call an electrician.
            </li>
            <li>
              <strong>Check the rapid shutdown switch.</strong> Newer systems may have a box with an on/off switch labeled &quot;rapid shutdown&quot; that
              lets firefighters de-energize the roof. If someone turned it off, the system stays off until it is switched back on.
            </li>
            <li>
              <strong>Compare with last year.</strong> Output drops in cloudy winter months, which is normal. The US Department of Energy says a
              drop of more than 10% from one year to the next may point to a maintenance problem.
            </li>
          </ol>
          <Callout tone="warn">
            Panels make electricity whenever light hits them, and you can&apos;t switch that off. Don&apos;t open the inverter, unplug cables or
            go on the roof. A burning smell, a breaker that keeps tripping, or a ground-fault or arc-fault error means call a professional. DIY
            repairs can also void the warranty.
          </Callout>
        </Section>

        <Section title="Who fixes solar when the installer is gone" id="who">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <p>
              Installers come and go; the equipment warranties usually outlive them. EnergySage notes that if your installer goes out of
              business, the panel and inverter makers&apos; warranties still apply. And you are not locked to the original company: any licensed
              solar firm can work on your system.
            </p>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <strong>Find the brand.</strong> The maker&apos;s name is on the inverter. A sticker on the inverter or junction box often names
                the installer too.
              </li>
              <li>
                <strong>Call that maker&apos;s certified installers.</strong> Enphase has an{" "}
                <a href={S.enphaseLocator.url} className="underline" rel="noopener">installer locator by ZIP code</a>, and a new installer can
                ask for access to your system in Enphase&apos;s app. Certified work keeps the warranty safe; EnergySage warns uncertified work can
                void it.
              </li>
              <li>
                <strong>Widen the search.</strong> Look up solar professionals in{" "}
                <a href={S.nabcep.url} className="underline" rel="noopener">NABCEP&apos;s directory</a> (the US Department of Energy calls NABCEP
                the industry-standard certification), then check their license with your state. Our{" "}
                <Link href="/solar-finder" className="underline">solar installer finder</Link> lists companies serving your state.
              </li>
              <li>
                <strong>Ask before they come out:</strong> do you take service-only jobs on systems you didn&apos;t install? Are you certified for
                my inverter brand? What is the diagnostic fee, and does it come off the repair?
              </li>
              <li>
                <strong>Stuck?</strong> Solar United Neighbors, a nonprofit, runs a free solar help desk, and lists where to complain: your state
                contractor licensing board and attorney general.
              </li>
            </ol>
            <Callout>
              <strong>Had a SunPower system?</strong> The company that now uses the SunPower name doesn&apos;t service systems installed on or
              before September 30, 2024. Cash and loan owners can use any licensed installer. Lease and PPA customers should call their financier
              or SunStrong Management at (833) 514-1858; for monitoring, SunPower lists (877) 299-4943.
            </Callout>
          </div>
        </Section>

        <Section title="What repairs cost" id="cost">
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Typical solar repair costs</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Job</th>
                  <th scope="col" className="p-3 font-semibold text-right">Typical cost</th>
                </tr>
              </thead>
              <tbody>
                {COSTS.map(([job, cost]) => (
                  <tr key={job} className="border-t border-black/6">
                    <th scope="row" className="p-3 font-medium">{job}</th>
                    <td className="p-3 text-right tabular-nums">{cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2">Fixr, updated January 31, 2025. Your quote depends on your system and area.</p>
          <div className="text-stone-700 leading-relaxed space-y-3 mt-4">
            <p>
              <strong>Check the warranty first.</strong> The Department of Energy puts panel life at 20 to 25 years and string inverters at 10 to
              15, so a system from the early 2010s may simply need its first new inverter. Microinverters last about as long as the panels:
              Enphase&apos;s IQ7 and IQ8 carry a 25-year warranty, though it covers the part and not the labor to replace it.
            </p>
          </div>
        </Section>

        <Section title="Bought a house with solar? The paperwork" id="paperwork">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Owned, leased or financed?</strong> The Department of Energy says to ask about every contract tied to the panels. A system
                paid off in cash or with a loan passes with the house; a lease or power purchase agreement belongs to a company, and that company
                fixes it. You can&apos;t claim the federal tax credit on a system someone else installed.
              </li>
              <li>
                <strong>Tell the utility.</strong> There is no national rule. Some utilities need a change of ownership form; National Grid in
                Massachusetts, for one, wants a form signed by the old and new owner. Others end the old net metering agreement and have you sign
                a new one. Search your utility&apos;s site for &quot;solar change of ownership&quot;.
              </li>
              <li>
                <strong>Move the warranty and monitoring into your name.</strong> Enphase&apos;s warranty carries over only if you file its change
                of ownership form and pay a transfer fee within 30 days. SolarEdge has an online site transfer that also gives you the monitoring.
              </li>
              <li>
                <strong>Previous owner can&apos;t help?</strong> If they have died or can&apos;t be reached, ask the inverter maker how to transfer without them.
                SolarEdge, for one, accepts a document proving you own the home in place of the old owner&apos;s Site ID.
              </li>
            </ul>
          </div>
        </Section>

        <Section title="In the UK?" id="uk">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <p>
              For Feed-in Tariff panels, the change of ownership goes to the energy company that pays the tariff, not to Ofgem. Ofgem can tell
              you which company the panels are registered with (and who owns them, if they belong to a &quot;rent-a-roof&quot; company), and if a change isn&apos;t sorted within 8 weeks of a complaint, you can take it
              to the Energy Ombudsman. For repairs, search for an MCS-certified installer; if your installer has gone, MCS can reissue the
              system&apos;s certificate to the current owner for a fee (helpdesk 0333 103 8130).
            </p>
          </div>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          General information, not electrical, legal or financial advice. Solar systems carry dangerous voltages: leave inspection and repair to
          a licensed professional. Costs and warranty terms change; check them with the maker and your installer.
        </Disclaimer>
        <Sources items={Object.values(S)} />
        <RelatedLinks
          links={[
            { href: "/solar-finder", label: "Find solar installers", desc: "Companies serving your state, and how to judge a quote" },
            { href: "/solar-calculator", label: "Solar savings calculator", desc: "What your panels should make and save in your state" },
            { href: "/home-battery-backup", label: "Home battery backup", desc: "Add a battery so solar keeps working in an outage" },
            { href: "/home-energy", label: "All home energy guides", desc: "Solar, batteries and backup power by state" },
          ]}
        />
        <PhotoCredit name="solar-roof" />
      </div>
    </article>
  );
}
