import Link from "next/link";
import { PartnerLink } from "@/components/affiliate";
import { formatDate } from "@/lib/energy";
import { fmtKwh, fmtW, fmtWh } from "@/lib/offgrid";
import { KIT_DAYS, type KitPackage } from "@/lib/offgrid-kit";
import { money, productById } from "@/lib/products";

const n0 = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Small / Medium / Large 90-day packages for one example state, each linking
 * into the builder preset. `compact` is the short version for the /off-grid hub.
 */
export default function KitPresetCards({ kits, stateName, compact = false }: { kits: KitPackage[]; stateName: string; compact?: boolean }) {
  return (
    <div className="grid md:grid-cols-3 gap-4" data-testid="kit-presets">
      {kits.map((k) => {
        const p = k.power;
        const station = p ? productById(p.match.option.id) : null;
        return (
          <div key={k.home.id} className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5 flex flex-col" data-testid={`kit-preset-${k.home.id}`}>
            <h3 className="text-lg font-extrabold text-ink">{k.home.label}</h3>
            <p className="text-sm text-muted">{k.home.blurb}</p>
            <p className="text-xs text-stone-700 mt-2">About {fmtWh(k.whPerDay)} a day</p>
            {p && station ? (
              <ul className="mt-3 space-y-1.5 text-sm text-stone-800">
                <li>
                  <PartnerLink brand={station.brand} productId={station.id} productUrl={station.url}>
                    {p.match.option.name}
                  </PartnerLink>
                  {p.match.addOns > 0 ? ` + ${p.match.addOns} batteries` : ""} ({fmtKwh(p.match.totalWh)})
                </li>
                <li>
                  {p.panels} × {p.panel.watts} W panels ({fmtW(p.panelW)})
                </li>
                <li>Generator fuel: about {n0(k.generator.gallons)} gal of gasoline</li>
                {!compact && (
                  <>
                    <li>Water: {n0(k.water.storeGallons)} gal stored, plus a filter and a source</li>
                    <li>Food: {n0(k.food.total)} calories</li>
                  </>
                )}
              </ul>
            ) : (
              <p className="mt-3 text-sm">No power station we track fits; see the builder.</p>
            )}
            {p && (
              <p className="mt-3 font-extrabold text-ink tabular-nums">
                {money(p.priceUsd)} <span className="text-xs font-normal text-muted">power items, prices checked {formatDate([station!.retrieved, p.panel.retrieved].sort()[0])}</span>
              </p>
            )}
            <Link
              href={`/off-grid-kit?home=${k.home.id}#builder`}
              className="mt-auto pt-3 text-sm font-bold text-spark-orange underline"
              data-umami-event="offgrid_kit_preset"
              data-umami-event-home={k.home.id}
            >
              {compact ? `See the ${KIT_DAYS}-day ${k.home.label.toLowerCase()} kit` : `Change it for your home`}
            </Link>
          </div>
        );
      })}
      <p className="md:col-span-3 text-xs text-muted">
        Example for {stateName}&apos;s December sun. Power items are the station, batteries and panels at the makers&apos; prices on the dates shown;
        prices change often. Runs essentials, not central air, electric heat, an electric range or a dryer.
      </p>
    </div>
  );
}
