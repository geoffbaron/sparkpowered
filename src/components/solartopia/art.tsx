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
function Outline({ d, fill, shadow }: { d: string; fill: string; shadow?: string }) {
  return (
    <>
      <path d={d} fill={fill} {...INK} />
      {shadow && <path d={shadow} fill={SHADOW} />}
    </>
  );
}

const WALLS = ["#C8734B", "#D68F5A", "#B9654A", "#CF8561", "#C07B52"];

/** Window with warm glow. `lit` fades in after `delay` ms (staggered 40 ms apart at dusk). */
export function Win({ x, y, w = 8, h = 9, lit, delay = 0 }: { x: number; y: number; w?: number; h?: number; lit: boolean; delay?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={1.5} fill="#3A2A33" opacity={0.85} />
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
      <circle
        className="st-win"
        cx={x + w / 2}
        cy={y + h / 2}
        r={w * 2.3}
        fill={COLORS.glow}
        style={{ opacity: lit ? 0.38 : 0, transitionDelay: `${lit ? delay : 0}ms` }}
      />
    </g>
  );
}

/** Village house: walls, roof slab, door, window. The roof slab is where the panel goes. */
export function House({ seed, lit, delay, tall = false }: { seed: number; lit: boolean; delay: number; tall?: boolean }) {
  const wall = WALLS[seed % WALLS.length];
  const top = tall ? 8 : 24;
  return (
    <g>
      <ellipse cx={34} cy={63} rx={29} ry={4} fill={SHADOW} />
      <ellipse className="st-win" cx={34} cy={64} rx={33} ry={9} fill={COLORS.glow} style={{ opacity: lit ? 0.45 : 0, transitionDelay: `${lit ? delay : 0}ms` }} />
      <Outline d={wobblyRect(8, top + 6, 52, 56 - top, seed, 1.3)} fill={wall} shadow={wobblyRect(44, top + 8, 15, 52 - top, seed + 1, 0.8)} />
      <Outline d={wobblyRect(4, top, 60, 11, seed + 2, 1.1)} fill="#EFDCB0" shadow={wobblyRect(4, top + 7, 60, 4, seed + 3, 0.5)} />
      <Outline d={wobblyRect(16, 44, 11, 18, seed + 4, 0.8)} fill="#7a4a35" />
      <Win x={34} y={tall ? 24 : 40} lit={lit} delay={delay} />
      {tall && <Win x={34} y={42} lit={lit} delay={delay + 40} />}
    </g>
  );
}

/** City block: taller building with a window grid and a roof slab. */
export function Tower({ seed, lit, delay }: { seed: number; lit: boolean; delay: number }) {
  const colors = ["#8c7a96", "#a7745a", "#7d8fa6", "#b08a6a", "#9a7aa0"];
  const wall = colors[seed % colors.length];
  const wins: ReactNode[] = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      wins.push(<Win key={`${i}${j}`} x={15 + i * 14} y={26 + j * 11} w={7} h={7} lit={lit} delay={delay + (i + j * 3) * 40} />);
  return (
    <g>
      <ellipse cx={34} cy={64} rx={29} ry={3.5} fill={SHADOW} />
      <ellipse className="st-win" cx={34} cy={64} rx={33} ry={8} fill={COLORS.glow} style={{ opacity: lit ? 0.4 : 0, transitionDelay: `${lit ? delay : 0}ms` }} />
      <Outline d={wobblyRect(9, 14, 50, 50, seed, 1.2)} fill={wall} shadow={wobblyRect(46, 16, 12, 46, seed + 1, 0.7)} />
      <Outline d={wobblyRect(5, 8, 58, 9, seed + 2, 1)} fill="#EFDCB0" />
      {wins}
    </g>
  );
}

/** Garden bed (ground slot): soil with leaf rows. */
export function Garden({ seed, green = true }: { seed: number; green?: boolean }) {
  const rows: ReactNode[] = [];
  for (let i = 0; i < 4; i++)
    rows.push(<path key={i} d={wobblyLine([[10, 24 + i * 9], [58, 24 + i * 9]], seed + i, 1.6)} stroke={green ? COLORS.leaf : "#9b8458"} strokeWidth={4} strokeLinecap="round" opacity={0.75} fill="none" />);
  return (
    <g>
      <Outline d={wobblyRect(5, 14, 58, 48, seed, 1.5)} fill="#8a6446" shadow={wobblyRect(5, 54, 58, 8, seed + 1, 0.6)} />
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
      <path d={wobblyLine([[5, 62], [63, 62]], seed + 9, 1)} stroke="#7a5a3c" strokeWidth={2} strokeDasharray="3 3" fill="none" opacity={0.7} />
    </g>
  );
}

