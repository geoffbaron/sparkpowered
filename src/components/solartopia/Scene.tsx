/**
 * The Solartopia scene: a sky/ground backdrop that fills the stage, and the
 * world (village, town, city) as one inline SVG that the camera crops with its
 * viewBox. Pure rendering; the Game owns all state.
 */

import type { ReactNode } from "react";
import { BUILDINGS, DAYS, JOBS, SLOTS, type CloudBank, type JobId, type Slot } from "@/data/solartopia";
import { COLORS, blob, hills, nightAt, skyAt, washAt, wobblyLine, wobblyPoly, wobblyRect } from "@/lib/solartopia/paint";
import { cloudWeight, rng, type Placements } from "@/lib/solartopia/sim";
import {
  Badge, Clinic, Depot, Dust, Fields, FieldPlot, Garden, Goat, GrassTuft, HalfSun, House, Jar, MangoTree, Marker, MarketStalls, Panel, Person, Pump, Rock, School, Tower, Tree,
  CELL, WORLD, cellCenter, cellX, cellY,
} from "./art";

export interface View { x: number; y: number; w: number; h: number }
export const VIEW_VILLAGE: View = { x: 0, y: 176, w: 334, h: 382 };
export const VIEW_FULL: View = { x: 0, y: 0, w: WORLD.w, h: WORLD.h };
/** World y of the horizon in each view, for the backdrop's ground band. */
const HORIZON_Y = 268;

export function lerpView(t: number): View {
  const k = Math.min(1, Math.max(0, t));
  const l = (a: number, b: number) => a + (b - a) * k;
  return { x: l(VIEW_VILLAGE.x, VIEW_FULL.x), y: l(VIEW_VILLAGE.y, VIEW_FULL.y), w: l(VIEW_VILLAGE.w, VIEW_FULL.w), h: l(VIEW_VILLAGE.h, VIEW_FULL.h) };
}
export const horizonY = () => HORIZON_Y;

export interface JobSnap { on: boolean; progress: number; done: boolean; powered: number; tripped: boolean }

export interface SceneSnap {
  hour: number;
  sun: number;
  running: boolean;
  batteryFrac: number;
  usingBattery: boolean;
  /** A flexible job is drawing on the jar (the amber warning). */
  usingFlex: boolean;
  flowTotal: number;
  jobs: Record<JobId, JobSnap>;
  fridgeWarm: boolean;
  fridgeLate: boolean;
  /** Sun is being wasted because the jars are full. */
  wasted: boolean;
  /** Windows glow (the dusk light-up). */
  lit: boolean;
  /** School and study lights powered right now. */
  schoolLit: boolean;
  needPct: Record<JobId, number>;
  /** 0 day .. 1 deep night. */
  night: number;
}

/* ------------------------------------------------------------------ */
/* Backdrop: sky, sun, moon, stars, birds, far hills, paper grain      */
/* ------------------------------------------------------------------ */

const STARS = (() => {
  const r = rng(77);
  return Array.from({ length: 46 }, () => ({ x: r() * 100, y: r() * 46, s: 0.6 + r() * 1.3, p: r() }));
})();

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .25  0 0 0 0 .18  0 0 0 0 .14  0 0 0 1.7 -.35'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

const BLOTCH =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='b'><feTurbulence type='fractalNoise' baseFrequency='.02' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .16  0 0 0 1.4 -.45'/></filter><rect width='100%25' height='100%25' filter='url(%23b)'/></svg>\")";

/** A paper sun: a disc, an inner disc and twelve triangle rays. */
function PaperSun({ moon }: { moon: boolean }) {
  if (moon)
    return (
      <svg width={56} height={56} viewBox="-28 -28 56 56">
        <circle r={13} fill="#fffef7" stroke={COLORS.ink} strokeOpacity={0.5} strokeWidth={1.4} />
        <circle cx={5} cy={-3} r={11} fill="#cfd3e8" opacity={0.0} />
        <circle cx={-4} cy={3} r={2.4} fill="#e4e4f0" />
        <circle cx={4} cy={-5} r={1.8} fill="#e4e4f0" />
      </svg>
    );
  return (
    <svg width={64} height={64} viewBox="-32 -32 64 64">
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M-3.6 -17 L0 -29 L3.6 -17Z" fill="#f5b700" stroke={COLORS.ink} strokeOpacity={0.55} strokeWidth={1} transform={`rotate(${i * 30})`} />
      ))}
      <circle r={16} fill="#F5B700" stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={1.5} />
      <circle r={10} fill="#ffe27a" />
    </svg>
  );
}

