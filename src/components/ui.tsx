/**
 * Shared consumer-facing building blocks: photos, benefit cards, "our pick"
 * product cards, myth callouts and the big call-to-action band.
 */

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { PartnerLink } from "@/components/affiliate";
import { Breadcrumbs, type Crumb } from "@/components/content";
import { IMAGES, type ImageKey } from "@/data/images";
import type { MythLite } from "@/data/myths";
import type { BrandId } from "@/data/affiliates";

export function Photo({
  name,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  quality = 65,
}: {
  name: ImageKey;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: 55 | 65 | 75;
}) {
  const img = IMAGES[name];
  if (!img) return null;
  return (
    <Image
      src={img.src}
      width={img.width}
      height={img.height}
      alt={img.alt}
      sizes={sizes}
      quality={quality}
      preload={priority}
      fetchPriority={priority ? "high" : undefined}
      className={className}
    />
  );
}

/** "Our pick for X" recommendation with a strong check-price button. */
export function OurPick({
  label,
  name,
  why,
  life,
  priceUsd,
  priceNote,
  brand,
  productId,
  productUrl,
  category,
  icon = "battery",
  cta = "Check price",
  moreHref,
  moreLabel,
}: {
  label: string;
  name: string;
  why: string;
  /** Everyday outcomes, e.g. ["Fridge: about 18 hours", "CPAP: 5 nights"]. */
  life?: string[];
  priceUsd?: number | null;
  priceNote?: string;
  brand: BrandId;
  productId?: string;
  productUrl: string;
  category: "battery" | "solar" | "home";
  icon?: string;
  cta?: string;
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <article className="rounded-3xl bg-white border border-black/10 shadow-sm overflow-hidden grid sm:grid-cols-[10rem_1fr]">
      <div className="bg-gradient-to-br from-amber-100 via-orange-50 to-sky-100 flex items-center justify-center p-6 text-spark-orange" aria-hidden="true">
        <Icon name={icon} size={72} />
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">{label}</p>
        <h3 className="text-xl font-extrabold text-ink mt-1">{name}</h3>
        <p className="text-stone-700 mt-2 leading-relaxed">{why}</p>
        {life && life.length > 0 && (
          <ul className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {life.map((l) => (
              <li key={l} className="flex items-center gap-2 text-stone-800">
                <span className="text-leaf"><Icon name="check" size={18} /></span>
                {l}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
          {priceUsd != null ? (
            <span className="text-2xl font-extrabold text-ink tabular-nums">
              ${priceUsd.toLocaleString("en-US", { maximumFractionDigits: priceUsd % 1 ? 2 : 0, minimumFractionDigits: priceUsd % 1 ? 2 : 0 })}
              <span className="text-xs font-normal text-muted ml-1">when we checked*</span>
            </span>
          ) : (
            priceNote && <span className="text-sm text-muted">{priceNote}</span>
          )}
          <PartnerLink brand={brand} productId={productId} productUrl={productUrl} category={category} className="btn btn-primary">
            {cta}
          </PartnerLink>
          {moreHref && (
            <Link href={moreHref} className="font-semibold text-spark-orange underline underline-offset-2">
              {moreLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/** Answers a doubt right where it comes up. */
export function MythCallout({ m, className = "" }: { m: MythLite; className?: string }) {
  return (
    <aside className={`rounded-2xl border-l-4 border-amber-400 bg-amber-50 px-5 py-4 ${className}`} aria-label="Common myth">
      <p className="font-extrabold text-ink flex items-start gap-2">
        <span className="text-spark-orange shrink-0 mt-0.5"><Icon name="question" size={20} /></span>
        &ldquo;{m.myth}&rdquo;
      </p>
      <p className="text-stone-700 mt-1 pl-7">
        {m.short}{" "}
        <Link href={`/myths#${m.id}`} className="text-spark-orange font-semibold underline underline-offset-2 whitespace-nowrap">
          See the facts
        </Link>
      </p>
    </aside>
  );
}

export function MythStrip({ myths, heading = "But wait, isn't it true that..." }: { myths: MythLite[]; heading?: string }) {
  return (
    <section className="mt-12" aria-labelledby="myth-strip">
      <h2 id="myth-strip" className="text-2xl font-extrabold text-ink mb-4">{heading}</h2>
      <div className="grid gap-3">
        {myths.map((m) => (
          <MythCallout key={m.id} m={m} />
        ))}
      </div>
    </section>
  );
}

/** A big dollar number with a label, for "the proof" rows. */
export function BigStat({ value, label, note, tone = "ink" }: { value: string; label: string; note?: string; tone?: "ink" | "leaf" | "orange" }) {
  const color = tone === "leaf" ? "text-leaf" : tone === "orange" ? "text-spark-orange" : "text-ink";
  return (
    <div className="rounded-2xl bg-white border border-black/8 p-5">
      <p className={`text-3xl sm:text-4xl font-extrabold tabular-nums ${color}`}>{value}</p>
      <p className="font-semibold text-ink mt-1">{label}</p>
      {note && <p className="text-xs text-muted mt-1">{note}</p>}
    </div>
  );
}

/** Two horizontal bars: what you pay now vs after the switch. */
export function BeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
  unit = "/mo",
}: {
  before: number;
  after: number;
  beforeLabel: string;
  afterLabel: string;
  unit?: string;
}) {
  const max = Math.max(before, after, 1);
  const rows = [
    { label: beforeLabel, v: before, cls: "bg-stone-400" },
    { label: afterLabel, v: after, cls: "bg-leaf" },
  ];
  return (
    <div className="space-y-3" role="img" aria-label={`${beforeLabel}: $${Math.round(before)}${unit}. ${afterLabel}: $${Math.round(after)}${unit}.`}>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-stone-700">{r.label}</span>
            <span className="font-extrabold tabular-nums text-ink">${Math.round(r.v).toLocaleString("en-US")}{unit}</span>
          </div>
          <div className="h-5 rounded-full bg-stone-100">
            <div className={`h-5 rounded-full ${r.cls}`} style={{ width: `${Math.max(3, (r.v / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Photo hero used by the hub pages: payoff headline, subhead, CTAs. */
export function HubHero({
  image,
  eyebrow,
  title,
  sub,
  crumbs,
  children,
}: {
  crumbs?: Crumb[];
  image: ImageKey;
  eyebrow: string;
  title: React.ReactNode;
  sub: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <Photo name={image} priority className="absolute inset-0 -z-10 h-full w-full object-cover" sizes="100vw" />
      <div className="absolute inset-0 -z-10 hero-shade" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pb-16">
        {crumbs && <Breadcrumbs items={crumbs} tone="dark" />}
        <p className="text-amber-300 font-bold uppercase tracking-wide text-sm">{eyebrow}</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] mt-2 max-w-3xl">{title}</h1>
        <div className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">{sub}</div>
        {children && <div className="mt-6 flex flex-wrap gap-3 items-center">{children}</div>}
      </div>
    </section>
  );
}

/** Photo credit line for pages that use a photo. */
export function PhotoCredit({ name }: { name: ImageKey }) {
  const img = IMAGES[name];
  if (!img) return null;
  return (
    <p className="text-xs text-muted mt-6">
      Photo:{" "}
      <a href={img.pageUrl} rel="noopener" className="underline underline-offset-2">
        {img.credit}
      </a>{" "}
      ({img.license}).
    </p>
  );
}
