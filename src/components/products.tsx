/**
 * Product tables, cards and structured data for the buying guides. Specs come
 * only from src/data/products.ts; nothing here invents or rounds a figure
 * beyond formatting.
 */

import { PartnerLink } from "@/components/affiliate";
import { formatDate } from "@/lib/energy";
import { JsonLd, url } from "@/lib/seo";
import { brandName, fullName, kwh, maxWh, money, perKwh, watts } from "@/lib/products";
import type { Product } from "@/data/products";

const dash = <span className="text-muted">—</span>;

export function PriceCell({ p }: { p: Product }) {
  if (p.priceUsd == null) return <span className="text-muted">{p.priceNote ?? "Quote only"}</span>;
  return (
    <span className="whitespace-nowrap">
      <strong>{money(p.priceUsd)}</strong>
      {p.listPriceUsd && p.listPriceUsd > p.priceUsd && (
        <span className="block text-xs text-muted">
          list <s>{money(p.listPriceUsd)}</s>
        </span>
      )}
    </span>
  );
}

/** Wide spec table for power stations and home batteries. Scrolls sideways on phones. */
export function SpecTable({ products, caption }: { products: Product[]; caption: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
      <table className="w-full text-sm min-w-[56rem]">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-light text-left">
          <tr>
            <th scope="col" className="p-3 font-semibold sticky left-0 bg-surface-light">Model</th>
            <th scope="col" className="p-3 font-semibold text-right">Capacity</th>
            <th scope="col" className="p-3 font-semibold text-right">AC output</th>
            <th scope="col" className="p-3 font-semibold">Chemistry</th>
            <th scope="col" className="p-3 font-semibold text-right">Rated cycles</th>
            <th scope="col" className="p-3 font-semibold text-right">Weight</th>
            <th scope="col" className="p-3 font-semibold text-right">Expands to</th>
            <th scope="col" className="p-3 font-semibold text-right">Solar input</th>
            <th scope="col" className="p-3 font-semibold text-right">Warranty</th>
            <th scope="col" className="p-3 font-semibold text-right">Price*</th>
            <th scope="col" className="p-3 font-semibold text-right">$/kWh</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const ppk = perKwh(p);
            return (
              <tr key={p.id} className="border-t border-black/6 align-top">
                <th scope="row" className="p-3 font-medium sticky left-0 bg-surface">
                  <PartnerLink brand={p.brand} productId={p.id} productUrl={p.url} category="battery">
                    {fullName(p)}
                  </PartnerLink>
                </th>
                <td className="p-3 text-right tabular-nums">{kwh(p.capacityWh)}</td>
                <td className="p-3 text-right tabular-nums">{watts(p.acOutputW)}</td>
                <td className="p-3">{p.chemistry ?? dash}</td>
                <td className="p-3 text-right tabular-nums">{p.cycles ? p.cycles.toLocaleString("en-US") : dash}</td>
                <td className="p-3 text-right tabular-nums">{p.weightLb ? `${p.weightLb} lb` : dash}</td>
                <td className="p-3 text-right tabular-nums">{p.maxCapacityWh ? kwh(p.maxCapacityWh) : p.notExpandable ? "No" : dash}</td>
                <td className="p-3 text-right tabular-nums">{p.solarInputW ? watts(p.solarInputW) : dash}</td>
                <td className="p-3 text-right tabular-nums">{p.warrantyYears ? `${p.warrantyYears} yr` : dash}</td>
                <td className="p-3 text-right tabular-nums"><PriceCell p={p} /></td>
                <td className="p-3 text-right tabular-nums">{ppk ? money(Math.round(ppk)) : dash}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SpecList({ p }: { p: Product }) {
  const rows: [string, React.ReactNode][] = [
    ["Capacity", kwh(p.capacityWh)],
    ["Continuous AC output", watts(p.acOutputW)],
    ["Surge", p.surgeW ? watts(p.surgeW) : "Not stated"],
    ["Battery chemistry", p.chemistry === "LFP" ? "LFP (lithium iron phosphate)" : p.chemistry === "NMC" ? "NMC (nickel manganese cobalt)" : "Not stated"],
    ["Rated cycles", p.cycles ? `${p.cycles.toLocaleString("en-US")}${p.cyclesTo ? ` to ${p.cyclesTo}% capacity` : ""}` : "Not stated"],
    ["Weight", p.weightLb ? `${p.weightLb} lb` : "Not stated"],
    ["Expandable", p.maxCapacityWh ? `Yes, to ${kwh(p.maxCapacityWh)}${p.expansion ? ` (${p.expansion})` : ""}` : p.notExpandable ? "No" : "Not stated"],
    ["Max solar input", p.solarInputW ? watts(p.solarInputW) : "None"],
    ["Voltage", p.volts],
    ["Installation", p.install === "diy" ? "Plug in yourself" : "Professional installation"],
    ["Warranty", p.warrantyYears ? `${p.warrantyYears} years` : "Not stated"],
  ];
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A "best for" pick: why, key specs, price and the outbound link. */
export function PickCard({ p, label, why }: { p: Product; label: string; why: string }) {
  return (
    <article className="bg-surface rounded-2xl border border-black/8 p-5 sm:p-6 shadow-sm" id={`pick-${p.id}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-spark-amber mb-1">{label}</p>
      <h3 className="text-xl font-bold mb-2">{fullName(p)}</h3>
      <p className="text-stone-700 leading-relaxed mb-4">{why}</p>
      <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-end">
        <SpecList p={p} />
        <div className="sm:text-right">
          <div className="text-sm text-muted">Price on {brandSite(p)}*</div>
          <div className="text-2xl font-extrabold mb-2"><PriceCell p={p} /></div>
          <PartnerLink brand={p.brand} productId={p.id} productUrl={p.url} category="battery" variant="button">
            Check price at {brandSite(p)}
          </PartnerLink>
        </div>
      </div>
    </article>
  );
}

function brandSite(p: Product) {
  return brandName(p).split(" ")[0];
}

export function PriceFootnote({ products }: { products: Product[] }) {
  const dates = [...new Set(products.map((p) => p.retrieved))].sort();
  return (
    <p className="text-xs text-muted mt-3 max-w-3xl">
      *Prices and specifications are from each manufacturer&apos;s US website, checked{" "}
      {dates.map((d, i) => (
        <span key={d}>
          {i > 0 ? ", " : ""}
          <time dateTime={d}>{formatDate(d)}</time>
        </span>
      ))}
      . Prices change often, sometimes daily during sales; the seller&apos;s page is the final word. Cycle ratings
      are the maker&apos;s own figures, measured to different end points, so treat them as rough guides.
    </p>
  );
}

/** ItemList of Product entities with Offers. No ratings or reviews: we have none to give. */
export function ProductListJsonLd({ products, path, name }: { products: Product[]; path: string; name: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        "@id": `${url(path)}#products`,
        name,
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: productJson(p),
        })),
      }}
    />
  );
}

export function productJson(p: Product) {
  return {
    "@type": "Product",
    name: fullName(p),
    brand: { "@type": "Brand", name: brandName(p) },
    model: p.model,
    url: p.url,
    category: p.category === "home" ? "Home battery" : "Portable power station",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Capacity", value: p.capacityWh, unitCode: "WHR" },
      { "@type": "PropertyValue", name: "Continuous AC output", value: p.acOutputW, unitCode: "WTT" },
      ...(p.chemistry ? [{ "@type": "PropertyValue", name: "Battery chemistry", value: p.chemistry }] : []),
      ...(p.maxCapacityWh ? [{ "@type": "PropertyValue", name: "Maximum expanded capacity", value: maxWh(p), unitCode: "WHR" }] : []),
    ],
    ...(p.priceUsd != null
      ? {
          offers: {
            "@type": "Offer",
            price: p.priceUsd,
            priceCurrency: "USD",
            url: p.url,
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: brandName(p) },
          },
        }
      : {}),
  };
}
