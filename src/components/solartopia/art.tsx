/**
 * Hand-painted SVG pieces for the Solartopia scene. Flat colour, one shadow
 * tone, jittered outlines (see lib/solartopia/paint.ts). All coordinates are
 * relative to a 68 x 68 cell unless stated.
 */

import type { ReactNode } from "react";
import { COLORS, blob, wobblyLine, wobblyPoly, wobblyRect } from "@/lib/solartopia/paint";

export const CELL = 68;
export const GX = 7;
export const GY = 150;
export const WORLD = { w: 490, h: 560 };

export const cellX = (c: number) => GX + c * CELL;
export const cellY = (r: number) => GY + r * CELL;
export const cellCenter = (c: number, r: number): [number, number] => [cellX(c) + CELL / 2, cellY(r) + CELL / 2];

const INK = { stroke: COLORS.ink, strokeWidth: 1.4, strokeLinejoin: "round" as const, strokeOpacity: 0.75 };
const SHADOW = "rgba(30,42,74,0.22)";

/** A rooftop slab or ground bed that panels sit on. */
function Outline({ d, fill, shadow, night = 0, offset = false }: { d: string; fill: string; shadow?: string; night?: number; offset?: boolean }) {
  // Stroke width varies from shape to shape (1.2 to 2.2), as if inked by hand.
  const w = 1.2 + (d.length % 11) / 11;
  return (
    <>
      {offset && <path d={d} fill={fill} opacity={0.5} transform="translate(1.5 1)" />}
      <path d={d} fill={fill} {...INK} strokeWidth={w} />
      {night > 0 && <path d={d} fill="#2b2340" opacity={0.55 * night} />}
      {shadow && <path d={shadow} fill={SHADOW} />}
    </>
  );
}

const WALLS = ["#C8734B", "#D68F5A", "#B9654A", "#CF8561", "#C07B52"];

/** Window with warm glow. `lit` fades in after `delay` ms (staggered 40 ms apart at dusk). */
export function Win({ x, y, w = 9, h = 10, lit, delay = 0 }: { x: number; y: number; w?: number; h?: number; lit: boolean; delay?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={1.5} fill="#2a1d24" opacity={0.9} />
      <rect
        className="st-win"
        x={x}
        y={y}
        width={w}
        height={h}
        rx={1.5}
        fill={COLORS.glow}
        style={{ opacity: lit ? 1 : 0, transitionDelay: `${lit ? delay : 0}ms` }}
      />
      <rect
        className="st-win"
        x={x + w * 0.2}
        y={y + h * 0.2}
        width={w * 0.6}
        height={h * 0.55}
        rx={1}
        fill="#FFF3C0"
        style={{ opacity: lit ? 1 : 0, transitionDelay: `${lit ? delay : 0}ms` }}
      />
      <rect
        className="st-win"
        x={x - 2}
        y={y - 2}
        width={w + 4}
        height={h + 4}
        rx={3}
        fill="none"
        stroke={COLORS.glow}
        strokeWidth={2}
        style={{ opacity: lit ? 0.55 : 0, transitionDelay: `${lit ? delay : 0}ms` }}
      />
    </g>
  );
}

/** Village house: tin-edged roof slab (where the panel goes), arched door, a seeded little detail. Height varies by seed. */
export function House({ seed, lit, delay, night = 0 }: { seed: number; lit: boolean; delay: number; night?: number }) {
  const wall = WALLS[seed % WALLS.length];
  const top = 20 + (seed % 3) * 4;
  return (
    <g>
      <ellipse cx={37} cy={63} rx={29} ry={4} fill={SHADOW} />
      <ellipse className="st-win" cx={34} cy={64} rx={26} ry={6} fill={COLORS.glow} style={{ opacity: lit ? 0.28 : 0, transitionDelay: `${lit ? delay : 0}ms`, mixBlendMode: "screen" }} />
      <Outline d={wobblyRect(8, top + 6, 52, 56 - top, seed, 1.3)} fill={wall} shadow={wobblyRect(44, top + 8, 15, 52 - top, seed + 1, 0.8)} night={night} offset />
      <Outline d={wobblyRect(4, top, 60, 11, seed + 2, 1.1)} fill="#EFDCB0" shadow={wobblyRect(4, top + 7, 60, 4, seed + 3, 0.5)} night={night * 0.6} />
      <path d={`M4 ${top + 1} L64 ${top + 1}`} stroke="#b8b0a0" strokeWidth={1.4} opacity={0.8} />
      <path d={`M16 62 L16 52 Q22 44 28 52 L28 62Z`} fill="#6a3f2c" stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={1.2} />
      <Win x={36} y={top + 14} lit={lit} delay={delay} />
    </g>
  );
}

