import Anthropic from "@anthropic-ai/sdk";
import { cacheLife } from "next/cache";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface EVResult {
  name: string;
  range: number;
  price: string;
  type: string;
  highlight: string;
  seats: number;
  cargo: string;
  url: string;
}

export interface BatteryProduct {
  id: string;
  name: string;
  brand: string;
  kwh: number;
  maxKwh?: number;
  scalable: boolean;
  power_kw: number;
  warranty_years: number;
  price_low: number;
  price_high: number;
  solar_compatible: boolean;
  grid_tied: boolean;
  highlights: string[];
  learnMoreUrl: string;
}

// ── Fallback data (used when API is unavailable) ───────────────────────────

const FALLBACK_EVS: EVResult[] = [
  { name: "Chevrolet Equinox EV", range: 319, price: "$33,900", type: "SUV", highlight: "Best value family SUV with incredible range", seats: 5, cargo: "Large", url: "https://www.chevrolet.com/electric/equinox-ev" },
  { name: "Tesla Model 3", range: 358, price: "$38,990", type: "Sedan", highlight: "Best-selling EV with great range and tech", seats: 5, cargo: "Medium", url: "https://www.tesla.com/model3" },
  { name: "Tesla Model Y", range: 310, price: "$44,990", type: "SUV", highlight: "Versatile crossover with massive cargo space", seats: 5, cargo: "Large", url: "https://www.tesla.com/modely" },
  { name: "Hyundai Ioniq 5", range: 303, price: "$41,800", type: "SUV", highlight: "Ultra-fast charging and retro-futuristic design", seats: 5, cargo: "Large", url: "https://www.hyundaiusa.com/us/en/vehicles/ioniq-5" },
  { name: "Hyundai Ioniq 6", range: 361, price: "$42,450", type: "Sedan", highlight: "Aerodynamic design delivers outstanding range", seats: 5, cargo: "Medium", url: "https://www.hyundaiusa.com/us/en/vehicles/ioniq-6" },
  { name: "Ford Mustang Mach-E", range: 312, price: "$42,995", type: "SUV", highlight: "Sporty handling with family-friendly space", seats: 5, cargo: "Large", url: "https://www.ford.com/electric-vehicles/mach-e/" },
  { name: "Kia EV6", range: 310, price: "$42,600", type: "SUV", highlight: "Fun to drive with V2L power sharing", seats: 5, cargo: "Large", url: "https://www.kia.com/us/en/ev6" },
  { name: "Kia EV9", range: 304, price: "$54,900", type: "SUV", highlight: "Three-row electric SUV for large families", seats: 7, cargo: "Extra Large", url: "https://www.kia.com/us/en/ev9" },
  { name: "Rivian R1S", range: 321, price: "$75,900", type: "SUV", highlight: "Adventure-ready with incredible off-road capability", seats: 7, cargo: "Extra Large", url: "https://rivian.com/r1s" },
  { name: "Ford F-150 Lightning", range: 320, price: "$49,995", type: "Truck", highlight: "Work-ready electric truck with Pro Power Onboard", seats: 5, cargo: "Truck Bed", url: "https://www.ford.com/electric-vehicles/f-150-lightning/" },
  { name: "Rivian R1T", range: 328, price: "$69,900", type: "Truck", highlight: "Adventure truck with built-in camp kitchen", seats: 5, cargo: "Truck Bed", url: "https://rivian.com/r1t" },
  { name: "Chevrolet Silverado EV", range: 450, price: "$57,095", type: "Truck", highlight: "Massive range and available Midgate", seats: 5, cargo: "Truck Bed", url: "https://www.chevrolet.com/electric/silverado-ev" },
  { name: "Nissan Leaf", range: 212, price: "$28,140", type: "Hatchback", highlight: "Affordable and proven EV for city driving", seats: 5, cargo: "Medium", url: "https://www.nissanusa.com/vehicles/electric-cars/leaf.html" },
  { name: "Chevrolet Bolt EUV", range: 247, price: "$27,800", type: "Hatchback", highlight: "Most affordable EV with Super Cruise available", seats: 5, cargo: "Medium", url: "https://www.chevrolet.com/electric/bolt-ev" },
  { name: "Mini Cooper SE", range: 114, price: "$30,900", type: "Hatchback", highlight: "Fun city car with iconic style", seats: 4, cargo: "Small", url: "https://www.miniusa.com/model/electric-vehicles.html" },
  { name: "BMW iX", range: 324, price: "$87,100", type: "SUV", highlight: "Luxury electric SUV with cutting-edge tech", seats: 5, cargo: "Large", url: "https://www.bmwusa.com/vehicles/bmw-i-series/ix/bmw-ix.html" },
  { name: "Mercedes EQS Sedan", range: 350, price: "$104,400", type: "Sedan", highlight: "Ultra-luxury electric flagship with Hyperscreen", seats: 5, cargo: "Medium", url: "https://www.mbusa.com/en/vehicles/class/eqs/sedan" },
  { name: "Porsche Taycan", range: 246, price: "$92,250", type: "Sedan", highlight: "Performance EV with legendary Porsche handling", seats: 5, cargo: "Medium", url: "https://www.porsche.com/usa/models/taycan/" },
  { name: "Volkswagen ID.4", range: 275, price: "$39,735", type: "SUV", highlight: "Spacious and practical with solid value", seats: 5, cargo: "Large", url: "https://www.vw.com/en/models/id-4.html" },
  { name: "Toyota bZ4X", range: 252, price: "$42,000", type: "SUV", highlight: "Toyota reliability meets electric efficiency", seats: 5, cargo: "Large", url: "https://www.toyota.com/bz4x" },
];

