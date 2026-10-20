/**
 * Data for the boating and fishing section (/boating and the pages it links):
 * small-boat and kayak batteries, fish finder batteries, chargers, electric
 * outboards and the gas outboard we compare them with.
 *
 * RULES (enforced by tests/boating.test.ts): every price and spec is copied
 * from the maker's own US store (or the cited source) and dated. Use null for
 * anything not published. Never estimate here; estimates live in
 * src/lib/boating.ts with their reasoning written next to them.
 */

import type { BrandId } from "@/data/affiliates";

export const BOATING_CHECKED = "2026-10-20";

const RD = "https://www.redodopower.com/products/";

/** A battery sold for kayaks, small boats or electronics. */
export interface BoatBattery {
  id: string;
  /** Partner brand when we have a program with it; otherwise null and the link is plain. */
  brand: BrandId | null;
  maker: string;
  name: string;
  /** Short plain-English name, e.g. "12V 50Ah". */
  short: string;
  url: string;
  retrieved: string;
  /** Volts as sold. */
  volts: number;
  ampHours: number;
  /** Rated energy, watt-hours (volts x amp-hours as the maker states it). */
  energyWh: number;
  weightLb: number | null;
  cycles: number | null;
  warrantyYears: number | null;
  bluetooth: boolean;
  lowTempCutoff: boolean;
  priceUsd: number;
  listPriceUsd: number | null;
  /** Largest trolling motor the maker says it suits, lb thrust (null if not for motors). */
  maxThrustLb: number | null;
  notes: string[];
}

export const BOAT_BATTERIES: BoatBattery[] = [
  {
    id: "redodo-12v-50ah-bluetooth-trolling",
    brand: "redodo",
    maker: "Redodo",
    name: "Redodo 12V 50Ah Bluetooth Battery for Trolling Motors",
    short: "12V 50Ah Bluetooth",
    url: `${RD}12v-50ah-smart-bluetooth-lithium-battery`,
    retrieved: BOATING_CHECKED,
    volts: 12,
    ampHours: 50,
    energyWh: 640,
    weightLb: 11.27,
    cycles: 4000,
    warrantyYears: null,
    bluetooth: true,
    lowTempCutoff: true,
    priceUsd: 215.99,
    listPriceUsd: 299.99,
    maxThrustLb: 70,
    notes: [
      "Redodo rates it for trolling motors up to 70 lb thrust and says it carries the usable energy of a 12V 100Ah lead-acid battery.",
      "Bluetooth app shows charge left, current and cycle count; charging pauses below 32°F.",
    ],
  },
  {
    id: "redodo-12v-100ah-ultra-mini",
    brand: "redodo",
    maker: "Redodo",
    name: "Redodo 12V 100Ah Ultra-Mini Bluetooth Lithium Battery (Group 22NF)",
    short: "12V 100Ah Ultra-Mini",
    url: `${RD}redodo-ultra-mini-12v-100ah-bluetooth-small-lithium-battery-group-22nf-size`,
    retrieved: BOATING_CHECKED,
    volts: 12,
    ampHours: 100,
    energyWh: 1280,
    weightLb: 19.8,
    cycles: 4000,
    warrantyYears: 5,
    bluetooth: true,
    lowTempCutoff: true,
    priceUsd: 299.99,
    listPriceUsd: 399.99,
    maxThrustLb: null,
    notes: [
      "A full 1,280 Wh in a small Group 22NF case at 19.8 lb; Redodo lists kayaks and trolling motors among its uses.",
      "IP65 water resistance, 100 A battery management, Bluetooth app.",
    ],
  },
  {
    id: "redodo-16v-30ah-fish-finder",
    brand: "redodo",
    maker: "Redodo",
    name: "Redodo 16V 30Ah Lithium Fish Finder Battery with Bluetooth",
    short: "16V 30Ah Fish Finder",
    url: `${RD}redodo-16v-30ah-fish-finder-battery`,
    retrieved: BOATING_CHECKED,
    volts: 16,
    ampHours: 30,
    energyWh: 480,
    weightLb: 7.63,
    cycles: null,
    warrantyYears: null,
    bluetooth: true,
    lowTempCutoff: true,
    priceUsd: 189.99,
    listPriceUsd: 249.99,
    maxThrustLb: null,
    notes: [
      "Made for high-draw fish finders and live sonar (Redodo names Humminbird MEGA Live, Garmin LiveScope and Lowrance ActiveTarget).",
      "16 V for a brighter screen, Redodo says; 8.78 x 3.74 x 6.89 in. Charging pauses below 32°F, so it suits ice fishing.",
      "Needs a charger with a 16 V lithium setting; Redodo sells a waterproof 16V 10A charger with it.",
    ],
  },
  {
    id: "redodo-24v-100ah-group31-trolling",
    brand: "redodo",
    maker: "Redodo",
    name: "Redodo 24V 100Ah Group 31 Trolling Motor Bluetooth Lithium Battery",
    short: "24V 100Ah Group 31",
    url: `${RD}redodo-24v-100ah-group-31-bluetooth-lithium-battery`,
    retrieved: BOATING_CHECKED,
    volts: 24,
    ampHours: 100,
    energyWh: 2560,
    weightLb: 44.09,
    cycles: 6000,
    warrantyYears: 5,
    bluetooth: true,
    lowTempCutoff: true,
    priceUsd: 669.99,
    listPriceUsd: 929.99,
    maxThrustLb: 100,
    notes: [
      "One Group 31-size battery for a 24 V motor of 70 to 100 lb thrust, replacing two 12V 100Ah AGMs and about 82 lb, per Redodo.",
      "Rated 6,000 cycles; IP65; fits Group 31 trays but not standard Group 31 battery boxes.",
    ],
  },
];

