"use client";

import Link from "next/link";
import { useState } from "react";

function SparkIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className="inline-block"
      aria-hidden="true"
    >
      <path
        d="M18 2L6 18h8l-2 12 12-16h-8l2-12z"
        fill="url(#spark-gradient)"
        stroke="rgba(245,158,11,0.4)"
        strokeWidth="1"
      />
      <defs>
        <linearGradient id="spark-gradient" x1="8" y1="2" x2="22" y2="32">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const navLinks = [
  { href: "/ev-charging-cost", label: "Electric Cars" },
  { href: "/best-home-ev-charger", label: "EV Chargers" },
  { href: "/solar-calculator", label: "Solar" },
  { href: "/plug-in-solar", label: "Plug-in Solar" },
  { href: "/best-portable-power-stations", label: "Backup Power" },
  { href: "/home-battery-backup", label: "Home Batteries" },
  { href: "/lithium-rv-battery", label: "RV Batteries" },
  { href: "/boating", label: "Boating" },
  { href: "/myths", label: "Myths" },
  { href: "/states", label: "States" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-black/8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Spark Powered home">
            <SparkIcon />
            <span className="text-xl font-extrabold text-ink">
              Spark Powered
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden xl:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-stone-700 hover:text-spark-orange transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link href="/go-electric" className="hidden sm:inline-flex xl:ml-2 btn btn-primary btn-sm">
            See what you&apos;d save
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            className="xl:hidden p-2 text-stone-700 hover:text-spark-orange"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Main" className="xl:hidden border-t border-black/8 bg-background/98 backdrop-blur-lg">
          <Link
            href="/go-electric"
            className="block px-6 py-3 text-base font-bold text-spark-orange hover:bg-surface-light"
            onClick={() => setMobileOpen(false)}
          >
            See what you&apos;d save
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-6 py-3 text-sm font-medium text-stone-700 hover:text-spark-orange hover:bg-surface-light transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
