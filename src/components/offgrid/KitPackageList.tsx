import Link from "next/link";
import { PartnerLink } from "@/components/affiliate";
import { PRODUCTS } from "@/data/products";
import { formatDate } from "@/lib/energy";
import { KIT_BATTERY_DAYS, KIT_DAYS, type KitPackage } from "@/lib/offgrid-kit";
import { fmtKwh, fmtW, fmtWh } from "@/lib/offgrid";
import { money } from "@/lib/products";

const n0 = (n: number) => Math.round(n).toLocaleString("en-US");
const range = (a: number, b: number) => (a === b ? n0(a) : `${n0(a)} to ${n0(b)}`);
const n1 = (n: number) => (n >= 100 ? n0(n) : (Math.round(n * 10) / 10).toLocaleString("en-US"));

function Row({ title, children, price, testId }: { title: string; children: React.ReactNode; price?: React.ReactNode; testId?: string }) {
  return (
    <li className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4" data-testid={testId}>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">{title}</p>
        <div className="text-sm text-stone-800 mt-0.5">{children}</div>
      </div>
      {price != null && <div className="text-sm font-bold text-ink tabular-nums sm:text-right shrink-0">{price}</div>}
    </li>
  );
}

/** The full 90-day package: priced power items, generator fuel, water, food and the honest caveats. */
export default function KitPackageList({ k, stateName }: { k: KitPackage; stateName: string }) {
  const p = k.power;
  const sys = p?.system ?? null;
  const station = p && !sys ? PRODUCTS.find((x) => x.id === p.match.option.id)! : null;
  const g = k.generator;
  const s = k.supplies;
  const checked = (iso: string) => <span className="block text-xs text-muted font-normal">on the maker&apos;s site {formatDate(iso)}</span>;

  return (
    <div data-testid="kit-package">
      <ul className="divide-y divide-black/8 bg-white rounded-2xl border border-black/8">
        {p && sys ? (
          <>
            <Row
              title="Complete off-grid system"
              testId="kit-system"
              price={<>{money(sys.priceUsd)}{checked(sys.retrieved)}</>}
            >
              <PartnerLink brand={sys.brand} productId={sys.id} productUrl={sys.url}>
                {p.match.option.name}
              </PartnerLink>{" "}
              <span className="text-stone-700">({sys.variant})</span>
              <span className="block text-stone-700">
                {fmtKwh(sys.capacityWh)} of {sys.battery.chemistry === "LFP" ? "LiFePO4 " : ""}battery ({sys.battery.count} × {fmtKwh(sys.battery.moduleWh)}), a{" "}
                {sys.acOutputW.toLocaleString("en-US")} W inverter
                {sys.surgeW ? ` (${sys.surgeW.toLocaleString("en-US")} W peak)` : ""} at {sys.volts === "120/240V" ? "120/240 V split-phase" : "120 V"},
                and {sys.panel.count} × {sys.panel.watts} W panels ({fmtW(p.panelW)}) in the box: about {fmtWh(p.solarWhDay)} a day on an average
                December day in {stateName}.
              </span>
            </Row>
            {p.match.addOns > 0 && (
              <Row
                title="Extra batteries"
                testId="kit-addons"
                price={<>{p.match.addOns} × {money(sys.addOn.priceUsd ?? 0)}{checked(sys.retrieved)}</>}
              >
                <PartnerLink brand={sys.brand} productUrl={sys.addOn.url}>
                  {sys.addOn.model}
                </PartnerLink>
                <span className="block text-stone-700">
                  {p.match.addOns} more, for {fmtKwh(p.match.totalWh)} in all
                </span>
              </Row>
            )}
            <Row title="Installation" testId="kit-install">
              Not plug-and-play. The inverter is wired into your home&apos;s electrical panel, which is a job for a licensed electrician and
              usually needs a permit and inspection from your county building department. Get a quote before you buy; it is not in the total.
              See <Link href="/how-to-go-off-grid" className="underline">how to go off grid</Link> for permits and the{" "}
              <Link href="/home-backup/hookup-picker" className="underline">hookup picker</Link> for the ways a battery connects to a house.
            </Row>
          </>
        ) : p && station && p.panel ? (
          <>
            <Row
              title="Power station"
              testId="kit-station"
              price={<>{money(p.match.option.priceUsd)}{checked(station.retrieved)}</>}
            >
              <PartnerLink brand={station.brand} productId={station.id} productUrl={station.url}>
                {p.match.option.name}
              </PartnerLink>
              <span className="block text-stone-700">
                {fmtKwh(station.capacityWh)}, {station.acOutputW.toLocaleString("en-US")} W output, {station.volts === "120/240V" ? "120/240 V" : "120 V"}
              </span>
            </Row>
            {p.match.addOns > 0 && station.addOn && (
              <Row
                title="Expansion batteries"
                testId="kit-addons"
                price={<>{p.match.addOns} × {money(station.addOn.priceUsd ?? 0)}{checked(station.retrieved)}</>}
              >
                <PartnerLink brand={station.brand} productUrl={station.addOn.url}>
                  {station.addOn.model}
                </PartnerLink>
                <span className="block text-stone-700">
                  {p.match.addOns} × {fmtKwh(station.addOn.capacityWh)}, for {fmtKwh(p.match.totalWh)} in all
                </span>
              </Row>
            )}
            <Row title="Solar panels" testId="kit-panels" price={<>{p.panels} × {money(p.panel.priceUsd)}{checked(p.panel.retrieved)}</>}>
              <PartnerLink brand={p.panel.brand} productUrl={p.panel.url}>
                {p.panels} × {p.panel.model}
              </PartnerLink>
              <span className="block text-stone-700">
                {fmtW(p.panelW)} of panels, about {fmtWh(p.solarWhDay)} a day on an average December day in {stateName}
                {p.inputCapped ? `; the station takes no more than ${fmtW(p.match.option.solarInputW ?? 0)} of solar` : ""}
              </span>
            </Row>
          </>
        ) : (
          <Row title="Power" testId="kit-no-station">
            No power station we track fits these loads{k.well240 ? " with 240 V output" : ""}. Turn off the biggest load or see{" "}
            <Link href="/how-to-go-off-grid" className="underline">how to go off grid</Link> for a component system.
          </Row>
        )}
        <Row title="Backup generator and fuel" testId="kit-generator" price={<>{n1(g.gallons)} gal</>}>
          About <strong>{n0(g.hours)} hours</strong> of running over {KIT_DAYS} days: {n0(g.decemberHours)} to make up what the panels miss on
          ordinary December days{g.darkDays > 0 ? `, and ${n0(g.darkHours)} for ${g.darkDays} days of storms with no useful sun` : ""}. At{" "}
          {n1(g.tankGal)} gal for {n1(g.runtimeHours)} hours at {g.ratedW.toLocaleString("en-US")} W, that is about{" "}
          <strong>{n1(g.gallons)} gallons of gasoline</strong> ({g.tanks} tanks). Generator not included in the total.
        </Row>
        <Row title="Water" testId="kit-water" price={<>{n0(k.water.storeGallons)} gal stored</>}>
          Store <strong>{n0(k.water.storeGallons)} gallons</strong> ({k.water.storeDays} days, 1 gallon a person a day). For the other{" "}
          {k.water.treatDays} days ({n0(k.water.treatGallons)} gallons) you need a source, such as a well, rain barrel or nearby water, and a
          certified filter or purifier. Rainwater is not safe to drink untreated (CDC); check your state&apos;s rules before collecting it. To
          treat all of it with bleach instead takes about <strong>{n1(s.bleach.flOz)} fl oz</strong> of 6% unscented bleach, double for cloudy
          water. See <Link href="/best-emergency-water-filters" className="underline">emergency water filters</Link> and{" "}
          <Link href="/how-to-purify-water" className="underline">how to purify water</Link>.
        </Row>
        <Row title="Food" testId="kit-food" price={<>{n0(k.food.total)} cal</>}>
          About <strong>{n0(k.food.daily)} calories a day</strong> for {k.food.people} people, so {n0(k.food.total)} calories for {KIT_DAYS} days.
          As shelf-stable staples:
          <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 text-stone-800" data-testid="kit-staples">
            {s.staples.map((l) => (
              <li key={l.staple.id}>
                {l.staple.label}: <strong className="tabular-nums">{l.cans != null ? `${n0(l.cans)} cans` : `${n0(l.pounds)} lb`}</strong>
                {l.gallons != null ? ` (about ${n1(l.gallons)} gal)` : ""}
              </li>
            ))}
          </ul>
          <span className="block mt-1">
            Or the same calories in freeze-dried meals. Check your own household in the{" "}
            <Link href="/emergency-food-calculator" className="underline">emergency food calculator</Link>.
          </span>
        </Row>
        <Row title="Cooking fuel" testId="kit-cooking" price={<>{n0(s.cooking.cylinders)} cylinders</>}>
          A two-burner propane camp stove, <strong>outdoors only</strong>. At {n0(s.cooking.minutesPerDay)} minutes a day with both burners on
          high, that is <strong>{n0(s.cooking.cylinders)} one-pound cylinders</strong> (about {n0(s.cooking.pounds)} lb of propane, or{" "}
          {s.cooking.bulkTanks} × 20-lb tanks with an adapter hose).
        </Row>
        <Row title="Seeds and garden" testId="kit-garden" price={<>{range(s.garden.rowFeet[0], s.garden.rowFeet[1])} ft of row</>}>
          Seed for {k.food.people} people: {range(s.garden.rowFeet[0], s.garden.rowFeet[1])} feet of row plus squash hills and tomato plants. Most
          crops take 50 to 100 days, so a garden started on day 1 adds little inside {KIT_DAYS} days. It matters for going longer.
        </Row>
        <Row title="Medical, light and the rest">
          First aid, {KIT_DAYS} days of prescriptions (ask your doctor or pharmacist), a toilet without water, a NOAA Weather Radio, lights and
          batteries: all on the printable checklist below.
        </Row>
      </ul>
      {p && (
        <p className="mt-3 text-base font-extrabold text-ink" data-testid="kit-total">
          Power items total: <span className="tabular-nums">{money(p.priceUsd)}</span>
          <span className="block text-xs text-muted font-normal">
            {sys ? "System and batteries at the maker's price on the date shown, before installation." : "Station, batteries and panels at the makers' prices on the dates shown."} Water, food, fuel, seeds and the generator are listed as amounts,
            not prices.{" "}
            {p.short
              ? `${KIT_BATTERY_DAYS} days of your ${fmtWh(k.whPerDay)} a day needs ${fmtKwh(k.size.batteryWh)} of battery; the biggest station we track holds ${fmtKwh(p.match.totalWh)}, so the generator does more.`
              : `Battery: ${fmtKwh(p.match.totalWh)}, at least ${KIT_BATTERY_DAYS} days of your ${fmtWh(k.whPerDay)} a day.`}
          </span>
        </p>
      )}
    </div>
  );
}