export function Backdrop({ hour, horizon, dark }: { hour: number; horizon: number; dark: boolean }) {
  const h = dark ? 3 : hour;
  const sky = skyAt(h);
  const d24 = ((h % 24) + 24) % 24;
  const dayT = (d24 - 6) / 12;
  const isDay = dayT >= -0.02 && dayT <= 1.02;
  const nightT = d24 >= 18 ? (d24 - 18) / 12 : (d24 + 6) / 12;
  const sx = 10 + 80 * (isDay ? dayT : nightT);
  const arc = (isDay ? Math.sin(Math.PI * Math.min(1, Math.max(0, dayT))) : Math.sin(Math.PI * Math.min(1, Math.max(0, nightT)))) * (horizon - 14);
  const sy = horizon - 2 - arc * (isDay ? 0.95 : 0.7);
  const starA = Math.max(0, Math.min(1, d24 >= 18 ? (d24 - 18.2) / 1.5 : d24 < 6 ? 1 - Math.max(0, d24 - 5) / 1.2 : 0));
  const dayness = 1 - nightAt(h);
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true" style={{ background: `linear-gradient(${sky.top}, ${sky.bot} ${horizon}%)` }}>
      {/* three hard paper bands of sky */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ opacity: 0.3 * dayness }}>
        <path d={`M0 ${horizon * 0.55} Q25 ${horizon * 0.5} 50 ${horizon * 0.56} T100 ${horizon * 0.52} V${horizon * 0.75} Q70 ${horizon * 0.8} 40 ${horizon * 0.74} T0 ${horizon * 0.78}Z`} fill="#b8d4e6" />
        <path d={`M0 ${horizon * 0.8} Q30 ${horizon * 0.76} 55 ${horizon * 0.82} T100 ${horizon * 0.79} V${horizon + 2} H0Z`} fill="#f6e3bf" />
      </svg>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#fffef7]"
          style={{ left: `${s.x}%`, top: `${s.y * (horizon / 50)}%`, width: s.s + 0.4, height: s.s + 0.4, opacity: starA * (0.6 + 0.4 * Math.sin(hour * 2 + s.p * 9)) }}
        />
      ))}
      {dayness > 0.1 && [0, 1].map((i) => (
        <svg key={i} className="absolute st-cloud" style={{ top: `${horizon * (0.12 + i * 0.17)}%`, left: `${i * 38}%`, width: 90 + i * 22, height: 36, opacity: 0.85 * dayness, animationDuration: `${140 + i * 50}s`, animationDelay: `-${i * 70}s` }} viewBox="0 0 90 36">
          <path d={blob(30, 22, 24, 10, 800 + i, 0.1)} fill="#fffef7" stroke={COLORS.ink} strokeOpacity={0.3} strokeWidth={1} />
          <path d={blob(52, 16, 22, 11, 810 + i, 0.1)} fill="#fffef7" stroke={COLORS.ink} strokeOpacity={0.3} strokeWidth={1} />
        </svg>
      ))}
      <div className="absolute" style={{ left: `${sx}%`, top: `${sy}%`, marginLeft: -32, marginTop: -32, opacity: isDay ? 1 : starA, filter: isDay ? "drop-shadow(0 0 14px rgba(255,210,122,.55))" : "none" }}>
        <PaperSun moon={!isDay} />
      </div>
      <div className="absolute left-0 right-0 bottom-0" style={{ top: `${horizon - 1}%`, background: "linear-gradient(#e9d3a6, #dcc08a)" }} />
    </div>
  );
}

