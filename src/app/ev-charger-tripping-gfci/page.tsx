import type { Metadata } from "next";
import Link from "next/link";
import Byline from "@/components/Byline";
import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { QuickAnswer } from "@/components/guide-ui";
import { HubHero, PhotoCredit } from "@/components/ui";
import { INSTALL_COST } from "@/data/buyer-guides";
import { brandName, chargerById } from "@/data/chargers";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";
import { JsonLd, pageMetadata, url, AUTHOR_REF, pageUpdated } from "@/lib/seo";

const PATH = "/ev-charger-tripping-gfci";
const UPDATED = "2026-11-14";
const TITLE = "EV Charger Tripping a GFCI Breaker? Why, and the Fix";
const DESCRIPTION =
  "Why a plug-in Level 2 charger trips a GFCI breaker (two ground-fault protections on one circuit, and code requires the outlet one), what you can safely check, and why hardwiring by a licensed electrician is the usual fix.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

/** Hardwired chargers we link to. The page's answer is "hardwire", so only hardwired models get store links. */
const GFCI_PAGE_CHARGERS = ["eviqo-j1772-hardwired-48a", "eviqo-nacs-hardwired-48a", "autel-elite-home-50a"] as const;

/** Trip thresholds, from the sources below. */
const GFCI_TRIP_MA = 6; // CPSC: a GFCI trips at a difference "as little as 0.006 amperes"
const CCID_TRIP_MA = 20; // Autel MaxiCharger AC Wallbox Home spec: "20 mA CCID with auto retry"

const S = {
  nfpaTia: {
    name: "NFPA, NFPA 70 (2026 NEC) Proposed TIA 1892 on section 625.54, with the current text and the task group's substantiation",
    url: "https://docinfofiles.nfpa.org/files/AboutTheCodes/70/NFPA_70_Proposed_TIA_1892.pdf",
  },
  ecm: {
    name: "Mike Holt, NEC requirements for EV equipment, EC&M (Nov 9, 2023)",
    url: "https://www.ecmweb.com/national-electrical-code/code-basics/article/21276414/nec-requirements-for-ev-equipment",
  },
  cpsc: { name: "US Consumer Product Safety Commission, What is a GFCI? (fact sheet)", url: "https://www.cpsc.gov/s3fs-public/099_0.pdf" },
  cpGuide: {
    name: "ChargePoint, Home Flex: essential pre-installation guidelines for electricians",
    url: "https://docs.chargepoint.com/cpdocs-sec/content/1-home/cph50/pre-ig/elctrcn-instlltn-tps.htm",
  },
  cpFaq: { name: "ChargePoint, Home Flex installation FAQ", url: "https://chargepoint.com/drivers/home/installation/flex" },
  autelHome: {
    name: "Autel, MaxiCharger AC Wallbox Home user manual (from autelenergy.us downloads)",
    url: "https://cdn.shopify.com/s/files/1/0603/1710/6336/files/autel-ac-maxicharger-home-user-manual.pdf",
  },
  autelNew: {
    name: "Autel, MaxiCharger Single Charger installation and operation manual, UL model, v2.0 (Oct 2025)",
    url: "https://cdn.shopify.com/s/files/1/0603/1710/6336/files/MaxiCharger_Single_Charger_Installation_and_Operation_Manual_UL_V2.0-20251017.pdf",
  },
  eviqoTrip: { name: "EVIQO help center, Breaker is tripping: GFCI breaker? (updated Apr 10, 2026)", url: "https://resources.eviqo.io/article/breaker-tripping-gfci" },
  eviqoGfci: {
    name: "EVIQO help center, Is a GFCI breaker required for hardwired installation? (updated Apr 10, 2026)",
    url: "https://resources.eviqo.io/article/gfci-breaker-required",
  },
  eviqoWire: { name: "EVIQO help center, Plug-in vs hardwire installation (updated Apr 10, 2026)", url: "https://resources.eviqo.io/article/plug-in-vs-hardwire" },
  energysage: { name: INSTALL_COST.source, url: INSTALL_COST.url },
};

