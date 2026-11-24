/**
 * Answered questions for the /questions hubs.
 *
 * RULES
 *  - Every claim here comes from a source listed under the same question,
 *    opened and read on 2026-10-25, or from Spark Powered's own datasets
 *    (EIA prices, PVWatts solar output, fueleconomy.gov efficiency, makers'
 *    specs in src/data), which carry their own sources and dates. The
 *    claim-by-claim quotes live in
 *    ~/Grant/marketing/sparkpowered-questions/fact-check.md (outside the repo).
 *  - `a` is the short answer. It is shown on the page word for word and is
 *    also the FAQPage JSON-LD text, so the two always match.
 *  - Arithmetic is done here in code from the datasets, so the page and the
 *    markup cannot drift apart. Prices only come from src/data or from a
 *    maker's page read on QUESTIONS_UPDATED (constants below say which).
 */

import home from "@/data/home-energy.json";
import { LEAD_ACID_REF, BATTERIES } from "@/data/batteries";
import { ELECTRIC_OUTBOARDS, FUEL_PRICES, GAS_OUTBOARDS } from "@/data/boating";
import { INSTALL_COST } from "@/data/buyer-guides";
import { chargerById } from "@/data/chargers";
import { STATE_LAWS, LAW_REVIEWED } from "@/data/plugin-solar-law";
import { INSTALLED_BATTERY_COST } from "@/data/products";
import { ELECTRIC_HOUR_USD, GAS_HOUR_USD, MOTORS, runtimeHours } from "@/lib/boating";
import {
  MONTHLY_MILES,
  NATIONAL,
  POWERWALL_3_KWH,
  PANEL_WATTS,
  REFERENCE_EVS,
  STATES,
  chargingFigures,
  formatDate,
  gasCostPer100,
  evCostPer100,
  nationalRateUsd,
  referenceEv,
  stateByAbbr,
  ytdWindow,
  SOURCES,
} from "@/lib/energy";
import { ESSENTIALS_WH_DAY, FRIDGE_AVG_W, USABLE_FRACTION } from "@/lib/everyday";
import { ASSUMPTIONS, MMBTU_PER_MCF } from "@/lib/go-electric";
import { productById } from "@/lib/products";
import { pluginFigures, REFERENCE_KIT_W } from "@/lib/plugin-solar";
import { STATE_LOCAL } from "@/data/state-local";

export type Block =
  | { p: string }
  | { ul: string[] }
  | { table: { caption: string; head: string[]; rows: string[][] } };

export interface Source {
  name: string;
  url: string;
}

/** A product we link to as a partner (rendered with PartnerLink + disclosure). */
export interface Pick {
  brand: "bluetti" | "lectron" | "autel" | "eviqo" | "redodo" | "litime";
  label: string;
  url: string;
  productId?: string;
  note: string;
}

export interface Question {
  /** Anchor id on the hub page. */
  id: string;
  q: string;
  /** Short answer: 2 to 4 sentences, plain text. */
  a: string;
  /**
   * Safety conditions the reader must meet before acting on the answer, shown in a
   * warning box right under it and appended to the answer in structured data.
   * Required on any answer that tells someone to plug in, wire, charge or run something
   * (added 2026-11-12 after a reader rightly said the dryer-outlet answer left them out).
   */
  safety?: string;
  detail: Block[];
  sources: Source[];
  /** Links that help the reader run the numbers for their own home. External ones open in a new tab. */
  tools?: { href: string; label: string }[];
  picks?: Pick[];
  /** One worked example with real numbers, its source, and the calculator to run your own (added 2026-10-30). */
  example?: Example;
}

export interface Example {
  text: string;
  source: Source;
  tool: { href: string; label: string };
}

export interface Topic {
  slug: string;
  path: string;
  nav: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  /** Guides shown under "Keep going". */
  related: { href: string; label: string; desc: string }[];
  /** Topic touches home wiring: show the licensed-electrician note. */
  wiring?: boolean;
  questions: Question[];
}

// ---------------------------------------------------------------- helpers

const usd0 = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const n0 = (n: number) => Math.round(n).toLocaleString("en-US");
const n1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const c1 = (cents: number) => `${n1(cents)} cents`;
const half = (n: number) => Math.round(n * 2) / 2;
const st = (abbr: string) => {
  const s = stateByAbbr(abbr);
  if (!s) throw new Error(`Unknown state ${abbr}`);
  return s;
};

// ---------------------------------------------------------------- sources

const IRS_FAQ_URL =
  "https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-act-obbb";

