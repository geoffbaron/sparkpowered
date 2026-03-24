/**
 * Spark Powered — Solar Installer Database
 *
 * This is the canonical installer registry. There are two tiers:
 *   "featured"  — paid listing, appears first, gets a badge
 *   "listed"    — free/basic listing, appears after featured
 *
 * MONETIZATION: charge installers $X/month to be featured, or $Y/lead.
 * To add a new installer, add an entry below and deploy.
 *
 * Currently seeded with real national companies. Local installers can
 * register via the /register-installer page (TODO).
 */

export type InstallerTier = "featured" | "listed";

export interface Installer {
  id: string;
  name: string;
  website: string;
  phone: string;
  city: string;
  states: string[];       // 2-letter state codes this company serves
  nationwide: boolean;    // true = show regardless of state lookup
  services: string[];
  certifications: string[];
  description: string;
  tier: InstallerTier;
  founded?: number;
}

const installers: Installer[] = [
  // ── National installers (real companies) ─────────────────────────────────

  {
    id: "sunrun",
    name: "Sunrun",
    website: "https://www.sunrun.com",
    phone: "1-855-478-6786",
    city: "San Francisco, CA",
    states: [],
    nationwide: true,
    services: ["Solar Panels", "Home Batteries", "EV Chargers"],
    certifications: ["NABCEP Certified Installers", "BBB Accredited"],
    description: "America's largest home solar and battery company. Offers purchase, loan, lease, and power purchase agreement options. Free online quote.",
    tier: "listed",
    founded: 2007,
  },
  {
    id: "tesla-energy",
    name: "Tesla Energy",
    website: "https://www.tesla.com/energy",
    phone: "1-877-798-3752",
    city: "Palo Alto, CA",
    states: [],
    nationwide: true,
    services: ["Solar Panels", "Solar Roof", "Powerwall Battery", "EV Chargers"],
    certifications: ["Tesla Certified"],
    description: "Solar panels, Solar Roof, and Powerwall home battery. Seamlessly integrated with Tesla vehicles. Order online with transparent pricing.",
    tier: "listed",
    founded: 2015,
  },
  {
    id: "sunnova",
    name: "Sunnova",
    website: "https://www.sunnova.com",
    phone: "1-866-786-6682",
    city: "Houston, TX",
    states: [],
    nationwide: true,
    services: ["Solar Panels", "Home Batteries", "EV Chargers"],
    certifications: ["NABCEP Certified Installers"],
    description: "Solar + battery service plans with 25-year coverage. One of the largest solar energy services companies in the US with a network of local dealers.",
    tier: "listed",
    founded: 2012,
  },
  {
    id: "palmetto",
    name: "Palmetto",
    website: "https://palmetto.com",
    phone: "1-855-339-7765",
    city: "Charleston, SC",
    states: [],
    nationwide: true,
    services: ["Solar Panels", "Home Batteries", "Energy Monitoring"],
    certifications: ["NABCEP Certified Installers", "BBB Accredited"],
    description: "Technology-forward solar company offering real-time energy monitoring and a 25-year performance guarantee. Works with a vetted network of local installers.",
    tier: "listed",
    founded: 2016,
  },
  {
    id: "momentum-solar",
    name: "Momentum Solar",
    website: "https://www.momentumsolar.com",
    phone: "1-888-MAY-SOLAR",
    city: "South Plainfield, NJ",
    states: ["NJ", "NY", "CT", "PA", "FL", "TX", "CA", "AZ", "NV", "NM", "CO", "IL", "GA", "SC", "NC"],
    nationwide: false,
    services: ["Solar Panels", "Home Batteries"],
    certifications: ["NABCEP Certified", "BBB Accredited"],
    description: "Full-service residential solar company offering design, installation, and monitoring. Specializes in no-money-down options.",
    tier: "listed",
    founded: 2009,
  },

  // ── Regional leaders (real companies) ────────────────────────────────────

  {
    id: "freedom-solar",
    name: "Freedom Solar Power",
    website: "https://www.freedomsolarpower.com",
    phone: "1-800-504-2337",
    city: "Austin, TX",
    states: ["TX", "FL", "CO", "NC", "VA"],
    nationwide: false,
    services: ["Solar Panels", "Home Batteries", "EV Chargers", "Roof Assessment"],
    certifications: ["NABCEP Certified", "SunPower Elite Dealer", "Tesla Powerwall Certified"],
    description: "Top-rated regional installer in TX, FL, CO, NC, and VA. SunPower elite dealer with in-house installation teams and no subcontracting.",
    tier: "listed",
    founded: 2007,
  },
  {
    id: "blue-raven",
    name: "Blue Raven Solar",
    website: "https://www.blueravensolar.com",
    phone: "1-800-377-4955",
    city: "Orem, UT",
    states: ["UT", "ID", "OR", "WA", "CO", "MN", "WI", "IL", "IN", "OH", "MI", "NC", "SC", "VA", "MD", "PA", "NJ", "NY"],
    nationwide: false,
    services: ["Solar Panels", "Home Batteries"],
    certifications: ["NABCEP Certified", "BBB A+"],
    description: "Fast-growing regional installer with in-house crews across 18 states. Known for competitive pricing and quick installation timelines.",
    tier: "listed",
    founded: 2014,
  },
  {
    id: "elevation-solar",
    name: "Elevation",
    website: "https://elevation.solar",
    phone: "1-855-436-2852",
    city: "Tempe, AZ",
    states: ["AZ", "CO", "NM", "TX", "UT", "NV"],
    nationwide: false,
    services: ["Solar Panels", "Home Batteries", "EV Chargers"],
    certifications: ["NABCEP Certified", "Tesla Powerwall Certified", "Enphase Platinum"],
    description: "Southwest specialist with in-house installation and monitoring. Strong focus on battery storage and whole-home electrification.",
    tier: "listed",
    founded: 2010,
  },
  {
    id: "adt-solar",
    name: "ADT Solar",
    website: "https://www.adtsolar.com",
    phone: "1-855-478-6786",
    city: "Knoxville, TN",
    states: ["FL", "GA", "AL", "TN", "NC", "SC", "VA", "TX", "CO", "AZ", "NV", "CA", "OR", "WA"],
    nationwide: false,
    services: ["Solar Panels", "Home Batteries", "Smart Home Integration"],
    certifications: ["NABCEP Certified", "BBB Accredited"],
    description: "Backed by ADT's 145-year reliability reputation. Offers solar + home security bundles with 25-year warranties.",
    tier: "listed",
    founded: 2014,
  },
  {
    id: "sunpower-dealers",
    name: "SunPower by Dealers",
    website: "https://www.sunpower.com/find-a-dealer",
    phone: "1-800-786-7693",
    city: "San Jose, CA",
    states: [],
    nationwide: true,
    services: ["Solar Panels", "Home Batteries"],
    certifications: ["SunPower Certified", "NABCEP Certified Installers"],
    description: "SunPower panels are the most efficient residential panels available. Their dealer network connects you with locally vetted, certified installers in your area.",
    tier: "listed",
    founded: 1985,
  },
];

export default installers;

/**
 * Search installers by state, returning featured first.
 * Falls back to nationwide installers if no state-specific ones found.
 */
export function searchInstallers(state: string | null): Installer[] {
  if (!state) {
    return installers
      .filter((i) => i.nationwide)
      .sort((a, b) => (a.tier === "featured" ? -1 : b.tier === "featured" ? 1 : 0));
  }

  const stateMatches = installers.filter(
    (i) => i.nationwide || i.states.includes(state)
  );

  // Featured first, then alphabetical
  return stateMatches.sort((a, b) => {
    if (a.tier === "featured" && b.tier !== "featured") return -1;
    if (b.tier === "featured" && a.tier !== "featured") return 1;
    return a.name.localeCompare(b.name);
  });
}
