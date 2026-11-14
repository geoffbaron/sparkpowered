/**
 * Parts and installed-cost figures for connecting a portable battery to a house
 * (the /home-backup cluster). Every price is read on the maker's own US store, or
 * from a named cost guide, on the date given; pages print them from here, never by hand.
 * Plain values only, so server and client code can both import it.
 *
 * Maker prices are the shelf price before any timed code (`listPriceUsd`) and the
 * price the page showed after its auto-applied code (`priceUsd`). Pages show the shelf
 * price as the rough cost, because the codes end and we do not track their end dates.
 */

import { HOMEGUIDE_SWITCH, INTERLOCK_INSTALLED_USD, PARTS } from "@/data/hookup";

export interface HookupPart {
  id: string;
  name: string;
  /** Maker's product page (no tracking; PartnerLink adds it). */
  url: string;
  /** Regular price on the maker's US store. */
  listPriceUsd: number;
  /** Price shown after the store's own auto-applied code on `retrieved`, if lower. */
  priceUsd?: number;
  /** YYYY-MM-DD read on the maker's US store. */
  retrieved: string;
  inStock: boolean;
  /** What the maker's page says it is for, in plain words. */
  note: string;
}

export interface CostRange {
  id: string;
  label: string;
  lowUsd: number;
  highUsd: number;
  source: string;
  url: string;
  /** When the source itself was last updated. */
  sourceUpdated: string;
  /** When we read it. */
  retrieved: string;
}

const NOV14 = "2026-11-14";

export const HOOKUP_PARTS = {
  ankerMts30: {
    id: "anker-mts-10c-30a",
    name: "Anker SOLIX 10-Circuit Manual Transfer Switch (120/240 V, 30 A)",
    url: "https://www.ankersolix.com/products/home-backup-kit-for-f3000-2",
    listPriceUsd: 789.99,
    priceUsd: 549.99,
    retrieved: NOV14,
    inStock: true,
    note: "Reliance Pro/Tran 2 switch with a 30 A cable; Anker's option list labels it for one F3800 Plus or two F3000s.",
  },
  ankerMts50: {
    id: "anker-mts-10c-50a",
    name: "Anker SOLIX 10-Circuit Manual Transfer Switch (120/240 V, 50 A)",
    url: "https://www.ankersolix.com/products/home-backup-kit-for-f3800-10c",
    listPriceUsd: 859.99,
    priceUsd: 599.99,
    retrieved: NOV14,
    inStock: true,
    note: "For an F3800 or two linked F3800 Plus units; Anker's page says it is not suitable for a single F3800 Plus.",
  },
  ankerHpp: {
    id: "anker-home-power-panel-kit",
    name: "Anker SOLIX Smart Home Power Kit (Home Power Panel, subpanel, ground bar)",
    url: "https://www.ankersolix.com/products/smart-home-power-kit",
    listPriceUsd: 1799.99,
    priceUsd: 1199.99,
    retrieved: NOV14,
    inStock: true,
    note: "Licensed electrician required; a standard 100 A breaker is sold separately.",
  },
  ankerHppInstall: {
    id: "anker-home-power-panel-install",
    name: "Anker SOLIX Home Power Panel Installation Service (without permit)",
    url: "https://www.ankersolix.com/products/smart-home-power-kit",
    listPriceUsd: 2000,
    retrieved: NOV14,
    inStock: true,
    note: "Anker's own add-on on the kit page; the permit is not included.",
  },
  f3800PlusHppKit: {
    id: "anker-f3800-plus-smart-home-power-kit",
    name: "Anker SOLIX F3800 Plus + Smart Home Power Kit",
    url: "https://www.ankersolix.com/products/f3800-plus-smart-home-power-kit",
    listPriceUsd: 4799.99,
    priceUsd: 3199.99,
    retrieved: NOV14,
    inStock: true,
    note: "The F3800 Plus with the Home Power Panel kit; in stock (dispatch within 7 days) while the F3800 Plus alone was sold out.",
  },
  bluettiAt1: {
    id: "bluetti-at1",
    name: "Bluetti AT1 Smart Distribution Panel",
    url: "https://www.bluettipower.com/products/at1",
    listPriceUsd: 1299,
    retrieved: NOV14,
    inStock: true,
    note: "Automatic transfer panel; Bluetti lists it as compatible with Apex 300 systems, up to three units through its Hub A1.",
  },
  bluettiApexKit: {
    id: "bluetti-apex-300-home-integration-kit",
    name: "Bluetti Apex 300 Home Integration Kit",
    url: "https://www.bluettipower.com/products/apex-300-home-integration-kit",
    listPriceUsd: 699,
    retrieved: NOV14,
    inStock: true,
    note: "Bluetti's listing says only that it ties an Apex 300 into home circuits; the linked guide is a scanned image with no text we could check.",
  },
  growattHub: {
    id: "growatt-double-voltage-hub",
    name: "Growatt Double Voltage Power Hub",
    url: "https://growattportable.com/products/growatt-double-voltage-power-hub",
    listPriceUsd: 139,
    retrieved: NOV14,
    inStock: true,
    note: "Joins two HELIOS 3600 units for 7,200 W at 240 V; one NEMA 6-20 and two NEMA L14-30 outlets.",
  },
} satisfies Record<string, HookupPart>;