/** Time-of-day wash (multiplied, so the lit windows stay the brightest things), vignette and paper grain over the whole stage. */
export function Wash({ hour, dark }: { hour: number; dark: boolean }) {
  const n = dark ? 1 : nightAt(hour);
  return (
    <>
      <div className="absolute inset-0 pointer-events-none st-wash" style={{ background: washAt(dark ? 2 : hour), mixBlendMode: "multiply" }} aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(20,24,50,0) 45%, rgba(20,24,50,0.55) 100%)", opacity: 0.8 * n }} aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px", opacity: 0.05, mixBlendMode: "multiply" }} aria-hidden="true" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* World                                                               */
/* ------------------------------------------------------------------ */

export interface WorldProps {
  view: View;
  /** 0 village, 1 town, 2 city. */
  ch: number;
  day: number;
  snap: SceneSnap;
  placements: Placements;
  nonce: Record<string, number>;
  selected: string | null;
  moving: boolean;
  buildMode: boolean;
  activeJobs: JobId[];
  cloud?: CloudBank;
  reduced: boolean;
  onSlot: (id: string) => void;
  onJob: (id: JobId) => void;
}

const HUB = {
  village: [cellX(2), cellY(4) - 6] as [number, number],
  town: [cellX(5) + 34, cellY(3) + 40] as [number, number],
  city: [cellX(3) + 34, cellY(2) - 8] as [number, number],
};

function hubFor(s: Slot) {
  return HUB[s.chapter];
}

function Terrain({ ch, night }: { ch: number; night: number }) {
  const r = rng(515);
  const rivers = wobblyPoly([[-10, 470], [40, 488], [110, 520], [160, 566], [100, 570], [40, 540], [-10, 520]], 91, 4);
  const patches = Array.from({ length: 3 }, (_, i) => {
    const kind = i % 3;
    return { cx: -200 + r() * 880, cy: 300 + r() * 250, rx: 28 + r() * 46, ry: 10 + r() * 20, c: kind === 0 ? "#d9b878" : kind === 1 ? COLORS.clay : COLORS.leaf, o: kind === 0 ? 0.35 : kind === 1 ? 0.15 : 0.18, i };
  });
  const road = [[cellX(1) + 34, cellY(3) + 40], [cellX(2) + 34, cellY(4) + 34], [cellX(3) + 34, cellY(5) + 34], [cellX(4) + 20, cellY(5) + 50], [cellX(6) + 34, cellY(5) + 34], [cellX(6) + 120, cellY(5) + 30]] as [number, number][];
  const road2 = [[cellX(2) + 34, cellY(4) + 34], [cellX(3) + 34, cellY(3) + 34], [cellX(4) + 34, cellY(2) + 34]] as [number, number][];
  return (
    <g>
      <path d={hills(-700, 1200, 258, 50, 11, 420)} fill={COLORS.plum} opacity={0.28} />
      <path d={hills(-700, 1200, 274, 34, 12, 420)} fill={COLORS.clay} opacity={0.3} />
      <path d={hills(-700, 1200, 286, 22, 13, 420)} fill="#b99a64" opacity={0.5} />
      {/* ground, with a scalloped shadow edge */}
      <path d={wobblyPoly([[-700, 288], [-300, 282], [-100, 286], [120, 280], [260, 286], [380, 278], [510, 286], [800, 282], [1200, 288], [1200, 900], [-700, 900]], 21, 3)} fill="#b99a64" opacity={0.7} />
      <path d={wobblyPoly([[-700, 284], [-300, 278], [-100, 282], [120, 276], [260, 282], [380, 274], [510, 282], [800, 278], [1200, 284], [1200, 900], [-700, 900]], 20, 3)} fill={COLORS.sand} stroke={COLORS.ink} strokeOpacity={0.35} strokeWidth={1.2} />
      {patches.map((p) => (
        <path key={p.i} d={blob(p.cx, p.cy, p.rx, p.ry, 300 + p.i, 0.2)} fill={p.c} opacity={p.o} />
      ))}
      {/* dry riverbed */}
      <path d={rivers} fill="#cdb98f" stroke={COLORS.ink} strokeOpacity={0.3} strokeWidth={1} />
      {[[30, 500], [70, 520], [110, 540], [140, 556]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={4} ry={2.2} fill="#a8946a" />
      ))}
      {/* roads: shadow, body, cream edge, dashed centre */}
      {[road, road2].map((pts, i) => (
        <g key={i}>
          <path d={wobblyLine(pts.map(([x, y]) => [x + 2, y + 3] as [number, number]), 5 + i, 3)} stroke="#b99a64" strokeWidth={i ? 15 : 18} strokeLinecap="round" fill="none" opacity={0.7} />
          <path d={wobblyLine(pts, 5 + i, 3)} stroke="#f3e4c0" strokeWidth={i ? 12 : 15} strokeLinecap="round" fill="none" />
          <path d={wobblyLine(pts, 5 + i, 3)} stroke="#d8b98a" strokeWidth={1.4} strokeDasharray="6 7" fill="none" />
        </g>
      ))}
      {ch >= 2 && (
        <g className="st-fadein">
          <path d={wobblyPoly([[-700, 154], [-100, 150], [150, 146], [330, 152], [510, 146], [900, 152], [1200, 150], [1200, 290], [-700, 290]], 41, 3)} fill="#7b6485" stroke={COLORS.ink} strokeOpacity={0.4} strokeWidth={1.2} />
          <path d={wobblyLine([[-300, cellY(2) - 3], [cellX(6) + 300, cellY(2) - 3]], 42, 2)} stroke="#6a5575" strokeWidth={18} strokeLinecap="round" fill="none" />
          <path d={`M${-300} ${cellY(2) - 3} H${cellX(6) + 300}`} stroke="#f3e4c0" strokeWidth={1.6} strokeDasharray="10 9" fill="none" opacity={0.9} />
          {[0, 1, 2, 3, 4].map((k) => (
            <path key={k} d={`M${cellX(5) + 4 + k * 7} ${cellY(2) - 11} v16`} stroke="#fffef7" strokeWidth={3.4} opacity={0.85} />
          ))}
        </g>
      )}
      <rect x={-700} y={150} width={1900} height={760} fill="#1e2a4a" opacity={0.5 * night} />
    </g>
  );
}