/** City block: window grid, ledges, a water tank or an AC unit on the roof slab, a shop awning at street level. */
export function Tower({ seed, lit, delay, night = 0 }: { seed: number; lit: boolean; delay: number; night?: number }) {
  const colors = ["#8c7a96", "#a7745a", "#7d8fa6", "#b08a6a", "#9a7aa0"];
  const wall = colors[seed % colors.length];
  const top = 8 + (seed % 3) * 5;
  const wins: ReactNode[] = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      wins.push(<Win key={`${i}${j}`} x={14 + i * 14} y={top + 20 + j * 11} w={8} h={8} lit={lit} delay={delay + (i + j * 3) * 40} />);
  return (
    <g>
      <ellipse cx={37} cy={64} rx={29} ry={3.5} fill={SHADOW} />
      <ellipse className="st-win" cx={34} cy={64} rx={26} ry={6} fill={COLORS.glow} style={{ opacity: lit ? 0.25 : 0, transitionDelay: `${lit ? delay : 0}ms`, mixBlendMode: "screen" }} />
      <Outline d={wobblyRect(9, top + 6, 50, 58 - top, seed, 1.2)} fill={wall} shadow={wobblyRect(46, top + 8, 12, 54 - top, seed + 1, 0.7)} night={night} offset />
      <Outline d={wobblyRect(5, top, 58, 9, seed + 2, 1)} fill="#EFDCB0" night={night * 0.6} />
      {wins}
    </g>
  );
}

/** Garden bed (ground slot): curved rows of round cabbage tufts and a couple of stones. */
export function Garden({ seed, green = true }: { seed: number; green?: boolean }) {
  const rows: ReactNode[] = [];
  for (let i = 0; i < 3; i++) {
    const y = 26 + i * 12;
    rows.push(<path key={`r${i}`} d={`M10 ${y} Q34 ${y - 5 + (seed % 3)} 58 ${y}`} stroke="#6b4a32" strokeWidth={2} fill="none" opacity={0.7} />);
    for (let k = 0; k < 4; k++) {
      const x = 15 + k * 12;
      rows.push(<circle key={`${i}-${k}`} cx={x} cy={y - 2 - Math.sin(k) * 2} r={3.8} fill={green ? (k % 2 ? COLORS.leaf : "#3a9a55") : "#9b8458"} stroke={COLORS.ink} strokeOpacity={0.4} strokeWidth={0.8} />);
    }
  }
  return (
    <g>
      <Outline d={wobblyRect(5, 14, 58, 48, seed, 1.5)} fill="#8a6446" shadow={wobblyRect(5, 54, 58, 8, seed + 1, 0.6)} offset />
      {rows}
    </g>
  );
}

/** Gravel solar-field plot (town). */
export function FieldPlot({ seed }: { seed: number }) {
  return (
    <g>
      <Outline d={wobblyRect(5, 10, 58, 52, seed, 1.5)} fill="#d9c79b" shadow={wobblyRect(5, 54, 58, 8, seed + 1, 0.6)} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={14 + ((i * 17 + seed) % 40)} cy={18 + ((i * 13 + seed) % 36)} r={2} fill="#b9a779" />
      ))}
      {[24, 36, 48].map((y, i) => (
        <path key={y} d={wobblyLine([[10, y], [58, y]], seed + 20 + i, 1.6)} stroke="#b39d6e" strokeWidth={1.4} fill="none" />
      ))}
      <path d={wobblyLine([[5, 62], [63, 62]], seed + 9, 1)} stroke="#7a5a3c" strokeWidth={2} strokeDasharray="3 3" fill="none" opacity={0.7} />
    </g>
  );
}

