/**
 * Products we recommend: portable power stations, home batteries and plug-in
 * solar kits sold in the US.
 *
 * RULES (enforced by tests/products.test.ts):
 *   - Every spec is copied from the manufacturer's own US product
 *     page or datasheet, and `sourceUrl` + `retrieved` say where and when.
 *   - Use null for anything the manufacturer does not publish. Never estimate.
 *   - No prices: they change too often. Pages link to the maker's own page
 *     ("See today's price at ...") instead; tests/no-prices.test.ts guards it.
 *   - No ratings or reviews: we have not collected any.
 * Outbound links are built from `url` by src/data/affiliates.ts.
 */

import type { BrandId } from "@/data/affiliates";

/** portable: power stations you carry. home: whole-home batteries, plug-in or installed. */
export type ProductCategory = "portable" | "home";

export interface AddOnBattery {
  model: string;
  capacityWh: number;
  url: string;
  /** Most add-on batteries one main unit accepts. */
  maxUnits: number;
  /** True when the add-on was sold out at the last check; calculators then skip bundles that need it. */
  soldOut?: boolean;
}

export interface Product {
  id: string;
  brand: Exclude<BrandId, "energysage">;
  model: string;
  category: ProductCategory;
  /** Manufacturer's US product page; the outbound link is built from this. */
  url: string;
  /** Page or datasheet the specs were read from (often the same as url). */
  sourceUrl: string;
  /** YYYY-MM-DD the specs were checked. */
  retrieved: string;
  /** Rated capacity in watt-hours (usable capacity for installed home batteries). */
  capacityWh: number;
  /** Capacity with the maker's add-on batteries, or null if not expandable. */
  maxCapacityWh: number | null;
  expansion?: string;
  /** True only when the maker says the unit cannot take extra batteries. */
  notExpandable?: boolean;
  addOn?: AddOnBattery;
  /** Continuous AC output, watts. */
  acOutputW: number;
  surgeW: number | null;
  /** null when the maker does not state it on its US pages. */
  chemistry: "LFP" | "NMC" | null;
  cycles: number | null;
  /** Remaining capacity % at which `cycles` is rated, when stated. */
  cyclesTo?: number | null;
  weightLb: number | null;
  /** Maximum solar input, watts. */
  solarInputW: number | null;
  acOutlets: number | null;
  /** Switchover time in milliseconds when used as a UPS, if stated. */
  upsMs: number | null;
  warrantyYears: number | null;
  volts: "120V" | "120/240V";
  install: "diy" | "professional";
  /** Sold out on the maker's US site at the last check: calculators and picks skip it. */
  soldOut?: boolean;
  /** Short factual notes taken from the product page. */
  notes: string[];
  certifications?: string[];
}

/** Plug-in ("balcony") solar kits sold to US addresses. */
export interface PluginKit {
  id: string;
  brand: Exclude<BrandId, "energysage">;
  name: string;
  url: string;
  sourceUrl: string;
  retrieved: string;
  /** Watts of panels included (0 if the listing is the inverter alone). */
  panelW: number;
  /** Inverter AC output, watts. */
  inverterW: number;
  batteryWh: number | null;
  certifications: string[];
  /** States the seller ships to or says it is permitted in, if it limits them. */
  states?: string[];
  notes: string[];
}