function Cloud({ cloud, hour, reduced }: { cloud: CloudBank; hour: number; reduced: boolean }) {
  const p = Math.min(1, Math.max(0, (hour - (cloud.start - 2)) / 2));
  const q = Math.min(1, Math.max(0, (hour - cloud.end) / 1.5));
  const left = cloud.cols[0] === 0;
  const dir = left ? -1 : 1;
  const away = (1 - p) * 230 + q * 230;
  const w = cloudWeight(cloud, hour);
  const x0 = cellX(cloud.cols[0]);
  const x1 = cellX(cloud.cols[cloud.cols.length - 1]) + CELL;
  const cx = (x0 + x1) / 2;
  const op = Math.min(1, p * 1.2) * (1 - q);
  if (op <= 0.01) return null;
  return (
    <g style={{ transform: `translateX(${dir * away}px)`, transition: reduced ? "none" : "transform 200ms linear" }} opacity={op} pointerEvents="none">
      <path d={blob(cx, cellY(2) + 150, (x1 - x0) / 2, 120, 201, 0.1)} fill="#1E2A4A" opacity={0.2 + 0.14 * w} />
      <g fill="#fffef7" stroke={COLORS.ink} strokeOpacity={0.4} strokeWidth={1.2}>
        <path d={blob(cx - 40, 112, 46, 22, 202, 0.1)} />
        <path d={blob(cx + 6, 100, 60, 28, 203, 0.1)} />
        <path d={blob(cx + 54, 114, 42, 20, 204, 0.1)} />
      </g>
    </g>
  );
}

