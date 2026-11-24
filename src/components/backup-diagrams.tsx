/**
 * Simple, hand-drawn-style diagrams for the home backup pages. Our own drawings,
 * not copies of any maker's diagram: they show the idea, never wiring detail.
 * Every one carries a <title> and an aria-label so it reads without the picture.
 */

const INK = "#1c1917";
const MUTED = "#78716c";
const ORANGE = "#ea580c";
const RED = "#b91c1c";
const GREEN = "#15803d";
const FILL = "#fafaf9";

function Box({ x, y, w, h, label, sub, tone = INK }: { x: number; y: number; w: number; h: number; label: string; sub?: string; tone?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={FILL} stroke={tone} strokeWidth={2} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 4 : h / 2 + 5)} textAnchor="middle" fontSize={14} fontWeight={700} fill={tone}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize={11} fill={MUTED}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, tone = INK, dashed = false }: { x1: number; y1: number; x2: number; y2: number; tone?: string; dashed?: boolean }) {
  const id = `ah-${tone.slice(1)}`;
  return (
    <g>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={tone} />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={tone} strokeWidth={2.5} strokeDasharray={dashed ? "6 5" : undefined} markerEnd={`url(#${id})`} />
    </g>
  );
}

/** The four safe ways from a battery to the house, and the one that kills. */
export function HookupMethodsDiagram() {
  const rows = [
    { y: 20, mid: "Extension cords", midSub: "one per appliance", end: "Fridge, lamp, router", endSub: "plugged into the battery", who: "No electrician" },
    { y: 100, mid: "Inlet box + interlock", midSub: "slide plate on your panel", end: "Any breaker you pick", endSub: "you manage the load", who: "Electrician + permit" },
    { y: 180, mid: "Manual transfer switch", midSub: "6 or 10 circuits", end: "Only the circuits", endSub: "wired to the switch", who: "Electrician + permit" },
    { y: 260, mid: "Maker's smart panel", midSub: "switches by itself", end: "Circuits on its subpanel", endSub: "automatic switchover", who: "Electrician + permit" },
  ];
  return (
    <figure className="my-6">
      <svg viewBox="0 0 720 400" role="img" aria-label="Four safe ways to connect a power station to a house: extension cords, an inlet box with an interlock, a manual transfer switch, or the maker's smart panel. Plugging into a wall outlet is backfeeding and is never safe." className="w-full h-auto max-w-3xl">
        <title>Four safe ways to connect a battery to a house, and one deadly one</title>
        <Box x={10} y={130} w={130} h={80} label="Power station" sub="30 A / 50 A outlet" tone={ORANGE} />
        {rows.map((r) => (
          <g key={r.mid}>
            <Arrow x1={140} y1={170} x2={230} y2={r.y + 28} tone={ORANGE} />
            <Box x={232} y={r.y} w={200} h={56} label={r.mid} sub={r.midSub} />
            <Arrow x1={432} y1={r.y + 28} x2={470} y2={r.y + 28} />
            <Box x={472} y={r.y} w={170} h={56} label={r.end} sub={r.endSub} />
            <text x={650} y={r.y + 33} fontSize={11} fill={r.who === "No electrician" ? GREEN : RED} fontWeight={700}>
              {r.who === "No electrician" ? "DIY" : "Pro"}
            </text>
          </g>
        ))}
        <g>
          <rect x={232} y={338} width={410} height={50} rx={10} fill="#fef2f2" stroke={RED} strokeWidth={2} />
          <text x={437} y={359} textAnchor="middle" fontSize={14} fontWeight={700} fill={RED}>Never: a two-plug cord into a wall or dryer outlet</text>
          <text x={437} y={377} textAnchor="middle" fontSize={11} fill={RED}>That is backfeeding. It can kill line workers and neighbors (CPSC).</text>
        </g>
      </svg>
      <figcaption className="text-xs text-muted mt-1 max-w-3xl">
        Our own sketch of the options, not a wiring diagram. &quot;Pro&quot; means a licensed electrician installs it, with a permit.
      </figcaption>
    </figure>
  );
}

/** Bonded vs floating neutral: why it matters which kind of transfer switch you have. */
export function NeutralDiagram() {
  return (
    <figure className="my-6">
      <svg viewBox="0 0 720 230" role="img" aria-label="Two cases. A battery whose neutral is bonded to ground inside it should feed a transfer switch that switches the neutral. A battery with a floating neutral uses the house's own neutral-to-ground bond in the main panel, which suits the common transfer switches that do not switch the neutral." className="w-full h-auto max-w-3xl">
        <title>Bonded or floating neutral, and which switch suits it</title>
        <Box x={10} y={20} w={170} h={70} label="Bonded neutral" sub="N tied to ground inside" tone={ORANGE} />
        <Arrow x1={180} y1={55} x2={270} y2={55} tone={ORANGE} />
        <Box x={272} y={20} w={200} h={70} label="Switched-neutral" sub="transfer equipment" />
        <text x={490} y={50} fontSize={12} fill={INK}>One bond at a time.</text>
        <text x={490} y={68} fontSize={12} fill={MUTED}>Otherwise neutral current can</text>
        <text x={490} y={84} fontSize={12} fill={MUTED}>split onto ground, and GFCIs trip.</text>
        <Box x={10} y={130} w={170} h={70} label="Floating neutral" sub="no bond inside" tone={GREEN} />
        <Arrow x1={180} y1={165} x2={270} y2={165} tone={GREEN} />
        <Box x={272} y={130} w={200} h={70} label="Common manual switch" sub="neutral not switched" />
        <text x={490} y={160} fontSize={12} fill={INK}>Uses the house&apos;s one bond</text>
        <text x={490} y={178} fontSize={12} fill={MUTED}>in the main panel.</text>
      </svg>
      <figcaption className="text-xs text-muted mt-1 max-w-3xl">
        Our simplified sketch. Your electrician decides the actual setup; ask the battery&apos;s maker in writing which kind it is.
      </figcaption>
    </figure>
  );
}

