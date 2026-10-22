/**
 * Solartopia simulation. Pure and deterministic: no DOM, no Date, no
 * Math.random. The same placements and the same switch times always give the
 * same day. The game loop calls `advance` from requestAnimationFrame; the tests
 * call `runDay` headless.
 *
 * Units are internal. The player never sees them.
 */

import { DAYS, JOBS, SIM, SLOT_BY_ID, FAIL_LINES, BREAKER_LINE, type CloudBank, type JobId } from "@/data/solartopia";

export const DT = 1 / SIM.stepsPerHour;
export const TOTAL_STEPS = (SIM.endHour - SIM.startHour) * SIM.stepsPerHour;
const EFF = Math.sqrt(SIM.roundTrip);
const EPS = 1e-9;

export type Placements = Record<string, "panel" | "battery">;

/** mulberry32: the only random source, always seeded. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sun strength 0..1 at a game hour (6..30 wraps to the next morning). */
export function sunAt(h: number) {
  const d = ((h % 24) + 24) % 24;
  return d >= 6 && d <= 18 ? Math.sin((Math.PI * (d - 6)) / 12) : 0;
}

/** 0..1 weight of a cloud bank at a game hour: fades in and out over half an hour. */
export function cloudWeight(cloud: CloudBank | undefined, h: number) {
  if (!cloud) return 0;
  const a = Math.min(1, Math.max(0, (h - (cloud.start - 0.5)) / 0.5));
  const b = Math.min(1, Math.max(0, (cloud.end + 0.5 - h) / 0.5));
  return a * b;
}

/** Output of one panel in `slotId` at a game hour, per hour. */
export function panelOutput(slotId: string, h: number, cloud?: CloudBank) {
  const slot = SLOT_BY_ID[slotId];
  const shade = slot.shaded ? SIM.shade : 1;
  const w = cloud && cloud.cols.includes(slot.c) ? cloudWeight(cloud, h) : 0;
  const cl = 1 - (1 - SIM.cloud) * w;
  return sunAt(h) * shade * cl;
}

export interface JobState {
  on: boolean;
  order: number;
  progress: number;
  done: boolean;
  doneAt: number | null;
  tripped: boolean;
  /** Game hours the job was not fully powered (fixed jobs). */
  darkHours: number;
  /** Power ratio on the last step, 0..1. */
  powered: number;
}

export interface Flow {
  panels: number;
  toLoads: number;
  toBattery: number;
  fromBattery: number;
  wasted: number;
}

export interface SimState {
  day: number;
  step: number;
  placements: Placements;
  panels: string[];
  batteries: string[];
  cap: number;
  battery: number;
  startBattery: number;
  jobs: Record<JobId, JobState>;
  active: JobId[];
  switchCount: number;
  breakerTrips: number;
  produced: number;
  delivered: number;
  lost: number;
  wasted: number;
  /** Progress of flexible jobs when the clock passed their deadline. */
  atDeadline: Partial<Record<JobId, number>>;
  /** Rates for the last step (units per hour), for the scene. */
  flow: Flow;
  sun: number;
  /** Events since the UI last drained them. */
  events: SimEvent[];
}

export type SimEvent =
  | { type: "breaker"; hour: number }
  | { type: "done"; job: JobId; hour: number }
  | { type: "dark"; job: JobId; hour: number }
  | { type: "stored"; hour: number };

export const hourOf = (step: number) => SIM.startHour + step * DT;
export const isOver = (s: SimState) => s.step >= TOTAL_STEPS;

export function newJob(): JobState {
  return { on: false, order: 0, progress: 0, done: false, doneAt: null, tripped: false, darkHours: 0, powered: 1 };
}

export function create(day: number, placements: Placements): SimState {
  const d = DAYS[day - 1];
  const panels = Object.keys(placements).filter((k) => placements[k] === "panel").sort();
  const batteries = Object.keys(placements).filter((k) => placements[k] === "battery").sort();
  const cap = batteries.length * SIM.batteryUnits;
  const jobs = {} as Record<JobId, JobState>;
  for (const id of Object.keys(JOBS) as JobId[]) jobs[id] = newJob();
  return {
    day,
    step: 0,
    placements: { ...placements },
    panels,
    batteries,
    cap,
    battery: cap * SIM.startFraction,
    startBattery: cap * SIM.startFraction,
    jobs,
    active: d.jobs,
    switchCount: 0,
    breakerTrips: 0,
    produced: 0,
    delivered: 0,
    lost: 0,
    wasted: 0,
    atDeadline: {},
    flow: { panels: 0, toLoads: 0, toBattery: 0, fromBattery: 0, wasted: 0 },
    sun: 0,
    events: [],
  };
}

