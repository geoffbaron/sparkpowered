// Section landing pages: one per main nav group. Each one answers "what are
// you trying to do?" and sends the reader to the guide or calculator that does it.
// Copy here states no new facts or figures; numbers live on the pages linked to.

import type { Goal } from "@/components/IWantTo";
import type { ImageKey } from "@/data/images";

export type HubId = "cars" | "home" | "outdoors" | "offgrid" | "learn";

export interface HubLink {
  href: string;
  title: string;
  desc: string;
  kind: "Calculator" | "Picker" | "Guide" | "Comparison" | "Checklist" | "Hub" | "Data" | "Game";
}

export interface HubGroup {
  heading: string;
  blurb: string;
  links: HubLink[];
}

export interface Hub {
  id: HubId;
  path: string;
  /** Short name for breadcrumbs and cards. */
  name: string;
  title: string;
  description: string;
  image: ImageKey;
  eyebrow: string;
  h1: string;
  h1Accent: string;
  sub: string;
  /** Next steps shown in this section's "I want to..." picker: a few, each to one tool. */
  goals: Goal[];
  /** The one tool most visitors should start with. */
  start: { href: string; label: string; why: string };
  /** One product pick from an approved partner, shown under the start card. Facts come from the product record. */
  pick?: { productId: string; label: string; why: string };
  intro: string[];
  groups: HubGroup[];
  /** Question topics from /questions whose answers fit this section. */
  questionTopics?: string[];
  /** Question ids to leave out of those topics. */
  skipQuestions?: string[];
  /** Questions answered by a page here rather than on /questions. */
  pageQuestions?: { q: string; href: string; answeredBy: string }[];
  updated: string;
}

const UPDATED = "2026-11-02";

