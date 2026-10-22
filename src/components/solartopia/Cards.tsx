/** Cards laid over the stage: villager request, forecast, pause, result and finale. */

import { useEffect, useRef, useState } from "react";
import { DAYS, FACTS, FINALE_FACTS, FINALE_HONEST, type Day } from "@/data/solartopia";
import { COLORS, wobblyPoly } from "@/lib/solartopia/paint";
import type { BuildCheck, DayResult } from "@/lib/solartopia/sim";
import { Stars } from "./Stars";

export function Villager({ look, size = 76 }: { look: Day["villager"]["look"]; size?: number }) {
  const { skin, hair, shirt, extra } = look;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
      <circle cx={40} cy={40} r={38} fill="#f3e4c0" stroke={COLORS.ink} strokeOpacity={0.5} strokeWidth={1.4} />
      <clipPath id={`vil-${skin.slice(1)}`}>
        <circle cx={40} cy={40} r={37} />
      </clipPath>
      <g clipPath={`url(#vil-${skin.slice(1)})`}>
        <path d={wobblyPoly([[6, 84], [10, 60], [26, 54], [54, 54], [70, 60], [74, 84]], 5, 1)} fill={shirt} stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={1.4} />
        <rect x={34} y={46} width={12} height={12} rx={4} fill={skin} />
        {extra === "scarf" && <path d={wobblyPoly([[22, 56], [58, 56], [62, 66], [18, 66]], 6, 1)} fill="#f5b700" stroke={COLORS.ink} strokeOpacity={0.5} strokeWidth={1.2} />}
        <circle cx={40} cy={34} r={15} fill={skin} stroke={COLORS.ink} strokeOpacity={0.6} strokeWidth={1.4} />
        <path d="M25 32c0-12 8-17 15-17s15 5 15 17c-5-6-10-8-15-8s-10 2-15 8z" fill={hair} />
        <circle cx={34} cy={36} r={1.6} fill={COLORS.ink} />
        <circle cx={46} cy={36} r={1.6} fill={COLORS.ink} />
        <path d="M34 43q6 5 12 0" stroke={COLORS.ink} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {extra === "glasses" && (
          <g stroke={COLORS.ink} strokeWidth={1.4} fill="none">
            <circle cx={34} cy={36} r={4.6} />
            <circle cx={46} cy={36} r={4.6} />
            <path d="M38.6 36h2.8" />
          </g>
        )}
        {extra === "hat" && (
          <g stroke={COLORS.ink} strokeOpacity={0.7} strokeWidth={1.3}>
            <ellipse cx={40} cy={22} rx={22} ry={5} fill="#d9b266" />
            <path d="M28 22c0-12 6-14 12-14s12 2 12 14z" fill="#e6c27c" />
          </g>
        )}
        {extra === "cap" && (
          <g stroke={COLORS.ink} strokeOpacity={0.7} strokeWidth={1.3}>
            <path d="M26 26c0-12 7-15 14-15s14 3 14 15z" fill="#2d5d8c" />
            <path d="M40 26h24q-2 4-12 4h-12z" fill="#1e3f63" />
          </g>
        )}
        {extra === "headwrap" && (
          <g stroke={COLORS.ink} strokeOpacity={0.7} strokeWidth={1.3}>
            <path d="M25 28c2-12 8-16 15-16s13 4 15 16c-8-3-22-3-30 0z" fill="#c8734b" />
            <path d="M52 16q9-2 8 6q-6 0-8-6z" fill="#c8734b" />
          </g>
        )}
      </g>
    </svg>
  );
}

