/**
 * Hand-made look helpers: every outline is pre-jittered from a seed, so the
 * paper-cut shapes wobble the same way on every render. Pure functions.
 */

import { rng } from "@/lib/solartopia/sim";

export const COLORS = {
  night: "#1E2A4A",
  plum: "#5B3A63",
  clay: "#C8734B",
  sand: "#E9D3A6",
  sun: "#F5B700",
  panel: "#2D5D8C",
  glint: "#8FB8DE",
  leaf: "#15803D",
  water: "#2A9D8F",
  glow: "#FFD27A",
  cream: "#FFFEF7",
  ink: "#3A2A33",
} as const;

const f = (n: number) => Math.round(n * 10) / 10;

/** Paper-cut polygon: jittered corners, straight edges that sag a little in the middle. */
export function wobblyPoly(points: [number, number][], seed: number, amp = 1.6) {
  const r = rng(seed);
  const p = points.map(([x, y]) => [x + (r() - 0.5) * 2 * amp, y + (r() - 0.5) * 2 * amp] as const);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    const mx = (a[0] + b[0]) / 2 + (r() - 0.5) * amp * 0.9;
    const my = (a[1] + b[1]) / 2 + (r() - 0.5) * amp * 0.9;
    d += ` L${f(mx)} ${f(my)} L${f(b[0])} ${f(b[1])}`;
  }
  return d + "Z";
}

export function wobblyRect(x: number, y: number, w: number, h: number, seed: number, amp = 1.4) {
  return wobblyPoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], seed, amp);
}

/** Rounded blob around a centre. */
export function blob(cx: number, cy: number, rx: number, ry: number, seed: number, amp = 0.12, n = 9) {
  const r = rng(seed);
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * 2 * amp;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return wobblyPoly(pts, seed + 7, 0.4);
}

/** A hand-drawn line through points with small wobble. */
export function wobblyLine(points: [number, number][], seed: number, amp = 1.2) {
  const r = rng(seed);
  const p = points.map(([x, y]) => [x + (r() - 0.5) * amp, y + (r() - 0.5) * amp] as const);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1];
    const b = p[i];
    d += ` Q${f(a[0] + (b[0] - a[0]) * 0.5 + (r() - 0.5) * amp)} ${f(a[1] + (b[1] - a[1]) * 0.5 + (r() - 0.5) * amp)} ${f(b[0])} ${f(b[1])}`;
  }
  return d;
}

/** Ridge of rolling hills as a closed path along the bottom. */
export function hills(x0: number, x1: number, base: number, peak: number, seed: number, bottom: number) {
  const r = rng(seed);
  const pts: [number, number][] = [[x0, bottom]];
  const n = Math.max(7, Math.round((x1 - x0) / 75));
  for (let i = 0; i <= n; i++) pts.push([x0 + ((x1 - x0) * i) / n, base - r() * peak]);
  pts.push([x1, bottom]);
  return wobblyPoly(pts, seed + 3, 2.5);
}

/** Interpolate between colour stops given as [t, r, g, b, a]. */
export function lerpStops(stops: [number, number, number, number, number][], t: number): string {
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const k = b[0] === a[0] ? 0 : (t - a[0]) / (b[0] - a[0]);
  const v = (i: number) => a[i] + (b[i] - a[i]) * k;
  return `rgba(${Math.round(v(1))},${Math.round(v(2))},${Math.round(v(3))},${v(4).toFixed(3)})`;
}

/** Sky gradient top/bottom colour for a game hour (0..24, wraps). Night, dawn, day, dusk. */
const SKY: { t: number; top: [number, number, number]; bot: [number, number, number] }[] = [
  { t: 0, top: [18, 24, 52], bot: [30, 42, 74] },
  { t: 4.5, top: [24, 30, 64], bot: [60, 52, 96] },
  { t: 6, top: [91, 58, 99], bot: [232, 156, 110] },
  { t: 7.5, top: [124, 164, 206], bot: [247, 214, 160] },
  { t: 12, top: [102, 163, 214], bot: [196, 224, 238] },
  { t: 16.5, top: [112, 160, 205], bot: [246, 218, 168] },
  { t: 18, top: [91, 58, 99], bot: [226, 128, 88] },
  { t: 19.5, top: [40, 38, 78], bot: [91, 58, 99] },
  { t: 21, top: [20, 26, 56], bot: [30, 42, 74] },
  { t: 24, top: [18, 24, 52], bot: [30, 42, 74] },
];

export function skyAt(hour: number): { top: string; bot: string } {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < SKY.length - 2 && h > SKY[i + 1].t) i++;
  const a = SKY[i];
  const b = SKY[i + 1];
  const k = Math.min(1, Math.max(0, (h - a.t) / (b.t - a.t)));
  const mix = (x: [number, number, number], y: [number, number, number]) =>
    `rgb(${Math.round(x[0] + (y[0] - x[0]) * k)},${Math.round(x[1] + (y[1] - x[1]) * k)},${Math.round(x[2] + (y[2] - x[2]) * k)})`;
  return { top: mix(a.top, b.top), bot: mix(a.bot, b.bot) };
}

/** Colour wash over the whole stage: indigo at night, rosy at dawn and dusk, none at midday. */
export function washAt(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  return lerpStops(
    [
      [0, 24, 34, 70, 0.3],
      [4.5, 24, 34, 70, 0.28],
      [6, 200, 115, 90, 0.2],
      [7.5, 255, 220, 170, 0.03],
      [10, 255, 254, 247, 0],
      [16, 255, 254, 247, 0],
      [17.5, 245, 170, 110, 0.12],
      [18.4, 91, 58, 99, 0.3],
      [19.4, 24, 34, 70, 0.3],
      [20.5, 24, 34, 70, 0.3],
      [24, 24, 34, 70, 0.3],
    ],
    h,
  );
}

/** 0 in daylight, 1 deep night; ramps over dusk (18 to 19.5) and dawn (4.5 to 6.5). */
export function nightAt(hour: number): number {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 19.5 || h < 4.5) return 1;
  if (h >= 18) return (h - 18) / 1.5;
  if (h < 6.5) return 1 - (h - 4.5) / 2;
  return 0;
}
