// Site header navigation. Kept in a plain (non-client) module so both the
// client Header and any server page can import it safely.

export type NavLink = { href: string; label: string };
/** `hub` is the section's own landing page, linked from the menu heading. */
export type NavGroup = { id: string; label: string; hub: NavLink; links: NavLink[] };

export const NAV_CTA: NavLink = { href: "/go-electric", label: "See what you'd save" };

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "cars",
    hub: { href: "/electric-vehicles", label: "All electric car & e-bike guides" },
    label: "Cars & bikes",
    links: [
      { href: "/calculator", label: "Electric cars" },
      { href: "/ev-or-plug-in-hybrid", label: "EV or plug-in hybrid?" },
      { href: "/best-home-ev-charger", label: "EV chargers" },
      { href: "/ev-charger-picker", label: "Which charger do I need?" },
      { href: "/ev-charging-cost", label: "EV charging cost" },
      { href: "/ev-charger-installation-cost", label: "Charger install cost" },
      { href: "/e-bikes", label: "E-bikes" },
    ],
  },
  {
    id: "home",
    hub: { href: "/home-energy", label: "All home energy guides" },
    label: "Home Energy",
    links: [
      { href: "/solar-calculator", label: "Solar" },
      { href: "/plug-in-solar", label: "Plug-in solar" },
      { href: "/home-battery-backup", label: "Home batteries" },
      { href: "/best-portable-power-stations", label: "Backup power" },
      { href: "/space-heater-cost", label: "Space heater cost" },
      { href: "/christmas-lights-cost", label: "Christmas lights cost" },
    ],
  },
  {
    id: "outdoors",
    hub: { href: "/outdoor-power", label: "All RV, boat & camping guides" },
    label: "Outdoors",
    links: [
      { href: "/lithium-rv-battery", label: "RV batteries" },
      { href: "/boating", label: "Boating" },
      { href: "/best-trolling-motor-battery", label: "Trolling motor batteries" },
      { href: "/best-power-station-for-cpap", label: "CPAP power" },
    ],
  },
  {
    id: "offgrid",
    hub: { href: "/off-grid", label: "All off-grid & prep guides" },
    label: "Off Grid",
    links: [
      { href: "/off-grid-solar-calculator", label: "Off-grid solar" },
      { href: "/off-grid-cabin-solar-kit", label: "Cabin solar kits" },
      { href: "/power-outage-backup-calculator", label: "Outage backup" },
      { href: "/emergency-water-storage-calculator", label: "Water storage" },
      { href: "/best-emergency-water-filters", label: "Water filters" },
      { href: "/emergency-kit-checklist", label: "Emergency kit" },
    ],
  },
  {
    id: "learn",
    hub: { href: "/learn", label: "Everything in Learn" },
    label: "Learn",
    links: [
      { href: "/solartopia", label: "Solartopia (game)" },
      { href: "/myths", label: "Myths" },
      { href: "/states", label: "States" },
      { href: "/compare", label: "Compare" },
      { href: "/incentives", label: "Incentives" },
      { href: "/questions", label: "Questions answered" },
      { href: "/ask", label: "Ask Spark" },
    ],
  },
];