// Fallback battery data — shown when live LLM research isn't available.
// Prices are approximate installed costs; the UI adds a disclaimer.
// When ANTHROPIC_API_KEY is set, getDailyBatteries() replaces this with
// freshly researched data every day.
const FALLBACK_BATTERIES: BatteryProduct[] = [
  {
    id: "ecoflow-delta-pro-3",
    name: "DELTA Pro 3",
    brand: "EcoFlow",
    kwh: 4.1, scalable: true, maxKwh: 48, power_kw: 4.0, warranty_years: 5,
    price_low: 2000, price_high: 3500, solar_compatible: true, grid_tied: false,
    highlights: ["No professional install required", "Expandable up to 48 kWh", "120V/240V dual output"],
    learnMoreUrl: "https://us.ecoflow.com/products/delta-pro-3-portable-power-station",
  },
  {
    id: "anker-solix-f3800",
    name: "SOLIX F3800 Plus",
    brand: "Anker",
    kwh: 3.84, scalable: true, maxKwh: 53.76, power_kw: 6.0, warranty_years: 5,
    price_low: 2600, price_high: 5000, solar_compatible: true, grid_tied: false,
    highlights: ["6 kW continuous output", "Expandable up to 53 kWh", "Often discounts to ~$2,600"],
    learnMoreUrl: "https://www.ankersolix.com/products/f3800-plus",
  },
  {
    id: "enphase-iq5p",
    name: "IQ Battery 5P",
    brand: "Enphase",
    kwh: 5.0, scalable: true, maxKwh: 30, power_kw: 3.84, warranty_years: 15,
    price_low: 7000, price_high: 10000, solar_compatible: true, grid_tied: true,
    highlights: ["15-year warranty — best in class", "Modular, add units as needed", "Microinverter architecture"],
    learnMoreUrl: "https://enphase.com/store/storage/gen3/iq-battery-5p",
  },
  {
    id: "tesla-powerwall-3",
    name: "Powerwall 3",
    brand: "Tesla",
    kwh: 13.5, scalable: true, maxKwh: 27, power_kw: 11.5, warranty_years: 10,
    price_low: 11000, price_high: 16000, solar_compatible: true, grid_tied: true,
    highlights: ["Built-in solar inverter", "11.5 kW continuous output", "Storm Watch auto backup"],
    learnMoreUrl: "https://www.tesla.com/powerwall",
  },
  {
    id: "sonnen-core-plus",
    name: "sonnenCore+",
    brand: "Sonnen",
    kwh: 10, scalable: true, maxKwh: 20, power_kw: 4.8, warranty_years: 10,
    price_low: 14000, price_high: 18000, solar_compatible: true, grid_tied: true,
    highlights: ["10,000 cycle warranty", "German LFP chemistry", "Virtual power plant capable"],
    learnMoreUrl: "https://www.sonnenusa.com/residential/sonnencoreplus",
  },
  {
    id: "generac-pwrcell-2",
    name: "PWRcell 2",
    brand: "Generac",
    kwh: 9, scalable: true, maxKwh: 18, power_kw: 9.0, warranty_years: 10,
    price_low: 17000, price_high: 25000, solar_compatible: true, grid_tied: true,
    highlights: ["9 kW continuous output", "Modular 9–18 kWh LFP", "Whole-home backup capable"],
    learnMoreUrl: "https://www.generac.com/solar-battery-solutions/pwrcell-2/",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractJson<T>(text: string): T | null {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

async function runResearch(prompt: string): Promise<string> {
  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];

  // Handle pause_turn: server-side web search may need multiple continuation rounds
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8096,
      tools: [{ type: "web_search_20260209", name: "web_search" }],
      messages,
    });

    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.type === "text" ? textBlock.text : "";
  }
  return "";
}