/** Switch a flexible job. Returns false when it has no effect. */
export function setJob(s: SimState, id: JobId, on: boolean) {
  const j = s.jobs[id];
  if (JOBS[id].kind !== "flex" || !s.active.includes(id) || j.done) return false;
  if (j.on === on && !j.tripped) return false;
  j.tripped = false;
  j.on = on;
  if (on) j.order = ++s.switchCount;
  return true;
}

export function batteryFraction(s: SimState) {
  return s.cap > 0 ? s.battery / s.cap : 0;
}

const inWindow = (hour24: number, w: [number, number] | null) => w === null || (hour24 >= w[0] && hour24 < w[1]);

/** Advance one step (0.1 game hour). Mutates and returns the same state. */
export function advance(s: SimState): SimState {
  if (isOver(s)) return s;
  const h = hourOf(s.step) + DT / 2;
  const d = DAYS[s.day - 1];
  const sun = sunAt(h);
  let power = 0;
  for (const id of s.panels) power += panelOutput(id, h, d.cloud);
  let avail = power * DT;
  s.produced += avail;
  s.sun = sun;
  const flow: Flow = { panels: power, toLoads: 0, toBattery: 0, fromBattery: 0, wasted: 0 };
  const hour24 = ((h % 24) + 24) % 24;

  // 1. Fixed jobs, first on the sun and then on the jar, down to empty.
  for (const id of s.active) {
    const job = JOBS[id];
    if (job.kind !== "fixed") continue;
    const js = s.jobs[id];
    if (!inWindow(hour24, job.window)) {
      js.powered = 1;
      continue;
    }
    const want = job.draw * DT;
    const fromSun = Math.min(avail, want);
    avail -= fromSun;
    let got = fromSun;
    const need = want - fromSun;
    if (need > EPS && s.battery > EPS) {
      const out = Math.min(need, s.battery * EFF);
      s.battery -= out / EFF;
      s.lost += out / EFF - out;
      flow.fromBattery += out / DT;
      got += out;
    }
    js.powered = got / want;
    s.delivered += got;
    flow.toLoads += got / DT;
    if (js.powered < 0.999) {
      if (js.darkHours === 0) s.events.push({ type: "dark", job: id, hour: h });
      js.darkHours += DT;
    }
  }

  // 2. Flexible jobs, in the order they were switched on.
  const flex = s.active
    .filter((id) => JOBS[id].kind === "flex" && s.jobs[id].on && !s.jobs[id].done)
    .sort((a, b) => s.jobs[a].order - s.jobs[b].order);
  let trip = false;
  for (const id of flex) {
    const job = JOBS[id];
    const js = s.jobs[id];
    const want = Math.min(job.draw * DT, job.need! - js.progress);
    const fromSun = Math.min(avail, want);
    avail -= fromSun;
    let got = fromSun;
    const need = want - fromSun;
    if (need > EPS) {
      if (s.cap > 0) {
        const room = Math.max(0, s.battery - SIM.breakerFloor * s.cap) * EFF;
        const out = Math.min(need, room);
        s.battery -= out / EFF;
        s.lost += out / EFF - out;
        flow.fromBattery += out / DT;
        got += out;
        if (need - out > EPS) trip = true;
      }
    }
    js.progress += got;
    js.powered = want > 0 ? got / want : 1;
    s.delivered += got;
    flow.toLoads += got / DT;
    if (js.progress >= job.need! - 1e-6) {
      js.progress = job.need!;
      js.done = true;
      js.on = false;
      js.doneAt = hourOf(s.step + 1);
      s.events.push({ type: "done", job: id, hour: h });
    }
  }
  if (trip) {
    for (const id of flex) {
      const js = s.jobs[id];
      if (js.on) {
        js.on = false;
        js.tripped = true;
      }
    }
    s.breakerTrips++;
    s.events.push({ type: "breaker", hour: h });
  }

  // 3. Whatever sun is left charges the jar; the rest is wasted.
  if (s.cap > 0 && avail > EPS) {
    const room = s.cap - s.battery;
    const store = Math.min(avail * EFF, room);
    const used = store / EFF;
    s.battery += store;
    s.lost += used - store;
    flow.toBattery = used / DT;
    avail -= used;
  }
  s.wasted += avail;
  flow.wasted = avail / DT;
  s.flow = flow;
  s.step++;

  // 4. Deadlines.
  const now = hourOf(s.step);
  for (const id of s.active) {
    const job = JOBS[id];
    if (job.kind === "flex" && job.deadline !== undefined && s.atDeadline[id] === undefined && now >= job.deadline - 1e-9) {
      s.atDeadline[id] = s.jobs[id].progress;
    }
  }
  return s;
}

