/**
 * Legal status of plug-in ("balcony") solar by state. Every enacted or pending
 * entry links to the bill or statute on the state legislature's own site.
 * States not listed have no plug-in solar law: connecting any generator to the
 * grid there falls under the utility's normal interconnection rules.
 */

export const LAW_REVIEWED = "2026-10-15";

export type LawStatus = "law" | "pending" | "none";

export interface StateLaw {
  abbr: string;
  status: Exclude<LawStatus, "none">;
  bill: string;
  year: number;
  /** Plain-English status line, e.g. "Signed March 2025; in effect May 7, 2025". */
  statusText: string;
  effective?: string;
  maxWatts?: number | null;
  summary: string;
  url: string;
}

export const STATE_LAWS: StateLaw[] = [
  {
    abbr: "UT", status: "law", bill: "HB 340", year: 2025, effective: "2025-05-07", maxWatts: 1200,
    statusText: "Signed March 2025; in effect since May 7, 2025",
    summary: "kits up to 1,200 W that plug into a standard 120 V outlet, are certified by UL or an equivalent lab and shut off in a power outage need no interconnection agreement, utility approval, fee or extra equipment. They are not part of net metering.",
    url: "https://le.utah.gov/Session/2025/bills/enrolled/HB0340.pdf",
  },
  {
    abbr: "ME", status: "law", bill: "LD 1730", year: 2026, effective: "2026-07-15", maxWatts: 1200,
    statusText: "Signed April 6, 2026 (Public Law 2025, c. 644)",
    summary: "kits certified to UL 3700 (or comparable) are allowed up to 1,200 W. Up to 420 W per address you can install yourself; 420 to 1,200 W needs a licensed electrician, a dedicated circuit and notice to the utility within 30 days.",
    url: "https://www.legislature.maine.gov/legis/statutes/35-A/title35-Asec3475.html",
  },
  {
    abbr: "VA", status: "law", bill: "HB 395 / SB 250", year: 2026, effective: "2027-01-01", maxWatts: 1200,
    statusText: "Signed April 22, 2026; takes effect January 1, 2027",
    summary: "from January 1, 2027, certified kits up to 1,200 W per customer need no utility approval or fees, but you must file a notification form before installing. Larger landlords cannot ban them outright.",
    url: "https://law.lis.virginia.gov/vacodeupdates/title56/section56-596.8/",
  },
  {
    abbr: "CO", status: "law", bill: "HB26-1007", year: 2026, effective: "2026-08-12", maxWatts: 1920,
    statusText: "Signed May 7, 2026; in effect since August 12, 2026",
    summary: "one lab-listed device per address, up to 1,920 W, needs no utility approval, fee or extra equipment; the utility may ask you to tell it the device's size. From 2027, unlisted devices over 391 W cannot be sold and HOA bans are void.",
    url: "https://leg.colorado.gov/bill_files/116074/download",
  },
  {
    abbr: "MD", status: "law", bill: "HB 1532", year: 2026, effective: "2026-07-01", maxWatts: 1200,
    statusText: "Signed May 12, 2026 (Chapter 353); in effect since July 1, 2026",
    summary: "one UL-certified system per meter, up to 1,200 W, at homes only. You must notify the utility and certify the safety features; the utility cannot require approval or extra equipment, and the system earns no renewable energy credits.",
    url: "https://mgaleg.maryland.gov/2026RS/Chapters_noln/CH_353_hb1532e.pdf",
  },
  {
    abbr: "CT", status: "law", bill: "HB 5340", year: 2026, effective: "2026-10-01", maxWatts: 1200,
    statusText: "Signed June 4, 2026 (Public Act 26-127); in effect since October 1, 2026",
    summary: "one device per meter, up to 1,200 W into a 120 V outlet, meeting UL 1741 and IEEE 1547, needs no interconnection agreement or approval. On a meter that cannot net meter, power you send out can be billed as if you used it.",
    url: "https://www.cga.ct.gov/2026/ACT/PA/PDF/2026PA-00127-R00HB-05340-PA.PDF",
  },
  {
    abbr: "VT", status: "law", bill: "S.202", year: 2026, effective: "2026-07-01", maxWatts: 1200,
    statusText: "Signed June 16, 2026 (Act 149); in effect since July 1, 2026",
    summary: "up to 1,200 W per meter, certified to UL 3700 and IEEE 1547-2018, on homes with smart meters. No approval or fees, but no net metering either: exported power is not paid for.",
    url: "https://legislature.vermont.gov/Documents/2026/Docs/ACTS/ACT149/ACT149%20As%20Enacted.pdf",
  },
  {
    abbr: "NH", status: "law", bill: "SB 540", year: 2026, effective: "2027-01-01", maxWatts: 1200,
    statusText: "Signed July 2, 2026 (Chapter 262); takes effect January 1, 2027",
    summary: "from January 1, 2027, one lab-certified system per meter, up to 1,200 W, needs no utility approval or interconnection review; the utility may only ask you to report the wattage afterwards.",
    url: "https://gc.nh.gov/bill_status/legacy/bs2016/billText.aspx?sy=2026&id=1317&txtFormat=html",
  },
  {
    abbr: "NJ", status: "law", bill: "S2368 / A4836", year: 2026, effective: "2027-03-01", maxWatts: 1200,
    statusText: "Signed September 1, 2026; the governor's office says it takes effect March 1, 2027",
    summary: "devices up to 1,200 W into a standard 120 V outlet will be exempt from utility interconnection approval, fees and local permits, and landlords and HOAs cannot broadly ban them. Check the final certification rules before buying.",
    url: "https://www.nj.gov/governor/news/2026/20260901a.shtml",
  },
  {
    abbr: "CA", status: "law", bill: "SB 868", year: 2026, effective: "2027-01-01", maxWatts: 1200,
    statusText: "Signed September 30, 2026 (Chapter 985); takes effect January 1, 2027",
    summary: "from January 1, 2027, devices up to 1,200 W per home with certified outage shut-off are exempt from interconnection rules until 2030. Utilities cannot charge fees but may require a simple online registration. Until then, utilities expect an interconnection application.",
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB868",
  },
  {
    abbr: "NY", status: "pending", bill: "S8512C / A9111C", year: 2026, maxWatts: 1200,
    statusText: "Passed both chambers May 28, 2026; not yet signed by the governor",
    summary: "would let listed devices up to 1,200 W skip utility approval, with online notice to the utility within 30 days.",
    url: "https://www.nysenate.gov/legislation/bills/2025/S8512/amendment/C",
  },
];