export const HUBS: Hub[] = [
  {
    id: "cars",
    path: "/electric-vehicles",
    name: "Electric cars & e-bikes",
    title: "Electric Cars, Home Chargers and E-Bikes: Costs and Picks",
    description:
      "Which electric car fits your budget and commute, whether an EV or plug-in hybrid suits how you drive, what home charging costs in your state, which Level 2 charger to buy and what install costs. Plus e-bikes for short trips.",
    image: "ev",
    eyebrow: "Electric cars & bikes",
    h1: "Thinking about an electric car?",
    h1Accent: "Start with what you drive and where you'd charge.",
    sub: "Free tools to pick a car, check it fits your driving, price home charging in your state and choose the right charger. No sign-up.",
    goals: [
      { href: "/calculator", label: "pick an electric car", hint: "Matched to your budget, body style and miles" },
      { href: "/ev-or-plug-in-hybrid", label: "choose EV or plug-in hybrid", hint: "Which fits your driving and charging" },
      { href: "/ev-charger-picker", label: "pick a home charger", hint: "Plug, amps, plug-in or hardwired" },
      { href: "/ev-charging-cost", label: "see what charging costs", hint: "Per charge and per mile in your state" },
      { href: "/e-bikes", label: "ride an e-bike instead", hint: "For short trips a car is overkill for" },
    ],
    start: {
      href: "/ev-or-plug-in-hybrid",
      label: "EV or plug-in hybrid?",
      why: "Five questions about your daily miles, where you can plug in and road trips. It shows which fits and the yearly fuel cost for your state.",
    },
    intro: [
      "Most people deciding on an electric car are really asking three things: will it fit how I drive, can I charge it at home, and what will it cost me compared with gas. The tools below answer each one with your state's electricity and gas prices and the EPA's efficiency ratings, not national averages dressed up as your number.",
      "If you can't charge at home, a plug-in hybrid or a regular hybrid may be the better fit, and the picker says so. If most of your trips are short, an e-bike may do them for far less than any car.",
    ],
    groups: [
      {
        heading: "Choose a car",
        blurb: "Match a car to your budget, body style and commute, and see whether full electric or a plug-in hybrid suits you.",
        links: [
          { href: "/ev-or-plug-in-hybrid", title: "EV or plug-in hybrid?", desc: "Which fits your miles, charging and road trips, with yearly fuel cost", kind: "Picker" },
          { href: "/calculator", title: "EV Finder", desc: "Electric cars on sale in the US matched to your budget and needs, with EPA range", kind: "Picker" },
          { href: "/go-electric", title: "What going electric saves", desc: "An EV next to your other switches, priced for your state", kind: "Calculator" },
        ],
      },
      {
        heading: "Charge at home",
        blurb: "What charging costs, which charger you need, and what an electrician will charge to put it in.",
        links: [
          { href: "/ev-charging-cost", title: "Cost to charge at home", desc: "Your state's price per charge and per mile against gas, for every 2026 EV", kind: "Calculator" },
          { href: "/ev-charger-picker", title: "Which charger do I need?", desc: "Plug type, amps, plug-in or hardwired, in five questions", kind: "Picker" },
          { href: "/best-home-ev-charger", title: "Best home EV chargers", desc: "Level 2 chargers compared on price, speed and plug, with dated prices", kind: "Comparison" },
          { href: "/ev-charger-installation-cost", title: "Charger installation cost", desc: "Average install cost in your state and what adds to the bill", kind: "Calculator" },
        ],
      },
      {
        heading: "E-bikes for short trips",
        blurb: "For commutes and errands a car is overkill for. Specs read from each maker's own site.",
        links: [
          { href: "/e-bikes", title: "E-bike guide", desc: "How to choose one, cost per mile, and 2026 state rebates", kind: "Hub" },
          { href: "/commuter-e-bike-under-1500", title: "Commuter e-bike under $1,500", desc: "Racks, lights and fenders included", kind: "Comparison" },
          { href: "/e-bike-for-hills", title: "E-bike for hills", desc: "Torque, mid-drives and torque sensors", kind: "Comparison" },
          { href: "/e-bike-for-heavy-riders", title: "E-bike for heavy riders", desc: "Bikes rated for 400 lb and up", kind: "Comparison" },
          { href: "/folding-e-bike", title: "Folding e-bike", desc: "For apartments, RVs and car trunks", kind: "Comparison" },
        ],
      },
    ],
    questionTopics: ["ev-charging"],
    pageQuestions: [
      { q: "Is there a federal tax credit for an EV in 2026?", href: "/questions/costs-and-incentives#ev-charger-tax-credit-2026", answeredBy: "Tax credit answer" },
    ],
    updated: UPDATED,
  },
  {
    id: "home",
    path: "/home-energy",
    name: "Home energy",
    title: "Home Energy: Solar, Batteries and Backup Power by State",
    description:
      "Is solar worth it where you live, how big a home battery you need, plug-in balcony solar laws by state, what keeps the fridge on in an outage, and what a space heater or holiday lights add to your bill. Free calculators by state.",
    image: "solar-roof",
    eyebrow: "Home energy",
    h1: "Lower your power bill,",
    h1Accent: "and keep the lights on when the grid goes down.",
    sub: "Solar, batteries, backup power and the everyday costs on your bill, worked out for your state. No sign-up, no sales calls.",
    goals: [
      { href: "/solar-calculator", label: "see if solar pays off", hint: "Panels you need and what they save in your state" },
      { href: "/plug-in-solar", label: "try plug-in balcony solar", hint: "Is it legal where you live, and what it makes" },
      { href: "/battery-calculator", label: "size a home battery", hint: "How many kWh for what you want to run" },
      { href: "/power-outage-backup-calculator", label: "keep the power on in an outage", hint: "Fridge, CPAP, well pump, Wi-Fi" },
      { href: "/space-heater-cost", label: "see what heating costs me", hint: "A space heater vs your furnace or a heat pump" },
    ],
    start: {
      href: "/go-electric",
      label: "See what each switch saves",
      why: "Pick your state and see the yearly saving from solar, a heat pump, a heat pump water heater, induction and backup power, side by side.",
    },
    pick: {
      productId: "bluetti-elite-200-v2",
      label: "Our pick for outages, no installer needed",
      why: "About 2 kWh with LFP cells rated for 6,000 cycles and a 5-year warranty. It plugs in like an appliance, so it suits renters too. Leave the fridge plugged into it and it takes over in about 15 ms when the power cuts out. It can't take extra batteries later.",
    },
    intro: [
      "Home energy questions usually come down to money and outages. Will solar pay for itself now the federal credit has ended? Do I need a battery, and how big? What can a portable power station actually run? Each tool here uses your state's electricity price and sun, so the answer is yours rather than a national average.",
      "Not every home can put panels on the roof. Renters and apartment dwellers can look at plug-in balcony solar, where state law allows it, and at portable power stations that need no installer.",
    ],
    groups: [
      {
        heading: "Solar",
        blurb: "How many panels you need, what they save, and how to judge an installer's quote.",
        links: [
          { href: "/solar-calculator", title: "Solar savings calculator", desc: "Panels you need, what they make and what they're worth in your state", kind: "Calculator" },
          { href: "/solar-finder", title: "Find solar installers", desc: "Installers serving your ZIP code and how to check a quote", kind: "Calculator" },
          { href: "/plug-in-solar", title: "Plug-in balcony solar", desc: "State-by-state laws, what an 800 W kit makes, and real kits", kind: "Guide" },
        ],
      },
      {
        heading: "Batteries and backup power",
        blurb: "Keep the fridge, CPAP, Wi-Fi and well pump going through an outage, from a portable station to a whole-home battery.",
        links: [
          { href: "/power-outage-backup-calculator", title: "Outage backup calculator", desc: "What size battery keeps your essentials on, and how fast solar refills it", kind: "Calculator" },
          { href: "/home-battery-backup", title: "Home battery backup", desc: "Whole-home vs plug-in vs portable, with real prices", kind: "Guide" },
          { href: "/battery-calculator", title: "Home battery size calculator", desc: "How many kWh you need for what you want to run", kind: "Calculator" },
          { href: "/best-portable-power-stations", title: "Best portable power stations", desc: "EcoFlow, Anker SOLIX, Jackery, Bluetti and DJI compared", kind: "Comparison" },
          { href: "/power-station-for-refrigerator", title: "Power station for a fridge", desc: "Hours each one keeps a kitchen fridge cold", kind: "Comparison" },
          { href: "/compare", title: "Head-to-head comparisons", desc: "Two power stations or home batteries side by side", kind: "Comparison" },
        ],
      },
      {
        heading: "What things cost to run",
        blurb: "Seasonal costs people search for when the bill arrives.",
        links: [
          { href: "/space-heater-cost", title: "Space heater cost", desc: "Per hour, day and month in your state, and whether it beats your furnace", kind: "Calculator" },
          { href: "/christmas-lights-cost", title: "Christmas lights cost", desc: "LED vs old-style bulbs at your state's price", kind: "Calculator" },
          { href: "/states", title: "Electricity prices by state", desc: "Price per kWh, average use and solar output for every state", kind: "Data" },
        ],
      },
    ],
    questionTopics: ["home-solar", "home-batteries-backup"],
    skipQuestions: [],
    updated: UPDATED,
  },
  {
    id: "outdoors",
    path: "/outdoor-power",
    name: "RV, boat & camping power",
    title: "RV, Boat and Camping Power: Lithium Batteries and Run Times",
    description:
      "What size lithium battery your RV, van, kayak or bass boat needs, how long a trolling motor or fish finder runs, lithium vs AGM cost per year, electric outboards, and power stations for CPAP and camping.",
    image: "power-station",
    eyebrow: "Outdoors",
    h1: "More time out there,",
    h1Accent: "less time worrying about the battery.",
    sub: "Run-time calculators and battery pickers for RVs, vans, boats, kayaks and campsites, using the makers' own power figures.",
    goals: [
      { href: "/lithium-rv-battery", label: "upgrade my RV or van battery", hint: "What lithium saves and what size you need" },
      { href: "/trolling-motor-battery-life", label: "fish all day on one battery", hint: "Hours for your motor and battery" },
      { href: "/electric-outboard-motor", label: "go electric on my boat", hint: "Outboard prices, range and cost per hour" },
      { href: "/best-power-station-for-cpap", label: "run my CPAP while camping", hint: "Nights per charge, with and without humidifier" },
    ],
    start: {
      href: "/lithium-vs-agm-battery",
      label: "Lithium vs AGM: which costs less?",
      why: "The question behind most RV and boat battery buys. See the cost per year of use for how often you camp, fish or boondock.",
    },
    intro: [
      "Whether it's an RV, a van, a bass boat or a kayak, the questions are the same: how long will the battery last, what size do I need, and is lithium worth the higher price over AGM? Every answer here starts from the motor, fridge or sonar maker's own amp-draw figures, so you can check the math.",
      "If you camp with a CPAP or just want power at the campsite without a generator, a portable power station may be all you need.",
    ],
    groups: [
      {
        heading: "RVs, vans and camping",
        blurb: "Size a house battery for your fridge, lights and CPAP, and see what switching from lead-acid saves.",
        links: [
          { href: "/lithium-rv-battery", title: "Lithium RV battery", desc: "What switching from lead-acid saves and what size you need", kind: "Picker" },
          { href: "/lithium-vs-agm-battery", title: "Lithium vs AGM", desc: "Cost per year of use, with today's prices", kind: "Calculator" },
          { href: "/best-power-station-for-cpap", title: "Power station for CPAP", desc: "Nights of sleep per charge, with and without the humidifier", kind: "Comparison" },
          { href: "/best-portable-power-stations", title: "Best portable power stations", desc: "For camping, RVs and the campsite", kind: "Comparison" },
        ],
      },
      {
        heading: "Trolling motors and fishing",
        blurb: "Hours on the water for your motor and battery, and which battery to buy.",
        links: [
          { href: "/boating", title: "Electric boating and fishing", desc: "The full guide to batteries, outboards and fish finders", kind: "Hub" },
          { href: "/trolling-motor-battery-life", title: "Trolling motor run time", desc: "Hours for 30 to 112 lb motors on lithium and AGM", kind: "Calculator" },
          { href: "/best-trolling-motor-battery", title: "Best trolling motor battery", desc: "12 V, 24 V and 36 V lithium compared, with a picker", kind: "Comparison" },
          { href: "/kayak-trolling-motor-battery", title: "Kayak trolling motor battery", desc: "Light lithium for all-day fishing", kind: "Comparison" },
          { href: "/24v-vs-36v-trolling-motor", title: "24 V vs 36 V trolling motor", desc: "Thrust, run time and battery cost side by side", kind: "Comparison" },
          { href: "/fish-finder-battery", title: "Fish finder battery", desc: "Run time for sonar and live sonar on 10 to 50 Ah", kind: "Calculator" },
        ],
      },
      {
        heading: "Electric outboards and charging on board",
        blurb: "Going electric on the stern, and keeping lithium full away from the dock.",
        links: [
          { href: "/electric-outboard-motor", title: "Electric outboard motors", desc: "Prices, range and cost per hour against a small gas outboard", kind: "Guide" },
          { href: "/charge-lithium-battery-on-boat", title: "Charging lithium on a boat", desc: "Plug-in charger, DC-to-DC off the engine, or solar", kind: "Guide" },
        ],
      },
    ],
    questionTopics: ["electric-boating"],
    updated: UPDATED,
  },
  {
    id: "offgrid",
    path: "/off-grid",
    name: "Off grid & emergency prep",
    title: "Off-Grid Living and Emergency Prep: Solar, Water, Food",
    description:
      "How to go off grid: size off-grid solar for your state's darkest month, choose a cabin solar kit, compare a power line to solar and battery, and plan emergency water, filters, food and a 72-hour kit from CDC and Ready.gov guidance.",
    image: "outage",
    eyebrow: "Off grid",
    h1: "Off grid for good,",
    h1Accent: "or ready for a week without the grid.",
    sub: "Size solar and batteries for winter, then plan the water, food and kit that get a household through an outage. Built on NREL, CDC, FEMA and Ready.gov.",
    goals: [
      { href: "/off-grid-solar-calculator", label: "size an off-grid solar system", hint: "Panels and battery for your state's December" },
      { href: "/off-grid-cabin-solar-kit", label: "power a cabin", hint: "Weekend, part-time or full-time" },
      { href: "/power-outage-backup-calculator", label: "keep the power on in an outage", hint: "What size battery for your essentials" },
      { href: "/emergency-water-storage-calculator", label: "store emergency water", hint: "Gallons and jugs for your household" },
      { href: "/emergency-kit-checklist", label: "build an emergency kit", hint: "72-hour and 2-week checklist" },
    ],
    start: {
      href: "/off-grid-solar-calculator",
      label: "Off-grid solar calculator",
      why: "Pick your appliances and state. It sizes panels and battery for December, the month that decides whether an off-grid system works.",
    },
    pick: {
      productId: "bluetti-apex-300",
      label: "Our pick for a cabin battery",
      why: "A big battery you set up yourself: 2,764.8 Wh and 3,840 W, with LFP cells rated for 6,000 cycles. Add Bluetti's B300K batteries as the cabin's needs grow. Size the panels for your state's December first with the calculator above.",
    },
    intro: [
      "People come to off-grid power from two directions. Some are planning a cabin, a homestead or a remote build and want to know whether solar and batteries beat paying for a power line. Others want their home ready for a long outage: power for the essentials, safe water and enough food.",
      "Both start with the same honest sizing: what you need to run, for how long, in your worst month. The tools below do that for your state, then cover the water, filters, food and kit that matter when the power is out for days.",
    ],
    groups: [
      {
        heading: "Off-grid solar and power",
        blurb: "Size a system for winter, price it against a power line, and pick a kit.",
        links: [
          { href: "/off-grid-solar-calculator", title: "Off-grid solar calculator", desc: "Panel watts and battery kWh for your state's December sun", kind: "Calculator" },
          { href: "/how-to-go-off-grid", title: "How to go off grid", desc: "Power line cost per mile vs solar and battery, plus permits, well and septic", kind: "Guide" },
          { href: "/off-grid-cabin-solar-kit", title: "Off-grid cabin solar kit", desc: "Weekend, part-time or full-time cabin, sized by state", kind: "Picker" },
          { href: "/generator-runtime-calculator", title: "Generator runtime and fuel", desc: "Hours per tank and fuel to store, from your generator's spec sheet", kind: "Calculator" },
        ],
      },
      {
        heading: "Ready for an outage",
        blurb: "Keep the essentials running and know how long you can last.",
        links: [
          { href: "/power-outage-backup-calculator", title: "Outage backup calculator", desc: "Fridge, CPAP, well pump and furnace blower: what size battery", kind: "Calculator" },
          { href: "/power-station-for-refrigerator", title: "Power station for a fridge", desc: "How many hours each one keeps food cold", kind: "Comparison" },
          { href: "/noaa-weather-radio", title: "NOAA Weather Radio", desc: "Find your station, frequency and county SAME code", kind: "Guide" },
        ],
      },
      {
        heading: "Water, food and your kit",
        blurb: "How much to store, how to make water safe, and a checklist scaled to your household.",
        links: [
          { href: "/emergency-water-storage-calculator", title: "Emergency water storage", desc: "Gallons for 3 days or 2 weeks, and how many jugs that fills", kind: "Calculator" },
          { href: "/best-emergency-water-filters", title: "Emergency water filters", desc: "Ranked by actual certification, filter vs purifier", kind: "Comparison" },
          { href: "/how-to-purify-water", title: "How to purify water", desc: "Bleach drops per gallon, boiling time at your elevation", kind: "Guide" },
          { href: "/emergency-food-calculator", title: "Emergency food calculator", desc: "Calories, not servings, for your household", kind: "Calculator" },
          { href: "/emergency-kit-checklist", title: "Emergency kit checklist", desc: "72-hour and 2-week home kit, printable", kind: "Checklist" },
        ],
      },
    ],
    questionTopics: [],
    pageQuestions: [
      { q: "How many solar panels and how much battery do I need to live off grid?", href: "/off-grid-solar-calculator", answeredBy: "Off-grid solar calculator" },
      { q: "Is it cheaper to run a power line or go solar?", href: "/how-to-go-off-grid", answeredBy: "How to go off grid" },
      { q: "How much water should I store for an emergency?", href: "/emergency-water-storage-calculator", answeredBy: "Water storage calculator" },
      { q: "How many drops of bleach purify a gallon of water?", href: "/how-to-purify-water", answeredBy: "How to purify water" },
      { q: "What's the difference between a water filter and a purifier?", href: "/best-emergency-water-filters", answeredBy: "Emergency water filters" },
      { q: "How much emergency food does a family need?", href: "/emergency-food-calculator", answeredBy: "Emergency food calculator" },
      { q: "How long will a generator run on a tank of gas?", href: "/generator-runtime-calculator", answeredBy: "Generator runtime calculator" },
      { q: "What should be in a 72-hour emergency kit?", href: "/emergency-kit-checklist", answeredBy: "Emergency kit checklist" },
    ],
    updated: UPDATED,
  },
  {
    id: "learn",
    path: "/learn",
    name: "Learn",
    title: "Going Electric Explained: Myths, Tax Credits, State Data",
    description:
      "Plain-English, sourced answers about going electric: which 2026 tax credits ended and what's left, EV, solar and heat pump myths checked against the data, electricity prices by state, and the questions people ask most.",
    image: "hero",
    eyebrow: "Learn",
    h1: "Straight answers,",
    h1Accent: "with the sources to check them.",
    sub: "Myths, incentives, state-by-state data and the questions people search most, each answer tied to the agency or study it came from.",
    goals: [
      { href: "/questions", label: "get a straight answer", hint: "The questions people search most, sourced" },
      { href: "/myths", label: "check a myth", hint: "EV batteries, heat pumps, cloudy-day solar" },
      { href: "/incentives", label: "see which tax credits are left", hint: "What ended in 2025 and what remains" },
      { href: "/states", label: "look up my state", hint: "Electricity prices, charging cost, solar output" },
    ],
    start: {
      href: "/questions",
      label: "Questions answered",
      why: "The questions people search most about solar, batteries, EV charging, boats and heat pumps, short answer first, then the numbers.",
    },
    intro: [
      "A lot of what's written about EVs, solar and heat pumps is either sales copy or out of date. This section is the reference shelf: what changed with federal incentives, which common worries hold up and which don't, and the state data the rest of the site is built on.",
      "Every page names its sources, from the IRS and EIA to NREL and the EPA, and says when the numbers were last checked.",
    ],
    groups: [
      {
        heading: "Answers and myths",
        blurb: "The questions people actually ask, and the claims worth checking.",
        links: [
          { href: "/questions", title: "Questions answered", desc: "Solar, batteries, EV charging, boats and heat pumps", kind: "Guide" },
          { href: "/myths", title: "Myths, checked", desc: "EV batteries, heat pumps in the cold, solar where it's cloudy", kind: "Guide" },
          { href: "/ask", title: "Ask Spark", desc: "Ask your own question, answered from our fact-checked pages", kind: "Guide" },
        ],
      },
      {
        heading: "Money and data",
        blurb: "What incentives are left in 2026, and the state numbers behind every calculator.",
        links: [
          { href: "/incentives", title: "2026 tax credits and incentives", desc: "What ended, exact IRS dates, and where state rebates are", kind: "Guide" },
          { href: "/states", title: "State data", desc: "Electricity prices, EV charging cost and solar output for every state", kind: "Data" },
          { href: "/methodology", title: "How we calculate", desc: "The formulas and data sources behind our figures", kind: "Guide" },
          { href: "/news", title: "Latest headlines", desc: "EV, solar and battery news, linked to the original articles", kind: "Data" },
        ],
      },
      {
        heading: "Play",
        blurb: "",
        links: [{ href: "/solartopia", title: "Solartopia", desc: "A free 5-minute game: light a dark village with solar and batteries", kind: "Game" }],
      },
    ],
    questionTopics: ["costs-and-incentives"],
    updated: UPDATED,
  },
];

