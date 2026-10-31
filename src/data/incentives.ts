/**
 * Federal household clean-energy credits that have ended, with the IRS end rule
 * for each (IRS fact sheet FS-2025-05 on Public Law 119-21, signed 4 July 2025).
 * Shown on /incentives and given to Ask Spark word for word.
 */
export const ENDED_CREDITS: { credit: string; section: string; end: string }[] = [
  { credit: "New clean vehicle credit (up to $7,500)", section: "30D", end: "Not allowed for vehicles acquired after 30 September 2025" },
  { credit: "Used clean vehicle credit (up to $4,000)", section: "25E", end: "Not allowed for vehicles acquired after 30 September 2025" },
  { credit: "Commercial clean vehicle credit (includes many EV leases)", section: "45W", end: "Not allowed for vehicles acquired after 30 September 2025" },
  { credit: "EV charger / refueling property credit", section: "30C", end: "Not allowed for property placed in service after 30 June 2026" },
  { credit: "Residential Clean Energy Credit, 30% (solar, batteries, geothermal)", section: "25D", end: "Not allowed for expenditures made after 31 December 2025" },
  { credit: "Energy Efficient Home Improvement Credit (heat pumps, insulation, windows)", section: "25C", end: "Not allowed for property placed in service after 31 December 2025" },
];
