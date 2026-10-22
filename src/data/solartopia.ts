/**
 * Solartopia: the single source for the game AND the article on /solartopia.
 *
 * RULES (enforced by tests/solartopia-data.test.ts):
 *   - Every fact has a source, an https url, published and retrieved dates.
 *   - `verified: true` only when the source page was fetched and showed the
 *     exact figure in `text`. A fact with verified:false fails the build.
 *   - The player never sees kWh or raw units. Crates, not dollars.
 *
 * Fact check log (retrieved 2026-10-22, each page or PDF fetched and read):
 *   - access: World Bank page for Tracking SDG 7 (2025). The esmap.org site is
 *     behind a bot wall (403), so the World Bank copy of the same report is
 *     cited. It says 666 million, and 85% of them in sub-Saharan Africa.
 *   - water: the brief said 2.2 billion (2022). The 2025 WHO/UNICEF release
 *     says "1 in 4 - or 2.1 billion people globally - still lack access to
 *     safely managed drinking water", so the figure was updated to that.
 *   - hours: UNICEF press release, 29 August 2016: "the 200 million hours women
 *     and girls spend every day collecting water".
 *   - health: WHO news item, 14 Jan 2023: headline "Close to one billion
 *     people globally are served by health-care facilities with no electricity
 *     access or with unreliable electricity".
 *   - fridge: UNICEF Innovation: energy "stored in ice instead of in batteries",
 *     "At night, the ice compartment keeps the vaccines at the required
 *     temperature".
 *   - internet: UNICEF/ITU release, 1 Dec 2020: "Two thirds of the world's
 *     school-age children - or 1.3 billion children aged 3 to 17 years old -
 *     do not have internet connection in their homes".
 *   - irrigation: the brief's fao.org/land-water page has no such figure. FAO
 *     "Crops and Drops" says "some 20 percent of agricultural land in the
 *     developing countries is irrigated" and irrigation "provides about 40
 *     percent of crop production in these countries". Wording narrowed to
 *     developing countries to match. The page carries no date; the booklet is
 *     FAO 2002 (publication year not printed on the page we read).
 *   - shenzhen: WRI, 4 Apr 2018: Shenzhen announced "all of its 16,359 buses
 *     had gone electric" at the end of 2017.
 *   - air: WHO fact sheet (24 Oct 2024): "In 2019, 99% of the world's
 *     population was living in places where the WHO air quality guidelines
 *     levels were not met."
 *   - sun: the brief's energy.gov/eere page no longer carries the line. The DOE
 *     "Test Your Solar IQ" page says "Enough sunlight hits the Earth's surface
 *     in 1 1/2 hours to power the entire world's electricity consumption for a
 *     year". It is the same claim in DOE's wording (electricity, not all energy).
 *   - cost: IRENA Renewable Power Generation Costs in 2023, executive summary
 *     PDF table: utility-scale solar PV LCOE USD 0.460/kWh (2010) to
 *     USD 0.044/kWh (2023), change -90%. The irena.org page itself blocks bots.
 *   - cheaper: same PDF, "solar PV cost 56% less than the least-cost weighted
 *     average fossil fuel-fired solution" in 2023.
 *   - batteries: same PDF, battery storage project costs "declined 89%" from
 *     USD 2,511/kWh to USD 273/kWh between 2010 and 2023.
 *   - Dates: the FAO and DOE pages print no date, so they are marked "undated".
 *     The FAO booklet is old (its text says world population "6 000 million"),
 *     and the fact text says so. The UNICEF fridge page is dated 19 November 2015.
 *   - share: Ember Global Electricity Review 2025: "solar (6.9%)" of 2024
 *     global electricity.
 */

import type { BrandId } from "@/data/affiliates";

export const RETRIEVED = "2026-10-22";

export interface Fact {
  id: string;
  /** Short source name for links. */
  short: string;
  /** The sentence shown in the game and the article. */
  text: string;
  source: string;
  url: string;
  /** YYYY-MM-DD, or "undated" when the page prints no date. Never an invented day. */
  published: string;
  retrieved: string;
  verified: boolean;
}

