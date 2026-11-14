/**
 * The home-backup cluster: running a house from a big portable battery.
 * The /home-backup hub, homepage block and related links read this list, so a page
 * appears there only once its `live` flag is set (pages ship one at a time).
 * Plain values only, so server and client code can both import it.
 */

export interface HomeBackupPage {
  href: string;
  title: string;
  desc: string;
  kind: "guide" | "compare" | "tool";
  /** Set true in the commit that ships the page. */
  live: boolean;
}

export const HOME_BACKUP_PAGES: HomeBackupPage[] = [
  { href: "/home-backup/hookup-picker", title: "Hookup picker", desc: "Five questions: how to connect a battery to your house, what size, and the parts", kind: "tool", live: true },
  { href: "/home-backup/anker-solix-f3800-plus-hookup", title: "Anker SOLIX F3800 Plus hookup", desc: "Inlet box, Anker's transfer switch or the Home Power Panel", kind: "guide", live: true },
  { href: "/home-backup/bluetti-apex-300-hookup", title: "Bluetti Apex 300 hookup", desc: "AT1, interlock or manual transfer switch, and the neutral question", kind: "guide", live: true },
  { href: "/compare/growatt-helios-3600-vs-bluetti-apex-300", title: "Growatt HELIOS 3600 vs Bluetti Apex 300", desc: "Built on the 240 V question", kind: "compare", live: true },
  { href: "/home-backup/well-pump", title: "Power station for a well pump", desc: "Starting and running watts from the pump's nameplate", kind: "guide", live: true },
  { href: "/home-backup/pellet-stove", title: "Power station for a pellet stove", desc: "Igniter vs running watts and switchover time", kind: "guide", live: true },
  { href: "/home-backup/bluetti-elite-200-v2-solar-panels", title: "Bluetti Elite 200 V2 solar panels", desc: "Which panels fit its input limits, series or parallel", kind: "guide", live: true },
];

export const liveHomeBackupPages = () => HOME_BACKUP_PAGES.filter((p) => p.live);

/** The hub every cluster page sits under: use it as the breadcrumb parent. */
export const HOME_BACKUP_HUB = { name: "Home backup", path: "/home-backup" } as const;
