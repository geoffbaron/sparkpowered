"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { track } from "@/lib/solartopia/track";

// The game code (scene, sim, audio, ending) loads only when Play is tapped.
const Game = dynamic(() => import("./Game"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] items-center justify-center bg-[#1E2A4A] text-[#fffef7]" role="status">
      Loading Solartopia
    </div>
  ),
});

/** The dark village on the title card: hand-cut shapes, three windows already glowing. */
function TitleArt() {
  return (
    <svg viewBox="0 0 360 200" className="w-full h-auto block" role="img" aria-label="A dark village at dusk with a few glowing windows and a row of solar panels">
      <defs>
        <linearGradient id="st-title-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E2A4A" />
          <stop offset="1" stopColor="#5B3A63" />
        </linearGradient>
      </defs>
      <rect width="360" height="200" fill="url(#st-title-sky)" />
      {[[30, 24], [92, 14], [150, 40], [214, 18], [268, 36], [322, 20], [60, 56], [300, 60]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.4} fill="#fffef7" opacity={0.8} />
      ))}
      <path d="M-5 128 Q40 98 90 120 T190 112 T290 118 T370 104 V200 H-5Z" fill="#3b2d55" />
      <path d="M-5 150 Q60 128 130 144 T260 140 T370 134 V200 H-5Z" fill="#4a3358" />
      <path d="M-5 168 Q90 152 190 166 T370 160 V200 H-5Z" fill="#E9D3A6" opacity={0.9} />
      {[[40, 140], [112, 148], [196, 142], [268, 150]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 28 L2 8 L44 6 L46 28Z" fill="#8b4a30" stroke="#2a1d24" strokeOpacity=".6" strokeWidth="1.3" />
          <path d="M-4 8 L50 6 L48 0 L-2 2Z" fill="#c8a876" stroke="#2a1d24" strokeOpacity=".6" strokeWidth="1.2" />
          <rect x="30" y="14" width="8" height="9" rx="1.5" fill={i === 1 || i === 3 ? "#FFD27A" : "#2a1d24"} />
          {(i === 1 || i === 3) && <circle cx="34" cy="18" r="13" fill="#FFD27A" opacity=".22" />}
          <rect x="8" y="16" width="9" height="12" fill="#5b3524" />
        </g>
      ))}
      <path d="M296 128 L308 112 L338 112 L330 128Z" fill="#2D5D8C" stroke="#2a1d24" strokeOpacity=".6" strokeWidth="1.2" />
      <path d="M306 124 L312 114 L328 114" stroke="#8FB8DE" strokeWidth="1" fill="none" opacity=".7" />
    </svg>
  );
}

export default function Launcher({ picks }: { picks: { outage: ReactNode; drive: ReactNode } }) {
  const [playing, setPlaying] = useState(false);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    track("st_view");
  }, []);

  const exit = useCallback(() => {
    setPlaying(false);
    setFocus(false);
  }, []);

  useEffect(() => {
    if (!focus) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [focus]);

  const play = () => {
    let phone = false;
    try {
      phone = window.matchMedia("(max-width: 700px), (max-height: 500px) and (pointer: coarse)").matches;
    } catch {}
    track("st_start");
    setFocus(phone);
    setPlaying(true);
    if (!phone) setTimeout(() => document.getElementById("st-stage")?.scrollIntoView({ block: "start", behavior: "smooth" }), 50);
  };

  if (playing) {
    const game = <Game focus={focus} onExit={exit} picks={picks} />;
    return focus ? (
      <div className="fixed inset-0 z-[100] bg-[#1E2A4A]" style={{ height: "100dvh" }} role="dialog" aria-modal="true" aria-label="Solartopia">
        {game}
      </div>
    ) : (
      <div id="st-stage" className="rounded-3xl overflow-hidden border-2 border-[#3a2a33]/60 shadow-xl scroll-mt-20" role="region" aria-label="Solartopia">
        {game}
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden border-2 border-[#3a2a33]/60 shadow-xl bg-[#1E2A4A]" data-testid="solartopia-title">
      <TitleArt />
      <div className="p-4 sm:p-5 text-[#fffef7] flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-2xl font-extrabold leading-tight">Solartopia</p>
          <p className="text-[15px] opacity-90 mt-0.5">Five short days. Light a dark village with panels and batteries, then a town, then a city. About five minutes, free, no sign-up.</p>
        </div>
        <button
          type="button"
          onClick={play}
          data-testid="play"
          className="inline-flex items-center justify-center min-h-14 px-8 rounded-2xl bg-[#F5B700] text-[#1E2A4A] text-lg font-extrabold border-2 border-[#3a2a33]/70 shadow-[0_3px_0_rgba(0,0,0,.35)] active:translate-y-0.5"
        >
          Play
        </button>
      </div>
    </div>
  );
}
