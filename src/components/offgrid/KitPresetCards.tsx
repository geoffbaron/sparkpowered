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
        const sys = p?.system ?? null;
        const station = p && !sys ? productById(p.match.option.id) : null;
        const seller = sys ?? station;
        const dates = p ? [seller!.retrieved, ...(p.panel ? [p.panel.retrieved] : [])].sort() : [];
        return (
          <div key={k.home.id} className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5 flex flex-col" data-testid={`kit-preset-${k.home.id}`}>
            <h3 className="text-lg font-extrabold text-ink">{k.home.label}</h3>
            <p className="text-sm text-muted">{k.home.blurb}</p>
            <p className="text-xs text-stone-700 mt-2">About {fmtWh(k.whPerDay)} a day</p>
            {p && seller ? (
              <ul className="mt-3 space-y-1.5 text-sm text-stone-800">
                <li>
                  <PartnerLink brand={seller.brand} productId={seller.id} productUrl={seller.url}>
                    {p.match.option.name}
                  </PartnerLink>
                  {p.match.addOns > 0 ? ` + ${p.match.addOns} batter${p.match.addOns === 1 ? "y" : "ies"}` : ""} ({fmtKwh(p.match.totalWh)}
                  {sys ? `, ${fmtW(sys.acOutputW)} at ${sys.volts === "120/240V" ? "120/240 V" : "120 V"}` : ""})
                </li>
                <li>
                  {p.panels} × {p.panelWatts} W panels ({fmtW(p.panelW)}){sys ? ", in the box" : ""}
                </li>
                {sys && <li>Installed by a licensed electrician, usually with a permit</li>}
                <li>Generator fuel: about {n0(k.generator.gallons)} gal of gasoline</li>
                <li>Water: {n0(k.water.storeGallons)} gal stored, plus a filter and a source</li>
                <li>
                  Food: {n0(k.food.total)} calories
                  {compact ? "" : ` (${n0(k.supplies.staples[0].pounds)} lb rice, ${n0(k.supplies.staples[1].pounds)} lb beans and more)`}
                </li>
                <li>Stove: {n0(k.supplies.cooking.cylinders)} propane cylinders</li>
                {!compact && <li>Seeds for {n0(k.supplies.garden.rowFeet[0])} to {n0(k.supplies.garden.rowFeet[1])} ft of garden row</li>}
              </ul>
            ) : (
              <p className="mt-3 text-sm">No power station we track fits; see the builder.</p>
            )}
            {p && (
              <p className="mt-3 font-extrabold text-ink tabular-nums">
                {money(p.priceUsd)} <span className="text-xs font-normal text-muted">power items, prices checked {formatDate(dates[0])}</span>
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
        Example for {stateName}&apos;s December sun. Power items are the station or off-grid system, batteries and panels at the makers&apos; prices on the dates shown, before any installation;
        prices change often. Runs essentials, not central air, electric heat, an electric range or a dryer.
      </p>
    </div>
  );
}
