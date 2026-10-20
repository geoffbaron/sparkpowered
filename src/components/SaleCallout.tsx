/**
 * A small dated sale note shown beside our picks while a brand sale is on.
 *
 * The date check runs per request (connection() opts this part out of the
 * prerendered shell, and Suspense streams it in), so the note disappears the
 * moment the sale ends instead of staying frozen in the build. The rest of the
 * page stays static. Pages that render this must already show <AffiliateDisclosure>.
 */

import { Suspense } from "react";
import { connection } from "next/server";
import { PartnerLink } from "@/components/affiliate";
import { REDODO_HALLOWEEN_2026, isSaleLiveNow, saleSavingUsd, type BrandSale } from "@/data/sales";
import { money } from "@/lib/products";

async function LiveSale({ sale, className }: { sale: BrandSale; className: string }) {
  await connection();
  if (!isSaleLiveNow(sale)) return null;
  return (
    <aside
      aria-label={sale.title}
      data-testid="sale-callout"
      data-sale={sale.id}
      className={`rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 ${className}`}
    >
      <strong>
        {sale.title}, through {sale.endsLabel}:
      </strong>{" "}
      {sale.items.map((i, n) => (
        <span key={i.url}>
          {n > 0 && "; "}
          <PartnerLink brand={sale.brand} productUrl={i.url}>{i.name}</PartnerLink> {money(i.salePriceUsd)} (was{" "}
          {money(i.regularPriceUsd)}, save {money(saleSavingUsd(i))})
        </span>
      ))}
      .{" "}
      <PartnerLink brand={sale.brand} productUrl={sale.url}>See the sale</PartnerLink>.
      {sale.note && <span className="block text-xs text-amber-900/80 mt-1">{sale.note} Prices are Redodo&apos;s and can change.</span>}
    </aside>
  );
}

export function RedodoSaleCallout({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <LiveSale sale={REDODO_HALLOWEEN_2026} className={className} />
    </Suspense>
  );
}