/** Solar panel: cream frame, darker shadow side, a visible mount and thick legs, a highlight that sweeps with the sun. */
export function Panel({ flat, glint, seed, dim }: { flat: boolean; glint: number; seed: number; dim?: boolean }) {
  const y = flat ? 22 : 24;
  const poly = wobblyPoly([[12, y + 22], [22, y], [58, y], [50, y + 22]], seed, 0.8);
  const gl = Math.max(0, Math.min(1, glint));
  const sweep = 18 + (1 - gl) * 24;
  return (
    <g opacity={dim ? 0.55 : 1}>
      {!flat && <path d={wobblyLine([[24, y + 22], [20, y + 36], [28, y + 36], [30, y + 22]], seed + 5, 0.6)} stroke="#4a3a30" strokeWidth={3.4} fill="none" strokeLinecap="round" />}
      {!flat && <path d={wobblyLine([[48, y + 22], [44, y + 36], [52, y + 36], [54, y + 22]], seed + 6, 0.6)} stroke="#4a3a30" strokeWidth={3.4} fill="none" strokeLinecap="round" />}
      {flat && <path d={`M16 ${y + 22} h34 l-2 3 h-30z`} fill="#6b5a4a" stroke={COLORS.ink} strokeOpacity={0.5} strokeWidth={1} />}
      <path d={poly} fill="#FFFEF7" {...INK} strokeWidth={1.6} />
      <path d={wobblyPoly([[14, y + 20], [23, y + 2], [56, y + 2], [49, y + 20]], seed + 2, 0.4)} fill={COLORS.panel} />
      <path d={`M49 ${y + 20} L56 ${y + 2} L58 ${y} L50 ${y + 22}Z`} fill="#1f4468" />
      {[0.33, 0.66].map((t) => (
        <line key={t} x1={14 + 36 * t} y1={y + 20} x2={23 + 33 * t} y2={y + 2} stroke={COLORS.glint} strokeWidth={0.8} opacity={0.55} />
      ))}
      <line x1={17} y1={y + 11} x2={53} y2={y + 11} stroke={COLORS.glint} strokeWidth={0.8} opacity={0.55} />
      <path d={`M${sweep} ${y + 2} L${sweep + 8} ${y + 2} L${sweep - 1} ${y + 20} L${sweep - 9} ${y + 20}Z`} fill="#fff" opacity={0.06 + gl * 0.42} />
    </g>
  );
}

/** Honey jar battery. `fill` 0..1 is the global charge. `strain` flashes amber. */
export function Jar({ fill, strain, seed, hot, waste }: { fill: number; strain: boolean; seed: number; hot: boolean; waste?: boolean }) {
  const h = 36;
  const level = Math.max(0, Math.min(1, fill)) * h;
  return (
    <g>
      <ellipse cx={34} cy={60} rx={20} ry={4} fill={SHADOW} />
      <path d={wobblyRect(18, 14, 32, 46, seed, 1)} fill="rgba(255,254,247,0.55)" {...INK} />
      <clipPath id={`jar-${seed}`}>
        <path d={wobblyRect(20, 17, 28, 41, seed + 1, 0.6)} />
      </clipPath>
      <g clipPath={`url(#jar-${seed})`}>
        <rect x={18} y={58 - level} width={34} height={level + 2} fill={hot ? "#e59a00" : COLORS.sun} />
        <path d={wobblyLine([[18, 58 - level], [30, 56 - level], [42, 58 - level], [52, 56.5 - level]], seed + 4, 1.2)} stroke="#fff3c0" strokeWidth={1.6} fill="none" opacity={0.8} />
      </g>
      <path d={wobblyRect(16, 9, 36, 8, seed + 2, 0.8)} fill={COLORS.clay} {...INK} />
      <line x1={23} y1={22} x2={23} y2={52} stroke="#fff" strokeWidth={2} opacity={0.5} strokeLinecap="round" />
      {strain && <path d={wobblyRect(14, 7, 40, 56, seed + 7, 1)} fill="none" stroke="#f59e0b" strokeWidth={3} opacity={0.9} />}
    </g>
  );
}

/** A few dust puffs when something lands. */
export function Dust() {
  return (
    <g className="st-dust" fill="#e9d3a6" stroke={COLORS.ink} strokeOpacity={0.3} strokeWidth={0.6}>
      <circle cx={18} cy={60} r={3} style={{ ["--dx" as string]: "-12px" }} />
      <circle cx={34} cy={62} r={3.4} style={{ ["--dx" as string]: "0px" }} />
      <circle cx={50} cy={60} r={3} style={{ ["--dx" as string]: "12px" }} />
    </g>
  );
}