/** Redodo chargers and charging gear used on the charging page. */
export const BOAT_CHARGERS = [
  {
    id: "redodo-12v-40a-dc-dc-mppt",
    brand: "redodo" as const,
    name: "Redodo 12V 40A DC to DC Charger with MPPT",
    url: `${RD}redodo-12v-40a-dc-to-dc-charger-with-mppt`,
    retrieved: BOATING_CHECKED,
    priceUsd: 175.99,
    note: "Charges a lithium house or trolling battery from the engine's starting battery while you run, or from solar panels through its built-in MPPT input.",
  },
  {
    id: "redodo-14-6v-10a-charger",
    brand: "redodo" as const,
    name: "Redodo 14.6V 10A LiFePO4 Battery Charger",
    url: `${RD}redodo-14-6v-10a-lifepo4-battery-charger`,
    retrieved: BOATING_CHECKED,
    priceUsd: 59.99,
    note: "A plug-in lithium charger for one 12 V battery; Redodo says it takes a 12V 50Ah battery to half in 2.5 hours.",
  },
  {
    id: "redodo-29-2v-20a-charger",
    brand: "redodo" as const,
    name: "Redodo 29.2V 20A Mini LiFePO4 Charger (for 24 V)",
    url: `${RD}new-redodo-29-2v-20a-lifepo4-battery-charger-mini-size`,
    retrieved: BOATING_CHECKED,
    priceUsd: 109.99,
    note: "Plug-in charger for a single 24 V lithium trolling battery.",
  },
  {
    id: "redodo-43-8v-25a-charger",
    brand: "redodo" as const,
    name: "Redodo 43.8V 25A Lithium Charger (for 36 V)",
    url: `${RD}redodo-43-8v-25a-lithium-battery-charger-for-36v38-4v-lifepo4-batteries`,
    retrieved: BOATING_CHECKED,
    priceUsd: 155.99,
    note: "Plug-in charger for a single 36 V lithium trolling battery.",
  },
];

/** Piscifun (Awin partner) gear that runs on, or pairs with, electric power. Prices from piscifun.com. */
export const PISCIFUN_GEAR = {
  electricReel: {
    name: "Piscifun AtlantiX 1500 electric reel",
    url: "https://www.piscifun.com/products/atlantix-1500-electric-reels-for-inshore-fishing-reel",
    retrieved: BOATING_CHECKED,
    priceUsd: 359.99,
    note: "17 oz inshore electric reel with its own 5,000 mAh battery; Piscifun says up to 180 drops a charge (14 oz lure, 165 ft, top speed).",
  },
  spinningCombo: {
    name: "Piscifun Torrent Lite spinning combo",
    url: "https://www.piscifun.com/products/torrent-lite-twin-tip-spinning-rod-and-reel-combo",
    retrieved: BOATING_CHECKED,
    priceUsd: 89.99,
    note: "Rod and reel combo with a spare rod tip.",
  },
};

/**
 * Electric outboards. None of these makers runs an affiliate program, so every
 * link is plain. ePropulsion publishes no prices, so its prices are from a US
 * dealer (Electric Surf Sports); Mercury's site blocked us, so Avator prices
 * are dealer-listed MSRPs and specs come from Mercury's own brochure.
 */
export interface ElectricOutboard {
  id: string;
  maker: string;
  name: string;
  /** Power at the shaft or prop, watts, as the maker states it. */
  watts: number;
  /** Gas horsepower the maker says it is comparable to. */
  gasHpClaim: string;
  /** Price of a ready-to-run setup: motor with tiller and one battery, when published. */
  packagePriceUsd: number | null;
  /** What packagePriceUsd buys, in plain words. */
  packageNote: string;
  motorPriceUsd: number | null;
  batteryWh: number;
  batteryLb: number | null;
  motorLb: number | null;
  /** Maker's slow-cruise claim, plain words. */
  rangeClaim: string;
  url: string;
  priceUrl: string;
  priceSource: string;
  retrieved: string;
}

