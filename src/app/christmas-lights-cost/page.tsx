import type { Metadata } from "next";
import Link from "next/link";
import HolidayLightsCalc from "@/components/HolidayLightsCalc";
import { HubHero, PhotoCredit } from "@/components/ui";
import { QuickAnswer } from "@/components/guide-ui";
import { Callout, Disclaimer, Faq, RelatedLinks, Section, Sources } from "@/components/content";
import { DATA_UPDATED, NATIONAL, SOURCES, STATES, cents, formatDate, num, usd, ytdWindow } from "@/lib/energy";
import {
  DISPLAY_STRINGS,
  HOURS_PER_NIGHT,
  LED_C9_CHECKED,
  LED_C9_LABEL_SOURCES,
  LED_C9_REPLACEMENT_SOURCE,
  LED_C9_REPLACEMENT_W,
  LIGHT_PRESETS,
  SEASON_DAYS,
  formatChangePct,
  lightsByState,
  lightsCost,
  lightsKeyFindings,
  stringWatts,
  ytdWindowWords,
} from "@/lib/holiday";
import { UseThisData } from "@/components/UseThisData";
import { JsonLd, pageMetadata, url } from "@/lib/seo";

const PATH = "/christmas-lights-cost";
const TITLE = "How Much Do Christmas Lights Cost to Run? Calculator by State (2026)";
const DESCRIPTION =
  "What your Christmas lights add to your electric bill this season, using your state's 2026 electricity price. LED vs old-style bulbs, all 50 states, free calculator.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, type: "article" });

const preset = (id: string) => LIGHT_PRESETS.find((p) => p.id === id)!;
const ledW = DISPLAY_STRINGS * stringWatts(preset("led-mini"));
const oldW = DISPLAY_STRINGS * stringWatts(preset("inc-mini"));
/** 25,000 old-style mini bulbs, the size of a famous movie display. */
const BIG_W = 250 * stringWatts(preset("inc-mini"));

