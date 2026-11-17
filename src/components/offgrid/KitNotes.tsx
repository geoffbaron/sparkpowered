import Link from "next/link";
import { EXAMPLE_PUMP_240, KIT_DAYS, type KitPackage } from "@/lib/offgrid-kit";
import { fmtWh } from "@/lib/offgrid";

/** The honest limits of a package, chosen from its notes. Always says what it will not run. */
export default function KitNotes({ k, stateName }: { k: KitPackage; stateName: string }) {
  const has = (n: string) => k.notes.includes(n);
  return (
    <ul className="mt-4 space-y-2 text-sm text-stone-800 list-disc pl-5" data-testid="kit-notes">
      <li data-note="essentials">
        <strong>Essentials, not the whole house.</strong> This runs the loads you ticked. It will not run central air conditioning, electric
        heat, an electric range or oven, or an electric dryer.
      </li>
      {has("cloudy-winter") && (
        <li data-note="cloudy-winter">
          <strong>Solar alone will not keep up in {stateName} through a winter.</strong> On an average December day the panels make about{" "}
          {fmtWh(k.whPerDay - k.shortfallWhDay)} of the {fmtWh(k.whPerDay)} you use, so the generator and stored fuel cover the gap.
        </li>
      )}
      {has("solar-input-capped") && (
        <li data-note="solar-input-capped">
          December here needs more panels than this station accepts, so we stop at its solar input limit and the generator makes up the rest.
        </li>
      )}
      {has("battery-short") && (
        <li data-note="battery-short">
          These loads need more battery than any power station we track holds. This is the biggest; for more, look at a component system on{" "}
          <Link href="/how-to-go-off-grid" className="underline">how to go off grid</Link>.
        </li>
      )}
      {has("well-240v") && (
        <li data-note="well-240v">
          <strong>240 V well pump:</strong> only a 120/240 V station can run it, so the package uses one. The pump is wired in, so a licensed
          electrician connects the station through a transfer switch.{" "}
          {has("well-soft-start")
            ? `This station's specs do not cover the start of a ${EXAMPLE_PUMP_240.hp} HP, 230 V pump, so plan on a soft starter fitted by a licensed electrician or pump installer.`
            : ""}{" "}
          Check your own pump on the <Link href="/home-backup/well-pump" className="underline">well pump page</Link>.
        </li>
      )}
      {!has("well-240v") && has("well-soft-start") && (
        <li data-note="well-soft-start">
          This station&apos;s specs do not cover the well pump&apos;s start. Check your pump on the{" "}
          <Link href="/home-backup/well-pump" className="underline">well pump page</Link>; a soft starter is the usual fix.
        </li>
      )}
      <li data-note="panel-wiring">
        Series or parallel? It depends on the station&apos;s solar input voltage and current limits, which cold mornings push up. Check its
        manual before wiring the panels; our <Link href="/home-backup/bluetti-elite-200-v2-solar-panels" className="underline">Elite 200 V2 panel guide</Link>{" "}
        shows how.
      </li>
      <li data-note="stove-safety">
        <strong>Cook outdoors.</strong> CDC: never use a portable gas camp stove indoors, never heat a house with a gas oven, and never burn
        charcoal indoors. For heat, keep the furnace blower or a pellet stove running on the power above.
      </li>
      <li data-note="garden-timeline">
        <strong>A garden will not feed you inside {KIT_DAYS} days.</strong> Even quick crops take 25 to 60 days to a first harvest, and nothing
        grows outdoors through a cold-state winter. Stored food carries the {KIT_DAYS} days; the garden is for going longer.
      </li>
      <li data-note="generator-safety">
        Run the generator outdoors, at least 20 feet from windows, doors and vents, with a battery carbon monoxide alarm inside. Store fuel in
        approved containers away from the house. Never plug a generator or power station into a wall outlet. See the{" "}
        <Link href="/generator-runtime-calculator" className="underline">generator runtime calculator</Link> for your own generator.
      </li>
    </ul>
  );
}
