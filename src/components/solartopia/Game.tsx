"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BUILDINGS, DAYS, JOBS, SIM, SLOT_BY_ID, BREAKER_LINE, deadlineOf, type JobId } from "@/data/solartopia";
import { play, setMuted, unlock } from "@/lib/solartopia/audio";
import { nightAt } from "@/lib/solartopia/paint";
import { encodeStars } from "@/lib/solartopia/share";
import {
  DT, TOTAL_STEPS, advance, batteryFraction, buildCheck, create, hourOf, isOver, setJob, summarize, type DayResult, type Placements, type SimState,
} from "@/lib/solartopia/sim";
import { track } from "@/lib/solartopia/track";
import { Finale, HudCard, PauseCard, RequestCard, ResultCard } from "./Cards";
import Ending from "./Ending";
import { Backdrop, Wash, World, dayChapter, horizonY, lerpView, type SceneSnap, type View } from "./Scene";
import { CELL, cellX, cellY } from "./art";
import "./solartopia.css";

type Phase = "request" | "build" | "play" | "result" | "finale" | "ending";

const JOB_IDS = Object.keys(JOBS) as JobId[];
const emptySnapJobs = () =>
  Object.fromEntries(JOB_IDS.map((id) => [id, { on: false, progress: 0, done: false, powered: 1, tripped: false }])) as SceneSnap["jobs"];

