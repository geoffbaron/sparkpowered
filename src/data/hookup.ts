/**
 * Connecting a portable battery to a house: the parts each method needs, with
 * rough costs, and which models can use which method.
 *
 * Every figure is read from a named page on the `retrieved` date and logged in
 * docs/fact-check-2026-11-home-backup.md. Costs are ranges, never one price:
 * they vary by store, panel and area. Plain values only, so server and client
 * code can both import this file.
 */

export interface CostSource {
  name: string;
  url: string;
  /** YYYY-MM-DD the figure was read. */
  retrieved: string;
  /** YYYY-MM-DD the source dates its own figures, when it says (HomeGuide's title says 2026, its page markup says this). */
  published?: string;
}

export const HOMEGUIDE_SWITCH: CostSource = {
  name: "HomeGuide, Generator transfer switch installation cost (2026)",
  url: "https://homeguide.com/costs/generator-transfer-switch-installation-cost",
  retrieved: "2026-11-14",
  published: "2023-04-05",
};

export const IRON_FORGE_CORDS: CostSource = {
  name: "Iron Forge Cable US store, 12-gauge outdoor extension cords",
  url: "https://ironforgecable.com/collections/all",
  retrieved: "2026-11-14",
};

export interface Part {
  id: string;
  label: string;
  /** Low and high cost in USD for the part as described (quantity included). */
  usd: [number, number];
  source: CostSource;
  /** Shown under the line, e.g. what the range covers. */
  note?: string;
}

/** HomeGuide's line items, as published on its page. */
export const PARTS: Record<string, Part> = {
  cords: {
    id: "cords",
    label: "One to three 12-gauge outdoor-rated extension cords, 25 to 50 ft",
    // A generic range for the item type (one short cord to three long ones), not a product price.
    usd: [40, 200],
    source: IRON_FORGE_CORDS,
    note: "One cord per appliance, each plugged straight into the battery. No power strips or daisy-chained cords.",
  },
  interlock: { id: "interlock", label: "Interlock kit listed for your exact panel", usd: [50, 150], source: HOMEGUIDE_SWITCH },
  inlet: { id: "inlet", label: "Power inlet box mounted outside", usd: [20, 100], source: HOMEGUIDE_SWITCH },
  inletCord: { id: "inletCord", label: "Heavy-duty cord from the battery to the inlet box", usd: [30, 350], source: HOMEGUIDE_SWITCH },
  supplies: { id: "supplies", label: "Breaker, wire and job supplies", usd: [200, 400], source: HOMEGUIDE_SWITCH },
  interlockLabor: { id: "interlockLabor", label: "Licensed electrician's labor (interlock)", usd: [150, 300], source: HOMEGUIDE_SWITCH },
  switch6: { id: "switch6", label: "6-circuit manual transfer switch", usd: [230, 360], source: HOMEGUIDE_SWITCH },
  switch10: { id: "switch10", label: "10-circuit manual transfer switch", usd: [300, 670], source: HOMEGUIDE_SWITCH },
  switchLabor: { id: "switchLabor", label: "Licensed electrician's labor (transfer switch)", usd: [200, 500], source: HOMEGUIDE_SWITCH },
  permit: { id: "permit", label: "Electrical permit and inspection", usd: [50, 350], source: HOMEGUIDE_SWITCH, note: "HomeGuide: most areas require one for any change to the home's wiring." },
};

/** HomeGuide's "total cost installed" for an interlock kit (kit, job supplies and labor). */
export const INTERLOCK_INSTALLED_USD: [number, number] = [400, 850];

/** How a model can be connected beyond cords, read from the maker's US store. */
export interface ModelHookup {
  productId: string;
  /** The model's own outlet of 30 A or more, which an inlet box or transfer switch cord plugs into. */
  outlet: string;
  /** The maker's own panel kit for this model, if it sells one. */
  smartPanel?: { name: string; url: string; retrieved: string; note: string };
  /** The maker's way to get 240 V from two of these units, if the model is 120 V only. */
  pair240?: { name: string; url: string; retrieved: string; outputW: number; outlet: string };
}

/**
 * Only models whose 30 A+ outlet we read on the maker's page. Anything not
 * listed is offered with extension cords only.
 */
