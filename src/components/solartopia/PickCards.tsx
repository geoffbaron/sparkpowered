import { AffiliateDisclosure, PartnerLink } from "@/components/affiliate";
import { PickCard } from "@/components/products";
import { chargerById } from "@/data/chargers";
import { GOAL_PICK } from "@/data/solartopia";
import { formatDate, usd } from "@/lib/energy";
import { productById } from "@/lib/products";

/** Home-battery pick for the outage goal: our existing product card, one product. */
export function OutagePick() {
  const pick = GOAL_PICK.outage!;
  const p = productById(pick.productId);
  return (
    <div data-product={pick.productId}>
      <AffiliateDisclosure className="mb-2" />
      <PickCard p={p} label="Backup power for the essentials" why="A portable power station keeps the fridge, the router and the lights running when the grid goes down, with no wiring and no install." />
    </div>
  );
}

/** Home-charger pick for the drive goal: the Lectron charger, one product. */
export function DrivePick() {
  const pick = GOAL_PICK.drive!;
  const c = chargerById(pick.productId);
  return (
    <div data-product={pick.productId}>
      <AffiliateDisclosure className="mb-2" />
      <article className="rounded-3xl bg-white border border-black/10 shadow-sm p-4">
        <h3 className="text-lg font-extrabold text-ink">Lectron {c.name.replace(" (J1772)", "")}</h3>
        <p className="text-stone-700 text-sm mt-1">
          Adds up to {c.milesPerHour} miles of range an hour, so you wake up full every morning. It plugs into a 240-volt outlet and has a {c.warrantyYears}-year warranty.
        </p>
        <p className="mt-2 text-xl font-extrabold text-ink tabular-nums">
          {usd(c.priceUsd, 2)} <span className="text-xs font-normal text-muted">when we checked, {formatDate(c.retrieved)}</span>
        </p>
        <div className="mt-2">
          <PartnerLink brand={c.brand} productId={c.id} productUrl={c.url} className="btn btn-primary btn-sm">
            Check price at Lectron
          </PartnerLink>
        </div>
      </article>
    </div>
  );
}