/** Home batteries: professionally installed systems and plug-in whole-home kits. */
const HOME: Product[] = [
  {
    id: "tesla-powerwall-3", brand: "tesla", model: "Powerwall 3", category: "home",
    url: "https://www.tesla.com/powerwall",
    sourceUrl: "https://energylibrary.tesla.com/docs/Public/EnergyStorage/Powerwall/3/Datasheet/en-us/Powerwall-3-Datasheet.pdf",
    retrieved: "2026-10-15",
    capacityWh: 13500, maxCapacityWh: 94500,
    expansion: "up to 3 Powerwall 3 Expansion units (13.5 kWh each) per Powerwall 3, 7 units in total",
    acOutputW: 11500, surgeW: null, chemistry: null, cycles: null, weightLb: null, solarInputW: null,
    acOutlets: null, upsMs: null, warrantyYears: 10, volts: "120/240V", install: "professional",
    certifications: ["UL 1741", "UL 9540", "UL 9540A", "UL 3741"],
    notes: [
      "Built-in solar inverter, so one box handles both panels and storage.",
      "Continuous output is configurable (5.8, 7.6, 10 or 11.5 kW) per Tesla's datasheet.",
      "Sold and installed through Tesla and Tesla-certified installers only.",
    ],
  },
  {
    id: "enphase-iq-battery-5p", brand: "enphase", model: "IQ Battery 5P", category: "home",
    url: "https://enphase.com/store/storage/gen3/iq-battery-5p",
    sourceUrl: "https://enphase.com/store/storage/gen3/iq-battery-5p",
    retrieved: "2026-10-15",
    capacityWh: 5000, maxCapacityWh: null,
    acOutputW: 3840, surgeW: 7680, chemistry: "LFP", cycles: 6000, cyclesTo: null, weightLb: null, solarInputW: null,
    acOutlets: null, upsMs: null, warrantyYears: 15, volts: "120/240V", install: "professional",
    notes: [
      "Warranty is 15 years or 6,000 cycles, the longest of the batteries we list.",
      "Small 5 kWh units stack, so you can start small and add more.",
      "Peak output 7.68 kW for 3 seconds, for motor starts.",
    ],
  },
  {
    id: "enphase-iq-battery-10c", brand: "enphase", model: "IQ Battery 10C", category: "home",
    url: "https://enphase.com/download/iq-battery-10c-data-sheet",
    sourceUrl: "https://enphase.com/download/iq-battery-10c-data-sheet",
    retrieved: "2026-10-15",
    capacityWh: 10000, maxCapacityWh: null,
    acOutputW: 7080, surgeW: null, chemistry: "LFP", cycles: 6000, cyclesTo: 60, weightLb: null, solarInputW: null,
    acOutlets: null, upsMs: null, warrantyYears: 15, volts: "120/240V", install: "professional",
    certifications: ["UL 9540", "UL 9540A", "UL 1741-SA/SB", "IEEE 1547:2018"],
    notes: [
      "Newer, larger Enphase battery (datasheet dated July 2026): two 5 kWh halves in one unit.",
      "Warranty: 15 years or 6,000 cycles, to 60% of capacity.",
    ],
  },
  {
    id: "franklinwh-apower-2", brand: "franklinwh", model: "aPower 2", category: "home",
    url: "https://www.franklinwh.com/",
    sourceUrl: "https://www.franklinwh.com/document/apower-2-datasheet",
    retrieved: "2026-10-15",
    capacityWh: 15000, maxCapacityWh: 225000, expansion: "up to 15 units on one aGate controller",
    acOutputW: 10000, surgeW: 15000, chemistry: "LFP", cycles: null, weightLb: null, solarInputW: null,
    acOutlets: null, upsMs: null, warrantyYears: 15, volts: "120/240V", install: "professional",
    certifications: ["UL 9540", "UL 9540A", "UL 1973", "UL 1741 SB"],
    notes: [
      "15 kWh per unit, the most of any single battery we list.",
      "Warranty: 15 years or 60 MWh of throughput.",
      "Peak 15 kW for 10 seconds.",
    ],
  },
  {
    id: "ecoflow-delta-pro-ultra", brand: "ecoflow", model: "DELTA Pro Ultra", category: "home",
    url: "https://us.ecoflow.com/products/delta-pro-ultra",
    sourceUrl: "https://us.ecoflow.com/products/delta-pro-ultra",
    retrieved: "2026-11-06",
    capacityWh: 6144, maxCapacityWh: 30720, expansion: "with up to four extra batteries per inverter (90 kWh with three inverters and a Smart Home Panel 2)",
    addOn: {
      model: "DELTA Pro Ultra Extra Battery", capacityWh: 6144, url: "https://us.ecoflow.com/products/delta-pro-ultra", maxUnits: 4, soldOut: true
    },
    acOutputW: 7200, surgeW: 10800, chemistry: "LFP", cycles: 3500, cyclesTo: 80, weightLb: 181.8, solarInputW: 5600,
    acOutlets: null, upsMs: 20, warrantyYears: 5, volts: "120/240V", install: "diy",
    soldOut: true,
    certifications: ["UL 1973", "UL 9540"],
    notes: [
      "Sold out on EcoFlow's US site on Nov 6 2026.",
      "Weight is the inverter (70 lb) plus one battery (111.8 lb); they are separate pieces.",
      "Plugs in without an installer; connecting it to your home's circuits needs EcoFlow's Smart Home Panel 2, installed by an electrician.",
      
    ],
  },
  {
    id: "natures-generator-mygrid-10k", brand: "naturesgenerator", model: "MyGrid 10K Gen 2", category: "home",
    url: "https://naturesgenerator.com/products/mygrid-10k-whole-home-generator",
    sourceUrl: "https://naturesgenerator.com/products/mygrid-10k-whole-home-generator",
    retrieved: "2026-11-05",
    capacityWh: 10496, maxCapacityWh: 73472, expansion: "with up to six more MyGrid 10K Solar Batteries",
    addOn: {
      model: "MyGrid 10K Solar Battery", capacityWh: 10496, url: "https://naturesgenerator.com/products/mygrid-solar-battery", maxUnits: 6,
    },
    acOutputW: 10000, surgeW: 20000, chemistry: "LFP", cycles: 6000, cyclesTo: 70, weightLb: 365, solarInputW: 12000,
    acOutlets: null, upsMs: 20, warrantyYears: 5, volts: "120/240V", install: "diy",
    certifications: ["UL 1741 (inverter)", "UL 1973 (battery)"],
    notes: [
      "Weight is the inverter (152 lb) plus the battery in the box (213 lb); they are separate pieces.",
      "Wired to your home through a transfer switch installed by a licensed electrician; Nature's Generator also sells it with a 50 A automatic switch. Never feed your house through a wall or dryer outlet.",
      "Ships by freight, curbside only.",
    ],
  },
];