// ── Public cached functions ───────────────────────────────────────────────────

export async function getDailyEVs(): Promise<EVResult[]> {
  "use cache";
  cacheLife("days");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set — using fallback EV data");
    return FALLBACK_EVS;
  }

  try {
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });
    const text = await runResearch(
      `Today is ${today}. Search the web for the 20 most popular electric vehicles currently available for sale in the US. Cover a range of price points: affordable (under $35K), mid-range ($35–50K), premium ($50–80K), and luxury ($80K+). Include sedans, SUVs, trucks, and hatchbacks.

For each vehicle, find: current starting MSRP, EPA-rated range in miles, seating capacity, body type, relative cargo size, and the official manufacturer URL to configure or learn more.

Return ONLY a valid JSON array — no markdown, no explanation, no code fences:
[{"name":"Make Model","range":300,"price":"$XX,XXX","type":"SUV","highlight":"one brief selling-point sentence","seats":5,"cargo":"Large","url":"https://manufacturer.com/model"}]

Rules: type must be one of Sedan, SUV, Truck, Hatchback. cargo must be one of Small, Medium, Large, Extra Large, Truck Bed. range and seats must be numbers. Return exactly 20 items.`
    );

    const parsed = extractJson<EVResult[]>(text);
    if (parsed && Array.isArray(parsed) && parsed.length >= 10) {
      return parsed;
    }
    console.warn("getDailyEVs: could not parse response, using fallback");
    return FALLBACK_EVS;
  } catch (err) {
    console.error("getDailyEVs failed, using fallback:", err);
    return FALLBACK_EVS;
  }
}

export async function getDailyBatteries(): Promise<BatteryProduct[]> {
  "use cache";
  cacheLife("days");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set — using fallback battery data");
    return FALLBACK_BATTERIES;
  }

  try {
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });
    const text = await runResearch(
      `Today is ${today}. Search the web for the best home battery storage options currently available in the US, covering ALL budget levels — from portable power stations to whole-home grid-tied systems.

Find at least:
- 3 affordable options ($1,500–$6,000 per unit, no professional install needed): e.g. EcoFlow DELTA Pro 3, Anker SOLIX F3800 Plus, Bluetti Apex 300, Goal Zero Yeti
- 3 mid-range professional systems ($6,000–$16,000 installed): e.g. Enphase IQ Battery 5P, Tesla Powerwall 3
- 3 premium whole-home systems ($16,000+ installed): e.g. Generac PWRcell 2, Sonnen sonnenCore+, LG RESU Prime, Franklin WH aPower 2

For each: verify the current price on the manufacturer website, check if the product is still available (skip discontinued products), and get the exact product page URL.

Return ONLY a valid JSON array — no markdown, no explanation, no code fences:
[{"id":"brand-model-slug","name":"Exact Product Name","brand":"Brand Name","kwh":4.1,"maxKwh":48,"scalable":true,"power_kw":4.0,"warranty_years":5,"price_low":2000,"price_high":3500,"solar_compatible":true,"grid_tied":false,"highlights":["one short feature","one short feature","one short feature"],"learnMoreUrl":"https://exact-product-page-url.com"}]

Rules: id is lowercase-hyphen-slug. All numeric fields are numbers not strings. price_low/price_high are realistic installed costs in USD integers — do not understate. grid_tied:false for portable/DIY systems. highlights is exactly 3 short strings. Return 9–12 items total.`
    );

    const parsed = extractJson<BatteryProduct[]>(text);
    if (parsed && Array.isArray(parsed) && parsed.length >= 4) {
      return parsed;
    }
    console.warn("getDailyBatteries: could not parse LLM response, using fallback");
    return FALLBACK_BATTERIES;
  } catch (err) {
    console.error("getDailyBatteries failed, using fallback:", err);
    return FALLBACK_BATTERIES;
  }
}