export function Marker({ roof }: { roof: boolean }) {
  const y = roof ? 30 : 38;
  return (
    <g>
      <circle cx={34} cy={y} r={9} fill="rgba(255,254,247,0.92)" stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={1.4} />
      <path d={`M34 ${y - 4.5}v9M29.5 ${y}h9`} stroke={COLORS.ink} strokeOpacity={0.8} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  );
}

/** Half-sun mark for the tree-shaded roofs. */
export function HalfSun() {
  return (
    <g transform="translate(55 12)">
      <circle r={6} fill="#fff6d6" stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={1} />
      <path d="M0 -6 A6 6 0 0 1 0 6Z" fill={COLORS.sun} />
    </g>
  );
}

export function MangoTree({ seed }: { seed: number }) {
  return (
    <g>
      <ellipse cx={34} cy={58} rx={32} ry={7} fill="rgba(30,42,74,0.2)" />
      <path d={wobblyRect(30, 34, 8, 26, seed, 0.8)} fill="#6b4a36" {...INK} />
      <path d={blob(34, 26, 28, 20, seed + 1, 0.1)} fill="#2f7d3c" {...INK} />
      <path d={blob(42, 30, 16, 11, seed + 2, 0.12)} fill="#256a31" />
      {[[20, 22], [34, 14], [46, 24], [28, 32]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="#f08a2c" />
      ))}
    </g>
  );
}

/** Switch badge on the glowing buildings: lever up = on. */
export function Badge({ on, x = 50, y = 4 }: { on: boolean; x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={16} height={16} rx={5} fill={COLORS.cream} stroke={COLORS.ink} strokeOpacity={0.7} strokeWidth={1.2} />
      <rect x={4} y={3} width={8} height={10} rx={3} fill={on ? COLORS.leaf : "#c9bfa6"} />
      <circle cx={8} cy={on ? 5.5 : 10.5} r={2.6} fill={COLORS.cream} />
    </g>
  );
}

/** The village well with a water tank. `level` 0..1. */
export function Pump({ level, running, ripple, lit }: { level: number; running: boolean; ripple: boolean; lit: boolean }) {
  const h = 22 * Math.max(0, Math.min(1, level));
  return (
    <g>
      <ellipse cx={34} cy={63} rx={27} ry={4} fill={SHADOW} />
      <path d={wobblyLine([[22, 62], [26, 36]], 3, 0.6)} stroke="#6b4a36" strokeWidth={3} fill="none" />
      <path d={wobblyLine([[48, 62], [44, 36]], 4, 0.6)} stroke="#6b4a36" strokeWidth={3} fill="none" />
      <path d={wobblyRect(18, 12, 32, 26, 5, 1)} fill={level > 0.02 ? "#d9d2c0" : "#5f6f78"} {...INK} />
      <clipPath id="tank-clip">
        <path d={wobblyRect(20, 14, 28, 22, 6, 0.5)} />
      </clipPath>
      <g clipPath="url(#tank-clip)">
        <rect x={18} y={36 - h} width={34} height={h + 1} fill={COLORS.water} />
      </g>
      {level < 0.5 && <path d="M34 17 q-6 8 -6 11 a6 6 0 0 0 12 0 q0 -3 -6 -11z" fill={COLORS.water} />}
      <path d={wobblyRect(16, 8, 36, 6, 7, 0.8)} fill={COLORS.clay} {...INK} />
      <path d="M52 40 q8 0 8 10 v10" stroke="#8a8a8a" strokeWidth={3} fill="none" />
      {lit && <circle cx={34} cy={25} r={22} fill={COLORS.water} opacity={0.14} />}
    </g>
  );
}

