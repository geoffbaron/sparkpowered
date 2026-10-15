import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchAllNews } from "@/lib/rss";
import NewsClient from "@/components/NewsClient";
import StatePicker from "@/components/StatePicker";
import { Icon } from "@/components/icons";
import { AffiliateDisclosure } from "@/components/affiliate";
import { BeforeAfter, MythCallout, OurPick, Photo } from "@/components/ui";
import { lite } from "@/data/myths";
import { PLUGIN_KITS } from "@/data/products";
import type { ImageKey } from "@/data/images";
import { JsonLd, pageMetadata, url } from "@/lib/seo";
import { DATA_UPDATED, NATIONAL, STATES, formatDate, nationalRateUsd, referenceEv, usd } from "@/lib/energy";
import { lifeSummary } from "@/lib/everyday";
import { PLANNER_STATES, TYPICAL_TOTALS, typicalPlan } from "@/lib/planner-data";
import { fullName, productById } from "@/lib/products";
import { GAS_CARS, homeFigures, MMBTU_PER_MCF } from "@/lib/go-electric";

const TITLE = "Go Electric and Save: EV, Solar & Battery Savings by State";
const DESCRIPTION =
  "See what going electric saves you: an EV instead of gas, rooftop or plug-in solar, backup power and heat pumps, with real numbers for your state from EIA and EPA data.";

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/" }),
  title: { absolute: `${TITLE} | Spark Powered` },
};

async function LatestHeadlines() {
  const news = await fetchAllNews(6);
  if (news.length === 0) return <p className="text-sm text-stone-600">Headlines are unavailable right now.</p>;
  return <NewsClient news={news} compact />;
}

