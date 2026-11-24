/**
 * Pages removed in the Nov 24 2026 narrowing (Geoff: "cut them"; plan in
 * ~/Grant/revenue/seo-reset-2026-11-24.md). Spark Powered now covers one
 * subject: keeping a home powered in an outage.
 *
 * Every removed address answers with a permanent 301 to the closest page that
 * still exists (or, for RV battery pages, the matching CamperVolts guide).
 * Never a 404. next.config.ts builds its redirects from this list, and
 * tests/removed-redirects.test.ts fails if any of them stops redirecting,
 * points at a page that no longer exists, or chains through another redirect.
 *
 * Keep it a plain module (relative imports only): next.config.ts imports it.
 */

export type Removed = { source: string; destination: string };

const HOME = "/";
const BACKUP = "/home-backup";
const OUTAGE = "/power-outage-backup-calculator";
const GFCI = "/ev-charger-tripping-gfci";
const CORD = "/ev-charger-extension-cord";
const HOME_BATTERY = "/home-battery-backup";
const BATTERY_CALC = "/battery-calculator";
const STATES = "/states";
const QUESTIONS = "/questions/home-batteries-backup";
const CV_LITHIUM = "https://campervolts.com/lithium-conversion";

/** RV and boat pages the reset report said belong to CamperVolts. */
export const RV_AND_BOAT: Removed[] = [
  { source: "/lithium-rv-battery", destination: CV_LITHIUM },
  { source: "/lithium-vs-agm-battery", destination: CV_LITHIUM },
  // CamperVolts is dropping its boat section too, so boat pages come home.
  { source: "/boating", destination: HOME },
  { source: "/best-trolling-motor-battery", destination: HOME },
  { source: "/trolling-motor-battery-life", destination: HOME },
  { source: "/kayak-trolling-motor-battery", destination: HOME },
  { source: "/24v-vs-36v-trolling-motor", destination: HOME },
  { source: "/electric-outboard-motor", destination: HOME },
  { source: "/fish-finder-battery", destination: HOME },
  { source: "/charge-lithium-battery-on-boat", destination: HOME },
  { source: "/questions/electric-boating", destination: HOME },
  { source: "/outdoor-power", destination: BACKUP },
];

/** EV and solar savings tools: not about outage backup, so they go. */
export const EV_AND_SOLAR: Removed[] = [
  { source: "/electric-vehicles", destination: HOME },
  { source: "/go-electric", destination: HOME },
  { source: "/ev-charging-cost", destination: HOME },
  { source: "/calculator", destination: HOME },
  { source: "/ev-or-plug-in-hybrid", destination: HOME },
  { source: "/best-home-ev-charger", destination: GFCI },
  { source: "/ev-charger-installation-cost", destination: GFCI },
  { source: "/ev-charger-picker", destination: CORD },
  { source: "/home-energy", destination: BACKUP },
  { source: "/solar-calculator", destination: BATTERY_CALC },
  { source: "/solar-finder", destination: HOME_BATTERY },
  { source: "/solar-panels-not-working", destination: HOME_BATTERY },
  { source: "/plug-in-solar", destination: HOME_BATTERY },
  { source: "/incentives", destination: STATES },
];