const fact = (f: Omit<Fact, "retrieved">): Fact => ({ ...f, retrieved: RETRIEVED });

export const FACTS = {
  access: fact({
    id: "access",
    short: "World Bank, Tracking SDG 7",
    text: "About 666 million people had no electricity in 2023, and 85% of them live in sub-Saharan Africa.",
    source: "Tracking SDG 7: The Energy Progress Report 2025 (IEA, IRENA, UN Statistics Division, World Bank, WHO)",
    url: "https://www.worldbank.org/en/topic/energy/publication/tracking-sdg-7-the-energy-progress-report-2025",
    published: "2025-06-20",
    verified: true,
  }),
  water: fact({
    id: "water",
    short: "WHO and UNICEF",
    text: "2.1 billion people still lack safely managed drinking water.",
    source: "WHO/UNICEF Joint Monitoring Programme, news release",
    url: "https://www.who.int/news/item/26-08-2025-1-in-4-people-globally-still-lack-access-to-safe-drinking-water---who--unicef",
    published: "2025-08-26",
    verified: true,
  }),
  hours: fact({
    id: "hours",
    short: "UNICEF",
    text: "Women and girls spend around 200 million hours every day collecting water.",
    source: "UNICEF press release",
    url: "https://www.unicef.org/press-releases/unicef-collecting-water-often-colossal-waste-time-women-and-girls",
    published: "2016-08-29",
    verified: true,
  }),
  health: fact({
    id: "health",
    short: "WHO",
    text: "Close to one billion people are served by health-care facilities with no electricity or with unreliable electricity.",
    source: "WHO, World Bank, IRENA and SEforALL, Energizing Health (WHO news item)",
    url: "https://www.who.int/news/item/14-01-2023-close-to-one-billion-people-globally-are-served-by-health-care-facilities-with-no-electricity-access-or-with-unreliable-electricity",
    published: "2023-01-14",
    verified: true,
  }),
  fridge: fact({
    id: "fridge",
    short: "UNICEF",
    text: "Solar vaccine fridges store the sun's energy as ice instead of in batteries, so the ice keeps the vaccines at the right temperature at night.",
    source: "UNICEF Innovation, Using the Sun to Keep Vaccines Cool",
    url: "https://www.unicef.org/innovation/stories/using-sun-keep-vaccines-cool",
    published: "2015-11-19",
    verified: true,
  }),
  internet: fact({
    id: "internet",
    short: "UNICEF and ITU",
    text: "Two thirds of the world's school-age children, 1.3 billion aged 3 to 17, have no internet connection at home.",
    source: "UNICEF and ITU, press release",
    url: "https://www.unicef.org/press-releases/two-thirds-worlds-school-age-children-have-no-internet-access-home-new-unicef-itu",
    published: "2020-12-01",
    verified: true,
  }),
  irrigation: fact({
    id: "irrigation",
    short: "FAO",
    text: "An older FAO estimate: about 20 percent of farmland in developing countries is irrigated, and it provides about 40 percent of their crop production.",
    source: "FAO, Crops and Drops: making the best use of water for agriculture",
    url: "https://www.fao.org/4/y3918e/y3918e07.htm",
    published: "undated",
    verified: true,
  }),
  shenzhen: fact({
    id: "shenzhen",
    short: "World Resources Institute",
    text: "Shenzhen announced at the end of 2017 that all of its 16,359 buses had gone electric.",
    source: "World Resources Institute, How did Shenzhen build the world's largest electric bus fleet?",
    url: "https://www.wri.org/insights/how-did-shenzhen-china-build-worlds-largest-electric-bus-fleet",
    published: "2018-04-04",
    verified: true,
  }),
  air: fact({
    id: "air",
    short: "WHO",
    text: "In 2019, 99% of the world's people lived in places where the WHO air quality guidelines were not met.",
    source: "WHO fact sheet, Ambient (outdoor) air quality and health",
    url: "https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health",
    published: "2024-10-24",
    verified: true,
  }),
  sun: fact({
    id: "sun",
    short: "US Department of Energy",
    text: "Enough sunlight hits the Earth's surface in about an hour and a half to power the world's electricity use for a year.",
    source: "US Department of Energy, Quiz: Test Your Solar IQ",
    url: "https://www.energy.gov/articles/quiz-test-your-solar-iq",
    published: "undated",
    verified: true,
  }),
  cost: fact({
    id: "cost",
    short: "IRENA",
    text: "The cost of electricity from new utility-scale solar fell 90% between 2010 and 2023.",
    source: "IRENA, Renewable Power Generation Costs in 2023, executive summary",
    url: "https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2024/Sep/IRENA_Renewable_power_generation_costs_in_2023_executive_summary.pdf",
    published: "2024-09-01",
    verified: true,
  }),
  cheaper: fact({
    id: "cheaper",
    short: "IRENA",
    text: "In 2023, new utility-scale solar cost 56% less than the least-cost new fossil-fuel option, on IRENA's weighted average.",
    source: "IRENA, Renewable Power Generation Costs in 2023, executive summary",
    url: "https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2024/Sep/IRENA_Renewable_power_generation_costs_in_2023_executive_summary.pdf",
    published: "2024-09-01",
    verified: true,
  }),
  batteries: fact({
    id: "batteries",
    short: "IRENA",
    text: "The cost of battery storage projects fell 89% between 2010 and 2023.",
    source: "IRENA, Renewable Power Generation Costs in 2023, executive summary",
    url: "https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2024/Sep/IRENA_Renewable_power_generation_costs_in_2023_executive_summary.pdf",
    published: "2024-09-01",
    verified: true,
  }),
  share: fact({
    id: "share",
    short: "Ember",
    text: "Solar made about 7% of the world's electricity in 2024 (6.9%).",
    source: "Ember, Global Electricity Review 2025",
    url: "https://ember-energy.org/latest-insights/global-electricity-review-2025/",
    published: "2025-04-08",
    verified: true,
  }),
} satisfies Record<string, Fact>;