export default function ChristmasLightsCostPage() {
  const us = NATIONAL.residentialCentsPerKwhYtd;
  const rows = lightsByState();
  const priciest = rows[0];
  const cheapest = rows[rows.length - 1];
  const usLed = lightsCost(ledW, us).usd;
  const usOld = lightsCost(oldW, us).usd;
  const usBig = lightsCost(BIG_W, us);
  const kf = lightsKeyFindings();
  const dc = rows.some((r) => r.s.abbr === "DC");
  const coverage = dc ? `${rows.length - 1} states and DC` : `${rows.length} states`;
  const ytdWords = ytdWindowWords();
  const released = SOURCES.electricityPrice.released;
  const season = DATA_UPDATED.slice(0, 4);
  const pctWord = (p: number) => `${Math.abs(Math.round(p))}%`;
  const ledC9 = stringWatts(preset("led-c9"));
  const ledC9Replacement = preset("led-c9").bulbs * LED_C9_REPLACEMENT_W;
  const props = {
    states: STATES.map((s) => ({ abbr: s.abbr, name: s.name, cents: s.electricity.residentialCentsPerKwhYtd })),
    usCents: us,
  };

  const faqs = [
    {
      q: "How much do Christmas lights cost to run?",
      a: `Less than most people think, if they are LEDs. A 1,000-bulb display of LED mini lights draws about ${Math.round(ledW)} watts. On ${HOURS_PER_NIGHT} hours a night for ${SEASON_DAYS} nights at the US average electricity price of ${cents(us)} per kWh (${ytdWindow()}, EIA), that is about ${usd(usLed, 2)} for the whole season. The same display in old-style incandescent mini lights costs about ${usd(usOld, 2)}.`,
    },
    {
      q: "Which state pays the most to light up for the holidays?",
      a: `${priciest.s.name}, at ${cents(priciest.c)} per kWh: a 1,000-bulb old-style display costs about ${usd(priciest.old, 2)} a season there, against ${usd(cheapest.old, 2)} in ${cheapest.s.name}, the cheapest state at ${cents(cheapest.c)} per kWh.`,
    },
    {
      q: "How do I work out what my own lights cost?",
      a: "Add up the watts printed on each box or plug tag, multiply by the hours they are on, and divide by 1,000 to get kilowatt-hours (kWh). Multiply by your price per kWh from your bill. For example, 400 watts for 6 hours is 2.4 kWh a night; at 18 cents per kWh that is 43 cents a night.",
    },
    {
      q: "Are LED Christmas lights worth it?",
      a: `On running cost alone, they pay off quickly for big old-style bulbs: a 25-bulb string of incandescent C9s draws about ${Math.round(stringWatts(preset("inc-c9")))} watts, against about ${ledC9.toFixed(1)} watts for a sealed LED C9 set. Screw-in LED replacement bulbs for an old C9 cord draw more, about ${num(ledC9Replacement)} watts for 25, still a small fraction. LEDs also run cool to the touch and you can connect far more strings end to end on one outlet.`,
    },
    {
      q: "What does a giant display like the one in the movies cost?",
      a: `A display of 25,000 old-style mini bulbs draws about ${BIG_W.toLocaleString("en-US")} watts. At the US average price, ${HOURS_PER_NIGHT} hours a night for ${SEASON_DAYS} nights uses about ${Math.round(usBig.kwh).toLocaleString("en-US")} kWh and costs about ${usd(usBig.usd)}. In LEDs it would be under ${usd(Math.ceil(lightsCost(250 * stringWatts(preset("led-mini")), us).usd / 10) * 10)}.`,
    },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${url(PATH)}#app`,
          name: "Christmas Lights Cost Calculator",
          url: url(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (web browser)",
          description: DESCRIPTION,
          isPartOf: { "@id": url("/#website") },
          publisher: { "@id": url("/#organization") },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          dateModified: DATA_UPDATED,
        }}
      />
      <HubHero
        image="outage"
        crumbs={[{ name: "Christmas lights cost", path: PATH }]}
        eyebrow="Holidays"
        title={<>Light up the block. <span className="text-amber-300">See what it really costs.</span></>}
        sub={
          <>
            A 1,000-bulb LED display costs about <strong className="text-amber-300">{usd(usLed, 2)}</strong> for the whole season at the
            US average electricity price. The same display in old-style bulbs: about {usd(usOld, 2)}. Here is your number, for your state.
          </>
        }
      >
        <a href="#calculator" className="btn btn-primary">Price my lights</a>
        <a href="#by-state" className="btn btn-light">Every state</a>
      </HubHero>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-muted mb-6">
          Electricity prices updated <time dateTime={DATA_UPDATED}>{formatDate(DATA_UPDATED)}</time> ·{" "}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-spark-orange">How we calculate this</Link>
        </p>
        <section id="key-findings" aria-labelledby="key-findings-title" className="mb-8 rounded-2xl border border-black/10 bg-surface p-5 sm:p-6" data-testid="key-findings">
          <h2 id="key-findings-title" className="text-xl font-extrabold text-ink">
            Key findings, holiday season {season}{" "}
            <span className="text-sm font-normal text-muted">
              (updated <time dateTime={DATA_UPDATED}>{formatDate(DATA_UPDATED)}</time>)
            </span>
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-stone-700 leading-relaxed max-w-3xl">
            <li>
              A 1,000-bulb display of LED mini lights costs about <strong>{usd(kf.usLed, 2)}</strong> to run for the whole season at the US
              average electricity price. The same display in old-style bulbs costs about <strong>{usd(kf.usOld, 2)}</strong>.
            </li>
            <li>
              <strong>{kf.priciest.s.name}</strong> pays the most: <strong>{usd(kf.priciest.old, 2)}</strong> a season for old-style bulbs,{" "}
              <strong>{usd(kf.priciest.led, 2)}</strong> for LEDs. <strong>{kf.cheapest.s.name}</strong> pays the least:{" "}
              <strong>{usd(kf.cheapest.old, 2)}</strong> and <strong>{usd(kf.cheapest.led, 2)}</strong>.
            </li>
            {kf.bulbBeatsState && (
              <li>
                An LED display in {kf.priciest.s.name} costs less to run than an old-style display in {kf.cheapest.s.name}. The bulbs
                matter more than the state.
              </li>
            )}
            <li>
              Running the same display costs{" "}
              {Math.round(kf.usChangePct) === 0 ? (
                <>about the same as last year</>
              ) : (
                <>
                  about <strong>{pctWord(kf.usChangePct)} {kf.usChangePct > 0 ? "more" : "less"}</strong> than last year
                </>
              )}{" "}
              at the US average.
              {kf.biggestRises.length > 0 && (
                <>
                  {" "}The biggest increases:{" "}
                  {kf.biggestRises.map((r, i) => (
                    <span key={r.s.abbr}>
                      {i > 0 && (i === kf.biggestRises.length - 1 ? " and " : ", ")}
                      <strong>{r.s.name} ({formatChangePct(r.pct)})</strong>
                    </span>
                  ))}
                  .
                </>
              )}
              {kf.largestDrop && (
                <>
                  {" "}The largest drop: {kf.largestDrop.s.name}, down {pctWord(kf.largestDrop.pct)}.
                </>
              )}
            </li>
            {kf.c9OldString > kf.usLed && (
              <li>
                One 25-bulb string of old-style C9 bulbs costs about <strong>{usd(kf.c9OldString, 2)}</strong> a season, more than a whole
                1,000-bulb LED display.
              </li>
            )}
          </ul>
          <p className="mt-3 text-sm text-muted max-w-3xl">
            Assumptions: {HOURS_PER_NIGHT} hours a night for {SEASON_DAYS} nights. Prices: each state&apos;s average residential price,{" "}
            {ytdWords}, from the US Energy Information Administration.{" "}
            <a href="#how" className="underline underline-offset-2 hover:text-spark-orange">How we calculate this</a>
          </p>
        </section>
        <QuickAnswer>
          <p>
            LED lights cost pennies a night. Old-style incandescent bulbs, especially the big C7 and C9 kind, are where the money goes:
            one 25-bulb C9 string draws about {Math.round(stringWatts(preset("inc-c9")))} watts, as much as {Math.round(stringWatts(preset("inc-c9")) / stringWatts(preset("led-mini")))} strings of LED mini lights.
          </p>
        </QuickAnswer>

        <h2 id="calculator" className="text-2xl font-extrabold text-ink mt-10 mb-4 scroll-mt-24">Your lights, your state</h2>
        <HolidayLightsCalc {...props} />

        <Section title="How the calculation works" id="how">
          <div className="text-stone-700 leading-relaxed space-y-4 max-w-3xl">
            <p>
              <strong>Cost = watts × hours ÷ 1,000 × price per kWh.</strong> Watts come from the bulb counts you enter, at typical
              figures per bulb: 0.07 W for an LED mini, 0.4 W for an incandescent mini and about 7 W for an incandescent C9. The price
              is your state&apos;s average residential electricity price for {ytdWindow()} from the US Energy Information
              Administration.
            </p>
            <p>
              Worked example: ten strings of 100 old-style mini lights draw {Math.round(oldW)} W. Six hours a night is{" "}
              {((oldW * 6) / 1000).toFixed(1)} kWh. At {cents(us)} per kWh that is {usd((oldW * 6 * us) / 100000, 2)} a night, or{" "}
              {usd(usOld, 2)} over {SEASON_DAYS} nights.
            </p>
            <p>
              These are average prices paid so far in {season}, including fixed charges spread over each kilowatt-hour. Some utilities,
              mostly in the Northeast, raised winter supply rates this fall, so a December bill there can run higher than this average.
              Your bill shows your own price per kWh.
            </p>
            <Callout>
              Bulb wattages vary by brand. The exact figure is printed on the box or the tag near the plug; put it in the &quot;anything
              else&quot; box for the most accurate answer.
            </Callout>
          </div>
        </Section>

        <Section title="Christmas lights cost in every state" id="by-state">
          <p className="text-stone-700 max-w-3xl mb-4">
            A 1,000-bulb display of mini lights, {HOURS_PER_NIGHT} hours a night for {SEASON_DAYS} nights, at each state&apos;s average home
            electricity price for {ytdWords} (EIA). Most expensive first. {coverage}.
          </p>
          <div className="overflow-x-auto rounded-xl border border-black/8 bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Season cost of Christmas lights by state, LED and incandescent</caption>
              <thead className="bg-surface-light text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">#</th>
                  <th scope="col" className="p-3 font-semibold">State</th>
                  <th scope="col" className="p-3 font-semibold text-right">¢/kWh</th>
                  <th scope="col" className="p-3 font-semibold text-right">LED season</th>
                  <th scope="col" className="p-3 font-semibold text-right">Old-style season</th>
                  <th scope="col" className="p-3 font-semibold text-right">vs last year</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ s, c, led, old, pct }, i) => (
                  <tr key={s.abbr} className="border-t border-black/6">
                    <td className="p-3 text-muted tabular-nums">{i + 1}</td>
                    <th scope="row" className="p-3 font-medium">
                      <Link href={`/states/${s.slug}`} className="text-spark-orange hover:underline">{s.name}</Link>
                    </th>
                    <td className="p-3 text-right tabular-nums">{c.toFixed(1)}</td>
                    <td className="p-3 text-right tabular-nums">{usd(led, 2)}</td>
                    <td className="p-3 text-right tabular-nums">{usd(old, 2)}</td>
                    <td className="p-3 text-right tabular-nums">{formatChangePct(pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted max-w-3xl" data-testid="how-to-cite">
            How to cite: Spark Powered, &quot;Christmas lights cost by state, {season},&quot; sparkpowered.com/christmas-lights-cost, using US
            Energy Information Administration average residential electricity prices for {ytdWords} (Electric Power Monthly
            {released ? <>, released {formatDate(released)}</> : null}). Display: {(DISPLAY_STRINGS * preset("led-mini").bulbs).toLocaleString("en-US")} mini bulbs,{" "}
            {HOURS_PER_NIGHT} hours a night for {SEASON_DAYS} nights. LED mini {preset("led-mini").wattsPerBulb} W a bulb, incandescent mini{" "}
            {preset("inc-mini").wattsPerBulb} W, incandescent C9 {preset("inc-c9").wattsPerBulb} W.
          </p>
        </Section>

        <Section title="Five ways to cut the cost" id="tips">
          <ul className="list-disc pl-5 text-stone-700 leading-relaxed space-y-2 max-w-3xl">
            <li>Put the display on a timer so it goes off at bedtime, not at dawn. Twelve hours a night costs twice what six does.</li>
            <li>Replace the big incandescent C7 and C9 strings first. They use the most power by far.</li>
            <li>Keep old mini strings for indoors if you like the warm look; the saving from swapping them is smaller.</li>
            <li>Outdoors, use lights and extension cords rated for outdoor use and plug into a GFCI outlet.</li>
            <li>Use lights with a UL or ETL mark, throw out sets with cracked sockets or frayed wires, connect no more strings end to end than the box allows, and turn them off when you go to bed or leave the house.</li>
            <li>Want them free to run? A small <Link href="/plug-in-solar" className="underline">plug-in solar</Link> kit or a <Link href="/best-portable-power-stations" className="underline">power station</Link> charged by day can run an LED display at night.</li>
          </ul>
        </Section>

        <UseThisData path={PATH} title="Christmas lights cost by state" csv={`${PATH}/data.csv`}>
          <p className="mt-4 text-sm text-stone-700 max-w-3xl" data-testid="press-contact">
            <strong>For reporters:</strong> Geoff Baron, editor. Email{" "}
            <a className="underline" href="mailto:geoff@mylastlap.com">geoff@mylastlap.com</a>. I can run numbers for your state, a
            different display size or a local utility&apos;s rate, usually the same day.
          </p>
        </UseThisData>

        <Faq items={faqs} path={PATH} />
        <Disclaimer />
        <Sources
          items={[
            { name: SOURCES.electricityPrice.name, url: SOURCES.electricityPrice.url, detail: SOURCES.electricityPrice.period },
            { name: "Entergy, Lighting the holidays: an energy cost comparison (bulb wattages)", url: "https://www.entergy.com/blog/lighting-the-holidays-an-energy-cost-comparison" },
            { name: "The Day (New London), What your Christmas lights will do to your electricity bill (LED C9 string wattage, citing US DOE)", url: "https://www.theday.com/?p=85128" },
            ...LED_C9_LABEL_SOURCES.map((x) => ({ ...x, detail: `LED C9 label, checked ${formatDate(LED_C9_CHECKED)}` })),
            { ...LED_C9_REPLACEMENT_SOURCE, detail: `checked ${formatDate(LED_C9_CHECKED)}` },
          ]}
        />
        <RelatedLinks
          links={[
            { href: "/space-heater-cost", label: "Space heater cost", desc: "What one costs to run in your state, vs a furnace" },
            { href: "/plug-in-solar", label: "Plug-in solar", desc: "Panels that plug into an outlet" },
            { href: "/best-portable-power-stations", label: "Portable power stations", desc: "Backup power for winter outages" },
            { href: "/solartopia", label: "Solartopia", desc: "A free five-minute solar game for the holidays" },
            { href: "/states", label: "Energy data by state", desc: "Electricity prices for every state" },
          ]}
        />
        <PhotoCredit name="outage" />
      </div>
    </div>
  );
}
