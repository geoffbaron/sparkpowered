/**
 * The non-power half of the 90-day household kit: food, cooking fuel, water
 * treatment, a garden and the rest of the supplies, scaled by household.
 *
 * No second formula for anything the site already calculates:
 *   - calories: foodNeeded in src/lib/prep.ts (Dietary Guidelines table)
 *   - water: waterNeeded in prep.ts; bleach doses from the EPA table in prep.ts
 *   - stove fuel: generatorPlan in src/lib/offgrid.ts (tank ÷ hours a tank × hours run),
 *     with the stove maker's own runtime figure
 * New figures here are copied from primary sources listed in SURVIVAL_SOURCES,
 * each with the date it was read. No prices: the food and garden brands are
 * not ones we earn from, and we have not read their prices.
 */

import { generatorPlan } from "@/lib/offgrid";
import { EPA_BLEACH_TABLE, dropsIn } from "@/lib/prep";

export const SURVIVAL_READ = "2026-11-17";

export const SURVIVAL_SOURCES = {
  fdc: { name: "USDA FoodData Central (SR Legacy): energy per 100 g", url: "https://fdc.nal.usda.gov/" },
  coleman: {
    name: "Coleman, Classic Propane Gas Camping Stove, 2-Burner",
    url: "https://www.coleman.com/grills-stoves/camping-stoves/multi-burner/classic-propane-gas-camping-stove-2-burner/SAP_2223621.html",
    detail: "20,000 total BTUs; lasts up to 1 hour with both burners on high on one 16.4-oz propane cylinder",
  },
  cdcCoBasics: {
    name: "CDC, Carbon Monoxide (CO) Poisoning Basics",
    url: "https://www.cdc.gov/carbon-monoxide/about/",
    detail: "never use a portable gas camp stove indoors; never heat your house with a gas oven; never burn charcoal indoors",
  },
  cdcRain: {
    name: "CDC, Collecting Rainwater and Your Health: An Overview",
    url: "https://www.cdc.gov/drinking-water/about/collecting-rainwater-and-your-health-an-overview.html",
    detail: "rainwater is not necessarily safe to drink without first removing germs and chemicals",
  },
  cdcRx: {
    name: "CDC, Prepare Your Health: Prescriptions",
    url: "https://www.cdc.gov/prepare-your-health/take-action/prescriptions.html",
    detail: "talk to your doctor or pharmacist about how you can create an emergency supply of medicines; keep a list of prescriptions",
  },
  tamu: {
    name: "Texas A&M AgriLife Extension, Home Vegetable Gardening, E-502 (Masabni, 2009), Table 9: Vegetable harvest and yield (PDF)",
    url: "https://aggie-horticulture.tamu.edu/vegetable/files/2010/10/E-502_home_vegetable_guide.pdf",
    detail: "days to harvest and approximate planting per person, fresh use",
  },
  isuTunnels: {
    name: "Iowa State University Extension, Using Low Tunnels to Extend the Season in Your Vegetable Garden",
    url: "https://yardandgarden.extension.iastate.edu/how-to/using-low-tunnels-extend-season-your-vegetable-garden",
    detail: "hardy greens can be extended into January; crops must be full-sized by early November; cannot be harvested while frozen; vent above 40°F",
  },
  ncsuExtenders: {
    name: "NC State Extension, Extension Gardener Handbook, Appendix E: Season Extenders and Greenhouses",
    url: "https://content.ces.ncsu.edu/appendix-e-season-extenders-and-greenhouses",
    detail: "row covers and low tunnels 4 to 5°F of frost protection; cold frames rely on the sun as their sole source of heat; greenhouses need heat sized to the plants",
  },
  noaaFreeze: {
    name: "NOAA Climate.gov, Interactive map: average date of last spring freeze across the United States",
    url: "https://www.climate.gov/news-features/understanding-climate/interactive-map-average-date-last-spring-freeze-across-united",
    detail: "from the U.S. Climate Normals, by location",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Food: staples by calories                                            */
/* ------------------------------------------------------------------ */

const GRAMS_PER_LB = 453.592;

export interface Staple {
  id: string;
  label: string;
  /** FoodData Central item and its energy, kcal per 100 g (read SURVIVAL_READ). */
  fdcId: number;
  fdcName: string;
  kcalPer100g: number;
  /** Our example share of the household's calories. Not a diet plan. */
  share: number;
  /** "lb" for dry goods; "can" for canned goods counted in 16-oz cans. */
  unit: "lb" | "can";
}

/** A 16-oz can, the size we count canned goods in. */
export const CAN_GRAMS = 454;
/** FoodData Central: soybean oil, 1 cup = 218 g; 16 cups to the gallon. */
export const OIL_GRAMS_PER_GALLON = 218 * 16;

/**
 * Our example mix of long-shelf-life staples, by share of calories. The shares
 * are our choice, stated on the page; the calories per pound are USDA's.
 */
export const STAPLES: Staple[] = [
  { id: "rice", label: "White rice", fdcId: 169756, fdcName: "Rice, white, long-grain, regular, raw, unenriched", kcalPer100g: 365, share: 0.35, unit: "lb" },
  { id: "beans", label: "Dry beans", fdcId: 173734, fdcName: "Beans, black, mature seeds, raw", kcalPer100g: 341, share: 0.15, unit: "lb" },
  { id: "oats", label: "Rolled oats", fdcId: 173904, fdcName: "Cereals, oats, regular and quick, not fortified, dry", kcalPer100g: 379, share: 0.15, unit: "lb" },
  { id: "oil", label: "Cooking oil", fdcId: 171411, fdcName: "Oil, soybean, salad or cooking", kcalPer100g: 884, share: 0.1, unit: "lb" },
  { id: "peanut-butter", label: "Peanut butter", fdcId: 172470, fdcName: "Peanut butter, smooth style, without salt", kcalPer100g: 598, share: 0.1, unit: "lb" },
  { id: "canned", label: "Canned goods (16-oz cans)", fdcId: 175182, fdcName: "Beans, baked, canned, plain or vegetarian", kcalPer100g: 94, share: 0.15, unit: "can" },
];

export const fdcUrl = (id: number) => `https://fdc.nal.usda.gov/food-details/${id}/nutrients`;

export interface StapleLine {
  staple: Staple;
  calories: number;
  pounds: number;
  /** Whole 16-oz cans, for canned goods. */
  cans: number | null;
  /** Gallons, for oil. */
  gallons: number | null;
}

/** Pounds (or cans) of each staple that together hold `totalCalories`. */
export function staplesFor(totalCalories: number): StapleLine[] {
  const total = Math.max(0, totalCalories);
  return STAPLES.map((s) => {
    const calories = total * s.share;
    const grams = (calories / s.kcalPer100g) * 100;
    return {
      staple: s,
      calories,
      pounds: grams / GRAMS_PER_LB,
      cans: s.unit === "can" ? Math.ceil(grams / CAN_GRAMS - 1e-9) : null,
      gallons: s.id === "oil" ? grams / OIL_GRAMS_PER_GALLON : null,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Cooking: a camp stove, outdoors                                      */
/* ------------------------------------------------------------------ */

/** Coleman's published figure for its Classic 2-burner stove (read SURVIVAL_READ). */
export const EXAMPLE_STOVE = {
  name: "Coleman Classic 2-burner propane stove",
  totalBtu: 20000,
  cylinderOz: 16.4,
  /** Hours per cylinder with both burners on high. */
  hoursPerCylinder: 1,
};

/** Our assumption, stated on the page: 15 minutes a person a day with both burners on high. The reader can change it. */
export const COOK_MINUTES_PER_PERSON = 15;

/** A standard 20-lb grill tank, by its own rating. */
export const BULK_TANK_LB = 20;

export function cookingPlan(people: number, days: number, minutesPerDay = people * COOK_MINUTES_PER_PERSON) {
  // Same formula as generator fuel: tank ÷ hours a tank × hours run. Here the tank is one cylinder.
  const plan = generatorPlan({ tankSize: 1, runtimeHours: EXAMPLE_STOVE.hoursPerCylinder, hoursPerDay: Math.max(0, minutesPerDay) / 60, days });
  const cylinders = plan.fuel;
  const pounds = (cylinders * EXAMPLE_STOVE.cylinderOz) / 16;
  return {
    minutesPerDay: Math.max(0, minutesPerDay),
    hours: plan.hours,
    cylinders: Math.max(0, Math.ceil(cylinders - 1e-9)),
    pounds,
    bulkTanks: Math.max(0, Math.ceil(pounds / BULK_TANK_LB - 1e-9)),
  };
}

/* ------------------------------------------------------------------ */
/* Water treatment with bleach (EPA table)                              */
/* ------------------------------------------------------------------ */

/** Drops in a teaspoon, from the EPA table's own row: 16 drops = 1/4 teaspoon of 6% bleach. */
export const DROPS_PER_TSP = (() => {
  const row = EPA_BLEACH_TABLE.find((r) => r.id === "2gal")!;
  return dropsIn(row.dose["6"])! * 4;
})();
const TSP_PER_FL_OZ = 6;

/** Fluid ounces of 6% unscented bleach to treat `gallons` of clear water, at EPA's per-gallon dose. Cloudy or very cold water takes double. */
export function bleachFor(gallons: number) {
  const perGal = dropsIn(EPA_BLEACH_TABLE.find((r) => r.id === "1gal")!.dose["6"])!;
  const drops = Math.max(0, gallons) * perGal;
  const flOz = drops / DROPS_PER_TSP / TSP_PER_FL_OZ;
  return { dropsPerGallon: perGal, drops, flOz, flOzCloudy: flOz * 2 };
}

/* ------------------------------------------------------------------ */
/* Garden: Texas A&M E-502 Table 9                                       */
/* ------------------------------------------------------------------ */

export interface Crop {
  id: string;
  label: string;
  /** Days to harvest, as the table gives it. */
  days: [number, number];
  /** Planting per person for fresh use, as the table gives it. */
  perPerson: [number, number];
  unit: "ft" | "plants" | "hills";
  /** Cool-season crops that low tunnels and cold frames carry into winter (Iowa State's list). */
  coolSeason: boolean;
}

/** Fresh-use planting per person and days to harvest, copied from Table 9. */
export const CROPS: Crop[] = [
  { id: "radish", label: "Radish", days: [25, 40], perPerson: [3, 5], unit: "ft", coolSeason: true },
  { id: "lettuce", label: "Leaf lettuce", days: [40, 80], perPerson: [5, 15], unit: "ft", coolSeason: true },
  { id: "spinach", label: "Spinach", days: [40, 60], perPerson: [5, 10], unit: "ft", coolSeason: true },
  { id: "bush-beans", label: "Snap beans, bush", days: [45, 60], perPerson: [15, 16], unit: "ft", coolSeason: false },
  { id: "beet", label: "Beet", days: [50, 60], perPerson: [5, 10], unit: "ft", coolSeason: true },
  { id: "kale", label: "Collards or kale", days: [50, 80], perPerson: [5, 10], unit: "ft", coolSeason: true },
  { id: "summer-squash", label: "Summer squash", days: [50, 60], perPerson: [2, 3], unit: "hills", coolSeason: false },
  { id: "carrot", label: "Carrot", days: [70, 80], perPerson: [5, 10], unit: "ft", coolSeason: true },
  { id: "tomato", label: "Tomato", days: [70, 90], perPerson: [3, 5], unit: "plants", coolSeason: false },
  { id: "potato", label: "Potato", days: [75, 100], perPerson: [50, 100], unit: "ft", coolSeason: false },
  { id: "winter-squash", label: "Winter squash", days: [85, 100], perPerson: [1, 3], unit: "hills", coolSeason: false },
];

export interface CropLine {
  crop: Crop;
  amount: [number, number];
  /** Days of harvest left inside the window if sown on day 1 in the growing season; 0 when it is not ready in time. */
  daysToEat: number;
}

export function gardenFor(people: number, windowDays: number) {
  const n = Math.max(0, Math.round(people));
  const lines: CropLine[] = CROPS.map((c) => ({
    crop: c,
    amount: [c.perPerson[0] * n, c.perPerson[1] * n],
    daysToEat: Math.max(0, windowDays - c.days[1]),
  }));
  const rowFeet: [number, number] = [0, 0];
  for (const l of lines)
    if (l.crop.unit === "ft") {
      rowFeet[0] += l.amount[0];
      rowFeet[1] += l.amount[1];
    }
  return { lines, rowFeet, readyInWindow: lines.filter((l) => l.daysToEat > 0).length };
}

/* ------------------------------------------------------------------ */
/* Everything else, from Ready.gov and CDC                               */
/* ------------------------------------------------------------------ */

export interface SupplyItem {
  id: string;
  text: string;
  /** One per person. */
  perPerson?: boolean;
}

export const MEDICAL_HYGIENE: SupplyItem[] = [
  { id: "first-aid", text: "First aid kit" },
  { id: "rx", text: "Prescription medicines for 90 days: ask your doctor or pharmacist how to build an emergency supply, and keep a written list of each medicine, dose and allergy (CDC)" },
  { id: "otc", text: "Non-prescription medicines: pain and fever relievers, anti-diarrhea medicine, antacids or laxatives" },
  { id: "glasses", text: "Prescription glasses and contact lens solution" },
  { id: "toilet", text: "Toilet without water: heavy garbage bags and plastic ties, moist towelettes (Ready.gov's personal sanitation items)" },
  { id: "soap", text: "Soap, hand sanitizer and disinfecting wipes" },
  { id: "bleach", text: "Unscented household bleach, under a year old, and a medicine dropper" },
  { id: "hygiene", text: "Feminine supplies and personal hygiene items" },
];

export const LIGHT_COMMS: SupplyItem[] = [
  { id: "noaa", text: "NOAA Weather Radio with tone alert, plus a battery or hand-crank radio" },
  { id: "flashlight", text: "Flashlights or headlamps" },
  { id: "batteries", text: "Extra batteries for the radio and lights" },
  { id: "phone", text: "Phone chargers and a backup battery" },
  { id: "whistle", text: "Whistle to signal for help" },
  { id: "maps", text: "Local paper maps" },
  { id: "co-alarm", text: "Battery carbon monoxide alarm (for the generator and stove)" },
  { id: "extinguisher", text: "Fire extinguisher" },
  { id: "wrench", text: "Wrench or pliers to turn off utilities" },
  { id: "documents", text: "Important documents in a waterproof container, and some cash" },
];

/** Ready-made first aid kits we link (SurviveX, Awin). Prices copied from survive-x.com on the date shown. */
export const FIRST_AID_KITS = {
  checked: "2026-11-20",
  household: { name: "SurviveX Large First Aid Kit", url: "https://www.survive-x.com/products/large-first-aid-kit", supplies: 250, priceUsd: 134.99, listUsd: 159.99 },
  small: { name: "Small First Aid Kit", url: "https://www.survive-x.com/products/small-first-aid-kit", supplies: 126, priceUsd: 60.99 },
};