export function Clinic({ lit, delay, warm, pulse, night = 0 }: { lit: boolean; delay: number; warm: boolean; pulse: boolean; night?: number }) {
  return (
    <g>
      <ellipse cx={37} cy={63} rx={29} ry={4} fill={SHADOW} />
      <Outline d={wobblyRect(7, 22, 54, 40, 31, 1.2)} fill="#F4EBD6" shadow={wobblyRect(46, 24, 14, 36, 32, 0.6)} night={night} offset />
      <Outline d={wobblyRect(4, 16, 60, 9, 33, 1)} fill="#b8c9c2" night={night * 0.6} />
      <path d="M34 28v12M28 34h12" stroke={COLORS.water} strokeWidth={4} strokeLinecap="round" />
      <path d="M26 62 h16 v-3 h-16z" fill="#cfc6b0" stroke={COLORS.ink} strokeOpacity={0.5} strokeWidth={1} />
      <path d="M58 16 V4 l8 3 l-8 3" stroke={COLORS.ink} strokeWidth={1.2} fill={COLORS.water} />
      <Win x={12} y={44} lit={lit} delay={delay} />
      <Win x={46} y={44} lit={lit} delay={delay + 40} />
      {warm && (
        <g transform="translate(4 -6)" className={pulse ? "st-hotpulse" : undefined}>
          <rect x={0} y={0} width={9} height={24} rx={4.5} fill={COLORS.cream} stroke="#a33" strokeWidth={1.4} />
          <rect x={3} y={8} width={3} height={13} rx={1.5} fill="#d33" />
          <circle cx={4.5} cy={21} r={4.5} fill="#d33" />
        </g>
      )}
    </g>
  );
}

export function School({ lit, delay, day, night = 0 }: { lit: boolean; delay: number; day: number; night?: number }) {
  return (
    <g>
      <ellipse cx={37} cy={63} rx={29} ry={4} fill={SHADOW} />
      <Outline d={wobblyRect(6, 24, 56, 38, 41, 1.2)} fill="#E7B35F" shadow={wobblyRect(46, 26, 15, 34, 42, 0.6)} night={night} offset />
      <Outline d={wobblyPoly([[3, 26], [34, 8], [65, 26]], 43, 1)} fill={COLORS.panel} night={night * 0.5} />
      <path d="M34 8V0" stroke={COLORS.ink} strokeWidth={1.4} />
      <path d="M34 0l10 3-10 3z" fill={COLORS.clay} />
      <path d="M52 22 q3 -6 6 0z" fill="#d9a441" stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={1} />
      {[0, 1, 2].map((i) => (
        <Win key={i} x={11 + i * 16} y={36} lit={lit} delay={delay + i * 40} />
      ))}
      <rect x={28} y={50} width={12} height={12} rx={1} fill="#7a4a35" />
      <circle cx={10} cy={60} r={3} fill={COLORS.cream} stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={1} />
      {day >= 3 && <path d="M47 20c3-3 7-3 10 0M44 16c5-5 12-5 17 0" stroke={COLORS.cream} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.9} />}
    </g>
  );
}

/** Irrigation fields: nine tiles that go green one by one. */
export function Fields({ progress, running }: { progress: number; running: boolean }) {
  const tiles: ReactNode[] = [];
  const n = Math.floor(progress * 9 + 1e-6);
  for (let i = 0; i < 9; i++) {
    const x = 6 + (i % 3) * 19;
    const y = 12 + Math.floor(i / 3) * 16;
    tiles.push(
      <path
        key={i}
        d={wobblyRect(x, y, 17, 14, 50 + i, 0.9)}
        fill={i < n ? COLORS.leaf : "#b09062"}
        stroke={COLORS.ink}
        strokeOpacity={0.5}
        strokeWidth={1}
        style={{ transition: "fill 600ms" }}
      />,
    );
  }
  return (
    <g>
      <ellipse cx={34} cy={63} rx={29} ry={3} fill={SHADOW} />
      {tiles}
      {running && (
        <g stroke={COLORS.water} strokeWidth={1.6} fill="none" strokeLinecap="round">
          <path d="M34 32q-8-10-14-6M34 32q8-10 14-6M34 32q0-12 0-14" />
        </g>
      )}
      <circle cx={34} cy={32} r={3} fill="#6b6b6b" />
    </g>
  );
}

