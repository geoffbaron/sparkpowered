/**
 * The Solartopia scene: a sky/ground backdrop that fills the stage, and the
 * world (village, town, city) as one inline SVG that the camera crops with its
 * viewBox. Pure rendering; the Game owns all state.
 */

import type { ReactNode } from "react";
import { BUILDINGS, DAYS, SLOTS, type CloudBank, type JobId, type Slot } from "@/data/solartopia";
import { COLORS, blob, hills, skyAt, washAt, wobblyLine, wobblyPoly, wobblyRect } from "@/lib/solartopia/paint";
import { cloudWeight, rng, type Placements } from "@/lib/solartopia/sim";
import {
  Badge, Clinic, Depot, Fields, FieldPlot, Garden, HalfSun, House, Dust, Jar, MangoTree, Marker, MarketStalls, Panel, Pump, School, Tower,
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

export function Backdrop({ hour, horizon, dark }: { hour: number; horizon: number; dark: boolean }) {
  const h = dark ? 3 : hour;
  const sky = skyAt(h);
  const d24 = ((h % 24) + 24) % 24;
  const dayT = (d24 - 6) / 12;
  const isDay = dayT >= -0.02 && dayT <= 1.02;
  const nightT = d24 >= 18 ? (d24 - 18) / 12 : (d24 + 6) / 12;
  const sx = 8 + 84 * (isDay ? dayT : nightT);
  const arc = (isDay ? Math.sin(Math.PI * Math.min(1, Math.max(0, dayT))) : Math.sin(Math.PI * Math.min(1, Math.max(0, nightT)))) * (horizon - 12);
  const sy = horizon - 2 - arc * (isDay ? 0.92 : 0.7);
  const starA = Math.max(0, Math.min(1, d24 >= 18 ? (d24 - 18.2) / 1.5 : d24 < 6 ? 1 - Math.max(0, d24 - 5) / 1.2 : 0));
  const birds = hour >= 6 && hour < 9 && !dark;
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true" style={{ background: `linear-gradient(${sky.top}, ${sky.bot} ${horizon}%)` }}>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#fffef7]"
          style={{ left: `${s.x}%`, top: `${s.y * (horizon / 50)}%`, width: s.s, height: s.s, opacity: starA * (0.55 + 0.45 * Math.sin(hour * 2 + s.p * 9)) }}
        />
      ))}
      <div
        className="absolute rounded-full"
        style={{
          left: `${sx}%`,
          top: `${sy}%`,
          width: 46,
          height: 46,
          marginLeft: -23,
          marginTop: -23,
          background: isDay ? "radial-gradient(circle,#fff3b0 0 40%,#F5B700 41% 62%,rgba(245,183,0,.25) 63% 100%)" : "radial-gradient(circle,#fffef7 0 55%,rgba(255,254,247,.25) 56% 100%)",
          opacity: isDay ? 1 : starA,
          boxShadow: isDay ? "0 0 40px 10px rgba(255,210,122,.35)" : "none",
        }}
      />
      {birds && (
        <svg className="absolute st-birds" style={{ left: 0, top: `${horizon * 0.35}%`, width: 70, height: 24 }} viewBox="0 0 70 24">
          <path d="M4 12q5-8 10 0q5-8 10 0" stroke={COLORS.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M38 6q4-6 8 0q4-6 8 0" stroke={COLORS.ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      )}
      <div className="absolute left-0 right-0 bottom-0" style={{ top: `${horizon - 1}%`, background: "linear-gradient(#e9d3a6, #dcc08a)" }} />
    </div>
  );
}

/** Time-of-day wash and paper grain over the whole stage. */
export function Wash({ hour, dark }: { hour: number; dark: boolean }) {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none st-wash" style={{ background: washAt(dark ? 2 : hour) }} aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px", opacity: 0.06, mixBlendMode: "multiply" }} aria-hidden="true" />
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

