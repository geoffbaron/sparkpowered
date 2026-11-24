import type { Metadata } from "next";
import Link from "next/link";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { HubHero, PhotoCredit } from "@/components/ui";
import { INSTALL_COST, OTHER_CHARGERS } from "@/data/buyer-guides";
import { HOME_CHARGERS } from "@/data/chargers";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/ev-charger-extension-cord";
const UPDATED = "2026-11-14";
const TITLE = "Can You Use an Extension Cord With a Level 2 EV Charger? What the Makers Say";
const DESCRIPTION =
  "Tesla, Lectron, Autel and EVIQO all say not to plug their chargers in through an extension cord. Why, what the 'EV extension cables' sold online are, and the safe ways to reach your car.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const S = {
  teslaWall: {
    name: "Tesla, Wall Connector Gen 3 (J1772) installation manual: Important safety information",
    url: "https://energylibrary.tesla.com/docs/Public/Charging/WallConnector/Gen3/Install/J1772/en-us/GUID-80DFDC40-6612-43BC-8CFE-C042A3774BDE.html",
  },
  teslaMobile: {
    name: "Tesla, Mobile Connector Gen 3 owner's manual (North America)",
    url: "https://digitalassets.tesla.com/tesla-contents/image/upload/mobile-connector-gen-3-owners-manual-en-na.pdf",
  },
  lectron: {
    name: "Lectron, 40 Amp Level 2 EV Charger user manual (NEMA 14-50), as hosted by distributor Transend",
    url: "https://cdn.transend.us/img/EVCharge14-50-40A-Instructions.pdf",
  },
  autel: {
    name: "Autel, MaxiCharger AC Elite Business user manual (from autelenergy.us downloads)",
    url: "https://cdn.shopify.com/s/files/1/0603/1710/6336/files/MaxiCharger_AC_Elite_Business_User_Manual_102022.pdf",
  },
  eviqo: {
    name: "EVIQO help center, Can the plug-in charger be used with a NEMA 14-30 outlet? (updated Apr 10, 2026)",
    url: "https://resources.eviqo.io/article/nema-14-30-compatibility",
  },
  ecm: {
    name: "EC&M, The apprentice's guide to Article 625 (NEC 625.40 and 625.41: EV charging is a continuous load)",
    url: "https://ecmweb.com/national-electrical-code/article/21277122/the-apprentices-guide-to-article-625",
  },
  energysage: { name: INSTALL_COST.source, url: INSTALL_COST.url },
};

/** What each maker's own documents say about plugging the charger in through an extension cord. */
const MAKERS: { maker: string; doc: string; says: string; src: keyof typeof S }[] = [
  { maker: "Tesla", doc: "Wall Connector (Gen 3) install manual", says: "Cord extension sets are not allowed, and no adapters.", src: "teslaWall" },
  {
    maker: "Tesla",
    doc: "Mobile Connector owner's manual",
    says: "No extension cord, multi-outlet adapter, multi-plug, conversion plug or power strip.",
    src: "teslaMobile",
  },
  { maker: "Lectron", doc: "40 A Level 2 charger manual", says: "Never use the charger with an extension cord, or with any AC adapter.", src: "lectron" },
  { maker: "Autel", doc: "MaxiCharger AC Elite Business manual", says: "Do not use this device with an extension cord, to avoid a risk of fire or electric shock.", src: "autel" },
  {
    maker: "EVIQO",
    doc: "Help center",
    says: "Adapters and extension cords are not recommended: they can add resistance, overheating and voltage drop, and may void the warranty.",
    src: "eviqo",
  },
];

