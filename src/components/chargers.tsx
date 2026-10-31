/**
 * Home EV charger recommendation and the "what does a home charger cost and
 * save?" explainer. Prices and specs come from src/data/chargers.ts; savings
 * from the same EIA/EPA figures as the charging calculator.
 */

import Link from "next/link";
import { Icon } from "@/components/icons";
import { PartnerLink } from "@/components/affiliate";
import { chargerById } from "@/data/chargers";
import { chargingFigures, formatDate, MONTHLY_MILES, referenceEv, usd, type StateEnergy, NATIONAL, nationalRateUsd, evCostPer100, gasCostPer100 } from "@/lib/energy";

/** Level 1: a typical 12-amp cord on an ordinary 120-volt outlet (1.44 kW). */
const LEVEL1_KW = 0.12 * 12;

/** Miles of range an hour at a charger's stated kW, for a typical EV (our arithmetic). */
export function milesPerHourAt(kw: number) {
  return kw / (referenceEv("typical").kwhPer100mi / 100);
}

/** Dollars a year saved on 12,000 miles for every 5 cents/kWh cheaper (off-peak) power. */
export function offPeakYearSaving(centsCheaper = 5) {
  return ((MONTHLY_MILES * 12 * referenceEv("typical").kwhPer100mi) / 100) * (centsCheaper / 100);
}

/** The Autel smart-charger alternative (with a hardwired 50 A version), shown under our pick. */
function SmartChargerPick({ compact = false }: { compact?: boolean }) {
  const a = chargerById("autel-elite-home-40a");
  const h = chargerById("autel-elite-home-50a");
  const l1Mph = LEVEL1_KW / (referenceEv("typical").kwhPer100mi / 100);
  return (
    <div className="mt-5 pt-5 border-t border-black/10">
      <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Also good: a smart charger with a 50-amp option · sponsored link</p>
      <h3 className="text-lg font-extrabold text-ink mt-1">Autel {a.name}</h3>
      <p className="text-stone-700 mt-1">
        {usd(a.priceUsd)} when we checked {formatDate(a.retrieved)}. Adds about {Math.round(milesPerHourAt(a.maxKw!))} miles of range an
        hour, roughly {Math.round(milesPerHourAt(a.maxKw!) / l1Mph)}x a wall-outlet cord. Its phone app schedules charging for your
        utility&apos;s cheaper overnight hours: on a time-of-use plan, every 5 cents a kWh off saves about{" "}
        {usd(offPeakYearSaving())} a year over 12,000 miles. {a.warrantyYears}-year warranty, 25-foot cable.
        {compact ? "" : ` The hardwired 50-amp version (${usd(h.priceUsd)}) charges about a quarter faster for cars that can take it.`}
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <PartnerLink brand={a.brand} productId={a.id} productUrl={a.url} className="btn btn-outline btn-sm" disclose>
          Check price: Autel 40A plug-in ({usd(a.priceUsd)})
        </PartnerLink>
        {!compact && (
          <PartnerLink brand={h.brand} productId={h.id} productUrl={h.url} className="btn btn-outline btn-sm" disclose>
            50A hardwired ({usd(h.priceUsd)})
          </PartnerLink>
        )}
      </div>
    </div>
  );
}

export function ChargerPick({ compact = false }: { compact?: boolean }) {
  // The lowest-priced charger we found, J1772 with app scheduling; for Teslas, the
  // lowest-priced NACS charger (Lectron). Ranked by price and spec, see /best-home-ev-charger.
  const j = chargerById("eviqo-l2-j1772");
  const n = chargerById("lectron-nexus-nacs");
  return (
    <article className="rounded-3xl bg-white border border-black/10 shadow-sm p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="shrink-0 rounded-2xl bg-amber-100 text-spark-orange p-3" aria-hidden="true">
          <Icon name="plug" size={32} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Our pick for a home charger · sponsored link</p>
          <h3 className="text-xl font-extrabold text-ink mt-1">EVIQO Level 2 (J1772)</h3>
          <p className="text-stone-700 mt-1">
            Adds up to {j.milesPerHour} miles of range an hour (EVIQO&apos;s figure), so you wake up full every morning. It plugs into a
            240-volt outlet (the RV or range kind, NEMA 14-50) or can be hardwired for {j.hardwiredAmps} amps, is weatherproof for the
            driveway, has a {j.cableFt}-foot cable and an app that schedules charging for cheaper overnight hours, and a{" "}
            {j.warrantyYears}-year warranty.
            {compact ? "" : ` For a Tesla, the Lectron NEXUS NACS (${usd(n.priceUsd, 2)}) is the lower-priced Tesla-plug pick.`}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="text-2xl font-extrabold text-ink tabular-nums">
              {usd(j.priceUsd)}
              <span className="text-xs font-normal text-muted ml-1">
                list <s>{usd(j.listPriceUsd!)}</s>, when we checked {formatDate(j.retrieved)}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <PartnerLink brand={j.brand} productId={j.id} productUrl={j.url} className="btn btn-primary btn-sm" disclose>
              Check price: most EVs (J1772)
            </PartnerLink>
            <PartnerLink brand={n.brand} productId={n.id} productUrl={n.url} className="btn btn-outline btn-sm" disclose>
              Tesla / NACS: Lectron NEXUS
            </PartnerLink>
            <Link href="/ev-charger-picker" className="font-semibold text-spark-orange underline underline-offset-2">
              Not sure which? 1-minute charger picker
            </Link>
            {compact && (
              <Link href="/ev-charging-cost#home-charger" className="font-semibold text-spark-orange underline underline-offset-2">
                Do I need one?
              </Link>
            )}
          </div>
        </div>
      </div>
      <SmartChargerPick compact={compact} />
    </article>
  );
}