export const ELECTRIC_OUTBOARDS: ElectricOutboard[] = [
  {
    id: "torqeedo-travel-s",
    maker: "Torqeedo",
    name: "Torqeedo Travel S",
    watts: 1100,
    gasHpClaim: "3 hp",
    packagePriceUsd: 3398,
    packageNote: "Essential Package: motor and 1,080 Wh battery",
    motorPriceUsd: 1799,
    batteryWh: 1080,
    batteryLb: 18.3,
    motorLb: 25.5,
    rangeClaim: "22 km (13.7 miles) in 3 hours 56 minutes at slow speed on a 12.5 ft dinghy",
    url: "https://www.torqeedo.com/us/en-us/products/outboards/travel/travel-s/1160-00.html",
    priceUrl: "https://www.torqeedo.com/us/en-us/products/outboards/travel/travel-s/1160-00.html",
    priceSource: "Torqeedo US store",
    retrieved: BOATING_CHECKED,
  },
  {
    id: "epropulsion-spirit-1-evo",
    maker: "ePropulsion",
    name: "ePropulsion Spirit 1.0 Evo",
    watts: 1000,
    gasHpClaim: "3 hp",
    packagePriceUsd: 3607,
    packageNote: "tiller motor with 1,276 Wh Spirit battery",
    motorPriceUsd: 2257.5,
    batteryWh: 1276,
    batteryLb: 19.2,
    motorLb: 24.9,
    rangeClaim: "35 miles in 10 hours at 3.5 mph, or 22 miles at 4.4 mph, on a 12 ft aluminum boat",
    url: "https://www.epropulsion.com/products/electric-outboards/spirit-1",
    priceUrl: "https://electricsurfsports.com/shop/epropulsion-spirit-1-0-evo/",
    priceSource: "Electric Surf Sports, a US ePropulsion dealer",
    retrieved: BOATING_CHECKED,
  },
  {
    id: "mercury-avator-7-5e",
    maker: "Mercury",
    name: "Mercury Avator 7.5e",
    watts: 750,
    gasHpClaim: "3.5 hp",
    packagePriceUsd: 3810,
    packageNote: "starting MSRP at a US dealer",
    motorPriceUsd: null,
    batteryWh: 1030,
    batteryLb: 17,
    motorLb: 43,
    rangeClaim: "34 miles in 19.4 hours at 25% throttle, or 16 miles in 6.2 hours at half, on a 13 ft boat",
    url: "https://www.mercurymarine.com/content/dam/mercury-marine/aus---nz/promotions/aust/avator/Extended_Avator_Brochure.pdf",
    priceUrl: "https://gigharbormarina.com/post-28183/",
    priceSource: "Gig Harbor Marina, a US Mercury dealer (MSRP)",
    retrieved: BOATING_CHECKED,
  },
  {
    id: "mercury-avator-20e",
    maker: "Mercury",
    name: "Mercury Avator 20e",
    watts: 2200,
    gasHpClaim: "5 hp",
    packagePriceUsd: 3995,
    packageNote: "starting MSRP at a US dealer",
    motorPriceUsd: null,
    batteryWh: 2300,
    batteryLb: 48,
    motorLb: null,
    rangeClaim: "up to 16 hours on one 2,300 Wh battery on a 12 ft boat",
    url: "https://www.mercurymarine.com/content/dam/mercury-marine/aus---nz/promotions/aust/avator/Extended_Avator_Brochure.pdf",
    priceUrl: "https://gigharbormarina.com/post-28183/",
    priceSource: "Gig Harbor Marina, a US Mercury dealer (MSRP)",
    retrieved: BOATING_CHECKED,
  },
  {
    id: "epropulsion-navy-6-evo",
    maker: "ePropulsion",
    name: "ePropulsion Navy 6.0 Evo",
    watts: 6000,
    gasHpClaim: "9.9 hp",
    packagePriceUsd: null,
    packageNote: "battery sold separately",
    motorPriceUsd: 4278.5,
    batteryWh: 8345,
    batteryLb: null,
    motorLb: 62.8,
    rangeClaim: "72 miles in 18 hours at 4 mph, or 22.5 miles at 15 mph, with an E175 battery",
    url: "https://www.epropulsion.com/products/electric-outboards/navy-evo",
    priceUrl: "https://electricsurfsports.com/shop/epropulsion-navy-3-0-evo-navy-6-0-evo-electric-outboard-motor/",
    priceSource: "Electric Surf Sports, a US ePropulsion dealer",
    retrieved: BOATING_CHECKED,
  },
  {
    id: "mercury-avator-35e",
    maker: "Mercury",
    name: "Mercury Avator 35e",
    watts: 3700,
    gasHpClaim: "9.9 hp",
    packagePriceUsd: 4960,
    packageNote: "starting MSRP at a US dealer",
    motorPriceUsd: null,
    batteryWh: 4600,
    batteryLb: null,
    motorLb: null,
    rangeClaim: "up to 18 hours with two 2,300 Wh batteries",
    url: "https://www.mercurymarine.com/content/dam/mercury-marine/aus---nz/promotions/aust/avator/Extended_Avator_Brochure.pdf",
    priceUrl: "https://gigharbormarina.com/post-28183/",
    priceSource: "Gig Harbor Marina, a US Mercury dealer (MSRP)",
    retrieved: BOATING_CHECKED,
  },
];