/** A motor's start: a brief spike to locked rotor current, then running current. */
export function MotorStartDiagram({ runW, startW, limitW, limitLabel }: { runW: number; startW: number; limitW: number; limitLabel: string }) {
  const top = Math.max(startW, limitW) * 1.1;
  const y = (w: number) => 190 - (w / top) * 160;
  const fmt = (w: number) => `${Math.round(w).toLocaleString("en-US")} W`;
  return (
    <figure className="my-6">
      <svg viewBox="0 0 720 230" role="img" aria-label={`A motor's power over its first seconds: a spike to about ${fmt(startW)} as it starts, then about ${fmt(runW)} while running. The dashed line is ${limitLabel} at ${fmt(limitW)}.`} className="w-full h-auto max-w-3xl">
        <title>Starting watts against running watts</title>
        <line x1={60} y1={190} x2={700} y2={190} stroke={MUTED} strokeWidth={1.5} />
        <line x1={60} y1={20} x2={60} y2={190} stroke={MUTED} strokeWidth={1.5} />
        <text x={380} y={220} textAnchor="middle" fontSize={11} fill={MUTED}>Time: the spike lasts a fraction of a second to a second or so</text>
        <polyline points={`60,190 110,190 118,${y(startW)} 150,${y(startW)} 175,${y(runW)} 700,${y(runW)}`} fill="none" stroke={ORANGE} strokeWidth={3} />
        <line x1={60} y1={y(limitW)} x2={700} y2={y(limitW)} stroke={limitW >= startW ? GREEN : RED} strokeWidth={2} strokeDasharray="7 6" />
        <text x={160} y={y(startW) - 6} fontSize={12} fontWeight={700} fill={ORANGE}>Start: {fmt(startW)}</text>
        <text x={695} y={y(runW) - 8} textAnchor="end" fontSize={12} fontWeight={700} fill={ORANGE}>Running: {fmt(runW)}</text>
        <text x={695} y={y(limitW) - 6} textAnchor="end" fontSize={12} fill={limitW >= startW ? GREEN : RED}>{limitLabel}: {fmt(limitW)}</text>
      </svg>
      <figcaption className="text-xs text-muted mt-1 max-w-3xl">Our sketch of the numbers on this page, not a measurement.</figcaption>
    </figure>
  );
}

/** A fridge compressor cycling: on, off, on, with a start spike each time. */
export function FridgeCycleDiagram() {
  const cycles = [80, 230, 380, 530];
  return (
    <figure className="my-6">
      <svg viewBox="0 0 720 210" role="img" aria-label="A refrigerator's power over a few hours: the compressor switches on and off. Each start is a short spike, then it runs at a low, steady draw, then it rests at nearly zero. The daily average is what sets run time; the spike is what sets the inverter size." className="w-full h-auto max-w-3xl">
        <title>How a fridge draws power</title>
        <line x1={40} y1={170} x2={700} y2={170} stroke={MUTED} strokeWidth={1.5} />
        <line x1={40} y1={20} x2={40} y2={170} stroke={MUTED} strokeWidth={1.5} />
        <polyline
          points={["40,168", ...cycles.flatMap((x) => [`${x},168`, `${x + 4},40`, `${x + 10},40`, `${x + 14},130`, `${x + 80},130`, `${x + 82},168`]), "700,168"].join(" ")}
          fill="none"
          stroke={ORANGE}
          strokeWidth={2.5}
        />
        <line x1={40} y1={150} x2={700} y2={150} stroke={GREEN} strokeWidth={2} strokeDasharray="7 6" />
        <text x={100} y={34} fontSize={12} fontWeight={700} fill={ORANGE}>Start spike</text>
        <text x={612} y={124} fontSize={12} fill={ORANGE}>Running</text>
        <text x={612} y={145} fontSize={12} fill={GREEN}>Daily average</text>
        <text x={370} y={196} textAnchor="middle" fontSize={11} fill={MUTED}>A few hours</text>
      </svg>
      <figcaption className="text-xs text-muted mt-1 max-w-3xl">
        Our sketch, not to scale. The heights depend on the fridge; the numbers on this page come from EIA and the sources listed.
      </figcaption>
    </figure>
  );
}
