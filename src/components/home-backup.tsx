/**
 * Shared pieces for the /home-backup cluster: the "What we checked" box, the
 * electrician rule, and the block of cluster links other pages show. The link
 * block reads liveHomeBackupPages(), so a page appears everywhere once it ships.
 */

import Link from "next/link";
import { citationUrl } from "@/data/affiliates";
import { HOME_BACKUP_HUB, liveHomeBackupPages } from "@/data/home-backup";
import { PARTNER_REL } from "@/components/affiliate";
import { formatDate } from "@/lib/energy";

export interface CheckedSource {
  name: string;
  url: string;
  /** YYYY-MM-DD we read it. */
  read: string;
  /** What we took from it, in a few words. */
  what?: string;
}

/** The sources a cluster page rests on, with read dates, and the plain statement that we have not tested the unit. */
export function WhatWeChecked({ items, untested, className = "mt-10" }: { items: CheckedSource[]; untested: string; className?: string }) {
  return (
    <section aria-labelledby="checked-heading" className={`rounded-2xl border border-black/10 bg-surface-light p-5 sm:p-6 ${className}`}>
      <h2 id="checked-heading" className="text-lg font-bold">What we checked</h2>
      <p className="text-sm text-stone-700 mt-1 max-w-3xl">
        <strong>We have not tested {untested}.</strong> Everything below comes from the makers&apos; own manuals, support articles
        and store pages, and from safety agencies, read on the dates shown.
      </p>
      <ul className="mt-3 space-y-1.5 text-sm text-stone-700">
        {items.map((s) => {
          const link = citationUrl(s.url);
          return (
            <li key={s.name + s.url}>
              <a href={link.href} rel={link.tracked ? PARTNER_REL : "noopener"} className="underline underline-offset-2 hover:text-spark-orange">
                {s.name}
              </a>
              <span className="text-muted">
                {" "}
                (read <time dateTime={s.read}>{formatDate(s.read)}</time>){s.what ? `: ${s.what}` : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The rule for anything that touches the panel, stated up front rather than as a footnote. */
export function ElectricianRule({ className = "" }: { className?: string }) {
  return (
    <div role="note" className={`rounded-xl border-2 border-red-300 bg-red-50 p-5 text-sm leading-relaxed text-red-950 ${className}`}>
      <p>
        <strong>Anything that connects to your breaker panel is a job for a licensed electrician, with a permit and inspection.</strong>{" "}
        That covers inlet boxes, interlock kits, transfer switches and the makers&apos; smart panels.
      </p>
      <p className="mt-2">
        Never power house wiring by plugging a battery or generator into a wall, dryer or range outlet with a double-ended
        (&quot;suicide&quot;) cord. That is called backfeeding: it is illegal, it can electrocute utility lineworkers and neighbors on
        the same transformer, and it bypasses your home&apos;s circuit protection (CPSC, OSHA).
      </p>
    </div>
  );
}

/** Links to the hub and every live cluster page, for the calculators, buyer's guides and what-it-runs pages. */
export function HomeBackupLinks({ className = "mt-12", exclude }: { className?: string; exclude?: string }) {
  const pages = liveHomeBackupPages().filter((p) => p.href !== exclude);
  return (
    <section aria-labelledby="home-backup-links-heading" className={className}>
      <h2 id="home-backup-links-heading" className="text-2xl font-extrabold text-ink mb-2">Keep the house running in an outage</h2>
      <p className="text-stone-700 mb-4 max-w-3xl">
        The four ways to connect a big battery to your home, what each costs, and which jobs need an electrician.{" "}
        <Link href={HOME_BACKUP_HUB.path} className="text-spark-orange underline underline-offset-2 font-semibold">
          Start with the home backup guide
        </Link>
        .
      </p>
      {pages.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-3">
          {pages.map((p) => (
            <li key={p.href} className="rounded-xl border border-black/8 bg-surface p-4">
              <Link href={p.href} className="font-semibold text-ink underline underline-offset-2 hover:text-spark-orange">
                {p.title}
              </Link>
              <span className="block text-sm text-stone-700">{p.desc}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