const PORTABLE: Product[] = [
  {
    id: "ecoflow-delta-3",
    brand: "ecoflow",
    model: "DELTA 3",
    category: "portable",
    url: "https://us.ecoflow.com/products/delta-3-portable-power-station",
    sourceUrl: "https://us.ecoflow.com/products/delta-3-portable-power-station",
    retrieved: "2026-11-06",
    capacityWh: 1024,
    maxCapacityWh: 5000,
    acOutputW: 1800,
    surgeW: 3600,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 80,
    weightLb: 27.6,
    solarInputW: 500,
    acOutlets: 6,
    upsMs: 10.0,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "Six AC outlets and a sub-10 ms UPS switchover.",
      "Reaching 5 kWh requires EcoFlow's 4 kWh DELTA Pro 3 extra battery."
    ],
    expansion: "with EcoFlow extra batteries (5 kWh needs a DELTA Pro 3 extra battery)"
  },
  {
    id: "ecoflow-delta-3-plus",
    brand: "ecoflow",
    model: "DELTA 3 Plus",
    category: "portable",
    url: "https://us.ecoflow.com/products/delta-3-plus-portable-power-station",
    sourceUrl: "https://us.ecoflow.com/products/delta-3-plus-portable-power-station",
    retrieved: "2026-11-06",
    capacityWh: 1024,
    maxCapacityWh: 5000,
    acOutputW: 1800,
    surgeW: 3600,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 80,
    weightLb: 27.6,
    solarInputW: 1000,
    acOutlets: 6,
    upsMs: 10.0,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "Same battery as the DELTA 3 but with two solar inputs (1,000 W total).",
      "EcoFlow says a full AC recharge takes 56 minutes."
    ],
    expansion: "with EcoFlow extra batteries (5 kWh needs a DELTA Pro 3 extra battery)"
  },
  {
    id: "ecoflow-delta-3-max",
    brand: "ecoflow",
    model: "DELTA 3 Max",
    category: "portable",
    url: "https://us.ecoflow.com/products/ecoflow-delta-3-max-portable-power-station-2048wh",
    sourceUrl: "https://us.ecoflow.com/products/ecoflow-delta-3-max-portable-power-station-2048wh",
    retrieved: "2026-11-06",
    capacityWh: 2048,
    maxCapacityWh: null,
    acOutputW: 2400,
    surgeW: 4800,
    chemistry: "LFP",
    cycles: null,
    cyclesTo: null,
    weightLb: 44.8,
    solarInputW: 500,
    acOutlets: null,
    upsMs: 10.0,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "Warranty is 3 years plus 2 more when you register in EcoFlow's app.",
      "EcoFlow does not state whether it takes extra batteries."
    ]
  },
  {
    id: "ecoflow-delta-3-max-plus",
    brand: "ecoflow",
    model: "DELTA 3 Max Plus",
    category: "portable",
    url: "https://us.ecoflow.com/products/ecoflow-delta-3-max-plus-portable-power-station-2048wh",
    sourceUrl: "https://us.ecoflow.com/products/ecoflow-delta-3-max-plus-portable-power-station-2048wh",
    retrieved: "2026-11-06",
    capacityWh: 2048,
    maxCapacityWh: 10000,
    acOutputW: 3000,
    surgeW: 6000,
    chemistry: "LFP",
    cycles: null,
    cyclesTo: null,
    weightLb: null,
    solarInputW: null,
    acOutlets: null,
    upsMs: 10.0,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "Expands from 2 kWh to 10 kWh with 2 kWh extra batteries.",
      "Warranty is 3 years plus 2 more when you register in EcoFlow's app."
    ],
    expansion: "with DELTA 3 Max Plus extra batteries"
  },
  {
    id: "ecoflow-delta-pro-3",
    brand: "ecoflow",
    model: "DELTA Pro 3",
    category: "portable",
    url: "https://us.ecoflow.com/products/delta-pro-3-portable-power-station",
    sourceUrl: "https://us.ecoflow.com/products/delta-pro-3-portable-power-station",
    retrieved: "2026-11-06",
    capacityWh: 4096,
    maxCapacityWh: 12288,
    acOutputW: 4000,
    surgeW: 8000,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 80,
    weightLb: 113.54,
    solarInputW: 2600,
    acOutlets: 7,
    upsMs: 10.0,
    warrantyYears: 5,
    volts: "120/240V",
    install: "diy",
    soldOut: true,
    notes: [
      "Sold out on EcoFlow's US site on Nov 6 2026.",
      "120/240 V output with a 30 A twist-lock (L14-30R) outlet for a transfer switch installed by a licensed electrician. Never feed your house through a wall or dryer outlet.",
      "Carried by two wheels and a handle; at 113.5 lb it is a roll-around unit, not a carry-around one.",
      "Up to 2,600 W of solar input across two ports."
    ],
    expansion: "with up to two DELTA Pro 3 extra batteries",
    addOn: {
      model: "DELTA Pro 3 Smart Extra Battery",
      capacityWh: 4096,
      url: "https://us.ecoflow.com/products/delta-pro-3-extra-battery",
      maxUnits: 2, soldOut: true
    }
  },
  {
    id: "jackery-explorer-1000-v2",
    brand: "jackery",
    model: "Explorer 1000 v2",
    category: "portable",
    url: "https://www.jackery.com/products/jackery-explorer-1000-v2",
    sourceUrl: "https://www.jackery.com/products/jackery-explorer-1000-v2",
    retrieved: "2026-11-06",
    capacityWh: 1070,
    maxCapacityWh: null,
    notExpandable: true,
    acOutputW: 1500,
    surgeW: 3000,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 70,
    weightLb: 23.8,
    solarInputW: 400,
    acOutlets: 3,
    upsMs: 20.0,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    soldOut: true,
    notes: [
      "Sold out on Jackery's US site on Nov 6 2026.",
      "Warranty is 3 years plus 2 when registered.",
      "Jackery rates cycles to 70% capacity, a lower bar than the 80% most rivals use."
    ]
  },
  {
    id: "jackery-explorer-1000-plus",
    brand: "jackery",
    model: "Explorer 1000 Plus",
    category: "portable",
    url: "https://www.jackery.com/products/jackery-explorer-1000-plus-portable-power-station",
    sourceUrl: "https://www.jackery.com/products/jackery-explorer-1000-plus-portable-power-station",
    retrieved: "2026-11-06",
    capacityWh: 1264.64,
    maxCapacityWh: 5056,
    acOutputW: 2000,
    surgeW: 4000,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 70,
    weightLb: 32,
    solarInputW: 800,
    acOutlets: 3,
    upsMs: null,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "Expands to about 5 kWh with up to three Battery Pack 1000 Plus units.",
      "The battery pack was listed as unavailable on the day we checked."
    ],
    expansion: "with up to three Battery Pack 1000 Plus",
    addOn: {
      model: "Jackery Battery Pack 1000 Plus",
      capacityWh: 1264,
      url: "https://www.jackery.com/products/jackery-battery-pack-1000-plus",
      maxUnits: 3, soldOut: true
    }
  },
  {
    id: "jackery-explorer-2000-v2",
    brand: "jackery",
    model: "Explorer 2000 v2",
    category: "portable",
    url: "https://www.jackery.com/products/jackery-explorer-2000-v2-portable-power-station",
    sourceUrl: "https://www.jackery.com/products/jackery-explorer-2000-v2-portable-power-station",
    retrieved: "2026-11-06",
    capacityWh: 2042,
    maxCapacityWh: null,
    notExpandable: true,
    acOutputW: 2200,
    surgeW: 4400,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 70,
    weightLb: 39.5,
    solarInputW: 400,
    acOutlets: 3,
    upsMs: 20.0,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "Not expandable, per Jackery's FAQ.",
      "Cycle rating is to 70% capacity."
    ]
  },
  {
    id: "jackery-explorer-5000-plus",
    brand: "jackery",
    model: "Explorer 5000 Plus",
    category: "portable",
    url: "https://www.jackery.com/products/jackery-explorer-5000-plus",
    sourceUrl: "https://www.jackery.com/products/jackery-explorer-5000-plus",
    retrieved: "2026-11-06",
    capacityWh: 5040,
    maxCapacityWh: 60000,
    acOutputW: 7200,
    surgeW: 14400,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 70,
    weightLb: 134.5,
    solarInputW: null,
    acOutlets: 5,
    upsMs: 20.0,
    warrantyYears: 5,
    volts: "120/240V",
    install: "diy",
    soldOut: true,
    notes: [
      "Jackery was still selling it in bundles with a Battery Pack 5000 Plus.",
      "Sold out on Jackery's US site on Nov 6 2026.",
      "120/240 V output, 7,200 W continuous, for well pumps and home circuits through a transfer switch installed by a licensed electrician.",
      "Jackery says it scales to 60 kWh with battery packs and a second unit."
    ],
    expansion: "with Battery Pack 5000 Plus units (system figure)"
  },
  {
    id: "anker-solix-c1000-gen-2",
    brand: "anker",
    model: "C1000 Gen 2",
    category: "portable",
    url: "https://www.ankersolix.com/products/c1000-gen2",
    sourceUrl: "https://www.ankersolix.com/products/c1000-gen2",
    retrieved: "2026-11-17",
    capacityWh: 1024,
    maxCapacityWh: null,
    notExpandable: true,
    acOutputW: 2000,
    surgeW: 3000,
    chemistry: null,
    cycles: 4000,
    cyclesTo: 80,
    weightLb: 24.9,
    solarInputW: 600,
    acOutlets: null,
    upsMs: 10.0,
    warrantyYears: null,
    volts: "120V",
    install: "diy",
    notes: [
      "Anker says a full AC recharge takes 49 minutes.",
      "Not expandable; Anker's US page does not state the battery chemistry."
    ]
  },
  {
    id: "anker-solix-c2000-gen-2",
    brand: "anker",
    model: "C2000 Gen 2",
    category: "portable",
    url: "https://www.ankersolix.com/products/c2000-gen2",
    sourceUrl: "https://www.ankersolix.com/products/c2000-gen2",
    retrieved: "2026-11-17",
    capacityWh: 2048,
    maxCapacityWh: 4096,
    acOutputW: 2400,
    surgeW: 4000,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 80,
    weightLb: 41.7,
    solarInputW: 800,
    acOutlets: null,
    upsMs: 10.0,
    warrantyYears: null,
    volts: "120V",
    install: "diy",
    notes: [
      "The BP2000 expansion battery was sold out on Anker's US site on Nov 17 2026.",
      "Doubles to 4 kWh with one BP2000 expansion battery.",
      "Replaces the SOLIX F2000 on Anker's US site."
    ],
    expansion: "with one BP2000 expansion battery",
    addOn: {
      model: "Anker SOLIX BP2000 Expansion Battery (Gen 2)",
      capacityWh: 2048,
      url: "https://www.ankersolix.com/products/c2000-gen2-expansion-battery",
      maxUnits: 1,
      soldOut: true
    }
  },
  {
    id: "anker-solix-f3000",
    brand: "anker",
    model: "F3000",
    category: "portable",
    url: "https://www.ankersolix.com/products/f3000",
    sourceUrl: "https://www.ankersolix.com/products/f3000",
    retrieved: "2026-11-14",
    capacityWh: 3072,
    maxCapacityWh: 12288,
    acOutputW: 3600,
    surgeW: 7200,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: null,
    weightLb: 91.5,
    solarInputW: 2400,
    acOutlets: null,
    upsMs: 20.0,
    warrantyYears: null,
    volts: "120V",
    install: "diy",
    notes: [
      "120 V only on its own; 240 V needs two units and Anker's Double Voltage Hub.",
      "TT-30 RV outlet delivers the full 3,600 W.",
    ],
    expansion: "with up to three BP3000 expansion batteries",
    addOn: {
      model: "Anker SOLIX BP3000 Expansion Battery",
      capacityWh: 3072,
      url: "https://www.ankersolix.com/products/bp3000-expansion-battery-for-f3000",
      maxUnits: 3,
    }
  },
  {
    id: "anker-solix-f3800-plus",
    brand: "anker",
    model: "F3800 Plus",
    category: "portable",
    url: "https://www.ankersolix.com/products/f3800-plus",
    sourceUrl: "https://www.ankersolix.com/products/f3800-plus",
    retrieved: "2026-11-14",
    capacityWh: 3840,
    maxCapacityWh: 26880,
    acOutputW: 6000,
    surgeW: null,
    chemistry: "LFP",
    cycles: 3000,
    cyclesTo: null,
    weightLb: 136.7,
    solarInputW: 3200,
    acOutlets: 7,
    upsMs: 20.0,
    warrantyYears: 5,
    volts: "120/240V",
    install: "diy",
    soldOut: true,
    notes: [
      "Sold out on Anker's US site on Nov 6 and again on Nov 14 2026; the F3800 Plus + Smart Home Power Kit bundle was in stock.",
      "6,000 W at 120/240 V, tied with the Nature's Generator L6000 for the most of any power station we list.",
      "Up to 3,200 W of solar input.",
      "Anker quotes 53.8 kWh for two linked units; one unit reaches 26.9 kWh."
    ],
    expansion: "with up to six BP3800 expansion batteries",
    addOn: {
      model: "Anker SOLIX BP3800 Expansion Battery",
      capacityWh: 3840,
      url: "https://www.ankersolix.com/products/bp3800-expansion-battery",
      maxUnits: 6
    }
  },
  {
    id: "bluetti-ac180",
    brand: "bluetti",
    model: "AC180",
    category: "portable",
    url: "https://www.bluettipower.com/products/ac180",
    sourceUrl: "https://www.bluettipower.com/products/ac180",
    retrieved: "2026-11-17",
    capacityWh: 1152,
    maxCapacityWh: null,
    acOutputW: 1800,
    surgeW: 2700,
    chemistry: "LFP",
    cycles: 3500,
    cyclesTo: null,
    weightLb: 35.3,
    solarInputW: 500,
    acOutlets: 4,
    upsMs: null,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "Back in stock on Bluetti's US site on Oct 19 2026, after being out of stock on Oct 15.",
      "Its 2,700 W figure is Bluetti's Power Lifting mode for heating-type loads (kettles, space heaters), not a motor-start surge."
    ]
  },
  {
    id: "bluetti-elite-100-v2",
    brand: "bluetti",
    model: "Elite 100 V2",
    category: "portable",
    url: "https://www.bluettipower.com/products/elite-100-v2-portable-power-station",
    sourceUrl: "https://www.bluettipower.com/products/elite-100-v2-portable-power-station",
    retrieved: "2026-11-17",
    capacityWh: 1024,
    maxCapacityWh: null,
    acOutputW: 1800,
    surgeW: 3600,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 80,
    weightLb: 25,
    solarInputW: 1000,
    acOutlets: null,
    upsMs: 10.0,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "Up to 1,000 W of solar input, unusually high for a 1 kWh unit.",
      "In stock on Bluetti's US site on Oct 19 2026; Bluetti lists a 3,600 W surge and a 5-year warranty."
    ]
  },
  {
    id: "bluetti-elite-200-v2",
    brand: "bluetti",
    model: "Elite 200 V2",
    category: "portable",
    url: "https://www.bluettipower.com/products/elite-200-v2-portable-power-station",
    sourceUrl: "https://www.bluettipower.com/products/elite-200-v2-portable-power-station",
    retrieved: "2026-11-14",
    capacityWh: 2073.6,
    maxCapacityWh: null,
    notExpandable: true,
    acOutputW: 2600,
    surgeW: 3900,
    chemistry: "LFP",
    cycles: 6000,
    cyclesTo: 80,
    weightLb: 53.4,
    solarInputW: 1000,
    acOutlets: null,
    upsMs: 15.0,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "Rated for 6,000 cycles to 80%, the highest rating among the 2 kWh units we list.",
      "Its surge figure applies to heating-type loads only (Bluetti's Power Lifting mode). Not expandable.",
      "In stock on Bluetti's US site on Nov 14 2026."
    ]
  },
  {
    id: "bluetti-elite-30-v2",
    brand: "bluetti",
    model: "Elite 30 V2",
    category: "portable",
    url: "https://www.bluettipower.com/products/elite-30-v2-portable-power-station",
    sourceUrl: "https://www.bluettipower.com/products/elite-30-v2-portable-power-station",
    retrieved: "2026-11-17",
    capacityWh: 288,
    maxCapacityWh: null,
    notExpandable: true,
    acOutputW: 600,
    surgeW: null,
    chemistry: "LFP",
    cycles: 3000,
    cyclesTo: 80,
    weightLb: 9.48,
    solarInputW: 200,
    acOutlets: null,
    upsMs: 10.0,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "Under 10 lb and rated under 30 dB at light loads, quiet enough for a bedroom.",
      "Bluetti quotes 4.5 W standby draw; 1,500 W lifting power applies to heating-type loads only.",
      "Not expandable, per Bluetti's FAQ."
    ]
  },
  {
    id: "bluetti-elite-300",
    brand: "bluetti",
    model: "Elite 300",
    category: "portable",
    url: "https://www.bluettipower.com/products/elite-300-portable-power-station",
    sourceUrl: "https://www.bluettipower.com/products/elite-300-portable-power-station",
    retrieved: "2026-11-17",
    capacityWh: 3014.4,
    maxCapacityWh: null,
    acOutputW: 2400,
    surgeW: 4800,
    chemistry: "LFP",
    cycles: 6000,
    cyclesTo: 80,
    weightLb: 57.98,
    solarInputW: 1200,
    acOutlets: 4,
    upsMs: 10.0,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "3 kWh with an RV (TT-30) outlet and a 12 V/30 A port.",
    ]
  },
  {
    id: "bluetti-elite-400",
    brand: "bluetti",
    model: "Elite 400",
    category: "portable",
    url: "https://www.bluettipower.com/products/elite-400-portable-power-station",
    sourceUrl: "https://www.bluettipower.com/products/elite-400-portable-power-station",
    retrieved: "2026-11-17",
    capacityWh: 3840,
    maxCapacityWh: null,
    acOutputW: 2600,
    surgeW: 5200,
    chemistry: "LFP",
    cycles: null,
    cyclesTo: null,
    weightLb: 85.98,
    solarInputW: 1000,
    acOutlets: 4,
    upsMs: 15.0,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "3.84 kWh on wheels with a telescopic handle.",
      "In stock on Bluetti's US site on Nov 9 2026; Bluetti gives no cycle rating on the page."
    ]
  },
  {
    id: "bluetti-ac200l",
    brand: "bluetti",
    model: "AC200L",
    category: "portable",
    url: "https://www.bluettipower.com/products/ac200l-portable-power-station",
    sourceUrl: "https://www.bluettipower.com/products/ac200l-portable-power-station",
    retrieved: "2026-11-09",
    capacityWh: 2048,
    maxCapacityWh: 8192,
    expansion: "with up to two B300K or B300 batteries (Bluetti also lists B210 and B230)",
    acOutputW: 2400,
    surgeW: null,
    chemistry: "LFP",
    cycles: 3000,
    cyclesTo: 80,
    weightLb: 62.4,
    solarInputW: 1200,
    acOutlets: 5,
    upsMs: null,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    soldOut: true,
    certifications: ["UL 2743"],
    notes: [
      "Sold out on Bluetti's US site on Nov 9 2026, and the page now says discontinued.",
      "Expands with Bluetti's add-on batteries; 8.2 kWh assumes two 3.07 kWh B300 units."
    ]
  },
  {
    id: "bluetti-apex-300",
    brand: "bluetti",
    model: "Apex 300",
    category: "home",
    url: "https://www.bluettipower.com/products/apex-300-home-battery-backup",
    sourceUrl: "https://www.bluettipower.com/products/apex-300-home-battery-backup",
    retrieved: "2026-11-14",
    capacityWh: 2764.8,
    maxCapacityWh: 19353.6,
    acOutputW: 3840,
    surgeW: 7680,
    chemistry: "LFP",
    cycles: 6000,
    cyclesTo: 80,
    weightLb: 83.78,
    solarInputW: 2400,
    acOutlets: 6,
    upsMs: 20,
    warrantyYears: null,
    volts: "120/240V",
    install: "diy",
    notes: [
      "120/240 V with a 50 A (14-50R) outlet; built as a home backup battery.",
      "Bluetti lists a 0 ms switchover in online UPS mode and 20 ms otherwise.",
      "Its 7,680 W figure is Power Lifting for heating-type loads only (kettles, heaters), per Bluetti's user manual section 5.3, not a motor-start surge.",
      "Expands to 19.4 kWh with six B300K batteries; Bluetti says multiple units scale further."
    ],
    expansion: "with up to six B300K expansion batteries",
    addOn: {
      model: "BLUETTI B300K Expansion Battery for Apex 300",
      capacityWh: 2764.8,
      url: "https://www.bluettipower.com/products/apex-300-b300k-expansion-battery",
      maxUnits: 6
    }
  },
  {
    id: "dji-power-1000-v2",
    brand: "dji",
    model: "Power 1000 V2",
    category: "portable",
    url: "https://store.dji.com/product/dji-power-1000-v2-power-station",
    sourceUrl: "https://store.dji.com/product/dji-power-1000-v2-power-station",
    retrieved: "2026-10-15",
    capacityWh: 1024,
    maxCapacityWh: 11264,
    acOutputW: 2600,
    surgeW: null,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 80,
    weightLb: null,
    solarInputW: null,
    acOutlets: 4,
    upsMs: 10.0,
    warrantyYears: null,
    volts: "120V",
    install: "diy",
    notes: [
      "Two 140 W USB-C ports and a quiet 26 dB rating, per DJI.",
      "Expands to about 11.3 kWh with DJI's 2 kWh expansion batteries."
    ],
    expansion: "with DJI Power Expansion Battery 2000 units"
  },
  // ALLPOWERS and Growatt, read on their US stores Nov 4 2026 (iallpowers.com, growattportable.com).
  // Pre-order and sold-out models are left out so no calculator recommends a unit that can't ship.
  {
    id: "allpowers-r1500",
    brand: "allpowers",
    model: "R1500",
    category: "portable",
    url: "https://iallpowers.com/products/allpowers-r1500-portable-home-backup-power-station-1800w-1152wh-lifep04-battery",
    sourceUrl: "https://iallpowers.com/products/allpowers-r1500-portable-home-backup-power-station-1800w-1152wh-lifep04-battery",
    retrieved: "2026-11-04",
    capacityWh: 1152,
    maxCapacityWh: 4608,
    expansion: "up to 3 B1000 batteries (1,152 Wh each)",
    acOutputW: 1800,
    surgeW: 3000,
    chemistry: "LFP",
    cycles: 3500,
    cyclesTo: null,
    weightLb: 36.8,
    solarInputW: 650,
    acOutlets: 4,
    upsMs: 15,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "ALLPOWERS does not say what capacity its 3,500 cycles are rated to.",
      "In stock on ALLPOWERS' US site on Nov 4 2026.",
    ],
  },
  {
    id: "allpowers-s2000-pro",
    brand: "allpowers",
    model: "S2000 Pro",
    category: "portable",
    url: "https://iallpowers.com/products/allpowers-2400w-portable-power-station",
    sourceUrl: "https://iallpowers.com/products/allpowers-2400w-portable-power-station",
    retrieved: "2026-11-04",
    capacityWh: 1451,
    maxCapacityWh: null,
    notExpandable: true,
    acOutputW: 2400,
    surgeW: 4000,
    chemistry: "NMC",
    cycles: 2500,
    cyclesTo: 80,
    weightLb: 28.66,
    solarInputW: 1000,
    acOutlets: 4,
    upsMs: null,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "NMC cells: lighter for the capacity than LFP, but fewer rated cycles.",
      "Its spec table lists 1,000 W of solar input; its FAQ says 650 W.",
      "In stock on ALLPOWERS' US site on Nov 4 2026.",
    ],
  },
  {
    id: "allpowers-r3500",
    brand: "allpowers",
    model: "R3500",
    category: "portable",
    url: "https://iallpowers.com/products/allpowers-r3500-portable-power-station-3200w-3168wh",
    sourceUrl: "https://iallpowers.com/products/allpowers-r3500-portable-power-station-3200w-3168wh",
    retrieved: "2026-11-14",
    capacityWh: 3168,
    maxCapacityWh: 6336,
    expansion: "1 B3000 battery (3,168 Wh); the B3000 was sold out on Nov 4 2026",
    acOutputW: 3200,
    surgeW: 6000,
    chemistry: "LFP",
    cycles: 3500,
    cyclesTo: null,
    weightLb: 93,
    solarInputW: 2000,
    acOutlets: null,
    upsMs: 15,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "120 V only, so it can't run a 240 V well pump.",
      "In stock on ALLPOWERS' US site on Nov 14 2026.",
    ],
  },
  {
    id: "growatt-infinity-2000-pro",
    brand: "growatt",
    model: "INFINITY 2000 PRO",
    category: "portable",
    url: "https://growattportable.com/products/growatt-infinity-2000-pro-portable-power-station",
    sourceUrl: "https://growattportable.com/products/growatt-infinity-2000-pro-portable-power-station",
    retrieved: "2026-11-04",
    capacityWh: 2048,
    maxCapacityWh: 6144,
    expansion: "up to 2 extra batteries (2,048 Wh each); sold out on Nov 4 2026",
    addOn: {
      model: "INFINITY 2000 PRO Extra Battery",
      capacityWh: 2048,
      url: "https://growattportable.com/products/growatt-infinity-2000-pro-portable-power-station",
      maxUnits: 2,
      soldOut: true,
    },
    acOutputW: 2400,
    surgeW: null,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 80,
    weightLb: 51,
    solarInputW: 1200,
    acOutlets: 5,
    upsMs: 20,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "Growatt's pages give both 2,200 W and 2,400 W for continuous output, and two different surge figures.",
      "In stock on Growatt's US site on Nov 4 2026.",
    ],
  },
  {
    id: "growatt-helios-3600",
    brand: "growatt",
    model: "HELIOS 3600",
    category: "portable",
    url: "https://growattportable.com/products/growatt-helios-3600-portable-power-station",
    sourceUrl: "https://growattportable.com/products/growatt-helios-3600-portable-power-station",
    retrieved: "2026-11-14",
    capacityWh: 3686,
    maxCapacityWh: 18086,
    expansion: "up to 4 extra batteries (3.6 kWh each)",
    addOn: {
      model: "HELIOS 3600 Extra Battery",
      capacityWh: 3600,
      url: "https://growattportable.com/products/growatt-helios-3600-portable-power-station",
      maxUnits: 4,
      soldOut: true,
    },
    acOutputW: 3600,
    surgeW: null,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: null,
    weightLb: 99,
    solarInputW: 2000,
    acOutlets: 6,
    upsMs: 20,
    warrantyYears: 5,
    volts: "120V",
    install: "diy",
    notes: [
      "120 V from one unit. Growatt says 240 V (7,200 W) needs two units joined with its Split-phase Connector.",
      "Growatt gives both 15 ms and 20 ms for its switchover time; we use the slower figure.",
      "In stock on Growatt's US site on Nov 14 2026; the Extra Battery was sold out that day.",
    ],
  },
  {
    id: "natures-generator-l3600",
    brand: "naturesgenerator",
    model: "L3600",
    category: "portable",
    url: "https://naturesgenerator.com/products/lithium-3600-power-station",
    sourceUrl: "https://naturesgenerator.com/products/lithium-3600-power-station",
    retrieved: "2026-11-05",
    capacityWh: 3072,
    maxCapacityWh: 18432,
    expansion: "up to 5 L3600 Power Pods (3,072 Wh each); not sold on its own on Nov 5 2026",
    acOutputW: 3600,
    surgeW: 7200,
    chemistry: "LFP",
    cycles: 3000,
    cyclesTo: 70,
    weightLb: 97,
    solarInputW: 2400,
    acOutlets: 5,
    upsMs: 10,
    warrantyYears: 1,
    volts: "120V",
    install: "diy",
    notes: [
      "120 V only; 240 V needs two units paired.",
      "1-year warranty, shorter than most power stations we list.",
      "In stock on Nature's Generator's site on Nov 5 2026.",
    ],
  },
  {
    id: "natures-generator-l6000",
    brand: "naturesgenerator",
    model: "L6000",
    category: "portable",
    url: "https://naturesgenerator.com/products/lithium-6000-power-station",
    sourceUrl: "https://naturesgenerator.com/products/lithium-6000-power-station",
    retrieved: "2026-11-05",
    capacityWh: 3840,
    maxCapacityWh: 23040,
    expansion: "with up to 5 L6000 Power Pods",
    addOn: {
      model: "Lithium 6000 Power Pod",
      capacityWh: 3840,
      url: "https://naturesgenerator.com/products/lithium-6000-power-pod",
      maxUnits: 5,
    },
    acOutputW: 6000,
    surgeW: 12000,
    chemistry: "LFP",
    cycles: 4000,
    cyclesTo: 70,
    weightLb: 112.4,
    solarInputW: 2400,
    acOutlets: 6,
    upsMs: 20,
    warrantyYears: 1,
    volts: "120/240V",
    install: "diy",
    notes: [
      "6,000 W at 120/240 V with a 30 A twist-lock (L14-30R) outlet for a transfer switch installed by a licensed electrician.",
      "1-year warranty on the main unit (the Power Pod has 3 + 2 years), shorter than most power stations we list.",
      "In stock on Nature's Generator's site on Nov 5 2026.",
    ],
  },
];