/**
 * Installed-cost ranges, built from the HomeGuide figures in src/data/hookup.ts (the
 * hookup picker's file) so the cluster shows one set of numbers. HomeGuide's title says
 * 2026, but its own markup dates the figures April 5, 2023; pages say so.
 */
const hg = (id: string, label: string, [lowUsd, highUsd]: readonly [number, number]): CostRange => ({
  id,
  label,
  lowUsd,
  highUsd,
  source: HOMEGUIDE_SWITCH.name,
  url: HOMEGUIDE_SWITCH.url,
  sourceUpdated: HOMEGUIDE_SWITCH.published!,
  retrieved: HOMEGUIDE_SWITCH.retrieved,
});

export const HOOKUP_COSTS = {
  inletBox: hg("inlet-box", "Power inlet box (part only)", PARTS.inlet.usd),
  cord: hg("cord", "Heavy-duty cord from the battery to the inlet box", PARTS.inletCord.usd),
  interlock: hg("interlock", "Interlock kit, installed (labor and materials)", INTERLOCK_INSTALLED_USD),
  // HomeGuide's "manual transfer switch cost installed" headline range (not itemized in hookup.ts).
  manualSwitch: hg("manual-switch", "Manual transfer switch, installed", [400, 1300]),
  labor: hg("labor", "Electrician's labor to install a transfer switch", PARTS.switchLabor.usd),
  permit: hg("permit", "Electrical permit", PARTS.permit.usd),
} satisfies Record<string, CostRange>;

/** Safety sources every hookup page cites (all read Nov 14 2026). */
export const HOOKUP_SAFETY_SOURCES = {
  cpsc: {
    name: "CPSC, Portable generator hazards safety alert (PDF)",
    url: "https://www.cpsc.gov/s3fs-public/5123_SafetyAlert_PortableGenerators_102021_0.pdf?VersionId=PK4zcSnKUJE8ovzbCGV09MM5.RBIG_E5",
    detail: "never power house wiring by plugging into a wall outlet (backfeeding): it can electrocute utility workers and neighbors on the same transformer; cords rated above the total wattage",
  },
  osha: {
    name: "OSHA, Using portable generators safely (PDF)",
    url: "https://www.osha.gov/sites/default/files/publications/OSHA3286.pdf",
    detail: "connect to a building's wiring only through a transfer switch installed by a qualified electrician; grounded 3-prong cords rated for the load",
  },
} as const;

export const range = (c: CostRange) => `$${c.lowUsd.toLocaleString("en-US")} to $${c.highUsd.toLocaleString("en-US")}`;
