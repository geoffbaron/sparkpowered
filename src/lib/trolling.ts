/**
 * Which Redodo battery the trolling motor picker suggests for each motor
 * voltage. Ids are from src/data/batteries.ts; thrust ranges are Redodo's.
 */

export type Volts = 12 | 24 | 36;

export const TROLLING_CHOICE: Record<Volts, { short: string; long: string; thrust: string }> = {
  12: { short: "redodo-12v-100ah", long: "redodo-12v-120ah-group24-trolling", thrust: "30 to 70 lb thrust" },
  24: { short: "redodo-24v-50ah-trolling", long: "redodo-24v-125ah-trolling-self-heating", thrust: "70 to 100 lb thrust" },
  36: { short: "redodo-36v-50ah-trolling", long: "redodo-36v-50ah-trolling", thrust: "100 to 120 lb thrust" },
};

/** Lead-acid batteries a motor of this voltage needs, wired in series. */
export const leadAcidFor = (v: Volts) => v / 12;