/** Three layers of towers behind the city blocks. The near two light up at dusk, 40 ms apart. */
function Skyline({ lit, night }: { lit: boolean; night: number }) {
  const r = rng(404);
  let n = 0;
  const layers: { color: string; scale: number; y: number; wins: boolean; haze: number }[] = [
    { color: "#8a77a0", scale: 0.62, y: 150, wins: false, haze: 0.45 },
    { color: "#6d5580", scale: 0.85, y: 152, wins: true, haze: 0.18 },
    { color: "#5b4a72", scale: 1.15, y: 154, wins: true, haze: 0 },
  ];
  const out: ReactNode[] = [];
  layers.forEach((L, li) => {
    const towers: ReactNode[] = [];
    let x = -420 + li * 17;
    let i = 0;
    while (x < 960) {
      const w = (34 + Math.floor(r() * 20)) * L.scale;
      const h = (38 + Math.floor(r() * 56)) * L.scale;
      const y = L.y - h;
      const shape = Math.floor(r() * 4);
      const wins: ReactNode[] = [];
      if (L.wins)
        for (let a = 0; a < Math.floor((w - 8) / 9); a++)
          for (let b = 0; b < Math.floor((h - 10) / 12); b++) {
            const on = r() < 0.7;
            const wx = x + 6 + a * 9;
            const wy = y + 7 + b * 12;
            wins.push(
              <g key={`${a}-${b}`}>
                <rect x={wx} y={wy} width={5} height={6} fill="#2a1d24" opacity={0.55} />
                {on && <rect className="st-win" x={wx} y={wy} width={5} height={6} fill={COLORS.glow} style={{ opacity: lit ? 1 : 0, transitionDelay: lit ? `${(n++ % 60) * 40}ms` : "0ms" }} />}
              </g>,
            );
          }
      towers.push(
        <g key={i}>
          <path d={wobblyRect(x, y, w, h + 4, 600 + li * 100 + i, 1.1)} fill={L.color} stroke={COLORS.ink} strokeOpacity={0.5} strokeWidth={1.1} />
          <path d={`M${x + w * 0.66} ${y + 1} h${w * 0.34} v${h + 2} h-${w * 0.34}z`} fill="rgba(30,42,74,0.22)" />
          {shape === 1 && <path d={wobblyRect(x + w * 0.2, y - 8 * L.scale, w * 0.6, 8 * L.scale, 700 + i, 0.5)} fill={L.color} stroke={COLORS.ink} strokeOpacity={0.45} strokeWidth={1} />}
          {shape === 2 && <path d={`M${x + w / 2} ${y} v${-14 * L.scale}`} stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={1.4} />}
          {shape === 3 && <path d={wobblyRect(x + w * 0.55, y - 9 * L.scale, 9 * L.scale, 9 * L.scale, 720 + i, 0.4)} fill="#8a6b4a" stroke={COLORS.ink} strokeOpacity={0.45} strokeWidth={1} />}
          {wins}
        </g>,
      );
      x += w + 2 + r() * 6;
      i++;
    }
    out.push(
      <g key={li}>
        {towers}
        {L.haze > 0 && <rect x={-500} y={L.y - 110} width={1500} height={110} fill="#ffd9b0" opacity={L.haze * (1 - night * 0.7)} />}
      </g>,
    );
  });
  return <g className="st-fadein">{out}</g>;
}

/** Foreground: tufts and rocks overlapping the bottom corners, two low trunks at the sides. */
function Foreground() {
  return (
    <g pointerEvents="none">
      <Tree x={-18} y={556} s={1.7} seed={3} />
      <Tree x={508} y={556} s={1.5} seed={4} />
      {[[8, 556, 1.3], [26, 552, 1], [455, 556, 1.2], [474, 553, 1.1], [236, 558, 0.9], [330, 557, 1]].map(([x, y, s], i) => (
        <GrassTuft key={i} x={x} y={y} s={s} />
      ))}
      <Rock x={52} y={558} s={1.2} />
      <Rock x={430} y={559} s={1} />
    </g>
  );
}

