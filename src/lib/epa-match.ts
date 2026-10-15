/**
 * Matches a free-text vehicle name ("Hyundai Ioniq 5", "Tesla Model Y Long
 * Range") to EPA fueleconomy.gov records so the EV Finder can show official
 * range and efficiency instead of relying on automated research.
 */
import evData from "@/data/epa-evs.json";

interface EpaEv {
  id: number;
  year: number;
  make: string;
  model: string;
  baseModel: string;
  rangeMiles: number;
  kwhPer100mi: number;
}

export interface EpaSummary {
  label: string;
  year: number;
  rangeMin: number;
  rangeMax: number;
  kwhMin: number;
  kwhMax: number;
  configs: number;
}

const VEHICLES = (evData as { vehicles: EpaEv[] }).vehicles;

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[-_.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Make aliases where a marketing name differs from EPA's make field. */
const MAKE_ALIASES: Record<string, string> = { mercedes: "mercedes benz", chevy: "chevrolet", vw: "volkswagen" };

export function matchEpa(name: string): EpaSummary | null {
  let n = ` ${norm(name)} `;
  for (const [alias, real] of Object.entries(MAKE_ALIASES)) n = n.replace(` ${alias} `, ` ${real} `);

  // Longest base-model name first so "Model S" doesn't swallow "Model S Plaid" etc.
  const candidates = VEHICLES.filter((v) => n.includes(` ${norm(v.make)} `)).filter((v) => {
    const base = norm(v.baseModel);
    return n.includes(` ${base} `);
  });
  if (candidates.length === 0) return null;

  const bestBase = candidates.reduce((a, b) => (norm(b.baseModel).length > norm(a.baseModel).length ? b : a)).baseModel;
  const group = candidates.filter((v) => v.baseModel === bestBase);
  // Use every listed configuration across the model years we carry: a newer
  // year is often only partly certified (e.g. one trim), which would make the
  // range look worse than what is actually on sale.
  const latest = group;
  const years = [...new Set(group.map((v) => v.year))].sort();
  const year = years[years.length - 1];
  return {
    label: `${years.length > 1 ? `${years[0]}–${year}` : year} ${latest[0].make} ${bestBase}`,
    year,
    rangeMin: Math.min(...latest.map((v) => v.rangeMiles)),
    rangeMax: Math.max(...latest.map((v) => v.rangeMiles)),
    kwhMin: Math.min(...latest.map((v) => v.kwhPer100mi)),
    kwhMax: Math.max(...latest.map((v) => v.kwhPer100mi)),
    configs: latest.length,
  };
}