export function hubById(id: HubId): Hub {
  const h = HUBS.find((x) => x.id === id);
  if (!h) throw new Error(`Unknown hub ${id}`);
  return h;
}

/** Next steps on the e-bike guide and its four buying guides. */
export const EBIKE_GOALS: Goal[] = [
  { href: "/commuter-e-bike-under-1500", label: "find a commuter e-bike under $1,500", hint: "Racks, lights and fenders in the box" },
  { href: "/e-bike-for-hills", label: "find an e-bike for hills", hint: "Torque, mid-drives and torque sensors" },
  { href: "/e-bike-for-heavy-riders", label: "find an e-bike for a heavier rider", hint: "Bikes rated for 400 lb and up" },
  { href: "/folding-e-bike", label: "find a folding e-bike", hint: "For apartments, RVs and car trunks" },
  { href: "/e-bikes#rebates", label: "check 2026 e-bike rebates", hint: "State and city programs open now" },
];

const EBIKE_PAGES = new Set(["/e-bikes", ...EBIKE_GOALS.map((g) => g.href)]);

/**
 * Next steps for a guide or tool page: the goals of the section it belongs to (its own link
 * dropped), or null for pages that already lead with the picker or belong to no section.
 */
export function nextGoalsFor(path: string): Goal[] | null {
  if (path === "/" || HUBS.some((h) => h.path === path) || path === "/e-bikes") return null;
  if (EBIKE_PAGES.has(path)) return EBIKE_GOALS.filter((g) => g.href !== path);
  const hub =
    HUBS.find((h) => h.goals.some((g) => g.href === path)) ??
    HUBS.find((h) => h.groups.some((g) => g.links.some((l) => l.href === path)));
  if (!hub) return null;
  return [
    ...hub.goals.filter((g) => g.href !== path),
    { href: hub.path, label: "see every guide in this section", hint: hub.name },
  ];
}
