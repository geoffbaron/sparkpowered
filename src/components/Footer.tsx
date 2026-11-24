import Link from "next/link";
import { DATA_UPDATED } from "@/lib/energy";
import { AUTHOR } from "@/lib/seo";

const TOOLS = [
  { href: "/power-outage-backup-calculator", label: "Outage backup calculator" },
  { href: "/home-backup/hookup-picker", label: "Hookup picker" },
  { href: "/battery-calculator", label: "Home battery sizer" },
  { href: "/generator-runtime-calculator", label: "Generator runtime" },
];

const GUIDES = [
  { href: "/home-backup", label: "Connecting a battery to your house" },
  { href: "/home-battery-backup", label: "Whole-home vs portable backup" },
  { href: "/home-backup/well-pump", label: "Power station for a well pump" },
  { href: "/home-backup/pellet-stove", label: "Power station for a pellet stove" },
  { href: "/power-station-for-refrigerator", label: "Power station for a fridge" },
  { href: "/ev-charger-tripping-gfci", label: "EV charger tripping GFCI" },
  { href: "/compare", label: "Comparisons" },
  { href: "/states", label: "Electricity and rebates by state" },
  { href: "/questions/home-batteries-backup", label: "Questions answered" },
];

const ABOUT = [
  { href: "/about", label: "About Geoff Baron" },
  { href: "/contact", label: "Contact" },
  { href: "/methodology", label: "Methodology" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/disclaimer#affiliate-disclosure", label: "Affiliate disclosure" },
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
              Keeping your home powered in an outage. Written by {AUTHOR.name}, researched from makers&apos; manuals and official sources.
              Some product links earn a commission.
            </p>
            <p className="text-sm text-stone-700 mt-3">
              <a href={`mailto:${AUTHOR.email}`} className="underline hover:text-spark-orange">{AUTHOR.email}</a>
            </p>
          </div>
          <Column title="Tools" links={TOOLS} />
          <Column title="Guides" links={GUIDES} />
          <Column title="About" links={ABOUT} />
        </div>
        <div className="mt-8 pt-8 border-t border-black/8 text-sm text-stone-600">
          &copy; {DATA_UPDATED.slice(0, 4)} Spark Powered. General information only, not electrical advice. Have a licensed electrician do any wiring, and read the{" "}
          <Link href="/disclaimer#safety" className="underline underline-offset-2">
            safety notes
          </Link>
          .
        </div>
      </div>
    </footer>
  );
}
