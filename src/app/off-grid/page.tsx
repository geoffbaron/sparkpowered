import type { Metadata } from "next";
import Link from "next/link";
import { HubLanding } from "@/components/hub";
import KitPresetCards from "@/components/offgrid/KitPresetCards";
import { hubById } from "@/data/hubs";
import { decemberPerKwDay, typicalWinterState } from "@/lib/offgrid";
import { KIT_DAYS, presetKits } from "@/lib/offgrid-kit";
import { pageMetadata } from "@/lib/seo";

const HUB = hubById("offgrid");

export const metadata: Metadata = pageMetadata({ title: HUB.title, description: HUB.description, path: HUB.path });

/** The 90-day kit packages, compact, under the hub's pick. */
function KitBlock() {
  const typical = typicalWinterState();
  return (
    <section aria-labelledby="kit-block" className="mt-10" data-testid="hub-kit-block">
      <h2 id="kit-block" className="text-2xl font-extrabold text-ink">{KIT_DAYS}-day survival kits by home size</h2>
      <p className="text-stone-700 mt-1 mb-4 max-w-3xl">
        Power, water, food and garden for {KIT_DAYS} days: generator and stove fuel, stored water and a filter, staples by the pound, seeds, first aid and a printable checklist. Pick the closest size, then{" "}
        <Link href="/off-grid-kit#builder" className="underline">change it for your home and state</Link>.
      </p>
      <KitPresetCards kits={presetKits(decemberPerKwDay(typical))} stateName={typical.name} compact />
    </section>
  );
}

export default function Page() {
  return <HubLanding hub={HUB} extra={<KitBlock />} />;
}