export type FactId = keyof typeof FACTS;

/* ------------------------------------------------------------------ */
/* Sim constants                                                       */
/* ------------------------------------------------------------------ */

export type JobId = "pump" | "fridge" | "school" | "lights" | "irrigation" | "bus";

export interface Job {
  id: JobId;
  label: string;
  kind: "flex" | "fixed";
  /** Units drawn per game hour at full rate. */
  draw: number;
  /** Flexible: units that must be delivered. */
  need?: number;
  /** Flexible: game hour (6..30) by which `need` must be delivered. */
  deadline?: number;
  /** Fixed: hours of the day (0..24) the job runs, null = always. */
  window: [number, number] | null;
}

export const JOBS: Record<JobId, Job> = {
  pump: { id: "pump", label: "Water pump", kind: "flex", draw: 2, need: 8, deadline: 18, window: null },
  fridge: { id: "fridge", label: "Clinic fridge", kind: "fixed", draw: 0.4, window: null },
  school: { id: "school", label: "School", kind: "fixed", draw: 0.5, window: [9, 15] },
  lights: { id: "lights", label: "Evening study lights", kind: "fixed", draw: 1, window: [18, 21] },
  irrigation: { id: "irrigation", label: "Irrigation", kind: "flex", draw: 3, need: 9, deadline: 18, window: null },
  bus: { id: "bus", label: "Bus depot", kind: "flex", draw: 4, need: 12, deadline: 30, window: null },
};

export const SIM = {
  startHour: 6,
  endHour: 30,
  stepsPerHour: 10,
  batteryUnits: 8,
  roundTrip: 0.9,
  shade: 0.5,
  cloud: 0.25,
  breakerFloor: 0.15,
  threeStarBattery: 0.25,
  fridgeGraceHours: 3,
  panelCost: 1,
  batteryCost: 2,
  /** Real seconds per game hour: daylight 06-18, night 18-06. */
  secondsPerHourDay: 1.25,
  secondsPerHourNight: 0.75,
  /** Recommended plan must use no more than this share of panel energy. */
  marginRule: 0.75,
  /** ...and at least this much, so the build is not wildly oversized. */
  marginFloor: 0.5,
  day1ThreeStarBy: 13,
} as const;

