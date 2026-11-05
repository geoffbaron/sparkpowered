import { PartnerLink } from "@/components/affiliate";
import { PlainLink } from "@/components/guide-ui";
import { AFFILIATES } from "@/data/affiliates";
import { EBIKES_CHECKED, type Ebike, type EbikeAlternative } from "@/data/ebikes";
import { formatDate } from "@/lib/energy";
import { money } from "@/lib/products";

const NS = "not stated";
const n = (v: number | null | undefined, unit: string) => (v == null ? NS : `${v.toLocaleString("en-US")} ${unit}`);

/** Brand name + model, without repeating the brand when the model already starts with it. */
export function ebikeName(b: Ebike) {
  const brand = AFFILIATES[b.brand].name;
  return b.model.toLowerCase().startsWith(brand.toLowerCase()) ? b.model.replace(/ eBike$/i, "") : `${brand} ${b.model.replace(/ eBike$/i, "")}`;
}

export function motorLabel(b: Ebike) {
  if (b.motorW == null) return NS;
  return `${b.motorW.toLocaleString("en-US")} W${b.peakW ? ` (${b.peakW.toLocaleString("en-US")} W peak)` : ""}`;
}

/** Stated Wh, or volts x amp-hours when the maker gives only those. */
export function batteryLabel(b: Ebike) {
  if (b.batteryWh != null) return `${b.batteryWh.toLocaleString("en-US")} Wh`;
  if (b.batteryV != null && b.batteryAh != null) return `${b.batteryV} V ${b.batteryAh} Ah (${(b.batteryV * b.batteryAh).toLocaleString("en-US")} Wh)`;
  return NS;
}

export type EbikeColumn = "price" | "motor" | "torque" | "sensor" | "battery" | "range" | "weight" | "payload" | "folded";

const COLS: Record<EbikeColumn, { head: string; cell: (b: Ebike) => React.ReactNode; right?: boolean }> = {
  price: {
    head: "Price",
    cell: (b) => (b.saleEndsLabel ? <>{money(b.price)}<span className="block text-xs text-slate-500">sale through {b.saleEndsLabel}</span></> : money(b.price)),
    right: true,
  },
  motor: { head: "Motor", cell: motorLabel },
  torque: { head: "Torque", cell: (b) => n(b.torqueNm, "Nm") },
  sensor: { head: "Pedal sensor", cell: (b) => b.paSensor ?? NS },
  battery: { head: "Battery", cell: batteryLabel },
  range: { head: "Maker's range", cell: (b) => (b.rangeMiles ? `${b.rangeMiles} mi` : NS) },
  weight: { head: "Bike weight", cell: (b) => n(b.weightLb, "lb"), right: true },
  payload: { head: "Max load", cell: (b) => n(b.payloadLb, "lb"), right: true },
  folded: { head: "Folded size", cell: (b) => b.foldedDims ?? NS },
};

/** Side-by-side stated specs. Every cell is the maker's own figure on EBIKES_CHECKED. */
export function EbikeTable({ bikes, columns, caption }: { bikes: Ebike[]; columns: EbikeColumn[]; caption: string }) {
  return (
    <>
      <div className="relative overflow-x-auto rounded-xl border border-black/8 bg-surface">
        <table className="w-full text-sm min-w-[40rem]">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface-light text-left">
            <tr>
              <th scope="col" className="p-3 font-semibold">Bike</th>
              {columns.map((c) => (
                <th key={c} scope="col" className={`p-3 font-semibold ${COLS[c].right ? "text-right" : ""}`}>{COLS[c].head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bikes.map((b) => (
              <tr key={b.id} className="border-t border-black/6 align-top">
                <th scope="row" className="p-3 font-medium">
                  <PartnerLink brand={b.brand} productUrl={b.url}>{ebikeName(b)}</PartnerLink>
                </th>
                {columns.map((c) => (
                  <td key={c} className={`p-3 ${COLS[c].right ? "text-right tabular-nums" : ""}`}>{COLS[c].cell(b)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted mt-2 max-w-3xl">
        Specs and prices from each maker&apos;s US website on {formatDate(EBIKES_CHECKED)}. Range is the maker&apos;s own claim, usually at the
        lowest assist level with a light rider on flat ground. Max load is rider plus cargo. We have not ridden these bikes.
      </p>
    </>
  );
}

/** "When another bike is the better pick": a non-partner model, plain link, honest reason. */
export function EbikeAlternativeNote({ alt }: { alt: EbikeAlternative }) {
  return (
    <aside className="rounded-xl border border-black/10 bg-surface-light p-5" data-testid="ebike-alternative">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">When a bike we don&apos;t earn on is the better pick</p>
      <p className="font-semibold text-ink mt-1">
        <PlainLink href={alt.url}>{alt.brand} {alt.model}</PlainLink>, {money(alt.price)}
      </p>
      <p className="text-sm text-stone-700 mt-1">{alt.whenBetter}</p>
      <p className="text-xs text-muted mt-2">Maker&apos;s specs: {alt.keySpec}. Checked {formatDate(EBIKES_CHECKED)}.</p>
    </aside>
  );
}

export function ebikeSources(bikes: Ebike[], alts: EbikeAlternative[] = []) {
  return [
    ...bikes.map((b) => ({ name: `${ebikeName(b)} product page`, url: b.url, detail: `checked ${formatDate(EBIKES_CHECKED)}` })),
    ...alts.map((a) => ({ name: `${a.brand} ${a.model} product page`, url: a.url, detail: `checked ${formatDate(EBIKES_CHECKED)}` })),
  ];
}