export default function EvChargerExtensionCordPage() {
  const cables = [...HOME_CHARGERS, ...OTHER_CHARGERS].map((c) => c.cableFt).filter((x): x is number => typeof x === "number");
  const minCable = Math.min(...cables);
  const maxCable = Math.max(...cables);

  const faqs = [
    {
      q: "Can I use an extension cord with a Level 2 EV charger?",
      a: "No. Every charger maker's manual we read says not to plug the charger in through an extension cord: Tesla, Lectron, Autel and EVIQO. A Level 2 charger draws a heavy load for hours, and each extra plug and socket is a place for heat to build. If the cable doesn't reach, park closer, get a charger with a longer cable, or have a licensed electrician add an outlet or hardwire a charger where you park.",
    },
    {
      q: "Is a heavy-duty or 10-gauge extension cord OK for a NEMA 14-50 charger?",
      a: "Not if your charger's manual says no extension cords, and the ones we read all do. A thick cord doesn't remove the extra plug-and-socket joint, which is where heat tends to build on a long, heavy charge, and using one can void the warranty (EVIQO says non-approved adapters may).",
    },
    {
      q: "What about the 'EV extension cables' sold online?",
      a: "Some makers, Lectron among them, sell cables that plug between the charger's connector and the car. Lectron's blog says purpose-built ones are safe, yet its own 40-amp charger manual says never use the charger with an extension cord. Our advice: if your charger's manual doesn't approve one by name, don't use it.",
    },
    {
      q: "Can I use an extension cord with a Level 1 charger on a regular outlet?",
      a: "Tesla's Mobile Connector manual says no extension cord, multi-plug adapter or power strip, and other makers say the same. Plug a Level 1 charger straight into a wall outlet in good condition, ideally one with little else on the circuit.",
    },
    {
      q: "How long are home EV charger cables?",
      a: `The home chargers we track come with cables of ${minCable} to ${maxCable} feet. Measure from the outlet, or from where the charger would hang, to your car's charge port along the path the cable would take, with some slack.`,
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
        image="ev"
        crumbs={[
          { name: "Best home EV charger", path: "/best-home-ev-charger" },
          { name: "Extension cords", path: PATH },
        ]}
        eyebrow="Home charging safety"
        title={<>Extension cord for a Level 2 charger? <span className="text-amber-300">Every maker we checked says no.</span></>}
        sub={
          <>
            What Tesla, Lectron, Autel and EVIQO say in their own manuals, why, and the safe ways to get the charger to your car.
          </>
        }
      >
        <a href="#makers" className="btn btn-primary">What the makers say</a>
        <a href="#options" className="btn btn-light">Safe options</a>
      </HubHero>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Updated <time dateTime={UPDATED}>{formatDate(UPDATED)}</time>
        </p>
        <QuickAnswer>
          <p>
            No. Tesla, Lectron, Autel and EVIQO all tell you not to plug their chargers in through an extension cord, and Autel&apos;s manual
            says why: risk of fire or electric shock. A Level 2 charger pulls a heavy current for hours, and every extra plug and socket is a
            place for heat to build. If the cable won&apos;t reach, park closer, choose a charger with a longer cable (home chargers come with{" "}
            {minCable} to {maxCable} feet), or have a licensed electrician add an outlet or hardwire a charger where you park.
          </p>
        </QuickAnswer>

        <Section title="What the charger makers say" id="makers">
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Charger makers&apos; instructions on extension cords</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Maker</th>
                  <th scope="col" className="p-3 font-semibold">Document</th>
                  <th scope="col" className="p-3 font-semibold">What it says</th>
                </tr>
              </thead>
              <tbody>
                {MAKERS.map((m) => (
                  <tr key={m.maker + m.doc} className="border-t border-black/6 align-top">
                    <th scope="row" className="p-3 font-medium">{m.maker}</th>
                    <td className="p-3">
                      {m.doc}
                    </td>
                    <td className="p-3">{m.says}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2">Read on {formatDate(UPDATED)}. Wording paraphrased; each document is listed under Sources.</p>
        </Section>

        <Section title="Why the makers say no" id="why">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <p>
              <strong>It&apos;s a heavy load for a long time.</strong> The electrical code treats EV charging as a continuous load, which is
              why a 50-amp outlet is only allowed to carry 40 amps of charging.
            </p>
            <p>
              <strong>Heat builds at the joints.</strong> EVIQO&apos;s help center names the problems: extra resistance, overheating and voltage
              drop. An extension cord adds another plug and socket, and a joint that is a little loose or worn gets hot under a long, heavy
              charge.
            </p>
            <p>
              <strong>It can cost you the warranty.</strong> EVIQO says non-approved adapters may void it. When a manual says no, using one
              anyway puts the risk on you.
            </p>
          </div>
          <Callout tone="warn">
            Don&apos;t use a household extension cord, a power strip, a multi-plug or a plug adapter with any EV charger, Level 1 or Level 2.
            If an outlet, plug or cord ever feels hot, looks discolored or smells of burning, unplug only if it is safe to, switch off the
            breaker, and have a licensed electrician check it before you charge again.
          </Callout>
        </Section>

        <Section title="What about 'EV extension cables'?" id="ev-cables">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <p>
              You will find 240-volt &quot;EV extension cords&quot; for sale, including ones that plug in between the charger&apos;s connector
              and the car. Lectron sells 20-foot ones, and its blog calls purpose-built cables safe. Yet Lectron&apos;s own 40-amp charger manual
              says never to use the charger with an extension cord.
            </p>
            <p>
              Our rule: follow your charger&apos;s manual. If it doesn&apos;t approve a specific extension by name, don&apos;t use one. The options
              below solve the reach problem without adding a joint.
            </p>
          </div>
        </Section>

        <Section title="Safe ways to reach your car" id="options">
          <ol className="list-decimal pl-5 space-y-4 text-stone-700 leading-relaxed">
            <li>
              <strong>Measure first.</strong> From the outlet, or from where the charger would hang, to your car&apos;s charge port, along the
              path the cable would actually lie, plus a little slack. Home chargers come with {minCable} to {maxCable} feet of cable.
            </li>
            <li>
              <strong>Park differently.</strong> Backing in instead of pulling in nose-first, or the other way round, can close the gap, depending on which side the
              charge port is on.
            </li>
            <li>
              <strong>Choose a charger with a longer cable.</strong> If yours is short, a {maxCable}-foot cable may reach where it didn&apos;t.
              Compare cable lengths in our <Link href="/best-home-ev-charger" className="underline">home charger guide</Link>.
            </li>
            <li>
              <strong>Have an electrician move or add the outlet.</strong> A licensed electrician can run a new 240-volt circuit to where you
              park, with a permit where your town requires one. A long wire run is the costly part: EnergySage puts a 60 to 80-foot run at
              about {money(INSTALL_COST.longRun[0])} to {money(INSTALL_COST.longRun[1])} extra.
            </li>
            <li>
              <strong>Or hardwire a charger where you park.</strong> If a new circuit is going in anyway, the charger can be wired in
              directly, with no outlet at all. Ask the electrician which is better for your panel and your car; see{" "}
              <Link href="/ev-charger-installation-cost" className="underline">installation costs by state</Link>.
            </li>
          </ol>
          <p className="text-stone-700 leading-relaxed mt-4">
            Need a charge tonight and the cable won&apos;t reach? Use a public charger rather than a cord you&apos;re unsure of.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          General information, not electrical advice. Follow your charger&apos;s manual, and leave outlets, circuits and charger wiring to a
          licensed electrician.
        </Disclaimer>
        <Sources items={Object.values(S)} />
        <RelatedLinks
          links={[
            { href: "/ev-charger-tripping-gfci", label: "Charger tripping a GFCI breaker?", desc: "Why it happens and the safe fix" },
            { href: "/ev-charger-installation-cost", label: "EV charger installation cost", desc: "Average price in your state, and what adds to it" },
            { href: "/best-home-ev-charger", label: "Best home EV charger", desc: "Cable length, amps and plug compared" },
            { href: "/questions/ev-charging", label: "Home charging questions", desc: "Breaker size, dryer outlets and permits" },
          ]}
        />
        <PhotoCredit name="ev" />
      </div>
    </article>
  );
}