/* ------------------------------------------------------------------ */
/* Map: 30 slots on a grid of cells                                    */
/* ------------------------------------------------------------------ */

export type Chapter = "village" | "town" | "city";
export type SlotKind = "roof" | "ground" | "field";

export interface Slot {
  id: string;
  kind: SlotKind;
  chapter: Chapter;
  /** Grid cell: column 0..6, row 0..5. */
  c: number;
  r: number;
  /** Half sun (tree shadow). */
  shaded?: boolean;
}

export const SLOTS: Slot[] = [
  // Village: 6 roofs (2 shaded by the mango tree) + 4 ground
  { id: "v1", kind: "roof", chapter: "village", c: 0, r: 2 },
  { id: "v2", kind: "roof", chapter: "village", c: 1, r: 2, shaded: true },
  { id: "v3", kind: "roof", chapter: "village", c: 3, r: 2, shaded: true },
  { id: "v4", kind: "roof", chapter: "village", c: 0, r: 3 },
  { id: "v5", kind: "roof", chapter: "village", c: 2, r: 3 },
  { id: "v6", kind: "roof", chapter: "village", c: 3, r: 3 },
  { id: "g1", kind: "ground", chapter: "village", c: 0, r: 4 },
  { id: "g2", kind: "ground", chapter: "village", c: 1, r: 4 },
  { id: "g3", kind: "ground", chapter: "village", c: 3, r: 4 },
  { id: "g4", kind: "ground", chapter: "village", c: 1, r: 5 },
  // Town: 8 solar-field slots
  { id: "t1", kind: "field", chapter: "town", c: 4, r: 2 },
  { id: "t2", kind: "field", chapter: "town", c: 5, r: 2 },
  { id: "t3", kind: "field", chapter: "town", c: 6, r: 2 },
  { id: "t4", kind: "field", chapter: "town", c: 4, r: 3 },
  { id: "t5", kind: "field", chapter: "town", c: 5, r: 3 },
  { id: "t6", kind: "field", chapter: "town", c: 4, r: 4 },
  { id: "t7", kind: "field", chapter: "town", c: 5, r: 4 },
  { id: "t8", kind: "field", chapter: "town", c: 4, r: 5 },
  // City: 10 rooftops + 2 ground
  { id: "c1", kind: "roof", chapter: "city", c: 0, r: 0 },
  { id: "c2", kind: "roof", chapter: "city", c: 1, r: 0 },
  { id: "c3", kind: "roof", chapter: "city", c: 2, r: 0 },
  { id: "c4", kind: "roof", chapter: "city", c: 3, r: 0 },
  { id: "c5", kind: "roof", chapter: "city", c: 4, r: 0 },
  { id: "c6", kind: "roof", chapter: "city", c: 0, r: 1 },
  { id: "c7", kind: "roof", chapter: "city", c: 1, r: 1 },
  { id: "c8", kind: "roof", chapter: "city", c: 2, r: 1 },
  { id: "c9", kind: "roof", chapter: "city", c: 3, r: 1 },
  { id: "c10", kind: "roof", chapter: "city", c: 4, r: 1 },
  { id: "p1", kind: "ground", chapter: "city", c: 5, r: 0 },
  { id: "p2", kind: "ground", chapter: "city", c: 5, r: 1 },
];

export const SLOT_BY_ID: Record<string, Slot> = Object.fromEntries(SLOTS.map((s) => [s.id, s]));

/** Where the flexible buildings and landmarks stand (grid cells). */
export const BUILDINGS = {
  pump: { c: 1, r: 3 },
  clinic: { c: 2, r: 4 },
  school: { c: 3, r: 5 },
  irrigation: { c: 6, r: 3 },
  depot: { c: 6, r: 1 },
} as const;

/* ------------------------------------------------------------------ */
/* Days                                                                */
/* ------------------------------------------------------------------ */