export const PRODUCTS: Product[] = [...PORTABLE, ...HOME];

/** Plug-in solar kits sold to US addresses. Excludes Europe-only products (see /plug-in-solar). */
export const PLUGIN_KITS: PluginKit[] = [
  {
    id: "ecoflow-stream-microinverter", brand: "ecoflow", name: "STREAM Microinverter + 400 W panel",
    url: "https://us.ecoflow.com/products/stream-microinverter",
    sourceUrl: "https://us.ecoflow.com/products/stream-microinverter", retrieved: "2026-10-15",
    panelW: 400, inverterW: 1200, batteryWh: null, certifications: ["UL 1741"],
    states: ["UT", "MD", "CT", "CO"],
    notes: [
      "The inverter is also sold alone if you already have panels.",
      "EcoFlow's page says plug-in installation is currently permitted in Utah, Maryland, Connecticut and Colorado.",
      "No UL 3700 listing stated on the product page.",
    ],
  },
  {
    id: "brightsaver-360w-kit", brand: "brightsaver", name: "Balcony Solar Kit 360 W",
    url: "https://www.brightsaver.org/balcony-solar-kits",
    sourceUrl: "https://www.brightsaver.org/balcony-solar-kits", retrieved: "2026-10-15",
    panelW: 360, inverterW: 360, batteryWh: null,
    certifications: ["UL 1741 (inverter)", "UL 3700 subassembly certification (inverter)"],
    states: ["UT", "VA", "CO", "MD", "CT", "NH", "NJ"],
    notes: [
      "Sold by Bright Saver, the nonprofit behind many state plug-in solar bills; a 180 W kit is also available.",
      "Uses a Hoymiles microinverter. Ships only to states with a plug-in solar law (listed on its page).",
      "Bright Saver says to plug it into a GFCI-protected outlet.",
    ],
  },
  {
    id: "pluggedsolar-800w-kit", brand: "pluggedsolar", name: "800 W Plug-in & Balcony Solar Kit (APsystems)",
    url: "https://pluggedsolar.com/products/800w-plug-in-balcony-solar-kit-4-panel-grid-tie-plug-and-play-system-with-apsystems-microinverter-wifi-monitoring-ul-3700-certification",
    sourceUrl: "https://pluggedsolar.com/products/800w-plug-in-balcony-solar-kit-4-panel-grid-tie-plug-and-play-system-with-apsystems-microinverter-wifi-monitoring-ul-3700-certification",
    retrieved: "2026-10-15",
    panelW: 800, inverterW: 800, batteryWh: null, certifications: ["UL 1741", "UL 3700 (claimed by seller)"],
    notes: [
      "Four 200 W panels with an APsystems 800 W microinverter and Wi-Fi monitoring; mounts not included.",
      "Also sold as 400 W, 1,200 W and 1,600 W kits.",
    ],
  },
  {
    id: "craftstrom-1200w-eco-line", brand: "craftstrom", name: "1200 W Eco-Line Plug&Play Solar",
    url: "https://craftstrom.com/product/1200-watt-eco-line-plugplay-solar/",
    sourceUrl: "https://craftstrom.com/product/1200-watt-eco-line-plugplay-solar/", retrieved: "2026-10-15",
    panelW: 1200, inverterW: 1200, batteryWh: null, certifications: ["UL-certified inverter (seller's claim)"],
    notes: [
      "Three 400 W inverters. Houston-based seller.",
      "The seller says it is available in all 50 states with no permits needed; that is not what state law says, so check the rules for your state first.",
    ],
  },
  {
    id: "mangopower-s-1200w-kit", brand: "mangopower", name: "Mango Power S 1,200 W Plug-In Solar Kit",
    url: "https://www.mangopower.com/products/mango-power-s-pipv-1200w-kit",
    sourceUrl: "https://www.mangopower.com/products/mango-power-s-pipv-1200w-kit", retrieved: "2026-10-15",
    panelW: 1200, inverterW: 1200, batteryWh: null,
    certifications: ["UL 1741-SA/SB", "IEEE 1547:2018", "CA Rule 21"],
    notes: [
      "Includes panels, stand, cables and a zero-export gateway that stops power flowing out to the grid.",
      "Four microinverters with a 25-year warranty, per Mango Power.",
      "Trade press reports UL 3700 certification through Intertek; the product page does not say so.",
    ],
  },
];


