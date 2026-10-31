/**
 * Which partner an outbound link goes to, for the site-wide partner_click
 * analytics event (Oct 31 2026: lets us see whether visits turn into money).
 * Unwraps network redirects (Awin's ued, Rakuten's murl) to find the store.
 */

import { AFFILIATES, brandForUrl, type BrandId } from "@/data/affiliates";

export interface PartnerClick {
  brand: BrandId;
  /** True when the link carries our tracking (an approved partner). */
  tracked: boolean;
}

const NETWORK_TARGET: Record<string, string> = {
  "awin1.com": "ued",
  "click.linksynergy.com": "murl",
};

export function partnerClick(href: string, origin = "https://sparkpowered.com"): PartnerClick | null {
  let u: URL;
  try {
    u = new URL(href, origin);
  } catch {
    return null;
  }
  if (u.origin === new URL(origin).origin) return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  const param = NETWORK_TARGET[host];
  if (param) {
    const target = u.searchParams.get(param);
    const brand = target ? brandForUrl(target) : null;
    return brand ? { brand, tracked: true } : null;
  }
  const brand = brandForUrl(u.href);
  if (!brand) return null;
  const ref = AFFILIATES[brand].refParam;
  const tracked = AFFILIATES[brand].tracked && !!ref && u.search.includes(ref);
  return { brand, tracked };
}