export interface CloudBank {
  /** Grid columns under the cloud. */
  cols: number[];
  start: number;
  end: number;
  label: string;
}

export interface Day {
  n: 1 | 2 | 3 | 4 | 5;
  chapter: Chapter;
  place: string;
  population: string;
  title: string;
  /** Crates handed out on this day (added to what is already owned). */
  newCrates: number;
  /** Total crates owned on this day. */
  crates: number;
  /** Jar charge at 06:00 as a fraction of full (the jar starts days 3-5 only a quarter full). */
  startCharge: number;
  jobs: JobId[];
  villager: { name: string; role: string; line: string; look: { skin: string; hair: string; shirt: string; extra: "hat" | "glasses" | "scarf" | "cap" | "headwrap" } };
  goal: string;
  win: string;
  tip: string;
  main: FactId;
  behind: FactId;
  cloud?: CloudBank;
  /** Earlier deadlines (game hour) than the job default, from day 3 on. */
  deadlines?: Partial<Record<JobId, number>>;
  /** Shown on the forecast strip during Build. */
  forecast: string;
}

export const DAYS: Day[] = [
  {
    n: 1,
    chapter: "village",
    place: "A village of 1,200 people",
    population: "1,200",
    title: "Water",
    newCrates: 4,
    crates: 4,
    startCharge: 0.5,
    jobs: ["pump"],
    villager: {
      name: "Joseph",
      role: "Well keeper",
      line: "The well is deep and the walk is long. Put up some panels, then switch on the pump while the sun is high. The tank holds a day of water for all of us.",
      look: { skin: "#8a5a3c", hair: "#2a1d1a", shirt: "#c8734b", extra: "hat" },
    },
    goal: "Fill the tank by evening.",
    win: "The tank is full. Nobody walks for water today.",
    tip: "Two of the roofs sit in the mango tree's shade and make half as much. Start the pump early, while the sun is climbing.",
    main: "water",
    behind: "hours",
    forecast: "Clear skies all day.",
  },
  {
    n: 2,
    chapter: "village",
    place: "A village of 1,200 people",
    population: "1,200",
    title: "The clinic fridge",
    newCrates: 4,
    crates: 8,
    startCharge: 0.5,
    jobs: ["pump", "fridge"],
    villager: {
      name: "Nurse Amara",
      role: "Village nurse",
      line: "The vaccines must stay cold all night, every night. The fridge never rests. A battery jar keeps it humming after the sun goes down.",
      look: { skin: "#6b4430", hair: "#1c1514", shirt: "#e9d3a6", extra: "headwrap" },
    },
    goal: "Keep the clinic fridge cold all night, and fill the tank.",
    win: "The vaccines stayed cold all night.",
    tip: "A battery jar stores the day's sun. Run the heavy jobs while the sun is strong, and leave the jar for tonight.",
    main: "health",
    behind: "fridge",
    forecast: "Clear skies all day.",
  },
  {
    n: 3,
    chapter: "village",
    place: "A village of 1,200 people",
    population: "1,200",
    title: "The school",
    newCrates: 2,
    crates: 10,
    startCharge: 0.25,
    jobs: ["pump", "fridge", "school", "lights"],
    villager: {
      name: "Mr. Tembo",
      role: "Teacher",
      line: "The laptops run from nine to three, and the children study here after dark. The school has to be powered at those hours. Fill the tank by three, and save some sun for the evening.",
      look: { skin: "#7a4e36", hair: "#26201e", shirt: "#2d5d8c", extra: "glasses" },
    },
    goal: "Fill the tank by 3 pm, keep the school and the evening lights on, and keep the fridge cold.",
    deadlines: { pump: 15 },
    win: "School stays open after dark, and it's online.",
    tip: "The school and the evening lights run on a fixed schedule. The jar has to be full by sunset to carry them, and the fridge, through the night.",
    main: "internet",
    behind: "internet",
    cloud: { cols: [0], start: 14, end: 16, label: "A small cloud passes over the west edge from 2 pm to 4 pm." },
    forecast: "A small cloud passes over the west edge from 2 pm to 4 pm.",
  },
  {
    n: 4,
    chapter: "town",
    place: "A town of 12,000 people",
    population: "12,000",
    title: "Fields",
    newCrates: 2,
    crates: 12,
    startCharge: 0.25,
    jobs: ["pump", "fridge", "school", "lights", "irrigation"],
    villager: {
      name: "Grace",
      role: "Farmer",
      line: "The dry season is long. If the fields drink before evening, the market will be full by the weekend. Watch the sky this afternoon, a cloud is coming.",
      look: { skin: "#9a6a48", hair: "#33241f", shirt: "#15803d", extra: "scarf" },
    },
    goal: "Fill the tank by 3 pm, water the fields by 4 pm, and keep everything else running through the cloud.",
    deadlines: { pump: 15, irrigation: 16 },
    win: "Fields watered in the dry season. The market is full.",
    tip: "Irrigation takes a lot of power. Run it in the morning, before the afternoon cloud covers the left side of town.",
    main: "irrigation",
    behind: "irrigation",
    cloud: { cols: [0, 1, 2], start: 13, end: 16, label: "A cloud bank covers the left side of town from 1 pm to 4 pm." },
    forecast: "A cloud bank covers the left side of town from 1 pm to 4 pm.",
  },
  {
    n: 5,
    chapter: "city",
    place: "A city of 400,000 people",
    population: "400,000",
    title: "Electric buses",
    newCrates: 4,
    crates: 16,
    startCharge: 0.25,
    jobs: ["pump", "fridge", "school", "lights", "irrigation", "bus"],
    villager: {
      name: "Lindiwe",
      role: "Bus driver",
      line: "Twelve buses are waiting at the depot. Charge them in the sun. If they charge at midnight, they drink the whole jar and the morning comes up dark.",
      look: { skin: "#7d523a", hair: "#1e1816", shirt: "#f5b700", extra: "cap" },
    },
    goal: "Tank by 3 pm, fields by 4 pm, buses by morning, and the jar not drained.",
    deadlines: { pump: 15, irrigation: 16 },
    win: "Clean air on the morning commute.",
    tip: "Buses need a lot of power. Charge them while the sun is high, and leave the jar at least a quarter full at sunrise.",
    main: "shenzhen",
    behind: "air",
    cloud: { cols: [4, 5, 6], start: 10, end: 11.5, label: "A cloud bank covers the right side of the city from 10 am to 11:30 am." },
    forecast: "A cloud bank covers the right side of the city from 10 am to 11:30 am.",
  },
];

