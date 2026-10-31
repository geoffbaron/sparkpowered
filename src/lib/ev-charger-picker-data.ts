/** Server-side: the sourced figures the charger picker needs (see PickerData). */
import { INSTALL_COST } from "@/data/buyer-guides";
import { REFERENCE_EVS, STATES } from "@/lib/energy";
import type { CarAnswer, PickerData } from "@/lib/ev-charger-picker";

export function pickerData(): PickerData {
  const evs = {} as PickerData["evs"];
  for (const key of ["efficient", "typical", "large"] as CarAnswer[]) {
    const ev = REFERENCE_EVS.find((e) => e.key === key);
    if (!ev) throw new Error(`Missing reference EV ${key}`);
    evs[key] = { make: ev.make, model: ev.model, kwhPer100mi: ev.kwhPer100mi };
  }
  return {
    evs,
    install: {
      usAverage: INSTALL_COST.usAverage,
      byState: INSTALL_COST.byState,
      subpanel: INSTALL_COST.subpanel,
      serviceUpgrade: INSTALL_COST.serviceUpgrade,
      longRun: INSTALL_COST.longRun,
    },
    states: STATES.filter((s) => INSTALL_COST.byState[s.abbr]).map((s) => ({ abbr: s.abbr, name: s.name })),
  };
}
