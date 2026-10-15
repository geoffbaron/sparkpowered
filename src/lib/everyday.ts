/**
 * Turns battery sizes into things people understand: hours of fridge, nights
 * of CPAP, phone charges. Every load figure here is a typical value with a
 * source; the product pages always show the raw specs too.
 */

import home from "@/data/home-energy.json";

/** Share of a power station's rated capacity you can actually use after inverter losses. */
export const USABLE_FRACTION = 0.85;

/** Average yearly electricity a US home's fridges use: 839 kWh (EIA RECS 2020, CE4.6.EL.ST). */
export const FRIDGE_KWH_YEAR = home.national.fridgeKwh;
/** Fridge's average draw in watts across a day (compressor on and off). */
export const FRIDGE_AVG_W = (FRIDGE_KWH_YEAR * 1000) / 8760;

/**
 * Typical loads, with sources:
 *  - CPAP: 28 W, ResMed's battery guide figure for an AirSense 10 at pressure 10
 *    with the heated humidifier on setting 4 (2.30 A at 12 V); about 11 W without it.
 *    https://document.resmed.com/documents/products/serviceandsupport/battery-guide/battery-guide_glo_eng.pdf
 *  - Wi-Fi router: 10 W (EnergySage, "How many watts does a Wi-Fi router use?").
 *  - LED bulb: 9 W (US DOE lighting guide: a bright LED uses "as little as nine watts").
 *  - Phone: 15 Wh per full charge from the wall (an iPhone 16 battery holds 13.84 Wh, plus charging losses).
 */
export const LOADS = {
  cpapW: 28,
  cpapNightHours: 8,
  routerW: 10,
  ledW: 9,
  phoneChargeWh: 15,
};

/** Fridge + Wi-Fi all day, 4 LED bulbs for 5 hours, and 2 phone charges: watt-hours per day. */
export const ESSENTIALS_WH_DAY =
  FRIDGE_AVG_W * 24 + LOADS.routerW * 24 + 4 * LOADS.ledW * 5 + 2 * LOADS.phoneChargeWh;

export function lifeTerms(capacityWh: number) {
  const usable = capacityWh * USABLE_FRACTION;
  return {
    usableWh: usable,
    /** Hours a typical fridge keeps running. */
    fridgeHours: usable / FRIDGE_AVG_W,
    /** Hours of fridge + Wi-Fi + lights + phones (the "essentials" day). */
    essentialsHours: (usable / ESSENTIALS_WH_DAY) * 24,
    cpapNights: usable / (LOADS.cpapW * LOADS.cpapNightHours),
    phoneCharges: usable / LOADS.phoneChargeWh,
  };
}

/** "about 14 hours" / "about 2 days" style wording. */
export function duration(hours: number) {
  if (hours < 1) return "under an hour";
  if (hours < 36) return `about ${Math.round(hours)} hours`;
  const days = hours / 24;
  return `about ${days < 10 ? Math.round(days * 2) / 2 : Math.round(days)} days`;
}

export function lifeSummary(capacityWh: number) {
  const t = lifeTerms(capacityWh);
  return {
    essentials: duration(t.essentialsHours),
    fridge: duration(t.fridgeHours),
    cpap: t.cpapNights >= 1 ? `${Math.floor(t.cpapNights)} night${Math.floor(t.cpapNights) === 1 ? "" : "s"}` : `${Math.round(t.cpapNights * LOADS.cpapNightHours)} hours`,
    phones: `${Math.round(t.phoneCharges / 5) * 5 || Math.round(t.phoneCharges)}`,
  };
}