/** Life: villagers bob along the roads, a goat and chickens in the yards. */
function Life({ ch }: { ch: number }) {
  return (
    <g pointerEvents="none">
      <Person x={cellX(2) + 20} y={cellY(5) + 8} color={COLORS.sun} />
      <Person x={cellX(3) + 52} y={cellY(4) + 62} color={COLORS.water} i={1} />
      {ch >= 1 && <Goat x={cellX(5) + 24} y={cellY(5) + 44} />}
    </g>
  );
}

function FlowLines({ ch, placements, snap, jobs }: { ch: number; placements: Placements; snap: SceneSnap; jobs: JobId[] }) {
  const dur = 2.6;
  const style = { "--d": `${dur}s`, animationPlayState: snap.running ? "running" : "paused" } as React.CSSProperties;
  const lines: ReactNode[] = [];
  const idsByKind = Object.entries(placements);
  for (const [id, kind] of idsByKind) {
    const slot = SLOTS.find((s) => s.id === id)!;
    const hub = hubFor(slot);
    const [x, y] = cellCenter(slot.c, slot.r);
    const on = kind === "panel" ? snap.sun > 0.02 : snap.usingBattery;
    lines.push(
      <path key={id} d={`M${x} ${y} L${hub[0]} ${hub[1]}`} stroke={on ? COLORS.glow : "#fffef7"} strokeOpacity={on ? 0.7 : 0.14} strokeWidth={on ? 1.4 : 1} fill="none" strokeLinecap="round" />,
    );
  }
  const consumer = (id: JobId, c: number, r: number, hub: [number, number], key: string) => {
    const j = snap.jobs[id];
    const flow = snap.running && j.powered > 0.01 && (j.on || JOBS_FIXED.includes(id));
    const moving = flow && JOBS[id].kind === "flex";
    const [x, y] = cellCenter(c, r);
    return <path key={key} d={`M${hub[0]} ${hub[1]} L${x} ${y}`} className={moving ? "st-flow" : undefined} stroke={flow ? COLORS.glow : "#fffef7"} strokeOpacity={flow ? 0.95 : 0.14} strokeWidth={flow ? 2 : 1} fill="none" strokeLinecap="round" style={style} />;
  };
  if (jobs.includes("pump")) lines.push(consumer("pump", BUILDINGS.pump.c, BUILDINGS.pump.r, HUB.village, "l-pump"));
  if (jobs.includes("fridge")) lines.push(consumer("fridge", BUILDINGS.clinic.c, BUILDINGS.clinic.r, HUB.village, "l-clinic"));
  if (jobs.includes("school")) lines.push(consumer("school", BUILDINGS.school.c, BUILDINGS.school.r, HUB.village, "l-school"));
  if (ch >= 1 && jobs.includes("irrigation")) lines.push(consumer("irrigation", BUILDINGS.irrigation.c, BUILDINGS.irrigation.r, HUB.town, "l-irr"));
  if (ch >= 2 && jobs.includes("bus")) lines.push(consumer("bus", BUILDINGS.depot.c, BUILDINGS.depot.r, HUB.city, "l-bus"));
  if (ch >= 1) lines.push(<path key="trunk-1" d={`M${HUB.village[0]} ${HUB.village[1]} L${HUB.town[0]} ${HUB.town[1]}`} stroke="#fffef7" strokeOpacity={0.45} strokeWidth={1.4} fill="none" strokeDasharray="3 5" />);
  if (ch >= 2) lines.push(<path key="trunk-2" d={`M${HUB.town[0]} ${HUB.town[1]} L${HUB.city[0]} ${HUB.city[1]}`} stroke="#fffef7" strokeOpacity={0.45} strokeWidth={1.4} fill="none" strokeDasharray="3 5" />);
  return <g pointerEvents="none">{lines}</g>;
}
const JOBS_FIXED: JobId[] = ["fridge", "school", "lights"];

