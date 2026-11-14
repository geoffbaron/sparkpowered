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
    // Iron Forge Cable: 25 ft 12-gauge 2-pack $76.99 ($38.50 each); 50 ft 12/3 locking-end cord $65.99.
    usd: [38.5, 3 * 65.99],
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
  smartPanel?: { name: string; usd: number; url: string; retrieved: string; note: string };
  /** The maker's way to get 240 V from two of these units, if the model is 120 V only. */
  pair240?: { name: string; usd: number; url: string; retrieved: string; outputW: number; outlet: string };
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
      usd: 699,
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
      usd: 1799.99,
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
      usd: 289.99,
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
      usd: 139,
      url: "https://growattportable.com/products/growatt-double-voltage-power-hub",
      retrieved: "2026-11-14",
      outputW: 7200,
      outlet: "two L14-30 (30 A, 120/240 V)",
    },
  },
  { productId: "bluetti-elite-300", outlet: "TT-30 (30 A, 120 V)" },
];

export const modelHookup = (id: string) => MODEL_HOOKUPS.find((m) => m.productId === id);