/** Failure lines per job. `p` is progress 0..1 (or hours dark for fixed jobs). */
export const FAIL_LINES = {
  pump: (p: number) =>
    `The tank filled ${p < 0.2 ? "only a little" : p < 0.65 ? "about halfway" : "most of the way"}. About ${Math.round((1200 * (1 - p)) / 100) * 100} people walk for water tomorrow.`,
  irrigation: (p: number) => `The fields got ${Math.round(p * 100)}% of their water. Part of the harvest dries out.`,
  bus: (p: number) => `The buses charged ${Math.round(p * 100)}%. Some routes run on diesel tomorrow.`,
  fridge: (h: number) => `The vaccine fridge went warm for about ${Math.max(1, Math.round(h))} hours. The nurse has to throw some vaccines away.`,
  school: (h: number) => `The school lost power for about ${Math.max(1, Math.round(h))} hours, and the lessons stopped.`,
  lights: (h: number) => `The study lights went out for about ${Math.max(1, Math.round(h))} hours. The children went home early.`,
} as const;

/** Game hour by which a flexible job must be done on a given day. */
export const deadlineOf = (day: number, id: JobId) => DAYS[day - 1].deadlines?.[id] ?? JOBS[id].deadline ?? 30;

export const BREAKER_LINE = "Breaker saved the clinic's power.";

/* ------------------------------------------------------------------ */
/* Finale and the home ending                                          */
/* ------------------------------------------------------------------ */

