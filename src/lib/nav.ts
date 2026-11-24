// Site header navigation. Kept in a plain (non-client) module so both the
// client Header and any server page can import it safely.
// Nov 24 2026: the site covers one subject, home backup in an outage.

export type NavLink = { href: string; label: string };
/** `hub` is the section's own landing page, linked from the menu heading. */
export type NavGroup = { id: string; label: string; hub: NavLink; links: NavLink[] };

export const NAV_CTA: NavLink = { href: "/power-outage-backup-calculator", label: "Size your backup" };

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "hookup",
    hub: { href: "/home-backup", label: "The four ways to connect a battery" },
    label: "Connect to the house",
    links: [
      { href: "/home-backup/hookup-picker", label: "Hookup picker" },
      { href: "/home-backup/anker-solix-f3800-plus-hookup", label: "Anker F3800 Plus hookup" },
      { href: "/home-backup/bluetti-apex-300-hookup", label: "Bluetti Apex 300 hookup" },
      { href: "/home-battery-backup", label: "Whole-home vs portable" },
    ],
  },
  {
    id: "runs",
    hub: { href: "/power-outage-backup-calculator", label: "Outage backup calculator" },
    label: "What it runs",
    links: [
      { href: "/home-backup/well-pump", label: "Well pump" },
      { href: "/home-backup/pellet-stove", label: "Pellet stove" },
      { href: "/power-station-for-refrigerator", label: "Refrigerator" },
      { href: "/battery-calculator", label: "Home battery size" },
      { href: "/generator-runtime-calculator", label: "Generator runtime" },
      { href: "/compare", label: "Comparisons" },
      { href: "/questions/home-batteries-backup", label: "Questions answered" },
    ],
  },
];