export default function EvChargerTrippingGfciPage() {
  const picks = GFCI_PAGE_CHARGERS.map((id) => chargerById(id));
  const [hw0, hw1] = INSTALL_COST.hardwireVsPlug;

  const faqs = [
    {
      q: "Why does my Level 2 EV charger keep tripping the GFCI breaker?",
      a: `Usually because the circuit has two ground-fault protections. Most Level 2 chargers have their own built in, and the electrical code (NEC 625.54) requires GFCI protection on any outlet used for EV charging, so a plug-in charger usually sits behind a GFCI breaker too. A GFCI breaker can trip at as little as ${GFCI_TRIP_MA} milliamps of leakage, while a charger's own protection is often set around ${CCID_TRIP_MA}, so the breaker can trip first. It can also mean a real fault, such as moisture or damaged wiring, and you can't tell which from the outside. Reset it once; if it trips again, leave it off and call a licensed electrician.`,
    },
    {
      q: "Can I replace the GFCI breaker with a regular breaker?",
      a: "Not yourself, and not on a plug-in outlet without an electrician and your local inspector agreeing. The code requires GFCI protection on outlets used for EV charging, and working in the panel is a job for a licensed electrician with a permit. Never use any adapter or trick to bypass a GFCI.",
    },
    {
      q: "Does hardwiring an EV charger stop GFCI tripping?",
      a: "Often, and it is the fix charger makers point to. ChargePoint says that if local code requires a GFCI breaker for a plug-in install, it recommends hardwiring instead. The GFCI rule in NEC 625.54 is written for outlets, and a hardwired charger has no outlet, but other GFCI rules can still apply, especially outdoors, so the electrician and your local inspector decide.",
    },
    {
      q: "Is it dangerous if my EV charger trips the breaker?",
      a: "The trip itself is the safety system working. The danger is in guessing. A trip can be two protections clashing, or it can be a real ground fault, water or a damaged cord or outlet. If you see scorch marks, melting or smell burning, turn the breaker off and don't use the outlet until an electrician has checked it.",
    },
    {
      q: "How much does it cost to hardwire an EV charger instead of using a plug?",
      a: `EnergySage puts the difference between a hardwired and a plug-in install at about ${money(hw0)} to ${money(hw1)}. If the electrician also has to run a new circuit or upgrade the panel, it costs more; see our installation cost guide for your state's average.`,
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
          author: AUTHOR_REF,
          publisher: { "@id": url("/#organization") },
          isPartOf: { "@id": url("/#website") },
          mainEntityOfPage: url(PATH),
        }}
      />
      <HubHero
        byline={<Byline path={PATH} tone="dark" />}
        image="ev"
        crumbs={[
          { name: "Charger tripping a GFCI breaker", path: PATH },
        ]}
        eyebrow="Home charging safety"
        title={<>Charger tripping the GFCI? <span className="text-amber-300">Two safety devices, one circuit.</span></>}
        sub={
          <>
            Why a plug-in Level 2 charger and a GFCI breaker often don&apos;t get along, the few things you can safely check, and why the
            usual fix is a licensed electrician hardwiring the charger.
          </>
        }
      >
        <a href="#check" className="btn btn-primary">What I can check</a>
        <a href="#fix" className="btn btn-light">The fix</a>
      </HubHero>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Updated <time dateTime={UPDATED}>{formatDate(UPDATED)}</time>
        </p>
        <QuickAnswer>
          <p>
            Most Level 2 chargers have their own ground-fault protection built in, and the electrical code also requires GFCI protection on
            any outlet used for EV charging. The breaker is the more sensitive of the two, so it can trip even when nothing is wrong, or it
            can be catching a real fault. You can&apos;t tell which from the outside. Reset it once. If it trips again, leave it off and
            call a licensed electrician. The usual code-compliant fix is having them hardwire the charger. Never swap the breaker yourself or
            use anything that bypasses a GFCI.
          </p>
        </QuickAnswer>

        <Section title="Why it happens" id="why">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <p>
              <strong>The code puts a GFCI on the outlet.</strong> Section 625.54 of the National Electrical Code says all receptacles
              installed for EV charging must have ground-fault protection for people. That is why a NEMA 14-50 outlet for a charger is
              normally fed by a GFCI breaker. The rule is about outlets: a hardwired charger has none.
            </p>
            <p>
              <strong>The charger has its own.</strong> Chargers carry a built-in ground-fault device, often called a CCID. Autel lists{" "}
              {CCID_TRIP_MA} mA in its Home charger&apos;s specs; EVIQO, ChargePoint and others say theirs is built in. A household GFCI, per
              the Consumer Product Safety Commission, cuts power when as little as {GFCI_TRIP_MA} mA goes astray. Stack the two and the
              breaker can trip first on leakage the charger was designed to tolerate.
            </p>
            <p>
              <strong>Even the code writers say so.</strong> A 2026 proposal to amend 625.54, from a task group set up by the body that writes
              the code (NFPA), says the trip levels of chargers&apos; built-in protection are not compatible with GFCI trip levels, and that the
              current wording has caused unwanted tripping, failed inspections and inspectors disagreeing. It was a proposal when we read it;
              your local inspector&apos;s reading is what counts where you live.
            </p>
            <p>
              <strong>Makers disagree on the breaker.</strong> ChargePoint does not recommend a GFCI breaker with its Home Flex and says a
              panel GFCI causes nuisance tripping. Autel&apos;s Home charger manual asks for a non-GFCI breaker, while its newer 2025 charger
              manual says that model runs on a GFCI breaker fine. So check the manual for your exact model.
            </p>
          </div>
        </Section>

        <Section title="What you can safely check" id="check">
          <p className="text-stone-700 leading-relaxed mb-4">
            None of these needs tools or a cover off. They give the electrician a head start.
          </p>
          <ol className="list-decimal pl-5 space-y-4 text-stone-700 leading-relaxed">
            <li>
              <strong>Note when it trips.</strong> The moment you plug in, when charging starts, hours in, or only in rain? Write it down with
              the date.
            </li>
            <li>
              <strong>Read the charger&apos;s error.</strong> Many chargers flash a code or send an app alert on a ground fault (EVIQO&apos;s app
              notifies you; Autel&apos;s manual lists &quot;ground fault&quot; and &quot;residual current detected&quot; codes). Photograph it.
            </li>
            <li>
              <strong>Look at the breaker&apos;s face.</strong> Open the panel door, not the cover behind it. A GFCI breaker has a TEST button.
              Never take the panel cover off.
            </li>
            <li>
              <strong>Look at the plug and outlet without touching.</strong> Discoloring, melting, a warm or burning smell, or a loose plug
              means stop: leave the breaker off and don&apos;t use that outlet until an electrician has checked it.
            </li>
            <li>
              <strong>Outdoors, check it&apos;s dry.</strong> An outdoor outlet needs a weatherproof cover that stays closed with the plug in.
              Don&apos;t handle a wet plug or outlet.
            </li>
            <li>
              <strong>Reset once.</strong> If it trips again, stop resetting. Repeated trips are the breaker telling you something.
            </li>
          </ol>
          <Callout tone="warn">
            <strong>Never:</strong> swap the GFCI breaker for a standard one yourself, use any adapter, cord or device that bypasses a GFCI,
            plug the charger into a different outlet through an adapter or extension cord, open the charger, or keep resetting a breaker that
            keeps tripping. Panel work is for a licensed electrician, with a permit where your town requires one.
          </Callout>
        </Section>

        <Section title="The fix: call a licensed electrician" id="fix">
          <div className="text-stone-700 leading-relaxed space-y-3">
            <p>
              <strong>First they rule out a real fault.</strong> A good electrician tests the circuit, the outlet and the connections before
              blaming the breaker. A worn or cheap outlet, a loose wire or moisture can all cause trips, and those need fixing whatever the
              charger.
            </p>
            <p>
              <strong>If the wiring is sound, hardwiring is the usual answer.</strong> ChargePoint&apos;s own guidance is that where local code
              requires a GFCI breaker for a plug-in install, it recommends a hardwired install. A hardwired charger has no outlet, so the outlet
              rule above doesn&apos;t apply to it in the same way; other GFCI rules can still apply, especially outdoors, which is why the
              electrician and inspector make the call. EnergySage puts the extra cost of hardwiring at about {money(hw0)} to {money(hw1)}.
            </p>
            <p>
              <strong>You may not need a new charger.</strong> Some plug-in chargers can be converted: Autel&apos;s manual shows swapping the
              plug cord for a hardwire connection. Others sell a separate hardwired version, as ChargePoint does. Ask the maker before you buy.
            </p>
            <p>
              <strong>About the breaker swap advice online.</strong> EVIQO&apos;s help center says the most common fix is for your electrician
              to replace the GFCI breaker with a standard one. On a plug-in outlet that conflicts with the code rule above, so treat it as a question for your
              electrician and inspector, not a shortcut. It is never a do-it-yourself job.
            </p>
            <p>
              <strong>Bonus: hardwired chargers can go faster.</strong> A 50-amp outlet caps charging at 40 amps. Hardwired, EVIQO&apos;s
              chargers run at 48 amps on a 60-amp circuit and Autel&apos;s at 50 amps, if your panel has room and your car can take it.
            </p>
          </div>
        </Section>

        <Section title="Hardwired chargers, if you're buying one" id="hardwired">
          <AffiliateDisclosure className="mb-5" />
          <ul className="space-y-4 text-stone-700 leading-relaxed">
            {picks.map((c) => (
              <li key={c.id} className="rounded-xl border border-black/8 bg-surface p-4">
                <p className="font-semibold">
                  {brandName(c)} {c.name}
                </p>
                <p className="text-sm mt-1">
                  {c.amps} amps, {c.plug === "NACS" ? "Tesla-style NACS plug" : "J1772 plug (most non-Tesla EVs)"}, {c.cableFt}-ft cable.{" "}
                  {c.outlet}.
                </p>
                <p className="text-sm mt-2">
                  <PartnerLink brand={c.brand} productId={c.id} productUrl={c.url} disclose>
                    See it at {brandName(c)}
                  </PartnerLink>
                </p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted mt-3">
            All three must be installed by a licensed electrician on a dedicated circuit sized to the maker&apos;s instructions.
          </p>
        </Section>

        <Faq items={faqs} path={PATH} />
        <Disclaimer>
          General information, not electrical advice. Electrical codes differ by state and town, and your local inspector has the final word.
          Leave panel, breaker and charger wiring to a licensed electrician.
        </Disclaimer>
        <RelatedLinks
          links={[
            { href: "/ev-charger-extension-cord", label: "Extension cord for a Level 2 charger?", desc: "What charger makers say, and the safe options" },
          ]}
        />
        <Sources checked={pageUpdated(PATH)} items={Object.values(S)} />
        <PhotoCredit name="ev" />
      </div>
    </article>
  );
}
