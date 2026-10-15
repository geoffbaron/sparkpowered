import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="text-sm font-semibold text-spark-amber mb-2">404</p>
      <h1 className="text-3xl font-extrabold mb-4">We couldn&apos;t find that page</h1>
      <p className="text-stone-700 mb-8">It may have moved. These are the most-used tools:</p>
      <ul className="grid sm:grid-cols-2 gap-3 text-left">
        {[
          { href: "/ev-charging-cost", label: "EV charging cost calculator" },
          { href: "/solar-calculator", label: "Solar panel calculator" },
          { href: "/battery-calculator", label: "Home battery sizer" },
          { href: "/states", label: "Energy data by state" },
        ].map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="block bg-surface rounded-xl border border-black/8 p-4 font-semibold hover:border-amber-300">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
