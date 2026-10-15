import Link from "next/link";
import { lawFor, LAW_REVIEWED } from "@/data/plugin-solar-law";
import { formatDate, num, usd, type StateEnergy } from "@/lib/energy";
import { REFERENCE_KIT_W, pluginFigures } from "@/lib/plugin-solar";

/** "Plug-in solar in [state]" summary box for state pages and the solar calculator. */
export default function PluginSolarBox({ s }: { s: StateEnergy }) {
  const law = lawFor(s.abbr);
  const tilted = pluginFigures(s, REFERENCE_KIT_W, "tilted");
  const railing = pluginFigures(s, REFERENCE_KIT_W, "vertical_s");
  return (
    <aside
      aria-labelledby={`plugin-${s.abbr}`}
      className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5 sm:p-6"
    >
      <h3 id={`plugin-${s.abbr}`} className="text-lg font-bold mb-2">
        Plug-in solar in {s.name}
      </h3>
      <p className="text-sm text-stone-700 leading-relaxed mb-3">
        An {num(REFERENCE_KIT_W)} W plug-in (&quot;balcony&quot;) kit near {s.solar.city} would make about{" "}
        <strong>{num(tilted.kwhYear)} kWh a year</strong> on a south-facing stand, or {num(railing.kwhYear)} kWh hung
        flat on a south-facing railing. If you use all of it at home, that is worth up to{" "}
        <strong>{usd(tilted.valueYear)} a year</strong> at {s.name}&apos;s average rate.
      </p>
      <p className="text-sm leading-relaxed mb-3">
        <strong>Is it legal?</strong>{" "}
        {law?.status === "law" ? (
          <>
            {s.name} has a plug-in solar law ({law.bill}, {law.year}): {law.summary}{" "}
          </>
        ) : law?.status === "pending" ? (
          <>
            {s.name} has a bill pending ({law.bill}), but no plug-in solar law yet. Until then, plugging generation
            into an outlet needs your utility&apos;s interconnection approval.{" "}
          </>
        ) : (
          <>
            {s.name} has no plug-in solar law as of {formatDate(LAW_REVIEWED)}. Connecting any panel that feeds your
            home&apos;s wiring normally needs your utility&apos;s interconnection approval, so check with your utility
            first.{" "}
          </>
        )}
      </p>
      <Link href={`/plug-in-solar#state-${s.abbr.toLowerCase()}`} className="text-sm font-semibold text-spark-orange underline underline-offset-2">
        Plug-in solar guide: rules, real kits and payback
      </Link>
    </aside>
  );
}
