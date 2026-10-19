/**
 * Data for the buyer's guides that compare our partners with the rest of the
 * market: non-partner home EV chargers, home charger installation costs, and
 * the CPAP battery pack that is not a power station.
 *
 * RULES (enforced by tests/buyer-guides.test.ts): every price and spec is
 * copied from the maker's own US site (or the cited cost study) and dated.
 * Use null for anything not published. No ratings or reviews.
 */

export const GUIDES_CHECKED = "2026-10-19";

/**
 * Home chargers from brands that are not our partners. They get plain links
 * (no tracking). Partner chargers (Lectron, Autel) live in src/data/chargers.ts.
 */
export interface OtherCharger {
  id: string;
  brand: string;
  name: string;
  /** Plugs the maker sells it with. */
  plugs: ("J1772" | "NACS")[];
  amps: number;
  milesPerHour: number | null;
  wifi: boolean;
  cableFt: number | null;
  warrantyYears: number | null;
  priceUsd: number;
  url: string;
  retrieved: string;
  /** What it does better or worse than our picks, in one line. */
  note: string;
}

export const OTHER_CHARGERS: OtherCharger[] = [
  {
    id: "grizzle-classic-40a",
    brand: "United Chargers",
    name: "Grizzl-E Classic 40A",
    plugs: ["J1772"],
    amps: 40,
    milesPerHour: null,
    wifi: false,
    cableFt: 25,
    warrantyYears: 3,
    priceUsd: 299.99,
    url: "https://grizzl-e.com/products/grizzl-e-classic",
    retrieved: GUIDES_CHECKED,
    note: "The cheapest UL-listed, ENERGY STAR 40-amp charger we found, with a tough aluminum case. No Wi-Fi or app, so no scheduling from your phone (many cars can schedule on their own).",
  },
  {
    id: "emporia-classic",
    brand: "Emporia",
    name: "Emporia Classic Level 2",
    plugs: ["J1772", "NACS"],
    amps: 48,
    milesPerHour: null,
    wifi: true,
    cableFt: 25,
    warrantyYears: 3,
    priceUsd: 449,
    url: "https://shop.emporiaenergy.com/products/emporia-ev-charger",
    retrieved: GUIDES_CHECKED,
    note: "Smart charger with app scheduling, 48 amps when hardwired. The J1772 version ($449) was sold out when we checked; the NACS version was $479. The $599 Pro adds load management that can let you skip a panel upgrade.",
  },
  {
    id: "chargepoint-home-flex",
    brand: "ChargePoint",
    name: "ChargePoint Home Flex",
    plugs: ["J1772", "NACS"],
    amps: 50,
    milesPerHour: 37,
    wifi: true,
    cableFt: 23,
    warrantyYears: 3,
    priceUsd: 549,
    url: "https://store.chargepoint.com/product/home-flex-hardwired",
    retrieved: GUIDES_CHECKED,
    note: "Up to 50 amps hardwired with a well-known app. Out of stock on ChargePoint's store when we checked.",
  },
  {
    id: "tesla-wall-connector",
    brand: "Tesla",
    name: "Tesla Wall Connector",
    plugs: ["NACS"],
    amps: 48,
    milesPerHour: 44,
    wifi: true,
    cableFt: 24,
    warrantyYears: 4,
    priceUsd: 585,
    url: "https://shop.tesla.com/product/wall-connector",
    retrieved: GUIDES_CHECKED,
    note: "The fastest here at 48 amps (up to 44 miles an hour) with the longest warranty. Must be hardwired by an electrician, and Tesla said Tesla ownership was required while supplies were limited.",
  },
];

/**
 * Home charger installation cost. Average installation price by state
 * (labor and materials, not the charger) from Qmerit's 2026 data as published
 * by EnergySage, plus EnergySage's ranges for the things that push it up.
 */
export const INSTALL_COST = {
  source: "EnergySage, How much does an EV charger installation cost? (updated June 22, 2026; state averages from Qmerit 2026 data)",
  url: "https://www.energysage.com/ev-charging/how-much-does-ev-charger-installation-cost/",
  retrieved: GUIDES_CHECKED,
  usAverage: 2442,
  /** Typical range before equipment, per Qmerit via EnergySage. */
  typicalRange: [800, 3000] as [number, number],
  permit: [50, 800] as [number, number],
  newCircuit: [60, 150] as [number, number],
  subpanel: [500, 1500] as [number, number],
  serviceUpgrade: [1500, 4000] as [number, number],
  /** Extra for a 60 to 80 ft wire run through walls, attic or outside conduit. */
  longRun: [1000, 1500] as [number, number],
  /** Usual price difference between a hardwired and a plug-in install. */
  hardwireVsPlug: [100, 200] as [number, number],
  byState: {
    AL: 3139, AK: 3049, AZ: 2063, AR: 2422, CA: 2576, CO: 2398, CT: 2494, DC: 3036, DE: 2092, FL: 2087, GA: 2185,
    HI: 2781, ID: 2076, IL: 2882, IN: 2131, IA: 2246, KS: 3081, KY: 2184, LA: 2669, ME: 2711, MD: 2570, MA: 2896,
    MI: 2565, MN: 2592, MS: 3680, MO: 2475, MT: 2985, NE: 2270, NV: 2575, NH: 2754, NJ: 2850, NM: 2026, NY: 2624,
    NC: 2027, ND: 2055, OH: 2873, OK: 2185, OR: 1834, PA: 3022, RI: 3025, SC: 2087, SD: 1996, TN: 2530, TX: 2186,
    UT: 2579, VT: 2600, VA: 2232, WA: 2062, WV: 3150, WI: 2595, WY: 2377,
  } as Record<string, number>,
};

/**
 * Bluetti's CPAP battery pack. It has DC outputs only (no wall-style outlet),
 * so it is not in the power station table.
 */
export const CPAP_PACK = {
  id: "bluetti-x60",
  brand: "bluetti" as const,
  name: "Bluetti X60 CPAP Power Bank",
  url: "https://www.bluettipower.com/products/bluetti-x60-614wh-cpap-power-bank",
  retrieved: GUIDES_CHECKED,
  capacityWh: 614,
  chemistry: "LFP" as const,
  cycles: 2000,
  weightLb: 15,
  warrantyYears: 1,
  priceUsd: 499,
  notes: [
    "Made for CPAPs: comes with seven power cables and a connector that Bluetti says fit about 90% of machines, including ResMed AirSense and Philips DreamStation.",
    "DC outputs only, which skips the power lost converting to a wall-style outlet. 12-month warranty, shorter than Bluetti's power stations.",
  ],
};