const OTHER: Removed[] = [
  // Hubs and lists that no longer have anything to gather.
  { source: "/learn", destination: HOME },
  { source: "/off-grid", destination: BACKUP },
  { source: "/questions", destination: QUESTIONS },
  { source: "/questions/home-solar", destination: QUESTIONS },
  { source: "/questions/ev-charging", destination: GFCI },
  { source: "/questions/costs-and-incentives", destination: STATES },
  { source: "/news", destination: HOME },
  // "Best" lists with no hands-on testing behind them.
  { source: "/best-portable-power-stations", destination: BACKUP },
  { source: "/best-power-station-for-cpap", destination: OUTAGE },
  { source: "/black-friday-deals", destination: BACKUP },
  // E-bikes.
  { source: "/e-bikes", destination: HOME },
  { source: "/e-bike-for-heavy-riders", destination: HOME },
  { source: "/e-bike-for-hills", destination: HOME },
  { source: "/commuter-e-bike-under-1500", destination: HOME },
  { source: "/folding-e-bike", destination: HOME },
  // Emergency prep and off-grid living.
  { source: "/emergency-water-storage-calculator", destination: OUTAGE },
  { source: "/how-to-purify-water", destination: OUTAGE },
  { source: "/best-emergency-water-filters", destination: OUTAGE },
  { source: "/emergency-kit-checklist", destination: OUTAGE },
  { source: "/emergency-food-calculator", destination: OUTAGE },
  { source: "/noaa-weather-radio", destination: OUTAGE },
  { source: "/off-grid-solar-calculator", destination: OUTAGE },
  { source: "/off-grid-cabin-solar-kit", destination: BACKUP },
  { source: "/off-grid-kit", destination: BACKUP },
  { source: "/how-to-go-off-grid", destination: BACKUP },
  // The game, the myths page and seasonal cost pages.
  { source: "/solartopia", destination: HOME },
  { source: "/myths", destination: HOME },
  { source: "/objections", destination: HOME },
  { source: "/christmas-lights-cost", destination: HOME },
  { source: "/space-heater-cost", destination: OUTAGE },
  // Brand-vs-brand comparisons that are not about home backup.
  { source: "/compare/ecoflow-delta-3-plus-vs-anker-solix-c1000-gen-2", destination: "/power-stations/anker-solix-c1000-gen-2/what-it-runs" },
  { source: "/compare/jackery-vs-ecoflow", destination: "/compare" },
  { source: "/compare/ecoflow-vs-bluetti", destination: "/compare" },
  { source: "/compare/bluetti-ac180-vs-jackery-explorer-1000-v2", destination: "/power-stations/bluetti-ac180/what-it-runs" },
  { source: "/compare/ecoflow-delta-3-max-vs-jackery-explorer-2000-v2", destination: "/power-stations/anker-solix-c2000-gen-2/what-it-runs" },
  { source: "/compare/tesla-powerwall-3-vs-enphase-iq-battery-5p", destination: HOME_BATTERY },
  { source: "/compare/bluetti-ac180-vs-elite-100-v2", destination: "/power-stations/bluetti-ac180/what-it-runs" },
  { source: "/compare/bluetti-elite-200-v2-vs-elite-300", destination: "/power-stations/bluetti-elite-300/what-it-runs" },
  { source: "/compare/bluetti-elite-200-v2-vs-ac200l", destination: "/power-stations/bluetti-elite-200-v2/what-it-runs" },
  { source: "/compare/ecoflow-delta-pro-3-vs-anker-solix-f3800-plus", destination: "/compare/anker-solix-vs-ecoflow" },
];

/** Fixed addresses. */
export const REMOVED: Removed[] = [...RV_AND_BOAT, ...EV_AND_SOLAR, ...OTHER];

/**
 * Pattern rules for whole removed sections (child pages of the above). They go
 * straight to the final page so nothing chains.
 */
export const REMOVED_PATTERNS: Removed[] = [
  // The 51 near-identical state pages: one table page now covers every state.
  { source: "/states/:slug", destination: STATES },
  { source: "/off-grid-solar-calculator/:state", destination: OUTAGE },
  { source: "/solartopia/:path*", destination: HOME },
  { source: "/questions/home-solar/:question", destination: QUESTIONS },
  { source: "/questions/ev-charging/:question", destination: GFCI },
  { source: "/questions/electric-boating/:question", destination: HOME },
  { source: "/questions/costs-and-incentives/:question", destination: STATES },
  { source: "/questions/home-batteries-backup/:question", destination: `${QUESTIONS}#:question` },
];

/** Example child addresses for the pattern rules, checked by the tests. */
export const PATTERN_EXAMPLES: { path: string; destination: string }[] = [
  { path: "/states/iowa", destination: STATES },
  { path: "/states/ohio", destination: STATES },
  { path: "/off-grid-solar-calculator/maine", destination: OUTAGE },
  { path: "/solartopia/r/abc", destination: HOME },
  { path: "/questions/home-solar/do-solar-panels-work-in-a-power-outage", destination: QUESTIONS },
];