export function RequestCard({ day, onGo, seconds }: { day: Day; onGo: () => void; seconds: number }) {
  return (
    <div className="absolute inset-x-3 top-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[28rem] z-20" data-testid="request-card">
      <div className="st-card rounded-2xl p-3 flex gap-3 items-start">
        <Villager look={day.villager.look} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a4a2c]">
            {day.villager.name}, {day.villager.role}
          </p>
          <p className="text-[15px] leading-snug mt-0.5">{day.villager.line}</p>
          <div className="flex items-center gap-3 mt-2">
            <button type="button" onClick={onGo} className="st-btn st-btn-primary" data-testid="request-go">
              Let&apos;s build
            </button>
            {seconds > 0 && (
              <span className="h-1 flex-1 rounded bg-[#e9d3a6] overflow-hidden" aria-hidden="true">
                <span className="block h-full bg-[#c8734b] st-timer" style={{ animationDuration: `${seconds}s` }} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Tiny sun curve with the cloud window marked. */
export function Forecast({ day }: { day: Day }) {
  const c = day.cloud;
  const x = (h: number) => 4 + ((h - 6) / 24) * 112;
  const pts = Array.from({ length: 25 }, (_, i) => {
    const h = 6 + i;
    const d = h % 24;
    const s = d >= 6 && d <= 18 ? Math.sin((Math.PI * (d - 6)) / 12) : 0;
    return `${x(h).toFixed(1)},${(24 - s * 18).toFixed(1)}`;
  }).join(" ");
  return (
    <div className="st-chip flex items-center gap-2" data-testid="forecast">
      <svg width={120} height={28} viewBox="0 0 120 28" aria-hidden="true">
        <polyline points={pts} fill="none" stroke={COLORS.sun} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        {c && <rect x={x(c.start)} y={2} width={x(c.end) - x(c.start)} height={24} rx={3} fill="#5b3a63" opacity={0.35} />}
        <line x1={4} y1={25} x2={116} y2={25} stroke={COLORS.ink} strokeOpacity={0.4} />
      </svg>
      <span className="text-[12px] leading-tight">
        <strong>Forecast:</strong> {day.forecast}
      </span>
    </div>
  );
}

const DOT = { green: "#15803d", amber: "#d97706", red: "#b91c1c" } as const;
const WORD = { green: "Enough", amber: "Tight", red: "Not enough" } as const;

/** Supply versus demand for the build on screen, from the pure sim. Never colour alone: the word is there too. */
export function BuildStrip({ check }: { check: BuildCheck }) {
  const full = Math.floor(check.nightHours);
  return (
    <div className="st-chip max-w-[19rem]" data-testid="build-check" data-status={check.status}>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 inline-block h-3 w-3 rounded-full border border-black/40" style={{ background: DOT[check.status] }} aria-hidden="true" />
        <span>
          <strong>{WORD[check.status]}.</strong> {check.text}
        </span>
      </div>
      {check.showNight && (
        <div className="mt-1" data-testid="night-bar" data-hours={full}>
          <div className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="h-2 flex-1 rounded-sm border border-black/30" style={{ background: i < full ? "#F5B700" : "#d8d0e0" }} />
            ))}
          </div>
          <span className="text-[11.5px]">The jar covers {full} of 12 night hours.</span>
        </div>
      )}
    </div>
  );
}

