/**
 * Small building blocks shared by the buyer's guides: the "short answer" box
 * at the top of each guide and plain (untracked) links to non-partner brands.
 */

import { Icon } from "@/components/icons";
import { PartnerLink } from "@/components/affiliate";
import { AFFILIATES, brandForUrl } from "@/data/affiliates";

/** The pick, up front, before any detail. */
export function QuickAnswer({ title = "The short answer", children }: { title?: string; children: React.ReactNode }) {
  return (
    <aside
      aria-label={title}
      className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-5 sm:p-6"
      data-testid="quick-answer"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-spark-amber flex items-center gap-1.5">
        <Icon name="check" size={16} />
        {title}
      </p>
      <div className="mt-2 text-stone-800 leading-relaxed space-y-2">{children}</div>
    </aside>
  );
}

/**
 * A link to a brand we have no affiliate deal with: no tracking, not sponsored.
 * If the URL turns out to be on an approved partner's store, it is rendered as a
 * tracked <PartnerLink> instead, so a buy link can never slip out untagged.
 */
export function PlainLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const brand = brandForUrl(href);
  if (brand && AFFILIATES[brand].tracked) {
    return (
      <PartnerLink brand={brand} productUrl={href} className={className}>
        {children}
      </PartnerLink>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener" data-partner="none" className={className ?? "underline underline-offset-2 text-stone-800 hover:text-spark-orange"}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Row of pill buttons for a single choice (client components pass state in). */
export function pillClass(active: boolean) {
  return `px-3 py-1.5 rounded-full border text-sm font-semibold ${active ? "bg-spark-orange text-white border-spark-orange" : "bg-white border-black/15 text-ink"}`;
}
