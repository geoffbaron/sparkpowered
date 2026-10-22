/** Share codes: one digit (0..3) per day, e.g. "33233". Plain values, safe on server and client. */

import { DAYS, MAX_STARS, SHARE_PATH } from "@/data/solartopia";

export function encodeStars(stars: number[]) {
  return DAYS.map((_, i) => String(Math.max(0, Math.min(3, Math.trunc(stars[i] ?? 0))))).join("");
}

export function decodeStars(code: string): number[] | null {
  if (!new RegExp(`^[0-3]{${DAYS.length}}$`).test(code)) return null;
  return code.split("").map(Number);
}

export const totalStars = (stars: number[]) => stars.reduce((a, b) => a + b, 0);

export const daysMet = (stars: number[]) => stars.filter((n) => n > 0).length;

/** What the player actually achieved, in plain words. `person`: "first" for their own card, "third" for the page others land on. */
export function shareSentence(stars: number[], person: "first" | "third" = "first") {
  const n = daysMet(stars);
  const total = `${totalStars(stars)} of ${MAX_STARS} stars`;
  const who = person === "first" ? "I" : "Someone";
  if (n === 5) return `${who} powered a village of 1,200 people, then a town of 12,000 and a city of 400,000. ${total}.`;
  if (n > 0) return `${who} lit up ${n} of 5 days in Solartopia and earned ${total}.`;
  return `${who === "I" ? "I tried" : "Someone tried"} Solartopia. ${total}.`;
}

/** The line at the top of the home ending. */
export function achievementLine(stars: number[]) {
  const n = daysMet(stars);
  if (n === 5) return "You lit a village, a town and a city.";
  if (n > 0) return `You lit ${n} of 5 days. Replay a day to light the rest.`;
  return "You gave Solartopia a try.";
}

export const sharePath = (stars: number[]) => `${SHARE_PATH}/${encodeStars(stars)}`;