export function PauseCard({ onResume, onExit, focus }: { onResume: () => void; onExit?: () => void; focus: boolean }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 bg-[#1e2a4a]/55" data-testid="pause-card">
      <div className="st-card rounded-2xl p-4 max-w-sm w-full">
        <h2 className="text-lg font-extrabold">Paused</h2>
        <ul className="mt-2 text-[14px] leading-snug space-y-1.5 list-disc pl-5">
          <li>Tap a glowing building to switch it on or off.</li>
          <li>While building, tap a spot to place a panel or a battery jar.</li>
          <li>The sun makes power. The jar keeps it for tonight.</li>
          <li>Keyboard: Tab or arrows to move, Space to switch, P to pause, F for 2x.</li>
        </ul>
        <div className="flex gap-2 mt-3">
          <button type="button" className="st-btn st-btn-primary flex-1" onClick={onResume} data-testid="resume">
            Resume
          </button>
          {focus && onExit && (
            <button type="button" className="st-btn" onClick={onExit} data-testid="pause-exit">
              Exit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


export function ResultCard({
  day,
  result,
  crates,
  onNext,
  onReplay,
  onSource,
}: {
  day: Day;
  result: DayResult;
  crates: { used: number; total: number };
  onNext: () => void;
  onReplay: () => void;
  onSource: () => void;
}) {
  const win = result.met;
  const main = FACTS[day.main];
  const behind = FACTS[day.behind];
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, []);
  const problems = result.requirements.filter((r) => !r.met && r.line);
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-2 bg-[#1e2a4a]/45 overflow-y-auto" data-testid="result-card" data-win={win ? "1" : "0"}>
      <div className="st-card rounded-2xl p-4 max-w-md w-full">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a4a2c]">
            Day {day.n}: {day.title}
          </p>
          <Stars n={result.stars} animate size={34} />
        </div>
        <h2 className="text-xl font-extrabold leading-tight mt-1" data-testid="result-headline">
          {win ? day.win : problems[0]?.line}
        </h2>
        {!win && problems.slice(1).map((p) => (
          <p key={p.job} className="text-[14px] mt-1">
            {p.line}
          </p>
        ))}
        {result.breakerTrips > 0 && <p className="text-[14px] mt-1">The breaker saved the clinic&apos;s power, but it switched your jobs off.</p>}
        {result.hint && <p className="text-[14px] mt-2 text-[#5b3a63]">{result.hint}</p>}
        <ul className="mt-2 text-[12.5px] leading-snug space-y-0.5" data-testid="star-rules">
          <li>{result.stars >= 1 ? "Earned" : "Not earned"}: 1 star, every job done.</li>
          <li>{result.stars >= 2 ? "Earned" : "Not earned"}: 2 stars, nothing went dark and the breaker never tripped.</li>
          <li>
            {result.stars >= 3 ? "Earned" : "Not earned"}: 3 stars, {day.n === 1 ? "the tank full by 1 pm." : "the jar at least a quarter full at sunrise."}
          </li>
        </ul>
        <p className="text-[12.5px] mt-1.5 text-[#4a3a43]" data-testid="result-stats">
          Crates used {crates.used} of {crates.total}. Sun wasted {Math.round(result.wastedShare * 100)}%.
        </p>
        <p className="text-[13px] mt-3 leading-snug">
          {main.text}{" "}
          <a href={main.url} target="_blank" rel="noopener noreferrer" className="underline font-semibold" data-testid="fact-source" onClick={onSource}>
            Source: {main.short}
          </a>
        </p>
        {win && (
          <p className="text-[12px] mt-1.5 text-[#4a3a43] leading-snug">
            Behind the tap: {behind.text}{" "}
            <a href={behind.url} target="_blank" rel="noopener noreferrer" className="underline">
              Source
            </a>
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <button type="button" className={`st-btn flex-1 ${win ? "" : "st-btn-primary"}`} onClick={onReplay} data-testid="replay-day" disabled={!ready}>
            Replay day
          </button>
          <button type="button" className={`st-btn flex-1 ${win ? "st-btn-primary" : ""}`} onClick={onNext} data-testid="next-day" disabled={!ready}>
            {day.n === 5 ? "See the world" : "Next day"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** 20 seconds, no gameplay: the globe lights up and three facts appear. */
export function Finale({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [t, setT] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const k = Math.min(1, (now - start) / 1000 / seconds);
      setT(k);
      if (k >= 1) done.current();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [seconds]);
  const blobs = [
    "M52 70 C46 60 56 48 70 50 C84 52 86 64 78 74 C70 84 56 82 52 70Z",
    "M92 52 C100 44 120 46 128 54 C138 62 132 76 120 78 C106 80 92 70 92 52Z",
    "M96 90 C108 84 126 90 124 106 C122 122 104 128 96 116 C90 106 90 96 96 90Z",
    "M130 40 C142 34 160 40 162 52 C164 64 148 70 138 64 C128 58 124 46 130 40Z",
    "M150 82 C160 80 170 88 168 100 C164 110 152 110 148 100 C146 92 146 86 150 82Z",
  ];
  const lights = Array.from({ length: 130 }, (_, i) => {
    const box = [[52, 50, 34, 30], [92, 44, 44, 34], [94, 88, 32, 38], [126, 38, 38, 32], [146, 80, 24, 30]][i % 5];
    const a = (i * 2654435761) % 1000 / 1000;
    const b = (i * 40503 + 17) % 1000 / 1000;
    return { x: box[0] + a * box[2], y: box[1] + b * box[3], k: ((i * 7919) % 130) / 130 };
  });
  const facts = [FACTS[FINALE_FACTS[0]], FACTS[FINALE_FACTS[1]], FACTS[FINALE_FACTS[2]]];
  const shown = t < 0.14 ? -1 : t < 0.42 ? 0 : t < 0.64 ? 1 : t < 0.82 ? 2 : 3;
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-3 gap-3 bg-[#141a36] text-[#fffef7]" data-testid="finale">
      <svg viewBox="0 0 210 156" className="w-full max-w-[19rem]" aria-hidden="true">
        <defs>
          <radialGradient id="globe" cx="40%" cy="35%">
            <stop offset="0" stopColor="#35508a" />
            <stop offset="1" stopColor="#141f45" />
          </radialGradient>
        </defs>
        <circle cx={105} cy={78} r={68} fill="url(#globe)" stroke="#8fb8de" strokeOpacity={0.5} strokeWidth={1.5} />
        {blobs.map((d, i) => (
          <path key={i} d={d} fill="#2c4a3f" stroke="#15803d" strokeOpacity={0.5} strokeWidth={1} />
        ))}
        {lights.map((l, i) => (
          <circle key={i} cx={l.x} cy={l.y} r={1.5} fill={COLORS.glow} opacity={Math.max(0, Math.min(1, (t - 0.04 - l.k * 0.7) * 9))} />
        ))}
      </svg>
      <div className="min-h-[7.5rem] max-w-md text-center px-2" aria-live="polite">
        {shown >= 0 && shown < 3 && (
          <p key={shown} className="text-[17px] leading-snug st-fadein">
            {facts[shown].text}{" "}
            <a href={facts[shown].url} target="_blank" rel="noopener noreferrer" className="underline text-[#ffd27a] text-sm">
              Source
            </a>
          </p>
        )}
        {shown === 3 && <p className="text-[17px] leading-snug st-fadein">{FINALE_HONEST}</p>}
      </div>
      <div className="h-1 w-48 rounded bg-white/20 overflow-hidden" aria-hidden="true">
        <div className="h-full bg-[#ffd27a]" style={{ width: `${t * 100}%` }} />
      </div>
      <button type="button" className="st-btn" onClick={() => done.current()} data-testid="finale-skip">
        Continue
      </button>
    </div>
  );
}

export const DAY_COUNT = DAYS.length;