/**
 * Installed cost per kWh for professionally installed home batteries, before
 * incentives, used only to give a range for systems sold by quote.
 */
export const INSTALLED_BATTERY_COST = {
  medianPerKwh: 1130,
  source: "EnergySage's home battery price of $1,130 per kWh (first half of 2026)",
  url: "https://www.energysage.com/news/home-energy-market-h1-2026-highlights/",
  retrieved: "2026-10-15",
};

/** Rooftop solar cost, for comparing plug-in kits. */
export const ROOFTOP_SOLAR_COST = {
  perWatt: 2.6,
  typicalSystem: "a typical 12 kW system at $31,135",
  source: "EnergySage Marketplace national average before incentives",
  url: "https://www.energysage.com/local-data/solar-panel-cost/",
  retrieved: "2026-10-15",
};

/**
 * Portable solar panels for the off-grid kit, one per brand whose stations the
 * kit can pick. Same rules as PRODUCTS: specs and stock from the maker's US
 * store on `retrieved`. Each panel is one the maker sells for its own stations.
 */
export interface SolarPanel {
  id: string;
  brand: Exclude<BrandId, "energysage">;
  model: string;
  watts: number;
  url: string;
  sourceUrl: string;
  retrieved: string;
  soldOut?: boolean;
  notes: string[];
}