export default function HomePage() {
  const typical = referenceEv("typical");
  const avgCar = GAS_CARS.find((c) => c.key === "average")!;
  const eGallon = (typical.kwhPer100mi / 100) * nationalRateUsd() * avgCar.mpg;
  const outage = productById("ecoflow-delta-3-max");
  const life = lifeSummary(outage.capacityWh);
  const cheapestKit = [...PLUGIN_KITS].sort((a, b) => a.priceUsd - b.priceUsd)[0];
  const states = [...STATES].sort((a, b) => a.name.localeCompare(b.name));

  // Worked example: the state whose typical-household saving is the national median.
  const ranked = Object.entries(TYPICAL_TOTALS).sort((a, b) => a[1] - b[1]);
  const medianAbbr = ranked[Math.floor(ranked.length / 2)][0];
  const ex = typicalPlan(medianAbbr);
  const h = homeFigures(medianAbbr);
  const gasMonth = ((h.gasSpaceHeatMmbtu + h.gasWaterHeatMmbtu + h.gasCookingMmbtu) * (h.gasUsdPerMcf / MMBTU_PER_MCF)) / 12;
  const gasolineMonth = (((230 * 52) / avgCar.mpg) * ex.st.gasolineUsd) / 12;
  const before = ex.st.avgMonthlyBillUsd + gasMonth + gasolineMonth;
  const after = before - ex.total / 12;
  const evRow = ex.all.find((x) => x.id === "ev")!;
  const solarRow = ex.all.find((x) => x.id === "solar")!;

  const SWITCHES: { href: string; image: ImageKey; icon: string; title: string; payoff: string; cta: string }[] = [
    { href: "/ev-charging-cost", image: "ev", icon: "car", title: "Drive electric", payoff: `Charging at home is like paying ${usd(eGallon, 2)} a gallon. No more gas station stops.`, cta: "See your charging cost" },
    { href: "/solar-calculator", image: "solar-roof", icon: "sun", title: "Rooftop solar", payoff: "Make your own power for 25+ years and stop riding every rate hike.", cta: "See what you'd save" },
    { href: "/plug-in-solar", image: "plugin-solar", icon: "plug", title: "Plug-in solar", payoff: `Kits start around ${usd(cheapestKit.priceUsd)}. Plugs into an outlet. Great for renters.`, cta: "Is it legal where you live?" },
    { href: "/best-portable-power-stations", image: "power-station", icon: "battery", title: "Backup power", payoff: `Keep the fridge, Wi-Fi and lights on for ${life.essentials} when the grid goes down.`, cta: "Find the right battery" },
    { href: "/home-battery-backup", image: "home-battery", icon: "home", title: "Whole-home battery", payoff: "The lights stay on automatically and silently, with no fuel to store.", cta: "Compare home batteries" },
    { href: "/go-electric", image: "heat-pump", icon: "heat", title: "Heat pump", payoff: "One quiet machine heats in winter and cools in summer.", cta: "See if it saves you money" },
    { href: "/go-electric", image: "induction", icon: "pot", title: "Induction cooking", payoff: "Boils water fast, wipes clean, and no gas burning in your kitchen.", cta: "See the numbers" },
    { href: "/go-electric", image: "ebike", icon: "bike", title: "E-bike", payoff: "Short trips without the car: no gas, no parking hunt, and it's fun.", cta: "See what it saves" },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${url("/")}#webpage`,
          url: url("/"),
          name: TITLE,
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          about: { "@id": url("/#organization") },
          dateModified: DATA_UPDATED,
        }}
      />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Photo name="hero" priority className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_30%]" sizes="(max-width: 767px) 360px, 100vw" />
        <div className="absolute inset-0 -z-10 hero-shade" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-24">
          <p className="text-amber-300 font-bold uppercase tracking-wide text-sm">Spark Powered</p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.02] mt-3 max-w-3xl">
            Lower bills. Lights that stay on. <span className="text-amber-300">Go electric.</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
            Charging a car at home is like paying {usd(eGallon, 2)} a gallon. Solar trims your bill for decades. A battery
            keeps the fridge and Wi-Fi running in an outage. See what it adds up to where you live.
          </p>
          <StatePicker states={PLANNER_STATES.map((s) => ({ abbr: s.abbr, name: s.name }))} totals={TYPICAL_TOTALS} initial={medianAbbr} />
          <p className="text-xs text-white/75 mt-3 max-w-xl">
            Typical home: the state&apos;s average electric bill, gas heat, hot water and stove, and a 25.5 mpg car driven
            12,000 miles a year. Built on EIA and EPA data, updated {formatDate(DATA_UPDATED)}.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <section aria-labelledby="switches-heading" className="mt-14">
          <h2 id="switches-heading" className="text-3xl sm:text-4xl font-extrabold text-ink">The switches that pay you back</h2>
          <p className="text-lg text-stone-600 mt-2 max-w-2xl">Start with one. Most people start with whatever they&apos;re replacing anyway.</p>
          <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SWITCHES.map((s) => (
              <li key={s.title}>
                <Link href={s.href} className="group flex flex-col h-full rounded-3xl bg-white border border-black/8 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[3/2] bg-gradient-to-br from-amber-100 to-sky-100">
                    <Photo name={s.image} className="absolute inset-0 h-full w-full object-cover" sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 92vw" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-extrabold text-ink flex items-center gap-2">
                      <span className="text-spark-orange"><Icon name={s.icon} size={20} /></span>
                      {s.title}
                    </h3>
                    <p className="text-stone-700 mt-1 text-sm leading-relaxed flex-1">{s.payoff}</p>
                    <span className="mt-3 font-bold text-spark-orange inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      {s.cta} <Icon name="arrow" size={18} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="bill-heading" className="mt-16 grid lg:grid-cols-2 gap-8 items-center rounded-3xl bg-surface-light border border-black/8 p-6 sm:p-10">
          <div>
            <p className="text-spark-amber font-bold uppercase tracking-wide text-sm">A real example</p>
            <h2 id="bill-heading" className="text-3xl font-extrabold text-ink mt-1">
              A typical {ex.st.name} family could keep about {usd(Math.round(ex.total / 10) * 10)} a year
            </h2>
            <p className="text-stone-700 mt-3 leading-relaxed">
              That&apos;s their electric bill, gas bill and gasoline today, against the same home with an EV, solar panels and
              electric heat, hot water and cooking. The car alone saves about {usd(evRow.yearly ?? 0)} a year; solar up to{" "}
              {usd(solarRow.yearly ?? 0)}.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href={`/go-electric?state=${medianAbbr}`} className="btn btn-primary">See your own numbers</Link>
              <Link href="/methodology" className="btn btn-outline">How we calculate</Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 sm:p-6 border border-black/8">
            <BeforeAfter before={before} after={after} beforeLabel="Today: bills, gas and gasoline" afterLabel="Electric life" />
            <p className="text-xs text-muted mt-3">
              Monthly energy spending for a typical {ex.st.name} home. Solar assumes your utility credits all the power it makes.
            </p>
          </div>
        </section>

        <section aria-labelledby="outage-heading" className="mt-16">
          <h2 id="outage-heading" className="text-3xl font-extrabold text-ink">Never sit in the dark again</h2>
          <p className="text-lg text-stone-600 mt-2 max-w-2xl">
            Storms, heat waves, grid trouble. A battery at home keeps the fridge cold, the Wi-Fi up and your phone charged,
            with no noise and no fumes.
          </p>
          <AffiliateDisclosure className="mt-5" />
          <div className="mt-5">
            <OurPick
              label="Our pick for outage backup"
              name={fullName(outage)}
              why="A big battery at a fair price. Leave the fridge plugged into it and it takes over in a blink when the power cuts out."
              life={[`Fridge, Wi-Fi and lights: ${life.essentials}`, `Fridge alone: ${life.fridge}`, `CPAP: ${life.cpap}`, `Phone charges: about ${life.phones}`]}
              priceUsd={outage.priceUsd}
              brand={outage.brand}
              productId={outage.id}
              productUrl={outage.url}
              category="battery"
              moreHref="/best-portable-power-stations"
              moreLabel="See all our picks"
            />
            <p className="text-xs text-muted mt-2">*Price on the maker&apos;s US site when we checked on {formatDate(outage.retrieved)}; prices change often.</p>
          </div>
        </section>

        <section aria-labelledby="myths-heading" className="mt-16">
          <h2 id="myths-heading" className="text-3xl font-extrabold text-ink">&ldquo;But I heard...&rdquo;</h2>
          <p className="text-lg text-stone-600 mt-2">The doubts we hear most, answered with facts.</p>
          <div className="grid gap-3 mt-5">
            {["ev-cost", "ev-battery-life", "solar-cloudy"].map((id) => (
              <MythCallout key={id} m={lite(id)} />
            ))}
          </div>
          <Link href="/myths" className="btn btn-outline mt-5">All myths, answered</Link>
        </section>

        <section aria-labelledby="trust-heading" className="mt-16 rounded-3xl bg-ink text-white p-6 sm:p-10 grid md:grid-cols-3 gap-6">
          <div>
            <h2 id="trust-heading" className="text-2xl font-extrabold">Numbers you can check</h2>
            <p className="text-white/80 mt-2">No sales pitch. Every figure links to where it came from.</p>
          </div>
          <ul className="md:col-span-2 grid sm:grid-cols-2 gap-4 text-sm">
            {[
              ["Government data", `Electricity, gas and gasoline prices from the US Energy Information Administration, refreshed monthly. Average US electricity: ${NATIONAL.residentialCentsPerKwhYtd.toFixed(1)}¢ a unit.`],
              ["Real ratings", "Car efficiency from EPA tests. Solar output from the national lab's PVWatts model on 10 years of NASA weather."],
              ["Honest results", "If a switch doesn't save money in your state, we say so."],
              ["Independent", "Not owned by a carmaker, installer or utility. Some links earn us a commission; it never changes a pick."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="text-amber-300 shrink-0"><Icon name="shield" /></span>
                <span>
                  <strong className="block">{t}</strong>
                  <span className="text-white/80">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="states-heading" className="mt-16">
          <h2 id="states-heading" className="text-2xl font-extrabold text-ink mb-4">Savings, prices and solar by state</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-1.5 text-sm">
            {states.map((s) => (
              <li key={s.abbr}>
                <Link href={`/states/${s.slug}`} className="hover:text-spark-orange hover:underline underline-offset-2">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-16 mb-16 grid lg:grid-cols-[2fr_1fr] gap-10">
          <section aria-labelledby="news-heading">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h2 id="news-heading" className="text-2xl font-extrabold text-ink">Latest headlines</h2>
              <Link href="/news" className="text-sm text-spark-orange underline underline-offset-2">More headlines</Link>
            </div>
            <p className="text-xs text-stone-600 mb-2">From Electrek, CleanTechnica, InsideEVs and Solar Power World. Links open the original article.</p>
            <Suspense fallback={<p className="text-sm text-stone-600">Loading headlines…</p>}>
              <LatestHeadlines />
            </Suspense>
          </section>
          <aside aria-labelledby="guides-heading">
            <h2 id="guides-heading" className="text-2xl font-extrabold text-ink mb-3">Straight answers</h2>
            <ul className="space-y-3 text-sm">
              {[
                ["/go-electric", "What would going electric save me?", "Every switch, ranked for your home."],
                ["/plug-in-solar", "Is plug-in balcony solar legal in your state?", "The 2025-2026 state laws, with links."],
                ["/compare", "EcoFlow vs Anker vs Jackery vs Bluetti", "Power stations compared size for size."],
                ["/myths", "EV, solar and heat pump myths", "Battery life, cold weather, cost and more."],
                ["/incentives", "What happened to the tax credits?", "Exact end dates from the IRS, and what is left."],
                ["/about", "About Spark Powered", "Independent; how we earn money is disclosed."],
              ].map(([href, t, d]) => (
                <li key={href}>
                  <Link href={href} className="font-semibold hover:text-spark-orange">{t}</Link>
                  <span className="block text-stone-600">{d}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
        <p className="text-xs text-muted mb-10">
          Photos: Unsplash (Unsplash License). <Link href="/about#photo-credits" className="underline underline-offset-2">Photo credits</Link>.
        </p>
      </div>
    </div>
  );
}
