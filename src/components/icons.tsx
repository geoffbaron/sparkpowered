/**
 * Small inline SVG icon set (stroke icons on a 24px grid, drawn for this site).
 * Inline so no icon font or extra request is needed for the new pages.
 */

const PATHS: Record<string, React.ReactNode> = {
  car: (
    <>
      <path d="M5 16h14M5 16v2.5M19 16v2.5M3.5 12.5 5.6 7.4A2 2 0 0 1 7.4 6h9.2a2 2 0 0 1 1.8 1.4l2.1 5.1" />
      <rect x="3" y="11.5" width="18" height="5" rx="1.5" />
      <circle cx="7.5" cy="14" r=".8" fill="currentColor" />
      <circle cx="16.5" cy="14" r=".8" fill="currentColor" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  plug: (
    <>
      <path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 0 1-10 0V7ZM12 16v5" />
    </>
  ),
  battery: (
    <>
      <rect x="3" y="7" width="16" height="10" rx="2" />
      <path d="M21 10.5v3M11.5 9l-2 3h3l-2 3" />
    </>
  ),
  heat: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="10" cy="12" r="4" />
      <path d="M10 8v8M6 12h8M17 9h1.5M17 12h1.5M17 15h1.5" />
    </>
  ),
  pot: (
    <>
      <path d="M4 10h16v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6ZM2 10h2M20 10h2M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2" />
    </>
  ),
  bike: (
    <>
      <circle cx="6" cy="16" r="3.5" />
      <circle cx="18" cy="16" r="3.5" />
      <path d="M6 16l4-7h5l3 7M10 9l3 7h-7M14 5h2.5l-1.5 4" />
    </>
  ),
  water: (
    <>
      <path d="M12 3c3 4 6 7.2 6 10.5a6 6 0 0 1-12 0C6 10.2 9 7 12 3Z" />
      <path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" />
    </>
  ),
  bolt: <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />,
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.5 3 8 7 9.5 4-1.5 7-5 7-9.5V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  home: (
    <>
      <path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" />
      <path d="M5 19 13 11" />
    </>
  ),
  quiet: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="m16 9.5 5 5M21 9.5l-5 5" />
    </>
  ),
  dollar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.8 9.2c-.4-1-1.5-1.7-2.8-1.7-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.6 5.8 4.5 0 1.2-1.3 2.1-3 2.1-1.4 0-2.6-.7-3-1.8M12 6v1.5M12 16.7V18" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" />
    </>
  ),
  chart: <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name] ?? PATHS.bolt}
    </svg>
  );
}
