import Link from "next/link";
import { LOCAL_STATE_LINKS } from "@/data/state-local";

/** Links to the state pages that carry checked local facts (utilities, latest price, open programs). */
export default function LocalStateLinks({ heading = "Local prices, utilities and programs" }: { heading?: string }) {
  return (
    <nav aria-label={heading} className="mt-8 rounded-xl border border-black/8 bg-surface p-4">
      <p className="text-sm font-semibold text-ink mb-2">{heading}</p>
      <ul className="flex flex-wrap gap-2 text-sm">
        {LOCAL_STATE_LINKS.map((s) => (
          <li key={s.abbr}>
            <Link href={`/states/${s.slug}#local`} className="inline-block rounded-full border border-black/15 bg-white px-3 py-1.5 hover:border-amber-300">
              {s.name}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/incentives" className="inline-block rounded-full border border-black/15 bg-white px-3 py-1.5 hover:border-amber-300">
            What federal and state help is left
          </Link>
        </li>
        <li>
          <Link href="/states" className="inline-block rounded-full border border-black/15 bg-white px-3 py-1.5 hover:border-amber-300">
            All states
          </Link>
        </li>
      </ul>
    </nav>
  );
}