function Terrain({ ch }: { ch: number }) {
  const rivers = wobblyPoly([[-10, 470], [40, 488], [110, 520], [160, 566], [100, 570], [40, 540], [-10, 520]], 91, 4);
  return (
    <g>
      <path d={hills(-700, 1200, 258, 50, 11, 420)} fill={COLORS.plum} opacity={0.5} />
      <path d={hills(-700, 1200, 274, 34, 12, 420)} fill={COLORS.clay} opacity={0.42} />
      <path d={hills(-700, 1200, 286, 22, 13, 420)} fill="#b99a64" opacity={0.5} />
      {/* ground */}
      <path d={wobblyPoly([[-700, 284], [-300, 278], [-100, 282], [120, 276], [260, 282], [380, 274], [510, 282], [800, 278], [1200, 284], [1200, 900], [-700, 900]], 20, 3)} fill={COLORS.sand} stroke={COLORS.ink} strokeOpacity={0.35} strokeWidth={1.2} />
      <path d={blob(90, 380, 80, 34, 31, 0.18)} fill={COLORS.clay} opacity={0.14} />
      <path d={blob(360, 470, 90, 30, 32, 0.18)} fill={COLORS.clay} opacity={0.12} />
      <path d={blob(250, 520, 70, 20, 33, 0.2)} fill="#fffef7" opacity={0.3} />
      {/* dry riverbed */}
      <path d={rivers} fill="#cdb98f" stroke={COLORS.ink} strokeOpacity={0.3} strokeWidth={1} />
      {[[30, 500], [70, 520], [110, 540], [140, 556]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={4} ry={2.2} fill="#a8946a" />
      ))}
      {/* paths */}
      <path d={wobblyLine([[cellX(1) + 34, cellY(3) + 40], [cellX(2) + 34, cellY(4) + 34], [cellX(3) + 34, cellY(5) + 34], [cellX(4) + 20, cellY(5) + 50], [cellX(6) + 34, cellY(5) + 34]], 5, 3)} stroke="#f3e4c0" strokeWidth={13} strokeLinecap="round" fill="none" opacity={0.9} />
      <path d={wobblyLine([[cellX(2) + 34, cellY(4) + 34], [cellX(3) + 34, cellY(3) + 34], [cellX(4) + 34, cellY(2) + 34]], 6, 3)} stroke="#f3e4c0" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.8} />
      {ch >= 2 && (
        <g className="st-fadein">
          <path d={wobblyPoly([[-700, 154], [-100, 150], [150, 146], [330, 152], [510, 146], [900, 152], [1200, 150], [1200, 290], [-700, 290]], 41, 3)} fill="#dcc596" stroke={COLORS.ink} strokeOpacity={0.35} strokeWidth={1.2} />
          <path d={wobblyLine([[cellX(0), cellY(2) - 3], [cellX(6) + 60, cellY(2) - 3]], 42, 2)} stroke="#f3e4c0" strokeWidth={9} strokeLinecap="round" fill="none" />
        </g>
      )}
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

/** Distant towers behind the city blocks; their windows are the big dusk cascade, 40 ms apart. */
function Skyline({ lit }: { lit: boolean }) {
  const r = rng(404);
  let n = 0;
  const towers: ReactNode[] = [];
  for (let i = 0; i < 40; i++) {
    const w = 34 + Math.floor(r() * 18);
    const h = 38 + Math.floor(r() * 52);
    const x = -400 + i * 46;
    const y = 152 - h;
    const wins: ReactNode[] = [];
    for (let a = 0; a < Math.floor((w - 8) / 9); a++)
      for (let b = 0; b < Math.floor((h - 10) / 12); b++) {
        const on = r() < 0.8;
        wins.push(
          <g key={`${a}-${b}`}>
            <rect x={x + 6 + a * 9} y={y + 7 + b * 12} width={5} height={6} fill="#2a1d24" opacity={0.6} />
            {on && <rect className="st-win" x={x + 6 + a * 9} y={y + 7 + b * 12} width={5} height={6} fill={COLORS.glow} style={{ opacity: lit ? 1 : 0, transitionDelay: lit ? `${(n++ % 60) * 40}ms` : "0ms" }} />}
          </g>,
        );
      }
    towers.push(
      <g key={i}>
        <path d={wobblyRect(x, y, w, h + 4, 600 + i, 1.2)} fill={i % 2 ? "#5b4a72" : "#6d5580"} stroke={COLORS.ink} strokeOpacity={0.55} strokeWidth={1.2} />
        <path d={wobblyRect(x + w * 0.62, y + 2, w * 0.38, h + 2, 640 + i, 0.8)} fill="rgba(30,42,74,0.25)" />
        {wins}
      </g>,
    );
  }
  return <g className="st-fadein">{towers}</g>;
}

