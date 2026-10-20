import Link from "next/link";
import { DATA_UPDATED } from "@/lib/energy";

const TOOLS = [
  { href: "/go-electric", label: "Go Electric savings calculator" },
  { href: "/ev-charging-cost", label: "EV charging cost calculator" },
  { href: "/solar-calculator", label: "Solar panel calculator" },
  { href: "/battery-calculator", label: "Home battery sizer" },
  { href: "/calculator", label: "EV Finder" },
  { href: "/solar-finder", label: "Solar Finder" },
];

const GUIDES = [
  { href: "/plug-in-solar", label: "Plug-in solar guide" },
  { href: "/best-portable-power-stations", label: "Best portable power stations" },
  { href: "/home-battery-backup", label: "Home battery backup" },
  { href: "/lithium-rv-battery", label: "Lithium RV & boat batteries" },
  { href: "/boating", label: "Electric boating & fishing" },
  { href: "/best-trolling-motor-battery", label: "Trolling motor batteries" },
  { href: "/trolling-motor-battery-life", label: "Trolling motor runtime" },
  { href: "/electric-outboard-motor", label: "Electric outboard motors" },
  { href: "/lithium-vs-agm-battery", label: "Lithium vs AGM" },
  { href: "/best-power-station-for-cpap", label: "Power station for CPAP" },
  { href: "/power-station-for-refrigerator", label: "Power station for a fridge" },
  { href: "/best-home-ev-charger", label: "Best home EV charger" },
  { href: "/ev-charger-installation-cost", label: "EV charger installation cost" },
  { href: "/compare", label: "Power station comparisons" },
  { href: "/states", label: "Energy data by state" },
  { href: "/incentives", label: "2026 incentives" },
  { href: "/myths", label: "Myths, answered" },
  { href: "/news", label: "Latest headlines" },
];

const ABOUT = [
  { href: "/about", label: "About & editorial standards" },
  { href: "/methodology", label: "Methodology" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/privacy", label: "Privacy" },
];

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3">{title}</h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-stone-700 hover:text-spark-orange transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-black/8 bg-surface-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-lg font-bold text-spark-orange mb-3">Spark Powered</p>
            <p className="text-sm text-stone-700 leading-relaxed">
              Helping US households go electric and keep more of their money, with numbers you can check. Not
              owned by any carmaker, installer or utility; some product links earn us a commission.
            </p>
          </div>
          <Column title="Tools" links={TOOLS} />
          <Column title="Guides & data" links={GUIDES} />
          <Column title="About" links={ABOUT} />
        </div>
        <div className="mt-8 pt-8 border-t border-black/8 text-sm text-stone-600">
          &copy; {DATA_UPDATED.slice(0, 4)} Spark Powered. Estimates only — not financial or tax advice.
        </div>
      </div>
    </footer>
  );
}
