/**
 * Home emergency prep: water, purification, kits, food and weather radio.
 *
 * Plain values and functions only (no "use client"), so server pages and the
 * client calculators share one set of numbers. Every figure here is copied
 * from a government source listed in PREP_SOURCES; where an agency gives no
 * figure (pets, pregnancy, illness) the calculators ask the visitor instead of
 * inventing one.
 */

/** Date the figures below were last checked against their sources. */
export const PREP_CHECKED = "2026-10-26";

export const PREP_SOURCES = {
  cdcWaterStorage: {
    name: "CDC, Creating and Storing an Emergency Water Supply",
    url: "https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html",
  },
  readyWater: { name: "Ready.gov, Water", url: "https://www.ready.gov/water" },
  femaFoodWater: { name: "FEMA, Food and Water in an Emergency (PDF)", url: "https://www.fema.gov/pdf/library/f&web.pdf" },
  epaDisinfection: {
    name: "US EPA, Emergency Disinfection of Drinking Water",
    url: "https://www.epa.gov/ground-water-and-drinking-water/emergency-disinfection-drinking-water",
  },
  cdcMakeSafe: { name: "CDC, Making Water Safe in an Emergency", url: "https://www.cdc.gov/water-emergency/about/index.html" },
  cdcFilters: {
    name: "CDC, A Guide to Water Filters (Cryptosporidium)",
    url: "https://www.cdc.gov/parasites/crypto/gen_info/filters.html",
  },
  nsfListings: { name: "NSF, Certified Drinking Water Treatment Units listings", url: "https://info.nsf.org/Certified/DWTU/" },
  nsfP231: {
    name: "NSF listing: Standard P231 Microbiological Water Purifiers",
    url: "https://info.nsf.org/Certified/DWTU/Listings.asp?Standard=P231&hdModlStd=ModlStd",
  },
  readyKit: { name: "Ready.gov, Build a Kit", url: "https://www.ready.gov/kit" },
  readyFood: { name: "Ready.gov, Food", url: "https://www.ready.gov/food" },
  dga2020: {
    name: "USDA and HHS, Dietary Guidelines for Americans 2020-2025, Appendix 2: Estimated Calorie Needs (PDF)",
    url: "https://www.dietaryguidelines.gov/sites/default/files/2020-12/Dietary_Guidelines_for_Americans_2020-2025.pdf",
  },
  dga2025: { name: "USDA and HHS, Dietary Guidelines for Americans 2025-2030 (PDF)", url: "https://cdn.realfood.gov/DGA.pdf" },
  nadMps: {
    name: "BBB National Programs, NAD decision on My Patriot Supply (May 3, 2023)",
    url: "https://bbbprograms.org/media/newsroom/decisions/my-patriot-supply",
  },
  nwr: { name: "National Weather Service, NOAA Weather Radio All Hazards", url: "https://www.weather.gov/nwr/" },
  nwrStations: { name: "NWS, NOAA Weather Radio station listing by state", url: "https://www.weather.gov/nwr/station_listing" },
  nwrCounties: { name: "NWS, NOAA Weather Radio county coverage and SAME codes", url: "https://www.weather.gov/nwr/counties" },
  nwrSame: { name: "NWS, Using SAME", url: "https://www.weather.gov/nwr/usingsame" },
  nwrReceivers: { name: "NWS, NOAA Weather Radio receiver information", url: "https://www.weather.gov/nwr/nwr_receivers" },
  berkeyOrder: {
    name: "US EPA Region 8, Stop Sale, Use or Removal Order to Berkey International LLC, FIFRA-08-2023-0038 (PDF)",
    url: "https://yosemite.epa.gov/OA/RHC/EPAAdmin.nsf/Filings/70BF71F4C6BC372C852589AA0000E556/$File/FIFRA-08-2023-0038%20SSURO%20BerkeyInternational%202023.pdf",
  },
  berkeyPuertoRico: {
    name: "Berkey International LLC v. EPA, complaint, US District Court for Puerto Rico, filed March 6, 2024 (PDF, hosted by EPA)",
    url: "https://www.epa.gov/system/files/documents/2024-03/berkey-international-puerto-rico-complaint.pdf",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Water storage                                                       */
/* ------------------------------------------------------------------ */

/** CDC, Ready.gov and FEMA: at least 1 gallon per person per day. */
export const GALLONS_PER_PERSON_DAY = 1;
/** CDC: "for 3 days" minimum. */
export const MIN_DAYS = 3;
/** CDC: "try to store a 2-week supply if possible"; FEMA: "at least a two-week supply". */
export const GOAL_DAYS = 14;
/** Ready.gov: "In very hot temperatures, water needs can double." */
export const HOT_MULTIPLIER = 2;
/** CDC and Ready.gov: replace water you bottled yourself every 6 months. */
export const REFRESH_MONTHS = 6;
/** CDC: store at 50 to 70 F, out of direct sunlight. */
export const STORE_TEMP_F = { low: 50, high: 70 };

export interface WaterContainer {
  id: string;
  label: string;
  gallons: number;
}

/** Container sizes by the gallons printed on them. These are the visitor's choice, not a recommendation. */
export const WATER_CONTAINERS: WaterContainer[] = [
  { id: "jug-1", label: "1-gallon jugs", gallons: 1 },
  { id: "jug-5", label: "5-gallon jugs", gallons: 5 },
  { id: "jug-7", label: "7-gallon jugs", gallons: 7 },
  { id: "drum-55", label: "55-gallon drums", gallons: 55 },
];

export interface WaterInput {
  people: number;
  days: number;
  hot?: boolean;
  /** Extra gallons a day for pregnant, nursing or sick members. No agency gives a figure; the visitor chooses. */
  extraGallonsPerDay?: number;
  /** Gallons a day for all pets together. No agency gives a figure; the visitor chooses (ask a vet). */
  petGallonsPerDay?: number;
}

const clampNum = (n: number, lo: number, hi: number) => (Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo);

/** Gallons to store, split into the parts the page explains. */
export function waterNeeded(i: WaterInput) {
  const people = Math.round(clampNum(i.people, 0, 50));
  const days = Math.round(clampNum(i.days, 1, 365));
  const extra = clampNum(i.extraGallonsPerDay ?? 0, 0, 100);
  const pets = clampNum(i.petGallonsPerDay ?? 0, 0, 100);
  const perPersonDay = GALLONS_PER_PERSON_DAY * (i.hot ? HOT_MULTIPLIER : 1);
  const peopleGallons = people * perPersonDay * days;
  const extraGallons = extra * days;
  const petGallons = pets * days;
  return {
    people,
    days,
    perPersonDay,
    peopleGallons,
    extraGallons,
    petGallons,
    total: peopleGallons + extraGallons + petGallons,
  };
}

/** Whole containers needed to hold `gallons`. */
export function containersFor(gallons: number, size: number) {
  if (!(gallons > 0) || !(size > 0)) return 0;
  return Math.ceil(gallons / size - 1e-9);
}

/** ISO date `months` after `iso` (YYYY-MM-DD), clamped to the end of shorter months. */
export function addMonths(iso: string, months = REFRESH_MONTHS) {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* Bleach and boiling                                                  */
/* ------------------------------------------------------------------ */

export type BleachStrength = "6" | "8.25";

export interface BleachRow {
  id: string;
  label: string;
  /** Volume in US gallons (1 quart = 0.25 gallon). */
  gallons: number;
  /** Dose exactly as the EPA table prints it, per bleach strength. */
  dose: Record<BleachStrength, string>;
}

/**
 * US EPA, Emergency Disinfection of Drinking Water (updated Feb 24 2026),
 * regular unscented bleach. Copied cell for cell; do not round or extend.
 */
export const EPA_BLEACH_TABLE: BleachRow[] = [
  { id: "1qt", label: "1 quart or liter", gallons: 0.25, dose: { "6": "2 drops", "8.25": "2 drops" } },
  { id: "1gal", label: "1 gallon", gallons: 1, dose: { "6": "8 drops", "8.25": "6 drops" } },
  { id: "2gal", label: "2 gallons", gallons: 2, dose: { "6": "16 drops (1/4 tsp)", "8.25": "12 drops (1/8 teaspoon)" } },
  { id: "4gal", label: "4 gallons", gallons: 4, dose: { "6": "1/3 teaspoon", "8.25": "1/4 teaspoon" } },
  { id: "8gal", label: "8 gallons", gallons: 8, dose: { "6": "2/3 teaspoon", "8.25": "1/2 teaspoon" } },
];

/** EPA: stir and let stand 30 minutes; if there is no slight chlorine smell, dose again and wait 15 more. */
export const BLEACH_WAIT_MIN = 30;
export const BLEACH_REDOSE_WAIT_MIN = 15;
/** EPA: use bleach stored at room temperature for less than one year. */
export const BLEACH_MAX_AGE_YEARS = 1;
/** EPA: 5 drops of 2% tincture of iodine per quart, 10 if cloudy or colored. */
export const IODINE_DROPS_PER_QUART = 5;
/** CDC: 5% to 9% bleach, 40 drops for 5 gallons; 1% bleach, 40 drops per gallon. */
export const CDC_BLEACH_5GAL_DROPS = 40;
export const CDC_1PCT_DROPS_PER_GAL = 40;
/** CDC: 1 teaspoon of unscented bleach per quart of water to sanitize a storage container. */
export const SANITIZE_TSP_PER_QUART = 1;

/** Drops in a "N drops (...)" or "N drops" cell, or null for teaspoon-only cells. */
export function dropsIn(cell: string) {
  const m = cell.match(/^(\d+) drops/);
  return m ? Number(m[1]) : null;
}

/**
 * The EPA dose for a row, doubled for cloudy, colored or very cold water.
 * Teaspoon cells are doubled as written fractions.
 */
export function bleachDose(rowId: string, strength: BleachStrength, cloudyOrCold: boolean) {
  const row = EPA_BLEACH_TABLE.find((r) => r.id === rowId) ?? EPA_BLEACH_TABLE[1];
  const base = row.dose[strength];
  if (!cloudyOrCold) return { row, dose: base, doubled: false };
  const drops = dropsIn(base);
  if (drops != null) return { row, dose: `${drops * 2} drops`, doubled: true };
  const tsp = base.match(/^(\d+)\/(\d+) t/);
  if (tsp) {
    const [n, d] = [Number(tsp[1]) * 2, Number(tsp[2])];
    const g = gcd(n, d);
    const [nn, dd] = [n / g, d / g];
    const whole = Math.floor(nn / dd);
    const rem = nn % dd;
    const text = rem === 0 ? `${whole}` : whole > 0 ? `${whole} ${rem}/${dd}` : `${rem}/${dd}`;
    return { row, dose: `${text} ${nn > dd ? "teaspoons" : "teaspoon"}`, doubled: true };
  }
  return { row, dose: `2 x ${base}`, doubled: true };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** CDC: rolling boil 1 minute; 3 minutes above 6,500 feet. */
export const CDC_BOIL_ALT_FT = 6500;
/** EPA: 3 minutes above 5,000 feet. */
export const EPA_BOIL_ALT_FT = 5000;

/** Boil time by elevation, per CDC, with EPA's lower threshold flagged. */
export function boilMinutes(elevationFt: number) {
  const ft = Number.isFinite(elevationFt) ? elevationFt : 0;
  const cdc = ft > CDC_BOIL_ALT_FT ? 3 : 1;
  const epa = ft > EPA_BOIL_ALT_FT ? 3 : 1;
  return { cdc, epa, agree: cdc === epa };
}

/* ------------------------------------------------------------------ */
/* Filters vs purifiers                                                */
/* ------------------------------------------------------------------ */

/** EPA 1987 Guide Standard log reductions a "purifier" must reach. */
export const PURIFIER_LOG = { bacteria: 6, viruses: 4, cysts: 3 } as const;
export const logToPercent = (log: number) => 100 * (1 - 10 ** -log);

export interface Standard {
  id: string;
  name: string;
  covers: string;
}

export const STANDARDS: Standard[] = [
  { id: "42", name: "NSF/ANSI 42", covers: "Taste and odor only, such as chlorine and particles. Not a health claim." },
  { id: "53", name: "NSF/ANSI 53", covers: "Health contaminants in tap water, such as lead, some chemicals and cysts. Only the contaminants listed for that model." },
  { id: "58", name: "NSF/ANSI 58", covers: "Reverse osmosis systems: dissolved solids and listed contaminants such as arsenic and nitrate." },
  { id: "401", name: "NSF/ANSI 401", covers: "Some emerging contaminants, such as certain drugs and microplastics." },
  { id: "P231", name: "NSF P231", covers: "Microbiological purifiers for water of unknown quality: bacteria, viruses and cysts. Based on the EPA 1987 Guide Standard." },
  { id: "P248", name: "NSF P248", covers: "A US Army and NSF protocol for emergency and field purifiers, with tougher test water." },
];

export type WaterSourceId = "tap-normal" | "boil-notice" | "stored" | "outdoor" | "flood";

export interface WaterSourceAdvice {
  id: WaterSourceId;
  label: string;
  need: string;
  standards: string[];
  detail: string;
}

/** What each source of water needs, per CDC, EPA and the NSF standard scopes above. */
export const WATER_SOURCES: WaterSourceAdvice[] = [
  {
    id: "tap-normal",
    label: "City tap water, no warnings",
    need: "A filter for taste or specific contaminants",
    standards: ["42", "53", "58", "401"],
    detail:
      "Your utility already disinfects it. Pick a filter certified to NSF/ANSI 53 or 58 for the exact contaminant you care about, such as lead. NSF/ANSI 42 alone only improves taste.",
  },
  {
    id: "boil-notice",
    label: "Tap water under a boil-water notice",
    need: "Boil it, or a microbiological purifier",
    standards: ["P231", "P248"],
    detail:
      "Follow the notice. CDC calls boiling the best way to kill germs in water. An ordinary pitcher or fridge filter does not make boil-notice water safe; you need a purifier made for water of unknown quality.",
  },
  {
    id: "stored",
    label: "Water I stored myself",
    need: "Usually nothing, if stored right",
    standards: [],
    detail:
      "Clean tap water in sanitized food-grade containers, kept cool and dark and replaced every 6 months, needs no treatment. If you doubt it, boil it or use bleach as for any other water.",
  },
  {
    id: "outdoor",
    label: "Rain barrel, creek, lake or well of unknown quality",
    need: "A purifier, or boil or bleach after filtering",
    standards: ["P231", "P248"],
    detail:
      "Water of unknown quality can carry viruses as well as bacteria and parasites. CDC says filters alone do not remove viruses, so use a purifier, or filter and then disinfect.",
  },
  {
    id: "flood",
    label: "Floodwater, or anything that may hold fuel or chemicals",
    need: "Do not drink it",
    standards: [],
    detail:
      "CDC: you cannot make water with fuel, toxic chemicals or radioactive material safe by boiling or disinfecting it. Use stored or bottled water and contact your health department.",
  },
];

/* ------------------------------------------------------------------ */
/* Emergency kit (Ready.gov)                                           */
/* ------------------------------------------------------------------ */

export type KitGroup = "basic" | "additional";

export interface KitItem {
  id: string;
  text: string;
  group: KitGroup;
  /** Shown only when the household has this. */
  when?: "infant" | "pet" | "meds";
  /** Quantity scales with people: one per person. */
  perPerson?: boolean;
}

/** Ready.gov "Build a Kit": the basic kit and the additional supplies list, item for item. */
export const READY_KIT: KitItem[] = [
  { id: "water", text: "Water: one gallon per person per day, for drinking and sanitation", group: "basic" },
  { id: "food", text: "Non-perishable food", group: "basic" },
  { id: "radio", text: "Battery-powered or hand-crank radio and a NOAA Weather Radio with tone alert", group: "basic" },
  { id: "flashlight", text: "Flashlight", group: "basic" },
  { id: "first-aid", text: "First aid kit", group: "basic" },
  { id: "batteries", text: "Extra batteries", group: "basic" },
  { id: "whistle", text: "Whistle to signal for help", group: "basic" },
  { id: "dust-mask", text: "Dust mask to help filter contaminated air", group: "basic" },
  { id: "sheeting", text: "Plastic sheeting, scissors and duct tape to shelter in place", group: "basic" },
  { id: "sanitation", text: "Moist towelettes, garbage bags and plastic ties for personal sanitation", group: "basic" },
  { id: "wrench", text: "Wrench or pliers to turn off utilities", group: "basic" },
  { id: "can-opener", text: "Manual can opener for food", group: "basic" },
  { id: "maps", text: "Local maps", group: "basic" },
  { id: "phone", text: "Cell phone with chargers and a backup battery", group: "basic" },
  { id: "soap", text: "Soap, hand sanitizer and disinfecting wipes", group: "additional" },
  { id: "rx", text: "Prescription medications", group: "additional", when: "meds" },
  { id: "otc", text: "Non-prescription medications: pain relievers, anti-diarrhea medication, antacids or laxatives", group: "additional" },
  { id: "glasses", text: "Prescription eyeglasses and contact lens solution", group: "additional" },
  { id: "infant", text: "Infant formula, bottles, diapers, wipes and diaper rash cream", group: "additional", when: "infant" },
  { id: "pet", text: "Pet food and extra water for your pet", group: "additional", when: "pet" },
  { id: "cash", text: "Cash or traveler's checks", group: "additional" },
  { id: "documents", text: "Important family documents (insurance, ID, bank records), saved electronically or in a waterproof container", group: "additional" },
  { id: "sleeping", text: "Sleeping bag or warm blanket", group: "additional", perPerson: true },
  { id: "clothes", text: "Complete change of clothing for your climate, and sturdy shoes", group: "additional", perPerson: true },
  { id: "extinguisher", text: "Fire extinguisher", group: "additional" },
  { id: "matches", text: "Matches in a waterproof container", group: "additional" },
  { id: "hygiene", text: "Feminine supplies and personal hygiene items", group: "additional" },
  { id: "mess", text: "Mess kits, paper cups, plates, paper towels and plastic utensils", group: "additional" },
  { id: "paper", text: "Paper and pencil", group: "additional" },
  { id: "kids", text: "Books, games, puzzles or other activities for children", group: "additional" },
];

export type KitLength = "72h" | "2wk";
export const KIT_DAYS: Record<KitLength, number> = { "72h": MIN_DAYS, "2wk": GOAL_DAYS };

export interface Household {
  people: number;
  infant?: boolean;
  pet?: boolean;
  meds?: boolean;
}

export interface KitLine {
  id: string;
  text: string;
  group: KitGroup;
  qty?: string;
}

/** The Ready.gov list for this household, with quantities where an agency gives one. */
export function buildKit(h: Household, length: KitLength): KitLine[] {
  const people = Math.max(1, Math.round(clampNum(h.people, 1, 50)));
  const days = KIT_DAYS[length];
  return READY_KIT.filter((i) => !i.when || h[i.when]).map((i) => {
    let qty: string | undefined;
    if (i.id === "water") qty = `${people * GALLONS_PER_PERSON_DAY * days} gallons (${people} ${people === 1 ? "person" : "people"} x ${days} days)`;
    else if (i.id === "food") qty = `${days} days for ${people} ${people === 1 ? "person" : "people"}`;
    else if (i.perPerson) qty = `${people}`;
    return { id: i.id, text: i.text, group: i.group, qty };
  });
}

/* ------------------------------------------------------------------ */
/* Food: calories (Dietary Guidelines 2020-2025, Appendix 2)            */
/* ------------------------------------------------------------------ */

export type Sex = "male" | "female";
export type Activity = "sedentary" | "moderate" | "active";

/** [minAge, maxAge, male sed/mod/active, female sed/mod/active]. Table A2-2, ages 2 and older. */
export const CALORIE_TABLE: [number, number, [number, number, number], [number, number, number]][] = [
  [2, 2, [1000, 1000, 1000], [1000, 1000, 1000]],
  [3, 3, [1000, 1400, 1400], [1000, 1200, 1400]],
  [4, 4, [1200, 1400, 1600], [1200, 1400, 1400]],
  [5, 5, [1200, 1400, 1600], [1200, 1400, 1600]],
  [6, 6, [1400, 1600, 1800], [1200, 1400, 1600]],
  [7, 7, [1400, 1600, 1800], [1200, 1600, 1800]],
  [8, 8, [1400, 1600, 2000], [1400, 1600, 1800]],
  [9, 9, [1600, 1800, 2000], [1400, 1600, 1800]],
  [10, 10, [1600, 1800, 2200], [1400, 1800, 2000]],
  [11, 11, [1800, 2000, 2200], [1600, 1800, 2000]],
  [12, 12, [1800, 2200, 2400], [1600, 2000, 2200]],
  [13, 13, [2000, 2200, 2600], [1600, 2000, 2200]],
  [14, 14, [2000, 2400, 2800], [1800, 2000, 2400]],
  [15, 15, [2200, 2600, 3000], [1800, 2000, 2400]],
  [16, 16, [2400, 2800, 3200], [1800, 2000, 2400]],
  [17, 17, [2400, 2800, 3200], [1800, 2000, 2400]],
  [18, 18, [2400, 2800, 3200], [1800, 2000, 2400]],
  [19, 20, [2600, 2800, 3000], [2000, 2200, 2400]],
  [21, 25, [2400, 2800, 3000], [2000, 2200, 2400]],
  [26, 30, [2400, 2600, 3000], [1800, 2000, 2400]],
  [31, 35, [2400, 2600, 3000], [1800, 2000, 2200]],
  [36, 40, [2400, 2600, 2800], [1800, 2000, 2200]],
  [41, 45, [2200, 2600, 2800], [1800, 2000, 2200]],
  [46, 50, [2200, 2400, 2800], [1800, 2000, 2200]],
  [51, 55, [2200, 2400, 2800], [1600, 1800, 2200]],
  [56, 60, [2200, 2400, 2600], [1600, 1800, 2200]],
  [61, 65, [2000, 2400, 2600], [1600, 1800, 2000]],
  [66, 70, [2000, 2200, 2600], [1600, 1800, 2000]],
  [71, 75, [2000, 2200, 2600], [1600, 1800, 2000]],
  [76, 200, [2000, 2200, 2400], [1600, 1800, 2000]],
];

/** Table A2-3: added daily calories in pregnancy and breastfeeding, for a healthy pre-pregnancy weight. */
export const PREGNANCY_EXTRA = {
  none: 0,
  "trimester-1": 0,
  "trimester-2": 340,
  "trimester-3": 452,
  "lactation-1": 330,
  "lactation-2": 400,
} as const;
export type PregnancyStage = keyof typeof PREGNANCY_EXTRA;

const ACTIVITY_INDEX: Record<Activity, 0 | 1 | 2> = { sedentary: 0, moderate: 1, active: 2 };

/** Estimated calories a day for one person aged 2 or older. */
export function caloriesPerDay(age: number, sex: Sex, activity: Activity, stage: PregnancyStage = "none") {
  const a = Math.max(2, Math.floor(Number.isFinite(age) ? age : 2));
  const row = CALORIE_TABLE.find(([lo, hi]) => a >= lo && a <= hi) ?? CALORIE_TABLE[CALORIE_TABLE.length - 1];
  const base = (sex === "male" ? row[2] : row[3])[ACTIVITY_INDEX[activity]];
  const extra = sex === "female" ? PREGNANCY_EXTRA[stage] : 0;
  return base + extra;
}

export interface FoodPerson {
  age: number;
  sex: Sex;
  stage?: PregnancyStage;
}

/** Household calories for `days`. */
export function foodNeeded(people: FoodPerson[], days: number, activity: Activity) {
  const d = Math.round(clampNum(days, 1, 365));
  const perDay = people.map((p) => caloriesPerDay(p.age, p.sex, activity, p.stage));
  const daily = perDay.reduce((s, n) => s + n, 0);
  return { days: d, perDay, daily, total: daily * d };
}

/** How long a kit's real calories last this household, and its cost per 1,000 calories. */
export function compareKit(kitCalories: number, priceUsd: number, householdDaily: number) {
  const cal = Number.isFinite(kitCalories) && kitCalories > 0 ? kitCalories : 0;
  const price = Number.isFinite(priceUsd) && priceUsd > 0 ? priceUsd : 0;
  return {
    days: householdDaily > 0 ? cal / householdDaily : 0,
    usdPer1000: cal > 0 && price > 0 ? (price / cal) * 1000 : null,
  };
}

/* ------------------------------------------------------------------ */
/* NOAA Weather Radio                                                  */
/* ------------------------------------------------------------------ */

/** NWS: the seven NOAA Weather Radio frequencies, MHz. */
export const NWR_FREQUENCIES_MHZ = ["162.400", "162.425", "162.450", "162.475", "162.500", "162.525", "162.550"];
/** NWS: "more than 1000 transmitters". */
export const NWR_TRANSMITTERS = 1000;
/** NWS SAME help line, voice menu or text "Go". */
export const NWR_SAME_PHONE = "1-888-NWR-SAME (1-888-697-7263)";

export const nwrStationsUrl = (abbr: string) => `https://www.weather.gov/nwr/stations?State=${encodeURIComponent(abbr)}`;
export const nwrCountyUrl = (abbr: string) => `https://www.weather.gov/nwr/county_coverage?State=${encodeURIComponent(abbr)}`;

/** Related links shared by every prep page (power pages are built separately). */
export const PREP_LINKS = [
  { href: "/emergency-water-storage-calculator", label: "Emergency water storage calculator", desc: "Gallons, containers and a refresh date for your household" },
  { href: "/how-to-purify-water", label: "How to purify water", desc: "Bleach drops by strength and boil time by elevation" },
  { href: "/best-emergency-water-filters", label: "Emergency water filters", desc: "Ranked by certification, not hype" },
  { href: "/emergency-kit-checklist", label: "Emergency kit checklist", desc: "A printable 72-hour and 2-week home kit" },
  { href: "/emergency-food-calculator", label: "Emergency food calculator", desc: "Calories your household needs, not servings" },
  { href: "/noaa-weather-radio", label: "NOAA Weather Radio guide", desc: "Find your station, frequency and SAME code" },
  { href: "/power-outage-backup-calculator", label: "Power outage backup calculator", desc: "Battery size for the fridge, CPAP and furnace" },
  { href: "/generator-runtime-calculator", label: "Generator runtime calculator", desc: "Hours per tank and fuel to store" },
  { href: "/off-grid-solar-calculator", label: "Off-grid solar calculator", desc: "Panels and batteries sized for winter" },
  { href: "/off-grid-cabin-solar-kit", label: "Off-grid cabin solar kits", desc: "What size kit a cabin needs" },
  { href: "/how-to-go-off-grid", label: "How to go off grid", desc: "Costs and sizing, start to finish" },
];

/** Every related link except the page's own. */
export const prepLinksFor = (path: string) => PREP_LINKS.filter((l) => l.href !== path);

export const CAMPER_VOLTS_URL = "https://campervolts.com";