export function World(p: WorldProps) {
  const { view, ch, snap, placements, nonce, selected, buildMode } = p;
  const slots = SLOTS.filter((s) => (s.chapter === "village" ? true : s.chapter === "town" ? ch >= 1 : ch >= 2));
  const jobs = p.activeJobs;
  const lit = snap.lit;
  const key = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
  let winIdx = 0;
  const nextDelay = () => (winIdx++) * 40;

  const renderSlot = (s: Slot) => {
    const x = cellX(s.c);
    const y = cellY(s.r);
    const kind = placements[s.id];
    const seed = s.c * 7 + s.r * 13 + 3;
    const flat = s.kind === "roof";
    const jr = rng(s.c * 31 + s.r * 7 + 9);
    const jt = `translate(${((jr() - 0.5) * 10).toFixed(1)} ${((jr() - 0.5) * 6).toFixed(1)}) rotate(${((jr() - 0.5) * 2).toFixed(2)} 34 60) translate(34 60) scale(${(0.92 + jr() * 0.16).toFixed(3)}) translate(-34 -60)`;
    const base =
      s.kind === "roof" ? (s.chapter === "city" ? <Tower seed={seed} lit={lit} delay={nextDelay()} night={snap.night} /> : <House seed={seed} lit={lit} delay={nextDelay()} night={snap.night} />) :
      s.kind === "ground" ? <Garden seed={seed} green={ch >= 0} /> : <FieldPlot seed={seed} />;
    const sel = selected === s.id;
    const label = `${s.kind === "roof" ? "Roof" : s.kind === "ground" ? "Garden plot" : "Solar field"} ${s.id}${s.shaded ? " (shaded)" : ""}${kind ? `, has a ${kind}` : ", empty"}`;
    const drop = !p.reduced && nonce[s.id] ? "st-drop" : "";
    return (
      <g
        key={s.id}
        className="st-hit"
        transform={`translate(${x} ${y})`}
        role="button"
        tabIndex={buildMode ? 0 : -1}
        aria-label={label}
        data-testid={`slot-${s.id}`}
        data-kind={kind ?? "empty"}
        data-nav=""
        onClick={() => buildMode && p.onSlot(s.id)}
        onKeyDown={(e) => buildMode && key(e, () => p.onSlot(s.id))}
        style={{ cursor: buildMode ? "pointer" : "default" }}
      >
        <g transform={jt}>
        {base}
        {s.shaded && (
          <>
            <ellipse cx={34} cy={34} rx={30} ry={22} fill="rgba(30,42,74,0.16)" />
            <HalfSun />
          </>
        )}
        {kind && (
          <g key={`${s.id}-${nonce[s.id] ?? 0}`} className={drop} style={{ transformOrigin: "34px 60px", transformBox: "view-box" } as React.CSSProperties}>
            {kind === "panel" ? <Panel flat={flat} glint={snap.sun} seed={seed + 1} /> : <Jar fill={snap.batteryFrac} strain={snap.usingFlex && snap.running} hot={snap.usingFlex} seed={seed + 2} waste={snap.wasted && snap.running} />}
            {!p.reduced && nonce[s.id] ? <Dust /> : null}
          </g>
        )}
        {!kind && buildMode && <Marker roof={flat} />}
        </g>
        <rect className="st-ring" width={CELL} height={CELL} rx={8} fill="transparent" stroke={sel ? COLORS.cream : "none"} strokeWidth={sel ? 3.5 : 0} />
        <rect width={CELL} height={CELL} fill="transparent" />
      </g>
    );
  };

  const glowOutline = (c: number, r: number, h = CELL) => (
    <path className="st-glowring" d={wobblyRect(cellX(c) + 1.5, cellY(r) + 1.5, CELL - 3, h - 3, c * 11 + r, 1.2)} fill="none" stroke={COLORS.cream} strokeWidth={3} strokeLinejoin="round" />
  );

  const flexBuilding = (id: JobId, c: number, r: number, art: ReactNode, label: string) => {
    if (!jobs.includes(id)) return <g key={id} transform={`translate(${cellX(c)} ${cellY(r)})`}>{art}</g>;
    const j = snap.jobs[id];
    const canTap = !j.done;
    return (
      <g
        key={id}
        className={`st-hit ${canTap && !buildMode ? "st-glow" : ""}`}
        role="button"
        tabIndex={0}
        aria-pressed={j.on}
        aria-label={`${label}: ${j.done ? "finished" : j.on ? "on" : "off"}`}
        data-testid={`building-${id}`}
        data-on={j.on ? "1" : "0"}
        data-done={j.done ? "1" : "0"}
        data-nav=""
        onClick={() => canTap && p.onJob(id)}
        onKeyDown={(e) => key(e, () => canTap && p.onJob(id))}
        style={{ cursor: canTap ? "pointer" : "default" }}
      >
        <g transform={`translate(${cellX(c)} ${cellY(r)})`}>
          {art}
          {canTap && !buildMode && <Badge on={j.on} />}
        </g>
        {canTap && !buildMode && glowOutline(c, r)}
        <rect x={cellX(c)} y={cellY(r)} width={CELL} height={CELL} fill="transparent" />
      </g>
    );
  };

  const fixedLit = lit;
  const clinicWarm = snap.fridgeWarm;
  const decor = (c: number, r: number, node: ReactNode, k: string) => (
    <g key={k} transform={`translate(${cellX(c)} ${cellY(r)})`}>
      {node}
    </g>
  );

  return (
    <svg
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      preserveAspectRatio="xMidYMax meet"
      className="absolute inset-0 w-full h-full select-none"
      role="group"
      aria-label="Solartopia map"
      data-testid="world"
      style={{ touchAction: "manipulation" }}
    >
      <Terrain ch={ch} night={snap.night} />
      {/* locked towns sit under fog */}
      {ch >= 2 && <Skyline lit={lit} night={snap.night} />}
      {decor(2, 2, <MangoTree seed={5} />, "mango")}
      {/* town decor */}
      {ch >= 1 && decor(6, 4, <MarketStalls lit={lit} delay={nextDelay()} />, "market")}
      {/* city extras */}
      {ch >= 2 && decor(6, 0, <Tower seed={9} lit={lit} delay={nextDelay()} />, "tower2")}
      {slots.map(renderSlot)}
      {/* buildings */}
      {flexBuilding("pump", BUILDINGS.pump.c, BUILDINGS.pump.r, <Pump level={snap.jobs.pump.progress / 8} running={snap.jobs.pump.on && snap.jobs.pump.powered > 0.02} ripple={snap.jobs.pump.done} lit={snap.jobs.pump.done} />, "Water pump")}
      {decor(BUILDINGS.clinic.c, BUILDINGS.clinic.r, <Clinic lit={fixedLit && !clinicWarm} delay={nextDelay()} warm={clinicWarm} pulse={snap.fridgeLate} night={snap.night} />, "clinic")}
      {decor(BUILDINGS.school.c, BUILDINGS.school.r, <School lit={snap.schoolLit || (fixedLit && p.day >= 3 && snap.hour < 21)} delay={nextDelay()} day={p.day} night={snap.night} />, "school")}
      {ch >= 1 && flexBuilding("irrigation", BUILDINGS.irrigation.c, BUILDINGS.irrigation.r, <Fields progress={snap.jobs.irrigation.progress / 9} running={snap.jobs.irrigation.on && snap.jobs.irrigation.powered > 0.02} />, "Irrigation")}
      {ch >= 2 && flexBuilding("bus", BUILDINGS.depot.c, BUILDINGS.depot.r, <Depot progress={snap.jobs.bus.progress / 12} running={snap.jobs.bus.on && snap.jobs.bus.powered > 0.02} />, "Bus depot")}
      <Life ch={ch} />
      <FlowLines ch={ch} placements={placements} snap={snap} jobs={jobs} />
      <Foreground />
      {p.cloud && <Cloud cloud={p.cloud} hour={snap.hour} reduced={p.reduced} />}
    </svg>
  );
}

export const dayChapter = (day: number) => (DAYS[day - 1].chapter === "village" ? 0 : DAYS[day - 1].chapter === "town" ? 1 : 2);
