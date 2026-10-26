"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AffiliateDisclosure, PARTNER_REL, PartnerLink } from "@/components/affiliate";
import { AFFILIATES, partnerUrl } from "@/data/affiliates";
import { KITS_CHECKED, type Kit, type KitExtra } from "@/data/kits";
import {
  checkedLabel,
  configTotals,
  coverage,
  kitCartLink,
  matchKits,
  needKey,
  shoppingListText,
  type Coverage,
  type KitConfig,
  type KitNeed,
  type KitPick,
} from "@/lib/kits";
import { fmtKwh, fmtW } from "@/lib/offgrid";
import { money } from "@/lib/products";

const CHECKED = checkedLabel(KITS_CHECKED);
const brandName = (k: Kit) => AFFILIATES[k.brand].name;

type Extras = Record<string, { b: number; p: number }>;

/**
 * "Buy the kit you need": the calculator's result matched to up to three
 * ready-made kits, each one click from the brand's own cart with every item
 * in it. The reader can add allowed extras, copy a shopping list or print it.
 */
export default function KitPicker({ need, heading = "Kits you can buy for this", idPrefix }: { need: KitNeed; heading?: string; idPrefix: string }) {
  const match = matchKits(need);
  const key = needKey(need);
  // Choices reset when the calculator's answer changes.
  const [state, setState] = useState<{ key: string; selected: string | null; extras: Extras }>({ key, selected: null, extras: {} });
  const live = state.key === key ? state : { key, selected: null, extras: {} };
  const [copied, setCopied] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "0px 0px -80px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const configFor = (p: KitPick): KitConfig => {
    const x = live.extras[p.config.kit.id];
    return x ? { kit: p.config.kit, extraBatteries: x.b, extraPanels: x.p } : p.config;
  };
  const selectedId = live.selected && match.picks.some((p) => p.config.kit.id === live.selected) ? live.selected : (match.picks[0]?.config.kit.id ?? null);
  const selectedPick = match.picks.find((p) => p.config.kit.id === selectedId);
  const selected = selectedPick ? configFor(selectedPick) : null;
  const selectedTotals = selected ? configTotals(selected) : null;
  const selectedLink = selected ? kitCartLink(selected) : null;

  const select = (id: string) => setState({ ...live, selected: id });
  const setExtra = (p: KitPick, which: "b" | "p", value: number) => {
    const cur = configFor(p);
    const next = { b: cur.extraBatteries, p: cur.extraPanels, [which]: value };
    setState({ ...live, selected: p.config.kit.id, extras: { ...live.extras, [p.config.kit.id]: next } });
  };

  const copyList = async () => {
    if (!selected) return;
    const text = shoppingListText(selected, brandName(selected.kit), CHECKED);
    try {
      await navigator.clipboard.writeText(text);
      setCopied("Shopping list copied.");
    } catch {
      setCopied("Could not copy here. Use Print instead, or select the list and copy it.");
    }
  };
  const printList = () => {
    document.body.classList.add("print-kits");
    const done = () => {
      document.body.classList.remove("print-kits");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
  };

  if (match.picks.length === 0) return null;

  return (
    <section ref={sectionRef} aria-labelledby={`${idPrefix}-kits-h`} className="mt-8 pb-24 lg:pb-0 print:pb-0" data-testid="kit-picker" data-kit-print>
      <h3 id={`${idPrefix}-kits-h`} className="text-xl sm:text-2xl font-extrabold text-ink">{heading}</h3>
      <p className="text-sm text-stone-700 mt-1 max-w-3xl">
        Complete kits from each brand&apos;s own store: the power station, batteries and that brand&apos;s own panels. One button puts every item in
        the brand&apos;s cart; you review and check out on their site. Prices checked {CHECKED} and they change.
      </p>
      <AffiliateDisclosure className="mt-3 print:hidden" />

      {match.tooBig && <TooBig need={need} />}

      <ul className="mt-4 grid gap-4 lg:grid-cols-3" role="list">
        {match.picks.map((p, i) => {
          const c = configFor(p);
          const isSel = p.config.kit.id === selectedId;
          return (
            <KitCard
              key={p.config.kit.id}
              pick={p}
              config={c}
              need={need}
              recommended={i === 0 && !match.tooBig}
              selected={isSel}
              idPrefix={`${idPrefix}-${p.config.kit.id}`}
              onSelect={() => select(p.config.kit.id)}
              onExtra={(which, v) => setExtra(p, which, v)}
            />
          );
        })}
      </ul>

      {selected && selectedTotals && (
        <div className="mt-4 flex flex-wrap items-center gap-3 print:hidden">
          <button type="button" onClick={copyList} className="px-4 py-2 rounded-xl border border-black/15 bg-white text-sm font-semibold text-ink hover:border-spark-orange">
            Copy my shopping list
          </button>
          <button type="button" onClick={printList} className="px-4 py-2 rounded-xl border border-black/15 bg-white text-sm font-semibold text-ink hover:border-spark-orange">
            Print
          </button>
          <span className="text-sm text-stone-700" role="status" aria-live="polite">{copied}</span>
        </div>
      )}
      {selected && selectedLink && (
        <p className="hidden print:block text-xs mt-3 break-all">Add all items to the cart at {brandName(selected.kit)}: {selectedLink.href}</p>
      )}

      {selected && selectedTotals && selectedLink && inView && (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden print:hidden border-t border-black/10 bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]" data-testid="kit-sticky">
          <div className="flex items-center gap-3 max-w-5xl mx-auto">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-stone-700 truncate">{selected.kit.name}</p>
              <p className="text-lg font-extrabold text-ink tabular-nums">{money(selectedTotals.priceUsd)}</p>
            </div>
            <a
              href={selectedLink.href}
              target="_blank"
              rel={PARTNER_REL}
              data-partner={selected.kit.brand}
              data-tracked={selectedLink.tracked ? "1" : "0"}
              className="shrink-0 inline-flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white text-sm font-bold shadow"
            >
              Add to cart at {brandName(selected.kit)}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

function KitCard({
  pick,
  config,
  need,
  recommended,
  selected,
  idPrefix,
  onSelect,
  onExtra,
}: {
  pick: KitPick;
  config: KitConfig;
  need: KitNeed;
  recommended: boolean;
  selected: boolean;
  idPrefix: string;
  onSelect: () => void;
  onExtra: (which: "b" | "p", v: number) => void;
}) {
  const { kit } = config;
  const t = configTotals(config);
  const cov = coverage(config, need);
  const link = kitCartLink(config);
  const brand = brandName(kit);
  const short = pick.role === "short" || pick.role === "closest";
  return (
    <li
      className={`relative flex flex-col rounded-2xl border bg-white p-4 sm:p-5 ${selected ? "border-spark-orange ring-2 ring-spark-orange/40 shadow-md" : "border-black/10"} ${selected ? "" : "print:hidden"}`}
      data-testid="kit-card"
      data-kit={kit.id}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-xs font-bold uppercase tracking-wide ${short ? "text-stone-700" : "text-spark-amber"}`}>
          {recommended ? `Recommended · ${pick.label}` : pick.label}
        </span>
      </div>
      <h4 className="mt-1 text-lg font-extrabold text-ink leading-snug">{kit.name}</h4>
      <p className="text-sm text-stone-700">{kit.blurb}</p>

      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={`mt-3 self-start px-3 py-1.5 rounded-full border text-sm font-semibold print:hidden ${selected ? "bg-spark-orange text-white border-spark-orange" : "bg-white border-black/15 text-ink"}`}
      >
        {selected ? "Selected" : "Choose this kit"}
      </button>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-stone-700">What&apos;s in the cart</p>
      <ul className="mt-1 divide-y divide-black/8 text-sm">
        {t.items.map((i) => (
          <li key={i.variantId} className="py-2 flex gap-3">
            <span className="tabular-nums font-semibold text-ink shrink-0">{i.qty} ×</span>
            <a href={partnerUrl(kit.brand, { productUrl: i.url }).href} target="_blank" rel={PARTNER_REL} data-partner={kit.brand} className="flex-1 min-w-0 text-stone-800 underline decoration-black/20 underline-offset-2 hover:text-spark-orange break-words">
              {i.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <span className="tabular-nums text-stone-800 shrink-0">{money(i.unitPriceUsd * i.qty)}</span>
          </li>
        ))}
      </ul>

      {(kit.addBattery || kit.addPanel) && (
        <div className="mt-2 space-y-2 print:hidden">
          {kit.addBattery && (
            <Stepper id={`${idPrefix}-b`} label="Add a battery" extra={kit.addBattery} value={config.extraBatteries} onChange={(v) => onExtra("b", v)} />
          )}
          {kit.addPanel && (
            <Stepper id={`${idPrefix}-p`} label="Add an extra panel" extra={kit.addPanel} value={config.extraPanels} onChange={(v) => onExtra("p", v)} />
          )}
        </div>
      )}

      <Chips cov={cov} t={t} kit={kit} need={need} />

      <div className="mt-auto pt-4">
        <div className="flex items-baseline justify-between gap-3 border-t border-black/10 pt-3" aria-live="polite">
          <span className="text-sm text-stone-700">
            Total, {t.itemCount} {t.itemCount === 1 ? "item" : "items"}
          </span>
          <span className="text-2xl font-extrabold text-ink tabular-nums" data-testid="kit-total">{money(t.priceUsd)}</span>
        </div>
        <p className="text-xs text-stone-700 text-right">
          {fmtKwh(t.batteryWh)} battery · {t.panelW > 0 ? `${fmtW(t.panelW)} of panels` : "no panels"}
        </p>
        <a
          href={link.href}
          target="_blank"
          rel={PARTNER_REL}
          data-partner={kit.brand}
          data-tracked={link.tracked ? "1" : "0"}
          data-testid="kit-cart-link"
          onClick={onSelect}
          className="mt-3 flex w-full items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-gradient-to-r from-spark-yellow to-spark-orange text-white text-sm sm:text-base font-bold shadow hover:shadow-md transition-shadow text-center print:hidden"
        >
          Add this kit to your cart at {brand}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <p className="mt-2 text-xs text-stone-700">
          Opens {brand}&apos;s own cart with all {t.itemCount} items. You check out on their site. Prices checked {CHECKED}.
        </p>
        {kit.notes?.map((n) => (
          <p key={n} className="mt-1 text-xs text-muted">{n}</p>
        ))}
      </div>
    </li>
  );
}

function Stepper({ id, label, extra, value, onChange }: { id: string; label: string; extra: KitExtra; value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-xl bg-surface-light border border-black/8 px-3 py-2">
      <div className="flex items-center gap-3">
        <span className="flex-1 text-sm font-semibold text-ink" id={`${id}-l`}>{label}</span>
        <button
          type="button"
          aria-label={`Remove one: ${extra.label}`}
          disabled={value <= 0}
          onClick={() => onChange(value - 1)}
          className="h-9 w-9 rounded-full border border-black/20 bg-white text-lg font-bold text-ink disabled:opacity-40"
        >
          −
        </button>
        <output aria-labelledby={`${id}-l`} aria-live="polite" className="w-6 text-center tabular-nums font-bold">{value}</output>
        <button
          type="button"
          aria-label={`Add one: ${extra.label}`}
          disabled={value >= extra.max}
          onClick={() => onChange(value + 1)}
          className="h-9 w-9 rounded-full border border-black/20 bg-white text-lg font-bold text-ink disabled:opacity-40"
        >
          +
        </button>
      </div>
      <p className="text-xs text-stone-700 mt-1">
        {extra.label}, {money(extra.unitPriceUsd)} each. Up to {extra.max} ({extra.basis}).
      </p>
    </div>
  );
}

function Chip({ ok, children }: { ok: boolean | null; children: React.ReactNode }) {
  const cls = ok === true ? "bg-green-50 border-green-200 text-green-900" : ok === false ? "bg-amber-50 border-amber-300 text-amber-950" : "bg-white border-black/15 text-stone-800";
  return <li className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</li>;
}

function Chips({ cov, t, kit, need }: { cov: Coverage; t: ReturnType<typeof configTotals>; kit: Kit; need: KitNeed }) {
  return (
    <div className="mt-3">
      <ul className="flex flex-wrap gap-1.5" aria-label="How this kit covers what you need">
        <Chip ok={cov.coversBattery}>
          Battery: {cov.batteryDays != null ? `${cov.batteryDays.toFixed(1)} ${cov.batteryDays >= 0.95 && cov.batteryDays < 1.05 ? "day" : "days"} of your use` : fmtKwh(t.batteryWh)}
        </Chip>
        <Chip ok={cov.panelPct == null ? null : cov.panelPct >= 100}>
          {cov.panelPct == null ? `Panels: ${t.panelW > 0 ? `${fmtW(t.panelW)} included` : "none included"}` : `Panels: ${cov.panelPct}% of December need`}
        </Chip>
        <Chip ok={cov.runsAll}>
          {cov.runsAll == null ? `Output: ${fmtW(kit.acOutputW)}` : `Runs it all at once: ${cov.runsAll ? "yes" : "no"}`}
        </Chip>
        {kit.splitPhase && <Chip ok={null}>120/240 V</Chip>}
      </ul>
      {!cov.coversBattery && (
        <p className="mt-2 text-xs text-amber-950">
          Short by {fmtKwh(cov.batteryShortWh)} of the {fmtKwh(need.batteryWh)} battery you need.
        </p>
      )}
      {cov.runsAll === false && (
        <p className="mt-1 text-xs text-amber-950">
          Puts out {fmtW(kit.acOutputW)}; your list needs {fmtW(need.runningW)} if everything runs at once.
        </p>
      )}
      {cov.inputCapped && (
        <p className="mt-1 text-xs text-stone-700">
          This station takes at most {fmtW(kit.solarInputW)} of solar, so no number of panels reaches your {fmtW(need.panelW)} December need. Plan on a
          generator for dark spells.
        </p>
      )}
      {!cov.inputCapped && cov.panelPct != null && cov.panelPct < 100 && (
        <p className="mt-1 text-xs text-stone-700">In December the panels make about {cov.panelPct}% of a day&apos;s use; the battery covers the gap until it runs low.</p>
      )}
    </div>
  );
}

function TooBig({ need }: { need: KitNeed }) {
  return (
    <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5" data-testid="kit-too-big">
      <p className="font-extrabold text-ink">Too big for a plug-and-play kit</p>
      <p className="text-sm text-stone-800 mt-1">
        No kit we list holds {fmtKwh(need.batteryWh)}
        {need.runningW > 0 ? <> and puts out {fmtW(need.runningW)} at once</> : null}. The closest are below, with what they fall short by. A system this
        size is usually built from components: separate panels, a charge controller, an inverter and a battery bank, often installed by an electrician.
      </p>
      <p className="text-sm mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <PartnerLink brand="shopsolar">Component systems at Shop Solar Kits</PartnerLink>
        <Link href="/how-to-go-off-grid" className="underline underline-offset-2 text-spark-orange hover:text-spark-amber">How to go off grid, step by step</Link>
      </p>
    </div>
  );
}