/** Solar panel. `flat` sits on a roof slab, otherwise it is tilted on a stand. */
export function Panel({ flat, glint, seed, dim }: { flat: boolean; glint: number; seed: number; dim?: boolean }) {
  const y = flat ? 22 : 24;
  const poly = wobblyPoly([[12, y + 22], [22, y], [58, y], [50, y + 22]], seed, 0.8);
  const gl = Math.max(0, Math.min(1, glint));
  return (
    <g opacity={dim ? 0.55 : 1}>
      {!flat && (
        <path d={wobblyLine([[22, y + 22], [20, y + 32], [46, y + 32], [44, y + 22]], seed + 5, 0.8)} stroke="#5b4a40" strokeWidth={2.4} fill="none" />
      )}
      <path d={poly} fill={COLORS.panel} {...INK} />
      <path d={wobblyPoly([[14, y + 20], [23, y + 2], [58, y + 2], [51, y + 20]], seed + 2, 0.5)} fill="none" stroke={COLORS.glint} strokeWidth={0.9} opacity={0.6} />
      {[0.33, 0.66].map((t) => (
        <line key={t} x1={12 + 38 * t + 0} y1={y + 22} x2={22 + 36 * t} y2={y} stroke={COLORS.glint} strokeWidth={0.8} opacity={0.55} />
      ))}
      <line x1={16} y1={y + 11} x2={54} y2={y + 11} stroke={COLORS.glint} strokeWidth={0.8} opacity={0.55} />
      <path d={`M${24} ${y + 2} L${34} ${y + 2} L${26} ${y + 20} L${17} ${y + 20}Z`} fill="#fff" opacity={0.08 + gl * 0.38} />
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
      {waste && (
        <g fill={COLORS.sun} stroke={COLORS.ink} strokeOpacity={0.5} strokeWidth={0.8}>
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} className="st-mote" cx={20 + i * 8} cy={8} r={2.4} style={{ animationDelay: `${i * 160}ms` }} />
          ))}
        </g>
      )}
      {strain && <path className="st-strain" d={wobblyRect(14, 7, 40, 56, seed + 7, 1)} fill="none" stroke="#f59e0b" strokeWidth={3} />}
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

/** Empty-slot marker: a cream ring with a plus. */
export function Marker({ pulse }: { pulse: boolean }) {
  return (
    <g className={pulse ? "st-pulse" : undefined} opacity={0.9}>
      <circle cx={34} cy={36} r={13} fill="rgba(255,254,247,0.35)" stroke={COLORS.cream} strokeWidth={2} strokeDasharray="4 3" />
      <path d="M34 30v12M28 36h12" stroke={COLORS.cream} strokeWidth={2.4} strokeLinecap="round" />
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
      <path d={wobblyRect(18, 12, 32, 26, 5, 1)} fill="#d9d2c0" {...INK} />
      <clipPath id="tank-clip">
        <path d={wobblyRect(20, 14, 28, 22, 6, 0.5)} />
      </clipPath>
      <g clipPath="url(#tank-clip)">
        <rect x={18} y={36 - h} width={34} height={h + 1} fill={COLORS.water} />
      </g>
      <path d={wobblyRect(16, 8, 36, 6, 7, 0.8)} fill={COLORS.clay} {...INK} />
      <path d="M52 40 q8 0 8 10 v10" stroke="#8a8a8a" strokeWidth={3} fill="none" />
      {running && <path className="st-drip" d="M60 60 q2 4 0 6" stroke={COLORS.water} strokeWidth={2.5} fill="none" strokeLinecap="round" />}
      {ripple && (
        <>
          <ellipse className="st-ripple" cx={60} cy={63} rx={4} ry={1.6} fill="none" stroke={COLORS.water} strokeWidth={1.4} />
          <ellipse className="st-ripple st-ripple-b" cx={60} cy={63} rx={4} ry={1.6} fill="none" stroke={COLORS.water} strokeWidth={1.4} />
        </>
      )}
      {lit && <circle cx={34} cy={25} r={22} fill={COLORS.water} opacity={0.14} />}
    </g>
  );
}

/** Clinic: whitewashed walls, a green cross, a thermometer that appears when the fridge is warm. */
export function Clinic({ lit, delay, warm, pulse }: { lit: boolean; delay: number; warm: boolean; pulse: boolean }) {
  return (
    <g>
      <ellipse cx={34} cy={63} rx={29} ry={4} fill={SHADOW} />
      <Outline d={wobblyRect(7, 22, 54, 40, 31, 1.2)} fill="#F4EBD6" shadow={wobblyRect(46, 24, 14, 36, 32, 0.6)} />
      <Outline d={wobblyRect(4, 16, 60, 9, 33, 1)} fill="#b8c9c2" />
      <path d="M34 28v12M28 34h12" stroke={COLORS.water} strokeWidth={4} strokeLinecap="round" />
      <Win x={12} y={44} lit={lit} delay={delay} />
      <Win x={44} y={44} lit={lit} delay={delay + 40} />
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

export function School({ lit, delay, day }: { lit: boolean; delay: number; day: number }) {
  return (
    <g>
      <ellipse cx={34} cy={63} rx={29} ry={4} fill={SHADOW} />
      <Outline d={wobblyRect(6, 24, 56, 38, 41, 1.2)} fill="#E7B35F" shadow={wobblyRect(46, 26, 15, 34, 42, 0.6)} />
      <Outline d={wobblyPoly([[3, 26], [34, 8], [65, 26]], 43, 1)} fill={COLORS.panel} />
      <path d="M34 8V0" stroke={COLORS.ink} strokeWidth={1.4} />
      <path d="M34 0l10 3-10 3z" fill={COLORS.clay} />
      {[0, 1, 2].map((i) => (
        <Win key={i} x={12 + i * 15} y={36} lit={lit} delay={delay + i * 40} />
      ))}
      <rect x={28} y={50} width={12} height={12} rx={1} fill="#7a4a35" />
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
        <g className="st-spray" stroke={COLORS.water} strokeWidth={1.6} fill="none" strokeLinecap="round">
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
          <circle cx={8.5} cy={-3} r={2.2} fill={i < lit ? COLORS.glow : "#8a8372"} className={i < lit && running ? "st-pulse" : undefined} />
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
