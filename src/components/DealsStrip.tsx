/**
 * A one-line pointer to /black-friday-deals, shown only while at least one of its
 * deals is live. The clock is read per request (connection() keeps this out of the
 * prerendered shell), so the strip goes away by itself when the last sale ends.
 */

import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { dealVerdict, liveDeals } from "@/data/deals";
import { requestTimeMs } from "@/data/sales";

async function LiveStrip({ className }: { className: string }) {
  await connection();
  const live = liveDeals(requestTimeMs());
  if (live.length === 0) return null;
  const lows = live.filter((d) => dealVerdict(d).kind === "lowest").length;
  return (
    <div className={`border-b border-amber-200 bg-amber-50 ${className}`} data-testid="deals-strip">
      <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-amber-950">
        <strong>Black Friday:</strong> {live.length} power station and e-bike deals checked against the prices we logged last month
        {lows > 0 ? `, ${lows} at our lowest recorded price` : ""}.{" "}
        <Link href="/black-friday-deals" className="font-semibold underline underline-offset-2">
          See which are real
        </Link>
      </p>
    </div>
  );
}

export function DealsStrip({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <LiveStrip className={className} />
    </Suspense>
  );
}
