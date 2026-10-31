import Anthropic from "@anthropic-ai/sdk";
import { cacheLife } from "next/cache";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface EVResult {
  name: string;
  /** Range from automated research; superseded by `epa` when a match exists. */
  range: number;
  price: string;
  type: string;
  highlight: string;
  seats: number;
  cargo: string;
  url: string;
  /** Official EPA figures from fueleconomy.gov, attached server-side by the EV Finder page. */
  epa?: {
    label: string;
    rangeMin: number;
    rangeMax: number;
    kwhMin: number;
    kwhMax: number;
  } | null;
}


// ── Fallback data (used when API is unavailable) ───────────────────────────
// Prices here are indicative starting MSRPs and are not refreshed
// automatically; the UI labels them as approximate and shows EPA range from
// fueleconomy.gov wherever a model can be matched. Reviewed 15 Oct 2026:
// removed the F-150 Lightning (Ford ended production Dec 2025) and the
// electric MINI Cooper (not sold in the US); Bolt price per GM's 2027 launch.

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
  { name: "Rivian R1T", range: 328, price: "$69,900", type: "Truck", highlight: "Adventure truck with built-in camp kitchen", seats: 5, cargo: "Truck Bed", url: "https://rivian.com/r1t" },
  { name: "Chevrolet Silverado EV", range: 450, price: "$57,095", type: "Truck", highlight: "Massive range and available Midgate", seats: 5, cargo: "Truck Bed", url: "https://www.chevrolet.com/electric/silverado-ev" },
  { name: "Nissan Leaf", range: 303, price: "$29,990", type: "SUV", highlight: "Redesigned as a crossover with 300+ miles and a NACS port", seats: 5, cargo: "Medium", url: "https://www.nissanusa.com/vehicles/electric-cars/leaf.html" },
  { name: "Chevrolet Bolt", range: 262, price: "$29,990", type: "Hatchback", highlight: "One of the least expensive new EVs in the US", seats: 5, cargo: "Medium", url: "https://www.chevrolet.com/electric/bolt-ev" },
  { name: "BMW iX", range: 324, price: "$87,100", type: "SUV", highlight: "Luxury electric SUV with cutting-edge tech", seats: 5, cargo: "Large", url: "https://www.bmwusa.com/vehicles/bmw-i-series/ix/bmw-ix.html" },
  { name: "Mercedes EQS Sedan", range: 350, price: "$104,400", type: "Sedan", highlight: "Ultra-luxury electric flagship with Hyperscreen", seats: 5, cargo: "Medium", url: "https://www.mbusa.com/en/vehicles/class/eqs/sedan" },
  { name: "Porsche Taycan", range: 246, price: "$92,250", type: "Sedan", highlight: "Performance EV with legendary Porsche handling", seats: 5, cargo: "Medium", url: "https://www.porsche.com/usa/models/taycan/" },
  { name: "Volkswagen ID.4", range: 275, price: "$39,735", type: "SUV", highlight: "Spacious and practical with solid value", seats: 5, cargo: "Large", url: "https://www.vw.com/en/models/id-4.html" },
  { name: "Toyota bZ", range: 314, price: "$34,900", type: "SUV", highlight: "Toyota's updated electric crossover", seats: 5, cargo: "Large", url: "https://www.toyota.com/bz/" },
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

  // Never research during `next build`: a web-search run can outlast the
  // prerender cache timeout and fail the whole deploy (Oct 31 2026). The
  // build ships the fallback list; the cache refreshes it after it expires.
  if (process.env.NEXT_PHASE === "phase-production-build") {
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