export const SOLAR_PANELS: SolarPanel[] = [
  {
    id: "anker-solix-ps400-bifacial",
    brand: "anker",
    model: "SOLIX PS400 Bifacial Portable Solar Panel",
    watts: 400,
    url: "https://www.ankersolix.com/products/ps400-bifacial-portable-solar-panel",
    sourceUrl: "https://www.ankersolix.com/products/ps400-bifacial-portable-solar-panel",
    retrieved: "2026-11-17",
    notes: [
      "The non-bifacial PS400 was sold out on Nov 17 2026.",
    ],
  },
  {
    id: "bluetti-350w-solar-panel",
    brand: "bluetti",
    model: "350W Solar Panel",
    watts: 350,
    url: "https://www.bluettipower.com/products/350w-solar-panel",
    sourceUrl: "https://www.bluettipower.com/products/350w-solar-panel",
    retrieved: "2026-11-17",
    notes: ["Bluetti sells this panel in bundles with the AC180, Elite 200 V2 and Apex 300 (store listings, Nov 17 2026)."],
  },
];

/**
 * Complete off-grid systems: an installed inverter, a 48 V battery bank and a
 * panel array sold as one kit. Bigger than any power station we track, and not
 * plug-and-play: the inverter is wired to the house, which takes an electrician
 * and usually a permit. Same rules as PRODUCTS: specs from the maker's
 * own US store on `retrieved`, null for anything it does not state.
 */