/** ePropulsion's E163 battery (8,345 Wh) for the Navy 6.0, from the same dealer. */
export const EPROPULSION_E163 = {
  priceUsd: 4199,
  wh: 8345,
  url: "https://electricsurfsports.com/shop/epropulsion-e-series-e163-lithium-iron-phosphate-battery-lifepo4-copy/",
};

/** The ePropulsion Spirit 1.0 runtime table (12 ft aluminum boat, one person, calm lake). */
export const SPIRIT_RUNTIME = [
  { watts: 125, mph: 3.5, hours: 10, miles: 35 },
  { watts: 250, mph: 4.4, hours: 5, miles: 22 },
  { watts: 500, mph: 5.3, hours: 2.5, miles: 13.3 },
  { watts: 1000, mph: 6.2, hours: 1.25, miles: 7.8 },
];

/** Gas outboards we compare with. */
export const GAS_OUTBOARDS = {
  yamahaF6: {
    name: "Yamaha F6 (6 hp, 15 in shaft)",
    priceUsd: 2180,
    weightLb: 60,
    source: "Yamaha consumer price list, effective July 1, 2026",
    url: "https://yamahaoutboards.com/getmedia/88ab70ad-2f50-48e0-afbc-fd4a7611f8b8/PY27_Consumer_Dealer_Price_List_EFF_July_1_2026_FEB_2026_WEB.pdf",
  },
  yamahaF9_9: {
    name: "Yamaha F9.9 (9.9 hp, 15 in shaft)",
    priceUsd: 3265,
    source: "Yamaha consumer price list, effective July 1, 2026",
    url: "https://yamahaoutboards.com/getmedia/88ab70ad-2f50-48e0-afbc-fd4a7611f8b8/PY27_Consumer_Dealer_Price_List_EFF_July_1_2026_FEB_2026_WEB.pdf",
  },
  /** Honda: 0.29 gal tank, "up to 60 minutes at full throttle". */
  hondaBf23: {
    name: "Honda BF2.3",
    tankGal: 0.29,
    fullThrottleHours: 1,
    url: "https://marine.honda.com/outboards/models/portable/BF2_3",
  },
};

/** US average prices from EIA. */
export const FUEL_PRICES = {
  gasUsdPerGal: 4.331,
  gasWeek: "2026-10-12",
  gasUrl: "https://www.eia.gov/petroleum/gasdiesel/",
  electricCentsPerKwh: 18.31,
  electricMonth: "July 2026",
  electricUrl: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a",
};

/** Vision Marine V17 electric pontoon. */
export const ELECTRIC_PONTOON = {
  name: "Vision Marine V17 electric pontoon",
  priceUsd: 32950,
  note: "6 hp electric motor, 6 mph cruise, with battery options for 3, 6 or 12 hours",
  url: "https://visionmarinetechnologies.com/v17-electric-pontoon/",
};

/** Bluetti (Awin partner) items that fit a boat. Prices from bluettipower.com. */
export const BLUETTI_BOAT = {
  b1210: {
    name: "Bluetti B1210 12V 100Ah self-heating trolling motor battery",
    priceUsd: 299,
    energyWh: 1280,
    url: "https://www.bluettipower.com/products/lifepo4-lithium-batteries",
    note: "12.8 V 100 Ah lithium with self-heating and IP65; Bluetti calls it ideal for trolling motors.",
  },
  d40: {
    name: "Bluetti D40 DC-DC battery charger",
    priceUsd: 199,
    url: "https://www.bluettipower.com/products/bluetti-d40-dc-dc-battery-charger",
    note: "12 V, up to 30 A into a lithium, AGM or lead-acid battery from the starting battery, solar, or a Bluetti AC200L.",
  },
  retrieved: BOATING_CHECKED,
};