export const MODEL_HOOKUPS: ModelHookup[] = [
  {
    productId: "bluetti-apex-300",
    outlet: "50 A (NEMA 14-50R), 120/240 V",
    smartPanel: {
      name: "Bluetti Apex 300 Home Integration Kit",
      url: "https://www.bluettipower.com/products/apex-300-home-integration-kit",
      retrieved: "2026-11-14",
      note: "Bluetti lists it as compatible with the Apex 300, to keep vital home circuits powered in an outage.",
    },
  },
  {
    productId: "anker-solix-f3800-plus",
    outlet: "120/240 V output",
    smartPanel: {
      name: "Anker SOLIX Home Power Panel kit",
      url: "https://www.ankersolix.com/products/smart-home-power-kit",
      retrieved: "2026-11-14",
      note: "Anker says it works with the F3800 Plus, needs a licensed electrician, and needs a 100 A breaker sold separately.",
    },
  },
  {
    productId: "anker-solix-f3000",
    outlet: "TT-30 (30 A, 120 V)",
    pair240: {
      name: "Anker SOLIX Double Voltage Hub",
      url: "https://www.ankersolix.com/products/double-voltage-hub",
      retrieved: "2026-11-14",
      outputW: 7200,
      outlet: "240 V / 30 A",
    },
  },
  {
    productId: "growatt-helios-3600",
    outlet: "TT-30 (30 A, 120 V)",
    pair240: {
      name: "Growatt Double Voltage Power Hub",
      url: "https://growattportable.com/products/growatt-double-voltage-power-hub",
      retrieved: "2026-11-14",
      outputW: 7200,
      outlet: "two L14-30 (30 A, 120/240 V)",
    },
  },
  { productId: "bluetti-elite-300", outlet: "TT-30 (30 A, 120 V)" },
];

export const modelHookup = (id: string) => MODEL_HOOKUPS.find((m) => m.productId === id);

// ---------------------------------------------------------------------------
// Maker parts and installed-cost ranges for the /home-backup guide pages.
// No maker prices: pages link to the maker's page for today's price.
// ---------------------------------------------------------------------------

export interface HookupPart {
  id: string;
  name: string;
  /** Maker's product page (no tracking; PartnerLink adds it). */
  url: string;
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
    retrieved: NOV14,
    inStock: true,
    note: "Reliance Pro/Tran 2 switch with a 30 A cable; Anker's option list labels it for one F3800 Plus or two F3000s.",
  },
  ankerMts50: {
    id: "anker-mts-10c-50a",
    name: "Anker SOLIX 10-Circuit Manual Transfer Switch (120/240 V, 50 A)",
    url: "https://www.ankersolix.com/products/home-backup-kit-for-f3800-10c",
    retrieved: NOV14,
    inStock: true,
    note: "For an F3800 or two linked F3800 Plus units; Anker's page says it is not suitable for a single F3800 Plus.",
  },
  ankerHpp: {
    id: "anker-home-power-panel-kit",
    name: "Anker SOLIX Smart Home Power Kit (Home Power Panel, subpanel, ground bar)",
    url: "https://www.ankersolix.com/products/smart-home-power-kit",
    retrieved: NOV14,
    inStock: true,
    note: "Licensed electrician required; a standard 100 A breaker is sold separately.",
  },
  ankerHppInstall: {
    id: "anker-home-power-panel-install",
    name: "Anker SOLIX Home Power Panel Installation Service (without permit)",
    url: "https://www.ankersolix.com/products/smart-home-power-kit",
    retrieved: NOV14,
    inStock: true,
    note: "Anker's own add-on on the kit page; the permit is not included.",
  },
  f3800PlusHppKit: {
    id: "anker-f3800-plus-smart-home-power-kit",
    name: "Anker SOLIX F3800 Plus + Smart Home Power Kit",
    url: "https://www.ankersolix.com/products/f3800-plus-smart-home-power-kit",
    retrieved: NOV14,
    inStock: true,
    note: "The F3800 Plus with the Home Power Panel kit; in stock (dispatch within 7 days) while the F3800 Plus alone was sold out.",
  },
  bluettiAt1: {
    id: "bluetti-at1",
    name: "Bluetti AT1 Smart Distribution Panel",
    url: "https://www.bluettipower.com/products/at1",
    retrieved: NOV14,
    inStock: true,
    note: "Automatic transfer panel; Bluetti lists it as compatible with Apex 300 systems, up to three units through its Hub A1.",
  },
  bluettiApexKit: {
    id: "bluetti-apex-300-home-integration-kit",
    name: "Bluetti Apex 300 Home Integration Kit",
    url: "https://www.bluettipower.com/products/apex-300-home-integration-kit",
    retrieved: NOV14,
    inStock: true,
    note: "Bluetti's listing says only that it ties an Apex 300 into home circuits; the linked guide is a scanned image with no text we could check.",
  },
  growattPair: {
    id: "growatt-helios-3600-x2-hub",
    name: "Growatt HELIOS 3600 x 2 + Double Voltage Hub",
    url: "https://growattportable.com/products/growatt-helios-3600-portable-power-station",
    retrieved: NOV14,
    inStock: true,
    note: "Growatt's own two-unit bundle option on the HELIOS 3600 page, the way to 240 V.",
  },
  growattHub: {
    id: "growatt-double-voltage-hub",
    name: "Growatt Double Voltage Power Hub",
    url: "https://growattportable.com/products/growatt-double-voltage-power-hub",
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
