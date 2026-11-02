"use client";

import { usePathname } from "next/navigation";
import IWantTo from "@/components/IWantTo";
import { nextGoalsFor } from "@/data/hubs";

/** "Where next?" strip above the footer on guide and tool pages: the same picker, with this section's next steps. */
export default function WhereNext() {
  const goals = nextGoalsFor(usePathname() ?? "/");
  if (!goals) return null;
  return (
    <section aria-labelledby="where-next-heading" className="bg-ink text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <h2 id="where-next-heading" className="text-2xl sm:text-3xl font-extrabold">Where next?</h2>
        <IWantTo goals={goals} more />
      </div>
    </section>
  );
}
