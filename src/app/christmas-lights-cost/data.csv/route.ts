import { DATA_UPDATED, SOURCES } from "@/lib/energy";
import { HOURS_PER_NIGHT, SEASON_DAYS, lightsByState, toCsv } from "@/lib/holiday";

const body = toCsv([
  ["rank", "state", "cents_per_kwh", "led_1000_bulb_season_usd", "incandescent_1000_bulb_season_usd"],
  ...lightsByState().map(({ s, c, led, old }, i) => [i + 1, s.name, c.toFixed(1), led.toFixed(2), old.toFixed(2)]),
  [],
  [`Source: Spark Powered, https://sparkpowered.com/christmas-lights-cost (data updated ${DATA_UPDATED}). ${HOURS_PER_NIGHT} hours a night for ${SEASON_DAYS} nights. Electricity: ${SOURCES.electricityPrice.name}, ${SOURCES.electricityPrice.period}.`],
]);

/** The state table as a spreadsheet, free to reuse with a credit link. */
export function GET() {
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="christmas-lights-cost-by-state.csv"',
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
