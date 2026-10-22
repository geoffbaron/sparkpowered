/** About eight tiny Web Audio cues. No files, no libraries. Safe to call anywhere; silent when muted. */

export type Cue = "tock" | "pop" | "flipOn" | "flipOff" | "splash" | "thunk" | "swell" | "stamp" | "chime";

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
  if (m && ctx && ctx.state === "running") ctx.suspend().catch(() => {});
  if (!m && ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
}

/** Call from a tap handler so the browser lets sound start. */
export function unlock() {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === "suspended" && !muted) ctx.resume().catch(() => {});
  } catch {}
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number, slideTo?: number) {
  if (!ctx) return;
  const t0 = ctx.currentTime + start;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noise(start: number, dur: number, gain: number, freq: number) {
  if (!ctx) return;
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let seed = 12345;
  for (let i = 0; i < n; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    d[i] = ((seed / 4294967296) * 2 - 1) * (1 - i / n);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(ctx.currentTime + start);
}

export function play(cue: Cue) {
  if (muted || !ctx || ctx.state !== "running") return;
  switch (cue) {
    case "tock":
      tone(220, 0, 0.09, "triangle", 0.25, 120);
      noise(0, 0.05, 0.12, 900);
      break;
    case "pop":
      tone(500, 0, 0.08, "sine", 0.15, 300);
      break;
    case "flipOn":
      tone(180, 0, 0.07, "square", 0.08, 120);
      tone(330, 0.05, 0.16, "triangle", 0.18, 520);
      break;
    case "flipOff":
      tone(240, 0, 0.1, "triangle", 0.18, 120);
      break;
    case "splash":
      noise(0, 0.5, 0.2, 1800);
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.1 + i * 0.09, 0.4, "sine", 0.16));
      break;
    case "thunk":
      tone(90, 0, 0.25, "sine", 0.4, 45);
      noise(0, 0.12, 0.2, 300);
      break;
    case "swell":
      [262, 330, 392].forEach((f) => tone(f, 0, 1.6, "sine", 0.07));
      break;
    case "stamp":
      tone(130, 0, 0.18, "triangle", 0.35, 60);
      noise(0, 0.08, 0.25, 500);
      break;
    case "chime":
      [659, 784, 988].forEach((f, i) => tone(f, i * 0.12, 0.5, "sine", 0.14));
      break;
  }
}
