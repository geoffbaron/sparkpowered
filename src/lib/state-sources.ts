import type { StateEnergy } from "@/lib/energy";

/**
 * Official, per-state places to check incentives. We link to these rather than
 * restating program details, because state and utility programs change faster
 * than any static page can be reviewed.
 */
export function stateSources(s: StateEnergy) {
  return [
    {
      name: `AFDC: ${s.name} laws and incentives for electric vehicles`,
      url: `https://afdc.energy.gov/laws/state_summary?state=${s.abbr}`,
      detail: "US Department of Energy list of state EV incentives, utility programs and rules",
    },
    {
      name: `DSIRE: ${s.name} clean energy incentives and policies`,
      url: `https://programs.dsireusa.org/system/program?state=${s.abbr}`,
      detail: "NC Clean Energy Technology Center database of solar, storage and efficiency programs",
    },
  ];
}
