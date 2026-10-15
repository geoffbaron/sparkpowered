/**
 * Solar installers shown by the Solar Finder.
 *
 * Only companies whose websites were reachable and that were still selling
 * residential solar when this list was last reviewed are included. Removed on
 * 15 Oct 2026: ADT Solar (ADT exited residential solar, Jan 2024), Sunnova
 * (Chapter 11, June 2025), Elevation (website unreachable) and the SunPower
 * dealer locator (page no longer exists).
 *
 * Service areas are what each company has published and can change; the UI
 * tells visitors to confirm coverage on the company's own site. We do not list
 * phone numbers, certifications or ratings we have not verified.
 *
 * MONETIZATION: a "featured" tier can be added later for paid placement, but
 * it must be visibly labelled as paid on the page.
 */

export type InstallerTier = "featured" | "listed";

export interface Installer {
  id: string;
  name: string;
  website: string;
  headquarters: string;
  /** 2-letter state codes the company says it serves. Empty when nationwide. */
  states: string[];
  nationwide: boolean;
  services: string[];
  description: string;
  tier: InstallerTier;
}

export const INSTALLERS_REVIEWED = "2026-10-15";

const installers: Installer[] = [
  {
    id: "sunrun",
    name: "Sunrun",
    website: "https://www.sunrun.com",
    headquarters: "San Francisco, CA",
    states: [],
    nationwide: true,
    services: ["Solar panels", "Home batteries", "EV chargers"],
    description: "Large residential solar and battery company offering purchase, loan, lease and power purchase agreement options.",
    tier: "listed",
  },
  {
    id: "tesla-energy",
    name: "Tesla Energy",
    website: "https://www.tesla.com/energy",
    headquarters: "Austin, TX",
    states: [],
    nationwide: true,
    services: ["Solar panels", "Solar Roof", "Powerwall battery"],
    description: "Sells solar panels, Solar Roof and Powerwall batteries online, installed by Tesla or certified installers depending on location.",
    tier: "listed",
  },
  {
    id: "palmetto",
    name: "Palmetto",
    website: "https://palmetto.com",
    headquarters: "Charleston, SC",
    states: [],
    nationwide: true,
    services: ["Solar panels", "Home batteries"],
    description: "Residential solar company that sells systems and financing and works with a network of local installation partners.",
    tier: "listed",
  },
  {
    id: "momentum-solar",
    name: "Momentum Solar",
    website: "https://www.momentumsolar.com",
    headquarters: "South Plainfield, NJ",
    states: ["NJ", "NY", "CT", "PA", "FL", "TX", "CA", "AZ", "NV", "NM", "CO", "IL", "GA", "SC", "NC"],
    nationwide: false,
    services: ["Solar panels", "Home batteries"],
    description: "Residential solar company handling design, installation and monitoring.",
    tier: "listed",
  },
  {
    id: "freedom-solar",
    name: "Freedom Solar Power",
    website: "https://www.freedomsolarpower.com",
    headquarters: "Austin, TX",
    states: ["TX", "FL", "CO", "NC", "VA"],
    nationwide: false,
    services: ["Solar panels", "Home batteries", "EV chargers"],
    description: "Regional residential and commercial solar installer.",
    tier: "listed",
  },
  {
    id: "blue-raven",
    name: "Blue Raven Solar",
    website: "https://www.blueravensolar.com",
    headquarters: "Orem, UT",
    states: ["UT", "ID", "OR", "WA", "CO", "MN", "WI", "IL", "IN", "OH", "MI", "NC", "SC", "VA", "MD", "PA", "NJ", "NY"],
    nationwide: false,
    services: ["Solar panels", "Home batteries"],
    description: "Residential solar installer operating in multiple regions.",
    tier: "listed",
  },
];

export default installers;

/** Installers serving a state (or all nationwide ones), paid placements first, then A–Z. */
export function searchInstallers(state: string | null): Installer[] {
  const matches = installers.filter((i) => i.nationwide || (state ? i.states.includes(state) : false));
  return matches.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier === "featured" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