/** "What does a home charger cost and save?" in dollars. */
export function HomeChargerGuide({ state }: { state?: StateEnergy }) {
  const typical = referenceEv("typical");
  const portable = chargerById("lectron-portable-nacs");
  const j = chargerById("eviqo-l2-j1772");
  const autel = chargerById("autel-elite-home-40a");
  const rate = state ? state.electricity.residentialCentsPerKwhYtd / 100 : nationalRateUsd();
  const gas = state ? state.gasoline.usdPerGallon : NATIONAL.gasolineUsdPerGallon;
  const fig = state ? chargingFigures(state) : null;
  const yearSaving = fig ? fig.savingMonthly * 12 : ((gasCostPer100(gas) - evCostPer100(rate, typical.kwhPer100mi)) * MONTHLY_MILES * 12) / 100;
  const l1Mph = LEVEL1_KW / (typical.kwhPer100mi / 100);
  const where = state ? ` in ${state.name}` : "";
  return (
    <section id="home-charger" className="mt-12 scroll-mt-24" aria-labelledby="home-charger-heading">
      <h2 id="home-charger-heading" className="text-2xl sm:text-3xl font-extrabold text-ink">What does a home charger cost, and what does it save?</h2>
      <div className="grid md:grid-cols-3 gap-3 mt-5">
        <div className="rounded-2xl bg-white border border-black/8 p-5">
          <p className="text-3xl font-extrabold text-ink">{usd(j.priceUsd)}</p>
          <p className="font-semibold text-ink mt-1">For the charger</p>
          <p className="text-sm text-muted mt-1">Our pick, at EVIQO&apos;s price. Add an electrician if you don&apos;t already have a 240-volt outlet where you park.</p>
        </div>
        <div className="rounded-2xl bg-white border border-black/8 p-5">
          <p className="text-3xl font-extrabold text-leaf">{usd(yearSaving)}/yr</p>
          <p className="font-semibold text-ink mt-1">Saved vs gas{where}</p>
          <p className="text-sm text-muted mt-1">
            Charging a {typical.make} {typical.model} at home for 12,000 miles, against a 25.5 mpg car. Home charging is what unlocks it.
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-black/8 p-5">
          <p className="text-3xl font-extrabold text-ink">{Math.round(j.milesPerHour! / l1Mph)}x faster</p>
          <p className="font-semibold text-ink mt-1">Than a wall-outlet cord</p>
          <p className="text-sm text-muted mt-1">
            About {Math.round(l1Mph)} miles of range an hour from an ordinary outlet vs up to {j.milesPerHour} with a 40-amp charger.
          </p>
        </div>
      </div>
      <div className="mt-5 text-stone-700 leading-relaxed space-y-3 max-w-3xl">
        <p>
          <strong>Do you need one?</strong> Not always. If you drive under about 40 miles a day, the cord that comes with many EVs
          on an ordinary outlet adds roughly {Math.round(l1Mph * 10)} miles overnight (10 hours), which can be enough. A 240-volt
          charger refills even a long day&apos;s driving overnight, so you never think about it.
        </p>
        <p>
          <strong>Want it to charge when power is cheapest?</strong> Many utilities sell power for less overnight on a
          time-of-use or EV plan. A smart charger such as EVIQO&apos;s ({usd(j.priceUsd)}) or Autel&apos;s ({usd(autel.priceUsd)}), both
          when we checked, lets you set the hours in an app, so the car only fills up at the low price. Every 5 cents a kWh off is worth about{" "}
          {usd(offPeakYearSaving())} a year on 12,000 miles.
        </p>
        <p>
          <strong>Renting or not ready to wire?</strong> Lectron&apos;s portable charger ({usd(portable.priceUsd, 2)} when we checked)
          works on an ordinary outlet and on a 240-volt one, and moves with you.
        </p>
      </div>
      <div className="mt-5">
        <ChargerPick />
      </div>
      <p className="text-xs text-muted mt-2">
        Prices and specs from EVIQO&apos;s and Lectron&apos;s US sites on {formatDate(j.retrieved)} and Autel&apos;s US store on{" "}
        {formatDate(autel.retrieved)}. EVIQO&apos;s and Lectron&apos;s miles per hour are their own figures; Autel&apos;s is our arithmetic from its stated
        kW. The time-of-use saving is arithmetic, not a quote from any utility. The ordinary-outlet figure assumes a 12-amp cord and a {typical.kwhPer100mi} kWh/100 mi EV (EPA). Sponsored links: we earn a
        commission if you buy.
      </p>
    </section>
  );
}
