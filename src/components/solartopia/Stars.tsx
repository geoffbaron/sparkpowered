import { COLORS, wobblyPoly } from "@/lib/solartopia/paint";

export function Stars({ n, animate = false, size = 36 }: { n: number; animate?: boolean; size?: number }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${n} of 3 stars`} data-testid="result-stars" data-stars={n}>
      {[0, 1, 2].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className={animate && i < n ? "st-stamp" : undefined} style={animate && i < n ? { animationDelay: `${300 + i * 650}ms` } : undefined}>
          <path d={wobblyPoly([[12, 1.5], [15, 8.5], [22.5, 9], [16.8, 14], [18.6, 21.5], [12, 17.6], [5.4, 21.5], [7.2, 14], [1.5, 9], [9, 8.5]], i + 3, 0.4)} fill={i < n ? COLORS.sun : "#e9d3a6"} stroke={COLORS.ink} strokeOpacity={0.7} strokeWidth={1.2} />
        </svg>
      ))}
    </span>
  );
}