/** Bus depot: a shed with three buses and plugs that light up with charge. */
export function Depot({ progress, running }: { progress: number; running: boolean }) {
  const lit = Math.floor(progress * 3 + 1e-6);
  return (
    <g>
      <ellipse cx={34} cy={64} rx={31} ry={3.5} fill={SHADOW} />
      <Outline d={wobblyRect(3, 14, 62, 14, 61, 1)} fill="#8c7a96" />
      <Outline d={wobblyRect(5, 28, 58, 34, 62, 1.2)} fill="#D9CDB3" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${8 + i * 19} 36)`}>
          <path d={wobblyRect(0, 0, 17, 18, 63 + i, 0.8)} fill={i < lit ? COLORS.sun : "#c9b27a"} {...INK} />
          <rect x={2} y={3} width={13} height={6} rx={1} fill="#fffbe6" opacity={0.85} />
          <circle cx={4} cy={19} r={2.4} fill="#3a2a33" />
          <circle cx={13} cy={19} r={2.4} fill="#3a2a33" />
          <circle cx={8.5} cy={-3} r={2.2} fill={i < lit ? COLORS.glow : "#8a8372"} />
        </g>
      ))}
    </g>
  );
}

export function MarketStalls({ lit, delay }: { lit: boolean; delay: number }) {
  const awn = [COLORS.clay, COLORS.sun, COLORS.leaf, COLORS.panel];
  return (
    <g>
      <ellipse cx={34} cy={63} rx={29} ry={4} fill={SHADOW} />
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${6 + i * 29} 20)`}>
          <path d={wobblyRect(2, 14, 24, 26, 70 + i, 1)} fill="#EADCB8" {...INK} />
          <path d={wobblyPoly([[-2, 14], [28, 14], [24, 4], [2, 4]], 72 + i, 0.8)} fill={awn[i]} {...INK} />
          <path d="M3 14l3 5 3-5 3 5 3-5 3 5 3-5 3 5 3-5" stroke={awn[i + 2]} strokeWidth={3} fill="none" />
          <circle cx={9} cy={30} r={2.4} fill={COLORS.leaf} />
          <circle cx={15} cy={31} r={2.4} fill={COLORS.clay} />
          <circle cx={20} cy={30} r={2.4} fill={COLORS.sun} />
        </g>
      ))}
      <Win x={30} y={52} w={6} h={6} lit={lit} delay={delay} />
    </g>
  );
}

export { Outline };

/** A villager: dot head, bean body. Idles with a small bob; `i` offsets the timing. */
export function Person({ x, y, color, i = 0 }: { x: number; y: number; color: string; i?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g>
        <ellipse cx={0} cy={5} rx={3.2} ry={1.2} fill={SHADOW} />
        <path d="M-2.6 4 q0 -7 2.6 -7 q2.6 0 2.6 7z" fill={color} stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={0.8} />
        <circle cx={0} cy={-5} r={2.2} fill="#8a5a3c" stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={0.8} />
      </g>
    </g>
  );
}

export function Goat({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={5} rx={6} ry={1.4} fill={SHADOW} />
      <path d={wobblyRect(-5, -2, 10, 6, 9, 0.5)} fill="#f2ead8" stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={0.9} />
      <circle cx={6} cy={-3} r={2.4} fill="#f2ead8" stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={0.9} />
      <path d="M5 -5 l-1 -3 M7 -5 l1 -3 M-4 4 v3 M3 4 v3" stroke={COLORS.ink} strokeOpacity={0.7} strokeWidth={0.9} />
    </g>
  );
}

export function Chickens({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${i * 7} ${i})`}>
          <circle r={2.4} fill="#e9a05a" stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={0.7} />
          <circle cx={2.2} cy={-1.8} r={1.1} fill="#d64f3a" />
        </g>
      ))}
    </g>
  );
}

/** A small tree for the road edges. */
export function Tree({ x, y, s = 1, seed = 1 }: { x: number; y: number; s?: number; seed?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={9} ry={2.6} fill={SHADOW} />
      <rect x={-1.4} y={-8} width={2.8} height={10} fill="#6b4a36" />
      <path d={blob(0, -13, 8, 7, seed, 0.14)} fill="#3a8a4a" stroke={COLORS.ink} strokeOpacity={0.55} strokeWidth={1} />
    </g>
  );
}

export function GrassTuft({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M-5 0 q1 -9 3 -10 q0 6 1 10 M-1 0 q1 -12 4 -13 q-1 8 0 13 M3 0 q2 -8 5 -8 q-2 5 -2 8" fill={COLORS.leaf} stroke={COLORS.ink} strokeOpacity={0.45} strokeWidth={0.8} opacity={0.9} />;
}

export function Rock({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M-7 0 q1 -8 7 -8 q7 0 8 8z" fill="#b9b2a4" stroke={COLORS.ink} strokeOpacity={0.55} strokeWidth={1} />;
}
