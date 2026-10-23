import { DATA_UPDATED, SOURCES } from "@/lib/energy";
import { HEATER_HOURS_PER_DAY, heaterByState, toCsv } from "@/lib/holiday";

const month = (perHour: number) => (perHour * HEATER_HOURS_PER_DAY * 30).toFixed(2);

const body = toCsv([
  ["rank", "state", "cents_per_kwh", "heater_per_hour_usd", "heater_per_month_usd", "gas_furnace_same_heat_per_month_usd", "heat_pump_same_heat_per_month_usd"],
  ...heaterByState().map(({ s, c, h }, i) => [i + 1, s.name, c.toFixed(1), h.heater.toFixed(3), month(h.heater), month(h.furnace), month(h.heatPump)]),
  [],
  [`Source: Spark Powered, https://sparkpowered.com/space-heater-cost (data updated ${DATA_UPDATED}). 1,500 W on high, ${HEATER_HOURS_PER_DAY} hours a day, 30 days. Electricity: ${SOURCES.electricityPrice.name}, ${SOURCES.electricityPrice.period}. Gas: EIA residential natural gas prices.`],
]);

/** The state table as a spreadsheet, free to reuse with a credit link. */
export function GET() {
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="space-heater-cost-by-state.csv"',
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