function FlowLines({ ch, placements, snap, jobs }: { ch: number; placements: Placements; snap: SceneSnap; jobs: JobId[] }) {
  const dur = Math.max(0.35, 2.4 / (1 + snap.flowTotal * 0.6));
  const style = { "--d": `${dur}s`, animationPlayState: snap.running ? "running" : "paused" } as React.CSSProperties;
  const lines: ReactNode[] = [];
  const idsByKind = Object.entries(placements);
  for (const [id, kind] of idsByKind) {
    const slot = SLOTS.find((s) => s.id === id)!;
    const hub = hubFor(slot);
    const [x, y] = cellCenter(slot.c, slot.r);
    const on = kind === "panel" ? snap.sun > 0.02 : snap.usingBattery;
    lines.push(
      <path key={id} d={`M${x} ${y} L${hub[0]} ${hub[1]}`} className={on && snap.running ? "st-flow" : undefined} stroke={on ? COLORS.glow : "#fffef7"} strokeOpacity={on ? 0.95 : 0.16} strokeWidth={on ? 1.8 : 1} fill="none" strokeLinecap="round" style={style} />,
    );
  }
  const consumer = (id: JobId, c: number, r: number, hub: [number, number], key: string) => {
    const j = snap.jobs[id];
    const flow = snap.running && (j.powered > 0.01 && (j.on || JOBS_FIXED.includes(id)));
    const [x, y] = cellCenter(c, r);
    return <path key={key} d={`M${hub[0]} ${hub[1]} L${x} ${y}`} className={flow ? "st-flow" : undefined} stroke={flow ? COLORS.glow : "#fffef7"} strokeOpacity={flow ? 1 : 0.14} strokeWidth={flow ? 2.4 : 1} fill="none" strokeLinecap="round" style={style} />;
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
    const base =
      s.kind === "roof" ? (s.chapter === "city" ? <Tower seed={seed} lit={lit} delay={nextDelay()} /> : <House seed={seed} lit={lit} delay={nextDelay()} />) :
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
        {base}
        {s.shaded && (
          <>
            <ellipse cx={34} cy={34} rx={30} ry={22} fill="rgba(30,42,74,0.16)" />
            <HalfSun />
          </>
        )}
        {kind && (
          <g key={`${s.id}-${nonce[s.id] ?? 0}`} className={drop} style={{ transformOrigin: "34px 60px", transformBox: "view-box" } as React.CSSProperties}>
            {kind === "panel" ? <Panel flat={flat} glint={snap.sun} seed={seed + 1} /> : <Jar fill={snap.batteryFrac} strain={snap.usingBattery && snap.running} hot={snap.usingBattery} seed={seed + 2} waste={snap.wasted && snap.running} />}
            {!p.reduced && nonce[s.id] ? <Dust /> : null}
          </g>
        )}
        {!kind && buildMode && <Marker pulse={!p.reduced} />}
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
        className={`st-hit ${canTap ? "st-glow" : ""}`}
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
          {canTap && <Badge on={j.on} />}
        </g>
        {canTap && glowOutline(c, r)}
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
      <Terrain ch={ch} />
      {/* locked towns sit under fog */}
      {ch >= 2 && <Skyline lit={lit} />}
      {decor(2, 2, <MangoTree seed={5} />, "mango")}
      {/* town decor */}
      {decor(6, 4, <MarketStalls lit={lit} delay={nextDelay()} />, "market")}
      {/* city extras */}
      {ch >= 2 && decor(6, 0, <Tower seed={9} lit={lit} delay={nextDelay()} />, "tower2")}
      {slots.map(renderSlot)}
      {/* buildings */}
      {flexBuilding("pump", BUILDINGS.pump.c, BUILDINGS.pump.r, <Pump level={snap.jobs.pump.progress / 8} running={snap.jobs.pump.on && snap.jobs.pump.powered > 0.02} ripple={snap.jobs.pump.done} lit={snap.jobs.pump.done && lit} />, "Water pump")}
      {decor(BUILDINGS.clinic.c, BUILDINGS.clinic.r, <Clinic lit={fixedLit && !clinicWarm} delay={nextDelay()} warm={clinicWarm} pulse={snap.fridgeLate} />, "clinic")}
      {decor(BUILDINGS.school.c, BUILDINGS.school.r, <School lit={snap.schoolLit || (fixedLit && p.day >= 3 && snap.hour < 21)} delay={nextDelay()} day={p.day} />, "school")}
      {flexBuilding("irrigation", BUILDINGS.irrigation.c, BUILDINGS.irrigation.r, <Fields progress={snap.jobs.irrigation.progress / 9} running={snap.jobs.irrigation.on && snap.jobs.irrigation.powered > 0.02} />, "Irrigation")}
      {ch >= 2 && flexBuilding("bus", BUILDINGS.depot.c, BUILDINGS.depot.r, <Depot progress={snap.jobs.bus.progress / 12} running={snap.jobs.bus.on && snap.jobs.bus.powered > 0.02} />, "Bus depot")}
      <FlowLines ch={ch} placements={placements} snap={snap} jobs={jobs} />
      {/* fog over the town until it is unlocked */}
      <g style={{ opacity: ch >= 1 ? 0 : 1, transition: p.reduced ? "none" : "opacity 1.2s" }} pointerEvents="none">
        <defs>
          <linearGradient id="st-mist" gradientUnits="userSpaceOnUse" x1={cellX(4) - 40} y1="0" x2={cellX(4) + 50} y2="0">
            <stop offset="0" stopColor="#fffef7" stopOpacity="0" />
            <stop offset="1" stopColor="#fffef7" stopOpacity="0.84" />
          </linearGradient>
        </defs>
        <rect x={cellX(4) - 40} y={262} width={900} height={640} fill="url(#st-mist)" />
      </g>
      {p.cloud && <Cloud cloud={p.cloud} hour={snap.hour} reduced={p.reduced} />}
    </svg>
  );
}

export const dayChapter = (day: number) => (DAYS[day - 1].chapter === "village" ? 0 : DAYS[day - 1].chapter === "town" ? 1 : 2);
