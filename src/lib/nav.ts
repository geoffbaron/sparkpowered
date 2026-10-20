// Site header navigation. Kept in a plain (non-client) module so both the
// client Header and any server page can import it safely.

export type NavLink = { href: string; label: string };
export type NavGroup = { id: string; label: string; links: NavLink[] };

export const NAV_CTA: NavLink = { href: "/go-electric", label: "See what you'd save" };

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "cars",
    label: "Cars",
    links: [
      { href: "/calculator", label: "Electric cars" },
      { href: "/best-home-ev-charger", label: "EV chargers" },
      { href: "/ev-charging-cost", label: "EV charging cost" },
      { href: "/ev-charger-installation-cost", label: "Charger install cost" },
    ],
  },
  {
    id: "home",
    label: "Home Energy",
    links: [
      { href: "/solar-calculator", label: "Solar" },
      { href: "/plug-in-solar", label: "Plug-in solar" },
      { href: "/home-battery-backup", label: "Home batteries" },
      { href: "/best-portable-power-stations", label: "Backup power" },
    ],
  },
  {
    id: "outdoors",
    label: "Outdoors",
    links: [
      { href: "/lithium-rv-battery", label: "RV batteries" },
      { href: "/boating", label: "Boating" },
      { href: "/best-trolling-motor-battery", label: "Trolling motor batteries" },
      { href: "/best-power-station-for-cpap", label: "CPAP power" },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    links: [
      { href: "/myths", label: "Myths" },
      { href: "/states", label: "States" },
      { href: "/compare", label: "Compare" },
      { href: "/incentives", label: "Incentives" },
    ],
  },
];