export interface OffGridSystem {
  id: string;
  brand: Exclude<BrandId, "energysage">;
  model: string;
  /** The store option this record is (kits come in several sizes on one page). */
  variant: string;
  url: string;
  sourceUrl: string;
  retrieved: string;
  /** Battery in the kit, watt-hours (modules × module size). */
  capacityWh: number;
  battery: { model: string; count: number; moduleWh: number; chemistry: "LFP" | "NMC" | null; warrantyYears: number | null; certifications: string[] };
  /** More of the same battery module bought separately. `maxUnits` is how many more the maker's stated limit allows. */
  addOn: AddOnBattery;
  inverter: { model: string; count: number; url: string; certifications: string[] };
  /** Inverter continuous AC output, watts. */
  acOutputW: number;
  /** Inverter peak output, watts, as the maker states it. */
  surgeW: number | null;
  volts: "120V" | "120/240V";
  /** Most solar the inverter accepts, watts. */
  solarInputW: number;
  /** Panels in the box. */
  panel: { model: string; watts: number; count: number; warrantyYears: number | null };
  soldOut?: boolean;
  notes: string[];
}

export const OFFGRID_SYSTEMS: OffGridSystem[] = [
  {
    id: "ecoworthy-10kw-offgrid-20kwh",
    brand: "ecoworthy",
    model: "10kW Complete Off-Grid Solar Power System",
    variant: "5310W PV & 20.48kWh Battery",
    url: "https://www.eco-worthy.com/products/eco-worthy-complete-off-grid-solar-power-system-20-48kwh-61-44kwh-battery-10000w-120-240v-5310w-15340w-pv",
    sourceUrl: "https://www.eco-worthy.com/products/eco-worthy-complete-off-grid-solar-power-system-20-48kwh-61-44kwh-battery-10000w-120-240v-5310w-15340w-pv",
    retrieved: "2026-11-18",
    capacityWh: 20480,
    battery: {
      model: "Cubix100 51.2V 100Ah LiFePO4 server rack battery",
      count: 4,
      moduleWh: 5120,
      chemistry: "LFP",
      warrantyYears: 10,
      certifications: ["UL 9540", "UL 1973", "UL 9540A"],
    },
    addOn: {
      model: "Cubix100 51.2V 100Ah LiFePO4 server rack battery (5.12 kWh)",
      capacityWh: 5120,
      url: "https://www.eco-worthy.com/products/eco-worthy-51-2v-100ah-lifepo4-lithium-battery-5-12kwh-capacity-server-rack-battery",
      // Eco-Worthy: up to 32 batteries in parallel; the kit has 4.
      maxUnits: 28,
    },
    inverter: {
      model: "Liber 10KP 10000W split-phase all-in-one off-grid inverter",
      count: 1,
      url: "https://www.eco-worthy.com/products/eco-worthy-10000w-solar-off-grid-inverter-charger-48v-dc-to-240v-ac-split-phase-power-inverter",
      certifications: ["UL 1741"],
    },
    acOutputW: 10000,
    surgeW: 20000,
    volts: "120/240V",
    solarInputW: 11000,
    panel: { model: "590W N-type monocrystalline panel", watts: 590, count: 9, warrantyYears: 12 },
    notes: [
      "Inverter: 10,000 W rated, 20,000 W peak, 120/240 V split-phase or 120 V single-phase, rated for a 6 HP motor load, 11,000 W of solar input, indoor use only (IP20), per Eco-Worthy's inverter page on Nov 18 2026.",
      "In the box: 9 × 590 W panels, the inverter, 4 × 51.2 V 100 Ah batteries and a 6-layer rack with busbar. Mounts and wiring to the house are not included.",
      "Eco-Worthy recommends a professional installer or certified electrician. The panels ship on a pallet by truck.",
      "On Nov 18 2026 Eco-Worthy said the Cubix100 battery was on presale, shipping about Nov 25.",
    ],
  },
];
