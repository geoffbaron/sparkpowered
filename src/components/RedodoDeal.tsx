/**
 * A slim Redodo discount-code note (AW10, through Nov 1 2026) beside our Redodo
 * picks. No prices, only the code, the last day and the tracked link.
 *
 * Like <RedodoSaleCallout>, the date check runs per request (connection() opts
 * this part out of the prerendered shell, and Suspense streams it in), so the
 * note disappears the moment the offer ends instead of staying frozen in the
 * build. Pages that render this must already show <AffiliateDisclosure>.
 */

import { Suspense } from "react";
import { connection } from "next/server";
import { PartnerLink } from "@/components/affiliate";
import { DISCLOSURE_TEXT } from "@/data/affiliates";
import { REDODO_AW10_2026, brandCodeLine, isSaleLive, requestTimeMs, type BrandCode } from "@/data/sales";

/** The note itself, or nothing outside the offer window. `now` is milliseconds since epoch. */
export function RedodoDealBox({ now, deal = REDODO_AW10_2026, className = "" }: { now: number; deal?: BrandCode; className?: string }) {
  if (!isSaleLive(deal, now)) return null;
  return (
    <aside
      aria-label="Redodo discount code"
      data-testid="redodo-deal"
      data-deal={deal.id}
      className={`rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 ${className}`}
    >
      <p>
        <span className="block text-xs font-semibold uppercase tracking-wide text-spark-amber">Partner link · Redodo</span>
        <strong>{brandCodeLine(deal)}</strong>
        <span className="block text-xs text-amber-900/80">{DISCLOSURE_TEXT}</span>
      </p>
      <PartnerLink brand={deal.brand} variant="button">Shop Redodo</PartnerLink>
    </aside>
  );
}

async function LiveDeal({ className }: { className: string }) {
  await connection();
  return <RedodoDealBox now={requestTimeMs()} className={className} />;
}

export function RedodoDeal({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <LiveDeal className={className} />
    </Suspense>
  );
}
