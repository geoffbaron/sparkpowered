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
  brand: "bluetti" | "lectron" | "autel" | "redodo" | "litime";
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
  detail: Block[];
  sources: Source[];
  /** Links that help the reader run the numbers for their own home. External ones open in a new tab. */
  tools?: { href: string; label: string }[];
  picks?: Pick[];
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
} satisfies Record<string, Source>;

// ---------------------------------------------------------------- figures read on QUESTIONS_UPDATED

/** EnergySage average installed price per watt before incentives, by state, read 2026-10-25 (S.esSolarCost). */
const SOLAR_PER_WATT: Record<string, number> = { MA: 2.9, NJ: 2.59, AZ: 2.26, FL: 2.12, TX: 2.25, OH: 2.58, MI: 2.88, WA: 2.49 };
const SOLAR_PER_WATT_US = 2.6;
/** Redodo 12V 100Ah price on redodopower.com, read 2026-10-25 (1 pack). */
const REDODO_100_PRICE_TODAY = 269.99;
/** Renogy 12V 100Ah AGM price on renogy.com, read 2026-10-25 (1 pack). */
const RENOGY_AGM_PRICE_TODAY = 208.99;
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
const e100 = productById("bluetti-elite-100-v2");
const e200 = productById("bluetti-elite-200-v2");
const e300 = productById("bluetti-elite-300");
const e30 = productById("bluetti-elite-30-v2");
const HEATER_W = 1500;