function fmtClock(h: number) {
  const d = Math.floor(((h % 24) + 24) % 24);
  const m = Math.floor((h - Math.floor(h)) * 60);
  const ap = d >= 12 ? "pm" : "am";
  const hh = d % 12 === 0 ? 12 : d % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

function readSpeed() {
  try {
    const v = Number(new URLSearchParams(window.location.search).get("speed"));
    return v >= 1 && v <= 16 ? v : 1;
  } catch {
    return 1;
  }
}

declare global {
  interface Window {
    __solartopia?: unknown;
  }
}

export default function Game({ focus, onExit, picks }: { focus: boolean; onExit: () => void; picks: { outage: ReactNode; drive: ReactNode } }) {
  const speedParam = useMemo(readSpeed, []);
  const autoAdvance = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).has("speed");
    } catch {
      return false;
    }
  }, []);
  const reduced = useMemo(() => {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  }, []);

  const [phase, setPhase] = useState<Phase>("request");
  const [day, setDay] = useState(1);
  const [placements, setPlacements] = useState<Placements>({});
  const [nonce, setNonce] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fast, setFast] = useState(false);
  const [sound, setSound] = useState(true);
  const [best, setBest] = useState<number[]>([0, 0, 0, 0, 0]);
  const [result, setResult] = useState<DayResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cam, setCam] = useState(0);
  const [, setTick] = useState(0);
  const [stage, setStage] = useState({ w: 360, h: 460 });
  const [brown, setBrown] = useState(0);
  const [litNow, setLitNow] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [jars, setJars] = useState(0);
  const leaving = useRef(false);
  const hudRef = useRef<HTMLDivElement>(null);
  const [hudH, setHudH] = useState(0);

  const simRef = useRef<SimState | null>(null);
  const dayStartPlacements = useRef<Placements>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  const dayRef = useRef(day);
  const litRef = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bestRef = useRef(best);
  const mounted = useRef(false);
  const placementsRef = useRef(placements);
  placementsRef.current = placements;
  phaseRef.current = phase;
  dayRef.current = day;
  bestRef.current = best;

  const d = DAYS[day - 1];
  const ch = dayChapter(day);

  // Remember the sound choice.
  useEffect(() => {
    try {
      if (localStorage.getItem("st_muted") === "1") {
        setSound(false);
        setMuted(true);
      }
    } catch {}
  }, []);

  const showToast = useCallback((text: string, ms = 2600) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  // Camera ease between chapters: 1.2 s.
  useEffect(() => {
    const target = ch === 0 ? 0 : 1;
    if (reduced) {
      setCam(target);
      return;
    }
    let raf = 0;
    let from = 0;
    let started = 0;
    setCam((c) => {
      from = c;
      return c;
    });
    const loop = (now: number) => {
      if (!started) started = now;
      const k = Math.min(1, (now - started) / 1200);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setCam(from + (target - from) * e);
      if (k < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ch, reduced]);

  // Track the world box so popups can sit on the right cell.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStage({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setStage({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const view: View = useMemo(() => lerpView(cam), [cam]);

  // Analytics: first request of a day.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }
  }, []);

  /* ---------------- build ---------------- */

  const used = Object.values(placements).reduce((n, k) => n + (k === "panel" ? SIM.panelCost : SIM.batteryCost), 0);
  const left = d.crates - used;

  const bump = useCallback((id: string) => setNonce((n) => ({ ...n, [id]: (n[id] ?? 0) + 1 })), []);

  const onSlot = (id: string) => {
    unlock();
    if (phase !== "build") return;
    if (moving && selected) {
      if (!placements[id]) {
        setPlacements((p) => {
          const n = { ...p };
          n[id] = n[selected];
          delete n[selected];
          return n;
        });
        bump(id);
        play("tock");
      }
      setMoving(false);
      setSelected(null);
      return;
    }
    setSelected((cur) => (cur === id ? null : id));
  };

  const place = (kind: "panel" | "battery") => {
    if (!selected) return;
    const cost = kind === "panel" ? SIM.panelCost : SIM.batteryCost;
    if (left < cost) {
      showToast("Not enough crates. Take something back first.");
      return;
    }
    setPlacements((p) => ({ ...p, [selected]: kind }));
    bump(selected);
    play("tock");
    setSelected(null);
  };

  const takeBack = () => {
    if (!selected) return;
    setPlacements((p) => {
      const n = { ...p };
      delete n[selected];
      return n;
    });
    play("pop");
    setSelected(null);
  };

  /* ---------------- day flow ---------------- */

  const beginRequest = useCallback((n: number) => {
    setDay(n);
    setPhase("request");
    setResult(null);
    setSelected(null);
    setMoving(false);
    setPaused(false);
    litRef.current = false;
    setLitNow(false);
    simRef.current = null;
  }, []);

  const goBuild = useCallback(() => {
    if (phaseRef.current !== "request") return;
    setPhase("build");
    track("st_day_start", { day: dayRef.current });
  }, []);

  // The request card waits for a tap. Only the test hook (?speed) moves on by itself, after 3 s.
  useEffect(() => {
    if (phase !== "request" || !autoAdvance) return;
    const t = setTimeout(goBuild, 3000 / speedParam);
    return () => clearTimeout(t);
  }, [phase, day, goBuild, speedParam, autoAdvance]);

  const startDay = () => {
    unlock();
    if (phase !== "build") return;
    dayStartPlacements.current = { ...placements };
    setJars((j) => Math.max(j, Object.values(placements).filter((k) => k === "battery").length));
    simRef.current = create(day, placements);
    litRef.current = false;
    setLitNow(false);
    setSelected(null);
    setMoving(false);
    setPhase("play");
    play("chime");
  };

  const finishDay = useCallback(() => {
    const s = simRef.current;
    if (!s) return;
    const r = summarize(s);
    setResult(r);
    setPhase("result");
    setBest((b) => {
      const n = [...b];
      n[s.day - 1] = Math.max(n[s.day - 1], r.stars);
      return n;
    });
    track("st_day_end", { day: s.day, stars: r.stars, met: r.met });
    play(r.met ? "chime" : "pop");
    if (r.stars > 0) setTimeout(() => play("stamp"), 450);
  }, []);

  const nextDay = () => {
    unlock();
    if (day >= 5) {
      setPhase("finale");
      track("st_finale");
      return;
    }
    beginRequest(day + 1);
  };

  const replay = () => {
    unlock();
    track("st_retry", { day });
    setPlacements({ ...dayStartPlacements.current });
    beginRequest(day);
  };

  /* ---------------- play loop ---------------- */

  const togglePause = useCallback(() => {
    if (phaseRef.current === "play") setPaused((p) => !p);
  }, []);

  useEffect(() => {
    if (phase !== "play" || paused) return;
    const s = simRef.current;
    if (!s) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const mult = speedParam * (fast ? 2 : 1);
    const loop = (now: number) => {
      const dt = Math.min(0.12, (now - last) / 1000);
      last = now;
      acc += dt * mult;
      let guard = 0;
      while (!isOver(s) && guard++ < 400) {
        const h = hourOf(s.step);
        const per = (h >= 18 && h < 30 ? SIM.secondsPerHourNight : SIM.secondsPerHourDay) * DT;
        if (acc < per) break;
        acc -= per;
        advance(s);
        if (s.events.length) {
          for (const ev of s.events.splice(0)) {
            if (ev.type === "breaker") {
              showToast(BREAKER_LINE, 3200);
              play("thunk");
              track("st_breaker", { day: s.day });
              if (!reduced) setBrown((b) => b + 1);
            } else if (ev.type === "done" && ev.job === "pump") {
              play("splash");
              showToast("The tank is full.", 2200);
            } else if (ev.type === "done") {
              play("chime");
            }
          }
        }
        // The dusk light-up: once, when the clock reaches 18:00.
        if (!litRef.current && hourOf(s.step) >= 18) {
          const flexOk = s.active.every((id) => JOBS[id].kind !== "flex" || deadlineOf(s.day, id) > 18 || s.jobs[id].done);
          const darkOk = s.active.every((id) => JOBS[id].kind !== "fixed" || s.jobs[id].darkHours < 0.001);
          litRef.current = true;
          if (s.cap === 0) {
            showToast("Sunset. With no battery jar the village goes dark tonight. Tomorrow you get one.", 4200);
          } else if (flexOk && darkOk) {
            setLitNow(true);
            play("swell");
          }
        }
      }
      setTick((t) => (t + 1) % 1e6);
      if (isOver(s)) {
        finishDay();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, paused, fast, speedParam, finishDay, showToast, reduced]);

  // Auto-pause when the tab is hidden.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && phaseRef.current === "play") setPaused(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Abandon event when the page is left mid-game.
  useEffect(() => {
    const onHide = () => {
      if (phaseRef.current !== "ending") track("st_abandon", { day: dayRef.current, phase: phaseRef.current });
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  useEffect(() => {
    if (brown === 0) return;
    const t = setTimeout(() => setBrown(0), 1100);
    return () => clearTimeout(t);
  }, [brown]);

  const onJob = (id: JobId) => {
    unlock();
    const s = simRef.current;
    if (phase === "build") {
      showToast("Start the day first, then switch it on.");
      return;
    }
    if (phase !== "play" || !s || paused) return;
    const j = s.jobs[id];
    const turnOn = !j.on;
    if (setJob(s, id, turnOn)) {
      play(turnOn ? "flipOn" : "flipOff");
      track("st_toggle", { load: id, hour: Math.floor(hourOf(s.step)) % 24 });
      setTick((t) => t + 1);
    }
  };

  const needConfirm = () => phaseRef.current !== "ending" && (dayRef.current > 1 || bestRef.current.some((n) => n > 0) || Object.keys(placementsRef.current).length > 0);

  const doLeave = useCallback(() => {
    leaving.current = true;
    if (phaseRef.current !== "ending") track("st_abandon", { day: dayRef.current, phase: phaseRef.current });
    // Drop the history entry the full-screen mode added, so Back keeps working normally afterwards.
    try {
      if (history.state && history.state.stGame) history.back();
    } catch {}
    onExit();
  }, [onExit]);

  /** Exit and Back both come here: ask first when a run would be lost. */
  const exit = useCallback(() => {
    if (needConfirm()) {
      if (phaseRef.current === "play") setPaused(true);
      setConfirmLeave(true);
    } else doLeave();
  }, [doLeave]);

  // Full-screen focus mode (phones): one history entry, so Back closes the game instead of leaving the page.
  useEffect(() => {
    if (!focus) return;
    try {
      if (!(history.state && history.state.stGame)) history.pushState({ stGame: 1 }, "");
    } catch {}
    const onPop = () => {
      if (leaving.current) return;
      if (needConfirm()) {
        try {
          history.pushState({ stGame: 1 }, "");
        } catch {}
        if (phaseRef.current === "play") setPaused(true);
        setConfirmLeave(true);
      } else {
        leaving.current = true;
        if (phaseRef.current !== "ending") track("st_abandon", { day: dayRef.current, phase: phaseRef.current });
        onExit();
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  /* ---------------- keyboard ---------------- */

  const onKeyDown = (e: React.KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.tagName === "SELECT" || t.tagName === "INPUT") return;
    if (e.key === "p" || e.key === "P") {
      togglePause();
      return;
    }
    if (e.key === "f" || e.key === "F") {
      setFast((f) => !f);
      return;
    }
    if (e.key === "Escape") {
      if (confirmLeave) setConfirmLeave(false);
      else if (selected || moving) {
        setSelected(null);
        setMoving(false);
      } else exit();
      return;
    }
    if (e.key === "Tab" && focus && rootRef.current) {
      const items = Array.from(rootRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], select, [tabindex='0']")).filter((n) => n.getClientRects().length > 0);
      if (items.length) {
        const first = items[0];
        const last = items[items.length - 1];
        const cur = document.activeElement;
        if (e.shiftKey && (cur === first || cur === rootRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && cur === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!dir || !rootRef.current) return;
    const nodes = Array.from(rootRef.current.querySelectorAll<SVGElement | HTMLElement>("[data-nav]")).filter((n) => (n as HTMLElement).tabIndex >= 0);
    const cur = document.activeElement as HTMLElement;
    if (!cur || !nodes.includes(cur)) return;
    const cr = cur.getBoundingClientRect();
    const cx = cr.left + cr.width / 2;
    const cy = cr.top + cr.height / 2;
    let bestN: Element | null = null;
    let bestD = Infinity;
    for (const n of nodes) {
      if (n === cur) continue;
      const r = n.getBoundingClientRect();
      const dx = r.left + r.width / 2 - cx;
      const dy = r.top + r.height / 2 - cy;
      const along = dx * dir[0] + dy * dir[1];
      if (along <= 4) continue;
      const across = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]);
      const score = along + across * 2;
      if (score < bestD) {
        bestD = score;
        bestN = n;
      }
    }
    if (bestN) {
      e.preventDefault();
      (bestN as HTMLElement).focus();
    }
  };

  /* ---------------- snapshot for the scene and for tests ---------------- */

  const s = simRef.current;
  const hour = s ? hourOf(s.step) : SIM.startHour;
  const h24 = ((hour % 24) + 24) % 24;
  const snap: SceneSnap = useMemo(() => {
    const jobs = emptySnapJobs();
    if (s) for (const id of JOB_IDS) jobs[id] = { on: s.jobs[id].on, progress: s.jobs[id].progress, done: s.jobs[id].done, powered: s.jobs[id].powered, tripped: s.jobs[id].tripped };
    const fr = s ? s.jobs.fridge.darkHours : 0;
    return {
      hour,
      sun: s ? s.sun : 0,
      running: phase === "play" && !paused,
      batteryFrac: s ? batteryFraction(s) : placementsFrac(placements, d.startCharge),
      usingBattery: !!s && s.flow.fromBattery > 0.01 && s.step < TOTAL_STEPS,
      usingFlex: !!s && s.flow.fromBatteryFlex > 0.01 && s.step < TOTAL_STEPS,
      flowTotal: s ? s.flow.toLoads : 0,
      jobs,
      fridgeWarm: fr > 0,
      fridgeLate: fr >= SIM.fridgeGraceHours - 1,
      wasted: !!s && s.cap > 0 && s.flow.wasted > 0.2 && batteryFraction(s) > 0.97,
      lit: litNow && !!s && s.cap > 0 && s.battery > 0.02 * s.cap,
      schoolLit: !!s && ((s.jobs.school.powered >= 0.99 && h24 >= 9 && h24 < 15 && s.active.includes("school")) || (s.jobs.lights.powered >= 0.99 && h24 >= 18 && h24 < 21 && s.active.includes("lights"))),
      needPct: { pump: 0, fridge: 0, school: 0, lights: 0, irrigation: 0, bus: 0 },
      night: day === 1 && (phase === "request" || phase === "build") ? 1 : nightAt(hour),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s?.step, phase, paused, litNow, placements, s?.flow, hour, day]);

  useEffect(() => {
    Object.defineProperty(window, "__solartopia", {
      configurable: true,
      get: () => {
        const sm = simRef.current;
        return Object.freeze({
          phase: phaseRef.current,
          day: dayRef.current,
          hour: sm ? hourOf(sm.step) : SIM.startHour,
          battery: sm ? batteryFraction(sm) : 0,
          jobs: sm ? Object.fromEntries(JOB_IDS.map((id) => [id, { on: sm.jobs[id].on, progress: sm.jobs[id].progress, done: sm.jobs[id].done }])) : {},
          breakerTrips: sm ? sm.breakerTrips : 0,
          stars: [...bestRef.current],
          code: encodeStars(bestRef.current),
        });
      },
    });
    return () => {
      delete window.__solartopia;
    };
  }, []);

  /* ---------------- derived UI ---------------- */

  const dark = day === 1 && (phase === "request" || phase === "build");
  const wallHour = dark ? 3 : hour;
  const scale = Math.min(stage.w / view.w, stage.h / view.h);
  const offX = (stage.w - view.w * scale) / 2;
  const offY = stage.h - view.h * scale;
  const hz = ((offY + (horizonY() - view.y) * scale) / stage.h) * 100;
  const buildMode = phase === "build" && !paused;
  const sel = selected;
  const selSlot = sel ? SLOT_BY_ID[sel] : null;
  const toPx = (cx: number, cy: number) => ({ x: offX + (cx - view.x) * scale, y: offY + (cy - view.y) * scale });
  const popup = (() => {
    if (!buildMode || !selSlot || moving) return null;
    const c = toPx(cellX(selSlot.c) + CELL / 2, cellY(selSlot.r) + CELL / 2);
    const half = CELL * scale * 0.5;
    const w = 2 * 96 + 8;
    const x = Math.min(Math.max(c.x, w / 2 + 4), stage.w - w / 2 - 4);
    const hudBottom = hudH > 0 ? 8 + hudH + 6 : 0;
    const popH = 62;
    const spaceAbove = c.y - half - hudBottom;
    const spaceBelow = stage.h - (c.y + half);
    const above = spaceAbove >= popH + 6 && (spaceAbove >= spaceBelow || spaceBelow < popH + 6);
    return { x, y: above ? c.y - half - 6 : c.y + half + 6, above };
  })();
  useEffect(() => {
    const h = hudRef.current?.offsetHeight ?? 0;
    if (h !== hudH) setHudH(h);
  });
  const labels: { key: string; x: number; y: number; text: string }[] = [];
  {
    const add = (key: string, c: number, r: number, text: string) => {
      const p = toPx(cellX(c) + CELL / 2, cellY(r) + CELL - 3);
      labels.push({ key, x: p.x, y: p.y, text });
    };
    add("pump", BUILDINGS.pump.c, BUILDINGS.pump.r, "Water pump");
    add("clinic", BUILDINGS.clinic.c, BUILDINGS.clinic.r, "Clinic");
    add("school", BUILDINGS.school.c, BUILDINGS.school.r, "School");
    if (ch >= 1) add("fields", BUILDINGS.irrigation.c, BUILDINGS.irrigation.r, "Fields");
    if (ch >= 2) add("depot", BUILDINGS.depot.c, BUILDINGS.depot.r, "Bus depot");
    for (const [id, k] of Object.entries(placements)) if (k === "battery") add(`jar-${id}`, SLOT_BY_ID[id].c, SLOT_BY_ID[id].r, "Battery");
  }
  const kind = sel ? placements[sel] : undefined;
  const check = useMemo(() => (phase === "build" ? buildCheck(day, placements) : null), [phase, day, placements]);
  const toEnding = useCallback(() => setPhase((p) => (p === "finale" ? "ending" : p)), []);

  const locked = phase !== "play";
  const barBtn = "st-btn st-bar-btn";

  const isFinaleOrEnding = phase === "finale" || phase === "ending";

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role={focus ? undefined : "group"}
      aria-label="Solartopia"
      className={`st-root relative flex flex-col w-full outline-none ${focus ? "h-full" : "h-[min(calc(100dvh-6rem),780px)] min-h-[540px] rounded-3xl overflow-hidden"} ${brown ? "st-brownout" : ""}`}
      data-testid="solartopia-game"
      data-phase={phase}
      data-day={day}
      onKeyDown={onKeyDown}
    >
      {/* header */}
      <div className="flex items-center gap-2 px-2 h-12 shrink-0 bg-[#1E2A4A] text-[#fffef7]">
        <button type="button" className="st-btn st-btn-dark" onClick={exit} data-testid="exit">
          {focus ? "Exit" : "Close"}
        </button>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[13px] font-bold truncate" data-testid="hud-day">
            Day {day} of 5: {d.title}
          </p>
          <p className="text-[11px] opacity-80 truncate">{d.place}</p>
        </div>
        <div className="text-right leading-tight">
          <p className="text-[13px] font-bold tabular-nums" data-testid="hud-clock">
            {fmtClock(hour)}
          </p>
          <p className="text-[11px] opacity-80 tabular-nums">{best.reduce((a, b) => a + b, 0)} of 15 stars</p>
        </div>
      </div>

      {/* stage */}
      <div ref={stageRef} className="relative flex-1 min-h-0 overflow-hidden">
        <Backdrop hour={wallHour} horizon={hz} dark={dark} />
        <World
          view={view}
          ch={ch}
          day={day}
          snap={snap}
          placements={placements}
          nonce={nonce}
          selected={sel}
          moving={moving}
          buildMode={buildMode}
          activeJobs={d.jobs}
          cloud={d.cloud}
          reduced={reduced}
          onSlot={onSlot}
          onJob={onJob}
        />
        <div className="absolute inset-0 pointer-events-none">
          {labels.map((l) => (
            <span key={l.key} className="st-tag" style={{ left: l.x, top: l.y }} data-testid={`tag-${l.key}`}>
              {l.text}
            </span>
          ))}
          {popup && (
            <div
              className="absolute z-20 flex gap-2 st-pop pointer-events-auto"
              style={{ left: popup.x, top: popup.y, transform: `translate(-50%, ${popup.above ? "-100%" : "0"})` }}
              data-testid="picker"
            >
              {!kind ? (
                <>
                  <button type="button" className="st-btn st-pick" onClick={() => place("panel")} data-testid="pick-panel" disabled={left < SIM.panelCost}>
                    <span>Panel</span>
                    <small>1 crate</small>
                  </button>
                  <button type="button" className="st-btn st-pick" onClick={() => place("battery")} data-testid="pick-battery" disabled={left < SIM.batteryCost}>
                    <span>Battery</span>
                    <small>2 crates</small>
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="st-btn st-pick" onClick={() => setMoving(true)} data-testid="pick-move">
                    <span>Move</span>
                    <small>pick it up</small>
                  </button>
                  <button type="button" className="st-btn st-pick" onClick={takeBack} data-testid="pick-remove">
                    <span>Take back</span>
                    <small>get crates</small>
                  </button>
                </>
              )}
            </div>
          )}
          {moving && buildMode && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-2 z-20 st-chip pointer-events-auto" data-testid="move-hint">
              Tap an empty spot to move it.{" "}
              <button type="button" className="underline font-semibold" onClick={() => { setMoving(false); setSelected(null); }}>
                Cancel
              </button>
            </div>
          )}
        </div>
        <Wash hour={wallHour} dark={dark} />
        {brown > 0 && <div className="absolute inset-0 pointer-events-none st-dim" />}

        {(phase === "build" || phase === "play") && (
          <div ref={hudRef} className="absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)]">
            <HudCard day={d} check={check} phase={phase} />
          </div>
        )}
        {toast && (
          <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center px-3 pointer-events-none" role="status" data-testid="toast">
            <div className="st-chip st-toast">{toast}</div>
          </div>
        )}
        {phase === "request" && !paused && <RequestCard day={d} onGo={goBuild} seconds={autoAdvance ? 3 / speedParam : 0} />}
        {paused && <PauseCard onResume={() => setPaused(false)} onExit={exit} focus={focus} />}
        {phase === "result" && result && (
          <ResultCard day={d} result={result} crates={{ used, total: d.crates }} onNext={nextDay} onReplay={replay} onSource={() => track("st_fact_source", { day })} />
        )}
        {phase === "finale" && <Finale seconds={20 / speedParam} onDone={toEnding} />}
        {phase === "ending" && <Ending stars={best} jars={jars} picks={picks} onReplay={() => { track("st_replay"); setBest([0, 0, 0, 0, 0]); setJars(0); setPlacements({}); beginRequest(1); }} />}
        {confirmLeave && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-[#1e2a4a]/70" role="alertdialog" aria-modal="true" aria-labelledby="st-leave-h" data-testid="leave-dialog">
            <div className="st-card rounded-2xl p-4 max-w-xs w-full">
              <h2 id="st-leave-h" className="text-lg font-extrabold">Leave Solartopia?</h2>
              <p className="text-[14px] mt-1">Your stars and your build so far will be lost.</p>
              <div className="flex gap-2 mt-3">
                <button type="button" className="st-btn st-btn-primary flex-1" onClick={() => setConfirmLeave(false)} data-testid="leave-stay" autoFocus>
                  Keep playing
                </button>
                <button type="button" className="st-btn flex-1" onClick={doLeave} data-testid="leave-confirm">
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* controls bar: always on screen */}
      {!isFinaleOrEnding && (
        <div className="shrink-0 bg-[#FFFEF7] border-t-2 border-[#3a2a33]/30 px-2 pt-1.5 pb-2" data-testid="controls">
          <div className="flex items-center gap-2 min-h-[2rem]">
            <JarMeter frac={snap.batteryFrac} using={snap.usingFlex} night={snap.usingBattery && !snap.usingFlex} has={Object.values(placements).includes("battery")} />
            <p className="text-[12.5px] leading-tight flex-1" data-testid="tip">
              {phase === "build" ? "Tap a spot to build. When the day starts: tap a glowing building to switch it on or off" : "Tap a glowing building to switch it on or off"}
            </p>
            {phase === "build" && (
              <p className="text-[12.5px] font-bold tabular-nums whitespace-nowrap" data-testid="crates" data-left={left}>
                {left} {left === 1 ? "crate" : "crates"} left
              </p>
            )}
          </div>
          {phase === "play" && s && (
            <div className="flex gap-1.5 mt-1.5" data-testid="job-chips">
              {d.jobs.filter((id) => JOBS[id].kind === "flex").map((id) => {
                const js = s.jobs[id];
                const sunLeft = Math.max(0, Math.min(16, deadlineOf(d.n, id)) - Math.max(8, hour));
                const label = js.done ? "Done" : js.tripped ? "Breaker off: tap to retry" : js.on ? "On" : "Off";
                return (
                  <button
                    key={id}
                    type="button"
                    className="st-btn flex-1 !min-w-0 !px-1.5 !flex-col !gap-0 leading-tight"
                    onClick={() => onJob(id)}
                    disabled={js.done || paused}
                    aria-pressed={js.on}
                    data-testid={`chip-${id}`}
                  >
                    <span className="text-[13px]">{JOBS[id].label.replace("Bus depot", "Buses")}: {label}</span>
                    <span className="text-[10.5px] font-medium opacity-80">{js.done ? "finished" : sunLeft >= 0.5 ? `${Math.round(sunLeft)} hrs of strong sun left` : "strong sun is over"}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex gap-1.5 mt-1.5">
            <button type="button" className={barBtn} onClick={() => { unlock(); togglePause(); }} data-testid="btn-pause" aria-pressed={paused} disabled={phase !== "play"}>
              {paused ? "Play" : "Pause"}
            </button>
            <button type="button" className={barBtn} onClick={() => setFast((f) => !f)} data-testid="btn-speed" aria-pressed={fast}>
              {fast ? "Speed: 1x" : "Speed: 2x"}
            </button>
            <button
              type="button"
              className={barBtn}
              onClick={() => {
                unlock();
                const m = sound;
                setSound(!m);
                setMuted(m);
                try {
                  localStorage.setItem("st_muted", m ? "1" : "0");
                } catch {}
              }}
              data-testid="btn-sound"
              aria-pressed={sound}
            >
              Sound {sound ? "on" : "off"}
            </button>
            {phase === "build" && (
              <button type="button" className="st-btn st-btn-primary flex-1 st-bar-btn" onClick={startDay} data-testid="start-day" disabled={paused}>
                Start the day
              </button>
            )}
            {phase === "play" && (
              <span className="flex-1 flex items-center justify-end text-[12px] tabular-nums pr-1" aria-hidden="true">
                <Progress step={s?.step ?? 0} />
              </span>
            )}
          </div>
        </div>
      )}
      {locked && phase === "request" && <span className="sr-only">{d.villager.name} says: {d.villager.line}</span>}
    </div>
  );
}

function placementsFrac(p: Placements, start: number) {
  return Object.values(p).includes("battery") ? start : 0;
}

function Progress({ step }: { step: number }) {
  return (
    <span className="block w-full max-w-[9rem] h-2 rounded bg-[#e9d3a6] overflow-hidden">
      <span className="block h-full bg-[#c8734b]" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
    </span>
  );
}

function JarMeter({ frac, using, night, has }: { frac: number; using: boolean; night: boolean; has: boolean }) {
  const h = 26 * Math.max(0, Math.min(1, frac));
  return (
    <div className="flex items-center gap-1.5 shrink-0" data-testid="jar-meter" data-frac={frac.toFixed(2)}>
      <svg width={26} height={34} viewBox="0 0 26 34" aria-hidden="true" className={using ? "st-strain-box" : undefined}>
        <rect x={3} y={6} width={20} height={26} rx={4} fill="rgba(255,254,247,.6)" stroke="#3a2a33" strokeOpacity={0.7} strokeWidth={1.4} />
        <clipPath id="jm"><rect x={4} y={7} width={18} height={24} rx={3} /></clipPath>
        <g clipPath="url(#jm)"><rect x={3} y={31 - h} width={20} height={h + 1} fill={using ? "#e59a00" : "#F5B700"} /></g>
        <rect x={1} y={2} width={24} height={6} rx={2} fill="#C8734B" stroke="#3a2a33" strokeOpacity={0.7} strokeWidth={1.2} />
      </svg>
      <span className="text-[11px] leading-tight w-[4.2rem]">
        {using ? <strong className="text-[#b45309]">Running on stored power</strong> : night ? "Jar powering the night" : has ? "Battery jar" : "No battery yet"}
      </span>
    </div>
  );
}

