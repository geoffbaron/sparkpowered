/** Server-side: the buyable setups the hookup picker chooses from (see HookupData). */
import { AFFILIATES } from "@/data/affiliates";
import { MODEL_HOOKUPS, modelHookup } from "@/data/hookup";
import { PRODUCTS, type Product } from "@/data/products";
import { motorSurgeW } from "@/lib/can-it-run";
import type { Candidate, HookupData } from "@/lib/hookup-picker";
import { fullName } from "@/lib/products";

/** Brands we never add new placements for (Awin payment risk, growth plan section 6). */
const NO_NEW_PLACEMENTS = new Set(["naturesgenerator", "himiway"]);

/** In stock, a tracked partner brand, at least 1 kWh, and plug-in (not installer-only). */
export const pickable = (p: Product) =>
  p.install === "diy" &&
  !p.soldOut &&
  p.capacityWh >= 1000 &&
  AFFILIATES[p.brand].tracked &&
  !NO_NEW_PLACEMENTS.has(p.brand);

export function hookupData(products: Product[] = PRODUCTS): HookupData {
  const candidates: Candidate[] = [];
  for (const p of products.filter(pickable)) {
    const h = modelHookup(p.id);
    const addOn =
      p.addOn && !p.addOn.soldOut
        ? { model: p.addOn.model, capacityWh: p.addOn.capacityWh, max: p.addOn.maxUnits }
        : null;
    candidates.push({
      key: p.id,
      productId: p.id,
      name: fullName(p),
      brand: p.brand,
      units: 1,
      capacityWh: p.capacityWh,
      addOn,
      acOutputW: p.acOutputW,
      motorSurgeW: motorSurgeW(p),
      has240: p.volts === "120/240V",
      outlet: h?.outlet ?? null,
      smartPanel: h?.smartPanel ?? null,
      hub: null,
      url: p.url,
      retrieved: p.retrieved,
    });
    if (h?.pair240 && p.volts === "120V") {
      const hub = h.pair240;
      candidates.push({
        key: `${p.id}-pair`,
        productId: p.id,
        name: `Two ${fullName(p)} units + ${hub.name}`,
        brand: p.brand,
        units: 2,
        capacityWh: 2 * p.capacityWh,
        // Add-ons on a pair are not offered: the maker's pair pages don't say how they split.
        addOn: null,
        acOutputW: hub.outputW,
        motorSurgeW: hub.outputW,
        has240: true,
        outlet: hub.outlet,
        smartPanel: null,
        hub: { name: hub.name, url: hub.url, retrieved: hub.retrieved, outlet: hub.outlet },
        url: p.url,
        retrieved: p.retrieved < hub.retrieved ? p.retrieved : hub.retrieved,
      });
    }
  }
  return { candidates };
}

/** Every model the hookup facts mention, for the sources list. */
export const hookupModelIds = () => MODEL_HOOKUPS.map((m) => m.productId);