const S = {
  irsFaq: { name: "IRS: FAQs on the modification of sections 25C, 25D, 25E, 30C, 30D, 45L, 45W and 179D under Public Law 119-21 (FS-2025-05)", url: IRS_FAQ_URL },
  irs25d: { name: "IRS: Residential Clean Energy Credit", url: "https://www.irs.gov/credits-deductions/residential-clean-energy-credit" },
  eiaPrices: { name: "U.S. Energy Information Administration: Electric Power Monthly, Tables 5.6.A and 5.6.B", url: "https://www.eia.gov/electricity/monthly/" },
  eiaUsage: { name: "U.S. Energy Information Administration: Electric sales, revenue and average price (2024 average monthly bill)", url: "https://www.eia.gov/electricity/sales_revenue_price/" },
  eiaGas: { name: "U.S. Energy Information Administration: Gasoline and diesel fuel update", url: "https://www.eia.gov/petroleum/gasdiesel/" },
  eiaNatGas: { name: "U.S. Energy Information Administration: Natural gas prices, residential", url: "https://www.eia.gov/dnav/ng/ng_pri_sum_a_EPG0_PRS_DMcf_a.htm" },
  eiaRecs: { name: "U.S. Energy Information Administration: 2020 Residential Energy Consumption Survey, state data", url: "https://www.eia.gov/consumption/residential/data/2020/index.php?view=state" },
  fueleconomy: { name: "U.S. EPA and DOE: fueleconomy.gov vehicle data", url: "https://www.fueleconomy.gov/feg/download.shtml" },
  epaTrends: { name: "U.S. EPA: Automotive Trends Report highlights", url: "https://www.epa.gov/automotive-trends/highlights-automotive-trends-report" },
  pvwatts: { name: "PVWatts solar model (National Laboratory of the Rockies, formerly NREL)", url: "https://pvwatts.nlr.gov/" },
  doeSolarGuide: { name: "U.S. Department of Energy: Homeowner's Guide to Going Solar", url: "https://www.energy.gov/eere/solar/homeowners-guide-going-solar" },
  doeFleet: { name: "U.S. Department of Energy: Success Story, A Clearer Picture of U.S. Solar Power Performance (NREL PV Fleet)", url: "https://www.energy.gov/node/4830605" },
  esSolarCost: { name: "EnergySage: Solar panel cost in 2026 (average cost per watt by state)", url: "https://www.energysage.com/local-data/solar-panel-cost/" },
  esH1: { name: "EnergySage: Home energy market, first half of 2026", url: "https://www.energysage.com/news/home-energy-market-h1-2026-highlights/" },
  esResilience: { name: "EnergySage: Resiliency benefits of solar batteries", url: "https://www.energysage.com/energy-storage/resiliency-benefits-energy-storage/" },
  dsire: { name: "DSIRE, the Database of State Incentives for Renewables & Efficiency (NC Clean Energy Technology Center)", url: "https://www.dsireusa.org/" },
  afdcLaws: { name: "U.S. Department of Energy, Alternative Fuels Data Center: State laws and incentives", url: "https://afdc.energy.gov/laws/state" },
  afdcHome: { name: "U.S. Department of Energy, Alternative Fuels Data Center: Charging electric vehicles at home", url: "https://afdc.energy.gov/fuels/electricity-charging-home" },
  afdcStations: { name: "U.S. Department of Energy, Alternative Fuels Data Center: Electric vehicle charging stations (charging levels)", url: "https://afdc.energy.gov/fuels/electricity-stations" },
  chargepoint: { name: "ChargePoint: Home Flex installation FAQ (circuit and amperage table)", url: "https://www.chargepoint.com/drivers/home/installation/flex" },
  chargepointTips: { name: "ChargePoint: Pre-installation guidelines for electricians", url: "https://docs.chargepoint.com/cpdocs-sec/content/1-home/cph50/pre-ig/elctrcn-instlltn-tps.htm" },
  lectron: { name: "Lectron NEXUS Level 2 J1772 charger, product page", url: chargerById("lectron-nexus-j1772").url },
  lectronPortable: { name: "Lectron portable Level 1 & 2 charger (Tesla / NACS), product page", url: chargerById("lectron-portable-nacs").url },
  autel40: { name: "Autel MaxiCharger AC Elite Home 40A, product page", url: chargerById("autel-elite-home-40a").url },
  eviqo: { name: "EVIQO Level 2 J1772 charger (plug-in 40A or hardwired 48A), product page", url: chargerById("eviqo-l2-j1772").url },
  installCost: { name: "EnergySage: How much does an EV charger installation cost?", url: INSTALL_COST.url },
  cpsc: { name: "U.S. Consumer Product Safety Commission: Portable generator hazards safety alert (PDF)", url: "https://www.cpsc.gov/s3fs-public/5123_SafetyAlert_PortableGenerators_102021_0.pdf?VersionId=PK4zcSnKUJE8ovzbCGV09MM5.RBIG_E5" },
  osha: { name: "OSHA: Using portable generators safely (PDF)", url: "https://www.osha.gov/sites/default/files/publications/OSHA3286.pdf" },
  ready: { name: "Ready.gov: Power outages", url: "https://www.ready.gov/power-outages" },
  enphase10c: { name: "Enphase IQ Battery 10C data sheet (PDF)", url: "https://enphase.com/download/iq-battery-10c-data-sheet" },
  franklin: { name: "FranklinWH aPower 2 data sheet (PDF)", url: "https://www.franklinwh.com/document/apower-2-datasheet" },
  powerwall: { name: "Tesla Powerwall 3 data sheet (PDF)", url: "https://energylibrary.tesla.com/docs/Public/EnergyStorage/Powerwall/3/Datasheet/en-us/Powerwall-3-Datasheet.pdf" },
  minnKota: { name: "Minn Kota Endura C2 owner's manual (PDF)", url: "https://johnsonoutdoors.widen.net/content/pmt3jgylgd/pdf/EnduraC2-50-User-Manual-2067171rb.pdf" },
  newport: { name: "Newport Vessels: Calculate trolling motor runtime with a battery", url: "https://newportvessels.com/blogs/learn/trolling-motor-calculate-motor-runtime-with-a-battery" },
  redodo100: { name: "Redodo 12V 100Ah LiFePO4 battery, product page", url: "https://www.redodopower.com/products/12v-100ah-lithium-battery" },
  renogyAgm: { name: "Renogy Deep Cycle AGM Battery 12V 100Ah, product page", url: LEAD_ACID_REF.url },
  wiringUnlimited: { name: "Victron Energy: Wiring Unlimited (PDF)", url: "https://www.victronenergy.com/upload/documents/Wiring-Unlimited-EN.pdf" },
  eprop: { name: "ePropulsion Spirit 1.0, product page", url: "https://www.epropulsion.com/products/electric-outboards/spirit-1" },
  honda: { name: "Honda BF2.3 outboard, specifications", url: GAS_OUTBOARDS.hondaBf23.url },
  energyStarHp: { name: "ENERGY STAR: Air-source heat pumps", url: "https://www.energystar.gov/products/air_source_heat_pumps" },
  ecfr: { name: "Federal efficiency standards for home appliances, 10 CFR 430.32", url: ASSUMPTIONS.heatPumpCop.source.url },
  bluetti30: { name: "Bluetti Elite 30 V2, product page (capacity and output)", url: productById("bluetti-elite-30-v2").sourceUrl },
  bluetti100: { name: "Bluetti Elite 100 V2, product page (capacity and output)", url: productById("bluetti-elite-100-v2").sourceUrl },
  bluetti200: { name: "Bluetti Elite 200 V2, product page (capacity and output)", url: productById("bluetti-elite-200-v2").sourceUrl },
  bluetti300: { name: "Bluetti Elite 300, product page (capacity and output)", url: productById("bluetti-elite-300").sourceUrl },
  ecoflowUltra: { name: "EcoFlow DELTA Pro Ultra, product page (Smart Home Panel 2 requirement)", url: productById("ecoflow-delta-pro-ultra").sourceUrl },
  nec: { name: "NFPA 70, National Electrical Code (free read-only access): Article 625, EV charging, and 210.19/210.20, continuous loads", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
  teslaMobile: { name: "Tesla: Mobile Connector (outlet, breaker and maximum current chart)", url: "https://www.tesla.com/support/charging/mobile-connector" },
  cpscHeater: { name: "U.S. Consumer Product Safety Commission: Portable electric heater safety (PDF)", url: "https://www.cpsc.gov/s3fs-public/PortableElectricHeaterSafetyNSN.pdf" },
  fsis: { name: "USDA Food Safety and Inspection Service: Keep your food safe during emergencies", url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/emergencies/keep-your-food-safe-during-emergencies" },
  redodoCharger: { name: "Redodo: Can I charge a LiFePO4 battery with a normal charger?", url: "https://www.redodopower.com/blogs/learn-about-lithium/can-i-charge-lifepo4-battery-with-a-normal-charger" },
  redodoCold: { name: "Redodo: Self-heating vs low-temperature protection", url: "https://www.redodopower.com/blogs/learn-about-lithium/self-heating-vs-low-temperature-protection" },
} satisfies Record<string, Source>;

// ---------------------------------------------------------------- figures read on QUESTIONS_UPDATED

/** EnergySage average installed price per watt before incentives, by state, read 2026-10-25 (S.esSolarCost). */
const SOLAR_PER_WATT: Record<string, number> = { MA: 2.9, NJ: 2.59, AZ: 2.26, FL: 2.12, TX: 2.25, OH: 2.58, MI: 2.88, WA: 2.49 };
const SOLAR_PER_WATT_US = 2.6;
/** Redodo 12V 100Ah weight as stated on its product page, read 2026-10-25. */
const REDODO_100_LB_TODAY = 25;
/** NREL PV Fleet median performance loss, % a year (S.doeFleet). */
const FLEET_LOSS = 0.0075;

// ---------------------------------------------------------------- shared numbers

const rate = nationalRateUsd();
const gasWeek = formatDate(/\d{4}-\d{2}-\d{2}/.exec(SOURCES.gasoline.period ?? "")?.[0] ?? "2026-10-12");
const rateC = NATIONAL.residentialCentsPerKwhYtd;
const usDailyKwh = NATIONAL.avgMonthlyKwh / (365 / 12);
const typical = referenceEv("typical");
const efficient = referenceEv("efficient");
const large = referenceEv("large");
const evMonth = (kwh100: number, r = rate) => (evCostPer100(r, kwh100) * MONTHLY_MILES) / 100;
const gasMonth = (gasCostPer100(NATIONAL.gasolineUsdPerGallon) * MONTHLY_MILES) / 100;
const evYearKwh = (typical.kwhPer100mi * MONTHLY_MILES * 12) / 100;

const byPrice = [...STATES].sort((a, b) => a.electricity.residentialCentsPerKwhYtd - b.electricity.residentialCentsPerKwhYtd);
const cheapest = byPrice[0];
const dearest = byPrice[byPrice.length - 1];
const statesEvCheaper = STATES.filter((s) => {
  const f = chargingFigures(s);
  return f.evMonthly < f.gasMonthly;
}).length;

/** Years for a system to pay for itself if every kWh replaces one bought at the state's average rate. */
function solarPayback(abbr: string) {
  const s = st(abbr);
  const perW = SOLAR_PER_WATT[abbr];
  const valuePerKw = s.solar.kwhPerKwYear * (s.electricity.residentialCentsPerKwhYtd / 100);
  return { s, perW, valuePerKw, years: (perW * 1000) / valuePerKw };
}
const PAYBACK_STATES = ["MA", "NJ", "AZ", "FL", "TX", "OH", "MI", "WA"].map(solarPayback).sort((a, b) => a.years - b.years);
const fastPay = PAYBACK_STATES[0];
const slowPay = PAYBACK_STATES[PAYBACK_STATES.length - 1];

const lawStates = STATE_LAWS.filter((l) => l.status === "law");
const pendingStates = STATE_LAWS.filter((l) => l.status === "pending");
const stateName = (abbr: string) => st(abbr).name;
const lawInForce = lawStates.filter((l) => (l.effective ?? "") <= LAW_REVIEWED);
const lawLater = lawStates.filter((l) => (l.effective ?? "") > LAW_REVIEWED);
const listNames = (xs: { abbr: string }[]) => {
  const names = xs.map((x) => stateName(x.abbr)).sort();
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names.join("");
};

const essentialsKwh = ESSENTIALS_WH_DAY / 1000;
const fridgeHours = (wh: number) => (wh * USABLE_FRACTION) / FRIDGE_AVG_W;
const ilEv = STATE_LOCAL.IL.facts.find((f) => f.label === "EV rebate")!;
const ilSolar = STATE_LOCAL.IL.facts.find((f) => f.label === "Solar")!;
const hiSolar = STATE_LOCAL.HI.facts.find((f) => f.label === "Solar tax credit")!;
const coEv = STATE_LOCAL.CO.facts.find((f) => f.label === "EV tax credit")!;
const e100 = productById("bluetti-elite-100-v2");
const e200 = productById("bluetti-elite-200-v2");
const e300 = productById("bluetti-elite-300");
const e30 = productById("bluetti-elite-30-v2");
const HEATER_W = 1500;

const lectron = chargerById("lectron-nexus-j1772");
const autel40 = chargerById("autel-elite-home-40a");
const eviqo = chargerById("eviqo-l2-j1772");

const m55 = MOTORS.find((m) => m.id === "55-12")!;
const redodo100 = BATTERIES.find((b) => b.id === "redodo-12v-100ah")!;
const agmUsableAh = LEAD_ACID_REF.ampHours * LEAD_ACID_REF.depthOfDischarge;
const spirit = ELECTRIC_OUTBOARDS.find((o) => o.id === "epropulsion-spirit-1-evo")!;

// Heat pump vs gas for the average US gas-heated home (same method as the Go Electric planner).
const hpDelivered = home.national.gasSpaceHeatMmbtu * ASSUMPTIONS.furnaceAfue.value;
const hpKwh = hpDelivered / 0.003412 / ASSUMPTIONS.heatPumpCop.value;
const hpCost = hpKwh * rate;
const gasHeatCost = (home.national.gasSpaceHeatMmbtu / MMBTU_PER_MCF) * home.national.gasUsdPerMcf;
const hpVsResistance = 1 - 1 / ASSUMPTIONS.heatPumpCop.value;

const priceRise = (NATIONAL.residentialCentsPerKwhYtd / NATIONAL.residentialCentsPerKwhYtdPrevYear - 1) * 100;

const mi = st("MI");
const az = st("AZ");
const wa = st("WA");
const fl = st("FL");
const kwhJan = (s: typeof mi) => s.solar.monthlyKwhPerKw[0];
const kwhJun = (s: typeof mi) => s.solar.monthlyKwhPerKw[5];
const evKw = (s: typeof mi) => evYearKwh / s.solar.kwhPerKwYear;
const evPanels = (s: typeof mi) => Math.ceil((evKw(s) * 1000) / PANEL_WATTS);

// ---------------------------------------------------------------- topics

export const TOPICS: Topic[] = [
  {
    slug: "home-batteries-backup",
    path: "/questions/home-batteries-backup",
    nav: "Home batteries & backup",
    h1: "Home battery and backup power questions, answered",
    title: "Home Backup Battery Questions, Answered",
    description:
      "How long a home battery runs a house, whether it's worth it without solar, how long a power station runs a fridge or space heater, generators vs power stations, and why you never plug into a wall outlet. With sources.",
    intro:
      "What people ask before buying backup power, answered from makers' data sheets, EIA household data, Ready.gov, the Consumer Product Safety Commission and OSHA. Run times are our arithmetic from those figures.",
    wiring: true,
    related: [
      { href: "/home-battery-backup", label: "Home battery backup", desc: "Whole-home and plug-in systems, priced." },
      { href: "/power-station-for-refrigerator", label: "Power station for a fridge", desc: "Size one for your fridge." },
      { href: "/battery-calculator", label: "Home battery sizer", desc: "How much battery your home needs." },
      { href: "/generator-runtime-calculator", label: "Generator runtime calculator", desc: "How much fuel to store, and CO safety." },
    ],
    questions: [
      {
        id: "home-battery-without-solar",
        q: "Is a home battery worth it without solar?",
        a: `As backup power, it can be: a home battery keeps your chosen circuits running in an outage without fuel. As a money-saver it is a harder case. EnergySage put home battery prices at about ${usd0(INSTALLED_BATTERY_COST.medianPerKwh)} per kWh in the first half of 2026, so one ${POWERWALL_3_KWH} kWh Tesla Powerwall 3 comes to about ${usd0(INSTALLED_BATTERY_COST.medianPerKwh * POWERWALL_3_KWH)} at that rate, and homeowners can no longer claim the 30% federal credit for one installed after 2025.`,
        detail: [
          { p: "EnergySage says resiliency, backup power in an outage, is the main reason people install home storage, and that most batteries cannot back up a whole home, so you choose the circuits." },
          { p: `If you mainly want the fridge, lights, internet and a medical device through an outage, a plug-in power station costs far less than an installed battery: the 2 kWh Bluetti ${e200.model} is one, and you plug appliances straight into it. See the next questions for run times.` },
        ],
        sources: [S.esResilience, S.esH1, S.powerwall, S.irs25d],
        tools: [{ href: "/home-battery-backup", label: "Home battery backup guide" }],
      },
      {
        id: "home-battery-outage-hours",
        q: "How long will a home battery power my house in an outage?",
        a: `One ${POWERWALL_3_KWH} kWh battery, such as a Tesla Powerwall 3, runs the average US home for about ${Math.round((POWERWALL_3_KWH / usDailyKwh) * 24)} hours, because the average home uses about ${n0(usDailyKwh)} kWh a day (EIA, 2024). Cut back to essentials and it lasts days: a fridge, Wi-Fi, four LED bulbs for five hours and two phone charges come to about ${n1(essentialsKwh)} kWh a day, so the same battery covers about ${half(POWERWALL_3_KWH / essentialsKwh)} days of that.`,
        safety: "These run times assume a full battery set up to back up the circuits you want. Air conditioning, electric heat, a well pump or an EV charger drain it much faster. A home battery must be installed by a certified installer and a licensed electrician, with the permits your area requires.",
        detail: [
          { p: `To size your own: add up the daily kWh of what you want to keep running, multiply by the days of backup you want, and check the battery's continuous power rating covers everything that runs at once. The average US home's fridges use ${home.national.fridgeKwh} kWh a year (EIA), about ${n1((home.national.fridgeKwh / 365))} kWh a day.` },
          {
            table: {
              caption: "Hours of the average US home's use, or days of essentials, per battery",
              head: ["Battery", "Usable energy", "Average home", "Essentials only"],
              rows: [
                ["Tesla Powerwall 3", `${POWERWALL_3_KWH} kWh`, `about ${Math.round((POWERWALL_3_KWH / usDailyKwh) * 24)} hours`, `about ${half(POWERWALL_3_KWH / essentialsKwh)} days`],
                ["FranklinWH aPower 2", "15 kWh", `about ${Math.round((15 / usDailyKwh) * 24)} hours`, `about ${half(15 / essentialsKwh)} days`],
                ["Enphase IQ Battery 10C", "10 kWh", `about ${Math.round((10 / usDailyKwh) * 24)} hours`, `about ${half(10 / essentialsKwh)} days`],
              ],
            },
          },
        ],
        sources: [S.powerwall, S.franklin, S.enphase10c, S.eiaUsage, S.eiaRecs],
        tools: [{ href: "/battery-calculator", label: "Home battery sizer" }],
      },
      {
        id: "home-battery-lifespan",
        q: "How many years does a home battery last?",
        a: "Makers warrant them for about 15 years or a set amount of use, whichever comes first. Enphase warrants its IQ Battery 10C for up to 15 years or 6,000 cycles, holding 60% of its capacity, and FranklinWH warrants the aPower 2 for 15 years or 60 MWh of throughput. The 60% figure in Enphase's warranty tells you capacity is expected to fade with use.",
        detail: [
          { p: `For scale: 6,000 full cycles is one a day for about ${Math.round(6000 / 365)} years, and 60 MWh is 4,000 full charges of a 15 kWh battery.` },
          { p: "Read the warranty for the exact terms: what counts as a cycle, the capacity it guarantees and whether it transfers if you sell the house." },
        ],
        sources: [S.enphase10c, S.franklin],
        tools: [{ href: "/home-battery-backup", label: "Home battery or power station?" }, { href: "/battery-calculator", label: "What size battery do I need?" }],
      },
      {
        id: "power-station-refrigerator",
        q: "How long will a portable power station run a refrigerator?",
        a: `About ${Math.round(fridgeHours(e100.capacityWh))} hours on a 1 kWh station and about ${Math.round(fridgeHours(e200.capacityWh))} hours on a 2 kWh one, for an average fridge. The average US home's fridges use ${home.national.fridgeKwh} kWh a year (EIA), about ${Math.round(FRIDGE_AVG_W)} W averaged over the day, and a station delivers roughly ${Math.round(USABLE_FRACTION * 100)}% of its rated capacity after inverter losses. Ready.gov says a closed fridge keeps food cold for about four hours, so you can run it in shifts and stretch any battery.`,
        safety: "Check that the station's surge (peak) rating covers your fridge's start-up, and plug the fridge straight into the station, not through an extension cord or power strip. Keep the doors shut and a thermometer in the fridge: the USDA says to throw out perishable food that has been above 40 F for more than 2 hours.",
        detail: [
          {
            table: {
              caption: "Hours an average fridge runs on a Bluetti power station",
              head: ["Station", "Capacity", "Continuous output", "Fridge run time"],
              rows: [e100, e200, e300].map((p) => [`Bluetti ${p.model}`, `${n0(p.capacityWh)} Wh`, `${n0(p.acOutputW)} W`, `about ${Math.round(fridgeHours(p.capacityWh))} hours`]),
            },
          },
          { p: "Ready.gov also says a full freezer holds its temperature for about 48 hours, and to throw out food that has reached 40 degrees or higher. Our fridge calculator lets you enter your own fridge's yearly kWh instead of the average." },
        ],
        sources: [S.eiaRecs, S.ready, S.bluetti100, S.bluetti200, S.bluetti300, S.fsis],
        tools: [{ href: "/power-station-for-refrigerator", label: "Fridge run-time calculator" }],
        picks: [e100, e200, e300].map((p) => ({ brand: "bluetti" as const, label: `Bluetti ${p.model}`, url: p.url, productId: p.id, note: `${n0(p.capacityWh)} Wh, about ${Math.round(fridgeHours(p.capacityWh))} hours of an average fridge` })),
      },
      {
        id: "power-station-vs-generator",
        q: "Should I get a power station or a gas generator for outages?",
        a: "A power station has no engine, so it makes no exhaust and can sit next to the fridge, but it stops when its battery is empty unless you recharge it, for example from solar panels. A gas generator runs as long as you keep fueling it, but it must stay outdoors and at least 20 feet from windows, doors and attached garages, because its exhaust contains carbon monoxide, which the CPSC warns can kill in minutes indoors.",
        detail: [
          { p: "The Consumer Product Safety Commission says most generator incidents reported to it involve carbon monoxide from generators used indoors or in partly enclosed spaces, and to never run one in a home, garage, basement, crawlspace or shed, even with fans or open doors and windows. Ready.gov and the CPSC both say to install battery-backed carbon monoxide alarms." },
          { p: "Whichever you pick, power appliances by plugging them into the unit with suitable cords, never by connecting it to a wall outlet (next question)." },
        ],
        sources: [S.cpsc, S.ready],
        tools: [{ href: "/power-outage-backup-calculator", label: "Power outage backup calculator" }, { href: "/generator-runtime-calculator", label: "Generator runtime and fuel cost" }],
        picks: [e100, e200, e300].map((p) => ({ brand: "bluetti" as const, label: `Bluetti ${p.model}`, url: p.url, productId: p.id, note: `${n0(p.capacityWh)} Wh, about ${Math.round(fridgeHours(p.capacityWh))} hours of an average fridge, no fuel or fumes` })),
      },
      {
        id: "plug-into-wall-outlet",
        q: "Can I plug a generator or power station into a wall outlet to power my house?",
        a: "No. Powering house wiring by plugging a generator into a wall outlet, called backfeeding, is extremely dangerous: the CPSC says it can electrocute utility workers and neighbors served by the same transformer, and it bypasses your home's built-in circuit protection. OSHA says a generator should only be connected to a building's wiring through a transfer switch installed by a qualified electrician. Otherwise, plug appliances straight into the unit.",
        detail: [
          { p: "OSHA warns that a generator attached to a building without a properly installed transfer switch can energize wiring for great distances. Some larger power stations are built to connect to home circuits through the maker's own panel: EcoFlow, for example, says its DELTA Pro Ultra needs its Smart Home Panel 2, installed by an electrician." },
        ],
        sources: [S.cpsc, S.osha, S.ecoflowUltra],
        tools: [{ href: "/home-battery-backup", label: "Home backup options" }],
      },
      {
        id: "power-station-space-heater",
        q: "Can a power station run a space heater?",
        a: `Only briefly. If your heater is rated 1,500 W on high (check its label), it needs a station that can deliver at least 1,500 W continuously, and it drains the battery fast: the ${n0(e200.capacityWh)} Wh Bluetti ${e200.model} runs it for about ${n1((e200.capacityWh * USABLE_FRACTION) / HEATER_W)} hours, and a small 600 W station such as the Elite 30 V2 cannot run it at all. On a low setting it lasts longer in proportion to the watts.`,
        safety: "Plug the heater straight into the station, never through an extension cord or power strip, which can overheat. The CPSC says to keep anything that can burn at least 3 feet away, set the heater on a level floor and never leave it running while you sleep or are out of the room. Use a heater with tip-over and overheat shutoff.",
        detail: [
          {
            table: {
              caption: "Hours a heater runs on a power station, by heater setting",
              head: ["Station", "Continuous output", "At 1,500 W", "At 750 W"],
              rows: [e30, e100, e200, e300].map((p) => [
                `Bluetti ${p.model} (${n0(p.capacityWh)} Wh)`,
                `${n0(p.acOutputW)} W`,
                p.acOutputW >= 1500 ? `about ${n1((p.capacityWh * USABLE_FRACTION) / 1500)} hours` : "cannot run it",
                p.acOutputW >= 750 ? `about ${n1((p.capacityWh * USABLE_FRACTION) / 750)} hours` : "cannot run it",
              ]),
            },
          },
          { p: "Run time is the station's capacity, less about 15% for inverter losses, divided by the heater's watts." },
        ],
        sources: [S.bluetti30, S.bluetti100, S.bluetti200, S.bluetti300, S.cpscHeater],
        tools: [{ href: "/power-outage-backup-calculator", label: "Power outage backup calculator" }],
      },
    ],
  },
];

export function topicBySlug(slug: string): Topic {
  const t = TOPICS.find((x) => x.slug === slug);
  if (!t) throw new Error(`Unknown question topic ${slug}`);
  return t;
}

export const QUESTION_COUNT = TOPICS.reduce((n, t) => n + t.questions.length, 0);

// ---------------------------------------------------------------- answer anchors

/**
 * Where an answer lives: its hub plus the anchor id. The old single-answer pages
 * (/questions/<hub>/<id>) were folded into the hubs on 2026-11-11 and 308 to here.
 */
export function questionPath(t: Topic, q: Question): string {
  return `${t.path}#${q.id}`;
}


/** Every question with its hub, in hub order. */

// ---------------------------------------------------------------- worked examples (2026-10-30)
// Same datasets and constants as the answers above; each names one source and one calculator.

const oh = st("OH");
const ohPay = solarPayback("OH");
const OH_KW = 6;
const ohCost = ohPay.perW * OH_KW * 1000;
const ohKwhYr = OH_KW * oh.solar.kwhPerKwYear;
const ohRate = oh.electricity.residentialCentsPerKwhYtd;
const ohValueYr = ohKwhYr * (ohRate / 100);
const plugS = st(lawInForce[0].abbr);
const plug = pluginFigures(plugS, REFERENCE_KIT_W);
const usMonthBill = NATIONAL.avgMonthlyBillUsd;
const evKwhMonth = (typical.kwhPer100mi * MONTHLY_MILES) / 100;
const gallonsMonth = MONTHLY_MILES / NATIONAL.gasMpg;
const halfAmps = m55.maxAmps / 2;
const cop = ASSUMPTIONS.heatPumpCop.value;
const spiritHours = 22 / 4.5;

const EXAMPLES: Record<string, Example> = {
  "home-battery-without-solar": {
    text: `A ${POWERWALL_3_KWH} kWh battery at ${usd0(INSTALLED_BATTERY_COST.medianPerKwh)} per kWh is about ${usd0(POWERWALL_3_KWH * INSTALLED_BATTERY_COST.medianPerKwh)}. Charged from the grid, it holds about ${Math.round((POWERWALL_3_KWH / usDailyKwh) * 24)} hours of the average home's use (${n0(usDailyKwh)} kWh a day), or about ${n1(POWERWALL_3_KWH / essentialsKwh)} days of essentials only.`,
    source: S.esH1,
    tool: { href: "/battery-calculator", label: "Home battery sizer" },
  },
  "home-battery-outage-hours": {
    text: `${POWERWALL_3_KWH} kWh ÷ ${n1(usDailyKwh)} kWh a day × 24 = about ${Math.round((POWERWALL_3_KWH / usDailyKwh) * 24)} hours of normal use. Cut to essentials (${essentialsKwh.toFixed(2)} kWh a day) and the same battery lasts about ${n1(POWERWALL_3_KWH / essentialsKwh)} days.`,
    source: S.eiaUsage,
    tool: { href: "/battery-calculator", label: "Home battery sizer" },
  },
  "home-battery-lifespan": {
    text: "Enphase warrants the IQ Battery 10C for 15 years or 6,000 cycles. At one full cycle a day, 6,000 cycles ÷ 365 = about 16.4 years, so for daily cycling the 15-year limit comes first.",
    source: S.enphase10c,
    tool: { href: "/battery-calculator", label: "Home battery sizer" },
  },
  "power-station-refrigerator": {
    text: `Bluetti ${e200.model}: ${n0(e200.capacityWh)} Wh × ${Math.round(USABLE_FRACTION * 100)}% usable = ${n0(e200.capacityWh * USABLE_FRACTION)} Wh. An average fridge draws about ${n0(FRIDGE_AVG_W)} W over a day, so ${n0(e200.capacityWh * USABLE_FRACTION)} ÷ ${n0(FRIDGE_AVG_W)} = about ${Math.round(fridgeHours(e200.capacityWh))} hours.`,
    source: S.bluetti200,
    tool: { href: "/power-station-for-refrigerator", label: "Fridge run-time calculator" },
  },
  "power-station-vs-generator": {
    text: `A ${n0(e200.capacityWh)} Wh Bluetti ${e200.model} runs the essentials (${n0(ESSENTIALS_WH_DAY)} Wh a day) for about ${Math.round(((e200.capacityWh * USABLE_FRACTION) / ESSENTIALS_WH_DAY) * 24)} hours: ${n0(e200.capacityWh * USABLE_FRACTION)} usable Wh ÷ ${n0(ESSENTIALS_WH_DAY)} × 24. A generator keeps going as long as you have fuel, but it must run outdoors.`,
    source: S.bluetti200,
    tool: { href: "/power-outage-backup-calculator", label: "Power outage backup calculator" },
  },
  "plug-into-wall-outlet": {
    text: `The safe way is an extension cord to each appliance. An average fridge draws about ${n0(FRIDGE_AVG_W)} W over a day, so the ${n0(e100.acOutputW)} W Bluetti ${e100.model} can run it through a cord, with no connection to your home's wiring.`,
    source: S.bluetti100,
    tool: { href: "/power-outage-backup-calculator", label: "Power outage backup calculator" },
  },
  "power-station-space-heater": {
    text: `On its 750 W low setting, a heater on the Bluetti ${e200.model} runs about ${n1((e200.capacityWh * USABLE_FRACTION) / 750)} hours: ${n0(e200.capacityWh)} Wh × ${Math.round(USABLE_FRACTION * 100)}% ÷ 750 W. On 1,500 W it is half that, about ${n1((e200.capacityWh * USABLE_FRACTION) / 1500)} hours.`,
    source: S.bluetti200,
    tool: { href: "/power-outage-backup-calculator", label: "Power outage backup calculator" },
  },
};

for (const t of TOPICS) for (const q of t.questions) q.example = EXAMPLES[q.id];

export const ALL_QUESTIONS: { topic: Topic; question: Question }[] = TOPICS.flatMap((topic) =>
  topic.questions.map((question) => ({ topic, question })),
);


