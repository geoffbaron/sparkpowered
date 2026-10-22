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

export function shareSentence(stars: number[]) {
  return `I powered a village of 1,200 people, then a city. ${totalStars(stars)} of ${MAX_STARS} stars.`;
}

export const sharePath = (stars: number[]) => `${SHARE_PATH}/${encodeStars(stars)}`;