const lectron = chargerById("lectron-nexus-j1772");
const autel40 = chargerById("autel-elite-home-40a");

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
    slug: "home-solar",
    path: "/questions/home-solar",
    nav: "Home solar",
    h1: "Home solar questions, answered",
    title: "Is Solar Worth It in 2026? Home Solar Questions Answered With Sources",
    description:
      "Straight answers on home solar in 2026: payback without the tax credit, power outages, cloudy days and winter, how long panels last, net metering, panels for an EV and plug-in solar laws. Every answer cites its source.",
    intro:
      "The questions homeowners type into Google and ask on solar forums most, answered from the IRS, the Department of Energy, NREL's PVWatts model, EIA prices and EnergySage's price data. Short answer first, then the numbers.",
    related: [
      { href: "/solar-calculator", label: "Solar panel calculator", desc: "Size a system and see payback for your state." },
      { href: "/plug-in-solar", label: "Plug-in solar guide", desc: "Balcony kits, state laws and what they produce." },
      { href: "/solar-finder", label: "Solar Finder", desc: "Compare installers near you." },
      { href: "/home-battery-backup", label: "Home battery backup", desc: "Batteries for outages, sized and priced." },
    ],
    questions: [
      {
        id: "is-solar-worth-it-2026",
        q: "Is solar worth it in 2026 now that the tax credit is gone?",
        a: `It can still pay for itself, just more slowly. The 30% federal credit for homeowners is not available for systems installed after December 31, 2025, so you now pay the full price, which EnergySage puts at about ${usd2(SOLAR_PER_WATT_US)} a watt on average before incentives. At each state's own average price, and if every kWh your panels make replaces one you would have bought, a system pays back in about ${Math.round(fastPay.years)} years in ${fastPay.s.name} and about ${Math.round(slowPay.years)} years in ${slowPay.s.name}. A high electricity price and good sun shorten payback; a low price, less sun on your roof or a low credit for power you export lengthen it.`,
        detail: [
          { p: "Payback here is the installed price divided by one year of bill savings. It uses EnergySage's average price per watt in each state, our PVWatts estimate of what 1 kW of south-facing panels makes there, and EIA's average home electricity price. It assumes every kWh the panels make is worth the full retail rate, which is only true if you use it all yourself or your utility credits exports at full price." },
          {
            table: {
              caption: "Years for 1 kW of rooftop solar to pay for itself, before any state incentive",
              head: ["State", "Installed price per watt", "kWh a year from 1 kW", "Electricity price", "Payback"],
              rows: PAYBACK_STATES.map((x) => [x.s.name, usd2(x.perW), n0(x.s.solar.kwhPerKwYear), c1(x.s.electricity.residentialCentsPerKwhYtd), `about ${n1(x.years)} years`]),
            },
          },
          { p: "The Department of Energy lists what drives your own number: how much electricity you use, the size of the system, whether you buy or lease, how much sun your roof gets, your utility's rates and how much it pays for the extra power you send back. State and utility rebates, where they exist, shorten payback; DSIRE lists them." },
          { p: "Panels also lose a little output each year (see how long panels last, below), which stretches payback slightly." },
        ],
        sources: [S.irs25d, S.esSolarCost, S.pvwatts, S.eiaPrices, S.doeSolarGuide, S.dsire],
        tools: [
          { href: "/solar-calculator", label: "Solar calculator for your state" },
          { href: "/states", label: "Your state's energy data" },
        ],
      },
      {
        id: "solar-power-outage",
        q: "Do solar panels work during a power outage?",
        a: "Not on their own. A solar system installed without a battery stops producing during an outage, even on a sunny day, so it cannot feed power onto lines that utility crews expect to be dead. To keep power in an outage you need a battery system that runs your home as its own small 'energy island' while the grid is down, usually for the circuits you choose.",
        detail: [
          { p: "EnergySage gives two reasons a battery-free system shuts off. Solar output changes minute by minute, which the grid smooths out but your home's wiring and appliances could not handle alone. And the main one: line-worker safety. Solar inverters keep checking that the grid is up and shut the panels' output down when they cannot detect it." },
          { p: "Home batteries usually cannot run a whole house, so installers ask which circuits to back up and put them on a critical loads panel. A smart electric panel lets you change that later." },
        ],
        sources: [S.esResilience],
        tools: [
          { href: "/home-battery-backup", label: "Home battery backup guide" },
          { href: "/battery-calculator", label: "Home battery sizer" },
        ],
      },
      {
        id: "battery-with-solar",
        q: "Do I need a battery with solar panels?",
        a: `No. A grid-tied system works without one: the panels supply your home while the sun is up, and where your utility offers net metering the extra earns a bill credit. A battery adds backup power in outages and lets you use daytime solar at night. It also adds cost: EnergySage put home battery prices at about ${usd0(INSTALLED_BATTERY_COST.medianPerKwh)} per kWh in the first half of 2026, and the federal credit that covered battery storage ended after 2025.`,
        detail: [
          { p: "The Department of Energy describes storage as a way to use solar power when it is needed most, regardless of whether it's sunny at the time: at night, after dinner, or when the power goes out." },
          { p: `At that price, one ${POWERWALL_3_KWH} kWh battery is about ${usd0(INSTALLED_BATTERY_COST.medianPerKwh * POWERWALL_3_KWH)}. The IRS's Residential Clean Energy Credit listed battery storage technology of at least 3 kWh as a qualified expense, and is not available for property placed in service after December 31, 2025.` },
        ],
        sources: [S.doeSolarGuide, S.esH1, S.irs25d],
        tools: [{ href: "/battery-calculator", label: "Size a home battery" }],
      },
      {
        id: "cloudy-days-winter",
        q: "Do solar panels work on cloudy days and in winter?",
        a: `Yes, but output drops in winter, a lot in northern states. In our PVWatts model, which runs on ten years of real hourly weather, clouds included, 1 kW of south-facing panels in Michigan makes about ${n0(kwhJan(mi))} kWh in January against about ${n0(kwhJun(mi))} kWh in June. In Arizona the same panels still make about ${n0(kwhJan(az))} kWh in January. Size a system on its whole-year output, not a summer day.`,
        detail: [
          {
            table: {
              caption: "Monthly output of 1 kW of panels, south-facing roof, 20 degree tilt (PVWatts model)",
              head: ["State (city modeled)", "January", "June", "Whole year"],
              rows: [mi, wa, st("OH"), fl, az].map((s) => [`${s.name} (${s.solar.city})`, `${n0(kwhJan(s))} kWh`, `${n0(kwhJun(s))} kWh`, `${n0(s.solar.kwhPerKwYear)} kWh`]),
            },
          },
          { p: "Because output swings this much by season, solar calculators and installers size a system on its yearly total." },
        ],
        sources: [S.pvwatts, S.doeSolarGuide],
        tools: [{ href: "/solar-calculator", label: "Monthly output for your state" }],
      },
      {
        id: "how-long-solar-panels-last",
        q: "How long do solar panels last?",
        a: `There is no fixed end date: systems lose a little output each year. An NREL-led study of about 2,200 commercial, industrial and utility solar sites found a median performance loss of about 0.75% a year. At that rate a system still makes about ${Math.round(Math.pow(1 - FLEET_LOSS, 25) * 100)}% of its first-year output after 25 years. Check your panel warranty for the output the maker guarantees.`,
        detail: [
          { p: "The same study found the rate depends on climate, with panels degrading more slowly in cooler places, and that it did not differ much between module technologies." },
          { p: `For the arithmetic: losing 0.75% a year compounds to about ${Math.round(Math.pow(1 - FLEET_LOSS, 10) * 100)}% of the original output after 10 years and about ${Math.round(Math.pow(1 - FLEET_LOSS, 30) * 100)}% after 30. The study measured larger, non-home systems; home systems were not part of it.` },
        ],
        sources: [S.doeFleet],
      },
      {
        id: "what-is-net-metering",
        q: "What is net metering?",
        a: "Net metering is an arrangement between a solar owner and the utility that credits you for the solar power you send to the grid. How much each exported kWh is worth depends on your state's and your utility's rules, and the Department of Energy notes your savings depend on how much the utility pays for that extra power. Ask your utility, or an installer, exactly how it credits exports before you sign.",
        detail: [
          { p: "The Department of Energy suggests checking whether net metering is available in your service area, which system sizes and customer types qualify, the rates, and how the bill credits work." },
          { p: "DSIRE lists net metering and other solar policies by state." },
        ],
        sources: [S.doeSolarGuide, S.dsire],
        tools: [{ href: "/states", label: "Your state's energy data and incentive links" }],
      },
      {
        id: "solar-panels-to-charge-ev",
        q: "How many solar panels does it take to charge an EV?",
        a: `For 1,000 miles a month in a compact SUV like the ${typical.year} ${typical.make} ${typical.model} (${typical.kwhPer100mi} kWh per 100 miles, EPA), you need about ${n0(evYearKwh)} kWh a year. That is about ${n1(evKw(az))} kW of panels (${evPanels(az)} panels of ${PANEL_WATTS} W) in Arizona and about ${n1(evKw(wa))} kW (${evPanels(wa)} panels) in Washington. Panels make that energy in daytime, so unless the car charges at midday, net metering or a battery covers the timing.`,
        detail: [
          {
            table: {
              caption: `Solar to cover ${n0(MONTHLY_MILES)} miles a month of EV driving for a year`,
              head: ["Car (EPA kWh per 100 mi)", "kWh a year", "Arizona", "Florida", "Michigan", "Washington"],
              rows: REFERENCE_EVS.map((ev) => {
                const kwhYr = (ev.kwhPer100mi * MONTHLY_MILES * 12) / 100;
                const cell = (s: typeof mi) => `${n1(kwhYr / s.solar.kwhPerKwYear)} kW, ${Math.ceil((kwhYr / s.solar.kwhPerKwYear) * 1000 / PANEL_WATTS)} panels`;
                return [`${ev.make} ${ev.model} (${ev.kwhPer100mi})`, n0(kwhYr), cell(az), cell(fl), cell(mi), cell(wa)];
              }),
            },
          },
          { p: "Panel counts assume 400 W panels on an unshaded, south-facing roof at a 20 degree tilt, the same assumptions as our solar calculator." },
        ],
        sources: [S.fueleconomy, S.pvwatts, S.doeSolarGuide],
        tools: [
          { href: "/ev-charging-cost", label: "EV charging cost by state" },
          { href: "/solar-calculator", label: "Solar calculator" },
        ],
      },
      {
        id: "plug-in-solar-legal",
        q: "Is plug-in balcony solar legal in my state?",
        a: `As of our ${formatDate(LAW_REVIEWED)} review, ${lawStates.length} states have passed plug-in solar laws: ${listNames(lawInForce)} already, and ${listNames(lawLater)} from 2027. Most cap a kit at 1,200 W, and most require a kit certified by a testing lab. Elsewhere, connecting any generator to the grid falls under your utility's normal interconnection rules, so ask the utility first.`,
        detail: [
          {
            ul: [
              ...lawStates.map((l) => `${stateName(l.abbr)} (${l.bill}): ${l.statusText}.`),
              ...pendingStates.map((l) => `${stateName(l.abbr)} (${l.bill}): pending.`),
            ],
          },
          { p: "Each law sets its own rules on size, certification, notice to the utility and whether exported power earns credit. Our plug-in solar guide summarizes each one and links to the bill." },
        ],
        sources: lawStates.map((l) => ({ name: `${stateName(l.abbr)} ${l.bill} (state legislature)`, url: l.url })),
        tools: [{ href: "/plug-in-solar", label: "Plug-in solar guide and state law details" }],
      },
    ],
  },
  {
    slug: "home-batteries-backup",
    path: "/questions/home-batteries-backup",
    nav: "Home batteries & backup",
    h1: "Home battery and backup power questions, answered",
    title: "Home Battery and Power Station Questions: Outages, Fridges, Generators",
    description:
      "How long a home battery runs a house, whether it's worth it without solar, how long a power station runs a fridge or space heater, generators vs power stations, and why you never plug into a wall outlet. With sources.",
    intro:
      "What people ask before buying backup power, answered from makers' data sheets, EIA household data, Ready.gov, the Consumer Product Safety Commission and OSHA. Run times are our arithmetic from those figures.",
    wiring: true,
    related: [
      { href: "/home-battery-backup", label: "Home battery backup", desc: "Whole-home and plug-in systems, priced." },
      { href: "/best-portable-power-stations", label: "Best portable power stations", desc: "Every size, with real run times." },
      { href: "/power-station-for-refrigerator", label: "Power station for a fridge", desc: "Size one for your fridge." },
      { href: "/battery-calculator", label: "Home battery sizer", desc: "How much battery your home needs." },
    ],
    questions: [
      {
        id: "home-battery-without-solar",
        q: "Is a home battery worth it without solar?",
        a: `As backup power, it can be: a home battery keeps your chosen circuits running in an outage without fuel. As a money-saver it is a harder case. EnergySage put home battery prices at about ${usd0(INSTALLED_BATTERY_COST.medianPerKwh)} per kWh in the first half of 2026, so one ${POWERWALL_3_KWH} kWh Tesla Powerwall 3 comes to about ${usd0(INSTALLED_BATTERY_COST.medianPerKwh * POWERWALL_3_KWH)} at that rate, and homeowners can no longer claim the 30% federal credit for one installed after 2025.`,
        detail: [
          { p: "EnergySage says resiliency, backup power in an outage, is the main reason people install home storage, and that most batteries cannot back up a whole home, so you choose the circuits." },
          { p: `If you mainly want the fridge, lights, internet and a medical device through an outage, a plug-in power station is far cheaper: the 2 kWh Bluetti ${e200.model} was listed at ${usd0(e200.priceUsd ?? 0)} when we checked on ${formatDate(e200.retrieved)}, and you plug appliances straight into it. See the next questions for run times.` },
        ],
        sources: [S.esResilience, S.esH1, S.powerwall, S.irs25d],
        tools: [{ href: "/home-battery-backup", label: "Home battery backup guide" }],
      },
      {
        id: "home-battery-outage-hours",
        q: "How long will a home battery power my house in an outage?",
        a: `One ${POWERWALL_3_KWH} kWh battery, such as a Tesla Powerwall 3, runs the average US home for about ${Math.round((POWERWALL_3_KWH / usDailyKwh) * 24)} hours, because the average home uses about ${n0(usDailyKwh)} kWh a day (EIA, 2024). Cut back to essentials and it lasts days: a fridge, Wi-Fi, four LED bulbs for five hours and two phone charges come to about ${n1(essentialsKwh)} kWh a day, so the same battery covers about ${half(POWERWALL_3_KWH / essentialsKwh)} days of that.`,
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
      },
      {
        id: "power-station-refrigerator",
        q: "How long will a portable power station run a refrigerator?",
        a: `About ${Math.round(fridgeHours(e100.capacityWh))} hours on a 1 kWh station and about ${Math.round(fridgeHours(e200.capacityWh))} hours on a 2 kWh one, for an average fridge. The average US home's fridges use ${home.national.fridgeKwh} kWh a year (EIA), about ${Math.round(FRIDGE_AVG_W)} W averaged over the day, and a station delivers roughly ${Math.round(USABLE_FRACTION * 100)}% of its rated capacity after inverter losses. Ready.gov says a closed fridge keeps food cold for about four hours, so you can run it in shifts and stretch any battery.`,
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
        sources: [S.eiaRecs, S.ready, S.bluetti100, S.bluetti200, S.bluetti300],
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
        tools: [{ href: "/best-portable-power-stations", label: "Best portable power stations" }],
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
        sources: [S.bluetti30, S.bluetti100, S.bluetti200, S.bluetti300],
        tools: [{ href: "/space-heater-cost", label: "What a space heater costs to run" }],
      },
    ],
  },
  {
    slug: "ev-charging",
    path: "/questions/ev-charging",
    nav: "EV charging at home",
    h1: "Home EV charging questions, answered",
    title: "Home EV Charging Questions: Cost, Level 1 vs 2, Amps, Dryer Outlets",
    description:
      "What it costs to charge an EV at home in 2026, whether a regular outlet is enough, what size breaker a charger needs, plug-in vs hardwired, dryer outlets and permits. Answers from the DOE, EIA, EPA and charger makers.",
    intro:
      "The home charging questions EV owners ask most on Tesla Motors Club, the Mach-E and Lightning forums and in Google, answered from the Department of Energy, EIA prices, EPA efficiency data and the charger makers' installation guides.",
    wiring: true,
    related: [
      { href: "/ev-charging-cost", label: "EV charging cost calculator", desc: "Your car, your state, your miles." },
      { href: "/best-home-ev-charger", label: "Best home EV charger", desc: "Our picks at every price." },
      { href: "/ev-charger-installation-cost", label: "Charger installation cost", desc: "State averages and what adds to the bill." },
      { href: "/calculator", label: "EV Finder", desc: "Which EV fits how you drive." },
    ],
    questions: [
      {
        id: "cost-to-charge-ev-at-home",
        q: "How much does it cost to charge an EV at home?",
        a: `At the US average home electricity price of ${c1(rateC)} per kWh (EIA, ${ytdWindow()}), driving ${n0(MONTHLY_MILES)} miles a month costs about ${usd0(evMonth(efficient.kwhPer100mi))} in a ${efficient.make} ${efficient.model}, ${usd0(evMonth(typical.kwhPer100mi))} in a ${typical.make} ${typical.model} and ${usd0(evMonth(large.kwhPer100mi))} in a ${large.make} ${large.model} pickup. To work out yours, multiply your car's EPA kWh per 100 miles by your miles and your price per kWh. Home prices run from ${c1(cheapest.electricity.residentialCentsPerKwhYtd)} in ${cheapest.name} to ${c1(dearest.electricity.residentialCentsPerKwhYtd)} in ${dearest.name}.`,
        detail: [
          { p: "The Department of Energy's method is the same: cost per mile is your electricity price times the kWh the car uses per mile. It adds that actual costs depend on when and how long you charge, and that some utilities offer cheaper time-of-use rates for charging." },
          {
            table: {
              caption: `Monthly cost of ${n0(MONTHLY_MILES)} miles charged at home`,
              head: ["Car (EPA kWh per 100 mi)", `US average (${c1(rateC)})`, `${cheapest.name} (${c1(cheapest.electricity.residentialCentsPerKwhYtd)})`, `${dearest.name} (${c1(dearest.electricity.residentialCentsPerKwhYtd)})`],
              rows: REFERENCE_EVS.map((ev) => [
                `${ev.make} ${ev.model} (${ev.kwhPer100mi})`,
                usd0(evMonth(ev.kwhPer100mi)),
                usd0(evMonth(ev.kwhPer100mi, cheapest.electricity.residentialCentsPerKwhYtd / 100)),
                usd0(evMonth(ev.kwhPer100mi, dearest.electricity.residentialCentsPerKwhYtd / 100)),
              ]),
            },
          },
        ],
        sources: [S.eiaPrices, S.fueleconomy, S.afdcHome],
        tools: [{ href: "/ev-charging-cost", label: "EV charging cost calculator" }],
      },
      {
        id: "home-charging-vs-gas",
        q: "Is charging an EV at home cheaper than buying gas?",
        a: `${statesEvCheaper === STATES.length ? "Yes, in every state." : `In ${statesEvCheaper} of ${STATES.length} states and DC, yes.`} At national averages, ${n0(MONTHLY_MILES)} miles costs about ${usd0(evMonth(typical.kwhPer100mi))} of electricity in a ${typical.make} ${typical.model} against about ${usd0(gasMonth)} of gasoline in a ${NATIONAL.gasMpg} mpg car at ${usd2(NATIONAL.gasolineUsdPerGallon)} a gallon (EIA, week of ${gasWeek}). Using each state's own average electricity and gas prices, charging that EV at home costs less than gas in ${statesEvCheaper === STATES.length ? "all 50 states and DC" : `${statesEvCheaper} of the 50 states and DC`}.`,
        detail: [
          { p: `${NATIONAL.gasMpg} mpg is the typical new gasoline vehicle in EPA's Automotive Trends Report. A more efficient gas car narrows the gap and a pickup widens it; the calculator lets you pick your own car.` },
                  ],
        sources: [S.eiaPrices, S.eiaGas, S.fueleconomy, S.epaTrends],
        tools: [
          { href: "/ev-charging-cost", label: "EV vs gas in your state" },
          { href: "/go-electric", label: "Go Electric savings calculator" },
        ],
      },
      {
        id: "level-1-or-level-2",
        q: "Do I need a Level 2 charger, or is a regular outlet enough?",
        a: `A regular 120-volt outlet may be enough. The Department of Energy says Level 1 adds about 5 miles of range per hour, about 40 miles in 8 hours, and that many drivers meet their daily needs charging overnight that way, if there is an outlet on a dedicated circuit near where they park. Level 2 at 240 volts adds about 25 miles an hour, or up to ${lectron.milesPerHour} with a 40-amp charger like the Lectron NEXUS, and suits longer commutes, irregular schedules or cars with large batteries.`,
        detail: [
          { p: "The DOE gives a range of charging times from less than 20 minutes on a DC fast charger to 20 hours or more on Level 1, depending on how empty and how big the battery is, the car's built-in charger and the equipment." },
          { p: `A plug-in Level 2 charger needs a 240-volt outlet such as a NEMA 14-50; Lectron says a licensed electrician must install the outlet and a dedicated 240-volt circuit if you don't have one. The Lectron NEXUS was ${usd2(lectron.priceUsd)} on Lectron's site when we checked on October 25, 2026.` },
        ],
        sources: [S.afdcStations, S.afdcHome, S.lectron],
        tools: [
          { href: "/best-home-ev-charger", label: "Best home EV chargers" },
          { href: "/ev-charger-installation-cost", label: "What installation costs in your state" },
        ],
        picks: [{ brand: "lectron", label: "Lectron NEXUS 40A (J1772)", url: lectron.url, note: `Plugs into a NEMA 14-50; up to ${lectron.milesPerHour} miles of range an hour (Lectron)` }],
      },
      {
        id: "breaker-size-ev-charger",
        q: "What size breaker and how many amps do I need for a home EV charger?",
        a: "The circuit must be rated for 125% of what the charger draws, because EV charging is a continuous load under the National Electrical Code. That means a 32-amp charger on a 40-amp circuit, 40 amps on a 50-amp circuit and 48 amps on a 60-amp circuit. ChargePoint estimates 40 amps adds about 30 miles of range an hour and 48 amps about 36, and the Department of Energy notes that charging speed also depends on the car's built-in charger.",
        detail: [
          {
            table: {
              caption: "Charger setting, circuit and estimated range per hour (ChargePoint Home Flex table)",
              head: ["Charger draws", "Circuit breaker", "Range added per hour", "Plug-in allowed"],
              rows: [
                ["16 A", "20 A", "12 miles", "No, hardwire"],
                ["24 A", "30 A", "18 miles", "No, hardwire"],
                ["32 A", "40 A", "25 miles", "Yes"],
                ["40 A", "50 A", "30 miles", "Yes"],
                ["48 A", "60 A", "36 miles", "No, hardwire"],
              ],
            },
          },
          { p: "The Department of Energy notes most residential Level 2 chargers run at up to 30 amps and need a dedicated 40-amp circuit to meet NEC Article 625. If your panel has limited capacity, ChargePoint says a licensed electrician should pick the highest amperage it has room for; even 24 amps adds about 18 miles an hour, roughly 140 miles over 8 hours." },
        ],
        sources: [S.chargepoint, S.chargepointTips, S.afdcStations, S.afdcHome],
        tools: [{ href: "/ev-charger-installation-cost", label: "Charger installation cost" }],
      },
      {
        id: "nema-14-50-or-hardwired",
        q: "Should I use a NEMA 14-50 outlet or hardwire my EV charger?",
        a: `On a 50-amp NEMA 14-50 outlet the 125% rule caps charging at 40 amps, so faster chargers are hardwired. Hardwiring is also what ChargePoint recommends if local code requires a GFCI breaker for the outlet, and what Autel recommends for outdoor installs. EnergySage puts the cost difference between the two installs at about ${usd0(INSTALL_COST.hardwireVsPlug[0])} to ${usd0(INSTALL_COST.hardwireVsPlug[1])}.`,
        detail: [
          { p: "ChargePoint allows plug-in installs only on 40-amp and 50-amp circuits (32 or 40 amps of charging) and does not recommend a GFCI breaker with its Home Flex, because the charger has its own charging circuit interrupting device." },
          { p: `Both Lectron's NEXUS (${usd2(lectron.priceUsd)}) and Autel's MaxiCharger AC Elite Home 40A (${usd0(autel40.priceUsd)}), both on the makers' sites on October 25, 2026, plug into a 14-50; Autel's 50-amp version is hardwired.` },
        ],
        sources: [S.chargepoint, S.chargepointTips, S.autel40, S.installCost, S.lectron],
        tools: [{ href: "/best-home-ev-charger", label: "Plug-in and hardwired chargers compared" }],
        picks: [
          { brand: "lectron", label: "Lectron NEXUS 40A", url: lectron.url, note: "NEMA 14-50 plug-in, J1772 or Tesla plug" },
          { brand: "autel", label: "Autel MaxiCharger 40A", url: autel40.url, note: "NEMA 14-50 plug-in with app scheduling" },
        ],
      },
      {
        id: "dryer-outlet-ev",
        q: "Can I charge my EV from my dryer outlet?",
        a: "Only at a reduced rate. If your dryer outlet is on a 30-amp circuit (check the breaker), the 125% rule for continuous loads limits charging to 24 amps, which ChargePoint estimates adds about 18 miles of range an hour. That needs a charger you can set to 24 amps or lower, and since 24 amps is the circuit's whole continuous limit, nothing else should run on it while the car charges. Have a licensed electrician check the circuit before relying on it.",
        detail: [
          { p: "For faster charging, a new 40- or 50-amp circuit gives 32 or 40 amps (25 or 30 miles an hour, ChargePoint's estimates); the installation cost page shows what adding one costs in your state." },
          { p: "Lectron's portable charger adjusts from 8 to 40 amps and comes with plugs for an ordinary outlet and a NEMA 14-50; check that any adapter you use is rated for your outlet." },
        ],
        sources: [S.chargepoint, S.chargepointTips, S.afdcHome, S.lectronPortable],
        tools: [{ href: "/ev-charger-installation-cost", label: "Cost to add a charging circuit" }],
      },
      {
        id: "install-ev-charger-yourself",
        q: "Can I install a home EV charger myself, and do I need a permit?",
        a: "If you already have a suitable 240-volt outlet, a plug-in charger simply plugs in. Adding the outlet or circuit is electrician's work: Lectron says a licensed electrician must install the outlet and dedicated circuit, and the Department of Energy says installs must meet local and state codes and may need permits, sometimes with a site plan approved first. Your city or county building department can tell you what it requires.",
        detail: [
          { p: "The DOE adds that an electrician can tell you whether your home has enough electrical capacity, and can add circuits if it does not. EnergySage puts permits at about $50 to $800 depending on where you live." },
          { p: `The average home charger installation cost ${usd0(INSTALL_COST.usAverage)} in Qmerit's 2026 data published by EnergySage, before the charger itself.` },
        ],
        sources: [S.lectron, S.afdcHome, S.installCost],
        tools: [{ href: "/ev-charger-installation-cost", label: "Installation cost by state" }],
      },
    ],
  },
  {
    slug: "electric-boating",
    path: "/questions/electric-boating",
    nav: "Electric boating",
    h1: "Trolling motor and electric boat questions, answered",
    title: "Trolling Motor Battery and Electric Outboard Questions, Answered",
    description:
      "How long a trolling motor battery lasts, what size you need, lithium vs AGM, charging lithium with a regular charger, and how far electric outboards go. From Minn Kota's manual and the battery and motor makers.",
    intro:
      "The questions anglers ask on The Hull Truth, BassResource, Walleye Central and In-Depth Outdoors, answered from Minn Kota's manual and the battery and outboard makers' own specs. Run times are our arithmetic from those figures.",
    related: [
      { href: "/trolling-motor-battery-life", label: "Trolling motor runtime calculator", desc: "Your motor, your battery, your speed." },
      { href: "/best-trolling-motor-battery", label: "Best trolling motor batteries", desc: "Lithium picks for 12, 24 and 36 V." },
      { href: "/electric-outboard-motor", label: "Electric outboard motors", desc: "Range, price and running cost." },
      { href: "/charge-lithium-battery-on-boat", label: "Charging lithium on a boat", desc: "Chargers, alternators and solar." },
    ],
    questions: [
      {
        id: "trolling-motor-battery-life",
        q: "How long will a trolling motor battery last?",
        a: `Divide the battery's usable amp-hours by what the motor draws. A ${m55.thrustLb} lb, 12-volt Minn Kota draws up to ${m55.maxAmps} amps at full speed, so a 100Ah lithium battery runs it about ${n0(runtimeHours(m55, 1, 100))} hours flat out and about ${n0(runtimeHours(m55, 0.5, 100))} at half speed. A 100Ah AGM, which should only be run down halfway, gives about half that: ${n0(runtimeHours(m55, 1, agmUsableAh))} and ${n0(runtimeHours(m55, 0.5, agmUsableAh))} hours.`,
        detail: [
          {
            table: {
              caption: "Hours on a 100Ah battery, Minn Kota maximum draw",
              head: ["Motor", "Max draw", "Lithium, full speed", "Lithium, half speed", "AGM, half speed"],
              rows: MOTORS.filter((m) => m.volts === 12).map((m) => [m.label, `${m.maxAmps} A`, `${n1(runtimeHours(m, 1, 100))} h`, `${n1(runtimeHours(m, 0.5, 100))} h`, `${n1(runtimeHours(m, 0.5, agmUsableAh))} h`]),
            },
          },
          { p: "Half speed uses half the maximum draw, Newport's rule of thumb. Wind, current and a heavy boat raise the draw; slow trolling lowers it. Renogy advises not running its AGM below 50%." },
        ],
        sources: [S.minnKota, S.newport, S.renogyAgm],
        tools: [{ href: "/trolling-motor-battery-life", label: "Runtime calculator for your motor" }],
      },
      {
        id: "trolling-motor-battery-size",
        q: "What size battery do I need for my trolling motor?",
        a: "Match the voltage first, then pick capacity for your day. A 12-volt motor runs on one 12-volt battery; for 24 or 36 volts you wire two or three 12-volt batteries in series, or use one 24- or 36-volt lithium battery. Minn Kota recommends a deep-cycle marine battery of at least 105 amp-hours for its 12-volt Endura C2, and Redodo recommends its 12V 100Ah lithium for 30 to 70 lb thrust motors.",
        detail: [
          { p: "Connecting batteries in series raises the voltage; connecting them in parallel raises the capacity (Victron, Wiring Unlimited)." },
          { p: "Redodo says its 12V 100Ah gives the same usable energy as a 200Ah lead-acid battery, because it is rated for full discharge while Renogy advises not taking its AGM below 50%. Use the runtime calculator to check a battery against your motor and speed." },
        ],
        sources: [S.minnKota, S.redodo100, S.wiringUnlimited],
        tools: [
          { href: "/best-trolling-motor-battery", label: "Trolling motor battery picks" },
          { href: "/24v-vs-36v-trolling-motor", label: "24V vs 36V trolling motors" },
        ],
        picks: [{ brand: "redodo", label: "Redodo 12V 100Ah", url: redodo100.url, productId: redodo100.id, note: `For 30 to 70 lb thrust motors (Redodo); ${usd2(REDODO_100_PRICE_TODAY)} on October 25, 2026` }],
      },
      {
        id: "charge-lithium-regular-charger",
        q: "Can I charge a lithium trolling battery with a regular charger?",
        a: "Use a charger with a lithium (LiFePO4) setting. Redodo specifies a 14.6-volt LiFePO4 charger for its 12V 100Ah battery and says a 20-amp one refills it in about 5 hours. Before using a lead-acid or AGM mode, check that its voltages match the battery maker's charging spec; if they don't, buy a lithium charger.",
        detail: [
          { p: "Our boat charging guide covers onboard chargers, alternators and solar for 12, 24 and 36-volt setups." },
        ],
        sources: [S.redodo100],
        tools: [{ href: "/charge-lithium-battery-on-boat", label: "Charging lithium on a boat" }],
      },
      {
        id: "lithium-vs-agm-trolling",
        q: "Is lithium worth it over AGM for a trolling motor?",
        a: `Lithium wins on weight, usable capacity and life; AGM wins on up-front price. A Redodo 12V 100Ah lithium weighs ${REDODO_100_LB_TODAY} lb against ${n0(LEAD_ACID_REF.weightLb)} lb for a Renogy 100Ah AGM, lets you use all 100 amp-hours instead of about 50, and is rated for 4,000 cycles at full discharge against 500 cycles at 50% for the AGM. On October 25, 2026 the Redodo was ${usd2(REDODO_100_PRICE_TODAY)} and the Renogy ${usd2(RENOGY_AGM_PRICE_TODAY)}.`,
        detail: [
          { p: `Per usable amp-hour that is about ${usd2(REDODO_100_PRICE_TODAY / 100)} for the lithium and ${usd2(RENOGY_AGM_PRICE_TODAY / agmUsableAh)} for the AGM. Redodo backs its battery with a 5-year warranty.` },
        ],
        sources: [S.redodo100, S.renogyAgm],
        tools: [{ href: "/lithium-vs-agm-battery", label: "Lithium vs AGM calculator" }],
        picks: [{ brand: "redodo", label: "Redodo 12V 100Ah", url: redodo100.url, productId: redodo100.id, note: "4,000 cycles at 100% depth of discharge (Redodo)" }],
      },
      {
        id: "electric-outboard-range",
        q: "Are electric outboards worth it, and how far can they go?",
        a: `They make most sense on small boats at slow speed, where makers' ranges hold up, and they cost little to run. ePropulsion rates its 1 kW Spirit 1.0, with a ${n0(spirit.batteryWh)} Wh battery, at up to 22 miles at a steady 4.5 mph cruise; at full power the range is under 8 miles. An hour at full power on a 1 kW motor uses about ${usd2(ELECTRIC_HOUR_USD)} of electricity at the US average price, against about ${usd2(GAS_HOUR_USD)} of gas for Honda's 2.3 hp outboard, whose 0.29-gallon tank lasts up to 60 minutes at full throttle.`,
        detail: [
          { p: `ePropulsion's own run-time table for the Spirit shows how much speed costs: about 35 miles in 10 hours at 3.5 mph, 22 miles at 4.4 mph, and under 8 miles in 1.25 hours at full power (6.2 mph). Charging the Spirit's battery from empty costs about ${usd2((spirit.batteryWh / 1000) * (FUEL_PRICES.electricCentsPerKwh / 100))} at the US average price (EIA, ${FUEL_PRICES.electricMonth}).` },
          { p: "Our outboard guide compares Torqeedo, ePropulsion and Mercury models on price, range and running cost." },
        ],
        sources: [S.eprop, S.honda, S.eiaPrices, S.eiaGas],
        tools: [
          { href: "/electric-outboard-motor", label: "Electric outboard guide" },
          { href: "https://campervolts.com/questions/boats", label: "Wiring a boat's house battery (CamperVolts)" },
        ],
      },
    ],
  },
  {
    slug: "costs-and-incentives",
    path: "/questions/costs-and-incentives",
    nav: "Costs, credits & heat pumps",
    h1: "Electricity costs, tax credits and heat pump questions, answered",
    title: "2026 Tax Credits, Electricity Prices and Heat Pump Questions, Answered",
    description:
      "Which federal clean-energy tax credits are left in 2026, the EV and charger credits, whether a heat pump saves money over gas, cold-weather heat pumps, electricity prices by state and where to find state rebates.",
    intro:
      "The money questions behind going electric, answered from the IRS, EIA, ENERGY STAR and the federal efficiency standards. Every date and price below is one we read from the source.",
    related: [
      { href: "/incentives", label: "2026 incentives", desc: "Every federal end date, and state rebate links." },
      { href: "/go-electric", label: "Go Electric savings calculator", desc: "What each switch saves in your state." },
      { href: "/states", label: "Energy data by state", desc: "Prices, usage and solar for every state." },
      { href: "/space-heater-cost", label: "Space heater cost", desc: "What an hour of heat costs in your state." },
    ],
    questions: [
      {
        id: "solar-battery-tax-credit-2026",
        q: "Is there still a federal tax credit for solar panels or a home battery?",
        a: "Not for homeowners. The IRS says the 30% Residential Clean Energy Credit (section 25D), which covered solar panels and battery storage, is not allowed for expenditures made after December 31, 2025, and an expenditure counts as made when installation is completed. So a system finished in 2026 does not qualify, even if you paid in 2025.",
        detail: [
          { p: "The Energy Efficient Home Improvement Credit (25C), which covered qualified heat pumps, water heaters, exterior doors, windows and insulation, is not allowed for property placed in service after December 31, 2025. ENERGY STAR's heat pump page still describes a credit through 2032; the IRS's later guidance ends it after 2025." },
          { p: "If you lease solar or sign a power purchase agreement, the Department of Energy notes you are not entitled to the tax benefits, because you do not own the system." },
        ],
        sources: [S.irsFaq, S.irs25d, S.doeSolarGuide],
        tools: [{ href: "/incentives", label: "All 2026 federal end dates" }],
      },
      {
        id: "ev-charger-tax-credit-2026",
        q: "Is there a federal tax credit for an EV or a home charger in 2026?",
        a: "No. The IRS says the new clean vehicle credit (30D) and the used one (25E) are not allowed for vehicles acquired after September 30, 2025, and the charger credit (30C) is not allowed for property placed in service after June 30, 2026. A car counts as acquired once a written binding contract is signed and a payment, even a small down payment or a trade-in, has been made.",
        detail: [
          { p: "If you signed and paid before October 1, 2025, the IRS says you can still claim the credit when you take delivery, even after that date." },
          { p: "States and utilities still run their own EV and charger programs; see the rebate question below." },
        ],
        sources: [S.irsFaq],
        tools: [{ href: "/incentives", label: "Incentives and state links" }],
      },
      {
        id: "heat-pump-vs-gas-cost",
        q: "Does a heat pump save money compared with a gas furnace?",
        a: `It depends on your prices, and at US averages a minimum-efficiency heat pump costs more to run than gas. Heating the average gas-heated home costs about ${usd0(gasHeatCost)} a year with an 80% efficient furnace at ${usd2(home.national.gasUsdPerMcf)} per thousand cubic feet of gas, and about ${usd0(hpCost)} with a heat pump at the federal minimum rating and ${c1(rateC)} per kWh. Against electric baseboard or furnace heat, the same heat pump uses about ${Math.round(hpVsResistance * 100)}% less electricity, and it also does your cooling.`,
        detail: [
          { p: `We use the federal minimum heating rating for new split-system heat pumps (HSPF2 7.5, about ${n1(ASSUMPTIONS.heatPumpCop.value)} units of heat per unit of electricity over a season) and the 80% minimum furnace efficiency; a heat pump rated higher than the minimum costs less to run than shown. Gas price is EIA's 2025 residential average; household heating use is from EIA's 2020 Residential Energy Consumption Survey.` },
          { p: "ENERGY STAR lists lower energy bills from switching from electric resistance, propane and oil to a heat pump, and says a heat pump added to an existing furnace (dual fuel) lets you use each system based on costs. Your state's prices change the answer, which the Go Electric planner works out." },
        ],
        sources: [S.ecfr, S.eiaNatGas, S.eiaRecs, S.eiaPrices, S.energyStarHp],
        tools: [{ href: "/go-electric", label: "Heat pump savings in your state" }],
      },
      {
        id: "heat-pumps-cold-weather",
        q: "Do heat pumps work in cold weather?",
        a: "Yes, and cold-climate models are tested for it. ENERGY STAR certifies cold-climate air-source heat pumps with third-party verified performance down to 5°F, and says they keep working below that, though pairing one with backup heat is the most efficient way to cover the very coldest days. Ask your contractor for a Manual J load calculation so the system is sized for your home.",
        detail: [
          { p: "ENERGY STAR says many new certified heat pumps excel even in the coldest climates thanks to advanced compressors and refrigerants, and that a system that is too big or too small will struggle to keep you comfortable." },
        ],
        sources: [S.energyStarHp],
        tools: [{ href: "/myths", label: "Heat pump myths, answered" }],
      },
      {
        id: "electricity-price-by-state",
        q: "How much does electricity cost per kWh in my state?",
        a: `The US average home price was ${c1(rateC)} per kWh in ${ytdWindow()} (EIA). It ranges from ${c1(byPrice[0].electricity.residentialCentsPerKwhYtd)} in ${byPrice[0].name} and ${c1(byPrice[1].electricity.residentialCentsPerKwhYtd)} in ${byPrice[1].name} to ${c1(byPrice[byPrice.length - 2].electricity.residentialCentsPerKwhYtd)} in ${byPrice[byPrice.length - 2].name} and ${c1(dearest.electricity.residentialCentsPerKwhYtd)} in ${dearest.name}. Your own rate is on your bill: divide the energy charges by the kWh used.`,
        detail: [
          {
            table: {
              caption: `Average residential electricity price, ${ytdWindow()} (EIA)`,
              head: ["Cheapest states", "Price", "Most expensive states", "Price"],
              rows: [0, 1, 2, 3, 4].map((i) => {
                const lo = byPrice[i];
                const hi = byPrice[byPrice.length - 1 - i];
                return [lo.name, c1(lo.electricity.residentialCentsPerKwhYtd), hi.name, c1(hi.electricity.residentialCentsPerKwhYtd)];
              }),
            },
          },
          { p: "EIA's figure is the average revenue per kWh across all residential customers, so it includes fixed charges spread over usage. Every state's figure is on its state page." },
        ],
        sources: [S.eiaPrices],
        tools: [{ href: "/states", label: "Your state's electricity price" }],
      },
      {
        id: "why-electric-bill-high",
        q: "Why is my electric bill so high?",
        a: `Partly because prices are rising: the average US home paid ${c1(NATIONAL.residentialCentsPerKwhYtd)} per kWh in ${ytdWindow()}, up from ${c1(NATIONAL.residentialCentsPerKwhYtdPrevYear)} a year earlier, about ${Math.round(priceRise)}% more (EIA). The rest is how much you use: the average home used about ${n0(NATIONAL.avgMonthlyKwh)} kWh a month in 2024, for an average bill of ${usd2(NATIONAL.avgMonthlyBillUsd)}. ENERGY STAR says almost half of a typical household's energy bill goes to heating and cooling, so start there.`,
        detail: [
          { p: "Compare this month's kWh with the same month last year on your bill. If use jumped, look at heating, cooling and anything new; if the kWh are flat but the bill rose, it is the price." },
          { p: "The Go Electric planner shows what each switch, from a heat pump to an EV, would change on your bills in your state." },
        ],
        sources: [S.eiaPrices, S.eiaUsage, S.energyStarHp],
        tools: [
          { href: "/go-electric", label: "What would save you most" },
          { href: "/space-heater-cost", label: "What a space heater adds" },
        ],
      },
      {
        id: "state-rebates",
        q: "Where can I find state rebates for solar, EVs and heat pumps?",
        a: "Start with two free databases: DSIRE, operated by the N.C. Clean Energy Technology Center at N.C. State University, for solar, storage and efficiency programs, and the Department of Energy's Alternative Fuels Data Center for state EV and charger incentives. ENERGY STAR also has a rebate finder by ZIP code for certified products such as heat pumps, and the Department of Energy notes many utilities offer their own incentives.",
        detail: [
          { p: "Federal credits for homeowners have ended (see above), so state and utility programs are most of what is left. They change often; check the program's own page for current amounts and deadlines before you buy." },
        ],
        sources: [S.dsire, S.afdcLaws, S.energyStarHp, S.afdcHome],
        tools: [{ href: "/incentives", label: "State-by-state incentive links" }],
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
