/**
 * Figures shared by the rebuilt home backup pages, each from a cited source
 * (src/data/backup-sources.ts). Plain values only.
 */

/** EIA's conversion: 3,412 Btu per kWh. */
const BTU_PER_KWH = 3412;
const mmbtuToKwh = (m: number) => Math.round((m * 1e6) / BTU_PER_KWH);

/** EIA RECS 2020 table CE5.3b, million Btu per household using it, as kWh a year and Wh a day. */
const mostUsedKwhYear = mmbtuToKwh(2.11);
const freezerKwhYear = mmbtuToKwh(1.94);
export const FRIDGE_RECS = {
  mostUsedKwhYear,
  secondKwhYear: mmbtuToKwh(1.69),
  freezerKwhYear,
  mostUsedWhDay: (mostUsedKwhYear * 1000) / 365,
  freezerWhDay: (freezerKwhYear * 1000) / 365,
};

/**
 * BLUETTI's own run-time formula (Apex 300 manual, page 28, FAQ Q5):
 * capacity × 95% depth of discharge × 90% inverter efficiency ÷ (load + 20 W self-use).
 */
export function apexHours(capacityWh: number, loadW: number) {
  return (capacityWh * 0.95 * 0.9) / (loadW + 20);
}