export interface Requirement {
  job: JobId;
  met: boolean;
  /** 0..1 progress for flexible jobs, hours dark for fixed jobs. */
  value: number;
  line?: string;
}

export interface DayResult {
  day: number;
  stars: 0 | 1 | 2 | 3;
  met: boolean;
  nothingDark: boolean;
  breakerTrips: number;
  batteryEnd: number;
  requirements: Requirement[];
  /** Panel energy used divided by panel energy produced (the margin rule). */
  utilisation: number;
  produced: number;
  wasted: number;
  /** Plain-language reason for the first problem, or null. */
  cause: string | null;
  /** One hint for the next try, or null. */
  hint: string | null;
}

export function summarize(s: SimState): DayResult {
  const reqs: Requirement[] = [];
  for (const id of s.active) {
    const job = JOBS[id];
    const js = s.jobs[id];
    if (job.kind === "flex") {
      const got = id === "bus" ? js.progress : (s.atDeadline[id] ?? js.progress);
      const value = Math.min(1, got / job.need!);
      const met = value >= 0.999;
      reqs.push({ job: id, met, value, line: met ? undefined : (FAIL_LINES as Record<string, (n: number) => string>)[id](value) });
    } else {
      const allowed = id === "fridge" ? SIM.fridgeGraceHours : 0.001;
      const met = js.darkHours <= allowed + 1e-9;
      reqs.push({ job: id, met, value: js.darkHours, line: met ? undefined : (FAIL_LINES as Record<string, (n: number) => string>)[id](js.darkHours) });
    }
  }
  const met = reqs.every((r) => r.met);
  const nothingDark = s.active.every((id) => JOBS[id].kind !== "fixed" || s.jobs[id].darkHours < 0.001);
  let stars: 0 | 1 | 2 | 3 = 0;
  if (met) stars = 1;
  if (stars === 1 && nothingDark && s.breakerTrips === 0) stars = 2;
  const frac = batteryFraction(s);
  if (stars === 2) {
    if (s.day === 1) {
      const t = s.jobs.pump.doneAt;
      if (t !== null && t <= SIM.day1ThreeStarBy + 1e-9) stars = 3;
    } else if (frac >= SIM.threeStarBattery - 1e-9) stars = 3;
  }
  const first = reqs.find((r) => !r.met);
  let cause: string | null = first?.line ?? null;
  let hint: string | null = null;
  if (s.breakerTrips > 0) hint = "The breaker tripped when the jar ran low. Run the heavy jobs while the sun is high.";
  else if (!nothingDark) hint = "Something went dark. Add a battery jar so the night is covered.";
  else if (first) hint = "Build a little more, or start the jobs earlier while the sun is strong.";
  else if (stars === 2 && s.day === 1) hint = "Start the pump before 9 in the morning to fill the tank by 1 pm.";
  else if (stars === 2) hint = "Leave the jar at least a quarter full at sunrise.";
  if (!cause && s.breakerTrips > 0) cause = BREAKER_LINE;
  const used = s.delivered + s.lost + Math.max(0, s.battery - s.startBattery);
  return {
    day: s.day,
    stars,
    met,
    nothingDark,
    breakerTrips: s.breakerTrips,
    batteryEnd: frac,
    requirements: reqs,
    utilisation: s.produced > 0 ? used / s.produced : 0,
    produced: s.produced,
    wasted: s.wasted,
    cause,
    hint,
  };
}

export interface Toggle {
  /** Game hour (6..30) at which the switch is flipped. */
  h: number;
  job: JobId;
  on: boolean;
}

/** Run a whole day headless. Toggles are applied at the first step whose start is >= h. */
export function runDay(day: number, placements: Placements, toggles: Toggle[]): { state: SimState; result: DayResult } {
  const s = create(day, placements);
  const queue = [...toggles].sort((a, b) => a.h - b.h);
  let i = 0;
  while (!isOver(s)) {
    while (i < queue.length && queue[i].h <= hourOf(s.step) + 1e-9) {
      setJob(s, queue[i].job, queue[i].on);
      i++;
    }
    advance(s);
  }
  return { state: s, result: summarize(s) };
}

/** Cells under the cloud at a given hour, as slot ids. */
export function cloudSlotIds(day: number, slotIds: string[]) {
  const c = DAYS[day - 1].cloud;
  return c ? slotIds.filter((id) => c.cols.includes(SLOT_BY_ID[id].c)) : [];
}

/** Slots that exist on a given day. */
export function slotsForDay(day: number) {
  const ch = DAYS[day - 1].chapter;
  const open = ch === "village" ? ["village"] : ch === "town" ? ["village", "town"] : ["village", "town", "city"];
  return Object.values(SLOT_BY_ID).filter((s) => open.includes(s.chapter));
}