export const FINALE_FACTS: FactId[] = ["sun", "cost", "share"];
export const FINALE_HONEST =
  "Honest line: solar made about 7% of the world's electricity in 2024. Nights and winters still need batteries, wind, water and grids.";

export type Goal = "bill" | "outage" | "drive";
export const GOALS: { id: Goal; label: string; note: string }[] = [
  { id: "bill", label: "A smaller bill", note: "Panels that plug in" },
  { id: "outage", label: "Lights on when the grid goes down", note: "A battery for the house" },
  { id: "drive", label: "Cheaper driving", note: "Charge a car at home" },
];

export const CREDIT_ENDED = "The 30% federal tax credit for home solar and batteries has ended.";

/** Affiliate pick per goal; the cards are rendered on the server from products.ts. */
export const GOAL_PICK: Partial<Record<Goal, { brand: BrandId; productId: string }>> = {
  outage: { brand: "bluetti", productId: "bluetti-elite-200-v2" },
  drive: { brand: "lectron", productId: "lectron-nexus-j1772" },
};

export const GOAL_LINKS: Record<Goal, { primary: { href: string; label: string }; more: { href: string; label: string }[] }> = {
  bill: {
    primary: { href: "/plug-in-solar", label: "See plug-in solar for your state" },
    more: [
      { href: "/solar-calculator", label: "Solar panel calculator" },
      { href: "/solar-finder", label: "Solar installer finder" },
    ],
  },
  outage: {
    primary: { href: "/battery-calculator", label: "Size a battery for your home" },
    more: [
      { href: "/home-battery-backup", label: "Home battery backup" },
      { href: "/best-portable-power-stations", label: "Best portable power stations" },
    ],
  },
  drive: {
    primary: { href: "/go-electric", label: "See what going electric saves" },
    more: [
      { href: "/ev-charging-cost", label: "EV charging cost" },
      { href: "/best-home-ev-charger", label: "Best home EV charger" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Share                                                               */
/* ------------------------------------------------------------------ */

export const SHARE_PATH = "/solartopia/r";
export const MAX_STARS = 15;

/* ------------------------------------------------------------------ */
/* SEO page                                                            */
/* ------------------------------------------------------------------ */

export const PAGE = {
  path: "/solartopia",
  title: "Solartopia: A Free 5-Minute Solar Power Game",
  description:
    "Light a dark village with solar panels and batteries: clean water, a clinic, a school, food and electric buses. Real facts from WHO, UNICEF and IRENA, then see what sunshine could save your home.",
  h1: "Solartopia: what solar power makes possible",
  updated: "2026-10-22",
};

export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: string[];
  facts?: FactId[];
}

export const ARTICLE: ArticleSection[] = [
  {
    id: "water",
    heading: "Water",
    paragraphs: [
      "In the first level of Solartopia you light a village of 1,200 people with four crates of solar panels, and you decide when to run the water pump. The real problem behind it is large. About 666 million people had no electricity in 2023, and most of them live in sub-Saharan Africa. Without power there is often no pump, and without a pump someone walks to the water.",
      "Solar panels suit a pump well, because a pump does not mind when it runs. It can fill a tank at noon, when the sun is strongest, and the village drinks from the tank all day. That is why the game asks you to time it.",
    ],
    facts: ["access", "water", "hours"],
  },
  {
    id: "health",
    heading: "Health",
    paragraphs: [
      "Day two is a clinic fridge. Vaccines must stay cold around the clock, so the fridge is a job that cannot wait for the sun. In the game you solve it with a battery jar.",
      "Solar vaccine fridges use a neat trick: they store the sun's energy as ice, and the ice keeps the vaccines cold through the night. The game gives you a battery jar instead, because a jar is easier to see. The wider problem is still big: many clinics have power that cuts out, or no power at all.",
    ],
    facts: ["health", "fridge"],
  },
  {
    id: "school",
    heading: "School",
    paragraphs: [
      "Day three is a school with laptops and an internet link from nine to three, and evening study lights from six to nine. These jobs run on a fixed schedule, so the sun alone cannot carry them. You need two battery jars, and the jars need to be full by sunset.",
      "A school with power and a connection can give a child a place to get online when there is none at home. That is why the game treats school hours as a promise: the power has to be there at nine, and again after dark.",
    ],
    facts: ["internet"],
  },
  {
    id: "food",
    heading: "Food",
    paragraphs: [
      "Day four moves to a town of 12,000 people and a field that needs watering. Irrigation draws a lot of power, and in the game a cloud bank drifts across the left half of the map at midafternoon. You learn to water in the morning and leave the afternoon for the jar.",
      "Irrigation matters because watered land grows much more than its share of the farmland. The figure we use comes from an older FAO booklet, so treat it as a rough guide, not a current count. A pump that runs on sunlight only needs the sun to be up, so the game asks you to do the watering while it is.",
    ],
    facts: ["irrigation"],
  },
  {
    id: "transport",
    heading: "Getting around",
    paragraphs: [
      "The last level is a city of 400,000 people and a depot of electric buses. Each bus needs far more power than a pump, so charging time is the whole puzzle. Charge them at noon and the jar stays full. Charge them at midnight and the jar runs dry before morning, which is the trap.",
      "Real cities have done this at scale. Electric buses also take the exhaust out of the street, which matters because almost everyone breathes air that is dirtier than the World Health Organization recommends.",
    ],
    facts: ["shenzhen", "air"],
  },
  {
    id: "cost",
    heading: "Why solar is now the cheapest power we've built",
    paragraphs: [
      "The reason Solartopia is even possible is price. New solar farms now produce electricity at a fraction of their cost in 2010, and in 2023 IRENA found they cost 56% less than the least-cost new fossil-fuel option, on a weighted average. Batteries followed the same curve, which is what lets solar power the night too.",
      "Cheaper panels and batteries are why a village can afford four crates of panels in the first place. They are also why the game gives you more crates each day.",
    ],
    facts: ["cost", "cheaper", "batteries", "sun"],
  },
  {
    id: "limits",
    heading: "What solar can't do yet",
    paragraphs: [
      "Solar is not the whole answer. It made about 7% of the world's electricity in 2024. It makes nothing at night, and less in winter and under clouds. The rest of the grid still has to cover those hours with batteries, wind, hydropower and strong power lines.",
      "That is why, from day two on, the game needs a battery jar as well as panels. You have to work with the sun, and with the jar. Real grids do the same, at a much larger scale.",
    ],
    facts: ["share"],
  },
  {
    id: "home",
    heading: "Bring it home",
    paragraphs: [
      "At the end of the game you choose a state and a goal for your own home: a smaller bill, lights on when the grid goes down, or driving on sunshine. Rates, sun and rules differ a lot by state, so the figures come from our state data. You can also open the state pages directly, or use the solar, battery and EV calculators.",
    ],
  },
  {
    id: "how",
    heading: "How the game works and what we simplified",
    paragraphs: [
      "The sun follows a smooth daytime curve: nothing at night, a peak at noon. A panel in the shade of the mango tree makes half as much, and a panel under a cloud makes a quarter. A battery jar returns 90% of what you put in, so a little is lost each time. The jar starts the first two days half full and the last three a quarter full, so you leave it as full as you found it. A breaker switches the flexible jobs off if the jar runs low, to protect the clinic.",
      "We simplified on purpose. You get crates, not dollars, because real prices differ by place and year. Every panel is the same size, every job draws a steady amount, each day is 24 game hours that last about 24 seconds, and from day three the tank has to be full by 3 pm. The facts are real and linked below, but the game is a model, not a design tool for a real village.",
    ],
  },
];

export const ARTICLE_FACT_ORDER: FactId[] = [
  "access", "water", "hours", "health", "fridge", "internet", "irrigation", "shenzhen", "air", "sun", "cost", "cheaper", "batteries", "share",
];

// An unverified fact fails the build (and every test that imports this file).
for (const f of Object.values(FACTS)) {
  if (!f.verified) throw new Error(`Solartopia fact "${f.id}" is not verified. Fetch its source and confirm the figure first.`);
}