/** Safety standards and code status, for the hub page. */
export const STANDARDS = [
  {
    name: "UL 3700",
    summary:
      "UL Solutions began certifying plug-in solar equipment to UL 3700 (an \"outline of investigation\" for interactive plug-in PV) on January 8, 2026. It tests overload protection, shock and ground-fault safety, and that the kit cannot push power into the house wiring during an outage. Maine and Vermont name it in law.",
    url: "https://www.ul.com/news/ul-solutions-debuts-testing-and-certification-framework-safer-plug-solar-across-united-states",
  },
  {
    name: "UL 1741 and IEEE 1547",
    summary:
      "The long-standing inverter standards. A listed microinverter shuts off within moments of losing grid power (\"anti-islanding\"), so it cannot energize lines a utility worker is repairing. Connecticut's law requires both.",
    url: "https://www.cga.ct.gov/2026/ACT/PA/PDF/2026PA-00127-R00HB-05340-PA.PDF",
  },
  {
    name: "National Electrical Code (NFPA 70)",
    summary:
      "According to UL Solutions, the 2026 NEC, like earlier editions, does not recognize solar that feeds a home through an ordinary receptacle. State laws exempt these kits from utility interconnection rules, but local building and electrical codes can still apply.",
    url: "https://www.ul.com/thecodeauthority/knowledge/coordination-between-model-codes-standards09",
  },
];

export function lawFor(abbr: string): StateLaw | null {
  return STATE_LAWS.find((l) => l.abbr === abbr) ?? null;
}
